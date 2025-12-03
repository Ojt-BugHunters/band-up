"""
Flashcard Generator powered by Gemini
Simplified pipeline without OpenSearch/FAISS dependencies.
"""

from __future__ import annotations

import io
import json
import logging
import time
from dataclasses import dataclass
from typing import Any, Iterable, List, Optional

import boto3
import PyPDF2

from cache_manager import CacheManager
from gemini_client import GeminiClient
from schemas import Flashcard, FlashcardGenerationRequest, FlashcardGenerationResponse

logger = logging.getLogger(__name__)

S3_PREFIX = "s3://"
S3_HOST_PREFIX = "s3.amazonaws.com"

SUPPORTED_QUESTION_TYPES = {
    "DEFINITION",
    "COMPREHENSION",
    "INFERENCE",
    "VOCABULARY",
    "TRUE_FALSE",
    "FILL_BLANK",
    "MULTIPLE_CHOICE",
}


@dataclass
class GenerationBatch:
    context: str
    batch_size: int


class FlashcardGenerator:
    """Generate IELTS flashcards directly with Gemini."""

    def __init__(
        self,
        gemini_api_key: Optional[str] = None,
        redis_client: Optional[Any] = None,
        s3_client: Optional[Any] = None,
        max_cards_per_batch: int = 5,
        max_context_chars: int = 12_000,
    ) -> None:
        self.gemini_client = GeminiClient(api_key=gemini_api_key)
        self.cache_manager = CacheManager(redis_client=redis_client)
        self.s3_client = s3_client or boto3.client("s3")
        self.max_cards_per_batch = max(1, max_cards_per_batch)
        self.max_context_chars = max_context_chars
        self.model_used = self.gemini_client.models.get(
            "flashcards", self.gemini_client.models.get("default", "gemini")
        )
        logger.info("✅ FlashcardGenerator initialized (Gemini-only mode)")

    def generate_flashcards(
        self, request: FlashcardGenerationRequest
    ) -> FlashcardGenerationResponse:
        start_time = time.time()
        document_url = self._resolve_document_url(request)
        cache_key = self._build_cache_key(request, document_url)

        cached = self.cache_manager.get_evaluation(cache_key)
        if cached:
            logger.info("✅ Returning cached flashcards")
            return FlashcardGenerationResponse(**cached)

        pdf_bytes = self._download_pdf(document_url)
        document_text = self._extract_text(pdf_bytes)
        if not document_text.strip():
            raise FlashcardGenerationError("Document is empty after text extraction")

        batches = self._prepare_batches(document_text, request.num_cards)
        flashcards: List[Flashcard] = []

        for batch in batches:
            if len(flashcards) >= request.num_cards:
                break

            prompt = self._build_prompt(
                context=batch.context,
                cards=batch.batch_size,
                difficulty=request.difficulty,
                question_types=request.question_types,
            )

            try:
                result = self.gemini_client.generate_evaluation(
                    prompt=prompt,
                    feature="flashcards",
                    timeout=90,
                )
            except Exception as exc:  # pylint: disable=broad-except
                logger.error("❌ Gemini generation failed: %s", exc)
                raise FlashcardGenerationError(
                    f"Gemini generation failed: {exc}"
                ) from exc

            batch_cards = self._parse_flashcards(
                response_text=result["content"],
                fallback_count=batch.batch_size,
                difficulty=request.difficulty,
                question_types=request.question_types,
            )
            flashcards.extend(batch_cards)

        if not flashcards:
            raise FlashcardGenerationError("Gemini returned no flashcards")

        trimmed_flashcards = flashcards[: request.num_cards]
        response = FlashcardGenerationResponse(
            set_id=request.set_id,
            flashcards=trimmed_flashcards,
            total_cards=len(trimmed_flashcards),
            processing_time=time.time() - start_time,
            model_used=self.model_used,
        )

        self.cache_manager.cache_evaluation(
            cache_key,
            response.model_dump(),
            ttl=7 * 24 * 60 * 60,
        )

        return response

    def _resolve_document_url(
        self, request: FlashcardGenerationRequest
    ) -> str:
        if request.pdf_url:
            return request.pdf_url

        if request.document_id and (
            request.document_id.startswith(S3_PREFIX)
            or request.document_id.startswith("https://")
        ):
            return request.document_id

        raise FlashcardGenerationError(
            "Request must include pdf_url pointing to an S3 object"
        )

    def _download_pdf(self, url: str) -> bytes:
        if url.startswith(S3_PREFIX):
            bucket, key = url.replace(S3_PREFIX, "", 1).split("/", 1)
        elif S3_HOST_PREFIX in url:
            parts = url.split("/")
            bucket = parts[2].split(".")[0]
            key = "/".join(parts[3:])
        else:
            raise FlashcardGenerationError(
                "Only S3 URLs are supported for flashcard generation"
            )

        logger.info("📥 Downloading PDF from S3: bucket=%s key=%s", bucket, key)
        try:
            response = self.s3_client.get_object(Bucket=bucket, Key=key)
            return response["Body"].read()
        except Exception as exc:  # pylint: disable=broad-except
            raise FlashcardGenerationError(
                f"Failed to download PDF from S3: {exc}"
            ) from exc

    def _extract_text(self, pdf_bytes: bytes) -> str:
        try:
            pdf = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
            text = "\n\n".join(page.extract_text() or "" for page in pdf.pages)
            return text.strip()
        except Exception as exc:  # pylint: disable=broad-except
            raise FlashcardGenerationError(
                f"Failed to extract text from PDF: {exc}"
            ) from exc

    def _prepare_batches(self, text: str, total_cards: int) -> List[GenerationBatch]:
        cleaned = " ".join(text.split())
        contexts = list(self._split_context(cleaned))
        batches: List[GenerationBatch] = []
        cards_remaining = total_cards

        for context in contexts:
            if cards_remaining <= 0:
                break
            batch_size = min(self.max_cards_per_batch, cards_remaining)
            batches.append(GenerationBatch(context=context, batch_size=batch_size))
            cards_remaining -= batch_size

        if not batches:
            batches.append(
                GenerationBatch(
                    context=cleaned[: self.max_context_chars],
                    batch_size=total_cards,
                )
            )

        return batches

    def _split_context(self, text: str) -> Iterable[str]:
        if len(text) <= self.max_context_chars:
            yield text
            return

        step = self.max_context_chars
        for start in range(0, len(text), step):
            yield text[start : start + step]

    def _build_prompt(
        self,
        context: str,
        cards: int,
        difficulty: str,
        question_types: Optional[List[str]],
    ) -> str:
        allowed_types = question_types or sorted(SUPPORTED_QUESTION_TYPES)
        allowed_types = [qt for qt in allowed_types if qt in SUPPORTED_QUESTION_TYPES]
        if not allowed_types:
            allowed_types = ["DEFINITION", "COMPREHENSION"]

        allowed_list = ", ".join(allowed_types)
        return (
            f"You are an IELTS academic coach. Generate {cards} high-quality flashcards "
            "for students preparing for IELTS examinations.\n\n"
            f"CONTEXT:\n{context}\n\n"
            "INSTRUCTIONS:\n"
            f"- Difficulty level: {difficulty}.\n"
            f"- Restrict question_type to the following values: {allowed_list}.\n"
            "- Keep each question concise and ensure the answer is factual.\n"
            "- Only include the options field when question_type is MULTIPLE_CHOICE and provide exactly four distinct options.\n"
            "- Do not include commentary, markdown, or any text outside of the JSON response.\n\n"
            "Return a JSON array matching this schema:\n"
            "[\n"
            "  {\n"
            '    "question": "<question text>",\n'
            '    "answer": "<answer text>",\n'
            '    "question_type": "<one of the allowed values>",\n'
            '    "difficulty": "<difficulty level>",\n'
            '    "options": ["<option A>", "<option B>", "<option C>", "<option D>"]\n'
            "  }\n"
            "]\n"
            "Omit the options field for non-multiple-choice questions."
        )

    def _parse_flashcards(
        self,
        response_text: str,
        fallback_count: int,
        difficulty: str,
        question_types: Optional[List[str]],
    ) -> List[Flashcard]:
        try:
            data = json.loads(response_text)
        except json.JSONDecodeError:
            start = response_text.find("[")
            end = response_text.rfind("]") + 1
            if start == -1 or end <= start:
                logger.error("❌ Gemini response was not JSON: %s", response_text[:200])
                raise FlashcardGenerationError("Gemini response was not valid JSON")
            data = json.loads(response_text[start:end])

        if not isinstance(data, list):
            raise FlashcardGenerationError("Gemini response must be a list of flashcards")

        allowed_types = question_types or sorted(SUPPORTED_QUESTION_TYPES)
        allowed_types = [qt for qt in allowed_types if qt in SUPPORTED_QUESTION_TYPES]
        if not allowed_types:
            allowed_types = ["DEFINITION"]

        parsed_cards: List[Flashcard] = []
        for item in data:
            if len(parsed_cards) >= fallback_count:
                break
            flashcard = self._build_flashcard_from_item(
                item=item,
                allowed_types=allowed_types,
                fallback_difficulty=difficulty,
            )
            if flashcard:
                parsed_cards.append(flashcard)

        if not parsed_cards:
            raise FlashcardGenerationError("Gemini returned flashcards without valid content")

        return parsed_cards

    def _build_cache_key(
        self, request: FlashcardGenerationRequest, document_url: str
    ) -> str:
        question_types_key = ",".join(request.question_types)
        return ":".join(
            [
                "flashcards",
                request.set_id,
                document_url,
                str(request.num_cards),
                request.difficulty,
                question_types_key,
            ]
        )

    def _build_flashcard_from_item(
        self,
        item: Any,
        allowed_types: List[str],
        fallback_difficulty: str,
    ) -> Optional[Flashcard]:
        if not isinstance(item, dict):
            return None

        question = (item.get("question") or item.get("prompt") or "").strip()
        answer = (item.get("answer") or item.get("response") or "").strip()
        difficulty_value = (item.get("difficulty") or fallback_difficulty).strip()
        q_type = (item.get("question_type") or allowed_types[0]).strip().upper()

        if not question or not answer:
            return None

        if q_type not in SUPPORTED_QUESTION_TYPES:
            q_type = allowed_types[0]

        options = item.get("options")
        if q_type == "MULTIPLE_CHOICE":
            if not isinstance(options, list) or len(options) != 4:
                return None
            options = [str(opt).strip() for opt in options]
        else:
            options = None

        return Flashcard(
            question=question,
            answer=answer,
            question_type=q_type,
            difficulty=difficulty_value,
            options=options,
        )


class FlashcardGenerationError(Exception):
    """Raised when flashcard generation fails."""


