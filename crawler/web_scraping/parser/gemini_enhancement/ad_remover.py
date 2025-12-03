"""
Ad removal utilities for cleaning HTML content and image arrays.

This module provides functionality to remove advertisements and tracking
elements from HTML content and image URL arrays in test data.
"""

import re
from typing import Tuple, List


class AdRemover:
    """
    Utility class for removing advertisements from HTML content and image arrays.
    
    This class provides methods to:
    - Remove ad image URLs from image arrays
    - Remove ad images based on URL patterns from HTML
    - Remove ad scripts and tracking code
    - Clean HTML content of promotional elements
    """
    
    # Common ad image URL patterns
    AD_IMAGE_PATTERNS = [
        r'ad\.plus',  # ad.plus domain
        r'googleads',
        r'doubleclick',
        r'adserver',
        r'advertising',
        r'banner',
        r'sponsor',
        r'/ads/',
        r'ad\.jpg',
        r'ad\.png',
        r'ad\.gif',
    ]
    
    # Common ad script patterns
    AD_SCRIPT_PATTERNS = [
        r'google-analytics',
        r'googletagmanager',
        r'googlesyndication',
        r'doubleclick',
        r'facebook\.net',
        r'twitter\.com/widgets',
        r'addthis',
        r'sharethis',
    ]
    
    def __init__(self):
        """Initialize the AdRemover."""
        self.ad_image_regex = re.compile('|'.join(self.AD_IMAGE_PATTERNS), re.IGNORECASE)
        self.ad_script_regex = re.compile('|'.join(self.AD_SCRIPT_PATTERNS), re.IGNORECASE)
    
    def is_ad_url(self, url: str) -> bool:
        """
        Check if a URL is an advertisement URL.
        
        Args:
            url: URL string to check
            
        Returns:
            True if URL matches ad patterns, False otherwise
        """
        if not url:
            return False
        return bool(self.ad_image_regex.search(url))
    
    def filter_ad_urls(self, urls: List[str]) -> Tuple[List[str], List[str]]:
        """
        Filter out advertisement URLs from a list of URLs.
        
        Args:
            urls: List of URL strings
            
        Returns:
            Tuple of (clean_urls, removed_ad_urls)
        """
        if not urls:
            return [], []
        
        clean_urls = []
        removed_urls = []
        
        for url in urls:
            if self.is_ad_url(url):
                removed_urls.append(url)
            else:
                clean_urls.append(url)
        
        return clean_urls, removed_urls
    
    def remove_ad_images(self, html_content: str) -> Tuple[str, List[str]]:
        """
        Remove ad images from HTML content.
        
        Args:
            html_content: HTML string to clean
            
        Returns:
            Tuple of (cleaned_html, list_of_removed_image_urls)
        """
        if not html_content:
            return html_content, []
        
        removed_urls = []
        
        # Find all img tags with src attributes
        img_pattern = r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>'
        
        def replace_ad_image(match):
            img_tag = match.group(0)
            img_url = match.group(1)
            
            # Check if URL matches ad patterns
            if self.ad_image_regex.search(img_url):
                removed_urls.append(img_url)
                return ''  # Remove the entire img tag
            
            return img_tag  # Keep non-ad images
        
        cleaned_html = re.sub(img_pattern, replace_ad_image, html_content)
        
        return cleaned_html, removed_urls
    
    def remove_ad_scripts(self, html_content: str) -> Tuple[str, int]:
        """
        Remove ad scripts from HTML content.
        
        Args:
            html_content: HTML string to clean
            
        Returns:
            Tuple of (cleaned_html, count_of_removed_scripts)
        """
        if not html_content:
            return html_content, 0
        
        script_count = 0
        
        # Find all script tags
        script_pattern = r'<script[^>]*>.*?</script>'
        
        def replace_ad_script(match):
            nonlocal script_count
            script_tag = match.group(0)
            
            # Check if script matches ad patterns
            if self.ad_script_regex.search(script_tag):
                script_count += 1
                return ''  # Remove the entire script tag
            
            return script_tag  # Keep non-ad scripts
        
        cleaned_html = re.sub(script_pattern, replace_ad_script, html_content, flags=re.DOTALL | re.IGNORECASE)
        
        return cleaned_html, script_count
    
    def clean_html(self, html_content: str) -> Tuple[str, dict]:
        """
        Clean HTML content by removing both ad images and scripts.
        
        Args:
            html_content: HTML string to clean
            
        Returns:
            Tuple of (cleaned_html, stats_dict)
        """
        if not html_content:
            return html_content, {'image_urls': [], 'script_count': 0}
        
        # Remove ad images
        cleaned_html, removed_images = self.remove_ad_images(html_content)
        
        # Remove ad scripts
        cleaned_html, script_count = self.remove_ad_scripts(cleaned_html)
        
        stats = {
            'image_urls': removed_images,
            'script_count': script_count,
            'element_count': len(removed_images) + script_count
        }
        
        return cleaned_html, stats
