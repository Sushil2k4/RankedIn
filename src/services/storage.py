"""
storage.py - High-reliability storage services for RankedIn.
Saves and loads Candidates and Jobs from CSV tables, and Rankings history from JSON files.
Includes directory creation safeguards and CSV escaping structure.
"""

import os
import csv
import json
from typing import List, Dict, Any
from src.models.candidate import Candidate
from src.models.job import Job

CANDIDATES_PATH = "data/candidates.csv"
JOBS_PATH = "data/jobs.csv"
RANKINGS_PATH = "data/rankings.json"

def ensure_dir(file_path: str):
    """
    Safely creates parent directories for any target path.
    """
    directory = os.path.dirname(file_path)
    if directory and not os.path.exists(directory):
        os.makedirs(directory)

def load_candidates_from_csv() -> List[Candidate]:
    """
    Reads applicant records from candidates.csv and returns Candidate models.
    """
    if not os.path.exists(CANDIDATES_PATH):
        return []
        
    candidates = []
    try:
        with open(CANDIDATES_PATH, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    cand = Candidate(
                        candidate_id=row["candidate_id"],
                        name=row["name"],
                        education=row["education"],
                        skills=row["skills"],
                        experience=row["experience"],
                        certifications=row["certifications"]
                    )
                    candidates.append(cand)
                except Exception as e:
                    print(f"Skipping corrupt candidate record in CSV: {row.get('candidate_id')} - Error: {e}")
    except Exception as e:
        print(f"Error loading candidates CSV: {e}")
        
    return candidates

def save_candidates_to_csv(candidates: List[Candidate]):
    """
    Saves current candidates database to candidates.csv.
    """
    ensure_dir(CANDIDATES_PATH)
    try:
        with open(CANDIDATES_PATH, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=["candidate_id", "name", "education", "skills", "experience", "certifications"])
            writer.writeheader()
            for cand in candidates:
                writer.writerow(cand.to_dict())
    except Exception as e:
        print(f"Failed to write candidates CSV: {e}")
        raise IOError(f"Failed to write candidate details: {e}")

def load_jobs_from_csv() -> List[Job]:
    """
    Reads job listings from jobs.csv and returns Job models.
    """
    if not os.path.exists(JOBS_PATH):
        return []
        
    jobs = []
    try:
        with open(JOBS_PATH, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    job = Job(
                        job_id=row["job_id"],
                        title=row["title"],
                        required_skills=row["required_skills"],
                        minimum_experience=row["minimum_experience"],
                        preferred_education=row["preferred_education"]
                    )
                    jobs.append(job)
                except Exception as e:
                    print(f"Skipping corrupt job listing in CSV: {row.get('job_id')} - Error: {e}")
    except Exception as e:
        print(f"Error reading jobs CSV: {e}")
        
    return jobs

def save_jobs_to_csv(jobs: List[Job]):
    """
    Saves job openings list to jobs.csv.
    """
    ensure_dir(JOBS_PATH)
    try:
        with open(JOBS_PATH, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=["job_id", "title", "required_skills", "minimum_experience", "preferred_education"])
            writer.writeheader()
            for job in jobs:
                writer.writerow(job.to_dict())
    except Exception as e:
        print(f"Failed to write jobs CSV: {e}")
        raise IOError(f"Failed to save job opening details: {e}")

def load_rankings_from_json() -> Dict[str, Any]:
    """
    Loads historic calculations and rankings from findings.json.
    """
    if not os.path.exists(RANKINGS_PATH):
        return {}
        
    try:
        with open(RANKINGS_PATH, mode='r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading rankings JSON: {e}")
        return {}

def save_rankings_to_json(rankings_dict: Dict[str, Any]):
    """
    Stores rankings leaderboards into rankings.json.
    """
    ensure_dir(RANKINGS_PATH)
    try:
        with open(RANKINGS_PATH, mode='w', encoding='utf-8') as f:
            json.dump(rankings_dict, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error writing rankings JSON: {e}")
        raise IOError(f"Failed to write rankings details: {e}")
