import json
from services.ai_service import stream_gemini_completions

# Prompts for specialized tools
TOOL_PROMPTS = {
    "grammar_checker": "Act as an expert English grammar checker and proofreader. Correct all spelling, grammar, and syntax errors in the following text. Highlight the corrections and provide a briefly explained list of changes:\n\n",
    
    "translator": "Act as a professional language translator. Translate the following text into the requested target language. Ensure natural phrasing and local idioms are respected. Text:\n\n",
    
    "email_writer": "Act as a professional copywriter. Draft a clean, clear, and engaging email based on the following key points, target audience, and context:\n\n",
    
    "resume_builder": "Act as a professional resume writer and career consultant. Format, clean, and enrich the following draft professional experience to sound highly professional, action-oriented, and impactful for recruiters:\n\n",
    
    "cover_letter": "Act as an experienced resume editor. Write a persuasive, elegant cover letter for a job application based on the following candidate details and job role description:\n\n",
    
    "blog_generator": "Act as an SEO content writer. Generate an engaging, high-quality blog post layout or complete article based on the following title, target keywords, and main outline ideas:\n\n",
    
    "seo_generator": "Act as an SEO optimization expert. Generate a high-performing title tag, meta description, and 10 highly relevant target search keywords for a website page described as follows:\n\n",
    
    "sql_generator": "Act as an expert SQL Database Administrator. Convert the following natural language request into clean, optimized, and secure SQL queries. Provide a brief explanation of how the query works. Request:\n\n",
    
    "regex_generator": "Act as a software engineer. Generate a clean regular expression (Regex) that matches the pattern requested. Provide examples of strings that match and strings that fail the pattern. Request:\n\n",
    
    "text_humanizer": "Act as an expert copywriter. Rewrite the following AI-generated text to sound completely natural, organic, and human-like. Keep the tone warm, engaging, and clear, avoiding robotic repetition or overly complex structure:\n\n",
    
    "math_solver": "Act as a patient mathematics tutor. Solve the following math equation or word problem step-by-step. Explain the logic and formulas used for each step clearly. Problem:\n\n",
    
    "prompt_generator": "Act as a prompt engineering consultant. Expand and optimize the following simple input prompt into a highly detailed, descriptive, and context-rich prompt for midjourney, Stable Diffusion, or ChatGPT. Input prompt:\n\n"
}

async def execute_ai_tool(tool_name: str, user_input: str, extra_context: str = "") -> str:
    """
    Executes a specialized AI assistant tool.
    Combines the template prompt with the user input and returns the result from Gemini.
    """
    base_prompt = TOOL_PROMPTS.get(tool_name, "Answer the following request clearly:\n\n")
    
    full_prompt = f"{base_prompt}{user_input}"
    if extra_context:
        full_prompt += f"\n\nContext / Instructions: {extra_context}"
        
    result_text = ""
    # Collect streamed response
    async for chunk in stream_gemini_completions(full_prompt):
        if "data: " in chunk and not "[DONE]" in chunk:
            try:
                json_str = chunk.replace("data: ", "").strip()
                payload = json.loads(json_str)
                delta = payload.get("choices", [{}])[0].get("delta", {}).get("content", "")
                result_text += delta
            except:
                pass
                
    if not result_text:
        # Fallback simulated response
        result_text = (
            f"### Devora {tool_name.replace('_', ' ').title()} Output\n"
            f"Here is a mock response for your request: **\"{user_input[:50]}...\"**\n\n"
            f"- **Result**: To generate a live AI output for this tool, please enter a valid `GEMINI_API_KEY` in the Control Center settings.\n"
            f"- **Formatting**: Results are returned in clean Markdown format."
        )
    return result_text
