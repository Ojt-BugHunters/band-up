"""
RAG Pipeline for AWS Lambda using Amazon Titan Text Embeddings V2.
Uses Bedrock for embeddings (cheap) + Gemini for flashcard generation.
Optimized with parallel embedding calls and hybrid query generation.
"""

import os
import json
import time
import math
import re
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
from dataclasses import dataclass
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed

import boto3
import fitz  # PyMuPDF

logger = logging.getLogger(__name__)

# Constants
TITAN_MODEL_ID = "amazon.titan-embed-text-v2:0"
MAX_PARALLEL_EMBEDDINGS = 10  # Concurrent Bedrock calls


@dataclass
class RAGConfig:
    chunk_size: int = 3000  # Larger chunks = fewer API calls (was 2000)
    chunk_overlap: int = 300
    embedding_model: str = TITAN_MODEL_ID
    top_k: int = 5


class TitanEmbeddings:
    """Amazon Titan Text Embeddings V2 via Bedrock with parallel processing."""
    
    def __init__(self, model_id: str = TITAN_MODEL_ID, region: str = None):
        self.model_id = model_id
        self.region = region or os.environ.get('BEDROCK_REGION', 'us-east-1')
        self._client = None
        logger.info("TitanEmbeddings initialized: %s in %s", model_id, self.region)
    
    @property
    def client(self):
        if self._client is None:
            self._client = boto3.client('bedrock-runtime', region_name=self.region)
        return self._client
    
    def embed(self, text: str) -> List[float]:
        """Get embedding for single text using Titan V2."""
        body = json.dumps({
            "inputText": text[:8000],
            "dimensions": 512,
            "normalize": True
        })
        
        response = self.client.invoke_model(
            modelId=self.model_id,
            body=body,
            contentType="application/json",
            accept="application/json"
        )
        
        result = json.loads(response['body'].read())
        return result['embedding']
    
    def _embed_single(self, idx_text: tuple) -> tuple:
        """Embed single text, returns (index, embedding) for ordering."""
        idx, text = idx_text
        embedding = self.embed(text)
        return (idx, embedding)
    
    def embed_batch_parallel(self, texts: List[str], max_workers: int = MAX_PARALLEL_EMBEDDINGS) -> List[List[float]]:
        """Embed multiple texts in PARALLEL using ThreadPoolExecutor."""
        if not texts:
            return []
        
        embeddings = [None] * len(texts)
        indexed_texts = list(enumerate(texts))
        
        logger.info(f"Embedding {len(texts)} chunks with {max_workers} parallel workers...")
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {executor.submit(self._embed_single, item): item[0] for item in indexed_texts}
            
            completed = 0
            for future in as_completed(futures):
                idx, embedding = future.result()
                embeddings[idx] = embedding
                completed += 1
                if completed % 20 == 0:
                    logger.info(f"Embedded {completed}/{len(texts)} chunks")
        
        elapsed = time.time() - start_time
        logger.info(f"Parallel embedding completed: {len(texts)} chunks in {elapsed:.2f}s ({elapsed/len(texts)*1000:.0f}ms/chunk)")
        return embeddings


