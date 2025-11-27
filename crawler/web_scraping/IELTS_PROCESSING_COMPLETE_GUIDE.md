# 🎯 IELTS Test Processing - Complete Implementation Guide

**Last Updated**: November 22, 2025  
**Project**: IELTS Test Crawler, Parser & AI Enhancement System  
**Location**: `e:\OJT\band-up\`

---

## 📖 Table of Contents

1. [System Overview](#system-overview)
2. [Prerequisites & Setup](#prerequisites--setup)
3. [Complete Workflow](#complete-workflow)
4. [Step-by-Step Commands](#step-by-step-commands)
5. [Output Structure](#output-structure)
6. [Configuration](#configuration)
7. [Troubleshooting](#troubleshooting)
8. [Architecture & Components](#architecture--components)
9. [Cost & Performance](#cost--performance)
10. [Quick Reference](#quick-reference)

---

## 🎯 System Overview

### What This System Does

This system processes IELTS tests through a **3-step pipeline**:

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   STEP 1    │      │   STEP 2    │      │   STEP 3    │
│   CRAWL     │  →   │   PARSE     │  →   │  ENHANCE    │
│             │      │             │      │             │
│ Download    │      │ Extract     │      │ Classify    │
│ HTML from   │      │ structured  │      │ question    │
│ website     │      │ data to     │      │ types with  │
│             │      │ JSON        │      │ Gemini AI   │
└─────────────┘      └─────────────┘      └─────────────┘
```

### Test Coverage

- **Reading Tests**: 1-111 (3 passages per test, 40 questions)
- **Listening Tests**: 1-50 (4 sections per test, 40 questions, audio files)

### Key Features

✅ Automated HTML crawling with rate limiting  
✅ Intelligent content extraction preserving formatting  
✅ AI-powered question type classification (6 types)  
✅ Batch processing with progress tracking  
✅ Comprehensive validation and error handling  
✅ Resume capability for interrupted processing  

---

## 🔧 Prerequisites & Setup

### 1. System Requirements

- **Python**: 3.8 or higher
- **Operating System**: Windows (scripts provided for Windows)
- **Disk Space**: ~500MB for all tests + audio files
- **Internet**: Required for crawling and Gemini API

### 2. Install Python Dependencies

```bash
# Navigate to project root
cd e:\OJT\band-up

# Install all required packages
pip install -r web_scraping/requirements.txt
```

**Required packages**:
- `beautifulsoup4>=4.12.0` - HTML parsing
- `requests>=2.31.0` - HTTP requests
- `bleach>=6.0.0` - HTML sanitization
- `tqdm>=4.66.0` - Progress bars
- `google-genai` - Gemini AI API
- `python-dotenv` - Environment variables

### 3. Set Up Gemini API Key

**Option A: Environment Variable (Temporary)**
```bash
# Windows Command Prompt
set GEMINI_API_KEY=your-api-key-here

# Windows PowerShell
$env:GEMINI_API_KEY="your-api-key-here"
```

**Option B: .env File (Recommended)**
```bash
# Create .env file in project root
echo GEMINI_API_KEY=your-api-key-here > .env
```

**Get your API key**: https://aistudio.google.com/app/apikey

### 4. Verify Setup

```bash
# Test API connection
run_enhancement.bat test
```

If successful, you'll see:
```
✅ API Key: Found
✅ Gemini API connection successful
```

---

## 🚀 Complete Workflow

### Overview: 3-Step Process

The complete workflow consists of three sequential steps:

1. **CRAWL & PARSE** → Download HTML and extract structured data
2. **ENHANCE** → Add AI-powered question type classifications
3. **USE** → Integrate enhanced JSON into your application

### When to Run Each Step

- **Step 1 (Crawl & Parse)**: Run once to download and extract all tests
- **Step 2 (Enhance)**: Run once after Step 1 to add question types
- **Re-run**: Only if you need to update or reprocess tests

---

## 📝 Step-by-Step Commands

### STEP 1: Crawl & Parse Tests

This step downloads HTML from the website and extracts structured JSON data.

#### **Reading Tests (1-111)**

