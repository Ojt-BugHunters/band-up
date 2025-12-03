"""
IELTS Speaking AI Assessment System
Clean API-focused version for cloud deployment (AWS Lambda, etc.)
"""

import json
import logging
import os
import tempfile
from typing import Dict, Any, Optional, Union
from datetime import datetime
import librosa
import soundfile as sf

from gemini_evaluator import GeminiIELTSEvaluator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class IELTSSpeakingAssessment:
    """Main IELTS Speaking Assessment System for API usage"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the IELTS Speaking Assessment System
        
        Args:
            api_key: Google AI API key for Gemini (optional, will try environment variable)
        """
        self.gemini_evaluator = GeminiIELTSEvaluator(api_key=api_key)
        self.whisper_model = None
        logger.info("IELTS Speaking Assessment System initialized with Gemini API")
    
    def _load_whisper_model(self):
        """Load Whisper model for transcription using Hugging Face Transformers"""
        if self.whisper_model is None:
            try:
                import torch
                from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
                
                logger.info("Loading Whisper Large-v3-turbo model...")
                
                # Set device and data type
                device = "cuda:0" if torch.cuda.is_available() else "cpu"
                torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
                
                model_id = "openai/whisper-large-v3-turbo"
                
                # Load model and processor
                model = AutoModelForSpeechSeq2Seq.from_pretrained(
                    model_id, 
                    torch_dtype=torch_dtype, 
                    low_cpu_mem_usage=True, 
                    use_safetensors=True
                )
                model.to(device)
                
                processor = AutoProcessor.from_pretrained(model_id)
                
                # Create pipeline
                self.whisper_model = pipeline(
                    "automatic-speech-recognition",
                    model=model,
                    tokenizer=processor.tokenizer,
                    feature_extractor=processor.feature_extractor,
                    torch_dtype=torch_dtype,
                    device=device,
                )
                
                logger.info("Whisper Large-v3-turbo model loaded successfully")
                
            except ImportError:
                raise ImportError("Transformers not installed. Please install: pip install transformers torch")
            except Exception as e:
                raise Exception(f"Failed to load Whisper model: {str(e)}")
    
    def transcribe_audio(self, audio_file_path: Union[str, bytes], language: str = "en") -> Dict[str, Any]:
        """
        Transcribe audio file using Whisper
        
        Args:
            audio_file_path: Path to audio file or audio data as bytes
            language: Language code (default: "en" for English)
            
        Returns:
            Dictionary containing transcription results
        """
        logger.info("Starting audio transcription with Whisper")
        
        try:
            # Load Whisper model if not already loaded
            self._load_whisper_model()
            
            # Handle different input types
            if isinstance(audio_file_path, bytes):
                # Save bytes to temporary file
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                    temp_file.write(audio_file_path)
                    temp_audio_path = temp_file.name
            else:
                temp_audio_path = audio_file_path
            
            # Transcribe audio using Hugging Face pipeline
            result = self.whisper_model(
                temp_audio_path,
                return_timestamps=True,
                chunk_length_s=30,
                stride_length_s=5,
                generate_kwargs={"language": language}
            )
            
            # Clean up temporary file if created
            if isinstance(audio_file_path, bytes) and os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)
            
            # Extract transcription data from Hugging Face result
            transcript = result["text"].strip()
            segments = result.get("chunks", [])
            
            # Calculate duration from audio file
            try:
                audio_data, sample_rate = librosa.load(temp_audio_path if not isinstance(audio_file_path, bytes) else audio_file_path, sr=None)
                duration = len(audio_data) / sample_rate
            except:
                # Fallback: estimate duration from segments
                duration = segments[-1]["timestamp"][1] if segments and segments[-1].get("timestamp") else 0
            
            # Calculate speech rate
            word_count = len(transcript.split())
            speech_rate_wpm = (word_count / duration) * 60 if duration > 0 else 0
            
            transcription_result = {
                "status": "success",
                "transcript": transcript,
                "language": language,
                "duration": duration,
                "word_count": word_count,
                "speech_rate_wpm": speech_rate_wpm,
                "segments": segments,
                "confidence": 0.95,  # Hugging Face doesn't provide language probability
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"Transcription completed: {word_count} words, {duration:.1f}s duration")
            return transcription_result
            
        except Exception as e:
            logger.error(f"Error in audio transcription: {e}")
            return {
                "status": "error",
                "error": f"Transcription failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    def evaluate_speaking_from_transcript(self, transcript: str, question: str = None, 
                                        speech_rate_wpm: float = None, duration: float = None) -> Dict[str, Any]:
        """
        Evaluate IELTS speaking performance from transcript data
        
        Args:
            transcript: The transcribed speech text
            question: The IELTS speaking question (optional)
            speech_rate_wpm: Speech rate in words per minute (optional, will be calculated if not provided)
            duration: Duration in seconds (optional, will be estimated if not provided)
            
        Returns:
            Complete evaluation results with detailed analysis
        """
        logger.info("Starting IELTS Speaking Evaluation from transcript")
        
        # Validate input
        if not transcript or len(transcript.strip()) < 10:
            return {
                "status": "error",
                "error": "Transcript is too short. Please provide at least 10 words for evaluation.",
                "transcript": transcript,
                "timestamp": datetime.now().isoformat()
            }
        
        try:
            # Calculate basic metrics if not provided
            words = transcript.split()
            word_count = len(words)
            
            if speech_rate_wpm is None:
                # Estimate speech rate (average IELTS speaking rate is around 150 WPM)
                speech_rate_wpm = 150.0
            
            if duration is None:
                # Estimate duration from word count and speech rate
                duration = (word_count / speech_rate_wpm) * 60
            
            # Create fluency data structure
            fluency_data = {
                "transcript": transcript,
                "speech_rate_wpm": speech_rate_wpm,
                "duration": duration,
                "word_count": word_count,
                "filled_pauses": transcript.lower().count("um") + transcript.lower().count("uh") + transcript.lower().count("er"),
                "pause_frequency": 0.5,  # Estimated
                "repetitions": self._count_repetitions(words),
                "self_corrections": self._count_self_corrections(transcript),
                "pause_count": 0,  # Estimated
                "coherence_score": self._calculate_coherence_score(transcript)
            }
            
            # Analyze lexical resource
            lexical_data = self._analyze_lexical_resource(transcript)
            
            # Analyze grammatical range
            grammatical_data = self._analyze_grammatical_range(transcript)
            
            # Generate evaluation using Gemini API
            evaluation = self.gemini_evaluator.evaluate_speaking_enhanced(
                self._create_evaluation_prompt(fluency_data, lexical_data, grammatical_data, question),
                fluency_data, lexical_data, grammatical_data
            )
            
            # Combine all results
            result = {
                "status": "success",
                "transcript": transcript,
                "question": question,
                "fluency_analysis": fluency_data,
                "lexical_analysis": lexical_data,
                "grammatical_analysis": grammatical_data,
                "evaluation": evaluation,
                "system_info": {
                    "evaluator": "IELTS Speaking AI Assessment System",
                    "model": "Gemini 2.5 Flash API",
                    "version": "1.0.0",
                    "api_focused": True
                },
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info("Speaking evaluation completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error in speaking evaluation: {e}")
            return {
                "status": "error",
                "error": f"Evaluation failed: {str(e)}",
                "transcript": transcript,
                "timestamp": datetime.now().isoformat()
            }
    
    def _count_repetitions(self, words: list) -> int:
        """Count word repetitions"""
        repetitions = 0
        for i in range(len(words) - 1):
            if words[i].lower() == words[i + 1].lower():
                repetitions += 1
        return repetitions
    
    def _count_self_corrections(self, transcript: str) -> int:
        """Count self-corrections (heuristic based on common patterns)"""
        import re
        correction_patterns = [
            r"\b(I mean|actually|sorry|wait|no)\b",
            r"\b(uh|um|er)\s+\w+\s+(I mean|actually)\b",
            r"\b\w+\s+or\s+(rather|actually)\s+\w+\b"
        ]
        
        corrections = 0
        for pattern in correction_patterns:
            corrections += len(re.findall(pattern, transcript, re.IGNORECASE))
        
        return corrections
    
    def _calculate_coherence_score(self, transcript: str) -> float:
        """Calculate coherence score based on discourse markers and structure"""
        discourse_markers = [
            "first", "second", "third", "finally", "in addition", "moreover",
            "however", "on the other hand", "therefore", "as a result",
            "for example", "for instance", "in conclusion", "to summarize"
        ]
        
        marker_count = sum(transcript.lower().count(marker) for marker in discourse_markers)
        
        # Normalize by transcript length
        word_count = len(transcript.split())
        coherence_score = (marker_count / word_count) * 100 if word_count > 0 else 0
        
        return min(coherence_score, 10.0)  # Cap at 10
    
    def _analyze_lexical_resource(self, transcript: str) -> Dict[str, Any]:
        """Analyze lexical resource and vocabulary usage"""
        import re
        from collections import Counter
        
        # Clean and process text
        words = re.findall(r'\b[a-zA-Z]+\b', transcript.lower())
        unique_words = set(words)
        
        # Basic metrics
        vocabulary_size = len(unique_words)
        total_words = len(words)
        ttr = vocabulary_size / total_words if total_words > 0 else 0
        
        # Academic words (simplified list)
        academic_words = {
            "analyze", "approach", "area", "assess", "assume", "authority", "available",
            "benefit", "concept", "consistent", "constitute", "context", "contract",
            "create", "data", "define", "derive", "distribute", "economy", "environment",
            "establish", "estimate", "evident", "export", "factor", "finance", "formula",
            "function", "identify", "income", "indicate", "individual", "interpret",
            "involve", "issue", "labour", "legal", "legislate", "major", "method",
            "occur", "percent", "period", "policy", "principle", "procedure", "process",
            "project", "require", "research", "respond", "role", "section", "sector",
            "significant", "similar", "source", "specific", "structure", "theory",
            "therefore", "variable"
        }
        
        academic_word_count = sum(1 for word in unique_words if word in academic_words)
        academic_word_ratio = academic_word_count / vocabulary_size if vocabulary_size > 0 else 0
        
        # Word length analysis
        word_lengths = [len(word) for word in words]
        avg_word_length = sum(word_lengths) / len(word_lengths) if word_lengths else 0
        long_words = sum(1 for length in word_lengths if length > 6)
        long_word_ratio = long_words / len(words) if words else 0
        
        return {
            "vocabulary_size": vocabulary_size,
            "total_words": total_words,
            "vocabulary_ratio": ttr,
            "academic_word_count": academic_word_count,
            "academic_word_ratio": academic_word_ratio,
            "avg_word_length": avg_word_length,
            "long_word_ratio": long_word_ratio,
            "lexical_sophistication_score": (academic_word_ratio + long_word_ratio) / 2
        }
    
    def _analyze_grammatical_range(self, transcript: str) -> Dict[str, Any]:
        """Analyze grammatical range and accuracy"""
        import re
        
        # Split into sentences
        sentences = re.split(r'[.!?]+', transcript)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            return {"error": "No sentences found in transcript"}
        
        # Basic metrics
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences)
        
        # Count complex sentences
        complex_sentence_indicators = [
            "because", "although", "while", "since", "if", "when", "where", "which", "that",
            "who", "whom", "whose", "after", "before", "until", "unless", "provided",
            "in order to", "so that", "as if", "as though"
        ]
        
        complex_sentences = 0
        for sentence in sentences:
            if any(indicator in sentence.lower() for indicator in complex_sentence_indicators):
                complex_sentences += 1
        
        complexity_ratio = complex_sentences / len(sentences) if sentences else 0
        
        # Error detection (heuristic)
        common_errors = {
            "subject_verb_disagreement": r'\b(he|she|it)\s+(are|were)\b',
            "double_negative": r'\b(not|no)\s+\w+\s+(not|no)\b',
        }
        
        error_count = 0
        for error_type, pattern in common_errors.items():
            matches = re.findall(pattern, transcript, re.IGNORECASE)
            error_count += len(matches)
        
        error_rate = error_count / len(sentences) if sentences else 0
        accuracy_score = max(0, 10 - (error_rate * 10))
        
        return {
            "sentence_count": len(sentences),
            "avg_sentence_length": avg_sentence_length,
            "complex_sentence_count": complex_sentences,
            "complexity_ratio": complexity_ratio,
            "error_count": error_count,
            "error_rate": error_rate,
            "accuracy_score": accuracy_score,
            "grammatical_range_score": (complexity_ratio + (1 - error_rate)) / 2 * 10
        }
    
    def _create_evaluation_prompt(self, fluency_data: Dict[str, Any], lexical_data: Dict[str, Any], 
                                 grammatical_data: Dict[str, Any], question: str = None) -> str:
        """Create comprehensive IELTS evaluation prompt for Gemini API"""
        transcript = fluency_data.get("transcript", "")
        
        prompt = f"""You are an expert IELTS speaking examiner with extensive experience in evaluating speaking performance. You have access to detailed acoustic and linguistic analysis data from the candidate's speech. Use this comprehensive data to provide accurate band scores and actionable feedback.

IELTS SPEAKING QUESTION: {question or "General speaking task"}

TRANSCRIPT: "{transcript}"

COMPREHENSIVE SPEECH ANALYSIS DATA:

🗣️ FLUENCY AND COHERENCE ANALYSIS:
- Speech Rate: {fluency_data.get('speech_rate_wpm', 0):.1f} words per minute (Target: 120-180 WPM)
- Duration: {fluency_data.get('duration', 0):.1f} seconds
- Word Count: {fluency_data.get('word_count', 0)} words
- Filled Pauses: {fluency_data.get('filled_pauses', 0)} (um, uh, er - should be minimal)
- Repetitions: {fluency_data.get('repetitions', 0)} (word repetitions)
- Self-corrections: {fluency_data.get('self_corrections', 0)} (corrections during speech)
- Coherence Score: {fluency_data.get('coherence_score', 0):.1f}/10 (discourse markers usage)

📚 LEXICAL RESOURCE ANALYSIS:
- Vocabulary Size: {lexical_data.get('vocabulary_size', 0)} unique words (Target: 60+ for Band 6+)
- Type-Token Ratio: {lexical_data.get('vocabulary_ratio', 0):.3f} (Target: 0.6+ for good diversity)
- Academic Words: {lexical_data.get('academic_word_count', 0)} ({lexical_data.get('academic_word_ratio', 0):.1%} of vocabulary)
- Average Word Length: {lexical_data.get('avg_word_length', 0):.1f} characters (sophistication indicator)
- Long Words (>6 chars): {lexical_data.get('long_word_ratio', 0):.1%} (complex vocabulary)
- Lexical Sophistication Score: {lexical_data.get('lexical_sophistication_score', 0):.2f}/10

📝 GRAMMATICAL RANGE AND ACCURACY ANALYSIS:
- Sentence Count: {grammatical_data.get('sentence_count', 0)}
- Average Sentence Length: {grammatical_data.get('avg_sentence_length', 0):.1f} words (Target: 12+ for complexity)
- Complex Sentences: {grammatical_data.get('complex_sentence_count', 0)} ({grammatical_data.get('complexity_ratio', 0):.1%} of total)
- Grammatical Errors: {grammatical_data.get('error_count', 0)} (Target: <2 for Band 7+)
- Error Rate: {grammatical_data.get('error_rate', 0):.2f} errors per sentence
- Accuracy Score: {grammatical_data.get('accuracy_score', 0):.1f}/10
- Grammatical Range Score: {grammatical_data.get('grammatical_range_score', 0):.1f}/10

EVALUATION INSTRUCTIONS:

Based on the comprehensive analysis data above, provide:

1. BAND SCORES (1-9 scale) with justification:
   - Fluency and Coherence: [Band X.X] - Consider speech rate, pauses, disfluencies, coherence
   - Lexical Resource: [Band X.X] - Consider vocabulary size, diversity, sophistication
   - Grammatical Range and Accuracy: [Band X.X] - Consider complexity, accuracy, variety
   - Overall Band Score: [Band X.X] - Average of the three criteria

2. DETAILED FEEDBACK for each criterion:
   - Specific strengths based on the data
   - Areas for improvement with concrete examples
   - Targeted practice suggestions

3. IMPROVEMENT RECOMMENDATIONS:
   - Priority areas to focus on (based on lowest scores)
   - Specific practice exercises tailored to weaknesses
   - Study resources and techniques


Use the specific metrics provided to give precise, data-driven feedback. Be encouraging but honest in your assessment. Focus on actionable advice that will help the candidate improve their IELTS speaking performance.

Respond in JSON format:
{{
    "overall_band": 0-9,
    "fluency_coherence": {{
        "band": 0-9,
        "feedback": "detailed feedback",
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"],
        "improvements": ["improvement1", "improvement2"]
    }},
    "lexical_resource": {{
        "band": 0-9,
        "feedback": "detailed feedback",
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"],
        "improvements": ["improvement1", "improvement2"]
    }},
    "grammatical_range_accuracy": {{
        "band": 0-9,
        "feedback": "detailed feedback",
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"],
        "improvements": ["improvement1", "improvement2"]
    }},
    "pronunciation": {{
        "band": 0-9,
        "feedback": "detailed feedback",
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"],
        "improvements": ["improvement1", "improvement2"]
    }}
}}"""
        
        return prompt
    
    def generate_learning_guide(self, evaluation_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate personalized learning guide based on evaluation results
        
        Args:
            evaluation_result: Results from evaluate_speaking_from_transcript
            
        Returns:
            Dictionary containing the personalized learning guide text
        """
        if evaluation_result.get("status") == "error":
            return {
                "status": "error",
                "error": f"Cannot generate learning guide due to evaluation error: {evaluation_result['error']}"
            }
        
        try:
            fluency = evaluation_result["fluency_analysis"]
            lexical = evaluation_result["lexical_analysis"]
            grammatical = evaluation_result["grammatical_analysis"]
            evaluation = evaluation_result["evaluation"]
            transcript = fluency['transcript']
            
            fluency_feedback = evaluation.get('fluency_coherence', {}) if isinstance(evaluation, dict) else {}
            lexical_feedback = evaluation.get('lexical_resource', {}) if isinstance(evaluation, dict) else {}
            grammar_feedback = evaluation.get('grammatical_range_accuracy', {}) if isinstance(evaluation, dict) else {}
            
            learning_prompt = f"""You are an expert IELTS speaking coach. Create a personalized learning guide for this student based on their actual speech performance and detailed feedback.

STUDENT'S SPEECH DATA:
- **Transcript**: "{transcript}"
- **Overall Band Score**: {evaluation.get('overall_band', 'N/A') if isinstance(evaluation, dict) else 'N/A'}

PERFORMANCE METRICS:
- **Speech Rate**: {fluency['speech_rate_wpm']:.1f} WPM (Target: 120-180 WPM)
- **Duration**: {fluency['duration']:.1f} seconds
- **Word Count**: {fluency['word_count']} words
- **Filled Pauses**: {fluency['filled_pauses']} (Target: <3)
- **Repetitions**: {fluency['repetitions']}
- **Self-corrections**: {fluency['self_corrections']}
- **Vocabulary Size**: {lexical['vocabulary_size']} unique words
- **Academic Words**: {lexical['academic_word_count']}
- **Sentence Count**: {grammatical['sentence_count']}
- **Average Sentence Length**: {grammatical['avg_sentence_length']:.1f} words
- **Complex Sentences**: {grammatical['complex_sentence_count']} ({grammatical['complexity_ratio']:.1%})
- **Grammar Errors**: {grammatical['error_count']}

DETAILED FEEDBACK FROM EVALUATION:
**Fluency & Coherence**: {fluency_feedback.get('feedback', 'No specific feedback available')}
- Strengths: {', '.join(fluency_feedback.get('strengths', []))}
- Weaknesses: {', '.join(fluency_feedback.get('weaknesses', []))}
- Improvements: {', '.join(fluency_feedback.get('improvements', []))}

**Lexical Resource**: {lexical_feedback.get('feedback', 'No specific feedback available')}
- Strengths: {', '.join(lexical_feedback.get('strengths', []))}
- Weaknesses: {', '.join(lexical_feedback.get('weaknesses', []))}
- Improvements: {', '.join(lexical_feedback.get('improvements', []))}

**Grammar**: {grammar_feedback.get('feedback', 'No specific feedback available')}
- Strengths: {', '.join(grammar_feedback.get('strengths', []))}
- Weaknesses: {', '.join(grammar_feedback.get('weaknesses', []))}
- Improvements: {', '.join(grammar_feedback.get('improvements', []))}

TASK: Create a personalized learning guide that combines the transcript analysis with the detailed feedback above.

IMPORTANT: Start your response with "# 🎓 **Personalized Learning Guide**" and create sections:

1. **🎯 Priority Focus Areas** (identify their top 2-3 weaknesses from the feedback above)
2. **🔧 Vocabulary Improvements** (analyze their actual words from the transcript and suggest specific replacements)
3. **📚 Grammar Enhancements** (based on their sentence structure and the grammar feedback)
4. **🗣️ Fluency Development** (targeted advice based on the fluency feedback and metrics)
5. **📋 Improved Version** (rewrite their transcript with better vocabulary and grammar)

Requirements:
- Start with "# 🎓 **Personalized Learning Guide**"
- Use the detailed feedback above to guide your recommendations
- Be encouraging but honest about their current level
- Focus on their biggest weaknesses first (from the feedback)
- Provide specific, actionable advice
- Use their actual words from the transcript and suggest better alternatives
- Create realistic weekly goals
- Make it personal to their speech, not generic advice
- Keep the tone supportive and motivating
- Use markdown formatting without emojis

Format the response in clear sections without emojis and markdown formatting."""
            
            # Generate learning guide using Gemini API
            learning_guide_text = self.gemini_evaluator.generate_learning_guide(learning_prompt)
            
            if not learning_guide_text or len(learning_guide_text.strip()) < 200:
                learning_guide_text = "No learning guide generated."

            return {
                "status": "success",
                "learning_guide": learning_guide_text
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": f"Error generating learning guide: {str(e)}"
            }
    
    def evaluate_speaking_from_audio(self, audio_file_path: Union[str, bytes], question: str = None, 
                                   language: str = "en") -> Dict[str, Any]:
        """
        Complete pipeline: Transcribe audio and evaluate speaking performance
        
        Args:
            audio_file_path: Path to audio file or audio data as bytes
            question: The IELTS speaking question (optional)
            language: Language code for transcription (default: "en")
            
        Returns:
            Complete evaluation results with transcription and assessment
        """
        logger.info("Starting complete audio-to-evaluation pipeline")
        
        try:
            # Step 1: Transcribe audio
            transcription_result = self.transcribe_audio(audio_file_path, language)
            
            if transcription_result["status"] != "success":
                return {
                    "status": "error",
                    "error": f"Transcription failed: {transcription_result.get('error', 'Unknown error')}",
                    "transcription": transcription_result,
                    "timestamp": datetime.now().isoformat()
                }
            
            # Step 2: Evaluate speaking from transcript
            transcript = transcription_result["transcript"]
            duration = transcription_result["duration"]
            speech_rate_wpm = transcription_result["speech_rate_wpm"]
            
            evaluation_result = self.evaluate_speaking_from_transcript(
                transcript=transcript,
                question=question,
                speech_rate_wpm=speech_rate_wpm,
                duration=duration
            )
            
            # Step 3: Combine results
            if evaluation_result["status"] == "success":
                combined_result = {
                    "status": "success",
                    "transcription": transcription_result,
                    "evaluation": evaluation_result,
                    "system_info": {
                        "evaluator": "IELTS Speaking AI Assessment System",
                        "transcription_model": "Whisper Large-v3-turbo (Hugging Face)",
                        "evaluation_model": "Gemini 2.5 Flash API",
                        "version": "1.0.0",
                        "api_focused": True
                    },
                    "timestamp": datetime.now().isoformat()
                }
                
                logger.info("Complete audio-to-evaluation pipeline completed successfully")
                return combined_result
            else:
                return {
                    "status": "error",
                    "error": f"Evaluation failed: {evaluation_result.get('error', 'Unknown error')}",
                    "transcription": transcription_result,
                    "evaluation": evaluation_result,
                    "timestamp": datetime.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error in complete pipeline: {e}")
            return {
                "status": "error",
                "error": f"Pipeline failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model"""
        return {
            "status": "success",
            "speaking_model": self.gemini_evaluator.get_model_info(),
            "system": "IELTS Speaking AI Assessment System",
            "api_focused": True,
            "timestamp": datetime.now().isoformat()
        }

# API Functions for direct usage
def transcribe_audio(audio_file_path: Union[str, bytes], language: str = "en", api_key: str = None) -> Dict[str, Any]:
    """
    Transcribe audio file using Whisper - API function
    
    Args:
        audio_file_path: Path to audio file or audio data as bytes
        language: Language code for transcription (default: "en")
        api_key: Google AI API key for Gemini (optional)
        
    Returns:
        Transcription results
    """
    evaluator = IELTSSpeakingAssessment(api_key=api_key)
    return evaluator.transcribe_audio(audio_file_path, language)

def evaluate_speaking_from_audio(audio_file_path: Union[str, bytes], question: str = None, 
                                language: str = "en", api_key: str = None) -> Dict[str, Any]:
    """
    Complete pipeline: Transcribe audio and evaluate speaking - API function
    
    Args:
        audio_file_path: Path to audio file or audio data as bytes
        question: The IELTS speaking question (optional)
        language: Language code for transcription (default: "en")
        api_key: Google AI API key for Gemini (optional)
        
    Returns:
        Complete evaluation results with transcription and assessment
    """
    evaluator = IELTSSpeakingAssessment(api_key=api_key)
    return evaluator.evaluate_speaking_from_audio(audio_file_path, question, language)

def evaluate_speaking_from_transcript(transcript: str, question: str = None, 
                                    speech_rate_wpm: float = None, duration: float = None,
                                    api_key: str = None) -> Dict[str, Any]:
    """
    Evaluate IELTS speaking from transcript - API function
    
    Args:
        transcript: The transcribed speech text
        question: The IELTS speaking question (optional)
        speech_rate_wpm: Speech rate in words per minute (optional)
        duration: Duration in seconds (optional)
        api_key: Google AI API key for Gemini (optional)
        
    Returns:
        Complete evaluation results
    """
    evaluator = IELTSSpeakingAssessment(api_key=api_key)
    return evaluator.evaluate_speaking_from_transcript(transcript, question, speech_rate_wpm, duration)

def generate_learning_guide(evaluation_result: Dict[str, Any], api_key: str = None) -> Dict[str, Any]:
    """
    Generate learning guide from evaluation results - API function
    
    Args:
        evaluation_result: Results from evaluate_speaking_from_transcript
        api_key: Google AI API key for Gemini (optional)
        
    Returns:
        Learning guide and metadata
    """
    evaluator = IELTSSpeakingAssessment(api_key=api_key)
    return evaluator.generate_learning_guide(evaluation_result)

def get_model_info(api_key: str = None) -> Dict[str, Any]:
    """
    Get model information - API function
    
    Args:
        api_key: Google AI API key for Gemini (optional)
        
    Returns:
        Model information
    """
    evaluator = IELTSSpeakingAssessment(api_key=api_key)
    return evaluator.get_model_info()

def main():
    """Example usage with direct variables"""
    
    # ===== CONFIGURATION =====
    # Set your audio file path here
    audio_file_path = "E:/OJT//band-up//speaking_ai//IELTS_spk_3.mp3"  # Change this to your audio file path
    
    # Set your IELTS speaking question here
    question = "Are successful people often lonely?"  # Change this to your question
    
    # Set language (optional, defaults to "en")
    language = "en"  # Change this if needed (e.g., "zh", "es", "fr", etc.)
    
    print("IELTS Speaking AI Assessment - Audio Processing")
    print("=" * 50)
    print(f"Audio file: {audio_file_path}")
    print(f"Question: {question}")
    print(f"Language: {language}")
    print("=" * 50)
    
    # Check if audio file exists
    if not os.path.exists(audio_file_path):
        print(f"❌ Error: Audio file '{audio_file_path}' not found.")
        print("\nPlease:")
        print("1. Place your audio file in the current directory, or")
        print("2. Update the 'audio_file_path' variable in main() function with the correct path")
        print("\nSupported formats: MP3, WAV, M4A, FLAC, OGG")
        return
    
    # Process the audio file
    print(f"\n🎵 Processing audio file: {audio_file_path}")
    print("This may take 10-30 seconds depending on audio length...")
    
    try:
        # Complete pipeline: transcribe and evaluate
        result = evaluate_speaking_from_audio(
            audio_file_path=audio_file_path,
            question=question,
            language=language
        )
        
        # Create output directory
        output_dir = "output"
        os.makedirs(output_dir, exist_ok=True)
        
        # Save results to JSON files
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        audio_filename = os.path.splitext(os.path.basename(audio_file_path))[0]
        output_dir = os.path.join(output_dir, timestamp)
        os.makedirs(output_dir, exist_ok=True)
        
        # Save complete results
        complete_results_file = os.path.join(output_dir, f"results_{audio_filename}.json")
        with open(complete_results_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print(f"\n💾 Complete results saved to: {complete_results_file}")
        
        # Print results
        print("\n📊 RESULTS:")
        print("=" * 50)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        if result["status"] == "success":
            print(f"\n✅ Audio processing completed successfully!")
            print(f"   📝 Transcript: {result['transcription']['transcript']}")
            print(f"   ⏱️  Duration: {result['transcription']['duration']:.1f} seconds")
            print(f"   📊 Word Count: {result['transcription']['word_count']} words")
            print(f"   🗣️  Speech Rate: {result['transcription']['speech_rate_wpm']:.1f} WPM")
            print(f"   🎯 Overall Band Score: {result['evaluation']['evaluation']['overall_band']}")
            print(f"   📈 Fluency: {result['evaluation']['evaluation']['fluency_coherence']['band']}")
            print(f"   📚 Lexical: {result['evaluation']['evaluation']['lexical_resource']['band']}")
            print(f"   📝 Grammar: {result['evaluation']['evaluation']['grammatical_range_accuracy']['band']}")
            print(f"   🗣️  Pronunciation: {result['evaluation']['evaluation']['pronunciation']['band']}")
            
            # Generate learning guide
            print(f"\n📚 Generating learning guide...")
            try:
                learning_guide = generate_learning_guide(result['evaluation'])
            except Exception as e:
                print(f"❌ Error generating learning guide: {e}")
                learning_guide = {
                    "status": "error",
                    "error": f"Learning guide generation failed: {str(e)}"
                }
            
            if learning_guide.get("status") == "success":
                print(f"\n✅ Learning guide generated successfully!")
                
                # Get guide length safely
                guide_length = learning_guide.get('guide_length', len(learning_guide.get('learning_guide', '')))
                print(f"   📖 Guide length: {guide_length} characters")
                
                # Save learning guide separately

                # Also save as markdown file for easy reading
                learning_guide_md_file = os.path.join(output_dir, f"learning_guide_{audio_filename}.md")
                learning_guide_text = learning_guide.get('learning_guide', 'No learning guide content available')
                with open(learning_guide_md_file, 'w', encoding='utf-8') as f:
                    f.write(learning_guide_text)
                print(f"💾 Learning guide (markdown) saved to: {learning_guide_md_file}")
                
                print(f"\n🎓 LEARNING GUIDE:")
                print("=" * 50)
                print(learning_guide_text)
            else:
                print(f"\n❌ Learning guide generation failed: {learning_guide.get('error')}")
                
                # Still save the failed learning guide attempt
                learning_guide_file = os.path.join(output_dir, f"learning_guide_{audio_filename}_failed.json")
                with open(learning_guide_file, 'w', encoding='utf-8') as f:
                    json.dump(learning_guide, f, indent=2, ensure_ascii=False)
                print(f"💾 Failed learning guide attempt saved to: {learning_guide_file}")
        else:
            print(f"\n❌ Audio processing failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        print("Please check your audio file and try again.")
        
        # Save error result
        output_dir = "output"
        os.makedirs(output_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_dir = os.path.join(output_dir, timestamp)
        os.makedirs(output_dir, exist_ok=True)
        audio_filename = os.path.splitext(os.path.basename(audio_file_path))[0]
        error_file = os.path.join(output_dir, f"error_{audio_filename}.json")
        
        error_result = {
            "status": "error",
            "error": str(e),
            "audio_file": audio_file_path,
            "question": question,
            "language": language,
            "timestamp": datetime.now().isoformat()
        }
        
        with open(error_file, 'w', encoding='utf-8') as f:
            json.dump(error_result, f, indent=2, ensure_ascii=False)
        print(f"💾 Error details saved to: {error_file}")
    
    # Show model info
    print(f"\n🔧 MODEL INFORMATION:")
    print("=" * 50)
    model_info = get_model_info()
    print(json.dumps(model_info, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()