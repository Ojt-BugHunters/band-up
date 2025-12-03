"""
Listening Question Extractor Module

This module provides the ListeningQuestionExtractor class for extracting question content
from IELTS listening test HTML while preserving the original HTML structure.
"""

from bs4 import Tag, BeautifulSoup
from typing import List, Dict
import re
import logging
from urllib.parse import urljoin

try:
    from .text_utils import TextUtils
except ImportError:
    from text_utils import TextUtils

logger = logging.getLogger(__name__)


class ListeningQuestionExtractor:
    """
    Extracts question content from listening test HTML while preserving structure.
    
    This simplified extractor preserves the entire HTML structure of question rows
    instead of parsing individual questions, allowing the frontend to render them
    exactly as they appear on the source website.
    """
    
    def __init__(self, base_url: str = "https://ieltstrainingonline.com"):
        """
        Initialize the ListeningQuestionExtractor.
        
        Args:
            base_url: Base URL for converting relative image URLs to absolute
        """
        self.base_url = base_url
        logger.info("ListeningQuestionExtractor initialized")
    
    def extract_questions_from_row(
        self,
        question_row: Tag,
        section_number: int
    ) -> List[Dict]:
        """
        Extract questions from a question row while preserving HTML structure.
        
        This method extracts the entire row HTML as a single block instead of
        parsing individual questions. The HTML structure is preserved for
        frontend rendering.
        
        Args:
            question_row: BeautifulSoup Tag containing the question row
            section_number: The section number (1-4) these questions belong to
            
        Returns:
            List containing a single dictionary with:
                - section_number: int
                - question_range: tuple (start, end) e.g., (1, 10)
                - html_content: str (preserved HTML)
                - text_content: str (plain text for search/indexing)
        """
        logger.info(f"Extracting questions from row for section {section_number}")
        
        if not question_row:
            logger.warning(f"Empty question row for section {section_number}")
            return []
        
        # Preserve HTML structure
        html_content = self.preserve_html_structure(question_row)
        
        # Extract plain text for search/indexing
        text_content = TextUtils.extract_text_with_spacing(question_row)
        
        # Determine question range based on section number
        # Section 1: Q1-10, Section 2: Q11-20, Section 3: Q21-30, Section 4: Q31-40
        start_q = (section_number - 1) * 10 + 1
        end_q = section_number * 10
        question_range = (start_q, end_q)
        
        result = {
            'section_number': section_number,
            'question_range': question_range,
            'html_content': html_content,
            'text_content': text_content
        }
        
        logger.info(f"Extracted question block for section {section_number}, range {question_range}")
        return [result]
    
    def preserve_html_structure(self, content: Tag) -> str:
        """
        Preserve HTML structure including tables, lists, images, and CSS classes.
        
        This method keeps all HTML tags and attributes intact, converting relative
        image URLs to absolute URLs for proper rendering.
        
        Args:
            content: BeautifulSoup Tag containing the HTML content
            
        Returns:
            String containing the preserved HTML
        """
        if not content:
            return ""
        
        # Clone the content to avoid modifying the original
        content_copy = BeautifulSoup(str(content), 'html.parser')
        
        # Convert relative image URLs to absolute
        for img in content_copy.find_all('img'):
            src = img.get('src', '')
            if src and not src.startswith(('http://', 'https://', '//')):
                # Convert relative URL to absolute
                absolute_url = urljoin(self.base_url, src)
                img['src'] = absolute_url
                logger.debug(f"Converted image URL: {src} -> {absolute_url}")
        
        # Get the raw HTML string
        # Use str() to preserve all tags, attributes, and structure
        html_str = str(content_copy)
        
        logger.debug(f"Preserved HTML structure ({len(html_str)} chars)")
        return html_str

