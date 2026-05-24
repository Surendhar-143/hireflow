import re
from typing import List, Dict, Any

COMMON_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Vue", "Angular", "Node.js", "Node",
    "Express", "FastAPI", "Flask", "Django", "SQL", "PostgreSQL", "Postgres", "MySQL",
    "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Git", "GitHub",
    "HTML", "CSS", "Tailwind", "Java", "Spring", "Go", "Golang", "Rust", "C++", "C#",
    "Ruby", "Rails", "PHP", "Laravel", "Swift", "Kotlin", "GraphQL", "REST", "CI/CD"
]

class ResumeService:
    def parse_resume(self, text: str) -> Dict[str, Any]:
        if not text:
            return {
                "name": "Unknown Candidate",
                "email": "",
                "headline": "",
                "bio": "",
                "skills": [],
                "experience": [],
                "education": []
            }

        # 1. Extract Email
        email_match = re.search(r'[\w.-]+@[\w.-]+\.\w+', text)
        email = email_match.group(0) if email_match else ""

        # 2. Extract Name (Typically first line of the resume text)
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        name = "Unknown Candidate"
        if lines:
            first_line = lines[0]
            if len(first_line) < 50 and not any(c in first_line for c in ["@", ":", "/", "\\"]):
                name = first_line

        # 3. Extract Skills
        extracted_skills = []
        for skill in COMMON_SKILLS:
            escaped_skill = re.escape(skill)
            if re.search(r'\b' + escaped_skill + r'\b', text, re.IGNORECASE):
                extracted_skills.append(skill)
            elif "+" in skill and skill in text:
                extracted_skills.append(skill)

        # 4. Extract Headline / Heuristic Summary
        headline = "Software Engineer"
        for line in lines:
            if any(role in line.lower() for role in ["engineer", "developer", "architect", "designer", "manager", "lead"]):
                if len(line) < 80:
                    headline = line
                    break

        # 5. Extract Bio/Summary
        bio = ""
        for line in lines[1:5]:
            if len(line) > 50:
                bio += line + " "
        bio = bio.strip() or f"Experienced professional with skills in {', '.join(extracted_skills[:5])}."

        # 6. Extract Experience Heuristics
        experience = []
        job_pattern = re.compile(
            r'(senior|junior|lead|principal)?\s*(software|frontend|backend|fullstack|data|devops)?\s*(engineer|developer|designer|analyst|manager)',
            re.IGNORECASE
        )
        
        exp_id = 1
        for i, line in enumerate(lines):
            if job_pattern.search(line) and len(line) < 100:
                company = "Company"
                for offset in [-1, 1, 2]:
                    if 0 <= i + offset < len(lines):
                        candidate_company = lines[i + offset]
                        if len(candidate_company) < 50 and any(keyword in candidate_company.lower() for keyword in ["inc", "llc", "corp", "co", "technologies", "systems", "solutions", "limited", "labs"]):
                            company = candidate_company
                            break
                
                experience.append({
                    "id": f"exp-{exp_id}",
                    "title": line,
                    "company": company,
                    "startDate": "2022-01-01",
                    "endDate": None,
                    "current": True if exp_id == 1 else False,
                    "description": lines[i+1] if i+1 < len(lines) else "",
                    "skills": []
                })
                exp_id += 1
                if exp_id > 3:
                    break

        # 7. Extract Education Heuristics
        education = []
        edu_id = 1
        edu_keywords = ["university", "college", "institute", "school", "degree", "bachelor", "master", "phd", "b.s", "m.s"]
        for i, line in enumerate(lines):
            if any(keyword in line.lower() for keyword in edu_keywords) and len(line) < 120:
                degree = "Bachelor of Science"
                if "master" in line.lower() or "m.s" in line.lower():
                    degree = "Master of Science"
                elif "phd" in line.lower() or "ph.d" in line.lower():
                    degree = "Doctor of Philosophy"

                education.append({
                    "id": f"edu-{edu_id}",
                    "institution": line,
                    "degree": degree,
                    "field": "Computer Science",
                    "startYear": 2018,
                    "endYear": 2022,
                    "current": False
                })
                edu_id += 1
                if edu_id > 2:
                    break

        return {
            "name": name,
            "email": email,
            "headline": headline,
            "bio": bio,
            "skills": extracted_skills,
            "experience": experience,
            "education": education
        }
export_service = ResumeService()
