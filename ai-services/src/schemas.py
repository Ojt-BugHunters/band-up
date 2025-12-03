"""
Pydantic schemas for API contract
Defines input/output structure for speaking evaluation
Matches GraphQL schema from Phase 3
"""

from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field, validator, ConfigDict
from decimal import Decimal


class ApiModel(BaseModel):
    model_config = ConfigDict(protected_namespaces=())


# ============================================================================
# METADATA SCHEMAS
# ============================================================================

class EvaluationMetadata(ApiModel):
    """Metadata tracked for each evaluation"""
    model_used: str = Field(..., description="Model that performed the evaluation")
    model_version: str = Field(default="1.0", description="Model version")
    fallback_occurred: bool = Field(default=False, description="Whether fallback was triggered")
    fallback_model: Optional[str] = Field(default=None, description="Model used after fallback")
    latency_ms: int = Field(..., description="Evaluation latency in milliseconds")
    token_usage: Dict[str, int] = Field(default_factory=dict, description="Token usage (input, output, total)")
    estimated_cost: float = Field(default=0.0, description="Estimated cost in USD")
    timestamp: float = Field(..., description="Unix timestamp of evaluation")
    prompt_version: Optional[str] = Field(default=None, description="Prompt template version used")
    prompt_hash: Optional[str] = Field(default=None, description="Hash of prompt for change detection")


# ============================================================================
# INPUT SCHEMAS
# ============================================================================

class SpeakingEvaluationRequest(ApiModel):
    """
    Input schema for speaking evaluation
    
    This matches the GraphQL mutation: submitSpeakingResponse
    """
    session_id: str = Field(..., description="Unique session ID (UUID)")
    user_id: str = Field(..., description="User ID for budget tracking")
    audio_url: str = Field(..., description="S3 URL of audio file")
    part: Literal["PART_1", "PART_2", "PART_3"] = Field(..., description="IELTS speaking part")
    difficulty: Literal["BAND_5", "BAND_6", "BAND_7", "BAND_8", "BAND_9"] = Field(..., description="Target difficulty level")
    questions: List[Dict[str, Any]] = Field(..., description="List of questions asked")
    
    @validator('audio_url')
    def validate_audio_url(cls, v):
        """Ensure audio_url is a valid S3 URL"""
        if not (v.startswith('s3://') or 's3.amazonaws.com' in v or 's3-' in v):
            raise ValueError('audio_url must be a valid S3 URL')
        return v
    
    @validator('questions')
    def validate_questions(cls, v):
        """Ensure questions list is not empty"""
        if not v or len(v) == 0:
            raise ValueError('questions list cannot be empty')
        return v
    
    model_config = ConfigDict(
        protected_namespaces=(),
        json_schema_extra={
            "example": {
                "session_id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "user-123",
                "audio_url": "s3://ielts-platform-audio-prod/audio/user-123/session-456/audio.mp3",
                "part": "PART_2",
                "difficulty": "BAND_7",
                "questions": [
                    {
                        "id": "q1",
                        "text": "Describe a place you like to visit",
                        "prepTimeSeconds": 60,
                        "responseTimeSeconds": 120,
                        "order": 1
                    }
                ]
            }
        }
    )


# ============================================================================
# OUTPUT SCHEMAS (Match GraphQL Schema)
# ============================================================================

class CriterionFeedback(ApiModel):
    """
    Feedback for a specific criterion
    Matches GraphQL type: CriterionFeedback
    """
    score: float = Field(..., ge=1.0, le=9.0, description="Band score (1-9 in 0.5 increments)")
    description: str = Field(..., description="Detailed description of performance")
    examples: List[str] = Field(default_factory=list, description="Specific examples from response")
    suggestions: List[str] = Field(default_factory=list, description="Improvement suggestions")
    
    @validator('score')
    def validate_band_score(cls, v):
        """Ensure score is in 0.5 increments"""
        if v < 1.0 or v > 9.0:
            raise ValueError('Score must be between 1.0 and 9.0')
        if (v * 2) % 1 != 0:  # Check if it's in 0.5 increments
            raise ValueError('Score must be in 0.5 increments (e.g., 6.0, 6.5, 7.0)')
        return v


