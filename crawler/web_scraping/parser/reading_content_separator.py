"""
Reading Content Separator Module

This module provides the ReadingContentSeparator class for properly separating
reading test content into passages and questions, addressing the critical bug
where questions were mixed into passage paragraphs.
"""

from bs4 import BeautifulSoup, Tag
from typing import Dict, List, Tuple, Any, Optional
import re

try:
    from .text_utils import TextUtils
    from .logging_config import get_logger
except ImportError:
    from text_utils import TextUtils
    from logging_config import get_logger

logger = get_logger(__name__)


class ReadingContentSeparator:
    """
    Separates reading test content into passages and questions.
    
    Uses multiple strategies to identify boundaries:
    1. HTML structure (et_pb_section patterns)
    2. Question marker detection
    3. Content analysis
    
    This class addresses the critical bug where questions were being mixed
    into passage paragraphs, making proper content separation impossible.
    """
    
    # Question marker patterns - comprehensive list to detect where questions start
    QUESTION_MARKERS = [
        r'^Questions?\s+\d+',  # "Questions 1-5" or "Question 1"
        r'^Choose\s+the\s+correct',  # "Choose the correct..."
        r'^Choose\s+correct',  # "Choose correct..."
        r'^Write\s+(?:NO\s+MORE|ONE\s+WORD)',  # "Write NO MORE THAN..." or "Write ONE WORD..."
        r'^Complete\s+the',  # "Complete the..."
        r'^Label\s+the',  # "Label the..."
        r'^Match\s+',  # "Match the..." or "Match each..."
        r'^\d{1,2}[\.\)]\s+(?:What|Where|When|Who|Why|How|Which|Choose|Complete|Write|Label|Match|Do|Is|Are|Does)',  # Question number followed by question word
        r'^Do\s+the\s+following\s+statements',  # "Do the following statements..."
        r'^You\s+should\s+spend\s+about\s+\d+\s+minutes',  # Time instructions
        r'^In\s+boxes?\s+\d+',  # "In boxes 1-5..." or "In box 1..."
        r'^on\s+your\s+answer\s+sheet',  # Answer sheet instructions
    ]
    
    # Option pattern - detects multiple choice options (A, B, C, D, E)
    OPTION_PATTERN = r'^[A-E]\s+[A-Z]'
    
    def __init__(self):
        """Initialize the ReadingContentSeparator."""
        logger.info("ReadingContentSeparator initialized")
        
        # Compile regex patterns for efficiency
        self.question_marker_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.QUESTION_MARKERS]
        self.option_pattern = re.compile(self.OPTION_PATTERN)

    
    def separate_content(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """
        Separate reading test into passages and questions.
        
        This is the main method that orchestrates the separation process:
        1. Find passage boundaries using _find_passage_boundaries
        2. Extract paragraphs for each passage using _extract_passage_paragraphs
        3. Extract questions after passage content
        
        Args:
            soup: BeautifulSoup object containing the full reading test HTML
            
        Returns:
            Dictionary with structure:
            {
                'passages': [
                    {
                        'title': 'READING PASSAGE 1',
                        'paragraphs': ['para1', 'para2', ...],  # No questions
                        'images': [...]
                    },
                    ...
                ],
                'questions': [
                    {
                        'question_number': 1,
                        'question_text': '...',
                        'options': ['A: ...', 'B: ...'],
                        ...
                    },
                    ...
                ]
            }
            
        Example:
            >>> separator = ReadingContentSeparator()
            >>> with open('main.html', 'r') as f:
            ...     soup = BeautifulSoup(f.read(), 'html.parser')
            >>> result = separator.separate_content(soup)
            >>> len(result['passages'])
            3
            >>> len(result['passages'][0]['paragraphs'])
            8  # No questions mixed in
        """
        logger.info("Starting content separation")
        
        passages = []
        questions = []
        
        # Find all passage sections using boundary detection
        passage_boundaries = self._find_passage_boundaries(soup)
        logger.info(f"Found {len(passage_boundaries)} passage boundaries")
        
        # Extract paragraphs for each passage
        for i, (start_tag, end_tag) in enumerate(passage_boundaries, 1):
            logger.info(f"Extracting passage {i}")
            
            # Extract title
            title = self._extract_passage_title(start_tag)
            
            # Extract paragraphs (stops at question markers)
            paragraphs = self._extract_passage_paragraphs(start_tag, end_tag)
            
            # Extract images if present
            images = self._extract_images(start_tag, end_tag)
            
            passage_data = {
                'title': title,
                'paragraphs': paragraphs,
                'images': images,
                'passage_number': i
            }
            
            passages.append(passage_data)
            logger.info(f"Passage {i}: '{title}' with {len(paragraphs)} paragraphs")
        
        # Extract questions (everything after passages)
        if passage_boundaries:
            last_passage_end = passage_boundaries[-1][1]
            questions = self._extract_questions(last_passage_end)
            logger.info(f"Extracted {len(questions)} question blocks")
        
        result = {
            'passages': passages,
            'questions': questions
        }
        
        logger.info(f"Content separation complete: {len(passages)} passages, {len(questions)} question blocks")
        return result

    
    def _find_passage_boundaries(self, soup: BeautifulSoup) -> List[Tuple[Tag, Tag]]:
        """
        Find start and end tags for each passage.
        
        Strategy:
        1. Look for "READING PASSAGE 1/2/3" headings
        2. Find where passage ends (question markers or next passage)
        3. Return (start_tag, end_tag) tuples
        
        Args:
            soup: BeautifulSoup object containing the reading test HTML
            
        Returns:
            List of (start_tag, end_tag) tuples, one for each passage
            
        Example:
            >>> boundaries = separator._find_passage_boundaries(soup)
            >>> len(boundaries)
            3  # Three passages
            >>> boundaries[0][0].get_text()
            'READING PASSAGE 1'
        """
        boundaries = []
        
        # Pattern to match "READING PASSAGE 1", "READING PASSAGE 2", etc.
        passage_heading_pattern = re.compile(r'READING\s+PASSAGE\s+[1-3]', re.IGNORECASE)
        
        # Find all headings that mark passage starts
        passage_headings = []
        for heading in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
            heading_text = heading.get_text(separator=' ', strip=True)
            if passage_heading_pattern.search(heading_text):
                passage_headings.append(heading)
                logger.debug(f"Found passage heading: {heading_text}")
        
        # For each passage heading, find its boundaries
        for i, start_heading in enumerate(passage_headings):
            start_tag = start_heading
            
            # Find end tag: either the next passage heading or a question marker
            end_tag = None
            
            # Check if there's a next passage
            if i + 1 < len(passage_headings):
                # End is just before the next passage
                end_tag = passage_headings[i + 1]
            else:
                # This is the last passage, find where questions start
                # Look for question markers, but skip instruction text
                seen_content = False
                for element in start_heading.find_all_next():
                    if isinstance(element, Tag):
                        element_text = element.get_text(separator=' ', strip=True)
                        
                        # Skip instruction text
                        if self._is_instruction_text(element_text):
                            continue
                        
                        # Track if we've seen actual content (paragraphs with substantial text)
                        if element.name == 'p' and len(element_text) > 50:
                            seen_content = True
                        
                        # Check if this is a question marker (only after seeing content)
                        if seen_content and self._is_question_marker(element_text):
                            end_tag = element
                            logger.debug(f"Found question marker as end boundary: {element_text[:50]}")
                            break
                
                # If no question marker found, use a large search area
                if end_tag is None:
                    # Find the parent section or use a far-ahead element
                    parent_section = start_heading.find_parent(['div', 'section', 'article'])
                    if parent_section:
                        # Use the end of the parent section
                        all_in_section = parent_section.find_all()
                        if all_in_section:
                            end_tag = all_in_section[-1]
                        else:
                            end_tag = parent_section
                    else:
                        # Use the last element in the document
                        end_tag = soup.find_all()[-1] if soup.find_all() else start_heading
            
            boundaries.append((start_tag, end_tag))
            logger.debug(f"Passage {i+1} boundary: {start_tag.name} to {end_tag.name if end_tag else 'None'}")
        
        return boundaries

    
    def _extract_passage_paragraphs(self, start_tag: Tag, end_tag: Tag) -> List[str]:
        """
        Extract paragraphs between start and end tags.
        
        Stops extraction when:
        - Question marker detected (but not in instruction text)
        - Option pattern detected
        - End tag reached
        
        Filters out:
        - Very short lines (<20 chars) that are just labels
        - Question instructions
        - Answer options
        
        Args:
            start_tag: Tag where passage starts (e.g., "READING PASSAGE 1" heading)
            end_tag: Tag where passage ends (next passage or question marker)
            
        Returns:
            List of paragraph strings (clean passage content only)
            
        Example:
            >>> paragraphs = separator._extract_passage_paragraphs(start_tag, end_tag)
            >>> len(paragraphs)
            8
            >>> 'Questions' in paragraphs[0]
            False  # No questions mixed in
        """
        paragraphs = []
        seen_passage_content = False  # Track if we've started seeing actual passage content
        
        # Iterate through elements between start and end tags
        current = start_tag
        while current and current != end_tag:
            current = current.find_next()
            
            if not current or current == end_tag:
                break
            
            # Only process paragraph tags and list items
            if current.name in ['p', 'li']:
                # Extract text using enhanced TextUtils
                text = TextUtils.extract_text_with_spacing(current, preserve_bullets=True)
                
                if not text:
                    continue
                
                # Filter out instruction text first (before checking question markers)
                if self._is_instruction_text(text):
                    logger.debug(f"Skipping instruction text: {text[:50]}")
                    continue
                
                # Stop when question marker detected (but only after we've seen passage content)
                # This prevents stopping at "Questions 1-13" in the instruction
                if seen_passage_content and self._is_question_marker(text):
                    logger.debug(f"Stopping extraction at question marker: {text[:50]}")
                    break
                
                # Stop when option pattern detected
                if self._is_option_text(text):
                    logger.debug(f"Stopping extraction at option: {text[:50]}")
                    break
                
                # Filter out very short lines (<20 chars) that are just labels like "A", "B", etc.
                if len(text) < 20:
                    logger.debug(f"Skipping short line: {text}")
                    continue
                
                # This is valid passage content
                paragraphs.append(text)
                seen_passage_content = True
                logger.debug(f"Extracted paragraph: {text[:50]}...")
            
            # Handle unordered/ordered lists
            elif current.name in ['ul', 'ol']:
                # Extract list items using TextUtils
                list_items = TextUtils.extract_list_items(current)
                
                for item in list_items:
                    # Check each item for question markers
                    if self._is_question_marker(item) or self._is_option_text(item):
                        logger.debug(f"Stopping extraction at list item: {item[:50]}")
                        break
                    
                    if len(item) >= 20:  # Apply same length filter
                        paragraphs.append(item)
                        seen_passage_content = True
                        logger.debug(f"Extracted list item: {item[:50]}...")
        
        logger.info(f"Extracted {len(paragraphs)} paragraphs from passage")
        return paragraphs

    
    def _is_question_marker(self, text: str) -> bool:
        """
        Check if text matches question marker patterns.
        
        This method checks the text against all compiled question marker patterns
        to determine if it indicates the start of a question section.
        
        Args:
            text: Text to check
            
        Returns:
            True if text matches any question marker pattern, False otherwise
            
        Example:
            >>> separator._is_question_marker("Questions 1-5")
            True
            >>> separator._is_question_marker("Choose the correct answer")
            True
            >>> separator._is_question_marker("This is passage content")
            False
        """
        if not text:
            return False
        
        # Check against all compiled patterns
        for pattern in self.question_marker_patterns:
            if pattern.search(text):
                logger.debug(f"Question marker detected: {text[:50]}")
                return True
        
        return False

    
    def _is_option_text(self, text: str) -> bool:
        """
        Check if text matches option pattern.
        
        Detects multiple choice options that start with "A ", "B ", "C ", "D ", or "E "
        followed by a capital letter (indicating the start of the option text).
        
        Args:
            text: Text to check
            
        Returns:
            True if text is an option, False otherwise
            
        Example:
            >>> separator._is_option_text("A The first option")
            True
            >>> separator._is_option_text("B Another choice")
            True
            >>> separator._is_option_text("This is passage content")
            False
        """
        if not text:
            return False
        
        # Check against the option pattern
        if self.option_pattern.match(text):
            logger.debug(f"Option text detected: {text[:50]}")
            return True
        
        return False

    
    def _extract_passage_title(self, start_tag: Tag) -> str:
        """
        Extract the passage title from the start tag.
        
        Args:
            start_tag: Tag containing the passage heading
            
        Returns:
            Passage title string
        """
        # Get text from the heading
        heading_text = start_tag.get_text(separator=' ', strip=True)
        
        # Check if there's a title after "READING PASSAGE X"
        # Pattern: "READING PASSAGE 1: Title" or "READING PASSAGE 1 Title"
        title_match = re.sub(r'READING\s+PASSAGE\s+[1-3]\s*:?\s*', '', heading_text, flags=re.IGNORECASE)
        
        if title_match.strip():
            return title_match.strip()
        
        # Look for the next heading which might be the title
        next_heading = start_tag.find_next(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        if next_heading:
            next_text = next_heading.get_text(separator=' ', strip=True)
            # Make sure it's not a question marker
            if not self._is_question_marker(next_text) and len(next_text) < 100:
                return next_text
        
        # Default: extract passage number and return generic title
        passage_num_match = re.search(r'PASSAGE\s+([1-3])', heading_text, re.IGNORECASE)
        if passage_num_match:
            return f"READING PASSAGE {passage_num_match.group(1)}"
        
        return "Untitled Passage"
    
    def _extract_images(self, start_tag: Tag, end_tag: Tag) -> List[str]:
        """
        Extract image URLs from the passage section.
        
        Args:
            start_tag: Tag where passage starts
            end_tag: Tag where passage ends
            
        Returns:
            List of image URLs
        """
        images = []
        
        # Find all img tags between start and end
        current = start_tag
        while current and current != end_tag:
            current = current.find_next()
            
            if not current or current == end_tag:
                break
            
            if current.name == 'img':
                src = current.get('src', '')
                if src:
                    images.append(src)
                    logger.debug(f"Found image: {src}")
        
        return images
    
    def _extract_questions(self, last_passage_end: Tag) -> List[Dict[str, Any]]:
        """
        Extract questions that come after all passages.
        
        Args:
            last_passage_end: Tag where the last passage ends
            
        Returns:
            List of question dictionaries
        """
        questions = []
        
        # Find all elements after the last passage
        current = last_passage_end
        current_question = None
        
        while current:
            current = current.find_next()
            
            if not current:
                break
            
            # Check if this is a question block heading
            if current.name in ['h2', 'h3', 'h4', 'h5', 'strong', 'b']:
                text = current.get_text(separator=' ', strip=True)
                
                if self._is_question_marker(text):
                    # Save previous question if exists
                    if current_question:
                        questions.append(current_question)
                    
                    # Start new question block
                    current_question = {
                        'instruction': text,
                        'content': []
                    }
                    logger.debug(f"Found question block: {text[:50]}")
            
            # Add content to current question block
            elif current_question and current.name in ['p', 'ul', 'ol', 'table']:
                content_html = str(current)
                current_question['content'].append(content_html)
        
        # Add the last question if exists
        if current_question:
            questions.append(current_question)
        
        return questions
    
    def _is_instruction_text(self, text: str) -> bool:
        """
        Check if text is an instruction rather than passage content.
        
        Args:
            text: Text to check
            
        Returns:
            True if text appears to be an instruction, False otherwise
        """
        instruction_patterns = [
            r'^You\s+should\s+spend',  # "You should spend about 20 minutes..."
            r'^based\s+on\s+Reading\s+Passage',  # "based on Reading Passage 1"
            r'^Reading\s+Passage\s+\d+\s+has',  # "Reading Passage 1 has..."
            r'^Answer\s+the\s+questions',  # "Answer the questions below"
        ]
        
        for pattern in instruction_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        
        return False