```bash
# Single test
python -m web_scraping.parser.reading_parser_main --test 1

# Range of tests (recommended for testing)
python -m web_scraping.parser.reading_parser_main --start 1 --end 10

# All reading tests (takes ~40-50 seconds)
python -m web_scraping.parser.reading_parser_main --all

# Force reprocess existing tests
python -m web_scraping.parser.reading_parser_main --start 1 --end 10 --force

# With verbose logging
python -m web_scraping.parser.reading_parser_main --start 1 --end 10 --verbose
```

**Output Location**: `parsed/reading/practice/`  
**File Format**: `parsed_ielts-reading-practice-test-XX-with-answers.json`

#### **Listening Tests (1-50)**

```bash
# Single test
python -m web_scraping.parser.listening_parser_main --test 1

# Range of tests (recommended for testing)
python -m web_scraping.parser.listening_parser_main --start 1 --end 10

# All listening tests (takes ~17-20 seconds)
python -m web_scraping.parser.listening_parser_main --all

# Skip audio downloads (faster, for testing)
python -m web_scraping.parser.listening_parser_main --start 1 --end 10 --no-media

# Force reprocess with verbose logging
python -m web_scraping.parser.listening_parser_main --all --force --verbose
```

**Output Location**: `parsed/listening/practice/`  
**File Format**: `listening_test_XX.json`  
**Audio Files**: `web_scraping/media/listening/practice/test_XX/` (if downloaded)

---

### STEP 2: Enhance with Gemini AI

This step adds AI-powered question type classifications to parsed tests.

#### **Using Batch Script (Easiest)**

```bash
# Test API connection first
run_enhancement.bat test

# Process 5 reading tests (recommended to start)
run_enhancement.bat reading

# Process 5 listening tests
run_enhancement.bat listening

# Process ALL reading tests (1-50)
run_enhancement.bat reading-all

# Process ALL listening tests (1-50)
run_enhancement.bat listening-all

#### **Using Python Directly (More Control)**

```bash
# Process specific range of reading tests
python -m web_scraping.parser.gemini_enhancement.enhance_tests --start 1 --end 10 --type reading

# Process specific range of listening tests
python -m web_scraping.parser.gemini_enhancement.enhance_tests --start 1 --end 10 --type listening

# With custom report file
python -m web_scraping.parser.gemini_enhancement.enhance_tests --start 1 --end 10 --type reading --report my_report.json

