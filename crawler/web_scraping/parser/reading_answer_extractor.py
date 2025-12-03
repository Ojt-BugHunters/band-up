"""
Reading Answer Extractor Module

This module provides the ReadingAnswerExtractor class for extracting answer sections
from IELTS reading test HTML pages. It specifically targets the et_pb_section_3 structure
and et_pb_row_16 used by ieltstrainingonline.com.

Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 6.2, 6.5
"""

from bs4 import BeautifulSoup, Tag
from typing import Optional, List
import re

try:
    from .logging_config import get_logger
    from .exceptions import AnswerExtractionError, HTMLParsingError
except ImportError:
    from logging_config import get_logger
    from exceptions import AnswerExtractionError, HTMLParsingError

logger = get_logger(__name__)


class AnswerData:
    """Data class for storing extracted answer information."""
    
    def __init__(self, passage1_answers: str, passage2_answers: str, passage3_answers: str, raw_html: str = ""):
        self.passage1_answers = passage1_answers
        self.passage2_answers = passage2_answers
        self.passage3_answers = passage3_answers
        self.raw_html = raw_html
        
        # Parse answers into clean lists
        self.passage1_list = self._parse_answers_to_list(passage1_answers)
        self.passage2_list = self._parse_answers_to_list(passage2_answers)
        self.passage3_list = self._parse_answers_to_list(passage3_answers)
    
    def _parse_answers_to_list(self, html_content: str) -> List[str]:
        """
        Parse HTML answer content into a clean list of answer strings.
        
        Extracts text from each paragraph or line break, removes question numbers 
        and formatting, and returns a list of clean answer values.
        
        Handles two formats:
        1. Multiple <p> tags (one answer per paragraph)
        2. Single <p> tag with <br/> separators (answers separated by line breaks)
        
        Args:
            html_content: HTML string containing answers
            
        Returns:
            List of clean answer strings
        """
        if not html_content or not html_content.strip():
            return []
        
        # Parse HTML
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Find all paragraphs
        paragraphs = soup.find_all('p')
        
        answers = []
        
        for p in paragraphs:
            # Check if this paragraph contains <br/> tags (format 2)
            br_tags = p.find_all('br')
            
            if br_tags:
                # Format 2: Split by <br/> tags
                # Get all text segments separated by <br/>
                for element in p.children:
                    if element.name == 'br':
                        continue
                    
                    # Get text from this segment
                    if hasattr(element, 'get_text'):
                        text = element.get_text(separator=' ', strip=True)
                    else:
                        text = str(element).strip()
                    
                    if not text:
                        continue
                    
                    # Remove question numbers (e.g., "1. ", "14. ", etc.)
                    text = re.sub(r'^\d+\s+', '', text)
                    
                    # Remove notes in parentheses like "(capital optional)"
                    text = re.sub(r'\s*\([^)]*\)\s*', ' ', text)
                    
                    # Clean up extra whitespace
                    text = ' '.join(text.split())
                    
                    if text:
                        answers.append(text)
            else:
                # Format 1: One answer per <p> tag
                text = p.get_text(separator=' ', strip=True)
                
                if not text:
                    continue
                
                # Remove question numbers (e.g., "1. ", "14. ", etc.)
                text = re.sub(r'^\d+\.\s*', '', text)
                
                # Remove notes in parentheses like "(capital optional)"
                text = re.sub(r'\s*\([^)]*\)\s*', ' ', text)
                
                # Clean up extra whitespace
                text = ' '.join(text.split())
                
                if text:
                    answers.append(text)
        
        return answers
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            'passage1': self.passage1_answers,
            'passage2': self.passage2_answers,
            'passage3': self.passage3_answers
        }
    
    def to_dict_with_lists(self) -> dict:
        """
        Convert to dictionary with both HTML and list formats.
        
        Returns dictionary with:
        - passage1/2/3: HTML format (for display)
        - passage1_answers/2/3: List format (for scoring)
        """
        return {
            'passage1': {
                'html': self.passage1_answers,
                'answers': self.passage1_list
            },
            'passage2': {
                'html': self.passage2_answers,
                'answers': self.passage2_list
            },
            'passage3': {
                'html': self.passage3_answers,
                'answers': self.passage3_list
            }
        }


