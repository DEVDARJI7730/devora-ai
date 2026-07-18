import os
import urllib.parse
import random
import httpx
import base64
from dotenv import load_dotenv

load_dotenv()
HF_API_KEY = os.getenv("HF_API_KEY", "")

async def generate_stable_diffusion_image(
    prompt: str,
    aspect_ratio: str = "1:1",
    style: str = "Realistic",
    negative_prompt: str = ""
) -> str:
    """
    Generates an image. If a Hugging Face API key is present, uses FLUX.1-schnell 
    for high accuracy. Otherwise, falls back to Pollinations AI (Stable Diffusion) 
    for zero-config free image rendering.
    """
    # 1. Map aspect ratios to dimensions
    dimensions = {
        "1:1": (1024, 1024),
        "16:9": (1024, 576),
        "9:16": (576, 1024),
        "4:3": (1024, 768),
        "3:4": (768, 1024)
    }
    
    width, height = dimensions.get(aspect_ratio, (1024, 1024))
    
    # 2. Refine prompt with styling keywords
    style_keywords = {
        "Realistic": "photorealistic, hyperrealistic, 8k resolution, highly detailed, real life details, detailed textures",
        "Anime": "anime key visual, japanese studio style, hand-drawn illustration, vibrant colors, clean vector lines",
        "3D": "3D render, Pixar style, Blender engine, octane render, soft clay model style, detailed shadows",
        "Cartoon": "cartoonish illustration, cute line art, vibrant background, vector graphic, simple strokes",
        "Cyberpunk": "cyberpunk style, neon lights, futuristic cityscape, rainy night, high-tech glowing elements",
        "Watercolor": "watercolor painting, soft canvas texture, artistic splatters, elegant drawing, light paint washes"
    }
    
    refined_prompt = prompt
    style_suffix = style_keywords.get(style, "")
    if style_suffix:
        refined_prompt += f", {style_suffix}"
        
    if negative_prompt:
        refined_prompt += f", avoid: {negative_prompt}"

    # 3. If Hugging Face API Key is present, try FLUX.1
    if HF_API_KEY:
        hf_url = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"
        headers = {
            "Authorization": f"Bearer {HF_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "inputs": refined_prompt,
            "parameters": {
                "width": width,
                "height": height
            }
        }
        
        async with httpx.AsyncClient() as client:
            try:
                # Query Hugging Face
                response = await client.post(hf_url, headers=headers, json=payload, timeout=40.0)
                if response.status_code == 200:
                    base64_data = base64.b64encode(response.content).decode("utf-8")
                    return f"data:image/png;base64,{base64_data}"
                else:
                    print(f"HuggingFace API returned error {response.status_code}: {response.text}. Falling back to Pollinations.")
            except Exception as e:
                print("HuggingFace connection failed, falling back to Pollinations:", e)

    # 4. Fallback: Pollinations AI (Stable Diffusion)
    encoded_prompt = urllib.parse.quote(refined_prompt)
    seed = random.randint(1000, 999999)
    pollinations_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&seed={seed}&nologo=true"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(pollinations_url, timeout=30.0)
            if response.status_code == 200:
                base64_data = base64.b64encode(response.content).decode("utf-8")
                return f"data:image/png;base64,{base64_data}"
            else:
                raise Exception(f"Failed to fetch image from Pollinations (Status {response.status_code})")
        except Exception as e:
            print("Pollinations image generation error:", e)
            raise e
