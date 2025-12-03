"""
Logging configuration for Gemini Enhancement Pipeline.

This module provides comprehensive logging configuration with:
- Multiple log levels (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- Separate log files for batches
- Formatted log messages with timestamps and test identifiers
- Both console and file output
- Structured logging for API requests, processing stats, and validation results

Requirements: 9.1, 9.4
"""

import logging
import sys
from pathlib import Path
from logging.handlers import TimedRotatingFileHandler
from datetime import datetime
from typing import Optional, Dict, Any
import json


class StructuredFormatter(logging.Formatter):
    """
    Custom formatter that adds structured data to log records.
    
    This formatter supports adding context like test_number, test_type,
    batch_id, and other metadata to log messages.
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format log record with structured data.
        
        Args:
            record: Log record to format
            
        Returns:
            Formatted log message
        """
        # Add structured data if available
        extras = []
        
        if hasattr(record, 'test_number'):
            extras.append(f"test={record.test_number}")
        
        if hasattr(record, 'test_type'):
            extras.append(f"type={record.test_type}")
        
        if hasattr(record, 'batch_id'):
            extras.append(f"batch={record.batch_id[:8]}")  # Short batch ID
        
        if hasattr(record, 'tokens'):
            extras.append(f"tokens={record.tokens}")
        
        if hasattr(record, 'duration'):
            extras.append(f"duration={record.duration:.2f}s")
        
        # Add extras to message if present
        if extras:
            record.msg = f"[{' '.join(extras)}] {record.msg}"
        
        return super().format(record)


class BatchLogHandler(logging.FileHandler):
    """
    Custom file handler for batch-specific logging.
    
    Creates separate log files for each batch run with timestamps.
    """
    
    def __init__(self, log_dir: Path, batch_id: str, test_type: str):
        """
        Initialize batch log handler.
        
        Args:
            log_dir: Directory for log files
            batch_id: Unique batch identifier
            test_type: Type of tests being processed
        """
        log_dir.mkdir(parents=True, exist_ok=True)
        
        # Create batch-specific log filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        log_filename = log_dir / f"enhancement_{test_type}_{timestamp}_{batch_id[:8]}.log"
        
        super().__init__(log_filename, mode='a', encoding='utf-8')
        
        self.batch_id = batch_id
        self.test_type = test_type


def setup_logging(
    log_level: int = logging.INFO,
    log_dir: Optional[Path] = None,
    enable_file_logging: bool = True,
    enable_console: bool = True
) -> logging.Logger:
    """
    Configure comprehensive logging for the Gemini enhancement pipeline.
    
    This function sets up logging with:
    - Console output for immediate feedback
    - File output with daily rotation (if enabled)
    - Formatted messages with timestamps and test identifiers
    - Support for all log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
    
    Requirements:
    - 9.1: Log all API requests with timestamps and test identifiers
    - 9.4: Maintain separate log files for each batch processing run
    
    Args:
        log_level: Logging level (default: INFO)
                  Can be: logging.DEBUG, logging.INFO, logging.WARNING, 
                         logging.ERROR, logging.CRITICAL
        log_dir: Directory for log files (default: logs/enhancement)
        enable_file_logging: Whether to enable file logging (default: True)
        enable_console: Whether to enable console logging (default: True)
    
    Returns:
        Configured logger instance for gemini_enhancement
    """
    # Set default log directory
    if log_dir is None:
        log_dir = Path('logs') / 'enhancement'
    else:
        log_dir = Path(log_dir)
    
    # Create log directory if it doesn't exist
    log_dir.mkdir(parents=True, exist_ok=True)
    
    # Create formatter with timestamp and structured data
    # Format: 2025-11-12 10:30:15 - module_name - LEVEL - [test=5 type=listening] message
    formatter = StructuredFormatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Configure logger for gemini_enhancement package
    logger = logging.getLogger('gemini_enhancement')
    logger.setLevel(log_level)
    
    # Remove existing handlers to avoid duplicates
    logger.handlers.clear()
    
    # Prevent propagation to root logger to avoid duplicate logs
    logger.propagate = False
    
    # Console handler - for immediate feedback
    if enable_console:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(log_level)
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
    
    # File handler with daily rotation
    if enable_file_logging:
        # Create log filename with current date
        # Format: enhancement_2025-11-12.log
        log_filename = log_dir / f"enhancement_{datetime.now().strftime('%Y-%m-%d')}.log"
        
        # Use TimedRotatingFileHandler for automatic daily rotation
        # This creates a new log file each day at midnight
        file_handler = TimedRotatingFileHandler(
            filename=log_filename,
            when='midnight',  # Rotate at midnight
            interval=1,       # Every 1 day
            backupCount=30,   # Keep 30 days of logs
            encoding='utf-8'
        )
        file_handler.setLevel(log_level)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        
        logger.info(f"File logging enabled: {log_filename}")
    
    logger.info(f"Logging configured at {logging.getLevelName(log_level)} level")
    
    return logger


