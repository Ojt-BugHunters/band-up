"""
Lambda Handler for Flashcard Generator
Processes flashcard generation requests via Lambda
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
sys.path.insert(0, '/opt/python/lib/python3.11/site-packages')

# Import AI services (from Lambda layer)
try:
    # Lambda layer packages are in /opt/python/lambda_shared/
    from lambda_shared.flashcard_generator import FlashcardGenerator, FlashcardGenerationError
    from lambda_shared.schemas import FlashcardGenerationRequest
    import boto3
    import redis
except ImportError as e:
    logger.error(f"Import error: {e}")
    logger.error(f"Python path: {sys.path}")
    raise

# Import RAG components (from Lambda layer) - optional for backward compatibility
try:
    import faiss
    import numpy as np
    from gemini_embeddings import GeminiEmbeddingGenerator
    from faiss_index_manager import FAISSIndexManager
    from config import RAGConfig
    
    RAG_AVAILABLE = True
    logger.info("✅ RAG components imported successfully (Gemini embeddings)")
except ImportError as e:
    RAG_AVAILABLE = False
    # Create a dummy numpy for when RAG is not available
    np = None
    logger.warning(f"⚠️ RAG components not available: {e}")
    logger.warning("⚠️ RAG-based generation will be disabled")

# Import secrets helper (from shared module)
sys.path.insert(0, '/opt/python/shared')
try:
    from secrets_helper import get_gemini_api_key
except ImportError as e:
    logger.error(f"Failed to import secrets_helper: {e}")
    get_gemini_api_key = None

# Global instances for warm starts (RAG components)
_embedding_generator: Optional[Any] = None
_index_manager: Optional[Any] = None
_s3_client: Optional[Any] = None


def log_metric(metric_name: str, data: Dict[str, Any]) -> None:
    """
    Log structured metric for CloudWatch Insights.
    
    Requirement 11.2: Log retrieval timing and chunk count
    Requirement 11.2: Log cache hit/miss status
    Requirement 11.2: Log generation timing
    Requirement 11.5: Use JSON format for CloudWatch Insights queries
    
    Args:
        metric_name: Name of the metric
        data: Dictionary with metric data
    """
    log_entry = {
        "metric_type": "flashcard_generator",
        "metric_name": metric_name,
        "timestamp": time.time(),
        "timestamp_iso": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        **data
    }
    logger.info(json.dumps(log_entry))


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
        retry_after: Seconds to wait before retrying (for 429, 202, 404 responses)
    
    Returns:
        API Gateway response dict with standardized error format
    """
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,x-api-key'
    }
    
    # Add Retry-After header for rate limit and retry responses
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


def _derive_document_id(document_url: str) -> str:
    cleaned_url = document_url.rstrip('/')
    return cleaned_url.split('/')[-1] or cleaned_url


def _check_document_index(document_id: str) -> Optional[Dict[str, Any]]:
    """
    Check DynamoDB for document index metadata.
    
    Requirement 9.1: Check DynamoDB for index metadata before processing
    Requirement 8.3: Query DynamoDB metadata table
    
    Args:
        document_id: Document identifier
        
    Returns:
        Index metadata dictionary if found, None otherwise
    """
    try:
        # Get DynamoDB table name from environment
        table_name = os.environ.get('DYNAMODB_FAISS_INDICES')
        
        if not table_name:
            logger.warning("⚠️ DYNAMODB_FAISS_INDICES environment variable not set")
            return None
        
        # Query DynamoDB
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(table_name)
        
        response = table.get_item(
            Key={'document_id': document_id}
        )
        
        if 'Item' in response:
            return response['Item']
        else:
            return None
            
    except Exception as e:
        logger.error(f"❌ Failed to check document index in DynamoDB: {e}")
        # Return None to allow fallback to legacy mode
        return None


