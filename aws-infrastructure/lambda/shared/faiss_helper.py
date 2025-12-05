"""
FAISS Helper Module
Provides vector indexing and similarity search using FAISS
"""

import io
import pickle
import logging
from typing import List, Dict, Any, Optional

import numpy as np  # type: ignore
import requests  # type: ignore

from secrets_helper import get_gemini_api_key

logger = logging.getLogger()

try:
    import faiss  # type: ignore
except ImportError as e:
    logger.error(f"Failed to import FAISS dependencies: {e}")
    raise


DEFAULT_EMBED_MODEL = "models/text-embedding-004"
EMBED_ENDPOINT_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:embedContent"


class GeminiEmbedder:
    """Generate embeddings using Google Gemini API."""

    def __init__(self, model_name: str = DEFAULT_EMBED_MODEL, truncate_chars: int = 6000):
        self.model_name = model_name
        self.truncate_chars = truncate_chars
        self._embedding_dimension: Optional[int] = None
        self._api_key: Optional[str] = None

    @property
    def api_key(self) -> str:
        if not self._api_key:
            api_key = get_gemini_api_key()
            if not api_key:
                raise ValueError("Gemini API key not available")
            self._api_key = api_key
            logger.info(f"✅ Gemini API key loaded for model: {self.model_name}")
        return self._api_key

    def embed_texts(self, texts: List[str]) -> np.ndarray:
        embeddings = []
        for text in texts:
            content = text.strip() or " "

            if len(content) > self.truncate_chars:
                content = content[: self.truncate_chars]

            model_id = self.model_name if self.model_name.startswith("models/") else f"models/{self.model_name}"
            payload = {
                "model": self.model_name if self.model_name.startswith("models/") else f"models/{self.model_name}",
                "content": {
                    "parts": [{"text": content}]
                }
            }

            try:
                response = requests.post(
                    EMBED_ENDPOINT_TEMPLATE.format(model=model_id),
                    params={"key": self.api_key},
                    json=payload,
                    timeout=30,
                )
                response.raise_for_status()
                data = response.json()
                vector = data.get("embedding", {}).get("values", [])
            except Exception as exc:
                logger.error(f"❌ Gemini embedding call failed: {exc}")
                raise

            if not vector:
                logger.warning("⚠️ Empty embedding returned, substituting zeros")
                dimension = self._embedding_dimension or 768
                vector = [0.0] * dimension

            embeddings.append(vector)

        ndarray = np.array(embeddings, dtype="float32")
        if ndarray.ndim == 1:
            ndarray = ndarray.reshape(-1, 1)

        if self._embedding_dimension is None:
            self._embedding_dimension = ndarray.shape[1]

        logger.info(f"✅ Generated embeddings via Gemini: shape={ndarray.shape}")
        return ndarray