# Process all available tests
python -m web_scraping.parser.gemini_enhancement.enhance_tests --start 1 --end 50 --type reading
python -m web_scraping.parser.gemini_enhancement.enhance_tests --start 1 --end 50 --type listening
```

**Output Location**: `parsed_enhanced/reading/practice/` and `parsed_enhanced/listening/practice/`  
**Processing Time**: ~13-15 seconds per test  
**Rate Limit**: 15 requests/minute (4-second delay between requests)

---

## 📊 Output Structure

### After Step 1: Parsed JSON

**Reading Test Structure**:
```json
{
  "source": "https://ieltstrainingonline.com/ielts-reading-practice-test-01-with-answers/",
  "testNumber": 1,
  "testType": "practice",
  "crawledAt": "2025-11-22T10:30:00Z",
  "passages": [
    {
      "title": "The History of Timekeeping",
      "orderIndex": 1,
      "content": "<p>Paragraph 1...</p><p>Paragraph 2...</p>",
      "images": ["https://..."],
      "wordCount": 850
    }
  ],
  "answers": {
    "passage1": "<ul><li>1. sundial</li><li>2. water clock</li>...</ul>",
    "passage2": "<ul><li>14. TRUE</li><li>15. FALSE</li>...</ul>",
    "passage3": "<ul><li>27. C</li><li>28. A</li>...</ul>"
  },
  "metadata": {
    "totalWordCount": 2650,
    "estimatedReadingTime": 60,
    "parserVersion": "2.0.0"
  }
}
```

**Listening Test Structure**:
```json
{
  "test_metadata": {
    "source_url": "https://ieltstrainingonline.com/ielts-listening-practice-test-01/",
    "test_name": "Listening Practice Test 01",
    "test_type": "listening",
    "test_number": 1,
    "crawl_date": "2025-11-22T15:17:21Z",
    "total_questions": 40,
    "total_sections": 4
  },
  "sections": [
    {
      "section_number": 1,
      "title": "SECTION 1",
      "audio_file_path": "web_scraping/media/listening/practice/test_01/section_1.mp3",
      "question_range": [1, 10]
    }
  ],
  "questions": [
    {
      "section_number": 1,
      "question_range": [1, 10],
      "html_content": "<div>...</div>",
      "text_content": "Questions 1-7 Complete the form..."
    }
  ],
  "answers": [
    {
      "question_number": 1,
      "answer_text": "Animal Park",
      "section_number": 1
    }
  ],
  "validation": {
    "is_valid": true,
    "section_count": 4,
    "question_count": 40,
    "answer_count": 40
  }
}
```

### After Step 2: Enhanced JSON

The enhanced JSON includes everything from Step 1 PLUS:

```json
{
  ...all original data from Step 1...,
  
  "questionTypes": [
    {"Question_1": "SA"},
    {"Question_2": "SA"},
    {"Question_3": "MC"},
    {"Question_4": "MC"},
    {"Question_5": "TF"},
    ...
    {"Question_40": "SA"}
  ],
  
  "enhancementMetadata": {
    "enhancementDate": "2025-11-22T16:45:30Z",
    "geminiModel": "gemini-2.5-flash",
    "enhancementVersion": "2.0",
    "enhancementType": "question_type_classification",
    "tokensUsed": 4700,
    "processingTime": 13.5
  }
}
```

### Question Type Codes

| Code | Type | Description | Example |
|------|------|-------------|---------|
| `MC` | Multiple Choice | Questions with options A, B, C, D | "Choose the correct letter A, B, C or D" |
| `SA` | Short Answer | Fill-in-the-blank with word limits | "Write NO MORE THAN TWO WORDS" |
| `TF` | True/False | TRUE/FALSE/NOT GIVEN or YES/NO/NOT GIVEN | "Do the following statements agree..." |
| `MH` | Matching Heading | Match headings to paragraphs | "Choose the correct heading for each paragraph" |
| `LA` | Long Answer | Extended written responses | "Write a detailed answer" |
| `SP` | Speak | Speaking test questions | Pre-configured for speaking tests |

**Frontend Usage**: These codes enable automatic UI component rendering based on question type.

---

## ⚙️ Configuration

### Crawling Configuration (Step 1)

**Command-line options**:

```bash
# Rate limiting
--delay 0.35          # Delay between requests (default: 0.35s)
--timeout 30          # Request timeout (default: 30s)
--max-retries 3       # Max retry attempts (default: 3)

# Processing options
--force               # Force reprocess existing tests
--skip-validation     # Skip validation step (faster)
--verbose             # Enable DEBUG level logging

# Output options
--output-dir DIR      # Custom output directory
--progress-file FILE  # Custom progress tracking file

# Listening-specific
--no-media            # Skip audio downloads
--media-dir DIR       # Custom media directory
```

**Example**:
```bash
python -m web_scraping.parser.reading_parser_main --start 1 --end 10 --delay 1.0 --force --verbose
```

### Enhancement Configuration (Step 2)

**Edit `config/gemini_enhancement.yaml`**:

```yaml
gemini:
  model: "gemini-2.5-flash"
  temperature: 0.1
  max_output_tokens: 2048

processing:
  batch_size: 5
  max_retries: 3
  retry_delay: 2.0

rate_limits:
  requests_per_minute: 15
  tokens_per_minute: 250000
  daily_requests: 1000
  delay_between_requests: 4.0

validation:
  min_questions: 40
  max_questions: 40
  required_question_types: ["MC", "SA", "TF", "MH", "LA", "SP"]
```

**Key settings**:
- `delay_between_requests: 4.0` - Safe for 15 RPM limit (increase if rate limited)
- `batch_size: 5` - Process 5 tests at a time
- `model: "gemini-2.5-flash"` - Fast and cost-effective model

---

## 🆘 Troubleshooting

### Common Issues & Solutions

#### Issue 1: "GEMINI_API_KEY not set"

**Symptoms**: Enhancement script fails immediately

**Solution**:
```bash
# Check if key is set
echo %GEMINI_API_KEY%  # CMD
echo $env:GEMINI_API_KEY  # PowerShell

