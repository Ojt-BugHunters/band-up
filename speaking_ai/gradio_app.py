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
        self.current_model = "qwen3_light"  # Changed to Qwen3 light for laptop compatibility
        self.model_info = {}
        
    def load_model(self, model_choice):
        """Load the selected model"""
        try:
            print(f"Loading model: {model_choice}")
            self.current_model = model_choice
            self.evaluator = IELTSSpeakingEvaluator(llm_model=model_choice)
            self.evaluator.load_models()
            
            # Get model info
            self.model_info = self.evaluator.get_model_info()
            
            return f"✅ Model loaded successfully!\n\n" \
                   f"ASR: {self.model_info['asr_model']['name']}\n" \
                   f"LLM: {self.model_info['llm_model']['model_name']}\n" \
                   f"Device: {self.model_info['asr_model']['device']}\n" \
                   f"Quantization: {self.model_info['llm_model']['quantization']}"
                   
        except Exception as e:
            return f"❌ Error loading model: {str(e)}"
    
    def evaluate_audio(self, audio_file, question, show_details):
        """Evaluate the uploaded audio file"""
        if self.evaluator is None:
            return "❌ Please load a model first!", "", ""
        
        if audio_file is None:
            return "❌ Please record or upload an audio file!", "", ""
        
        try:
            # Evaluate the audio
            result = self.evaluator.evaluate_speaking(
                audio_path=audio_file,
                question=question if question.strip() else None
            )
            
            if "error" in result:
                return f"❌ Error: {result['error']}", "", ""
            
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
            
            # Create JSON output for developers
            json_output = json.dumps(result, indent=2)
            
            return summary, detailed_feedback, json_output
            
        except Exception as e:
            return f"❌ Error during evaluation: {str(e)}", "", ""
    
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
                <p>Record your speaking sample and get instant IELTS band scores with detailed feedback</p>
            </div>
            """)
            
            with gr.Row():
                with gr.Column(scale=1):
                    # Model Selection
                    gr.Markdown("## 🤖 Model Selection")
                    model_dropdown = gr.Dropdown(
                        choices=list(RECOMMENDED_MODELS.keys()),
                        value="qwen3_light",
                        label="Choose Model",
                        info="Select the LLM model for evaluation (qwen3_light recommended for laptops)"
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
                with gr.Tab("Summary"):
                    summary_output = gr.Markdown(label="Evaluation Summary")
                
                with gr.Tab("Detailed Feedback"):
                    detailed_output = gr.Markdown(label="Detailed Analysis")
                
                with gr.Tab("Raw Data (JSON)"):
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
                outputs=[summary_output, detailed_output, json_output]
            )
            
            # Auto-load qwen3_light model on startup (best for laptops)
            interface.load(
                fn=lambda: self.load_model("qwen3_light"),
                outputs=[model_status]
            )
            
            # Footer
            gr.HTML("""
            <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <p><strong>🎯 IELTS Speaking AI Assessment System</strong></p>
                <p>Powered by Whisper Large-v3-turbo + Open-Source LLMs</p>
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
        share=True,
        server_name=args.host,
        server_port=args.port
    )

if __name__ == "__main__":
    main()
