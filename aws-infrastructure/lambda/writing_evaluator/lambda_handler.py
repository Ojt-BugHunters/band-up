"""
Lambda Handler for Writing Evaluator
Evaluates IELTS Writing Task 1 and Task 2 essays using Gemini API
"""

import json
import os
import sys
import logging
import time
from typing import Dict, Any, Optional

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Add layers to path
sys.path.insert(0, '/opt/python')

# Import AI services (from Lambda layer)
try:
    from lambda_shared.schemas import (
        WritingEvaluationRequest,
        WritingEvaluationResponse,
        WritingFeedback,
        CriterionFeedback,
        QuotedExample
    )
    from lambda_shared.gemini_client import GeminiClient
    import boto3
except ImportError as e:
    logger.error(f"Import error: {e}")
    logger.error(f"Python path: {sys.path}")
    raise

# Import secrets helper (from shared module)
try:
    sys.path.insert(0, '/opt/python/shared')
    from secrets_helper import get_gemini_api_key
except ImportError as e:
    logger.error(f"Failed to import secrets_helper: {e}")
    # Fallback to direct environment variable (legacy support)
    get_gemini_api_key = None


def create_error_response(
    status_code: int,
    error_code: str,
    message: str,
    details: Optional[Dict[str, Any]] = None,
    retry_after: Optional[int] = None
) -> Dict[str, Any]:
    """
    Create standardized error response for security events
    
    Args:
        status_code: HTTP status code
        error_code: Machine-readable error code
        message: Human-readable error message
        details: Additional error details
        retry_after: Seconds to wait before retrying (for 429 responses)
    
    Returns:
        API Gateway response dict with standardized error format
    """
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,x-api-key'
    }
    
    # Add Retry-After header for rate limit responses
    if retry_after is not None:
        headers['Retry-After'] = str(retry_after)
    
    error_body = {
        'error': {
            'code': error_code,
            'message': message
        }
    }
    
    if details:
        error_body['error']['details'] = details
    
    return {
        'statusCode': status_code,
        'headers': headers,
        'body': json.dumps(error_body)
    }


def is_sqs_event(event: Dict[str, Any]) -> bool:
    """Check if event is from SQS"""
    return 'Records' in event and len(event['Records']) > 0 and event['Records'][0].get('eventSource') == 'aws:sqs'


def parse_sqs_message(event: Dict[str, Any]) -> tuple[Dict[str, Any], Optional[str]]:
    """Parse SQS message and extract request data and job_id"""
    record = event['Records'][0]
    body = json.loads(record['body'])
    
    # Get job_id from message attributes (set by API Gateway)
    job_id = None
    if 'messageAttributes' in record:
        attrs = record['messageAttributes']
        if 'RequestId' in attrs:
            job_id = attrs['RequestId'].get('stringValue')
    
    return body, job_id


