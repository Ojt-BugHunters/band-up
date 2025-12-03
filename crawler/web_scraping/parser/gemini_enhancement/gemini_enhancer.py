"""
Main orchestrator for Gemini test enhancement.

This module provides the GeminiEnhancer class which coordinates
the entire enhancement pipeline.
"""

import json
import logging
import time
import uuid
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime

from .interfaces import IEnhancer
from .models import (
    EnhancementResult, 
    ValidationResult, 
    AdRemovalStats, 
    ProcessingStats,
    BatchProgress
)
from .gemini_client import GeminiClient
from .prompt_builder import PromptBuilder
from .rate_limiter import RateLimiter
from .test_validator import TestValidator
from .ad_remover import AdRemover
from .config_manager import ConfigManager, Config
from .exceptions import (
    EnhancementError,
    GeminiAPIError,
    ValidationError,
    ProcessingError,
    JSONParseError,
    DataMergeError
)
from .logging_config import (
    get_logger,
    setup_batch_logging,
    log_api_request,
    log_api_response,
    log_processing_stats,
    log_validation_result,
    log_error_with_context,
    log_batch_summary
)

logger = get_logger(__name__)


class GeminiEnhancer(IEnhancer):
    """
    Main orchestrator for test enhancement using Gemini AI.
    
    This class coordinates all components of the enhancement pipeline:
    - Gemini API client for AI-powered enhancement
    - Rate limiting to respect API quotas
    - Prompt building for optimal Gemini responses
    - Validation to ensure data quality
    - Batch processing with progress tracking
    """
    
    def __init__(self, config: Optional[Config] = None):
        """
        Initialize the Gemini enhancer.
        
        Args:
            config: Optional Config object. If None, loads from default config file.
        """
        # Load configuration
        if config is None:
            config_manager = ConfigManager()
            config = config_manager.get_config()
        
        self.config = config
        
        # Initialize components
        self.gemini_client = GeminiClient({
            'api_key_env': config.gemini.api_key_env,
            'model': config.gemini.model,
            'temperature': config.gemini.temperature,
            'max_output_tokens': config.gemini.max_output_tokens,
            'timeout': config.processing.timeout,
            'max_retries': config.processing.max_retries,
            'retry_min_wait': int(config.processing.retry_delay),
            'retry_max_wait': int(config.processing.retry_delay * 3)
        })
        
        self.rate_limiter = RateLimiter(
            rpm_limit=config.rate_limits.requests_per_minute,
            tpm_limit=config.rate_limits.tokens_per_minute,
            daily_limit=config.rate_limits.requests_per_day,
            min_delay=config.rate_limits.delay_between_requests
        )
        
        self.prompt_builder = PromptBuilder()
        self.validator = TestValidator(strict_mode=config.validation.strict_mode)
        self.ad_remover = AdRemover()
        
        # Initialize Gemini client
        self.gemini_client.initialize()
        
        logger.info(
            f"GeminiEnhancer initialized successfully - "
            f"model={config.gemini.model} "
            f"rpm_limit={config.rate_limits.requests_per_minute} "
            f"tpm_limit={config.rate_limits.tokens_per_minute}"
        )
    
    def enhance_test(self, test_path: Path) -> EnhancementResult:
        """
        Enhance a single test file.
        
        This method:
        1. Loads the test JSON file
        2. Constructs an optimized prompt
        3. Calls Gemini API with rate limiting
        4. Parses and validates the response
        5. Merges enhanced data with original
        6. Saves the enhanced file
        
        Includes comprehensive error handling and graceful degradation.
        
        Args:
            test_path: Path to the test JSON file
            
        Returns:
            EnhancementResult containing enhanced data and statistics
        """
        start_time = time.time()
        retry_count = 0
        
        # Extract test info from path
        test_number = self._extract_test_number(test_path)
        test_type = self._extract_test_type(test_path)
        
        logger.info(
            f"Starting enhancement for test {test_number} ({test_type}) - file={test_path.name}",
            extra={'test_number': test_number, 'test_type': test_type}
        )
        
        original_data = None
        
        try:
            # Load original test data
            original_data = self._load_test_data(test_path)
            
            # Try enhancement with retries
            while retry_count <= self.config.processing.max_retries:
                try:
                    # Build prompt
                    prompt = self.prompt_builder.build_enhancement_prompt(
                        original_data, 
                        test_type
                    )
                    
                    # Estimate tokens
                    estimated_tokens = self.prompt_builder.estimate_tokens(prompt)
                    logger.info(
                        f"Prompt built - estimated_tokens={estimated_tokens} prompt_length={len(prompt)} chars",
                        extra={'test_number': test_number, 'test_type': test_type, 'tokens': estimated_tokens}
                    )
                    
                    # Acquire rate limit permission
                    logger.debug(f"Acquiring rate limit permission for {estimated_tokens} tokens")
                    self.rate_limiter.acquire(estimated_tokens)
                    
                    # Log API request
                    log_api_request(logger, test_number, test_type, len(prompt), estimated_tokens)
                    
                    # Call Gemini API
                    api_start = time.time()
                    response = self.gemini_client.generate_content(prompt)
                    api_duration = time.time() - api_start
                    
                    # Log API response
                    log_api_response(logger, test_number, test_type, len(response), api_duration, success=True)
                    
                    # Parse JSON response
                    logger.debug("Parsing JSON response from Gemini")
                    enhanced_content = self.gemini_client.parse_json_response(response)
                    logger.info(
                        f"JSON parsed successfully - fields={list(enhanced_content.keys())}",
                        extra={'test_number': test_number, 'test_type': test_type}
                    )
                    
                    # Record actual token usage (estimate for now)
                    actual_tokens = estimated_tokens
                    self.rate_limiter.record_request(actual_tokens)
                    
                    # Merge enhanced data with original
                    enhanced_data = self._merge_enhanced_data(
                        original_data, 
                        enhanced_content,
                        test_type
                    )
                    
                    # Validate enhanced data
                    logger.debug("Validating enhanced data structure")
                    validation_result = self.validator.validate_structure(enhanced_data)
                    
                    # Log validation result
                    log_validation_result(
                        logger,
                        test_number,
                        test_type,
                        validation_result.is_valid,
                        len(validation_result.errors),
                        len(validation_result.warnings),
                        len(validation_result.checks_passed)
                    )
                    
                    if not validation_result.is_valid and self.config.validation.strict_mode:
                        logger.error(
                            f"Validation failed in strict mode - errors={validation_result.errors}",
                            extra={'test_number': test_number, 'test_type': test_type}
                        )
                        
                        # Save partial result for debugging
                        if self.config.validation.save_invalid:
                            self._save_partial_result(
                                test_number, 
                                test_type, 
                                enhanced_data,
                                ValidationError("Validation failed", context={"errors": validation_result.errors})
                            )
                        
                        raise ValidationError(
                            f"Validation failed for test {test_number}",
                            context={"errors": validation_result.errors}
                        )
                    
                    # Save enhanced file (if not dry run)
                    if not self.config.validation.dry_run:
                        output_path = self._get_output_path(test_path, test_type)
                        logger.debug(f"Saving enhanced data to: {output_path}")
                        self._save_enhanced_data(enhanced_data, output_path)
                        logger.info(
                            f"Enhanced data saved successfully - file={output_path.name}",
                            extra={'test_number': test_number, 'test_type': test_type}
                        )
                    else:
                        logger.info(
                            "Dry run mode - skipping file save",
                            extra={'test_number': test_number, 'test_type': test_type}
                        )
                    
                    # Calculate processing time
                    processing_time = time.time() - start_time
                    
                    # Create result
                    ad_stats = AdRemovalStats(
                        image_urls=enhanced_content.get('removed_ads', {}).get('image_urls', []),
                        script_count=enhanced_content.get('removed_ads', {}).get('script_count', 0),
                        element_count=enhanced_content.get('removed_ads', {}).get('element_count', 0)
                    )
                    
                    result = EnhancementResult(
                        test_number=test_number,
                        test_type=test_type,
                        success=True,
                        enhanced_data=enhanced_data,
                        validation_result=validation_result,
                        ad_removal_stats=ad_stats,
                        processing_stats=ProcessingStats(
                            tokens_used=actual_tokens,
                            processing_time_seconds=processing_time,
                            gemini_calls=retry_count + 1,
                            retry_count=retry_count
                        )
                    )
                    
                    # Log processing statistics
                    log_processing_stats(
                        logger,
                        test_number,
                        test_type,
                        actual_tokens,
                        processing_time,
                        retry_count + 1
                    )
                    
                    logger.info(
                        f"✓ Test {test_number} enhanced successfully - "
                        f"ads_removed={len(ad_stats.image_urls)} images, {ad_stats.script_count} scripts",
                        extra={
                            'test_number': test_number,
                            'test_type': test_type,
                            'tokens': actual_tokens,
                            'duration': processing_time
                        }
                    )
                    
                    return result
                
                except (GeminiAPIError, JSONParseError) as e:
                    # Log error with context
                    log_error_with_context(
                        logger,
                        e,
                        test_number,
                        test_type,
                        {'retry_count': retry_count, 'max_retries': self.config.processing.max_retries}
                    )
                    
                    # Check if should retry
                    if self._should_retry_error(e, retry_count):
                        retry_count += 1
                        wait_time = self.config.processing.retry_delay * retry_count
                        logger.warning(
                            f"Retry {retry_count}/{self.config.processing.max_retries} "
                            f"for test {test_number} after {wait_time}s: {type(e).__name__}",
                            extra={'test_number': test_number, 'test_type': test_type}
                        )
                        time.sleep(wait_time)
                        continue
                    else:
                        # Max retries reached, attempt graceful degradation
                        logger.warning(
                            "Max retries reached, attempting graceful degradation",
                            extra={'test_number': test_number, 'test_type': test_type}
                        )
                        enhanced_data = self._attempt_graceful_degradation(original_data, test_type)
                        
                        # Save degraded result
                        if not self.config.validation.dry_run:
                            output_path = self._get_output_path(test_path, test_type)
                            self._save_enhanced_data(enhanced_data, output_path)
                            logger.info(f"Degraded result saved to: {output_path}")
                        
                        processing_time = time.time() - start_time
                        
                        return EnhancementResult(
                            test_number=test_number,
                            test_type=test_type,
                            success=True,  # Partial success
                            enhanced_data=enhanced_data,
                            processing_stats=ProcessingStats(
                                processing_time_seconds=processing_time,
                                gemini_calls=retry_count,
                                retry_count=retry_count
                            ),
                            error_message=f"Gemini API failed, used local processing: {e}"
                        )
                
                except ValidationError as e:
                    # Don't retry validation errors
                    log_error_with_context(
                        logger,
                        e,
                        test_number,
                        test_type,
                        {'validation_errors': getattr(e, 'context', {}).get('errors', [])}
                    )
                    raise
            
        except Exception as e:
            # Handle all other errors
            processing_time = time.time() - start_time
            
            # Log error with full context
            log_error_with_context(
                logger,
                e,
                test_number,
                test_type,
                {
                    'processing_time': processing_time,
                    'retry_count': retry_count,
                    'file_path': str(test_path)
                }
            )
            
            # Use error handler
            return self._handle_enhancement_error(e, test_number, test_type, original_data)
    
    def _load_test_data(self, test_path: Path) -> Dict[str, Any]:
        """Load test data from JSON file."""
        try:
            with open(test_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            raise ProcessingError(f"Failed to load test data: {e}")
    
    def _save_enhanced_data(self, data: Dict[str, Any], output_path: Path) -> None:
        """Save enhanced data to JSON file."""
        try:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            raise ProcessingError(f"Failed to save enhanced data: {e}")
    
    def _merge_enhanced_data(
        self, 
        original: Dict[str, Any], 
        enhanced_content: Dict[str, Any],
        test_type: str
    ) -> Dict[str, Any]:
        """
        Merge enhanced content with original data.
        
        This simplified version only appends question types to the original JSON,
        keeping all original content intact.
        
        Args:
            original: Original test data
            enhanced_content: Enhanced content from Gemini (should contain questionTypes)
            test_type: Type of test
            
        Returns:
            Merged data dictionary with questionTypes added
        """
        try:
            # Start with original data (deep copy to avoid modifying original)
            merged = json.loads(json.dumps(original))
            
            # Remove ad URLs from image arrays
            ad_removal_stats = self._local_ad_removal(merged, test_type)
            logger.info(f"Removed {len(ad_removal_stats['image_urls'])} ad images from data")
            
            # Add question types - this is the main enhancement
            if 'questionTypes' in enhanced_content:
                merged['questionTypes'] = enhanced_content['questionTypes']
                logger.info(f"Added {len(enhanced_content['questionTypes'])} question type classifications")
            else:
                logger.warning("No questionTypes found in enhanced content")
            
            # Handle different test structures (listening vs reading)
            if 'test_metadata' not in merged:
                # Reading tests have flat structure - create test_metadata from existing fields
                merged['test_metadata'] = {
                    'source_url': merged.get('source', ''),
                    'test_name': f"{test_type.capitalize()} Practice Test {merged.get('testNumber', 0):02d}",
                    'test_type': test_type,
                    'test_number': merged.get('testNumber', 0),
                    'crawl_date': merged.get('crawledAt', ''),
                    'total_questions': 40  # IELTS standard
                }
            
            # Add enhancement metadata to test_metadata
            merged['test_metadata']['enhancement_date'] = datetime.now().isoformat()
            merged['test_metadata']['gemini_model'] = self.config.gemini.model
            merged['test_metadata']['enhancement_version'] = '2.0'
            
            # Add additional enhancement metadata
            merged['enhancement_metadata'] = {
                'enhancement_type': 'question_type_classification',
                'ads_removed': ad_removal_stats,
                'processing_stats': {}
            }
            
            return merged
            
        except Exception as e:
            raise DataMergeError(f"Failed to merge enhanced data: {e}")
    
    def _extract_test_number(self, test_path: Path) -> int:
        """Extract test number from file path."""
        import re
        match = re.search(r'test[_\s](\d+)', test_path.stem, re.IGNORECASE)
        if match:
            return int(match.group(1))
        return 0
    
    def _extract_test_type(self, test_path: Path) -> str:
        """Extract test type from file path."""
        path_str = str(test_path).lower()
        if 'listening' in path_str:
            return 'listening'
        elif 'reading' in path_str:
            return 'reading'
        return 'unknown'
    
    def _get_output_path(self, input_path: Path, test_type: str) -> Path:
        """Get output path for enhanced file."""
        output_dir = self.config.paths.get_output_path() / test_type / "practice"
        output_dir.mkdir(parents=True, exist_ok=True)
        return output_dir / input_path.name
    
    def enhance_batch(
        self, 
        start: int, 
        end: int, 
        test_type: str
    ) -> Dict[str, Any]:
        """
        Enhance a batch of tests.
        
        This method:
        1. Creates a batch progress tracker
        2. Iterates through test range
        3. Enhances each test with error handling
        4. Tracks progress to file
        5. Generates summary report
        
        Args:
            start: Starting test number (inclusive)
            end: Ending test number (inclusive)
            test_type: Type of tests ('listening' or 'reading')
            
        Returns:
            Dictionary containing batch processing results and statistics
        """
        batch_id = str(uuid.uuid4())
        
        # Set up batch-specific logging
        setup_batch_logging(
            batch_id,
            test_type,
            self.config.paths.get_log_path(),
            logging.INFO
        )
        
        logger.info(
            f"Starting batch enhancement: {test_type} tests {start}-{end}",
            extra={'batch_id': batch_id, 'test_type': test_type}
        )
        logger.info(
            f"Batch configuration - "
            f"rpm_limit={self.config.rate_limits.requests_per_minute} "
            f"tpm_limit={self.config.rate_limits.tokens_per_minute} "
            f"delay={self.config.rate_limits.delay_between_requests}s",
            extra={'batch_id': batch_id, 'test_type': test_type}
        )
        
        # Create batch progress tracker
        progress = BatchProgress(
            batch_id=batch_id,
            start_time=datetime.now(),
            last_update=datetime.now(),
            test_type=test_type,
            test_range_start=start,
            test_range_end=end
        )
        
        # Get progress file path
        progress_file = self.config.paths.get_progress_path()
        logger.info(
            f"Progress tracking file: {progress_file}",
            extra={'batch_id': batch_id, 'test_type': test_type}
        )
        
        # Results collection
        results: List[EnhancementResult] = []
        
        # Process each test
        for test_num in range(start, end + 1):
            try:
                # Mark as in progress
                progress.mark_in_progress(test_num)
                self._save_progress(progress, progress_file)
                
                # Get test file path
                test_path = self._get_test_path(test_num, test_type)
                
                if not test_path.exists():
                    logger.warning(
                        f"Test file not found: {test_path}",
                        extra={'test_number': test_num, 'test_type': test_type, 'batch_id': batch_id}
                    )
                    progress.mark_failed(test_num)
                    results.append(EnhancementResult(
                        test_number=test_num,
                        test_type=test_type,
                        success=False,
                        error_message=f"Test file not found: {test_path}"
                    ))
                    continue
                
                # Enhance the test
                result = self.enhance_test(test_path)
                results.append(result)
                
                # Update progress
                if result.success:
                    progress.mark_completed(
                        test_num,
                        result.processing_stats.tokens_used,
                        result.processing_stats.processing_time_seconds
                    )
                    logger.info(f"✓ Test {test_num} completed successfully")
                else:
                    progress.mark_failed(test_num)
                    logger.error(f"✗ Test {test_num} failed: {result.error_message}")
                
                # Save progress after each test
                self._save_progress(progress, progress_file)
                
            except Exception as e:
                logger.error(f"Unexpected error processing test {test_num}: {e}")
                progress.mark_failed(test_num)
                self._save_progress(progress, progress_file)
                
                results.append(EnhancementResult(
                    test_number=test_num,
                    test_type=test_type,
                    success=False,
                    error_message=str(e)
                ))
        
        # Generate summary report
        summary = self._generate_batch_summary(progress, results)
        
        logger.info(f"Batch enhancement completed: {len(progress.completed)}/{len(range(start, end + 1))} successful")
        
        return summary
    
    def resume_batch(self, progress_file: Path) -> Dict[str, Any]:
        """
        Resume an interrupted batch enhancement.
        
        This method:
        1. Loads progress from file
        2. Identifies remaining tests
        3. Continues batch processing
        4. Updates existing progress
        
        Args:
            progress_file: Path to the progress tracking file
            
        Returns:
            Dictionary containing batch processing results and statistics
        """
        logger.info(f"Resuming batch from progress file: {progress_file}")
        
        # Load progress
        progress = self._load_progress(progress_file)
        
        # Determine which tests to process
        all_tests = set(range(progress.test_range_start, progress.test_range_end + 1))
        completed_tests = set(progress.completed)
        failed_tests = set(progress.failed)
        remaining_tests = sorted(all_tests - completed_tests - failed_tests)
        
        if not remaining_tests:
            logger.info("No remaining tests to process")
            return progress.to_dict()
        
        logger.info(f"Resuming {len(remaining_tests)} remaining tests")
        
        # Results collection
        results: List[EnhancementResult] = []
        
        # Process remaining tests
        for test_num in remaining_tests:
            try:
                # Mark as in progress
                progress.mark_in_progress(test_num)
                self._save_progress(progress, progress_file)
                
                # Get test file path
                test_path = self._get_test_path(test_num, progress.test_type)
                
                if not test_path.exists():
                    logger.warning(f"Test file not found: {test_path}")
                    progress.mark_failed(test_num)
                    results.append(EnhancementResult(
                        test_number=test_num,
                        test_type=progress.test_type,
                        success=False,
                        error_message=f"Test file not found: {test_path}"
                    ))
                    continue
                
                # Enhance the test
                result = self.enhance_test(test_path)
                results.append(result)
                
                # Update progress
                if result.success:
                    progress.mark_completed(
                        test_num,
                        result.processing_stats.tokens_used,
                        result.processing_stats.processing_time_seconds
                    )
                    logger.info(f"✓ Test {test_num} completed successfully")
                else:
                    progress.mark_failed(test_num)
                    logger.error(f"✗ Test {test_num} failed: {result.error_message}")
                
                # Save progress after each test
                self._save_progress(progress, progress_file)
                
            except Exception as e:
                logger.error(f"Unexpected error processing test {test_num}: {e}")
                progress.mark_failed(test_num)
                self._save_progress(progress, progress_file)
                
                results.append(EnhancementResult(
                    test_number=test_num,
                    test_type=progress.test_type,
                    success=False,
                    error_message=str(e)
                ))
        
        # Generate summary report
        summary = self._generate_batch_summary(progress, results)
        
        logger.info(f"Batch resume completed: {len(progress.completed)}/{progress.test_range_end - progress.test_range_start + 1} successful")
        
        return summary
    
    def _get_test_path(self, test_num: int, test_type: str) -> Path:
        """Get path to test file."""
        input_dir = self.config.paths.get_input_path() / test_type / "practice"
        
        # Try different naming patterns
        patterns = [
            f"parsed_ielts-{test_type}-practice-test-{test_num:02d}-with-answers.json",
            f"{test_type}_test_{test_num:02d}.json",
            f"{test_type}_test_{test_num}.json",
            f"test_{test_num:02d}.json",
            f"test_{test_num}.json",
        ]
        
        for pattern in patterns:
            test_path = input_dir / pattern
            if test_path.exists():
                return test_path
        
        # Return first pattern as default (will be checked for existence)
        return input_dir / patterns[0]
    
    def _save_progress(self, progress: BatchProgress, progress_file: Path) -> None:
        """Save batch progress to file."""
        try:
            progress_file.parent.mkdir(parents=True, exist_ok=True)
            with open(progress_file, 'w', encoding='utf-8') as f:
                json.dump(progress.to_dict(), f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save progress: {e}")
    
    def _load_progress(self, progress_file: Path) -> BatchProgress:
        """Load batch progress from file."""
        try:
            with open(progress_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Reconstruct BatchProgress object
            progress = BatchProgress(
                batch_id=data['batch_id'],
                start_time=datetime.fromisoformat(data['start_time']),
                last_update=datetime.fromisoformat(data['last_update']),
                test_type=data['test_type'],
                test_range_start=data['test_range']['start'],
                test_range_end=data['test_range']['end'],
                completed=data['completed'],
                failed=data['failed'],
                skipped=data.get('skipped', []),
                in_progress=data.get('in_progress'),
                total_tokens_used=data['stats']['total_tokens_used'],
                total_processing_time=data['stats']['total_processing_time']
            )
            
            return progress
            
        except Exception as e:
            raise ProcessingError(f"Failed to load progress file: {e}")
    
    def _generate_batch_summary(
        self, 
        progress: BatchProgress, 
        results: List[EnhancementResult]
    ) -> Dict[str, Any]:
        """Generate batch processing summary report."""
        total_tests = progress.test_range_end - progress.test_range_start + 1
        
        summary = {
            "batch_id": progress.batch_id,
            "test_type": progress.test_type,
            "test_range": {
                "start": progress.test_range_start,
                "end": progress.test_range_end
            },
            "summary": {
                "total_tests": total_tests,
                "completed": len(progress.completed),
                "failed": len(progress.failed),
                "success_rate": len(progress.completed) / total_tests if total_tests > 0 else 0
            },
            "statistics": {
                "total_tokens_used": progress.total_tokens_used,
                "total_processing_time": round(progress.total_processing_time, 2),
                "average_tokens_per_test": round(progress.total_tokens_used / len(progress.completed), 2) if progress.completed else 0,
                "average_time_per_test": round(progress.total_processing_time / len(progress.completed), 2) if progress.completed else 0
            },
            "completed_tests": sorted(progress.completed),
            "failed_tests": sorted(progress.failed),
            "start_time": progress.start_time.isoformat(),
            "end_time": datetime.now().isoformat(),
            "duration_minutes": round((datetime.now() - progress.start_time).total_seconds() / 60, 2)
        }
        
        # Add individual test results
        summary["test_results"] = [result.to_dict() for result in results]
        
        return summary
    
    def _handle_enhancement_error(
        self, 
        error: Exception, 
        test_number: int,
        test_type: str,
        original_data: Optional[Dict[str, Any]] = None
    ) -> EnhancementResult:
        """
        Handle enhancement errors with graceful degradation.
        
        This method:
        1. Logs the error with context
        2. Attempts to save partial results if available
        3. Returns a failure result with error details
        
        Args:
            error: The exception that occurred
            test_number: Test number being processed
            test_type: Type of test
            original_data: Original test data (for partial save)
            
        Returns:
            EnhancementResult indicating failure
        """
        error_type = type(error).__name__
        error_message = str(error)
        
        logger.error(
            f"Enhancement error for test {test_number} ({test_type}): "
            f"{error_type} - {error_message}"
        )
        
        # Save partial results if available and configured
        if original_data and self.config.validation.save_invalid:
            try:
                self._save_partial_result(test_number, test_type, original_data, error)
            except Exception as save_error:
                logger.error(f"Failed to save partial result: {save_error}")
        
        # Create failure result
        return EnhancementResult(
            test_number=test_number,
            test_type=test_type,
            success=False,
            error_message=f"{error_type}: {error_message}"
        )
    
    def _save_partial_result(
        self,
        test_number: int,
        test_type: str,
        data: Dict[str, Any],
        error: Exception
    ) -> None:
        """
        Save partial results for debugging.
        
        Args:
            test_number: Test number
            test_type: Type of test
            data: Partial data to save
            error: The error that occurred
        """
        debug_dir = Path("debug") / "enhancement_failures"
        debug_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        debug_file = debug_dir / f"{test_type}_test_{test_number}_{timestamp}.json"
        
        debug_data = {
            "test_number": test_number,
            "test_type": test_type,
            "error": {
                "type": type(error).__name__,
                "message": str(error)
            },
            "timestamp": datetime.now().isoformat(),
            "partial_data": data
        }
        
        with open(debug_file, 'w', encoding='utf-8') as f:
            json.dump(debug_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Partial result saved to: {debug_file}")
    
    def _attempt_graceful_degradation(
        self,
        original_data: Dict[str, Any],
        test_type: str
    ) -> Dict[str, Any]:
        """
        Attempt graceful degradation when Gemini API fails.
        
        This method performs local-only enhancement:
        1. Ad removal using local patterns
        2. Basic question type inference (if possible)
        3. HTML cleanup
        
        Args:
            original_data: Original test data
            test_type: Type of test
            
        Returns:
            Partially enhanced data
        """
        logger.info("Attempting graceful degradation with local processing")
        
        try:
            enhanced = original_data.copy()
            
            # Perform local ad removal
            ad_stats = self._local_ad_removal(enhanced, test_type)
            
            # Add metadata
            if 'test_metadata' not in enhanced:
                enhanced['test_metadata'] = {}
            
            enhanced['test_metadata']['enhancement_date'] = datetime.now().isoformat()
            enhanced['test_metadata']['enhancement_version'] = '1.0-local'
            enhanced['test_metadata']['enhancement_method'] = 'local_only'
            
            # Add ad removal stats
            enhanced['enhancement_metadata'] = {
                'ads_removed': ad_stats,
                'note': 'Enhanced using local processing only (Gemini API unavailable)'
            }
            
            return enhanced
            
        except Exception as e:
            logger.error(f"Graceful degradation failed: {e}")
            return original_data
    
    def _local_ad_removal(
        self,
        data: Dict[str, Any],
        test_type: str
    ) -> Dict[str, Any]:
        """
        Perform local ad removal without Gemini.
        
        Args:
            data: Test data to clean
            test_type: Type of test
            
        Returns:
            Ad removal statistics
        """
        removed_images = []
        script_count = 0
        element_count = 0
        
        # Process passages/sections
        content_key = 'passages' if test_type == 'reading' else 'sections'
        
        if content_key in data:
            for item in data[content_key]:
                # Remove ad URLs from images array
                if 'images' in item and isinstance(item['images'], list):
                    clean_images, removed = self.ad_remover.filter_ad_urls(item['images'])
                    item['images'] = clean_images
                    removed_images.extend(removed)
                    element_count += len(removed)
                
                if 'html_content' in item:
                    # Remove ad images from HTML
                    cleaned_html, removed = self.ad_remover.remove_ad_images(
                        item['html_content']
                    )
                    removed_images.extend(removed)
                    
                    # Remove ad scripts
                    cleaned_html, scripts = self.ad_remover.remove_ad_scripts(
                        cleaned_html
                    )
                    script_count += scripts
                    
                    item['html_content'] = cleaned_html
        
        # Process questions
        if 'questions' in data:
            for question in data['questions']:
                # Remove ad URLs from images array
                if 'images' in question and isinstance(question['images'], list):
                    clean_images, removed = self.ad_remover.filter_ad_urls(question['images'])
                    question['images'] = clean_images
                    removed_images.extend(removed)
                    element_count += len(removed)
                
                if 'html_content' in question:
                    # Remove ad images from HTML
                    cleaned_html, removed = self.ad_remover.remove_ad_images(
                        question['html_content']
                    )
                    removed_images.extend(removed)
                    
                    # Remove ad scripts
                    cleaned_html, scripts = self.ad_remover.remove_ad_scripts(
                        cleaned_html
                    )
                    script_count += scripts
                    
                    question['html_content'] = cleaned_html
        
        return {
            "image_urls": removed_images,
            "script_count": script_count,
            "element_count": element_count
        }
    
    def _should_retry_error(self, error: Exception, retry_count: int) -> bool:
        """
        Determine if an error should trigger a retry.
        
        Args:
            error: The exception that occurred
            retry_count: Current retry count
            
        Returns:
            True if should retry, False otherwise
        """
        max_retries = self.config.processing.max_retries
        
        # Don't retry if max retries reached
        if retry_count >= max_retries:
            return False
        
        # Retry on rate limit errors
        if isinstance(error, (GeminiAPIError, TimeoutError)):
            return True
        
        # Don't retry on validation or configuration errors
        if isinstance(error, (ValidationError, ProcessingError)):
            return False
        
        # Retry on other errors
        return True
