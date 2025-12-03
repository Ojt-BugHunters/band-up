"""
JSON Generator for IELTS Listening Content Parser

This module generates structured JSON output from parsed listening tests.
The output format is designed to be backend-ready for direct database insertion.

Updated to support both:
1. New structure: Questions as HTML blocks with preserved templates
2. Legacy structure: Individual parsed questions with UI components
"""

import json
import logging
from typing import Dict, List, Optional, Union, Tuple, Any
from datetime import datetime

try:
    from .listening_models import (
        Section,
        ListeningQuestion,
        ListeningAnswer,
        ValidationResult,
        ListeningQuestionType,
        UI_COMPONENT_MAP
    )
except ImportError:
    from listening_models import (
        Section,
        ListeningQuestion,
        ListeningAnswer,
        ValidationResult,
        ListeningQuestionType,
        UI_COMPONENT_MAP
    )

try:
    from .media_downloader import MediaFile
except ImportError:
    try:
        from media_downloader import MediaFile
    except ImportError:
        MediaFile = None

logger = logging.getLogger(__name__)


# ============================================================================
# Simple Data Classes for New Structure
# ============================================================================

class QuestionBlock:
    """Represents a block of questions for a section with preserved HTML"""
    def __init__(self, section_number: int, question_range: Tuple[int, int], 
                 html_content: str, text_content: str):
        self.section_number = section_number
        self.question_range = question_range
        self.html_content = html_content
        self.text_content = text_content
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            "section_number": self.section_number,
            "question_range": list(self.question_range),
            "html_content": self.html_content,
            "text_content": self.text_content
        }


class SimpleAnswer:
    """Represents a simple answer with question number, text, and section"""
    def __init__(self, question_number: int, answer_text: str, section_number: int):
        self.question_number = question_number
        self.answer_text = answer_text
        self.section_number = section_number
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            "question_number": self.question_number,
            "answer_text": self.answer_text,
            "section_number": self.section_number
        }