# Set it
set GEMINI_API_KEY=your-key-here  # CMD
$env:GEMINI_API_KEY="your-key-here"  # PowerShell

# Or create .env file
echo GEMINI_API_KEY=your-key-here > .env
```

#### Issue 2: "Test file not found"

**Symptoms**: Enhancement fails with "File not found" error

**Solution**: Run Step 1 (crawl & parse) before Step 2 (enhance)
```bash
# First, crawl and parse
python -m web_scraping.parser.reading_parser_main --start 1 --end 10

# Then, enhance
python -m web_scraping.parser.gemini_enhancement.enhance_tests --start 1 --end 10 --type reading
```

#### Issue 3: Rate limit errors

**Symptoms**: "429 Too Many Requests" or "Rate limit exceeded"

**Solution**: Increase delay in config file
```yaml
# Edit config/gemini_enhancement.yaml
rate_limits:
  delay_between_requests: 6.0  # Increase from 4.0 to 6.0
```

#### Issue 4: Tests already exist (skipped)

**Symptoms**: "Test already exists, skipping..."

**Solution**: Use `--force` flag to reprocess
```bash
python -m web_scraping.parser.reading_parser_main --start 1 --end 10 --force
```

#### Issue 5: Download failures (404 errors)

**Symptoms**: Some tests fail with 404 errors

**Solution**: This is expected - some test numbers don't exist on the website
- Test 16 (reading) is missing
- Test 20 (listening) is missing
- System logs and continues with other tests

#### Issue 6: Memory usage too high

**Symptoms**: System slows down or crashes

**Solution**: Process in smaller batches
```bash
# Instead of --all, process in batches
python -m web_scraping.parser.reading_parser_main --start 1 --end 20
python -m web_scraping.parser.reading_parser_main --start 21 --end 40
python -m web_scraping.parser.reading_parser_main --start 41 --end 60
```

#### Issue 7: Audio files not downloading

**Symptoms**: No audio files in `web_scraping/media/`

**Solution**: Remove `--no-media` flag (audio downloads are enabled by default)
```bash
# This downloads audio
python -m web_scraping.parser.listening_parser_main --start 1 --end 10

# This skips audio
python -m web_scraping.parser.listening_parser_main --start 1 --end 10 --no-media
```

#### Issue 8: Invalid JSON response from Gemini

**Symptoms**: "Failed to parse JSON response"

**Solution**: This is rare but can happen. The system will retry automatically (max 3 times). If it persists:
1. Check your API key is valid
2. Verify internet connection
3. Try again later (might be temporary API issue)

### Checking Logs

All operations are logged to the `logs/` directory:

```bash
# View recent logs
type logs\reading_parser_2025-11-22.log
type logs\listening_parser_2025-11-22.log
type logs\crawler_2025-11-22.log

# Search for errors
findstr /i "error" logs\*.log
findstr /i "failed" logs\*.log
```

---

## 🏗️ Architecture & Components

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    IELTS Processing System                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │         STEP 1: Crawl & Parse           │
        └─────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────┐                          ┌───────────────┐
│   Reading     │                          │  Listening    │
│   Parser      │                          │   Parser      │
└───────────────┘                          └───────────────┘
        │                                           │
        ├─ URL Generator                           ├─ URL Generator
        ├─ HTML Crawler                            ├─ HTML Crawler
        ├─ Passage Extractor                       ├─ Section Detector
        ├─ Answer Extractor                        ├─ Audio Extractor
        ├─ HTML Sanitizer                          ├─ Question Extractor
        ├─ Content Validator                       ├─ Answer Extractor
        └─ JSON Generator                          └─ JSON Generator
                              │
                              ▼
                    parsed/*.json files
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │        STEP 2: Gemini Enhancement       │
        └─────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌───────────────┐                          ┌───────────────┐
│ Config        │                          │ Gemini        │
│ Manager       │                          │ Client        │
└───────────────┘                          └───────────────┘
        │                                           │
        ├─ Load YAML config                        ├─ API connection
        ├─ Validate settings                       ├─ Generate content
        └─ Environment vars                        └─ JSON parsing
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │         Gemini Enhancer                 │
        └─────────────────────────────────────────┘
                              │
        ├─ Prompt Builder (extract HTML, build prompt)
        ├─ Rate Limiter (15 RPM, 250K TPM)
        ├─ Test Validator (verify 40 questions)
        └─ Batch Processor (progress tracking)
                              │
                              ▼
                parsed_enhanced/*.json files
```

