"""Prompt building utilities for the Local PDF RAG Pipeline."""

from typing import List, Tuple

def trim_text(text: str, max_chars: int) -> str:
    """
    Trim text to maximum character limit.
    
    Args:
        text: Input text
        max_chars: Maximum number of characters
        
    Returns:
        Trimmed text
    """
    return text[:max_chars].rstrip()

def build_flashcard_prompts(
    chunks: List[str],
    task_text: str,
    max_chunk_chars: int = 900,
    schema: str = None
) -> Tuple[str, str]:
    """
    Build system and user prompts for flashcard generation.
    
    Args:
        chunks: List of document chunks
        task_text: Task description
        max_chunk_chars: Maximum characters per chunk
        schema: JSON schema for response format
        
    Returns:
        Tuple of (system_prompt, user_prompt)
    """
    system_prompt = (
        "You are an IELTS study assistant. Use ONLY the provided context to generate flashcards.\n"
        "If something isn't in context, respond with 'Not in context'.\n"
        "Return STRICTLY valid JSON per schema. Keep answers concise and correct."
    )
    
    # Build context sections
    parts = []
    for i, chunk in enumerate(chunks, start=1):
        trimmed_chunk = trim_text(chunk, max_chunk_chars)
        parts.append(f"Context #{i}:\n{trimmed_chunk}\n")
    
    # Build user prompt
    user_prompt = "\n".join(parts) + "\n"
    user_prompt += f"Task: {task_text}\n\n"
    
    if schema:
        user_prompt += "Schema:\n" + schema + "\n\n"
    
    user_prompt += "Return ONLY JSON."
    
    return system_prompt, user_prompt

def build_qa_prompts(
    chunks: List[str],
    question: str,
    max_chunk_chars: int = 900
) -> Tuple[str, str]:
    """
    Build system and user prompts for question answering.
    
    Args:
        chunks: List of document chunks
        question: User question
        max_chunk_chars: Maximum characters per chunk
        
    Returns:
        Tuple of (system_prompt, user_prompt)
    """
    system_prompt = (
        "You are an IELTS study assistant. Use ONLY the provided context to answer questions.\n"
        "If the answer is not present in the context, respond with 'Not in context'.\n"
        "Keep answers concise and accurate."
    )
    
    # Build context sections
    parts = []
    for i, chunk in enumerate(chunks, start=1):
        trimmed_chunk = trim_text(chunk, max_chunk_chars)
        parts.append(f"Context #{i}:\n{trimmed_chunk}\n")
    
    # Build user prompt
    user_prompt = "\n".join(parts) + "\n"
    user_prompt += f"Question: {question}\n"
    user_prompt += "Answer:"
    
    return system_prompt, user_prompt

# Default task for IELTS flashcard generation
DEFAULT_FLASHCARD_TASK = (
    "Generate 20 flashcards mixing:\n"
    "- 40% KeyPoint_QA (key points and questions)\n"
    "- 20% YesNoNotGiven (must include supporting_span from context)\n"
    "- 30% Vocab_EN_VI (with part of speech and 1 example)\n"
    "- 10% Paraphrase (formal/informal or band-7 style)\n"
    "\n"
    "Ensure all flashcards are relevant to IELTS preparation and use only information from the provided context."
)

