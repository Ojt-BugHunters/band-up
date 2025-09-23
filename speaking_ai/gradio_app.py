"""
Gradio Web UI for IELTS Speaking AI Assessment
Simple interface for recording audio and testing the model
"""

import gradio as gr
import tempfile
import os
import json
from datetime import datetime
from main import IELTSSpeakingEvaluator
from llm_evaluator import RECOMMENDED_MODELS
import warnings
warnings.filterwarnings("ignore")

class GradioIELTSApp:
    def __init__(self):
        """Initialize the Gradio app"""
        self.evaluator = None
        self.current_model = "gemini_api"  # Changed to Gemini API for production
        self.model_info = {}
        
    def load_model(self, model_choice):
        """Load the selected model"""
        try:
            print(f"Loading model: {model_choice}")
            self.current_model = model_choice
            
            # Handle Gemini API key
            api_key = None
            if model_choice == "gemini_api":
                api_key = self._get_gemini_api_key()
                if not api_key:
                    return "❌ Gemini API key not found. Please set GOOGLE_AI_API_KEY environment variable or create .env file."
            
            self.evaluator = IELTSSpeakingEvaluator(llm_model=model_choice, api_key=api_key)
            self.evaluator.load_models()
            
            # Get model info
            self.model_info = self.evaluator.get_model_info()
            
            if model_choice == "gemini_api":
                return f"✅ Gemini API loaded successfully!\n\n" \
                        f"ASR: {self.model_info['asr_model']['name']}\n" \
                        f"LLM: {self.model_info['llm_model']['model_name']}\n" \
                        f"API Type: {self.model_info['llm_model']['api_type']}\n" \
                        f"Device: {self.model_info['asr_model']['device']}"
            else:
                return f"✅ Model loaded successfully!\n\n" \
                        f"ASR: {self.model_info['asr_model']['name']}\n" \
                        f"LLM: {self.model_info['llm_model']['model_name']}\n" \
                        f"Device: {self.model_info['asr_model']['device']}\n" \
                        f"Quantization: {self.model_info['llm_model']['quantization']}"
                    
        except Exception as e:
            return f"❌ Error loading model: {str(e)}"
    
    def _get_gemini_api_key(self):
        """Get Gemini API key from environment or .env file"""
        import os
        from dotenv import load_dotenv
        
        # Try to load from .env file
        load_dotenv()
        
        # Get from environment variable
        api_key = os.getenv('GOOGLE_AI_API_KEY')
        
        if not api_key:
            print("⚠️ GOOGLE_AI_API_KEY not found in environment variables")
            print("Please set your Gemini API key:")
            print("1. Set environment variable: export GOOGLE_AI_API_KEY='your_api_key'")
            print("2. Or create .env file with: GOOGLE_AI_API_KEY=your_api_key")
        
        return api_key
    
    def generate_learning_guide(self, result):
        """Generate a personalized learning guide using LLM based on the user's actual speech"""
        if not result or "error" in result:
            return "❌ No evaluation data available for learning guide"
        
        try:
            # Extract data
            fluency = result["fluency_analysis"]
            lexical = result["lexical_analysis"]
            grammatical = result["grammatical_analysis"]
            evaluation = result["evaluation"]
            transcript = fluency['transcript']
            
            # Extract detailed feedback from evaluation
            fluency_feedback = evaluation.get('fluency_coherence', {}) if isinstance(evaluation, dict) else {}
            lexical_feedback = evaluation.get('lexical_resource', {}) if isinstance(evaluation, dict) else {}
            grammar_feedback = evaluation.get('grammatical_range_accuracy', {}) if isinstance(evaluation, dict) else {}
            
            # Create a comprehensive prompt for LLM to generate personalized learning guide
            learning_prompt = f"""You are an expert IELTS speaking coach. Create a personalized learning guide for this student based on their actual speech performance and detailed feedback.

STUDENT'S SPEECH DATA:
- **Transcript**: "{transcript}"
- **Overall Band Score**: {evaluation.get('overall_band', 'N/A') if isinstance(evaluation, dict) else 'N/A'}

PERFORMANCE METRICS:
- **Speech Rate**: {fluency['speech_rate_wpm']:.1f} WPM (Target: 120-180 WPM)
- **Duration**: {fluency['duration']:.1f} seconds
- **Word Count**: {fluency['word_count']} words
- **Filled Pauses**: {fluency['filled_pauses']} (Target: <3)
- **Pause Count**: {fluency['pause_count']} (Target: <5)
- **Repetitions**: {fluency['repetitions']}
- **Self-corrections**: {fluency['self_corrections']}
- **Vocabulary Size**: {lexical['vocabulary_size']} unique words
- **Academic Words**: {lexical['academic_word_count']}
- **Sentence Count**: {grammatical['sentence_count']}
- **Average Sentence Length**: {grammatical['avg_sentence_length']:.1f} words
- **Complex Sentences**: {grammatical['complex_sentence_count']} ({grammatical['complexity_ratio']:.1%})
- **Grammar Errors**: {grammatical['error_count']}
- **Detected Errors**: {grammatical.get('detected_errors', [])}

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
6. **🎯 Personalized Action Plan** (weekly goals based on their specific weaknesses)

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
- Use markdown formatting with emojis

Format the response in clear sections with emojis and markdown formatting."""

            # Use LLM to generate personalized learning guide
            if self.evaluator and self.evaluator.llm_evaluator:
                try:
                    print("🤖 Generating personalized learning guide with LLM...")
                    
                    # Use Gemini API if available
                    if self.evaluator.llm_evaluator.model_name == "gemini":
                        personalized_guide = self.evaluator.llm_evaluator.gemini_evaluator.generate_learning_guide(learning_prompt)
                    else:
                        # Generate personalized learning guide using local LLM
                        # For learning guide, we want direct response without thinking mode
                        personalized_guide = self._generate_learning_guide_response(learning_prompt)
                    
                    # Debug: Print the actual LLM response
                    print(f"🔍 DEBUG: LLM raw response length: {len(personalized_guide) if personalized_guide else 0}")
                    print(f"🔍 DEBUG: LLM response preview: {personalized_guide[:300] if personalized_guide else 'None'}...")
                    
                    # If LLM generation fails or is too short, fall back to rule-based approach
                    if not personalized_guide or len(personalized_guide.strip()) < 200:
                        print("⚠️ LLM learning guide generation failed (too short), using fallback...")
                        return self._generate_fallback_learning_guide(result)
                    
                    print(f"✅ LLM learning guide generated successfully ({len(personalized_guide)} chars)")
                    return personalized_guide
                    
                except Exception as e:
                    print(f"⚠️ Error in LLM learning guide generation: {e}")
                    return self._generate_fallback_learning_guide(result)
            else:
                print("⚠️ LLM evaluator not available, using fallback...")
                return self._generate_fallback_learning_guide(result)
            
        except Exception as e:
            return f"❌ Error generating learning guide: {str(e)}"
    
    def _generate_learning_guide_response(self, prompt: str) -> str:
        """Generate learning guide response using Qwen3 without thinking mode"""
        try:
            if not self.evaluator or not self.evaluator.llm_evaluator:
                return "❌ LLM evaluator not available"
            
            # Use Qwen3 model directly without thinking mode for cleaner output
            if "Qwen3" in self.evaluator.llm_evaluator.model_name:
                return self._generate_qwen3_learning_guide(prompt)
            else:
                # Fallback to regular generation
                return self.evaluator.llm_evaluator._generate_qwen3_response(prompt)
                
        except Exception as e:
            print(f"❌ Error in learning guide generation: {e}")
            return f"❌ Error generating learning guide: {str(e)}"
    
    def _generate_qwen3_learning_guide(self, prompt: str) -> str:
        """Generate learning guide using Qwen3 without thinking mode"""
        try:
            import torch
            
            # Prepare the model input using chat template WITHOUT thinking mode
            messages = [
                {"role": "user", "content": prompt}
            ]
            
            # Apply chat template WITHOUT thinking mode for cleaner output
            text = self.evaluator.llm_evaluator.tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True,
                enable_thinking=False  # Disable thinking mode for learning guide
            )
            
            # Tokenize input
            model_inputs = self.evaluator.llm_evaluator.tokenizer([text], return_tensors="pt").to(self.evaluator.llm_evaluator.model.device)
            
            print(f"🔧 Learning guide input length: {model_inputs.input_ids.shape[1]} tokens")
            
            # Generate response with parameters optimized for learning guide
            with torch.no_grad():
                generated_ids = self.evaluator.llm_evaluator.model.generate(
                    **model_inputs,
                    max_new_tokens=512,  # Longer for learning guide
                    temperature=0.8,  # Slightly lower for more focused output
                    top_p=0.9,
                    do_sample=True,
                    pad_token_id=self.evaluator.llm_evaluator.tokenizer.eos_token_id,
                    eos_token_id=self.evaluator.llm_evaluator.tokenizer.eos_token_id,
                    repetition_penalty=1.1,  # Higher to avoid repetition
                    no_repeat_ngram_size=3,
                    early_stopping=True,
                    use_cache=True
                )
            
            # Extract only the new tokens
            output_ids = generated_ids[0][len(model_inputs.input_ids[0]):].tolist()
            
            # Decode the response
            response = self.evaluator.llm_evaluator.tokenizer.decode(output_ids, skip_special_tokens=True).strip()
            
            print(f"💬 Learning guide response length: {len(response)} chars")
            
            return response if response else "Unable to generate learning guide"
            
        except Exception as e:
            print(f"❌ Error in Qwen3 learning guide generation: {e}")
            return f"❌ Error generating learning guide: {str(e)}"
    
    def _generate_fallback_learning_guide(self, result):
        """Fallback learning guide if LLM generation fails"""
        try:
            # Extract data
            fluency = result["fluency_analysis"]
            lexical = result["lexical_analysis"]
            grammatical = result["grammatical_analysis"]
            evaluation = result["evaluation"]
            transcript = fluency['transcript']
            
            # Determine user level for personalization
            overall_band = evaluation.get('overall_band', 5.0) if isinstance(evaluation, dict) else 5.0
            if overall_band >= 7.0:
                level = "advanced"
                tone = "You're already performing well! Let's refine your skills further."
            elif overall_band >= 6.0:
                level = "intermediate"
                tone = "You're making good progress! Let's focus on key improvements."
            else:
                level = "beginner"
                tone = "Great start! Let's build a strong foundation step by step."
            
            # Personalized learning guide based on level
            learning_guide = f"""
# 🎓 **Your Personal IELTS Speaking Improvement Plan**

## 📝 **Your Speech Analysis**
{tone}

**Your Performance:**
- **Band Score**: {overall_band}
- **Speech**: "{transcript}"
- **Duration**: {fluency['duration']:.1f} seconds
- **Speech Rate**: {fluency['speech_rate_wpm']:.1f} WPM

---

## 🎯 **Your Priority Focus Areas**

"""
            
            # Identify top priorities based on performance
            priorities = []
            if fluency['filled_pauses'] > 3:
                priorities.append("Reduce filled pauses (um, uh, er)")
            if fluency['speech_rate_wpm'] < 120:
                priorities.append("Increase speech rate")
            elif fluency['speech_rate_wpm'] > 180:
                priorities.append("Slow down for clarity")
            if lexical['vocabulary_size'] < 60:
                priorities.append("Expand vocabulary range")
            if grammatical['complexity_ratio'] < 0.3:
                priorities.append("Add complex sentences")
            if grammatical['error_count'] > 2:
                priorities.append("Improve grammar accuracy")
            
            for i, priority in enumerate(priorities[:3], 1):
                learning_guide += f"{i}. **{priority}**\n"
            
            learning_guide += f"""

---

## 🔧 **1. Vocabulary Enhancement**

### **Your Current Vocabulary:**
- **Unique Words**: {lexical['vocabulary_size']}
- **Academic Words**: {lexical['academic_word_count']}

"""
            
            # Level-appropriate vocabulary suggestions
            if level == "beginner":
                learning_guide += """
**For Your Level - Focus on:**
- **Basic → Intermediate words**: good → excellent, big → significant
- **Common academic words**: important, different, various, several
- **Simple connectors**: because, so, but, also, first, second
"""
            elif level == "intermediate":
                learning_guide += """
**For Your Level - Focus on:**
- **Intermediate → Advanced words**: very → extremely, think → consider
- **Academic vocabulary**: analyze, demonstrate, indicate, significant
- **Complex connectors**: however, therefore, furthermore, nevertheless
"""
            else:  # advanced
                learning_guide += """
**For Your Level - Focus on:**
- **Sophisticated vocabulary**: remarkable, substantial, comprehensive
- **Advanced academic words**: consequently, furthermore, nevertheless
- **Nuanced expressions**: from my perspective, it's worth noting that
"""
            
            learning_guide += f"""

---

## 📚 **2. Grammar & Structure**

### **Your Current Grammar:**
- **Sentences**: {grammatical['sentence_count']}
- **Average Length**: {grammatical['avg_sentence_length']:.1f} words
- **Complex Sentences**: {grammatical['complex_sentence_count']} ({grammatical['complexity_ratio']:.1%})
- **Errors**: {grammatical['error_count']}

"""
            
            if level == "beginner":
                learning_guide += """
**Focus on:**
- **Simple + compound sentences**: "I like my hometown and it has many parks."
- **Basic connectors**: because, so, but, and
- **Present/past tense accuracy**
"""
            elif level == "intermediate":
                learning_guide += """
**Focus on:**
- **Complex sentences**: "I like my hometown because it has many cultural attractions."
- **Relative clauses**: "I have a friend who lives abroad."
- **Conditional sentences**: "If I had more time, I would travel more."
"""
            else:  # advanced
                learning_guide += """
**Focus on:**
- **Advanced complex structures**: "Not only does my hometown offer cultural attractions, but it also provides excellent educational opportunities."
- **Subjunctive mood**: "If I were to choose, I would prefer..."
- **Passive voice**: "It is widely believed that..."
"""
            
            learning_guide += f"""

---

## 🗣️ **3. Fluency & Coherence**

### **Your Current Fluency:**
- **Speech Rate**: {fluency['speech_rate_wpm']:.1f} WPM
- **Filled Pauses**: {fluency['filled_pauses']}
- **Pauses**: {fluency['pause_count']}

"""
            
            # Personalized fluency advice
            if fluency['speech_rate_wpm'] < 120:
                learning_guide += """
**Your Challenge**: Speaking too slowly
**Solution**: Practice reading aloud at 150 WPM. Use a metronome app.
"""
            elif fluency['speech_rate_wpm'] > 180:
                learning_guide += """
**Your Challenge**: Speaking too fast
**Solution**: Take deeper breaths. Pause after key points for emphasis.
"""
            else:
                learning_guide += """
**Your Strength**: Good speech rate! Keep it up.
**Enhancement**: Add more natural pauses for emphasis.
"""
            
            if fluency['filled_pauses'] > 3:
                learning_guide += """
**Your Challenge**: Too many "um", "uh", "er"
**Solution**: Practice silent pauses. Use transition phrases like "Let me think about that..."
"""
            
            learning_guide += f"""

---

## 📋 **4. Your Enhanced Version**

### **Practice this improved version:**

"""
            
            # Create improved version
            improved_transcript = self._create_improved_transcript(transcript, lexical, grammatical)
            learning_guide += f'> "{improved_transcript}"\n\n'
            
            learning_guide += f"""

---

## 🎯 **5. Your Personal Action Plan**

### **This Week:**
1. **Practice the improved version** 3 times daily
2. **Record yourself** and compare with original
3. **Focus on your top priority**: {priorities[0] if priorities else "general fluency"}
4. **Add 2-3 complex sentences** to your practice

### **This Month:**
1. **Expand vocabulary** by learning 5 new words daily
2. **Practice with different topics** using the same structure
3. **Join speaking clubs** or find conversation partners
4. **Take mock IELTS tests** to track progress

---

## 🏆 **Your Progress Tracking**

**Current Band**: {overall_band}
**Target Band**: [Set your goal - suggest {overall_band + 0.5}]
**Timeline**: [Set your timeline]

**Focus Areas:**
1. **Priority 1**: {priorities[0] if priorities else "General improvement"}
2. **Priority 2**: {priorities[1] if len(priorities) > 1 else "Vocabulary expansion"}
3. **Maintain**: [Your strengths]

*Remember: Consistent practice is key to improvement!* 🚀
"""
            
            return learning_guide
            
        except Exception as e:
            return f"❌ Error generating fallback learning guide: {str(e)}"
    
    
    def _create_improved_transcript(self, transcript, lexical_data, grammatical_data):
        """Create an improved version of the user's transcript"""
        # Simple improvements - in a real system, this would use NLP
        improvements = {
            'good': 'excellent',
            'bad': 'poor',
            'big': 'significant',
            'small': 'limited',
            'very': 'extremely',
            'really': 'genuinely',
            'thing': 'aspect',
            'stuff': 'elements',
            'get': 'obtain',
            'make': 'create',
            'do': 'perform',
            'have': 'possess',
            'go': 'proceed',
            'come': 'arrive',
            'see': 'observe',
            'know': 'understand',
            'think': 'consider',
            'want': 'desire'
        }
        
        improved = transcript
        for basic, advanced in improvements.items():
            improved = improved.replace(f' {basic} ', f' {advanced} ')
            improved = improved.replace(f' {basic}.', f' {advanced}.')
            improved = improved.replace(f' {basic},', f' {advanced},')
        
        # Add some academic connectors if missing
        if 'however' not in improved.lower() and 'but' in improved.lower():
            improved = improved.replace(' but ', ' however, ')
        if 'therefore' not in improved.lower() and 'so' in improved.lower():
            improved = improved.replace(' so ', ' therefore, ')
        if 'furthermore' not in improved.lower() and 'also' in improved.lower():
            improved = improved.replace(' also ', ' furthermore, ')
        
        return improved

    def evaluate_audio(self, audio_file, question, show_details):
        """Evaluate the uploaded audio file"""
        if self.evaluator is None:
            return "❌ Please load a model first!", "", "", ""
        
        if audio_file is None:
            return "❌ Please record or upload an audio file!", "", "", ""
        
        try:
            # Evaluate the audio
            result = self.evaluator.evaluate_speaking(
                audio_path=audio_file,
                question=question if question.strip() else None
            )
            
            if "error" in result:
                return f"❌ Error: {result['error']}", "", "", ""
            
            # Extract results
            evaluation = result["evaluation"]
            fluency = result["fluency_analysis"]
            
            # Debug: Print the structure of evaluation
            print(f"🔍 DEBUG: Evaluation keys: {list(evaluation.keys()) if isinstance(evaluation, dict) else type(evaluation)}")
            print(f"🔍 DEBUG: Evaluation type: {type(evaluation)}")
            if isinstance(evaluation, dict):
                print(f"🔍 DEBUG: Has overall_band: {'overall_band' in evaluation}")
                if 'overall_band' in evaluation:
                    print(f"🔍 DEBUG: overall_band value: {evaluation['overall_band']}")
            
            # Create summary with safety check
            overall_band = evaluation.get('overall_band', 'N/A') if isinstance(evaluation, dict) else 'N/A'
            summary = f"""
🎯 **IELTS Speaking Evaluation Results**

**Overall Band Score: {overall_band}**

📊 **Performance Summary:**
- **Transcript**: "{fluency['transcript']}"
- **Speech Rate**: {fluency['speech_rate_wpm']:.1f} words per minute
- **Duration**: {fluency['duration']:.1f} seconds
- **Word Count**: {fluency['word_count']} words
- **Filled Pauses**: {fluency['filled_pauses']}
- **Pause Frequency**: {fluency['pause_frequency']:.2f} pauses per second

**Band Scores:**
- **Fluency & Coherence**: {evaluation.get('fluency_coherence', {}).get('band', 'N/A') if isinstance(evaluation, dict) else 'N/A'}
- **Lexical Resource**: {evaluation.get('lexical_resource', {}).get('band', 'N/A') if isinstance(evaluation, dict) else 'N/A'}
- **Grammatical Range & Accuracy**: {evaluation.get('grammatical_range_accuracy', {}).get('band', 'N/A') if isinstance(evaluation, dict) else 'N/A'}
- **Pronunciation**: {evaluation.get('pronunciation', {}).get('band', 'N/A') if isinstance(evaluation, dict) else 'N/A'}
"""
            
            # Create detailed feedback with safety checks
            detailed_feedback = ""
            if show_details and isinstance(evaluation, dict):
                fc = evaluation.get('fluency_coherence', {})
                lr = evaluation.get('lexical_resource', {})
                gra = evaluation.get('grammatical_range_accuracy', {})
                pron = evaluation.get('pronunciation', {})
                
                detailed_feedback = f"""
📝 **Detailed Feedback:**

**1. Fluency & Coherence (Band {fc.get('band', 'N/A')})**
{fc.get('feedback', 'No feedback available')}

**Strengths:**
{chr(10).join(['• ' + s for s in fc.get('strengths', ['No strengths identified'])])}

**Areas for Improvement:**
{chr(10).join(['• ' + w for w in fc.get('weaknesses', ['No weaknesses identified'])])}

**Suggestions:**
{chr(10).join(['• ' + i for i in fc.get('improvements', ['No suggestions available'])])}

---

**2. Lexical Resource (Band {lr.get('band', 'N/A')})**
{lr.get('feedback', 'No feedback available')}

**Strengths:**
{chr(10).join(['• ' + s for s in lr.get('strengths', ['No strengths identified'])])}

**Areas for Improvement:**
{chr(10).join(['• ' + w for w in lr.get('weaknesses', ['No weaknesses identified'])])}

**Suggestions:**
{chr(10).join(['• ' + i for i in lr.get('improvements', ['No suggestions available'])])}

---

**3. Grammatical Range & Accuracy (Band {gra.get('band', 'N/A')})**
{gra.get('feedback', 'No feedback available')}

**Strengths:**
{chr(10).join(['• ' + s for s in gra.get('strengths', ['No strengths identified'])])}

**Areas for Improvement:**
{chr(10).join(['• ' + w for w in gra.get('weaknesses', ['No weaknesses identified'])])}

**Suggestions:**
{chr(10).join(['• ' + i for i in gra.get('improvements', ['No suggestions available'])])}

---

**4. Pronunciation (Band {pron.get('band', 'N/A')})**
{pron.get('feedback', 'No feedback available')}

**Strengths:**
{chr(10).join(['• ' + s for s in pron.get('strengths', ['No strengths identified'])])}

**Areas for Improvement:**
{chr(10).join(['• ' + w for w in pron.get('weaknesses', ['No weaknesses identified'])])}

**Suggestions:**
{chr(10).join(['• ' + i for i in pron.get('improvements', ['No suggestions available'])])}
"""
            
            # Generate learning guide
            learning_guide = self.generate_learning_guide(result)
            
            # Debug: Print learning guide info
            print(f"🔍 DEBUG: Learning guide generated: {len(learning_guide)} chars")
            print(f"🔍 DEBUG: Learning guide preview: {learning_guide[:200]}...")
            
            # Ensure learning guide is not empty
            if not learning_guide or learning_guide.strip() == "":
                learning_guide = "❌ Learning guide generation failed. Please try again."
                print("⚠️ WARNING: Learning guide is empty!")
            else:
                print(f"✅ Learning guide ready for display: {len(learning_guide)} characters")
            
            # Create JSON output for developers
            json_output = json.dumps(result, indent=2)
            
            return summary, detailed_feedback, learning_guide, json_output
            
        except Exception as e:
            return f"❌ Error during evaluation: {str(e)}", "", "", ""
    
    def create_interface(self):
        """Create the Gradio interface"""
        
        # Custom CSS for better styling
        css = """
        .gradio-container {
            max-width: 1200px !important;
        }
        .main-header {
            text-align: center;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .model-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #007bff;
        }
        .result-box {
            background: #e8f5e8;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #28a745;
        }
        """
        
        with gr.Blocks(css=css, title="IELTS Speaking AI Assessment") as interface:
            
            # Header
            gr.HTML("""
            <div class="main-header">
                <h1>🎯 IELTS Speaking AI Assessment</h1>
                <p>Record your speaking sample and get instant IELTS band scores with detailed feedback and personalized learning guide</p>
            </div>
            """)
            
            with gr.Row():
                with gr.Column(scale=1):
                    # Model Selection
                    gr.Markdown("## 🤖 Model Selection")
                    model_dropdown = gr.Dropdown(
                        choices=list(RECOMMENDED_MODELS.keys()),
                        value="gemini_api",
                        label="Choose Model",
                        info="Select the LLM model for evaluation (gemini_api recommended for production)"
                    )
                    
                    load_model_btn = gr.Button("Load Model", variant="primary")
                    model_status = gr.Textbox(
                        label="Model Status",
                        interactive=False,
                        lines=6
                    )
                    
                    # IELTS Question
                    gr.Markdown("## 📝 IELTS Speaking Question")
                    question_input = gr.Textbox(
                        label="Speaking Question (Optional)",
                        placeholder="e.g., Describe your hometown and what you like about it.",
                        lines=3
                    )
                    
                    # Sample Questions
                    gr.Markdown("### 💡 Sample Questions:")
                    sample_questions = [
                        "Describe your hometown and what you like about it.",
                        "Talk about a book you recently read.",
                        "Describe a memorable trip you took.",
                        "Discuss the advantages and disadvantages of social media.",
                        "Talk about your future career plans."
                    ]
                    
                    for i, q in enumerate(sample_questions):
                        gr.Button(f"Q{i+1}: {q[:50]}...", size="sm").click(
                            lambda q=q: q, outputs=question_input
                        )
                
                with gr.Column(scale=1):
                    # Audio Recording
                    gr.Markdown("## 🎤 Audio Recording")
                    
                    audio_input = gr.Audio(
                        label="Record or Upload Audio",
                        type="filepath",
                        sources=["microphone", "upload"]
                    )
                    
                    # Evaluation Options
                    gr.Markdown("## ⚙️ Evaluation Options")
                    show_details = gr.Checkbox(
                        label="Show Detailed Feedback",
                        value=True,
                        info="Include detailed analysis for each IELTS criterion"
                    )
                    
                    evaluate_btn = gr.Button("Evaluate Speaking", variant="primary", size="lg")
            
            # Results Section
            gr.Markdown("## 📊 Evaluation Results")
            
            with gr.Tabs():
                with gr.Tab("📊 Summary"):
                    summary_output = gr.Markdown(label="Evaluation Summary")
                
                with gr.Tab("📝 Detailed Feedback"):
                    detailed_output = gr.Markdown(label="Detailed Analysis")
                
                with gr.Tab("🎓 Learning Guide"):
                    learning_guide_output = gr.Markdown(label="Personalized Learning Guide")
                
                with gr.Tab("🔧 Raw Data (JSON)"):
                    json_output = gr.Code(
                        label="Raw Evaluation Data",
                        language="json",
                        lines=20
                    )
            
            # Event Handlers
            load_model_btn.click(
                fn=self.load_model,
                inputs=[model_dropdown],
                outputs=[model_status]
            )
            
            evaluate_btn.click(
                fn=self.evaluate_audio,
                inputs=[audio_input, question_input, show_details],
                outputs=[summary_output, detailed_output, learning_guide_output, json_output]
            )
            
            # Auto-load gemini_api model on startup (best for production)
            interface.load(
                fn=lambda: self.load_model("gemini_api"),
                outputs=[model_status]
            )
            
            # Footer
            gr.HTML("""
            <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <p><strong>🎯 IELTS Speaking AI Assessment System</strong></p>
                <p>Powered by Whisper Large-v3-turbo + Gemini API / Open-Source LLMs</p>
                <p>🚀 Supports arbitrary length audio files</p>
                <p>Built with ❤️ for IELTS learners worldwide</p>
            </div>
            """)
        
        return interface
    
    def launch(self, share=False, server_name="0.0.0.0", server_port=7860):
        """Launch the Gradio app"""
        interface = self.create_interface()
        
        print("🚀 Starting IELTS Speaking AI Assessment App...")
        print("=" * 60)
        print("📱 Web Interface will be available at:")
        print(f"   Local: http://localhost:{server_port}")
        if share:
            print("   Public: [Gradio will provide a public URL]")
        print("=" * 60)
        
        interface.launch(
            share=share,
            server_name=server_name,
            server_port=server_port,
            show_error=True,
            quiet=False
        )

def main():
    """Main function to run the Gradio app"""
    import argparse
    
    parser = argparse.ArgumentParser(description="IELTS Speaking AI Assessment - Gradio App")
    parser.add_argument("--share", action="store_true", help="Create a public link")
    parser.add_argument("--port", type=int, default=7860, help="Port to run the app on")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host to run the app on")
    
    args = parser.parse_args()
    
    # Create and launch the app
    app = GradioIELTSApp()
    app.launch(
        share=args.share,
        server_name=args.host,
        server_port=args.port
    )

if __name__ == "__main__":
    main()
