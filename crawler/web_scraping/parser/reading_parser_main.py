#!/usr/bin/env python3
"""
Main Orchestration Script for Reading Test Crawler and Parser

This script wires together all components to provide a complete solution for:
- Crawling reading tests from ieltstrainingonline.com
- Parsing HTML to extract passages and answers
- Validating content quality
- Generating structured JSON output

Usage:
    python -m web_scraping.parser.reading_parser_main --start 1 --end 111
    python -m web_scraping.parser.reading_parser_main --test 105
    python -m web_scraping.parser.reading_parser_main --start 1 --end 10 --force

Requirements: All requirements integrated (Task 10)
"""

import argparse
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from bs4 import BeautifulSoup

# Import all components
try:
    from .url_generator import URLGenerator
    from .html_crawler import HTMLCrawler, CrawlProgress
    from .reading_passage_extractor import ReadingPassageExtractor
    from .reading_answer_extractor import ReadingAnswerExtractor
    from .html_sanitizer import HTMLSanitizer
    from .reading_json_generator import ReadingJSONGenerator
    from .content_validator import ContentValidator
    from .logging_config import setup_logging, get_logger
    from .exceptions import ParserError, HTMLParsingError, ContentExtractionError, AnswerExtractionError
except ImportError:
    from url_generator import URLGenerator
    from html_crawler import HTMLCrawler, CrawlProgress
    from reading_passage_extractor import ReadingPassageExtractor
    from reading_answer_extractor import ReadingAnswerExtractor
    from html_sanitizer import HTMLSanitizer
    from reading_json_generator import ReadingJSONGenerator
    from content_validator import ContentValidator
    from logging_config import setup_logging, get_logger
    from exceptions import ParserError, HTMLParsingError, ContentExtractionError, AnswerExtractionError

logger = get_logger(__name__)


