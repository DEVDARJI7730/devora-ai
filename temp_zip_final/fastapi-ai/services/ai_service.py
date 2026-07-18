import os
import asyncio
import json
from typing import AsyncGenerator
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

async def stream_gemini_completions(prompt: str, history: list = []) -> AsyncGenerator[str, None]:
    """
    Streams completions from Gemini Free API. If the API key is not present,
    streams a simulated persona reply to keep the UX functional.
    """
    if not GEMINI_API_KEY:
        # Simulated streaming response
        simulated_text = (
            "Hello! I am Devora AI. I'm currently running in simulated mode because no Gemini API key "
            "is loaded in the FastAPI `.env` configuration. \n\n"
            "You can type commands, ask me to build items, or write code. "
            "Once you add a real `GEMINI_API_KEY` in the fastapi environment, I'll connect to the live model. "
            "Let's write some code, explore tools, or design structures!"
        )
        
        words = simulated_text.split(" ")
        for word in words:
            yield f"data: {json.dumps({'choices': [{'delta': {'content': word + ' '}}]})}\n\n"
            await asyncio.sleep(0.06)
        yield "data: [DONE]\n\n"
        return
    # Configure and run Gemini via official Google AI SDK (Streams instantly!)
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-3.5-flash")

        # Format history for the SDK
        contents = []
        for msg in history:
            role = "user" if msg.get("sender") == "user" else "model"
            contents.append({
                "role": role,
                "parts": [msg.get("text", "")]
            })

        # Append current prompt with instructions
        contents.append({
            "role": "user",
            "parts": [f"System Prompt: You are Devora AI, a friendly, modern AI assistant. Answer the user clearly. Markdown and LaTeX are fully supported.\n\nUser Question: {prompt}"]
        })

        response = await model.generate_content_async(contents, stream=True)
        async for chunk in response:
            if chunk.text:
                yield f"data: {json.dumps({'choices': [{'delta': {'content': chunk.text}}]})}\n\n"
    except Exception as e:
        print("Gemini SDK error:", e)
        yield f"data: {json.dumps({'error': f'Gemini SDK error: {str(e)}'})}\n\n"

    yield "data: [DONE]\n\n"
