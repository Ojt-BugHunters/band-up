"""
Data models for IELTS Listening Parser

This module contains all data classes and enums used by the listening parser.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from enum import Enum


# ============================================================================
# Enums
# ============================================================================

class ListeningQuestionType(Enum):
    """Enumeration of listening question types"""
    FORM_COMPLETION = "form_completion"
    MULTIPLE_CHOICE_SINGLE = "multiple_choice_single"
    MULTIPLE_CHOICE_MULTIPLE = "multiple_choice_multiple"
    MATCHING = "matching"
    MAP_LABELING = "map_labeling"
    SENTENCE_COMPLETION = "sentence_completion"
    NOTE_COMPLETION = "note_completion"
    TABLE_COMPLETION = "table_completion"
    FLOW_CHART_COMPLETION = "flow_chart_completion"
    SHORT_ANSWER = "short_answer"


# ============================================================================
# Data Models
# ============================================================================

@dataclass
class Section:
    """Represents one section of a listening test (Section 1-4)"""
    section_number: int
    title: str
    audio_file_path: Optional[str] = None
    question_range: Tuple[int, int] = (0, 0)
    context: Optional[str] = None
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            "section_number": self.section_number,
            "title": self.title,
            "audio_file_path": self.audio_file_path,
            "question_range": list(self.question_range),
            "context": self.context
        }


@dataclass
class ListeningQuestion:
    """Represents a single listening question"""
    question_number: int
    section_number: int
    question_type: ListeningQuestionType
    instructions: str
    question_text: str
    options: Optional[List[str]] = None
    word_limit: Optional[int] = None
    table_structure: Optional[Dict] = None
    ui_component: str = "text_input"
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            "question_number": self.question_number,
            "section_number": self.section_number,
            "question_type": self.question_type.value,
            "ui_component": self.ui_component,
            "instructions": self.instructions,
            "question_text": self.question_text,
            "options": self.options,
            "word_limit": self.word_limit,
            "table_structure": self.table_structure
        }


@dataclass
class ListeningAnswer:
    """Represents an answer to a listening question"""
    question_number: int
    correct_answer: str
    acceptable_alternatives: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            "question_number": self.question_number,
            "correct_answer": self.correct_answer,
            "acceptable_alternatives": self.acceptable_alternatives
        }


@dataclass
class ValidationResult:
    """Results of structure validation"""
    is_valid: bool
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            "is_valid": self.is_valid,
            "errors": self.errors,
            "warnings": self.warnings
        }


# ============================================================================
# UI Component Mapping
# ============================================================================

UI_COMPONENT_MAP = {
    ListeningQuestionType.FORM_COMPLETION: "text_input",
    ListeningQuestionType.MULTIPLE_CHOICE_SINGLE: "radio_button",
    ListeningQuestionType.MULTIPLE_CHOICE_MULTIPLE: "checkbox",
    ListeningQuestionType.MATCHING: "dropdown",
    ListeningQuestionType.MAP_LABELING: "text_input",
    ListeningQuestionType.SENTENCE_COMPLETION: "text_input",
    ListeningQuestionType.NOTE_COMPLETION: "text_input",
    ListeningQuestionType.TABLE_COMPLETION: "text_input",
    ListeningQuestionType.FLOW_CHART_COMPLETION: "text_input",
    ListeningQuestionType.SHORT_ANSWER: "text_input",
}
