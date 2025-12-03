"""
Lightweight RAG Flashcard Generator Lambda Handler.

Uses InMemoryVectorStore + Gemini embeddings (no FAISS).
Optimized for <50MB Lambda package size.
"""

import json
import os
import sys
import logging
import time
from typing import Any, Dict, Optional, List

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Add layers to path
sys.path.insert(0, '/opt/python')

# Import boto3
import boto3

# Global instances for warm starts
_rag_instance = None
_s3_client = None


def get_s3_client():
    """Get cached S3 client."""
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client('s3')
    return _s3_client


def get_rag_instance(api_key: str):
    """Get cached RAG instance for warm starts."""
    global _rag_instance
    if _rag_instance is None:
        from rag_pipeline import LangChainRAG
        _rag_instance = LangChainRAG(
            api_key=api_key,
            chunk_size=int(os.environ.get('RAG_CHUNK_SIZE', '500')),
            chunk_overlap=int(os.environ.get('RAG_CHUNK_OVERLAP', '100'))
        )
        logger.info("Cold start: RAG instance created")
    else:
        logger.info("Warm start: Reusing RAG instance")
    return _rag_instance


def download_pdf_from_s3(bucket: str, key: str) -> str:
    """Download PDF from S3 to /tmp."""
    s3 = get_s3_client()
    local_path = f"/tmp/{key.split('/')[-1]}"
    
    logger.info(f"Downloading s3://{bucket}/{key} to {local_path}")
    s3.download_file(bucket, key, local_path)
    
    return local_path


def create_response(status_code: int, body: Dict) -> Dict:
    """Create API Gateway response."""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization'
        },
        'body': json.dumps(body)
    }


def generate_flashcards_prompt(chunks: List[Dict], num_cards: int, difficulty: str, question_types: List[str]) -> str:
    """Build prompt for Gemini flashcard generation."""
    context = "\n\n".join([
        f"[Chunk {i+1}] (Page {c.get('page', '?')}):\n{c['text']}"
        for i, c in enumerate(chunks)
    ])
    
    types_str = ", ".join(question_types)
    
    return f"""Based on the following document excerpts, generate {num_cards} flashcards.

CONTEXT:
{context}

REQUIREMENTS:
- Difficulty: {difficulty}
- Generate exactly {num_cards} flashcards
- Each flashcard should have a clear question and concise answer
- Focus on key concepts, definitions, and important facts
- Use these question types: {types_str}

QUESTION TYPE DEFINITIONS:
- DEFINITION: Ask for the definition of a term or concept
- VOCABULARY: Test understanding of key vocabulary words
- FILL_BLANK: Complete the sentence with missing word/phrase
- COMPREHENSION: Test understanding of concepts
- APPLICATION: Apply knowledge to scenarios

OUTPUT FORMAT (JSON):
{{
  "flashcards": [
    {{
      "question": "...",
      "answer": "...",
      "type": "{question_types[0] if question_types else 'DEFINITION'}",
      "difficulty": "{difficulty}",
      "source_chunk": 1
    }}
  ]
}}

Return ONLY valid JSON."""


def call_gemini(prompt: str, api_key: str) -> Dict:
    """Call Gemini API for flashcard generation."""
    import google.generativeai as genai
    
    genai.configure(api_key=api_key)
    
    model = genai.GenerativeModel(
        model_name=os.environ.get('GEMINI_MODEL', 'gemini-2.0-flash'),
        generation_config={
            'temperature': float(os.environ.get('GEMINI_TEMPERATURE', '0.3')),
            'max_output_tokens': int(os.environ.get('GEMINI_MAX_TOKENS', '4096'))
        }
    )
    
    response = model.generate_content(prompt)
    
    # Parse JSON from response
    text = response.text
    # Extract JSON if wrapped in markdown
    if '```json' in text:
        text = text.split('```json')[1].split('```')[0]
    elif '```' in text:
        text = text.split('```')[1].split('```')[0]
    
    return json.loads(text.strip())


def parse_s3_url(pdf_url: str) -> tuple:
    """Parse S3 URL to extract bucket and key."""
    if pdf_url.startswith('s3://'):
        # s3://bucket-name/path/to/file.pdf
        parts = pdf_url.replace('s3://', '').split('/', 1)
        return parts[0], parts[1] if len(parts) > 1 else ''
    elif 's3.amazonaws.com' in pdf_url:
        # https://bucket-name.s3.amazonaws.com/path/to/file.pdf
        parts = pdf_url.split('/')
        bucket = parts[2].split('.')[0]
        key = '/'.join(parts[3:])
        return bucket, key
    else:
        raise ValueError(f"Invalid S3 URL format: {pdf_url}")


