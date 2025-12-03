"""
IELTS Listening Parser

This module contains the main parser for IELTS listening tests,
including the parsing pipeline and component classes.
"""

from typing import List, Dict, Optional, Tuple
from pathlib import Path
import json
import logging
import re
from bs4 import BeautifulSoup, Tag

from parser.media_downloader import MediaDownloader, MediaFile
from parser.listening_models import (
    Section,
    ListeningQuestion,
    ListeningQuestionType,
    ListeningAnswer,
    ValidationResult,
    UI_COMPONENT_MAP
)
from parser.listening_question_extractor import ListeningQuestionExtractor
from parser.listening_answer_extractor import ListeningAnswerExtractor
from parser.listening_audio_extractor import ListeningAudioExtractor
from parser.listening_row_detector import ListeningRowDetector
from parser.listening_validator import ListeningValidator
from parser.listening_json_generator import ListeningJSONGenerator
from parser.exceptions import ParserError, ContentExtractionError, AnswerExtractionError, HTMLParsingError
from parser.content_validator import ContentValidator
from parser.text_utils import TextUtils

logger = logging.getLogger(__name__)


# ============================================================================
# Question Type Classifier
# ============================================================================

class ListeningQuestionClassifier:
    """
    Classifies IELTS listening question types based on instruction text and HTML content.
    
    Supports all listening question types:
    1. Form Completion
    2. Multiple Choice (single answer)
    3. Multiple Choice (multiple answers)
    4. Matching
    5. Map/Plan/Diagram Labeling
    6. Sentence Completion
    7. Note/Summary Completion
    8. Table Completion
    9. Flow Chart Completion
    10. Short Answer
    """
    
    def classify(self, instruction_text: str, content: Optional[Tag] = None) -> ListeningQuestionType:
        """
        Classify question type based on instruction text and optional content
        
        Args:
            instruction_text: The instruction text for the question block
            content: Optional BeautifulSoup Tag containing the question content
            
        Returns:
            ListeningQuestionType enum value
        """
        if not instruction_text:
            logger.warning("Empty instruction text provided")
            return self._infer_from_content(content) if content else ListeningQuestionType.SHORT_ANSWER
        
        instruction_upper = instruction_text.upper()
        logger.debug(f"Classifying listening question type from: {instruction_text[:100]}...")
        
        # 1. FORM COMPLETION
        if self._is_form_completion(instruction_upper):
            logger.info("Classified as FORM_COMPLETION")
            return ListeningQuestionType.FORM_COMPLETION
        
        # 2. TABLE COMPLETION (check early - specific type)
        if self._is_table_completion(instruction_upper, content):
            logger.info("Classified as TABLE_COMPLETION")
            return ListeningQuestionType.TABLE_COMPLETION
        
        # 3. FLOW CHART COMPLETION (check early - specific type)
        if self._is_flow_chart_completion(instruction_upper):
            logger.info("Classified as FLOW_CHART_COMPLETION")
            return ListeningQuestionType.FLOW_CHART_COMPLETION
        
        # 4. MAP/PLAN/DIAGRAM LABELING
        if self._is_map_labeling(instruction_upper):
            logger.info("Classified as MAP_LABELING")
            return ListeningQuestionType.MAP_LABELING
        
        # 5. NOTE/SUMMARY COMPLETION
        if self._is_note_completion(instruction_upper):
            logger.info("Classified as NOTE_COMPLETION")
            return ListeningQuestionType.NOTE_COMPLETION
        
        # 6. SENTENCE COMPLETION
        if self._is_sentence_completion(instruction_upper):
            logger.info("Classified as SENTENCE_COMPLETION")
            return ListeningQuestionType.SENTENCE_COMPLETION
        
        # 7. MULTIPLE CHOICE (check for multiple answers first)
        if self._is_multiple_choice_multiple(instruction_upper):
            logger.info("Classified as MULTIPLE_CHOICE_MULTIPLE")
            return ListeningQuestionType.MULTIPLE_CHOICE_MULTIPLE
        
        # 8. MULTIPLE CHOICE (single answer)
        if self._is_multiple_choice_single(instruction_upper):
            logger.info("Classified as MULTIPLE_CHOICE_SINGLE")
            return ListeningQuestionType.MULTIPLE_CHOICE_SINGLE
        
        # 9. MATCHING
        if self._is_matching(instruction_upper):
            logger.info("Classified as MATCHING")
            return ListeningQuestionType.MATCHING
        
        # 10. SHORT ANSWER (default fallback)
        logger.info("Classified as SHORT_ANSWER (default)")
        return ListeningQuestionType.SHORT_ANSWER
    
    def _is_form_completion(self, instruction_upper: str) -> bool:
        """Check if question is Form Completion type"""
        return (
            "COMPLETE THE FORM" in instruction_upper
            or "FILL IN THE FORM" in instruction_upper
            or ("FORM" in instruction_upper and "COMPLETE" in instruction_upper)
        )
    
    def _is_table_completion(self, instruction_upper: str, content: Optional[Tag]) -> bool:
        """Check if question is Table Completion type"""
        has_table_instruction = (
            "COMPLETE THE TABLE" in instruction_upper
            or ("TABLE" in instruction_upper and "COMPLETE" in instruction_upper)
        )
        has_table_content = content and content.find("table") is not None
        
        return has_table_instruction or has_table_content
    
    def _is_flow_chart_completion(self, instruction_upper: str) -> bool:
        """Check if question is Flow Chart Completion type"""
        return (
            "FLOW" in instruction_upper
            or "FLOWCHART" in instruction_upper
            or "FLOW-CHART" in instruction_upper
            or "FLOW CHART" in instruction_upper
        )
    
    def _is_map_labeling(self, instruction_upper: str) -> bool:
        """Check if question is Map/Plan/Diagram Labeling type"""
        return (
            "LABEL" in instruction_upper
            or "MAP" in instruction_upper
            or "PLAN" in instruction_upper
            or "DIAGRAM" in instruction_upper
        )
    
    def _is_note_completion(self, instruction_upper: str) -> bool:
        """Check if question is Note/Summary Completion type"""
        return (
            "COMPLETE THE NOTE" in instruction_upper
            or "COMPLETE THE NOTES" in instruction_upper
            or "COMPLETE THE SUMMARY" in instruction_upper
            or ("NOTES" in instruction_upper and "COMPLETE" in instruction_upper)
            or ("SUMMARY" in instruction_upper and "COMPLETE" in instruction_upper)
        )
    
    def _is_sentence_completion(self, instruction_upper: str) -> bool:
        """Check if question is Sentence Completion type"""
        return (
            "COMPLETE THE SENTENCE" in instruction_upper
            or "COMPLETE THE SENTENCES" in instruction_upper
            or ("SENTENCE" in instruction_upper and "COMPLETE" in instruction_upper)
        )
    
    def _is_multiple_choice_multiple(self, instruction_upper: str) -> bool:
        """Check if question is Multiple Choice (multiple answers) type"""
        return (
            ("CHOOSE" in instruction_upper and "TWO" in instruction_upper)
            or ("CHOOSE" in instruction_upper and "THREE" in instruction_upper)
            or ("CHOOSE" in instruction_upper and "FOUR" in instruction_upper)
            or ("CHOOSE" in instruction_upper and "LETTERS" in instruction_upper)
            or "CHOOSE TWO" in instruction_upper
            or "CHOOSE THREE" in instruction_upper
            or "CHOOSE FOUR" in instruction_upper
        )
    
    def _is_multiple_choice_single(self, instruction_upper: str) -> bool:
        """Check if question is Multiple Choice (single answer) type"""
        return (
            "CHOOSE THE CORRECT LETTER" in instruction_upper
            or "CHOOSE ONE LETTER" in instruction_upper
            or "CHOOSE THE CORRECT ANSWER" in instruction_upper
            or ("CHOOSE" in instruction_upper and "LETTER" in instruction_upper and "LETTERS" not in instruction_upper)
            or "CIRCLE THE CORRECT LETTER" in instruction_upper
        )
    
    def _is_matching(self, instruction_upper: str) -> bool:
        """Check if question is Matching type"""
        return (
            "MATCH" in instruction_upper
            or ("CLASSIFY" in instruction_upper and "INFORMATION" in instruction_upper)
        )
    
    def _infer_from_content(self, content: Optional[Tag]) -> ListeningQuestionType:
        """
        Fallback method to infer question type from content structure
        
        Args:
            content: BeautifulSoup Tag containing the question content
            
        Returns:
            ListeningQuestionType enum value
        """
        if not content:
            logger.warning("Cannot infer question type: no content provided")
            return ListeningQuestionType.SHORT_ANSWER
        
        content_text = content.get_text(separator=' ').upper()
        
        # Check for table structure
        if content.find("table"):
            logger.info("Inferred TABLE_COMPLETION from table element")
            return ListeningQuestionType.TABLE_COMPLETION
        
        # Check for option lists (A, B, C, D)
        if re.search(r"[A-D][\.\):]", content_text):
            logger.info("Inferred MULTIPLE_CHOICE_SINGLE from option pattern")
            return ListeningQuestionType.MULTIPLE_CHOICE_SINGLE
        
        # Check for numbered blanks or gaps
        if re.search(r"\b\d+\b.*?_+", content_text) or re.search(r"\.{3,}", content_text):
            logger.info("Inferred completion type from blank pattern")
            return ListeningQuestionType.SENTENCE_COMPLETION
        
        logger.warning("Could not infer question type from content, defaulting to SHORT_ANSWER")
        return ListeningQuestionType.SHORT_ANSWER


