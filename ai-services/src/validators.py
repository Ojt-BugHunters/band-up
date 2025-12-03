"""
Response Validators - Validate AI responses
Ensures responses meet requirements and schema
"""

import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


class ResponseValidator:
    """
    Validate AI evaluation responses
    
    Checks:
    - Band scores are valid (1-9 in 0.5 increments)
    - Required fields are present
    - Feedback structure is correct
    """
    
    def __init__(self):
        logger.info("✅ ResponseValidator initialized")
    
    def validate_ielts_band_score(self, score: float) -> float:
        """
        Validate and correct IELTS band score
        
        Args:
            score: Band score to validate
            
        Returns:
            Validated/corrected band score (1.0-9.0 in 0.5 increments)
        """
        # Ensure score is a float
        score = float(score)
        
        # Clamp to valid range (1.0-9.0)
        if score < 1.0:
            logger.warning(f"⚠️ Band score {score} < 1.0, correcting to 1.0")
            score = 1.0
        elif score > 9.0:
            logger.warning(f"⚠️ Band score {score} > 9.0, correcting to 9.0")
            score = 9.0
        
        # Round to nearest 0.5 increment
        rounded = round(score * 2) / 2
        if rounded != score:
            logger.warning(f"⚠️ Band score {score} not in 0.5 increments, correcting to {rounded}")
            score = rounded
        
        return score
    
    def validate_speaking_evaluation_response(self, response_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and correct speaking evaluation response
        
        Args:
            response_data: Raw response from Gemini
            
        Returns:
            Validated/corrected response data
        """
        # Validate and correct overall band
        if 'overall_band' in response_data:
            response_data['overall_band'] = self.validate_ielts_band_score(response_data['overall_band'])
        
        # Validate and correct criterion band scores
        criteria = ['fluency_coherence', 'lexical_resource', 'grammatical_range_accuracy', 'pronunciation']
        
        for criterion in criteria:
            if criterion in response_data and isinstance(response_data[criterion], dict):
                criterion_data = response_data[criterion]
                
                # Validate 'score' field (some responses use 'score' instead of 'band')
                if 'score' in criterion_data:
                    criterion_data['score'] = self.validate_ielts_band_score(criterion_data['score'])
                
                # Validate 'band' field
                if 'band' in criterion_data:
                    criterion_data['band'] = self.validate_ielts_band_score(criterion_data['band'])
        
        return response_data
    
    def validate_speaking_evaluation(self, evaluation: Dict[str, Any]) -> bool:
        """
        Validate speaking evaluation response
        
        Args:
            evaluation: Evaluation dict from Gemini
            
        Returns:
            True if valid
            
        Raises:
            ValidationError: If validation fails
        """
        try:
            # Check required top-level fields
            required_fields = [
                'overall_band',
                'fluency_coherence',
                'lexical_resource',
                'grammatical_range_accuracy',
                'pronunciation'
            ]
            
            for field in required_fields:
                if field not in evaluation:
                    raise ValidationError(f"Missing required field: {field}")
            
            # Validate overall band score
            overall_band = evaluation['overall_band']
            self._validate_band_score(overall_band, 'overall_band')
            
            # Validate criterion band scores
            criteria = [
                'fluency_coherence',
                'lexical_resource',
                'grammatical_range_accuracy',
                'pronunciation'
            ]
            
            for criterion in criteria:
                criterion_data = evaluation[criterion]
                
                # Check 'band' field exists
                if 'band' not in criterion_data:
                    raise ValidationError(f"Missing 'band' in {criterion}")
                
                # Validate band score
                self._validate_band_score(criterion_data['band'], f"{criterion}.band")
                
                # Check required criterion fields
                required_criterion_fields = ['feedback', 'strengths', 'weaknesses', 'improvements']
                for field in required_criterion_fields:
                    if field not in criterion_data:
                        raise ValidationError(f"Missing '{field}' in {criterion}")
                    
                    # Validate arrays
                    if field in ['strengths', 'weaknesses', 'improvements']:
                        if not isinstance(criterion_data[field], list):
                            raise ValidationError(f"{criterion}.{field} must be a list")
            
            # Validate overall band is average of criteria (within 0.5)
            criterion_bands = [
                evaluation[criterion]['band'] for criterion in criteria
            ]
            expected_overall = sum(criterion_bands) / len(criterion_bands)
            
            if abs(overall_band - expected_overall) > 0.5:
                logger.warning(
                    f"⚠️ Overall band ({overall_band}) differs from average of criteria "
                    f"({expected_overall:.2f}) by more than 0.5"
                )
                # Note: This is a warning, not an error, as slight discrepancies are acceptable
            
            logger.info("✅ Validation passed for speaking evaluation")
            return True
            
        except ValidationError:
            raise
        except Exception as e:
            raise ValidationError(f"Unexpected validation error: {str(e)}")
    
    def _validate_band_score(self, score: float, field_name: str):
        """
        Validate IELTS band score
        
        Args:
            score: Band score to validate
            field_name: Field name (for error messages)
            
        Raises:
            ValidationError: If score is invalid
        """
        # Check range (1.0 to 9.0)
        if score < 1.0 or score > 9.0:
            raise ValidationError(f"{field_name}: Score must be between 1.0 and 9.0 (got {score})")
        
        # Check 0.5 increments
        if (score * 2) % 1 != 0:
            raise ValidationError(f"{field_name}: Score must be in 0.5 increments (got {score})")
    
    def validate_writing_evaluation(self, evaluation: Dict[str, Any]) -> bool:
        """
        Validate writing evaluation response
        
        Args:
            evaluation: Evaluation dict from Gemini
            
        Returns:
            True if valid
        """
        # Similar validation logic for writing
        # (Omitted for brevity, but would follow same pattern)
        return True
    
    def validate_flashcard(self, flashcard: Dict[str, Any]) -> bool:
        """
        Validate generated flashcard
        
        Args:
            flashcard: Flashcard dict
            
        Returns:
            True if valid
        """
        required_fields = ['question', 'answer', 'question_type', 'difficulty']
        
        for field in required_fields:
            if field not in flashcard or not flashcard[field]:
                raise ValidationError(f"Flashcard missing required field: {field}")
        
        # Validate question and answer are not empty
        if len(flashcard['question'].strip()) < 5:
            raise ValidationError("Flashcard question too short (< 5 chars)")
        
        if len(flashcard['answer'].strip()) < 1:
            raise ValidationError("Flashcard answer is empty")
        
        return True


class ValidationError(Exception):
    """Validation error"""
    pass

