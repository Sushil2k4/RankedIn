"""
resume_score.py - Resume Strength Analyzer for RankedIn.
Scores raw resumes from 0 to 100 based on keyword thickness, experience depth, certifications, and structure.
"""

from typing import Dict, Any, List
from src.models.candidate import Candidate

def evaluate_resume_strength(candidate: Candidate) -> Dict[str, Any]:
    """
    Evaluates Candidate resume profile completeness and richness.
    Scoring factors:
      - Skills breadth (up to 40 pts) - 5 pts per skill up to 8 skills.
      - Experience depth (up to 30 pts) - 5 pts per year up to 6 years of work.
      - Certifications (up to 15 pts) - 7.5 pts per certification listed.
      - Education level (up to 15 pts) - PhD (15), Masters (12), Bachelors (10), other (5).
    """
    # 1. Skills Score
    skills_count = len(candidate.skills)
    skills_points = min(40.0, skills_count * 5.0)
    
    # 2. Experience Score
    exp_points = min(30.0, candidate.experience * 5.0)
    
    # 3. Certifications Score
    # Filter out empty or placeholder certifications
    valid_certs = [c for c in candidate.certifications if c and c.lower() != "none" and c.strip()]
    certs_points = min(15.0, len(valid_certs) * 7.5)
    
    # 4. Education Score
    edu_text = candidate.education.lower()
    if "phd" in edu_text or "ph.d." in edu_text or "doctor" in edu_text:
        edu_points = 15.0
    elif "master" in edu_text or "m.s." in edu_text or "m.b.a." in edu_text or "m.tech" in edu_text:
        edu_points = 12.0
    elif "bachelor" in edu_text or "b.s." in edu_text or "b.tech" in edu_text or "b.a." in edu_text:
        edu_points = 10.0
    elif edu_text != "unknown" and edu_text != "none" and len(edu_text) > 3:
        edu_points = 7.0
    else:
        edu_points = 5.0
        
    total_score = round(skills_points + exp_points + certs_points + edu_points, 1)
    
    # Formatting suggestions
    suggestions = []
    if skills_count < 6:
        suggestions.append("Add more keyword skills matching industry standards to bypass ATS filters (aim for at least 8 key skills).")
    if candidate.experience < 3:
        suggestions.append("Enrich your experience listings (if yours is under 3 years, break down specific tech projects you worked on in detail).")
    if not valid_certs:
        suggestions.append("Boost credibility by pursuing industry-certified credentials (e.g., AWS, Scrum, Kubernetes, or Google Analytics).")
    if "unknown" in edu_text or not edu_text:
        suggestions.append("Explicitly state your university degrees/education details under a prominent 'Education' section header.")
        
    if total_score > 85:
        rating = "Elite / Senior Talent"
        summary = "Outstanding resume thickness! This profile shows rich technological competence and extensive experience."
    elif total_score > 65:
        rating = "Highly Competitive"
        summary = "Strong profile. Meeting a few recommended upskills will make this resume irresistible to recruiters."
    elif total_score > 45:
        rating = "Standard Solid Candidate"
        summary = "Adequate coverage. Substantial improvements can be gained by pursuing certifications and detailing technical stacks."
    else:
        rating = "Needs Upskilling"
        summary = "Thin representation. Expand your visual portfolio and include more software project and core development skill highlights."
        
    return {
        "score": total_score,
        "rating": rating,
        "summary": summary,
        "suggestions": suggestions if suggestions else ["Your resume structure and content density are in excellent shape!"],
        "breakdown": {
            "skills": skills_points,
            "experience": exp_points,
            "certifications": certs_points,
            "education": edu_points
        }
    }
