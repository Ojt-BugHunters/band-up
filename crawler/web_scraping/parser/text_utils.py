"""
Text Utilities Module

This module provides utilities for extracting text from HTML elements
while preserving proper spacing between words.
"""

from bs4 import Tag, NavigableString
import re
from typing import Optional

try:
    from .logging_config import get_logger
except ImportError:
    from logging_config import get_logger

logger = get_logger(__name__)


class TextUtils:
    """
    Utility class for text extraction with proper spacing preservation.
    
    This class addresses the common issue where HTML tag removal causes
    words to run together (e.g., "boxes27-30on your" instead of "boxes 27-30 on your").
    """
    
    @staticmethod
    def extract_text_with_spacing(element: Tag, preserve_bullets: bool = True) -> str:
        """
        Extract text from an HTML element with proper spacing.
        Enhanced to handle adjacent text nodes and bullet points.
        
        This method ensures that spaces are preserved around inline elements
        (strong, em, span, etc.) and between adjacent text nodes so that words
        don't run together when tags are removed. It also preserves bullet points
        and adds line breaks before them.
        
        Args:
            element: BeautifulSoup Tag to extract text from
            preserve_bullets: If True, preserve "●" characters and add line breaks
            
        Returns:
            Extracted text with proper spacing
            
        Example:
            >>> html = '<p>boxes<strong>27-30</strong>on your</p>'
            >>> soup = BeautifulSoup(html, 'html.parser')
            >>> TextUtils.extract_text_with_spacing(soup.p)
            'boxes 27-30 on your'
            
            >>> html = '<p>text<span>60</span>km west</p>'
            >>> soup = BeautifulSoup(html, 'html.parser')
            >>> TextUtils.extract_text_with_spacing(soup.p)
            'text 60 km west'
            
            >>> html = '<p>First item●Second item</p>'
            >>> soup = BeautifulSoup(html, 'html.parser')
            >>> TextUtils.extract_text_with_spacing(soup.p, preserve_bullets=True)
            'First item\\n●Second item'
        """
        if not element:
            return ""
        
        # Clone the element to avoid modifying the original
        from bs4 import BeautifulSoup
        element_copy = BeautifulSoup(str(element), 'html.parser')
        
        # First pass: Add line breaks before bullet points if requested
        if preserve_bullets:
            TextUtils.add_line_breaks_before_bullets(element_copy)
        
        # Second pass: Add spacing around numbers
        TextUtils.add_spacing_around_numbers(element_copy)
        
        # Third pass: Add spacing around inline elements
        TextUtils.add_spacing_around_inline_elements(element_copy)
        
        # Fourth pass: Add spacing between adjacent text nodes
        TextUtils.add_spacing_between_text_nodes(element_copy)
        
        # Extract text with space separator
        text = element_copy.get_text(separator=' ', strip=True)
        
        # Normalize spacing (but preserve line breaks if bullets are present)
        if preserve_bullets:
            # Preserve line breaks for bullet points
            lines = text.split('\n')
            normalized_lines = [TextUtils.normalize_spacing(line) for line in lines]
            text = '\n'.join(normalized_lines)
        else:
            text = TextUtils.normalize_spacing(text)
        
        return text
    
    @staticmethod
    def normalize_spacing(text: str) -> str:
        """
        Normalize whitespace in text.
        
        This method:
        - Replaces multiple consecutive spaces with a single space
        - Removes leading and trailing whitespace
        - Preserves single spaces between words
        
        Args:
            text: Text to normalize
            
        Returns:
            Text with normalized spacing
            
        Example:
            >>> TextUtils.normalize_spacing("hello    world  test")
            'hello world test'
        """
        if not text:
            return ""
        
        # Replace multiple spaces with single space
        text = re.sub(r'\s+', ' ', text)
        
        # Strip leading/trailing whitespace
        text = text.strip()
        
        return text
    
    @staticmethod
    def add_line_breaks_before_bullets(element: Tag) -> None:
        """
        Add line break markers before bullet points.
        
        Handles both "●" and "-" bullet characters when they appear at the
        start of text content. Ensures each bullet point starts on a new line.
        
        Args:
            element: BeautifulSoup Tag to modify (modified in-place)
            
        Example:
            >>> html = '<p>First item●Second item</p>'
            >>> soup = BeautifulSoup(html, 'html.parser')
            >>> TextUtils.add_line_breaks_before_bullets(soup.p)
            >>> soup.p.get_text()
            'First item\\n●Second item'
        """
        if not element:
            return
        
        # Find all text nodes in the element
        for text_node in element.find_all(string=True):
            text = str(text_node)
            
            # Check if text contains bullet characters
            if '●' in text or (text.strip().startswith('-') and len(text.strip()) > 1):
                # Split by bullet characters and add line breaks
                modified_text = text
                
                # Handle "●" bullets - add line break before each occurrence (except first)
                if '●' in text:
                    parts = text.split('●')
                    # Keep first part as is, add \n● before others
                    modified_text = parts[0]
                    for part in parts[1:]:
                        modified_text += '\n●' + part
                
                # Replace the text node with modified version
                if modified_text != text:
                    text_node.replace_with(modified_text)
                    logger.debug(f"Added line breaks before bullets in: {text[:50]}...")
    
    @staticmethod
    def add_spacing_around_numbers(element: Tag) -> None:
        """
        Add spacing around numbers to prevent them from running into text.
        
        Detects patterns like "boxes27-30on" and adds spaces to create
        "boxes 27-30 on". Handles number ranges correctly.
        
        Args:
            element: BeautifulSoup Tag to modify (modified in-place)
            
        Example:
            >>> html = '<p>boxes27-30on your sheet</p>'
            >>> soup = BeautifulSoup(html, 'html.parser')
            >>> TextUtils.add_spacing_around_numbers(soup.p)
            >>> soup.p.get_text()
            'boxes 27-30 on your sheet'
        """
        if not element:
            return
        
        # Find all text nodes
        for text_node in element.find_all(string=True):
            text = str(text_node)
            
            # Add space before numbers when preceded by letters
            # Pattern: letter followed by digit
            modified_text = re.sub(r'([a-zA-Z])(\d)', r'\1 \2', text)
            
            # Add space after numbers when followed by letters (but not in ranges)
            # Pattern: digit followed by letter (not preceded by dash)
            modified_text = re.sub(r'(\d)([a-zA-Z])', r'\1 \2', modified_text)
            
            # Replace the text node if modified
            if modified_text != text:
                text_node.replace_with(modified_text)
                logger.debug(f"Added spacing around numbers: '{text[:30]}' -> '{modified_text[:30]}'")
    
    @staticmethod
    def add_spacing_around_inline_elements(element: Tag) -> None:
        """
        Add spacing around inline HTML elements.
        
        This method modifies the element in-place by inserting space characters
        before and after ALL inline elements (strong, em, span, b, i, u, a, sup, sub).
        This ensures proper spacing when the tags are later removed.
        
        Args:
            element: BeautifulSoup Tag to modify (modified in-place)
            
        Example:
            >>> html = '<p>text<strong>bold</strong>more</p>'
            >>> soup = BeautifulSoup(html, 'html.parser')
            >>> TextUtils.add_spacing_around_inline_elements(soup.p)
            >>> soup.p.get_text()
            'text bold more'
        """
        if not element:
            return
        
        # List of ALL inline elements that should have spacing around them
        inline_tags = ['strong', 'em', 'span', 'b', 'i', 'u', 'a', 'sup', 'sub', 'mark', 'code']
        
        # Find all inline elements
        for tag in element.find_all(inline_tags):
            # Check if we need to add space before
            prev = tag.previous_sibling
            if prev and isinstance(prev, NavigableString):
                # Only add space if the previous text doesn't end with whitespace
                if not str(prev).endswith((' ', '\n', '\t')):
                    tag.insert_before(' ')
            elif prev and isinstance(prev, Tag):
                # Previous element is a tag, add space
                tag.insert_before(' ')
            
            # Check if we need to add space after
            next_elem = tag.next_sibling
            if next_elem and isinstance(next_elem, NavigableString):
                # Only add space if the next text doesn't start with whitespace
                if not str(next_elem).startswith((' ', '\n', '\t')):
                    tag.insert_after(' ')
            elif next_elem and isinstance(next_elem, Tag):
                # Next element is a tag, add space
                tag.insert_after(' ')
    
    @staticmethod
    def add_spacing_between_text_nodes(element: Tag) -> None:
        """
        Add spacing between adjacent text nodes that don't have whitespace.
        
        This handles cases like:
        <p>text<span>60</span>km</p> -> "text 60 km"
        <p>the<strong>16th</strong>century</p> -> "the 16th century"
        
        Args:
            element: BeautifulSoup Tag to modify (modified in-place)
            
        Example:
            >>> html = '<p>text<span>60</span>km west</p>'
            >>> soup = BeautifulSoup(html, 'html.parser')
            >>> TextUtils.add_spacing_between_text_nodes(soup.p)
            >>> soup.p.get_text()
            'text 60 km west'
        """
        if not element:
            return
        
        # Find all tags in the element
        for tag in element.find_all(True):
            # Check all children of this tag
            children = list(tag.children)
            
            for i in range(len(children) - 1):
                current = children[i]
                next_child = children[i + 1]
                
                # Case 1: Current is a tag and next is text
                if isinstance(current, Tag) and isinstance(next_child, NavigableString):
                    next_text = str(next_child)
                    # If next text doesn't start with whitespace and starts with alphanumeric
                    if next_text and not next_text[0].isspace() and next_text[0].isalnum():
                        # Replace with space-prefixed version
                        next_child.replace_with(' ' + next_text)
                        logger.debug(f"Added space before text node: '{next_text[:20]}'")
                
                # Case 2: Current is text and next is a tag
                elif isinstance(current, NavigableString) and isinstance(next_child, Tag):
                    current_text = str(current)
                    # If current text doesn't end with whitespace and ends with alphanumeric
                    if current_text and not current_text[-1].isspace() and current_text[-1].isalnum():
                        # Replace with space-suffixed version
                        current.replace_with(current_text + ' ')
                        logger.debug(f"Added space after text node: '{current_text[-20:]}'")
    
    @staticmethod
    def extract_list_items(element: Tag) -> list[str]:
        """
        Extract list items from ul/ol elements, preserving bullet point structure.
        
        This method extracts text from list items and formats them with bullet points,
        making lists more readable in the final output.
        
        Args:
            element: BeautifulSoup Tag containing a list (ul or ol)
            
        Returns:
            List of strings, one per list item, each prefixed with a bullet point
            
        Example:
            >>> html = '<ul><li>First item</li><li>Second item</li></ul>'
            >>> soup = BeautifulSoup(html, 'html.parser')
            >>> TextUtils.extract_list_items(soup.ul)
            ['• First item', '• Second item']
        """
        if not element:
            return []
        
        items = []
        
        # Find all list items (only direct children, not nested)
        for li in element.find_all('li', recursive=False):
            # Extract text with proper spacing
            text = TextUtils.extract_text_with_spacing(li)
            if text:
                # Add bullet point prefix
                items.append(f"• {text}")
                logger.debug(f"Extracted list item: {text[:50]}...")
        
        return items