def setup_batch_logging(
    batch_id: str,
    test_type: str,
    log_dir: Optional[Path] = None,
    log_level: int = logging.INFO
) -> logging.Logger:
    """
    Set up logging for a specific batch run.
    
    Creates a separate log file for the batch with batch-specific context.
    
    Requirements:
    - 9.4: Maintain separate log files for each batch processing run
    
    Args:
        batch_id: Unique batch identifier
        test_type: Type of tests being processed
        log_dir: Directory for log files (default: logs/enhancement)
        log_level: Logging level (default: INFO)
    
    Returns:
        Logger configured for the batch
    """
    # Set default log directory
    if log_dir is None:
        log_dir = Path('logs') / 'enhancement'
    else:
        log_dir = Path(log_dir)
    
    # Get or create logger
    logger = logging.getLogger('gemini_enhancement')
    
    # Create batch-specific handler
    batch_handler = BatchLogHandler(log_dir, batch_id, test_type)
    batch_handler.setLevel(log_level)
    
    # Use structured formatter
    formatter = StructuredFormatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    batch_handler.setFormatter(formatter)
    
    # Add batch handler to logger
    logger.addHandler(batch_handler)
    
    logger.info(
        f"Batch logging started",
        extra={'batch_id': batch_id, 'test_type': test_type}
    )
    
    return logger


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for a specific module.
    
    Args:
        name: Module name (typically __name__)
    
    Returns:
        Logger instance configured with the gemini_enhancement namespace
    """
    return logging.getLogger(f'gemini_enhancement.{name}')


def set_log_level(level: int) -> None:
    """
    Change the log level for all gemini_enhancement loggers.
    
    Args:
        level: New log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    logger = logging.getLogger('gemini_enhancement')
    logger.setLevel(level)
    
    # Update all handlers
    for handler in logger.handlers:
        handler.setLevel(level)
    
    logger.info(f"Log level changed to {logging.getLevelName(level)}")


def log_api_request(
    logger: logging.Logger,
    test_number: int,
    test_type: str,
    prompt_length: int,
    estimated_tokens: int
) -> None:
    """
    Log an API request with structured data.
    
    Requirements:
    - 9.1: Log all API requests with timestamps and test identifiers
    
    Args:
        logger: Logger instance
        test_number: Test number being processed
        test_type: Type of test
        prompt_length: Length of prompt in characters
        estimated_tokens: Estimated token count
    """
    logger.info(
        f"Gemini API request - prompt_length={prompt_length} chars",
        extra={
            'test_number': test_number,
            'test_type': test_type,
            'tokens': estimated_tokens
        }
    )


def log_api_response(
    logger: logging.Logger,
    test_number: int,
    test_type: str,
    response_length: int,
    duration: float,
    success: bool = True
) -> None:
    """
    Log an API response with structured data.
    
    Requirements:
    - 9.1: Log all API requests with timestamps and test identifiers
    
    Args:
        logger: Logger instance
        test_number: Test number being processed
        test_type: Type of test
        response_length: Length of response in characters
        duration: Request duration in seconds
        success: Whether the request was successful
    """
    status = "SUCCESS" if success else "FAILED"
    logger.info(
        f"Gemini API response - {status} response_length={response_length} chars",
        extra={
            'test_number': test_number,
            'test_type': test_type,
            'duration': duration
        }
    )


def log_processing_stats(
    logger: logging.Logger,
    test_number: int,
    test_type: str,
    tokens_used: int,
    processing_time: float,
    gemini_calls: int = 1
) -> None:
    """
    Log processing statistics for a test.
    
    Requirements:
    - 9.2: Log processing statistics (tokens, time)
    
    Args:
        logger: Logger instance
        test_number: Test number
        test_type: Type of test
        tokens_used: Total tokens used
        processing_time: Total processing time in seconds
        gemini_calls: Number of Gemini API calls made
    """
    logger.info(
        f"Processing complete - calls={gemini_calls}",
        extra={
            'test_number': test_number,
            'test_type': test_type,
            'tokens': tokens_used,
            'duration': processing_time
        }
    )


