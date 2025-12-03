RAG System for Flashcard Generation
====================================

STRUCTURE:
----------
rag_pipeline.py  - Main RAG class (LangChainRAG)
text_chunker.py  - Pure Python text chunking
config.py        - Configuration
requirements.txt - Dependencies

USAGE:
------
from rag_pipeline import LangChainRAG

rag = LangChainRAG()
rag.index_document("document.pdf")
results = rag.retrieve("query", top_k=5)

# With scores
results = rag.similarity_search_with_score("query", top_k=5)

LAMBDA DEPLOYMENT:
------------------
See: aws-infrastructure/lambda/rag_flashcard/

ARCHITECTURE:
-------------
PDF -> PyMuPDF -> Chunking -> Gemini Embeddings -> InMemoryVectorStore -> Search

KEY FEATURES:
-------------
- No FAISS binary (~50MB saved)
- Pure Python chunker (no nltk/scipy)
- Gemini embeddings (768 dimensions)
- ~14MB estimated package size
- 2x faster cold starts
- Perfect for single-document flashcard generation
