"""
IELTS Writing AI Assessment - Gradio Web Interface
Interactive web application for essay evaluation and improvement suggestions
"""

import gradio as gr
import json
from typing import Dict, Any, Optional
from main import IELTSSpeakingEvaluator
import warnings
warnings.filterwarnings("ignore")

class GradioIELTSWritingApp:
    """Gradio web interface for IELTS Writing Assessment"""
    
    def __init__(self):
        """Initialize the Gradio app"""
        self.evaluator = None
        self.model_info = {}
        
    def load_evaluator(self):
        """Load the writing evaluator"""
        try:
            print("🔄 Loading IELTS Writing Evaluator...")
            self.evaluator = IELTSSpeakingEvaluator()
            self.model_info = self.evaluator.get_model_info()
            
            return f"✅ Writing Evaluator loaded successfully!\n\n" \
                   f"Model: {self.model_info['writing_model']['model_name']}\n" \
                   f"API Type: {self.model_info['writing_model']['api_type']}\n" \
                   f"System: {self.model_info['system']}"
                   
        except Exception as e:
            return f"❌ Error loading evaluator: {str(e)}"
    
    def evaluate_essay(self, essay_text: str, task_type: str, task_description: str, show_details: bool) -> tuple:
        """
        Evaluate essay and return results
        
        Args:
            essay_text: The essay text to evaluate
            task_type: Task 1 or Task 2
            task_description: The specific IELTS writing task/question
            show_details: Whether to show detailed analysis
            
        Returns:
            Tuple of (summary, detailed_feedback, learning_guide, json_output)
        """
        if not self.evaluator:
            return "❌ Evaluator not loaded. Please load the evaluator first.", "", "", "{}"
        
        if not essay_text or len(essay_text.strip()) < 50:
            return "❌ Essay is too short. Please provide at least 50 words for evaluation.", "", "", "{}"
        
        try:
            # Evaluate the essay with task description
            result = self.evaluator.evaluate_writing(essay_text, task_type, task_description)
            
            if "error" in result:
                return f"❌ Error: {result['error']}", "", "", json.dumps(result, indent=2)
            
            # Generate summary
            evaluation = result["evaluation"]
            summary = self._create_summary(evaluation, result)
            
            # Generate detailed feedback
            detailed_feedback = self._create_detailed_feedback(result) if show_details else "Enable 'Show Detailed Feedback' to see comprehensive analysis."
            
            # Generate learning guide
            learning_guide = self.evaluator.generate_learning_guide(result)
            
            # Create JSON output
            json_output = json.dumps(result, indent=2)
            
            return summary, detailed_feedback, learning_guide, json_output
            
        except Exception as e:
            error_msg = f"❌ Error during evaluation: {str(e)}"
            return error_msg, "", "", json.dumps({"error": str(e)}, indent=2)
    
    def _create_summary(self, evaluation: Dict[str, Any], result: Dict[str, Any]) -> str:
        """Create a summary of the evaluation results"""
        structure = result["structure_analysis"]
        lexical = result["lexical_analysis"]
        grammar = result["grammatical_analysis"]
        
        summary = f"""
# 📊 **IELTS Writing Assessment Summary**

## 🎯 **Overall Band Score: {evaluation.get('overall_band', 'N/A')}**

### 📋 **Band Scores Breakdown:**
- **Task Achievement**: {evaluation.get('task_achievement', {}).get('band', 'N/A')}
- **Coherence & Cohesion**: {evaluation.get('coherence_cohesion', {}).get('band', 'N/A')}
- **Lexical Resource**: {evaluation.get('lexical_resource', {}).get('band', 'N/A')}
- **Grammatical Range & Accuracy**: {evaluation.get('grammatical_range_accuracy', {}).get('band', 'N/A')}

### 📊 **Key Metrics:**
- **Word Count**: {structure.get('word_count', 0)} words
- **Sentence Count**: {structure.get('sentence_count', 0)} sentences
- **Paragraph Count**: {structure.get('paragraph_count', 0)} paragraphs
- **Vocabulary Size**: {lexical.get('vocabulary_size', 0)} unique words
- **Grammatical Errors**: {grammar.get('error_count', 0)}

### 🎯 **Quick Feedback:**
**Task Achievement**: {evaluation.get('task_achievement', {}).get('feedback', 'No feedback available')}

**Coherence & Cohesion**: {evaluation.get('coherence_cohesion', {}).get('feedback', 'No feedback available')}

**Lexical Resource**: {evaluation.get('lexical_resource', {}).get('feedback', 'No feedback available')}

**Grammar**: {evaluation.get('grammatical_range_accuracy', {}).get('feedback', 'No feedback available')}

---
*For detailed analysis and improvement suggestions, check the "Detailed Feedback" and "Learning Guide" tabs.*
"""
        return summary
    
    def _create_detailed_feedback(self, result: Dict[str, Any]) -> str:
        """Create detailed feedback from evaluation results"""
        evaluation = result["evaluation"]
        structure = result["structure_analysis"]
        lexical = result["lexical_analysis"]
        grammar = result["grammatical_analysis"]
        improvements = result["improvement_suggestions"]
        
        detailed_feedback = f"""
# 📝 **Detailed Writing Analysis**

## 🎯 **Overall Performance**
**Band Score**: {evaluation.get('overall_band', 'N/A')}

---

## 📊 **Structural Analysis**

### 📏 **Essay Structure:**
- **Word Count**: {structure.get('word_count', 0)} words
- **Sentence Count**: {structure.get('sentence_count', 0)} sentences
- **Paragraph Count**: {structure.get('paragraph_count', 0)} paragraphs
- **Average Sentence Length**: {structure.get('avg_sentence_length', 0):.1f} words
- **Average Words per Paragraph**: {structure.get('avg_words_per_paragraph', 0):.1f} words

### 🔗 **Coherence Indicators:**
- **Complex Sentences**: {structure.get('complex_sentence_count', 0)} ({structure.get('complexity_ratio', 0):.1%})
- **Transition Words**: {structure.get('transition_word_count', 0)}

---

## 📚 **Lexical Resource Analysis**

### 🗣️ **Vocabulary Metrics:**
- **Vocabulary Size**: {lexical.get('vocabulary_size', 0)} unique words
- **Type-Token Ratio**: {lexical.get('type_token_ratio', 0):.3f}
- **Academic Words**: {lexical.get('academic_word_count', 0)} ({lexical.get('academic_word_ratio', 0):.1%})
- **Average Word Length**: {lexical.get('avg_word_length', 0):.1f} characters
- **Long Words (>6 chars)**: {lexical.get('long_word_ratio', 0):.1%}
- **Collocations Used**: {lexical.get('collocation_count', 0)}

### 📊 **Vocabulary Quality:**
- **Most Common Words**: {', '.join([f"{word}({count})" for word, count in lexical.get('most_common_words', [])])}
- **Repeated Words**: {', '.join(lexical.get('repeated_words', []))}
- **Academic Words Found**: {', '.join(lexical.get('academic_words_found', []))}
- **Collocations Found**: {', '.join(lexical.get('collocations_found', []))}
- **Lexical Sophistication Score**: {lexical.get('lexical_sophistication_score', 0):.2f}/10

---

## 📝 **Grammatical Analysis**

### ✅ **Accuracy Metrics:**
- **Sentence Count**: {grammar.get('sentence_count', 0)}
- **Grammatical Errors**: {grammar.get('error_count', 0)}
- **Error Rate**: {grammar.get('error_rate', 0):.2f} errors per sentence
- **Accuracy Score**: {grammar.get('accuracy_score', 0):.1f}/10

### 🔍 **Error Analysis:**
{self._format_list(grammar.get('detected_errors', []), "- No major errors detected")}

### 🎭 **Tense Usage:**
- **Present Tense**: {grammar.get('present_tense_count', 0)}
- **Past Tense**: {grammar.get('past_tense_count', 0)}
- **Future Tense**: {grammar.get('future_tense_count', 0)}
- **Tense Consistency**: {grammar.get('tense_consistency', 0):.2f}

### 📏 **Sentence Variety:**
- **Sentence Variety Score**: {grammar.get('sentence_variety', 0):.2f}

---

## 🔧 **Improvement Suggestions**

### 🔄 **Word Replacements:**
{self._format_word_replacements(improvements.get('word_replacements', []))}

### 📚 **Grammar Improvements:**
{self._format_grammar_improvements(improvements.get('grammar_improvements', []))}

### 📝 **Structure Improvements:**
{self._format_list(improvements.get('structure_improvements', []), "- Structure is generally well-organized")}

### ➕ **Content Additions:**
{self._format_list(improvements.get('content_additions', []), "- Content adequately addresses the task")}

---
*For personalized learning plans and specific action items, check the "Learning Guide" tab.*
"""
        return detailed_feedback
    
    def _format_list(self, items: list, default: str) -> str:
        """Format a list of items with newlines, avoiding f-string backslash issues"""
        if not items:
            return default
        return "\n".join([f"- {item}" for item in items])
    
    def _format_word_replacements(self, replacements: list) -> str:
        """Format word replacements list"""
        if not replacements:
            return "- No specific word replacements suggested"
        formatted = []
        for item in replacements:
            original = item.get('original', 'word')
            suggested = item.get('suggested', 'replacement')
            reason = item.get('reason', 'reason')
            formatted.append(f"- **{original}** → **{suggested}** ({reason})")
        return "\n".join(formatted)
    
    def _format_grammar_improvements(self, improvements: list) -> str:
        """Format grammar improvements list"""
        if not improvements:
            return "- No specific grammar errors detected"
        formatted = []
        for item in improvements:
            error = item.get('error', 'error')
            correction = item.get('correction', 'correction')
            explanation = item.get('explanation', 'explanation')
            formatted.append(f"- **Error**: {error}\n  **Correction**: {correction}\n  **Explanation**: {explanation}")
        return "\n".join(formatted)
    
    def create_interface(self):
        """Create the Gradio interface"""
        
        with gr.Blocks(
            title="IELTS Writing AI Assessment",
            theme=gr.themes.Soft(),
            css="""
            .gradio-container {
                max-width: 1200px !important;
                margin: auto !important;
            }
            .main-header {
                text-align: center;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 20px;
            }
            """
        ) as interface:
            
            # Header
            gr.HTML("""
            <div class="main-header">
                <h1>🎯 IELTS Writing AI Assessment System</h1>
                <p>Advanced essay evaluation with detailed feedback and improvement suggestions</p>
                <p>Powered by Gemini API for professional-grade assessment</p>
            </div>
            """)
            
            # Model Status Section
            with gr.Row():
                with gr.Column(scale=1):
                    gr.Markdown("## 🤖 System Status")
                    load_btn = gr.Button("Load Writing Evaluator", variant="primary")
                    model_status = gr.Textbox(
                        label="System Status",
                        interactive=False,
                        lines=4
                    )
            
            # Main Input Section
            with gr.Row():
                with gr.Column(scale=2):
                    gr.Markdown("## 📝 Essay Input")
                    
                    # Essay input
                    essay_input = gr.Textbox(
                        label="Paste your essay here",
                        placeholder="Enter your IELTS essay...",
                        lines=10,
                        info="Minimum 50 words required for evaluation"
                    )
                    
                    # Task type selection
                    task_type = gr.Radio(
                        choices=["Task 1", "Task 2"],
                        value="Task 2",
                        label="Task Type",
                        info="Select the type of IELTS Writing task"
                    )
                    
                    # Task description input
                    task_description = gr.Textbox(
                        label="IELTS Writing Task/Question",
                        placeholder="Enter the specific IELTS writing task or question here...",
                        lines=3,
                        info="Provide the exact task description for more accurate evaluation",
                        value="Some people believe that technology has made our lives easier, while others think it has made life more complicated. Discuss both views and give your own opinion."
                    )
                    
                    # Sample task buttons
                    with gr.Row():
                        gr.Markdown("**Quick Task Examples:**")
                        sample_task1_btn = gr.Button("Sample Task 1", size="sm")
                        sample_task2_btn = gr.Button("Sample Task 2", size="sm")
                        sample_task3_btn = gr.Button("Sample Task 2 (Opinion)", size="sm")
                    
                    # Options
                    with gr.Row():
                        show_details = gr.Checkbox(
                            label="Show Detailed Analysis",
                            value=True,
                            info="Include comprehensive structural and linguistic analysis"
                        )
                        
                        evaluate_btn = gr.Button("Evaluate Essay", variant="primary", size="lg")
            
            # Results Section
            gr.Markdown("## 📊 Evaluation Results")
            
            with gr.Tabs():
                with gr.Tab("📊 Summary"):
                    summary_output = gr.Markdown(label="Evaluation Summary")
                
                with gr.Tab("📝 Detailed Feedback"):
                    detailed_output = gr.Markdown(label="Detailed Analysis")
                
                with gr.Tab("🎓 Learning Guide"):
                    learning_guide_output = gr.Markdown(label="Personalized Learning Guide - Priority Focus, Suggestion Fix & Sample")
                
                with gr.Tab("🔧 Raw Data (JSON)"):
                    json_output = gr.Code(
                        label="Raw Evaluation Data",
                        language="json",
                        lines=20
                    )
            
            # Event Handlers
            load_btn.click(
                fn=self.load_evaluator,
                inputs=[],
                outputs=[model_status]
            )
            
            evaluate_btn.click(
                fn=self.evaluate_essay,
                inputs=[essay_input, task_type, task_description, show_details],
                outputs=[summary_output, detailed_output, learning_guide_output, json_output]
            )
            
            # Sample task button handlers
            sample_task1_btn.click(
                fn=lambda: ("Task 1", "The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011. Summarize the information by selecting and reporting the main features, and make comparisons where relevant."),
                outputs=[task_type, task_description]
            )
            
            sample_task2_btn.click(
                fn=lambda: ("Task 2", "Some people believe that technology has made our lives easier, while others think it has made life more complicated. Discuss both views and give your own opinion."),
                outputs=[task_type, task_description]
            )
            
            sample_task3_btn.click(
                fn=lambda: ("Task 2", "In many countries, the number of people living alone is increasing rapidly. What are the causes of this trend? Do you think it is a positive or negative development?"),
                outputs=[task_type, task_description]
            )
            
            # Auto-load evaluator on startup
            interface.load(
                fn=self.load_evaluator,
                outputs=[model_status]
            )
            
            # Footer
            gr.HTML("""
            <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <p><strong>🎯 IELTS Writing AI Assessment System</strong></p>
                <p>Powered by Gemini API for professional-grade writing evaluation</p>
                <p>🚀 Comprehensive feedback on all IELTS writing criteria</p>
                <p>Built with ❤️ for IELTS learners worldwide</p>
            </div>
            """)
        
        return interface

def main():
    """Main function to launch the Gradio app"""
    print("🎯 IELTS Writing AI Assessment - Gradio App")
    print("=" * 50)
    
    # Create the app
    app = GradioIELTSWritingApp()
    interface = app.create_interface()
    
    print("🚀 Starting the web interface...")
    print("📱 The app will open in your browser automatically")
    print("🛑 Press Ctrl+C to stop the server")
    
    # Launch the interface
    interface.launch(
        server_name="0.0.0.0",
        server_port=7861,  # Different port from speaking app
        share=False,
        debug=True,
        show_error=True
    )

if __name__ == "__main__":
    main()