def _get_embedding_generator() -> Any:
    """
    Get or create embedding generator (cached for warm starts).
    
    Requirement 11.5: Log cache hit/miss for warm starts
    
    Returns:
        EmbeddingGenerator instance
    """
    global _embedding_generator
    
    if _embedding_generator is None:
        logger.info("🔥 Cold start: Initializing embedding generator")
        
        # Structured logging for cache miss
        log_entry = {
            "metric": "cache_status",
            "component": "embedding_generator",
            "status": "miss",
            "type": "cold_start"
        }
        logger.info(json.dumps(log_entry))
        
        _embedding_generator = GeminiEmbeddingGenerator()
    else:
        logger.info("♨️ Warm start: Reusing Gemini embedding generator (cache hit)")
        
        # Structured logging for cache hit
        log_entry = {
            "metric": "cache_status",
            "component": "embedding_generator",
            "status": "hit",
            "type": "warm_start"
        }
        logger.info(json.dumps(log_entry))
    
    return _embedding_generator


def _get_index_manager() -> Any:
    """
    Get or create FAISS index manager (cached for warm starts).
    
    Requirement 11.5: Log cache hit/miss for warm starts
    
    Returns:
        FAISSIndexManager instance
    """
    global _index_manager
    
    if _index_manager is None:
        logger.info("🔥 Cold start: Initializing FAISS index manager")
        
        # Structured logging for cache miss
        log_entry = {
            "metric": "cache_status",
            "component": "index_manager",
            "status": "miss",
            "type": "cold_start"
        }
        logger.info(json.dumps(log_entry))
        
        _index_manager = FAISSIndexManager(config=RAGConfig)
    else:
        logger.info("♨️ Warm start: Reusing FAISS index manager (cache hit)")
        
        # Structured logging for cache hit
        log_entry = {
            "metric": "cache_status",
            "component": "index_manager",
            "status": "hit",
            "type": "warm_start"
        }
        logger.info(json.dumps(log_entry))
    
    return _index_manager


def _get_s3_client() -> Any:
    """Get or create S3 client (cached for warm starts)."""
    global _s3_client
    
    if _s3_client is None:
        _s3_client = boto3.client('s3')
    
    return _s3_client


def _load_index_from_s3(
    index_metadata: Dict[str, Any],
    document_id: str
) -> tuple[Any, List[Dict[str, Any]]]:
    """
    Load FAISS index and chunks from S3.
    
    Requirements:
    - 9.2: Download FAISS index from S3 to /tmp
    - 9.2: Load chunks JSON from S3
    - 7.4: Load index artifacts from S3
    
    Args:
        index_metadata: Index metadata from DynamoDB
        document_id: Document identifier
        
    Returns:
        Tuple of (index_manager, chunks)
        
    Raises:
        RuntimeError: If index loading fails
    """
    import time
    start_time = time.time()
    
    try:
        s3_client = _get_s3_client()
        
        # Get S3 paths from metadata
        s3_bucket = index_metadata.get('s3_bucket')
        index_path = index_metadata.get('s3_index_path')
        chunks_path = index_metadata.get('s3_chunks_path')
        
        if not s3_bucket or not index_path or not chunks_path:
            raise ValueError("Missing S3 paths in index metadata")
        
        logger.info(f"📥 Loading index from S3: s3://{s3_bucket}/{index_path}")
        
        # Download index to /tmp
        local_index_path = f"/tmp/{document_id}_index.faiss"
        s3_client.download_file(s3_bucket, index_path, local_index_path)
        
        index_size_mb = os.path.getsize(local_index_path) / (1024 * 1024)
        logger.info(f"  ✅ Downloaded index ({index_size_mb:.2f} MB)")
        
        # Download chunks to /tmp
        local_chunks_path = f"/tmp/{document_id}_chunks.json"
        s3_client.download_file(s3_bucket, chunks_path, local_chunks_path)
        
        chunks_size_mb = os.path.getsize(local_chunks_path) / (1024 * 1024)
        logger.info(f"  ✅ Downloaded chunks ({chunks_size_mb:.2f} MB)")
        
        # Load index
        index_manager = _get_index_manager()
        index_manager.load_index(local_index_path)
        
        logger.info(f"  ✅ Loaded {index_manager.index_type} index with {index_manager.num_vectors} vectors")
        
        # Load chunks
        with open(local_chunks_path, 'r', encoding='utf-8') as f:
            chunks_data = json.load(f)
        
        chunks = chunks_data.get('chunks', [])
        logger.info(f"  ✅ Loaded {len(chunks)} chunks")
        
        # Clean up local files
        try:
            os.remove(local_index_path)
            os.remove(local_chunks_path)
        except:
            pass
        
        load_time = time.time() - start_time
        logger.info(f"✅ Index loaded in {load_time:.2f}s")
        
        return index_manager, chunks
        
    except Exception as e:
        error_msg = f"Failed to load index from S3: {str(e)}"
        logger.error(f"❌ {error_msg}")
        raise RuntimeError(error_msg) from e


