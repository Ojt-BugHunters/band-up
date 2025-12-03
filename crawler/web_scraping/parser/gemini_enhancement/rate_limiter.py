"""
Rate limiter for Gemini API requests.

This module implements rate limiting to ensure compliance with Gemini API quotas:
- 15 requests per minute (RPM)
- 250,000 tokens per minute (TPM)
- 1,000 requests per day

The rate limiter uses a sliding window approach with blocking logic to prevent
exceeding limits and implements automatic counter resets.
"""

import time
from datetime import datetime, timedelta
from typing import Optional
from threading import Lock

from .models import RateLimitStats
from .exceptions import RateLimitError, QuotaExceededError
from .logging_config import get_logger


logger = get_logger(__name__)


class RateLimiter:
    """
    Rate limiter for Gemini API requests.
    
    Implements thread-safe rate limiting with blocking logic to ensure
    API quota compliance. Tracks requests per minute, tokens per minute,
    and daily request counts.
    
    Attributes:
        rpm_limit: Maximum requests per minute
        tpm_limit: Maximum tokens per minute
        daily_limit: Maximum requests per day
        min_delay: Minimum delay between requests in seconds
    """
    
    def __init__(
        self,
        rpm_limit: int = 15,
        tpm_limit: int = 250000,
        daily_limit: int = 1000,
        min_delay: float = 4.0
    ):
        """
        Initialize the rate limiter.
        
        Args:
            rpm_limit: Maximum requests per minute (default: 15)
            tpm_limit: Maximum tokens per minute (default: 250,000)
            daily_limit: Maximum requests per day (default: 1,000)
            min_delay: Minimum delay between requests in seconds (default: 4.0)
        """
        self.rpm_limit = rpm_limit
        self.tpm_limit = tpm_limit
        self.daily_limit = daily_limit
        self.min_delay = min_delay
        
        # Current usage counters
        self.current_rpm = 0
        self.current_tpm = 0
        self.current_daily = 0
        
        # Time tracking
        self.last_request_time: Optional[datetime] = None
        self.minute_window_start: Optional[datetime] = None
        self.day_start: Optional[datetime] = None
        
        # Thread safety
        self._lock = Lock()
        
        # Warning thresholds (80% of limits)
        self.rpm_warning_threshold = int(rpm_limit * 0.8)
        self.tpm_warning_threshold = int(tpm_limit * 0.8)
        self.daily_warning_threshold = int(daily_limit * 0.8)
        
        logger.info(
            f"RateLimiter initialized: RPM={rpm_limit}, TPM={tpm_limit}, "
            f"Daily={daily_limit}, MinDelay={min_delay}s"
        )
    
    def acquire(self, estimated_tokens: int = 0) -> None:
        """
        Acquire permission to make an API request.
        
        This method blocks if necessary to ensure rate limits are not exceeded.
        It checks:
        1. Daily quota
        2. Requests per minute limit
        3. Tokens per minute limit
        4. Minimum delay between requests
        
        Args:
            estimated_tokens: Estimated tokens for the request (default: 0)
        
        Raises:
            QuotaExceededError: If daily quota is exhausted
            RateLimitError: If rate limits cannot be satisfied
        """
        with self._lock:
            now = datetime.now()
            
            # Initialize time windows if first request
            if self.minute_window_start is None:
                self.minute_window_start = now
            if self.day_start is None:
                self.day_start = now
            
            # Reset counters if windows have expired
            self._reset_counters_if_needed(now)
            
            # Check daily quota
            if self.current_daily >= self.daily_limit:
                raise QuotaExceededError(
                    f"Daily quota of {self.daily_limit} requests exceeded",
                    context={
                        "current_daily": self.current_daily,
                        "daily_limit": self.daily_limit
                    }
                )
            
            # Calculate wait time for RPM limit
            rpm_wait = self._calculate_rpm_wait(now)
            
            # Calculate wait time for TPM limit
            tpm_wait = self._calculate_tpm_wait(estimated_tokens, now)
            
            # Calculate wait time for minimum delay
            min_delay_wait = self._calculate_min_delay_wait(now)
            
            # Take the maximum wait time
            total_wait = max(rpm_wait, tpm_wait, min_delay_wait)
            
            if total_wait > 0:
                logger.info(
                    f"Rate limit: waiting {total_wait:.2f}s "
                    f"(RPM: {rpm_wait:.2f}s, TPM: {tpm_wait:.2f}s, "
                    f"MinDelay: {min_delay_wait:.2f}s)"
                )
                time.sleep(total_wait)
                
                # Recalculate current time after waiting
                now = datetime.now()
                self._reset_counters_if_needed(now)
            
            # Log warnings if approaching limits
            self._log_limit_warnings()
            
            # Update last request time
            self.last_request_time = now
    
    def record_request(self, tokens_used: int) -> None:
        """
        Record a completed API request.
        
        Updates usage counters for RPM, TPM, and daily quotas.
        
        Args:
            tokens_used: Number of tokens used in the request
        """
        with self._lock:
            now = datetime.now()
            
            # Reset counters if needed
            self._reset_counters_if_needed(now)
            
            # Increment counters
            self.current_rpm += 1
            self.current_tpm += tokens_used
            self.current_daily += 1
            
            logger.debug(
                f"Request recorded: RPM={self.current_rpm}/{self.rpm_limit}, "
                f"TPM={self.current_tpm}/{self.tpm_limit}, "
                f"Daily={self.current_daily}/{self.daily_limit}, "
                f"Tokens={tokens_used}"
            )
            
            # Log warnings if approaching limits
            self._log_limit_warnings()
    
    def get_stats(self) -> RateLimitStats:
        """
        Get current rate limit statistics.
        
        Returns:
            RateLimitStats object with current usage information
        """
        with self._lock:
            now = datetime.now()
            self._reset_counters_if_needed(now)
            
            return RateLimitStats(
                requests_per_minute=self.rpm_limit,
                tokens_per_minute=self.tpm_limit,
                requests_per_day=self.daily_limit,
                current_rpm=self.current_rpm,
                current_tpm=self.current_tpm,
                current_daily=self.current_daily,
                last_request_time=self.last_request_time,
                minute_window_start=self.minute_window_start,
                day_start=self.day_start
            )
    
    def reset_counters(self) -> None:
        """
        Manually reset all rate limit counters.
        
        This is useful for testing or when starting a new processing session.
        """
        with self._lock:
            self.current_rpm = 0
            self.current_tpm = 0
            self.current_daily = 0
            self.last_request_time = None
            self.minute_window_start = None
            self.day_start = None
            
            logger.info("Rate limit counters manually reset")
    
    def _reset_counters_if_needed(self, now: datetime) -> None:
        """
        Reset counters if time windows have expired.
        
        Args:
            now: Current datetime
        """
        # Reset minute window if 60 seconds have passed
        if self.minute_window_start:
            elapsed_seconds = (now - self.minute_window_start).total_seconds()
            if elapsed_seconds >= 60:
                logger.debug(
                    f"Resetting minute window: RPM was {self.current_rpm}, "
                    f"TPM was {self.current_tpm}"
                )
                self.current_rpm = 0
                self.current_tpm = 0
                self.minute_window_start = now
        
        # Reset daily counter if 24 hours have passed
        if self.day_start:
            elapsed_hours = (now - self.day_start).total_seconds() / 3600
            if elapsed_hours >= 24:
                logger.info(
                    f"Resetting daily counter: was {self.current_daily} requests"
                )
                self.current_daily = 0
                self.day_start = now
    
    def _calculate_rpm_wait(self, now: datetime) -> float:
        """
        Calculate wait time needed for RPM limit.
        
        Args:
            now: Current datetime
        
        Returns:
            Wait time in seconds
        """
        if self.current_rpm >= self.rpm_limit:
            # Need to wait until minute window resets
            if self.minute_window_start:
                elapsed = (now - self.minute_window_start).total_seconds()
                wait_time = max(0, 60 - elapsed)
                return wait_time
        return 0.0
    
    def _calculate_tpm_wait(self, estimated_tokens: int, now: datetime) -> float:
        """
        Calculate wait time needed for TPM limit.
        
        Args:
            estimated_tokens: Estimated tokens for next request
            now: Current datetime
        
        Returns:
            Wait time in seconds
        """
        if self.current_tpm + estimated_tokens > self.tpm_limit:
            # Need to wait until minute window resets
            if self.minute_window_start:
                elapsed = (now - self.minute_window_start).total_seconds()
                wait_time = max(0, 60 - elapsed)
                return wait_time
        return 0.0
    
    def _calculate_min_delay_wait(self, now: datetime) -> float:
        """
        Calculate wait time needed for minimum delay between requests.
        
        Args:
            now: Current datetime
        
        Returns:
            Wait time in seconds
        """
        if self.last_request_time:
            elapsed = (now - self.last_request_time).total_seconds()
            wait_time = max(0, self.min_delay - elapsed)
            return wait_time
        return 0.0
    
    def _log_limit_warnings(self) -> None:
        """Log warnings when approaching rate limits."""
        # RPM warning
        if self.current_rpm >= self.rpm_warning_threshold:
            logger.warning(
                f"Approaching RPM limit: {self.current_rpm}/{self.rpm_limit} "
                f"({self.current_rpm / self.rpm_limit * 100:.1f}%)"
            )
        
        # TPM warning
        if self.current_tpm >= self.tpm_warning_threshold:
            logger.warning(
                f"Approaching TPM limit: {self.current_tpm}/{self.tpm_limit} "
                f"({self.current_tpm / self.tpm_limit * 100:.1f}%)"
            )
        
        # Daily warning
        if self.current_daily >= self.daily_warning_threshold:
            logger.warning(
                f"Approaching daily limit: {self.current_daily}/{self.daily_limit} "
                f"({self.current_daily / self.daily_limit * 100:.1f}%)"
            )
    
    def __str__(self) -> str:
        """Return human-readable rate limiter status."""
        return (
            f"RateLimiter(RPM: {self.current_rpm}/{self.rpm_limit}, "
            f"TPM: {self.current_tpm}/{self.tpm_limit}, "
            f"Daily: {self.current_daily}/{self.daily_limit})"
        )
    
    def __repr__(self) -> str:
        """Return detailed rate limiter representation."""
        return (
            f"RateLimiter(rpm_limit={self.rpm_limit}, "
            f"tpm_limit={self.tpm_limit}, "
            f"daily_limit={self.daily_limit}, "
            f"min_delay={self.min_delay}, "
            f"current_rpm={self.current_rpm}, "
            f"current_tpm={self.current_tpm}, "
            f"current_daily={self.current_daily})"
        )