def update_job_status(evaluation_id: str, user_id: str, status: str, eval_type: str, error_message: str = None):
    """Update job status in DynamoDB"""
    try:
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(os.environ.get('DYNAMODB_EVALUATIONS'))
        
        item = {
            'evaluation_id': evaluation_id,
            'user_id': user_id,
            'evaluation_type': eval_type,
            'status': status,
            'started_at': int(time.time())
        }
        
        if error_message:
            item['error_message'] = error_message
        
        table.put_item(Item=item)
        logger.info(f"📝 Updated job status: {evaluation_id} -> {status}")
    except Exception as e:
        logger.error(f"Failed to update job status: {e}")


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler for writing evaluation
    
    Supports both:
    - Sync: API Gateway direct invocation (returns result immediately)
    - Async: SQS trigger (stores result in DynamoDB for polling)
    
    Evaluates IELTS Writing Task 1 or Task 2 essays using Gemini API
    Returns band scores and detailed feedback
    
    Authentication:
    - Requires valid x-api-key header managed by API Gateway usage plans
    - Expects user_id to be provided in the request payload for auditing
    Requirements: 9.4, 9.5, 9.6
    """
    # Check if this is an SQS event (async processing)
    is_async = is_sqs_event(event)
    job_id = None
    
    try:
        if is_async:
            logger.info("📨 Processing async writing evaluation from SQS")
            request_data, job_id = parse_sqs_message(event)
            # Use job_id as session_id if not provided
            if job_id and not request_data.get('session_id'):
                request_data['session_id'] = job_id
        else:
            logger.info(f"✍️ Processing sync writing evaluation: {event.get('session_id')}")
            # Parse request (handle both direct and API Gateway formats)
            request_data = event
            if isinstance(event.get('body'), str):
                request_data = json.loads(event['body'])
        
        # Mark job as processing (for async)
        if is_async and job_id:
            update_job_status(job_id, request_data.get('user_id', 'unknown'), 'processing', 'writing')
        
        # Get Gemini API key from Secrets Manager
        try:
            if get_gemini_api_key is not None:
                # Use Secrets Manager (recommended)
                gemini_api_key = get_gemini_api_key()
                logger.info("🔐 Retrieved Gemini API key from Secrets Manager")
            else:
                # Fallback to environment variable (legacy)
                gemini_api_key = os.environ.get('GEMINI_API_KEY')
                if not gemini_api_key:
                    raise ValueError("GEMINI_API_KEY not found in environment variables")
                logger.warning("⚠️ Using GEMINI_API_KEY from environment variable (consider migrating to Secrets Manager)")
        except ValueError as e:
            logger.error(f"❌ Failed to get Gemini API key: {e}")
            raise ValueError(f"Authentication configuration error: {e}")
        
        # Initialize Gemini client
        gemini_client = GeminiClient(api_key=gemini_api_key)
        
        # Extract user_id from request payload (API key authentication flow)
        user_id = request_data.get('user_id')
        if user_id:
            logger.info(f"🔑 Request scoped to user: {user_id}")

        if not user_id:
            raise ValueError("user_id is required in the request payload when using API key authentication")
        
        session_id = request_data.get('session_id')
        essay_content = request_data.get('essay_content')
        task_type = request_data.get('task_type', 'TASK_2')
        prompt = request_data.get('prompt', '')
        word_count = request_data.get('word_count', len(essay_content.split()))
        
        logger.info(f"Request: task_type={task_type}, word_count={word_count}")
        
        # Validate minimum word count
        min_words = 250 if task_type == 'TASK_2' else 150
        if word_count < min_words:
            raise ValueError(f"Essay too short. {task_type} requires minimum {min_words} words, received {word_count}")
        
        # Build prompt for Gemini
        gemini_prompt = build_writing_prompt(essay_content, task_type, prompt, word_count)
        
        # Call Gemini API
        logger.info("🤖 Calling Gemini API for writing evaluation...")
        
        feature = 'writing_task2' if task_type == 'TASK_2' else 'writing_task1'
        gemini_response = gemini_client.generate_evaluation(
            prompt=gemini_prompt,
            feature=feature,
            max_retries=3,
            timeout=60
        )
        
        # Parse response
        content = gemini_response['content']
        usage = gemini_response['usage']
        
        logger.info(f"✅ Gemini response received: {len(content)} chars")
        logger.info(f"📊 Cost: ${usage['cost']:.4f} (input={usage['input_tokens']}, output={usage['output_tokens']})")
        
        # Extract JSON from response
        evaluation = parse_gemini_response(content)
        
        # Build response
        result = {
            'session_id': session_id,
            'overall_band': evaluation.get('overall_band', 6.0),
            'task_achievement_band': evaluation.get('task_achievement', {}).get('band', 6.0),
            'coherence_band': evaluation.get('coherence_cohesion', {}).get('band', 6.0),
            'lexical_band': evaluation.get('lexical_resource', {}).get('band', 6.0),
            'grammar_band': evaluation.get('grammatical_range_accuracy', {}).get('band', 6.0),
            'feedback': {
                'overall': f"Overall Band: {evaluation.get('overall_band', 6.0)}",
                'strengths': evaluation.get('strengths', []),
                'weaknesses': evaluation.get('weaknesses', []),
                'task_achievement': evaluation.get('task_achievement', {}),
                'coherence': evaluation.get('coherence_cohesion', {}),
                'lexical': evaluation.get('lexical_resource', {}),
                'grammar': evaluation.get('grammatical_range_accuracy', {}),
                'recommendations': evaluation.get('recommendations', []),
                'quoted_examples': evaluation.get('quoted_examples', [])
            },
            'confidence_score': evaluation.get('confidence_score', 0.85),
            'model_used': f"gemini-{feature}",
            'word_count': word_count,
            'cost': usage['cost'],
            'evaluated_at': int(time.time())
        }
        
        logger.info(f"✅ Writing evaluation complete: Band {result['overall_band']}")
        
        # Save to DynamoDB
        try:
            dynamodb = boto3.resource('dynamodb')
            evaluations_table = dynamodb.Table(os.environ.get('DYNAMODB_EVALUATIONS'))
            
            # Store evaluation result
            evaluations_table.put_item(
                Item={
                    'evaluation_id': session_id,
                    'user_id': user_id,
                    'evaluation_type': 'writing',
                    'task_type': task_type,
                    'essay_text': essay_content[:1000],  # Truncate for storage
                    'overall_band': str(result['overall_band']),
                    'task_achievement_band': str(result['task_achievement_band']),
                    'coherence_band': str(result['coherence_band']),
                    'lexical_band': str(result['lexical_band']),
                    'grammar_band': str(result['grammar_band']),
                    'feedback': json.dumps(result['feedback']),
                    'model_used': result['model_used'],
                    'word_count': word_count,
                    'cost': str(result['cost']),
                    'confidence_score': str(result['confidence_score']),
                    'created_at': result['evaluated_at'],
                    'status': 'completed'
                }
            )
            logger.info(f"✅ Saved writing evaluation to DynamoDB: {session_id}")
        except Exception as e:
            logger.error(f"❌ Failed to save to DynamoDB: {e}")
            # Don't fail the request if DynamoDB save fails
        
        # For async (SQS), just return success - result is in DynamoDB
        if is_async:
            logger.info(f"✅ Async writing evaluation complete: Band {result['overall_band']}")
            return {'statusCode': 200, 'body': 'OK'}
        
        # Return response (API Gateway format) for sync requests
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',  # Will restrict in auth config
                'Access-Control-Allow-Methods': 'POST,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type,x-api-key'
            },
            'body': json.dumps(result)
        }
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        error_message = str(e)
        
        # Update job status for async failures
        if is_async and job_id:
            update_job_status(job_id, request_data.get('user_id', 'unknown') if 'request_data' in dir() else 'unknown', 'failed', 'writing', error_message)
            # For SQS, raise exception to trigger retry or DLQ
            raise
        
        # Determine specific validation error details
        details = {}
        if 'session_id' in error_message.lower():
            details['field'] = 'session_id'
            details['reason'] = 'Must be a valid UUID'
        elif 'user_id' in error_message.lower():
            details['field'] = 'user_id'
            details['reason'] = 'Must be a non-empty string'
        elif 'essay' in error_message.lower() or 'word' in error_message.lower():
            details['field'] = 'essay_content'
            details['reason'] = error_message
        elif 'task_type' in error_message.lower():
            details['field'] = 'task_type'
            details['reason'] = 'Must be TASK_1 or TASK_2'
        
        return create_error_response(
            status_code=400,
            error_code='VALIDATION_ERROR',
            message='Request validation failed',
            details=details if details else {'reason': error_message}
        )
    
    except KeyError as e:
        logger.error(f"Missing required field: {e}")
        return create_error_response(
            status_code=400,
            error_code='VALIDATION_ERROR',
            message='Missing required field',
            details={
                'field': str(e).strip("'"),
                'reason': 'This field is required'
            }
        )
    
    except Exception as e:
        logger.error(f"Error processing writing evaluation: {e}", exc_info=True)
        
        # Check for rate limiting errors (from API Gateway or upstream services)
        error_str = str(e).lower()
        if 'throttl' in error_str or 'rate limit' in error_str or '429' in error_str:
            return create_error_response(
                status_code=429,
                error_code='RATE_LIMIT_EXCEEDED',
                message='Rate limit exceeded. Please try again later.',
                details={
                    'limit': '5 requests per second',
                    'endpoint': '/api/v1/writing/evaluate'
                },
                retry_after=5
            )
        
        # Check for quota exceeded errors
        if 'quota' in error_str or 'limit exceeded' in error_str:
            return create_error_response(
                status_code=429,
                error_code='QUOTA_EXCEEDED',
                message='Daily quota exceeded',
                details={
                    'quota': 'Depends on your usage plan tier',
                    'reset_time': 'Midnight UTC'
                },
                retry_after=3600
            )
        
        # Generic internal server error
        return create_error_response(
            status_code=500,
            error_code='INTERNAL_SERVER_ERROR',
            message='An unexpected error occurred while processing your request',
            details={
                'type': type(e).__name__,
                'contact': 'support@ieltslearning.com'
            }
        )


def build_writing_prompt(essay_content: str, task_type: str, prompt: str, word_count: int) -> str:
    """Build evaluation prompt for Gemini"""
    return f"""You are an experienced IELTS examiner. Evaluate the following essay strictly per official IELTS Writing criteria.

