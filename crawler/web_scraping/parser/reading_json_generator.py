"""
Reading JSON Generator Module

This module provides the ReadingJSONGenerator class for creating structured JSON output
from extracted reading test data. It generates JSON files with passages and answers
in a format suitable for the React frontend application.

Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional

try:
    from .reading_passage_extractor import PassageData
    from .reading_answer_extractor import AnswerData
    from .logging_config import get_logger
except ImportError:
    from reading_passage_extractor import PassageData
    from reading_answer_extractor import AnswerData
    from logging_config import get_logger

logger = get_logger(__name__)


class ReadingJSONGenerator:
    """
    Generates structured JSON output for reading tests.
    
    This class creates JSON files with the following structure:
    - source: Original URL
    - testNumber: Test number (1-111)
    - testType: Type of test (e.g., "practice")
    - crawledAt: Timestamp of when the test was crawled
    - passages: Array of passage objects with title, orderIndex, content
    - answers: Object with passage1/2/3 keys containing answer HTML
    - metadata: Additional information (wordCount, estimatedReadingTime, parserVersion)
    
    Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
    """
    
    # Parser version for tracking changes
    PARSER_VERSION = "2.0.0"
    
    # Average reading speed (words per minute)
    AVERAGE_READING_SPEED = 250
    
    def __init__(self):
        """Initialize the ReadingJSONGenerator."""
        logger.info("ReadingJSONGenerator initialized")
    
    def generate_json(
        self,
        url: str,
        test_number: int,
        passages: List[PassageData],
        answers: AnswerData,
        test_type: str = "practice"
    ) -> Dict[str, Any]:
        """
        Generate JSON structure for a reading test.
        
        Creates a dictionary with all required fields according to the specification:
        - source: Original URL (Requirement 5.1)
        - testNumber: Test number as integer (Requirement 5.2)
        - testType: Type of test (Requirement 5.1)
        - crawledAt: ISO 8601 timestamp (Requirement 5.1)
        - passages: Array of passage objects (Requirement 5.3, 5.4)
        - answers: Object with passage answers (Requirement 5.5)
        - metadata: Additional information (Requirement 5.6)
        
        Args:
            url: Source URL of the test
            test_number: Test number (1-111)
            passages: List of extracted PassageData objects
            answers: Extracted AnswerData object
            test_type: Type of test (default: "practice")
            
        Returns:
            Dictionary ready for JSON serialization
            
        Example:
            >>> generator = ReadingJSONGenerator()
            >>> json_data = generator.generate_json(
            ...     url="https://example.com/test-05/",
            ...     test_number=5,
            ...     passages=[passage1, passage2, passage3],
            ...     answers=answer_data
            ... )
        """
        logger.info(f"Generating JSON structure for test {test_number}")
        
        # Validate inputs
        if not passages or len(passages) != 3:
            logger.warning(f"Expected 3 passages, got {len(passages) if passages else 0}")
        
        # Calculate total word count
        total_word_count = sum(p.word_count for p in passages)
        
        # Calculate estimated reading time (in minutes)
        estimated_reading_time = max(1, round(total_word_count / self.AVERAGE_READING_SPEED))
        
        # Create the JSON structure
        json_data = {
            # Basic information (Requirements 5.1, 5.2)
            "source": url,
            "testNumber": test_number,
            "testType": test_type,
            "crawledAt": datetime.now().isoformat() + "Z",
            
            # Passages array (Requirements 5.3, 5.4)
            "passages": self._format_passages(passages),
            
            # Answers object (Requirement 5.5)
            "answers": self._format_answers(answers),
            
            # Metadata (Requirement 5.6)
            "metadata": {
                "totalWordCount": total_word_count,
                "estimatedReadingTime": estimated_reading_time,
                "parserVersion": self.PARSER_VERSION
            }
        }
        
        logger.info(f"Generated JSON structure: {len(passages)} passages, "
                   f"{total_word_count} words, {estimated_reading_time} min reading time")
        
        return json_data
    
    def _format_passages(self, passages: List[PassageData]) -> List[Dict[str, Any]]:
        """
        Format passages array with title, orderIndex, content.
        
        Requirement 5.4: Format passages array with title, orderIndex, content
        
        Args:
            passages: List of PassageData objects
            
        Returns:
            List of passage dictionaries
        """
        formatted_passages = []
        
        for passage in passages:
            passage_dict = {
                "title": passage.title,
                "orderIndex": passage.order_index,
                "content": passage.content,
                "images": passage.images,
                "wordCount": passage.word_count
            }
            formatted_passages.append(passage_dict)
            logger.debug(f"Formatted passage {passage.order_index}: '{passage.title}'")
        
        return formatted_passages
    
    def _format_answers(self, answers: AnswerData) -> Dict[str, Any]:
        """
        Format answers object with passage1/2/3 keys.
        
        Each passage contains both HTML (for display) and a clean list (for scoring).
        
        Requirement 5.5: Format answers object with passage1/2/3 keys
        
        Args:
            answers: AnswerData object
            
        Returns:
            Dictionary with passage1, passage2, passage3 keys, each containing
            'html' (for display) and 'answers' (list for scoring)
        """
        formatted_answers = {
            "passage1": {
                "html": answers.passage1_answers,
                "answers": answers.passage1_list
            },
            "passage2": {
                "html": answers.passage2_answers,
                "answers": answers.passage2_list
            },
            "passage3": {
                "html": answers.passage3_answers,
                "answers": answers.passage3_list
            }
        }
        
        logger.debug(f"Formatted answers for 3 passages (passage1: {len(answers.passage1_list)} answers, "
                    f"passage2: {len(answers.passage2_list)} answers, "
                    f"passage3: {len(answers.passage3_list)} answers)")
        return formatted_answers
    
    def save_json(
        self,
        data: Dict[str, Any],
        output_path: str,
        indent: int = 2
    ) -> None:
        """
        Save JSON data to file with UTF-8 encoding.
        
        Requirements:
        - 5.7: Use UTF-8 encoding to support all characters
        - 5.8: Format output with indentation for readability
        
        Args:
            data: Dictionary to save
            output_path: File path for output
            indent: JSON indentation (default 2)
            
        Raises:
            IOError: If file cannot be written
            
        Example:
            >>> generator = ReadingJSONGenerator()
            >>> generator.save_json(
            ...     data=json_data,
            ...     output_path="parsed/reading/practice/test-05.json"
            ... )
        """
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Save with UTF-8 encoding and indentation (Requirements 5.7, 5.8)
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=indent, ensure_ascii=False)
            
            logger.info(f"Saved JSON to: {output_path}")
            
        except Exception as e:
            logger.error(f"Failed to save JSON to {output_path}: {e}", exc_info=True)
            raise IOError(f"Failed to save JSON file: {str(e)}")
    
    def generate_filename(self, test_number: int, test_type: str = "practice") -> str:
        """
        Generate filename using the specified pattern.
        
        Requirement 5.9: Generate filename using pattern 
        "parsed_ielts-reading-practice-test-<num>-with-answers.json"
        
        Args:
            test_number: Test number (1-111)
            test_type: Type of test (default: "practice")
            
        Returns:
            Filename string
            
        Example:
            >>> generator = ReadingJSONGenerator()
            >>> generator.generate_filename(5)
            'parsed_ielts-reading-practice-test-05-with-answers.json'
            >>> generator.generate_filename(105)
            'parsed_ielts-reading-practice-test-105-with-answers.json'
        """
        # Format number with leading zeros for 1-99, without for 100+
        if test_number < 100:
            num_str = f"{test_number:02d}"
        else:
            num_str = str(test_number)
        
        filename = f"parsed_ielts-reading-{test_type}-test-{num_str}-with-answers.json"
        logger.debug(f"Generated filename: {filename}")
        
        return filename
    
    def generate_output_path(
        self,
        test_number: int,
        test_type: str = "practice",
        base_dir: str = "parsed/reading"
    ) -> str:
        """
        Generate full output path for JSON file.
        
        Requirement 5.10: Save to directory "parsed/reading/practice/"
        
        Args:
            test_number: Test number (1-111)
            test_type: Type of test (default: "practice")
            base_dir: Base directory (default: "parsed/reading")
            
        Returns:
            Full file path string
            
        Example:
            >>> generator = ReadingJSONGenerator()
            >>> generator.generate_output_path(5)
            'parsed/reading/practice/parsed_ielts-reading-practice-test-05-with-answers.json'
        """
        filename = self.generate_filename(test_number, test_type)
        output_path = os.path.join(base_dir, test_type, filename)
        
        logger.debug(f"Generated output path: {output_path}")
        return output_path
    
    def generate_and_save(
        self,
        url: str,
        test_number: int,
        passages: List[PassageData],
        answers: AnswerData,
        test_type: str = "practice",
        output_dir: str = "parsed/reading"
    ) -> str:
        """
        Generate JSON and save to file in one operation.
        
        This is a convenience method that combines generate_json and save_json.
        
        Args:
            url: Source URL of the test
            test_number: Test number (1-111)
            passages: List of extracted PassageData objects
            answers: Extracted AnswerData object
            test_type: Type of test (default: "practice")
            output_dir: Output directory (default: "parsed/reading")
            
        Returns:
            Path to the saved JSON file
            
        Raises:
            IOError: If file cannot be written
        """
        logger.info(f"Generating and saving JSON for test {test_number}")
        
        # Generate JSON structure
        json_data = self.generate_json(url, test_number, passages, answers, test_type)
        
        # Generate output path
        output_path = self.generate_output_path(test_number, test_type, output_dir)
        
        # Save to file
        self.save_json(json_data, output_path)
        
        logger.info(f"Successfully generated and saved test {test_number} to {output_path}")
        return output_path


# Convenience function for quick JSON generation
def generate_reading_json(
    url: str,
    test_number: int,
    passages: List[PassageData],
    answers: AnswerData,
    output_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Convenience function to generate reading test JSON.
    
    Args:
        url: Source URL of the test
        test_number: Test number (1-111)
        passages: List of extracted PassageData objects
        answers: Extracted AnswerData object
        output_path: Optional path to save JSON file
        
    Returns:
        Generated JSON dictionary
    """
    generator = ReadingJSONGenerator()
    json_data = generator.generate_json(url, test_number, passages, answers)
    
    if output_path:
        generator.save_json(json_data, output_path)
    
    return json_data
