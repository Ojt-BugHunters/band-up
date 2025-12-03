"""
Gemini Test Enhancement Module

This module provides AI-powered enhancement capabilities for IELTS test data
using Google's Gemini 2.5 Flash-Lite model. It handles:
- Advertisement removal
- Question type classification
- HTML structure preservation
- Batch processing with rate limiting
"""

from .gemini_enhancer import GeminiEnhancer
from .gemini_client import GeminiClient
from .rate_limiter import RateLimiter
from .ad_remover import AdRemover
from .models import ValidationResult, EnhancementResult, AdRemovalStats
from .config_manager import ConfigManager, Config, GeminiConfig, RateLimitConfig, ProcessingConfig, PathConfig, ValidationConfig
from .exceptions import (
    EnhancementError,
    GeminiAPIError,
    RateLimitError,
    QuotaExceededError,
    AuthenticationError,
    TimeoutError,
    ValidationError,
    StructureValidationError,
    QuestionCountError,
    HTMLValidationError,
    ProcessingError,
    JSONParseError,
    PromptBuildError,
    DataMergeError,
    ConfigurationError,
    MissingAPIKeyError,
    InvalidConfigError,
)

__all__ = [
    'GeminiEnhancer',
    'GeminiClient',
    'RateLimiter',
    'AdRemover',
    'ValidationResult',
    'EnhancementResult',
    'AdRemovalStats',
    'ConfigManager',
    'Config',
    'GeminiConfig',
    'RateLimitConfig',
    'ProcessingConfig',
    'PathConfig',
    'ValidationConfig',
    'EnhancementError',
    'GeminiAPIError',
    'RateLimitError',
    'QuotaExceededError',
    'AuthenticationError',
    'TimeoutError',
    'ValidationError',
    'StructureValidationError',
    'QuestionCountError',
    'HTMLValidationError',
    'ProcessingError',
    'JSONParseError',
    'PromptBuildError',
    'DataMergeError',
    'ConfigurationError',
    'MissingAPIKeyError',
    'InvalidConfigError',
]

__version__ = '1.0.0'
