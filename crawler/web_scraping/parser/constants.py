"""
Constants and patterns for IELTS Reading Content Parser.

This module contains all enums, regex patterns, and constant mappings
used throughout the parsing pipeline.
"""

import re
from enum import Enum


# ============================================================================
# ENUMS
# ============================================================================

class QuestionType(Enum):
    """All 14 official IELTS Reading question types."""
    
    # Matching Types
    MATCHING_HEADINGS = "matching_headings"
    MATCHING_PARAGRAPH_INFORMATION = "matching_paragraph_information"
    MATCHING_FEATURES = "matching_features"
    MATCHING_SENTENCE_ENDINGS = "matching_sentence_endings"
    
    # True/False/Yes/No Types
    TRUE_FALSE_NOT_GIVEN = "true_false_not_given"
    YES_NO_NOT_GIVEN = "yes_no_not_given"
    
    # Multiple Choice Types
    MULTIPLE_CHOICE = "multiple_choice"
    LIST_OF_OPTIONS = "list_of_options"
    CHOOSE_A_TITLE = "choose_a_title"
    
    # Completion Types
    SHORT_ANSWERS = "short_answers"
    SENTENCE_COMPLETION = "sentence_completion"
    SUMMARY_COMPLETION = "summary_completion"
    TABLE_COMPLETION = "table_completion"
    FLOW_CHART_COMPLETION = "flow_chart_completion"
    DIAGRAM_COMPLETION = "diagram_completion"


class UIComponent(Enum):
    """UI component types for rendering questions in the frontend."""
    
    RADIO_BUTTON = "radio_button"  # Single selection
    CHECKBOX = "checkbox"          # Multiple selection
    DROPDOWN = "dropdown"          # Select from list
    TEXT_INPUT = "text_input"      # Free text entry


# ============================================================================
# REGEX PATTERNS
# ============================================================================

# Section Detection Patterns
PASSAGE_PATTERN = re.compile(r'READING\s+PASSAGE\s+[1-3]', re.IGNORECASE)
# Updated to match "Questions X-Y", "Questions X and Y", and "Question X"
QUESTION_PATTERN = re.compile(r'Questions?\s+\d+(?:\s*[-–]\s*\d+|\s+and\s+\d+)?', re.IGNORECASE)
ANSWER_PATTERN = re.compile(r'^Answers?', re.IGNORECASE)

# Question Number Patterns
QUESTION_NUMBER_PATTERN = re.compile(r'^(\d+)[\.\)]\s+(.+)', re.MULTILINE)
QUESTION_RANGE_PATTERN = re.compile(r'Questions?\s+(\d+)\s*[-–]\s*(\d+)', re.IGNORECASE)

# Word Limit Patterns
WORD_LIMIT_PATTERN = re.compile(
    r'(?:NO MORE THAN|MAXIMUM|UP TO)\s+(\w+)\s+WORDS?',
    re.IGNORECASE
)
ONE_WORD_PATTERN = re.compile(r'ONE WORD ONLY', re.IGNORECASE)
TWO_WORDS_PATTERN = re.compile(r'TWO WORDS', re.IGNORECASE)
THREE_WORDS_PATTERN = re.compile(r'THREE WORDS', re.IGNORECASE)

# Multiple Choice Option Patterns
MCQ_OPTION_PATTERN = re.compile(r'^([A-Z])[:.)]\s+(.+)', re.MULTILINE)

# Paragraph Reference Patterns
PARAGRAPH_REFERENCE_PATTERN = re.compile(r'paragraphs?\s+([A-Z](?:[-–][A-Z])?)', re.IGNORECASE)

# Metadata Extraction Patterns
CAMBRIDGE_EDITION_PATTERN = re.compile(r'cambridge[_\s-]?(\d+)', re.IGNORECASE)
TEST_NUMBER_PATTERN = re.compile(r'test[_\s-]?(\d+)', re.IGNORECASE)


# ============================================================================
# QUESTION TYPE CLASSIFICATION KEYWORDS
# ============================================================================

QUESTION_TYPE_KEYWORDS = {
    QuestionType.MATCHING_HEADINGS: [
        'heading',
        'match.*heading',
        'choose.*heading',
        'paragraph.*heading'
    ],
    
    QuestionType.MATCHING_PARAGRAPH_INFORMATION: [
        'which paragraph',
        'which section',
        'paragraph contains',
        'information.*paragraph'
    ],
    
    QuestionType.MATCHING_FEATURES: [
        'match.*name',
        'match.*person',
        'match.*feature',
        'match.*statement',
        'match each.*with'
    ],
    
    QuestionType.MATCHING_SENTENCE_ENDINGS: [
        'complete each sentence',
        'sentence ending',
        'match.*ending',
        'complete.*sentence.*below'
    ],
    
    QuestionType.TRUE_FALSE_NOT_GIVEN: [
        'true.*false.*not given',
        'agree with.*information'
    ],
    
    QuestionType.YES_NO_NOT_GIVEN: [
        'yes.*no.*not given',
        "agree with.*writer's.*claims",
        "agree with.*writer's.*views"
    ],
    
    QuestionType.MULTIPLE_CHOICE: [
        'choose the correct letter',
        'choose.*one.*letter',
        'select.*correct.*answer'
    ],
    
    QuestionType.LIST_OF_OPTIONS: [
        'choose.*letters',
        'choose.*two.*letters',
        'choose.*three.*letters',
        'select.*options'
    ],
    
    QuestionType.CHOOSE_A_TITLE: [
        'choose the correct title',
        'best title',
        'most suitable title'
    ],
    
    QuestionType.SHORT_ANSWERS: [
        'answer the question',
        'write.*no more than',
        'one word only',
        'answer.*below'
    ],
    
    QuestionType.SENTENCE_COMPLETION: [
        'complete the sentence',
        'complete.*below'
    ],
    
    QuestionType.SUMMARY_COMPLETION: [
        'complete the summary',
        'complete the note',
        'summary.*below'
    ],
    
    QuestionType.TABLE_COMPLETION: [
        'complete the table',
        'table.*below'
    ],
    
    QuestionType.FLOW_CHART_COMPLETION: [
        'flow.*chart',
        'flowchart',
        'complete.*flow'
    ],
    
    QuestionType.DIAGRAM_COMPLETION: [
        'diagram',
        'label.*diagram',
        'complete.*diagram'
    ]
}


