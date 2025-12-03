"""
Lambda Handler for Evaluation Status
Polls DynamoDB for async evaluation results
"""

import json
import os
import logging
from typing import Dict, Any, Optional
from decimal import Decimal

import boto3
from boto3.dynamodb.conditions import Key

logger = logging.getLogger()
logger.setLevel(logging.INFO)


class DecimalEncoder(json.JSONEncoder):
    """Handle Decimal types from DynamoDB"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)


def create_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """Create API Gateway response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,x-api-key'
        },
        'body': json.dumps(body, cls=DecimalEncoder)
    }


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Get evaluation status by job_id (evaluation_id)
    
    Returns:
        - pending: Job is queued but not started
        - processing: Job is being processed
        - completed: Job finished successfully (includes results)
        - failed: Job failed (includes error details)
    """
    try:
        # Extract evaluation_id from path
        evaluation_id = event.get('pathParameters', {}).get('evaluation_id')
        
        if not evaluation_id:
            return create_response(400, {
                'error': {
                    'code': 'VALIDATION_ERROR',
                    'message': 'evaluation_id is required'
                }
            })
        
        logger.info(f"📋 Checking status for evaluation: {evaluation_id}")
        
        # Query DynamoDB
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(os.environ.get('DYNAMODB_EVALUATIONS'))
        
        # Query by evaluation_id (hash key)
        response = table.query(
            KeyConditionExpression=Key('evaluation_id').eq(evaluation_id),
            Limit=1
        )
        
        items = response.get('Items', [])
        
        if not items:
            # Not found - might still be pending in queue
            return create_response(200, {
                'evaluation_id': evaluation_id,
                'status': 'pending',
                'message': 'Evaluation is queued for processing'
            })
        
        item = items[0]
        status = item.get('status', 'unknown')
        
        if status == 'completed':
            # Return full results
            result = {
                'evaluation_id': evaluation_id,
                'status': 'completed',
                'evaluation_type': item.get('evaluation_type'),
                'user_id': item.get('user_id'),
                'created_at': item.get('created_at'),
                'results': {}
            }
            
            # Add type-specific results
            eval_type = item.get('evaluation_type')
            
            if eval_type == 'writing':
                result['results'] = {
                    'overall_band': item.get('overall_band'),
                    'task_achievement_band': item.get('task_achievement_band'),
                    'coherence_band': item.get('coherence_band'),
                    'lexical_band': item.get('lexical_band'),
                    'grammar_band': item.get('grammar_band'),
                    'feedback': json.loads(item.get('feedback', '{}')),
                    'word_count': item.get('word_count'),
                    'confidence_score': item.get('confidence_score')
                }
            elif eval_type == 'speaking':
                result['results'] = {
                    'overall_band': item.get('overall_band'),
                    'fluency_band': item.get('fluency_band'),
                    'lexical_band': item.get('lexical_band'),
                    'grammar_band': item.get('grammar_band'),
                    'pronunciation_band': item.get('pronunciation_band'),
                    'transcript': item.get('transcript'),
                    'duration': item.get('duration'),
                    'feedback': json.loads(item.get('feedback', '{}')),
                    'confidence_score': item.get('confidence_score')
                }
            elif eval_type == 'flashcard':
                result['results'] = {
                    'flashcards': json.loads(item.get('flashcards', '[]')),
                    'document_id': item.get('document_id'),
                    'chunk_count': item.get('chunk_count'),
                    'page_count': item.get('page_count')
                }
            
            return create_response(200, result)
        
        elif status == 'processing':
            return create_response(200, {
                'evaluation_id': evaluation_id,
                'status': 'processing',
                'message': 'Evaluation is being processed',
                'evaluation_type': item.get('evaluation_type'),
                'started_at': item.get('started_at')
            })
        
        elif status == 'failed':
            return create_response(200, {
                'evaluation_id': evaluation_id,
                'status': 'failed',
                'message': 'Evaluation failed',
                'error': item.get('error_message', 'Unknown error'),
                'evaluation_type': item.get('evaluation_type')
            })
        
        else:
            return create_response(200, {
                'evaluation_id': evaluation_id,
                'status': status,
                'message': f'Unknown status: {status}'
            })
            
    except Exception as e:
        logger.error(f"Error checking evaluation status: {e}", exc_info=True)
        return create_response(500, {
            'error': {
                'code': 'INTERNAL_SERVER_ERROR',
                'message': 'Failed to check evaluation status'
            }
        })
