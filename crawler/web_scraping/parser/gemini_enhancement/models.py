"""
Data models for Gemini enhancement pipeline.

This module defines the core data structures used throughout the
enhancement process, including validation results and enhancement results.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum


class QuestionType(str, Enum):
    """Enumeration of IELTS question types (combined for both reading and listening)."""
    # Common types
    MULTIPLE_CHOICE = "multiple-choice"
    SHORT_ANSWER = "short-answer"
    LIST_SELECTION = "list-selection"
    # Reading-specific types
    TRUE_FALSE = "true-false"
    MATCHING_HEADING = "matching-heading"
    MATCHING_INFO = "matching-information"
    MATCHING_FEATURES = "matching-features"
    SUMMARY_COMPLETION = "summary-completion"
    DIAGRAM_NOTE = "diagram-note"
    # Listening-specific types
    TABLE_FORM = "table-form"
    MATCHING = "matching"
    MAP_PLAN = "map-plan"


# Reading test question type prefixes
READING_QUESTION_TYPES = {
    "MC": "multiple-choice",
    "TF": "true-false",
    "MH": "matching-heading",
    "MI": "matching-information",
    "MF": "matching-features",
    "SA": "short-answer",
    "SC": "summary-completion",
    "DN": "diagram-note",
    "LS": "list-selection"
}

# Listening test question type prefixes
LISTENING_QUESTION_TYPES = {
    "MC": "multiple-choice",
    "SA": "short-answer",
    "TB": "table-form",
    "MT": "matching",
    "MP": "map-plan",
    "LS": "list-selection"
}

# Combined map for backward compatibility
QUESTION_TYPE_PREFIX_MAP = {**READING_QUESTION_TYPES, **LISTENING_QUESTION_TYPES}
QUESTION_TYPE_REVERSE_MAP = {v: k for k, v in QUESTION_TYPE_PREFIX_MAP.items()}


def question_type_from_prefix(prefix: str, test_type: str = "reading") -> str:
    """Convert two-letter prefix to full question type name."""
    type_map = LISTENING_QUESTION_TYPES if test_type == "listening" else READING_QUESTION_TYPES
    return type_map.get(prefix.upper(), "short-answer")


def question_type_to_prefix(full_name: str) -> str:
    """Convert full question type name to two-letter prefix."""
    return QUESTION_TYPE_REVERSE_MAP.get(full_name, "SA")


def get_valid_types_for_test(test_type: str) -> Dict[str, str]:
    """Get valid question types for a specific test type."""
    return LISTENING_QUESTION_TYPES if test_type == "listening" else READING_QUESTION_TYPES


class TestType(str, Enum):
    """Enumeration of test types."""
    LISTENING = "listening"
    READING = "reading"


@dataclass
class ValidationResult:
    """
    Result of test data validation.
    
    This class encapsulates all validation information for a single test,
    including success status, errors, warnings, and passed checks.
    """
    
    is_valid: bool
    test_number: int
    test_type: str
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    checks_passed: List[str] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert validation result to dictionary format.
        
        Returns:
            Dictionary representation of validation result
        """
        return {
            "is_valid": self.is_valid,
            "test_number": self.test_number,
            "test_type": self.test_type,
            "errors": self.errors,
            "warnings": self.warnings,
            "checks_passed": self.checks_passed,
            "timestamp": self.timestamp.isoformat()
        }
    
    def add_error(self, error: str) -> None:
        """Add an error to the validation result."""
        self.errors.append(error)
        self.is_valid = False
    
    def add_warning(self, warning: str) -> None:
        """Add a warning to the validation result."""
        self.warnings.append(warning)
    
    def add_check_passed(self, check: str) -> None:
        """Add a passed check to the validation result."""
        self.checks_passed.append(check)
    
    def __str__(self) -> str:
        """Return human-readable validation result."""
        status = "VALID" if self.is_valid else "INVALID"
        return (
            f"ValidationResult({status}): "
            f"Test {self.test_number} ({self.test_type}) - "
            f"{len(self.errors)} errors, {len(self.warnings)} warnings, "
            f"{len(self.checks_passed)} checks passed"
        )


@dataclass
class AdRemovalStats:
    """Statistics about advertisement removal."""
    
    image_urls: List[str] = field(default_factory=list)
    script_count: int = 0
    element_count: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary format."""
        return {
            "image_urls": self.image_urls,
            "script_count": self.script_count,
            "element_count": self.element_count
        }


@dataclass
class ProcessingStats:
    """Statistics about processing performance."""
    
    tokens_used: int = 0
    processing_time_seconds: float = 0.0
    gemini_calls: int = 0
    retry_count: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary format."""
        return {
            "tokens_used": self.tokens_used,
            "processing_time_seconds": round(self.processing_time_seconds, 2),
            "gemini_calls": self.gemini_calls,
            "retry_count": self.retry_count
        }


