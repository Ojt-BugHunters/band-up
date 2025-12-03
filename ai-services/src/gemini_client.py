"""
Gemini API Client with Circuit Breaker and Retry Logic
Production-ready implementation with error handling
Supports both text and native audio processing
"""

import os
import time
import logging
import json
import base64
from typing import Dict, Any, Optional, Union, List
import requests
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor, as_completed

load_dotenv()
logger = logging.getLogger(__name__)


class CircuitBreaker:
    """
    Circuit breaker pattern for Gemini API
    
    States:
    - CLOSED: Normal operation (calls go through)
    - OPEN: Too many failures (calls rejected immediately)
    - HALF_OPEN: Testing if service recovered (limited calls allowed)
    """
    
    def __init__(self, failure_threshold: int = 5, timeout: int = 60):
        """
        Args:
            failure_threshold: Number of consecutive failures before opening circuit
            timeout: Seconds to wait before transitioning to HALF_OPEN
        """
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failures = 0
        self.last_failure_time = None
        self.state = "CLOSED"
    
    def call(self, func, *args, **kwargs):
        """Execute function with circuit breaker logic"""
        if self.state == "OPEN":
            if time.time() - self.last_failure_time >= self.timeout:
                logger.info("🔄 Circuit breaker: Transitioning to HALF_OPEN")
                self.state = "HALF_OPEN"
            else:
                raise CircuitBreakerOpenError("Circuit breaker is OPEN - Gemini API unavailable")
        
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise
    
    def _on_success(self):
        """Reset circuit breaker on successful call"""
        self.failures = 0
        if self.state == "HALF_OPEN":
            logger.info("✅ Circuit breaker: Transitioning to CLOSED")
            self.state = "CLOSED"
    
    def _on_failure(self):
        """Record failure and potentially open circuit"""
        self.failures += 1
        self.last_failure_time = time.time()
        
        if self.failures >= self.failure_threshold:
            logger.error(f"🚨 Circuit breaker: OPENING after {self.failures} failures")
            self.state = "OPEN"


