#!/usr/bin/env python3
"""
Main Orchestration Script for Speaking Test Crawler and Parser

This script crawls IELTS speaking tests from ieltstrainingonline.com,
extracts Part 1, Part 2, and Part 3 content with questions and sample answers separately.

Usage:
    python -m web_scraping.parser.speaking_parser_main --start 1 --end 24
    python -m web_scraping.parser.speaking_parser_main --test 5
    python -m web_scraping.parser.speaking_parser_main --all --force
"""

import argparse
import json
import sys
import re
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
from bs4 import BeautifulSoup

# Import components
try:
    from .html_crawler import HTMLCrawler
    from .html_sanitizer import HTMLSanitizer
    from .logging_config import setup_logging, get_logger
except ImportError:
    from html_crawler import HTMLCrawler
    from html_sanitizer import HTMLSanitizer
    from logging_config import setup_logging, get_logger

logger = get_logger(__name__)


class SpeakingURLGenerator:
    """URL Generator for IELTS Speaking Tests."""
    
    BASE_URL = "https://ieltstrainingonline.com"
    SPEAKING_PRACTICE_PATTERN = "/ielts-speaking-practice-test-{num}/"
    
    @staticmethod
    def generate_speaking_url(test_number: int) -> str:
        if not 1 <= test_number <= 24:
            raise ValueError(f"Test number must be between 1 and 24, got {test_number}")
        formatted_num = f"{test_number:02d}"
        path = SpeakingURLGenerator.SPEAKING_PRACTICE_PATTERN.format(num=formatted_num)
        return SpeakingURLGenerator.BASE_URL + path
    
    @staticmethod
    def generate_url_batch(start: int, end: int) -> List[str]:
        if not 1 <= start <= 24:
            raise ValueError(f"Start must be between 1 and 24, got {start}")
        if not 1 <= end <= 24:
            raise ValueError(f"End must be between 1 and 24, got {end}")
        if start > end:
            raise ValueError(f"Start ({start}) must be <= end ({end})")
        return [SpeakingURLGenerator.generate_speaking_url(i) for i in range(start, end + 1)]


