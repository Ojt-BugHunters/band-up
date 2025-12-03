"""
AWS Secrets Manager Helper
Provides cached access to secrets from AWS Secrets Manager
"""

import os
import boto3
import logging
from functools import lru_cache
from botocore.exceptions import ClientError

logger = logging.getLogger()


class SecretsManager:
    """
    Helper class for AWS Secrets Manager with caching.
    
    Usage:
        secrets = SecretsManager()
        api_key = secrets.get_gemini_api_key()
    """
    
    def __init__(self):
        """Initialize Secrets Manager client."""
        self.client = boto3.client('secretsmanager')
        logger.info("✅ SecretsManager initialized")
    
    @lru_cache(maxsize=128)
    def get_secret(self, secret_arn: str) -> str:
        """
        Get secret value from Secrets Manager with caching.
        
        Caching reduces API calls and improves performance:
        - First call: Retrieves from Secrets Manager (~50-100ms)
        - Subsequent calls: Returns from cache (<1ms)
        - Cache persists across Lambda invocations (warm starts)
        
        Args:
            secret_arn: ARN of the secret to retrieve
            
        Returns:
            Secret value as string
            
        Raises:
            ValueError: If secret not found or invalid parameters
            Exception: For other Secrets Manager errors
        """
        try:
            logger.info(f"🔐 Retrieving secret: {secret_arn}")
            response = self.client.get_secret_value(SecretId=secret_arn)
            logger.info(f"✅ Secret retrieved successfully")
            return response['SecretString']
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            
            if error_code == 'ResourceNotFoundException':
                logger.error(f"❌ Secret not found: {secret_arn}")
                raise ValueError(f"Secret not found: {secret_arn}")
                
            elif error_code == 'InvalidRequestException':
                logger.error(f"❌ Invalid request for secret: {secret_arn}")
                raise ValueError(f"Invalid request for secret: {secret_arn}")
                
            elif error_code == 'InvalidParameterException':
                logger.error(f"❌ Invalid parameter for secret: {secret_arn}")
                raise ValueError(f"Invalid parameter for secret: {secret_arn}")
                
            elif error_code == 'DecryptionFailure':
                logger.error(f"❌ Cannot decrypt secret: {secret_arn}")
                raise ValueError(f"Cannot decrypt secret (check KMS permissions): {secret_arn}")
                
            elif error_code == 'AccessDeniedException':
                logger.error(f"❌ Access denied to secret: {secret_arn}")
                raise ValueError(f"Access denied to secret (check IAM permissions): {secret_arn}")
            
            else:
                logger.error(f"❌ Secrets Manager error: {error_code}")
                raise
    
    def get_gemini_api_key(self) -> str:
        """
        Get Gemini API key from Secrets Manager.
        
        Reads the secret ARN from GEMINI_API_KEY_SECRET_ARN environment variable.
        
        Returns:
            Gemini API key as string
            
        Raises:
            ValueError: If GEMINI_API_KEY_SECRET_ARN not set or secret not found
        """
        secret_arn = os.environ.get('GEMINI_API_KEY_SECRET_ARN')
        
        if not secret_arn:
            logger.error("❌ GEMINI_API_KEY_SECRET_ARN environment variable not set")
            raise ValueError(
                'GEMINI_API_KEY_SECRET_ARN environment variable not set. '
                'Check your Lambda function configuration.'
            )
        
        return self.get_secret(secret_arn)
    
    def get_openai_api_key(self) -> str:
        """
        Get OpenAI API key from Secrets Manager (optional).
        
        Reads the secret ARN from OPENAI_API_KEY_SECRET_ARN environment variable.
        
        Returns:
            OpenAI API key as string, or None if not configured
            
        Raises:
            ValueError: If secret ARN is set but secret not found
        """
        secret_arn = os.environ.get('OPENAI_API_KEY_SECRET_ARN')
        
        if not secret_arn:
            logger.info("ℹ️ OPENAI_API_KEY_SECRET_ARN not configured")
            return None
        
        return self.get_secret(secret_arn)
    
    def get_bedrock_config(self) -> dict:
        """
        Get Bedrock configuration from Secrets Manager (optional).
        
        Reads the secret ARN from BEDROCK_CONFIG_SECRET_ARN environment variable.
        
        Returns:
            Bedrock config as dict, or None if not configured
            
        Raises:
            ValueError: If secret ARN is set but secret not found
        """
        import json
        
        secret_arn = os.environ.get('BEDROCK_CONFIG_SECRET_ARN')
        
        if not secret_arn:
            logger.info("ℹ️ BEDROCK_CONFIG_SECRET_ARN not configured")
            return None
        
        config_str = self.get_secret(secret_arn)
        return json.loads(config_str)
    
    def clear_cache(self):
        """
        Clear the secrets cache.
        
        Useful for testing or if you need to force refresh secrets
        (e.g., after rotation).
        """
        self.get_secret.cache_clear()
        logger.info("🔄 Secrets cache cleared")


# Global instance (reused across Lambda invocations for warm starts)
_secrets_manager = None


def get_secrets_manager() -> SecretsManager:
    """
    Get or create global SecretsManager instance.
    
    This ensures the same instance is reused across Lambda invocations
    (warm starts), which maintains the cache.
    
    Returns:
        SecretsManager instance
    """
    global _secrets_manager
    
    if _secrets_manager is None:
        _secrets_manager = SecretsManager()
    
    return _secrets_manager


# Convenience functions for direct access
def get_gemini_api_key() -> str:
    """Get Gemini API key from Secrets Manager."""
    return get_secrets_manager().get_gemini_api_key()


def get_openai_api_key() -> str:
    """Get OpenAI API key from Secrets Manager (optional)."""
    return get_secrets_manager().get_openai_api_key()


def get_bedrock_config() -> dict:
    """Get Bedrock configuration from Secrets Manager (optional)."""
    return get_secrets_manager().get_bedrock_config()

