"""
Listening Audio Extractor for IELTS Listening Content Parser.

This module extracts audio URLs and metadata from listening test HTML content.
It handles various audio tag formats and downloads audio files to local storage.

Requirements: 2.1, 2.2, 2.3, 2.4
"""

import logging
import re
import requests
from pathlib import Path
from typing import Dict, Optional
from bs4 import Tag

logger = logging.getLogger(__name__)


class ListeningAudioExtractor:
    """
    Extracts audio information from listening test HTML rows.
    
    This class handles:
    - Extracting audio URLs from various HTML formats
    - Extracting section titles from heading tags
    - Downloading audio files to local storage
    - Generating proper file paths for audio files
    
    Requirements: 2.1, 2.2, 2.3, 2.4
    """
    
    SUPPORTED_FORMATS = ['.mp3', '.wav', '.ogg', '.m4a']
    
    def __init__(self, output_dir: str = "web_scraping/media"):
        """
        Initialize the ListeningAudioExtractor.
        
        Args:
            output_dir: Base directory for storing audio files
        """
        self.output_dir = Path(output_dir)
        logger.info(f"Initialized ListeningAudioExtractor with output dir: {self.output_dir}")
    
    def extract_audio_from_row(self, audio_row: Tag, section_num: int) -> Dict:
        """
        Extract audio URL and metadata from an audio row.
        
        Requirement 2.1: Search entire audio row for audio tag (not just audio module)
        Requirement 2.2: Handle both <audio src=""> and <audio><source src=""></audio> formats
        Requirement 2.2: Extract section title from any heading tag (h1-h6) in row
        
        Args:
            audio_row: BeautifulSoup Tag containing the audio row
            section_num: Section number (1-4)
            
        Returns:
            Dictionary with keys:
                - section_number: int
                - audio_url: str or None
                - section_title: str
                - has_audio: bool
                
        Examples:
            >>> extract_audio_from_row(row_tag, 1)
            {
                'section_number': 1,
                'audio_url': 'https://example.com/audio.mp3',
                'section_title': 'SECTION 1',
                'has_audio': True
            }
        """
        if not audio_row:
            logger.warning(f"No audio row provided for section {section_num}")
            return {
                'section_number': section_num,
                'audio_url': None,
                'section_title': f'SECTION {section_num}',
                'has_audio': False
            }
        
        # Extract section title from heading tags (h1-h6)
        section_title = self._extract_section_title(audio_row, section_num)
        
        # Extract audio URL from audio tag
        audio_url = self._extract_audio_url(audio_row)
        
        has_audio = audio_url is not None
        
        if has_audio:
            logger.info(f"Found audio for section {section_num}: {audio_url}")
        else:
            logger.warning(f"No audio found for section {section_num}")
        
        return {
            'section_number': section_num,
            'audio_url': audio_url,
            'section_title': section_title,
            'has_audio': has_audio
        }
    
    def _extract_section_title(self, audio_row: Tag, section_num: int) -> str:
        """
        Extract section title from heading tags (h1-h6) in the row.
        
        Requirement 2.2: Extract section title from any heading tag (h1-h6) in row
        
        Args:
            audio_row: BeautifulSoup Tag containing the audio row
            section_num: Section number for fallback title
            
        Returns:
            Section title string
        """
        # Search for heading tags in order of priority
        for heading_tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            heading = audio_row.find(heading_tag)
            if heading:
                title = heading.get_text(strip=True)
                if title:
                    logger.debug(f"Found section title in <{heading_tag}>: {title}")
                    return title
        
        # Fallback to default title
        default_title = f'SECTION {section_num}'
        logger.debug(f"No heading found, using default title: {default_title}")
        return default_title
    
    def _extract_audio_url(self, audio_row: Tag) -> Optional[str]:
        """
        Extract audio URL from audio tag in the row.
        
        Requirement 2.1: Search entire audio row for audio tag (not just audio module)
        Requirement 2.2: Handle both <audio src=""> and <audio><source src=""></audio> formats
        
        Args:
            audio_row: BeautifulSoup Tag containing the audio row
            
        Returns:
            Audio URL string or None if not found
        """
        # Method 1: Find <audio> tag with direct src attribute
        audio_tag = audio_row.find('audio')
        if audio_tag:
            # Check for direct src attribute
            if audio_tag.get('src'):
                url = audio_tag.get('src')
                logger.debug(f"Found audio URL in <audio src>: {url}")
                return url
            
            # Check for <source> tag within <audio>
            source_tag = audio_tag.find('source')
            if source_tag and source_tag.get('src'):
                url = source_tag.get('src')
                logger.debug(f"Found audio URL in <audio><source>: {url}")
                return url
        
        # Method 2: Find direct audio file links
        for link in audio_row.find_all('a', href=True):
            href = link['href']
            if any(href.lower().endswith(fmt) for fmt in self.SUPPORTED_FORMATS):
                logger.debug(f"Found audio URL in <a href>: {href}")
                return href
        
        # Method 3: Find audio URLs in data attributes
        for element in audio_row.find_all(attrs={"data-audio": True}):
            url = element.get('data-audio')
            if url:
                logger.debug(f"Found audio URL in data-audio attribute: {url}")
                return url
        
        logger.debug("No audio URL found in row")
        return None
    
    def download_audio_file(self, audio_url: str, test_num: int, 
                           section_num: int, force: bool = False) -> Optional[str]:
        """
        Download audio file from URL and save to local storage.
        
        Requirement 2.3: Download audio file from URL
        Requirement 2.4: Save with filename pattern "listening_test_{num}_section_{section}.mp3"
        Requirement 2.4: Create directory structure "listening/practice/test_{num}/"
        Requirement 2.4: Handle download errors gracefully (log warning, return None)
        
        Args:
            audio_url: URL of the audio file to download
            test_num: Test number (e.g., 1, 2, 3)
            section_num: Section number (1-4)
            force: Force re-download even if file exists
            
        Returns:
            Local file path (relative) or None if download fails
            
        Examples:
            >>> download_audio_file("https://example.com/audio.mp3", 3, 1)
            "listening/practice/test_03/listening_test_03_section_1.mp3"
        """
        if not audio_url:
            logger.warning(f"No audio URL provided for test {test_num} section {section_num}")
            return None
        
        try:
            # Create directory structure: listening/practice/test_{num}/
            test_dir = self.output_dir / "listening" / "practice" / f"test_{test_num:02d}"
            test_dir.mkdir(parents=True, exist_ok=True)
            
            # Determine file format from URL
            file_format = self._get_format_from_url(audio_url)
            
            # Generate filename: listening_test_{num}_section_{section}.mp3
            filename = f"listening_test_{test_num:02d}_section_{section_num}.{file_format}"
            local_path = test_dir / filename
            
            # Check if file already exists
            if local_path.exists() and not force:
                file_size = local_path.stat().st_size
                if file_size > 0:
                    logger.info(f"Audio file already exists, skipping: {local_path}")
                    # Return relative path from media directory
                    return self._normalize_path(local_path)
            
            # Download the file
            logger.info(f"Downloading audio from: {audio_url}")
            response = requests.get(audio_url, stream=True, timeout=30)
            response.raise_for_status()
            
            # Write file in chunks
            with open(local_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            
            # Verify file integrity
            file_size = local_path.stat().st_size
            if file_size == 0:
                local_path.unlink()  # Delete empty file
                logger.warning(f"Downloaded file is empty: {local_path}")
                return None
            
            logger.info(f"Successfully downloaded: {filename} ({file_size} bytes)")
            
            # Return relative path from media directory
            return self._normalize_path(local_path)
            
        except requests.RequestException as e:
            logger.warning(f"Failed to download audio from {audio_url}: {e}")
            return None
        except Exception as e:
            logger.warning(f"Error downloading audio file: {e}")
            if local_path.exists():
                local_path.unlink()  # Clean up partial download
            return None
    
    def _get_format_from_url(self, url: str) -> str:
        """
        Extract file format from URL.
        
        Args:
            url: Audio file URL
            
        Returns:
            File format (e.g., 'mp3', 'wav')
        """
        url_lower = url.lower()
        for fmt in self.SUPPORTED_FORMATS:
            if fmt in url_lower:
                return fmt.lstrip('.')
        
        # Default to mp3 if format cannot be determined
        return 'mp3'
    
    def _normalize_path(self, full_path: Path) -> str:
        """
        Convert absolute path to relative path for JSON output.
        
        The viewer expects paths relative to the media directory,
        with forward slashes for web URL compatibility.
        
        Args:
            full_path: Full Path object
            
        Returns:
            Relative path string with forward slashes
            
        Examples:
            >>> _normalize_path(Path("web_scraping/media/listening/practice/test_01/file.mp3"))
            "listening/practice/test_01/file.mp3"
        """
        # Convert to string and normalize
        path_str = str(full_path)
        
        # Remove the base media directory prefix (handle both slash types)
        path_str = path_str.replace('web_scraping\\media\\', '')
        path_str = path_str.replace('web_scraping/media/', '')
        
        # Convert backslashes to forward slashes for web URLs
        path_str = path_str.replace('\\', '/')
        
        logger.debug(f"Normalized path: {full_path} -> {path_str}")
        return path_str
