"""
IELTS Writing AI Assessment System
Complete pipeline for essay evaluation, grading, and improvement suggestions
"""

from writing_evaluator import IELTSWritingEvaluator
from typing import Dict, Any, Optional

class IELTSSpeakingEvaluator:
    """Main IELTS Writing Assessment System"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the IELTS Writing Assessment System
        
        Args:
            api_key: Google AI API key for Gemini (optional, will try environment variable)
        """
        self.writing_evaluator = IELTSWritingEvaluator(api_key=api_key)
        
        print("IELTS Writing Assessment System initialized")
    
    def evaluate_writing(self, essay_text: str, task_type: str = "Task 2", task_description: str = None) -> Dict[str, Any]:
        """
        Complete IELTS writing evaluation pipeline
        
        Args:
            essay_text: The essay text to evaluate
            task_type: Task 1 or Task 2
            task_description: The specific IELTS writing task/question (optional)
            
        Returns:
            Complete evaluation results with detailed analysis
        """
        print(f"Starting IELTS {task_type} Writing Evaluation")
        print("=" * 60)
        
        # Validate input
        if not essay_text or len(essay_text.strip()) < 50:
            return {
                "error": "Essay text is too short. Please provide at least 50 words for evaluation.",
                "essay_text": essay_text,
                "task_type": task_type
            }
        
        try:
            # Run the complete evaluation pipeline
            result = self.writing_evaluator.evaluate_essay(essay_text, task_type, task_description)
            
            # Add system information
            result["system_info"] = {
                "evaluator": "IELTS Writing AI Assessment System",
                "model": "Gemini 2.5 Flash API",
                "version": "1.0.0"
            }
            
            return result
            
        except Exception as e:
            print(f"Error in writing evaluation: {e}")
            return {
                "error": f"Evaluation failed: {str(e)}",
                "essay_text": essay_text,
                "task_type": task_type
            }
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model"""
        return {
            "writing_model": self.writing_evaluator.get_model_info(),
            "system": "IELTS Writing AI Assessment System"
        }
    
    def generate_learning_guide(self, evaluation_result: Dict[str, Any]) -> str:
        """
        Generate personalized learning guide based on evaluation results
        
        Args:
            evaluation_result: Results from evaluate_writing
            
        Returns:
            Personalized learning guide text
        """
        if "error" in evaluation_result:
            return f"Cannot generate learning guide due to evaluation error: {evaluation_result['error']}"
        
        try:
            essay_text = evaluation_result["essay_text"]
            task_type = evaluation_result["task_type"]
            evaluation = evaluation_result["evaluation"]
            structure = evaluation_result["structure_analysis"]
            lexical = evaluation_result["lexical_analysis"]
            grammar = evaluation_result["grammatical_analysis"]
            improvements = evaluation_result["improvement_suggestions"]
            
            # Create comprehensive learning guide prompt
            task_context = ""
            if evaluation_result.get("task_description") and evaluation_result["task_description"].strip():
                task_context = f"\nTask: {evaluation_result['task_description']}"
            
            learning_prompt = f"""You are an expert IELTS writing tutor with 15+ years of experience. Create a personalized learning guide for this student.{task_context}

STUDENT PROFILE:
- Task Type: {task_type}
- Essay Length: {structure.get('word_count', 0)} words
- Current Band Score: {evaluation.get('overall_band', 'N/A')}

EVALUATION FEEDBACK:
- Task Achievement: {evaluation.get('task_achievement', {}).get('feedback', 'No feedback')}
- Coherence & Cohesion: {evaluation.get('coherence_cohesion', {}).get('feedback', 'No feedback')}
- Lexical Resource: {evaluation.get('lexical_resource', {}).get('feedback', 'No feedback')}
- Grammatical Range & Accuracy: {evaluation.get('grammatical_range_accuracy', {}).get('feedback', 'No feedback')}

IMPROVEMENT SUGGESTIONS: {improvements}

LEARNING GUIDE REQUIREMENTS:
Create a comprehensive learning guide with these sections:
1. Priority Focus Areas: Identify 2-3 main weaknesses that need immediate attention
2. Suggestion Fix: Provide specific word replacements, grammar corrections, and content improvements
3. Suggestion Sample: Rewrite key parts of the essay to show better writing techniques

