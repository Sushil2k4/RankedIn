"""
job.py - Job Model for RankedIn.
Provides encapsulated storage and validation for job requirements.
"""

from typing import List, Dict, Any, Union

class Job:
    """
    Represents a Job Listing in RankedIn with required qualifications and skills.
    Handles matching-ready fields validation.
    """
    
    def __init__(
        self,
        job_id: str,
        title: str,
        required_skills: Union[str, List[str]],
        minimum_experience: Union[int, float],
        preferred_education: str
    ):
        # Validate job_id
        if not job_id or not isinstance(job_id, str):
            raise ValueError("job_id must be a non-empty string.")
            
        # Validate title
        if not title or not isinstance(title, str):
            raise ValueError("title must be a non-empty string.")
            
        # Validate experience
        try:
            exp_val = float(minimum_experience) if isinstance(minimum_experience, str) else minimum_experience
            if not isinstance(exp_val, (int, float)) or exp_val < 0:
                raise ValueError()
        except Exception:
            raise ValueError("minimum_experience must be a non-negative number.")
            
        self.job_id = job_id.strip()
        self.title = title.strip()
        self.preferred_education = preferred_education.strip() if preferred_education else "Any"
        self.minimum_experience = float(minimum_experience)
        
        # Standardize required skills
        if isinstance(required_skills, str):
            self.required_skills = [s.strip() for s in required_skills.split(";") if s.strip()] if ";" in required_skills else [s.strip() for s in required_skills.split(",") if s.strip()] if "," in required_skills else [required_skills.strip()] if required_skills.strip() else []
        elif isinstance(required_skills, list):
            self.required_skills = [str(s).strip() for s in required_skills if str(s).strip()]
        else:
            self.required_skills = []

    def display_job(self) -> str:
        """
        Formats job specifications into a readable string.
        """
        skills_str = ", ".join(self.required_skills) if self.required_skills else "None"
        return (
            f"=== Job Opening: {self.title} ({self.job_id}) ===\n"
            f"Preferred Education: {self.preferred_education}\n"
            f"Min Experience:      {self.minimum_experience} years\n"
            f"Required Skills:     {skills_str}\n"
            f"=================================================="
        )

    def to_dict(self) -> Dict[str, Any]:
        """
        Converts the job opening to a dictionary.
        """
        return {
            "job_id": self.job_id,
            "title": self.title,
            "required_skills": ";".join(self.required_skills),
            "minimum_experience": self.minimum_experience,
            "preferred_education": self.preferred_education
        }
