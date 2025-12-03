"""
Logging configuration for IELTS Reading Content Parser

This module provides comprehensive logging configuration with:
- Multiple log levels (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- Log file rotation by date
- Formatted log messages with timestamps
- Both console and file output

Requirements: 9.7, 9.8
"""

import logging
import sys
from pathlib import Path
from logging.handlers import TimedRotatingFileHandler
from datetime import datetime


def setup_logging(log_level=logging.INFO, log_dir=None, enable_file_logging=True):
    """
    Configure comprehensive logging for the parser with file rotation by date
    
    This function sets up logging with:
    - Console output for immediate feedback
    - File output with daily rotation (if enabled)
    - Formatted messages with timestamps
    - Support for all log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
    
    Requirements:
    - 9.7: Configure log levels (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    - 9.8: Set up log file rotation by date, format log messages with timestamps
    
    Args:
        log_level: Logging level (default: INFO)
                  Can be: logging.DEBUG, logging.INFO, logging.WARNING, 
                         logging.ERROR, logging.CRITICAL
        log_dir: Directory for log files (default: logs/)
        enable_file_logging: Whether to enable file logging (default: True)
    
    Returns:
        Configured root logger instance
    """
    # Create formatter with timestamp
    # Format: 2025-11-12 10:30:15 - module_name - LEVEL - message
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Configure root logger
    root_logger = logging.getLogger('parser')
    root_logger.setLevel(log_level)
    
    # Remove existing handlers to avoid duplicates
    root_logger.handlers.clear()
    
    # Console handler - always enabled for immediate feedback
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # File handler with daily rotation (optional)
    if enable_file_logging:
        # Set default log directory
        if log_dir is None:
            log_dir = Path('logs')
        else:
            log_dir = Path(log_dir)
        
        # Create log directory if it doesn't exist
        log_dir.mkdir(parents=True, exist_ok=True)
        
        # Create log filename with current date
        # Format: parser_2025-11-12.log
        log_filename = log_dir / f"parser_{datetime.now().strftime('%Y-%m-%d')}.log"
        
        # Use TimedRotatingFileHandler for automatic daily rotation
        # This creates a new log file each day at midnight
        # Old logs are kept with date suffix (e.g., parser.log.2025-11-11)
        file_handler = TimedRotatingFileHandler(
            filename=log_filename,
            when='midnight',  # Rotate at midnight
            interval=1,       # Every 1 day
            backupCount=30,   # Keep 30 days of logs
            encoding='utf-8'
        )
        file_handler.setLevel(log_level)
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)
        
        root_logger.info(f"File logging enabled: {log_filename}")
    
    return root_logger


def get_logger(name):
    """
    Get a logger instance for a specific module
    
    Args:
        name: Module name (typically __name__)
    
    Returns:
        Logger instance configured with the parser namespace
    """
    return logging.getLogger(f'parser.{name}')


def set_log_level(level):
    """
    Change the log level for all loggers
    
    Args:
        level: New log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    root_logger = logging.getLogger('parser')
    root_logger.setLevel(level)
    
    # Update all handlers
    for handler in root_logger.handlers:
        handler.setLevel(level)