def is_sqs_event(event: Dict[str, Any]) -> bool:
    """Check if event is from SQS"""
    return 'Records' in event and len(event['Records']) > 0 and event['Records'][0].get('eventSource') == 'aws:sqs'


def parse_sqs_message(event: Dict[str, Any]) -> tuple:
    """Parse SQS message and extract request data and job_id"""
    record = event['Records'][0]
    body = json.loads(record['body'])
    
    job_id = None
    if 'messageAttributes' in record:
        attrs = record['messageAttributes']
        if 'RequestId' in attrs:
            job_id = attrs['RequestId'].get('stringValue')
    
    return body, job_id


def update_job_status(evaluation_id: str, user_id: str, status: str, error_message: str = None):
    """Update job status in DynamoDB"""
    try:
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(os.environ.get('DYNAMODB_FLASHCARD_SETS', os.environ.get('DYNAMODB_EVALUATIONS')))
        
        item = {
            'evaluation_id': evaluation_id,
            'user_id': user_id,
            'evaluation_type': 'flashcard',
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
    Lambda handler for RAG-based flashcard generation.
    
    Supports both sync (API Gateway) and async (SQS) invocation.
    
    Event format (original):
    {
        "set_id": "flashcard-set-12",
        "user_id": "user-45",
        "document_id": "doc-789",
        "pdf_url": "s3://bucket-name/path/to/document.pdf",
        "num_cards": 10,
        "difficulty": "MEDIUM",
        "question_types": ["DEFINITION", "VOCABULARY", "FILL_BLANK"]
    }
    
    Alternative format:
    {
        "s3_bucket": "bucket-name",
        "s3_key": "path/to/document.pdf",
        ...
    }
    
    Or API Gateway format with body as JSON string.
    """
    start_time = time.time()
    is_async = is_sqs_event(event)
    job_id = None
    request = None
    
    try:
        # Parse request based on event source
        if is_async:
            logger.info("📨 Processing async flashcard generation from SQS")
            request, job_id = parse_sqs_message(event)
            if job_id and not request.get('set_id'):
                request['set_id'] = job_id
            if job_id:
                update_job_status(job_id, request.get('user_id', 'unknown'), 'processing')
        elif isinstance(event.get('body'), str):
            request = json.loads(event['body'])
        else:
            request = event
        
        # Support both pdf_url and s3_bucket/s3_key formats
        pdf_url = request.get('pdf_url')
        if pdf_url:
            s3_bucket, s3_key = parse_s3_url(pdf_url)
        else:
            s3_bucket = request.get('s3_bucket')
            s3_key = request.get('s3_key')
        
        if not s3_bucket or not s3_key:
            return create_response(400, {
                'error': 'Missing required fields: pdf_url or (s3_bucket, s3_key)'
            })
        
        # Get parameters
        query = request.get('query', 'key concepts and important information')
        num_cards = int(request.get('num_cards', 10))
        difficulty = request.get('difficulty', 'MEDIUM')
        top_k = int(request.get('top_k', 5))
        user_id = request.get('user_id', 'anonymous')
        set_id = request.get('set_id', f"set_{int(time.time())}")
        document_id = request.get('document_id', s3_key)
        question_types = request.get('question_types', ['DEFINITION', 'VOCABULARY', 'COMPREHENSION'])
        
        # Get API key from Secrets Manager
        api_key = None
        secret_arn = os.environ.get('GEMINI_API_KEY_SECRET_ARN')
        
        if secret_arn:
            try:
                secrets_client = boto3.client('secretsmanager')
                response = secrets_client.get_secret_value(SecretId=secret_arn)
                api_key = response['SecretString']
                logger.info("🔐 Retrieved Gemini API key from Secrets Manager")
            except Exception as e:
                logger.error(f"❌ Failed to get secret: {e}")
                return create_response(500, {'error': f'Failed to retrieve API key: {str(e)}'})
        else:
            # Fallback to environment variable
            api_key = os.environ.get('GEMINI_API_KEY')
        
        if not api_key:
            return create_response(500, {'error': 'GEMINI_API_KEY_SECRET_ARN not configured'})
        
        logger.info(f"Processing: s3://{s3_bucket}/{s3_key}")
        logger.info(f"Parameters: query='{query[:50]}...', num_cards={num_cards}, top_k={top_k}")
        
        # Step 1: Download PDF
        download_start = time.time()
        local_pdf = download_pdf_from_s3(s3_bucket, s3_key)
        download_time = time.time() - download_start
        logger.info(f"Download time: {download_time:.2f}s")
        
        # Step 2: Index document with RAG
        index_start = time.time()
        rag = get_rag_instance(api_key)
        
        # Reset vector store for new document
        rag._vector_store = None
        rag._chunks = []
        
        index_result = rag.index_document(local_pdf, document_id=s3_key)
        index_time = time.time() - index_start
        logger.info(f"Index time: {index_time:.2f}s, chunks: {index_result['chunk_count']}")
        
        # Step 3: Retrieve relevant chunks using HYBRID approach
        retrieve_start = time.time()
        
        # Use smart queries for better coverage (hybrid approach)
        if index_result['chunk_count'] <= 15:
            # Small document: use all chunks
            logger.info("📄 Small document - using representative chunks")
            chunks = rag.get_representative_chunks(num_chunks=min(10, index_result['chunk_count']))
            retrieval_method = "representative"
        else:
            # Larger document: use smart keyword-based queries
            logger.info("📚 Large document - using smart query retrieval")
            chunks = rag.retrieve_with_smart_queries(top_k_per_query=3)
            retrieval_method = "smart_queries"
        
        retrieve_time = time.time() - retrieve_start
        logger.info(f"Retrieve time: {retrieve_time:.2f}s, chunks: {len(chunks)}, method: {retrieval_method}")
        
        # Step 4: Generate flashcards with Gemini
        generate_start = time.time()
        prompt = generate_flashcards_prompt(chunks, num_cards, difficulty, question_types)
        flashcard_result = call_gemini(prompt, api_key)
        generate_time = time.time() - generate_start
        logger.info(f"Generate time: {generate_time:.2f}s")
        
        # Clean up
        try:
            os.remove(local_pdf)
        except:
            pass
        
        total_time = time.time() - start_time
        
        # Build response
        response_body = {
            'status': 'success',
            'set_id': set_id,
            'user_id': user_id,
            'document_id': document_id,
            'document': {
                's3_bucket': s3_bucket,
                's3_key': s3_key,
                'pdf_url': f"s3://{s3_bucket}/{s3_key}",
                'page_count': index_result['page_count'],
                'chunk_count': index_result['chunk_count']
            },
            'retrieval': {
                'method': retrieval_method,
                'smart_queries': rag.generate_smart_queries() if retrieval_method == 'smart_queries' else [],
                'keywords': index_result.get('keywords', []),
                'chunks_used': len(chunks),
                'avg_score': sum(c['score'] for c in chunks) / len(chunks) if chunks else 0
            },
            'flashcards': flashcard_result.get('flashcards', []),
            'total_cards': len(flashcard_result.get('flashcards', [])),
            'difficulty': difficulty,
            'question_types': question_types,
            'metrics': {
                'download_time_ms': round(download_time * 1000),
                'index_time_ms': round(index_time * 1000),
                'retrieve_time_ms': round(retrieve_time * 1000),
                'generate_time_ms': round(generate_time * 1000),
                'total_time_ms': round(total_time * 1000)
            }
        }
        
        logger.info(f"Success: {len(response_body['flashcards'])} flashcards in {total_time:.2f}s")
        
        # Save to DynamoDB for async polling
        if is_async and job_id:
            try:
                dynamodb = boto3.resource('dynamodb')
                table = dynamodb.Table(os.environ.get('DYNAMODB_EVALUATIONS'))
                table.put_item(Item={
                    'evaluation_id': job_id,
                    'user_id': user_id,
                    'evaluation_type': 'flashcard',
                    'status': 'completed',
                    'document_id': document_id,
                    'flashcards': json.dumps(response_body['flashcards']),
                    'chunk_count': index_result['chunk_count'],
                    'page_count': index_result['page_count'],
                    'created_at': int(time.time())
                })
                logger.info(f"✅ Saved flashcard results to DynamoDB: {job_id}")
            except Exception as e:
                logger.error(f"❌ Failed to save to DynamoDB: {e}")
            
            return {'statusCode': 200, 'body': 'OK'}
        
        return create_response(200, response_body)
        
    except Exception as e:
        logger.error(f"Error: {str(e)}", exc_info=True)
        
        # Update job status for async failures
        if is_async and job_id:
            update_job_status(job_id, request.get('user_id', 'unknown') if request else 'unknown', 'failed', str(e))
            raise  # Re-raise for SQS retry/DLQ
        
        return create_response(500, {
            'error': str(e),
            'error_type': type(e).__name__
        })
