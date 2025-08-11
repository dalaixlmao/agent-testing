"""
Logging configuration for the fraud detection system
"""

import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
import os
from typing import Dict, Union, Optional

from config import LOGGING_CONFIG

def setup_logging(
    log_file: Optional[Union[str, Path]] = None,
    level: str = "INFO",
    log_format: Optional[str] = None
) -> logging.Logger:
    """
    Set up logging configuration for the application
    
    Args:
        log_file: Path to the log file
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_format: Format for log messages
        
    Returns:
        Configured logger
    """
    # Use values from config if not specified
    log_file = log_file or LOGGING_CONFIG.get("log_file")
    level = level or LOGGING_CONFIG.get("level", "INFO")
    log_format = log_format or LOGGING_CONFIG.get(
        "format", "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    # Convert level string to logging level
    numeric_level = getattr(logging, level.upper(), None)
    if not isinstance(numeric_level, int):
        raise ValueError(f"Invalid log level: {level}")
    
    # Configure root logger
    logger = logging.getLogger()
    logger.setLevel(numeric_level)
    
    # Remove any existing handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    # Create formatter
    formatter = logging.Formatter(log_format)
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # Create file handler if log file is specified
    if log_file:
        log_file = Path(log_file)
        log_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Use rotating file handler to avoid huge log files
        file_handler = RotatingFileHandler(
            log_file,
            maxBytes=10 * 1024 * 1024,  # 10 MB
            backupCount=5
        )
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    # Log the setup
    logger.info(f"Logging initialized with level={level}")
    
    return logger


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger with the specified name
    
    Args:
        name: Logger name (usually __name__ of the calling module)
        
    Returns:
        Logger instance
    """
    return logging.getLogger(name)