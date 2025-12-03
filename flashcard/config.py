"""Configuration module for the Local PDF RAG Pipeline."""

import os
from dataclasses import dataclass
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

@dataclass
class RAGConfig:
    """Configuration class for the Local PDF RAG Pipeline."""
    
    # API Configuration
    gemini_api_key: str = os.getenv("GOOGLE_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")
    
    # Embedding Configuration
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    
    # Processing Configuration
    chunk_size: int = int(os.getenv("CHUNK_SIZE", "1024"))
    chunk_overlap: int = int(os.getenv("CHUNK_OVERLAP", "128"))
    max_chunk_chars: int = int(os.getenv("MAX_CHUNK_CHARS", "600"))  # Further reduced to prevent token overflow
    
    # Retrieval Configuration
    top_k_chunks: int = int(os.getenv("TOP_K_CHUNKS", "5"))
    
    # Generation Configuration
    temperature: float = float(os.getenv("TEMPERATURE", "0.2"))
    max_output_tokens: int = int(os.getenv("MAX_OUTPUT_TOKENS", "2000"))  # Further increased to prevent truncation
    
    # Output Configuration
    output_dir: str = os.getenv("OUTPUT_DIR", "output")
    
    def __post_init__(self):
        """Validate configuration after initialization."""
        # Ensure output directory exists
        os.makedirs(self.output_dir, exist_ok=True)

# Global configuration instance
config = RAGConfig()