# Local PDF RAG Pipeline

A **Local PDF RAG Pipeline** for IELTS content generation using local embeddings and Gemini API.

## 🎯 Overview

This pipeline processes PDF documents to generate IELTS learning materials (flashcards, Q&A) using:
- **Local embeddings** with `sentence-transformers/all-MiniLM-L6-v2`
- **FAISS** for efficient vector search
- **Gemini API** (`gemini-2.5-flash-lite`) for content generation
- **PyMuPDF** for accurate PDF text extraction

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables

```bash
export GOOGLE_API_KEY="your_gemini_api_key"
export GEMINI_MODEL="gemini-2.5-flash-lite"
```

### 3. Run the Pipeline

#### CLI Usage

```bash
# Generate flashcards from PDF
python main.py flashcards document.pdf

# Answer questions about PDF
python main.py qa document.pdf "What is the main topic?"

# Generate flashcards with specific query
python main.py flashcards document.pdf --query "vocabulary and grammar"
```

#### Web UI

```bash
streamlit run web_ui.py
```

## 📁 Project Structure

```
agent/
├── main.py                 # CLI interface
├── web_ui.py              # Streamlit web interface
├── rag_pipeline.py        # Main RAG pipeline orchestrator
├── pdf_processor.py       # PDF processing and vector operations
├── generator_gemini.py    # Gemini API integration
├── prompt_builder.py      # Prompt construction utilities
├── config.py              # Configuration management
├── requirements.txt       # Dependencies
└── README.md             # This file
```

## 🔧 Configuration

Key configuration options in `config.py`:

- `chunk_size`: Text chunk size (default: 1000)
- `chunk_overlap`: Overlap between chunks (default: 100)
- `top_k_chunks`: Number of chunks to retrieve (default: 3)
- `embedding_model`: Local embedding model
- `gemini_model`: Gemini API model

## 📊 Output Format

The pipeline outputs JSON with the following structure:

```json
{
  "status": "success",
  "document_path": "document.pdf",
  "flashcards": {
    "cards": [
      {
        "type": "KeyPoint_QA",
        "front": "Question text",
        "back": "Answer text",
        "difficulty": "medium",
        "tags": ["ielts_reading"]
      }
    ]
  },
  "metadata": {
    "page_count": 10,
    "chunk_count": 25
  }
}
```

## 🎴 Flashcard Types

- **KeyPoint_QA**: Key points and questions
- **YesNoNotGiven**: True/False/Not Given questions
- **Vocab_EN_VI**: English-Vietnamese vocabulary
- **Paraphrase**: Formal/informal paraphrasing

## 🔍 Features

- **Local Processing**: Embeddings generated locally for privacy
- **Efficient RAG**: Only relevant chunks sent to API
- **Multiple Interfaces**: CLI and web UI
- **Flexible Output**: JSON format for easy integration
- **Error Handling**: Comprehensive error handling and logging

## 📝 Example Usage

```python
from rag_pipeline import RAGPipeline

# Initialize pipeline
pipeline = RAGPipeline()

# Generate flashcards
result = pipeline.generate_flashcards_from_document("document.pdf")

# Answer questions
answer = pipeline.answer_question("document.pdf", "What is the main topic?")
```

## 🛠️ Requirements

- Python 3.8+
- Google Gemini API key
- 4GB+ RAM (for local embeddings)
- Internet connection (for Gemini API)

## 📄 License

