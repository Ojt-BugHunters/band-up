"""Main interface for the Local PDF RAG Pipeline using direct variables."""

import json
import logging
from pathlib import Path

from rag_pipeline import RAGPipeline
from config import config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def generate_flashcards(pdf_path: str, query: str = None, task: str = None, output_path: str = None):
    """
    Generate flashcards from a PDF document.
    
    Args:
        pdf_path: Path to the PDF file
        query: Optional query to retrieve specific chunks
        task: Optional custom task description
        output_path: Optional output file path
    """
    try:
        # Initialize RAG pipeline
        pipeline = RAGPipeline()
        
        logger.info(f"Generating flashcards from: {pdf_path}")
        
        result = pipeline.generate_flashcards_from_document(
            pdf_path=pdf_path,
            task_text=task,
            query=query
        )
        
        # Export results
        exported_path = pipeline.export_results(result, output_path)
        
        # Print results to stdout
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        if result["status"] == "success":
            logger.info(f"Flashcards generated successfully. Exported to: {exported_path}")
            return result
        else:
            logger.error(f"Flashcard generation failed: {result.get('error', 'Unknown error')}")
            return result
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {"status": "error", "error": str(e)}

def answer_question(pdf_path: str, question: str, output_path: str = None):
    """
    Answer a question about PDF content.
    
    Args:
        pdf_path: Path to the PDF file
        question: Question to answer
        output_path: Optional output file path
    """
    try:
        # Initialize RAG pipeline
        pipeline = RAGPipeline()
        
        logger.info(f"Answering question about: {pdf_path}")
        
        result = pipeline.answer_question(
            pdf_path=pdf_path,
            question=question
        )
        
        # Export results
        exported_path = pipeline.export_results(result, output_path)
        
        # Print results to stdout
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        if result["status"] == "success":
            logger.info(f"Question answered successfully. Exported to: {exported_path}")
            return result
        else:
            logger.error(f"Question answering failed: {result.get('error', 'Unknown error')}")
            return result
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {"status": "error", "error": str(e)}

def get_pipeline_info():
    """Get pipeline information."""
    try:
        pipeline = RAGPipeline()
        info = pipeline.get_pipeline_info()
        print(json.dumps(info, indent=2, ensure_ascii=False))
        return info
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {"status": "error", "error": str(e)}

def main():
    """Example usage with direct variables."""
    
    # Example 1: Generate flashcards
    print("=== Example 1: Generate Flashcards ===")
    pdf_file = "Eve.pdf"  # Change this to your PDF file
    result = generate_flashcards(
        pdf_path=pdf_file,
        query="main concepts and vocabulary",
        task="Generate IELTS flashcards focusing on key concepts"
    )
    
    print("\n" + "="*50 + "\n")
    
    # Example 2: Answer a question
    # print("=== Example 2: Answer Question ===")
    # result = answer_question(
    #     pdf_path=pdf_file,
    #     question="What is the main topic of this document?"
    # )
    
    print("\n" + "="*50 + "\n")
    
    # Example 3: Get pipeline info
    # print("=== Example 3: Pipeline Info ===")
    # get_pipeline_info()

if __name__ == "__main__":
    main()