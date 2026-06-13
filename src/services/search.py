"""
search.py - Advanced Search Engine for RankedIn.
Features:
  - Hash Table (Inverted Index) for keyword-based O(1) skill searches.
  - Binary Search for O(log N) numerical range lookups over sorted experience profiles.
"""

from typing import List, Dict, Set, Any
from src.models.candidate import Candidate

class SearchIndex:
    """
    Candidate Search Index utilizing Hash Tables and Binary Search.
    """
    
    def __init__(self, candidates: List[Candidate]):
        self.candidates = candidates
        # Hash Table for O(1) Skill Indexing: key = skill, value = Set[Candidate ID]
        self._skills_index: Dict[str, Set[str]] = {}
        # Hash Table for Education mapping
        self._edu_index: Dict[str, Set[str]] = {}
        
        self.build_hash_indexes()
        
    def build_hash_indexes(self):
        """
        Builds O(1) inverted indices mapping skill or education strings to candidate IDs.
        COMPLEXITY: O(N * S), where N is candidates and S is historical skill counts.
        """
        for c in self.candidates:
            # Skill Inverted Index
            for s in c.skills:
                skill_lower = s.strip().lower()
                if skill_lower not in self._skills_index:
                    self._skills_index[skill_lower] = set()
                self._skills_index[skill_lower].add(c.candidate_id)
                
            # Education Inverted Index
            edu_lower = c.education.strip().lower()
            # Match keywords like "bachelor", "master", "phd"
            for token in ["bachelor", "master", "phd", "doctor", "b.s.", "m.s.", "high school"]:
                if token in edu_lower:
                    if token not in self._edu_index:
                        self._edu_index[token] = set()
                    self._edu_index[token].add(c.candidate_id)

    def search_by_skill(self, skill_name: str) -> List[Candidate]:
        """
        O(1) lookup via Skills Inverted Index (Hash Table).
        COMPLEXITY ANALYSIS:
          - Time Complexity: O(1) average lookup in hash table, O(M) to fetch objects where M is matching count.
          - Space Complexity: O(U) where U is unique skill tokens stored on memory.
        """
        target = skill_name.strip().lower()
        matching_ids = self._skills_index.get(target, set())
        return [c for c in self.candidates if c.candidate_id in matching_ids]

    def binary_search_experience_lower_bound(self, sorted_cands: List[Candidate], target_years: float) -> int:
        """
        Locates the first candidate index having experience >= target_years.
        COMPLEXITY ANALYSIS:
          - Time: O(log N) - binary splitting search window.
          - Space: O(1) constant pointers.
        Returns:
          index (int): lowest index matching the threshold, or len(sorted_cands) if none match.
        """
        low = 0
        high = len(sorted_cands) - 1
        boundary = len(sorted_cands)
        
        while low <= high:
            mid = (low + high) // 2
            if sorted_cands[mid].experience >= target_years:
                boundary = mid
                high = mid - 1 # Try to search for a lower boundary
            else:
                low = mid + 1
                
        return boundary

    def search_candidates(self, skill: str = "", min_exp: float = 0.0, education_token: str = "") -> List[Candidate]:
        """
        Orchestrates multi-faceted searching using index filters.
        Filters candidates matching skill, then education, then applies Binary Search for experience thresholds.
        """
        results = set(self.candidates)
        
        # 1. Apply Skill Hash Table Search if requested
        if skill:
            skill_hits = self._skills_index.get(skill.strip().lower(), set())
            results = results.intersection({c for c in self.candidates if c.candidate_id in skill_hits})
            
        # 2. Apply Education Hash Table Search
        if education_token:
            edu_hits = self._edu_index.get(education_token.strip().lower(), set())
            # Fallback direct search if token represents a custom non-standard school description
            if not edu_hits:
                results = {c for c in results if education_token.strip().lower() in c.education.lower()}
            else:
                results = results.intersection({c for c in self.candidates if c.candidate_id in edu_hits})
                
        # List context to prepare for experience searching
        candidates_pool = list(results)
        
        # 3. Apply O(log N) Binary Search for Experience Range
        if min_exp > 0:
            # Sort the current subset by experience ascending to make Binary Search feasible
            # Standard sorting is safe here for subsets, but sorting manually:
            sorted_candidates_pool = sorted(candidates_pool, key=lambda x: x.experience)
            start_index = self.binary_search_experience_lower_bound(sorted_candidates_pool, min_exp)
            # Candidates from start_index to end have experience >= min_exp
            candidates_pool = sorted_candidates_pool[start_index:]
            
        return candidates_pool
