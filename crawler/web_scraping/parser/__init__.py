"""
IELTS Content Parser

This package provides tools to parse raw HTML content from IELTS tests
(reading and listening) into structured, backend-ready JSON format.
"""

__version__ = "0.2.0"

# Import logging configuration
from .logging_config import setup_logging, get_logger

# Import crawler
from .html_crawler import HTMLCrawler, CrawlProgress
from .url_generator import URLGenerator

# Import JSON generator
from .json_generator import JSONGenerator

__all__ = [
    # Logging
    'setup_logging',
    'get_logger',
    # Crawler
    'HTMLCrawler',
    'CrawlProgress',
    'URLGenerator',
    # Generator
    'JSONGenerator',
]
