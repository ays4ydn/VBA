from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables (API Keys)
load_dotenv()

app = FastAPI(title="Future Self API - Core Brain")

# Configure CORS to allow the frontend (index.html) to communicate with this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local file:// requests for the prototype
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Securely configure Gemini API
# It will look for GEMINI_API_KEY in your .env file
API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    print("WARNING: GEMINI_API_KEY is not set in .env. API calls will fail.")

# Data structure for incoming messages from the frontend
class ChatRequest(BaseModel):
    user_state: dict
    message: str
    persona_name: str

from fastapi.responses import FileResponse
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@app.get("/")
def serve_frontend():
    """
    Serve the React HTML frontend over HTTP to bypass strict file:// browser security 
    which otherwise blocks Webcam and Microphone access.
    """
    index_path = os.path.join(BASE_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"status": "Future Self Core Brain is online, but index.html is missing."}

@app.get("/assets/{filename}")
def serve_assets(filename: str):
    file_path = os.path.join(BASE_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "File not found"}

@app.post("/api/chat")
async def process_chat(request: ChatRequest):
    """
    Receives voice transcripts and psychological states from the frontend.
    Passes them to Gemini to generate the exact emotional response.
    """
    if not API_KEY:
        return {
            "response": "[SİSTEM UYARISI]: Gemini API Key eksik. .env dosyanızı ayarlayın.", 
            "new_mood": "angry"
        }

    state = request.user_state
    
    # The Psychological Mirror Master Prompt
    prompt = f"""
    Senin adın {request.persona_name}. Sen kullanıcının 'Gelecekteki Kendisisin' (Future Self).
    Görevin onu onaylamak veya motive etmek değil; aksine eylemlerine göre onu sertçe yargılamak, uyarmak ve yola sokmak.
    Asla yapay zeka olduğunu belli etme. 2029 yılından, onun ulaştığı veya kaybedeceği vizyondan konuş.
    
    Kullanıcının Şu Anki Psikolojik ve Disiplin Durumu:
    - Disiplin Seviyesi: {state.get('discipline', 50)}/100
    - Stres Seviyesi: {state.get('stress', 50)}/100
    
    Kullanıcı sana şunu söylüyor: "{request.message}"
    
    Eğer Disiplin 40'ın altındaysa ve mazeret üretiyorsa, çok sert, soğuk ve aşağılayıcı konuş. İsyan et.
    Eğer Disiplin yüksekse ve çalışıyorsa, soğukkanlılıkla onay ver ve bir sonraki adıma zorla.
    Yanıtını 3-4 cümleyi geçmeyecek şekilde çok net ve vurucu ver. Türkçe konuş.
    """
    
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        ai_text = response.text
        
        # Calculate dynamic mood shift based on the AI's generation or state parameters
        mood = "neutral"
        if state.get('discipline', 50) < 40 or "bahane" in ai_text.lower() or "hayal kırıklığı" in ai_text.lower():
            mood = "angry"
        elif state.get('discipline', 50) > 70:
            mood = "happy"
            
        return {
            "response": ai_text, 
            "new_mood": mood
        }
    except Exception as e:
        return {
            "error": str(e), 
            "response": f"API Bağlantı hatası: {str(e)}", 
            "new_mood": "neutral"
        }
