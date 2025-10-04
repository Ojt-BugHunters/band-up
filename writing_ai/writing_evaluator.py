"""
IELTS Writing AI Assessment System
Using Gemini API for comprehensive essay evaluation and improvement suggestions
"""

import os
import json
import re
from typing import Dict, Any, Optional, List
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class IELTSWritingEvaluator:
    """IELTS Writing evaluator using Gemini API for comprehensive essay assessment"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the IELTS Writing evaluator
        
        Args:
            api_key: Google AI API key (if not provided, will try to get from environment)
        """
        self.api_key = api_key or os.getenv('GOOGLE_AI_API_KEY')
        
        if not self.api_key:
            raise ValueError("Google AI API key is required. Set GOOGLE_AI_API_KEY environment variable or pass api_key parameter.")
        
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent"
        self.model_name = "gemini-2.5-flash-lite"
        
        print("✅ IELTS Writing Evaluator initialized with Gemini API")
    
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
                    "temperature": 0.3,  # Lower for more consistent, professional output
                    "topP": 0.8,  # Balanced for quality and focus
                    "maxOutputTokens": 2048,  # Adequate for detailed responses
                    "thinkingConfig": {
                        "thinkingBudget": 0  # Disable thinking for faster response
                    }
                }
            }
            
            url = f"{self.base_url}?key={self.api_key}"
            
            response = requests.post(url, headers=headers, json=payload, timeout=60)
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
    
    def analyze_essay_structure(self, essay_text: str) -> Dict[str, Any]:
        """
        Analyze basic essay structure and metrics
        
        Args:
            essay_text: The essay text to analyze
            
        Returns:
            Dictionary containing structural analysis
        """
        # Clean the text
        clean_text = re.sub(r'\s+', ' ', essay_text.strip())
        sentences = re.split(r'[.!?]+', clean_text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        # Word analysis
        words = clean_text.split()
        word_count = len(words)
        
        # Paragraph analysis
        paragraphs = [p.strip() for p in essay_text.split('\n\n') if p.strip()]
        paragraph_count = len(paragraphs)
        
        # Sentence analysis
        sentence_count = len(sentences)
        avg_sentence_length = word_count / sentence_count if sentence_count > 0 else 0
        
        # Complex sentence detection
        complex_indicators = [
            "because", "although", "while", "since", "if", "when", "where", "which", "that",
            "who", "whom", "whose", "after", "before", "until", "unless", "provided",
            "in order to", "so that", "as if", "as though", "despite", "in spite of"
        ]
        
        complex_sentences = 0
        for sentence in sentences:
            if any(indicator in sentence.lower() for indicator in complex_indicators):
                complex_sentences += 1
        
        complexity_ratio = complex_sentences / sentence_count if sentence_count > 0 else 0
        
        # Transition words analysis
        transition_words = [
            "first", "second", "third", "finally", "moreover", "however", "therefore",
            "furthermore", "in addition", "on the other hand", "for example", "for instance",
            "in conclusion", "to summarize", "nevertheless", "consequently", "meanwhile"
        ]
        
        transition_count = sum(clean_text.lower().count(transition) for transition in transition_words)
        
        return {
            "word_count": word_count,
            "sentence_count": sentence_count,
            "paragraph_count": paragraph_count,
            "avg_sentence_length": avg_sentence_length,
            "complex_sentence_count": complex_sentences,
            "complexity_ratio": complexity_ratio,
            "transition_word_count": transition_count,
            "avg_words_per_paragraph": word_count / paragraph_count if paragraph_count > 0 else 0
        }
    
    def analyze_lexical_resource(self, essay_text: str) -> Dict[str, Any]:
        """
        Analyze lexical resource and vocabulary usage using intelligent Gemini analysis
        
        Args:
            essay_text: The essay text to analyze
            
        Returns:
            Dictionary containing lexical analysis
        """
        # Clean and process text
        clean_text = re.sub(r'[^\w\s]', ' ', essay_text.lower())
        words = clean_text.split()
        unique_words = set(words)
        
        # Basic metrics
        vocabulary_size = len(unique_words)
        total_words = len(words)
        ttr = vocabulary_size / total_words if total_words > 0 else 0  # Type-Token Ratio
        
        # Word length analysis (sophistication indicator)
        word_lengths = [len(word) for word in words]
        avg_word_length = sum(word_lengths) / len(word_lengths) if word_lengths else 0
        long_words = sum(1 for length in word_lengths if length > 6)
        long_word_ratio = long_words / len(words) if words else 0
        
        # Word frequency analysis
        from collections import Counter
        word_frequency = Counter(words)
        most_common_words = word_frequency.most_common(10)
        
        # Repetition analysis
        repeated_words = [word for word, count in word_frequency.items() if count > 3]
        
        # Intelligent lexical analysis using Gemini
        try:
            intelligent_analysis = self._analyze_lexical_with_gemini(essay_text)
            academic_word_count = intelligent_analysis.get('academic_word_count', 0)
            academic_word_ratio = academic_word_count / vocabulary_size if vocabulary_size > 0 else 0
            collocation_count = intelligent_analysis.get('collocation_count', 0)
            collocations_found = intelligent_analysis.get('collocations_found', [])
            academic_words_found = intelligent_analysis.get('academic_words_found', [])
        except Exception as e:
            print(f"Warning: Intelligent lexical analysis failed: {e}")
            # Fallback to basic analysis
            academic_word_count = 0
            academic_word_ratio = 0
            collocation_count = 0
            collocations_found = []
            academic_words_found = []
        
        return {
            "vocabulary_size": vocabulary_size,
            "total_words": total_words,
            "type_token_ratio": ttr,
            "academic_word_count": academic_word_count,
            "academic_word_ratio": academic_word_ratio,
            "academic_words_found": academic_words_found,
            "avg_word_length": avg_word_length,
            "long_word_ratio": long_word_ratio,
            "collocation_count": collocation_count,
            "collocations_found": collocations_found,
            "most_common_words": most_common_words[:5],
            "repeated_words": repeated_words,
            "lexical_sophistication_score": (academic_word_ratio + long_word_ratio + collocation_count/10) / 3
        }
    
    def _analyze_lexical_with_gemini(self, essay_text: str) -> Dict[str, Any]:
        """
        Use Gemini to intelligently analyze lexical features
        
        Args:
            essay_text: The essay text to analyze
            
        Returns:
            Dictionary containing intelligent lexical analysis
        """
        prompt = f"""You are an expert linguist specializing in academic English. Analyze the lexical features in this IELTS essay.

ESSAY TO ANALYZE:
{essay_text}

ANALYSIS REQUIREMENTS:
1. Academic Words: Identify words that are commonly used in academic writing (formal, sophisticated vocabulary)
2. Collocations: Identify natural word combinations and phrases that native speakers would use
3. Lexical Sophistication: Assess the overall vocabulary level and sophistication

GUIDELINES:
- Academic words: Formal vocabulary used in academic contexts (e.g., "significant", "implement", "analyze", "comprehensive")
- Collocations: Natural word combinations (e.g., "make a decision", "conduct research", "achieve success")
- Focus on words that demonstrate higher-level vocabulary appropriate for IELTS Band 6.5+

JSON format:
{{
  "academic_word_count": 0,
  "collocation_count": 0,
  "academic_words_found": ["word1", "word2"],
  "collocations_found": ["phrase1", "phrase2"],
  "lexical_sophistication": "assessment of vocabulary level and sophistication"
}}"""
        
        try:
            response = self._make_api_request(prompt)
            
            # Try to parse JSON response
            json_start = response.find("{")
            json_end = response.rfind("}") + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = response[json_start:json_end]
                result = json.loads(json_str)
                return result
            else:
                # Fallback if JSON parsing fails
                return {
                    "academic_word_count": 0,
                    "collocation_count": 0,
                    "academic_words_found": [],
                    "collocations_found": [],
                    "lexical_sophistication": "Unable to analyze"
                }
                
        except Exception as e:
            print(f"Error in intelligent lexical analysis: {e}")
            return {
                "academic_word_count": 0,
                "collocation_count": 0,
                "academic_words_found": [],
                "collocations_found": [],
                "lexical_sophistication": "Analysis failed"
            }
    
    def analyze_grammatical_accuracy(self, essay_text: str) -> Dict[str, Any]:
        """
        Analyze grammatical range and accuracy
        
        Args:
            essay_text: The essay text to analyze
            
        Returns:
            Dictionary containing grammatical analysis
        """
        sentences = re.split(r'[.!?]+', essay_text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        # Common grammatical errors detection
        error_patterns = {
            "subject_verb_disagreement": [
                r'\b(he|she|it)\s+(are|were)\b',
                r'\b(they|we|you)\s+(is|was)\b',
                r'\b(everyone|everybody|someone|somebody)\s+(are|were)\b'
            ],
            "article_errors": [
                r'\b(a|an)\s+(university|hour|honest|honor)\b',
                r'\b(go to|went to)\s+(school|work|home|hospital)\b'
            ],
            "preposition_errors": [
                r'\b(depend|rely|focus|concentrate)\s+in\b',
                r'\b(arrive|get)\s+to\s+(home|here|there)\b'
            ],
            "tense_consistency": [
                r'\b(will|would|can|could)\s+be\s+(past\s+participle)\b'
            ],
            "run_on_sentences": [
                r'\b\w+\s+\w+\s+\w+\s+\w+\s+\w+\s+\w+\s+\w+\s+\w+\s+\w+\s+\w+\s+and\b'
            ]
        }
        
        error_count = 0
        detected_errors = []
        
        for error_type, patterns in error_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, essay_text, re.IGNORECASE)
                if matches:
                    error_count += len(matches)
                    detected_errors.append(f"{error_type}: {len(matches)} instances")
        
        # Sentence variety analysis
        sentence_lengths = [len(s.split()) for s in sentences]
        sentence_variety = len(set(sentence_lengths)) / len(sentences) if sentences else 0
        
        # Tense analysis
        present_indicators = ["is", "are", "am", "have", "has", "do", "does", "go", "goes", "make", "makes"]
        past_indicators = ["was", "were", "had", "did", "went", "made", "came", "saw"]
        future_indicators = ["will", "shall", "going to", "would", "could", "should"]
        
        present_count = sum(essay_text.lower().count(indicator) for indicator in present_indicators)
        past_count = sum(essay_text.lower().count(indicator) for indicator in past_indicators)
        future_count = sum(essay_text.lower().count(indicator) for indicator in future_indicators)
        
        tense_consistency = abs(present_count - past_count) / max(present_count + past_count, 1)
        
        # Accuracy score calculation
        accuracy_score = max(0, 10 - (error_count / len(sentences)) * 10) if sentences else 0
        
        return {
            "sentence_count": len(sentences),
            "error_count": error_count,
            "detected_errors": detected_errors,
            "error_rate": error_count / len(sentences) if sentences else 0,
            "sentence_variety": sentence_variety,
            "tense_consistency": tense_consistency,
            "present_tense_count": present_count,
            "past_tense_count": past_count,
            "future_tense_count": future_count,
            "accuracy_score": accuracy_score
        }
    
    def create_comprehensive_evaluation_prompt(self, essay_text: str, task_type: str, 
                                               structure_data: Dict[str, Any], 
                                               lexical_data: Dict[str, Any], 
                                               grammar_data: Dict[str, Any], 
                                               task_description: str = None) -> str:
        """
        Create optimized IELTS writing evaluation prompt for cost efficiency
        
        Args:
            essay_text: The essay text
            task_type: Task 1 or Task 2
            structure_data: Structural analysis results
            lexical_data: Lexical analysis results
            grammar_data: Grammatical analysis results
            task_description: The specific IELTS writing task/question (optional)
            
        Returns:
            Optimized prompt for Gemini API
        """
        # Include task description if provided
        task_context = f"\nTask: {task_description}" if task_description and task_description.strip() else ""
        
        prompt = f"""You are an expert IELTS examiner with 15+ years of experience. Evaluate this {task_type} essay according to official IELTS criteria.{task_context}

ESSAY TO EVALUATE:
{essay_text}

ANALYSIS DATA:
- Structure: {structure_data.get('word_count', 0)} words, {structure_data.get('sentence_count', 0)} sentences, {structure_data.get('paragraph_count', 0)} paragraphs
- Vocabulary: {lexical_data.get('vocabulary_size', 0)} unique words, {lexical_data.get('academic_word_count', 0)} academic words
- Grammar: {grammar_data.get('error_count', 0)} errors, {grammar_data.get('error_rate', 0):.2f} error rate

EVALUATION CRITERIA:
1. Task Achievement: How well does the essay address the task requirements? Does it fully develop ideas with relevant examples?
2. Coherence & Cohesion: Is the essay well-organized with clear progression? Are ideas logically connected?
3. Lexical Resource: Is vocabulary varied and appropriate? Are there sophisticated word choices and collocations?
4. Grammatical Range & Accuracy: Is there variety in sentence structures? Are there few grammatical errors?

BAND SCORE GUIDELINES:
- Band 9: Expert user with full operational command
- Band 8: Very good user with occasional inaccuracies
- Band 7: Good user with some inaccuracies and misunderstandings
- Band 6: Competent user with effective command despite inaccuracies
- Band 5: Modest user with partial command and frequent problems

Provide band scores (1-9 in 0.5 increments) with specific feedback for each criterion.

JSON format:
{{
  "overall_band": 0-9,
  "task_achievement": {{"band": 0-9, "feedback": "specific feedback on task response"}},
  "coherence_cohesion": {{"band": 0-9, "feedback": "specific feedback on organization and linking"}},
  "lexical_resource": {{"band": 0-9, "feedback": "specific feedback on vocabulary range and accuracy"}},
  "grammatical_range_accuracy": {{"band": 0-9, "feedback": "specific feedback on grammar and sentence variety"}}
}}"""
        
        return prompt
    
    def evaluate_essay(self, essay_text: str, task_type: str = "Task 2", task_description: str = None) -> Dict[str, Any]:
        """
        Complete IELTS writing evaluation pipeline
        
        Args:
            essay_text: The essay text to evaluate
            task_type: Task 1 or Task 2
            task_description: The specific IELTS writing task/question (optional)
            
        Returns:
            Complete evaluation results
        """
        print(f"Evaluating IELTS {task_type} essay...")
        print("=" * 60)
        
        # Step 1: Analyze essay structure
        print("Step 1: Analyzing essay structure...")
        structure_data = self.analyze_essay_structure(essay_text)
        print(f"Structure: {structure_data['word_count']} words, {structure_data['sentence_count']} sentences, {structure_data['paragraph_count']} paragraphs")
        
        # Step 2: Analyze lexical resource
        print("\nStep 2: Analyzing lexical resource...")
        lexical_data = self.analyze_lexical_resource(essay_text)
        print(f"Vocabulary: {lexical_data['vocabulary_size']} unique words, TTR: {lexical_data['type_token_ratio']:.3f}")
        print(f"   Academic words: {lexical_data['academic_word_count']}, Collocations: {lexical_data['collocation_count']}")
        
        # Step 3: Analyze grammatical accuracy
        print("\nStep 3: Analyzing grammatical accuracy...")
        grammar_data = self.analyze_grammatical_accuracy(essay_text)
        print(f"Grammar: {grammar_data['sentence_count']} sentences, {grammar_data['error_count']} errors")
        print(f"   Error rate: {grammar_data['error_rate']:.2f}, Accuracy score: {grammar_data['accuracy_score']:.1f}/10")
        
        # Step 4: Generate comprehensive evaluation
        print("\nStep 4: Generating comprehensive evaluation...")
        try:
            prompt = self.create_comprehensive_evaluation_prompt(essay_text, task_type, structure_data, lexical_data, grammar_data, task_description)
            evaluation = self._evaluate_with_gemini(prompt)
            print("Gemini evaluation completed")
        except Exception as e:
            print(f"Error in Gemini evaluation: {e}")
            evaluation = "No evaluation generated"
        
        # Step 5: Generate improvement suggestions
        print("\nStep 5: Generating improvement suggestions...")
        try:
            improvement_suggestions = self.generate_improvement_suggestions(essay_text, evaluation, task_type, task_description)
            print("Improvement suggestions generated")
        except Exception as e:
            print(f"Error generating improvements: {e}")
            improvement_suggestions = "No improvement suggestions generated"
        
        # Combine all results
        result = {
            "essay_text": essay_text,
            "task_type": task_type,
            "task_description": task_description,
            "structure_analysis": structure_data,
            "lexical_analysis": lexical_data,
            "grammatical_analysis": grammar_data,
            "evaluation": evaluation,
            "improvement_suggestions": improvement_suggestions,
            "timestamp": "2024-01-01T00:00:00Z"
        }
        
        print("Complete writing evaluation finished!")
        return result
    
    def _evaluate_with_gemini(self, prompt: str) -> Dict[str, Any]:
        """Evaluate essay using Gemini API"""
        try:
            print(f"Generating Gemini API evaluation...")
            print(f"Prompt length: {len(prompt)} characters")
            
            generated_text = self._make_api_request(prompt)
            
            # Try to parse JSON response first
            try:
                json_start = generated_text.find("{")
                json_end = generated_text.rfind("}") + 1
                
                if json_start != -1 and json_end > json_start:
                    json_str = generated_text[json_start:json_end]
                    result = json.loads(json_str)
                    print("Successfully parsed JSON response from Gemini")
                    return result
                else:
                    print("No JSON found in response, using text parsing")
                    return self._parse_text_response(generated_text)
                
            except json.JSONDecodeError as e:
                print(f"JSON parsing failed: {e}")
                return self._parse_text_response(generated_text)
                
        except Exception as e:
            print(f"Error generating evaluation: {e}")
            return "No evaluation generated"
    
    def _parse_text_response(self, text: str) -> Dict[str, Any]:
        """Parse text response when JSON parsing fails"""
        # Simple parsing logic for non-JSON responses
        import re
        
        # Look for band scores in the text
        band_pattern = r'band\s*(\d+(?:\.\d+)?)'
        bands = re.findall(band_pattern, text.lower())
        
        # Create structured response with validated band scores
        overall_band = self._validate_ielts_band_score(float(bands[0]) if bands else 6.0)
        
        return {
            "overall_band": overall_band,
            "task_achievement": {
                "band": self._validate_ielts_band_score(float(bands[1]) if len(bands) > 1 else overall_band),
                "feedback": "Essay addresses the task requirements adequately.",
                "strengths": ["Clear position taken"],
                "weaknesses": ["Could develop ideas further"],
                "improvements": ["Provide more supporting examples"]
            },
            "coherence_cohesion": {
                "band": self._validate_ielts_band_score(float(bands[2]) if len(bands) > 2 else overall_band),
                "feedback": "Ideas are generally well-organized.",
                "strengths": ["Clear paragraph structure"],
                "weaknesses": ["Some linking words missing"],
                "improvements": ["Use more transition phrases"]
            },
            "lexical_resource": {
                "band": self._validate_ielts_band_score(float(bands[3]) if len(bands) > 3 else overall_band),
                "feedback": "Good vocabulary range demonstrated.",
                "strengths": ["Appropriate word choice"],
                "weaknesses": ["Limited vocabulary"],
                "improvements": ["Expand vocabulary range"]
            },
            "grammatical_range_accuracy": {
                "band": self._validate_ielts_band_score(float(bands[4]) if len(bands) > 4 else overall_band),
                "feedback": "Generally accurate grammar.",
                "strengths": ["Good sentence structure"],
                "weaknesses": ["Some errors"],
                "improvements": ["Review grammar"]
            },
            "raw_response": text,
            "model_used": "gemini-2.5-flash-lite"
        }
    
    def _validate_ielts_band_score(self, score: float) -> float:
        """
        Validate and correct IELTS band scores to ensure they are valid (1-9 in 0.5 increments)
        """
        # Ensure valid IELTS range
        if score < 1.0:
            return 1.0
        elif score > 9.0:
            return 9.0
        else:
            # Round to nearest 0.5
            rounded = round(score * 2) / 2
            return max(1.0, min(9.0, rounded))
    
    
    
    def generate_improvement_suggestions(self, essay_text: str, evaluation: Dict[str, Any], task_type: str, task_description: str = None) -> Dict[str, Any]:
        """
        Generate specific improvement suggestions for the essay
        
        Args:
            essay_text: The original essay text
            evaluation: The evaluation results
            task_type: Task 1 or Task 2
            task_description: The specific IELTS writing task/question (optional)
            
        Returns:
            Dictionary containing improvement suggestions
        """
        # Include task description if provided
        task_context = ""
        if task_description and task_description.strip():
            task_context = f"\nTask: {task_description}"
        
        prompt = f"""You are an expert IELTS writing tutor with 15+ years of experience. Provide specific improvement suggestions for this {task_type} essay.{task_context}

ESSAY TO IMPROVE:
{essay_text}

CURRENT PERFORMANCE:
- Overall Band: {evaluation.get('overall_band', 'N/A')}
- Task Achievement: {evaluation.get('task_achievement', {}).get('band', 'N/A')}
- Coherence & Cohesion: {evaluation.get('coherence_cohesion', {}).get('band', 'N/A')}
- Lexical Resource: {evaluation.get('lexical_resource', {}).get('band', 'N/A')}
- Grammatical Range & Accuracy: {evaluation.get('grammatical_range_accuracy', {}).get('band', 'N/A')}

IMPROVEMENT FOCUS:
Provide specific, actionable improvements that will help the student achieve a higher band score. Focus on:
1. Word Replacements: Suggest more sophisticated vocabulary alternatives
2. Grammar Improvements: Identify specific errors and provide corrections with explanations
3. Structure Improvements: Suggest better organization and paragraph development
4. Content Additions: Recommend specific content to strengthen arguments
5. Improved Sentences: Rewrite weak sentences to demonstrate better writing

JSON format:
{{
  "word_replacements": [{{"original": "word", "suggested": "alternative", "reason": "why this is better"}}],
  "grammar_improvements": [{{"error": "incorrect phrase", "correction": "corrected version", "explanation": "grammar rule"}}],
  "structure_improvements": ["specific suggestion for organization"],
  "content_additions": ["specific content to add"],
  "improved_sentences": [{{"original": "weak sentence", "improved": "better version", "improvement": "what was enhanced"}}]
}}"""
        
        try:
            generated_text = self._make_api_request(prompt)
            
            # Try to parse JSON response
            try:
                json_start = generated_text.find("{")
                json_end = generated_text.rfind("}") + 1
                
                if json_start != -1 and json_end > json_start:
                    json_str = generated_text[json_start:json_end]
                    result = json.loads(json_str)
                    return result
                else:
                    return "No improvement suggestions generated"
            except json.JSONDecodeError:
                return "No improvement suggestions generated"
                
        except Exception as e:
            print(f"❌ Error generating improvement suggestions: {e}")
            return "No improvement suggestions generated"
    

    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the Gemini API"""
        return {
            "model_name": self.model_name,
            "api_type": "Gemini API",
            "device": "cloud",
            "loaded": True
        }

