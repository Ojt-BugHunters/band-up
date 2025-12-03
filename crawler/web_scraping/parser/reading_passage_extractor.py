"""
Reading Passage Extractor Module

This module provides the ReadingPassageExtractor class for extracting reading passages
from IELTS reading test HTML pages. It specifically targets the et_pb_section_0/1/2
structure used by ieltstrainingonline.com.
"""

from bs4 import BeautifulSoup, Tag
from typing import List, Optional, Tuple
from urllib.parse import urljoin
import re

try:
    from .logging_config import get_logger
    from .exceptions import ContentExtractionError, HTMLParsingError
except ImportError:
    from logging_config import get_logger
    from exceptions import ContentExtractionError, HTMLParsingError

logger = get_logger(__name__)


class PassageData:
    """Data class for storing extracted passage information."""
    
    def __init__(self, title: str, order_index: int, content: str, images: List[str] = None):
        self.title = title
        self.order_index = order_index
        self.content = content
        self.images = images or []
        self.word_count = self._calculate_word_count(content)
    
    def _calculate_word_count(self, html_content: str) -> int:
        """Calculate word count from HTML content."""
        soup = BeautifulSoup(html_content, 'html.parser')
        text = soup.get_text(separator=' ', strip=True)
        words = text.split()
        return len(words)
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            'title': self.title,
            'orderIndex': self.order_index,
            'content': self.content,
            'images': self.images,
            'wordCount': self.word_count
        }