@dataclass
class EnhancementResult:
    """
    Result of test enhancement process.
    
    This class encapsulates all information about an enhancement operation,
    including the enhanced data, validation results, and processing statistics.
    """
    
    test_number: int
    test_type: str
    success: bool
    enhanced_data: Optional[Dict[str, Any]] = None
    validation_result: Optional[ValidationResult] = None
    ad_removal_stats: AdRemovalStats = field(default_factory=AdRemovalStats)
    processing_stats: ProcessingStats = field(default_factory=ProcessingStats)
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert enhancement result to dictionary format.
        
        Returns:
            Dictionary representation of enhancement result
        """
        result = {
            "test_number": self.test_number,
            "test_type": self.test_type,
            "success": self.success,
            "timestamp": self.timestamp.isoformat(),
            "ad_removal_stats": self.ad_removal_stats.to_dict(),
            "processing_stats": self.processing_stats.to_dict(),
        }
        
        if self.validation_result:
            result["validation"] = self.validation_result.to_dict()
        
        if self.error_message:
            result["error_message"] = self.error_message
        
        # Don't include full enhanced_data in summary
        if self.enhanced_data:
            result["has_enhanced_data"] = True
        
        return result
    
    def __str__(self) -> str:
        """Return human-readable enhancement result."""
        status = "SUCCESS" if self.success else "FAILED"
        return (
            f"EnhancementResult({status}): "
            f"Test {self.test_number} ({self.test_type}) - "
            f"{self.processing_stats.tokens_used} tokens, "
            f"{self.processing_stats.processing_time_seconds:.2f}s"
        )


@dataclass
class BatchProgress:
    """
    Progress tracking for batch processing.
    
    This class maintains state for batch enhancement operations,
    allowing for resume capability and progress reporting.
    """
    
    batch_id: str
    start_time: datetime
    last_update: datetime
    test_type: str
    test_range_start: int
    test_range_end: int
    completed: List[int] = field(default_factory=list)
    failed: List[int] = field(default_factory=list)
    skipped: List[int] = field(default_factory=list)
    in_progress: Optional[int] = None
    total_tokens_used: int = 0
    total_processing_time: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert batch progress to dictionary format."""
        total_tests = self.test_range_end - self.test_range_start + 1
        completed_count = len(self.completed)
        success_rate = completed_count / total_tests if total_tests > 0 else 0.0
        
        return {
            "batch_id": self.batch_id,
            "start_time": self.start_time.isoformat(),
            "last_update": self.last_update.isoformat(),
            "test_type": self.test_type,
            "test_range": {
                "start": self.test_range_start,
                "end": self.test_range_end
            },
            "completed": self.completed,
            "failed": self.failed,
            "skipped": self.skipped,
            "in_progress": self.in_progress,
            "stats": {
                "total_tests": total_tests,
                "completed_count": completed_count,
                "failed_count": len(self.failed),
                "skipped_count": len(self.skipped),
                "success_rate": round(success_rate, 3),
                "total_tokens_used": self.total_tokens_used,
                "total_processing_time": round(self.total_processing_time, 2)
            }
        }
    
    def mark_completed(self, test_number: int, tokens: int, time: float) -> None:
        """Mark a test as completed."""
        if test_number not in self.completed:
            self.completed.append(test_number)
        self.total_tokens_used += tokens
        self.total_processing_time += time
        self.in_progress = None
        self.last_update = datetime.now()
    
    def mark_failed(self, test_number: int) -> None:
        """Mark a test as failed."""
        if test_number not in self.failed:
            self.failed.append(test_number)
        self.in_progress = None
        self.last_update = datetime.now()
    
    def mark_in_progress(self, test_number: int) -> None:
        """Mark a test as in progress."""
        self.in_progress = test_number
        self.last_update = datetime.now()
    
    def __str__(self) -> str:
        """Return human-readable batch progress."""
        total = self.test_range_end - self.test_range_start + 1
        return (
            f"BatchProgress: {len(self.completed)}/{total} completed, "
            f"{len(self.failed)} failed, {self.total_tokens_used} tokens"
        )


@dataclass
class RateLimitStats:
    """
    Statistics for rate limiting.
    
    Tracks current usage against configured limits.
    """
    
    requests_per_minute: int
    tokens_per_minute: int
    requests_per_day: int
    current_rpm: int = 0
    current_tpm: int = 0
    current_daily: int = 0
    last_request_time: Optional[datetime] = None
    minute_window_start: Optional[datetime] = None
    day_start: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert rate limit stats to dictionary format."""
        return {
            "limits": {
                "requests_per_minute": self.requests_per_minute,
                "tokens_per_minute": self.tokens_per_minute,
                "requests_per_day": self.requests_per_day
            },
            "current_usage": {
                "rpm": self.current_rpm,
                "tpm": self.current_tpm,
                "daily": self.current_daily
            },
            "last_request_time": self.last_request_time.isoformat() if self.last_request_time else None,
            "minute_window_start": self.minute_window_start.isoformat() if self.minute_window_start else None,
            "day_start": self.day_start.isoformat() if self.day_start else None
        }
