"""PDF processing module for the Local PDF RAG Pipeline."""

import re
import logging
from typing import List, Tuple
from pathlib import Path

import fitz  # PyMuPDF
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss

from config import config

logger = logging.getLogger(__name__)

class PDFProcessor:
    """Handles PDF text extraction, preprocessing, chunking, and vector indexing."""
    
    def __init__(self):
        """Initialize the PDF processor."""
        self.embedder = SentenceTransformer(config.embedding_model)
        self.chunks: List[str] = []
        self.chunk_embeddings: np.ndarray = None
        self.faiss_index: faiss.Index = None
        self.document_metadata: dict = {}
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text from PDF using PyMuPDF.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Extracted text content
        """
        try:
            doc = fitz.open(pdf_path)
            text = ""
            page_count = 0
            
            for page_num, page in enumerate(doc):
                page_text = page.get_text()
                text += page_text + "\n"
                page_count += 1
            
            doc.close()
            
            # Store document metadata
            self.document_metadata = {
                "source_file": pdf_path,
                "page_count": page_count,
                "total_characters": len(text)
            }
            
            logger.info(f"Extracted text from {pdf_path}: {page_count} pages, {len(text)} characters")
            return text
            
        except Exception as e:
            logger.error(f"Error extracting PDF text: {e}")
            raise
    
    def preprocess_text(self, text: str) -> str:
        """
        Preprocess the extracted text.
        
        Args:
            text: Raw text from PDF
            
        Returns:
            Cleaned and normalized text
        """
        # Replace carriage returns with space
        text = text.replace("\r", " ")
        
        # Replace newlines with space (basic approach)
        text = text.replace("\n", " ")
        
        # Collapse multiple spaces/newlines into one space
        text = re.sub(r"\s+", " ", text)
        
        # Remove excessive whitespace
        text = text.strip()
        
        logger.info(f"Preprocessed text: {len(text)} characters")
        return text
    
    def chunk_text(self, text: str, chunk_size: int = None, chunk_overlap: int = None) -> List[str]:
        """
        Chunk the text into sections with overlap.
        
        Args:
            text: Preprocessed text
            chunk_size: Size of each chunk in characters
            chunk_overlap: Overlap between chunks in characters
            
        Returns:
            List of text chunks
        """
        if chunk_size is None:
            chunk_size = config.chunk_size
        if chunk_overlap is None:
            chunk_overlap = config.chunk_overlap
        
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = min(start + chunk_size, text_length)
            chunk = text[start:end].strip()
            
            # Only add non-empty chunks
            if chunk:
                chunks.append(chunk)
            
            # Move start by chunk_size minus overlap
            start += chunk_size - chunk_overlap
        
        self.chunks = chunks
        logger.info(f"Created {len(chunks)} chunks from text")
        return chunks
    
    def generate_embeddings(self, chunks: List[str] = None) -> np.ndarray:
        """
        Generate embeddings for text chunks.
        
        Args:
            chunks: List of text chunks (uses self.chunks if None)
            
        Returns:
            Array of embeddings
        """
        if chunks is None:
            chunks = self.chunks
        
        if not chunks:
            raise ValueError("No chunks available for embedding")
        
        logger.info(f"Generating embeddings for {len(chunks)} chunks...")
        
        # Generate embeddings using sentence-transformers
        chunk_embeddings = self.embedder.encode(chunks)
        
        # Convert to float32 numpy array
        chunk_embeddings = np.array(chunk_embeddings, dtype='float32')
        
        # Normalize embeddings for cosine similarity
        norms = np.linalg.norm(chunk_embeddings, axis=1, keepdims=True)
        chunk_embeddings = chunk_embeddings / norms
        
        self.chunk_embeddings = chunk_embeddings
        logger.info(f"Generated embeddings: shape {chunk_embeddings.shape}")
        
        return chunk_embeddings
    
    def build_vector_index(self, embeddings: np.ndarray = None) -> faiss.Index:
        """
        Build FAISS vector index for efficient retrieval.
        
        Args:
            embeddings: Embeddings array (uses self.chunk_embeddings if None)
            
        Returns:
            FAISS index
        """
        if embeddings is None:
            embeddings = self.chunk_embeddings
        
        if embeddings is None:
            raise ValueError("No embeddings available for indexing")
        
        # Get embedding dimension
        d = embeddings.shape[1]
        
        # Create FAISS index (L2 distance with normalized vectors = cosine similarity)
        index = faiss.IndexFlatL2(d)
        
        # Add embeddings to index
        index.add(embeddings)
        
        self.faiss_index = index
        logger.info(f"Built FAISS index with {index.ntotal} vectors")
        
        return index
    
    def retrieve_chunks(self, query: str, k: int = None) -> List[str]:
        """
        Retrieve relevant chunks for a query.
        
        Args:
            query: Search query
            k: Number of top chunks to retrieve
            
        Returns:
            List of relevant chunk texts
        """
        if k is None:
            k = config.top_k_chunks
        
        if self.faiss_index is None:
            raise ValueError("FAISS index not built. Call build_vector_index first.")
        
        if not self.chunks:
            raise ValueError("No chunks available for retrieval")
        
        # Embed the query
        query_embedding = self.embedder.encode([query])
        query_embedding = np.array(query_embedding, dtype='float32')
        
        # Normalize query embedding
        query_norm = np.linalg.norm(query_embedding)
        query_embedding = query_embedding / query_norm
        
        # Search FAISS index
        distances, indices = self.faiss_index.search(query_embedding, k)
        
        # Retrieve chunk texts
        top_chunks = [self.chunks[i] for i in indices[0]]
        
        logger.info(f"Retrieved {len(top_chunks)} chunks for query: {query[:50]}...")
        return top_chunks
    
    def process_pdf(self, pdf_path: str) -> Tuple[List[str], dict]:
        """
        Complete PDF processing pipeline.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Tuple of (chunks, metadata)
        """
        # Step 1: Extract text
        raw_text = self.extract_text_from_pdf(pdf_path)
        
        # Step 2: Preprocess text
        clean_text = self.preprocess_text(raw_text)
        
        # Step 3: Chunk text
        chunks = self.chunk_text(clean_text)
        
        # Step 4: Generate embeddings
        embeddings = self.generate_embeddings(chunks)
        
        # Step 5: Build vector index
        self.build_vector_index(embeddings)
        
        # Prepare metadata
        metadata = {
            **self.document_metadata,
            "chunk_count": len(chunks),
            "embedding_dimension": embeddings.shape[1],
            "index_size": self.faiss_index.ntotal
        }
        
        return chunks, metadata

