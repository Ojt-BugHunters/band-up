"""
Test validator for Gemini enhancement pipeline.

Validates the structure and content of enhanced test data.
"""

import logging
from typing import Dict, Any, List, Optional
from .models import ValidationResult

logger = logging.getLogger(__name__)


class TestValidator:
    """Validates enhanced test data structure and content."""
    
    def __init__(self, strict_mode: bool = False):
        """
        Initialize the validator.
        
        Args:
            strict_mode: If True, treat warnings as errors
        """
        self.strict_mode = strict_mode
    
    def validate_structure(self, data: Dict[str, Any]) -> ValidationResult:
        """
        Validate the structure of enhanced test data.
        
        Args:
            data: Enhanced test data dictionary
            
        Returns:
            ValidationResult with validation status
        """
        errors = []
        warnings = []
        checks_passed = []
        
        test_number = data.get("testNumber", data.get("test_metadata", {}).get("test_number", 0))
        test_type = data.get("testType", data.get("test_metadata", {}).get("test_type", "unknown"))
        
        # Check for required fields
        if "questionTypes" not in data:
            errors.append("Missing 'questionTypes' field")
        else:
            question_types = data["questionTypes"]
            if not isinstance(question_types, list):
                errors.append("'questionTypes' must be a list")
            elif len(question_types) != 40:
                warnings.append(f"Expected 40 question types, found {len(question_types)}")
            else:
                checks_passed.append("Question types count is correct (40)")
            
            # Validate each question type entry
            if isinstance(question_types, list):
                for i, qt in enumerate(question_types):
                    if not isinstance(qt, dict):
                        errors.append(f"Question type entry {i} is not a dictionary")
                    elif len(qt) != 1:
                        warnings.append(f"Question type entry {i} has unexpected format")
        
        # Check for test metadata
        if "test_metadata" in data or "testNumber" in data:
            checks_passed.append("Test metadata present")
        else:
            warnings.append("Missing test metadata")
        
        # Check for content based on test type
        if test_type == "listening":
            if "sections" in data and len(data["sections"]) > 0:
                checks_passed.append("Sections present")
            else:
                warnings.append("No sections found in listening test")
            
            if "questions" in data and len(data["questions"]) > 0:
                checks_passed.append("Questions present")
        elif test_type == "reading":
            if "passages" in data and len(data["passages"]) > 0:
                checks_passed.append("Passages present")
            else:
                warnings.append("No passages found in reading test")
        
        # Check for answers
        if "answers" in data:
            answers = data["answers"]
            if isinstance(answers, list) and len(answers) > 0:
                checks_passed.append(f"Answers present ({len(answers)} answers)")
            elif isinstance(answers, dict):
                checks_passed.append("Answers present (dict format)")
        else:
            warnings.append("No answers found")
        
        # In strict mode, treat warnings as errors
        if self.strict_mode:
            errors.extend(warnings)
            warnings = []
        
        is_valid = len(errors) == 0
        
        return ValidationResult(
            is_valid=is_valid,
            test_number=test_number,
            test_type=test_type,
            errors=errors,
            warnings=warnings,
            checks_passed=checks_passed
        )
    
    def validate_question_types(self, question_types: List[Dict], test_type: str) -> ValidationResult:
        """
        Validate question type classifications.
        
        Args:
            question_types: List of question type dictionaries
            test_type: Type of test (reading/listening)
            
        Returns:
            ValidationResult
        """
        errors = []
        warnings = []
        checks_passed = []
        
        # Valid types based on test type
        if test_type == "listening":
            valid_types = {"MC", "SA", "TB", "MT", "MP", "LS"}
        else:  # reading
            valid_types = {"MC", "TF", "MH", "MI", "MF", "SA", "SC", "DN", "LS"}
        
        for i, qt in enumerate(question_types):
            if isinstance(qt, dict):
                for key, value in qt.items():
                    if value not in valid_types:
                        warnings.append(f"Question {key}: Unknown type '{value}' for {test_type} test")
        
        if not warnings:
            checks_passed.append(f"All question types are valid for {test_type} test")
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            test_number=0,
            test_type=test_type,
            errors=errors,
            warnings=warnings,
            checks_passed=checks_passed
        )
