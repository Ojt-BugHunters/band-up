"""
Text Chunking Module - Pure Python (no heavy dependencies).
"""

from typing import List, Optional
from dataclasses import dataclass


@dataclass
class ChunkMetadata:
    """Metadata for a text chunk."""
    chunk_id: str
    text: str
    page: Optional[int]
    char_start: int
    char_end: int
    size: int


def chunk_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 100
) -> List[str]:
    """
    Chunk text using recursive character splitting (pure Python).
    
    Splits on: paragraphs -> sentences -> words -> characters
    """
    if not text or not text.strip():
        return []
    
    separators = ["\n\n", "\n", ". ", " ", ""]
    return _recursive_split(text, separators, chunk_size, overlap)


def _recursive_split(
    text: str,
    separators: List[str],
    chunk_size: int,
    overlap: int
) -> List[str]:
    """Recursively split text on separators."""
    if not text:
        return []
    
    # If text fits in chunk, return it
    if len(text) <= chunk_size:
        return [text.strip()] if text.strip() else []
    
    # Try each separator
    for sep in separators:
        if sep == "":
            # Character-level split (last resort)
            return _split_by_chars(text, chunk_size, overlap)
        
        if sep in text:
            splits = text.split(sep)
            chunks = []
            current = ""
            
            for split in splits:
                piece = split + sep if sep != "" else split
                
                if len(current) + len(piece) <= chunk_size:
                    current += piece
                else:
                    if current.strip():
                        chunks.append(current.strip())
                    
                    # Handle overlap
                    if overlap > 0 and current:
                        overlap_text = current[-overlap:] if len(current) > overlap else current
                        current = overlap_text + piece
                    else:
                        current = piece
                    
                    # If piece itself is too large, recurse
                    if len(current) > chunk_size:
                        sub_chunks = _recursive_split(current, separators[separators.index(sep)+1:], chunk_size, overlap)
                        if sub_chunks:
                            chunks.extend(sub_chunks[:-1])
                            current = sub_chunks[-1] if sub_chunks else ""
            
            if current.strip():
                chunks.append(current.strip())
            
            return chunks
    
    return [text.strip()] if text.strip() else []


def _split_by_chars(text: str, chunk_size: int, overlap: int) -> List[str]:
    """Split by characters with overlap."""
    chunks = []
    start = 0
    
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start += chunk_size - overlap
    
    return chunks


def chunk_text_with_metadata(
    text: str,
    chunk_size: int = 500,
    overlap: int = 100,
    page_number: Optional[int] = None
) -> List[ChunkMetadata]:
    """Chunk text and return with metadata."""
    chunks = chunk_text(text, chunk_size, overlap)
    
    result = []
    char_pos = 0
    
    for i, chunk in enumerate(chunks):
        start = text.find(chunk[:50], char_pos) if len(chunk) >= 50 else text.find(chunk, char_pos)
        if start == -1:
            start = char_pos
        end = start + len(chunk)
        
        result.append(ChunkMetadata(
            chunk_id=f"chunk_{i}",
            text=chunk,
            page=page_number,
            char_start=start,
            char_end=end,
            size=len(chunk)
        ))
        
        char_pos = max(char_pos, end - overlap)
    
    return result
