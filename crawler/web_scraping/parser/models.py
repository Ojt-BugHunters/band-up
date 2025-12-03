"""
Data models for IELTS Reading Content Parser

This module defines the data classes used throughout the parsing pipeline.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict

# Import enums from constants to avoid duplication
try:
    from .constants import QuestionType, UIComponent
except ImportError:
    from constants import QuestionType, UIComponent


@dataclass
class Passage:
    """Represents a reading passage"""
    passage_number: int
    title: str
    content: str
    word_count: int
    paragraphs: List[str] = field(default_factory=list)
    labeled_paragraphs: Optional[Dict[str, str]] = None  # e.g., {"A": "text...", "B": "text..."}


@dataclass
class Question:
    """Represents a question with all relevant metadata"""
    question_number: int
    question_type: QuestionType
    ui_component: UIComponent
    instructions: str
    question_text: str
    options: Optional[List[str]] = None
    word_limit: Optional[int] = None
    passage_reference: int = 1
    paragraph_reference: Optional[str] = None
    table_structure: Optional[Dict] = None
    correct_answer: Optional[str] = None  # Answer mapped to this question


@dataclass
class Answer:
    """Represents an answer to a question"""
    question_number: int
    correct_answer: str
    explanation: Optional[str] = None


@dataclass
class ValidationResult:
    """Results of structure validation"""
    is_valid: bool
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    passage_quality_score: float = 1.0  # 0-1, based on question contamination
    spacing_quality_score: float = 1.0  # 0-1, based on spacing issues
    answer_completeness: float = 1.0    # 0-1, based on answer coverage


@dataclass
class ParsedTest:
    """Complete parsed test structure"""
    test_metadata: Dict
    passages: List[Passage]
    questions: List[Question]
    answers: List[Answer]
    validation: ValidationResult
