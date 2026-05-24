from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.recommendation_service import export_service as recommendation_service
from app.services.resume_service import export_service as resume_service
from app.embeddings.similarity import compute_similarity

api_router = APIRouter()

class MatchRequest(BaseModel):
    candidate: Dict[str, Any]
    jobs: List[Dict[str, Any]]

class SemanticSearchRequest(BaseModel):
    query: str
    jobs: List[Dict[str, Any]]

class ResumeParseRequest(BaseModel):
    text: str

@api_router.get("/status")
async def get_status():
    return {
        "status": "online",
        "modules": {
            "embeddings": "initialized",
            "pipelines": "ready",
            "vector": "ready",
            "recommendation": "ready",
            "parser": "ready"
        }
    }

@api_router.post("/recommendations/match")
async def match_recommendations(payload: MatchRequest):
    results = recommendation_service.match_candidate_to_jobs(payload.candidate, payload.jobs)
    return {"results": results}

@api_router.post("/search/semantic")
async def semantic_search(payload: SemanticSearchRequest):
    job_texts = []
    for job in payload.jobs:
        title = job.get("title", "")
        desc = job.get("description", "")
        skills = " ".join(job.get("skills", []))
        job_texts.append(f"{title} {desc} {skills}")

    scores = compute_similarity(payload.query, job_texts)
    
    results = []
    for index, job in enumerate(payload.jobs):
        score = scores[index] if index < len(scores) else 0.0
        results.append({
            "jobId": job.get("id"),
            "semanticScore": round(score * 100)
        })

    results.sort(key=lambda x: x["semanticScore"], reverse=True)
    return {"results": results}

@api_router.post("/resume/parse")
async def parse_resume(payload: ResumeParseRequest):
    parsed = resume_service.parse_resume(payload.text)
    return {"parsed": parsed}