Task Type: {task_type}
Prompt: {prompt}
Word Count: {word_count}

ESSAY:
{essay_content}

Evaluate using official IELTS band descriptors (1-9 scale, 0.5 increments ONLY):

1. **Task Achievement** (Task 2) or **Task Response** (Task 1) - Addresses all parts of task
2. **Coherence and Cohesion** - Logical organization, linking words
3. **Lexical Resource** - Vocabulary range, accuracy, spelling
4. **Grammatical Range and Accuracy** - Sentence structures, grammar errors

RESPOND IN THIS EXACT JSON FORMAT (NO MARKDOWN):
{{
  "overall_band": <float 1-9 in 0.5 increments>,
  "task_achievement": {{
    "band": <float>,
    "feedback": "<2-3 sentence detailed feedback>",
    "strengths": ["<strength1>", "<strength2>"],
    "weaknesses": ["<weakness1>", "<weakness2>"],
    "improvements": ["<improvement1>", "<improvement2>"]
  }},
  "coherence_cohesion": {{
    "band": <float>,
    "feedback": "<2-3 sentence detailed feedback>",
    "strengths": ["<strength1>", "<strength2>"],
    "weaknesses": ["<weakness1>", "<weakness2>"],
    "improvements": ["<improvement1>", "<improvement2>"]
  }},
  "lexical_resource": {{
    "band": <float>,
    "feedback": "<2-3 sentence detailed feedback>",
    "strengths": ["<strength1>", "<strength2>"],
    "weaknesses": ["<weakness1>", "<weakness2>"],
    "improvements": ["<improvement1>", "<improvement2>"]
  }},
  "grammatical_range_accuracy": {{
    "band": <float>,
    "feedback": "<2-3 sentence detailed feedback>",
    "strengths": ["<strength1>", "<strength2>"],
    "weaknesses": ["<weakness1>", "<weakness2>"],
    "improvements": ["<improvement1>", "<improvement2>"]
  }},
  "strengths": ["<overall strength1>", "<overall strength2>", "<overall strength3>"],
  "weaknesses": ["<overall weakness1>", "<overall weakness2>"],
  "recommendations": ["<recommendation1>", "<recommendation2>", "<recommendation3>"],
  "quoted_examples": [
    {{"quote": "<exact quote from essay>", "issue": "<what's wrong>", "suggestion": "<how to fix>"}},
    {{"quote": "<exact quote from essay>", "issue": "<what's wrong>", "suggestion": "<how to fix>"}}
  ],
  "confidence_score": <float 0-1>
}}

