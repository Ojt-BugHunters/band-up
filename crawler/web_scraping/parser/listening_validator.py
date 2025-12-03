"""
Structure Validator for IELTS Listening Tests

This module validates the completeness and correctness of parsed listening test data.
"""

from typing import List
import logging
from pathlib import Path

from .listening_models import (
    Section,
    ListeningQuestion,
    ListeningAnswer,
    ValidationResult
)
from .media_downloader import MediaFile

logger = logging.getLogger(__name__)


class ListeningValidator:
    """
    Validates the structure and completeness of listening test data
    
    Ensures that:
    - All 4 sections are present
    - All 40 questions are present and sequential (1-40)
    - All 40 answers are present and match questions
    - Audio files are present and valid
    """
    
    EXPECTED_SECTIONS = 4
    EXPECTED_QUESTIONS = 40
    EXPECTED_ANSWERS = 40
    
    def validate(self, 
                sections: List[Section],
                questions: List[ListeningQuestion],
                answers: List[ListeningAnswer],
                media_files: List[MediaFile]) -> ValidationResult:
        """
        Validate the complete structure of a listening test
        
        Args:
            sections: List of Section objects
            questions: List of ListeningQuestion objects
            answers: List of ListeningAnswer objects
            media_files: List of MediaFile objects
            
        Returns:
            ValidationResult with validation status and any errors/warnings
        """
        errors = []
        warnings = []
        
        logger.info("Starting validation...")
        
        # Validate sections
        section_errors, section_warnings = self._validate_sections(sections)
        errors.extend(section_errors)
        warnings.extend(section_warnings)
        
        # Validate questions
        question_errors, question_warnings = self._validate_questions(questions)
        errors.extend(question_errors)
        warnings.extend(question_warnings)
        
        # Validate answers
        answer_errors, answer_warnings = self._validate_answers(answers, questions)
        errors.extend(answer_errors)
        warnings.extend(answer_warnings)
        
        # Validate media files
        media_errors, media_warnings = self._validate_media_files(media_files, sections)
        errors.extend(media_errors)
        warnings.extend(media_warnings)
        
        # Validate question-section mapping
        mapping_errors, mapping_warnings = self._validate_question_section_mapping(
            questions, sections
        )
        errors.extend(mapping_errors)
        warnings.extend(mapping_warnings)
        
        is_valid = len(errors) == 0
        
        logger.info(f"Validation complete: {'PASSED' if is_valid else 'FAILED'}")
        logger.info(f"Errors: {len(errors)}, Warnings: {len(warnings)}")
        
        return ValidationResult(
            is_valid=is_valid,
            errors=errors,
            warnings=warnings
        )
    
    def _validate_sections(self, sections: List[Section]) -> tuple[List[str], List[str]]:
        """
        Validate section structure
        
        Requirements: 9.2
        - Must have exactly 4 sections
        - Sections must be numbered 1-4
        - Each section should have a title
        """
        errors = []
        warnings = []
        
        # Check section count
        if len(sections) != self.EXPECTED_SECTIONS:
            errors.append(
                f"Expected {self.EXPECTED_SECTIONS} sections, found {len(sections)}"
            )
            return errors, warnings
        
        # Check section numbers
        section_numbers = [s.section_number for s in sections]
        expected_numbers = list(range(1, self.EXPECTED_SECTIONS + 1))
        
        if sorted(section_numbers) != expected_numbers:
            errors.append(
                f"Section numbers must be 1-4, found: {sorted(section_numbers)}"
            )
        
        # Check for duplicate section numbers
        if len(section_numbers) != len(set(section_numbers)):
            errors.append("Duplicate section numbers found")
        
        # Check section titles
        for section in sections:
            if not section.title or not section.title.strip():
                warnings.append(
                    f"Section {section.section_number} has no title"
                )
        
        # Check question ranges
        for section in sections:
            start, end = section.question_range
            expected_start = (section.section_number - 1) * 10 + 1
            expected_end = section.section_number * 10
            
            if start != expected_start or end != expected_end:
                warnings.append(
                    f"Section {section.section_number} has unexpected question range "
                    f"({start}-{end}), expected ({expected_start}-{expected_end})"
                )
        
        logger.debug(f"Section validation: {len(errors)} errors, {len(warnings)} warnings")
        return errors, warnings
    
    def _validate_questions(self, questions: List[ListeningQuestion]) -> tuple[List[str], List[str]]:
        """
        Validate question structure
        
        Requirements: 9.3
        - Must have exactly 40 questions
        - Questions must be numbered 1-40 sequentially
        - Each question must have required fields
        """
        errors = []
        warnings = []
        
        # Check question count
        if len(questions) != self.EXPECTED_QUESTIONS:
            errors.append(
                f"Expected {self.EXPECTED_QUESTIONS} questions, found {len(questions)}"
            )
        
        # Check question numbering
        question_numbers = [q.question_number for q in questions]
        expected_numbers = list(range(1, self.EXPECTED_QUESTIONS + 1))
        
        if sorted(question_numbers) != expected_numbers:
            missing = set(expected_numbers) - set(question_numbers)
            extra = set(question_numbers) - set(expected_numbers)
            
            if missing:
                errors.append(f"Missing question numbers: {sorted(missing)}")
            if extra:
                errors.append(f"Unexpected question numbers: {sorted(extra)}")
        
        # Check for duplicate question numbers
        if len(question_numbers) != len(set(question_numbers)):
            duplicates = [num for num in question_numbers if question_numbers.count(num) > 1]
            errors.append(f"Duplicate question numbers found: {sorted(set(duplicates))}")
        
        # Check required fields for each question
        for question in questions:
            if not question.question_text or not question.question_text.strip():
                warnings.append(
                    f"Question {question.question_number} has no question text"
                )
            
            if not question.instructions or not question.instructions.strip():
                warnings.append(
                    f"Question {question.question_number} has no instructions"
                )
            
            # Check section number is valid
            if question.section_number not in [1, 2, 3, 4]:
                errors.append(
                    f"Question {question.question_number} has invalid section number: "
                    f"{question.section_number}"
                )
        
        logger.debug(f"Question validation: {len(errors)} errors, {len(warnings)} warnings")
        return errors, warnings
    
    def _validate_answers(self, 
                         answers: List[ListeningAnswer],
                         questions: List[ListeningQuestion]) -> tuple[List[str], List[str]]:
        """
        Validate answer structure
        
        Requirements: 9.4
        - Must have exactly 40 answers
        - Answers must match question numbers
        - Each answer must have a correct_answer value
        """
        errors = []
        warnings = []
        
        # Check answer count
        if len(answers) != self.EXPECTED_ANSWERS:
            errors.append(
                f"Expected {self.EXPECTED_ANSWERS} answers, found {len(answers)}"
            )
        
        # Check answer numbering
        answer_numbers = [a.question_number for a in answers]
        question_numbers = [q.question_number for q in questions]
        
        # Check for missing answers
        missing_answers = set(question_numbers) - set(answer_numbers)
        if missing_answers:
            errors.append(
                f"Missing answers for questions: {sorted(missing_answers)}"
            )
        
        # Check for extra answers
        extra_answers = set(answer_numbers) - set(question_numbers)
        if extra_answers:
            warnings.append(
                f"Answers found for non-existent questions: {sorted(extra_answers)}"
            )
        
        # Check for duplicate answers
        if len(answer_numbers) != len(set(answer_numbers)):
            duplicates = [num for num in answer_numbers if answer_numbers.count(num) > 1]
            errors.append(f"Duplicate answers found for questions: {sorted(set(duplicates))}")
        
        # Check answer content
        for answer in answers:
            if not answer.correct_answer or not answer.correct_answer.strip():
                errors.append(
                    f"Answer {answer.question_number} has no correct_answer value"
                )
        
        logger.debug(f"Answer validation: {len(errors)} errors, {len(warnings)} warnings")
        return errors, warnings
    
    def _validate_media_files(self, 
                             media_files: List[MediaFile],
                             sections: List[Section]) -> tuple[List[str], List[str]]:
        """
        Validate media files
        
        Requirements: 9.5
        - At least one audio file must be present
        - Audio files should exist on disk
        - Audio files should have non-zero size
        """
        errors = []
        warnings = []
        
        # Check if any media files exist
        if len(media_files) == 0:
            errors.append("No audio files found")
            return errors, warnings
        
        # Check each media file
        for media_file in media_files:
            # Check if file exists
            file_path = Path(media_file.local_path)
            if not file_path.exists():
                errors.append(
                    f"Audio file does not exist: {media_file.local_path}"
                )
                continue
            
            # Check file size
            if media_file.file_size == 0:
                errors.append(
                    f"Audio file is empty (0 bytes): {media_file.local_path}"
                )
            elif media_file.file_size < 1000:  # Less than 1KB
                warnings.append(
                    f"Audio file is suspiciously small ({media_file.file_size} bytes): "
                    f"{media_file.local_path}"
                )
            
            # Check section number
            if media_file.section_number not in [1, 2, 3, 4]:
                warnings.append(
                    f"Media file has invalid section number: {media_file.section_number}"
                )
        
        # Check if all sections have audio files
        media_section_numbers = {mf.section_number for mf in media_files}
        section_numbers = {s.section_number for s in sections}
        
        missing_audio = section_numbers - media_section_numbers
        if missing_audio:
            warnings.append(
                f"Sections missing audio files: {sorted(missing_audio)}"
            )
        
        logger.debug(f"Media file validation: {len(errors)} errors, {len(warnings)} warnings")
        return errors, warnings
    
    def _validate_question_section_mapping(self,
                                          questions: List[ListeningQuestion],
                                          sections: List[Section]) -> tuple[List[str], List[str]]:
        """
        Validate that questions are correctly mapped to sections
        
        Requirements: 8.1, 8.2, 8.3, 8.4
        - Questions 1-10 should be in Section 1
        - Questions 11-20 should be in Section 2
        - Questions 21-30 should be in Section 3
        - Questions 31-40 should be in Section 4
        """
        errors = []
        warnings = []
        
        for question in questions:
            expected_section = ((question.question_number - 1) // 10) + 1
            
            if question.section_number != expected_section:
                errors.append(
                    f"Question {question.question_number} is in section "
                    f"{question.section_number}, expected section {expected_section}"
                )
        
        logger.debug(f"Question-section mapping validation: {len(errors)} errors, {len(warnings)} warnings")
        return errors, warnings
    
    def generate_report(self, validation_result: ValidationResult) -> str:
        """
        Generate a human-readable validation report
        
        Requirements: 9.1, 9.6
        
        Args:
            validation_result: ValidationResult object
            
        Returns:
            Formatted validation report as string
        """
        lines = []
        lines.append("=" * 70)
        lines.append("LISTENING TEST VALIDATION REPORT")
        lines.append("=" * 70)
        lines.append("")
        
        # Overall status
        status = "✓ PASSED" if validation_result.is_valid else "✗ FAILED"
        lines.append(f"Status: {status}")
        lines.append("")
        
        # Errors
        if validation_result.errors:
            lines.append(f"ERRORS ({len(validation_result.errors)}):")
            lines.append("-" * 70)
            for i, error in enumerate(validation_result.errors, 1):
                lines.append(f"  {i}. {error}")
            lines.append("")
        else:
            lines.append("ERRORS: None")
            lines.append("")
        
        # Warnings
        if validation_result.warnings:
            lines.append(f"WARNINGS ({len(validation_result.warnings)}):")
            lines.append("-" * 70)
            for i, warning in enumerate(validation_result.warnings, 1):
                lines.append(f"  {i}. {warning}")
            lines.append("")
        else:
            lines.append("WARNINGS: None")
            lines.append("")
        
        lines.append("=" * 70)
        
        report = "\n".join(lines)
        logger.info(f"Generated validation report:\n{report}")
        
        return report
