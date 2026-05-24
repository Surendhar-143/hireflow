from typing import List, Dict, Any
from app.embeddings.similarity import compute_similarity

class RankingService:
    def rank_search_results(self, query: str, jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Ranks a list of jobs based on semantic cosine similarity to a search query.
        """
        if not query or not jobs:
            return [{"jobId": j.get("id"), "semanticScore": 0} for j in jobs]

        job_texts = []
        for job in jobs:
            title = job.get("title", "")
            desc = job.get("description", "")
            skills = " ".join(job.get("skills", []))
            job_texts.append(f"{title} {desc} {skills}")

        try:
            scores = compute_similarity(query, job_texts)
        except Exception:
            scores = [0.0] * len(jobs)

        ranked = []
        for index, job in enumerate(jobs):
            score = scores[index] if index < len(scores) else 0.0
            ranked.append({
                "jobId": job.get("id"),
                "semanticScore": round(score * 100)
            })

        # Sort by score descending
        ranked.sort(key=lambda x: x["semanticScore"], reverse=True)
        return ranked

    def rank_related_jobs(self, target_job: Dict[str, Any], other_jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Ranks a list of jobs based on semantic similarity to a target job (for discovery recommendations).
        """
        if not target_job or not other_jobs:
            return []

        target_text = f"{target_job.get('title', '')} {target_job.get('description', '')} {' '.join(target_job.get('skills', []))}"
        other_texts = []
        for job in other_jobs:
            title = job.get("title", "")
            desc = job.get("description", "")
            skills = " ".join(job.get("skills", []))
            other_texts.append(f"{title} {desc} {skills}")

        try:
            scores = compute_similarity(target_text, other_texts)
        except Exception:
            scores = [0.0] * len(other_jobs)

        ranked = []
        for index, job in enumerate(other_jobs):
            score = scores[index] if index < len(scores) else 0.0
            ranked.append({
                "jobId": job.get("id"),
                "similarityScore": round(score * 100)
            })

        # Sort by similarityScore descending
        ranked.sort(key=lambda x: x["similarityScore"], reverse=True)
        return ranked

export_service = RankingService()