BE REALISTIC: Most candidates score 5.5-7.0. Band 8+ is rare. Provide SPECIFIC examples from the essay."""


def parse_gemini_response(response_text: str) -> Dict[str, Any]:
    """Parse JSON response from Gemini"""
    try:
        # Try to extract JSON
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        
        if json_start != -1 and json_end > json_start:
            json_str = response_text[json_start:json_end]
            evaluation = json.loads(json_str)
            
            # Validate band scores
            for field in ['overall_band', 'task_achievement', 'coherence_cohesion', 
                         'lexical_resource', 'grammatical_range_accuracy']:
                if field == 'overall_band':
                    evaluation[field] = validate_band_score(evaluation.get(field, 6.0))
                elif field in evaluation and 'band' in evaluation[field]:
                    evaluation[field]['band'] = validate_band_score(evaluation[field]['band'])
            
            logger.info("✅ Successfully parsed JSON response from Gemini")
            return evaluation
        else:
            logger.warning("⚠️ No JSON found in response, using fallback")
            return create_fallback_evaluation()
            
    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON parsing failed: {e}")
        return create_fallback_evaluation()


def validate_band_score(score: float) -> float:
    """Ensure band score is valid (1-9 in 0.5 increments)"""
    if score < 1.0:
        return 1.0
    elif score > 9.0:
        return 9.0
    else:
        # Round to nearest 0.5
        return round(score * 2) / 2


def create_fallback_evaluation() -> Dict[str, Any]:
    """Create fallback evaluation if parsing fails"""
    return {
        'overall_band': 6.0,
        'task_achievement': {
            'band': 6.0,
            'feedback': 'Addresses the task with relevant ideas',
            'strengths': ['Clear position'],
            'weaknesses': ['Could expand ideas more'],
            'improvements': ['Provide more specific examples']
        },
        'coherence_cohesion': {
            'band': 6.0,
            'feedback': 'Logically organized with some linking words',
            'strengths': ['Clear paragraphing'],
            'weaknesses': ['Limited range of cohesive devices'],
            'improvements': ['Use more varied linking words']
        },
        'lexical_resource': {
            'band': 6.0,
            'feedback': 'Adequate vocabulary for the task',
            'strengths': ['Appropriate word choice'],
            'weaknesses': ['Some repetition'],
            'improvements': ['Use more synonyms']
        },
        'grammatical_range_accuracy': {
            'band': 6.0,
            'feedback': 'Mix of simple and complex sentences',
            'strengths': ['Generally accurate'],
            'weaknesses': ['Some grammatical errors'],
            'improvements': ['Practice complex structures']
        },
        'strengths': ['Clear communication', 'Logical structure'],
        'weaknesses': ['Limited vocabulary range', 'Some errors'],
        'recommendations': ['Expand vocabulary', 'Practice grammar'],
        'quoted_examples': [],
        'confidence_score': 0.70
    }


# For local testing
if __name__ == '__main__':
    test_event = {
        'session_id': 'test-writing-123',
        'user_id': 'user-456',
        'essay_content': '''Technology has revolutionized education in many ways. Some people believe that it has made learning more effective, while others argue it has negative impacts. This essay will discuss both views and provide my opinion.

On one hand, technology provides access to vast amounts of information. Students can learn from online courses, educational videos, and digital libraries. Furthermore, interactive learning tools make education more engaging and personalized to individual needs.

On the other hand, excessive screen time can harm students' health and reduce face-to-face interaction. Additionally, not all students have equal access to technology, creating a digital divide.

In my opinion, while technology has some drawbacks, the benefits outweigh the disadvantages when used appropriately. Educational institutions should embrace technology while ensuring balanced use and equal access for all students.''',
        'task_type': 'TASK_2',
        'prompt': 'Some people believe that technology has made education more effective, while others think it has had a negative impact. Discuss both views and give your opinion.',
        'word_count': 145
    }
    
    print(lambda_handler(test_event, None))

