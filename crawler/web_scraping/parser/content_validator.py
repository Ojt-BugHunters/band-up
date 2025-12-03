"""
Content Validator for IELTS Test Parsers.

Provides validation for both reading and listening test content.
"""

import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class ValidationResult:
    """Results of content validation."""
    is_valid: bool
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    quality_score: float = 1.0
    
    def to_dict(self) -> Dict:
        return {
            "is_valid": self.is_valid,
            "errors": self.errors,
            "warnings": self.warnings,
            "quality_score": self.quality_score
        }


class ContentValidator:
    """
    Validates IELTS test content for completeness and correctness.
    
    Works with both reading and listening test formats.
    """
    
    def __init__(self):
        logger.info("ContentValidator initialized")
    
    def validate_test(self, test_data: Dict[str, Any]) -> ValidationResult:
        """
        Validate a complete test structure.
        
        Args:
            test_data: Parsed test data dictionary
            
        Returns:
            ValidationResult with errors and warnings
        """
        errors = []
        warnings = []
        
        # Check metadata
        metadata = test_data.get("test_metadata", {})
        if not metadata:
            errors.append("Missing test_metadata")
        else:
            if not metadata.get("test_type"):
                errors.append("Missing test_type in metadata")
            if not metadata.get("source_url"):
                warnings.append("Missing source_url in metadata")
        
        # Check for questions/passages/sections based on test type
        test_type = metadata.get("test_type", "")
        
        if test_type == "reading":
            passages = test_data.get("passages", [])
            if not passages:
                errors.append("No passages found in reading test")
            elif len(passages) < 3:
                warnings.append(f"Expected 3 passages, found {len(passages)}")
        
        elif test_type == "listening":
            sections = test_data.get("sections", [])
            if not sections:
                errors.append("No sections found in listening test")
            elif len(sections) != 4:
                warnings.append(f"Expected 4 sections, found {len(sections)}")
        
        # Check answers
        answers = test_data.get("answers", [])
        if not answers:
            errors.append("No answers found")
        elif len(answers) != 40:
            warnings.append(f"Expected 40 answers, found {len(answers)}")
        
        is_valid = len(errors) == 0
        
        # Calculate quality score
        quality_score = 1.0
        if errors:
            quality_score -= len(errors) * 0.2
        if warnings:
            quality_score -= len(warnings) * 0.1
        quality_score = max(0.0, quality_score)
        
        return ValidationResult(
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            quality_score=quality_score
        )
    
    def validate_html_content(self, html_content: str) -> ValidationResult:
        """
        Validate HTML content for well-formedness.
        
        Args:
            html_content: HTML string to validate
            
        Returns:
            ValidationResult
        """
        errors = []
        warnings = []
        
        if not html_content or not html_content.strip():
            errors.append("Empty HTML content")
        elif len(html_content) < 100:
            warnings.append("HTML content seems too short")
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings
        )
    
    def validate_answers(self, answers: List[Dict]) -> ValidationResult:
        """
        Validate answer list for completeness.
        
        Args:
            answers: List of answer dictionaries
            
        Returns:
            ValidationResult
        """
        errors = []
        warnings = []
        
        if not answers:
            errors.append("No answers provided")
            return ValidationResult(is_valid=False, errors=errors, warnings=warnings)
        
        # Check for 40 answers
        if len(answers) != 40:
            warnings.append(f"Expected 40 answers, found {len(answers)}")
        
        # Check answer numbers are sequential
        answer_numbers = []
        for a in answers:
            if isinstance(a, dict):
                answer_numbers.append(a.get("question_number", 0))
            else:
                answer_numbers.append(getattr(a, "question_number", 0))
        
        sorted_nums = sorted(answer_numbers)
        expected = list(range(1, 41))
        
        if sorted_nums != expected:
            missing = set(expected) - set(sorted_nums)
            if missing:
                errors.append(f"Missing answer numbers: {sorted(missing)}")
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings
        )
    
    def validate_reading_test(self, json_data: Dict, test_number: int = None) -> ValidationResult:
        """
        Validate a reading test for completeness.
        
        Args:
            json_data: Complete test JSON data
            test_number: Optional test number for logging
            
        Returns:
            ValidationResult
        """
        errors = []
        warnings = []
        
        passages = json_data.get("passages", [])
        answers = json_data.get("answers", [])
        
        # Check passages
        if not passages:
            errors.append("No passages found")
        elif len(passages) < 3:
            warnings.append(f"Expected 3 passages, found {len(passages)}")
        
        # Check answers
        if not answers:
            errors.append("No answers found")
        elif len(answers) != 40:
            warnings.append(f"Expected 40 answers, found {len(answers)}")
        
        # Calculate quality score
        quality_score = 1.0
        if errors:
            quality_score -= len(errors) * 0.2
        if warnings:
            quality_score -= len(warnings) * 0.1
        quality_score = max(0.0, quality_score)
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            quality_score=quality_score
        )
    
    def validate_listening_test(self, sections: List, answers: List) -> ValidationResult:
        """
        Validate a listening test for completeness.
        
        Args:
            sections: List of section dictionaries
            answers: List of answer dictionaries
            
        Returns:
            ValidationResult
        """
        errors = []
        warnings = []
        
        # Check sections
        if not sections:
            errors.append("No sections found")
        elif len(sections) != 4:
            warnings.append(f"Expected 4 sections, found {len(sections)}")
        
        # Check answers
        if not answers:
            errors.append("No answers found")
        elif len(answers) != 40:
            warnings.append(f"Expected 40 answers, found {len(answers)}")
        
        # Calculate quality score
        quality_score = 1.0
        if errors:
            quality_score -= len(errors) * 0.2
        if warnings:
            quality_score -= len(warnings) * 0.1
        quality_score = max(0.0, quality_score)
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            quality_score=quality_score
        )
