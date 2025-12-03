"""
Lambda Handler for S3 Presigned URL Generation
Generates secure presigned URLs for file uploads (audio, PDFs, images)
"""

import json
import os
import logging
from typing import Dict, Any
import boto3
from datetime import datetime

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize S3 client
s3_client = boto3.client('s3')


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Generate presigned URL for S3 upload
    
    Request:
    {
      "user_id": "user-123",
      "session_id": "session-456",
      "filename": "audio.mp3",
      "content_type": "audio/mp3",
      "upload_type": "speaking_audio" | "writing_essay" | "flashcard_pdf" | "user_avatar"
    }
    
    Response:
    {
      "upload_url": "https://s3.amazonaws.com/...presigned...",
      "file_url": "s3://bucket/path/to/file",
      "expires_in": 900
    }
    """
    try:
        logger.info("📤 Generating S3 presigned URL")
        
        # Parse request (handle both direct and API Gateway formats)
        request_data = event
        if isinstance(event.get('body'), str):
            request_data = json.loads(event['body'])
        
        user_id = request_data.get('user_id')
        session_id = request_data.get('session_id', 'default')
        filename = request_data.get('filename')
        content_type = request_data.get('content_type', 'application/octet-stream')
        upload_type = request_data.get('upload_type', 'general')
        
        # Validate required fields
        if not user_id or not filename:
            raise ValueError("user_id and filename are required")
        
        # Determine bucket based on upload type
        bucket_map = {
            'speaking_audio': os.environ.get('S3_BUCKET_AUDIO'),
            'flashcard_pdf': os.environ.get('S3_BUCKET_DOCUMENTS'),
            'writing_essay': os.environ.get('S3_BUCKET_DOCUMENTS'),
            'user_avatar': os.environ.get('S3_BUCKET_RESULTS'),  # Or separate bucket
            'general': os.environ.get('S3_BUCKET_RESULTS')
        }
        
        bucket = bucket_map.get(upload_type)
        if not bucket:
            raise ValueError(f"Invalid upload_type: {upload_type}")
        
        # Generate S3 key with organized structure
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        if upload_type == 'speaking_audio':
            key = f"uploads/speaking/{user_id}/{session_id}/{timestamp}_{filename}"
        elif upload_type == 'flashcard_pdf':
            key = f"uploads/documents/{user_id}/{session_id}/{timestamp}_{filename}"
        elif upload_type == 'writing_essay':
            key = f"uploads/writing/{user_id}/{session_id}/{timestamp}_{filename}"
        elif upload_type == 'user_avatar':
            key = f"uploads/avatars/{user_id}/{timestamp}_{filename}"
        else:
            key = f"uploads/{user_id}/{session_id}/{timestamp}_{filename}"
        
        logger.info(f"Generating presigned URL: bucket={bucket}, key={key}")
        
        # Generate presigned URL (15 minutes expiry)
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': bucket,
                'Key': key,
                'ContentType': content_type
            },
            ExpiresIn=900,  # 15 minutes
            HttpMethod='PUT'
        )
        
        # Also generate GET presigned URL for accessing the file
        get_presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': bucket,
                'Key': key
            },
            ExpiresIn=3600  # 1 hour
        )
        
        file_url = f"s3://{bucket}/{key}"
        
        logger.info(f"✅ Presigned URL generated: {file_url}")
        
        # Return response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization,x-api-key'
            },
            'body': json.dumps({
                'upload_url': presigned_url,
                'file_url': file_url,
                'get_url': get_presigned_url,
                'expires_in': 900,
                'bucket': bucket,
                'key': key,
                'content_type': content_type
            })
        }
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Validation error',
                'message': str(e)
            })
        }
    
    except Exception as e:
        logger.error(f"Error generating presigned URL: {e}", exc_info=True)
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e),
                'type': type(e).__name__
            })
        }


# For local testing
if __name__ == '__main__':
    test_event = {
        'user_id': 'user-123',
        'session_id': 'session-456',
        'filename': 'test_audio.mp3',
        'content_type': 'audio/mp3',
        'upload_type': 'speaking_audio'
    }
    
    print(lambda_handler(test_event, None))

