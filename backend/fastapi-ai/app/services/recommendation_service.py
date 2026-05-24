from typing import List, Dict, Any
from app.embeddings.similarity import compute_similarity

class RecommendationService:
    def match_candidate_to_jobs(self, candidate: Dict[str, Any], jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        candidate_skills = set(w.lower() for w in candidate.get("skills", []))
        candidate_bio = candidate.get("bio", "") or ""
        candidate_headline = candidate.get("headline", "") or ""
        candidate_exp_level = candidate.get("experienceLevel", "mid").lower()

        candidate_profile_text = f"{candidate_headline} {candidate_bio}"
        job_descriptions = [j.get("description", "") for j in jobs]
        
        semantic_scores = []
        if candidate_profile_text.strip() and job_descriptions:
            try:
                semantic_scores = compute_similarity(candidate_profile_text, job_descriptions)
            except Exception:
                semantic_scores = [0.0] * len(jobs)
        else:
            semantic_scores = [0.0] * len(jobs)

        results = []
        for index, job in enumerate(jobs):
            job_skills = set(w.lower() for w in job.get("skills", []))
            job_exp_level = job.get("experienceLevel", "mid").lower()

            # 1. Skill Match Score (Jaccard Index)
            skill_score = 0.0
            if candidate_skills and job_skills:
                intersection = candidate_skills.intersection(job_skills)
                union = candidate_skills.union(job_skills)
                skill_score = len(intersection) / len(union)
            elif not job_skills:
                skill_score = 1.0

            # 2. Experience Level Match Score
            exp_score = 0.0
            exp_mapping = {"entry": 1, "mid": 2, "senior": 3, "lead": 4, "executive": 5}
            c_val = exp_mapping.get(candidate_exp_level, 2)
            j_val = exp_mapping.get(job_exp_level, 2)
            
            diff = abs(c_val - j_val)
            if diff == 0:
                exp_score = 1.0
            elif diff == 1:
                exp_score = 0.6
            elif diff == 2:
                exp_score = 0.3
            else:
                exp_score = 0.0

            # 3. Semantic Description Similarity
            desc_score = semantic_scores[index] if index < len(semantic_scores) else 0.0

            # Calculate Weighted Overall Score (50% skills, 30% description, 20% experience level)
            overall_score = (skill_score * 0.5) + (desc_score * 0.3) + (exp_score * 0.2)
            overall_percentage = round(overall_score * 100)

            results.append({
                "jobId": job.get("id"),
                "overallScore": overall_percentage,
                "breakdown": {
                    "skillsMatch": round(skill_score * 100),
                    "descriptionMatch": round(desc_score * 100),
                    "experienceMatch": round(exp_score * 100)
                }
            })

        # Sort by overallScore descending
        results.sort(key=lambda x: x["overallScore"], reverse=True)
        return results
export_service = RecommendationService()
