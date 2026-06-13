"""
candidate.py - Candidate Data Model for RankedIn.
Provides encapsulated storage and validation for candidate profiles.
"""

from typing import List, Dict, Any, Union

class Candidate:
    """
    Represents a job candidate profile in RankedIn.
    Handles data validation and structured formatting.
    """
    
    def __init__(
        self,
        candidate_id: str,
        name: str,
        education: str,
        skills: Union[str, List[str]],
        experience: Union[int, float],
        certifications: Union[str, List[str]]
    ):
        # Validate candidate ID
        if not candidate_id or not isinstance(candidate_id, str):
            raise ValueError("candidate_id must be a non-empty string.")
        
        # Validate name
        if not name or not isinstance(name, str):
            raise ValueError("name must be a non-empty string.")
            
        # Validate experience
        try:
            exp_val = float(experience) if isinstance(experience, str) else experience
            if not isinstance(exp_val, (int, float)) or exp_val < 0:
                raise ValueError()
        except Exception:
            raise ValueError("experience must be a non-negative number.")
            
        self.candidate_id = candidate_id.strip()
        self.name = name.strip()
        self.education = education.strip() if education else "Unknown"
        self.experience = float(experience)
        
        # Standardize skills representation
        if isinstance(skills, str):
            self.skills = [s.strip() for s in skills.split(";") if s.strip()] if ";" in skills else [s.strip() for s in skills.split(",") if s.strip()] if "," in skills else [skills.strip()] if skills.strip() else []
        elif isinstance(skills, list):
            self.skills = [str(s).strip() for s in skills if str(s).strip()]
        else:
            self.skills = []
            
        # Standardize certifications representation
        if isinstance(certifications, str):
            if not certifications or certifications.lower() == "none":
                self.certifications = []
            else:
                self.certifications = [c.strip() for c in certifications.split(";") if c.strip()] if ";" in certifications else [c.strip() for c in certifications.split(",") if c.strip()] if "," in certifications else [certifications.strip()] if certifications.strip() else []
        elif isinstance(certifications, list):
            self.certifications = [str(c).strip() for c in certifications if str(c).strip()]
        else:
            self.certifications = []

    def display_profile(self) -> str:
        """
        Formats candidate profile information into a clean readable string.
        """
        cert_str = ", ".join(self.certifications) if self.certifications else "None"
        skills_str = ", ".join(self.skills) if self.skills else "None"
        return (
            f"=== Candidate Profile: {self.name} ({self.candidate_id}) ===\n"
            f"Education:      {self.education}\n"
            f"Experience:     {self.experience} years\n"
            f"Skills:         {skills_str}\n"
            f"Certifications: {cert_str}\n"
            f"=================================================="
        )

    def to_dict(self) -> Dict[str, Any]:
        """
        Converts the candidate object to a dictionary representation.
        """
        return {
            "candidate_id": self.candidate_id,
            "name": self.name,
            "education": self.education,
            "skills": ";".join(self.skills),
            "experience": self.experience,
            "certifications": ";".join(self.certifications) if self.certifications else "None"
        }