class ReadingAnswerExtractor:
    """
    Extracts answer sections from IELTS reading test HTML pages.
    
    This class targets the specific HTML structure used by ieltstrainingonline.com:
    - Answer section: et_pb_section et_pb_section_3 et_section_regular
    - Answer row: et_pb_row et_pb_row_16
    - Three columns within the row, each containing answers for one passage
    - Answer content in: et_pb_toggle_content clearfix
    
    Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
    """
    
    def __init__(self):
        """Initialize the ReadingAnswerExtractor."""
        logger.info("ReadingAnswerExtractor initialized")
    
    def find_answer_section(self, soup: BeautifulSoup) -> Optional[Tag]:
        """
        Find the answer section div.
        
        Searches for div with class "et_pb_section et_pb_section_3 et_section_regular".
        This is the standard location for answers on ieltstrainingonline.com.
        
        Requirement 3.1: Search for div with class "et_pb_section et_pb_section_3 et_section_regular"
        
        Args:
            soup: BeautifulSoup object of the page
            
        Returns:
            Tag object for et_pb_section_3, or None if not found
        """
        logger.info("Searching for answer section using et_pb_section_3 pattern")
        
        # Search for div with specific class pattern
        answer_section = soup.find('div', class_=lambda x: x and 
                                   'et_pb_section_3' in x and 
                                   'et_section_regular' in x)
        
        if answer_section:
            logger.info("Found answer section with class et_pb_section_3")
            return answer_section
        else:
            logger.warning("Could not find answer section with class et_pb_section_3")
            return None
    
    def find_answer_row(self, answer_section: Tag) -> Optional[Tag]:
        """
        Find the specific row containing answers.
        
        Searches for div with class "et_pb_row et_pb_row_16" within the answer section.
        This row typically contains three columns with answers for each passage.
        
        Requirement 3.2: Search for div with class "et_pb_row et_pb_row_16" within answer section
        
        Args:
            answer_section: Tag for et_pb_section_3
            
        Returns:
            Tag object for et_pb_row_16, or None if not found
        """
        if not answer_section:
            logger.warning("No answer section provided to find_answer_row")
            return None
        
        logger.debug("Searching for answer row using et_pb_row_16 pattern")
        
        # Search for div with specific class pattern
        answer_row = answer_section.find('div', class_=lambda x: x and 
                                        'et_pb_row_16' in x)
        
        if answer_row:
            logger.info("Found answer row with class et_pb_row_16")
            return answer_row
        else:
            logger.warning("Could not find answer row with class et_pb_row_16")
            return None

    def extract_answer_columns(self, answer_row: Tag) -> List[str]:
        """
        Extract answer content from the three columns.
        
        Finds three column divs within et_pb_row_16 and extracts content from
        "et_pb_toggle_content clearfix" divs. Preserves HTML formatting including
        lists, bold text, and line breaks.
        
        Requirements:
        - 3.3: Find three column divs within et_pb_row_16
        - 3.4: Extract content from "et_pb_toggle_content clearfix" divs
        - 3.5: Preserve HTML formatting (lists, bold, line breaks)
        - 3.6: Map columns to passages (column 1 → passage 1, etc.)
        
        Args:
            answer_row: Tag for et_pb_row_16
            
        Returns:
            List of 3 HTML strings (one per passage)
        """
        if not answer_row:
            logger.warning("No answer row provided to extract_answer_columns")
            return ["", "", ""]
        
        logger.info("Extracting answer columns from answer row")
        
        # Find all column divs within the row
        # Columns typically have class "et_pb_column"
        columns = answer_row.find_all('div', class_=lambda x: x and 'et_pb_column' in x, recursive=False)
        
        logger.debug(f"Found {len(columns)} columns in answer row")
        
        # Extract content from each column
        answer_contents = []
        
        for i, column in enumerate(columns[:3], start=1):  # Only take first 3 columns
            logger.debug(f"Processing column {i}")
            
            # Find et_pb_toggle_content divs within this column
            toggle_contents = column.find_all('div', class_=lambda x: x and 'et_pb_toggle_content' in x)
            
            if toggle_contents:
                # Combine all toggle content divs in this column
                column_html_parts = []
                for toggle in toggle_contents:
                    # Get the inner HTML content only (without the wrapper div)
                    inner_html = ''.join(str(child) for child in toggle.children)
                    column_html_parts.append(inner_html)
                
                column_html = '\n'.join(column_html_parts)
                answer_contents.append(column_html)
                logger.debug(f"Extracted {len(column_html)} characters from column {i}")
            else:
                # No toggle content found, try to extract all content from column
                logger.warning(f"No et_pb_toggle_content found in column {i}, extracting all column content")
                column_html = str(column)
                answer_contents.append(column_html)
        
        # Ensure we have exactly 3 answer strings (pad with empty strings if needed)
        while len(answer_contents) < 3:
            logger.warning(f"Only found {len(answer_contents)} columns, padding with empty string")
            answer_contents.append("")
        
        logger.info(f"Successfully extracted answers from {len(answer_contents)} columns")
        return answer_contents[:3]  # Return only first 3
    
    def extract_answers(self, soup: BeautifulSoup) -> AnswerData:
        """
        Extract answers for all three passages.
        
        This is the main entry point for answer extraction. It attempts to use
        the primary extraction method (et_pb_section_3 > et_pb_row_16) and falls
        back to alternative methods if needed.
        
        Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
        
        Args:
            soup: BeautifulSoup object of the page
            
        Returns:
            AnswerData object with answers for each passage
            
        Raises:
            AnswerExtractionError: If answers cannot be extracted
        """
        try:
            logger.info("Starting answer extraction")
            
            # Find the answer section
            answer_section = self.find_answer_section(soup)
            
            if not answer_section:
                logger.warning("Primary answer section not found, attempting fallback")
                return self._extract_answers_fallback(soup)
            
            # Find the answer row
            answer_row = self.find_answer_row(answer_section)
            
            if not answer_row:
                logger.warning("Primary answer row not found, attempting fallback")
                return self._extract_answers_fallback(soup)
            
            # Extract answer columns
            answer_columns = self.extract_answer_columns(answer_row)
            
            # Validate we got 3 columns
            if len(answer_columns) != 3:
                logger.error(f"Expected 3 answer columns, got {len(answer_columns)}")
                raise AnswerExtractionError(
                    f"Expected 3 answer columns, got {len(answer_columns)}",
                    context={"columns_found": len(answer_columns)}
                )
            
            # Create AnswerData object
            answer_data = AnswerData(
                passage1_answers=answer_columns[0],
                passage2_answers=answer_columns[1],
                passage3_answers=answer_columns[2],
                raw_html=str(answer_section)
            )
            
            logger.info("Successfully extracted answers using primary method")
            return answer_data
            
        except AnswerExtractionError:
            # Re-raise our custom exceptions
            raise
        except Exception as e:
            logger.error(f"Unexpected error extracting answers: {e}", exc_info=True)
            raise AnswerExtractionError(
                f"Unexpected error during answer extraction: {str(e)}"
            )
    
    def _extract_answers_fallback(self, soup: BeautifulSoup) -> AnswerData:
        """
        Fallback answer extraction method.
        
        This method is used when the primary extraction method fails. It searches for:
        1. Alternative row patterns if et_pb_row_16 not found
        2. "Answer" or "Answers" heading
        3. Content after heading
        
        Requirements:
        - 3.7: Search for alternative row patterns if et_pb_row_16 not found
        - 6.2: Look for "Answer" or "Answers" heading
        - 6.5: Log warnings about structural variations
        
        Args:
            soup: BeautifulSoup object of the page
            
        Returns:
            AnswerData object with answers for each passage
            
        Raises:
            AnswerExtractionError: If fallback extraction fails
        """
        logger.info("Using fallback answer extraction method")
        logger.warning("HTML structure variation detected - using fallback extraction")
        
        # Strategy 1: Look for "Answer" heading and find the section after it
        answer_heading_pattern = re.compile(r'answer.*reading.*test', re.IGNORECASE)
        all_headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        
        for heading in all_headings:
            heading_text = heading.get_text(separator=' ', strip=True)
            
            if answer_heading_pattern.search(heading_text):
                logger.info(f"Found answer heading: {heading_text}")
                
                # Find the next et_pb_section after this heading
                current = heading
                while current:
                    current = current.find_next('div', class_=lambda x: x and 'et_pb_section' in x)
                    if current:
                        # Check if this section has columns with passage answers
                        columns = current.find_all('div', class_=lambda x: x and 'et_pb_column' in x, recursive=False)
                        if not columns:
                            # Look deeper for columns
                            rows = current.find_all('div', class_=lambda x: x and 'et_pb_row' in x)
                            for row in rows:
                                columns = row.find_all('div', class_=lambda x: x and 'et_pb_column' in x, recursive=False)
                                if len(columns) >= 3:
                                    logger.info(f"Found answer section after heading with {len(columns)} columns")
                                    answer_columns = self.extract_answer_columns(row)
                                    
                                    if any(answer_columns):
                                        answer_data = AnswerData(
                                            passage1_answers=answer_columns[0],
                                            passage2_answers=answer_columns[1],
                                            passage3_answers=answer_columns[2],
                                            raw_html=str(current)
                                        )
                                        logger.info("Fallback extraction succeeded with heading-based section search")
                                        return answer_data
                        break
        
        # Strategy 2: Look for any et_pb_row within et_pb_section_3
        answer_section = self.find_answer_section(soup)
        
        if answer_section:
            # Try to find any row with columns
            all_rows = answer_section.find_all('div', class_=lambda x: x and 'et_pb_row' in x)
            
            for row in all_rows:
                logger.debug(f"Trying fallback with row: {row.get('class')}")
                
                # Look for columns in this row
                columns = row.find_all('div', class_=lambda x: x and 'et_pb_column' in x, recursive=False)
                
                if len(columns) >= 3:
                    logger.info(f"Found alternative row with {len(columns)} columns")
                    answer_columns = self.extract_answer_columns(row)
                    
                    if any(answer_columns):  # At least one column has content
                        answer_data = AnswerData(
                            passage1_answers=answer_columns[0],
                            passage2_answers=answer_columns[1],
                            passage3_answers=answer_columns[2],
                            raw_html=str(answer_section)
                        )
                        logger.info("Fallback extraction succeeded with alternative row pattern")
                        return answer_data
        
        # Strategy 3: Look for "Answer" or "Answers" heading (generic)
        answer_heading_pattern = re.compile(r'answers?', re.IGNORECASE)
        all_headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        
        for heading in all_headings:
            heading_text = heading.get_text(separator=' ', strip=True)
            
            if answer_heading_pattern.search(heading_text):
                logger.info(f"Found answer heading: {heading_text}")
                
                # Extract content after this heading
                content_after_heading = self._extract_content_after_heading(heading)
                
                if content_after_heading:
                    # Try to split into three passages
                    # Look for "Passage 1", "Passage 2", "Passage 3" markers
                    passage_answers = self._split_answers_by_passage(content_after_heading)
                    
                    if len(passage_answers) == 3:
                        answer_data = AnswerData(
                            passage1_answers=passage_answers[0],
                            passage2_answers=passage_answers[1],
                            passage3_answers=passage_answers[2],
                            raw_html=content_after_heading
                        )
                        logger.info("Fallback extraction succeeded with generic heading-based method")
                        return answer_data
        
        # Strategy 4: Look for et_pb_section_3 and extract all content
        if answer_section:
            logger.warning("Could not find structured answers, extracting all content from answer section")
            
            # Get all content from answer section
            all_content = str(answer_section)
            
            # Try to split by passage markers
            passage_answers = self._split_answers_by_passage(all_content)
            
            if len(passage_answers) == 3:
                answer_data = AnswerData(
                    passage1_answers=passage_answers[0],
                    passage2_answers=passage_answers[1],
                    passage3_answers=passage_answers[2],
                    raw_html=all_content
                )
                logger.info("Fallback extraction succeeded by splitting answer section content")
                return answer_data
            else:
                # Return all content in first passage, empty for others
                logger.warning("Could not split answers by passage, returning all content in passage1")
                answer_data = AnswerData(
                    passage1_answers=all_content,
                    passage2_answers="",
                    passage3_answers="",
                    raw_html=all_content
                )
                return answer_data
        
        # All strategies failed
        logger.error("All fallback extraction strategies failed")
        raise AnswerExtractionError(
            "Could not extract answers using any method",
            context={"strategies_tried": ["heading_section_search", "alternative_rows", "generic_heading", "section_content"]}
        )
    
    def _extract_content_after_heading(self, heading: Tag) -> str:
        """
        Extract HTML content after a heading until the next major section.
        
        Args:
            heading: BeautifulSoup Tag for the heading
            
        Returns:
            HTML content as string
        """
        content_elements = []
        current = heading.find_next_sibling()
        
        # Extract content until we hit another major heading or section
        while current:
            if isinstance(current, Tag):
                # Stop if we hit another major heading
                if current.name in ['h1', 'h2', 'h3']:
                    break
                
                # Stop if we hit another major section
                if current.name == 'div' and current.get('class'):
                    classes = ' '.join(current.get('class', []))
                    if 'et_pb_section' in classes and 'et_pb_section_3' not in classes:
                        break
                
                content_elements.append(str(current))
            
            current = current.find_next_sibling()
        
        return '\n'.join(content_elements)
    
    def _split_answers_by_passage(self, content: str) -> List[str]:
        """
        Split answer content by passage markers.
        
        Looks for markers like "Passage 1", "Passage 2", "Passage 3" or
        "Reading Passage 1", etc.
        
        Args:
            content: HTML content string
            
        Returns:
            List of HTML strings, one per passage
        """
        # Create a BeautifulSoup object to work with
        soup = BeautifulSoup(content, 'html.parser')
        
        # Find passage markers
        passage_pattern = re.compile(r'(?:reading\s+)?passage\s+([1-3])', re.IGNORECASE)
        
        # Find all elements that might contain passage markers
        all_elements = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'b'])
        
        passage_markers = []
        for element in all_elements:
            text = element.get_text(separator=' ', strip=True)
            match = passage_pattern.search(text)
            if match:
                passage_num = int(match.group(1))
                passage_markers.append((passage_num, element))
                logger.debug(f"Found passage {passage_num} marker: {text}")
        
        if len(passage_markers) < 3:
            logger.debug(f"Only found {len(passage_markers)} passage markers, cannot split")
            return []
        
        # Sort by passage number
        passage_markers.sort(key=lambda x: x[0])
        
        # Extract content between markers
        passage_contents = []
        
        for i, (passage_num, marker) in enumerate(passage_markers[:3]):
            # Find next marker (or end of content)
            if i + 1 < len(passage_markers):
                next_marker = passage_markers[i + 1][1]
            else:
                next_marker = None
            
            # Extract content between this marker and next
            passage_content = self._extract_content_between_elements(marker, next_marker)
            passage_contents.append(passage_content)
        
        return passage_contents
    
    def _extract_content_between_elements(self, start_element: Tag, end_element: Optional[Tag]) -> str:
        """
        Extract HTML content between two elements.
        
        Args:
            start_element: Starting element
            end_element: Ending element (or None for end of document)
            
        Returns:
            HTML content as string
        """
        content_elements = []
        current = start_element.find_next_sibling()
        
        while current and current != end_element:
            if isinstance(current, Tag):
                content_elements.append(str(current))
            current = current.find_next_sibling()
        
        return '\n'.join(content_elements)
