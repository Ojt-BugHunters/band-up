"""Prompt builder for Gemini enhancement pipeline."""

import json
import re
from typing import Dict, Any, List, Optional
from .interfaces import IPromptBuilder
from .models import QuestionType, TestType
from .exceptions import PromptBuildError


class PromptBuilder(IPromptBuilder):
    """Builds optimized prompts for Gemini API."""
    
    AD_IMAGE_PATTERNS = ["ad.plus", "pagead", "googlesyndication", "doubleclick"]
    LEGITIMATE_IMAGE_PATTERNS = ["ieltstrainingonline.com/wp-content/uploads"]
    AD_CLASS_PATTERNS = ["ad", "advertisement", "ielts-manual-ads", "adsbygoogle", "ielts-adlabel"]
    
    def __init__(self):
        self._examples_cache: Dict[str, str] = {}
        self._schema_cache: Optional[str] = None
    
    def build_enhancement_prompt(self, test_data: Dict[str, Any], test_type: str) -> str:
        """Build a simplified prompt that only extracts question types from HTML content."""
        try:
            system_instructions = self._build_system_instructions(test_type)
            html_content = self._build_input_data_section(test_data, test_type)
            processing_rules = self._build_processing_rules(test_type)
            output_schema = self._build_schema_definition(test_type)
            examples = self._build_examples(test_type)
            
            # Simplified prompt structure
            prompt = f"""{system_instructions}

## HTML CONTENT TO ANALYZE

{html_content}

{processing_rules}

{output_schema}

{examples}

Now analyze the HTML content above and return the JSON with question type classifications for all 40 questions."""
            
            return prompt
        except Exception as e:
            raise PromptBuildError(f"Failed to build enhancement prompt: {e}")
    
    def build_schema_definition(self, test_type: str = "reading") -> str:
        """Build JSON schema definition based on test type."""
        return self._build_schema_definition(test_type)
    
    def _build_schema_definition(self, test_type: str) -> str:
        """Build JSON schema definition based on test type."""
        base_schema = """## OUTPUT FORMAT

Return ONLY a JSON object with question type classifications:

{
  "questionTypes": [
    {"Question_1": "MC"},
    {"Question_2": "SA"},
    ...
    {"Question_40": "SA"}
  ]
}

"""
        if test_type == "listening":
            type_list = """Valid type prefixes for LISTENING tests:
- "MC" = Multiple Choice (choose A, B, C, or D)
- "SA" = Short Answer/Form/Note/Sentence Completion (fill blanks with word limit)
- "TB" = Table/Form Completion (complete a table or form)
- "MT" = Matching (match items to categories, e.g., match speakers to opinions)
- "MP" = Map/Plan/Diagram Labeling (label locations on a map or diagram)
- "LS" = List Selection (choose TWO/THREE correct answers from a list)"""
        else:  # reading
            type_list = """Valid type prefixes for READING tests:
- "MC" = Multiple Choice (choose A, B, C, or D)
- "TF" = True/False/Not Given or Yes/No/Not Given
- "MH" = Matching Headings (match headings i, ii, iii... to paragraphs)
- "MI" = Matching Information (which paragraph A-G contains specific information)
- "MF" = Matching Features (match names/dates/categories to statements)
- "SA" = Short Answer/Sentence Completion (fill blanks with word limit)
- "SC" = Summary Completion (complete a summary paragraph)
- "DN" = Diagram/Note/Table/Flowchart Completion
- "LS" = List Selection (choose TWO/THREE items from a list)"""
        
        critical = """

CRITICAL: 
- Return EXACTLY 40 question classifications (Question_1 through Question_40)
- Use ONLY the two-letter prefixes listed above for this test type
- Ensure proper JSON formatting with all brackets and braces closed
- Do NOT include any HTML content in the response
- Do NOT include explanations, only the JSON object"""
        
        return base_schema + type_list + critical
    
    def build_examples(self, test_type: str) -> str:
        """Build classification examples."""
        return self._build_examples(test_type)
    
    def _build_examples(self, test_type: str) -> str:
        """Build classification examples based on test type."""
        if test_type == "listening":
            examples = """## CLASSIFICATION EXAMPLES (LISTENING)

"Choose the correct letter A, B, C or D" → MC
"Write NO MORE THAN TWO WORDS" or "Complete the notes/form" → SA
"Complete the table below" → TB
"Match each person with their opinion (A-E)" → MT
"Label the map/plan below" → MP
"Choose TWO letters A-E" or "Which TWO features" → LS

Key distinctions:
- SA: Fill individual blanks in sentences/notes with word limit
- TB: Complete cells in a table or form
- MT: Match speakers/items to categories (like A=agrees, B=disagrees)
- MP: Label locations on a map, plan, or diagram"""
        else:  # reading
            examples = """## CLASSIFICATION EXAMPLES (READING)

"Choose the correct letter A, B, C or D" → MC
"TRUE/FALSE/NOT GIVEN" or "YES/NO/NOT GIVEN" → TF
"Choose the correct heading" with List of Headings (i-x) → MH
"Which paragraph contains the following information?" → MI
"Match each statement with the correct person (A-E)" → MF
"Write NO MORE THAN TWO WORDS" or "Complete the sentences" → SA
"Complete the summary below" → SC
"Complete the diagram/flowchart/table/notes" → DN
"Choose TWO letters A-E" or "Which THREE of the following" → LS

Key distinctions:
- MH: Answer is roman numeral (i, ii, iii) matching heading to paragraph
- MI: Answer is letter (A, B, C) identifying which paragraph has info
- MF: Match people/categories to statements (like A=Smith, B=Jones)
- SA vs SC: SA is individual blanks, SC is completing a summary paragraph"""
        
        return examples

    def estimate_tokens(self, prompt: str) -> int:
        cleaned = re.sub(r'\s+', ' ', prompt)
        char_count = len(cleaned)
        estimated_tokens = int((char_count / 4) * 1.1)
        return estimated_tokens
    
    def _build_system_instructions(self, test_type: str) -> str:
        if test_type == "listening":
            return """You are an IELTS LISTENING question classifier. Analyze the HTML and classify all 40 questions using two-letter codes.

KEY POINTS:
- This is a LISTENING test with 4 sections (10 questions each)
- Questions in the same instruction block typically share the same type
- Common types: MC (multiple choice), SA (short answer), TB (table), MT (matching), MP (map/plan), LS (list selection)
- Return ONLY the JSON object - no markdown, no explanations"""
        else:  # reading
            return """You are an IELTS READING question classifier. Analyze the HTML and classify all 40 questions using two-letter codes.

KEY POINTS:
- This is a READING test with 3 passages
- Questions in the same instruction block typically share the same type
- Distinguish between MH (matching headings with roman numerals i-x) and MI (matching information with paragraph letters A-G)
- Return ONLY the JSON object - no markdown, no explanations"""
    
    def _build_input_data_section(self, test_data: Dict[str, Any], test_type: str) -> str:
        """Build compact input data section - only question HTML content for classification."""
        # Extract only the question HTML content - this is the minimal data needed
        # We don't need passages/sections content, just the questions themselves
        
        html_content = ""
        
        # Get questions directly - they contain all the instruction text needed for classification
        questions = test_data.get("questions", [])
        
        if questions:
            for i, question in enumerate(questions, 1):
                # Add a simple marker for each question block
                html_content += f"<!-- Question Block {i} -->\n"
                html_content += question.get("html_content", "")
                html_content += "\n\n"
        else:
            # Fallback: if no questions field, try sections/passages
            # (though this shouldn't happen with properly parsed tests)
            if test_type == "listening":
                sections = test_data.get("sections", [])
                for section in sections:
                    html_content += section.get("html_content", section.get("content", ""))
                    html_content += "\n\n"
            elif test_type == "reading":
                passages = test_data.get("passages", [])
                for passage in passages:
                    html_content += passage.get("html_content", passage.get("content", ""))
                    html_content += "\n\n"
        
        # Return just the HTML content (no JSON wrapping to save tokens)
        return html_content.strip()
    
    def _build_processing_rules(self, test_type: str) -> str:
        if test_type == "listening":
            return """## CLASSIFICATION INSTRUCTIONS (LISTENING TEST)

Analyze each question and classify it using these LISTENING-specific codes:

1. **MC** (Multiple Choice): Questions with options A, B, C, D
   - Look for: "Choose the correct letter", "Select A, B, C, or D"
   
2. **SA** (Short Answer/Form/Note Completion): Fill blanks with word limit
   - Look for: "NO MORE THAN TWO/THREE WORDS", "Complete the notes/sentences"
   
3. **TB** (Table/Form Completion): Complete cells in a table or form
   - Look for: "Complete the table/form below"
   
4. **MT** (Matching): Match items to categories or speakers to opinions
   - Look for: "Match each person/speaker with", "Which person said"
   - Often has a list (A-E) to match with numbered items
   
5. **MP** (Map/Plan/Diagram Labeling): Label locations on visual elements
   - Look for: "Label the map/plan/diagram", "Write the correct letter"
   
6. **LS** (List Selection): Choose multiple correct answers
   - Look for: "Choose TWO/THREE letters", "Which TWO features"

IMPORTANT:
- Classify ALL 40 questions (Question_1 through Question_40)
- Use ONLY the codes: MC, SA, TB, MT, MP, LS
- Questions in the same section typically share the same type"""
        else:  # reading
            return """## CLASSIFICATION INSTRUCTIONS (READING TEST)

Analyze each question and classify it using these READING-specific codes:

1. **MC** (Multiple Choice): Questions with options A, B, C, D
   - Look for: "Choose the correct letter", "Select A, B, C, or D"
   
2. **TF** (True/False/Not Given): Statement verification
   - Look for: "TRUE/FALSE/NOT GIVEN", "YES/NO/NOT GIVEN"
   
3. **MH** (Matching Headings): Match headings to paragraphs
   - Look for: "Choose the correct heading", "List of Headings"
   - Answer format: Roman numerals (i, ii, iii...)
   
4. **MI** (Matching Information): Find which paragraph contains info
   - Look for: "Which paragraph contains", "In which section"
   - Answer format: Letters (A, B, C, D, E, F, G)
   
5. **MF** (Matching Features): Match names/categories to statements
   - Look for: "Match each statement with the correct person"
   
6. **SA** (Short Answer/Sentence Completion): Fill blanks with words
   - Look for: "NO MORE THAN TWO/THREE WORDS", "Complete the sentences"
   
7. **SC** (Summary Completion): Complete a summary paragraph
   - Look for: "Complete the summary below"
   
8. **DN** (Diagram/Note/Table/Flowchart): Complete visual elements
   - Look for: "Complete the diagram/notes/table/flowchart"
   
9. **LS** (List Selection): Choose multiple correct answers
   - Look for: "Choose TWO/THREE letters", "Which TWO of the following"

IMPORTANT:
- Classify ALL 40 questions (Question_1 through Question_40)
- Use ONLY the codes: MC, TF, MH, MI, MF, SA, SC, DN, LS
- MH uses roman numerals (i-x), MI uses paragraph letters (A-G)"""
    

    
    def get_chunking_strategy(self, test_data: Dict[str, Any], max_tokens: int = 30000) -> List[Dict[str, Any]]:
        test_prompt = self.build_enhancement_prompt(test_data, test_data.get("test_metadata", {}).get("test_type", "reading"))
        estimated_tokens = self.estimate_tokens(test_prompt)
        if estimated_tokens <= max_tokens:
            return [test_data]
        chunks = []
        test_type = test_data.get("test_metadata", {}).get("test_type", "reading")
        if test_type == "listening":
            sections = test_data.get("sections", [])
            chunk_size = max(1, len(sections) // 2)
            for i in range(0, len(sections), chunk_size):
                chunk_data = test_data.copy()
                chunk_data["sections"] = sections[i:i + chunk_size]
                chunks.append(chunk_data)
        else:
            passages = test_data.get("passages", [])
            chunk_size = max(1, len(passages) // 2)
            for i in range(0, len(passages), chunk_size):
                chunk_data = test_data.copy()
                chunk_data["passages"] = passages[i:i + chunk_size]
                chunks.append(chunk_data)
        return chunks if chunks else [test_data]
    
    def optimize_prompt_size(self, prompt: str) -> str:
        optimized = re.sub(r'\n{3,}', '\n\n', prompt)
        optimized = '\n'.join(line.rstrip() for line in optimized.split('\n'))
        return optimized
