from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os

from database import init_db

# Uygulama başlarken Veritabanı tablolarını yoksa yarat
init_db()

app = FastAPI(title="ATS System API", description="AI powered CV sorting and matching API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")

# Serve the static files (css, js)
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

# Import API routes
from api import router as api_router
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    # Return the index.html on the root path
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    return FileResponse(index_path)

@app.get("/api/health")
def health_check():
    return {"status": "success", "message": "ATS System API is running successfully!"}