class FAISSIndexer:
    """FAISS vector indexer powered by Gemini embeddings."""

    def __init__(self, model_name: str = DEFAULT_EMBED_MODEL):
        self.embedding_model = model_name
        self.embedder = GeminiEmbedder(model_name=model_name)
        self.index: Optional[faiss.Index] = None
        self.chunks: List[str] = []
        self.metadata: Dict[str, Any] = {}

        logger.info(f"🤖 Initializing FAISS indexer with Gemini model: {model_name}")

    def create_embeddings(self, texts: List[str]) -> np.ndarray:
        logger.info(f"🔢 Generating embeddings for {len(texts)} texts via Gemini...")
        embeddings = self.embedder.embed_texts(texts)
        if embeddings.dtype != np.float32:
            embeddings = embeddings.astype("float32")
        return embeddings

    def create_index(self, chunks: List[str], document_id: str) -> Dict[str, Any]:
        logger.info(f"📊 Creating FAISS index for document: {document_id}")
        logger.info(f"  ├─ Chunks: {len(chunks)}")

        embeddings = self.create_embeddings(chunks)
        dimension = embeddings.shape[1]

        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(embeddings)

        self.chunks = chunks
        self.metadata = {
            "document_id": document_id,
            "num_chunks": len(chunks),
            "embedding_dimension": dimension,
            "model_name": self.embedding_model,
            "index_type": "IndexFlatL2",
            "provider": "gemini"
        }

        logger.info(f"✅ Index created: {self.index.ntotal} vectors, {dimension} dimensions")
        return self.metadata

    def search(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        if self.index is None or self.index.ntotal == 0:
            raise ValueError("Index not created or empty. Call create_index() first.")

        logger.info(f"🔍 Searching for: '{query[:50]}...' (k={k})")
        query_embedding = self.create_embeddings([query])

        distances, indices = self.index.search(query_embedding, min(k, self.index.ntotal))

        results: List[Dict[str, Any]] = []
        for rank, (distance, idx) in enumerate(zip(distances[0], indices[0]), start=1):
            if idx != -1:
                results.append({
                    "rank": rank,
                    "chunk": self.chunks[idx],
                    "distance": float(distance),
                    "similarity": float(1 / (1 + distance)),
                    "chunk_index": int(idx)
                })

        logger.info(f"✅ Found {len(results)} results")
        return results

    def save_to_s3(self, s3_client, bucket: str, document_id: str) -> Dict[str, str]:
        if self.index is None:
            raise ValueError("Index not created. Call create_index() first.")

        logger.info(f"💾 Saving index to S3: s3://{bucket}/faiss-indices/{document_id}/")

        index_bytes = io.BytesIO()
        faiss.write_index(self.index, faiss.BufferWriter(index_bytes))
        index_bytes.seek(0)

        chunks_data = {
            "chunks": self.chunks,
            "metadata": self.metadata
        }
        chunks_bytes = pickle.dumps(chunks_data)

        index_key = f"faiss-indices/{document_id}/index.faiss"
        chunks_key = f"faiss-indices/{document_id}/chunks.pkl"

        s3_client.put_object(
            Bucket=bucket,
            Key=index_key,
            Body=index_bytes.getvalue(),
            ContentType="application/octet-stream"
        )

        s3_client.put_object(
            Bucket=bucket,
            Key=chunks_key,
            Body=chunks_bytes,
            ContentType="application/octet-stream"
        )

        index_size_mb = len(index_bytes.getvalue()) / (1024 * 1024)
        chunks_size_mb = len(chunks_bytes) / (1024 * 1024)

        logger.info("✅ Saved to S3:")
        logger.info(f"  ├─ Index: {index_key} ({index_size_mb:.2f} MB)")
        logger.info(f"  └─ Chunks: {chunks_key} ({chunks_size_mb:.2f} MB)")

        return {
            "index_key": index_key,
            "chunks_key": chunks_key,
            "index_size_mb": index_size_mb,
            "chunks_size_mb": chunks_size_mb
        }

    def load_from_s3(self, s3_client, bucket: str, document_id: str):
        logger.info(f"📥 Loading index from S3: s3://{bucket}/faiss-indices/{document_id}/")

        index_key = f"faiss-indices/{document_id}/index.faiss"
        chunks_key = f"faiss-indices/{document_id}/chunks.pkl"

        index_obj = s3_client.get_object(Bucket=bucket, Key=index_key)
        chunks_obj = s3_client.get_object(Bucket=bucket, Key=chunks_key)

        index_bytes = index_obj['Body'].read()
        buffer_reader = faiss.BufferReader(index_bytes)
        self.index = faiss.read_index(buffer_reader)

        chunks_data = pickle.loads(chunks_obj['Body'].read())
        self.chunks = chunks_data['chunks']
        self.metadata = chunks_data['metadata']

        logger.info(f"✅ Loaded index: {self.index.ntotal} vectors, {len(self.chunks)} chunks")


def chunk_text(text: str, chunk_size: int = 512, overlap: int = 50) -> List[str]:
    """
    Split text into overlapping chunks.
    
    Args:
        text: Input text to chunk
        chunk_size: Number of words per chunk
        overlap: Number of words to overlap between chunks
        
    Returns:
        List of text chunks
    """
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk = ' '.join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
    
    logger.info(f"📄 Text chunked: {len(words)} words → {len(chunks)} chunks")
    return chunks


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract text from PDF bytes.
    
    Args:
        pdf_bytes: PDF file as bytes
        
    Returns:
        Extracted text
    """
    logger.info("📖 Extracting text from PDF...")
    import PyPDF2  # type: ignore
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
    text = ""
    for i, page in enumerate(pdf_reader.pages):
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
        if (i + 1) % 10 == 0:
            logger.info(f"  ├─ Processed {i + 1}/{len(pdf_reader.pages)} pages")
    logger.info(f"✅ Extracted {len(text)} characters from {len(pdf_reader.pages)} pages")
    return text


# Global instance for Lambda warm starts (reuses loaded model)
_global_indexer: Optional[FAISSIndexer] = None


def get_indexer(model_name: str = DEFAULT_EMBED_MODEL) -> FAISSIndexer:
    """
    Get or create global FAISS indexer instance.
    
    Reuses the same instance across Lambda invocations (warm starts)
    to avoid reloading the model.
    
    Args:
        model_name: Embedding model name
        
    Returns:
        FAISSIndexer instance
    """
    global _global_indexer
    
    if _global_indexer is None or _global_indexer.embedding_model != model_name:
        _global_indexer = FAISSIndexer(model_name=model_name)
    
    return _global_indexer

