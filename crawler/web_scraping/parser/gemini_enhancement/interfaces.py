"""
Base interfaces for Gemini enhancement pipeline.

This module defines abstract base classes that establish contracts
for key components of the enhancement system.
"""

from abc import ABC, abstractmethod
from typing import Dict, Tuple, Optional, Any
from pathlib import Path

from .models import EnhancementResult, ValidationResult


class IEnhancer(ABC):
    """
    Interface for test enhancement implementations.
    
    This interface defines the contract for classes that enhance
    IELTS test data using AI models.
    """
    
    @abstractmethod
    def enhance_test(self, test_path: Path) -> EnhancementResult:
        """
        Enhance a single test file.
        
        Args:
            test_path: Path to the test JSON file
            
        Returns:
            EnhancementResult containing enhanced data and statistics
            
        Raises:
            EnhancementError: If enhancement fails
        """
        pass
    
    @abstractmethod
    def enhance_batch(
        self, 
        start: int, 
        end: int, 
        test_type: str
    ) -> Dict[str, Any]:
        """
        Enhance a batch of tests.
        
        Args:
            start: Starting test number (inclusive)
            end: Ending test number (inclusive)
            test_type: Type of tests ('listening' or 'reading')
            
        Returns:
            Dictionary containing batch processing results and statistics
            
        Raises:
            EnhancementError: If batch processing fails
        """
        pass
    
    @abstractmethod
    def resume_batch(self, progress_file: Path) -> Dict[str, Any]:
        """
        Resume an interrupted batch enhancement.
        
        Args:
            progress_file: Path to the progress tracking file
            
        Returns:
            Dictionary containing batch processing results and statistics
            
        Raises:
            EnhancementError: If resume fails
        """
        pass


