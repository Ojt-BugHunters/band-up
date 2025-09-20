"""
FastAPI Web API for IELTS Speaking AI Assessment
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tempfile
import os
from main import IELTSSpeakingEvaluator
import uvicorn

app = FastAPI(
    title="IELTS Speaking AI Assessment API",
    description="AI-powered IELTS speaking evaluation using Whisper Large-v3",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global evaluator instance
evaluator = None

@app.on_event("startup")
async def startup_event():
    """Initialize the evaluator on startup"""
    global evaluator
    try:
        evaluator = IELTSSpeakingEvaluator()
        evaluator.load_models()
        print("✅ IELTS Speaking AI Assessment System ready!")
    except Exception as e:
        print(f"❌ Failed to initialize system: {e}")
        raise

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "IELTS Speaking AI Assessment API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    if evaluator is None:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    return {
        "status": "healthy",
        "models_loaded": evaluator.asr_model is not None,
        "device": evaluator.device,
        "model_id": evaluator.model_id
    }

@app.post("/evaluate")
async def evaluate_speaking(
    audio: UploadFile = File(..., description="Audio file (WAV, MP3, M4A)"),
    question: str = Form(None, description="IELTS speaking question (optional)"),
    language: str = Form("english", description="Language code (default: english)")
):
    """
    Evaluate IELTS speaking performance
    
    Args:
        audio: Audio file containing the speaking sample
        question: The IELTS speaking question (optional)
        language: Language code for transcription (default: english)
    
    Returns:
        JSON response with band scores and detailed feedback
    """
    if evaluator is None:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    # Validate audio file
    if not audio.content_type.startswith('audio/'):
        raise HTTPException(
            status_code=400, 
            detail="File must be an audio file (WAV, MP3, M4A, etc.)"
        )
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        content = await audio.read()
        temp_file.write(content)
        temp_file_path = temp_file.name
    
    try:
        # Evaluate speaking performance
        result = evaluator.evaluate_speaking(
            audio_path=temp_file_path,
            question=question
        )
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return JSONResponse(content=result)
        
    except Exception as e:
        # Clean up temporary file in case of error
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

@app.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(..., description="Audio file to transcribe"),
    language: str = Form("english", description="Language code")
):
    """
    Transcribe audio to text using Whisper Large-v3
    
    Args:
        audio: Audio file to transcribe
        language: Language code for transcription
    
    Returns:
        JSON response with transcription and metadata
    """
    if evaluator is None:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    # Validate audio file
    if not audio.content_type.startswith('audio/'):
        raise HTTPException(
            status_code=400, 
            detail="File must be an audio file"
        )
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        content = await audio.read()
        temp_file.write(content)
        temp_file_path = temp_file.name
    
    try:
        # Transcribe audio
        result = evaluator.transcribe_audio(temp_file_path)
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return JSONResponse(content=result)
        
    except Exception as e:
        # Clean up temporary file in case of error
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@app.get("/models/info")
async def get_model_info():
    """Get information about loaded models"""
    if evaluator is None:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    return {
        "asr_model": {
            "name": "Whisper Large-v3",
            "model_id": evaluator.model_id,
            "device": evaluator.device,
            "torch_dtype": str(evaluator.torch_dtype),
            "loaded": evaluator.asr_model is not None
        },
        "supported_languages": [
            "english", "spanish", "french", "german", "italian", "portuguese",
            "russian", "japanese", "korean", "chinese", "arabic", "hindi"
        ],
        "supported_formats": ["wav", "mp3", "m4a", "flac", "ogg"]
    }

if __name__ == "__main__":
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