class LangChainRAG:
    """
    RAG system using Amazon Titan Embeddings V2 + Gemini for generation.
    Optimized with parallel embeddings and hybrid query generation.
    
    Cost-effective:
    - Titan V2: ~$0.00002 per 1K tokens (very cheap)
    - Gemini: Only called once for final generation
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        chunk_size: int = 3000,  # Larger default for fewer chunks
        chunk_overlap: int = 300,
        embedding_model: str = TITAN_MODEL_ID
    ):
        self.api_key = api_key
        self.config = RAGConfig(chunk_size, chunk_overlap, embedding_model)
        self._chunks: List[Dict] = []
        self._embeddings: List[List[float]] = []
        self._titan = TitanEmbeddings(model_id=embedding_model)
        self._keywords: List[str] = []  # Extracted keywords for query generation
        
        logger.info("LangChainRAG initialized with parallel Titan V2 embeddings")
    
    @property
    def vector_store(self):
        """Compatibility property."""
        return self._chunks if self._chunks else None
    
    @vector_store.setter
    def vector_store(self, value):
        """Compatibility setter - resets chunks."""
        if value is None:
            self._chunks = []
            self._embeddings = []
    
    def _load_pdf(self, pdf_path: str) -> List[Dict]:
        """Load PDF and extract text from each page."""
        documents = []
        with fitz.open(pdf_path) as doc:
            for page_num, page in enumerate(doc):
                text = page.get_text()
                if text.strip():
                    documents.append({
                        'content': text,
                        'metadata': {"page": page_num + 1, "source": pdf_path}
                    })
        logger.info(f"Loaded {len(documents)} pages from {pdf_path}")
        return documents
    
    def _chunk_text(self, text: str) -> List[str]:
        """Split text into overlapping chunks."""
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = start + self.config.chunk_size
            chunk = text[start:end]
            
            # Try to break at sentence boundary
            if end < text_len:
                last_period = chunk.rfind('.')
                last_newline = chunk.rfind('\n')
                break_point = max(last_period, last_newline)
                if break_point > self.config.chunk_size // 2:
                    chunk = chunk[:break_point + 1]
                    end = start + break_point + 1
            
            if chunk.strip():
                chunks.append(chunk.strip())
            
            start = end - self.config.chunk_overlap
            if start >= text_len:
                break
        
        return chunks
    
    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        dot_product = sum(x * y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x * x for x in a))
        norm_b = math.sqrt(sum(x * x for x in b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot_product / (norm_a * norm_b)
    
    def index_document(self, pdf_path: str, document_id: Optional[str] = None) -> Dict[str, Any]:
        """Index a PDF document using Titan V2 embeddings."""
        start_time = time.time()
        pages = self._load_pdf(pdf_path)
        
        self._chunks = []
        self._embeddings = []
        doc_id = document_id or Path(pdf_path).stem
        
        # Process each page into chunks
        for page_data in pages:
            chunks = self._chunk_text(page_data['content'])
            for chunk in chunks:
                self._chunks.append({
                    'text': chunk,
                    'metadata': {**page_data['metadata'], 'document_id': doc_id},
                    'page': page_data['metadata']['page']
                })
        
        # Extract keywords for hybrid query generation
        all_text = " ".join([c['text'] for c in self._chunks])
        self._keywords = self._extract_keywords(all_text, top_n=20)
        logger.info(f"Extracted keywords: {self._keywords[:10]}")
        
        # Generate embeddings with Titan V2 (PARALLEL)
        logger.info(f"Generating Titan V2 embeddings for {len(self._chunks)} chunks...")
        texts = [c['text'] for c in self._chunks]
        self._embeddings = self._titan.embed_batch_parallel(texts)
        
        processing_time = time.time() - start_time
        logger.info(f"Indexed {len(self._chunks)} chunks in {processing_time:.2f}s")
        
        return {
            'document_id': doc_id,
            'page_count': len(pages),
            'chunk_count': len(self._chunks),
            'processing_time_seconds': processing_time,
            'keywords': self._keywords[:10]
        }
    
    def retrieve(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Retrieve top-k most relevant chunks for a query."""
        if not self._chunks:
            raise ValueError("No document indexed.")
        return self.similarity_search_with_score(query, top_k)
    
    def similarity_search_with_score(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search for similar chunks using Titan V2 embeddings."""
        if not self._chunks:
            raise ValueError("No document indexed.")
        
        # Get query embedding
        query_embedding = self._titan.embed(query)
        
        # Calculate similarities
        similarities = []
        for i, embedding in enumerate(self._embeddings):
            score = self._cosine_similarity(query_embedding, embedding)
            similarities.append((i, score))
        
        # Sort by similarity (descending)
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # Return top-k results
        results = []
        for rank, (idx, score) in enumerate(similarities[:top_k]):
            chunk = self._chunks[idx]
            results.append({
                'rank': rank + 1,
                'text': chunk['text'],
                'score': score,
                'metadata': chunk['metadata'],
                'page': chunk['page']
            })
        
        return results
    
    def get_chunks(self) -> List[str]:
        """Get all chunk texts."""
        return [c['text'] for c in self._chunks]
    
    def _extract_keywords(self, text: str, top_n: int = 20) -> List[str]:
        """Extract keywords using frequency analysis (no LLM needed)."""
        stopwords = {
            'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'to', 'of',
            'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through',
            'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither',
            'not', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'also',
            'this', 'that', 'these', 'those', 'it', 'its', 'which', 'who', 'whom',
            'what', 'where', 'when', 'why', 'how', 'all', 'each', 'every', 'any',
            'some', 'such', 'no', 'more', 'most', 'other', 'into', 'over', 'after',
            'before', 'between', 'under', 'again', 'further', 'then', 'once', 'here',
            'there', 'about', 'above', 'below', 'during', 'while', 'because', 'if',
            'use', 'used', 'using', 'based', 'include', 'including', 'within', 'without'
        }
        
        # Extract words (4+ chars, alphabetic)
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        word_counts = Counter(w for w in words if w not in stopwords)
        
        return [word for word, _ in word_counts.most_common(top_n)]
    
    def generate_smart_queries(self, num_queries: int = 5) -> List[str]:
        """Generate document-specific queries using extracted keywords."""
        if not self._keywords:
            return ["key concepts and important information"]
        
        queries = []
        kw = self._keywords
        
        # Build diverse queries from keywords
        if len(kw) >= 2:
            queries.append(f"definition and explanation of {kw[0]} and {kw[1]}")
        if len(kw) >= 4:
            queries.append(f"key concepts about {kw[2]} {kw[3]}")
        if len(kw) >= 6:
            queries.append(f"important information regarding {kw[4]} {kw[5]}")
        if len(kw) >= 8:
            queries.append(f"examples and applications of {kw[6]} {kw[7]}")
        if len(kw) >= 10:
            queries.append(f"relationship between {kw[8]} and {kw[9]}")
        
        # Pad with generic queries if needed
        generic = [
            "main concepts and theories",
            "important facts and definitions",
            "key processes and procedures"
        ]
        while len(queries) < num_queries and generic:
            queries.append(generic.pop(0))
        
        return queries[:num_queries]
    
    def retrieve_with_smart_queries(self, top_k_per_query: int = 3) -> List[Dict[str, Any]]:
        """Retrieve chunks using multiple smart queries for better coverage."""
        queries = self.generate_smart_queries(num_queries=5)
        logger.info(f"Using smart queries: {queries}")
        
        seen_indices = set()
        all_results = []
        
        for query in queries:
            results = self.similarity_search_with_score(query, top_k=top_k_per_query)
            for r in results:
                # Deduplicate by chunk index
                chunk_idx = next(
                    (i for i, c in enumerate(self._chunks) if c['text'] == r['text']),
                    None
                )
                if chunk_idx is not None and chunk_idx not in seen_indices:
                    seen_indices.add(chunk_idx)
                    all_results.append(r)
        
        # Sort by score and return
        all_results.sort(key=lambda x: x['score'], reverse=True)
        logger.info(f"Retrieved {len(all_results)} unique chunks from {len(queries)} queries")
        return all_results
    
    def get_representative_chunks(self, num_chunks: int = 10) -> List[Dict[str, Any]]:
        """Get evenly distributed chunks across document (fallback for small docs)."""
        if len(self._chunks) <= num_chunks:
            return [{'text': c['text'], 'page': c['page'], 'score': 1.0, 'rank': i+1} 
                    for i, c in enumerate(self._chunks)]
        
        step = len(self._chunks) // num_chunks
        indices = [i * step for i in range(num_chunks)]
        
        return [{'text': self._chunks[i]['text'], 'page': self._chunks[i]['page'], 
                 'score': 1.0, 'rank': idx+1} 
                for idx, i in enumerate(indices)]
