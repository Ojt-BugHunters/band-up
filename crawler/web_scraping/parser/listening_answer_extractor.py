"""
Listening Answer Extractor for IELTS Listening Content Parser.

This module extracts answer keys from listening test HTML content and maps them 
to question numbers. Handles various answer formats including lists, tables, 
and inline text specific to listening tests.
"""

import re
import logging
from typing import List, Optional
from bs4 import BeautifulSoup, Tag

try:
    from .listening_models import ListeningAnswer
    from .text_utils import TextUtils
    from .exceptions import AnswerExtractionError, HTMLParsingError
except ImportError:
    from listening_models import ListeningAnswer
    from text_utils import TextUtils
    from exceptions import AnswerExtractionError, HTMLParsingError


logger = logging.getLogger(__name__)


class ListeningAnswerExtractor:
    """
    Extracts answer keys from IELTS listening test HTML answer sections.
    
    Supports multiple answer formats:
    - Simple list format: "1. apartment", "2. Jones"
    - Letter answers: "1. A", "2. B", "3. C"
    - Word/phrase answers: "1. earthquake", "2. water supply"
    - Table format with question numbers and answers
    - Case variations and acceptable alternatives
    
    Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
    """
    
    def __init__(self):
        """Initialize the ListeningAnswerExtractor with regex patterns."""
        # Pattern for "1. ANSWER" or "1) ANSWER" or "1: ANSWER"
        self.answer_pattern = re.compile(
            r'^(\d+)[\.\):\s]+(.+)$',
            re.MULTILINE
        )
        
        # Pattern for range format "1-5: answer1, answer2, ..."
        self.range_pattern = re.compile(
            r'(\d+)[-–](\d+)[\.\):\s]+(.+)$',
            re.MULTILINE
        )
        
        # Column to section mapping for row 11
        self.column_to_section = {
            12: 1,  # et_pb_column_12 -> Section 1
            13: 2,  # et_pb_column_13 -> Section 2
            14: 3,  # et_pb_column_14 -> Section 3
            15: 4   # et_pb_column_15 -> Section 4
        }
        
        logger.info("Initialized ListeningAnswerExtractor")
    
    def _detect_answer_format(self, answer_section: Tag) -> str:
        """
        Detect the format of the answer section.
        
        Requirement 3.4: Detect answer format to route to appropriate extraction method
        Requirement 6.2: Analyze HTML structure to identify content sections
        
        Args:
            answer_section: BeautifulSoup Tag containing the answer section
            
        Returns:
            Format identifier string: 'toggle', 'list', 'table', 'paragraph', or 'unknown'
        """
        if not answer_section:
            return 'unknown'
        
        # Check for toggle sections (et_pb_toggle_content class)
        if answer_section.find(class_='et_pb_toggle_content'):
            logger.debug("Detected toggle format")
            return 'toggle'
        
        # Check for table structures
        if answer_section.find('table'):
            logger.debug("Detected table format")
            return 'table'
        
        # Check for list structures (ol, ul tags)
        if answer_section.find('ol') or answer_section.find('ul'):
            logger.debug("Detected list format")
            return 'list'
        
        # Check for paragraph format (plain text with patterns)
        # Look for multiple <p> tags with answer patterns
        paragraphs = answer_section.find_all('p')
        if paragraphs:
            # Check if paragraphs contain answer patterns
            for p in paragraphs[:5]:  # Check first 5 paragraphs
                text = TextUtils.extract_text_with_spacing(p, preserve_bullets=False)
                if self.answer_pattern.match(text):
                    logger.debug("Detected paragraph format")
                    return 'paragraph'
        
        # Default to paragraph format if we have text content
        text = TextUtils.extract_text_with_spacing(answer_section, preserve_bullets=False)
        if text:
            logger.debug("Defaulting to paragraph format")
            return 'paragraph'
        
        logger.warning("Could not detect answer format")
        return 'unknown'
    
    def extract_answers(self, answer_section: Tag) -> List[ListeningAnswer]:
        """
        Extract all answers from an answer section.
        
        Requirement 3.1: Extract all question-answer pairs
        Requirement 3.5: Validate answer count (should be 40 for listening)
        
        Args:
            answer_section: BeautifulSoup Tag containing the answer section
            
        Returns:
            List of ListeningAnswer objects
            
        Examples:
            Input HTML:
                <div>
                    <h2>Answers</h2>
                    <p>1. apartment</p>
                    <p>2. Jones</p>
                    <p>3. B</p>
                </div>
            
            Output:
                [
                    ListeningAnswer(question_number=1, correct_answer="apartment", acceptable_alternatives=["Apartment"]),
                    ListeningAnswer(question_number=2, correct_answer="Jones", acceptable_alternatives=["jones"]),
                    ListeningAnswer(question_number=3, correct_answer="B", acceptable_alternatives=[])
                ]
        """
        if not answer_section:
            logger.warning("No answer section provided")
            return []
        
        # Detect format first
        format_type = self._detect_answer_format(answer_section)
        logger.info(f"Detected answer format: {format_type}")
        
        # Route to appropriate extraction method based on format
        answers = []
        
        if format_type == 'toggle':
            answers = self._extract_from_toggle_section(answer_section)
        elif format_type == 'table':
            answers = self._extract_from_table_format(answer_section)
        elif format_type == 'list':
            answers = self._extract_from_list_format(answer_section)
        elif format_type == 'paragraph':
            answers = self._extract_from_paragraph_format(answer_section)
        
        # If first method fails, try fallback methods
        if not answers:
            logger.warning(f"Primary extraction method ({format_type}) failed, trying fallbacks")
            
            # Try all methods in order
            for method_name, method in [
                ('toggle', self._extract_from_toggle_section),
                ('table', self._extract_from_table_format),
                ('list', self._extract_from_list_format),
                ('paragraph', self._extract_from_paragraph_format)
            ]:
                if method_name != format_type:  # Skip the one we already tried
                    try:
                        answers = method(answer_section)
                        if answers:
                            logger.info(f"Fallback extraction succeeded with {method_name} format: {len(answers)} answers")
                            break
                    except Exception as e:
                        logger.debug(f"Fallback method {method_name} failed: {e}")
        
        if not answers:
            logger.warning("Could not extract answers from section using any method")
        else:
            logger.info(f"Successfully extracted {len(answers)} answers")
            
            # Add acceptable alternatives
            answers = self._add_acceptable_alternatives(answers)
            
            # Validate answer count (should be 40 for listening tests)
            validation = self.validate_answers(answers, expected_count=40)
            if not validation['is_valid']:
                logger.warning(f"Answer validation failed: {validation['errors']}")
            if validation['warnings']:
                logger.warning(f"Answer validation warnings: {validation['warnings']}")
        
        return answers
    
    def _extract_from_toggle_section(self, section: Tag) -> List[ListeningAnswer]:
        """
        Extract answers from toggle section format (et_pb_toggle_content).
        
        Requirement 3.1: Extract all question-answer pairs
        Requirement 3.2: Parse question number and answer text
        Requirement 3.4: Handle toggle sections format
        Requirement 2.1: Use TextUtils for spacing preservation
        
        Args:
            section: BeautifulSoup Tag containing the answer section
            
        Returns:
            List of ListeningAnswer objects
        """
        answers = []
        seen_questions = set()
        
        # Find all et_pb_toggle_content divs
        toggle_sections = section.find_all(class_='et_pb_toggle_content')
        
        if not toggle_sections:
            logger.debug("No toggle sections found")
            return []
        
        for toggle in toggle_sections:
            # First, try to extract from individual paragraphs/elements within toggle
            paragraphs = toggle.find_all(['p', 'li', 'div'])
            
            if paragraphs:
                # Process each paragraph separately
                for para in paragraphs:
                    text = TextUtils.extract_text_with_spacing(para)
                    
                    if not text:
                        continue
                    
                    # Try to match answer pattern
                    match = self.answer_pattern.match(text)
                    if match:
                        q_num = int(match.group(1))
                        
                        if q_num in seen_questions:
                            continue
                        
                        answer_text = match.group(2).strip()
                        answer_text = self.clean_answer_text(answer_text)
                        
                        if answer_text:
                            answers.append(ListeningAnswer(
                                question_number=q_num,
                                correct_answer=answer_text,
                                acceptable_alternatives=[]
                            ))
                            seen_questions.add(q_num)
                            logger.debug(f"Extracted toggle answer {q_num}: {answer_text}")
            else:
                # No paragraphs, extract from entire toggle text
                text = TextUtils.extract_text_with_spacing(toggle)
                
                if not text:
                    continue
                
                # Pattern 1: "1. Answer" or "1) Answer" or "1: Answer"
                for match in self.answer_pattern.finditer(text):
                    q_num = int(match.group(1))
                    
                    if q_num in seen_questions:
                        continue
                    
                    answer_text = match.group(2).strip()
                    
                    # Extract only the answer part (stop at next question number)
                    next_q_match = re.search(r'\s+\d+[\.\):\s]', answer_text)
                    if next_q_match:
                        answer_text = answer_text[:next_q_match.start()].strip()
                    
                    answer_text = self.clean_answer_text(answer_text)
                    
                    if answer_text:
                        answers.append(ListeningAnswer(
                            question_number=q_num,
                            correct_answer=answer_text,
                            acceptable_alternatives=[]
                        ))
                        seen_questions.add(q_num)
                        logger.debug(f"Extracted toggle answer {q_num}: {answer_text}")
                
                # Pattern 2: Range format "1-5: answer1, answer2, ..."
                for match in self.range_pattern.finditer(text):
                    start_num = int(match.group(1))
                    end_num = int(match.group(2))
                    answers_text = match.group(3)
                    
                    # Split by comma or semicolon
                    answer_list = re.split(r'[,;]', answers_text)
                    answer_list = [a.strip() for a in answer_list if a.strip()]
                    
                    # Map answers to question numbers
                    for i, answer_text in enumerate(answer_list):
                        q_num = start_num + i
                        if q_num <= end_num and q_num not in seen_questions:
                            answer_text = self.clean_answer_text(answer_text)
                            if answer_text:
                                answers.append(ListeningAnswer(
                                    question_number=q_num,
                                    correct_answer=answer_text,
                                    acceptable_alternatives=[]
                                ))
                                seen_questions.add(q_num)
                                logger.debug(f"Extracted toggle range answer {q_num}: {answer_text}")
        
        return answers
    
    def _extract_from_list_format(self, section: Tag) -> List[ListeningAnswer]:
        """
        Extract answers from list format (ol/ul elements).
        
        Requirement 3.1: Extract all question-answer pairs
        Requirement 3.2: Parse question number and answer text
        Requirement 3.4: Handle list format
        Requirement 2.1: Use TextUtils for spacing preservation
        
        Handles both "1. Answer" and "Question 1: Answer" formats.
        
        Args:
            section: BeautifulSoup Tag containing the answer section
            
        Returns:
            List of ListeningAnswer objects
        """
        answers = []
        seen_questions = set()
        
        # Find ol/ul elements in answer section
        lists = section.find_all(['ol', 'ul'])
        
        if lists:
            # Extract from list items
            for list_elem in lists:
                li_items = list_elem.find_all('li')
                
                for li in li_items:
                    # Extract text with proper spacing
                    text = TextUtils.extract_text_with_spacing(li)
                    
                    if not text:
                        continue
                    
                    # Try to match answer patterns
                    # Pattern 1: "1. Answer" or "1) Answer"
                    match = self.answer_pattern.match(text)
                    if match:
                        q_num = int(match.group(1))
                        
                        if q_num in seen_questions:
                            continue
                        
                        answer_text = match.group(2).strip()
                        answer_text = self.clean_answer_text(answer_text)
                        
                        if answer_text:
                            answers.append(ListeningAnswer(
                                question_number=q_num,
                                correct_answer=answer_text,
                                acceptable_alternatives=[]
                            ))
                            seen_questions.add(q_num)
                            logger.debug(f"Extracted list answer {q_num}: {answer_text}")
                        continue
                    
                    # Pattern 2: "Question 1: Answer" or "Q1: Answer"
                    question_pattern = re.match(r'(?:Question|Q)\s*(\d+)\s*:?\s*(.+)', text, re.IGNORECASE)
                    if question_pattern:
                        q_num = int(question_pattern.group(1))
                        
                        if q_num in seen_questions:
                            continue
                        
                        answer_text = question_pattern.group(2).strip()
                        answer_text = self.clean_answer_text(answer_text)
                        
                        if answer_text:
                            answers.append(ListeningAnswer(
                                question_number=q_num,
                                correct_answer=answer_text,
                                acceptable_alternatives=[]
                            ))
                            seen_questions.add(q_num)
                            logger.debug(f"Extracted list answer (Q format) {q_num}: {answer_text}")
        else:
            # No explicit list tags, try to extract from paragraphs as list items
            paragraphs = section.find_all('p')
            
            for p in paragraphs:
                text = TextUtils.extract_text_with_spacing(p)
                
                if not text or text.lower() in ['answers', 'answer key', 'answer', 'listening test answers']:
                    continue
                
                # Try to match answer pattern
                match = self.answer_pattern.match(text)
                if match:
                    q_num = int(match.group(1))
                    
                    if q_num in seen_questions:
                        continue
                    
                    answer_text = match.group(2).strip()
                    answer_text = self.clean_answer_text(answer_text)
                    
                    if answer_text:
                        answers.append(ListeningAnswer(
                            question_number=q_num,
                            correct_answer=answer_text,
                            acceptable_alternatives=[]
                        ))
                        seen_questions.add(q_num)
                        logger.debug(f"Extracted paragraph-list answer {q_num}: {answer_text}")
        
        return answers
    
    def _extract_from_table_format(self, section: Tag) -> List[ListeningAnswer]:
        """
        Extract answers from table format.
        
        Requirement 3.1: Extract all question-answer pairs
        Requirement 3.2: Parse question number and answer text
        Requirement 3.4: Handle table format
        Requirement 2.1: Use TextUtils for spacing preservation
        
        Handles HTML tables with question numbers in one column
        and answers in another column.
        
        Args:
            section: BeautifulSoup Tag containing the answer section
            
        Returns:
            List of ListeningAnswer objects
        """
        answers = []
        seen_questions = set()
        
        # Find table in the section
        table = section.find('table')
        if not table:
            logger.debug("No table found in section")
            return []
        
        logger.debug("Found table in answer section")
        
        # Find all rows
        rows = table.find_all('tr')
        
        for row in rows:
            cells = row.find_all(['td', 'th'])
            
            if len(cells) < 2:
                continue
            
            # First cell should be question number
            q_num_text = TextUtils.extract_text_with_spacing(cells[0])
            
            # Skip header rows
            if q_num_text.lower() in ['question', 'q', 'number', '#', 'answer', 'answers']:
                continue
            
            # Parse question number from various formats
            q_num = None
            
            # Try direct integer conversion
            try:
                q_num = int(q_num_text)
            except ValueError:
                # Try to extract number from text like "Q1", "Question 1", etc.
                num_match = re.search(r'\d+', q_num_text)
                if num_match:
                    q_num = int(num_match.group())
            
            if q_num is None or q_num in seen_questions:
                continue
            
            # Second cell should be the answer
            answer_text = TextUtils.extract_text_with_spacing(cells[1])
            answer_text = self.clean_answer_text(answer_text)
            
            if answer_text:
                answers.append(ListeningAnswer(
                    question_number=q_num,
                    correct_answer=answer_text,
                    acceptable_alternatives=[]
                ))
                seen_questions.add(q_num)
                logger.debug(f"Extracted table answer {q_num}: {answer_text}")
        
        return answers
    
    def _extract_from_paragraph_format(self, section: Tag) -> List[ListeningAnswer]:
        """
        Extract answers from paragraph format (plain text).
        
        Requirement 3.1: Extract all question-answer pairs
        Requirement 3.2: Parse question number and answer text
        Requirement 3.4: Handle paragraph format
        Requirement 2.1: Use TextUtils for spacing preservation
        
        Applies multiple regex patterns to find question-answer pairs.
        
        Args:
            section: BeautifulSoup Tag containing the answer section
            
        Returns:
            List of ListeningAnswer objects
        """
        answers = []
        seen_questions = set()
        
        # Extract all text from answer section with proper spacing
        text = TextUtils.extract_text_with_spacing(section)
        
        if not text:
            logger.debug("No text found in paragraph section")
            return []
        
        # Try multiple patterns (as specified in design doc)
        
        # First, check for range format "1-10: Answer1, Answer2, ..." (Pattern 3)
        # This needs to be checked first to avoid misinterpreting "1-5:" as question 5
        range_matches = list(self.range_pattern.finditer(text))
        if range_matches:
            for match in range_matches:
                start_num = int(match.group(1))
                end_num = int(match.group(2))
                answers_text = match.group(3)
                
                # Split by comma or semicolon
                answer_list = re.split(r'[,;]', answers_text)
                answer_list = [a.strip() for a in answer_list if a.strip()]
                
                # Map answers to question numbers
                for i, answer_text in enumerate(answer_list):
                    q_num = start_num + i
                    if q_num <= end_num and q_num not in seen_questions:
                        answer_text = self.clean_answer_text(answer_text)
                        if answer_text:
                            answers.append(ListeningAnswer(
                                question_number=q_num,
                                correct_answer=answer_text,
                                acceptable_alternatives=[]
                            ))
                            seen_questions.add(q_num)
                            logger.debug(f"Extracted paragraph answer (range format) {q_num}: {answer_text}")
        
        # Pattern 1: Find all question numbers and extract text between them
        # This handles formats like "1. apartment 2. Jones 3. B"
        # Skip this if we already found range format answers
        if not answers:
            question_positions = []
            for match in re.finditer(r'(\d+)[\.\):\s]+', text):
                q_num = int(match.group(1))
                start_pos = match.end()
                question_positions.append((q_num, start_pos, match.start()))
            
            if question_positions:
                # Extract answer for each question
                for i, (q_num, start_pos, q_start) in enumerate(question_positions):
                    if q_num in seen_questions:
                        continue
                    
                    # Find where this answer ends (at next question or end of text)
                    if i + 1 < len(question_positions):
                        end_pos = question_positions[i + 1][2]  # Start of next question marker
                    else:
                        end_pos = len(text)
                    
                    answer_text = text[start_pos:end_pos].strip()
                    answer_text = self.clean_answer_text(answer_text)
                    
                    if answer_text:
                        answers.append(ListeningAnswer(
                            question_number=q_num,
                            correct_answer=answer_text,
                            acceptable_alternatives=[]
                        ))
                        seen_questions.add(q_num)
                        logger.debug(f"Extracted paragraph answer (pattern 1) {q_num}: {answer_text}")
        
        # If pattern 1 didn't work well, try pattern 2: "Question 1: Answer text"
        if len(answers) < 5:  # Arbitrary threshold - if we got very few answers, try another pattern
            question_pattern = re.compile(r'[Qq]uestion\s+(\d+)\s*:?\s*(.+?)(?=[Qq]uestion\s+\d+|$)', re.DOTALL)
            
            for match in question_pattern.finditer(text):
                q_num = int(match.group(1))
                
                if q_num in seen_questions:
                    continue
                
                answer_text = match.group(2).strip()
                answer_text = self.clean_answer_text(answer_text)
                
                if answer_text:
                    answers.append(ListeningAnswer(
                        question_number=q_num,
                        correct_answer=answer_text,
                        acceptable_alternatives=[]
                    ))
                    seen_questions.add(q_num)
                    logger.debug(f"Extracted paragraph answer (pattern 2) {q_num}: {answer_text}")
        
        # Pattern 4: Just numbers and text in sequence "1 Answer"
        if len(answers) < 5:
            simple_pattern = re.compile(r'^\s*(\d+)\s+([A-Za-z].+?)(?=\s+\d+\s+[A-Za-z]|$)', re.MULTILINE)
            
            for match in simple_pattern.finditer(text):
                q_num = int(match.group(1))
                
                if q_num in seen_questions:
                    continue
                
                answer_text = match.group(2).strip()
                answer_text = self.clean_answer_text(answer_text)
                
                if answer_text:
                    answers.append(ListeningAnswer(
                        question_number=q_num,
                        correct_answer=answer_text,
                        acceptable_alternatives=[]
                    ))
                    seen_questions.add(q_num)
                    logger.debug(f"Extracted paragraph answer (pattern 4) {q_num}: {answer_text}")
        
        return answers
    
    def _clean_answer_text(self, text: str) -> str:
        """
        Clean and normalize answer text.
        
        Requirement 5.3: Extract single word/phrase answers
        Requirement 5.4: Extract letter choice answers (A, B, C)
        
        Args:
            text: Raw answer text
            
        Returns:
            Cleaned answer text
            
        Examples:
            "apartment." -> "apartment"
            "  B  " -> "B"
            "Jones (surname)" -> "Jones"
            "water supply" -> "water supply"
        """
        if not text:
            return ""
        
        # Remove trailing punctuation (except for answers that are sentences)
        text = text.strip()
        
        # Remove parenthetical notes like "(noun)", "(surname)", "(verb)"
        text = re.sub(r'\s*\([^)]*\)\s*$', '', text)
        
        # Remove trailing periods, commas (but keep them if part of the answer)
        if text.endswith('.') and len(text) > 2:
            # Only remove if it's clearly punctuation, not part of abbreviation
            if not text[-2].isupper():
                text = text[:-1].strip()
        
        # Remove trailing commas
        if text.endswith(','):
            text = text[:-1].strip()
        
        # Normalize whitespace
        text = ' '.join(text.split())
        
        # Uppercase single letter answers (A, B, C, D) - Requirement 5.4
        if len(text) == 1 and text.isalpha():
            text = text.upper()
        
        # Handle multi-letter answers like "AB" or "BC"
        if len(text) <= 3 and text.isalpha() and text.isupper():
            text = text.upper()
        
        return text
    
    def _add_acceptable_alternatives(self, answers: List[ListeningAnswer]) -> List[ListeningAnswer]:
        """
        Add acceptable alternative answers for case variations.
        
        Requirement 5.5: Store acceptable alternatives (case variations)
        
        For listening tests, common alternatives include:
        - Case variations: "apartment" -> ["Apartment", "APARTMENT"]
        - For letter answers: no alternatives needed (already uppercase)
        
        Args:
            answers: List of ListeningAnswer objects
            
        Returns:
            Updated list with acceptable_alternatives populated
        """
        for answer in answers:
            alternatives = []
            
            # Skip if answer is empty
            if not answer.correct_answer:
                continue
            
            # For single letter answers (A, B, C, D), no alternatives needed
            if len(answer.correct_answer) == 1 and answer.correct_answer.isalpha():
                continue
            
            # For multi-letter answers (AB, BC), no alternatives needed
            if len(answer.correct_answer) <= 3 and answer.correct_answer.isalpha() and answer.correct_answer.isupper():
                continue
            
            # For word/phrase answers, add case variations
            original = answer.correct_answer
            
            # Add capitalized version if original is lowercase
            if original.islower():
                alternatives.append(original.capitalize())
            
            # Add lowercase version if original is capitalized or mixed case
            if not original.islower():
                alternatives.append(original.lower())
            
            # Add title case for multi-word answers
            if ' ' in original:
                title_case = original.title()
                if title_case not in alternatives and title_case != original:
                    alternatives.append(title_case)
            
            # Add uppercase version for single words (less common but possible)
            if ' ' not in original and len(original) > 1:
                upper_case = original.upper()
                if upper_case not in alternatives and upper_case != original:
                    alternatives.append(upper_case)
            
            # Remove duplicates and the original answer from alternatives
            alternatives = [alt for alt in alternatives if alt != original]
            alternatives = list(dict.fromkeys(alternatives))  # Remove duplicates while preserving order
            
            answer.acceptable_alternatives = alternatives
            
            if alternatives:
                logger.debug(f"Added alternatives for Q{answer.question_number}: {alternatives}")
        
        return answers
    
    def extract_answers_from_row_11(self, answer_row: Tag) -> List[dict]:
        """
        Extract all 40 answers from row 11's four-column structure.
        
        This is the main entry point for extracting answers from the specific
        row 11 structure used in listening tests.
        
        Requirement 4.1: Locate row 11 with four-column structure
        Requirement 4.2: Identify columns 12, 13, 14, 15
        Requirement 4.3: Extract answers from each column
        
        Args:
            answer_row: BeautifulSoup Tag for row 11 (et_pb_row_11)
            
        Returns:
            List of dictionaries with keys: question_number, answer_text, section_number
            
        Example:
            [
                {'question_number': 1, 'answer_text': 'apartment', 'section_number': 1},
                {'question_number': 2, 'answer_text': 'Jones', 'section_number': 1},
                ...
            ]
        """
        if not answer_row:
            logger.warning("No answer row provided to extract_answers_from_row_11")
            return []
        
        # Verify this is row 11 with 4-column structure
        row_classes = answer_row.get('class', [])
        if 'et_pb_row_11' not in row_classes:
            logger.warning(f"Row does not have et_pb_row_11 class: {row_classes}")
        
        if 'et_pb_row_4col' not in row_classes:
            logger.warning(f"Row does not have et_pb_row_4col class: {row_classes}")
        
        # Find the four answer columns
        columns = self.find_answer_columns(answer_row)
        
        if not columns:
            logger.error("Could not find answer columns in row 11")
            return []
        
        logger.info(f"Found {len(columns)} answer columns in row 11")
        
        # Extract answers from each column
        all_answers = []
        for column_num, column_tag in columns.items():
            section_num = self.column_to_section.get(column_num)
            if section_num is None:
                logger.warning(f"Unknown column number: {column_num}")
                continue
            
            logger.debug(f"Extracting answers from column {column_num} (Section {section_num})")
            answers = self.extract_answers_from_column(column_tag, section_num)
            all_answers.extend(answers)
        
        logger.info(f"Extracted {len(all_answers)} total answers from row 11")
        return all_answers
    
    def find_answer_columns(self, answer_row: Tag) -> dict:
        """
        Find the four answer columns (12, 13, 14, 15) in row 11.
        
        Requirement 4.2: Identify columns with classes et_pb_column_1_4 et_pb_column_{12|13|14|15}
        
        Args:
            answer_row: BeautifulSoup Tag for row 11
            
        Returns:
            Dictionary mapping column number to Tag: {12: Tag, 13: Tag, 14: Tag, 15: Tag}
        """
        columns = {}
        
        # Search for columns with et_pb_column_1_4 class (quarter-width columns)
        column_divs = answer_row.find_all('div', class_='et_pb_column_1_4')
        
        logger.debug(f"Found {len(column_divs)} quarter-width columns")
        
        for col_div in column_divs:
            col_classes = col_div.get('class', [])
            
            # Look for et_pb_column_{num} class
            for cls in col_classes:
                if cls.startswith('et_pb_column_') and cls != 'et_pb_column_1_4':
                    # Extract column number
                    try:
                        col_num = int(cls.replace('et_pb_column_', ''))
                        if col_num in [12, 13, 14, 15]:
                            columns[col_num] = col_div
                            logger.debug(f"Found column {col_num}")
                    except ValueError:
                        continue
        
        # Verify we found all four columns
        expected_columns = [12, 13, 14, 15]
        missing = [col for col in expected_columns if col not in columns]
        if missing:
            logger.warning(f"Missing columns: {missing}")
        
        return columns
    
    def extract_answers_from_column(self, column: Tag, section_num: int) -> List[dict]:
        """
        Extract 10 answers from a single column.
        
        Requirement 4.3: Extract answers from et_pb_toggle_content div
        Requirement 4.4: Map answers to question numbers based on section
        
        Args:
            column: BeautifulSoup Tag for the column
            section_num: Section number (1-4)
            
        Returns:
            List of dictionaries with keys: question_number, answer_text, section_number
        """
        answers = []
        
        # Find et_pb_toggle_content div within column
        toggle_content = column.find('div', class_='et_pb_toggle_content')
        
        if not toggle_content:
            logger.warning(f"No et_pb_toggle_content found in column for section {section_num}")
            return []
        
        # Extract text from toggle content
        text = TextUtils.extract_text_with_spacing(toggle_content, preserve_bullets=False)
        
        if not text:
            logger.warning(f"No text found in toggle content for section {section_num}")
            return []
        
        logger.debug(f"Extracted text from section {section_num}: {text[:100]}...")
        
        # Calculate question number range for this section
        # Section 1: Q1-10, Section 2: Q11-20, Section 3: Q21-30, Section 4: Q31-40
        start_q = (section_num - 1) * 10 + 1
        end_q = section_num * 10
        
        # Find all question numbers and their positions in the text
        # This handles the case where all answers are on one line
        # Try two patterns: "1. answer" and "1 answer"
        question_positions = []
        
        # Pattern 1: "1. answer" (with period) - try this first
        period_matches = []
        for match in re.finditer(r'(\d+)\.\s*', text):
            q_num = int(match.group(1))
            # Only include question numbers in the expected range
            if start_q <= q_num <= end_q:
                period_matches.append((q_num, match.end()))
        
        # Pattern 2: "1 answer" (space only)
        space_matches = []
        for match in re.finditer(r'(\d+)\s+', text):
            q_num = int(match.group(1))
            # Only include question numbers in the expected range
            if start_q <= q_num <= end_q:
                space_matches.append((q_num, match.end()))
        
        # Choose the pattern that gives us exactly 10 matches (or closest to 10)
        # This avoids false positives like "10.15" being matched as question 10
        if len(period_matches) == 10:
            question_positions = period_matches
            logger.debug(f"Using period pattern (found {len(period_matches)} matches)")
        elif len(space_matches) == 10:
            question_positions = space_matches
            logger.debug(f"Using space pattern (found {len(space_matches)} matches)")
        elif len(period_matches) > len(space_matches):
            question_positions = period_matches
            logger.debug(f"Using period pattern (found {len(period_matches)} matches, space had {len(space_matches)})")
        else:
            question_positions = space_matches
            logger.debug(f"Using space pattern (found {len(space_matches)} matches, period had {len(period_matches)})")
        
        # Extract answer for each question
        for i, (q_num, start_pos) in enumerate(question_positions):
            # Find where this answer ends (at next question or end of text)
            if i + 1 < len(question_positions):
                # Calculate position of next question number
                next_q_num = question_positions[i + 1][0]
                next_q_str = str(next_q_num)
                # Find the start of the next question number in the text
                next_q_pos = text.find(next_q_str, start_pos)
                if next_q_pos != -1:
                    end_pos = next_q_pos
                else:
                    end_pos = question_positions[i + 1][1] - len(next_q_str) - 2
            else:
                end_pos = len(text)
            
            answer_text = text[start_pos:end_pos].strip()
            answer_text = self.clean_answer_text(answer_text)
            
            if answer_text:
                answers.append({
                    'question_number': q_num,
                    'answer_text': answer_text,
                    'section_number': section_num
                })
                logger.debug(f"Extracted answer Q{q_num}: {answer_text}")
        
        logger.info(f"Extracted {len(answers)} answers from section {section_num}")
        return answers
    
    def clean_answer_text(self, text: str) -> str:
        """
        Clean and normalize answer text.
        
        Requirement 4.5: Remove HTML tags, whitespace, parenthetical notes, normalize letter answers
        Requirement 5.3: Extract single word/phrase answers
        Requirement 5.4: Extract letter choice answers (A, B, C)
        
        Args:
            text: Raw answer text
            
        Returns:
            Cleaned answer text
            
        Examples:
            "apartment." -> "apartment"
            "  B  " -> "B"
            "Jones (surname)" -> "Jones"
            "water supply" -> "water supply"
            "<p>answer</p>" -> "answer"
        """
        if not text:
            return ""
        
        # Remove HTML tags using BeautifulSoup
        if '<' in text and '>' in text:
            soup = BeautifulSoup(text, 'html.parser')
            text = soup.get_text()
        
        # Remove trailing punctuation (except for answers that are sentences)
        text = text.strip()
        
        # Remove parenthetical notes like "(noun)", "(surname)", "(verb)"
        text = re.sub(r'\s*\([^)]*\)\s*', '', text)
        
        # Remove trailing periods, commas (but keep them if part of the answer)
        if text.endswith('.') and len(text) > 2:
            # Only remove if it's clearly punctuation, not part of abbreviation
            if not text[-2].isupper():
                text = text[:-1].strip()
        
        # Remove trailing commas
        if text.endswith(','):
            text = text[:-1].strip()
        
        # Normalize whitespace and newlines
        text = ' '.join(text.split())
        
        # Uppercase single letter answers (A, B, C, D) - Requirement 5.4
        if len(text) == 1 and text.isalpha():
            text = text.upper()
        
        # Handle multi-letter answers like "AB" or "BC"
        if len(text) <= 3 and text.isalpha():
            text = text.upper()
        
        # Handle range format within answer "8-10: A, E, F" - split on comma
        # This is handled in extract_answers_from_column, but clean individual parts here
        
        return text
    
    def validate_answer_count(self, answers: List[dict]) -> dict:
        """
        Validate that exactly 40 answers were extracted with correct structure.
        
        Requirement 4.7: Validate answer count
        Requirement 7.3: Check exactly 40 answers extracted
        
        Args:
            answers: List of answer dictionaries
            
        Returns:
            Dictionary with validation results containing:
                - is_valid: bool
                - errors: list of error messages
                - warnings: list of warning messages
                - section_counts: dict mapping section_number to count
        """
        validation = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'answer_count': len(answers),
            'section_counts': {1: 0, 2: 0, 3: 0, 4: 0}
        }
        
        if not answers:
            validation['is_valid'] = False
            validation['errors'].append("No answers extracted")
            return validation
        
        # Count answers per section
        for answer in answers:
            section_num = answer.get('section_number')
            if section_num in validation['section_counts']:
                validation['section_counts'][section_num] += 1
        
        # Check total count (should be 40)
        if len(answers) != 40:
            validation['is_valid'] = False
            validation['errors'].append(f"Expected 40 answers, found {len(answers)}")
        
        # Check each section has exactly 10 answers
        for section_num in [1, 2, 3, 4]:
            count = validation['section_counts'][section_num]
            if count != 10:
                validation['is_valid'] = False
                validation['errors'].append(
                    f"Section {section_num} has {count} answers, expected 10"
                )
        
        # Check question numbers are sequential 1-40
        q_numbers = [a['question_number'] for a in answers]
        sorted_numbers = sorted(q_numbers)
        expected_range = list(range(1, 41))
        
        if sorted_numbers != expected_range:
            missing = set(expected_range) - set(sorted_numbers)
            if missing:
                validation['is_valid'] = False
                validation['errors'].append(f"Missing question numbers: {sorted(missing)}")
            
            duplicates = [num for num in set(q_numbers) if q_numbers.count(num) > 1]
            if duplicates:
                validation['is_valid'] = False
                validation['errors'].append(f"Duplicate question numbers: {duplicates}")
        
        # Check for empty answers
        empty_answers = [a['question_number'] for a in answers if not a.get('answer_text')]
        if empty_answers:
            validation['is_valid'] = False
            validation['errors'].append(f"Empty answers for questions: {empty_answers}")
        
        logger.info(f"Answer validation: {validation}")
        return validation
    
    def validate_answers(self, answers: List[ListeningAnswer], expected_count: int = 40) -> dict:
        """
        Validate extracted answers for completeness and consistency.
        
        Args:
            answers: List of extracted answers
            expected_count: Expected number of answers (default: 40 for listening tests)
            
        Returns:
            Dictionary with validation results
        """
        validation = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'answer_count': len(answers),
            'question_numbers': [a.question_number for a in answers]
        }
        
        if not answers:
            validation['is_valid'] = False
            validation['errors'].append("No answers extracted")
            return validation
        
        # Check for duplicate question numbers
        q_numbers = [a.question_number for a in answers]
        duplicates = [num for num in set(q_numbers) if q_numbers.count(num) > 1]
        if duplicates:
            validation['is_valid'] = False
            validation['errors'].append(f"Duplicate question numbers: {duplicates}")
        
        # Check for sequential numbering (should be 1-40)
        sorted_numbers = sorted(q_numbers)
        expected_range = list(range(1, expected_count + 1))
        if sorted_numbers != expected_range:
            missing = set(expected_range) - set(sorted_numbers)
            if missing:
                validation['warnings'].append(f"Missing question numbers: {sorted(missing)}")
        
        # Check expected count (40 for listening tests)
        if len(answers) != expected_count:
            validation['warnings'].append(
                f"Expected {expected_count} answers, found {len(answers)}"
            )
        
        # Check for empty answers
        empty_answers = [a.question_number for a in answers if not a.correct_answer]
        if empty_answers:
            validation['is_valid'] = False
            validation['errors'].append(f"Empty answers for questions: {empty_answers}")
        
        logger.info(f"Answer validation: {validation}")
        return validation
