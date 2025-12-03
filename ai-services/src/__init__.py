"""
AI Services - IELTS Learning Platform
Production-ready AI evaluation services
"""

__version__ = "1.0.0"

from speaking_evaluator import SpeakingEvaluator
from flashcard_generator import BudgetExceededError
from gemini_client import GeminiAPIError
from schemas import (
    SpeakingEvaluationRequest,
    SpeakingEvaluationResponse,
    SpeakingFeedback,
    CriterionFeedback
)
from gemini_client import GeminiClient
from cache_manager import CacheManager
from validators import ResponseValidator, ValidationError

__all__ = [
    # Speaking Evaluator
    "SpeakingEvaluator",
    "BudgetExceededError",
    "GeminiAPIError",
    
    # Schemas
    "SpeakingEvaluationRequest",
    "SpeakingEvaluationResponse",
    "SpeakingFeedback",
    "CriterionFeedback",
    
    # Clients
    "GeminiClient",
    "CacheManager",
    
    # Validators
    "ResponseValidator",
    "ValidationError",
]