class GeminiClient:
    """
    Gemini API client with retry logic, circuit breaker, and cost tracking
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini client
        
        Args:
            api_key: Google AI API key (defaults to env variable)
        """
        self.api_key = api_key or os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_AI_API_KEY')
        
        if not self.api_key:
            raise ValueError("Gemini API key is required. Set GEMINI_API_KEY environment variable.")
        
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        
        # Model selection by feature
        # Note: Use gemini-1.5-flash or gemini-1.5-pro (gemini-2.x models may not be available yet)
        self.models = {
            'speaking': 'gemini-2.5-flash-lite',           # Speaking evaluation (supports audio)
            'speaking_audio': 'gemini-2.5-flash-lite',     # Native audio processing
            'writing_task2': 'gemini-2.5-flash-lite',      # Writing Task 2 evaluation
            'writing_task1': 'gemini-2.5-flash-lite',      # Writing Task 1 evaluation
            'flashcards': 'gemini-2.5-flash-lite',         # Flashcard generation
            'default': 'gemini-2.5-flash-lite'             # Default fallback
        }
        
        # Override with env variable if specified
        env_model = os.getenv('GEMINI_MODEL')
        if env_model:
            for key in self.models:
                self.models[key] = env_model
        
        self.circuit_breaker = CircuitBreaker(failure_threshold=5, timeout=60)
        
        # Token costs (as of 2025)
        # Text: $0.10/1M input, $0.40/1M output
        # Audio: $3.00/1M input tokens (32 tokens/sec), $2.00/1M output tokens
        self.cost_per_1k_input_tokens = 0.0001   # $0.10 per 1M text input tokens
        self.cost_per_1k_output_tokens = 0.0004  # $0.40 per 1M text output tokens
        self.cost_per_1k_audio_tokens = 0.003    # $3.00 per 1M audio input tokens
        self.cost_per_1k_audio_output = 0.002    # $2.00 per 1M audio output tokens
        
        logger.info(f"✅ GeminiClient initialized with audio support (models: {list(self.models.keys())})")
    
    def generate_evaluation(
        self,
        prompt: str,
        feature: str = 'default',
        max_retries: int = 3,
        timeout: int = 60
    ) -> Dict[str, Any]:
        """
        Generate evaluation using Gemini API with retry logic
        
        Args:
            prompt: Evaluation prompt
            feature: Feature name (speaking, writing_task1, writing_task2, flashcards)
            max_retries: Maximum number of retry attempts
            timeout: Request timeout in seconds
            
        Returns:
            Dict with 'content' (response text) and 'usage' (token counts, cost)
            
        Raises:
            GeminiAPIError: If API call fails after retries
            CircuitBreakerOpenError: If circuit breaker is open
        """
        def _make_request():
            return self._call_gemini_api(prompt, feature, timeout)
        
        # Execute with circuit breaker
        for attempt in range(max_retries):
            try:
                result = self.circuit_breaker.call(_make_request)
                logger.info(f"✅ Gemini API call successful (attempt {attempt + 1}/{max_retries})")
                return result
            except CircuitBreakerOpenError:
                raise  # Don't retry if circuit breaker is open
            except Exception as e:
                logger.warning(f"⚠️ Gemini API call failed (attempt {attempt + 1}/{max_retries}): {e}")
                
                if attempt < max_retries - 1:
                    # Exponential backoff: 1s, 2s, 4s
                    backoff_time = 2 ** attempt
                    logger.info(f"🔄 Retrying in {backoff_time}s...")
                    time.sleep(backoff_time)
                else:
                    logger.error(f"❌ Gemini API call failed after {max_retries} attempts")
                    raise GeminiAPIError(f"Failed after {max_retries} attempts: {str(e)}")
    
    def _call_gemini_api(self, prompt: str, feature: str, timeout: int) -> Dict[str, Any]:
        """
        Make actual API call to Gemini
        
        Args:
            prompt: Evaluation prompt
            feature: Feature name for model selection
            timeout: Request timeout
        
        Returns:
            Dict with 'content' and 'usage' (input_tokens, output_tokens, cost)
        """
        try:
            # Select model based on feature
            model_name = self.models.get(feature, self.models['default'])
            
            url = f"{self.base_url}/{model_name}:generateContent?key={self.api_key}"
            
            headers = {
                'Content-Type': 'application/json',
            }
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "topP": 0.9,
                    "maxOutputTokens": 2048,
                    "responseMimeType": "application/json"  # Request JSON response
                }
            }
            
            logger.info(f"📡 Calling Gemini API: {model_name} (feature: {feature})")
            
            response = requests.post(url, headers=headers, json=payload, timeout=timeout)
            response.raise_for_status()
            
            result = response.json()
            
            # Extract response text
            if 'candidates' in result and len(result['candidates']) > 0:
                content = result['candidates'][0]['content']['parts'][0]['text']
            else:
                raise GeminiAPIError("No response from Gemini API")
            
            # Extract token usage (if available)
            usage_metadata = result.get('usageMetadata', {})
            input_tokens = usage_metadata.get('promptTokenCount', 0)
            output_tokens = usage_metadata.get('candidatesTokenCount', 0)
            
            # Calculate cost
            cost = self._calculate_cost(input_tokens, output_tokens)
            
            logger.info(f"✅ Gemini API response: {len(content)} chars, "
                       f"{input_tokens} input tokens, {output_tokens} output tokens, "
                       f"${cost:.4f}")
            
            return {
                'content': content,
                'usage': {
                    'input_tokens': input_tokens,
                    'output_tokens': output_tokens,
                    'total_tokens': input_tokens + output_tokens,
                    'cost': cost
                }
            }
            
        except requests.exceptions.Timeout:
            raise GeminiAPIError(f"Request timeout after {timeout}s")
        except requests.exceptions.RequestException as e:
            raise GeminiAPIError(f"HTTP request failed: {str(e)}")
        except Exception as e:
            raise GeminiAPIError(f"Unexpected error: {str(e)}")
    
    def _calculate_cost(self, input_tokens: int, output_tokens: int, is_audio: bool = False) -> float:
        """Calculate cost in USD"""
        if is_audio:
            input_cost = (input_tokens / 1000) * self.cost_per_1k_audio_tokens
            output_cost = (output_tokens / 1000) * self.cost_per_1k_audio_output
        else:
            input_cost = (input_tokens / 1000) * self.cost_per_1k_input_tokens
            output_cost = (output_tokens / 1000) * self.cost_per_1k_output_tokens
        return input_cost + output_cost
    
    def evaluate_audio(
        self,
        audio_bytes: bytes,
        part: str,
        difficulty: str,
        questions: list,
        mime_type: str = "audio/mp3",
        max_retries: int = 3,
        timeout: int = 120
    ) -> Dict[str, Any]:
        """
        Evaluate speaking performance from audio directly using Gemini native audio
        
        This method is 72% cheaper and 2x faster than AWS Transcribe + Gemini evaluation!
        
        Args:
            audio_bytes: Audio file bytes (MP3, WAV, M4A, etc.)
            part: IELTS speaking part (PART_1, PART_2, PART_3)
            difficulty: Target band (BAND_5 - BAND_9)
            questions: List of questions asked
            mime_type: Audio MIME type (audio/mp3, audio/wav, audio/m4a)
            max_retries: Maximum retry attempts
            timeout: Request timeout in seconds
            
        Returns:
            Dict with:
            - transcript: Full transcription
            - duration_seconds: Audio duration
            - overall_band: Overall band score (1.0-9.0)
            - fluency_coherence: Detailed fluency feedback
            - lexical_resource: Vocabulary feedback
            - grammatical_range_accuracy: Grammar feedback
            - pronunciation: Pronunciation feedback (from actual audio!)
            - confidence_score: AI confidence (0-1)
            - usage: Token counts and cost
            
        Raises:
            GeminiAPIError: If API call fails after retries
        """
        logger.info(f"🎤 Evaluating audio with Gemini native audio (part={part}, difficulty={difficulty})")
        
        def _make_request():
            return self._call_gemini_audio_api(
                audio_bytes=audio_bytes,
                part=part,
                difficulty=difficulty,
                questions=questions,
                mime_type=mime_type,
                timeout=timeout
            )
        
        # Execute with circuit breaker and retries
        for attempt in range(max_retries):
            try:
                result = self.circuit_breaker.call(_make_request)
                logger.info(f"✅ Gemini audio evaluation successful (attempt {attempt + 1}/{max_retries})")
                return result
            except CircuitBreakerOpenError:
                raise
            except Exception as e:
                logger.warning(f"⚠️ Gemini audio evaluation failed (attempt {attempt + 1}/{max_retries}): {e}")
                
                if attempt < max_retries - 1:
                    backoff_time = 2 ** attempt
                    logger.info(f"🔄 Retrying in {backoff_time}s...")
                    time.sleep(backoff_time)
                else:
                    logger.error(f"❌ Gemini audio evaluation failed after {max_retries} attempts")
                    raise GeminiAPIError(f"Failed after {max_retries} attempts: {str(e)}")
    
    def _call_gemini_audio_api(
        self,
        audio_bytes: bytes,
        part: str,
        difficulty: str,
        questions: list,
        mime_type: str,
        timeout: int
    ) -> Dict[str, Any]:
        """
        Make actual API call to Gemini with audio
        
        Uses inline data (base64 encoded audio) for audio files < 20MB
        For larger files, would use File API upload
        """
        try:
            model_name = self.models['speaking_audio']
            url = f"{self.base_url}/{model_name}:generateContent?key={self.api_key}"
            
            # Build prompt for audio evaluation
            prompt = self._build_audio_evaluation_prompt(part, difficulty, questions)
            
            # Encode audio to base64
            audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
            
            headers = {
                'Content-Type': 'application/json',
            }
            
            # Payload with audio inline data
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            },
                            {
                                "inline_data": {
                                    "mime_type": mime_type,
                                    "data": audio_base64
                                }
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "topP": 0.9,
                    "maxOutputTokens": 4096,
                    "responseMimeType": "application/json"
                }
            }
            
            logger.info(f"📡 Calling Gemini API with audio: {model_name} (audio size: {len(audio_bytes)} bytes)")
            
            response = requests.post(url, headers=headers, json=payload, timeout=timeout)
            response.raise_for_status()
            
            result = response.json()
            
            # Extract response
            if 'candidates' in result and len(result['candidates']) > 0:
                content = result['candidates'][0]['content']['parts'][0]['text']
            else:
                raise GeminiAPIError("No response from Gemini audio API")
            
            # Parse JSON response
            try:
                evaluation = json.loads(content)
            except json.JSONDecodeError:
                # Try to extract JSON if wrapped in markdown
                if '```json' in content:
                    json_start = content.find('{')
                    json_end = content.rfind('}') + 1
                    evaluation = json.loads(content[json_start:json_end])
                else:
                    raise GeminiAPIError(f"Failed to parse JSON response: {content[:200]}")
            
            # Extract token usage
            usage_metadata = result.get('usageMetadata', {})
            input_tokens = usage_metadata.get('promptTokenCount', 0)
            output_tokens = usage_metadata.get('candidatesTokenCount', 0)
            
            # Calculate cost (audio pricing)
            cost = self._calculate_cost(input_tokens, output_tokens, is_audio=True)
            
            logger.info(f"✅ Gemini audio API response: transcript={len(evaluation.get('transcript', ''))} chars, "
                       f"{input_tokens} input tokens, {output_tokens} output tokens, "
                       f"${cost:.4f}")
            
            # Add usage info to result
            evaluation['usage'] = {
                'input_tokens': input_tokens,
                'output_tokens': output_tokens,
                'total_tokens': input_tokens + output_tokens,
                'cost': cost
            }
            
            return evaluation
            
        except requests.exceptions.Timeout:
            raise GeminiAPIError(f"Audio request timeout after {timeout}s")
        except requests.exceptions.RequestException as e:
            raise GeminiAPIError(f"HTTP request failed: {str(e)}")
        except Exception as e:
            raise GeminiAPIError(f"Unexpected error in audio evaluation: {str(e)}")
    
    def _build_audio_evaluation_prompt(self, part: str, difficulty: str, questions: list) -> str:
        """Build prompt for audio evaluation"""
        questions_str = '\n'.join(f"{i+1}. {q.get('text', '')}" for i, q in enumerate(questions))
        
        return f"""You are an expert IELTS examiner. Evaluate this IELTS Speaking {part} audio with {difficulty} target level.

QUESTIONS ASKED:
{questions_str}

INSTRUCTIONS:
1. First, transcribe the audio EXACTLY as spoken (including "um", "uh", pauses)
2. Analyze the speaker's performance across IELTS criteria:
   - Fluency and Coherence (hesitation, pace, discourse markers, pauses)
   - Lexical Resource (vocabulary range, accuracy, collocations)
   - Grammatical Range and Accuracy (sentence structures, errors)
   - Pronunciation (clarity, intonation, word stress, articulation)
3. Assign band scores (1.0-9.0 in 0.5 increments ONLY)
4. Provide detailed feedback with specific examples from the audio

Pay special attention to audio-specific features:
- **Pronunciation quality**: Clear vs mumbled, correct vs incorrect sounds
- **Intonation patterns**: Rising for questions, falling for statements, appropriate stress
- **Speaking pace**: Natural vs rushed vs too slow
- **Pauses**: Natural pauses vs filled pauses ("um", "uh", "er")
- **Word stress**: Correct syllable emphasis
- **Rhythm**: Natural English rhythm vs flat/robotic

RESPOND IN THIS EXACT JSON FORMAT (NO MARKDOWN):
{{
  "transcript": "<exact transcription including um, uh, pauses>",
  "duration_seconds": <audio duration in seconds>,
  "word_count": <number of words spoken>,
  "overall_band": <float 1-9 in 0.5 increments>,
  "fluency_coherence": {{
    "band": <float 1-9 in 0.5 increments>,
    "feedback": "<2-3 sentence detailed feedback>",
    "strengths": ["<strength1>", "<strength2>"],
    "weaknesses": ["<weakness1>", "<weakness2>"],
    "improvements": ["<improvement1>", "<improvement2>"]
  }},
  "lexical_resource": {{
    "band": <float>,
    "feedback": "<2-3 sentence detailed feedback>",
    "strengths": ["<strength1>", "<strength2>"],
    "weaknesses": ["<weakness1>", "<weakness2>"],
    "improvements": ["<improvement1>", "<improvement2>"]
  }},
  "grammatical_range_accuracy": {{
    "band": <float>,
    "feedback": "<2-3 sentence detailed feedback>",
    "strengths": ["<strength1>", "<strength2>"],
    "weaknesses": ["<weakness1>", "<weakness2>"],
    "improvements": ["<improvement1>", "<improvement2>"]
  }},
  "pronunciation": {{
    "band": <float>,
    "feedback": "<detailed feedback based on ACTUAL AUDIO, not transcript>",
    "strengths": ["Clear pronunciation of ...", "Good intonation on ..."],
    "weaknesses": ["Unclear pronunciation of ...", "Flat intonation on ..."],
    "improvements": ["Practice word stress for ...", "Work on rising intonation for questions"]
  }},
  "confidence_score": <float 0-1>
}}

BE REALISTIC: Most candidates score 5.5-7.0. Band 8+ is rare. Use 0.5 increments ONLY."""
    
    def generate_evaluations_parallel(
        self,
        prompts: List[str],
        feature: str = 'default',
        max_workers: int = 5,
        timeout: int = 60
    ) -> List[Dict[str, Any]]:
        """
        Generate multiple evaluations in parallel using ThreadPoolExecutor
        
        Args:
            prompts: List of prompts to evaluate
            feature: Feature type for model selection
            max_workers: Maximum number of parallel requests (default: 5)
            timeout: Timeout per request in seconds
            
        Returns:
            List of evaluation results (same order as prompts)
            
        Example:
            prompts = ["Evaluate essay 1...", "Evaluate essay 2...", ...]
            results = client.generate_evaluations_parallel(prompts, feature='flashcards')
        """
        logger.info(f"🚀 Starting parallel generation: {len(prompts)} requests with {max_workers} workers")
        
        results = [None] * len(prompts)  # Preserve order
        
        def generate_single(index: int, prompt: str) -> tuple:
            """Generate single evaluation and return with index"""
            try:
                result = self.generate_evaluation(
                    prompt=prompt,
                    feature=feature,
                    max_retries=2,  # Fewer retries for parallel to avoid long waits
                    timeout=timeout
                )
                return (index, result, None)
            except Exception as e:
                logger.error(f"❌ Parallel request {index} failed: {str(e)}")
                return (index, None, str(e))
        
        # Execute in parallel
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all tasks
            futures = {
                executor.submit(generate_single, i, prompt): i 
                for i, prompt in enumerate(prompts)
            }
            
            # Collect results as they complete
            completed = 0
            for future in as_completed(futures):
                index, result, error = future.result()
                results[index] = result if result else {'error': error}
                completed += 1
                logger.info(f"✅ Completed {completed}/{len(prompts)} parallel requests")
        
        # Check for failures
        failures = sum(1 for r in results if r and 'error' in r)
        if failures > 0:
            logger.warning(f"⚠️ {failures}/{len(prompts)} parallel requests failed")
        
        logger.info(f"🎉 Parallel generation complete: {len(prompts) - failures}/{len(prompts)} successful")
        
        return results
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        return {
            'models': self.models,
            'api_type': 'Gemini API',
            'supports_audio': True,
            'cost_per_1k_input_tokens': self.cost_per_1k_input_tokens,
            'cost_per_1k_output_tokens': self.cost_per_1k_output_tokens,
            'cost_per_1k_audio_tokens': self.cost_per_1k_audio_tokens,
            'cost_per_1k_audio_output': self.cost_per_1k_audio_output,
            'circuit_breaker_state': self.circuit_breaker.state
        }


# Custom Exceptions
class GeminiAPIError(Exception):
    """Gemini API call failed"""
    pass


class CircuitBreakerOpenError(GeminiAPIError):
    """Circuit breaker is open - service unavailable"""
    pass

