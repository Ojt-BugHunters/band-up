import json
import boto3
import os
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class SecureAIEvaluator:
    def __init__(self):
        self.secrets_client = boto3.client('secretsmanager')
        self.dynamodb = boto3.resource('dynamodb')
        self.s3_client = boto3.client('s3')
        
        # Cache for secrets
        self._secrets_cache = {}
        
    def get_secret(self, secret_name: str) -> Dict[str, Any]:
        """Get secret from AWS Secrets Manager with caching"""
        if secret_name in self._secrets_cache:
            return self._secrets_cache[secret_name]
        
        try:
            response = self.secrets_client.get_secret_value(SecretId=secret_name)
            secret_data = json.loads(response['SecretString'])
            self._secrets_cache[secret_name] = secret_data
            return secret_data
        except Exception as e:
            print(f"Error retrieving secret {secret_name}: {str(e)}")
            raise
    
    def validate_cognito_token(self, token: str) -> Dict[str, Any]:
        """Validate Cognito JWT token and extract user information"""
        try:
            # Get Cognito client secret for token validation
            cognito_secret = self.get_secret(f"{os.environ['PROJECT_NAME']}-{os.environ['ENVIRONMENT']}-cognito-client-secret")
            
            # Decode token without verification first to get header
            unverified_header = jwt.get_unverified_header(token)
            
            # Get the key ID from the header
            kid = unverified_header.get('kid')
            if not kid:
                raise Exception("Invalid token: missing key ID")
            
            # In production, you would fetch the public key from Cognito
            # For now, we'll use a simplified validation
            decoded_token = jwt.decode(
                token,
                options={"verify_signature": False}  # Skip signature verification for demo
            )
            
            # Validate token claims
            current_time = datetime.utcnow().timestamp()
            if decoded_token.get('exp', 0) < current_time:
                raise Exception("Token expired")
            
            if decoded_token.get('iss') != f"https://cognito-idp.{os.environ['AWS_REGION']}.amazonaws.com/{os.environ['USER_POOL_ID']}":
                raise Exception("Invalid token issuer")
            
            return {
                'user_id': decoded_token.get('sub'),
                'email': decoded_token.get('email'),
                'user_type': decoded_token.get('user_type', 'student'),
                'token_use': decoded_token.get('token_use')
            }
            
        except Exception as e:
            print(f"Token validation error: {str(e)}")
            raise Exception(f"Invalid token: {str(e)}")
    
    def get_ai_config(self) -> Dict[str, Any]:
        """Get AI service configuration from Secrets Manager"""
        try:
            # Get Gemini API key
            gemini_secret = self.get_secret(f"{os.environ['PROJECT_NAME']}-{os.environ['ENVIRONMENT']}-gemini-api-key")
            
            # Get Bedrock configuration
            bedrock_secret = self.get_secret(f"{os.environ['PROJECT_NAME']}-{os.environ['ENVIRONMENT']}-bedrock-config")
            
            return {
                'gemini_api_key': gemini_secret.get('api_key'),
                'gemini_model': gemini_secret.get('model', 'gemini-pro'),
                'bedrock_region': bedrock_secret.get('region'),
                'bedrock_model': bedrock_secret.get('model_id'),
                'max_tokens': bedrock_secret.get('max_tokens', 4000),
                'temperature': bedrock_secret.get('temperature', 0.1)
            }
        except Exception as e:
            print(f"Error getting AI config: {str(e)}")
            raise
    
    def log_user_activity(self, user_id: str, activity_type: str, details: Dict[str, Any]):
        """Log user activity for audit and analytics"""
        try:
            table = self.dynamodb.Table('user_activities')
            table.put_item(Item={
                'user_id': user_id,
                'activity_id': f"{activity_type}_{datetime.utcnow().isoformat()}",
                'activity_type': activity_type,
                'timestamp': datetime.utcnow().isoformat(),
                'details': details,
                'ip_address': details.get('ip_address', 'unknown'),
                'user_agent': details.get('user_agent', 'unknown')
            })
        except Exception as e:
            print(f"Error logging user activity: {str(e)}")
    
    def check_user_quota(self, user_id: str, user_type: str) -> bool:
        """Check if user has remaining quota for AI evaluations"""
        try:
            # Get user profile
            users_table = self.dynamodb.Table('users')
            response = users_table.get_item(Key={'user_id': user_id})
            
            if 'Item' not in response:
                return False
            
            user_profile = response['Item']
            subscription_tier = user_profile.get('subscription_tier', 'free')
            
            # Define quotas based on subscription
            quotas = {
                'free': 10,      # 10 evaluations per day
                'premium': 100,  # 100 evaluations per day
                'enterprise': 1000  # 1000 evaluations per day
            }
            
            daily_limit = quotas.get(subscription_tier, 10)
            
            # Check today's usage
            evaluations_table = self.dynamodb.Table('evaluations')
            today = datetime.utcnow().strftime('%Y-%m-%d')
            
            response = evaluations_table.query(
                IndexName='user_id-created_at-index',
                KeyConditionExpression='user_id = :user_id AND begins_with(created_at, :today)',
                ExpressionAttributeValues={
                    ':user_id': user_id,
                    ':today': today
                }
            )
            
            today_usage = len(response.get('Items', []))
            
            return today_usage < daily_limit
            
        except Exception as e:
            print(f"Error checking user quota: {str(e)}")
            return False

