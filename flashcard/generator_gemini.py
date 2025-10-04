"""Gemini API integration for the Local PDF RAG Pipeline."""

import os
import json
import logging
from typing import Dict, Any

import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from config import config

logger = logging.getLogger(__name__)

# Configure Gemini API
if config.gemini_api_key:
    genai.configure(api_key=config.gemini_api_key)

# Generation configuration
GENERATION_CONFIG = {
    "temperature": config.temperature,
    "max_output_tokens": config.max_output_tokens,
    "response_mime_type": "application/json",  # Force JSON response
}

class GeminiCallError(Exception):
    """Custom exception for Gemini API errors."""
    pass

@retry(
    reraise=True,
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=8),
    retry=retry_if_exception_type(GeminiCallError),
)
def call_gemini_json(system_prompt: str, user_prompt: str, model: str = None) -> Dict[str, Any]:
    """
    Send a prompt to Gemini and return parsed JSON.
    
    Args:
        system_prompt: System instruction for the model
        user_prompt: User prompt with context and task
        model: Gemini model to use (defaults to config model)
        
    Returns:
        Parsed JSON response as dictionary
        
    Raises:
        GeminiCallError: If API call fails or returns invalid JSON
    """
    if not config.gemini_api_key:
        raise GeminiCallError("GOOGLE_API_KEY environment variable is required")
    
    if model is None:
        model = config.gemini_model
    
    try:
        # Create model with system instruction
        model_obj = genai.GenerativeModel(
            model_name=model,
            system_instruction=system_prompt
        )
        
        # Generate content
        response = model_obj.generate_content(
            [{"role": "user", "parts": [user_prompt]}],
            generation_config=GENERATION_CONFIG
        )
        
        # Extract text content
        content = getattr(response, "text", None)
        if content is None:
            # Fallback to candidates parsing
            try:
                content = response.candidates[0].content.parts[0].text
            except (IndexError, AttributeError):
                raise GeminiCallError("Empty response from Gemini")
        
        # Parse JSON with better error handling
        try:
            result = json.loads(content)
            logger.info(f"Successfully generated response from {model}")
            return result
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON response: {content[:500]}...")
            logger.error(f"JSON Error: {e}")
            
            # Try to fix common JSON issues
            try:
                # Remove any trailing incomplete content
                content_cleaned = content.strip()
                
                # Fix unterminated strings by finding the last complete JSON structure
                if not content_cleaned.endswith('}'):
                    # Find the last complete closing brace
                    brace_count = 0
                    last_complete_pos = -1
                    for i, char in enumerate(content_cleaned):
                        if char == '{':
                            brace_count += 1
                        elif char == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                last_complete_pos = i
                    
                    if last_complete_pos > 0:
                        content_cleaned = content_cleaned[:last_complete_pos + 1]
                    else:
                        # If no complete structure found, try to close it manually
                        if content_cleaned.count('{') > content_cleaned.count('}'):
                            content_cleaned += '}' * (content_cleaned.count('{') - content_cleaned.count('}'))
                
                # Remove trailing commas
                content_cleaned = content_cleaned.rstrip(',')
                
                result = json.loads(content_cleaned)
                logger.info("Successfully fixed and parsed JSON response")
                return result
            except json.JSONDecodeError:
                # If still failing, try to extract just the cards array
                try:
                    # Look for the cards array specifically
                    cards_start = content.find('"cards": [')
                    if cards_start != -1:
                        # Find the end of the cards array
                        bracket_count = 0
                        cards_end = -1
                        for i in range(cards_start + 9, len(content)):
                            if content[i] == '[':
                                bracket_count += 1
                            elif content[i] == ']':
                                bracket_count -= 1
                                if bracket_count == 0:
                                    cards_end = i
                                    break
                        
                        if cards_end > cards_start:
                            cards_content = content[cards_start-1:cards_end+2]  # Include surrounding braces
                            result = json.loads(cards_content)
                            logger.info("Successfully extracted cards array from truncated JSON")
                            return result
                except json.JSONDecodeError:
                    pass
                
                raise GeminiCallError(f"Gemini returned non-JSON. Error: {e}. Content: {content[:200]}...")
    
    except Exception as e:
        if "GeminiCallError" in str(type(e)):
            raise
        else:
            # Network/timeout/rate-limit errors -> retry
            raise GeminiCallError(str(e))

def generate_flashcards(chunks: list, task_text: str, max_chunk_chars: int = None) -> Dict[str, Any]:
    """
    Generate IELTS flashcards from document chunks.
    
    Args:
        chunks: List of relevant document chunks
        task_text: Task description for flashcard generation
        max_chunk_chars: Maximum characters per chunk (defaults to config)
        
    Returns:
        Dictionary containing generated flashcards
    """
    if max_chunk_chars is None:
        max_chunk_chars = config.max_chunk_chars
    
    # System prompt for IELTS flashcard generation
    system_prompt = (
        "You are an IELTS study assistant. Use ONLY the provided context to generate flashcards.\n"
        "If something isn't in context, respond with 'Not in context'.\n"
        "Return STRICTLY valid JSON per schema. Keep answers concise and correct.\n"
        "IMPORTANT: Ensure all JSON strings are properly closed and the response is complete JSON."
    )
    
    # Build user prompt with context (limit to prevent token overflow)
    user_prompt_parts = []
    for i, chunk in enumerate(chunks[:2], start=1):  # Limit to 2 chunks max
        trimmed_chunk = chunk[:max_chunk_chars].rstrip()
        user_prompt_parts.append(f"Context #{i}:\n{trimmed_chunk}\n")
    
    user_prompt = "\n".join(user_prompt_parts) + "\n"
    user_prompt += f"Task: {task_text}\n\n"
    user_prompt += "Schema:\n" + FLASHCARD_JSON_SCHEMA + "\n\n"
    user_prompt += "Return ONLY valid JSON. Keep responses concise to avoid truncation. Generate exactly 3-5 flashcards maximum."
    
    # Call Gemini API
    result = call_gemini_json(system_prompt, user_prompt)
    
    logger.info(f"Generated flashcards: {len(result.get('cards', []))} cards")
    return result

# JSON Schema for IELTS flashcards
FLASHCARD_JSON_SCHEMA = """{
  "cards": [
    {
      "type": "KeyPoint_QA",
      "front": "What is the main topic?",
      "back": "The main topic is...",
      "difficulty": "medium",
      "source": {"doc_id": "document.pdf", "page": 1},
      "supporting_span": "relevant text from document",
      "tags": ["ielts_reading"]
    }
  ]
}"""
