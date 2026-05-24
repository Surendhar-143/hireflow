from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio
from app.services.recommendation_service import export_service as recommendation_service
from app.services.resume_service import export_service as resume_service
from app.services.ranking_service import export_service as ranking_service

api_router = APIRouter()

class MatchRequest(BaseModel):
    candidate: Dict[str, Any]
    jobs: List[Dict[str, Any]]

class RelatedRequest(BaseModel):
    targetJob: Dict[str, Any]
    otherJobs: List[Dict[str, Any]]

class SemanticSearchRequest(BaseModel):
    query: str
    jobs: List[Dict[str, Any]]

class ResumeParseRequest(BaseModel):
    text: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

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

@api_router.post("/recommendations/related")
async def related_recommendations(payload: RelatedRequest):
    results = ranking_service.rank_related_jobs(payload.targetJob, payload.otherJobs)
    return {"results": results}

@api_router.post("/search/semantic")
async def semantic_search(payload: SemanticSearchRequest):
    results = ranking_service.rank_search_results(payload.query, payload.jobs)
    return {"results": results}

@api_router.post("/resume/parse")
async def parse_resume(payload: ResumeParseRequest):
    parsed = resume_service.parse_resume(payload.text)
    return {"parsed": parsed}

@api_router.post("/chat/assistant")
async def chat_assistant(payload: ChatRequest):
    async def token_generator():
        message = payload.message.lower()
        
        # Dynamic, context-specific simulated responses
        if "leadership" in message or "lead" in message:
            response_text = (
                "Based on the work history provided, this candidate has demonstrated strong technical leadership. "
                "At Stripe, they spearheaded a team of 4 senior engineers to rebuild the billing ingestion platform, "
                "successfully reducing database N+1 latency issues by 40% and cutting cloud infrastructure costs. "
                "Their style emphasizes collaborative architecture design and high standard engineering execution."
            )
        elif "skills" in message or "fit" in message or "match" in message:
            response_text = (
                "This candidate is an exceptional fit for the Senior React Developer opening. "
                "They possess over 5 years of verified frontend expertise, specifically matching your requests "
                "for Tailwind CSS, TypeScript, and state management (Zustand). They lack direct experience in AWS "
                "deployments mentioned in requirements, but their Staff Fullstack background suggests fast onboarding capability."
            )
        elif "compare" in message or "applicants" in message or "shortlist" in message:
            response_text = (
                "Here is a comparative summary of the shortlisted candidates:\n\n"
                "1. **Alex Rivera** (94% Match) - Unmatched frontend React, Zustand, and TypeScript skills.\n"
                "2. **Jordan Vance** (85% Match) - Balanced full-stack engineer. Strong Node.js/PostgreSQL.\n"
                "3. **Taylor Chen** (72% Match) - Strong backend systems architect but limited modern UI experience."
            )
        else:
            response_text = (
                "Hello! I am your HireFlow AI Assistant. I can help summarize resume highlights, analyze candidate skill "
                "gaps, verify requirements fit, or compare applicants. What would you like to explore today?"
            )
            
        words = response_text.split(" ")
        for word in words:
            yield f"data: {word} \n\n"
            await asyncio.sleep(0.03) # smooth pacing
        yield "data: [DONE]\n\n"

    return StreamingResponse(token_generator(), media_type="text/event-stream")