### Key Components

**Step 1 Components**:

1. **URL Generator** (`url_generator.py`)
   - Generates URLs for tests 1-111 (reading) or 1-50 (listening)
   - Handles leading zeros (test-01, test-02, etc.)

2. **HTML Crawler** (`html_crawler.py`)
   - Downloads HTML with rate limiting (0.35s delay)
   - Retry logic with exponential backoff
   - Progress tracking and resume capability

3. **Content Extractors**
   - **Reading**: Extracts 3 passages, preserves HTML formatting
   - **Listening**: Extracts 4 sections, downloads audio files

4. **Content Validator** (`content_validator.py`)
   - Validates structure (3 passages or 4 sections)
   - Validates question count (40 questions)
   - Generates quality score (0.0-1.0)

5. **JSON Generator**
   - Creates structured JSON output
   - Includes metadata and validation results

**Step 2 Components**:

1. **Config Manager** (`config_manager.py`)
   - Loads `config/gemini_enhancement.yaml`
   - Validates configuration
   - Manages environment variables

2. **Gemini Client** (`gemini_client.py`)
   - Connects to Google Gemini API
   - Sends prompts and receives JSON responses
   - Handles API errors and retries

3. **Prompt Builder** (`prompt_builder.py`)
   - Extracts HTML content from tests
   - Builds optimized prompts (minimal tokens)
   - Includes classification instructions and examples

4. **Rate Limiter**
   - Enforces 15 requests/minute limit
   - Tracks token usage (250K tokens/minute)
   - Implements delays between requests

5. **Test Validator** (`test_validator.py`)
   - Validates 40 question classifications
   - Verifies question type codes
   - Checks JSON structure

6. **Gemini Enhancer** (`gemini_enhancer.py`)
   - Main orchestrator
   - Batch processing with progress tracking
   - Error handling and recovery

### File Structure

```
e:\OJT\band-up\
├── web_scraping/
│   ├── parser/
│   │   ├── reading_parser_main.py       # Reading CLI
│   │   ├── listening_parser_main.py     # Listening CLI
│   │   ├── url_generator.py
│   │   ├── html_crawler.py
│   │   ├── content_validator.py
│   │   └── gemini_enhancement/
│   │       ├── enhance_tests.py         # Enhancement CLI
│   │       ├── gemini_client.py
│   │       ├── gemini_enhancer.py
│   │       ├── prompt_builder.py
│   │       ├── config_manager.py
│   │       ├── test_validator.py
│   │       └── test_simple.py           # Test script
│   ├── media/                           # Audio files
│   └── requirements.txt
├── config/
│   └── gemini_enhancement.yaml          # Configuration
├── parsed/                              # Step 1 output
│   ├── reading/practice/
│   └── listening/practice/
├── parsed_enhanced/                     # Step 2 output
│   ├── reading/practice/
│   └── listening/practice/
├── logs/                                # Processing logs
├── run_enhancement.bat                  # Enhancement script
├── reading_crawler_progress.json        # Progress tracking
├── listening_crawler_progress.json
└── IELTS_PROCESSING_COMPLETE_GUIDE.md  # This file
```

---

## 💰 Cost & Performance

### Processing Time

**Step 1: Crawl & Parse**

| Test Type | Count | Time per Test | Total Time |
|-----------|-------|---------------|------------|
| Reading   | 111   | ~0.4s         | ~40-50s    |
| Listening | 50    | ~0.4s         | ~17-20s    |

