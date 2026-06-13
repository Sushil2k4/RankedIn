"""
analytics.py - Talent Analytics and Statistics Compiler for RankedIn.
Uses Pandas to process candidate databases and output aggregates for Plotly dashboard charts.
"""

from typing import Dict, Any, List
import pandas as pd
import numpy as np
from src.models.candidate import Candidate

def generate_talent_analytics(candidates: List[Candidate]) -> Dict[str, Any]:
    """
    Compiles detailed aggregate stats over the candidate database.
    """
    if not candidates:
        return {
            "total_candidates": 0,
            "average_experience": 0.0,
            "top_skills": [],
            "education_distribution": {},
            "experience_distribution": {},
            "certification_distribution": {},
            "hiring_readiness_metrics": {}
        }
        
    # Convert list of candidates to Pandas DataFrame
    cand_dicts = [c.to_dict() for c in candidates]
    df = pd.DataFrame(cand_dicts)
    
    # Process numeric columns
    df["experience"] = df["experience"].astype(float)
    avg_experience = float(df["experience"].mean())
    
    # 1. Top Skills aggregate
    all_skills = []
    for s_list in df["skills"].dropna():
        all_skills.extend([s.strip() for s in s_list.split(";") if s.strip()])
    skill_series = pd.Series(all_skills)
    top_skills = skill_series.value_counts().head(10).to_dict()
    # Format into list of dicts for ease of charting
    top_skills_list = [{"skill": k, "count": int(v)} for k, v in top_skills.items()]
    
    # 2. Education distribution
    # Normalize educations into categories
    def categorize_edu(edu):
        txt = str(edu).lower()
        if "phd" in txt or "ph.d." in txt or "dr." in txt:
            return "PhD"
        elif "master" in txt or "m.s." in txt or "m.b.a." in txt or "m.tech" in txt:
            return "Master's"
        elif "bachelor" in txt or "b.s." in txt or "b.tech" in txt or "b.a." in txt:
            return "Bachelor's"
        elif "high school" in txt or "diploma" in txt:
            return "High School"
        return "Other / Self-taught"
        
    df["edu_category"] = df["education"].apply(categorize_edu)
    edu_dist = df["edu_category"].value_counts().to_dict()
    
    # 3. Experience distribution
    def categorize_exp(exp):
        if exp < 2:
            return "Junior (0-2 yrs)"
        elif exp < 5:
            return "Mid-level (2-5 yrs)"
        elif exp < 8:
            return "Senior (5-8 yrs)"
        return "Lead / Principal (8+ yrs)"
        
    df["exp_category"] = df["experience"].apply(categorize_exp)
    exp_dist = df["exp_category"].value_counts().to_dict()
    
    # 4. Certification distribution
    all_certs = []
    for certs_val in df["certifications"].dropna():
        if certs_val and certs_val.lower() != "none":
            all_certs.extend([c.strip() for c in certs_val.split(";") if c.strip()])
            
    cert_series = pd.Series(all_certs)
    cert_dist = cert_series.value_counts().head(8).to_dict()
    
    # 5. Hiring Readiness Scores (Heuristic based on skills count * experience)
    # Scale from 0 to 100
    def calculate_readiness(row):
        skills_len = len([s for s in row["skills"].split(";") if s.strip()])
        exp = float(row["experience"])
        score = min(100.0, (skills_len * 5) + (exp * 8) + 20)
        return score
        
    df["readiness_score"] = df.apply(calculate_readiness, axis=1)
    
    def assess_tier(sc):
        if sc >= 80:
            return "Highly Ready (80-100)"
        elif sc >= 50:
            return "Standard Candidate (50-80)"
        return "Requires Training (0-50)"
        
    df["readiness_tier"] = df["readiness_score"].apply(assess_tier)
    readiness_dist = df["readiness_tier"].value_counts().to_dict()
    
    return {
        "total_candidates": len(df),
        "average_experience": round(avg_experience, 1),
        "top_skills": top_skills_list,
        "education_distribution": {str(k): int(v) for k, v in edu_dist.items()},
        "experience_distribution": {str(k): int(v) for k, v in exp_dist.items()},
        "certification_distribution": {str(k): int(v) for k, v in cert_dist.items()},
        "hiring_readiness_metrics": {str(k): int(v) for k, v in readiness_dist.items()}
    }
