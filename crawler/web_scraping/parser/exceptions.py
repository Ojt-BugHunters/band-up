"""
Custom exception classes for the IELTS parser.

This module defines a hierarchy of exceptions used throughout the parser
to provide clear error handling and reporting.
"""


class ParserError(Exception):
    """
    Base exception for all parser-related errors.
    
    This is the parent class for all custom parser exceptions,
    allowing for broad exception handling when needed.
    """
    
    def __init__(self, message: str, context: dict = None):
        """
        Initialize the parser error.
        
        Args:
            message: Human-readable error description
            context: Optional dictionary with additional error context
                    (e.g., file path, section name, element info)
        """
        super().__init__(message)
        self.message = message
        self.context = context or {}
    
    def __str__(self):
        """Return formatted error message with context."""
        if self.context:
            context_str = ", ".join(f"{k}={v}" for k, v in self.context.items())
            return f"{self.message} (Context: {context_str})"
        return self.message


class HTMLParsingError(ParserError):
    """
    Exception raised when HTML structure is invalid or unexpected.
    
    This includes:
    - Malformed HTML tags
    - Missing expected elements
    - Invalid HTML structure
    - BeautifulSoup parsing failures
    """
    pass


class ContentExtractionError(ParserError):
    """
    Exception raised when content extraction fails.
    
    This includes:
    - No passages found
    - No questions found
    - Ambiguous content boundaries
    - Unable to identify content sections
    - Text extraction failures
    """
    pass


class AnswerExtractionError(ParserError):
    """
    Exception raised when answer extraction fails.
    
    This includes:
    - No answer section found
    - Unparseable answer format
    - Answer count mismatch
    - Invalid answer structure
    - Missing answer keys
    """
    pass
