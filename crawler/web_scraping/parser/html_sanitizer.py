"""
HTML Sanitizer Module

This module provides HTML sanitization functionality to clean and validate HTML content
while preserving structure and formatting. It removes potentially dangerous elements
like scripts and inline JavaScript while maintaining safe HTML tags and attributes.

Requirements addressed: 10.1-10.7
"""

import bleach
from typing import Optional
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup


class HTMLSanitizer:
    """
    Sanitizes HTML content by removing dangerous elements and converting relative URLs.
    
    This class uses the bleach library to sanitize HTML content, ensuring that only
    safe tags and attributes are preserved. It also handles URL conversion from
    relative to absolute paths.
    """
    
    # HTML parser to use
    HTML_PARSER = 'html.parser'
    
    # Allowed HTML tags (Requirement 10.4)
    ALLOWED_TAGS = [
        # Text elements
        'p', 'span', 'br', 'hr',
        # Formatting
        'strong', 'em', 'b', 'i', 'u', 'mark',
        # Headings
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        # Lists
        'ul', 'ol', 'li',
        # Tables
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        # Media
        'img',
        # Semantic
        'blockquote', 'code', 'pre', 'div',
        # Links
        'a'
    ]
    
    # Allowed attributes per tag (Requirement 10.5)
    ALLOWED_ATTRIBUTES = {
        '*': ['class'],  # class allowed on all elements
        'a': ['href', 'title', 'class'],
        'img': ['src', 'alt', 'title', 'width', 'height', 'class'],
        'td': ['colspan', 'rowspan', 'class'],
        'th': ['colspan', 'rowspan', 'class'],
    }
    
    # Protocols allowed in URLs
    ALLOWED_PROTOCOLS = ['http', 'https', 'data']
    
    def __init__(self):
        """Initialize the HTML sanitizer with default configuration."""
        pass
    
    def sanitize(self, html: str, base_url: Optional[str] = None) -> str:
        """
        Sanitize HTML content by removing dangerous elements and converting URLs.
        
        This method performs the following operations:
        1. Removes script tags and their content (Requirement 10.1)
        2. Removes inline JavaScript event handlers (Requirement 10.2)
        3. Removes style tags (Requirement 10.3)
        4. Filters to allowed tags and attributes (Requirements 10.4, 10.5)
        5. Converts relative URLs to absolute URLs (Requirement 10.6)
        6. Preserves semantic structure (Requirement 10.7)
        
        Args:
            html: Raw HTML string to sanitize
            base_url: Base URL for converting relative URLs (optional)
            
        Returns:
            Sanitized HTML string
            
        Example:
            >>> sanitizer = HTMLSanitizer()
            >>> html = '<p>Hello <script>alert("xss")</script></p>'
            >>> sanitizer.sanitize(html)
            '<p>Hello </p>'
        """
        if not html or not isinstance(html, str):
            return ""
        
        # First pass: Remove scripts and styles using BeautifulSoup
        # This ensures complete removal of script/style content (Requirements 10.1, 10.3)
        soup = BeautifulSoup(html, self.HTML_PARSER)
        
        # Remove script tags and their content (Requirement 10.1)
        for script in soup.find_all('script'):
            script.decompose()
        
        # Remove style tags and their content (Requirement 10.3)
        for style in soup.find_all('style'):
            style.decompose()
        
        # Remove inline event handlers (Requirement 10.2)
        # This is handled by bleach's attribute filtering, but we do a pre-pass
        for tag in soup.find_all(True):
            # Remove all attributes starting with 'on' (onclick, onload, etc.)
            attrs_to_remove = [attr for attr in tag.attrs if attr.startswith('on')]
            for attr in attrs_to_remove:
                del tag[attr]
        
        # Convert back to string for bleach processing
        html = str(soup)
        
        # Second pass: Use bleach to sanitize with whitelist
        # (Requirements 10.4, 10.5)
        sanitized_html = bleach.clean(
            html,
            tags=self.ALLOWED_TAGS,
            attributes=self.ALLOWED_ATTRIBUTES,
            protocols=self.ALLOWED_PROTOCOLS,
            strip=True  # Strip disallowed tags instead of escaping
        )
        
        # Third pass: Convert relative URLs to absolute URLs if base_url provided
        # (Requirement 10.6)
        if base_url:
            sanitized_html = self.convert_relative_urls(sanitized_html, base_url)
        
        return sanitized_html

    def convert_relative_urls(self, html: str, base_url: str) -> str:
        """
        Convert relative URLs to absolute URLs for images and links.
        
        This method processes the HTML to find all img src and a href attributes
        and converts relative URLs to absolute URLs using the provided base URL.
        
        Args:
            html: HTML string with potentially relative URLs
            base_url: Base URL to use for conversion
            
        Returns:
            HTML string with absolute URLs
            
        Example:
            >>> sanitizer = HTMLSanitizer()
            >>> html = '<img src="/images/test.jpg">'
            >>> base = 'https://example.com/page/'
            >>> sanitizer.convert_relative_urls(html, base)
            '<img src="https://example.com/images/test.jpg">'
        """
        if not html or not base_url:
            return html
        
        soup = BeautifulSoup(html, self.HTML_PARSER)
        
        # Convert image URLs (Requirement 10.6)
        for img in soup.find_all('img'):
            if img.get('src'):
                img['src'] = urljoin(base_url, img['src'])
        
        # Convert link URLs (Requirement 10.6)
        for link in soup.find_all('a'):
            if link.get('href'):
                # Only convert if it's not already absolute and not a fragment
                href = link['href']
                if not href.startswith(('#', 'javascript:', 'mailto:')):
                    link['href'] = urljoin(base_url, href)
        
        return str(soup)
    
    def is_safe_url(self, url: str) -> bool:
        """
        Check if a URL is safe (uses allowed protocols).
        
        Args:
            url: URL to check
            
        Returns:
            True if URL uses an allowed protocol, False otherwise
        """
        if not url:
            return False
        
        try:
            parsed = urlparse(url)
            return parsed.scheme in self.ALLOWED_PROTOCOLS or parsed.scheme == ''
        except Exception:
            return False
    
    def sanitize_with_validation(self, html: str, base_url: Optional[str] = None) -> tuple[str, list[str]]:
        """
        Sanitize HTML and return both sanitized content and list of removed elements.
        
        This method is useful for debugging and validation purposes, as it tracks
        what was removed during sanitization.
        
        Args:
            html: Raw HTML string to sanitize
            base_url: Base URL for converting relative URLs (optional)
            
        Returns:
            Tuple of (sanitized_html, list_of_warnings)
        """
        warnings = []
        
        if not html or not isinstance(html, str):
            return "", ["Empty or invalid HTML input"]
        
        # Track removed elements
        soup = BeautifulSoup(html, 'html.parser')
        
        # Count scripts
        scripts = soup.find_all('script')
        if scripts:
            warnings.append(f"Removed {len(scripts)} script tag(s)")
        
        # Count styles
        styles = soup.find_all('style')
        if styles:
            warnings.append(f"Removed {len(styles)} style tag(s)")
        
        # Count event handlers
        event_handlers = 0
        for tag in soup.find_all(True):
            event_attrs = [attr for attr in tag.attrs if attr.startswith('on')]
            event_handlers += len(event_attrs)
        
        if event_handlers:
            warnings.append(f"Removed {event_handlers} inline event handler(s)")
        
        # Perform sanitization
        sanitized = self.sanitize(html, base_url)
        
        return sanitized, warnings


# Convenience function for quick sanitization
def sanitize_html(html: str, base_url: Optional[str] = None) -> str:
    """
    Convenience function to sanitize HTML content.
    
    Args:
        html: Raw HTML string to sanitize
        base_url: Base URL for converting relative URLs (optional)
        
    Returns:
        Sanitized HTML string
    """
    sanitizer = HTMLSanitizer()
    return sanitizer.sanitize(html, base_url)
