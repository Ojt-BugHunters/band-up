"""
Configuration management for Gemini Test Enhancement.

This module handles loading and validating configuration from YAML files
and environment variables.
"""

import os
import yaml
from pathlib import Path
from typing import Dict, Any, Optional
from dataclasses import dataclass, field

from .exceptions import ConfigurationError


@dataclass
class GeminiConfig:
    """Gemini API configuration."""
    model: str = "gemini-2.5-flash"
    api_key_env: str = "GEMINI_API_KEY"
    temperature: float = 0.1
    max_output_tokens: int = 8192
    
    @property
    def api_key(self) -> str:
        """Get API key from environment variable."""
        key = os.getenv(self.api_key_env)
        if not key:
            raise ConfigurationError(
                f"API key not found. Please set the {self.api_key_env} environment variable."
            )
        return key


@dataclass
class RateLimitConfig:
    """Rate limiting configuration."""
    requests_per_minute: int = 15
    tokens_per_minute: int = 250000
    requests_per_day: int = 1000
    delay_between_requests: float = 4.0


@dataclass
class ProcessingConfig:
    """Processing configuration."""
    batch_size: int = 15
    max_retries: int = 3
    retry_delay: float = 5.0
    timeout: int = 60


@dataclass
class PathConfig:
    """Path configuration."""
    input_dir: str = "web_scraping/parsed"
    output_dir: str = "web_scraping/parsed_enhanced"
    progress_file: str = "enhancement_progress.json"
    log_dir: str = "logs/enhancement"
    
    def get_input_path(self) -> Path:
        """Get input directory as Path object."""
        return Path(self.input_dir)
    
    def get_output_path(self) -> Path:
        """Get output directory as Path object."""
        return Path(self.output_dir)
    
    def get_progress_path(self) -> Path:
        """Get progress file as Path object."""
        return Path(self.progress_file)
    
    def get_log_path(self) -> Path:
        """Get log directory as Path object."""
        return Path(self.log_dir)


@dataclass
class ValidationConfig:
    """Validation configuration."""
    strict_mode: bool = True
    save_invalid: bool = True
    dry_run: bool = False


@dataclass
class Config:
    """Main configuration container."""
    gemini: GeminiConfig = field(default_factory=GeminiConfig)
    rate_limits: RateLimitConfig = field(default_factory=RateLimitConfig)
    processing: ProcessingConfig = field(default_factory=ProcessingConfig)
    paths: PathConfig = field(default_factory=PathConfig)
    validation: ValidationConfig = field(default_factory=ValidationConfig)