def _retrieve_relevant_chunks(
    query: str,
    index_manager: Any,
    chunks: List[Dict[str, Any]],
    k: int = None
) -> List[Dict[str, Any]]:
    """
    Retrieve top-k relevant chunks for a query.
    
    Requirements:
    - 9.2: Query index with user's topic or use top chunks
    - 9.2: Retrieve top-k relevant chunks (k=5-10)
    - 9.3: Return chunks with scores
    
    Args:
        query: Query text (topic or keywords)
        index_manager: Loaded FAISS index manager
        chunks: List of chunk dictionaries
        k: Number of chunks to retrieve (default from config)
        
    Returns:
        List of chunk dictionaries with scores
        
    Raises:
        RuntimeError: If retrieval fails
    """
    import time
    start_time = time.time()
    
    try:
        k = k or RAGConfig.TOP_K_CHUNKS
        
        logger.info(f"🔍 Retrieving top-{k} chunks for query: '{query[:100]}...'")
        
        # Generate query embedding
        embedding_generator = _get_embedding_generator()
        query_embedding = embedding_generator.generate_single_embedding(
            text=query,
            normalize=True
        )
        
        # Search index
        distances, indices = index_manager.search(
            query_embedding=query_embedding,
            k=k
        )
        
        # Build results with chunk data
        results = []
        for rank, (idx, score) in enumerate(zip(indices, distances)):
            if idx < 0 or idx >= len(chunks):
                continue
            
            chunk = chunks[idx].copy()
            chunk['score'] = float(score)
            chunk['rank'] = rank
            
            results.append(chunk)
        
        retrieval_time = time.time() - start_time
        avg_score = np.mean(distances) if len(distances) > 0 else 0.0
        
        logger.info(
            f"✅ Retrieved {len(results)} chunks in {retrieval_time*1000:.1f}ms "
            f"(avg score: {avg_score:.3f})"
        )
        
        return results
        
    except Exception as e:
        error_msg = f"Failed to retrieve chunks: {str(e)}"
        logger.error(f"❌ {error_msg}")
        raise RuntimeError(error_msg) from e