class SpeakingPartExtractor:
    """Extracts speaking part content from HTML using DOM structure."""
    
    def __init__(self):
        self.sanitizer = HTMLSanitizer()
    
    def extract_parts(self, soup: BeautifulSoup, url: str) -> List[Dict[str, Any]]:
        """Extract all 3 parts from the speaking test."""
        parts = []
        
        # Find section 0
        section0 = soup.find('div', class_=lambda c: c and 'et_pb_section_0' in c.split())
        if not section0:
            logger.warning("Could not find section_0")
            return parts
        
        # Get first 3 rows (Part 1, 2, 3)
        rows = section0.find_all('div', class_=lambda c: c and 'et_pb_row' in str(c), recursive=False)
        
        for i, row in enumerate(rows[:3]):
            part_num = i + 1
            part_data = self._extract_part_from_html(row, part_num, url)
            parts.append(part_data)
            logger.info(f"Part {part_num}: Extracted {len(part_data.get('questions', []))} questions")
        
        return parts
    
    def _extract_part_from_html(self, row, part_num: int, url: str) -> Dict[str, Any]:
        """Extract a single part's content by parsing HTML structure."""
        part_data = {
            "part_number": part_num,
            "title": f"Part {part_num}",
            "topic": "",
            "questions": [],
            "sample_answer": "",
            "content_html": self.sanitizer.sanitize(str(row), url),
            "content_text": self._get_text(row)
        }
        
        # Set titles
        titles = {
            1: "Part 1 - Introduction & Interview",
            2: "Part 2 - Cue Card", 
            3: "Part 3 - Discussion"
        }
        part_data["title"] = titles.get(part_num, f"Part {part_num}")
        
        # Find all paragraph and heading elements
        elements = row.find_all(['p', 'h3', 'h4'])
        
        # Extract topic from first h4 after "Part X"
        for el in elements:
            text = self._get_text(el)
            if text and not text.lower().startswith('part'):
                # Check if it's a topic (usually short, no question mark)
                if len(text) < 50 and '?' not in text and not self._is_question(text):
                    if not part_data["topic"]:
                        part_data["topic"] = text
                    break
        
        # Extract Q&A pairs by looking at the structure
        if part_num == 2:
            self._extract_part2_structured(row, part_data)
        else:
            self._extract_qa_structured(row, part_data)
        
        return part_data
    
    def _extract_qa_structured(self, row, part_data: Dict):
        """Extract Q&A by parsing HTML structure.
        
        Key insight: Questions are in <strong>Question?</strong> format
        where the <strong> tag contains ONLY the question (ends with ?).
        Idioms/vocab are <strong> tags WITHIN answer text, not standalone.
        Questions can be in <p>, <h3>, or <h4> elements.
        """
        text_div = row.find('div', class_='et_pb_text_inner')
        if not text_div:
            return
        
        # Get all direct children (p, h3, h4 elements)
        elements = []
        for child in text_div.children:
            if child.name in ['p', 'h3', 'h4']:
                elements.append(child)
        
        current_question = None
        current_answer_parts = []
        topics = []  # Track topic headers to exclude from answers
        
        for element in elements:
            element_text = self._get_text(element)
            
            # Skip empty elements
            if not element_text or len(element_text.strip()) < 3:
                continue
            
            # Check for topic headers (h4 with b/strong tag, short text without ?)
            if element.name == 'h4':
                b_tag = element.find(['b', 'strong'])
                if b_tag:
                    topic_text = self._get_text(b_tag)
                    if topic_text and '?' not in topic_text and len(topic_text) < 50:
                        topics.append(topic_text)
                        if not part_data["topic"]:
                            part_data["topic"] = topic_text
                        continue
            
            # Skip "Part X" headers (but not questions in h3)
            if element.name == 'h3' and element_text.lower().startswith('part ') and '?' not in element_text:
                continue
            
            # Check if this element contains a question
            # A question has <strong> containing "?" at the start of the element
            strong_tags = element.find_all('strong')
            
            is_question_element = False
            question_text = None
            answer_in_same_element = None
            
            if strong_tags:
                first_strong = strong_tags[0]
                first_strong_text = self._get_text(first_strong)
                
                # Check if this strong tag is a question (contains ?)
                if '?' in first_strong_text:
                    # Verify it's at the beginning of the element
                    if element_text.startswith(first_strong_text.split('?')[0]):
                        is_question_element = True
                        question_text = first_strong_text.strip()
                        
                        # Check if there's answer text after the question in the same element
                        # This happens when question and answer are in the same <h3> tag
                        remaining_text = element_text[len(question_text):].strip()
                        if remaining_text and len(remaining_text) > 10:
                            answer_in_same_element = remaining_text
            
            if is_question_element:
                # Save previous Q&A
                if current_question and current_answer_parts:
                    answer = ' '.join(current_answer_parts).strip()
                    # Clean up answer - remove leading question if duplicated
                    if answer.startswith(current_question):
                        answer = answer[len(current_question):].strip()
                    if len(answer) > 10:
                        part_data["questions"].append({
                            "question": current_question,
                            "sample_answer": answer
                        })
                
                current_question = question_text
                current_answer_parts = []
                
                # Add answer from same element if present
                if answer_in_same_element:
                    current_answer_parts.append(answer_in_same_element)
            else:
                # This is an answer element (or topic header)
                if current_question:
                    # Skip if it's a topic header
                    if element_text not in topics:
                        current_answer_parts.append(element_text)
        
        # Save the last Q&A
        if current_question and current_answer_parts:
            answer = ' '.join(current_answer_parts).strip()
            if answer.startswith(current_question):
                answer = answer[len(current_question):].strip()
            if len(answer) > 10:
                part_data["questions"].append({
                    "question": current_question,
                    "sample_answer": answer
                })
    
    def _extract_part2_structured(self, row, part_data: Dict):
        """Extract Part 2 cue card content."""
        text_div = row.find('div', class_='et_pb_text_inner')
        if not text_div:
            return
        
        full_text = self._get_text(text_div)
        
        # Find "Describe" topic
        describe_match = re.search(r'(Describe\s+[^•\n]+?)(?=\s*[•\-]|\s*You should)', full_text, re.IGNORECASE)
        if describe_match:
            part_data["topic"] = describe_match.group(1).strip()
        
        # Extract cue points (bullet points)
        cue_points = []
        bullet_pattern = r'[•\-]\s*([^•\-\n]+?)(?=[•\-]|And\s+|$)'
        bullets = re.findall(bullet_pattern, full_text)
        for bullet in bullets:
            bullet = bullet.strip()
            if len(bullet) > 3:
                cue_points.append(bullet)
        
        # Also look for "You should say:" followed by items
        should_say_match = re.search(r'You should say[:\s]*(.+?)(?=And explain|And describe|$)', full_text, re.IGNORECASE | re.DOTALL)
        if should_say_match and not cue_points:
            items = re.split(r'[•\-]', should_say_match.group(1))
            cue_points = [item.strip() for item in items if item.strip() and len(item.strip()) > 3]
        
        # Find sample answer - everything after cue points that looks like a response
        answer_patterns = [
            r'(?:Well,|Let me|I would like|I\'d like|I want to|Actually,|To be honest,|Honestly,)[^$]+',
            r'(?:The [a-z]+ I|One [a-z]+ that|A [a-z]+ that)[^$]+'
        ]
        
        for pattern in answer_patterns:
            answer_match = re.search(pattern, full_text, re.IGNORECASE)
            if answer_match:
                part_data["sample_answer"] = answer_match.group(0).strip()
                break
        
        # Create the cue card question
        if part_data["topic"]:
            part_data["questions"].append({
                "question": part_data["topic"],
                "cue_points": cue_points[:6] if cue_points else [],
                "sample_answer": part_data["sample_answer"]
            })
    
    def _is_question(self, text: str) -> bool:
        """Check if text is a question."""
        if not text:
            return False
        text = text.strip()
        if '?' not in text:
            return False
        # Check if it starts with question words
        question_starters = ['do', 'does', 'did', 'is', 'are', 'was', 'were', 'have', 'has', 'had',
                           'can', 'could', 'will', 'would', 'should', 'what', 'where', 'when', 
                           'why', 'how', 'which', 'who', 'whom', 'whose']
        first_word = text.split()[0].lower() if text.split() else ''
        return first_word in question_starters
    
    def _get_text(self, element) -> str:
        """Get clean text from element."""
        if element is None:
            return ""
        text = element.get_text(separator=' ', strip=True)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()