**Step 2: Enhance with Gemini**

| Test Type | Count | Time per Test | Total Time |
|-----------|-------|---------------|------------|
| Reading   | 50    | ~13-15s       | ~11-13 min |
| Listening | 50    | ~13-15s       | ~11-13 min |

**Total Processing Time**: ~25-30 minutes for all tests

### Token Usage & Cost

**Gemini 2.5 Flash Pricing** (as of Nov 2025):
- Input: $0.000001875 per token
- Output: $0.0000075 per token

**Per Test**:
- Input tokens: ~4,500
- Output tokens: ~200
- Total tokens: ~4,700
- **Cost per test**: ~$0.00017 USD

**Total Cost**:
- 98 tests (49 reading + 49 listening): ~$0.0166 USD
- 161 tests (111 reading + 50 listening): ~$0.027 USD

**Very affordable!** 🎉

### Rate Limits (Gemini Free Tier)

- **Requests per minute**: 15 RPM
- **Tokens per minute**: 250K TPM
- **Requests per day**: 1,000 RPD

**With 4-second delays**:
- Can process ~15 tests/minute
- Can process ~900 tests/hour
- Well within daily limit

### Memory Usage

- **Step 1**: <500MB for full batch
- **Step 2**: <300MB for full batch
- **Audio files**: ~50-100MB per test (if downloaded)

### Disk Space

- **Parsed JSON**: ~1-5MB per test
- **Enhanced JSON**: ~1-5MB per test (same size, just added field)
- **Audio files**: ~50-100MB per listening test
- **Total**: ~500MB for all tests with audio

---

## 🎯 Quick Reference

### Complete Workflow Examples

#### Example 1: Process First 10 Tests (Complete Flow)

```bash
# Step 1: Crawl & Parse
python -m web_scraping.parser.reading_parser_main --start 1 --end 10
python -m web_scraping.parser.listening_parser_main --start 1 --end 10

# Step 2: Enhance
python -m web_scraping.parser.gemini_enhancement.enhance_tests --start 1 --end 10 --type reading
python -m web_scraping.parser.gemini_enhancement.enhance_tests --start 1 --end 10 --type listening
```

#### Example 2: Process Everything

```bash
# Step 1: Crawl & Parse all tests
python -m web_scraping.parser.reading_parser_main --all
python -m web_scraping.parser.listening_parser_main --all

# Step 2: Enhance all tests
run_enhancement.bat reading-all
run_enhancement.bat listening-all
```

#### Example 3: Quick Test (Single Test)

```bash
# Test the complete pipeline with one test
python -m web_scraping.parser.reading_parser_main --test 1
python -m web_scraping.parser.gemini_enhancement.enhance_tests --start 1 --end 1 --type reading
```

### Command Cheat Sheet

**Crawling & Parsing**:
```bash
# Reading
python -m web_scraping.parser.reading_parser_main --test N
python -m web_scraping.parser.reading_parser_main --start N --end M
python -m web_scraping.parser.reading_parser_main --all

# Listening
python -m web_scraping.parser.listening_parser_main --test N
python -m web_scraping.parser.listening_parser_main --start N --end M
python -m web_scraping.parser.listening_parser_main --all
```

**Enhancement**:
```bash
# Using batch script
run_enhancement.bat test           # Test API
run_enhancement.bat reading        # 5 reading tests
run_enhancement.bat listening      # 5 listening tests
run_enhancement.bat reading-all    # All reading
run_enhancement.bat listening-all  # All listening

# Using Python
python -m web_scraping.parser.gemini_enhancement.enhance_tests --start N --end M --type reading
python -m web_scraping.parser.gemini_enhancement.enhance_tests --start N --end M --type listening
```

**Common Flags**:
```bash
--force              # Reprocess existing tests
--verbose            # Debug logging
--skip-validation    # Skip validation
--no-media           # Skip audio downloads (listening only)
--delay 1.0          # Custom delay between requests
```

### Directory Quick Reference

