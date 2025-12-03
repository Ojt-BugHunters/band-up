#!/usr/bin/env python3
"""
CLI script for enhancing IELTS tests using Gemini AI.

This script provides a command-line interface for:
- Enhancing single tests
- Batch processing multiple tests
- Resuming interrupted batches
- Dry-run validation mode

Usage:
    # Enhance single test
    python enhance_tests.py --test 5 --type listening
    
    # Enhance batch
    python enhance_tests.py --start 1 --end 15 --type reading
    
    # Resume interrupted batch
    python enhance_tests.py --resume enhancement_progress.json
    
    # Dry run (validation only)
    python enhance_tests.py --start 1 --end 5 --type listening --dry-run
"""

import argparse
import sys
import json
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from gemini_enhancement.gemini_enhancer import GeminiEnhancer
from gemini_enhancement.config_manager import ConfigManager, Config
from gemini_enhancement.exceptions import (
    EnhancementError,
    ConfigurationError
)
from gemini_enhancement.logging_config import get_logger, setup_batch_logging

logger = get_logger(__name__)


def parse_arguments() -> argparse.Namespace:
    """
    Parse command-line arguments.
    
    Returns:
        Parsed arguments namespace
    """
    parser = argparse.ArgumentParser(
        description='Enhance IELTS tests using Gemini AI',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Enhance single test
  %(prog)s --test 5 --type listening
  
  # Enhance batch of tests
  %(prog)s --start 1 --end 15 --type reading
  
  # Resume interrupted batch
  %(prog)s --resume enhancement_progress.json
  
  # Dry run (validation only, no file saves)
  %(prog)s --start 1 --end 5 --type listening --dry-run
  
  # Custom configuration
  %(prog)s --start 1 --end 10 --type reading --config custom_config.yaml
  
  # Custom output directory
  %(prog)s --test 3 --type listening --output-dir enhanced_tests
        """
    )
    
    # Mode selection (mutually exclusive)
    mode_group = parser.add_mutually_exclusive_group(required=True)
    mode_group.add_argument(
        '--test',
        type=int,
        metavar='N',
        help='Enhance a single test by number (e.g., --test 5)'
    )
    mode_group.add_argument(
        '--start',
        type=int,
        metavar='N',
        help='Start of test range for batch processing (use with --end)'
    )
    mode_group.add_argument(
        '--resume',
        type=str,
        metavar='FILE',
        help='Resume batch from progress file'
    )
    
    # Test type (required for single/batch mode)
    parser.add_argument(
        '--type',
        choices=['listening', 'reading'],
        help='Type of test (required for --test or --start/--end)'
    )
    
    # Batch end (required with --start)
    parser.add_argument(
        '--end',
        type=int,
        metavar='N',
        help='End of test range for batch processing (use with --start)'
    )
    
    # Configuration options
    parser.add_argument(
        '--config',
        type=str,
        metavar='FILE',
        help='Path to custom configuration YAML file'
    )
    
    parser.add_argument(
        '--input-dir',
        type=str,
        metavar='DIR',
        help='Override input directory path'
    )
    
    parser.add_argument(
        '--output-dir',
        type=str,
        metavar='DIR',
        help='Override output directory path'
    )
    
    # Processing options
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Validate without saving enhanced files'
    )
    
    parser.add_argument(
        '--batch-size',
        type=int,
        metavar='N',
        help='Number of tests to process in batch (default: from config)'
    )
    
    parser.add_argument(
        '--delay',
        type=float,
        metavar='SECONDS',
        help='Delay between requests in seconds (default: from config)'
    )
    
    # Output options
    parser.add_argument(
        '--verbose',
        '-v',
        action='store_true',
        help='Enable verbose logging'
    )
    
    parser.add_argument(
        '--quiet',
        '-q',
        action='store_true',
        help='Suppress non-error output'
    )
    
    parser.add_argument(
        '--report',
        type=str,
        metavar='FILE',
        help='Save batch summary report to file (JSON format)'
    )
    
    return parser.parse_args()


def validate_arguments(args: argparse.Namespace) -> None:
    """
    Validate argument combinations.
    
    Args:
        args: Parsed arguments
        
    Raises:
        ValueError: If argument combination is invalid
    """
    # Validate batch mode
    if args.start is not None:
        if args.end is None:
            raise ValueError("--end is required when using --start")
        if args.start > args.end:
            raise ValueError(f"--start ({args.start}) must be <= --end ({args.end})")
        if args.start < 1:
            raise ValueError("--start must be >= 1")
    
    # Validate test type requirement
    if (args.test is not None or args.start is not None) and args.type is None:
        raise ValueError("--type is required when using --test or --start/--end")
    
    # Validate resume mode
    if args.resume:
        resume_path = Path(args.resume)
        if not resume_path.exists():
            raise ValueError(f"Progress file not found: {args.resume}")
    
    # Validate mutually exclusive options
    if args.verbose and args.quiet:
        raise ValueError("--verbose and --quiet cannot be used together")


def load_configuration(args: argparse.Namespace) -> Config:
    """
    Load configuration with command-line overrides.
    
    Args:
        args: Parsed arguments
        
    Returns:
        Config object with applied overrides
    """
    # Load base configuration
    config_path = Path(args.config) if args.config else None
    config_manager = ConfigManager(config_path)
    config = config_manager.get_config()
    
    # Apply command-line overrides
    if args.input_dir:
        config.paths.input_dir = args.input_dir
    
    if args.output_dir:
        config.paths.output_dir = args.output_dir
    
    if args.dry_run:
        config.validation.dry_run = True
    
    if args.batch_size:
        config.processing.batch_size = args.batch_size
    
    if args.delay:
        config.rate_limits.delay_between_requests = args.delay
    
    return config


def enhance_single_test(
    test_number: int,
    test_type: str,
    config: Config,
    verbose: bool = False
) -> bool:
    """
    Enhance a single test.
    
    Args:
        test_number: Test number to enhance
        test_type: Type of test ('listening' or 'reading')
        config: Configuration object
        verbose: Enable verbose output
        
    Returns:
        True if successful, False otherwise
    """
    try:
        print(f"\n{'='*60}")
        print(f"Enhancing {test_type} test {test_number}")
        print(f"{'='*60}\n")
        
        # Initialize enhancer
        enhancer = GeminiEnhancer(config)
        
        # Get test path
        test_path = enhancer._get_test_path(test_number, test_type)
        
        if not test_path.exists():
            print(f"❌ Error: Test file not found: {test_path}")
            return False
        
        print(f"📄 Input file: {test_path}")
        
        # Enhance test
        result = enhancer.enhance_test(test_path)
        
        if result.success:
            output_path = enhancer._get_output_path(test_path, test_type)
            
            print(f"\n✅ Enhancement successful!")
            if not config.validation.dry_run:
                print(f"📝 Output file: {output_path}")
            else:
                print(f"🔍 Dry run mode - no files saved")
            
            # Print statistics
            if result.processing_stats:
                print(f"\n📊 Statistics:")
                print(f"   Tokens used: {result.processing_stats.tokens_used:,}")
                print(f"   Processing time: {result.processing_stats.processing_time_seconds:.2f}s")
                print(f"   Gemini calls: {result.processing_stats.gemini_calls}")
            
            # Print ad removal stats
            if result.ad_removal_stats:
                print(f"\n🧹 Ads removed:")
                print(f"   Images: {len(result.ad_removal_stats.image_urls)}")
                print(f"   Scripts: {result.ad_removal_stats.script_count}")
                print(f"   Elements: {result.ad_removal_stats.element_count}")
            
            # Print validation info
            if result.validation_result:
                if result.validation_result.warnings:
                    print(f"\n⚠️  Warnings: {len(result.validation_result.warnings)}")
                    if verbose:
                        for warning in result.validation_result.warnings:
                            print(f"   - {warning}")
            
            return True
        else:
            print(f"\n❌ Enhancement failed: {result.error_message}")
            return False
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        if verbose:
            import traceback
            traceback.print_exc()
        return False


def enhance_batch(
    start: int,
    end: int,
    test_type: str,
    config: Config,
    report_file: Optional[str] = None,
    verbose: bool = False
) -> bool:
    """
    Enhance a batch of tests.
    
    Args:
        start: Starting test number
        end: Ending test number
        test_type: Type of tests
        config: Configuration object
        report_file: Optional path to save report
        verbose: Enable verbose output
        
    Returns:
        True if batch completed (even with some failures), False on critical error
    """
    try:
        print(f"\n{'='*60}")
        print(f"Batch Enhancement: {test_type} tests {start}-{end}")
        print(f"{'='*60}\n")
        
        total_tests = end - start + 1
        print(f"📦 Processing {total_tests} tests")
        print(f"⚙️  Configuration:")
        print(f"   Rate limit: {config.rate_limits.requests_per_minute} requests/min")
        print(f"   Delay: {config.rate_limits.delay_between_requests}s between requests")
        print(f"   Max retries: {config.processing.max_retries}")
        if config.validation.dry_run:
            print(f"   🔍 DRY RUN MODE - No files will be saved")
        print()
        
        # Initialize enhancer
        enhancer = GeminiEnhancer(config)
        
        # Process batch
        print(f"🚀 Starting batch processing...\n")
        summary = enhancer.enhance_batch(start, end, test_type)
        
        # Print summary
        print(f"\n{'='*60}")
        print(f"Batch Processing Complete")
        print(f"{'='*60}\n")
        
        print(f"📊 Summary:")
        print(f"   Total tests: {summary['summary']['total_tests']}")
        print(f"   ✅ Completed: {summary['summary']['completed']}")
        print(f"   ❌ Failed: {summary['summary']['failed']}")
        print(f"   Success rate: {summary['summary']['success_rate']*100:.1f}%")
        
        print(f"\n⏱️  Performance:")
        print(f"   Total time: {summary['duration_minutes']:.2f} minutes")
        print(f"   Avg time/test: {summary['statistics']['average_time_per_test']:.2f}s")
        
        print(f"\n🔢 Token usage:")
        print(f"   Total tokens: {summary['statistics']['total_tokens_used']:,}")
        print(f"   Avg tokens/test: {summary['statistics']['average_tokens_per_test']:,.0f}")
        
        if summary['failed_tests']:
            print(f"\n⚠️  Failed tests: {summary['failed_tests']}")
        
        # Save report if requested
        if report_file:
            report_path = Path(report_file)
            report_path.parent.mkdir(parents=True, exist_ok=True)
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(summary, f, indent=2)
            print(f"\n📄 Report saved to: {report_path}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Critical error: {e}")
        if verbose:
            import traceback
            traceback.print_exc()
        return False


def resume_batch(
    progress_file: str,
    config: Config,
    report_file: Optional[str] = None,
    verbose: bool = False
) -> bool:
    """
    Resume an interrupted batch.
    
    Args:
        progress_file: Path to progress file
        config: Configuration object
        report_file: Optional path to save report
        verbose: Enable verbose output
        
    Returns:
        True if resume completed, False on error
    """
    try:
        progress_path = Path(progress_file)
        
        print(f"\n{'='*60}")
        print(f"Resuming Batch from Progress File")
        print(f"{'='*60}\n")
        
        print(f"📄 Progress file: {progress_path}")
        
        # Load progress to show info
        with open(progress_path, 'r') as f:
            progress_data = json.load(f)
        
        test_type = progress_data['test_type']
        test_range = progress_data['test_range']
        completed = progress_data['completed']
        failed = progress_data['failed']
        
        total_tests = test_range['end'] - test_range['start'] + 1
        remaining = total_tests - len(completed) - len(failed)
        
        print(f"📦 Batch info:")
        print(f"   Test type: {test_type}")
        print(f"   Range: {test_range['start']}-{test_range['end']}")
        print(f"   Total tests: {total_tests}")
        print(f"   ✅ Completed: {len(completed)}")
        print(f"   ❌ Failed: {len(failed)}")
        print(f"   ⏳ Remaining: {remaining}")
        print()
        
        if remaining == 0:
            print("✅ All tests already processed!")
            return True
        
        # Initialize enhancer
        enhancer = GeminiEnhancer(config)
        
        # Resume batch
        print(f"🚀 Resuming batch processing...\n")
        summary = enhancer.resume_batch(progress_path)
        
        # Print summary
        print(f"\n{'='*60}")
        print(f"Batch Resume Complete")
        print(f"{'='*60}\n")
        
        print(f"📊 Final Summary:")
        print(f"   Total tests: {summary['summary']['total_tests']}")
        print(f"   ✅ Completed: {summary['summary']['completed']}")
        print(f"   ❌ Failed: {summary['summary']['failed']}")
        print(f"   Success rate: {summary['summary']['success_rate']*100:.1f}%")
        
        # Save report if requested
        if report_file:
            report_path = Path(report_file)
            report_path.parent.mkdir(parents=True, exist_ok=True)
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(summary, f, indent=2)
            print(f"\n📄 Report saved to: {report_path}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        if verbose:
            import traceback
            traceback.print_exc()
        return False


def main() -> int:
    """
    Main entry point for CLI.
    
    Returns:
        Exit code (0 for success, 1 for error)
    """
    try:
        # Parse arguments
        args = parse_arguments()
        
        # Validate arguments
        validate_arguments(args)
        
        # Load configuration
        config = load_configuration(args)
        
        # Execute based on mode
        success = False
        
        if args.test is not None:
            # Single test mode
            success = enhance_single_test(
                args.test,
                args.type,
                config,
                verbose=args.verbose
            )
        
        elif args.start is not None:
            # Batch mode
            success = enhance_batch(
                args.start,
                args.end,
                args.type,
                config,
                report_file=args.report,
                verbose=args.verbose
            )
        
        elif args.resume:
            # Resume mode
            success = resume_batch(
                args.resume,
                config,
                report_file=args.report,
                verbose=args.verbose
            )
        
        return 0 if success else 1
        
    except ConfigurationError as e:
        print(f"\n❌ Configuration error: {e}")
        print("\nPlease check:")
        print("  1. Configuration file exists and is valid YAML")
        print("  2. GEMINI_API_KEY environment variable is set")
        print("  3. All required configuration values are present")
        return 1
    
    except ValueError as e:
        print(f"\n❌ Invalid arguments: {e}")
        print("\nUse --help for usage information")
        return 1
    
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        print("Progress has been saved. Use --resume to continue.")
        return 1
    
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        if '--verbose' in sys.argv or '-v' in sys.argv:
            import traceback
            traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