class SpeakingFeedback(ApiModel):
    """
    Complete feedback for speaking evaluation
    Matches GraphQL type: SpeakingFeedback
    """
    overall: str = Field(..., description="Overall feedback summary")
    strengths: List[str] = Field(..., description="List of strengths")
    weaknesses: List[str] = Field(..., description="List of weaknesses")
    fluency: CriterionFeedback = Field(..., description="Fluency and Coherence feedback")
    lexical: CriterionFeedback = Field(..., description="Lexical Resource feedback")
    grammar: CriterionFeedback = Field(..., description="Grammatical Range and Accuracy feedback")
    pronunciation: CriterionFeedback = Field(..., description="Pronunciation feedback")
    recommendations: List[str] = Field(..., description="Actionable recommendations")


class SpeakingEvaluationResponse(ApiModel):
    """
    Output schema for speaking evaluation
    Matches GraphQL type: SpeakingEvaluation
    """
    session_id: str = Field(..., description="Session ID")
    transcript: str = Field(..., description="Full transcript of audio")
    duration: float = Field(..., description="Audio duration in seconds")
    word_count: int = Field(..., description="Total word count")
    
    # Band scores (match GraphQL schema)
    overall_band: float = Field(..., ge=1.0, le=9.0, description="Overall band score")
    fluency_band: float = Field(..., ge=1.0, le=9.0, description="Fluency and Coherence band")
    lexical_band: float = Field(..., ge=1.0, le=9.0, description="Lexical Resource band")
    grammar_band: float = Field(..., ge=1.0, le=9.0, description="Grammatical Range and Accuracy band")
    pronunciation_band: float = Field(..., ge=1.0, le=9.0, description="Pronunciation band")
    
    # Detailed feedback
    feedback: SpeakingFeedback = Field(..., description="Detailed feedback")
    
    # Metadata
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="AI confidence score")
    model_used: str = Field(default="gemini-1.5-pro", description="AI model used")
    evaluated_at: float = Field(..., description="Unix timestamp of evaluation")
    metadata: Optional[EvaluationMetadata] = Field(default=None, description="Evaluation metadata (model, cost, latency)")
    
    @validator('overall_band', 'fluency_band', 'lexical_band', 'grammar_band', 'pronunciation_band')
    def validate_band_scores(cls, v):
        """Ensure all band scores are in 0.5 increments"""
        if v < 1.0 or v > 9.0:
            raise ValueError('Band score must be between 1.0 and 9.0')
        if (v * 2) % 1 != 0:
            raise ValueError('Band score must be in 0.5 increments')
        return v
    
    model_config = ConfigDict(
        protected_namespaces=(),
        json_schema_extra={
            "example": {
                "session_id": "550e8400-e29b-41d4-a716-446655440000",
                "transcript": "Well, I'd like to talk about my favorite place...",
                "duration": 125.3,
                "word_count": 187,
                "overall_band": 6.5,
                "fluency_band": 7.0,
                "lexical_band": 6.5,
                "grammar_band": 6.0,
                "pronunciation_band": 6.5,
                "feedback": {
                    "overall": "Your response demonstrates good fluency with appropriate vocabulary...",
                    "strengths": [
                        "Natural speaking flow",
                        "Good use of discourse markers"
                    ],
                    "weaknesses": [
                        "Some grammatical errors",
                        "Limited vocabulary range"
                    ],
                    "fluency": {
                        "score": 7.0,
                        "description": "You speak with natural flow and minimal hesitation...",
                        "examples": ["Used 'firstly', 'moreover', 'in conclusion'"],
                        "suggestions": ["Practice longer responses"]
                    },
                    # ... other criteria
                    "recommendations": [
                        "Practice using more complex sentence structures",
                        "Expand academic vocabulary"
                    ]
                },
                "confidence_score": 0.85,
                "model_used": "gemini-1.5-pro",
                "evaluated_at": 1696502400.0
            }
        }
    )


