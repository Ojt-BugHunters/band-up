"""Streamlit web interface for the Local PDF RAG Pipeline."""

import streamlit as st
import json
import logging
from pathlib import Path

from rag_pipeline import RAGPipeline
from config import config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def display_sidebar():
    """Display sidebar with configuration options."""
    st.sidebar.title("⚙️ Configuration")
    
    # API Key input
    st.sidebar.subheader("🔑 API Configuration")
    api_key = st.sidebar.text_input(
        "Gemini API Key",
        value=config.gemini_api_key,
        type="password",
        help="Enter your Google Gemini API key"
    )
    
    if api_key and api_key != config.gemini_api_key:
        config.gemini_api_key = api_key
    
    # Model selection
    st.sidebar.subheader("🤖 Model Configuration")
    current_model = config.gemini_model
    st.sidebar.info(f"Using model: **{current_model}**")
    
    # Processing options
    st.sidebar.subheader("📊 Processing Options")
    chunk_size = st.sidebar.slider(
        "Chunk Size",
        min_value=500,
        max_value=2000,
        value=config.chunk_size,
        step=100,
        help="Size of text chunks for processing"
    )
    
    top_k_chunks = st.sidebar.slider(
        "Top K Chunks",
        min_value=1,
        max_value=10,
        value=config.top_k_chunks,
        help="Number of most relevant chunks to retrieve"
    )
    
    # Update config
    config.chunk_size = chunk_size
    config.top_k_chunks = top_k_chunks

def display_flashcard_generation():
    """Display flashcard generation interface."""
    st.header("🎴 Generate IELTS Flashcards")
    
    # File upload
    uploaded_file = st.file_uploader(
        "Upload PDF Document",
        type=['pdf'],
        help="Upload a PDF document to generate IELTS flashcards from"
    )
    
    if uploaded_file is not None:
        # Save uploaded file temporarily
        temp_path = Path("temp_upload.pdf")
        with open(temp_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
        
        # Query input
        query = st.text_input(
            "Query (Optional)",
            placeholder="e.g., 'vocabulary and grammar', 'reading comprehension'",
            help="Optional query to focus on specific content"
        )
        
        # Generate button
        if st.button("🚀 Generate Flashcards", type="primary"):
            with st.spinner("Processing document and generating flashcards..."):
                try:
                    # Initialize pipeline
                    pipeline = RAGPipeline()
                    
                    # Generate flashcards
                    result = pipeline.generate_flashcards_from_document(
                        pdf_path=str(temp_path),
                        query=query if query else None
                    )
                    
                    if result["status"] == "success":
                        st.success("✅ Flashcards generated successfully!")
                        
                        # Display results
                        flashcards = result.get("flashcards", {})
                        cards = flashcards.get("cards", [])
                        
                        st.subheader(f"📊 Results Summary")
                        col1, col2, col3 = st.columns(3)
                        with col1:
                            st.metric("Total Cards", len(cards))
                        with col2:
                            st.metric("Chunks Used", result.get("chunks_used", 0))
                        with col3:
                            st.metric("Document Pages", result.get("metadata", {}).get("page_count", 0))
                        
                        # Display flashcards
                        st.subheader("🎴 Generated Flashcards")
                        for i, card in enumerate(cards, 1):
                            with st.expander(f"Card {i}: {card.get('type', 'Unknown')} - {card.get('difficulty', 'Unknown')}"):
                                st.markdown(f"**Front:** {card.get('front', 'N/A')}")
                                st.markdown(f"**Back:** {card.get('back', 'N/A')}")
                                if card.get('supporting_span'):
                                    st.markdown(f"**Supporting Evidence:** {card.get('supporting_span')}")
                                st.markdown(f"**Tags:** {', '.join(card.get('tags', []))}")
                        
                        # Download button
                        json_data = json.dumps(result, indent=2, ensure_ascii=False)
                        st.download_button(
                            label="📥 Download Results (JSON)",
                            data=json_data,
                            file_name=f"flashcards_{uploaded_file.name}.json",
                            mime="application/json"
                        )
                    
                    else:
                        st.error(f"❌ Error: {result.get('error', 'Unknown error')}")
                
                except Exception as e:
                    st.error(f"❌ Unexpected error: {str(e)}")
                    logger.error(f"Error in flashcard generation: {e}")
                
                finally:
                    # Clean up temp file
                    if temp_path.exists():
                        temp_path.unlink()

def main():
    """Main Streamlit application."""
    st.set_page_config(
        page_title="Local PDF RAG Pipeline",
        page_icon="📚",
        layout="wide"
    )
    
    st.title("📚 Local PDF RAG Pipeline")
    st.markdown("**IELTS Content Generation with Local Embeddings and Gemini API**")
    
    # Display sidebar
    display_sidebar()
    
    # Main content
    display_flashcard_generation()
    
    # About section
    st.header("About This Application")
    st.markdown("""
    This application implements a **Local PDF RAG Pipeline** for IELTS content generation:
    
    ### 🔧 Technical Stack
    - **PDF Processing**: PyMuPDF for accurate text extraction
    - **Embeddings**: sentence-transformers/all-MiniLM-L6-v2 (local)
    - **Vector Search**: FAISS for efficient similarity search
    - **Generation**: Gemini API (gemini-2.5-flash-lite)
    
    ### 🎯 Features
    - **Flashcard Generation**: Create IELTS flashcards from PDF documents
    - **Local Processing**: Embeddings generated locally for privacy
    - **Efficient RAG**: Only relevant chunks sent to API
    
    ### 🔑 Setup
    Make sure to set your `GOOGLE_API_KEY` environment variable or enter it in the sidebar.
    """)

if __name__ == "__main__":
    main()