"""
Gemini-only Writing Evaluation Service
Outputs Pydantic schemas defined in schemas.py
"""
from __future__ import annotations

import json
import logging
import time
from typing import Any, Dict, List, Optional

from cache_manager import CacheManager
from gemini_client import GeminiClient, GeminiAPIError
from schemas import (
    CriterionFeedback,
    QuotedExample,
    WritingEvaluationRequest,
    WritingEvaluationResponse,
    WritingFeedback,
)

logger = logging.getLogger(__name__)


class WritingEvaluator:
    """Evaluate IELTS writing submissions using Gemini only."""

    MIN_WORDS_TASK1 = 150
    MIN_WORDS_TASK2 = 250

    def __init__(
        self,
        gemini_client: Optional[GeminiClient] = None,
        cache: Optional[CacheManager] = None,
    ) -> None:
        self.gemini_client = gemini_client or GeminiClient()
        self.cache = cache or CacheManager()

    # ------------------------------ Public API ------------------------------ #
    def evaluate(self, request: WritingEvaluationRequest) -> WritingEvaluationResponse:
        """Evaluate an IELTS writing submission using Gemini."""
        min_words = self.MIN_WORDS_TASK2 if request.task_type == "TASK_2" else self.MIN_WORDS_TASK1
        if request.word_count < min_words:
            raise ValueError(
                f"Essay too short for {request.task_type}. Minimum {min_words} words required; received {request.word_count}."
            )

        feature = "writing_task2" if request.task_type == "TASK_2" else "writing_task1"
        cache_key = f"writing:{request.session_id}:{feature}"
        cached = self.cache.get_evaluation(cache_key)
        if cached:
            logger.info("✅ Returning cached writing evaluation for session %s", request.session_id)
            return WritingEvaluationResponse(**cached)

        prompt = self._build_prompt(request)
        start_time = time.time()
        logger.info("📝 Calling Gemini for writing evaluation: session=%s feature=%s", request.session_id, feature)

        try:
            result = self.gemini_client.generate_evaluation(
                prompt=prompt,
                feature=feature,
                max_retries=3,
                timeout=90,
            )
        except GeminiAPIError as exc:
            logger.error("❌ Gemini writing evaluation failed: %s", exc)
            raise

        latency_ms = int((time.time() - start_time) * 1000)
        logger.info(
            "✅ Gemini response received: chars=%d tokens_in=%d tokens_out=%d cost=$%.4f latency=%dms",
            len(result.get("content", "")),
            result.get("usage", {}).get("input_tokens", 0),
            result.get("usage", {}).get("output_tokens", 0),
            result.get("usage", {}).get("cost", 0.0),
            latency_ms,
        )

        evaluation = self._parse_response(result.get("content", ""))

        response = WritingEvaluationResponse(
            session_id=request.session_id,
            overall_band=self._ensure_band(evaluation.get("overall_band", 6.0)),
            task_achievement_band=self._ensure_band(evaluation.get("task_achievement", {}).get("band", 6.0)),
            coherence_band=self._ensure_band(evaluation.get("coherence", {}).get("band", 6.0)),
            lexical_band=self._ensure_band(evaluation.get("lexical", {}).get("band", 6.0)),
            grammar_band=self._ensure_band(evaluation.get("grammar", {}).get("band", 6.0)),
            feedback=self._build_feedback(evaluation),
            confidence_score=float(evaluation.get("confidence_score", 0.8)),
            model_used=self.gemini_client.models.get(feature, self.gemini_client.models["default"]),
            evaluated_at=time.time(),
            metadata=None,
        )

        self.cache.cache_evaluation(cache_key, response.model_dump(), ttl=30 * 24 * 3600)
        logger.info("📦 Cached writing evaluation for session %s", request.session_id)
        return response

    # ------------------------------ Prompt Helpers ------------------------------ #
    def _build_prompt(self, request: WritingEvaluationRequest) -> str:
        """Create the structured prompt for Gemini."""
        return f'''
You are an experienced IELTS examiner. Evaluate the student's essay using official IELTS Writing band descriptors.

TASK TYPE: {request.task_type}
TASK PROMPT:
{request.prompt}

STUDENT ESSAY ({request.word_count} words):
"{request.essay_content.strip()}"

Provide a detailed evaluation in STRICT JSON (no markdown, no comments) with this structure:
{{
  "overall_band": <float 1-9 in 0.5 increments>,
  "confidence_score": <float 0-1>,
  "overall_feedback": "<2-3 sentence holistic summary>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>", "<weakness3>"],
  "recommendations": ["<short actionable recommendation>", "<another recommendation>"],
  "task_achievement": {{
    "band": <float 1-9 in 0.5 increments>,
    "feedback": "<detailed feedback>",
    "strengths": ["<strength>", "<strength>"] ,
    "weaknesses": ["<weakness>", "<weakness>"],
    "improvements": ["<improvement>", "<improvement>"]
  }},
  "coherence": {{
    "band": <float 1-9 in 0.5 increments>,
    "feedback": "<detailed feedback>",
    "strengths": ["<strength>", "<strength>"],
    "weaknesses": ["<weakness>", "<weakness>"],
    "improvements": ["<improvement>", "<improvement>"]
  }},
  "lexical": {{
    "band": <float 1-9 in 0.5 increments>,
    "feedback": "<detailed feedback>",
    "strengths": ["<strength>", "<strength>"],
    "weaknesses": ["<weakness>", "<weakness>"],
    "improvements": ["<improvement>", "<improvement>"]
  }},
  "grammar": {{
    "band": <float 1-9 in 0.5 increments>,
    "feedback": "<detailed feedback>",
    "strengths": ["<strength>", "<strength>"],
    "weaknesses": ["<weakness>", "<weakness>"],
    "improvements": ["<improvement>", "<improvement>"]
  }},
  "quoted_examples": [
    {{"quote": "<exact sentence from essay>", "issue": "<problem>", "suggestion": "<improved version>"}},
    {{"quote": "...", "issue": "...", "suggestion": "..."}}
  ]
}}

Requirements:
- Use the student's actual wording for "quoted_examples".
- Bands must be realistic for IELTS (most essays fall between 5.0 and 7.5).
- Keep arrays concise (max 4 items each).
- Do not include explanations outside the JSON.
'''

    # ------------------------------ Response Helpers ------------------------------ #
    def _parse_response(self, raw_text: str) -> Dict[str, Any]:
        """Parse Gemini JSON response, extracting JSON if wrapped in markdown."""
        raw_text = raw_text.strip()
        if not raw_text:
            raise ValueError("Empty response returned from Gemini")

        candidate = raw_text
        if "{" in raw_text and "}" in raw_text:
            start = raw_text.find("{")
            end = raw_text.rfind("}") + 1
            candidate = raw_text[start:end]

        try:
            return json.loads(candidate)
        except json.JSONDecodeError as exc:
            logger.error("❌ Failed to parse Gemini JSON response: %s", exc)
            raise ValueError("Gemini response was not valid JSON") from exc

    def _build_feedback(self, evaluation: Dict[str, Any]) -> WritingFeedback:
        """Construct WritingFeedback from evaluation dict."""
        def build_criterion(data: Dict[str, Any]) -> CriterionFeedback:
            return CriterionFeedback(
                score=self._ensure_band(data.get("band", 6.0)),
                description=data.get("feedback", ""),
                examples=data.get("strengths", []) or [],
                suggestions=data.get("improvements", []) or [],
            )

        quoted_examples = [
            QuotedExample(
                quote=item.get("quote", ""),
                issue=item.get("issue", ""),
                suggestion=item.get("suggestion", ""),
            )
            for item in self._safe_list(evaluation.get("quoted_examples", []))
            if item.get("quote")
        ]

        return WritingFeedback(
            overall=evaluation.get("overall_feedback", ""),
            strengths=self._safe_list(evaluation.get("strengths", [])),
            weaknesses=self._safe_list(evaluation.get("weaknesses", [])),
            task_achievement=build_criterion(evaluation.get("task_achievement", {})),
            coherence=build_criterion(evaluation.get("coherence", {})),
            lexical=build_criterion(evaluation.get("lexical", {})),
            grammar=build_criterion(evaluation.get("grammar", {})),
            recommendations=self._safe_list(evaluation.get("recommendations", [])),
            quoted_examples=quoted_examples,
        )

    # ------------------------------ Utility Helpers ------------------------------ #
    def _ensure_band(self, value: Any) -> float:
        try:
            value = float(value)
        except (TypeError, ValueError):
            value = 6.0

        if value < 1.0:
            value = 1.0
        elif value > 9.0:
            value = 9.0

        # Snap to nearest 0.5 increment
        return round(value * 2) / 2

    def _safe_list(self, value: Any) -> List[str]:
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        return []


