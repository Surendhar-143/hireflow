from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.api.router import api_router

app = FastAPI(
    title="HireFlow AI Services",
    description="FastAPI microservice handling embeddings, semantic search, and recommendations.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    service: str

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="ok", service="HireFlow FastAPI AI")

app.include_router(api_router, prefix="/api/v1")