# ============================================================================
# UI COMPONENT MAPPING
# ============================================================================

UI_COMPONENT_MAP = {
    # Radio button selection (single choice)
    QuestionType.TRUE_FALSE_NOT_GIVEN: UIComponent.RADIO_BUTTON,
    QuestionType.YES_NO_NOT_GIVEN: UIComponent.RADIO_BUTTON,
    QuestionType.MULTIPLE_CHOICE: UIComponent.RADIO_BUTTON,
    QuestionType.CHOOSE_A_TITLE: UIComponent.RADIO_BUTTON,
    
    # Checkbox selection (multiple choices)
    QuestionType.LIST_OF_OPTIONS: UIComponent.CHECKBOX,
    
    # Dropdown/Select matching
    QuestionType.MATCHING_HEADINGS: UIComponent.DROPDOWN,
    QuestionType.MATCHING_PARAGRAPH_INFORMATION: UIComponent.DROPDOWN,
    QuestionType.MATCHING_FEATURES: UIComponent.DROPDOWN,
    QuestionType.MATCHING_SENTENCE_ENDINGS: UIComponent.DROPDOWN,
    
    # Text input (short answers and completions)
    QuestionType.SHORT_ANSWERS: UIComponent.TEXT_INPUT,
    QuestionType.SENTENCE_COMPLETION: UIComponent.TEXT_INPUT,
    QuestionType.SUMMARY_COMPLETION: UIComponent.TEXT_INPUT,
    QuestionType.TABLE_COMPLETION: UIComponent.TEXT_INPUT,
    QuestionType.FLOW_CHART_COMPLETION: UIComponent.TEXT_INPUT,
    QuestionType.DIAGRAM_COMPLETION: UIComponent.TEXT_INPUT,
}


# ============================================================================
# WORD LIMIT MAPPINGS
# ============================================================================

WORD_LIMIT_TEXT_MAP = {
    'one': 1,
    'two': 2,
    'three': 3,
    'four': 4,
    'five': 5,
}


# ============================================================================
# STANDARD OPTIONS FOR QUESTION TYPES
# ============================================================================

TRUE_FALSE_OPTIONS = ["TRUE", "FALSE", "NOT GIVEN"]
YES_NO_OPTIONS = ["YES", "NO", "NOT GIVEN"]


# ============================================================================
# TEST METADATA CONSTANTS
# ============================================================================

TEST_TYPE_CAMBRIDGE = "cambridge"
TEST_TYPE_PRACTICE = "practice"
TEST_TYPE_MOCK = "mock"

VALID_TEST_TYPES = [TEST_TYPE_CAMBRIDGE, TEST_TYPE_PRACTICE, TEST_TYPE_MOCK]


# ============================================================================
# VALIDATION CONSTANTS
# ============================================================================

EXPECTED_PASSAGE_COUNT = 3
EXPECTED_TOTAL_QUESTIONS = 40
MIN_PASSAGE_WORD_COUNT = 500
MAX_PASSAGE_WORD_COUNT = 1500


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_ui_component(question_type: QuestionType) -> UIComponent:
    """
    Get the UI component for a given question type.
    
    Args:
        question_type: The question type enum
        
    Returns:
        The corresponding UI component enum
        
    Raises:
        ValueError: If question type is not mapped
    """
    if question_type not in UI_COMPONENT_MAP:
        raise ValueError(f"No UI component mapping for question type: {question_type}")
    
    return UI_COMPONENT_MAP[question_type]


def parse_word_limit(instruction_text: str) -> int | None:
    """
    Extract word limit from instruction text.
    
    Args:
        instruction_text: The instruction text to parse
        
    Returns:
        Word limit as integer, or None if not found
        
    Examples:
        "NO MORE THAN THREE WORDS" -> 3
        "ONE WORD ONLY" -> 1
        "MAXIMUM TWO WORDS" -> 2
    """
    # Check for "ONE WORD ONLY"
    if ONE_WORD_PATTERN.search(instruction_text):
        return 1
    
    # Check for "TWO WORDS"
    if TWO_WORDS_PATTERN.search(instruction_text):
        return 2
    
    # Check for "THREE WORDS"
    if THREE_WORDS_PATTERN.search(instruction_text):
        return 3
    
    # Check for general pattern "NO MORE THAN X WORDS"
    match = WORD_LIMIT_PATTERN.search(instruction_text)
    if match:
        word_text = match.group(1).lower()
        return WORD_LIMIT_TEXT_MAP.get(word_text)
    
    return None
