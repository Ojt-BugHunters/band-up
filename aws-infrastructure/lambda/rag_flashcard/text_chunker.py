"""Pure Python text chunker for Lambda."""

from typing import List


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:
    """Chunk text using recursive splitting."""
    if not text or not text.strip():
        return []
    
    separators = ["\n\n", "\n", ". ", " ", ""]
    return _recursive_split(text, separators, chunk_size, overlap)


def _recursive_split(text: str, separators: List[str], chunk_size: int, overlap: int) -> List[str]:
    if not text:
        return []
    
    if len(text) <= chunk_size:
        return [text.strip()] if text.strip() else []
    
    for sep in separators:
        if sep == "":
            return _split_by_chars(text, chunk_size, overlap)
        
        if sep in text:
            splits = text.split(sep)
            chunks = []
            current = ""
            
            for split in splits:
                piece = split + sep if sep else split
                
                if len(current) + len(piece) <= chunk_size:
                    current += piece
                else:
                    if current.strip():
                        chunks.append(current.strip())
                    
                    if overlap > 0 and current:
                        overlap_text = current[-overlap:] if len(current) > overlap else current
                        current = overlap_text + piece
                    else:
                        current = piece
                    
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
    chunks = []
    start = 0
    
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start += chunk_size - overlap
    
    return chunks
