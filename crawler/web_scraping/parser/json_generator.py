"""
JSON Generator for IELTS Reading Content Parser

This module generates structured JSON output from parsed passages, questions, and answers.
The output format is designed to be backend-ready for direct database insertion.
"""

import json
import logging
from typing import Dict, List, Any
from datetime import datetime

# Import models
try:
    from .models import Passage, Question, Answer, ValidationResult
except ImportError:
    from models import Passage, Question, Answer, ValidationResult

logger = logging.getLogger(__name__)


class JSONGenerator:
    """
    Generates structured JSON output from parsed IELTS reading test data.
    
    Output includes:
    - Test metadata
    - Passages with content
    - Questions with UI components
    - Answers
    - Validation results
    """
    
    def generate(
        self,
        metadata: Dict,
        passages: List[Passage],
        questions: List[Question],
        answers: List[Answer],
        validation: ValidationResult
    ) -> Dict:
        """
        Generate complete structured JSON output.
        
        Args:
            metadata: Test metadata dictionary
            passages: List of parsed passages
            questions: List of parsed questions
            answers: List of parsed answers
            validation: Validation results
            
        Returns:
            Complete structured dictionary ready for JSON serialization
        """
        logger.info("Generating JSON output...")
        
        output = {
            'test_metadata': self._generate_metadata_section(metadata, questions),
            'passages': self._generate_passages_section(passages),
            'questions': self._generate_questions_section(questions),
            'answers': self._generate_answers_section(answers),
            'validation': self._generate_validation_section(validation)
        }
        
        logger.info(f"Generated JSON with {len(passages)} passages, "
                   f"{len(questions)} questions, {len(answers)} answers")
        
        return output
    
    def _generate_metadata_section(self, metadata: Dict, questions: List[Question]) -> Dict:
        """Generate the test_metadata section."""
        # Update total_questions with actual count
        actual_count = len(questions)
        
        return {
            'source_url': metadata.get('source_url', ''),
            'test_name': metadata.get('test_name', 'Unknown Test'),
            'test_type': metadata.get('test_type', 'unknown'),
            'edition': metadata.get('edition'),
            'test_number': metadata.get('test_number'),
            'crawl_date': metadata.get('crawl_date', datetime.now().strftime('%Y-%m-%d')),
            'total_questions': actual_count
        }
    
    def _generate_passages_section(self, passages: List[Passage]) -> List[Dict]:
        """Generate the passages section."""
        passages_data = []
        
        for passage in passages:
            passage_dict = {
                'passage_number': passage.passage_number,
                'title': passage.title,
                'content': passage.content,
                'word_count': passage.word_count,
                'paragraphs': passage.paragraphs
            }
            
            # Add labeled_paragraphs if present
            if hasattr(passage, 'labeled_paragraphs') and passage.labeled_paragraphs:
                passage_dict['labeled_paragraphs'] = passage.labeled_paragraphs
            
            passages_data.append(passage_dict)
        
        return passages_data
    
    def _generate_questions_section(self, questions: List[Question]) -> List[Dict]:
        """Generate the questions section with UI components."""
        questions_data = []
        
        for question in questions:
            question_dict = {
                'question_number': question.question_number,
                'question_type': question.question_type.value,
                'ui_component': question.ui_component.value,
                'instructions': question.instructions,
                'question_text': question.question_text,
                'options': question.options,
                'word_limit': question.word_limit,
                'passage_reference': question.passage_reference,
                'paragraph_reference': question.paragraph_reference
            }
            
            # Add table_structure if present
            if hasattr(question, 'table_structure') and question.table_structure:
                question_dict['table_structure'] = question.table_structure
            
            questions_data.append(question_dict)
        
        return questions_data
    
    def _generate_answers_section(self, answers: List[Answer]) -> List[Dict]:
        """Generate the answers section."""
        answers_data = []
        
        for answer in answers:
            answer_dict = {
                'question_number': answer.question_number,
                'correct_answer': answer.correct_answer,
                'explanation': answer.explanation
            }
            answers_data.append(answer_dict)
        
        return answers_data
    
    def _generate_validation_section(self, validation: ValidationResult) -> Dict:
        """Generate the validation section."""
        return {
            'is_valid': validation.is_valid,
            'errors': validation.errors,
            'warnings': validation.warnings
        }
    
    def to_json_string(self, data: Dict, pretty: bool = True) -> str:
        """
        Convert dictionary to JSON string.
        
        Args:
            data: Dictionary to convert
            pretty: If True, use pretty printing with indentation
            
        Returns:
            JSON string
        """
        if pretty:
            return json.dumps(data, indent=2, ensure_ascii=False)
        else:
            return json.dumps(data, ensure_ascii=False)
    
    def save_to_file(self, data: Dict, output_path: str, pretty: bool = True) -> None:
        """
        Save generated JSON to file.
        
        Args:
            data: Dictionary to save
            output_path: Path to output file
            pretty: If True, use pretty printing
        """
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                if pretty:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                else:
                    json.dump(data, f, ensure_ascii=False)
            
            logger.info(f"Saved JSON output to: {output_path}")
        except Exception as e:
            logger.error(f"Failed to save JSON to {output_path}: {e}")
            raise
    
    def validate_schema(self, data: Dict) -> bool:
        """
        Validate that the generated JSON has all required fields.
        
        Args:
            data: Generated JSON dictionary
            
        Returns:
            True if schema is valid, False otherwise
        """
        required_top_level = ['test_metadata', 'passages', 'questions', 'answers', 'validation']
        
        # Check top-level keys
        for key in required_top_level:
            if key not in data:
                logger.error(f"Missing required top-level key: {key}")
                return False
        
        # Check metadata fields
        required_metadata = ['source_url', 'test_name', 'test_type', 'total_questions']
        for key in required_metadata:
            if key not in data['test_metadata']:
                logger.error(f"Missing required metadata field: {key}")
                return False
        
        # Check that lists are actually lists
        if not isinstance(data['passages'], list):
            logger.error("'passages' must be a list")
            return False
        
        if not isinstance(data['questions'], list):
            logger.error("'questions' must be a list")
            return False
        
        if not isinstance(data['answers'], list):
            logger.error("'answers' must be a list")
            return False
        
        # Check passage structure
        for i, passage in enumerate(data['passages']):
            required_passage_fields = ['passage_number', 'title', 'content', 'word_count']
            for field in required_passage_fields:
                if field not in passage:
                    logger.error(f"Passage {i} missing required field: {field}")
                    return False
        
        # Check question structure
        for i, question in enumerate(data['questions']):
            required_question_fields = [
                'question_number', 'question_type', 'ui_component',
                'instructions', 'question_text', 'passage_reference'
            ]
            for field in required_question_fields:
                if field not in question:
                    logger.error(f"Question {i} missing required field: {field}")
                    return False
        
        # Check answer structure
        for i, answer in enumerate(data['answers']):
            required_answer_fields = ['question_number', 'correct_answer']
            for field in required_answer_fields:
                if field not in answer:
                    logger.error(f"Answer {i} missing required field: {field}")
                    return False
        
        logger.info("Schema validation passed")
        return True
