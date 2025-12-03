"""
Cache Manager - Redis-based caching for evaluations
Caches evaluation results to avoid re-processing
"""

import json
import logging
from typing import Optional, Any, Dict

logger = logging.getLogger(__name__)


class CacheManager:
    """
    Cache evaluation results in Redis
    
    Keys:
    - eval:{session_id} - Cached evaluation result (TTL: 30 days)
    """
    
    def __init__(self, redis_client: Optional[Any] = None):
        """
        Initialize cache manager
        
        Args:
            redis_client: Redis client (if None, caching is disabled)
        """
        self.redis = redis_client
        self.default_ttl = 30 * 24 * 60 * 60  # 30 days in seconds

        if self.redis:
            logger.info("✅ CacheManager initialized with Redis backend")
        else:
            logger.info("ℹ️ CacheManager disabled (no Redis client provided)")
    
    def get_evaluation(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get cached evaluation result
        
        Args:
            session_id: Session ID
            
        Returns:
            Cached evaluation dict or None if not found
        """
        if not self.redis:
            return None

        key = f"eval:{session_id}"
        cached_data = self.redis.get(key)
        
        if cached_data:
            try:
                evaluation = json.loads(cached_data)
                logger.info(f"✅ Cache HIT: session={session_id}")
                return evaluation
            except json.JSONDecodeError as e:
                logger.error(f"❌ Failed to deserialize cached data: {e}")
                return None
        else:
            logger.info(f"❌ Cache MISS: session={session_id}")
            return None
    
    def cache_evaluation(
        self,
        session_id: str,
        evaluation: Dict[str, Any],
        ttl: Optional[int] = None
    ):
        """
        Cache evaluation result
        
        Args:
            session_id: Session ID
            evaluation: Evaluation result dict
            ttl: Time-to-live in seconds (default: 30 days)
        """
        if not self.redis:
            return

        key = f"eval:{session_id}"
        ttl = ttl or self.default_ttl
        
        try:
            # Serialize to JSON
            cached_data = json.dumps(evaluation)
            
            # Store in Redis with TTL
            self.redis.setex(key, ttl, cached_data)
            
            logger.info(f"✅ Cached evaluation: session={session_id}, ttl={ttl}s ({ttl // 86400} days)")
            
        except Exception as e:
            logger.error(f"❌ Failed to cache evaluation: session={session_id}, error={e}")
    
    def invalidate_evaluation(self, session_id: str):
        """
        Invalidate (delete) cached evaluation
        
        Args:
            session_id: Session ID
        """
        if not self.redis:
            return

        key = f"eval:{session_id}"
        self.redis.delete(key)
        logger.info(f"🗑️ Invalidated cache: session={session_id}")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics
        
        Returns:
            Dict with cache hits, misses, hit rate, etc.
        """
        if not self.redis:
            return {
                'cache_enabled': False,
                'default_ttl_days': 0
            }

        return {
            'cache_enabled': True,
            'default_ttl_days': self.default_ttl // 86400
        }