class ListeningJSONGenerator:
    """
    Generates structured JSON output from parsed IELTS listening test data.
    
    Output includes:
    - Test metadata (test number, name, URL, dates, totals)
    - Sections with audio file paths
    - Questions with UI components
    - Answers with alternatives
    - Media file metadata
    - Validation results
    """
    
    def generate(
        self,
        metadata: Dict,
        sections: List[Section],
        questions: Union[List[ListeningQuestion], List[QuestionBlock], List[Dict]],
        answers: Union[List[ListeningAnswer], List[SimpleAnswer], List[Dict]],
        media_files: Optional[List] = None,
        validation: Optional[Union[ValidationResult, Dict]] = None
    ) -> Dict:
        """
        Generate complete structured JSON output.
        
        Supports both new structure (QuestionBlock, SimpleAnswer) and 
        legacy structure (ListeningQuestion, ListeningAnswer).
        
        Args:
            metadata: Test metadata dictionary
            sections: List of parsed sections
            questions: List of questions (QuestionBlock, ListeningQuestion, or Dict)
            answers: List of answers (SimpleAnswer, ListeningAnswer, or Dict)
            media_files: Optional list of downloaded media files
            validation: Optional validation results (ValidationResult or Dict)
            
        Returns:
            Complete structured dictionary ready for JSON serialization
        """
        logger.info("Generating JSON output for listening test...")
        
        # Handle legacy questions with UI components
        if questions and isinstance(questions[0], ListeningQuestion):
            self._set_ui_components(questions)
        
        # Build output structure
        output = {
            'test_metadata': self._generate_metadata_section(metadata, sections, questions),
            'sections': self._generate_sections_section(sections),
            'questions': self._generate_questions_section(questions),
            'answers': self._generate_answers_section(answers),
            'validation': self._generate_validation_section(validation, sections, questions, answers)
        }
        
        # Add media_files section if provided
        if media_files is not None:
            output['media_files'] = self._generate_media_files_section(media_files)
        
        logger.info(f"Generated JSON with {len(sections)} sections, "
                   f"{len(questions)} question blocks/items, {len(answers)} answers")
        
        return output
    
    def _set_ui_components(self, questions: List[ListeningQuestion]) -> None:
        """
        Set UI component for each question based on question type.
        
        Args:
            questions: List of questions to update
        """
        for question in questions:
            if question.question_type in UI_COMPONENT_MAP:
                question.ui_component = UI_COMPONENT_MAP[question.question_type]
            else:
                logger.warning(f"No UI component mapping for question type: {question.question_type}")
                question.ui_component = "text_input"  # Default fallback
    
    def _generate_metadata_section(
        self,
        metadata: Dict,
        sections: List[Section],
        questions: Union[List, int]
    ) -> Dict:
        """
        Generate the test_metadata section.
        
        Args:
            metadata: Raw metadata dictionary
            sections: List of sections (for count)
            questions: List of questions or question count
            
        Returns:
            Metadata dictionary with all required fields
        """
        # Calculate total questions
        if isinstance(questions, int):
            total_questions = questions
        elif questions and isinstance(questions[0], QuestionBlock):
            # For QuestionBlock, sum up the ranges
            total_questions = sum(q.question_range[1] - q.question_range[0] + 1 for q in questions)
        elif questions and isinstance(questions[0], dict) and 'question_range' in questions[0]:
            # For dict with question_range
            total_questions = sum(q['question_range'][1] - q['question_range'][0] + 1 for q in questions)
        else:
            total_questions = len(questions) if questions else 0
        
        # Format crawl_date as ISO 8601
        crawl_date = metadata.get('crawl_date')
        if isinstance(crawl_date, datetime):
            crawl_date_str = crawl_date.isoformat() + 'Z'
        elif isinstance(crawl_date, str):
            # If already a string, try to parse and reformat
            try:
                dt = datetime.fromisoformat(crawl_date.replace('Z', '+00:00'))
                crawl_date_str = dt.isoformat() + 'Z'
            except:
                crawl_date_str = crawl_date
        else:
            crawl_date_str = datetime.now().isoformat() + 'Z'
        
        return {
            'source_url': metadata.get('source_url', ''),
            'test_name': metadata.get('test_name', 'Unknown Listening Test'),
            'test_type': 'listening',
            'test_number': metadata.get('test_number', 0),
            'crawl_date': crawl_date_str,
            'total_questions': total_questions,
            'total_sections': len(sections)
        }
    
    def _generate_sections_section(self, sections: List[Section]) -> List[Dict]:
        """
        Generate the sections section with audio file paths.
        
        Args:
            sections: List of Section objects
            
        Returns:
            List of section dictionaries
        """
        return [section.to_dict() for section in sections]
    
    def _generate_questions_section(
        self, 
        questions: Union[List[ListeningQuestion], List[QuestionBlock], List[Dict]]
    ) -> List[Dict]:
        """
        Generate the questions section.
        
        Supports both:
        - New structure: QuestionBlock with HTML content
        - Legacy structure: ListeningQuestion with parsed fields
        
        Args:
            questions: List of question objects or dictionaries
            
        Returns:
            List of question dictionaries
        """
        if not questions:
            return []
        
        # Handle different input types
        if isinstance(questions[0], (QuestionBlock, ListeningQuestion)):
            return [q.to_dict() for q in questions]
        elif isinstance(questions[0], dict):
            return questions
        else:
            logger.warning(f"Unknown question type: {type(questions[0])}")
            return []
    
    def _generate_answers_section(
        self, 
        answers: Union[List[ListeningAnswer], List[SimpleAnswer], List[Dict]]
    ) -> List[Dict]:
        """
        Generate the answers section.
        
        Supports both:
        - New structure: SimpleAnswer with question_number, answer_text, section_number
        - Legacy structure: ListeningAnswer with correct_answer and alternatives
        
        Args:
            answers: List of answer objects or dictionaries
            
        Returns:
            List of answer dictionaries
        """
        if not answers:
            return []
        
        # Handle different input types
        if isinstance(answers[0], (SimpleAnswer, ListeningAnswer)):
            return [a.to_dict() for a in answers]
        elif isinstance(answers[0], dict):
            return answers
        else:
            logger.warning(f"Unknown answer type: {type(answers[0])}")
            return []
    
    def _generate_media_files_section(self, media_files: Optional[List]) -> List[Dict]:
        """
        Generate the media_files section with file metadata.
        
        Args:
            media_files: List of MediaFile objects or dicts (optional)
            
        Returns:
            List of media file dictionaries
        """
        if not media_files:
            return []
        
        # Handle different input types
        if hasattr(media_files[0], 'to_dict'):
            return [mf.to_dict() for mf in media_files]
        elif isinstance(media_files[0], dict):
            return media_files
        else:
            logger.warning(f"Unknown media file type: {type(media_files[0])}")
            return []
    
    def _generate_validation_section(
        self,
        validation: Optional[Union[ValidationResult, Dict]],
        sections: List[Section],
        questions: Union[List, int],
        answers: List
    ) -> Dict:
        """
        Generate the validation section with counts.
        
        Args:
            validation: ValidationResult object or dict (optional)
            sections: List of sections for count
            questions: List of questions or count
            answers: List of answers for count
            
        Returns:
            Validation dictionary with is_valid, errors, warnings, and counts
        """
        # Start with base validation data
        if validation is None:
            base_validation = {
                'is_valid': True,
                'errors': [],
                'warnings': []
            }
        elif isinstance(validation, ValidationResult):
            base_validation = validation.to_dict()
        elif isinstance(validation, dict):
            base_validation = validation
        else:
            base_validation = {
                'is_valid': False,
                'errors': [f'Invalid validation type: {type(validation)}'],
                'warnings': []
            }
        
        # Calculate counts
        section_count = len(sections)
        
        # Calculate question count
        if isinstance(questions, int):
            question_count = questions
        elif questions and isinstance(questions[0], QuestionBlock):
            question_count = sum(q.question_range[1] - q.question_range[0] + 1 for q in questions)
        elif questions and isinstance(questions[0], dict) and 'question_range' in questions[0]:
            question_count = sum(q['question_range'][1] - q['question_range'][0] + 1 for q in questions)
        else:
            question_count = len(questions) if questions else 0
        
        answer_count = len(answers) if answers else 0
        
        # Add counts to validation
        base_validation['section_count'] = section_count
        base_validation['question_count'] = question_count
        base_validation['answer_count'] = answer_count
        
        return base_validation
    
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
    
    def validate_schema(self, data: Dict, strict: bool = False) -> bool:
        """
        Validate that the generated JSON has all required fields.
        
        Supports both new structure (QuestionBlock) and legacy structure (ListeningQuestion).
        
        Args:
            data: Generated JSON dictionary
            strict: If True, require media_files section
            
        Returns:
            True if schema is valid, False otherwise
        """
        # Check top-level keys (media_files is optional in new structure)
        required_top_level = ['test_metadata', 'sections', 'questions', 'answers', 'validation']
        for key in required_top_level:
            if key not in data:
                logger.error(f"Missing required top-level key: {key}")
                return False
        
        if strict and 'media_files' not in data:
            logger.error("Missing required top-level key: media_files")
            return False
        
        # Check metadata fields
        required_metadata = ['source_url', 'test_name', 'test_type', 'test_number', 'total_questions', 'total_sections']
        for key in required_metadata:
            if key not in data['test_metadata']:
                logger.error(f"Missing required metadata field: {key}")
                return False
        
        # Check that lists are actually lists
        if not isinstance(data['sections'], list):
            logger.error("'sections' must be a list")
            return False
        
        if not isinstance(data['questions'], list):
            logger.error("'questions' must be a list")
            return False
        
        if not isinstance(data['answers'], list):
            logger.error("'answers' must be a list")
            return False
        
        if 'media_files' in data and not isinstance(data['media_files'], list):
            logger.error("'media_files' must be a list")
            return False
        
        # Check section structure
        for i, section in enumerate(data['sections']):
            required_section_fields = ['section_number', 'title', 'question_range']
            for field in required_section_fields:
                if field not in section:
                    logger.error(f"Section {i} missing required field: {field}")
                    return False
        
        # Check question structure (support both new and legacy formats)
        if data['questions']:
            first_question = data['questions'][0]
            
            # New structure: QuestionBlock with html_content
            if 'html_content' in first_question:
                for i, question in enumerate(data['questions']):
                    required_fields = ['section_number', 'question_range', 'html_content', 'text_content']
                    for field in required_fields:
                        if field not in question:
                            logger.error(f"Question block {i} missing required field: {field}")
                            return False
            
            # Legacy structure: ListeningQuestion with parsed fields
            elif 'question_number' in first_question:
                for i, question in enumerate(data['questions']):
                    required_fields = [
                        'question_number', 'section_number', 'question_type', 'ui_component',
                        'instructions', 'question_text'
                    ]
                    for field in required_fields:
                        if field not in question:
                            logger.error(f"Question {i} missing required field: {field}")
                            return False
            else:
                logger.error("Questions have unknown structure")
                return False
        
        # Check answer structure (support both new and legacy formats)
        if data['answers']:
            first_answer = data['answers'][0]
            
            # New structure: SimpleAnswer with answer_text and section_number
            if 'answer_text' in first_answer:
                for i, answer in enumerate(data['answers']):
                    required_fields = ['question_number', 'answer_text', 'section_number']
                    for field in required_fields:
                        if field not in answer:
                            logger.error(f"Answer {i} missing required field: {field}")
                            return False
            
            # Legacy structure: ListeningAnswer with correct_answer
            elif 'correct_answer' in first_answer:
                for i, answer in enumerate(data['answers']):
                    required_fields = ['question_number', 'correct_answer']
                    for field in required_fields:
                        if field not in answer:
                            logger.error(f"Answer {i} missing required field: {field}")
                            return False
            else:
                logger.error("Answers have unknown structure")
                return False
        
        # Check media file structure (if present)
        if 'media_files' in data and data['media_files']:
            for i, media_file in enumerate(data['media_files']):
                required_media_fields = ['section_number', 'file_path', 'file_size', 'format', 'url']
                for field in required_media_fields:
                    if field not in media_file:
                        logger.error(f"Media file {i} missing required field: {field}")
                        return False
        
        # Check validation structure
        required_validation_fields = ['is_valid', 'errors', 'warnings']
        for field in required_validation_fields:
            if field not in data['validation']:
                logger.error(f"Validation missing required field: {field}")
                return False
        
        logger.info("Schema validation passed")
        return True