class ReadingTestParser:
    """
    Main orchestrator for reading test crawling and parsing.
    
    This class coordinates all components to provide a complete pipeline:
    1. URL Generation
    2. HTML Crawling
    3. Content Extraction (Passages and Answers)
    4. HTML Sanitization
    5. Content Validation
    6. JSON Generation
    """
    
    def __init__(
        self,
        output_dir: str = "web_scraping/parsed/reading/practice",
        delay: float = 0.35,
        timeout: int = 30,
        max_retries: int = 3
    ):
        """
        Initialize the reading test parser.
        
        Args:
            output_dir: Directory for JSON output files
            delay: Delay between requests in seconds
            timeout: Request timeout in seconds
            max_retries: Maximum retry attempts for failed requests
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize all components
        self.url_generator = URLGenerator()
        self.crawler = HTMLCrawler(delay=delay, timeout=timeout, max_retries=max_retries)
        self.sanitizer = HTMLSanitizer()
        self.json_generator = ReadingJSONGenerator()
        self.validator = ContentValidator()
        
        logger.info(f"ReadingTestParser initialized (output_dir={output_dir})")
    
    def parse_single_test(
        self,
        test_number: int,
        html_content: str,
        url: str,
        skip_validation: bool = False
    ) -> Optional[Dict[str, Any]]:
        """
        Parse a single reading test from HTML content.
        
        Args:
            test_number: Test number (1-111)
            html_content: HTML content of the test page
            url: Source URL
            skip_validation: Skip content validation
            
        Returns:
            Dictionary with parsed test data, or None if parsing failed
        """
        try:
            logger.info(f"Parsing test {test_number}")
            
            # Parse HTML with BeautifulSoup
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Extract passages
            passage_extractor = ReadingPassageExtractor(base_url=url)
            try:
                passages = passage_extractor.extract_passages_with_fallback(soup)
                logger.info(f"Test {test_number}: Extracted {len(passages)} passages")
            except (HTMLParsingError, ContentExtractionError) as e:
                logger.error(f"Test {test_number}: Failed to extract passages: {e}")
                return None
            
            # Extract answers
            answer_extractor = ReadingAnswerExtractor()
            try:
                answers = answer_extractor.extract_answers(soup)
                logger.info(f"Test {test_number}: Extracted answers")
            except AnswerExtractionError as e:
                logger.error(f"Test {test_number}: Failed to extract answers: {e}")
                return None
            
            # Sanitize HTML content
            logger.debug(f"Test {test_number}: Sanitizing HTML content")
            for passage in passages:
                passage.content = self.sanitizer.sanitize(passage.content, url)
            
            # Sanitize answer content
            answers.passage1_answers = self.sanitizer.sanitize(answers.passage1_answers, url)
            answers.passage2_answers = self.sanitizer.sanitize(answers.passage2_answers, url)
            answers.passage3_answers = self.sanitizer.sanitize(answers.passage3_answers, url)
            
            # Generate JSON structure
            json_data = self.json_generator.generate_json(
                url=url,
                test_number=test_number,
                passages=passages,
                answers=answers,
                test_type="practice"
            )
            
            # Validate content (optional)
            if not skip_validation:
                validation_result = self.validator.validate_reading_test(
                    json_data,
                    test_number=test_number
                )
                
                if not validation_result.is_valid:
                    logger.warning(
                        f"Test {test_number}: Validation failed with {len(validation_result.errors)} errors"
                    )
                    for error in validation_result.errors:
                        logger.warning(f"  - {error}")
                else:
                    logger.info(
                        f"Test {test_number}: Validation passed (score: {validation_result.quality_score:.2f})"
                    )
            
            return json_data
            
        except Exception as e:
            logger.error(f"Test {test_number}: Unexpected error during parsing: {e}", exc_info=True)
            return None
    
    def process_test(
        self,
        test_number: int,
        force: bool = False,
        skip_validation: bool = False
    ) -> bool:
        """
        Process a single test: download, parse, and save.
        
        Args:
            test_number: Test number (1-111)
            force: Force reprocessing even if output exists
            skip_validation: Skip content validation
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Check if output already exists
            output_path = self.json_generator.generate_output_path(
                test_number,
                test_type="practice",
                base_dir=str(self.output_dir.parent)
            )
            
            if Path(output_path).exists() and not force:
                logger.info(f"Test {test_number}: Output already exists, skipping")
                return True
            
            # Generate URL
            url = self.url_generator.generate_practice_url(test_number)
            
            # Download HTML
            logger.info(f"Test {test_number}: Downloading from {url}")
            html_content = self.crawler.download_page(url)
            
            if html_content is None:
                logger.error(f"Test {test_number}: Failed to download")
                return False
            
            # Parse test
            json_data = self.parse_single_test(
                test_number=test_number,
                html_content=html_content,
                url=url,
                skip_validation=skip_validation
            )
            
            if json_data is None:
                logger.error(f"Test {test_number}: Failed to parse")
                return False
            
            # Save JSON
            self.json_generator.save_json(json_data, output_path)
            logger.info(f"Test {test_number}: Successfully saved to {output_path}")
            
            return True
            
        except Exception as e:
            logger.error(f"Test {test_number}: Error during processing: {e}", exc_info=True)
            return False
    
    def process_batch(
        self,
        start: int,
        end: int,
        force: bool = False,
        skip_validation: bool = False,
        progress_file: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process a batch of tests.
        
        Args:
            start: Starting test number (inclusive)
            end: Ending test number (inclusive)
            force: Force reprocessing even if output exists
            skip_validation: Skip content validation
            progress_file: Path to progress tracking file
            
        Returns:
            Summary dictionary with processing statistics
        """
        logger.info("=" * 70)
        logger.info(f"BATCH PROCESSING START - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Processing tests {start} to {end} ({end - start + 1} tests)")
        logger.info("=" * 70)
        
        start_time = datetime.now()
        
        # Generate URLs
        urls = [(i, self.url_generator.generate_practice_url(i)) for i in range(start, end + 1)]
        
        # Download all pages
        progress_path = Path(progress_file) if progress_file else Path("crawler_progress.json")
        download_result = self.crawler.download_batch(
            urls=urls,
            output_dir=self.output_dir,
            skip_existing=not force,
            progress_file=progress_path,
            force=force
        )
        
        downloaded_pages = download_result['downloaded_pages']
        
        # Parse and save each downloaded page
        successful = 0
        failed = 0
        skipped = 0
        validation_results = []
        
        for test_number in range(start, end + 1):
            try:
                # Check if we have downloaded content
                if test_number not in downloaded_pages:
                    # Check if output already exists
                    output_path = self.json_generator.generate_output_path(
                        test_number,
                        test_type="practice",
                        base_dir=str(self.output_dir.parent)
                    )
                    
                    if Path(output_path).exists():
                        logger.debug(f"Test {test_number}: Already processed, skipping")
                        skipped += 1
                        continue
                    else:
                        logger.warning(f"Test {test_number}: Not downloaded and no existing output")
                        failed += 1
                        continue
                
                # Parse the test
                html_content = downloaded_pages[test_number]
                url = self.url_generator.generate_practice_url(test_number)
                
                json_data = self.parse_single_test(
                    test_number=test_number,
                    html_content=html_content,
                    url=url,
                    skip_validation=skip_validation
                )
                
                if json_data is None:
                    logger.error(f"Test {test_number}: Parsing failed")
                    failed += 1
                    continue
                
                # Save JSON
                output_path = self.json_generator.generate_output_path(
                    test_number,
                    test_type="practice",
                    base_dir=str(self.output_dir.parent)
                )
                self.json_generator.save_json(json_data, output_path)
                
                # Validate if not skipped
                if not skip_validation:
                    validation_result = self.validator.validate_reading_test(
                        json_data,
                        test_number=test_number
                    )
                    validation_results.append(validation_result)
                
                successful += 1
                logger.info(f"Test {test_number}: Successfully processed")
                
            except Exception as e:
                logger.error(f"Test {test_number}: Error during processing: {e}", exc_info=True)
                failed += 1
        
        # Generate validation summary if we have results
        if validation_results:
            summary_file = self.output_dir.parent / "validation_summary.json"
            self.validator.generate_validation_summary(
                validation_results,
                output_file=str(summary_file)
            )
            logger.info(f"Validation summary saved to: {summary_file}")
        
        # Calculate duration
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Create summary
        summary = {
            'start_time': start_time.isoformat(),
            'end_time': end_time.isoformat(),
            'duration_seconds': duration,
            'test_range': f"{start}-{end}",
            'total_tests': end - start + 1,
            'successful': successful,
            'failed': failed,
            'skipped': skipped,
            'download_summary': download_result['summary']
        }
        
        # Log final summary
        logger.info("=" * 70)
        logger.info(f"BATCH PROCESSING COMPLETE - {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Duration: {duration:.2f} seconds ({duration/60:.2f} minutes)")
        logger.info(f"Total tests: {summary['total_tests']}")
        logger.info(f"Successful: {successful}")
        logger.info(f"Failed: {failed}")
        logger.info(f"Skipped: {skipped}")
        logger.info("=" * 70)
        
        return summary


def main():
    """
    Command-line interface for the reading test parser.
    
    Provides subcommands for:
    - Processing single tests
    - Processing test ranges
    - Processing all tests
    """
    parser = argparse.ArgumentParser(
        description="IELTS Reading Test Crawler and Parser",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process a single test
  python -m web_scraping.parser.reading_parser_main --test 105
  
  # Process a range of tests
  python -m web_scraping.parser.reading_parser_main --start 1 --end 10
  
  # Process all tests
  python -m web_scraping.parser.reading_parser_main --all
  
  # Force reprocess existing tests
  python -m web_scraping.parser.reading_parser_main --start 1 --end 10 --force
  
  # Verbose logging
  python -m web_scraping.parser.reading_parser_main --start 1 --end 10 --verbose
        """
    )
    
    # Test selection arguments
    test_group = parser.add_mutually_exclusive_group(required=True)
    test_group.add_argument(
        '--test',
        type=int,
        metavar='N',
        help='Process a single test number (1-111)'
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
        help='Process all tests (1-111)'
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
        '--skip-validation',
        action='store_true',
        help='Skip content validation'
    )
    
    # Output options
    parser.add_argument(
        '--output-dir',
        type=str,
        default='web_scraping/parsed/reading/practice',
        help='Output directory for JSON files (default: parsed/reading/practice)'
    )
    parser.add_argument(
        '--progress-file',
        type=str,
        default='reading_crawler_progress.json',
        help='Progress tracking file (default: reading_crawler_progress.json)'
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
    logger.info("IELTS Reading Test Crawler and Parser")
    logger.info("=" * 70)
    
    # Initialize parser
    test_parser = ReadingTestParser(
        output_dir=args.output_dir,
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
            start, end = 1, 111
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
