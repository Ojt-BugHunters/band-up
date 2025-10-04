"""
IELTS Writing AI Assessment System
Clean API-focused version for cloud deployment (AWS Lambda, etc.)
"""

import json
import logging
import os
from typing import Dict, Any, Optional
from datetime import datetime

from writing_evaluator import IELTSWritingEvaluator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class IELTSWritingAssessment:
    """Main IELTS Writing Assessment System for API usage"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the IELTS Writing Assessment System
        
        Args:
            api_key: Google AI API key for Gemini (optional, will try environment variable)
        """
        self.writing_evaluator = IELTSWritingEvaluator(api_key=api_key)
        logger.info("IELTS Writing Assessment System initialized")
    
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
        logger.info(f"Starting IELTS {task_type} Writing Evaluation")
        
        # Validate input
        if not essay_text or len(essay_text.strip()) < 50:
            return {
                "status": "error",
                "error": "Essay text is too short. Please provide at least 50 words for evaluation.",
                "essay_text": essay_text,
                "task_type": task_type,
                "timestamp": datetime.now().isoformat()
            }
        
        try:
            # Run the complete evaluation pipeline
            result = self.writing_evaluator.evaluate_essay(essay_text, task_type, task_description)
            
            # Add system information and status
            result["status"] = "success"
            result["system_info"] = {
                "evaluator": "IELTS Writing AI Assessment System",
                "model": "Gemini 2.5 Flash API",
                "version": "1.0.0",
                "api_focused": True
            }
            result["timestamp"] = datetime.now().isoformat()
            
            logger.info("Writing evaluation completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error in writing evaluation: {e}")
            return {
                "status": "error",
                "error": f"Evaluation failed: {str(e)}",
                "essay_text": essay_text,
                "task_type": task_type,
                "timestamp": datetime.now().isoformat()
            }
    
    def generate_learning_guide(self, evaluation_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate personalized learning guide based on evaluation results
        
        Args:
            evaluation_result: Results from evaluate_writing
            
        Returns:
            Dictionary containing learning guide and metadata
        """
        if evaluation_result.get("status") == "error":
            return {
                "status": "error",
                "error": f"Cannot generate learning guide due to evaluation error: {evaluation_result.get('error', 'Unknown error')}",
                "timestamp": datetime.now().isoformat()
            }
        
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
            
            return {
                "status": "success",
                "learning_guide": learning_guide,
                "guide_length": len(learning_guide),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating learning guide: {e}")
            return {
                "status": "error",
                "error": f"Error generating learning guide: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model"""
        return {
            "status": "success",
            "writing_model": self.writing_evaluator.get_model_info(),
            "system": "IELTS Writing AI Assessment System",
            "api_focused": True,
            "timestamp": datetime.now().isoformat()
        }

# API Functions for direct usage
def evaluate_writing(essay_text: str, task_type: str = "Task 2", task_description: str = None, api_key: str = None) -> Dict[str, Any]:
    """
    Evaluate IELTS writing essay - API function
    
    Args:
        essay_text: The essay text to evaluate
        task_type: Task 1 or Task 2
        task_description: The specific IELTS writing task/question (optional)
        api_key: Google AI API key for Gemini (optional)
        
    Returns:
        Complete evaluation results
    """
    evaluator = IELTSWritingAssessment(api_key=api_key)
    return evaluator.evaluate_writing(essay_text, task_type, task_description)

def generate_learning_guide(evaluation_result: Dict[str, Any], api_key: str = None) -> Dict[str, Any]:
    """
    Generate learning guide from evaluation results - API function
    
    Args:
        evaluation_result: Results from evaluate_writing
        api_key: Google AI API key for Gemini (optional)
        
    Returns:
        Learning guide and metadata
    """
    evaluator = IELTSWritingAssessment(api_key=api_key)
    return evaluator.generate_learning_guide(evaluation_result)

def get_model_info(api_key: str = None) -> Dict[str, Any]:
    """
    Get model information - API function
    
    Args:
        api_key: Google AI API key for Gemini (optional)
        
    Returns:
        Model information
    """
    evaluator = IELTSWritingAssessment(api_key=api_key)
    return evaluator.get_model_info()

def main():
    """Example usage with direct variables"""
    
    # ===== CONFIGURATION =====
    # Set your essay text here
    sample_essay = """
    In certain countries, employers are legally prohibited from discriminating against job applicants on the basis of age. In my view, although the policy aims to foster fairness and equal opportunity, the potential drawbacks in real-world application may outweigh its intended benefits.

    It is true that banning age-based discrimination can promote fairness and equal opportunity in the labour market. One key advantage is that it encourages a diverse and inclusive workforce. Applicants of different ages—whether younger or older—can offer unique skills, experiences, and perspectives that enhance workplace collaboration. As a result, fair hiring practices help build stronger team dynamics and foster innovation. Another benefit is that this policy helps reduce social inequality, particularly for older individuals. Many experienced professionals, for instance, are unfairly rejected due to age, even when they possess valuable expertise. By protecting them from discrimination, anti-age laws allow for extended careers and improved financial security later in life.

    However, enforcing such regulations may come with practical limitations which undermine their intended benefits.. One notable  issue is that employers might still find indirect ways to discriminate. Bias can persist during interviews, or companies may use coded language in job advertisements to subtly exclude certain age groups. Consequently, legal protection alone may not be sufficient to eliminate age-related prejudice in hiring practices. Another concern is that certain jobs have physical requirements that may not align with all applicants' capabilities. For example, roles involving manual labour or high physical endurance may be less suitable for older candidates. In such cases, mandatory inclusion could result in mismatches between workers and job demands, potentially affecting performance and safety.

    In conclusion, while making age-based discrimination illegal in hiring is a positive step toward fairness and equality, its effectiveness is limited by enforcement challenges and the persistence of implicit bias.
    """
    
    # Set your task description here
    task_description = "In some countries, it is illegal for companies to reject job applicants for their age. Is this a positive or negative development?"
    
    # Set task type
    task_type = "Task 2"
    
    print("IELTS Writing AI Assessment - Essay Processing")
    print("=" * 50)
    print(f"Task Type: {task_type}")
    print(f"Task Description: {task_description}")
    print(f"Essay Length: {len(sample_essay.split())} words")
    print("=" * 50)
    
    # Create output directory
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)
    
    print("\n📝 Processing essay...")
    print("This may take 10-30 seconds depending on essay length...")
    
    try:
        # Evaluate the essay
        result = evaluate_writing(
            essay_text=sample_essay,
            task_type=task_type,
            task_description=task_description
        )
        
        # Save results to files
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        essay_filename = f"essay_{timestamp}"
        output_dir = os.path.join(output_dir, timestamp)
        os.makedirs(output_dir, exist_ok=True)
        
        # Save complete results
        complete_results_file = os.path.join(output_dir, f"results_{essay_filename}.json")
        with open(complete_results_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print(f"\n💾 Complete results saved to: {complete_results_file}")
        
        # Print results
        print("\n📊 RESULTS:")
        print("=" * 50)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        if result["status"] == "success":
            print(f"\n✅ Writing evaluation completed successfully!")
            print(f"   🎯 Overall Band Score: {result['evaluation']['overall_band']}")
            print(f"   📝 Task Achievement: {result['evaluation']['task_achievement']['band']}")
            print(f"   🔗 Coherence & Cohesion: {result['evaluation']['coherence_cohesion']['band']}")
            print(f"   📚 Lexical Resource: {result['evaluation']['lexical_resource']['band']}")
            print(f"   📖 Grammar: {result['evaluation']['grammatical_range_accuracy']['band']}")
            
            
            # Generate learning guide
            print(f"\n📚 Generating learning guide...")
            try:
                learning_guide = generate_learning_guide(result)
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
                
                
                # Also save as markdown file for easy reading
                learning_guide_md_file = os.path.join(output_dir, f"learning_guide_{essay_filename}.md")
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
                learning_guide_file = os.path.join(output_dir, f"learning_guide_{essay_filename}_failed.json")
                with open(learning_guide_file, 'w', encoding='utf-8') as f:
                    json.dump(learning_guide, f, indent=2, ensure_ascii=False)
                print(f"💾 Failed learning guide attempt saved to: {learning_guide_file}")
        else:
            print(f"\n❌ Writing evaluation failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        print("Please check your essay and try again.")
        
        # Save error result
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_dir = os.path.join(output_dir, timestamp)
        os.makedirs(output_dir, exist_ok=True)
        error_file = os.path.join(output_dir, f"error_{timestamp}.json")
        
        error_result = {
            "status": "error",
            "error": str(e),
            "essay_text": sample_essay,
            "task_type": task_type,
            "task_description": task_description,
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