```
parsed/reading/practice/          # Step 1 reading output
parsed/listening/practice/        # Step 1 listening output
parsed_enhanced/reading/practice/ # Step 2 reading output
parsed_enhanced/listening/practice/ # Step 2 listening output
web_scraping/media/               # Audio files
logs/                             # Processing logs
config/gemini_enhancement.yaml    # Configuration
```

### Validation Quick Check

```bash
# Check if files exist
dir parsed\reading\practice\*.json
dir parsed\listening\practice\*.json
dir parsed_enhanced\reading\practice\*.json
dir parsed_enhanced\listening\practice\*.json

# Count files
dir /b parsed\reading\practice\*.json | find /c /v ""
dir /b parsed\listening\practice\*.json | find /c /v ""
```

---

## 📚 Integration Guide

### Using Enhanced JSON in Your Application

#### Backend Integration (Python)

```python
import json
from pathlib import Path

# Load enhanced reading test
def load_reading_test(test_number):
    file_path = f"parsed_enhanced/reading/practice/parsed_ielts-reading-practice-test-{test_number:02d}-with-answers.json"
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# Load enhanced listening test
def load_listening_test(test_number):
    file_path = f"parsed_enhanced/listening/practice/listening_test_{test_number:02d}.json"
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# Example: Get question types
test = load_reading_test(1)
question_types = test['questionTypes']

for qt in question_types:
    for question, qtype in qt.items():
        print(f"{question}: {qtype}")
        # Question_1: SA
        # Question_2: MC
        # etc.
```

#### Frontend Integration (JavaScript)

```javascript
// Load enhanced test
async function loadTest(testNumber, testType) {
  const path = testType === 'reading' 
    ? `parsed_enhanced/reading/practice/parsed_ielts-reading-practice-test-${testNumber.toString().padStart(2, '0')}-with-answers.json`
    : `parsed_enhanced/listening/practice/listening_test_${testNumber.toString().padStart(2, '0')}.json`;
  
  const response = await fetch(path);
  return await response.json();
}

// Render questions based on type
function renderQuestion(questionNumber, questionType, questionData) {
  switch(questionType) {
    case 'MC':
      return renderMultipleChoice(questionData);
    case 'SA':
      return renderShortAnswer(questionData);
    case 'TF':
      return renderTrueFalse(questionData);
    case 'MH':
      return renderMatchingHeading(questionData);
    case 'LA':
      return renderLongAnswer(questionData);
    case 'SP':
      return renderSpeaking(questionData);
    default:
      return renderDefault(questionData);
  }
}

// Example usage
const test = await loadTest(1, 'reading');
test.questionTypes.forEach((qt, index) => {
  const questionNum = Object.keys(qt)[0];
  const questionType = qt[questionNum];
  const questionElement = renderQuestion(index + 1, questionType, test.questions[index]);
  document.getElementById('questions-container').appendChild(questionElement);
});
```

#### Database Integration

```sql
-- Create tables
CREATE TABLE tests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  test_number INT NOT NULL,
  test_type VARCHAR(20) NOT NULL,
  source_url TEXT,
  crawled_at TIMESTAMP,
  total_questions INT DEFAULT 40
);

CREATE TABLE question_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  test_id INT,
  question_number INT,
  question_type VARCHAR(2),
  FOREIGN KEY (test_id) REFERENCES tests(id)
);

-- Insert data
INSERT INTO tests (test_number, test_type, source_url, crawled_at)
VALUES (1, 'reading', 'https://...', '2025-11-22 10:30:00');

INSERT INTO question_types (test_id, question_number, question_type)
VALUES 
  (1, 1, 'SA'),
  (1, 2, 'MC'),
  (1, 3, 'TF'),
  ...
```

---

## 🔄 Maintenance & Updates

### When to Reprocess Tests

**Reprocess Step 1 (Crawl & Parse)** when:
- Website structure changes
- New tests are added to the website
- You need to update existing test content

**Reprocess Step 2 (Enhancement)** when:
- You want to use a different AI model
- Classification accuracy needs improvement
- New question types are added

### Updating Configuration

```bash
# Edit configuration
notepad config\gemini_enhancement.yaml

# Test changes with single test
python -m web_scraping.parser.gemini_enhancement.enhance_tests --start 1 --end 1 --type reading

# If successful, process all tests
run_enhancement.bat reading-all
```

