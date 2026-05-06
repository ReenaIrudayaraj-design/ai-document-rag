from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

app = FastAPI(redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes.upload_routes import router as upload_router
from routes.chat_routes import router as chat_router

Path("uploads").mkdir(exist_ok=True)

app.include_router(upload_router, prefix="/upload")
app.include_router(chat_router, prefix="/chat")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=5000, reload=False)