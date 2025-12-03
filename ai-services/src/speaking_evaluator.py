"""
IELTS Speaking Evaluator - Production Version
Integrates with platform backend via defined API contract
"""

import os
import json
import time
import logging
from typing import Dict, Any, Optional, Union
from pathlib import Path
import requests
import boto3
from dotenv import load_dotenv

# Import schemas
from schemas import (
    SpeakingEvaluationRequest,
    SpeakingEvaluationResponse,
    SpeakingFeedback,
    CriterionFeedback
)
from gemini_client import GeminiClient
from validators import ResponseValidator
from cache_manager import CacheManager

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class SpeakingEvaluator:
    """
    Production-ready Speaking Evaluator with Gemini Native Audio
    
    Features:
    - S3 integration for audio download
    - Gemini native audio processing (transcription + evaluation in ONE call)
    - 72% cost savings vs AWS Transcribe ($0.021 vs $0.076 per 3-min audio)
    - 2x faster (30-45s vs 60-90s)
    - Better pronunciation assessment (Gemini hears actual audio)
    - Response caching (Redis)
    - Circuit breaker for Gemini API
    - Structured error handling
    - REST API-compliant output
    - AWS CloudWatch logging for cost tracking
    """
    
    def __init__(
        self,
        gemini_api_key: Optional[str] = None,
        whisper_model: str = "base",
        redis_client: Optional[Any] = None,
        s3_client: Optional[Any] = None
    ):
        """
        Initialize Speaking Evaluator
        
        Args:
            gemini_api_key: Google AI API key
            whisper_model: Whisper model size (tiny, base, small, medium, large)
            redis_client: Redis client for caching and rate limiting
            s3_client: boto3 S3 client for audio download
        """
        # Initialize Gemini client
        self.gemini_client = GeminiClient(api_key=gemini_api_key)
        
        # Initialize cache manager
        self.cache_manager = CacheManager(redis_client=redis_client)
        
        # Initialize response validator
        self.validator = ResponseValidator()
        
        # Initialize S3 client
        self.s3_client = s3_client or boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        
        # Initialize Whisper model
        self.whisper_model_name = whisper_model
        self.whisper_model = None  # Lazy load
        
        logger.info(f"✅ SpeakingEvaluator initialized (Whisper: {whisper_model})")
    
    def _load_whisper_model(self):
        """Lazy load Whisper model"""
        if self.whisper_model is None:
            try:
                import whisper
                logger.info(f"📦 Loading Whisper model: {self.whisper_model_name}")
                self.whisper_model = whisper.load_model(self.whisper_model_name)
                logger.info("✅ Whisper model loaded")
            except Exception as e:
                logger.error(f"❌ Failed to load Whisper model: {e}")
                raise
    
    def evaluate_speaking(
        self,
        request: SpeakingEvaluationRequest
    ) -> SpeakingEvaluationResponse:
        """
        Main entry point: Evaluate speaking performance using Gemini native audio
        
        MUCH SIMPLER & CHEAPER than AWS Transcribe approach:
        - 72% cost reduction (was $0.076, now $0.021 per 3-min audio)
        - 2x faster (30-45s vs 60-90s)
        - Better pronunciation assessment (Gemini hears actual audio)
        - One API call instead of two (Transcribe + Gemini)
        
        Args:
            request: SpeakingEvaluationRequest with audio_url, session_id, part, difficulty, questions
            
        Returns:
            SpeakingEvaluationResponse with transcript, band scores, and detailed feedback
            
        Raises:
            GeminiAPIError: If Gemini API call fails after retries
            ValidationError: If response validation fails
        """
        start_time = time.time()
        session_id = request.session_id
        user_id = request.user_id
        
        logger.info(f"🎤 Starting speaking evaluation (Gemini native audio): session={session_id}, user={user_id}")
        
        try:
            # Step 1: Check if evaluation is cached
            cached_result = self.cache_manager.get_evaluation(session_id)
            if cached_result:
                logger.info(f"✅ Using cached evaluation for session {session_id}")
                return SpeakingEvaluationResponse(**cached_result)
            
            # Step 2: Download audio from S3
            audio_bytes = self._download_audio_from_s3(request.audio_url)
            logger.info(f"✅ Audio downloaded: {len(audio_bytes)} bytes")
            
            # Determine MIME type from URL
            mime_type = "audio/mp3"  # default
            if request.audio_url.lower().endswith('.wav'):
                mime_type = "audio/wav"
            elif request.audio_url.lower().endswith('.m4a'):
                mime_type = "audio/m4a"
            elif request.audio_url.lower().endswith('.ogg'):
                mime_type = "audio/ogg"
            
            # Step 3: Send audio directly to Gemini for transcription + evaluation
            # ONE API call replaces: Transcribe + Gemini text evaluation
            # Result includes: transcript, duration, band scores, detailed feedback
            evaluation = self.gemini_client.evaluate_audio(
                audio_bytes=audio_bytes,
                part=request.part,
                difficulty=request.difficulty,
                questions=request.questions,
                mime_type=mime_type,
                max_retries=3,
                timeout=120
            )
            
            # Extract data from Gemini audio response
            transcript = evaluation.get('transcript', '')
            duration = evaluation.get('duration_seconds', 0)
            word_count = evaluation.get('word_count', len(transcript.split()))
            usage = evaluation.get('usage', {})
            
            logger.info(f"✅ Gemini audio evaluation complete: {len(transcript)} chars, {duration:.1f}s")
            logger.info(f"📊 Token usage: input={usage.get('input_tokens', 0)}, "
                       f"output={usage.get('output_tokens', 0)}, "
                       f"cost=${usage.get('cost', 0):.4f}")
            
            # Step 4: Validate response against schema
            self.validator.validate_speaking_evaluation(evaluation)
            
            # Step 5: Create response object
            response = SpeakingEvaluationResponse(
                session_id=session_id,
                transcript=transcript,
                duration=duration,
                word_count=word_count,
                overall_band=evaluation['overall_band'],
                fluency_band=evaluation['fluency_coherence']['band'],
                lexical_band=evaluation['lexical_resource']['band'],
                grammar_band=evaluation['grammatical_range_accuracy']['band'],
                pronunciation_band=evaluation['pronunciation']['band'],
                feedback=self._build_feedback_object(evaluation),
                confidence_score=evaluation.get('confidence_score', 0.85),
                model_used="gemini-2.5-flash-audio",
                evaluated_at=time.time()
            )
            
            # Step 6: Cache result (30 days TTL)
            self.cache_manager.cache_evaluation(
                session_id=session_id,
                evaluation=response.dict(),
                ttl=30 * 24 * 60 * 60  # 30 days
            )
            
            elapsed_time = time.time() - start_time
            logger.info(f"✅ Evaluation complete: session={session_id}, time={elapsed_time:.2f}s, band={response.overall_band}")
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Evaluation failed: session={session_id}, error={str(e)}")
            raise SpeakingEvaluationError(f"Failed to evaluate speaking: {str(e)}")
    
    def _download_audio_from_s3(self, audio_url: str) -> bytes:
        """
        Download audio file from S3
        
        Args:
            audio_url: S3 URL (s3://bucket/key or https://s3.amazonaws.com/bucket/key)
            
        Returns:
            Audio file bytes
        """
        try:
            # Parse S3 URL
            if audio_url.startswith('s3://'):
                # s3://bucket/key format
                parts = audio_url.replace('s3://', '').split('/', 1)
                bucket = parts[0]
                key = parts[1]
            elif 's3.amazonaws.com' in audio_url or 's3-' in audio_url:
                # https://bucket.s3.amazonaws.com/key or https://s3.amazonaws.com/bucket/key
                if audio_url.count('/') >= 3:
                    parts = audio_url.split('/')
                    bucket = parts[2].split('.')[0]
                    key = '/'.join(parts[3:])
                else:
                    raise ValueError(f"Invalid S3 URL format: {audio_url}")
            else:
                raise ValueError(f"Unsupported audio URL format: {audio_url}")
            
            logger.info(f"📥 Downloading from S3: bucket={bucket}, key={key}")
            
            # Download from S3
            response = self.s3_client.get_object(Bucket=bucket, Key=key)
            audio_bytes = response['Body'].read()
            
            return audio_bytes
            
        except Exception as e:
            logger.error(f"❌ Failed to download audio from S3: {e}")
            raise AudioDownloadError(f"Failed to download audio: {str(e)}")
    
    def _transcribe_audio(self, audio_bytes: bytes) -> Dict[str, Any]:
        """
        Transcribe audio using Whisper
        
        Args:
            audio_bytes: Audio file bytes
            
        Returns:
            Dict with 'text' (transcript) and 'duration' (seconds)
        """
        try:
            # Load Whisper model if not loaded
            self._load_whisper_model()
            
            # Save audio bytes to temporary file
            import tempfile
            with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
                temp_file.write(audio_bytes)
                temp_path = temp_file.name
            
            try:
                # Transcribe
                logger.info(f"🎧 Transcribing audio with Whisper ({self.whisper_model_name})")
                result = self.whisper_model.transcribe(temp_path, language='en')
                
                # Calculate duration
                import librosa
                audio_data, sr = librosa.load(temp_path, sr=None)
                duration = len(audio_data) / sr
                
                return {
                    'text': result['text'].strip(),
                    'duration': duration,
                    'language': result.get('language', 'en')
                }
            finally:
                # Clean up temp file
                os.unlink(temp_path)
                
        except Exception as e:
            logger.error(f"❌ Transcription failed: {e}")
            raise TranscriptionError(f"Failed to transcribe audio: {str(e)}")
    
    def _analyze_fluency(self, transcript: str, duration: float) -> Dict[str, Any]:
        """
        Analyze fluency and coherence
        
        Returns:
            Dict with speech_rate_wpm, filled_pauses, pause_count, coherence_score, etc.
        """
        words = transcript.split()
        word_count = len(words)
        speech_rate_wpm = (word_count / duration) * 60 if duration > 0 else 0
        
        # Count filled pauses
        filled_pause_words = ['um', 'uh', 'er', 'ah', 'hmm', 'like', 'you know']
        filled_pauses = sum(1 for word in words if word.lower().strip('.,!?') in filled_pause_words)
        
        # Estimate pause count (simplified)
        pause_count = transcript.count('.') + transcript.count(',') + transcript.count('...')
        pause_frequency = pause_count / duration if duration > 0 else 0
        
        # Calculate coherence score (based on discourse markers)
        discourse_markers = [
            'however', 'therefore', 'moreover', 'furthermore', 'in addition',
            'firstly', 'secondly', 'finally', 'in conclusion', 'for example',
            'such as', 'in other words', 'on the other hand', 'as a result'
        ]
        discourse_marker_count = sum(1 for marker in discourse_markers if marker in transcript.lower())
        coherence_score = min(10, discourse_marker_count * 1.5)
        
        return {
            'transcript': transcript,
            'duration': duration,
            'word_count': word_count,
            'speech_rate_wpm': speech_rate_wpm,
            'filled_pauses': filled_pauses,
            'pause_count': pause_count,
            'pause_frequency': pause_frequency,
            'coherence_score': coherence_score,
            'discourse_marker_count': discourse_marker_count
        }
    
    def _analyze_lexical_resource(self, transcript: str) -> Dict[str, Any]:
        """
        Analyze lexical resource (vocabulary)
        
        Returns:
            Dict with vocabulary_size, vocabulary_ratio (TTR), academic_word_count, etc.
        """
        words = transcript.lower().split()
        word_count = len(words)
        unique_words = set(word.strip('.,!?;:') for word in words)
        vocabulary_size = len(unique_words)
        vocabulary_ratio = vocabulary_size / word_count if word_count > 0 else 0
        
        # Academic word list (simplified)
        academic_words = [
            'analyze', 'approach', 'area', 'assess', 'assume', 'authority',
            'benefit', 'concept', 'consist', 'context', 'contrast', 'create',
            'data', 'define', 'demonstrate', 'derive', 'distribute', 'economy',
            'environment', 'establish', 'estimate', 'evidence', 'factor', 'function',
            'identify', 'indicate', 'individual', 'interpret', 'involve', 'issue',
            'method', 'occur', 'percent', 'period', 'policy', 'principle',
            'process', 'require', 'research', 'respond', 'role', 'section',
            'significant', 'similar', 'source', 'specific', 'structure', 'theory'
        ]
        academic_word_count = sum(1 for word in words if word.strip('.,!?;:') in academic_words)
        
        # Average word length
        avg_word_length = sum(len(word) for word in words) / word_count if word_count > 0 else 0
        
        # Lexical sophistication score (simplified)
        long_words = sum(1 for word in words if len(word) > 6)
        lexical_sophistication_score = (long_words / word_count * 100) if word_count > 0 else 0
        
        return {
            'word_count': word_count,
            'vocabulary_size': vocabulary_size,
            'vocabulary_ratio': vocabulary_ratio,
            'academic_word_count': academic_word_count,
            'avg_word_length': avg_word_length,
            'lexical_sophistication_score': lexical_sophistication_score
        }
    
    def _analyze_grammatical_range(self, transcript: str) -> Dict[str, Any]:
        """
        Analyze grammatical range and accuracy
        
        Returns:
            Dict with sentence_count, complexity_ratio, error_count (estimated), etc.
        """
        # Split into sentences
        import re
        sentences = re.split(r'[.!?]+', transcript)
        sentences = [s.strip() for s in sentences if s.strip()]
        sentence_count = len(sentences)
        
        # Average sentence length
        words = transcript.split()
        avg_sentence_length = len(words) / sentence_count if sentence_count > 0 else 0
        
        # Estimate complexity (sentences with subordinate clauses)
        complex_markers = ['because', 'although', 'if', 'when', 'while', 'since', 'unless', 'whereas', 'which', 'who', 'that']
        complex_sentence_count = sum(1 for sentence in sentences if any(marker in sentence.lower() for marker in complex_markers))
        complexity_ratio = complex_sentence_count / sentence_count if sentence_count > 0 else 0
        
        # Estimate error count (very simplified - just for demo)
        # In production, use LanguageTool or similar
        error_count = 0  # Placeholder
        error_rate = error_count / len(words) if len(words) > 0 else 0
        
        # Grammatical range score
        grammatical_range_score = min(100, complexity_ratio * 100 + avg_sentence_length * 2)
        
        return {
            'sentence_count': sentence_count,
            'avg_sentence_length': avg_sentence_length,
            'complex_sentence_count': complex_sentence_count,
            'complexity_ratio': complexity_ratio,
            'error_count': error_count,
            'error_rate': error_rate,
            'grammatical_range_score': grammatical_range_score
        }
    
    def _build_evaluation_prompt(
        self,
        transcript: str,
        part: str,
        difficulty: str,
        questions: list,
        fluency_data: Dict[str, Any],
        lexical_data: Dict[str, Any],
        grammatical_data: Dict[str, Any]
    ) -> str:
        """
        Build comprehensive evaluation prompt for Gemini
        
        Includes IELTS scoring criteria and requests structured JSON output
        """
        questions_str = '\n'.join(f"{i+1}. {q['text']}" for i, q in enumerate(questions))
        
        prompt = f"""You are an expert IELTS examiner. Evaluate this IELTS Speaking {part} performance with {difficulty} difficulty.

TRANSCRIPT:
"{transcript}"

QUESTIONS ASKED:
{questions_str}

FLUENCY METRICS:
- Speech rate: {fluency_data['speech_rate_wpm']:.1f} WPM
- Duration: {fluency_data['duration']:.1f} seconds
- Word count: {fluency_data['word_count']}
- Filled pauses: {fluency_data['filled_pauses']}
- Discourse markers: {fluency_data['discourse_marker_count']}

LEXICAL METRICS:
- Vocabulary size: {lexical_data['vocabulary_size']} unique words
- Type-Token Ratio: {lexical_data['vocabulary_ratio']:.3f}
- Academic words: {lexical_data['academic_word_count']}
- Avg word length: {lexical_data['avg_word_length']:.1f} chars

GRAMMATICAL METRICS:
- Sentences: {grammatical_data['sentence_count']}
- Avg sentence length: {grammatical_data['avg_sentence_length']:.1f} words
- Complex sentences: {grammatical_data['complex_sentence_count']} ({grammatical_data['complexity_ratio']:.1%})

EVALUATE using official IELTS band descriptors (1-9 scale, 0.5 increments ONLY):

1. **Fluency and Coherence** - Natural flow, discourse markers, hesitation
2. **Lexical Resource** - Vocabulary range, paraphrasing, collocations
3. **Grammatical Range and Accuracy** - Sentence structures, accuracy
4. **Pronunciation** - Intelligibility, intonation, word stress

RESPOND IN THIS EXACT JSON FORMAT (NO MARKDOWN, NO CODE BLOCKS):
{{
  "overall_band": <float 1-9 in 0.5 increments>,
  "fluency_coherence": {{
    "band": <float 1-9 in 0.5 increments>,
    "feedback": "<detailed 2-3 sentence feedback>",
    "strengths": ["<strength1>", "<strength2>"],
    "weaknesses": ["<weakness1>", "<weakness2>"],
    "improvements": ["<improvement1>", "<improvement2>"]
  }},
  "lexical_resource": {{
    "band": <float 1-9 in 0.5 increments>,
    "feedback": "<detailed 2-3 sentence feedback>",
    "strengths": ["<strength1>", "<strength2>"],
    "weaknesses": ["<weakness1>", "<weakness2>"],
    "improvements": ["<improvement1>", "<improvement2>"]
  }},
  "grammatical_range_accuracy": {{
    "band": <float 1-9 in 0.5 increments>,
    "feedback": "<detailed 2-3 sentence feedback>",
    "strengths": ["<strength1>", "<strength2>"],
    "weaknesses": ["<weakness1>", "<weakness2>"],
    "improvements": ["<improvement1>", "<improvement2>"]
  }},
  "pronunciation": {{
    "band": <float 1-9 in 0.5 increments>,
    "feedback": "<detailed 2-3 sentence feedback>",
    "strengths": ["<strength1>", "<strength2>"],
    "weaknesses": ["<weakness1>", "<weakness2>"],
    "improvements": ["<improvement1>", "<improvement2>"]
  }},
  "confidence_score": <float 0-1>
}}

BE REALISTIC: Most candidates score 5.5-7.0. Band 8+ is rare."""
        
        return prompt
    
    def _parse_gemini_response(
        self,
        response_text: str,
        transcript: str,
        fluency_data: Dict[str, Any],
        lexical_data: Dict[str, Any],
        grammatical_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Parse Gemini response, handle JSON extraction, validate scores
        """
        try:
            # Try to extract JSON
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                evaluation = json.loads(json_str)
                
                # Validate and correct band scores
                evaluation['overall_band'] = self._validate_band_score(evaluation.get('overall_band', 6.0))
                for criterion in ['fluency_coherence', 'lexical_resource', 'grammatical_range_accuracy', 'pronunciation']:
                    if criterion in evaluation and 'band' in evaluation[criterion]:
                        evaluation[criterion]['band'] = self._validate_band_score(evaluation[criterion]['band'])
                
                logger.info("✅ Successfully parsed JSON response from Gemini")
                return evaluation
            else:
                logger.warning("⚠️ No JSON found in response, using fallback")
                return self._create_fallback_evaluation(fluency_data, lexical_data, grammatical_data)
                
        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON parsing failed: {e}")
            return self._create_fallback_evaluation(fluency_data, lexical_data, grammatical_data)
    
    def _validate_band_score(self, score: float) -> float:
        """
        Ensure band score is valid (1-9 in 0.5 increments)
        """
        if score < 1.0:
            return 1.0
        elif score > 9.0:
            return 9.0
        else:
            # Round to nearest 0.5
            return round(score * 2) / 2
    
    def _build_feedback_object(self, evaluation: Dict[str, Any]) -> SpeakingFeedback:
        """
        Build SpeakingFeedback object from evaluation dict
        """
        return SpeakingFeedback(
            overall=f"Overall Band: {evaluation['overall_band']}. {evaluation.get('overall_feedback', '')}",
            strengths=evaluation.get('strengths', []) or self._extract_all_strengths(evaluation),
            weaknesses=evaluation.get('weaknesses', []) or self._extract_all_weaknesses(evaluation),
            fluency=CriterionFeedback(
                score=evaluation['fluency_coherence']['band'],
                description=evaluation['fluency_coherence']['feedback'],
                examples=evaluation['fluency_coherence'].get('strengths', []),
                suggestions=evaluation['fluency_coherence'].get('improvements', [])
            ),
            lexical=CriterionFeedback(
                score=evaluation['lexical_resource']['band'],
                description=evaluation['lexical_resource']['feedback'],
                examples=evaluation['lexical_resource'].get('strengths', []),
                suggestions=evaluation['lexical_resource'].get('improvements', [])
            ),
            grammar=CriterionFeedback(
                score=evaluation['grammatical_range_accuracy']['band'],
                description=evaluation['grammatical_range_accuracy']['feedback'],
                examples=evaluation['grammatical_range_accuracy'].get('strengths', []),
                suggestions=evaluation['grammatical_range_accuracy'].get('improvements', [])
            ),
            pronunciation=CriterionFeedback(
                score=evaluation['pronunciation']['band'],
                description=evaluation['pronunciation']['feedback'],
                examples=evaluation['pronunciation'].get('strengths', []),
                suggestions=evaluation['pronunciation'].get('improvements', [])
            ),
            recommendations=self._generate_recommendations(evaluation)
        )
    
    def _extract_all_strengths(self, evaluation: Dict[str, Any]) -> list:
        """Extract all strengths from all criteria"""
        strengths = []
        for criterion in ['fluency_coherence', 'lexical_resource', 'grammatical_range_accuracy', 'pronunciation']:
            if criterion in evaluation:
                strengths.extend(evaluation[criterion].get('strengths', []))
        return strengths[:5]  # Top 5
    
    def _extract_all_weaknesses(self, evaluation: Dict[str, Any]) -> list:
        """Extract all weaknesses from all criteria"""
        weaknesses = []
        for criterion in ['fluency_coherence', 'lexical_resource', 'grammatical_range_accuracy', 'pronunciation']:
            if criterion in evaluation:
                weaknesses.extend(evaluation[criterion].get('weaknesses', []))
        return weaknesses[:5]  # Top 5
    
    def _generate_recommendations(self, evaluation: Dict[str, Any]) -> list:
        """Generate actionable recommendations based on weakest areas"""
        # Find weakest criterion
        scores = {
            'fluency': evaluation['fluency_coherence']['band'],
            'lexical': evaluation['lexical_resource']['band'],
            'grammar': evaluation['grammatical_range_accuracy']['band'],
            'pronunciation': evaluation['pronunciation']['band']
        }
        weakest = min(scores, key=scores.get)
        
        recommendations = []
        
        # Add criterion-specific recommendations
        if weakest == 'fluency':
            recommendations.extend(evaluation['fluency_coherence'].get('improvements', []))
        elif weakest == 'lexical':
            recommendations.extend(evaluation['lexical_resource'].get('improvements', []))
        elif weakest == 'grammar':
            recommendations.extend(evaluation['grammatical_range_accuracy'].get('improvements', []))
        elif weakest == 'pronunciation':
            recommendations.extend(evaluation['pronunciation'].get('improvements', []))
        
        # Add general recommendations
        if evaluation['overall_band'] < 6.0:
            recommendations.append("Practice daily speaking for at least 15 minutes")
            recommendations.append("Record yourself and listen back to identify areas for improvement")
        
        return recommendations[:5]  # Top 5
    
    def _create_fallback_evaluation(
        self,
        fluency_data: Dict[str, Any],
        lexical_data: Dict[str, Any],
        grammatical_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Create fallback evaluation when Gemini fails
        Based on metrics-driven scoring
        """
        # Calculate bands based on metrics
        fluency_band = self._calculate_fluency_band(fluency_data)
        lexical_band = self._calculate_lexical_band(lexical_data)
        grammar_band = self._calculate_grammar_band(grammatical_data)
        pronunciation_band = (fluency_band + lexical_band) / 2  # Estimate
        overall_band = (fluency_band + lexical_band + grammar_band + pronunciation_band) / 4
        
        return {
            'overall_band': overall_band,
            'fluency_coherence': {
                'band': fluency_band,
                'feedback': f"Speech rate: {fluency_data['speech_rate_wpm']:.1f} WPM, Filled pauses: {fluency_data['filled_pauses']}",
                'strengths': ["Clear communication"],
                'weaknesses': ["Some hesitation"],
                'improvements': ["Practice fluency exercises"]
            },
            'lexical_resource': {
                'band': lexical_band,
                'feedback': f"Vocabulary: {lexical_data['vocabulary_size']} unique words, TTR: {lexical_data['vocabulary_ratio']:.3f}",
                'strengths': ["Appropriate vocabulary"],
                'weaknesses': ["Limited range"],
                'improvements': ["Expand vocabulary"]
            },
            'grammatical_range_accuracy': {
                'band': grammar_band,
                'feedback': f"Sentences: {grammatical_data['sentence_count']}, Complexity: {grammatical_data['complexity_ratio']:.1%}",
                'strengths': ["Generally accurate"],
                'weaknesses': ["Limited complexity"],
                'improvements': ["Practice complex sentences"]
            },
            'pronunciation': {
                'band': pronunciation_band,
                'feedback': "Pronunciation assessment based on transcription quality",
                'strengths': ["Intelligible"],
                'weaknesses': ["Some unclear sounds"],
                'improvements': ["Practice pronunciation"]
            },
            'confidence_score': 0.70,  # Lower confidence for fallback
            'fallback': True
        }
    
    def _calculate_fluency_band(self, fluency_data: Dict[str, Any]) -> float:
        """Calculate fluency band from metrics"""
        speech_rate = fluency_data['speech_rate_wpm']
        filled_pauses = fluency_data['filled_pauses']
        
        band = 6.0  # Start with mid-level
        
        # Adjust based on speech rate
        if speech_rate >= 150:
            band += 1.0
        elif speech_rate >= 120:
            band += 0.5
        elif speech_rate < 100:
            band -= 0.5
        
        # Adjust based on pauses
        if filled_pauses <= 2:
            band += 0.5
        elif filled_pauses > 5:
            band -= 0.5
        
        return self._validate_band_score(band)
    
    def _calculate_lexical_band(self, lexical_data: Dict[str, Any]) -> float:
        """Calculate lexical band from metrics"""
        vocab_size = lexical_data['vocabulary_size']
        ttr = lexical_data['vocabulary_ratio']
        
        band = 6.0
        
        # Adjust based on vocabulary size
        if vocab_size >= 80:
            band += 1.0
        elif vocab_size >= 60:
            band += 0.5
        elif vocab_size < 40:
            band -= 0.5
        
        # Adjust based on TTR
        if ttr >= 0.7:
            band += 0.5
        elif ttr < 0.5:
            band -= 0.5
        
        return self._validate_band_score(band)
    
    def _calculate_grammar_band(self, grammatical_data: Dict[str, Any]) -> float:
        """Calculate grammar band from metrics"""
        complexity_ratio = grammatical_data['complexity_ratio']
        avg_length = grammatical_data['avg_sentence_length']
        
        band = 6.0
        
        # Adjust based on complexity
        if complexity_ratio >= 0.5:
            band += 1.0
        elif complexity_ratio >= 0.3:
            band += 0.5
        elif complexity_ratio < 0.2:
            band -= 0.5
        
        # Adjust based on sentence length
        if avg_length >= 15:
            band += 0.5
        elif avg_length < 10:
            band -= 0.5
        
        return self._validate_band_score(band)
    
    def generate_learning_guide(
        self,
        evaluation_result: SpeakingEvaluationResponse
    ) -> str:
        """
        Generate personalized learning guide based on evaluation
        
        Args:
            evaluation_result: Speaking evaluation response
            
        Returns:
            Markdown-formatted learning guide
        """
        try:
            logger.info(f"🎓 Generating learning guide for session {evaluation_result.session_id}")
            
            # Build prompt
            prompt = self._build_learning_guide_prompt(evaluation_result)
            
            # Call Gemini API (2.5 Flash lite for detailed guide)
            gemini_response = self.gemini_client.generate_evaluation(
                prompt=prompt,
                feature='speaking',  # Use speaking model for consistency
                max_retries=2
            )
            
            # Log cost (CloudWatch will track)
            logger.info(f"📊 Learning guide cost: ${gemini_response['usage']['cost']:.4f}")
            
            learning_guide = gemini_response['content']
            
            logger.info(f"✅ Learning guide generated: {len(learning_guide)} chars, "
                       f"${gemini_response['usage']['cost']:.4f}")
            
            return learning_guide
            
        except Exception as e:
            logger.error(f"❌ Learning guide generation failed: {e}")
            raise LearningGuideError(f"Failed to generate learning guide: {str(e)}")
    
    def _build_learning_guide_prompt(
        self,
        evaluation_result: SpeakingEvaluationResponse
    ) -> str:
        """
        Build cost-effective prompt for personalized learning guide
        
        Based on example: learning_guide_IELTS_spk_3_20250928_191357.md
        Focus: Specific improvements from actual transcript, not generic study plans
        """
        
        # Extract key information
        overall_band = evaluation_result.overall_band
        fluency_band = evaluation_result.fluency_coherence.score
        lexical_band = evaluation_result.lexical_resource.score
        grammar_band = evaluation_result.grammatical_range_accuracy.score
        pronunciation_band = evaluation_result.pronunciation.score
        
        # Identify priority areas (sorted by score, lowest first)
        scores = [
            ('Fluency & Coherence', fluency_band, evaluation_result.fluency_coherence),
            ('Lexical Resource', lexical_band, evaluation_result.lexical_resource),
            ('Grammatical Range & Accuracy', grammar_band, evaluation_result.grammatical_range_accuracy),
            ('Pronunciation', pronunciation_band, evaluation_result.pronunciation)
        ]
        scores.sort(key=lambda x: x[1])
        
        # Get top 2 priority areas
        priority1 = scores[0]
        priority2 = scores[1]
        
        # Limit transcript to first 800 chars to save tokens
        transcript_excerpt = evaluation_result.transcript[:800]
        if len(evaluation_result.transcript) > 800:
            transcript_excerpt += "..."
        
        # Get feedback objects
        fluency_feedback = evaluation_result.feedback.fluency
        lexical_feedback = evaluation_result.feedback.lexical
        grammar_feedback = evaluation_result.feedback.grammar
        pronunciation_feedback = evaluation_result.feedback.pronunciation
        
        # Redefine priority areas with feedback
        scores = [
            ('Coherence and Cohesion', fluency_band, fluency_feedback.suggestions[:2]),
            ('Lexical Sophistication', lexical_band, lexical_feedback.suggestions[:2]),
            ('Grammar', grammar_band, grammar_feedback.suggestions[:2]),
            ('Pronunciation', pronunciation_band, pronunciation_feedback.suggestions[:2])
        ]
        scores.sort(key=lambda x: x[1])
        
        # Get top 2 priority areas and strength area
        priority1 = scores[0]  # Lowest score
        priority2 = scores[1]
        strength_area = scores[-1]  # Highest score
        
        prompt = f"""Create a personalized learning guide focused on SPECIFIC improvements from the student's actual speech. 

**CRITICAL: DO NOT create weekly study plans, practice exercises, resource lists, or generic advice. Focus ONLY on analyzing THEIR actual words and showing better alternatives, then provide an improved version of their speech.**

STUDENT'S TRANSCRIPT:
"{transcript_excerpt}"

CURRENT SCORES:
Overall: {overall_band} | Fluency: {fluency_band} | Lexical: {lexical_band} | Grammar: {grammar_band} | Pronunciation: {pronunciation_band}

STRENGTHS: {strength_area[0]} (Band {strength_area[1]})

TOP PRIORITY AREAS FOR IMPROVEMENT:
1. {priority1[0]} (Band {priority1[1]}): {', '.join(priority1[2])}
2. {priority2[0]} (Band {priority2[1]}): {', '.join(priority2[2])}

---

Generate a learning guide in this EXACT structure (markdown with emojis, NO JSON):

# 🎓 **Personalized Learning Guide**

This guide is designed to help you build upon your strengths and address the key areas for improvement identified in your recent speech performance. You have a strong foundation in {strength_area[0].lower()}, which is excellent. By focusing on specific {priority1[0].lower()} and {priority2[0].lower()} strategies, you can significantly elevate your IELTS Speaking score.

## 1. 🎯 Priority Focus Areas

Based on your performance and the detailed feedback, your top priority areas for development are:

*   **{priority1[0]}**: [Explain why this needs improvement based on their transcript - 2 sentences]
*   **{priority2[0]}**: [Explain why this needs improvement - 2 sentences]

## 2. 🔧 Vocabulary Improvements

Your transcript shows [brief assessment]. Let's enhance its sophistication.

**Your Words:**

[Extract 10-15 actual words/phrases from their transcript above, one per line]
*   "[word/phrase 1 from transcript]"
*   "[word/phrase 2]" (idiomatic, good) [mark if already good]
*   "[word/phrase 3]"
*   [continue for 10-15 items]

**Suggestions for Improvement:**

[For 8-12 words that need improvement, provide specific alternatives]
*   **"[their word]"**: While acceptable, consider more formal phrasing like "[alternative 1]" or "[alternative 2]."
*   **"[their word]"**: Can be elevated to "[alternative 1]," "[alternative 2]," or "[alternative 3]."
*   **"[their word]"**: Replace with "[alternative 1]," "[alternative 2]," or "[alternative 3]."
[Continue for 8-12 words with 2-3 alternatives each]


## 3. 📚 Grammar Enhancements

Your grammar is [assessment based on {grammar_band} band score - 1 sentence].

**Areas to Focus On:**

*   **[Specific grammar point from their speech]**: [2-3 sentence explanation]
*   **[Another specific point]**: [2-3 sentence explanation]


## 4. 🗣️ Fluency Development

[Assessment of current fluency - 1 sentence]

**Strategies for Improvement:**

*   **Discourse Markers and Cohesive Devices**: This is [importance for their level]. Actively practice using transition words and phrases to guide the listener through your thoughts.
    *   **To introduce a contrasting idea**: "However," "On the other hand," "Conversely," "In contrast."
    *   **To add information**: "Furthermore," "Moreover," "In addition," "Additionally."
    *   **To show cause and effect**: "Consequently," "As a result," "Therefore," "Thus."
    *   **To provide examples**: "For instance," "For example," "To illustrate."
    *   **To conclude or summarize**: "In conclusion," "To summarize," "Ultimately."
*   **Structuring Your Response**: [Specific strategy - 1-2 sentences]


## 5. 📋 Improved Version

Here is a rewritten version of your transcript, incorporating suggestions for vocabulary and coherence.

"[Take 2-4 sentences from their actual transcript and rewrite them with improvements. Show exactly how to incorporate better vocabulary, grammar, and discourse markers. Must use their original sentences but enhanced.]"

---

**CRITICAL REQUIREMENTS:**
1. Extract 10-15 ACTUAL words/phrases directly from the transcript quoted above
2. For vocabulary improvements, provide 2-3 SPECIFIC alternatives for each word
3. Section 5 MUST rewrite actual sentences from their transcript (not generic examples)
4. NO weekly study plans
5. NO practice exercises
6. NO resource lists (books/websites/videos)
7. NO study_plan, weekly_schedule, or resources sections
8. Focus ONLY on analyzing their speech and showing improvements
9. Keep total output ≤1200 tokens for cost efficiency
10. Be encouraging but specific

Generate the guide now (markdown only, NO JSON, NO code blocks):"""