class IGeminiClient(ABC):
    """
    Interface for Gemini API interactions.
    
    This interface defines the contract for classes that communicate
    with the Gemini API.
    """
    
    @abstractmethod
    def initialize(self) -> None:
        """
        Initialize the Gemini API client.
        
        This method should establish connection, validate credentials,
        and prepare the client for API calls.
        
        Raises:
            AuthenticationError: If API credentials are invalid
            ConfigurationError: If client configuration is invalid
        """
        pass
    
    @abstractmethod
    def generate_content(
        self, 
        prompt: str, 
        config: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate content using Gemini API.
        
        Args:
            prompt: The prompt to send to Gemini
            config: Optional configuration overrides for this request
            
        Returns:
            Raw response text from Gemini
            
        Raises:
            GeminiAPIError: If API call fails
            RateLimitError: If rate limits are exceeded
            TimeoutError: If request times out
        """
        pass
    
    @abstractmethod
    def parse_json_response(self, response: str) -> Dict[str, Any]:
        """
        Parse JSON from Gemini response.
        
        Args:
            response: Raw response text from Gemini
            
        Returns:
            Parsed JSON as dictionary
            
        Raises:
            JSONParseError: If response is not valid JSON
        """
        pass
    
    @abstractmethod
    def estimate_tokens(self, text: str) -> int:
        """
        Estimate token count for given text.
        
        Args:
            text: Text to estimate tokens for
            
        Returns:
            Estimated token count
        """
        pass


class IValidator(ABC):
    """
    Interface for test data validation.
    
    This interface defines the contract for classes that validate
    enhanced test data.
    """
    
    @abstractmethod
    def validate_structure(self, data: Dict[str, Any]) -> ValidationResult:
        """
        Validate JSON structure of enhanced test data.
        
        Args:
            data: Enhanced test data to validate
            
        Returns:
            ValidationResult with validation details
        """
        pass
    
    @abstractmethod
    def validate_question_count(
        self, 
        data: Dict[str, Any], 
        expected_count: int = 40
    ) -> bool:
        """
        Validate that correct number of questions are classified.
        
        Args:
            data: Enhanced test data
            expected_count: Expected number of questions (default: 40)
            
        Returns:
            True if question count is correct, False otherwise
        """
        pass
    
    @abstractmethod
    def validate_html_integrity(self, html: str) -> bool:
        """
        Validate that HTML is well-formed.
        
        Args:
            html: HTML content to validate
            
        Returns:
            True if HTML is valid, False otherwise
        """
        pass
    
    @abstractmethod
    def validate_no_data_loss(
        self, 
        original: Dict[str, Any], 
        enhanced: Dict[str, Any]
    ) -> bool:
        """
        Validate that no data was lost during enhancement.
        
        Args:
            original: Original test data
            enhanced: Enhanced test data
            
        Returns:
            True if no data loss detected, False otherwise
        """
        pass
    
    @abstractmethod
    def generate_report(
        self, 
        results: list[ValidationResult]
    ) -> str:
        """
        Generate validation report for multiple tests.
        
        Args:
            results: List of validation results
            
        Returns:
            Formatted validation report as string
        """
        pass


class IRateLimiter(ABC):
    """
    Interface for API rate limiting.
    
    This interface defines the contract for classes that enforce
    rate limits on API requests.
    """
    
    @abstractmethod
    def acquire(self, estimated_tokens: int = 0) -> None:
        """
        Acquire permission to make an API request.
        
        This method will block if necessary to respect rate limits.
        
        Args:
            estimated_tokens: Estimated tokens for the request
            
        Raises:
            RateLimitError: If rate limits cannot be satisfied
        """
        pass
    
    @abstractmethod
    def record_request(self, tokens_used: int) -> None:
        """
        Record a completed API request.
        
        Args:
            tokens_used: Actual tokens used by the request
        """
        pass
    
    @abstractmethod
    def get_stats(self) -> Dict[str, Any]:
        """
        Get current rate limit statistics.
        
        Returns:
            Dictionary containing current usage statistics
        """
        pass
    
    @abstractmethod
    def reset_counters(self) -> None:
        """
        Reset rate limit counters.
        
        This is typically called when time windows expire.
        """
        pass


class IPromptBuilder(ABC):
    """
    Interface for prompt construction.
    
    This interface defines the contract for classes that build
    prompts for the Gemini API.
    """
    
    @abstractmethod
    def build_enhancement_prompt(
        self, 
        test_data: Dict[str, Any], 
        test_type: str
    ) -> str:
        """
        Build enhancement prompt for Gemini.
        
        Args:
            test_data: Test data to enhance
            test_type: Type of test ('listening' or 'reading')
            
        Returns:
            Formatted prompt string
            
        Raises:
            PromptBuildError: If prompt construction fails
        """
        pass
    
    @abstractmethod
    def build_schema_definition(self) -> str:
        """
        Build JSON schema definition for response.
        
        Returns:
            JSON schema as string
        """
        pass
    
    @abstractmethod
    def build_examples(self, test_type: str) -> str:
        """
        Build few-shot examples for prompt.
        
        Args:
            test_type: Type of test ('listening' or 'reading')
            
        Returns:
            Formatted examples string
        """
        pass
    
    @abstractmethod
    def estimate_tokens(self, prompt: str) -> int:
        """
        Estimate token count for prompt.
        
        Args:
            prompt: Prompt text
            
        Returns:
            Estimated token count
        """
        pass


class IConfigManager(ABC):
    """
    Interface for configuration management.
    
    This interface defines the contract for classes that manage
    system configuration.
    """
    
    @abstractmethod
    def load_config(self, config_path: Optional[Path] = None) -> Dict[str, Any]:
        """
        Load configuration from file.
        
        Args:
            config_path: Optional path to config file
            
        Returns:
            Configuration dictionary
            
        Raises:
            ConfigurationError: If config loading fails
        """
        pass
    
    @abstractmethod
    def get(self, key: str, default: Any = None) -> Any:
        """
        Get configuration value.
        
        Args:
            key: Configuration key (supports dot notation)
            default: Default value if key not found
            
        Returns:
            Configuration value
        """
        pass
    
    @abstractmethod
    def validate_config(self) -> bool:
        """
        Validate configuration values.
        
        Returns:
            True if configuration is valid
            
        Raises:
            InvalidConfigError: If configuration is invalid
        """
        pass
