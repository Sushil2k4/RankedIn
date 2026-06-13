"""
ranking.py - Candidate Ranking Engine for RankedIn.
Implements manual Merge Sort for safe O(N log N) descending sorting of applicant matching scores.
"""

from typing import List, Dict, Any, Tuple
from src.models.candidate import Candidate
from src.models.job import Job
from src.services.matcher import match_candidate_to_job

def merge_sort_candidates(records: List[Tuple[Candidate, Dict[str, Any]]]) -> List[Tuple[Candidate, Dict[str, Any]]]:
    """
    MANUAL MERGE SORT IMPLEMENTATION.
    Sorts a listing of (Candidate, MatchDetails) tuples in descending order of matching score.
    
    COMPLEXITY ANALYSIS:
      - Time Complexity:
        * Best Case: O(N log N) - Splitting and merging occurs uniformly.
        * Average Case: O(N log N) - Standard divide-and-conquer splits.
        * Worst Case: O(N log N) - No unbalanced pivot skew (highly robust alternative to Quicksort).
      - Space Complexity:
        * Worst Case: O(N) auxiliary space - Necessary for temporary arrays during merging.
    """
    if len(records) <= 1:
        return records
        
    mid = len(records) // 2
    left_half = merge_sort_candidates(records[:mid])
    right_half = merge_sort_candidates(records[mid:])
    
    return merge(left_half, right_half)

def merge(
    left: List[Tuple[Candidate, Dict[str, Any]]],
    right: List[Tuple[Candidate, Dict[str, Any]]]
) -> List[Tuple[Candidate, Dict[str, Any]]]:
    """
    Merges two sorted sublists in descending order of the match 'score'.
    """
    merged: List[Tuple[Candidate, Dict[str, Any]]] = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        # descending order: larger score goes first
        left_score = left[i][1]["score"]
        right_score = right[j][1]["score"]
        
        if left_score >= right_score:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
            
    while i < len(left):
        merged.append(left[i])
        i += 1
        
    while j < len(right):
        merged.append(right[j])
        j += 1
        
    return merged

def rank_candidates(candidates: List[Candidate], job: Job) -> List[Dict[str, Any]]:
    """
    Calculates match scores for all candidates and ranks them in descending order.
    Returns:
        A list of dictionaries representing the leaderboard.
    """
    scored_candidates: List[Tuple[Candidate, Dict[str, Any]]] = []
    
    for candidate in candidates:
        match_details = match_candidate_to_job(candidate, job)
        scored_candidates.append((candidate, match_details))
        
    # Apply manual merge sort
    ranked_tuples = merge_sort_candidates(scored_candidates)
    
    # Construct final result JSON structure
    leaderboard = []
    for rank, (candidate, details) in enumerate(ranked_tuples, start=1):
        leaderboard.append({
            "rank": rank,
            "candidate_id": candidate.candidate_id,
            "name": candidate.name,
            "education": candidate.education,
            "experience": candidate.experience,
            "skills": candidate.skills,
            "certifications": candidate.certifications,
            "match_details": details
        })
        
    return leaderboard