def _generate_with_rag(
    request: Any,
    index_metadata: Dict[str, Any],
    generator: Any
) -> tuple[Any, Dict[str, Any]]:
    """
    Generate flashcards using RAG-based retrieval.
    
    Requirements:
    - 9.2: Load index and retrieve relevant chunks
    - 9.3: Build prompt with retrieved chunks as context
    - 9.3: Include chunk references in prompt
    - 9.3: Call Gemini API with enhanced context
    - 9.3: Add source chunk IDs to flashcard responses
    - 11.5: Log retrieval time, generation time separately
    
    Args:
        request: FlashcardGenerationRequest
        index_metadata: Index metadata from DynamoDB
        generator: FlashcardGenerator instance
        
    Returns:
        Tuple of (generation_result, rag_metrics)
        
    Raises:
        RuntimeError: If RAG generation fails
    """
    import time
    
    rag_metrics = {
        'retrieval_time_ms': 0,
        'generation_time_ms': 0,
        'chunks_used': 0,
        'mode': 'rag'
    }
    
    try:
        document_id = request.document_id
        
        # ===== STEP 1: Load Index from S3 =====
        # Requirement 9.2: Download FAISS index from S3 to /tmp, Load chunks JSON from S3
        
        retrieval_start = time.time()
        
        index_manager, chunks = _load_index_from_s3(index_metadata, document_id)
        
        # ===== STEP 2: Retrieve Relevant Chunks =====
        # Requirement 9.2: Query index with user's topic or use top chunks
        # Requirement 9.2: Retrieve top-k relevant chunks (k=5-10)
        
        # Determine query - use topic if provided, otherwise use a generic query
        query = getattr(request, 'topic', None) or "educational content for flashcards"
        
        # Get k from environment or use default
        k = int(os.environ.get('RAG_TOP_K', '10'))
        
        retrieved_chunks = _retrieve_relevant_chunks(
            query=query,
            index_manager=index_manager,
            chunks=chunks,
            k=k
        )
        
        retrieval_time = time.time() - retrieval_start
        rag_metrics['retrieval_time_ms'] = round(retrieval_time * 1000, 2)
        rag_metrics['chunks_used'] = len(retrieved_chunks)
        
        # Requirement 11.2: Log retrieval timing and chunk count
        # Calculate average chunk score
        avg_score = 0
        if retrieved_chunks and np is not None:
            scores = [c.get('score', 0) for c in retrieved_chunks]
            avg_score = round(float(np.mean(scores)), 3)
        
        log_metric("rag_retrieval", {
            "document_id": document_id,
            "query": query[:100],  # Truncate for logging
            "chunks_retrieved": len(retrieved_chunks),
            "retrieval_time_ms": rag_metrics['retrieval_time_ms'],
            "retrieval_time_seconds": round(retrieval_time, 2),
            "index_type": index_metadata.get('index_type', 'unknown'),
            "total_chunks_available": index_metadata.get('chunk_count', 0),
            "avg_chunk_score": avg_score
        })
        
        logger.info(f"📊 RAG Retrieval: {len(retrieved_chunks)} chunks in {retrieval_time:.2f}s")
        
        # ===== STEP 3: Build Enhanced Context =====
        # Requirement 9.3: Build prompt with retrieved chunks as context
        # Requirement 9.3: Include chunk references in prompt
        
        context_text = _build_context_from_chunks(retrieved_chunks)
        
        # ===== STEP 4: Generate Flashcards with Context =====
        # Requirement 9.3: Call Gemini API with enhanced context
        
        generation_start = time.time()
        
        # Create a modified request with context
        # Note: This assumes the FlashcardGenerator can accept context
        # We'll pass the context as additional metadata
        original_generate = generator.generate_flashcards
        
        # Store context for use in generation
        request._rag_context = context_text
        request._rag_chunk_ids = [chunk['chunk_id'] for chunk in retrieved_chunks]
        
        result = original_generate(request)
        
        generation_time = time.time() - generation_start
        rag_metrics['generation_time_ms'] = round(generation_time * 1000, 2)
        
        # Requirement 11.2: Log generation timing
        log_metric("rag_generation", {
            "document_id": document_id,
            "set_id": request.set_id,
            "user_id": request.user_id,
            "num_cards_requested": request.num_cards,
            "num_cards_generated": result.total_cards,
            "generation_time_ms": rag_metrics['generation_time_ms'],
            "generation_time_seconds": round(generation_time, 2),
            "difficulty": request.difficulty,
            "question_types": request.question_types,
            "model_used": result.model_used,
            "chunks_used": len(retrieved_chunks)
        })
        
        logger.info(f"📊 RAG Generation: {result.total_cards} cards in {generation_time:.2f}s")
        
        # ===== STEP 5: Add Source References =====
        # Requirement 9.3: Add source chunk IDs to flashcard responses
        
        # Add chunk references to each flashcard
        if hasattr(result, 'flashcards'):
            for flashcard in result.flashcards:
                if not hasattr(flashcard, 'source_chunks'):
                    flashcard.source_chunks = request._rag_chunk_ids
        
        return result, rag_metrics
        
    except Exception as e:
        error_msg = f"RAG generation failed: {str(e)}"
        logger.error(f"❌ {error_msg}")
        raise RuntimeError(error_msg) from e


