"""
Custom exception classes for Gemini enhancement pipeline.

This module defines a hierarchy of exceptions specific to the Gemini
enhancement process, providing clear error handling and reporting.
"""


class EnhancementError(Exception):
    """
    Base exception for all Gemini enhancement-related errors.
    
    This is the parent class for all custom enhancement exceptions,
    allowing for broad exception handling when needed.
    """
    
    def __init__(self, message: str, context: dict = None):
        """
        Initialize the enhancement error.
        
        Args:
            message: Human-readable error description
            context: Optional dictionary with additional error context
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


# Gemini API Errors
class GeminiAPIError(EnhancementError):
    """
    Base exception for Gemini API-related errors.
    
    This includes all errors that occur during API communication.
    """
    pass


class RateLimitError(GeminiAPIError):
    """
    Exception raised when API rate limits are exceeded.
    
    This includes:
    - Requests per minute (RPM) limit exceeded
    - Tokens per minute (TPM) limit exceeded
    - Temporary rate limiting by API
    """
    pass


class QuotaExceededError(GeminiAPIError):
    """
    Exception raised when API quota is exhausted.
    
    This includes:
    - Daily request quota exceeded
    - Monthly quota exceeded
    - Account quota limits reached
    """
    pass


class AuthenticationError(GeminiAPIError):
    """
    Exception raised when API authentication fails.
    
    This includes:
    - Invalid API key
    - Expired API key
    - Missing API credentials
    - Permission denied errors
    """
    pass


class TimeoutError(GeminiAPIError):
    """
    Exception raised when API requests timeout.
    
    This includes:
    - Connection timeout
    - Read timeout
    - Response timeout
    """
    pass


# Validation Errors
class ValidationError(EnhancementError):
    """
    Base exception for validation-related errors.
    
    This includes all errors that occur during data validation.
    """
    pass


class StructureValidationError(ValidationError):
    """
    Exception raised when JSON structure validation fails.
    
    This includes:
    - Missing required fields
    - Invalid field types
    - Incorrect data structure
    - Schema validation failures
    """
    pass


class QuestionCountError(ValidationError):
    """
    Exception raised when question count is incorrect.
    
    This includes:
    - Not exactly 40 questions
    - Missing question classifications
    - Duplicate question numbers
    """
    pass


class HTMLValidationError(ValidationError):
    """
    Exception raised when HTML validation fails.
    
    This includes:
    - Malformed HTML
    - Unclosed tags
    - Invalid HTML structure
    - HTML parsing errors
    """
    pass


# Processing Errors
class ProcessingError(EnhancementError):
    """
    Base exception for processing-related errors.
    
    This includes all errors that occur during data processing.
    """
    pass


class JSONParseError(ProcessingError):
    """
    Exception raised when JSON parsing fails.
    
    This includes:
    - Invalid JSON format
    - JSON decode errors
    - Malformed JSON response from Gemini
    """
    pass


class PromptBuildError(ProcessingError):
    """
    Exception raised when prompt construction fails.
    
    This includes:
    - Template rendering errors
    - Token limit exceeded during prompt building
    - Missing required prompt data
    """
    pass


class DataMergeError(ProcessingError):
    """
    Exception raised when merging enhanced data fails.
    
    This includes:
    - Conflicting field values
    - Data type mismatches
    - Missing original data fields
    """
    pass


# Configuration Errors
class ConfigurationError(EnhancementError):
    """
    Base exception for configuration-related errors.
    
    This includes all errors related to system configuration.
    """
    pass


class MissingAPIKeyError(ConfigurationError):
    """
    Exception raised when API key is missing.
    
    This includes:
    - API key not found in environment
    - API key not found in config file
    - Empty API key value
    """
    pass


class InvalidConfigError(ConfigurationError):
    """
    Exception raised when configuration is invalid.
    
    This includes:
    - Invalid configuration values
    - Missing required configuration
    - Configuration type errors
    - Invalid file paths in configuration
    """
    pass
