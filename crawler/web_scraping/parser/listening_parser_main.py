#!/usr/bin/env python3
"""
Main Orchestration Script for Listening Test Crawler and Parser

This script wires together all components to provide a complete solution for:
- Crawling listening tests from ieltstrainingonline.com
- Parsing HTML to extract audio, questions, and answers
- Validating content quality
- Generating structured JSON output

Usage:
    python -m web_scraping.parser.listening_parser_main --start 1 --end 50
    python -m web_scraping.parser.listening_parser_main --test 5
    python -m web_scraping.parser.listening_parser_main --all --force

Requirements: 5.1, 5.6
"""

import argparse
import json
import sys
import time
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from bs4 import BeautifulSoup

# Import all components
try:
    from .url_generator import URLGenerator
    from .html_crawler import HTMLCrawler, CrawlProgress
    from .listening_section_detector import ListeningSectionDetector
    from .listening_audio_extractor import ListeningAudioExtractor
    from .listening_question_extractor import ListeningQuestionExtractor
    from .listening_answer_extractor import ListeningAnswerExtractor
    from .listening_json_generator import ListeningJSONGenerator
    from .listening_validator import ListeningValidator
    from .logging_config import setup_logging, get_logger
    from .exceptions import ParserError, HTMLParsingError, ContentExtractionError, AnswerExtractionError
    from .listening_models import Section
except ImportError:
    from url_generator import URLGenerator
    from html_crawler import HTMLCrawler, CrawlProgress
    from listening_section_detector import ListeningSectionDetector
    from listening_audio_extractor import ListeningAudioExtractor
    from listening_question_extractor import ListeningQuestionExtractor
    from listening_answer_extractor import ListeningAnswerExtractor
    from listening_json_generator import ListeningJSONGenerator
    from listening_validator import ListeningValidator
    from logging_config import setup_logging, get_logger
    from exceptions import ParserError, HTMLParsingError, ContentExtractionError, AnswerExtractionError
    from listening_models import Section

logger = get_logger(__name__)


class ListeningURLGenerator:
    """
    URL Generator for IELTS Listening Tests.
    
    Extends URLGenerator with listening-specific URL patterns.
    Requirements: 5.1, 5.2
    """
    
    BASE_URL = "https://ieltstrainingonline.com"
    LISTENING_PRACTICE_PATTERN = "/ielts-listening-practice-test-{num}/"
    
    @staticmethod
    def generate_listening_url(test_number: int) -> str:
        """
        Generate URL for a single listening practice test.
        
        Args:
            test_number: Test number (1-50)
            
        Returns:
            Full URL string
            
        Raises:
            ValueError: If test_number is not in valid range
            
        Examples:
            >>> ListeningURLGenerator.generate_listening_url(5)
            'https://ieltstrainingonline.com/ielts-listening-practice-test-05/'
            >>> ListeningURLGenerator.generate_listening_url(50)
            'https://ieltstrainingonline.com/ielts-listening-practice-test-50/'
        
        Requirements: 5.1, 5.2
        """
        if not 1 <= test_number <= 50:
            raise ValueError(f"Test number must be between 1 and 50, got {test_number}")
        
        # Format with leading zeros for 01-09
        formatted_num = f"{test_number:02d}"
        
        path = ListeningURLGenerator.LISTENING_PRACTICE_PATTERN.format(num=formatted_num)
        return ListeningURLGenerator.BASE_URL + path
    
    @staticmethod
    def generate_url_batch(start: int, end: int) -> List[str]:
        """
        Generate URLs for a range of listening practice tests.
        
        Args:
            start: Starting test number (inclusive)
            end: Ending test number (inclusive)
            
        Returns:
            List of URL strings
            
        Raises:
            ValueError: If start or end are not in valid range, or if start > end
        """
        if not 1 <= start <= 50:
            raise ValueError(f"Start test number must be between 1 and 50, got {start}")
        if not 1 <= end <= 50:
            raise ValueError(f"End test number must be between 1 and 50, got {end}")
        if start > end:
            raise ValueError(f"Start ({start}) must be less than or equal to end ({end})")
        
        urls = []
        for test_num in range(start, end + 1):
            urls.append(ListeningURLGenerator.generate_listening_url(test_num))
        
        return urls
    
    @staticmethod
    def generate_all_listening_urls() -> List[str]:
        """
        Generate URLs for all listening practice tests (1-50).
        
        Returns:
            List of 50 URL strings
            
        Examples:
            >>> urls = ListeningURLGenerator.generate_all_listening_urls()
            >>> len(urls)
            50
        """
        return ListeningURLGenerator.generate_url_batch(1, 50)


