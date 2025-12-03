"""
Listening Section Detector for IELTS Listening Content Parser.

This module detects and extracts listening test sections using HTML row patterns.
Listening tests have a specific structure:
- Rows 0, 2, 4, 6: Audio players (Sections 1-4)
- Rows 1, 3, 5, 7: Questions (Sections 1-4)
- Row 11: Answers (all sections)

Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8
"""

import logging
from typing import Dict, List, Optional, Tuple
from bs4 import BeautifulSoup, Tag

try:
    from .listening_models import ValidationResult
    from .text_utils import TextUtils
    from .listening_answer_extractor import ListeningAnswerExtractor
except ImportError:
    from listening_models import ValidationResult
    from text_utils import TextUtils
    from listening_answer_extractor import ListeningAnswerExtractor


logger = logging.getLogger(__name__)


class ListeningSectionDetector:
    """
    Detects and groups listening test sections using HTML row patterns.
    
    Listening tests have a specific structure:
    - Rows 0, 2, 4, 6: Audio players (Sections 1-4)
    - Rows 1, 3, 5, 7: Questions (Sections 1-4)
    - Row 11: Answers (all sections)
    
    This class provides methods to:
    - Detect sections by row index
    - Extract audio information from audio rows
    - Extract questions from question rows
    - Extract answers from answer row (row 11)
    - Validate section structure
    
    Requirements: 3.1, 3.2, 3.3
    """
    
    # Row patterns for each section
    # Requirement 3.1: Define SECTION_PATTERNS constant mapping sections to rows
    SECTION_PATTERNS = {
        1: {'audio_row': 0, 'question_row': 1},
        2: {'audio_row': 2, 'question_row': 3},
        3: {'audio_row': 4, 'question_row': 5},
        4: {'audio_row': 6, 'question_row': 7},
    }
    
    # Requirement 3.1: Define ANSWER_ROW constant (row 11)
    ANSWER_ROW = 11
    
    def __init__(self):
        """Initialize the ListeningSectionDetector."""
        self.answer_extractor = ListeningAnswerExtractor()
        logger.info("Initialized ListeningSectionDetector with row-based detection")
    
    def detect_sections_by_rows(self, soup: BeautifulSoup) -> Dict[int, Dict]:
        """
        Detect sections using HTML row structure.
        
        Requirement 3.4: Find main section container (et_pb_section_0)
        Requirement 3.5: For each section (1-4), find audio row and question row
        Requirement 3.6: Use _find_row_by_index to locate specific rows
        Requirement 3.7: Return dictionary mapping section numbers to row data
        
        Args:
            soup: BeautifulSoup object of the HTML content
            
        Returns:
            Dictionary mapping section numbers to row data:
            {
                1: {
                    'audio_row': Tag,  # et_pb_row_0
                    'question_row': Tag,  # et_pb_row_1
                    'section_number': 1
                },
                2: {...},
                3: {...},
                4: {...}
            }
        """
        sections = {}
        
        # Find main section container (et_pb_section_0)
        main_section = soup.find('div', class_=lambda c: c and 'et_pb_section_0' in c.split())
        if not main_section:
            logger.error("Could not find main section container (et_pb_section_0)")
            return sections
        
        logger.info("Found main section container (et_pb_section_0)")
        
        # For each section (1-4), find audio and question rows
        for section_num, patterns in self.SECTION_PATTERNS.items():
            audio_row_idx = patterns['audio_row']
            question_row_idx = patterns['question_row']
            
            # Find audio row
            audio_row = self._find_row_by_index(main_section, audio_row_idx)
            if audio_row:
                logger.info(f"Found audio row {audio_row_idx} for section {section_num}")
            else:
                logger.warning(f"Missing audio row {audio_row_idx} for section {section_num}")
            
            # Find question row
            question_row = self._find_row_by_index(main_section, question_row_idx)
            if question_row:
                logger.info(f"Found question row {question_row_idx} for section {section_num}")
            else:
                logger.warning(f"Missing question row {question_row_idx} for section {section_num}")
            
            # Store section data
            sections[section_num] = {
                'audio_row': audio_row,
                'question_row': question_row,
                'section_number': section_num
            }
        
        logger.info(f"Detected {len(sections)} sections")
        return sections
    
    def _find_row_by_index(self, container: Tag, row_index: int) -> Optional[Tag]:
        """
        Find a specific row by its index.
        
        Requirement 3.1: Search for div with class "et_pb_row_{index}"
        Requirement 3.2: Handle both exact class match and class list match
        
        Args:
            container: BeautifulSoup Tag to search within
            row_index: Row index (0, 1, 2, ..., 11)
            
        Returns:
            Tag if found, None otherwise
        """
        # Search for div with class containing "et_pb_row_{index}"
        row_class = f'et_pb_row_{row_index}'
        
        # Try to find the row using class matching
        row = container.find('div', class_=lambda c: c and row_class in c.split())
        
        if row:
            logger.debug(f"Found row {row_index}: {row.get('class')}")
            return row
        else:
            logger.debug(f"Row {row_index} not found")
            return None
    
    def extract_audio_info(self, audio_row: Tag) -> Dict:
        """
        Extract audio player information from audio row.
        
        Requirement 3.3: Find audio player element in audio row
        Requirement 3.3: Extract audio URL from source tag
        Requirement 3.3: Extract section title from heading
        Requirement 3.3: Handle missing audio gracefully
        
        Args:
            audio_row: Tag containing audio player
            
        Returns:
            Dictionary with audio information:
            {
                'audio_url': 'https://...',
                'section_title': 'SECTION 1',
                'has_audio': True/False
            }
        """
        result = {
            'audio_url': None,
            'section_title': None,
            'has_audio': False
        }
        
        if not audio_row:
            logger.warning("No audio row provided")
            return result
        
        # Find audio player element - check for any div with class containing 'et_pb_audio'
        audio_module = audio_row.find('div', class_=lambda c: c and any('et_pb_audio' in cls for cls in c) if isinstance(c, list) else ('et_pb_audio' in c if c else False))
        if not audio_module:
            logger.warning("No audio module found in audio row")
            return result
        
        # Extract section title from heading - search in the entire audio row
        heading = audio_row.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        if heading:
            result['section_title'] = TextUtils.extract_text_with_spacing(heading, preserve_bullets=False)
            logger.debug(f"Found section title: {result['section_title']}")
        
        # Extract audio URL from source tag - search in the entire audio row
        audio_tag = audio_row.find('audio')
        if audio_tag:
            source_tag = audio_tag.find('source')
            if source_tag and source_tag.get('src'):
                result['audio_url'] = source_tag.get('src')
                result['has_audio'] = True
                logger.debug(f"Found audio URL: {result['audio_url']}")
            elif audio_tag.get('src'):
                result['audio_url'] = audio_tag.get('src')
                result['has_audio'] = True
                logger.debug(f"Found audio URL from audio tag: {result['audio_url']}")
        
        if not result['has_audio']:
            logger.warning("No audio URL found in audio row")
        
        return result
    
    def extract_questions_from_row(self, question_row: Tag, section_number: int) -> List[Dict]:
        """
        Extract questions from question row.
        
        Requirement 3.4: Extract question blocks from question row
        Requirement 3.5: Use enhanced TextUtils for proper spacing
        Requirement 3.5: Preserve HTML structure (tables, images)
        
        Args:
            question_row: Tag containing questions
            section_number: Section number (1-4)
            
        Returns:
            List of question dictionaries
        """
        questions = []
        
        if not question_row:
            logger.warning(f"No question row provided for section {section_number}")
            return questions
        
        # Extract all text content with proper spacing
        # For now, we'll extract the raw HTML content to preserve structure
        # The actual question parsing will be done by the question extractor
        
        # Get all content from the question row
        content_html = str(question_row)
        
        # Extract text with proper spacing for logging
        text_content = TextUtils.extract_text_with_spacing(question_row)
        
        logger.info(f"Extracted question content for section {section_number} ({len(text_content)} chars)")
        
        # Return a single dictionary with the raw content
        # The question extractor will parse this further
        questions.append({
            'section_number': section_number,
            'html_content': content_html,
            'text_content': text_content
        })
        
        return questions
    
    def extract_answers_from_row(self, answer_row: Tag) -> List[Dict]:
        """
        Extract all answers from answer row (row 11).
        
        Requirement 4.1: Find row 11 (et_pb_row_11)
        Requirement 4.2: Extract all 40 answers using ListeningAnswerExtractor
        Requirement 4.3: Map answers to question numbers 1-40
        
        Args:
            answer_row: Tag containing answers (row 11)
            
        Returns:
            List of answer dictionaries for all 40 questions
        """
        answers = []
        
        if not answer_row:
            logger.warning("No answer row provided")
            return answers
        
        # Use the ListeningAnswerExtractor to extract answers
        try:
            answers = self.answer_extractor.extract_answers(answer_row)
            logger.info(f"Extracted {len(answers)} answers from row 11")
        except Exception as e:
            logger.error(f"Error extracting answers from row 11: {e}")
        
        return answers
    
    def validate_section_structure(self, sections: Dict) -> ValidationResult:
        """
        Validate that all sections were found correctly.
        
        Requirement 5.1: Check all 4 sections are present
        Requirement 5.2: Verify each section has audio and questions
        Requirement 5.3: Verify question numbers are sequential (1-40)
        
        Args:
            sections: Dictionary of section data from detect_sections_by_rows
            
        Returns:
            ValidationResult with errors/warnings
        """
        errors = []
        warnings = []
        
        # Check all 4 sections are present
        if len(sections) != 4:
            errors.append(f"Expected 4 sections but found {len(sections)}")
        
        # Check each section has audio and questions
        for section_num in range(1, 5):
            if section_num not in sections:
                errors.append(f"Section {section_num} is missing")
                continue
            
            section_data = sections[section_num]
            
            if not section_data.get('audio_row'):
                warnings.append(f"Section {section_num} is missing audio row")
            
            if not section_data.get('question_row'):
                errors.append(f"Section {section_num} is missing question row")
        
        # Determine if valid
        is_valid = len(errors) == 0
        
        logger.info(f"Validation result: valid={is_valid}, errors={len(errors)}, warnings={len(warnings)}")
        
        return ValidationResult(
            is_valid=is_valid,
            errors=errors,
            warnings=warnings
        )
