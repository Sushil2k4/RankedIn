"""
recommender.py - Job Recommendation Engine for RankedIn.
Takes an applicant profile and outputs sorted matching jobs with fit criteria descriptions.
"""

from typing import List, Dict, Any
from src.models.candidate import Candidate
from src.models.job import Job
from src.services.matcher import match_candidate_to_job

def recommend_jobs_for_candidate(candidate: Candidate, jobs: List[Job]) -> List[Dict[str, Any]]:
    """
    Compares a single candidate against all available jobs and ranks them in descending order of match score.
    Returns:
        A list of dictionaries with job details and matching explanation.
    """
    if not jobs:
        return []
        
    recommendations = []
    
    for job in jobs:
        match_details = match_candidate_to_job(candidate, job)
        score = match_details["score"]
        
        # Decide structural feedback reasoning
        if score >= 80:
            reasoning = "Excellent Match! Your skills and experience perfectly map this job opening's core requirements."
        elif score >= 60:
            reasoning = "Solid Fit. You have some of the key required skills, though matching a few missing ones will make you a perfect candidate."
        elif score >= 45:
            reasoning = "Partial Alignment. Your baseline background fits, but we recommend targeting upskilling courses for missing technologies."
        else:
            reasoning = "Low Suitability. Significant discrepancies exist in key skills and required experience levels."
            
        recommendations.append({
            "job_id": job.job_id,
            "title": job.title,
            "score": score,
            "required_skills": job.required_skills,
            "minimum_experience": job.minimum_experience,
            "preferred_education": job.preferred_education,
            "matched_skills": match_details["matched_skills"],
            "missing_skills": match_details["missing_skills"],
            "reasoning": reasoning
        })
        
    # Sort recommendations descending by score
    recommendations.sort(key=lambda x: x["score"], reverse=True)
    
    return recommendations
