#!/usr/bin/env python3
"""
HTML Crawler Module for IELTS Reading Tests

This module provides a robust HTML crawler with rate limiting, error handling,
retry logic, and progress tracking capabilities.
"""

import json
import logging
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import requests
from tqdm import tqdm

# Configure logging
logger = logging.getLogger(__name__)


class CrawlProgress:
    """Tracks crawling progress for resume capability"""
    
    def __init__(self, progress_file: Path):
        """
        Initialize progress tracker
        
        Args:
            progress_file: Path to progress tracking file
        """
        self.progress_file = progress_file
        self.total_tests = 0
        self.completed = 0
        self.failed = 0
        self.skipped = 0
        self.current_test: Optional[int] = None
        self.start_time = datetime.now()
        self.last_update = datetime.now()
        self.completed_tests: List[int] = []
        self.failed_tests: List[int] = []
        
    def load(self) -> bool:
        """
        Load progress from file
        
        Returns:
            True if progress was loaded, False if file doesn't exist
        """
        if not self.progress_file.exists():
            return False
            
        try:
            with open(self.progress_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            self.total_tests = data.get('total_tests', 0)
            self.completed = data.get('completed', 0)
            self.failed = data.get('failed', 0)
            self.skipped = data.get('skipped', 0)
            self.current_test = data.get('current_test')
            self.start_time = datetime.fromisoformat(data.get('start_time', datetime.now().isoformat()))
            self.last_update = datetime.fromisoformat(data.get('last_update', datetime.now().isoformat()))
            self.completed_tests = data.get('completed_tests', [])
            self.failed_tests = data.get('failed_tests', [])
            
            logger.info(f"Loaded progress: {self.completed}/{self.total_tests} completed")
            return True
            
        except Exception as e:
            logger.warning(f"Failed to load progress file: {e}")
            return False
    
    def save(self) -> None:
        """Save current progress to file"""
        try:
            self.last_update = datetime.now()
            
            data = {
                'total_tests': self.total_tests,
                'completed': self.completed,
                'failed': self.failed,
                'skipped': self.skipped,
                'current_test': self.current_test,
                'start_time': self.start_time.isoformat(),
                'last_update': self.last_update.isoformat(),
                'completed_tests': self.completed_tests,
                'failed_tests': self.failed_tests
            }
            
            # Ensure directory exists
            self.progress_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(self.progress_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
                
        except Exception as e:
            logger.error(f"Failed to save progress: {e}")
    
    def mark_completed(self, test_number: int) -> None:
        """Mark a test as completed"""
        self.completed += 1
        self.current_test = test_number
        if test_number not in self.completed_tests:
            self.completed_tests.append(test_number)
        self.save()
    
    def mark_failed(self, test_number: int) -> None:
        """Mark a test as failed"""
        self.failed += 1
        self.current_test = test_number
        if test_number not in self.failed_tests:
            self.failed_tests.append(test_number)
        self.save()
    
    def mark_skipped(self, test_number: int) -> None:
        """Mark a test as skipped"""
        self.skipped += 1
        self.current_test = test_number
        self.save()
    
    def get_summary(self) -> Dict:
        """
        Get progress summary
        
        Returns:
            Dictionary with progress statistics
        """
        duration = (datetime.now() - self.start_time).total_seconds()
        
        return {
            'total_tests': self.total_tests,
            'completed': self.completed,
            'failed': self.failed,
            'skipped': self.skipped,
            'duration_seconds': duration,
            'completed_tests': self.completed_tests,
            'failed_tests': self.failed_tests
        }


class HTMLCrawler:
    """
    HTML Crawler with rate limiting, error handling, and retry logic
    
    This crawler is designed to politely download HTML pages with proper
    rate limiting, exponential backoff retry logic, and progress tracking.
    """
    
    def __init__(
        self,
        delay: float = 0.35,
        timeout: int = 30,
        max_retries: int = 3,
        user_agent: str = "IELTSReaderBot/2.0 (+for education; polite crawling)"
    ):
        """
        Initialize HTML crawler with configuration
        
        Args:
            delay: Delay in seconds between requests (default: 0.35)
            timeout: Request timeout in seconds (default: 30)
            max_retries: Maximum number of retry attempts (default: 3)
            user_agent: Custom User-Agent header
        """
        self.delay = delay
        self.timeout = timeout
        self.max_retries = max_retries
        self.user_agent = user_agent
        
        # Create session with custom headers
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': self.user_agent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })
        
        logger.info(f"Initialized HTMLCrawler (delay={delay}s, timeout={timeout}s, max_retries={max_retries})")

    def download_page(self, url: str, retry_count: int = 0) -> Optional[str]:
        """
        Download a single HTML page with error handling and retry logic
        
        Args:
            url: URL to download
            retry_count: Current retry attempt (used internally)
            
        Returns:
            HTML content as string, or None if failed
            
        Raises:
            requests.exceptions.RequestException: For unrecoverable errors
        """
        try:
            logger.debug(f"Downloading: {url} (attempt {retry_count + 1}/{self.max_retries + 1})")
            
            # Make HTTP request
            response = self.session.get(url, timeout=self.timeout)
            
            # Handle 404 errors gracefully
            if response.status_code == 404:
                logger.warning(f"Page not found (404): {url}")
                return None
            
            # Raise for other HTTP errors
            response.raise_for_status()
            
            # Log success
            logger.info(f"Successfully downloaded: {url} ({len(response.text)} bytes)")
            
            return response.text
            
        except requests.exceptions.Timeout as e:
            logger.warning(f"Timeout downloading {url}: {e}")
            return self._handle_retry(url, retry_count, e)
            
        except requests.exceptions.ConnectionError as e:
            logger.warning(f"Connection error downloading {url}: {e}")
            return self._handle_retry(url, retry_count, e)
            
        except requests.exceptions.HTTPError as e:
            # Don't retry on client errors (4xx)
            if e.response.status_code >= 400 and e.response.status_code < 500:
                logger.error(f"HTTP client error {e.response.status_code} for {url}")
                return None
            
            # Retry on server errors (5xx)
            logger.warning(f"HTTP server error {e.response.status_code} for {url}")
            return self._handle_retry(url, retry_count, e)
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error downloading {url}: {e}")
            return self._handle_retry(url, retry_count, e)
            
        except Exception as e:
            logger.error(f"Unexpected error downloading {url}: {e}")
            return None
    
    def _handle_retry(
        self,
        url: str,
        retry_count: int,
        error: Exception  # noqa: ARG002
    ) -> Optional[str]:
        """
        Handle retry logic with exponential backoff
        
        Args:
            url: URL that failed
            retry_count: Current retry attempt
            error: Exception that occurred (kept for logging context)
            
        Returns:
            Result of retry attempt, or None if max retries exceeded
        """
        if retry_count >= self.max_retries:
            logger.error(f"Max retries ({self.max_retries}) exceeded for {url}")
            return None
        
        # Calculate exponential backoff delay
        backoff_delay = self.delay * (2 ** retry_count)
        logger.info(f"Retrying in {backoff_delay:.2f}s... (attempt {retry_count + 2}/{self.max_retries + 1})")
        
        time.sleep(backoff_delay)
        
        # Retry the download
        return self.download_page(url, retry_count + 1)

    def download_batch(
        self,
        urls: List[Tuple[int, str]],
        output_dir: Path,
        skip_existing: bool = True,
        progress_file: Optional[Path] = None,
        force: bool = False
    ) -> Dict:
        """
        Download multiple pages with progress tracking and resume capability
        
        Args:
            urls: List of tuples (test_number, url) to download
            output_dir: Directory where JSON files will be saved
            skip_existing: Skip tests that already have JSON output files
            progress_file: Path to progress tracking file (optional)
            force: Force reprocessing of existing files
            
        Returns:
            Summary dictionary with download statistics
        """
        # Log crawler start time and test range (Requirement 9.1)
        start_time = datetime.now()
        if urls:
            test_numbers = [test_num for test_num, _ in urls]
            min_test = min(test_numbers)
            max_test = max(test_numbers)
            logger.info("=" * 70)
            logger.info(f"CRAWLER START - {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
            logger.info(f"Test range: {min_test} to {max_test} ({len(urls)} tests)")
            logger.info("=" * 70)
        
        # Initialize progress tracker
        if progress_file:
            progress = CrawlProgress(progress_file)
            progress.load()
        else:
            progress = CrawlProgress(Path("crawler_progress.json"))
        
        progress.total_tests = len(urls)
        progress.save()
        
        # Track results
        downloaded_pages: Dict[int, str] = {}
        
        logger.info(f"Starting batch download of {len(urls)} tests")
        logger.info(f"Output directory: {output_dir}")
        logger.info(f"Skip existing: {skip_existing}, Force: {force}")
        
        # Create progress bar
        with tqdm(total=len(urls), desc="Downloading tests") as pbar:
            for test_number, url in urls:
                try:
                    # Update progress bar description
                    pbar.set_description(f"Test {test_number}")
                    
                    # Check if output file already exists
                    if skip_existing and not force:
                        output_file = self._get_output_filename(output_dir, test_number)
                        if output_file.exists():
                            logger.debug(f"Skipping test {test_number} (already exists)")
                            progress.mark_skipped(test_number)
                            pbar.update(1)
                            continue
                    
                    # Download the page (Requirement 9.2: Log each download attempt and status)
                    logger.info(f"Downloading test {test_number}: {url}")
                    html_content = self.download_page(url)
                    
                    if html_content is None:
                        logger.warning(f"Failed to download test {test_number} after all retry attempts")
                        progress.mark_failed(test_number)
                        pbar.update(1)
                        continue
                    
                    logger.info(f"Successfully downloaded test {test_number} ({len(html_content)} bytes)")
                    
                    # Store the downloaded content
                    downloaded_pages[test_number] = html_content
                    progress.mark_completed(test_number)
                    
                    # Update progress bar
                    pbar.update(1)
                    pbar.set_postfix({
                        'completed': progress.completed,
                        'failed': progress.failed,
                        'skipped': progress.skipped
                    })
                    
                    # Rate limiting delay (except for last request)
                    if test_number != urls[-1][0]:
                        time.sleep(self.delay)
                    
                except KeyboardInterrupt:
                    logger.warning("Download interrupted by user")
                    progress.save()
                    raise
                    
                except Exception as e:
                    # Log errors with test number, section, and stack trace (Requirement 9.4)
                    logger.error(
                        f"Error processing test {test_number}: {e}",
                        exc_info=True,
                        extra={'test_number': test_number, 'section': 'download'}
                    )
                    progress.mark_failed(test_number)
                    pbar.update(1)
        
        # Generate summary
        summary = progress.get_summary()
        summary['downloaded_pages'] = len(downloaded_pages)
        
        # Log completion time and duration (Requirement 9.6)
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        summary['start_time'] = start_time.isoformat()
        summary['end_time'] = end_time.isoformat()
        summary['duration_seconds'] = duration
        
        logger.info("=" * 70)
        logger.info(f"CRAWLER COMPLETE - {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Duration: {duration:.2f} seconds ({duration/60:.2f} minutes)")
        logger.info("=" * 70)
        
        # Log summary
        self._log_summary(summary)
        
        return {
            'summary': summary,
            'downloaded_pages': downloaded_pages
        }
    
    def _get_output_filename(self, output_dir: Path, test_number: int) -> Path:
        """
        Get the expected output filename for a test
        
        Args:
            output_dir: Output directory
            test_number: Test number
            
        Returns:
            Path to expected JSON output file
        """
        # Format test number with leading zeros for 1-99
        if test_number < 100:
            num_str = f"{test_number:02d}"
        else:
            num_str = str(test_number)
        
        filename = f"parsed_ielts-reading-practice-test-{num_str}-with-answers.json"
        return output_dir / filename
    
    def _log_summary(self, summary: Dict) -> None:
        """
        Log download summary
        
        Args:
            summary: Summary dictionary
        """
        logger.info("=" * 70)
        logger.info("Download Complete!")
        logger.info(f"Total tests: {summary['total_tests']}")
        logger.info(f"Successfully downloaded: {summary['completed']}")
        logger.info(f"Failed: {summary['failed']}")
        logger.info(f"Skipped: {summary['skipped']}")
        logger.info(f"Duration: {summary['duration_seconds']:.2f} seconds")
        
        if summary.get('failed_tests'):
            logger.info(f"Failed test numbers: {summary['failed_tests']}")
        
        logger.info("=" * 70)
