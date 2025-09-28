"""Main RAG pipeline orchestrator for the Local PDF RAG Pipeline."""

import json
import logging
from typing import Dict, Any, List, Optional
from pathlib import Path

from pdf_processor import PDFProcessor
from generator_gemini import generate_flashcards, call_gemini_json
from prompt_builder import build_qa_prompts, DEFAULT_FLASHCARD_TASK
from config import config

logger = logging.getLogger(__name__)

class RAGPipeline:
    """Main RAG pipeline for PDF processing and content generation."""
    
    def __init__(self):
        """Initialize the RAG pipeline."""
        self.pdf_processor = PDFProcessor()
        self.document_metadata: Dict[str, Any] = {}
    
    def process_document(self, pdf_path: str) -> Dict[str, Any]:
        """
        Process a PDF document and prepare it for RAG operations.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Dictionary with processing results and metadata
        """
        try:
            # Validate file exists
            if not Path(pdf_path).exists():
                raise FileNotFoundError(f"PDF file not found: {pdf_path}")
            
            logger.info(f"Processing PDF: {pdf_path}")
            
            # Process PDF through the complete pipeline
            chunks, metadata = self.pdf_processor.process_pdf(pdf_path)
            
            # Store metadata
            self.document_metadata = metadata
            
            result = {
                "status": "success",
                "document_path": pdf_path,
                "metadata": metadata,
                "chunk_count": len(chunks),
                "message": f"Successfully processed {metadata['page_count']} pages into {len(chunks)} chunks"
            }
            
            logger.info(f"Document processing completed: {result['message']}")
            return result
            
        except Exception as e:
            error_msg = f"Error processing document: {str(e)}"
            logger.error(error_msg)
            return {
                "status": "error",
                "document_path": pdf_path,
                "error": error_msg
            }
    
    def generate_flashcards_from_document(
        self, 
        pdf_path: str, 
        task_text: str = None,
        query: str = None
    ) -> Dict[str, Any]:
        """
        Generate IELTS flashcards from a PDF document.
        
        Args:
            pdf_path: Path to the PDF file
            task_text: Custom task description (uses default if None)
            query: Optional query to retrieve specific chunks
            
        Returns:
            Dictionary containing generated flashcards
        """
        try:
            # Process document if not already processed
            if not self.document_metadata or self.document_metadata.get("source_file") != pdf_path:
                process_result = self.process_document(pdf_path)
                if process_result["status"] != "success":
                    return process_result
            
            # Use default task if not provided
            if task_text is None:
                task_text = DEFAULT_FLASHCARD_TASK
            
            # Retrieve relevant chunks
            if query:
                # Use query-based retrieval
                chunks = self.pdf_processor.retrieve_chunks(query)
            else:
                # Use all chunks (or a subset for efficiency)
                chunks = self.pdf_processor.chunks[:10]  # Limit to first 10 chunks
            
            if not chunks:
                return {
                    "status": "error",
                    "error": "No chunks available for flashcard generation"
                }
            
            logger.info(f"Generating flashcards from {len(chunks)} chunks")
            
            # Generate flashcards using Gemini
            flashcards_result = generate_flashcards(chunks, task_text)
            
            # Add metadata
            result = {
                "status": "success",
                "document_path": pdf_path,
                "chunks_used": len(chunks),
                "query_used": query,
                "task": task_text,
                "flashcards": flashcards_result,
                "metadata": self.document_metadata
            }
            
            logger.info(f"Generated {len(flashcards_result.get('cards', []))} flashcards")
            return result
            
        except Exception as e:
            error_msg = f"Error generating flashcards: {str(e)}"
            logger.error(error_msg)
            return {
                "status": "error",
                "document_path": pdf_path,
                "error": error_msg
            }
    
    def answer_question(self, pdf_path: str, question: str) -> Dict[str, Any]:
        """
        Answer a question about the PDF document.
        
        Args:
            pdf_path: Path to the PDF file
            question: Question to answer
            
        Returns:
            Dictionary containing the answer
        """
        try:
            # Process document if not already processed
            if not self.document_metadata or self.document_metadata.get("source_file") != pdf_path:
                process_result = self.process_document(pdf_path)
                if process_result["status"] != "success":
                    return process_result
            
            # Retrieve relevant chunks for the question
            chunks = self.pdf_processor.retrieve_chunks(question)
            
            if not chunks:
                return {
                    "status": "error",
                    "error": "No relevant chunks found for the question"
                }
            
            logger.info(f"Answering question using {len(chunks)} relevant chunks")
            
            # Build prompts for question answering
            system_prompt, user_prompt = build_qa_prompts(chunks, question)
            
            # Call Gemini API
            answer_result = call_gemini_json(system_prompt, user_prompt)
            
            # Format result
            result = {
                "status": "success",
                "document_path": pdf_path,
                "question": question,
                "answer": answer_result,
                "chunks_used": len(chunks),
                "metadata": self.document_metadata
            }
            
            logger.info("Question answered successfully")
            return result
            
        except Exception as e:
            error_msg = f"Error answering question: {str(e)}"
            logger.error(error_msg)
            return {
                "status": "error",
                "document_path": pdf_path,
                "question": question,
                "error": error_msg
            }
    
    def export_results(self, results: Dict[str, Any], output_path: str = None) -> str:
        """
        Export results to JSON file.
        
        Args:
            results: Results dictionary to export
            output_path: Output file path (auto-generated if None)
            
        Returns:
            Path to the exported file
        """
        if output_path is None:
            # Generate output path
            doc_name = Path(results.get("document_path", "unknown")).stem
            output_path = Path(config.output_dir) / f"{doc_name}_results.json"
        
        # Ensure output directory exists
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Export to JSON
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Results exported to: {output_path}")
        return str(output_path)
    
    def get_pipeline_info(self) -> Dict[str, Any]:
        """
        Get information about the current pipeline state.
        
        Returns:
            Dictionary with pipeline information
        """
        return {
            "embedding_model": config.embedding_model,
            "gemini_model": config.gemini_model,
            "chunk_size": config.chunk_size,
            "chunk_overlap": config.chunk_overlap,
            "top_k_chunks": config.top_k_chunks,
            "document_processed": bool(self.document_metadata),
            "document_metadata": self.document_metadata,
            "chunks_available": len(self.pdf_processor.chunks) if self.pdf_processor.chunks else 0,
            "index_built": self.pdf_processor.faiss_index is not None
        }

