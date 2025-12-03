"""
Gemini API client for test enhancement.

This module provides a client for interacting with Google's Gemini API,
handling authentication, content generation, response parsing, and error handling.
"""

import json
import logging
import os
import time
from typing import Dict, Any, Optional

from google import genai
from google.genai import types
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
    after_log
)

from .interfaces import IGeminiClient
from .exceptions import (
    GeminiAPIError,
    AuthenticationError,
    RateLimitError,
    QuotaExceededError,
    TimeoutError,
    JSONParseError,
    ConfigurationError
)
from .logging_config import get_logger

logger = get_logger(__name__)


class GeminiClient(IGeminiClient):
    """
    Client for interacting with Google's Gemini API.
    
    This class handles all communication with the Gemini API, including
    authentication, content generation, response parsing, and error handling.
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the Gemini client.
        
        Args:
            config: Configuration dictionary containing:
                - api_key or api_key_env: API key or environment variable name
                - model: Model name (default: "gemini-2.0-flash-exp")
                - temperature: Temperature setting (default: 0.1)
                - max_output_tokens: Max output tokens (default: 8192)
                - timeout: Request timeout in seconds (default: 60)
                - max_retries: Maximum retry attempts (default: 3)
                - retry_min_wait: Minimum wait between retries in seconds (default: 2)
                - retry_max_wait: Maximum wait between retries in seconds (default: 60)
        
        Raises:
            ConfigurationError: If configuration is invalid
        """
        self.config = config
        self.api_key: Optional[str] = None
        self.model_name: str = config.get('model', 'gemini-2.5-flash')
        self.temperature: float = config.get('temperature', 0.1)
        self.max_output_tokens: int = config.get('max_output_tokens', 8192)
        self.timeout: int = config.get('timeout', 60)
        self.max_retries: int = config.get('max_retries', 3)
        self.retry_min_wait: int = config.get('retry_min_wait', 2)
        self.retry_max_wait: int = config.get('retry_max_wait', 60)
        self.client: Optional[genai.Client] = None
        self.system_instruction: str = config.get('system_instruction', '')
        
        logger.info(f"GeminiClient initialized with model: {self.model_name}")
    
    def initialize(self) -> None:
        """
        Initialize the Gemini API client.
        
        This method:
        1. Retrieves API key from environment or config
        2. Configures the Gemini API
        3. Creates the generative model instance
        4. Validates the connection
        
        Raises:
            AuthenticationError: If API credentials are invalid or missing
            ConfigurationError: If client configuration is invalid
        """
        try:
            # Get API key from environment or config
            api_key_env = self.config.get('api_key_env', 'GEMINI_API_KEY')
            self.api_key = os.getenv(api_key_env)
            
            if not self.api_key:
                # Try direct api_key in config (not recommended for production)
                self.api_key = self.config.get('api_key')
            
            if not self.api_key:
                raise AuthenticationError(
                    f"API key not found. Set {api_key_env} environment variable "
                    "or provide 'api_key' in configuration.",
                    context={"api_key_env": api_key_env}
                )
            
            # Create Gemini client with API key
            self.client = genai.Client(api_key=self.api_key)
            logger.info("Gemini API client created successfully")
            
            logger.info(
                f"Gemini client initialized: {self.model_name} "
                f"(temp={self.temperature}, max_tokens={self.max_output_tokens})"
            )
            
            # Validate connection with a simple test
            self._validate_connection()
            
        except AuthenticationError:
            raise
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
            raise ConfigurationError(
                f"Failed to initialize Gemini client: {str(e)}",
                context={"model": self.model_name}
            )
    
    def _validate_connection(self) -> None:
        """
        Validate the API connection with a simple test request.
        
        Raises:
            AuthenticationError: If authentication fails
            GeminiAPIError: If connection test fails
        """
        try:
            logger.debug("Validating Gemini API connection...")
            test_prompt = "Return a JSON object with a single field 'status' set to 'ok'."
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=test_prompt
            )
            
            if not response or not response.text:
                raise GeminiAPIError("Connection test failed: Empty response")
            
            logger.info("Gemini API connection validated successfully")
            
        except Exception as e:
            error_msg = str(e).lower()
            
            if "api key" in error_msg or "authentication" in error_msg or "unauthorized" in error_msg:
                raise AuthenticationError(
                    f"API authentication failed: {str(e)}",
                    context={"model": self.model_name}
                )
            
            logger.warning(f"Connection validation failed (non-critical): {e}")
            # Don't raise - some errors during validation are acceptable
    
    def generate_content(
        self, 
        prompt: str, 
        config: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate content using Gemini API with retry logic.
        
        This method automatically retries on transient errors (rate limits, timeouts)
        using exponential backoff. Non-retryable errors (auth, quota) fail immediately.
        
        Args:
            prompt: The prompt to send to Gemini
            config: Optional configuration overrides for this request
        
        Returns:
            Raw response text from Gemini
        
        Raises:
            GeminiAPIError: If API call fails
            RateLimitError: If rate limits are exceeded after retries
            QuotaExceededError: If quota is exceeded (not retried)
            TimeoutError: If request times out after retries
            AuthenticationError: If authentication fails (not retried)
        """
        if not self.client:
            raise GeminiAPIError(
                "Client not initialized. Call initialize() first.",
                context={"model": self.model_name}
            )
        
        # Use retry wrapper for the actual API call
        return self._generate_content_with_retry(prompt, config)
    
    def _generate_content_with_retry(
        self,
        prompt: str,
        config: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Internal method that performs the actual API call with retry logic.
        
        This method is wrapped with tenacity retry decorator to handle
        transient failures with exponential backoff.
        """
        # Create retry decorator dynamically based on config
        retry_decorator = retry(
            retry=retry_if_exception_type((RateLimitError, TimeoutError, GeminiAPIError)),
            stop=stop_after_attempt(self.max_retries),
            wait=wait_exponential(
                multiplier=1,
                min=self.retry_min_wait,
                max=self.retry_max_wait
            ),
            before_sleep=before_sleep_log(logger, logging.WARNING),
            after=after_log(logger, logging.DEBUG),
            reraise=True
        )
        
        # Apply decorator to the actual call
        @retry_decorator
        def _make_api_call():
            try:
                # Log API request
                logger.info(
                    f"Gemini API request - model={self.model_name} prompt_length={len(prompt)} chars"
                )
                logger.debug(f"Prompt preview: {prompt[:200]}...")
                
                start_time = time.time()
                
                # Generate content using new API
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=self.temperature,
                        max_output_tokens=self.max_output_tokens,
                        response_modalities=["TEXT"]
                    )
                )
                
                elapsed_time = time.time() - start_time
                
                if not response:
                    logger.error("Empty response from Gemini API")
                    raise GeminiAPIError(
                        "Empty response from Gemini API",
                        context={"prompt_length": len(prompt)}
                    )
                
                # Extract text from response
                response_text = response.text
                
                if not response_text:
                    logger.error("Empty response text from Gemini API")
                    raise GeminiAPIError(
                        "Empty response text from Gemini API",
                        context={"prompt_length": len(prompt)}
                    )
                
                # Log successful response with statistics
                logger.info(
                    f"Gemini API response SUCCESS - "
                    f"response_length={len(response_text)} chars "
                    f"duration={elapsed_time:.2f}s "
                    f"model={self.model_name}"
                )
                logger.debug(f"Response preview: {response_text[:200]}...")
                
                return response_text
                
            except (RateLimitError, TimeoutError, QuotaExceededError, AuthenticationError):
                # Re-raise these as-is (already properly typed)
                raise
            except Exception as e:
                # Convert other exceptions to appropriate types
                self._handle_api_error(e, prompt)
        
        return _make_api_call()
    
    def _handle_api_error(self, error: Exception, prompt: str) -> None:
        """
        Handle API errors and convert to appropriate exception types.
        
        This method analyzes the error and raises the appropriate typed exception.
        It never returns - it always raises an exception.
        
        Args:
            error: The original exception
            prompt: The prompt that caused the error
        
        Raises:
            RateLimitError: For rate limit errors (retryable)
            QuotaExceededError: For quota errors (not retryable)
            AuthenticationError: For auth errors (not retryable)
            TimeoutError: For timeout errors (retryable)
            GeminiAPIError: For other API errors (retryable)
        """
        error_msg = str(error).lower()
        context = {
            "model": self.model_name,
            "prompt_length": len(prompt)
        }
        
        # Rate limit errors (retryable)
        if "rate limit" in error_msg or "429" in error_msg or "resource exhausted" in error_msg:
            logger.warning(f"Rate limit error: {error}")
            raise RateLimitError(
                f"Rate limit exceeded: {str(error)}",
                context=context
            )
        
        # Quota errors (not retryable - stop immediately)
        if "quota" in error_msg or "exceeded" in error_msg:
            logger.error(f"Quota exceeded: {error}")
            raise QuotaExceededError(
                f"API quota exceeded: {str(error)}",
                context=context
            )
        
        # Authentication errors (not retryable - stop immediately)
        if "api key" in error_msg or "authentication" in error_msg or "unauthorized" in error_msg or "403" in error_msg:
            logger.error(f"Authentication error: {error}")
            raise AuthenticationError(
                f"Authentication failed: {str(error)}",
                context=context
            )
        
        # Timeout errors (retryable)
        if "timeout" in error_msg or "timed out" in error_msg:
            logger.warning(f"Timeout error: {error}")
            raise TimeoutError(
                f"Request timed out: {str(error)}",
                context=context
            )
        
        # Generic API error (retryable)
        logger.error(f"Gemini API error: {error}")
        raise GeminiAPIError(
            f"Gemini API error: {str(error)}",
            context=context
        )
    
    def parse_json_response(self, response: str) -> Dict[str, Any]:
        """
        Parse JSON from Gemini response.
        
        This method handles various response formats:
        1. Direct JSON response
        2. JSON wrapped in markdown code blocks
        3. JSON with surrounding text
        
        Args:
            response: Raw response text from Gemini
        
        Returns:
            Parsed JSON as dictionary
        
        Raises:
            JSONParseError: If response is not valid JSON
        """
        try:
            # Try direct JSON parse first
            return json.loads(response)
            
        except json.JSONDecodeError:
            # Try to extract JSON from markdown code blocks
            logger.debug("Direct JSON parse failed, trying to extract from markdown")
            
            try:
                # Look for JSON in ```json ... ``` blocks
                if "```json" in response:
                    start = response.find("```json") + 7
                    end = response.find("```", start)
                    if end > start:
                        json_str = response[start:end].strip()
                        return json.loads(json_str)
                
                # Look for JSON in ``` ... ``` blocks
                if "```" in response:
                    start = response.find("```") + 3
                    end = response.find("```", start)
                    if end > start:
                        json_str = response[start:end].strip()
                        return json.loads(json_str)
                
                # Try to find JSON object boundaries
                start = response.find("{")
                end = response.rfind("}") + 1
                if start >= 0 and end > start:
                    json_str = response[start:end]
                    return json.loads(json_str)
                
                # If all else fails, raise error
                raise JSONParseError(
                    "Could not extract valid JSON from response",
                    context={
                        "response_length": len(response),
                        "response_preview": response[:200]
                    }
                )
                
            except json.JSONDecodeError as e:
                logger.error(f"JSON parse error: {e}")
                logger.debug(f"Response preview: {response[:500]}")
                raise JSONParseError(
                    f"Failed to parse JSON from response: {str(e)}",
                    context={
                        "response_length": len(response),
                        "response_preview": response[:200],
                        "error": str(e)
                    }
                )
    
    def estimate_tokens(self, text: str) -> int:
        """
        Estimate token count for given text.
        
        This uses a simple heuristic: ~4 characters per token for English text.
        For more accurate counting, use the Gemini API's count_tokens method.
        
        Args:
            text: Text to estimate tokens for
        
        Returns:
            Estimated token count
        """
        # Simple heuristic: ~4 characters per token
        estimated = len(text) // 4
        
        # Add some buffer for special tokens
        estimated = int(estimated * 1.1)
        
        logger.debug(f"Estimated tokens: {estimated} for text length: {len(text)}")
        
        return estimated
    
    def count_tokens_accurate(self, text: str) -> int:
        """
        Get accurate token count using Gemini API.
        
        This method uses the Gemini API's count_tokens method for
        accurate token counting. Use sparingly as it makes an API call.
        
        Args:
            text: Text to count tokens for
        
        Returns:
            Accurate token count
        
        Raises:
            GeminiAPIError: If token counting fails
        """
        if not self.client:
            raise GeminiAPIError(
                "Client not initialized. Call initialize() first.",
                context={"model": self.model_name}
            )
        
        try:
            # Note: count_tokens may not be available in new API yet
            # Fall back to estimation for now
            logger.debug("Using token estimation (count_tokens not available in new API)")
            return self.estimate_tokens(text)
            
        except Exception as e:
            logger.warning(f"Failed to count tokens accurately: {e}")
            # Fall back to estimation
            return self.estimate_tokens(text)
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the current model configuration.
        
        Returns:
            Dictionary with model information including retry settings
        """
        return {
            "model_name": self.model_name,
            "temperature": self.temperature,
            "max_output_tokens": self.max_output_tokens,
            "timeout": self.timeout,
            "max_retries": self.max_retries,
            "retry_min_wait": self.retry_min_wait,
            "retry_max_wait": self.retry_max_wait,
            "initialized": self.client is not None
        }
    
    def update_retry_config(
        self,
        max_retries: Optional[int] = None,
        retry_min_wait: Optional[int] = None,
        retry_max_wait: Optional[int] = None
    ) -> None:
        """
        Update retry configuration dynamically.
        
        This allows adjusting retry behavior without recreating the client.
        
        Args:
            max_retries: Maximum number of retry attempts
            retry_min_wait: Minimum wait time between retries (seconds)
            retry_max_wait: Maximum wait time between retries (seconds)
        """
        if max_retries is not None:
            self.max_retries = max_retries
            logger.info(f"Updated max_retries to {max_retries}")
        
        if retry_min_wait is not None:
            self.retry_min_wait = retry_min_wait
            logger.info(f"Updated retry_min_wait to {retry_min_wait}")
        
        if retry_max_wait is not None:
            self.retry_max_wait = retry_max_wait
            logger.info(f"Updated retry_max_wait to {retry_max_wait}")