# ============================================================================
# WRITING EVALUATION SCHEMAS (For Future)
# ============================================================================

class WritingEvaluationRequest(ApiModel):
    """Input schema for writing evaluation"""
    session_id: str
    user_id: str
    essay_content: str
    task_type: Literal["TASK_1_ACADEMIC", "TASK_1_GENERAL", "TASK_2"]
    prompt: str
    word_count: int
    model: Optional[str] = Field(default='gemini', description="AI model to use (gemini only)")
    fallback_enabled: bool = Field(default=False, description="Fallback disabled - Gemini-only workflow")


class QuotedExample(ApiModel):
    """Quoted example from essay with correction"""
    quote: str = Field(..., description="Quote from essay")
    issue: str = Field(..., description="Issue identified")
    suggestion: str = Field(..., description="Correction suggestion")


class WritingFeedback(ApiModel):
    """Feedback for writing evaluation"""
    overall: str
    strengths: List[str]
    weaknesses: List[str]
    task_achievement: CriterionFeedback
    coherence: CriterionFeedback
    lexical: CriterionFeedback
    grammar: CriterionFeedback
    recommendations: List[str]
    quoted_examples: List[QuotedExample]


class WritingEvaluationResponse(ApiModel):
    """Output schema for writing evaluation"""
    session_id: str
    overall_band: float
    task_achievement_band: float
    coherence_band: float
    lexical_band: float
    grammar_band: float
    feedback: WritingFeedback
    confidence_score: float
    model_used: str
    evaluated_at: float
    metadata: Optional[EvaluationMetadata] = Field(default=None, description="Evaluation metadata (model, cost, latency)")


# ============================================================================
# FLASHCARD GENERATION SCHEMAS (For Future)
# ============================================================================

class FlashcardGenerationRequest(ApiModel):
    """Input schema for flashcard generation"""
    set_id: str
    user_id: str
    document_id: str
    pdf_url: Optional[str] = None  # Optional - document may already be in S3
    num_cards: int = Field(default=50, ge=10, le=100)
    difficulty: Literal["EASY", "MEDIUM", "HARD"] = "MEDIUM"
    question_types: List[Literal["DEFINITION", "COMPREHENSION", "INFERENCE", "VOCABULARY", "TRUE_FALSE", "FILL_BLANK"]]
    model: Optional[str] = Field(default='gemini', description="AI model to use (gemini only)")
    fallback_enabled: bool = Field(default=False, description="Fallback disabled - using Gemini exclusively")


class Flashcard(ApiModel):
    """Single flashcard"""
    question: str
    answer: str
    question_type: str
    difficulty: str
    chunk_reference: Optional[str] = None
    options: Optional[List[str]] = None
    
    model_config = ConfigDict(exclude_none=True, protected_namespaces=())


class FlashcardGenerationResponse(ApiModel):
    """Output schema for flashcard generation"""
    set_id: str
    flashcards: List[Flashcard]
    total_cards: int
    processing_time: float
    model_used: str
    metadata: Optional[EvaluationMetadata] = Field(default=None, description="Evaluation metadata (model, cost, latency)")


# ============================================================================
# LEARNING PATH SCHEMAS (For Future)
# ============================================================================

class LearningPathRequest(ApiModel):
    """Input schema for learning path generation"""
    user_id: str
    current_band: float
    target_band: float
    target_date: str
    weak_areas: List[str]
    time_available_days: int


class LearningActivity(ApiModel):
    """Single learning activity"""
    week: int
    day: int
    activity_type: str
    title: str
    description: str
    estimated_minutes: int


class StudyPlan(ApiModel):
    """12-week study plan"""
    weeks: List[Dict[str, Any]]
    total_weeks: int
    total_activities: int


class LearningPathResponse(ApiModel):
    """Output schema for learning path generation"""
    user_id: str
    study_plan: StudyPlan
    current_band: float
    target_band: float
    target_date: str
    model_used: str
    generated_at: float