class ReadingPassageExtractor:
    """
    Extracts reading passages from IELTS reading test HTML pages.
    
    This class targets the specific HTML structure used by ieltstrainingonline.com:
    - Passage 1: et_pb_section et_pb_section_0 et_section_regular
    - Passage 2: et_pb_section et_pb_section_1 et_section_regular
    - Passage 3: et_pb_section et_pb_section_2 et_section_regular
    """
    
    def __init__(self, base_url: str = ""):
        """
        Initialize the ReadingPassageExtractor.
        
        Args:
            base_url: Base URL for converting relative URLs to absolute URLs
        """
        self.base_url = base_url
        logger.info("ReadingPassageExtractor initialized")
    
    def find_passage_sections(self, soup: BeautifulSoup) -> List[Tag]:
        """
        Find the three passage section divs.
        
        Searches for divs with classes:
        - et_pb_section et_pb_section_0 et_section_regular (Passage 1)
        - et_pb_section et_pb_section_1 et_section_regular (Passage 2)
        - et_pb_section et_pb_section_2 et_section_regular (Passage 3)
        
        Note: Some pages may not have all three sections as separate divs.
        In such cases, this method will raise an exception and the fallback
        method should be used.
        
        Args:
            soup: BeautifulSoup object of the page
            
        Returns:
            List of 3 Tag objects for et_pb_section_0/1/2
            
        Raises:
            HTMLParsingError: If sections cannot be found
        """
        logger.info("Searching for passage sections using et_pb_section_N pattern")
        sections = []
        
        # Find all sections with et_section_regular class
        all_sections = soup.find_all('div', class_=lambda x: x and 
                                     'et_pb_section' in x and 
                                     'et_section_regular' in x)
        
        for section in all_sections:
            # Skip sections that are headers/menus (tests 107-111 have header as et_pb_section_0)
            section_classes = ' '.join(section.get('class', []))
            if 'et_pb_section--with-menu' in section_classes or '_tb_header' in section_classes:
                logger.debug(f"Skipping section - appears to be header/menu")
                continue
            
            # This is a valid passage section
            sections.append(section)
            logger.debug(f"Found passage section: {section.get('class')}")
            
            # Stop after finding 3 passages
            if len(sections) >= 3:
                break
        
        if len(sections) != 3:
            logger.warning(f"Expected 3 passage sections, found {len(sections)}. Will use fallback method.")
            raise HTMLParsingError(
                f"Expected 3 passage sections, found {len(sections)}",
                context={"sections_found": len(sections)}
            )
        
        logger.info("Successfully found all 3 passage sections using et_pb_section_N pattern")
        return sections
    
    def extract_title(self, section: Tag) -> str:
        """
        Extract title from heading elements (h1-h6).
        
        Skips headings that are just "READING PASSAGE X" and looks for the actual title.
        
        Args:
            section: BeautifulSoup Tag for the passage section
            
        Returns:
            The passage title as a string
        """
        # Find all heading elements
        headings = section.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        
        for heading in headings:
            title = heading.get_text(separator=' ', strip=True)
            
            # Skip headings that are just "READING PASSAGE X" or "Questions X-Y"
            if re.match(r'^READING\s+PASSAGE\s+[1-3]\s*$', title, flags=re.IGNORECASE):
                continue
            if re.match(r'^Questions?\s+\d', title, flags=re.IGNORECASE):
                continue
            
            # Remove "READING PASSAGE X:" prefix if present
            title = re.sub(r'^READING\s+PASSAGE\s+[1-3]\s*:?\s*', '', title, flags=re.IGNORECASE)
            
            if title.strip():
                logger.debug(f"Extracted title: {title}")
                return title.strip()
        
        logger.warning("No title found in section, using default")
        return "Untitled Passage"
    
    def extract_images(self, section: Tag) -> List[str]:
        """
        Extract image URLs and convert to absolute URLs.
        
        Args:
            section: BeautifulSoup Tag for the passage section
            
        Returns:
            List of absolute image URLs
        """
        images = []
        img_tags = section.find_all('img')
        
        for img in img_tags:
            src = img.get('src')
            if src:
                # Convert relative URL to absolute URL
                absolute_url = urljoin(self.base_url, src)
                images.append(absolute_url)
                logger.debug(f"Found image: {absolute_url}")
        
        logger.info(f"Extracted {len(images)} images from section")
        return images
    
    def extract_content(self, section: Tag) -> str:
        """
        Extract all HTML content (paragraphs, lists, tables) while preserving structure.
        
        Args:
            section: BeautifulSoup Tag for the passage section
            
        Returns:
            HTML content as string with all tags preserved
        """
        # Get the inner HTML content
        content_html = str(section)
        
        logger.debug(f"Extracted content: {len(content_html)} characters")
        return content_html
    
    def extract_single_passage(self, section: Tag, passage_number: int) -> PassageData:
        """
        Extract a single passage from its section div.
        
        Args:
            section: BeautifulSoup Tag for et_pb_section_N
            passage_number: 1, 2, or 3
            
        Returns:
            PassageData object with title and content
            
        Raises:
            ContentExtractionError: If extraction fails
        """
        try:
            logger.info(f"Extracting passage {passage_number}")
            
            # Extract title
            title = self.extract_title(section)
            
            # Extract content (preserve all HTML)
            content = self.extract_content(section)
            
            # Extract images
            images = self.extract_images(section)
            
            # Create PassageData object
            passage = PassageData(
                title=title,
                order_index=passage_number,
                content=content,
                images=images
            )
            
            logger.info(f"Successfully extracted passage {passage_number}: '{title}' ({passage.word_count} words)")
            return passage
            
        except Exception as e:
            logger.error(f"Failed to extract passage {passage_number}: {e}", exc_info=True)
            raise ContentExtractionError(
                f"Failed to extract passage {passage_number}: {str(e)}",
                context={"passage_number": passage_number}
            )
    
    def extract_passages(self, soup: BeautifulSoup) -> List[PassageData]:
        """
        Extract all three passages from HTML.
        
        Args:
            soup: BeautifulSoup object of the page
            
        Returns:
            List of PassageData objects (should be 3)
            
        Raises:
            HTMLParsingError: If passages cannot be extracted
            ContentExtractionError: If extraction fails
        """
        try:
            # Find the three passage sections
            sections = self.find_passage_sections(soup)
            
            # Extract each passage
            passages = []
            for i, section in enumerate(sections, start=1):
                passage = self.extract_single_passage(section, i)
                passages.append(passage)
            
            logger.info(f"Successfully extracted {len(passages)} passages")
            return passages
            
        except (HTMLParsingError, ContentExtractionError):
            # Re-raise our custom exceptions
            raise
        except Exception as e:
            logger.error(f"Unexpected error extracting passages: {e}", exc_info=True)
            raise ContentExtractionError(
                f"Unexpected error during passage extraction: {str(e)}"
            )
    
    def extract_passages_with_fallback(self, soup: BeautifulSoup) -> List[PassageData]:
        """
        Extract passages using primary method, with fallback if needed.
        
        Args:
            soup: BeautifulSoup object of the page
            
        Returns:
            List of PassageData objects
        """
        try:
            # Try primary extraction method
            return self.extract_passages(soup)
        except (HTMLParsingError, ContentExtractionError) as e:
            logger.warning(f"Primary extraction failed: {e}. Attempting fallback method.")
            return self._extract_passages_fallback(soup)
    
    def _extract_passages_fallback(self, soup: BeautifulSoup) -> List[PassageData]:
        """
        Fallback extraction method using "READING PASSAGE 1/2/3" headings.
        
        Searches for headings containing "READING PASSAGE 1", "READING PASSAGE 2", etc.
        and extracts content between consecutive passage headings.
        
        Args:
            soup: BeautifulSoup object of the page
            
        Returns:
            List of PassageData objects
            
        Raises:
            ContentExtractionError: If fallback extraction fails
        """
        logger.info("Using fallback extraction method")
        
        # Find passage headings
        passage_headings = self._find_passage_headings(soup)
        
        # Validate we found all 3 passages
        if len(passage_headings) < 3:
            logger.error(f"Fallback method found only {len(passage_headings)} passage headings")
            raise ContentExtractionError(
                f"Fallback extraction found only {len(passage_headings)} passages",
                context={"passages_found": len(passage_headings)}
            )
        
        # Sort by passage number
        passage_headings.sort(key=lambda x: x[0])
        
        # Extract each passage
        passages = []
        for i, (passage_num, heading) in enumerate(passage_headings):
            passage = self._extract_passage_from_heading(passage_num, heading, passage_headings, i)
            passages.append(passage)
        
        logger.info(f"Fallback method successfully extracted {len(passages)} passages")
        logger.warning("Used fallback extraction method - HTML structure may have variations")
        
        return passages
    
    def _find_passage_headings(self, soup: BeautifulSoup) -> List[Tuple[int, Tag]]:
        """Find all headings that match 'READING PASSAGE X' pattern."""
        passage_pattern = re.compile(r'READING\s+PASSAGE\s+([1-3])', re.IGNORECASE)
        all_headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        passage_headings = []
        
        for heading in all_headings:
            text = heading.get_text(separator=' ', strip=True)
            match = passage_pattern.search(text)
            if match:
                passage_num = int(match.group(1))
                passage_headings.append((passage_num, heading))
                logger.debug(f"Found passage {passage_num} heading: {text}")
        
        return passage_headings
    
    def _extract_passage_from_heading(
        self, 
        passage_num: int, 
        heading: Tag, 
        all_headings: List[Tuple[int, Tag]], 
        current_index: int
    ) -> PassageData:
        """Extract a single passage from its heading."""
        try:
            # Get title (next heading after "READING PASSAGE X")
            title_heading = heading.find_next(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            title = title_heading.get_text(separator=' ', strip=True) if title_heading else f"Passage {passage_num}"
            
            # Find the next passage heading (or end of document)
            next_heading = all_headings[current_index + 1][1] if current_index + 1 < len(all_headings) else None
            
            # Extract content between this heading and the next
            content = self._extract_content_between_headings(heading, next_heading)
            
            # Extract images
            temp_soup = BeautifulSoup(content, 'html.parser')
            images = self.extract_images(temp_soup)
            
            passage = PassageData(
                title=title,
                order_index=passage_num,
                content=content,
                images=images
            )
            
            logger.info(f"Fallback extracted passage {passage_num}: '{title}'")
            return passage
            
        except Exception as e:
            logger.error(f"Failed to extract passage {passage_num} using fallback: {e}")
            raise ContentExtractionError(
                f"Fallback extraction failed for passage {passage_num}: {str(e)}",
                context={"passage_number": passage_num}
            )
    
    def _extract_content_between_headings(self, start_heading: Tag, end_heading: Optional[Tag]) -> str:
        """Extract HTML content between two headings."""
        content_elements = []
        current = start_heading.find_next_sibling()
        
        while current and current != end_heading:
            if isinstance(current, Tag):
                content_elements.append(str(current))
            current = current.find_next_sibling()
        
        return '\n'.join(content_elements)
