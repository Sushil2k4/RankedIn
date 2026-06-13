"""
matcher.py - Candidate-to-Job Matching Engine for RankedIn.
Calculates percentage alignment scores using specialized HR mathematical formulas.
"""

from typing import Dict, Any, List, Set
from src.models.candidate import Candidate
from src.models.job import Job

def get_edu_level(edu_text: str) -> int:
    """
    Sub-utility mapping education tiers to integer values for hierarchical comparisons.
    """
    txt = edu_text.lower()
    if "phd" in txt or "ph.d." in txt or "doctor" in txt:
        return 4
    elif "master" in txt or "m.s." in txt or "m.b.a." in txt or "m.tech" in txt or "msc" in txt:
        return 3
    elif "bachelor" in txt or "b.s." in txt or "b.tech" in txt or "b.a." in txt or "undergrad" in txt:
        return 2
    elif "high school" in txt or "diploma" in txt or "associate" in txt:
        return 1
    return 0

def match_candidate_to_job(candidate: Candidate, job: Job) -> Dict[str, Any]:
    """
    Performs precise multi-weight calculations on Candidates against Job criteria:
    - Skills Weight: 70%
    - Experience Weight: 20%
    - Education Weight: 10%
    Returns:
        score: float (percentage out of 100)
        matched_skills: list of string
        missing_skills: list of string
        experience_shortfall: float
        education_aligned: bool
    """
    # 1. Skills Weight (70%)
    req_skills_set = {s.lower() for s in job.required_skills}
    cand_skills_set = {s.lower() for s in candidate.skills}
    
    matched_skills_lower = req_skills_set.intersection(cand_skills_set)
    missing_skills_lower = req_skills_set.difference(cand_skills_set)
    
    # Capitalize matched/missing correctly mapping back to Job casing
    matched_skills = [s for s in job.required_skills if s.lower() in matched_skills_lower]
    missing_skills = [s for s in job.required_skills if s.lower() in missing_skills_lower]
    
    skills_percent = len(matched_skills_lower) / len(req_skills_set) if len(req_skills_set) > 0 else 1.0
    skills_score = skills_percent * 70.0
    
    # 2. Experience Weight (20%)
    if job.minimum_experience <= 0:
        exp_score = 20.0
        exp_shortfall = 0.0
    else:
        # Ratio capping at 1.0 (cand meets or exceeds requirements)
        ratio = min(1.0, candidate.experience / job.minimum_experience)
        exp_score = ratio * 20.0
        exp_shortfall = max(0.0, job.minimum_experience - candidate.experience)
        
    # 3. Education Weight (10%)
    cand_edu_level = get_edu_level(candidate.education)
    job_edu_level = get_edu_level(job.preferred_education)
    
    if cand_edu_level >= job_edu_level:
        edu_score = 10.0
        edu_aligned = True
    elif cand_edu_level == job_edu_level - 1:
        # Partial alignment (e.g., job wants masters, cand has bachelors)
        edu_score = 5.0
        edu_aligned = False
    else:
        edu_score = 0.0
        edu_aligned = False
        
    # Total percentage out of 100
    total_score = round(skills_score + exp_score + edu_score, 1)
    
    return {
        "score": total_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "skills_alignment_pct": round(skills_percent * 100, 1),
        "experience_shortfall_yrs": round(exp_shortfall, 1),
        "education_aligned": edu_aligned,
        "breakdown": {
            "skills_contrib": round(skills_score, 1),
            "experience_contrib": round(exp_score, 1),
            "education_contrib": round(edu_score, 1)
        }
    }