class SpeakingJSONGenerator:
    """Generates JSON output for speaking tests."""
    
    def generate_json(self, url: str, test_number: int, parts: List[Dict]) -> Dict[str, Any]:
        return {
            "test_metadata": {
                "source_url": url,
                "test_name": f"Speaking Practice Test {test_number:02d}",
                "test_type": "speaking",
                "test_number": test_number,
                "crawl_date": datetime.now().isoformat(),
                "total_parts": 3
            },
            "parts": parts,
            "validation": {
                "is_valid": len(parts) == 3,
                "parts_count": len(parts),
                "has_questions": all(len(p.get("questions", [])) > 0 for p in parts)
            }
        }
    
    def save_to_file(self, data: Dict[str, Any], filepath: str) -> None:
        path = Path(filepath)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved JSON to {filepath}")


class SpeakingTestParser:
    """Main orchestrator for speaking test crawling and parsing."""
    
    def __init__(
        self,
        output_dir: str = "web_scraping/parsed/speaking/practice",
        delay: float = 0.35,
        timeout: int = 30,
        max_retries: int = 3
    ):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.url_generator = SpeakingURLGenerator()
        self.crawler = HTMLCrawler(delay=delay, timeout=timeout, max_retries=max_retries)
        self.part_extractor = SpeakingPartExtractor()
        self.json_generator = SpeakingJSONGenerator()
        
        logger.info(f"SpeakingTestParser initialized (output_dir={output_dir})")

    def parse_single_test(self, test_number: int, html_content: str, url: str) -> Optional[Dict[str, Any]]:
        """Parse a single speaking test from HTML content."""
        try:
            logger.info(f"Parsing speaking test {test_number}")
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Extract all parts
            parts = self.part_extractor.extract_parts(soup, url)
            
            # Generate JSON
            json_data = self.json_generator.generate_json(url=url, test_number=test_number, parts=parts)
            
            logger.info(f"Test {test_number}: Successfully parsed {len(parts)} parts")
            return json_data
            
        except Exception as e:
            logger.error(f"Test {test_number}: Error during parsing: {e}", exc_info=True)
            return None
    
    def process_test(self, test_number: int, force: bool = False) -> bool:
        """Process a single test: download, parse, and save."""
        try:
            output_path = self.output_dir / f"speaking_test_{test_number:02d}.json"
            
            if output_path.exists() and not force:
                logger.info(f"Test {test_number}: Output already exists, skipping")
                return True
            
            url = self.url_generator.generate_speaking_url(test_number)
            
            logger.info(f"Test {test_number}: Downloading from {url}")
            html_content = self.crawler.download_page(url)
            
            if html_content is None:
                logger.error(f"Test {test_number}: Failed to download")
                return False
            
            json_data = self.parse_single_test(test_number=test_number, html_content=html_content, url=url)
            
            if json_data is None:
                logger.error(f"Test {test_number}: Failed to parse")
                return False
            
            self.json_generator.save_to_file(json_data, str(output_path))
            logger.info(f"Test {test_number}: Successfully saved to {output_path}")
            
            return True
            
        except Exception as e:
            logger.error(f"Test {test_number}: Error during processing: {e}", exc_info=True)
            return False
    
    def process_batch(self, start: int, end: int, force: bool = False, progress_file: Optional[str] = None) -> Dict[str, Any]:
        """Process a batch of speaking tests."""
        logger.info("=" * 70)
        logger.info(f"BATCH PROCESSING START - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Processing speaking tests {start} to {end} ({end - start + 1} tests)")
        logger.info("=" * 70)
        
        start_time = datetime.now()
        
        # Generate URLs
        urls = [(i, self.url_generator.generate_speaking_url(i)) for i in range(start, end + 1)]
        
        # Download all pages
        progress_path = Path(progress_file) if progress_file else Path("speaking_crawler_progress.json")
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
            output_path = self.output_dir / f"speaking_test_{test_number:02d}.json"
            
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
            url = self.url_generator.generate_speaking_url(test_number)
            
            json_data = self.parse_single_test(test_number=test_number, html_content=html_content, url=url)
            
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
    """Command-line interface for the speaking test parser."""
    parser = argparse.ArgumentParser(
        description="IELTS Speaking Test Crawler and Parser",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m web_scraping.parser.speaking_parser_main --test 5
  python -m web_scraping.parser.speaking_parser_main --start 1 --end 10
  python -m web_scraping.parser.speaking_parser_main --all
  python -m web_scraping.parser.speaking_parser_main --all --force
        """
    )
    
    test_group = parser.add_mutually_exclusive_group(required=True)
    test_group.add_argument('--test', type=int, metavar='N', help='Process a single test (1-24)')
    test_group.add_argument('--start', type=int, metavar='N', help='Starting test number')
    test_group.add_argument('--all', action='store_true', help='Process all tests (1-24)')
    
    parser.add_argument('--end', type=int, metavar='N', help='Ending test number')
    parser.add_argument('--force', action='store_true', help='Force reprocessing')
    parser.add_argument('--output-dir', type=str, default='web_scraping/parsed/speaking/practice', help='Output directory')
    parser.add_argument('--progress-file', type=str, default='speaking_crawler_progress.json', help='Progress tracking file')
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
    setup_logging(log_level=getattr(logging, log_level), log_dir=args.log_dir, enable_file_logging=not args.no_file_logging)
    
    logger.info("=" * 70)
    logger.info("IELTS Speaking Test Crawler and Parser")
    logger.info("=" * 70)
    
    test_parser = SpeakingTestParser(
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
            start, end = 1, 24
            logger.info(f"Processing all tests: {start} to {end}")
        else:
            start, end = args.start, args.end
            logger.info(f"Processing test range: {start} to {end}")
        
        summary = test_parser.process_batch(start=start, end=end, force=args.force, progress_file=args.progress_file)
        
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
