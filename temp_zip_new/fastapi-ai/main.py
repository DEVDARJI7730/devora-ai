import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response
from pydantic import BaseModel
from typing import List, Optional
import json

# Import services
from services.ai_service import stream_gemini_completions
from services.image_service import generate_stable_diffusion_image
from services.voice_service import transcribe_audio_to_text, synthesize_text_to_speech
from services.file_service import extract_text_from_file, summarize_file_content
from services.tools_service import execute_ai_tool

from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Devora AI Service API", version="1.0.0")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------
# PYDANTIC MODEL SCHEMAS
# ----------------------------------------------------
class ChatMessage(BaseModel):
    sender: str
    text: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class ImageRequest(BaseModel):
    prompt: str
    aspect_ratio: Optional[str] = "1:1"
    style: Optional[str] = "Realistic"
    negative_prompt: Optional[str] = ""

class VoiceTTSRequest(BaseModel):
    text: str
    voice: Optional[str] = "en"
    speed: Optional[float] = 1.0

class ToolRequest(BaseModel):
    tool_name: str
    user_input: str
    extra_context: Optional[str] = ""

# ----------------------------------------------------
# ROUTE ENDPOINTS
# ----------------------------------------------------

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "fastapi-ai"}

@app.post("/api/ai/chat")
async def chat_endpoint(payload: ChatRequest):
    """
    Exposes a streaming Server-Sent Events (SSE) endpoint for live AI responses.
    """
    history_list = [{"sender": msg.sender, "text": msg.text} for msg in payload.history]
    
    return StreamingResponse(
        stream_gemini_completions(payload.message, history_list),
        media_type="text/event-stream"
    )

@app.post("/api/ai/image")
async def image_endpoint(payload: ImageRequest):
    """
    Generates images from prompts using presets and aspect ratios, returning a Base64 URI.
    """
    try:
        image_uri = await generate_stable_diffusion_image(
            prompt=payload.prompt,
            aspect_ratio=payload.aspect_ratio,
            style=payload.style,
            negative_prompt=payload.negative_prompt
        )
        return {"success": True, "image": image_uri}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/voice/tts")
async def voice_tts_endpoint(payload: VoiceTTSRequest):
    """
    Text-to-Speech synthesis. Returns live MP3 audio bytes.
    """
    try:
        audio_bytes = await synthesize_text_to_speech(
            text=payload.text,
            voice=payload.voice,
            speed=payload.speed
        )
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/voice/stt")
async def voice_stt_endpoint(file: UploadFile = File(...)):
    """
    Transcribes audio files into text (Whisper/Speech-To-Text wrapper).
    """
    try:
        audio_bytes = await file.read()
        transcription = await transcribe_audio_to_text(audio_bytes)
        return {"success": True, "text": transcription}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/file/summarize")
async def file_summarize_endpoint(file: UploadFile = File(...)):
    """
    Parses and summarizes PDF/CSV/Word files, returning structured analysis text.
    """
    try:
        file_bytes = await file.read()
        extracted_text = extract_text_from_file(file_bytes, file.filename)
        
        if not extracted_text.strip() or "Unsupported file" in extracted_text:
            return {"success": True, "summary": f"Could not parse document '{file.filename}'. Format not recognized or text empty."}
            
        summary = await summarize_file_content(extracted_text, file.filename)
        return {"success": True, "summary": summary, "extracted_text": extracted_text[:2000]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/tools")
async def tools_endpoint(payload: ToolRequest):
    """
    Orchestrates specialized generator templates (grammar corrections, email drafts, resume styling).
    """
    try:
        result = await execute_ai_tool(
            tool_name=payload.tool_name,
            user_input=payload.user_input,
            extra_context=payload.extra_context
        )
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
