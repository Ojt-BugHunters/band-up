#!/usr/bin/env python3
"""
Main Orchestration Script for Writing Test Crawler and Parser

This script crawls IELTS writing tests from ieltstrainingonline.com,
extracts Task 1 and Task 2 content, and generates structured JSON output.

Usage:
    python -m web_scraping.parser.writing_parser_main --start 1 --end 50
    python -m web_scraping.parser.writing_parser_main --test 5
    python -m web_scraping.parser.writing_parser_main --all --force
"""

import argparse
import json
import sys
import time
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from bs4 import BeautifulSoup

# Import components
try:
    from .html_crawler import HTMLCrawler, CrawlProgress
    from .html_sanitizer import HTMLSanitizer
    from .logging_config import setup_logging, get_logger
    from .exceptions import ParserError, HTMLParsingError, ContentExtractionError
except ImportError:
    from html_crawler import HTMLCrawler, CrawlProgress
    from html_sanitizer import HTMLSanitizer
    from logging_config import setup_logging, get_logger
    from exceptions import ParserError, HTMLParsingError, ContentExtractionError

logger = get_logger(__name__)


class WritingURLGenerator:
    """URL Generator for IELTS Writing Tests."""
    
    BASE_URL = "https://ieltstrainingonline.com"
    WRITING_PRACTICE_PATTERN = "/ielts-writing-practice-test-{num}/"
    
    @staticmethod
    def generate_writing_url(test_number: int) -> str:
        """
        Generate URL for a single writing practice test.
        
        Args:
            test_number: Test number (1-50)
            
        Returns:
            Full URL string
        """
        if not 1 <= test_number <= 50:
            raise ValueError(f"Test number must be between 1 and 50, got {test_number}")
        
        formatted_num = f"{test_number:02d}"
        path = WritingURLGenerator.WRITING_PRACTICE_PATTERN.format(num=formatted_num)
        return WritingURLGenerator.BASE_URL + path
    
    @staticmethod
    def generate_url_batch(start: int, end: int) -> List[str]:
        """Generate URLs for a range of writing practice tests."""
        if not 1 <= start <= 50:
            raise ValueError(f"Start must be between 1 and 50, got {start}")
        if not 1 <= end <= 50:
            raise ValueError(f"End must be between 1 and 50, got {end}")
        if start > end:
            raise ValueError(f"Start ({start}) must be <= end ({end})")
        
        return [WritingURLGenerator.generate_writing_url(i) for i in range(start, end + 1)]