# ============================================================================
# Section Detector
# ============================================================================

class SectionDetector:
    """
    Detects and extracts section information from listening test HTML.
    Listening tests have 4 sections (Section 1-4), each with 10 questions.
    """
    
    # Pattern to match section headings like "SECTION 1", "Section 2", etc.
    SECTION_PATTERN = re.compile(r'SECTION\s+([1-4])', re.IGNORECASE)
    
    def detect_sections(self, soup: BeautifulSoup) -> List[Tag]:
        """
        Detect all section headings in the HTML
        
        Args:
            soup: BeautifulSoup object of the HTML content
            
        Returns:
            List of Tag objects representing section headings (deduplicated, one per section number)
        """
        all_section_tags = []
        
        # Search through common heading tags
        for heading in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'p']):
            text = heading.get_text(separator=' ', strip=True)
            match = self.SECTION_PATTERN.search(text)
            if match:
                section_number = int(match.group(1))
                all_section_tags.append((section_number, heading))
                logger.debug(f"Found section {section_number}: {text}")
        
        # Deduplicate sections
        deduplicated_tags = self._deduplicate_sections(all_section_tags)
        
        # Ensure exactly 4 sections or log warning
        if len(deduplicated_tags) != 4:
            logger.warning(f"Expected 4 sections but found {len(deduplicated_tags)}")
        
        return deduplicated_tags
    
    def _deduplicate_sections(self, section_tags: List[Tuple[int, Tag]]) -> List[Tag]:
        """
        Deduplicate section headings, keeping only the first occurrence of each section number.
        
        Prefers sections outside audio player modules over those inside.
        
        Args:
            section_tags: List of tuples (section_number, tag)
            
        Returns:
            List of deduplicated Tag objects, sorted by section number
        """
        sections_dict = {}  # Track seen section numbers
        sections_is_audio = {}  # Track if stored section is in audio module
        
        for section_number, heading in section_tags:
            # Check if this section's immediate parent is an audio player module
            # Check parent's class attribute directly, not the string representation
            parent_classes = heading.parent.get('class', []) if heading.parent else []
            is_audio_header = 'et_pb_audio_module_content' in parent_classes
            
            if section_number not in sections_dict:
                # First occurrence - keep it
                sections_dict[section_number] = heading
                sections_is_audio[section_number] = is_audio_header
                logger.debug(f"Keeping section {section_number} (first occurrence, audio={is_audio_header})")
            else:
                # We have a duplicate - decide which to keep
                existing_is_audio = sections_is_audio[section_number]
                
                if existing_is_audio and not is_audio_header:
                    # Current one is NOT in audio module, existing one IS - replace with current
                    logger.warning(f"Duplicate section {section_number} found, replacing audio module version with non-audio version")
                    sections_dict[section_number] = heading
                    sections_is_audio[section_number] = is_audio_header
                elif not existing_is_audio and is_audio_header:
                    # Current one is in audio module, existing one is not - keep existing
                    logger.warning(f"Duplicate section {section_number} found in audio module, keeping non-audio version")
                else:
                    # Both are same type - keep first occurrence
                    logger.warning(f"Duplicate section {section_number} found, keeping first occurrence")
        
        # Sort by section number and return tags
        sorted_sections = sorted(sections_dict.items(), key=lambda x: x[0])
        return [tag for _, tag in sorted_sections]
    
    def extract_section_content(self, section_tag: Tag, section_number: int) -> Section:
        """
        Extract content for a specific section
        
        Args:
            section_tag: BeautifulSoup Tag object for the section heading
            section_number: Section number (1-4)
            
        Returns:
            Section object with extracted information
        """
        # Calculate question range (10 questions per section)
        start_q = (section_number - 1) * 10 + 1
        end_q = section_number * 10
        
        # Extract section title
        title = section_tag.get_text(separator=' ', strip=True)
        
        # Extract context (text between section heading and first question)
        context = self._extract_context(section_tag)
        
        logger.info(f"Extracted section {section_number}: {title}, questions {start_q}-{end_q}")
        
        return Section(
            section_number=section_number,
            title=title,
            audio_file_path=None,  # Will be set later when linking to audio files
            question_range=(start_q, end_q),
            context=context
        )
    
    def _extract_context(self, section_tag: Tag) -> Optional[str]:
        """
        Extract context or instructions that appear after the section heading.
        
        Extracts text between section heading and first question, stopping at
        question boundary markers. Uses TextUtils for proper spacing.
        
        Args:
            section_tag: BeautifulSoup Tag object for the section heading
            
        Returns:
            Context text or None if no context found
        """
        from parser.text_utils import TextUtils
        
        context_parts = []
        
        # Question boundary markers
        question_boundary_patterns = [
            r'[Qq]uestions?\s+\d+',  # Questions 1-10
            r'^\d+[\.\)]\s',  # Question number at start (1. or 1))
            r'[Cc]omplete\s+the',  # Complete the form/table/etc
            r'[Cc]hoose\s+(?:the|two|three)',  # Choose instructions
            r'[Ww]rite\s+(?:NO\s+MORE|ONE\s+WORD)',  # Write instructions
            r'[Mm]atch\s+',  # Match instructions
            r'[Ll]abel\s+',  # Label instructions
        ]
        
        # Look at the next siblings after the section heading
        current = section_tag.next_sibling
        max_siblings = 10  # Increased limit to capture more context
        count = 0
        
        while current and count < max_siblings:
            count += 1
            
            # Skip NavigableString objects that are just whitespace
            if not hasattr(current, 'get_text'):
                current = current.next_sibling
                continue
            
            # Extract text with proper spacing using TextUtils
            text = TextUtils.extract_text_with_spacing(current)
            
            # Stop if we hit another section
            if self.SECTION_PATTERN.search(text):
                logger.debug("Stopped context extraction at next section")
                break
            
            # Stop if we hit a question boundary marker
            is_question_boundary = any(re.search(pattern, text) for pattern in question_boundary_patterns)
            if is_question_boundary:
                logger.debug(f"Stopped context extraction at question boundary: {text[:50]}...")
                break
            
            # Add non-empty text that's substantial enough to be context
            if text and len(text) > 10:  # Ignore very short text
                context_parts.append(text)
                logger.debug(f"Added context part: {text[:50]}...")
            
            current = current.next_sibling
        
        if context_parts:
            # Join context parts and normalize spacing
            context = ' '.join(context_parts)
            context = TextUtils.normalize_spacing(context)
            logger.debug(f"Extracted context ({len(context)} chars): {context[:100]}...")
            return context
        
        logger.debug("No context found for section")
        return None
    
    def link_sections_to_audio(self, sections: List[Section], 
                              media_files: List[MediaFile]) -> List[Section]:
        """
        Link each section to its corresponding audio file
        
        Args:
            sections: List of Section objects
            media_files: List of MediaFile objects
            
        Returns:
            Updated list of Section objects with audio_file_path set
        """
        # Sort media files by section number
        media_by_section = {}
        for media_file in media_files:
            media_by_section[media_file.section_number] = media_file.local_path
        
        # Link sections to audio files
        for section in sections:
            if section.section_number in media_by_section:
                section.audio_file_path = media_by_section[section.section_number]
                logger.info(f"Linked section {section.section_number} to audio: {section.audio_file_path}")
            else:
                logger.warning(f"No audio file found for section {section.section_number}")
        
        return sections


