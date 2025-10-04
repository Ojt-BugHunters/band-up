"""
Gemini API evaluator for IELTS speaking assessment
Provides fast, cloud-based evaluation using Google's Gemini API
"""

import os
import json
from typing import Dict, Any, Optional
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GeminiIELTSEvaluator:
    """Gemini API evaluator for IELTS speaking assessment"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the Gemini API evaluator
        
        Args:
            api_key: Google AI API key (if not provided, will try to get from environment)
        """
        self.api_key = api_key or os.getenv('GOOGLE_AI_API_KEY')
        
        if not self.api_key:
            raise ValueError("Google AI API key is required. Set GOOGLE_AI_API_KEY environment variable or pass api_key parameter.")
        
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent"
        self.model_name = "gemini-2.5-flash-lite"
        
        print("✅ Gemini API evaluator initialized")
    
    def _make_api_request(self, prompt: str) -> str:
        """Make API request to Gemini"""
        try:
            headers = {
                'Content-Type': 'application/json',
            }
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "topP": 0.9,
                    "maxOutputTokens": 2048,
                    "thinkingConfig": {
                        "thinkingBudget": 0  # Disable thinking for faster response
                    }
                }
            }
            
            url = f"{self.base_url}?key={self.api_key}"
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            
            if 'candidates' in result and len(result['candidates']) > 0:
                return result['candidates'][0]['content']['parts'][0]['text']
            else:
                raise Exception("No response from Gemini API")
                
        except requests.exceptions.RequestException as e:
            raise Exception(f"API request failed: {str(e)}")
        except Exception as e:
            raise Exception(f"Error processing Gemini response: {str(e)}")
    
    def evaluate_speaking(self, fluency_data: Dict[str, Any], question: str = None) -> Dict[str, Any]:
        """
        Evaluate speaking performance using Gemini API
        
        Args:
            fluency_data: Fluency analysis data
            question: IELTS speaking question
            
        Returns:
            Evaluation results with band scores and feedback
        """
        # Create evaluation prompt
        prompt = self._create_evaluation_prompt(fluency_data, question)
        
        try:
            print(f"🤖 Generating Gemini API evaluation...")
            generated_text = self._make_api_request(prompt)
            
            # Try to parse JSON response first
            try:
                json_start = generated_text.find("{")
                json_end = generated_text.rfind("}") + 1
                
                if json_start != -1 and json_end > json_start:
                    json_str = generated_text[json_start:json_end]
                    result = json.loads(json_str)
                    print("✅ Successfully parsed JSON response from Gemini")
                    return result
                else:
                    print("⚠️ No JSON found in response, using text parsing")
                    return self._parse_text_response(generated_text, fluency_data)
                
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing failed: {e}")
                return self._parse_text_response(generated_text, fluency_data)
                
        except Exception as e:
            print(f"❌ Error generating evaluation: {e}")
            return self._create_fallback_evaluation(fluency_data)
    
    def evaluate_speaking_enhanced(self, prompt: str, fluency_data: Dict[str, Any], 
                                 lexical_data: Dict[str, Any], grammatical_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enhanced evaluation method that uses comprehensive prompt with all analysis data
        
        Args:
            prompt: Comprehensive evaluation prompt with all metrics
            fluency_data: Fluency and coherence analysis results
            lexical_data: Lexical resource analysis results
            grammatical_data: Grammatical range and accuracy analysis results
            
        Returns:
            Enhanced evaluation results with expected structure
        """
        try:
            print(f"🤖 Generating enhanced Gemini API evaluation...")
            print(f"📝 Prompt length: {len(prompt)} characters")
            
            generated_text = self._make_api_request(prompt)
            
            # Try to parse JSON response first
            try:
                json_start = generated_text.find("{")
                json_end = generated_text.rfind("}") + 1
                
                if json_start != -1 and json_end > json_start:
                    json_str = generated_text[json_start:json_end]
                    result = json.loads(json_str)
                    print("✅ Successfully parsed JSON response from Gemini")
                    return result
                else:
                    print("⚠️ No JSON found in response, using text parsing")
                    return self._parse_enhanced_text_response(generated_text, fluency_data, lexical_data, grammatical_data)
                
            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing failed: {e}")
                return self._parse_enhanced_text_response(generated_text, fluency_data, lexical_data, grammatical_data)
                
        except Exception as e:
            print(f"❌ Error generating enhanced evaluation: {e}")
            return self._create_enhanced_fallback_evaluation(fluency_data, lexical_data, grammatical_data)
    
    def generate_learning_guide(self, prompt: str) -> str:
        """
        Generate learning guide using Gemini API
        
        Args:
            prompt: Learning guide prompt
            
        Returns:
            Generated learning guide text
        """
        try:
            print(f"🤖 Generating learning guide with Gemini API...")
            print(f"📝 Prompt length: {len(prompt)} characters")
            
            generated_text = self._make_api_request(prompt)
            
            print(f"✅ Learning guide generated successfully ({len(generated_text)} chars)")
            return generated_text
            
        except Exception as e:
            print(f"❌ Error generating learning guide: {e}")
            return f"❌ Error generating learning guide: {str(e)}"
    
    def _create_evaluation_prompt(self, fluency_data: Dict[str, Any], question: str = None) -> str:
        """Create evaluation prompt for Gemini API"""
        
        prompt = f"""You are an expert IELTS examiner with deep understanding of the IELTS band descriptors. You must provide accurate band scores (1-9 in 0.5 increments only) and detailed feedback based on official IELTS criteria.

Please evaluate this IELTS speaking performance:

SPEAKING DATA:
- Transcript: "{fluency_data['transcript']}"
- Speech Rate: {fluency_data['speech_rate_wpm']:.1f} words per minute
- Duration: {fluency_data['duration']:.1f} seconds
- Word Count: {fluency_data['word_count']} words
- Filled Pauses: {fluency_data['filled_pauses']}
- Pause Frequency: {fluency_data.get('pause_frequency', 0):.2f} pauses per second

QUESTION: {question or "General speaking task"}

Evaluate on these IELTS criteria (1-9 scale in 0.5 increments only):
1. Fluency and Coherence
2. Lexical Resource  
3. Grammatical Range and Accuracy
4. Pronunciation

Provide detailed feedback with specific examples and improvement suggestions.

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
    
    def _validate_ielts_band_score(self, score: float) -> float:
        """
        Validate and correct IELTS band scores to ensure they are valid (1-9 in 0.5 increments)
        Also applies realistic calibration to prevent overly optimistic scoring
        
        Args:
            score: Raw band score from LLM
            
        Returns:
            Valid and realistically calibrated IELTS band score
        """
        # Apply realistic calibration - most LLMs are overly optimistic
        # Scale down scores to be more realistic
        if score > 7.0:
            # High scores get reduced more aggressively
            calibrated_score = 5.5 + (score - 7.0) * 0.5  # Scale 7-9 to 5.5-6.5
        elif score > 5.0:
            # Medium scores get moderate reduction
            calibrated_score = 4.0 + (score - 5.0) * 0.75  # Scale 5-7 to 4-5.5
        else:
            # Low scores get minimal adjustment
            calibrated_score = score * 0.9  # Slight reduction
        
        # Ensure valid IELTS range
        if calibrated_score < 1.0:
            return 1.0
        elif calibrated_score > 9.0:
            return 9.0
        else:
            # Round to nearest 0.5
            rounded = round(calibrated_score * 2) / 2
            return max(1.0, min(9.0, rounded))
    
    def _parse_text_response(self, text: str, fluency_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse text response when JSON parsing fails"""
        import re
        
        # Look for band scores in the text
        band_pattern = r'band\s*(\d+(?:\.\d+)?)'
        bands = re.findall(band_pattern, text.lower())
        
        # Create structured response with validated band scores
        overall_band = self._validate_ielts_band_score(float(bands[0]) if bands else 6.0)
        
        return {
            "overall_band": overall_band,
            "fluency_coherence": {
                "band": self._validate_ielts_band_score(float(bands[1]) if len(bands) > 1 else overall_band),
                "feedback": f"Based on speech rate of {fluency_data['speech_rate_wpm']:.1f} WPM and {fluency_data['filled_pauses']} filled pauses.",
                "strengths": ["Clear communication"],
                "weaknesses": ["Some hesitation"],
                "improvements": ["Practice speaking fluency"]
            },
            "lexical_resource": {
                "band": self._validate_ielts_band_score(float(bands[2]) if len(bands) > 2 else overall_band),
                "feedback": "Good vocabulary range demonstrated.",
                "strengths": ["Appropriate word choice"],
                "weaknesses": ["Limited vocabulary"],
                "improvements": ["Expand vocabulary"]
            },
            "grammatical_range_accuracy": {
                "band": self._validate_ielts_band_score(float(bands[3]) if len(bands) > 3 else overall_band),
                "feedback": "Generally accurate grammar.",
                "strengths": ["Good sentence structure"],
                "weaknesses": ["Some errors"],
                "improvements": ["Review grammar"]
            },
            "pronunciation": {
                "band": self._validate_ielts_band_score(float(bands[4]) if len(bands) > 4 else overall_band),
                "feedback": "Clear pronunciation overall.",
                "strengths": ["Intelligible speech"],
                "weaknesses": ["Some unclear sounds"],
                "improvements": ["Practice pronunciation"]
            },
            "raw_response": text,
            "model_used": "gemini-2.5-flash-lite"
        }
    
    def _parse_enhanced_text_response(self, text: str, fluency_data: Dict[str, Any], 
                                    lexical_data: Dict[str, Any], grammatical_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parse enhanced text response when JSON parsing fails"""
        import re
        
        # Look for band scores in the text with more flexible patterns
        band_patterns = [
            r'band\s*(\d+(?:\.\d+)?)',
            r'(\d+(?:\.\d+)?)\s*band',
            r'fluency.*?(\d+(?:\.\d+)?)',
            r'lexical.*?(\d+(?:\.\d+)?)',
            r'grammatical.*?(\d+(?:\.\d+)?)',
            r'overall.*?(\d+(?:\.\d+)?)'
        ]
        
        bands = []
        for pattern in band_patterns:
            matches = re.findall(pattern, text.lower())
            bands.extend(matches)
        
        # Remove duplicates and convert to float
        unique_bands = list(set(float(band) for band in bands if 1.0 <= float(band) <= 9.0))
        
        # Calculate overall band from individual scores or metrics
        if len(unique_bands) >= 3:
            overall_band = sum(unique_bands[:3]) / 3
        else:
            # Enhanced fallback calculation based on comprehensive metrics
            speech_rate = fluency_data.get('speech_rate_wpm', 0)
            vocabulary_size = lexical_data.get('vocabulary_size', 0)
            error_rate = grammatical_data.get('error_rate', 0)
            filled_pauses = fluency_data.get('filled_pauses', 0)
            coherence_score = fluency_data.get('coherence_score', 0)
            academic_words = lexical_data.get('academic_word_count', 0)
            complex_sentences = grammatical_data.get('complex_sentence_count', 0)
            
            # More sophisticated scoring based on multiple factors
            fluency_score = min(9.0, max(1.0, (speech_rate - 80) / 20 + (10 - filled_pauses) / 2 + coherence_score / 2))
            lexical_score = min(9.0, max(1.0, vocabulary_size / 10 + academic_words / 5 + lexical_data.get('lexical_sophistication_score', 0)))
            grammar_score = min(9.0, max(1.0, 10 - error_rate * 10 + complex_sentences / 2 + grammatical_data.get('grammatical_range_score', 0) / 10))
            
            overall_band = (fluency_score + lexical_score + grammar_score) / 3
        
        # Create detailed feedback based on actual metrics
        fluency_feedback = self._create_fluency_feedback(fluency_data)
        lexical_feedback = self._create_lexical_feedback(lexical_data)
        grammar_feedback = self._create_grammar_feedback(grammatical_data)
        
        return {
            "overall_band": self._validate_ielts_band_score(overall_band),
            "fluency_coherence": {
                "band": self._validate_ielts_band_score(float(unique_bands[0]) if len(unique_bands) > 0 else overall_band),
                "feedback": fluency_feedback["feedback"],
                "strengths": fluency_feedback["strengths"],
                "weaknesses": fluency_feedback["weaknesses"],
                "improvements": fluency_feedback["improvements"]
            },
            "lexical_resource": {
                "band": self._validate_ielts_band_score(float(unique_bands[1]) if len(unique_bands) > 1 else overall_band),
                "feedback": lexical_feedback["feedback"],
                "strengths": lexical_feedback["strengths"],
                "weaknesses": lexical_feedback["weaknesses"],
                "improvements": lexical_feedback["improvements"]
            },
            "grammatical_range_accuracy": {
                "band": self._validate_ielts_band_score(float(unique_bands[2]) if len(unique_bands) > 2 else overall_band),
                "feedback": grammar_feedback["feedback"],
                "strengths": grammar_feedback["strengths"],
                "weaknesses": grammar_feedback["weaknesses"],
                "improvements": grammar_feedback["improvements"]
            },
            "pronunciation": {
                "band": self._validate_ielts_band_score(float(unique_bands[3]) if len(unique_bands) > 3 else overall_band),
                "feedback": "Pronunciation analysis based on transcription quality and speech clarity",
                "strengths": ["Clear speech"] if fluency_data.get('speech_rate_wpm', 0) > 100 else ["Intelligible"],
                "weaknesses": ["Some unclear sounds"] if fluency_data.get('filled_pauses', 0) > 5 else ["Minor issues"],
                "improvements": ["Practice difficult sounds", "Work on clarity", "Record and listen to yourself"]
            },
            "raw_response": text,
            "model_used": "gemini-2.5-flash-lite"
        }
    
    def _create_fluency_feedback(self, fluency_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create detailed fluency feedback based on metrics"""
        speech_rate = fluency_data.get('speech_rate_wpm', 0)
        filled_pauses = fluency_data.get('filled_pauses', 0)
        pause_count = fluency_data.get('pause_count', 0)
        coherence_score = fluency_data.get('coherence_score', 0)
        
        strengths = []
        weaknesses = []
        improvements = []
        
        # Speech rate analysis
        if speech_rate >= 150:
            strengths.append("Excellent speech rate - natural pace")
        elif speech_rate >= 120:
            strengths.append("Good speech rate - appropriate pace")
        elif speech_rate >= 100:
            weaknesses.append("Speech rate is slightly slow")
            improvements.append("Practice speaking at a more natural pace")
        else:
            weaknesses.append("Speech rate is too slow")
            improvements.append("Focus on increasing speaking speed through practice")
        
        # Pause analysis
        if filled_pauses <= 2:
            strengths.append("Minimal filled pauses - good fluency")
        elif filled_pauses <= 5:
            weaknesses.append("Some filled pauses present")
            improvements.append("Practice speaking without 'um', 'uh', 'er'")
        else:
            weaknesses.append("Too many filled pauses")
            improvements.append("Record yourself and practice eliminating hesitation sounds")
        
        # Coherence analysis
        if coherence_score >= 7:
            strengths.append("Good use of discourse markers")
        elif coherence_score >= 4:
            improvements.append("Use more linking words and phrases")
        else:
            weaknesses.append("Limited use of discourse markers")
            improvements.append("Learn and practice connecting ideas with linking words")
        
        feedback = f"Speech rate: {speech_rate:.1f} WPM, {filled_pauses} filled pauses, {pause_count} pauses, coherence score: {coherence_score:.1f}/10"
        
        return {
            "feedback": feedback,
            "strengths": strengths if strengths else ["Clear communication"],
            "weaknesses": weaknesses if weaknesses else ["Some areas for improvement"],
            "improvements": improvements if improvements else ["Continue practicing"]
        }
    
    def _create_lexical_feedback(self, lexical_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create detailed lexical feedback based on metrics"""
        vocab_size = lexical_data.get('vocabulary_size', 0)
        ttr = lexical_data.get('vocabulary_ratio', 0)
        academic_words = lexical_data.get('academic_word_count', 0)
        avg_word_length = lexical_data.get('avg_word_length', 0)
        
        strengths = []
        weaknesses = []
        improvements = []
        
        # Vocabulary size analysis
        if vocab_size >= 80:
            strengths.append("Excellent vocabulary range")
        elif vocab_size >= 60:
            strengths.append("Good vocabulary range")
        elif vocab_size >= 40:
            weaknesses.append("Limited vocabulary range")
            improvements.append("Expand vocabulary through reading and word lists")
        else:
            weaknesses.append("Very limited vocabulary")
            improvements.append("Focus on building basic vocabulary first")
        
        # Lexical diversity analysis
        if ttr >= 0.7:
            strengths.append("Good lexical diversity")
        elif ttr >= 0.6:
            improvements.append("Work on using more varied vocabulary")
        else:
            weaknesses.append("Limited lexical diversity - too much repetition")
            improvements.append("Practice using synonyms and varied expressions")
        
        # Academic vocabulary analysis
        if academic_words >= 10:
            strengths.append("Good use of academic vocabulary")
        elif academic_words >= 5:
            improvements.append("Include more academic vocabulary")
        else:
            weaknesses.append("Limited academic vocabulary")
            improvements.append("Learn and practice academic word lists")
        
        feedback = f"Vocabulary: {vocab_size} unique words, TTR: {ttr:.3f}, Academic words: {academic_words}, Avg word length: {avg_word_length:.1f} chars"
        
        return {
            "feedback": feedback,
            "strengths": strengths if strengths else ["Appropriate word choice"],
            "weaknesses": weaknesses if weaknesses else ["Some areas for improvement"],
            "improvements": improvements if improvements else ["Continue expanding vocabulary"]
        }
    
    def _create_grammar_feedback(self, grammatical_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create detailed grammar feedback based on metrics"""
        error_count = grammatical_data.get('error_count', 0)
        sentence_count = grammatical_data.get('sentence_count', 0)
        complexity_ratio = grammatical_data.get('complexity_ratio', 0)
        avg_sentence_length = grammatical_data.get('avg_sentence_length', 0)
        
        strengths = []
        weaknesses = []
        improvements = []
        
        # Error analysis
        if error_count == 0:
            strengths.append("Excellent grammatical accuracy")
        elif error_count <= 2:
            strengths.append("Good grammatical accuracy")
        elif error_count <= 4:
            weaknesses.append("Some grammatical errors present")
            improvements.append("Review common grammar rules and practice")
        else:
            weaknesses.append("Multiple grammatical errors")
            improvements.append("Focus on basic grammar rules and sentence structure")
        
        # Sentence complexity analysis
        if complexity_ratio >= 0.5:
            strengths.append("Good use of complex sentences")
        elif complexity_ratio >= 0.3:
            improvements.append("Try using more complex sentence structures")
        else:
            weaknesses.append("Limited sentence complexity")
            improvements.append("Practice using subordinate clauses and complex structures")
        
        # Sentence length analysis
        if avg_sentence_length >= 15:
            strengths.append("Good sentence length and complexity")
        elif avg_sentence_length >= 10:
            improvements.append("Try using longer, more complex sentences")
        else:
            weaknesses.append("Sentences are too short and simple")
            improvements.append("Practice combining ideas into longer sentences")
        
        feedback = f"Sentences: {sentence_count}, Errors: {error_count}, Complexity: {complexity_ratio:.1%}, Avg length: {avg_sentence_length:.1f} words"
        
        return {
            "feedback": feedback,
            "strengths": strengths if strengths else ["Generally accurate"],
            "weaknesses": weaknesses if weaknesses else ["Some areas for improvement"],
            "improvements": improvements if improvements else ["Continue practicing grammar"]
        }
    
    def _create_fallback_evaluation(self, fluency_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create fallback evaluation when API fails"""
        return {
            "overall_band": 0,
            "fluency_coherence": {
                "band": 0,
                "feedback": "No evaluation generated",
                "strengths": [],
                "weaknesses": ["Evaluation failed"],
                "improvements": ["Try again later"]
            },
            "lexical_resource": {
                "band": 0,
                "feedback": "No evaluation generated",
                "strengths": [],
                "weaknesses": ["Evaluation failed"],
                "improvements": ["Try again later"]
            },
            "grammatical_range_accuracy": {
                "band": 0,
                "feedback": "No evaluation generated",
                "strengths": [],
                "weaknesses": ["Evaluation failed"],
                "improvements": ["Try again later"]
            },
            "pronunciation": {
                "band": 0,
                "feedback": "No evaluation generated",
                "strengths": [],
                "weaknesses": ["Evaluation failed"],
                "improvements": ["Try again later"]
            },
            "fallback": True,
            "model_used": "gemini-2.5-flash-lite"
        }
    
    def _create_enhanced_fallback_evaluation(self, fluency_data: Dict[str, Any], 
                                           lexical_data: Dict[str, Any], 
                                           grammatical_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create enhanced fallback evaluation when API fails"""
        return {
            "overall_band": 0,
            "fluency_coherence": {
                "band": 0,
                "feedback": "No evaluation generated",
                "strengths": [],
                "weaknesses": ["Evaluation failed"],
                "improvements": ["Try again later"]
            },
            "lexical_resource": {
                "band": 0,
                "feedback": "No evaluation generated",
                "strengths": [],
                "weaknesses": ["Evaluation failed"],
                "improvements": ["Try again later"]
            },
            "grammatical_range_accuracy": {
                "band": 0,
                "feedback": "No evaluation generated",
                "strengths": [],
                "weaknesses": ["Evaluation failed"],
                "improvements": ["Try again later"]
            },
            "pronunciation": {
                "band": 0,
                "feedback": "No evaluation generated",
                "strengths": [],
                "weaknesses": ["Evaluation failed"],
                "improvements": ["Try again later"]
            },
            "fallback": True,
            "model_used": "gemini-2.5-flash-lite"
        }
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the Gemini API"""
        return {
            "model_name": self.model_name,
            "api_type": "Gemini API",
            "device": "cloud",
            "quantization": False,
            "loaded": True
        }
