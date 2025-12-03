"""
Lightweight RAG Pipeline for AWS Lambda.

Minimal dependencies:
- PyMuPDF for PDF processing
- Gemini API for embeddings (cloud-based)
- InMemoryVectorStore for retrieval

Target: <50MB compressed.
"""

import os
import time
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
from dataclasses import dataclass

import fitz  # PyMuPDF

logger = logging.getLogger(__name__)


@dataclass
class RAGConfig:
    chunk_size: int = 500
    chunk_overlap: int = 100
    embedding_model: str = "models/embedding-001"
    top_k: int = 5


class LangChainRAG:
    """Lightweight RAG system optimized for Lambda."""
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        chunk_size: int = 500,
        chunk_overlap: int = 100,
        embedding_model: str = "models/embedding-001"
    ):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY required")
        
        self.config = RAGConfig(chunk_size, chunk_overlap, embedding_model)
        self._embeddings = None
        self._vector_store = None
        self._chunks = []
        
        logger.info(f"LangChainRAG initialized with {embedding_model}")
    
    @property
    def embeddings(self):
        if self._embeddings is None:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            self._embeddings = GoogleGenerativeAIEmbeddings(
                model=self.config.embedding_model,
                google_api_key=self.api_key
            )
        return self._embeddings
    
    @property
    def vector_store(self):
        return self._vector_store
    
    @vector_store.setter
    def vector_store(self, value):
        self._vector_store = value
    
    def _load_pdf(self, pdf_path: str) -> List[Dict]:
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
        from text_chunker import chunk_text
        return chunk_text(text, self.config.chunk_size, self.config.chunk_overlap)
    
    def index_document(self, pdf_path: str, document_id: Optional[str] = None) -> Dict[str, Any]:
        from langchain_core.vectorstores import InMemoryVectorStore
        from langchain_core.documents import Document
        
        start_time = time.time()
        pages = self._load_pdf(pdf_path)
        
        all_chunks = []
        for page_data in pages:
            chunks = self._chunk_text(page_data['content'])
            for chunk in chunks:
                all_chunks.append(Document(
                    page_content=chunk,
                    metadata={**page_data['metadata'], 'document_id': document_id or Path(pdf_path).stem}
                ))
        
        self._chunks = all_chunks
        self.vector_store = InMemoryVectorStore.from_documents(all_chunks, self.embeddings)
        
        return {
            'document_id': document_id or Path(pdf_path).stem,
            'page_count': len(pages),
            'chunk_count': len(all_chunks),
            'processing_time_seconds': time.time() - start_time
        }
    
    def retrieve(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        if not self.vector_store:
            raise ValueError("No document indexed.")
        
        retriever = self.vector_store.as_retriever(search_kwargs={"k": top_k})
        docs = retriever.invoke(query)
        
        return [{'rank': i+1, 'text': d.page_content, 'metadata': d.metadata, 'page': d.metadata.get('page')} for i, d in enumerate(docs)]
    
    def similarity_search_with_score(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        if not self.vector_store:
            raise ValueError("No document indexed.")
        
        results = self.vector_store.similarity_search_with_score(query, k=top_k)
        return [{'rank': i+1, 'text': d.page_content, 'score': float(s), 'metadata': d.metadata} for i, (d, s) in enumerate(results)]
    
    def get_chunks(self) -> List[str]:
        return [c.page_content for c in self._chunks]
    
    def get_stats(self) -> Dict[str, Any]:
        return {'loaded': self.vector_store is not None, 'chunk_count': len(self._chunks)}


def create_rag_handler(api_key: Optional[str] = None) -> LangChainRAG:
    return LangChainRAG(api_key=api_key)