GUIDELINES:
- Be encouraging but honest about areas for improvement
- Provide specific, actionable advice
- Focus on the most impactful changes for band score improvement
- Use clear examples and explanations
- Start with "# Personalized Writing Learning Guide"

Make the guide practical and immediately applicable for the student."""
            
            # Generate learning guide using Gemini API
            learning_guide = self.writing_evaluator._make_api_request(learning_prompt)
            
            # Ensure learning guide has proper format
            if not learning_guide.startswith("# Personalized"):
                learning_guide = f"# Personalized Writing Learning Guide\n\n{learning_guide}"
            
            return learning_guide
            
        except Exception as e:
            return f"Error generating learning guide: {str(e)}"

def main():
    """Main function to demonstrate the system"""
    import sys
    
    print("IELTS Writing AI Assessment System")
    print("=" * 60)
    
    # Initialize evaluator
    try:
        evaluator = IELTSSpeakingEvaluator()
        print("System initialized successfully!")
    except Exception as e:
        print(f"Failed to initialize system: {e}")
        print("\nMake sure to set your GOOGLE_AI_API_KEY environment variable")
        return
    
    # Show model information
    model_info = evaluator.get_model_info()
    print(f"\nModel Information:")
    print(f"Writing Model: {model_info['writing_model']['model_name']}")
    print(f"API Type: {model_info['writing_model']['api_type']}")
    
    # Example essay for testing
    sample_essay = """
    In recent years, technology has become an integral part of our daily lives. Some people believe that this trend has positive effects on society, while others argue that it brings more problems than benefits. In my opinion, technology has both advantages and disadvantages, but the benefits outweigh the drawbacks.
    
    On the one hand, technology has greatly improved our quality of life. For example, the internet has made communication much easier and faster. People can now connect with friends and family members who live far away through video calls and social media. Additionally, technology has revolutionized healthcare, allowing doctors to diagnose and treat diseases more effectively.
    
    On the other hand, technology also has some negative aspects. One major concern is the impact on employment. Many jobs are being replaced by machines and artificial intelligence, leading to unemployment for many workers. Furthermore, excessive use of technology can lead to social isolation and health problems such as eye strain and poor posture.
    
    In conclusion, while technology has some negative effects, I believe that the positive impacts are more significant. The key is to use technology responsibly and find a balance between its benefits and drawbacks.
    """
    
    try:
        # Evaluate the sample essay
        print(f"\nEvaluating sample Task 2 essay...")
        result = evaluator.evaluate_writing(sample_essay, "Task 2")
        
        if "error" in result:
            print(f"Error: {result['error']}")
        else:
            # Display results
            print("\n" + "="*60)
            print("IELTS WRITING EVALUATION RESULTS")
            print("="*60)
            
            evaluation = result["evaluation"]
            print(f"\nBAND SCORES:")
            print(f"Overall Band: {evaluation['overall_band']}")
            print(f"Task Achievement: {evaluation['task_achievement']['band']}")
            print(f"Coherence & Cohesion: {evaluation['coherence_cohesion']['band']}")
            print(f"Lexical Resource: {evaluation['lexical_resource']['band']}")
            print(f"Grammatical Range & Accuracy: {evaluation['grammatical_range_accuracy']['band']}")
            
            # Generate learning guide
            print(f"\nGenerating personalized learning guide...")
            learning_guide = evaluator.generate_learning_guide(result)
            print(f"Learning guide generated ({len(learning_guide)} characters)")
            
            # Show preview
            print(f"\nLearning Guide Preview:")
            print("-" * 40)
            print(learning_guide[:300] + "..." if len(learning_guide) > 300 else learning_guide)
            print("-" * 40)
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("IELTS Writing AI Assessment System")
    print("Available features:")
    print("- Complete essay evaluation with band scores")
    print("- Detailed feedback on all IELTS criteria")
    print("- Specific improvement suggestions")
    print("- Personalized learning guides")
    print("- Word replacement suggestions")
    print("- Grammar improvement recommendations")
    print("\nUsage: python main.py")
    print()
    
    main()
