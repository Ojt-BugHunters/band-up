"""RAG System for Flashcard Generation - Lambda optimized."""

from .rag_pipeline import LangChainRAG, create_rag_handler
from .text_chunker import chunk_text, chunk_text_with_metadata
from .config import RAGConfig

__version__ = "2.0.0"
__all__ = ["LangChainRAG", "create_rag_handler", "chunk_text", "RAGConfig"]
