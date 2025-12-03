"""RAG Configuration."""

import os
from dataclasses import dataclass


@dataclass
class RAGConfig:
    """Configuration for RAG system."""
    chunk_size: int = 500
    chunk_overlap: int = 100
    embedding_model: str = "models/embedding-001"
    embedding_dimension: int = 768
    top_k: int = 5
    
    @classmethod
    def from_env(cls):
        return cls(
            chunk_size=int(os.getenv("RAG_CHUNK_SIZE", 500)),
            chunk_overlap=int(os.getenv("RAG_CHUNK_OVERLAP", 100)),
            top_k=int(os.getenv("RAG_TOP_K", 5))
        )
