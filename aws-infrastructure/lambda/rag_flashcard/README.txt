RAG Flashcard Generator Lambda
==============================

Lightweight RAG-based flashcard generation using:
- PyMuPDF for PDF processing
- Gemini API for embeddings + generation
- InMemoryVectorStore (no FAISS)

DEPLOYMENT OPTIONS:
-------------------
Option 1: Lambda Layer (recommended)
  - Run: powershell -File build-layer.ps1
  - Upload rag-layer.zip as Lambda Layer
  - Upload rag-function.zip as Lambda Function
  - Attach layer to function

Option 2: Container Image
  - Use Dockerfile for container deployment
  - No size limits

ENVIRONMENT VARIABLES:
----------------------
GEMINI_API_KEY      - Required
RAG_CHUNK_SIZE      - Default: 500
RAG_CHUNK_OVERLAP   - Default: 100
GEMINI_MODEL        - Default: gemini-2.0-flash
GEMINI_TEMPERATURE  - Default: 0.3

API REQUEST:
------------
{
  "s3_bucket": "bucket-name",
  "s3_key": "path/to/document.pdf",
  "query": "key concepts",
  "num_cards": 10,
  "difficulty": "MEDIUM",
  "top_k": 5,
  "user_id": "user123",
  "set_id": "set456"
}

RESPONSE:
---------
{
  "status": "success",
  "flashcards": [...],
  "metrics": {
    "index_time_ms": 1200,
    "retrieve_time_ms": 150,
    "generate_time_ms": 2000
  }
}
