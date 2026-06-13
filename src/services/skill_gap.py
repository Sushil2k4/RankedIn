"""
skill_gap.py - Skill Gap Analytics & Training Recommendation Engine.
Compares applicant skill arrays to job prerequisites and maps curriculum pathways.
"""

from typing import Dict, Any, List
from src.models.candidate import Candidate
from src.models.job import Job

# Specialized Learning Resources database
LEARNING_RESOURCES = {
    "python": [
        "Take 'Complete Python Bootcamp' on Udemy",
        "Read 'Effective Python: 90 Specific Ways to Write Better Python' by Brett Slatkin"
    ],
    "sql": [
        "Take 'Complete SQL Bootcamp' by Jose Portilla on Udemy",
        "Practice schema queries on LeetCode Database section"
    ],
    "docker": [
        "Follow 'Docker Mastery' by Brett Fisher on Udemy",
        "Review official Docker 'Getting Started' container guides"
    ],
    "aws": [
        "Prepare with 'AWS Certified Solutions Architect Associate' by Stephane Maarek",
        "Build a serverless web app on AWS Free Tier"
    ],
    "react": [
        "Consult 'React - The Complete Guide' by Academind on Udemy",
        "Build 3 responsive frontends using Tailwind CSS and React Hooks"
    ],
    "node.js": [
        "Complete 'The Complete Node.js Developer Course' on Udemy",
        "Build self-contained JSON REST APIs using Express.js"
    ],
    "kubernetes": [
        "Study 'Certified Kubernetes Administrator (CKA)' by Mumshad Mannambeth on KodeKloud",
        "Spin up local clusters with Minikube"
    ],
    "machine learning": [
        "Enroll in 'Machine Learning Specialization' by Andrew Ng on Coursera",
        "Implement basic regression and classification on Kaggle datasets"
    ],
    "pytorch": [
        "Follow PyTorch's official 'Deep Learning with PyTorch: A 60 Minute Blitz'",
        "Enroll in 'Deep Learning Specialization' on Coursera"
    ],
    "tensorflow": [
        "Take 'TensorFlow Developer Professional Certificate' on Coursera"
    ],
    "pandas": [
        "Read 'Python for Data Analysis' by Wes McKinney",
        "Practice tabular cleaning exercises on Kaggle Exercises"
    ],
    "git": [
        "Follow 'Git & GitHub Bootcamp' by Colt Steele on Udemy",
        "Practice CLI conflict merging scenarios on local testing repos"
    ],
    "apis": [
        "Read 'Designing Web APIs' by Brenda Jin on O'Reilly",
        "Build and test API routes using Postman"
    ]
}

def analyze_skill_gap(candidate: Candidate, job: Job) -> Dict[str, Any]:
    """
    Identifies matched vs missing skills, calculating percentage metrics and actionable recommendations.
    """
    req_skills_lower = {s.lower().strip() for s in job.required_skills}
    cand_skills_lower = {s.lower().strip() for s in candidate.skills}
    
    matched_lbls = []
    missing_lbls = []
    recommendations = []
    
    for skill in job.required_skills:
        s_low = skill.lower().strip()
        if s_low in cand_skills_lower:
            matched_lbls.append(skill)
        else:
            missing_lbls.append(skill)
            
            # Append high-relevance learning sources if available
            if s_low in LEARNING_RESOURCES:
                recommendations.extend(LEARNING_RESOURCES[s_low])
            else:
                recommendations.append(f"Explore '{skill} Foundations' tutorial sequences on Coursera / YouTube")
                
    match_pct = (len(matched_lbls) / len(job.required_skills)) * 100.0 if job.required_skills else 100.0
    
    # Prune duplicate suggestions if any
    recommendations = list(dict.fromkeys(recommendations))
    
    return {
        "candidate_id": candidate.candidate_id,
        "name": candidate.name,
        "job_title": job.title,
        "matched_skills": matched_lbls,
        "missing_skills": missing_lbls,
        "match_percentage": round(match_pct, 1),
        "learning_recommendations": recommendations[:5] # Limit to 5 top recommendations
    }