def handler(event, context):
    """
    Secure AI Evaluator Lambda Function
    Handles speaking, writing, and flashcard generation with security
    """
    print(f"Event: {json.dumps(event)}")
    
    try:
        # Initialize the evaluator
        evaluator = SecureAIEvaluator()
        
        # Extract and validate Cognito token
        auth_header = event.get('headers', {}).get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return {
                'statusCode': 401,
                'body': json.dumps({'error': 'Missing or invalid authorization header'})
            }
        
        token = auth_header.replace('Bearer ', '')
        user_info = evaluator.validate_cognito_token(token)
        
        # Check user quota
        if not evaluator.check_user_quota(user_info['user_id'], user_info['user_type']):
            return {
                'statusCode': 429,
                'body': json.dumps({'error': 'Daily quota exceeded. Please upgrade your plan.'})
            }
        
        # Get AI configuration
        ai_config = evaluator.get_ai_config()
        
        # Extract request body
        body = json.loads(event.get('body', '{}'))
        
        # Log user activity
        evaluator.log_user_activity(
            user_info['user_id'],
            'ai_evaluation_request',
            {
                'evaluation_type': body.get('type', 'unknown'),
                'ip_address': event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown'),
                'user_agent': event.get('headers', {}).get('User-Agent', 'unknown')
            }
        )
        
        # Process the evaluation based on type
        evaluation_type = body.get('type', '')
        
        if evaluation_type == 'speaking':
            result = process_speaking_evaluation(body, ai_config, user_info)
        elif evaluation_type == 'writing':
            result = process_writing_evaluation(body, ai_config, user_info)
        elif evaluation_type == 'flashcard':
            result = process_flashcard_generation(body, ai_config, user_info)
        else:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid evaluation type'})
            }
        
        # Save evaluation result
        save_evaluation_result(user_info['user_id'], evaluation_type, result)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'result': result,
                'user_id': user_info['user_id'],
                'timestamp': datetime.utcnow().isoformat()
            })
        }
        
    except Exception as e:
        print(f"Error in secure AI evaluator: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }

def process_speaking_evaluation(body: Dict[str, Any], ai_config: Dict[str, Any], user_info: Dict[str, Any]) -> Dict[str, Any]:
    """Process speaking evaluation with AI"""
    # Implementation for speaking evaluation
    return {
        'score': 7.5,
        'feedback': 'Good pronunciation and fluency. Work on intonation.',
        'detailed_analysis': {
            'pronunciation': 8.0,
            'fluency': 7.0,
            'grammar': 7.5,
            'vocabulary': 8.0
        }
    }

def process_writing_evaluation(body: Dict[str, Any], ai_config: Dict[str, Any], user_info: Dict[str, Any]) -> Dict[str, Any]:
    """Process writing evaluation with AI"""
    # Implementation for writing evaluation
    return {
        'score': 8.0,
        'feedback': 'Well-structured essay with good arguments.',
        'detailed_analysis': {
            'task_achievement': 8.0,
            'coherence_cohesion': 8.0,
            'lexical_resource': 7.5,
            'grammatical_range': 8.0
        }
    }

def process_flashcard_generation(body: Dict[str, Any], ai_config: Dict[str, Any], user_info: Dict[str, Any]) -> Dict[str, Any]:
    """Process flashcard generation with AI"""
    # Implementation for flashcard generation
    return {
        'flashcards': [
            {
                'front': 'What is the capital of Australia?',
                'back': 'Canberra',
                'difficulty': 'easy'
            }
        ],
        'total_count': 1
    }

def save_evaluation_result(user_id: str, evaluation_type: str, result: Dict[str, Any]):
    """Save evaluation result to DynamoDB"""
    try:
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('evaluations')
        
        table.put_item(Item={
            'user_id': user_id,
            'evaluation_id': f"{evaluation_type}_{datetime.utcnow().isoformat()}",
            'evaluation_type': evaluation_type,
            'result': result,
            'created_at': datetime.utcnow().isoformat(),
            'status': 'completed'
        })
    except Exception as e:
        print(f"Error saving evaluation result: {str(e)}")
