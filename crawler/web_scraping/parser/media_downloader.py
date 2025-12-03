"""
Media Downloader for IELTS Listening Tests

This module handles downloading and managing audio files for listening tests.
"""

from dataclasses import dataclass
from typing import List, Dict, Optional
from pathlib import Path
import logging
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


@dataclass
class MediaFile:
    """Represents a downloaded audio file"""
    url: str
    local_path: str
    file_size: int
    section_number: int
    format: str  # mp3, wav, ogg, etc.
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            "section_number": self.section_number,
            "file_path": self.local_path,
            "file_size": self.file_size,
            "format": self.format,
            "url": self.url
        }


class MediaDownloader:
    """
    Downloads and manages audio files for listening tests
    """
    
    SUPPORTED_FORMATS = ['.mp3', '.wav', '.ogg', '.m4a']
    
    def __init__(self, output_dir: str = "web_scraping/media/listening"):
        """
        Initialize the media downloader
        
        Args:
            output_dir: Base directory for storing audio files
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Media downloader initialized with output dir: {self.output_dir}")
    
    @staticmethod
    def normalize_media_path(full_path: str) -> str:
        """
        Convert absolute media path to relative path for viewer.
        
        The viewer expects paths relative to the media directory (web_scraping/media),
        with forward slashes for web URL compatibility.
        
        Args:
            full_path: Full path like "web_scraping\\media\\listening\\practice\\test_01\\file.mp3"
            
        Returns:
            Relative path like "listening/practice/test_01/file.mp3"
        
        Examples:
            >>> normalize_media_path("web_scraping\\media\\listening\\test_01\\audio.mp3")
            "listening/test_01/audio.mp3"
            >>> normalize_media_path("web_scraping/media/listening/test_01/audio.mp3")
            "listening/test_01/audio.mp3"
        """
        # Remove the base media directory prefix (handle both slash types)
        path = full_path.replace('web_scraping\\media\\', '')
        path = path.replace('web_scraping/media/', '')
        
        # Convert backslashes to forward slashes for web URLs
        path = path.replace('\\', '/')
        
        logger.debug(f"Normalized path: {full_path} -> {path}")
        return path
    
    def extract_audio_urls(self, soup: BeautifulSoup) -> List[str]:
        """
        Extract all audio URLs from HTML content
        
        Args:
            soup: BeautifulSoup object of the HTML content
            
        Returns:
            List of audio URLs found in the HTML
        """
        audio_urls = []
        
        # Method 1: Find <audio> tags with <source> elements
        for audio_tag in soup.find_all('audio'):
            source = audio_tag.find('source')
            if source and source.get('src'):
                url = source.get('src')
                audio_urls.append(url)
                logger.debug(f"Found audio URL in <audio> tag: {url}")
        
        # Method 2: Find direct audio file links
        for link in soup.find_all('a', href=True):
            href = link['href']
            if any(href.lower().endswith(fmt) for fmt in self.SUPPORTED_FORMATS):
                audio_urls.append(href)
                logger.debug(f"Found audio URL in <a> tag: {href}")
        
        # Method 3: Find audio URLs in script tags or data attributes
        for element in soup.find_all(attrs={"data-audio": True}):
            url = element.get('data-audio')
            if url:
                audio_urls.append(url)
                logger.debug(f"Found audio URL in data attribute: {url}")
        
        logger.info(f"Extracted {len(audio_urls)} audio URLs")
        return audio_urls
    
    def download_audio(self, url: str, test_number: int, 
                      section_number: int, force: bool = False) -> MediaFile:
        """
        Download an audio file and return metadata
        
        Args:
            url: URL of the audio file
            test_number: Test number (e.g., 1, 2, 3)
            section_number: Section number (1-4)
            force: Force re-download even if file exists
            
        Returns:
            MediaFile object with download metadata
            
        Raises:
            ValueError: If download fails or file is invalid
            requests.RequestException: If HTTP request fails
        """
        # Create test-specific directory
        test_dir = self.output_dir / f"test_{test_number:02d}"
        test_dir.mkdir(parents=True, exist_ok=True)
        
        # Determine file format
        file_format = self._get_format_from_url(url)
        
        # Generate filename
        filename = f"listening_test_{test_number:02d}_section_{section_number}.{file_format}"
        local_path = test_dir / filename
        
        # Check if file already exists
        if local_path.exists() and not force:
            file_size = local_path.stat().st_size
            if file_size > 0:
                logger.info(f"Audio file already exists, skipping: {local_path}")
                # Normalize path for viewer compatibility
                normalized_path = self.normalize_media_path(str(local_path))
                return MediaFile(
                    url=url,
                    local_path=normalized_path,
                    file_size=file_size,
                    section_number=section_number,
                    format=file_format
                )
        
        # Download the file
        logger.info(f"Downloading audio: {url}")
        try:
            response = requests.get(url, stream=True, timeout=30)
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
                raise ValueError(f"Downloaded file is empty: {local_path}")
            
            logger.info(f"Successfully downloaded: {filename} ({file_size} bytes)")
            
            # Normalize path for viewer compatibility
            normalized_path = self.normalize_media_path(str(local_path))
            
            return MediaFile(
                url=url,
                local_path=normalized_path,
                file_size=file_size,
                section_number=section_number,
                format=file_format
            )
            
        except requests.RequestException as e:
            logger.error(f"Failed to download audio from {url}: {e}")
            raise
        except Exception as e:
            logger.error(f"Error processing audio file: {e}")
            if local_path.exists():
                local_path.unlink()  # Clean up partial download
            raise
    
    def download_all_for_test(self, audio_urls: List[str], 
                             test_number: int) -> List[MediaFile]:
        """
        Download all audio files for a test
        
        Args:
            audio_urls: List of audio URLs to download
            test_number: Test number
            
        Returns:
            List of MediaFile objects for successfully downloaded files
        """
        media_files = []
        
        for idx, url in enumerate(audio_urls, start=1):
            try:
                media_file = self.download_audio(url, test_number, idx)
                media_files.append(media_file)
            except Exception as e:
                logger.error(f"Failed to download audio {idx} for test {test_number}: {e}")
                # Continue with remaining downloads
        
        logger.info(f"Downloaded {len(media_files)}/{len(audio_urls)} audio files for test {test_number}")
        return media_files
    
    def _get_format_from_url(self, url: str) -> str:
        """
        Extract file format from URL
        
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
    
    def verify_file(self, file_path: Path) -> bool:
        """
        Verify that an audio file is valid
        
        Args:
            file_path: Path to the audio file
            
        Returns:
            True if file is valid, False otherwise
        """
        if not file_path.exists():
            return False
        
        file_size = file_path.stat().st_size
        if file_size == 0:
            logger.warning(f"Audio file is empty: {file_path}")
            return False
        
        # Basic validation - file exists and has content
        # Could be extended with format-specific validation
        return True