class ConfigManager:
    """
    Manages configuration loading, validation, and access.
    
    Supports loading from YAML files with environment variable overrides.
    Provides sensible defaults for all configuration values.
    """
    
    DEFAULT_CONFIG_PATH = Path("config/gemini_enhancement.yaml")
    
    def __init__(self, config_path: Optional[Path] = None):
        """
        Initialize ConfigManager.
        
        Args:
            config_path: Path to configuration file. If None, uses default path.
        """
        self.config_path = config_path or self.DEFAULT_CONFIG_PATH
        self.config = self._load_config()
        self._validate_config()
    
    def _load_config(self) -> Config:
        """
        Load configuration from file or use defaults.
        
        Returns:
            Config object with loaded or default values.
        """
        # Start with default configuration
        config_dict = self._get_default_config()
        
        # Load from file if it exists
        if self.config_path.exists():
            try:
                with open(self.config_path, 'r') as f:
                    file_config = yaml.safe_load(f)
                    if file_config:
                        config_dict = self._merge_configs(config_dict, file_config)
            except yaml.YAMLError as e:
                raise ConfigurationError(f"Failed to parse YAML configuration: {e}")
            except Exception as e:
                raise ConfigurationError(f"Failed to load configuration file: {e}")
        
        # Apply environment variable overrides
        config_dict = self._apply_env_overrides(config_dict)
        
        # Convert to Config object
        return self._dict_to_config(config_dict)
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default configuration as dictionary."""
        return {
            'gemini': {
                'model': 'gemini-2.5-flash',
                'api_key_env': 'GEMINI_API_KEY',
                'temperature': 0.1,
                'max_output_tokens': 8192
            },
            'rate_limits': {
                'requests_per_minute': 15,
                'tokens_per_minute': 250000,
                'requests_per_day': 1000,
                'delay_between_requests': 4.0
            },
            'processing': {
                'batch_size': 15,
                'max_retries': 3,
                'retry_delay': 5.0,
                'timeout': 60
            },
            'paths': {
                'input_dir': 'web_scraping/parsed',
                'output_dir': 'web_scraping/parsed_enhanced',
                'progress_file': 'enhancement_progress.json',
                'log_dir': 'logs/enhancement'
            },
            'validation': {
                'strict_mode': True,
                'save_invalid': True,
                'dry_run': False
            }
        }
    
    def _merge_configs(self, base: Dict[str, Any], override: Dict[str, Any]) -> Dict[str, Any]:
        """
        Recursively merge two configuration dictionaries.
        
        Args:
            base: Base configuration dictionary
            override: Override configuration dictionary
            
        Returns:
            Merged configuration dictionary
        """
        result = base.copy()
        
        for key, value in override.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = self._merge_configs(result[key], value)
            else:
                result[key] = value
        
        return result
    
    def _apply_env_overrides(self, config_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply environment variable overrides to configuration.
        
        Environment variables follow the pattern: GEMINI_ENHANCEMENT_<SECTION>_<KEY>
        Example: GEMINI_ENHANCEMENT_GEMINI_MODEL
        
        Args:
            config_dict: Configuration dictionary
            
        Returns:
            Configuration dictionary with environment overrides applied
        """
        env_prefix = "GEMINI_ENHANCEMENT_"
        
        for env_key, env_value in os.environ.items():
            if not env_key.startswith(env_prefix):
                continue
            
            # Parse environment variable name
            parts = env_key[len(env_prefix):].lower().split('_', 1)
            if len(parts) != 2:
                continue
            
            section, key = parts
            
            if section in config_dict and key in config_dict[section]:
                # Convert value to appropriate type
                original_value = config_dict[section][key]
                try:
                    if isinstance(original_value, bool):
                        config_dict[section][key] = env_value.lower() in ('true', '1', 'yes')
                    elif isinstance(original_value, int):
                        config_dict[section][key] = int(env_value)
                    elif isinstance(original_value, float):
                        config_dict[section][key] = float(env_value)
                    else:
                        config_dict[section][key] = env_value
                except ValueError:
                    # If conversion fails, keep original value and log warning
                    pass
        
        return config_dict
    
    def _dict_to_config(self, config_dict: Dict[str, Any]) -> Config:
        """
        Convert configuration dictionary to Config object.
        
        Args:
            config_dict: Configuration dictionary
            
        Returns:
            Config object
        """
        return Config(
            gemini=GeminiConfig(**config_dict.get('gemini', {})),
            rate_limits=RateLimitConfig(**config_dict.get('rate_limits', {})),
            processing=ProcessingConfig(**config_dict.get('processing', {})),
            paths=PathConfig(**config_dict.get('paths', {})),
            validation=ValidationConfig(**config_dict.get('validation', {}))
        )
    
    def _validate_config(self) -> None:
        """
        Validate configuration values.
        
        Raises:
            ConfigurationError: If configuration is invalid
        """
        # Validate Gemini config
        if self.config.gemini.temperature < 0 or self.config.gemini.temperature > 1:
            raise ConfigurationError("Temperature must be between 0 and 1")
        
        if self.config.gemini.max_output_tokens <= 0:
            raise ConfigurationError("max_output_tokens must be positive")
        
        # Validate rate limits
        if self.config.rate_limits.requests_per_minute <= 0:
            raise ConfigurationError("requests_per_minute must be positive")
        
        if self.config.rate_limits.tokens_per_minute <= 0:
            raise ConfigurationError("tokens_per_minute must be positive")
        
        if self.config.rate_limits.requests_per_day <= 0:
            raise ConfigurationError("requests_per_day must be positive")
        
        if self.config.rate_limits.delay_between_requests < 0:
            raise ConfigurationError("delay_between_requests must be non-negative")
        
        # Validate processing config
        if self.config.processing.batch_size <= 0:
            raise ConfigurationError("batch_size must be positive")
        
        if self.config.processing.max_retries < 0:
            raise ConfigurationError("max_retries must be non-negative")
        
        if self.config.processing.retry_delay < 0:
            raise ConfigurationError("retry_delay must be non-negative")
        
        if self.config.processing.timeout <= 0:
            raise ConfigurationError("timeout must be positive")
    
    def get_config(self) -> Config:
        """
        Get the loaded configuration.
        
        Returns:
            Config object
        """
        return self.config
    
    def reload(self) -> None:
        """Reload configuration from file."""
        self.config = self._load_config()
        self._validate_config()
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert configuration to dictionary.
        
        Returns:
            Configuration as dictionary
        """
        return {
            'gemini': {
                'model': self.config.gemini.model,
                'api_key_env': self.config.gemini.api_key_env,
                'temperature': self.config.gemini.temperature,
                'max_output_tokens': self.config.gemini.max_output_tokens
            },
            'rate_limits': {
                'requests_per_minute': self.config.rate_limits.requests_per_minute,
                'tokens_per_minute': self.config.rate_limits.tokens_per_minute,
                'requests_per_day': self.config.rate_limits.requests_per_day,
                'delay_between_requests': self.config.rate_limits.delay_between_requests
            },
            'processing': {
                'batch_size': self.config.processing.batch_size,
                'max_retries': self.config.processing.max_retries,
                'retry_delay': self.config.processing.retry_delay,
                'timeout': self.config.processing.timeout
            },
            'paths': {
                'input_dir': self.config.paths.input_dir,
                'output_dir': self.config.paths.output_dir,
                'progress_file': self.config.paths.progress_file,
                'log_dir': self.config.paths.log_dir
            },
            'validation': {
                'strict_mode': self.config.validation.strict_mode,
                'save_invalid': self.config.validation.save_invalid,
                'dry_run': self.config.validation.dry_run
            }
        }
