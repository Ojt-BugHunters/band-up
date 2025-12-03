"""
URL Generator Module for IELTS Reading Test Crawler.

This module generates URLs for IELTS reading tests from ieltstrainingonline.com,
handling proper number formatting for test numbers 1-111.

Requirements:
- Tests 1-99: Format with leading zeros (01, 02, ..., 99)
- Tests 100-111: Format without leading zeros (100, 101, ..., 111)
"""

from typing import List


class URLGenerator:
    """Generator for IELTS reading test URLs."""
    
    BASE_URL = "https://ieltstrainingonline.com"
    READING_PRACTICE_PATTERN = "/ielts-reading-practice-test-{num}-with-answers/"
    
    @staticmethod
    def generate_practice_url(test_number: int) -> str:
        """
        Generate URL for a single reading practice test.
        
        Args:
            test_number: Test number (1-111)
            
        Returns:
            Full URL string
            
        Raises:
            ValueError: If test_number is not in range 1-111
            
        Examples:
            >>> URLGenerator.generate_practice_url(5)
            'https://ieltstrainingonline.com/ielts-reading-practice-test-05-with-answers/'
            >>> URLGenerator.generate_practice_url(99)
            'https://ieltstrainingonline.com/ielts-reading-practice-test-99-with-answers/'
            >>> URLGenerator.generate_practice_url(100)
            'https://ieltstrainingonline.com/ielts-reading-practice-test-100-with-answers/'
            >>> URLGenerator.generate_practice_url(111)
            'https://ieltstrainingonline.com/ielts-reading-practice-test-111-with-answers/'
        """
        if not 1 <= test_number <= 111:
            raise ValueError(f"Test number must be between 1 and 111, got {test_number}")
        
        # Format with leading zeros for 1-99, without for 100-111
        if test_number < 100:
            formatted_num = f"{test_number:02d}"
        else:
            formatted_num = str(test_number)
        
        path = URLGenerator.READING_PRACTICE_PATTERN.format(num=formatted_num)
        return URLGenerator.BASE_URL + path
    
    @staticmethod
    def generate_url_batch(start: int, end: int) -> List[str]:
        """
        Generate URLs for a range of reading practice tests.
        
        Args:
            start: Starting test number (inclusive)
            end: Ending test number (inclusive)
            
        Returns:
            List of URL strings
            
        Raises:
            ValueError: If start or end are not in valid range, or if start > end
            
        Examples:
            >>> urls = URLGenerator.generate_url_batch(1, 3)
            >>> len(urls)
            3
            >>> urls[0]
            'https://ieltstrainingonline.com/ielts-reading-practice-test-01-with-answers/'
            >>> urls = URLGenerator.generate_url_batch(99, 101)
            >>> urls[0]
            'https://ieltstrainingonline.com/ielts-reading-practice-test-99-with-answers/'
            >>> urls[2]
            'https://ieltstrainingonline.com/ielts-reading-practice-test-101-with-answers/'
        """
        if not 1 <= start <= 111:
            raise ValueError(f"Start test number must be between 1 and 111, got {start}")
        if not 1 <= end <= 111:
            raise ValueError(f"End test number must be between 1 and 111, got {end}")
        if start > end:
            raise ValueError(f"Start ({start}) must be less than or equal to end ({end})")
        
        urls = []
        for test_num in range(start, end + 1):
            urls.append(URLGenerator.generate_practice_url(test_num))
        
        return urls
    
    @staticmethod
    def generate_all_practice_urls() -> List[str]:
        """
        Generate URLs for all reading practice tests (1-111).
        
        Returns:
            List of 111 URL strings
            
        Examples:
            >>> urls = URLGenerator.generate_all_practice_urls()
            >>> len(urls)
            111
            >>> urls[0]
            'https://ieltstrainingonline.com/ielts-reading-practice-test-01-with-answers/'
            >>> urls[110]
            'https://ieltstrainingonline.com/ielts-reading-practice-test-111-with-answers/'
        """
        return URLGenerator.generate_url_batch(1, 111)


def main():
    """
    Command-line interface for URL generation.
    
    Usage examples:
        python -m web_scraping.parser.url_generator
        python -m web_scraping.parser.url_generator --start 1 --end 10
        python -m web_scraping.parser.url_generator --test 105
    """
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Generate URLs for IELTS reading practice tests"
    )
    parser.add_argument(
        '--start',
        type=int,
        help='Starting test number (1-111)'
    )
    parser.add_argument(
        '--end',
        type=int,
        help='Ending test number (1-111)'
    )
    parser.add_argument(
        '--test',
        type=int,
        help='Generate URL for a single test number'
    )
    parser.add_argument(
        '--all',
        action='store_true',
        help='Generate URLs for all tests (1-111)'
    )
    
    args = parser.parse_args()
    
    try:
        if args.test:
            # Single test URL
            url = URLGenerator.generate_practice_url(args.test)
            print(url)
        elif args.all:
            # All test URLs
            urls = URLGenerator.generate_all_practice_urls()
            for url in urls:
                print(url)
        elif args.start and args.end:
            # Range of test URLs
            urls = URLGenerator.generate_url_batch(args.start, args.end)
            for url in urls:
                print(url)
        else:
            # Default: show all URLs
            urls = URLGenerator.generate_all_practice_urls()
            print(f"Generated {len(urls)} URLs for reading practice tests 1-111:")
            print()
            for i, url in enumerate(urls, 1):
                print(f"{i:3d}. {url}")
    
    except ValueError as e:
        print(f"Error: {e}")
        return 1
    
    return 0


if __name__ == '__main__':
    exit(main())
