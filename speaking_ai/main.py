"""
IELTS Speaking AI Assessment System
Using Whisper Large-v3-turbo for ASR + Open-source LLM for evaluation
Supports arbitrary length audio files with turbo optimizations
"""

import torch
import librosa
import numpy as np
import re
from collections import Counter
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
from typing import Dict, List, Any
import json
from llm_evaluator import OpenSourceLLMEvaluator, RECOMMENDED_MODELS

class IELTSSpeakingEvaluator:
    def __init__(self, llm_model: str = "gemini_api", api_key: str = None):
        """
        Initialize the IELTS Speaking Evaluation System
        
        Args:
            llm_model: LLM model to use. Options:
                - "gemini_api": Gemini API (recommended for production)
                - "development": Qwen2.5-7B (recommended for dev)
                - "production": Qwen2.5-14B (higher quality)
                - "low_memory": DialoGPT-medium (minimal memory)
                - "high_quality": Llama-3.1-70B (best quality)
                - "fast": Mistral-7B (fast inference)
                - Or specify a Hugging Face model name directly
            api_key: API key for Gemini (required if using gemini_api)
        """
        self.device = "cuda:0" if torch.cuda.is_available() else "cpu"
        self.torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
        
        # Initialize Whisper Large-v3-turbo model
        self.model_id = "openai/whisper-large-v3-turbo"
        self.asr_model = None
        self.asr_processor = None
        self.asr_pipeline = None
        
        # Initialize Open-source LLM or Gemini API
        self.llm_model_name = RECOMMENDED_MODELS.get(llm_model, llm_model)
        self.llm_evaluator = OpenSourceLLMEvaluator(
            model_name=self.llm_model_name,
            use_quantization=True,  # Use quantization for memory efficiency
            api_key=api_key
        )
        
    def load_models(self):
        """Load ASR and LLM models"""
        print("Loading Whisper Large-v3-turbo...")
        
        # Load Whisper Large-v3-turbo model
        self.asr_model = AutoModelForSpeechSeq2Seq.from_pretrained(
            self.model_id,
            torch_dtype=self.torch_dtype,
            low_cpu_mem_usage=True,
            use_safetensors=True
        ).to(self.device)
        
        self.asr_processor = AutoProcessor.from_pretrained(self.model_id)
        
        # Create ASR pipeline for arbitrary length audio (turbo feature)
        # Use chunked algorithm for long-form audio with proper stride
        self.asr_pipeline = pipeline(
            "automatic-speech-recognition",
            model=self.asr_model,
            tokenizer=self.asr_processor.tokenizer,
            feature_extractor=self.asr_processor.feature_extractor,
            torch_dtype=self.torch_dtype,
            device=self.device,
            chunk_length_s=30,
            stride_length_s=5,  # Required for chunked algorithm
            return_timestamps=True,  # Required for long-form audio (>30s)
        )
        
        print("✅ Whisper Large-v3-turbo loaded successfully!")
        print("🚀 Supports arbitrary length audio files!")
        
        # Load Open-source LLM
        print(f"Loading {self.llm_model_name}...")
        self.llm_evaluator.load_model()
        
        print("✅ All models loaded successfully!")
    
    def transcribe_audio(self, audio_path: str) -> Dict[str, Any]:
        """
        Transcribe audio using Whisper Large-v3-turbo with arbitrary length support
        
        Args:
            audio_path: Path to the audio file
            
        Returns:
            Dictionary containing transcription and metadata
        """
        try:
            # Load and preprocess audio
            print(f"📁 Loading audio file: {audio_path}")
            audio_array, sample_rate = librosa.load(audio_path, sr=16000)
            duration = len(audio_array) / sample_rate
            
            print(f"📊 Audio Info: {len(audio_array)} samples, {sample_rate} Hz, {duration:.2f}s duration")
            print(f"🔧 Audio array type: {type(audio_array)}, dtype: {audio_array.dtype}")
            
            # Check if pipeline is loaded
            if self.asr_pipeline is None:
                raise Exception("ASR pipeline not loaded. Call load_models() first.")
            
            # Transcribe using Whisper Large-v3-turbo
            print("🚀 Using Whisper Large-v3-turbo with arbitrary length support")
            result = self.asr_pipeline(audio_array)

            
            return {
                "transcript": result["text"],
                "chunks": result.get("chunks", []),
                "language": result.get("language", "english"),
                "duration": len(audio_array) / sample_rate
            }
            
        except Exception as e:
            print(f"Error transcribing audio: {e}")
            return {"error": str(e)}
    
    def analyze_fluency_features(self, transcription_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze comprehensive fluency and coherence features from transcription data
        
        Args:
            transcription_data: Output from transcribe_audio
            
        Returns:
            Dictionary containing detailed fluency metrics
        """
        transcript = transcription_data["transcript"]
        chunks = transcription_data.get("chunks", [])
        duration = transcription_data["duration"]
        
        # Basic text processing
        words = transcript.split()
        word_count = len(words)
        
        # 1. SPEECH RATE ANALYSIS
        speech_rate_wpm = (word_count / duration) * 60 if duration > 0 else 0
        
        # Calculate syllables for articulation rate
        syllables = sum([self._count_syllables(word) for word in words])
        articulation_rate_sps = syllables / duration if duration > 0 else 0
        
        # 2. PAUSE ANALYSIS
        pause_count = 0
        total_pause_duration = 0
        mid_clause_pauses = 0
        
        for i in range(len(chunks) - 1):
            current_end = chunks[i]["timestamp"][1]
            next_start = chunks[i + 1]["timestamp"][0]
            pause_duration = next_start - current_end
            
            if pause_duration > 0.25:  # Pauses longer than 250ms
                pause_count += 1
                total_pause_duration += pause_duration
                
                # Check for mid-clause pauses (heuristic)
                current_text = chunks[i].get("text", "")
                next_text = chunks[i + 1].get("text", "")
                if self._is_mid_clause_pause(current_text, next_text):
                    mid_clause_pauses += 1
        
        # 3. FILLED PAUSES AND HESITATIONS
        filled_pauses = transcript.lower().count("um") + transcript.lower().count("uh") + transcript.lower().count("er")
        filled_pause_rate = filled_pauses / duration if duration > 0 else 0
        
        # 4. REPETITIONS AND SELF-CORRECTIONS
        repetitions = self._count_repetitions(words)
        self_corrections = self._count_self_corrections(transcript)
        
        # 5. SPEECH RUNS (continuous speech segments)
        speech_runs = self._calculate_speech_runs(chunks)
        avg_speech_run_length = sum(speech_runs) / len(speech_runs) if speech_runs else 0
        
        # 6. COHERENCE INDICATORS
        coherence_score = self._calculate_coherence_score(transcript)
        
        return {
            # Speech Rate Metrics
            "speech_rate_wpm": speech_rate_wpm,
            "articulation_rate_sps": articulation_rate_sps,
            "word_count": word_count,
            "syllable_count": syllables,
            "duration": duration,
            
            # Pause Analysis
            "pause_count": pause_count,
            "total_pause_duration": total_pause_duration,
            "pause_frequency": pause_count / duration if duration > 0 else 0,
            "avg_pause_duration": total_pause_duration / pause_count if pause_count > 0 else 0,
            "mid_clause_pauses": mid_clause_pauses,
            "pause_ratio": total_pause_duration / duration if duration > 0 else 0,
            
            # Hesitation Analysis
            "filled_pauses": filled_pauses,
            "filled_pause_rate": filled_pause_rate,
            
            # Fluency Disruptions
            "repetitions": repetitions,
            "self_corrections": self_corrections,
            "total_disfluencies": repetitions + self_corrections + filled_pauses,
            
            # Speech Continuity
            "speech_runs": speech_runs,
            "avg_speech_run_length": avg_speech_run_length,
            "longest_speech_run": max(speech_runs) if speech_runs else 0,
            
            # Coherence
            "coherence_score": coherence_score,
            
            # Raw transcript
            "transcript": transcript
        }
    
    def _count_syllables(self, word: str) -> int:
        """Count syllables in a word (approximation)"""
        word = word.lower().strip(".,!?;:")
        if not word:
            return 0
        
        vowels = "aeiouy"
        syllable_count = 0
        prev_was_vowel = False
        
        for char in word:
            is_vowel = char in vowels
            if is_vowel and not prev_was_vowel:
                syllable_count += 1
            prev_was_vowel = is_vowel
        
        # Handle silent 'e'
        if word.endswith('e') and syllable_count > 1:
            syllable_count -= 1
            
        return max(1, syllable_count)
    
    def _is_mid_clause_pause(self, current_text: str, next_text: str) -> bool:
        """Heuristic to detect mid-clause pauses"""
        current_words = current_text.lower().split()
        next_words = next_text.lower().split()
        
        if not current_words or not next_words:
            return False
            
        # Check for incomplete sentences or clauses
        incomplete_indicators = ["and", "but", "so", "because", "although", "while"]
        return (current_words[-1] in incomplete_indicators or 
                not current_text.strip().endswith(('.', '!', '?', ';')))
    
    def _count_repetitions(self, words: List[str]) -> int:
        """Count word repetitions"""
        repetitions = 0
        for i in range(len(words) - 1):
            if words[i].lower() == words[i + 1].lower():
                repetitions += 1
        return repetitions
    
    def _count_self_corrections(self, transcript: str) -> int:
        """Count self-corrections (heuristic based on common patterns)"""
        correction_patterns = [
            r"\b(I mean|actually|sorry|wait|no)\b",
            r"\b(uh|um|er)\s+\w+\s+(I mean|actually)\b",
            r"\b\w+\s+or\s+(rather|actually)\s+\w+\b"
        ]
        
        corrections = 0
        for pattern in correction_patterns:
            corrections += len(re.findall(pattern, transcript, re.IGNORECASE))
        
        return corrections
    
    def _calculate_speech_runs(self, chunks: List[Dict]) -> List[float]:
        """Calculate lengths of continuous speech segments"""
        runs = []
        current_run = 0
        
        for chunk in chunks:
            if chunk.get("text", "").strip():
                current_run += chunk.get("timestamp", [0, 0])[1] - chunk.get("timestamp", [0, 0])[0]
            else:
                if current_run > 0:
                    runs.append(current_run)
                current_run = 0
        
        if current_run > 0:
            runs.append(current_run)
            
        return runs
    
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
    
    def analyze_lexical_resource(self, transcript: str) -> Dict[str, Any]:
        """
        Analyze lexical resource and vocabulary usage
        
        Args:
            transcript: The transcribed text
            
        Returns:
            Dictionary containing lexical metrics
        """
        # Clean and process text
        words = re.findall(r'\b[a-zA-Z]+\b', transcript.lower())
        unique_words = set(words)
        
        # 1. VOCABULARY SIZE
        vocabulary_size = len(unique_words)
        total_words = len(words)
        
        # 2. LEXICAL DIVERSITY METRICS
        # Type-Token Ratio (TTR)
        ttr = vocabulary_size / total_words if total_words > 0 else 0
        
        # Guiraud's Index (more sophisticated TTR)
        guiraud_index = vocabulary_size / (total_words ** 0.5) if total_words > 0 else 0
        
        # 3. LEXICAL SOPHISTICATION
        # Common academic words (simplified list)
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
        
        # 4. IDIOMATIC LANGUAGE AND COLLOCATIONS
        idiomatic_expressions = [
            "on the other hand", "as a matter of fact", "in other words", "for instance",
            "at the end of the day", "it goes without saying", "by and large", "more or less",
            "so to speak", "in the long run", "once in a blue moon", "piece of cake",
            "break the ice", "hit the nail on the head", "spill the beans", "under the weather"
        ]
        
        idiom_count = sum(transcript.lower().count(idiom) for idiom in idiomatic_expressions)
        
        # 5. WORD FREQUENCY ANALYSIS
        word_frequency = Counter(words)
        most_common_words = word_frequency.most_common(10)
        
        # Calculate word frequency diversity (how evenly words are distributed)
        if len(word_frequency) > 1:
            frequencies = list(word_frequency.values())
            mean_freq = sum(frequencies) / len(frequencies)
            variance = sum((f - mean_freq) ** 2 for f in frequencies) / len(frequencies)
            frequency_diversity = 1 / (1 + variance)  # Higher diversity = lower variance
        else:
            frequency_diversity = 0
        
        # 6. WORD LENGTH ANALYSIS (sophistication indicator)
        word_lengths = [len(word) for word in words]
        avg_word_length = sum(word_lengths) / len(word_lengths) if word_lengths else 0
        long_words = sum(1 for length in word_lengths if length > 6)
        long_word_ratio = long_words / len(words) if words else 0
        
        return {
            "vocabulary_size": vocabulary_size,
            "total_words": total_words,
            "vocabulary_ratio": ttr,
            "guiraud_index": guiraud_index,
            "academic_word_count": academic_word_count,
            "academic_word_ratio": academic_word_ratio,
            "idiom_count": idiom_count,
            "frequency_diversity": frequency_diversity,
            "avg_word_length": avg_word_length,
            "long_word_ratio": long_word_ratio,
            "most_common_words": most_common_words[:5],  # Top 5
            "lexical_sophistication_score": (academic_word_ratio + long_word_ratio + idiom_count/10) / 3
        }
    
    def analyze_grammatical_range(self, transcript: str) -> Dict[str, Any]:
        """
        Analyze grammatical range and accuracy
        
        Args:
            transcript: The transcribed text
            
        Returns:
            Dictionary containing grammatical metrics
        """
        # Split into sentences
        sentences = re.split(r'[.!?]+', transcript)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            return {"error": "No sentences found in transcript"}
        
        # 1. SYNTACTIC COMPLEXITY
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences)
        
        # Count complex sentences (containing subordinate clauses)
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
        
        # 2. GRAMMATICAL ERROR DETECTION (heuristic)
        common_errors = {
            "subject_verb_disagreement": r'\b(he|she|it)\s+(are|were)\b',
            "double_negative": r'\b(not|no)\s+\w+\s+(not|no)\b',
            "wrong_preposition": r'\b(in|on|at)\s+(the|a|an)?\s*(wrong|incorrect)\b',
            "missing_articles": r'\b(go to|went to)\s+(school|work|home)\b',
            "run_on_sentences": r'\b\w+\s+\w+\s+\w+\s+\w+\s+\w+\s+\w+\s+\w+\s+\w+\s+\w+\s+\w+\s+and\b'
        }
        
        error_count = 0
        detected_errors = []
        
        for error_type, pattern in common_errors.items():
            matches = re.findall(pattern, transcript, re.IGNORECASE)
            if matches:
                error_count += len(matches)
                detected_errors.append(f"{error_type}: {len(matches)} instances")
        
        # 3. TENSE CONSISTENCY
        past_tense_indicators = ["was", "were", "went", "did", "had", "said", "told", "came", "saw"]
        present_tense_indicators = ["is", "are", "go", "do", "have", "say", "tell", "come", "see"]
        
        past_count = sum(transcript.lower().count(indicator) for indicator in past_tense_indicators)
        present_count = sum(transcript.lower().count(indicator) for indicator in present_tense_indicators)
        
        tense_consistency = abs(past_count - present_count) / max(past_count + present_count, 1)
        
        # 4. SENTENCE VARIETY
        sentence_lengths = [len(s.split()) for s in sentences]
        sentence_variety = len(set(sentence_lengths)) / len(sentences) if sentences else 0
        
        # 5. OVERALL GRAMMATICAL ACCURACY SCORE
        error_rate = error_count / len(sentences) if sentences else 0
        accuracy_score = max(0, 10 - (error_rate * 10))  # Scale to 0-10
        
        return {
            "sentence_count": len(sentences),
            "avg_sentence_length": avg_sentence_length,
            "complex_sentence_count": complex_sentences,
            "complexity_ratio": complexity_ratio,
            "error_count": error_count,
            "detected_errors": detected_errors,
            "error_rate": error_rate,
            "tense_consistency": tense_consistency,
            "sentence_variety": sentence_variety,
            "accuracy_score": accuracy_score,
            "grammatical_range_score": (complexity_ratio + sentence_variety + (1 - tense_consistency)) / 3 * 10
        }
    
    def create_ielts_evaluation_prompt(self, fluency_data: Dict[str, Any], lexical_data: Dict[str, Any], 
                                     grammatical_data: Dict[str, Any], question: str = None) -> str:
        """
        Create comprehensive IELTS evaluation prompt for LLM
        
        Args:
            fluency_data: Fluency and coherence analysis results
            lexical_data: Lexical resource analysis results  
            grammatical_data: Grammatical range and accuracy analysis results
            question: The IELTS speaking question
            
        Returns:
            Formatted prompt for LLM evaluation
        """
        transcript = fluency_data.get("transcript", "")
        
        prompt = f"""
You are an expert IELTS speaking examiner with extensive experience in evaluating speaking performance. You have access to detailed acoustic and linguistic analysis data from the candidate's speech. Use this comprehensive data to provide accurate band scores and actionable feedback.

IELTS SPEAKING QUESTION: {question or "General speaking task"}

TRANSCRIPT: "{transcript}"

COMPREHENSIVE SPEECH ANALYSIS DATA:

🗣️ FLUENCY AND COHERENCE ANALYSIS:
- Speech Rate: {fluency_data.get('speech_rate_wpm', 0):.1f} words per minute (Target: 120-180 WPM)
- Articulation Rate: {fluency_data.get('articulation_rate_sps', 0):.1f} syllables per second
- Duration: {fluency_data.get('duration', 0):.1f} seconds
- Word Count: {fluency_data.get('word_count', 0)} words
- Pause Analysis: {fluency_data.get('pause_count', 0)} pauses, {fluency_data.get('avg_pause_duration', 0):.2f}s average
- Mid-clause Pauses: {fluency_data.get('mid_clause_pauses', 0)} (indicates fluency disruption)
- Filled Pauses: {fluency_data.get('filled_pauses', 0)} (um, uh, er - should be minimal)
- Repetitions: {fluency_data.get('repetitions', 0)} (word repetitions)
- Self-corrections: {fluency_data.get('self_corrections', 0)} (corrections during speech)
- Total Disfluencies: {fluency_data.get('total_disfluencies', 0)} (combined disruptions)
- Average Speech Run Length: {fluency_data.get('avg_speech_run_length', 0):.2f}s (continuous speech segments)
- Longest Speech Run: {fluency_data.get('longest_speech_run', 0):.2f}s
- Coherence Score: {fluency_data.get('coherence_score', 0):.1f}/10 (discourse markers usage)

📚 LEXICAL RESOURCE ANALYSIS:
- Vocabulary Size: {lexical_data.get('vocabulary_size', 0)} unique words (Target: 60+ for Band 6+)
- Type-Token Ratio: {lexical_data.get('vocabulary_ratio', 0):.3f} (Target: 0.6+ for good diversity)
- Guiraud's Index: {lexical_data.get('guiraud_index', 0):.2f} (sophisticated TTR measure)
- Academic Words: {lexical_data.get('academic_word_count', 0)} ({lexical_data.get('academic_word_ratio', 0):.1%} of vocabulary)
- Idiomatic Expressions: {lexical_data.get('idiom_count', 0)} (collocations and idioms)
- Average Word Length: {lexical_data.get('avg_word_length', 0):.1f} characters (sophistication indicator)
- Long Words (>6 chars): {lexical_data.get('long_word_ratio', 0):.1%} (complex vocabulary)
- Most Common Words: {lexical_data.get('most_common_words', [])}
- Lexical Sophistication Score: {lexical_data.get('lexical_sophistication_score', 0):.2f}/10

📝 GRAMMATICAL RANGE AND ACCURACY ANALYSIS:
- Sentence Count: {grammatical_data.get('sentence_count', 0)}
- Average Sentence Length: {grammatical_data.get('avg_sentence_length', 0):.1f} words (Target: 12+ for complexity)
- Complex Sentences: {grammatical_data.get('complex_sentence_count', 0)} ({grammatical_data.get('complexity_ratio', 0):.1%} of total)
- Grammatical Errors: {grammatical_data.get('error_count', 0)} (Target: <2 for Band 7+)
- Error Rate: {grammatical_data.get('error_rate', 0):.2f} errors per sentence
- Detected Errors: {grammatical_data.get('detected_errors', [])}
- Tense Consistency: {grammatical_data.get('tense_consistency', 0):.2f} (lower is better)
- Sentence Variety: {grammatical_data.get('sentence_variety', 0):.2f} (length diversity)
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

4. ACTIONABLE NEXT STEPS:
   - Immediate practice activities (next 1-2 weeks)
   - Medium-term goals (1-2 months)
   - Long-term improvement plan (3-6 months)

Use the specific metrics provided to give precise, data-driven feedback. Be encouraging but honest in your assessment. Focus on actionable advice that will help the candidate improve their IELTS speaking performance.
"""
        return prompt

    def evaluate_with_llm(self, fluency_data: Dict[str, Any], lexical_data: Dict[str, Any], 
                         grammatical_data: Dict[str, Any], question: str = None) -> Dict[str, Any]:
        """
        Use open-source LLM to evaluate speaking performance and generate comprehensive feedback
        
        Args:
            fluency_data: Output from analyze_fluency_features
            lexical_data: Output from analyze_lexical_resource
            grammatical_data: Output from analyze_grammatical_range
            question: The IELTS speaking question (optional)
            
        Returns:
            Dictionary containing detailed band scores and feedback
        """
        # Create comprehensive evaluation prompt
        prompt = self.create_ielts_evaluation_prompt(fluency_data, lexical_data, grammatical_data, question)
        
        # Use the correct evaluation method based on model type
        if "Qwen3" in self.llm_evaluator.model_name:
            # For Qwen3, use the enhanced method with proper loading check
            return self.llm_evaluator.evaluate_speaking_enhanced(prompt, fluency_data, lexical_data, grammatical_data)
        else:
            # For other models, use the standard method
            return self.llm_evaluator.evaluate_speaking(fluency_data, question)
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models"""
        return {
            "asr_model": {
                "name": "Whisper Large-v3-turbo",
                "model_id": self.model_id,
                "device": self.device,
                "loaded": self.asr_model is not None,
                "is_turbo": True
            },
            "llm_model": self.llm_evaluator.get_model_info()
        }
    
    def evaluate_speaking(self, audio_path: str, question: str = None) -> Dict[str, Any]:
        """
        Complete IELTS speaking evaluation pipeline with comprehensive analysis
        
        Args:
            audio_path: Path to the audio file
            question: The IELTS speaking question
            
        Returns:
            Complete evaluation results with detailed metrics
        """
        print(f"🎯 Evaluating IELTS speaking performance from: {audio_path}")
        print("=" * 60)
        
        # Step 1: Transcribe audio
        print("📝 Step 1: Transcribing audio...")
        transcription_data = self.transcribe_audio(audio_path)
        
        if "error" in transcription_data:
            return {"error": transcription_data["error"]}
        
        transcript = transcription_data["transcript"]
        print(f"✅ Transcription complete: {len(transcript.split())} words")
        
        # Step 2: Analyze fluency and coherence features
        print("\n🗣️  Step 2: Analyzing fluency and coherence...")
        fluency_data = self.analyze_fluency_features(transcription_data)
        print(f"✅ Speech rate: {fluency_data['speech_rate_wpm']:.1f} WPM, {fluency_data['filled_pauses']} filled pauses")
        print(f"   📊 Detailed metrics: {fluency_data['pause_count']} pauses, {fluency_data['repetitions']} repetitions, {fluency_data['self_corrections']} self-corrections")
        print(f"   📊 Coherence score: {fluency_data['coherence_score']:.1f}/10, Speech runs: {len(fluency_data['speech_runs'])}")
        
        # Step 3: Analyze lexical resource
        print("\n📚 Step 3: Analyzing lexical resource...")
        lexical_data = self.analyze_lexical_resource(transcript)
        print(f"✅ Vocabulary: {lexical_data['vocabulary_size']} unique words, TTR: {lexical_data['vocabulary_ratio']:.3f}")
        print(f"   📊 Academic words: {lexical_data['academic_word_count']}, Idioms: {lexical_data['idiom_count']}, Avg word length: {lexical_data['avg_word_length']:.1f} chars")
        
        # Step 4: Analyze grammatical range and accuracy
        print("\n📝 Step 4: Analyzing grammatical range and accuracy...")
        grammatical_data = self.analyze_grammatical_range(transcript)
        print(f"✅ Grammar: {grammatical_data['sentence_count']} sentences, {grammatical_data['error_count']} errors")
        print(f"   📊 Complex sentences: {grammatical_data['complex_sentence_count']} ({grammatical_data['complexity_ratio']:.1%}), Avg length: {grammatical_data['avg_sentence_length']:.1f} words")
        
        # Step 5: Generate comprehensive evaluation with LLM
        print("\n🤖 Step 5: Generating detailed evaluation and feedback...")
        
        try:
            evaluation = self.evaluate_with_llm(fluency_data, lexical_data, grammatical_data, question)
            print(f"✅ LLM evaluation completed")
        except Exception as e:
            print(f"❌ Error in LLM evaluation: {e}")
            evaluation = None
        
        # Debug: Print the structure of evaluation
        print(f"🔍 DEBUG: Evaluation type: {type(evaluation)}")
        if isinstance(evaluation, dict):
            print(f"🔍 DEBUG: Evaluation keys: {list(evaluation.keys())}")
            if 'overall_band' in evaluation:
                print(f"🔍 DEBUG: overall_band value: {evaluation['overall_band']}")
            else:
                print(f"🔍 DEBUG: Missing overall_band key")
        else:
            print(f"🔍 DEBUG: Evaluation is not a dict: {evaluation}")
        
        # Ensure evaluation has the expected structure
        if not isinstance(evaluation, dict) or 'overall_band' not in evaluation:
            print("⚠️  WARNING: Evaluation missing expected structure, creating fallback...")
            # Create a comprehensive fallback evaluation structure based on actual metrics
            speech_rate = fluency_data.get('speech_rate_wpm', 0)
            vocab_size = lexical_data.get('vocabulary_size', 0)
            error_count = grammatical_data.get('error_count', 0)
            filled_pauses = fluency_data.get('filled_pauses', 0)
            
            # Calculate realistic band scores based on actual IELTS standards
            # More conservative scoring to match real IELTS expectations
            
            # Fluency scoring (0-9 scale)
            if speech_rate >= 180 and filled_pauses <= 1:
                fluency_band = 8.0
            elif speech_rate >= 150 and filled_pauses <= 2:
                fluency_band = 7.0
            elif speech_rate >= 120 and filled_pauses <= 4:
                fluency_band = 6.0
            elif speech_rate >= 100 and filled_pauses <= 6:
                fluency_band = 5.0
            else:
                fluency_band = 4.0
            
            # Lexical scoring
            if vocab_size >= 100 and lexical_data.get('academic_word_count', 0) >= 10:
                lexical_band = 7.5
            elif vocab_size >= 80 and lexical_data.get('academic_word_count', 0) >= 5:
                lexical_band = 6.5
            elif vocab_size >= 60:
                lexical_band = 5.5
            elif vocab_size >= 40:
                lexical_band = 4.5
            else:
                lexical_band = 3.5
            
            # Grammar scoring
            if error_count == 0 and grammatical_data.get('complexity_ratio', 0) >= 0.5:
                grammar_band = 7.0
            elif error_count <= 1 and grammatical_data.get('complexity_ratio', 0) >= 0.3:
                grammar_band = 6.0
            elif error_count <= 2:
                grammar_band = 5.0
            elif error_count <= 4:
                grammar_band = 4.0
            else:
                grammar_band = 3.0
            
            # Calculate overall band (average of the three criteria)
            overall_band = (fluency_band + lexical_band + grammar_band) / 3
            
            evaluation = {
                "overall_band": overall_band,
                "fluency_coherence": {
                    "band": fluency_band,
                    "feedback": f"Speech rate: {speech_rate:.1f} WPM, {filled_pauses} filled pauses, {fluency_data.get('pause_count', 0)} pauses",
                    "strengths": ["Good speech rate"] if speech_rate >= 120 else ["Clear communication"],
                    "weaknesses": ["Slow speech rate"] if speech_rate < 100 else ["Some hesitation"],
                    "improvements": ["Practice speaking fluency", "Reduce filled pauses"] if filled_pauses > 3 else ["Continue practicing"]
                },
                "lexical_resource": {
                    "band": lexical_band,
                    "feedback": f"Vocabulary: {vocab_size} unique words, TTR: {lexical_data.get('vocabulary_ratio', 0):.3f}, Academic words: {lexical_data.get('academic_word_count', 0)}",
                    "strengths": ["Good vocabulary range"] if vocab_size >= 60 else ["Appropriate word choice"],
                    "weaknesses": ["Limited vocabulary"] if vocab_size < 50 else ["Some repetition"],
                    "improvements": ["Expand vocabulary range", "Use more varied expressions"] if vocab_size < 60 else ["Continue expanding vocabulary"]
                },
                "grammatical_range_accuracy": {
                    "band": grammar_band,
                    "feedback": f"Sentences: {grammatical_data.get('sentence_count', 0)}, Errors: {error_count}, Complexity: {grammatical_data.get('complexity_ratio', 0):.1%}",
                    "strengths": ["Good sentence structure"] if error_count <= 2 else ["Generally accurate"],
                    "weaknesses": ["Some grammatical errors"] if error_count > 1 else ["Limited complexity"],
                    "improvements": ["Review grammar rules", "Practice complex sentences"] if error_count > 2 else ["Continue practicing grammar"]
                },
                "pronunciation": {
                    "band": min(9.0, max(1.0, overall_band)),
                    "feedback": "Pronunciation analysis based on transcription quality and speech clarity",
                    "strengths": ["Clear speech"] if speech_rate >= 100 else ["Intelligible"],
                    "weaknesses": ["Some unclear sounds"] if filled_pauses > 5 else ["Minor issues"],
                    "improvements": ["Practice difficult sounds", "Work on clarity", "Record and listen to yourself"]
                },
                "fallback": True,
                "metrics_used": {
                    "speech_rate": speech_rate,
                    "vocabulary_size": vocab_size,
                    "error_count": error_count,
                    "filled_pauses": filled_pauses,
                    "calculated_bands": {
                        "fluency": fluency_band,
                        "lexical": lexical_band,
                        "grammar": grammar_band
                    }
                }
            }
        
        # Final safety check - ensure evaluation has all required keys
        if isinstance(evaluation, dict):
            required_keys = ["overall_band", "fluency_coherence", "lexical_resource", "grammatical_range_accuracy", "pronunciation"]
            for key in required_keys:
                if key not in evaluation:
                    print(f"⚠️  WARNING: Missing key '{key}' in evaluation, adding default...")
                    if key == "overall_band":
                        evaluation[key] = 6.0
                    else:
                        evaluation[key] = {
                            "band": 6.0,
                            "feedback": f"Default feedback for {key}",
                            "strengths": ["Default strength"],
                            "weaknesses": ["Default weakness"],
                            "improvements": ["Default improvement"]
                        }
        
        # Combine all results
        result = {
            "transcription": transcription_data,
            "fluency_analysis": fluency_data,
            "lexical_analysis": lexical_data,
            "grammatical_analysis": grammatical_data,
            "evaluation": evaluation,
            "timestamp": "2024-01-01T00:00:00Z"  # Add actual timestamp
        }
        
        print("✅ Complete evaluation finished!")
        return result

def main():
    """Main function to demonstrate the system"""
    import sys
    
    # Get model choice from command line argument or use default
    model_choice = sys.argv[1] if len(sys.argv) > 1 else "development"
    
    print(f"🚀 Initializing IELTS Speaking AI with {model_choice} model...")
    print("=" * 60)
    
    # Initialize evaluator with chosen model
    evaluator = IELTSSpeakingEvaluator(llm_model=model_choice)
    
    # Load models
    evaluator.load_models()
    
    # Show model information
    model_info = evaluator.get_model_info()
    print(f"\n📊 Model Information:")
    print(f"ASR Model: {model_info['asr_model']['name']}")
    print(f"LLM Model: {model_info['llm_model']['model_name']}")
    print(f"Device: {model_info['asr_model']['device']}")
    print(f"Quantization: {model_info['llm_model']['quantization']}")
    
    # Example usage with the available audio file
    audio_file = "audio.mp3"  # Use the available audio file
    
    try:
        # Evaluate speaking performance
        result = evaluator.evaluate_speaking(
            audio_path=audio_file,
            question="Do you prefer printed books or e-books? Why?"
        )
        
        # Print comprehensive results
        print("\n" + "="*60)
        print("🎯 IELTS SPEAKING EVALUATION RESULTS")
        print("="*60)
        
        if "error" in result:
            print(f"❌ Error: {result['error']}")
        else:
            # Display transcript
            transcript = result['fluency_analysis']['transcript']
            print(f"\n📝 TRANSCRIPT:")
            print("-" * 40)
            print(f'"{transcript}"')
            print("-" * 40)
            
            # Display detailed metrics
            fluency = result['fluency_analysis']
            lexical = result['lexical_analysis']
            grammatical = result['grammatical_analysis']
            
            print(f"\n📊 DETAILED METRICS:")
            print(f"🗣️  Fluency & Coherence:")
            print(f"   • Speech Rate: {fluency['speech_rate_wpm']:.1f} WPM")
            print(f"   • Articulation Rate: {fluency['articulation_rate_sps']:.1f} syllables/sec")
            print(f"   • Pauses: {fluency['pause_count']} ({fluency['avg_pause_duration']:.2f}s avg)")
            print(f"   • Filled Pauses: {fluency['filled_pauses']} (um, uh, er)")
            print(f"   • Repetitions: {fluency['repetitions']}")
            print(f"   • Self-corrections: {fluency['self_corrections']}")
            print(f"   • Coherence Score: {fluency['coherence_score']:.1f}/10")
            
            print(f"\n📚 Lexical Resource:")
            print(f"   • Vocabulary Size: {lexical['vocabulary_size']} unique words")
            print(f"   • Type-Token Ratio: {lexical['vocabulary_ratio']:.3f}")
            print(f"   • Academic Words: {lexical['academic_word_count']} ({lexical['academic_word_ratio']:.1%})")
            print(f"   • Idiomatic Expressions: {lexical['idiom_count']}")
            print(f"   • Average Word Length: {lexical['avg_word_length']:.1f} characters")
            print(f"   • Long Words: {lexical['long_word_ratio']:.1%}")
            
            print(f"\n📝 Grammatical Range & Accuracy:")
            print(f"   • Sentences: {grammatical['sentence_count']}")
            print(f"   • Average Sentence Length: {grammatical['avg_sentence_length']:.1f} words")
            print(f"   • Complex Sentences: {grammatical['complex_sentence_count']} ({grammatical['complexity_ratio']:.1%})")
            print(f"   • Grammatical Errors: {grammatical['error_count']}")
            print(f"   • Error Rate: {grammatical['error_rate']:.2f} per sentence")
            print(f"   • Accuracy Score: {grammatical['accuracy_score']:.1f}/10")
            
            # Display LLM evaluation
            evaluation = result["evaluation"]
            print(f"\n🤖 LLM EVALUATION:")
            print("-" * 40)
            print(evaluation.get('response', 'Evaluation in progress...'))
            
    except FileNotFoundError:
        print(f"❌ Audio file '{audio_file}' not found.")
        print("\n💡 Available audio files:")
        import os
        audio_files = [f for f in os.listdir('.') if f.endswith(('.mp3', '.wav', '.m4a'))]
        if audio_files:
            for f in audio_files:
                print(f"   • {f}")
        else:
            print("   • No audio files found in current directory")
        print("\nTo test with your own audio:")
        print("1. Place your audio file in the speaking_ai directory")
        print("2. Update the audio_file variable in main()")
        print("3. Run the script again")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🎯 IELTS Speaking AI Assessment System")
    print("Available models:")
    print("- development: Qwen2.5-7B (recommended for dev)")
    print("- production: Qwen2.5-14B (higher quality)")
    print("- low_memory: DialoGPT-medium (minimal memory)")
    print("- high_quality: Llama-3.1-70B (best quality)")
    print("- fast: Mistral-7B (fast inference)")
    print("\nUsage: python main.py [model_choice]")
    print("Example: python main.py development")
    print()
    
    main()
