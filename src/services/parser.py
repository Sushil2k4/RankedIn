"""
parser.py - Regex & Keyword-based Resume Parser for RankedIn.
Parses raw TXT resumes to extract name, education, experience, skills, and certifications.
"""

import re
from typing import Dict, Any, List

SKILL_DATABASE = [
    "Python", "Java", "JavaScript", "C++", "SQL", "React", "Node.js", "Git",
    "Docker", "AWS", "Machine Learning", "Data Analysis", "Pandas", "NumPy",
    "Streamlit", "HTML", "CSS", "TypeScript", "Kubernetes", "Spring Boot",
    "TensorFlow", "PyTorch", "R", "Tableau", "APIs", "NoSQL"
]

EDUCATION_KEYWORDS = [
    "B.S.", "Bachelor", "B.Tech", "M.S.", "Master", "M.Tech", "PhD", "Ph.D.",
    "B.A.", "M.B.A.", "High School"
]

def parse_resume(text: str) -> Dict[str, Any]:
    """
    Parses full resume text and returns a structured candidate record.
    Uses regex patterns and predefined skill tables.
    """
    if not text:
        return {
            "name": "Unknown",
            "education": "None",
            "skills": [],
            "experience": 0.0,
            "certifications": []
        }
        
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    # 1. Name Extraction (Heuristic: usually the first non-empty line of text, if short)
    name = "Unknown Candidate"
    for line in lines[:3]:
        # Filter lines that look like headers or contain numbers/symbols
        if len(line) < 30 and not re.search(r'[@:/\\0-9]', line) and not line.lower().startswith(("resume", "curriculum", "contact", "email")):
            name = line
            break
            
    # 2. Skill Extraction (Keyword Matching)
    found_skills = []
    for skill in SKILL_DATABASE:
        # Match word boundaries or special chars like C++
        escaped_skill = re.escape(skill)
        match = re.search(r'\b' + escaped_skill + r'\b', text, re.IGNORECASE)
        # Handle custom symbols like C++
        if "C++" in skill and "c++" in text.lower():
            match = True
        if match:
            found_skills.append(skill)
            
    # 3. Education Extraction
    found_edu = "B.S. in Computer Science" # Fallback heuristic
    education_lines = []
    for line in lines:
        if any(keyword.lower() in line.lower() for keyword in EDUCATION_KEYWORDS) or "university" in line.lower() or "college" in line.lower():
            education_lines.append(line)
            
    if education_lines:
        # Find the highest mentioned education or first occurrence
        for landmark in ["PhD", "Ph.D.", "Master", "M.S.", "M.B.A.", "Bachelor", "B.S.", "B.Tech", "High School"]:
            for edu_line in education_lines:
                if landmark.lower() in edu_line.lower():
                    # Clean up line of clutter
                    clean_edu = edu_line
                    if ":" in clean_edu:
                        clean_edu = clean_edu.split(":")[-1].strip()
                    # Cap size of string
                    found_edu = clean_edu[:60].strip()
                    break
            else:
                continue
            break
        if not found_edu and len(education_lines) > 0:
            found_edu = education_lines[0][:60]
            
    # 4. Experience Years Extraction
    # Heuristic format: "5 years of experience", "worked for 6 yrs", "experience: 3 years"
    experience_years = 0.0
    exp_matches = re.findall(r'(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\b(?:\s*of\s*(?:work|professional|relevant)?\s*experience)?', text, re.IGNORECASE)
    if exp_matches:
        # Return the highest experience listed (or sum) but realistically use max float
        try:
            years = [float(val) for val in exp_matches]
            experience_years = max(years)
        except ValueError:
            pass
    else:
        # If no explicit "X years" pattern, count job listings / date ranges
        # Search for date patterns like "2018 - 2021"
        date_matches = re.findall(r'\b(20\d{2})\s*[-–—]\s*(20\d|Present)\b', text, re.IGNORECASE)
        tot_yrs = 0.0
        for start, end in date_matches:
            s_yr = int(start)
            e_yr = 2026 if end.lower() == "present" else int(end) if end.isdigit() else 2026
            diff = max(0, e_yr - s_yr)
            tot_yrs += diff
        if tot_yrs > 0:
            experience_years = min(15.0, tot_yrs) # Cap at realistic max
            
    # 5. Certifications Extraction
    # Search for lines containing "certified", "certificate", "certification", or list of typical certs
    certs = []
    cert_regexes = [
        r'\bAWS\s+Certified\b\s*\w*',
        r'\bCertified\s+Kubernetes\b\s*\w*',
        r'\bGoogle\s+\w+\s+Professional\b',
        r'\bCompTIA\s+\w+\+?\b',
        r'\bOracle\s+Certified\b\s*\w*',
        r'\bUX\s+Design\s+(?:Certificate|Nanodegree)\b',
        r'\bMeta\s+[A-Za-z- ]+\s+Certificate\b',
        r'\bReact\s+Nanodegree\b'
    ]
    for pattern in cert_regexes:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for m in matches:
            certs.append(m.group(0).strip())
            
    # Fallback to lines with "Certifications" or "Certificates" section
    cert_section_found = False
    for i, line in enumerate(lines):
        if re.search(r'\b(certifications|certificates|courses)\b', line, re.IGNORECASE):
            # Collect up to 3 following lines as certifications if they aren't header-like
            cert_section_found = True
            for next_line in lines[i+1 : i+4]:
                if any(hdr in next_line.lower() for hdr in ["experience", "education", "skills", "projects"]) or len(next_line) > 50:
                    break
                # Filter out numbers, bullets
                clean_cert = re.sub(r'^[\s\-\*•\d\.]+', '', next_line).strip()
                if clean_cert and clean_cert not in certs and len(clean_cert) > 3:
                    certs.append(clean_cert)
            break
            
    # Ensure safe output
    return {
        "name": name if name else "Unknown Candidate",
        "education": found_edu if found_edu else "B.S. in Computer Science",
        "skills": found_skills,
        "experience": float(experience_years),
        "certifications": certs if certs else ["None"]
    }