def _build_context_from_chunks(chunks: List[Dict[str, Any]]) -> str:
    """
    Build context text from retrieved chunks.
    
    Requirement 9.3: Build prompt with retrieved chunks as context
    Requirement 9.3: Include chunk references in prompt
    
    Args:
        chunks: List of chunk dictionaries with scores
        
    Returns:
        Formatted context text
    """
    context_parts = []
    
    context_parts.append("=== RELEVANT DOCUMENT EXCERPTS ===\n")
    context_parts.append("The following excerpts are the most relevant sections from the document:\n\n")
    
    for chunk in chunks:
        chunk_id = chunk.get('chunk_id', 0)
        text = chunk.get('text', '')
        score = chunk.get('score', 0.0)
        page = chunk.get('page')
        
        # Format chunk with reference
        context_parts.append(f"[Chunk {chunk_id}]")
        if page:
            context_parts.append(f" (Page {page})")
        context_parts.append(f" [Relevance: {score:.2f}]\n")
        context_parts.append(f"{text}\n\n")
    
    context_parts.append("=== END OF EXCERPTS ===\n\n")
    context_parts.append(
        "Please generate flashcards based on the content in these excerpts. "
        "Focus on the key concepts, definitions, and important information presented."
    )
    
    return "".join(context_parts)


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler for flashcard generation

    Event format:
    {
        "set_id": "string",
        "user_id": "string",
        "document_id": "string",  # NEW: For RAG-based generation
        "document_url": "s3://bucket/key",  # Fallback for legacy mode
        "num_cards": 50,
        "difficulty": "MEDIUM",
        "question_types": ["DEFINITION", "COMPREHENSION", ...]
    }

    Returns:
    {
        "statusCode": 200,
        "body": {...}  # FlashcardGenerationResponse JSON
    }
    
    Authentication:
    - Caller supplies user_id directly in the request body
    Requirements: 9.1, 9.4, 9.5, 9.6
    """
    try:
        logger.info(f"📚 Processing flashcard generation: {event.get('set_id')}")

        s3_client = boto3.client('s3')

        try:
            if get_gemini_api_key is not None:
                gemini_api_key = get_gemini_api_key()
                logger.info("🔐 Retrieved Gemini API key from Secrets Manager")
            else:
                gemini_api_key = os.environ.get('GEMINI_API_KEY')
                if not gemini_api_key:
                    raise ValueError("GEMINI_API_KEY not configured")
                logger.warning("⚠️ Using GEMINI_API_KEY from environment variable")
        except ValueError as e:
            logger.error(f"❌ Failed to obtain Gemini API key: {e}")
            raise ValueError(f"Authentication configuration error: {e}")

        redis_client = None
        try:
            redis_host = os.environ.get('REDIS_HOST')
            redis_port = int(os.environ.get('REDIS_PORT', 6379))

            if redis_host:
                redis_client = redis.Redis(
                    host=redis_host,
                    port=redis_port,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    ssl=True,
                    ssl_cert_reqs=None,
                )
                redis_client.ping()
                logger.info("✅ Redis connected successfully")
            else:
                logger.info("ℹ️ Redis not configured - caching disabled")
        except Exception as redis_error:  # pylint: disable=broad-except
            logger.warning(f"⚠️ Redis connection failed: {redis_error}. Continuing without cache")
            redis_client = None

        generator = FlashcardGenerator(
            gemini_api_key=gemini_api_key,
            redis_client=redis_client,
            s3_client=s3_client,
        )

        # Parse request
        request_data = event
        if isinstance(event.get('body'), str):
            # API Gateway format
            request_data = json.loads(event['body'])
        
        # Extract user_id from request body
        user_id = request_data.get('user_id')
        if not user_id:
            raise ValueError("user_id is required in the request body")

        # Ensure request_data carries the final user_id value
        request_data['user_id'] = user_id

        # ===== NEW: Check for RAG-based generation with document_id =====
        # Requirement 9.1: Add document_id parameter to request schema
        # Requirement 9.1: Check DynamoDB for index metadata before processing
        # Requirement 10.2: Return 404 error if index not found
        
        document_id = request_data.get('document_id')
        enable_rag = os.environ.get('ENABLE_RAG', 'false').lower() == 'true'
        
        if document_id and enable_rag:
            # Check if document has been indexed
            logger.info(f"🔍 Checking for indexed document: {document_id}")
            
            index_metadata = _check_document_index(document_id)
            
            if not index_metadata:
                # Index not found - return 404
                logger.warning(f"❌ Index not found for document: {document_id}")
                
                return create_error_response(
                    status_code=404,
                    error_code='INDEX_NOT_FOUND',
                    message='Document has not been indexed yet',
                    details={
                        'document_id': document_id,
                        'reason': 'The document needs to be indexed before flashcards can be generated',
                        'estimated_wait_time_seconds': 30,
                        'retry_after': 30
                    },
                    retry_after=30
                )
            
            # Check if indexing is still in progress
            if index_metadata.get('status') == 'processing':
                logger.warning(f"⏳ Document still being indexed: {document_id}")
                
                return create_error_response(
                    status_code=202,
                    error_code='INDEXING_IN_PROGRESS',
                    message='Document is currently being indexed',
                    details={
                        'document_id': document_id,
                        'status': 'processing',
                        'estimated_wait_time_seconds': 60,
                        'retry_after': 60
                    },
                    retry_after=60
                )
            
            # Check if indexing failed
            if index_metadata.get('status') == 'failed':
                error_message = index_metadata.get('error_message', 'Unknown error')
                logger.error(f"❌ Document indexing failed: {document_id} - {error_message}")
                
                return create_error_response(
                    status_code=422,
                    error_code='INDEXING_FAILED',
                    message='Document indexing failed',
                    details={
                        'document_id': document_id,
                        'reason': error_message,
                        'error_type': index_metadata.get('error_type', 'UNKNOWN')
                    }
                )
            
            # Index found and ready - store metadata for retrieval
            logger.info(f"✅ Found indexed document: {document_id} ({index_metadata.get('chunk_count')} chunks)")
            request_data['_index_metadata'] = index_metadata
        
        # Fallback to legacy mode with document_url
        document_url = request_data.get('document_url')
        if document_url:
            request_data.setdefault('pdf_url', document_url)
            request_data.setdefault('document_id', _derive_document_id(document_url))

        if not request_data.get('question_types'):
            request_data['question_types'] = [
                'DEFINITION',
                'COMPREHENSION',
                'VOCABULARY',
            ]

        request = FlashcardGenerationRequest(**request_data)

        # ===== Generate Flashcards (RAG or Legacy Mode) =====
        # Requirement 9.4: Implement feature flag (ENABLE_RAG environment variable)
        # Requirement 15.1, 15.2: Fall back to legacy full-document processing if index not found
        
        rag_metrics = None
        
        try:
            # Check if we should use RAG mode
            use_rag = (
                enable_rag and 
                RAG_AVAILABLE and 
                '_index_metadata' in request_data and
                request_data['_index_metadata'] is not None
            )
            
            if use_rag:
                # RAG-based generation
                # Requirement 15.1, 15.2, 15.3: RAG mode with feature flag
                logger.info("🚀 Using RAG-based generation")
                logger.info(f"  ├─ Document ID: {request.document_id}")
                logger.info(f"  ├─ Chunks available: {request_data['_index_metadata'].get('chunk_count', 0)}")
                logger.info(f"  └─ Index type: {request_data['_index_metadata'].get('index_type', 'unknown')}")
                
                result, rag_metrics = _generate_with_rag(
                    request=request,
                    index_metadata=request_data['_index_metadata'],
                    generator=generator
                )
            else:
                # Legacy mode - full document processing
                # Requirement 15.1, 15.2, 15.3, 15.4: Fall back to legacy mode
                if not enable_rag:
                    logger.info("📚 Using legacy mode: RAG disabled (ENABLE_RAG=false)")
                elif not RAG_AVAILABLE:
                    logger.warning("⚠️ Using legacy mode: RAG components not available")
                else:
                    logger.info("📚 Using legacy mode: No index found for document")
                
                logger.info("  └─ Processing full document without RAG")
                
                generation_start = time.time()
                result = generator.generate_flashcards(request)
                generation_time = time.time() - generation_start
                
                # Add mode indicator for legacy
                rag_metrics = {
                    'mode': 'legacy',
                    'reason': 'rag_disabled' if not enable_rag else 'no_index',
                    'generation_time_ms': round(generation_time * 1000, 2)
                }
                
                # Requirement 11.2: Log generation timing for legacy mode
                log_metric("legacy_generation", {
                    "set_id": request.set_id,
                    "user_id": request.user_id,
                    "document_id": getattr(request, 'document_id', None),
                    "num_cards_generated": result.total_cards,
                    "generation_time_ms": rag_metrics['generation_time_ms'],
                    "generation_time_seconds": round(generation_time, 2),
                    "reason": rag_metrics['reason'],
                    "model_used": result.model_used
                })
                
        except FlashcardGenerationError as gen_error:
            logger.error(f"Document processing error: {gen_error}")
            return create_error_response(
                status_code=422,
                error_code='DOCUMENT_PROCESSING_ERROR',
                message='Unable to process document',
                details={'reason': str(gen_error)},
            )

        # Save to DynamoDB
        try:
            dynamodb = boto3.resource('dynamodb')
            table_name = os.environ.get('DYNAMODB_FLASHCARD_SETS')
            if table_name:
                flashcard_sets_table = dynamodb.Table(table_name)
                result_payload = result.model_dump()

                flashcard_sets_table.put_item(
                    Item={
                        'set_id': request.set_id,
                        'user_id': request.user_id,
                        'document_id': request.document_id,
                        'document_url': document_url or request.pdf_url,
                        'num_cards': result.total_cards,
                        'difficulty': request.difficulty,
                        'question_types': request.question_types,
                        'model_used': result.model_used,
                        'processing_time': result.processing_time,
                        'flashcards': result_payload['flashcards'],
                        'created_at': getattr(context, 'request_id', 'local'),
                        'status': 'completed'
                    }
                )
                logger.info(f"✅ Saved flashcard set to DynamoDB: {request.set_id}")
            else:
                logger.warning("⚠️ DYNAMODB_FLASHCARD_SETS environment variable not set")
        except Exception as e:
            logger.error(f"❌ Failed to save to DynamoDB: {e}")
            # Don't fail the request if DynamoDB save fails

        # Return response with RAG metrics if available
        # Requirement 11.5: Log retrieval time, generation time separately
        # Requirement 11.5: Log chunk count used
        # Requirement 11.5: Log cache hit/miss for warm starts
        response_body = result.model_dump()
        
        if rag_metrics:
            response_body['rag_metrics'] = rag_metrics
            
            # Structured logging for CloudWatch Insights
            # Requirement 11.2: Log retrieval timing and chunk count
            # Requirement 11.2: Log generation timing
            metrics_data = {
                "set_id": request.set_id,
                "user_id": request.user_id,
                "document_id": getattr(request, 'document_id', None),
                "mode": rag_metrics.get('mode', 'unknown'),
                # Generation results
                "num_cards_requested": request.num_cards,
                "num_cards_generated": result.total_cards,
                "difficulty": request.difficulty,
                "question_types": request.question_types,
                "model_used": result.model_used,
                # Timing metrics
                "total_processing_time_seconds": result.processing_time,
                "retrieval_time_ms": rag_metrics.get('retrieval_time_ms', 0),
                "generation_time_ms": rag_metrics.get('generation_time_ms', 0),
                # RAG-specific metrics
                "chunks_used": rag_metrics.get('chunks_used', 0),
                "rag_enabled": rag_metrics.get('mode') == 'rag',
                # Performance metrics
                "cards_per_second": round(result.total_cards / result.processing_time, 2) if result.processing_time > 0 else 0
            }
            
            log_metric("flashcard_generation_complete", metrics_data)
            logger.info(f"📊 Performance Metrics: {json.dumps(metrics_data)}")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response_body)
        }

    except ValueError as e:
        logger.error(f"Validation error: {e}")
        error_message = str(e)
        
        # Determine specific validation error details
        details = {}
        if 'set_id' in error_message.lower():
            details['field'] = 'set_id'
            details['reason'] = 'Must be a valid UUID'
        elif 'user_id' in error_message.lower():
            details['field'] = 'user_id'
            details['reason'] = 'Must be a non-empty string'
        elif 'pdf_url' in error_message.lower() or 'document_url' in error_message.lower():
            details['field'] = 'pdf_url'
            details['reason'] = 'Must be a valid S3 URL (s3://bucket/key)'
        elif 'num_cards' in error_message.lower():
            details['field'] = 'num_cards'
            details['reason'] = 'Must be between 5 and 50'
        elif 'difficulty' in error_message.lower():
            details['field'] = 'difficulty'
            details['reason'] = 'Must be EASY, MEDIUM, or HARD'
        
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
        logger.error(f"Error generating flashcards: {e}", exc_info=True)
        
        # Check for rate limiting errors (from API Gateway or upstream services)
        error_str = str(e).lower()
        if 'throttl' in error_str or 'rate limit' in error_str or '429' in error_str:
            return create_error_response(
                status_code=429,
                error_code='RATE_LIMIT_EXCEEDED',
                message='Rate limit exceeded. Please try again later.',
                details={
                    'limit': '10 requests per second',
                    'endpoint': '/api/v1/flashcards/generate'
                },
                retry_after=3
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
                message='Unable to access document file',
                details={
                    'reason': 'Document file not found or access denied',
                    'contact': 'support@ieltslearning.com'
                }
            )
        
        # Check for document processing errors
        if 'pdf' in error_str or 'document' in error_str or 'parse' in error_str:
            return create_error_response(
                status_code=422,
                error_code='DOCUMENT_PROCESSING_ERROR',
                message='Unable to process document',
                details={
                    'reason': 'Document format not supported or file is corrupted',
                    'supported_formats': ['PDF', 'DOCX', 'TXT']
                }
            )
        
        # Generic internal server error
        return create_error_response(
            status_code=500,
            error_code='INTERNAL_SERVER_ERROR',
            message='An unexpected error occurred while generating flashcards',
            details={
                'type': type(e).__name__,
                'contact': 'support@ieltslearning.com'
            }
        )


# For local testing
if __name__ == '__main__':
    test_event = {
        'set_id': 'set-123',
        'user_id': 'user-456',
        'document_url': 's3://test-bucket/test.pdf',
        'num_cards': 10,
        'difficulty': 'MEDIUM',
        'question_types': ['DEFINITION', 'COMPREHENSION']
    }

    print(lambda_handler(test_event, None))