# ============================================================================
# Main Parser Class
# ============================================================================

class IELTSListeningParser:
    """
    Main parser for IELTS listening tests.
    Orchestrates the full parsing pipeline from HTML to structured JSON.
    """
    
    def __init__(self, media_output_dir: str = "web_scraping/media"):
        """
        Initialize the listening parser
        
        Args:
            media_output_dir: Directory to store downloaded audio files
        """
        self.row_detector = ListeningRowDetector()
        self.audio_extractor = ListeningAudioExtractor(output_dir=media_output_dir)
        self.question_extractor = ListeningQuestionExtractor()
        self.answer_extractor = ListeningAnswerExtractor()
        self.validator = ListeningValidator()
        self.content_validator = ContentValidator()
        self.json_generator = ListeningJSONGenerator()
        logger.info("Initialized IELTS Listening Parser with row-based detection")
    
    def parse_file(self, input_json_path: Path, download_media: bool = True) -> Dict:
        """
        Parse a single crawled JSON file using row-based detection.
        
        Args:
            input_json_path: Path to the crawled JSON file
            download_media: Whether to download audio files
            
        Returns:
            Structured dictionary ready for JSON output
        """
        logger.info(f"Parsing file: {input_json_path}")
        
        try:
            # Load raw JSON
            with open(input_json_path, 'r', encoding='utf-8') as f:
                raw_data = json.load(f)
            
            # Extract test number from source URL or filename
            test_number = self._extract_test_number(raw_data.get('source', str(input_json_path)))
            
            # Parse HTML
            soup = BeautifulSoup(raw_data.get('content', ''), 'html.parser')
            
            # Step 1: Find main container
            main_container = self.row_detector.find_main_container(soup)
            if not main_container:
                raise HTMLParsingError("Could not find main container (et_pb_section_0)")
            
            # Step 2: Map rows to sections
            sections_dict = self.row_detector.map_rows_to_sections(main_container)
            if not sections_dict or len(sections_dict) != 4:
                raise ContentExtractionError(f"Expected 4 sections, found {len(sections_dict)}")
            
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
                        logger.warning(f"Failed to download audio for section {section_num}")
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
                logger.info(f"Section {section_num}: {section.title}, audio={bool(audio_file_path)}")
                
                # Extract questions from question row
                if question_row:
                    questions = self.question_extractor.extract_questions_from_row(
                        question_row,
                        section_num
                    )
                    question_blocks.extend(questions)
                else:
                    logger.warning(f"No question row found for section {section_num}")
            
            # Step 4: Extract answers from row 11
            answer_row = self.row_detector.find_answer_row(main_container)
            if not answer_row:
                raise AnswerExtractionError("Could not find answer row (row 11)")
            
            # Extract answers using the new method
            answer_dicts = self.answer_extractor.extract_answers_from_row_11(answer_row)
            
            # Convert to ListeningAnswer objects for compatibility with validator
            answers = []
            for ans_dict in answer_dicts:
                answers.append(ListeningAnswer(
                    question_number=ans_dict['question_number'],
                    correct_answer=ans_dict['answer_text'],
                    acceptable_alternatives=[]
                ))
            
            logger.info(f"Extracted {len(answers)} answers from row 11")
            
            # Step 5: Validate extracted data
            validation_result = self._validate_extraction(sections, question_blocks, answers)
            
            # Generate validation report if there are errors or warnings
            if not validation_result['is_valid'] or validation_result.get('warnings'):
                logger.warning(f"Validation issues: {validation_result}")
            
            # Step 6: Generate structured JSON output
            metadata = self._extract_metadata(raw_data, test_number)
            result = self._generate_json_output(
                metadata=metadata,
                sections=sections,
                question_blocks=question_blocks,
                answers=answer_dicts,
                validation=validation_result
            )
            
            logger.info(f"Successfully parsed test {test_number}")
            return result
            
        except Exception as e:
            logger.error(f"Error parsing file {input_json_path}: {e}")
            raise
    
    def parse_batch(self, input_files: List[Path], output_dir: Path, 
                   download_media: bool = True) -> Dict:
        """
        Process multiple files in batch
        
        Args:
            input_files: List of input JSON file paths
            output_dir: Directory to save parsed output
            download_media: Whether to download audio files
            
        Returns:
            Summary dictionary with success/failure counts
        """
        output_dir.mkdir(parents=True, exist_ok=True)
        
        success_count = 0
        failure_count = 0
        errors = []
        
        for input_file in input_files:
            try:
                result = self.parse_file(input_file, download_media=download_media)
                
                # Save output
                output_file = output_dir / input_file.name
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(result, f, indent=2, ensure_ascii=False)
                
                # Save validation report if available
                if 'validation' in result:
                    validation = result['validation']
                    if validation.get('errors') or validation.get('warnings'):
                        report_file = output_dir / (input_file.stem + '_validation.txt')
                        with open(report_file, 'w', encoding='utf-8') as f:
                            f.write(f"Validation Report for {input_file.name}\n")
                            f.write("=" * 80 + "\n\n")
                            f.write(f"Valid: {validation.get('is_valid', False)}\n")
                            f.write(f"Quality Score: {validation.get('quality_score', 0):.2f}\n\n")
                            
                            if validation.get('errors'):
                                f.write("ERRORS:\n")
                                for error in validation['errors']:
                                    f.write(f"  - {error}\n")
                                f.write("\n")
                            
                            if validation.get('warnings'):
                                f.write("WARNINGS:\n")
                                for warning in validation['warnings']:
                                    f.write(f"  - {warning}\n")
                        
                        logger.info(f"Saved validation report: {report_file}")
                
                success_count += 1
                logger.info(f"Successfully processed: {input_file.name}")
                
            except Exception as e:
                failure_count += 1
                error_msg = f"Failed to process {input_file.name}: {str(e)}"
                errors.append(error_msg)
                logger.error(error_msg)
        
        return {
            "success_count": success_count,
            "failure_count": failure_count,
            "total": len(input_files),
            "errors": errors
        }
    

    
    def _extract_test_number(self, source: str) -> int:
        """Extract test number from URL or filename"""
        match = re.search(r'test[-_]?(\d+)', source, re.I)
        if match:
            return int(match.group(1))
        return 0
    

    
    def _validate_extraction(self, sections: List[Section], 
                            question_blocks: List[Dict], 
                            answers: List[ListeningAnswer]) -> Dict:
        """
        Validate extracted data for completeness and correctness.
        
        Requirement 7.1: Validate section count (should be 4)
        Requirement 7.2: Validate question blocks (should be 4, one per section)
        Requirement 7.3: Validate answer count (should be 40)
        Requirement 7.4: Validate question number ranges per section
        
        Args:
            sections: List of Section objects
            question_blocks: List of question block dictionaries
            answers: List of ListeningAnswer objects
            
        Returns:
            Dictionary with validation results
        """
        validation = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'section_count': len(sections),
            'question_block_count': len(question_blocks),
            'answer_count': len(answers)
        }
        
        # Validate section count (Requirement 7.1)
        if len(sections) != 4:
            validation['is_valid'] = False
            validation['errors'].append(f"Expected 4 sections, found {len(sections)}")
        
        # Validate question blocks (Requirement 7.2)
        if len(question_blocks) != 4:
            validation['warnings'].append(f"Expected 4 question blocks, found {len(question_blocks)}")
        
        # Validate answer count (Requirement 7.3)
        if len(answers) != 40:
            validation['is_valid'] = False
            validation['errors'].append(f"Expected 40 answers, found {len(answers)}")
        
        # Validate question number ranges per section (Requirement 7.4)
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
        answer_numbers = [a.question_number for a in answers]
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
        
        logger.info(f"Validation complete: valid={validation['is_valid']}, "
                   f"errors={len(validation['errors'])}, warnings={len(validation['warnings'])}")
        
        return validation
    
    def _generate_json_output(self, metadata: Dict, sections: List[Section],
                             question_blocks: List[Dict], answers: List[Dict],
                             validation: Dict) -> Dict:
        """
        Generate structured JSON output.
        
        Args:
            metadata: Test metadata dictionary
            sections: List of Section objects
            question_blocks: List of question block dictionaries
            answers: List of answer dictionaries
            validation: Validation results dictionary
            
        Returns:
            Complete JSON structure ready for output
        """
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
            "answers": answers,
            "validation": validation
        }
    
    def _extract_metadata(self, raw_data: Dict, test_number: int) -> Dict:
        """Extract test metadata"""
        return {
            "source_url": raw_data.get('source', ''),
            "test_name": f"Listening Practice Test {test_number:02d}",
            "test_type": "listening",
            "test_number": test_number,
            "crawl_date": raw_data.get('crawl_date', ''),
            "total_questions": 40,
            "total_sections": 4
        }