def log_validation_result(
    logger: logging.Logger,
    test_number: int,
    test_type: str,
    is_valid: bool,
    error_count: int = 0,
    warning_count: int = 0,
    checks_passed: int = 0
) -> None:
    """
    Log validation results for a test.
    
    Requirements:
    - 9.3: Log validation results
    
    Args:
        logger: Logger instance
        test_number: Test number
        test_type: Type of test
        is_valid: Whether validation passed
        error_count: Number of validation errors
        warning_count: Number of validation warnings
        checks_passed: Number of validation checks passed
    """
    status = "VALID" if is_valid else "INVALID"
    logger.info(
        f"Validation {status} - errors={error_count} warnings={warning_count} checks_passed={checks_passed}",
        extra={
            'test_number': test_number,
            'test_type': test_type
        }
    )


def log_error_with_context(
    logger: logging.Logger,
    error: Exception,
    test_number: int,
    test_type: str,
    context: Optional[Dict[str, Any]] = None
) -> None:
    """
    Log an error with full context information.
    
    Requirements:
    - 9.5: Add error logging with context
    
    Args:
        logger: Logger instance
        error: Exception that occurred
        test_number: Test number being processed
        test_type: Type of test
        context: Additional context information
    """
    error_type = type(error).__name__
    error_msg = str(error)
    
    # Build context string
    context_parts = []
    if context:
        for key, value in context.items():
            context_parts.append(f"{key}={value}")
    
    context_str = " ".join(context_parts) if context_parts else "no additional context"
    
    logger.error(
        f"{error_type}: {error_msg} - {context_str}",
        extra={
            'test_number': test_number,
            'test_type': test_type
        },
        exc_info=True  # Include stack trace
    )


def log_batch_summary(
    logger: logging.Logger,
    batch_id: str,
    test_type: str,
    total_tests: int,
    completed: int,
    failed: int,
    total_tokens: int,
    total_time: float
) -> None:
    """
    Log batch processing summary.
    
    Args:
        logger: Logger instance
        batch_id: Batch identifier
        test_type: Type of tests
        total_tests: Total number of tests
        completed: Number of completed tests
        failed: Number of failed tests
        total_tokens: Total tokens used
        total_time: Total processing time in seconds
    """
    success_rate = (completed / total_tests * 100) if total_tests > 0 else 0
    avg_time = (total_time / completed) if completed > 0 else 0
    avg_tokens = (total_tokens / completed) if completed > 0 else 0
    
    logger.info(
        f"Batch complete - {completed}/{total_tests} successful ({success_rate:.1f}%) "
        f"avg_time={avg_time:.2f}s avg_tokens={avg_tokens:.0f}",
        extra={
            'batch_id': batch_id,
            'test_type': test_type,
            'tokens': total_tokens,
            'duration': total_time
        }
    )


def create_json_log_entry(
    event_type: str,
    test_number: int,
    test_type: str,
    data: Dict[str, Any]
) -> str:
    """
    Create a JSON-formatted log entry for structured logging.
    
    This can be used for machine-readable logs that can be parsed
    by log analysis tools.
    
    Args:
        event_type: Type of event (e.g., 'api_request', 'validation', 'error')
        test_number: Test number
        test_type: Type of test
        data: Event-specific data
    
    Returns:
        JSON-formatted log entry string
    """
    entry = {
        'timestamp': datetime.now().isoformat(),
        'event_type': event_type,
        'test_number': test_number,
        'test_type': test_type,
        'data': data
    }
    
    return json.dumps(entry)


def cleanup_old_logs(log_dir: Path, days_to_keep: int = 30) -> int:
    """
    Clean up log files older than specified days.
    
    Args:
        log_dir: Directory containing log files
        days_to_keep: Number of days to keep logs (default: 30)
    
    Returns:
        Number of log files deleted
    """
    if not log_dir.exists():
        return 0
    
    from datetime import timedelta
    
    cutoff_date = datetime.now() - timedelta(days=days_to_keep)
    deleted_count = 0
    
    for log_file in log_dir.glob('*.log*'):
        if log_file.is_file():
            # Get file modification time
            mtime = datetime.fromtimestamp(log_file.stat().st_mtime)
            
            if mtime < cutoff_date:
                try:
                    log_file.unlink()
                    deleted_count += 1
                except Exception as e:
                    logging.warning(f"Failed to delete old log file {log_file}: {e}")
    
    if deleted_count > 0:
        logging.info(f"Cleaned up {deleted_count} old log files from {log_dir}")
    
    return deleted_count