class WritingTaskExtractor:
    """Extracts writing task content from HTML."""
    
    def __init__(self):
        self.sanitizer = HTMLSanitizer()
    
    def extract_task1(self, soup: BeautifulSoup, url: str) -> Dict[str, Any]:
        """
        Extract Task 1 content from section 0.
        
        Task 1 is in div class="et_pb_section et_pb_section_0 et_section_regular"
        """
        task1_data = {
            "task_number": 1,
            "title": "Writing Task 1",
            "instruction": "",
            "content_html": "",
            "content_text": "",
            "images": []
        }
        
        # Find section 0 (Task 1)
        section0 = soup.find('div', class_=lambda c: c and 'et_pb_section_0' in c.split() and 'et_section_regular' in c.split())
        
        if not section0:
            # Try alternative selector
            sections = soup.find_all('div', class_=lambda c: c and 'et_pb_section' in str(c))
            if sections:
                section0 = sections[0]
        
        if not section0:
            logger.warning("Could not find Task 1 section (section_0)")
            return task1_data
        
        # Extract all text content
        task1_data["content_html"] = self.sanitizer.sanitize(str(section0), url)
        task1_data["content_text"] = self._extract_text(section0)
        
        # Extract images
        images = section0.find_all('img')
        for img in images:
            src = img.get('src', '')
            if src:
                task1_data["images"].append(src)
        
        # Try to extract instruction
        task1_data["instruction"] = self._extract_instruction(section0, task_num=1)
        
        logger.info(f"Task 1: Extracted {len(task1_data['content_text'])} chars, {len(task1_data['images'])} images")
        return task1_data
    
    def extract_task2(self, soup: BeautifulSoup, url: str) -> Dict[str, Any]:
        """
        Extract Task 2 content from section 1.
        
        Task 2 is in div class="et_pb_section et_pb_section_1 et_section_regular"
        We only need et_pb_row_3 and et_pb_row_4 for question and instruction.
        """
        task2_data = {
            "task_number": 2,
            "title": "Writing Task 2",
            "instruction": "",
            "content_html": "",
            "content_text": "",
            "question": ""
        }
        
        # Find section 1 (Task 2)
        section1 = soup.find('div', class_=lambda c: c and 'et_pb_section_1' in c.split() and 'et_section_regular' in c.split())
        
        if not section1:
            sections = soup.find_all('div', class_=lambda c: c and 'et_pb_section' in str(c))
            if len(sections) > 1:
                section1 = sections[1]
        
        if not section1:
            logger.warning("Could not find Task 2 section (section_1)")
            return task2_data
        
        # Extract row_3 and row_4 specifically
        row3 = section1.find('div', class_=lambda c: c and 'et_pb_row_3' in c.split())
        row4 = section1.find('div', class_=lambda c: c and 'et_pb_row_4' in c.split())
        
        combined_html = ""
        combined_text = ""
        
        if row3:
            combined_html += str(row3)
            combined_text += self._extract_text(row3) + "\n\n"
        
        if row4:
            combined_html += str(row4)
            combined_text += self._extract_text(row4)
        
        # If specific rows not found, fall back to entire section
        if not row3 and not row4:
            logger.warning("Could not find row_3 or row_4, using entire section_1")
            combined_html = str(section1)
            combined_text = self._extract_text(section1)
        
        task2_data["content_html"] = self.sanitizer.sanitize(combined_html, url)
        task2_data["content_text"] = combined_text.strip()
        
        # Extract instruction and question
        task2_data["instruction"] = self._extract_instruction(section1, task_num=2)
        task2_data["question"] = self._extract_question(combined_text)
        
        logger.info(f"Task 2: Extracted {len(task2_data['content_text'])} chars")
        return task2_data
    
    def _extract_text(self, element) -> str:
        """Extract clean text from HTML element."""
        if element is None:
            return ""
        text = element.get_text(separator=' ', strip=True)
        # Clean up multiple spaces
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def _extract_instruction(self, section, task_num: int) -> str:
        """Extract instruction text from section."""
        instruction = ""
        
        # Look for common instruction patterns
        text = self._extract_text(section)
        
        if task_num == 1:
            # Task 1 instructions typically mention "20 minutes", "150 words"
            patterns = [
                r'You should spend about 20 minutes.*?(?=\n|$)',
                r'Write at least 150 words.*?(?=\n|$)',
                r'Summarise the information.*?(?=\n|$)',
            ]
        else:
            # Task 2 instructions typically mention "40 minutes", "250 words"
            patterns = [
                r'You should spend about 40 minutes.*?(?=\n|$)',
                r'Write at least 250 words.*?(?=\n|$)',
                r'Give reasons for your answer.*?(?=\n|$)',
            ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                instruction = match.group(0).strip()
                break
        
        return instruction
    
    def _extract_question(self, text: str) -> str:
        """Extract the main question/topic from Task 2."""
        # Look for essay question patterns
        lines = text.split('.')
        question_lines = []
        
        for line in lines:
            line = line.strip()
            # Skip instruction lines
            if any(skip in line.lower() for skip in ['spend about', 'write at least', 'give reasons']):
                continue
            if len(line) > 30:  # Likely a question/topic
                question_lines.append(line)
        
        return '. '.join(question_lines[:3]) if question_lines else ""


class WritingJSONGenerator:
    """Generates JSON output for writing tests."""
    
    def generate_json(
        self,
        url: str,
        test_number: int,
        task1: Dict[str, Any],
        task2: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate structured JSON for a writing test."""
        return {
            "test_metadata": {
                "source_url": url,
                "test_name": f"Writing Practice Test {test_number:02d}",
                "test_type": "writing",
                "test_number": test_number,
                "crawl_date": datetime.now().isoformat(),
                "total_tasks": 2
            },
            "tasks": [task1, task2],
            "validation": {
                "is_valid": bool(task1.get("content_text") and task2.get("content_text")),
                "task1_has_content": bool(task1.get("content_text")),
                "task2_has_content": bool(task2.get("content_text")),
                "task1_has_images": len(task1.get("images", [])) > 0
            }
        }
    
    def save_to_file(self, data: Dict[str, Any], filepath: str) -> None:
        """Save JSON data to file."""
        path = Path(filepath)
        path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved JSON to {filepath}")


class WritingTestParser:
    """Main orchestrator for writing test crawling and parsing."""
    
    def __init__(
        self,
        output_dir: str = "web_scraping/parsed/writing/practice",
        delay: float = 0.35,
        timeout: int = 30,
        max_retries: int = 3
    ):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.url_generator = WritingURLGenerator()
        self.crawler = HTMLCrawler(delay=delay, timeout=timeout, max_retries=max_retries)
        self.task_extractor = WritingTaskExtractor()
        self.json_generator = WritingJSONGenerator()
        
        logger.info(f"WritingTestParser initialized (output_dir={output_dir})")

    def parse_single_test(
        self,
        test_number: int,
        html_content: str,
        url: str
    ) -> Optional[Dict[str, Any]]:
        """Parse a single writing test from HTML content."""
        try:
            logger.info(f"Parsing writing test {test_number}")
            
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Extract Task 1
            task1 = self.task_extractor.extract_task1(soup, url)
            
            # Extract Task 2
            task2 = self.task_extractor.extract_task2(soup, url)
            
            # Generate JSON
            json_data = self.json_generator.generate_json(
                url=url,
                test_number=test_number,
                task1=task1,
                task2=task2
            )
            
            logger.info(f"Test {test_number}: Successfully parsed")
            return json_data
            
        except Exception as e:
            logger.error(f"Test {test_number}: Error during parsing: {e}", exc_info=True)
            return None
    
    def process_test(
        self,
        test_number: int,
        force: bool = False
    ) -> bool:
        """Process a single test: download, parse, and save."""
        try:
            output_path = self.output_dir / f"writing_test_{test_number:02d}.json"
            
            if output_path.exists() and not force:
                logger.info(f"Test {test_number}: Output already exists, skipping")
                return True
            
            url = self.url_generator.generate_writing_url(test_number)
            
            logger.info(f"Test {test_number}: Downloading from {url}")
            html_content = self.crawler.download_page(url)
            
            if html_content is None:
                logger.error(f"Test {test_number}: Failed to download")
                return False
            
            json_data = self.parse_single_test(
                test_number=test_number,
                html_content=html_content,
                url=url
            )
            
            if json_data is None:
                logger.error(f"Test {test_number}: Failed to parse")
                return False
            
            self.json_generator.save_to_file(json_data, str(output_path))
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
        progress_file: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process a batch of writing tests."""
        logger.info("=" * 70)
        logger.info(f"BATCH PROCESSING START - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Processing writing tests {start} to {end} ({end - start + 1} tests)")
        logger.info("=" * 70)
        
        start_time = datetime.now()
        
        # Generate URLs
        urls = [(i, self.url_generator.generate_writing_url(i)) for i in range(start, end + 1)]
        
        # Download all pages
        progress_path = Path(progress_file) if progress_file else Path("writing_crawler_progress.json")
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
        
        for test_number in range(start, end + 1):
            output_path = self.output_dir / f"writing_test_{test_number:02d}.json"
            
            if test_number not in downloaded_pages:
                if output_path.exists() and not force:
                    logger.debug(f"Test {test_number}: Already processed, skipping")
                    skipped += 1
                    continue
                else:
                    logger.warning(f"Test {test_number}: Not downloaded and no existing output")
                    failed += 1
                    continue
            
            html_content = downloaded_pages[test_number]
            url = self.url_generator.generate_writing_url(test_number)
            
            json_data = self.parse_single_test(
                test_number=test_number,
                html_content=html_content,
                url=url
            )
            
            if json_data is None:
                logger.error(f"Test {test_number}: Parsing failed")
                failed += 1
                continue
            
            self.json_generator.save_to_file(json_data, str(output_path))
            successful += 1
            logger.info(f"Test {test_number}: Successfully processed")
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
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
        
        logger.info("=" * 70)
        logger.info(f"BATCH PROCESSING COMPLETE - {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Duration: {duration:.2f} seconds ({duration/60:.2f} minutes)")
        logger.info(f"Total: {summary['total_tests']}, Success: {successful}, Failed: {failed}, Skipped: {skipped}")
        logger.info("=" * 70)
        
        return summary


def main():
    """Command-line interface for the writing test parser."""
    parser = argparse.ArgumentParser(
        description="IELTS Writing Test Crawler and Parser",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m web_scraping.parser.writing_parser_main --test 5
  python -m web_scraping.parser.writing_parser_main --start 1 --end 10
  python -m web_scraping.parser.writing_parser_main --all
  python -m web_scraping.parser.writing_parser_main --start 1 --end 50 --force
        """
    )
    
    test_group = parser.add_mutually_exclusive_group(required=True)
    test_group.add_argument('--test', type=int, metavar='N', help='Process a single test (1-50)')
    test_group.add_argument('--start', type=int, metavar='N', help='Starting test number')
    test_group.add_argument('--all', action='store_true', help='Process all tests (1-50)')
    
    parser.add_argument('--end', type=int, metavar='N', help='Ending test number')
    parser.add_argument('--force', action='store_true', help='Force reprocessing')
    parser.add_argument('--output-dir', type=str, default='web_scraping/parsed/writing/practice',
                        help='Output directory')
    parser.add_argument('--progress-file', type=str, default='writing_crawler_progress.json',
                        help='Progress tracking file')
    parser.add_argument('--delay', type=float, default=0.35, help='Delay between requests')
    parser.add_argument('--timeout', type=int, default=30, help='Request timeout')
    parser.add_argument('--max-retries', type=int, default=3, help='Max retry attempts')
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    parser.add_argument('--log-dir', type=str, default='logs', help='Log directory')
    parser.add_argument('--no-file-logging', action='store_true', help='Disable file logging')
    
    args = parser.parse_args()
    
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
    logger.info("IELTS Writing Test Crawler and Parser")
    logger.info("=" * 70)
    
    test_parser = WritingTestParser(
        output_dir=args.output_dir,
        delay=args.delay,
        timeout=args.timeout,
        max_retries=args.max_retries
    )
    
    try:
        if args.test:
            logger.info(f"Processing single test: {args.test}")
            success = test_parser.process_test(test_number=args.test, force=args.force)
            return 0 if success else 1
            
        elif args.all:
            start, end = 1, 50
            logger.info(f"Processing all tests: {start} to {end}")
        else:
            start, end = args.start, args.end
            logger.info(f"Processing test range: {start} to {end}")
        
        summary = test_parser.process_batch(
            start=start,
            end=end,
            force=args.force,
            progress_file=args.progress_file
        )
        
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