### Backup Strategy

```bash
# Backup parsed tests
xcopy /E /I parsed parsed_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%

# Backup enhanced tests
xcopy /E /I parsed_enhanced parsed_enhanced_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%

# Backup configuration
copy config\gemini_enhancement.yaml config\gemini_enhancement.yaml.backup
```

---

## ✅ Success Checklist

### Initial Setup
- [ ] Python 3.8+ installed
- [ ] Dependencies installed (`pip install -r web_scraping/requirements.txt`)
- [ ] Gemini API key obtained from https://aistudio.google.com/app/apikey
- [ ] API key set in environment or .env file
- [ ] API connection tested (`run_enhancement.bat test`)

### Step 1: Crawl & Parse
- [ ] Reading tests crawled and parsed
- [ ] Listening tests crawled and parsed
- [ ] Audio files downloaded (if needed)
- [ ] Output files exist in `parsed/` directory
- [ ] Logs checked for errors

### Step 2: Enhancement
- [ ] Configuration reviewed and adjusted
- [ ] Test enhancement run on sample (5 tests)
- [ ] Sample output validated
- [ ] Full batch enhancement completed
- [ ] Output files exist in `parsed_enhanced/` directory
- [ ] Enhancement metadata verified

### Integration
- [ ] Enhanced JSON structure understood
- [ ] Question type codes documented
- [ ] Backend integration implemented
- [ ] Frontend rendering implemented
- [ ] Database schema created (if applicable)

---

## 📞 Support & Resources

### Documentation Files

- **This file**: Complete implementation guide
- `web_scraping/parser/COMPREHENSIVE_USAGE_GUIDE.md`: Detailed parser documentation
- `web_scraping/parser/gemini_enhancement/README.md`: Enhancement system documentation
- `QUICK_START_GUIDE.md`: Quick reference guide
- `reports/final/FINAL_PROCESSING_REPORT.md`: Processing statistics

### Log Files

- `logs/reading_parser_YYYY-MM-DD.log`: Reading parser logs
- `logs/listening_parser_YYYY-MM-DD.log`: Listening parser logs
- `logs/crawler_YYYY-MM-DD.log`: Crawler logs

### Progress Files

- `reading_crawler_progress.json`: Reading processing progress
- `listening_crawler_progress.json`: Listening processing progress
- `enhancement_progress.json`: Enhancement progress

### Getting Help

1. **Check logs** for detailed error messages
2. **Review troubleshooting section** in this guide
3. **Verify configuration** in `config/gemini_enhancement.yaml`
4. **Test with single test** before batch processing
5. **Check API key** is valid and has quota remaining

---

## 🎓 Best Practices

1. **Start Small**: Test with 5-10 tests before processing all
2. **Monitor Logs**: Check logs regularly during batch processing
3. **Backup Data**: Keep backups of parsed and enhanced data
4. **Rate Limiting**: Respect API limits with appropriate delays
5. **Validate Output**: Spot-check enhanced tests for accuracy
6. **Track Progress**: Use progress files to resume interrupted processing
7. **Version Control**: Keep configuration files in version control
8. **Document Changes**: Note any configuration changes made

---

## 🚀 Next Steps

After completing this guide:

1. **Integrate** enhanced JSON into your application
2. **Build UI components** for each question type
3. **Implement** answer validation logic
4. **Add** user progress tracking
5. **Deploy** to production environment

---

## 📝 Summary

This system provides a complete pipeline for processing IELTS tests:

✅ **Step 1**: Automated crawling and parsing of 161 tests  
✅ **Step 2**: AI-powered question type classification  
✅ **Output**: Structured JSON with 6 question type codes  
✅ **Cost**: ~$0.027 USD for all tests  
✅ **Time**: ~30 minutes for complete processing  

**You now have everything you need to process IELTS tests from start to finish!**

---

**Document Version**: 1.0  
**Last Updated**: November 22, 2025  
**Author**: IELTS Processing System  
**Project Location**: `e:\OJT\band-up\`

---

**END OF GUIDE**
