"""
Lambda Handler for Speaking Evaluator - Gemini Native Audio Version
Uses Gemini native audio processing (72% cheaper, 2x faster than AWS Transcribe)
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
    from lambda_shared.schemas import SpeakingEvaluationRequest, SpeakingEvaluationResponse
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
        'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
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


def download_audio_from_s3(audio_url: str) -> tuple[bytes, str]:
    """
    Download audio file from S3
    
    Returns:
        Tuple of (audio_bytes, mime_type)
    """
    s3_client = boto3.client('s3')
    
    # Parse S3 URL
    if audio_url.startswith('s3://'):
        parts = audio_url.replace('s3://', '').split('/', 1)
        bucket = parts[0]
        key = parts[1]
    elif 's3.amazonaws.com' in audio_url:
        parts = audio_url.split('/')
        bucket = parts[2].split('.')[0]
        key = '/'.join(parts[3:])
    else:
        raise ValueError(f"Invalid S3 URL: {audio_url}")
    
    logger.info(f"📥 Downloading from S3: bucket={bucket}, key={key}")
    
    # Download audio
    response = s3_client.get_object(Bucket=bucket, Key=key)
    audio_bytes = response['Body'].read()
    
    # Determine MIME type from extension
    mime_type = "audio/mp3"  # default
    if key.lower().endswith('.wav'):
        mime_type = "audio/wav"
    elif key.lower().endswith('.m4a'):
        mime_type = "audio/m4a"
    elif key.lower().endswith('.ogg'):
        mime_type = "audio/ogg"
    
    logger.info(f"✅ Downloaded {len(audio_bytes)} bytes, MIME type: {mime_type}")
    
    return audio_bytes, mime_type


def get_models_info() -> Dict[str, Any]:
    """
    Get information about available models for speaking evaluation
    
    Returns:
        Dictionary with model information including status, pricing, and capabilities
    """
    # Speaking evaluations ONLY use Gemini (native audio processing)
    models = [{
        'name': 'gemini-2.5-flash-audio',
        'display_name': 'Gemini 2.0 Flash (Audio)',
        'provider': 'Google',
        'status': 'available',
        'version': 'gemini-2.5-flash',
        'pricing': {
            'input_per_1k_tokens': 0.000075,  # $0.075 per 1M tokens
            'output_per_1k_tokens': 0.0003,   # $0.30 per 1M tokens
            'audio_per_minute': 0.007,        # ~$0.021 per 3-min audio
            'currency': 'USD'
        },
        'capabilities': ['native_audio_processing', 'transcription', 'pronunciation_assessment'],
        'recommended_for': ['speaking'],
        'average_latency_ms': 35000,
        'notes': 'Native audio processing - no transcription service needed. 72% cheaper and 2x faster than alternatives.'
    }]
    
    return {
        'service': 'speaking-evaluator',
        'models': models,
        'default_model': 'gemini-2.5-flash-audio',
        'note': 'Speaking evaluations only support Gemini due to native audio processing requirements',
        'timestamp': int(time.time())
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
    Lambda handler for speaking evaluation using Gemini native audio
    
    Supports:
    - POST /evaluate - Evaluate speaking with Gemini audio (sync)
    - POST /evaluate/async - Queue evaluation via SQS (async)
    - GET /models/available - Get available models and their status
    
    SIMPLIFIED & IMPROVED:
    - 72% cost savings ($0.021 vs $0.076 per 3-min audio)
    - 2x faster (30-45s vs 60-90s)
    - Better pronunciation assessment (Gemini hears actual audio)
    - One API call instead of two (no AWS Transcribe)
    
    Authentication:
    - Requires a valid x-api-key header issued via API Gateway usage plans
    - Expects user_id to be supplied in the request payload
    Requirements: 9.4, 9.5, 9.6
    """
    # Check if this is an SQS event (async processing)
    is_async = is_sqs_event(event)
    job_id = None
    request_data = None
    
    try:
        # Handle GET request for model info (only for sync/API Gateway)
        if not is_async:
            http_method = event.get('httpMethod') or event.get('requestContext', {}).get('http', {}).get('method')
            path = event.get('path') or event.get('requestContext', {}).get('http', {}).get('path', '')
        
            if http_method == 'GET' and '/models/available' in path:
                logger.info("📋 Fetching available models info")
                models_info = get_models_info()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type,x-api-key'
                    },
                    'body': json.dumps(models_info)
                }
        
        # Parse request based on event source
        if is_async:
            logger.info("📨 Processing async speaking evaluation from SQS")
            request_data, job_id = parse_sqs_message(event)
            if job_id and not request_data.get('session_id'):
                request_data['session_id'] = job_id
            # Mark job as processing
            if job_id:
                update_job_status(job_id, request_data.get('user_id', 'unknown'), 'processing', 'speaking')
        else:
            logger.info(f"🎤 Processing sync speaking evaluation: {event.get('session_id')}")
            # Parse request (handle both direct and API Gateway formats)
            request_data = event
            if isinstance(event.get('body'), str):
                request_data = json.loads(event['body'])
        
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
        user_id = request_data.get("user_id")
        if user_id:
            logger.info(f"🔑 Request scoped to user: {user_id}")

        if not user_id:
            raise ValueError("user_id is required in the request payload when using API key authentication")
        
        session_id = request_data.get('session_id')
        audio_url = request_data.get('audio_url') or request_data.get('audio_s3_key')
        part = request_data.get('part', 'PART_1')
        difficulty = request_data.get('difficulty', 'BAND_7')
        questions = request_data.get('questions', [])
        
        # Validate required fields
        if not audio_url:
            raise ValueError("Missing required field: 'audio_url' or 'audio_s3_key'. Please provide the S3 location of the audio file.")
        
        if not session_id:
            raise ValueError("Missing required field: 'session_id'")
        
        logger.info(f"Request: part={part}, difficulty={difficulty}, questions={len(questions)}, audio_url={audio_url}")
        
        # Step 1: Download audio from S3
        audio_bytes, mime_type = download_audio_from_s3(audio_url)
        
        # Step 2: Send audio directly to Gemini for transcription + evaluation
        # ONE API call replaces: AWS Transcribe + Gemini text evaluation
        logger.info("🤖 Calling Gemini API with audio...")
        
        evaluation = gemini_client.evaluate_audio(
            audio_bytes=audio_bytes,
            part=part,
            difficulty=difficulty,
            questions=questions,
            mime_type=mime_type,
            max_retries=3,
            timeout=120
        )
        
        # Extract results
        transcript = evaluation.get('transcript', '')
        duration = evaluation.get('duration_seconds', 0)
        word_count = evaluation.get('word_count', len(transcript.split()))
        usage = evaluation.get('usage', {})
        
        logger.info(f"✅ Evaluation complete: {len(transcript)} chars, {duration:.1f}s")
        logger.info(f"📊 Cost: ${usage.get('cost', 0):.4f} (input={usage.get('input_tokens', 0)}, output={usage.get('output_tokens', 0)})")
        
        # Step 3: Build response
        result = {
            'session_id': session_id,
            'transcript': transcript,
            'duration': duration,
            'word_count': word_count,
            'overall_band': evaluation.get('overall_band', "error"),
            'fluency_band': evaluation.get('fluency_coherence', {}).get('band', "error"),
            'lexical_band': evaluation.get('lexical_resource', {}).get('band', "error"),
            'grammar_band': evaluation.get('grammatical_range_accuracy', {}).get('band', "error"),
            'pronunciation_band': evaluation.get('pronunciation', {}).get('band', "error"),
            'feedback': {
                'overall': f"Overall Band: {evaluation.get('overall_band', 'error')}",
                'fluency': evaluation.get('fluency_coherence', {}),
                'lexical': evaluation.get('lexical_resource', {}),
                'grammar': evaluation.get('grammatical_range_accuracy', {}),
                'pronunciation': evaluation.get('pronunciation', {})
            },
            'confidence_score': evaluation.get('confidence_score', 0.85),
            'model_used': 'gemini-2.5-flash-audio',
            'model_version': 'gemini-2.5-flash',
            'fallback_occurred': False,
            'estimated_cost': usage.get('cost', 0),
            'token_usage': {
                'input_tokens': usage.get('input_tokens', 0),
                'output_tokens': usage.get('output_tokens', 0),
                'total_tokens': usage.get('total_tokens', 0)
            },
            'latency_ms': evaluation.get('latency_ms', 0),
            'evaluated_at': context.get_remaining_time_in_millis() if context else 0
        }
        
        logger.info(f"✅ Speaking evaluation complete: Band {result['overall_band']}")

        # Save to DynamoDB
        try:
            dynamodb = boto3.resource('dynamodb')
            evaluations_table = dynamodb.Table(os.environ.get('DYNAMODB_EVALUATIONS'))
            
            # Store evaluation result
            evaluations_table.put_item(
                Item={
                    'evaluation_id': session_id,
                    'user_id': user_id,
                    'evaluation_type': 'speaking',
                    'part': part,
                    'audio_url': audio_url,
                    'transcript': transcript,
                    'duration': str(duration),
                    'word_count': word_count,
                    'overall_band': str(result['overall_band']),
                    'fluency_band': str(result['fluency_band']),
                    'lexical_band': str(result['lexical_band']),
                    'grammar_band': str(result['grammar_band']),
                    'pronunciation_band': str(result['pronunciation_band']),
                    'feedback': json.dumps(result['feedback']),
                    'model_used': result['model_used'],
                    'confidence_score': str(result['confidence_score']),
                    'estimated_cost': str(result['estimated_cost']),
                    'created_at': result['evaluated_at'],
                    'status': 'completed'
                }
            )
            logger.info(f"✅ Saved speaking evaluation to DynamoDB: {session_id}")
        except Exception as e:
            logger.error(f"❌ Failed to save to DynamoDB: {e}")
            # Don't fail the request if DynamoDB save fails
        
        # For async (SQS), just return success - result is in DynamoDB
        if is_async:
            logger.info(f"✅ Async speaking evaluation complete: Band {result['overall_band']}")
            return {'statusCode': 200, 'body': 'OK'}
            
        # Return response (API Gateway format) for sync requests
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
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
            update_job_status(job_id, request_data.get('user_id', 'unknown') if request_data else 'unknown', 'failed', 'speaking', error_message)
            raise  # Re-raise for SQS retry/DLQ
        
        # Determine specific validation error details
        details = {}
        if 'session_id' in error_message.lower():
            details['field'] = 'session_id'
            details['reason'] = 'Must be a valid UUID'
        elif 'user_id' in error_message.lower():
            details['field'] = 'user_id'
            details['reason'] = 'Must be a non-empty string'
        elif 'audio_url' in error_message.lower() or 'audio_s3_key' in error_message.lower():
            details['field'] = 'audio_url'
            details['reason'] = error_message
        elif 's3' in error_message.lower():
            details['field'] = 'audio_url'
            details['reason'] = 'Invalid S3 URL format. Expected s3://bucket/key'
        
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
        logger.error(f"Error processing speaking evaluation: {e}", exc_info=True)
        
        # Check for rate limiting errors (from API Gateway or upstream services)
        error_str = str(e).lower()
        if 'throttl' in error_str or 'rate limit' in error_str or '429' in error_str:
            return create_error_response(
                status_code=429,
                error_code='RATE_LIMIT_EXCEEDED',
                message='Rate limit exceeded. Please try again later.',
                details={
                    'limit': '5 requests per second',
                    'endpoint': '/api/v1/speaking/evaluate'
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
        
        # Check for S3 access errors
        if 'botocore' in error_str or 's3' in error_str:
            return create_error_response(
                status_code=403,
                error_code='RESOURCE_ACCESS_DENIED',
                message='Unable to access audio file',
                details={
                    'reason': 'Audio file not found or access denied',
                    'contact': 'support@ieltslearning.com'
                }
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


# For local testing
if __name__ == '__main__':
    test_event = {
        'session_id': 'test-123',
        'user_id': 'user-456',
        'audio_url': 's3://test-bucket/test.mp3',
        'part': 'PART_2',
        'difficulty': 'BAND_7',
        'questions': [
            {
                'id': 'q1',
                'text': 'Describe a memorable event in your life',
                'order': 1
            }
        ]
    }
    
    print(lambda_handler(test_event, None))