class ListeningTestParser:
    """
    Main orchestrator for listening test crawling and parsing.
    
    This class coordinates all components to provide a complete pipeline:
    1. URL Generation
    2. HTML Crawling
    3. Content Extraction (Audio, Questions, Answers)
    4. Content Validation
    5. JSON Generation
    
    Requirements: 5.3, 5.4, 5.5, 5.6
    """
    
    def __init__(
        self,
        output_dir: str = "web_scraping/parsed/listening/practice",
        media_dir: str = "web_scraping/media",
        delay: float = 0.35,
        timeout: int = 30,
        max_retries: int = 3
    ):
        """
        Initialize the listening test parser.
        
        Args:
            output_dir: Directory for JSON output files
            media_dir: Directory for downloaded audio files
            delay: Delay between requests in seconds
            timeout: Request timeout in seconds
            max_retries: Maximum retry attempts for failed requests
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.media_dir = Path(media_dir)
        self.media_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize all components
        self.url_generator = ListeningURLGenerator()
        self.crawler = HTMLCrawler(delay=delay, timeout=timeout, max_retries=max_retries)
        self.section_detector = ListeningSectionDetector()
        self.audio_extractor = ListeningAudioExtractor(output_dir=str(media_dir))
        self.question_extractor = ListeningQuestionExtractor()
        self.answer_extractor = ListeningAnswerExtractor()
        self.json_generator = ListeningJSONGenerator()
        self.validator = ListeningValidator()
        
        logger.info(f"ListeningTestParser initialized (output_dir={output_dir}, media_dir={media_dir})")
    
    def parse_single_test(
        self,
        test_number: int,
        html_content: str,
        url: str,
        download_media: bool = True,
        skip_validation: bool = False
    ) -> Optional[Dict[str, Any]]:
        """
        Parse a single listening test from HTML content.
        
        Args:
            test_number: Test number (1-50)
            html_content: HTML content of the test page
            url: Source URL
            download_media: Whether to download audio files
            skip_validation: Skip content validation
            
        Returns:
            Dictionary with parsed test data, or None if parsing failed
            
        Requirements: 5.3, 5.4
        """
        try:
            logger.info(f"Parsing test {test_number}")
            
            # Parse HTML with BeautifulSoup
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Step 1 & 2: Detect sections using row-based detection
            sections_dict = self.section_detector.detect_sections_by_rows(soup)
            if not sections_dict or len(sections_dict) != 4:
                logger.error(f"Test {test_number}: Expected 4 sections, found {len(sections_dict) if sections_dict else 0}")
                return None
            
            logger.info(f"Test {test_number}: Found {len(sections_dict)} sections")
            
            # Step 3: Extract audio and questions for each section
            sections = []
            question_blocks = []
            
            for section_num in sorted(sections_dict.keys()):
                section_data = sections_dict[section_num]
                audio_row = section_data.get('audio_row')
                question_row = section_data.get('question_row')
                
                # Extract audio information
                audio_info = self.audio_extractor.extract_audio_from_row(audio_row, section_num)
                
                # Download audio file if requested
                audio_file_path = None
                if download_media and audio_info.get('audio_url'):
                    audio_file_path = self.audio_extractor.download_audio_file(
                        audio_info['audio_url'],
                        test_number,
                        section_num
                    )
                    if not audio_file_path:
                        logger.warning(f"Test {test_number}: Failed to download audio for section {section_num}")
                elif audio_info.get('audio_url'):
                    # Store URL even if not downloading
                    audio_file_path = audio_info['audio_url']
                
                # Create Section object
                section = Section(
                    section_number=section_num,
                    title=audio_info.get('section_title', f'SECTION {section_num}'),
                    audio_file_path=audio_file_path,
                    question_range=((section_num - 1) * 10 + 1, section_num * 10),
                    context=None
                )
                sections.append(section)
                logger.info(f"Test {test_number}: Section {section_num} - {section.title}, audio={bool(audio_file_path)}")
                
                # Extract questions from question row
                if question_row:
                    questions = self.question_extractor.extract_questions_from_row(
                        question_row,
                        section_num
                    )
                    question_blocks.extend(questions)
                else:
                    logger.warning(f"Test {test_number}: No question row found for section {section_num}")
            
            # Step 4: Extract answers from row 11
            main_section = soup.find('div', class_=lambda c: c and 'et_pb_section_0' in c.split())
            answer_row = self.section_detector._find_row_by_index(main_section, 11) if main_section else None
            if not answer_row:
                logger.error(f"Test {test_number}: Could not find answer row (row 11)")
                return None
            
            # Extract answers
            answer_dicts = self.section_detector.extract_answers_from_row(answer_row)
            logger.info(f"Test {test_number}: Extracted {len(answer_dicts)} answers")
            
            # Step 5: Validate extracted data
            validation_result = self._validate_extraction(sections, question_blocks, answer_dicts)
            
            if not validation_result['is_valid']:
                logger.warning(f"Test {test_number}: Validation failed with {len(validation_result['errors'])} errors")
                for error in validation_result['errors']:
                    logger.warning(f"  - {error}")
            else:
                logger.info(f"Test {test_number}: Validation passed")
            
            # Step 6: Generate structured JSON output
            metadata = {
                "source_url": url,
                "test_name": f"Listening Practice Test {test_number:02d}",
                "test_type": "listening",
                "test_number": test_number,
                "crawl_date": datetime.now().isoformat(),
                "total_questions": 40,
                "total_sections": 4
            }
            
            result = self._generate_json_output(
                metadata=metadata,
                sections=sections,
                question_blocks=question_blocks,
                answers=answer_dicts,
                validation=validation_result
            )
            
            logger.info(f"Test {test_number}: Successfully parsed")
            return result
            
        except Exception as e:
            logger.error(f"Test {test_number}: Unexpected error during parsing: {e}", exc_info=True)
            return None
    
    def process_test(
        self,
        test_number: int,
        force: bool = False,
        download_media: bool = True,
        skip_validation: bool = False,
        retry_count: int = 0
    ) -> bool:
        """
        Process a single test: download, parse, and save with retry logic.
        
        Args:
            test_number: Test number (1-50)
            force: Force reprocessing even if output exists
            download_media: Whether to download audio files
            skip_validation: Skip content validation
            retry_count: Current retry attempt (used internally)
            
        Returns:
            True if successful, False otherwise
            
        Requirements: 5.3, 5.4, 7.4
        """
        try:
            # Check if output already exists
            output_path = self.output_dir / f"listening_test_{test_number:02d}.json"
            
            if output_path.exists() and not force:
                logger.info(f"Test {test_number}: Output already exists, skipping")
                return True
            
            # Generate URL
            url = self.url_generator.generate_listening_url(test_number)
            
            # Download HTML (crawler has its own retry logic)
            logger.info(f"Test {test_number}: Downloading from {url}")
            html_content = self.crawler.download_page(url)
            
            if html_content is None:
                logger.error(f"Test {test_number}: Failed to download after all retries")
                return False
            
            # Parse test
            json_data = self.parse_single_test(
                test_number=test_number,
                html_content=html_content,
                url=url,
                download_media=download_media,
                skip_validation=skip_validation
            )
            
            if json_data is None:
                logger.error(f"Test {test_number}: Failed to parse")
                return False
            
            # Save JSON
            self.json_generator.save_to_file(json_data, str(output_path))
            logger.info(f"Test {test_number}: Successfully saved to {output_path}")
            
            return True
            
        except Exception as e:
            logger.error(
                f"Test {test_number}: Error during processing (attempt {retry_count + 1}/{self.crawler.max_retries + 1}): {e}",
                exc_info=True,
                extra={'test_number': test_number, 'retry_count': retry_count}
            )
            
            # Retry logic with exponential backoff
            if retry_count < self.crawler.max_retries:
                backoff_delay = 1.0 * (2 ** retry_count)
                logger.info(f"Test {test_number}: Retrying in {backoff_delay:.2f}s... (attempt {retry_count + 2}/{self.crawler.max_retries + 1})")
                time.sleep(backoff_delay)
                return self.process_test(
                    test_number=test_number,
                    force=force,
                    download_media=download_media,
                    skip_validation=skip_validation,
                    retry_count=retry_count + 1
                )
            else:
                logger.error(f"Test {test_number}: Max retries ({self.crawler.max_retries}) exceeded")
                return False
    
    def process_batch(
        self,
        start: int,
        end: int,
        force: bool = False,
        download_media: bool = True,
        skip_validation: bool = False,
        progress_file: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process a batch of tests with comprehensive error handling and retry logic.
        
        Args:
            start: Starting test number (inclusive)
            end: Ending test number (inclusive)
            force: Force reprocessing even if output exists
            download_media: Whether to download audio files
            skip_validation: Skip content validation
            progress_file: Path to progress tracking file
            
        Returns:
            Summary dictionary with processing statistics
            
        Requirements: 5.3, 5.4, 5.5, 5.6, 7.4, 7.5, 7.6
        """
        logger.info("=" * 70)
        logger.info(f"BATCH PROCESSING START - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Processing tests {start} to {end} ({end - start + 1} tests)")
        logger.info("=" * 70)
        
        start_time = datetime.now()
        
        # Initialize progress tracking for parsing phase
        progress_path = Path(progress_file) if progress_file else Path("listening_parser_progress.json")
        parse_progress = self._load_progress(progress_path)
        
        # Generate URLs
        urls = [(i, self.url_generator.generate_listening_url(i)) for i in range(start, end + 1)]
        
        # Download all pages (crawler has its own retry logic)
        download_progress_path = Path(progress_file) if progress_file else Path("crawler_progress.json")
        download_result = self.crawler.download_batch(
            urls=urls,
            output_dir=self.output_dir,
            skip_existing=not force,
            progress_file=download_progress_path,
            force=force
        )
        
        downloaded_pages = download_result['downloaded_pages']
        
        # Parse and save each downloaded page with retry logic
        successful = 0
        failed = 0
        skipped = 0
        error_details = []  # Track detailed error information
        
        for test_number in range(start, end + 1):
            # Check progress file before processing (skip already processed tests unless --force)
            output_path = self.output_dir / f"listening_test_{test_number:02d}.json"
            
            if not force and test_number in parse_progress.get('completed_tests', []):
                if output_path.exists():
                    logger.debug(f"Test {test_number}: Already processed (in progress file), skipping")
                    skipped += 1
                    continue
            
            # Check if we have downloaded content
            if test_number not in downloaded_pages:
                # Check if output already exists
                if output_path.exists() and not force:
                    logger.debug(f"Test {test_number}: Already processed, skipping")
                    skipped += 1
                    continue
                else:
                    error_msg = f"Test {test_number}: Not downloaded and no existing output"
                    logger.warning(error_msg)
                    failed += 1
                    error_details.append({
                        'test_number': test_number,
                        'error_type': 'download_failed',
                        'error_message': error_msg
                    })
                    self._update_progress(parse_progress, progress_path, test_number, 'failed')
                    continue
            
            # Process test with retry logic
            success = self._process_test_with_retry(
                test_number=test_number,
                html_content=downloaded_pages[test_number],
                output_path=output_path,
                download_media=download_media,
                skip_validation=skip_validation,
                parse_progress=parse_progress,
                progress_path=progress_path,
                error_details=error_details
            )
            
            if success:
                successful += 1
            else:
                failed += 1
        
        # Calculate duration
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Create comprehensive summary report
        failed_test_numbers = parse_progress.get('failed_tests', [])
        completed_test_numbers = parse_progress.get('completed_tests', [])
        
        summary = {
            'start_time': start_time.isoformat(),
            'end_time': end_time.isoformat(),
            'duration_seconds': duration,
            'duration_minutes': duration / 60,
            'test_range': f"{start}-{end}",
            'total_tests': end - start + 1,
            'successful': successful,
            'failed': failed,
            'skipped': skipped,
            'success_rate': (successful / (end - start + 1)) * 100 if (end - start + 1) > 0 else 0,
            'failed_test_numbers': sorted(failed_test_numbers),
            'completed_test_numbers': sorted(completed_test_numbers),
            'error_details': error_details,
            'download_summary': download_result['summary']
        }
        
        # Generate and log comprehensive summary report at end
        logger.info("=" * 70)
        logger.info(f"BATCH PROCESSING COMPLETE - {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info("=" * 70)
        logger.info(f"Duration: {duration:.2f} seconds ({duration/60:.2f} minutes)")
        logger.info(f"Test range: {start} to {end}")
        logger.info(f"Total tests: {summary['total_tests']}")
        logger.info(f"Successful: {successful}")
        logger.info(f"Failed: {failed}")
        logger.info(f"Skipped: {skipped}")
        logger.info(f"Success rate: {summary['success_rate']:.1f}%")
        
        if failed_test_numbers:
            logger.warning(f"Failed test numbers: {failed_test_numbers}")
        
        if successful > 0:
            logger.info(f"Successfully processed tests: {completed_test_numbers}")
        
        logger.info("=" * 70)
        
        # Save summary report to file
        self._save_summary_report(summary, start, end)
        
        return summary
    
    def _process_test_with_retry(
        self,
        test_number: int,
        html_content: str,
        output_path: Path,
        download_media: bool,
        skip_validation: bool,
        parse_progress: Dict,
        progress_path: Path,
        error_details: List[Dict],
        max_retries: int = 3
    ) -> bool:
        """
        Process a single test with retry logic and exponential backoff.
        
        Args:
            test_number: Test number to process
            html_content: Downloaded HTML content
            output_path: Path to save JSON output
            download_media: Whether to download audio files
            skip_validation: Skip content validation
            parse_progress: Progress tracking dictionary
            progress_path: Path to progress file
            error_details: List to append error details to
            max_retries: Maximum number of retry attempts
            
        Returns:
            True if successful, False otherwise
            
        Requirements: 5.4, 7.4, 7.5
        """
        url = self.url_generator.generate_listening_url(test_number)
        
        for attempt in range(max_retries):
            try:
                # Parse the test
                json_data = self.parse_single_test(
                    test_number=test_number,
                    html_content=html_content,
                    url=url,
                    download_media=download_media,
                    skip_validation=skip_validation
                )
                
                if json_data is None:
                    error_msg = f"Test {test_number}: Parsing returned None (attempt {attempt + 1}/{max_retries})"
                    logger.error(error_msg)
                    
                    if attempt < max_retries - 1:
                        # Retry with exponential backoff
                        backoff_delay = 1.0 * (2 ** attempt)
                        logger.info(f"Test {test_number}: Retrying in {backoff_delay:.2f}s...")
                        time.sleep(backoff_delay)
                        continue
                    else:
                        # Max retries exceeded
                        error_details.append({
                            'test_number': test_number,
                            'error_type': 'parsing_failed',
                            'error_message': 'Parsing returned None after all retries',
                            'attempts': max_retries
                        })
                        self._update_progress(parse_progress, progress_path, test_number, 'failed')
                        return False
                
                # Save JSON
                self.json_generator.save_to_file(json_data, str(output_path))
                
                logger.info(f"Test {test_number}: Successfully processed")
                
                # Save progress to JSON file after each test
                self._update_progress(parse_progress, progress_path, test_number, 'completed')
                
                return True
                
            except Exception as e:
                error_msg = f"Test {test_number}: Error during processing (attempt {attempt + 1}/{max_retries}): {e}"
                logger.error(error_msg, exc_info=True)
                
                if attempt < max_retries - 1:
                    # Retry with exponential backoff
                    backoff_delay = 1.0 * (2 ** attempt)
                    logger.info(f"Test {test_number}: Retrying in {backoff_delay:.2f}s...")
                    time.sleep(backoff_delay)
                    continue
                else:
                    # Max retries exceeded - log error with test number and details
                    error_details.append({
                        'test_number': test_number,
                        'error_type': type(e).__name__,
                        'error_message': str(e),
                        'attempts': max_retries
                    })
                    self._update_progress(parse_progress, progress_path, test_number, 'failed')
                    logger.error(f"Test {test_number}: Max retries ({max_retries}) exceeded")
                    return False
        
        return False
    
    def _load_progress(self, progress_file: Path) -> Dict[str, Any]:
        """
        Load progress from JSON file.
        
        Args:
            progress_file: Path to progress file
            
        Returns:
            Progress dictionary with completed_tests and failed_tests lists
        """
        if not progress_file.exists():
            return {
                'completed_tests': [],
                'failed_tests': [],
                'last_update': None
            }
        
        try:
            with open(progress_file, 'r', encoding='utf-8') as f:
                progress = json.load(f)
            logger.info(f"Loaded progress: {len(progress.get('completed_tests', []))} completed, "
                       f"{len(progress.get('failed_tests', []))} failed")
            return progress
        except Exception as e:
            logger.warning(f"Failed to load progress file: {e}")
            return {
                'completed_tests': [],
                'failed_tests': [],
                'last_update': None
            }
    
    def _update_progress(
        self,
        progress: Dict[str, Any],
        progress_file: Path,
        test_number: int,
        status: str
    ) -> None:
        """
        Update and save progress to JSON file.
        
        Args:
            progress: Progress dictionary
            progress_file: Path to progress file
            test_number: Test number that was processed
            status: Status ('completed' or 'failed')
        """
        try:
            if status == 'completed':
                if test_number not in progress['completed_tests']:
                    progress['completed_tests'].append(test_number)
                # Remove from failed if it was there
                if test_number in progress.get('failed_tests', []):
                    progress['failed_tests'].remove(test_number)
            elif status == 'failed':
                if test_number not in progress.get('failed_tests', []):
                    if 'failed_tests' not in progress:
                        progress['failed_tests'] = []
                    progress['failed_tests'].append(test_number)
            
            progress['last_update'] = datetime.now().isoformat()
            
            # Ensure directory exists
            progress_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(progress_file, 'w', encoding='utf-8') as f:
                json.dump(progress, f, indent=2)
                
        except Exception as e:
            logger.error(f"Failed to save progress: {e}")
    
    def _save_summary_report(
        self,
        summary: Dict[str, Any],
        start: int,
        end: int
    ) -> None:
        """
        Save comprehensive summary report to file.
        
        Args:
            summary: Summary dictionary with processing statistics
            start: Starting test number
            end: Ending test number
            
        Requirements: 7.6
        """
        try:
            # Create reports directory
            reports_dir = Path("reports")
            reports_dir.mkdir(parents=True, exist_ok=True)
            
            # Generate filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            report_file = reports_dir / f"listening_batch_summary_{start}_{end}_{timestamp}.json"
            
            # Add additional metadata
            report = {
                **summary,
                'report_generated': datetime.now().isoformat(),
                'report_type': 'listening_batch_processing',
                'parser_version': '2.0'
            }
            
            # Save report
            with open(report_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Summary report saved to: {report_file}")
            
        except Exception as e:
            logger.error(f"Failed to save summary report: {e}", exc_info=True)
    
    def _validate_extraction(
        self,
        sections: List[Section],
        question_blocks: List[Dict],
        answers: List[Dict]
    ) -> Dict:
        """
        Validate extracted data for completeness and correctness.
        
        Requirements: 7.1, 7.2, 7.3, 7.4
        """
        validation = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'section_count': len(sections),
            'question_block_count': len(question_blocks),
            'answer_count': len(answers)
        }
        
        # Validate section count
        if len(sections) != 4:
            validation['is_valid'] = False
            validation['errors'].append(f"Expected 4 sections, found {len(sections)}")
        
        # Validate question blocks
        if len(question_blocks) != 4:
            validation['warnings'].append(f"Expected 4 question blocks, found {len(question_blocks)}")
        
        # Validate answer count
        if len(answers) != 40:
            validation['is_valid'] = False
            validation['errors'].append(f"Expected 40 answers, found {len(answers)}")
        
        # Validate question number ranges per section
        for section in sections:
            start_q, end_q = section.question_range
            expected_start = (section.section_number - 1) * 10 + 1
            expected_end = section.section_number * 10
            
            if start_q != expected_start or end_q != expected_end:
                validation['warnings'].append(
                    f"Section {section.section_number} has unexpected range {start_q}-{end_q}, "
                    f"expected {expected_start}-{expected_end}"
                )
        
        # Validate answers are sequential
        # Handle both dict and ListeningAnswer objects
        answer_numbers = []
        for a in answers:
            if isinstance(a, dict):
                answer_numbers.append(a['question_number'])
            else:
                answer_numbers.append(a.question_number)
        if answer_numbers:
            sorted_numbers = sorted(answer_numbers)
            expected_range = list(range(1, 41))
            
            if sorted_numbers != expected_range:
                missing = set(expected_range) - set(sorted_numbers)
                if missing:
                    validation['is_valid'] = False
                    validation['errors'].append(f"Missing answer numbers: {sorted(missing)}")
                
                duplicates = [num for num in set(answer_numbers) if answer_numbers.count(num) > 1]
                if duplicates:
                    validation['is_valid'] = False
                    validation['errors'].append(f"Duplicate answer numbers: {duplicates}")
        
        return validation
    
    def _generate_json_output(
        self,
        metadata: Dict,
        sections: List[Section],
        question_blocks: List[Dict],
        answers: List,
        validation: Dict
    ) -> Dict:
        """Generate structured JSON output."""
        # Convert answers to dicts if they are ListeningAnswer objects
        answers_list = []
        for a in answers:
            if isinstance(a, dict):
                answers_list.append(a)
            else:
                # ListeningAnswer has: question_number, correct_answer, acceptable_alternatives
                section_num = (a.question_number - 1) // 10 + 1
                answers_list.append({
                    "question_number": a.question_number,
                    "answer_text": a.correct_answer,
                    "section_number": section_num
                })
        
        return {
            "test_metadata": metadata,
            "sections": [
                {
                    "section_number": s.section_number,
                    "title": s.title,
                    "audio_file_path": s.audio_file_path,
                    "question_range": list(s.question_range),
                    "context": s.context
                } for s in sections
            ],
            "questions": question_blocks,
            "answers": answers_list,
            "validation": validation
        }


def main():
    """
    Command-line interface for the listening test parser.
    
    Provides options for:
    - Processing single tests
    - Processing test ranges
    - Processing all tests
    
    Requirements: 5.1, 5.6
    """
    parser = argparse.ArgumentParser(
        description="IELTS Listening Test Crawler and Parser",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process a single test
  python -m web_scraping.parser.listening_parser_main --test 5
  
  # Process a range of tests
  python -m web_scraping.parser.listening_parser_main --start 1 --end 10
  
  # Process all tests
  python -m web_scraping.parser.listening_parser_main --all
  
  # Force reprocess existing tests
  python -m web_scraping.parser.listening_parser_main --start 1 --end 10 --force
  
  # Skip audio downloads (faster, for testing)
  python -m web_scraping.parser.listening_parser_main --start 1 --end 5 --no-media
  
  # Verbose logging
  python -m web_scraping.parser.listening_parser_main --start 1 --end 10 --verbose
        """
    )
    
    # Test selection arguments
    test_group = parser.add_mutually_exclusive_group(required=True)
    test_group.add_argument(
        '--test',
        type=int,
        metavar='N',
        help='Process a single test number (1-50)'
    )
    test_group.add_argument(
        '--start',
        type=int,
        metavar='N',
        help='Starting test number (use with --end)'
    )
    test_group.add_argument(
        '--all',
        action='store_true',
        help='Process all tests (1-50)'
    )
    
    parser.add_argument(
        '--end',
        type=int,
        metavar='N',
        help='Ending test number (use with --start)'
    )
    
    # Processing options
    parser.add_argument(
        '--force',
        action='store_true',
        help='Force reprocessing of existing tests'
    )
    parser.add_argument(
        '--no-media',
        action='store_true',
        help='Skip audio file downloads (faster, for testing)'
    )
    parser.add_argument(
        '--skip-validation',
        action='store_true',
        help='Skip content validation'
    )
    
    # Output options
    parser.add_argument(
        '--output-dir',
        type=str,
        default='web_scraping/parsed/listening/practice',
        help='Output directory for JSON files (default: parsed/listening/practice)'
    )
    parser.add_argument(
        '--media-dir',
        type=str,
        default='web_scraping/media',
        help='Directory for audio files (default: web_scraping/media)'
    )
    parser.add_argument(
        '--progress-file',
        type=str,
        default='listening_crawler_progress.json',
        help='Progress tracking file (default: listening_crawler_progress.json)'
    )
    
    # Crawler options
    parser.add_argument(
        '--delay',
        type=float,
        default=0.35,
        help='Delay between requests in seconds (default: 0.35)'
    )
    parser.add_argument(
        '--timeout',
        type=int,
        default=30,
        help='Request timeout in seconds (default: 30)'
    )
    parser.add_argument(
        '--max-retries',
        type=int,
        default=3,
        help='Maximum retry attempts (default: 3)'
    )
    
    # Logging options
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose (DEBUG) logging'
    )
    parser.add_argument(
        '--log-dir',
        type=str,
        default='logs',
        help='Log directory (default: logs)'
    )
    parser.add_argument(
        '--no-file-logging',
        action='store_true',
        help='Disable file logging (console only)'
    )
    
    args = parser.parse_args()
    
    # Validate arguments
    if args.start and not args.end:
        parser.error("--start requires --end")
    if args.end and not args.start:
        parser.error("--end requires --start")
    
    # Setup logging
    log_level = 'DEBUG' if args.verbose else 'INFO'
    import logging
    setup_logging(
        log_level=getattr(logging, log_level),
        log_dir=args.log_dir,
        enable_file_logging=not args.no_file_logging
    )
    
    logger.info("=" * 70)
    logger.info("IELTS Listening Test Crawler and Parser")
    logger.info("=" * 70)
    
    # Initialize parser
    test_parser = ListeningTestParser(
        output_dir=args.output_dir,
        media_dir=args.media_dir,
        delay=args.delay,
        timeout=args.timeout,
        max_retries=args.max_retries
    )
    
    try:
        # Determine test range
        if args.test:
            # Single test
            logger.info(f"Processing single test: {args.test}")
            success = test_parser.process_test(
                test_number=args.test,
                force=args.force,
                download_media=not args.no_media,
                skip_validation=args.skip_validation
            )
            
            if success:
                logger.info("Processing completed successfully")
                return 0
            else:
                logger.error("Processing failed")
                return 1
                
        elif args.all:
            # All tests
            start, end = 1, 50
            logger.info(f"Processing all tests: {start} to {end}")
            
        else:
            # Range of tests
            start, end = args.start, args.end
            logger.info(f"Processing test range: {start} to {end}")
        
        # Process batch
        summary = test_parser.process_batch(
            start=start,
            end=end,
            force=args.force,
            download_media=not args.no_media,
            skip_validation=args.skip_validation,
            progress_file=args.progress_file
        )
        
        # Check results
        if summary['failed'] == 0:
            logger.info("All tests processed successfully")
            return 0
        elif summary['successful'] > 0:
            logger.warning(f"Completed with {summary['failed']} failures")
            return 1
        else:
            logger.error("All tests failed")
            return 1
            
    except KeyboardInterrupt:
        logger.warning("Processing interrupted by user")
        return 130
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        return 1


if __name__ == '__main__':
    sys.exit(main())
