/**
 * types.ts - Shared interface models for RankedIn.
 */

export interface Candidate {
  candidate_id: string;
  name: string;
  education: string;
  skills: string[];
  experience: number;
  certifications: string[];
}

export interface Job {
  job_id: string;
  title: string;
  required_skills: string[];
  minimum_experience: number;
  preferred_education: string;
}

export interface MatchBreakdown {
  skills_contrib: number;
  experience_contrib: number;
  education_contrib: number;
}

export interface MatchDetails {
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  skills_alignment_pct: number;
  experience_shortfall_yrs: number;
  education_aligned: boolean;
  breakdown: MatchBreakdown;
}

export interface RankedCandidate {
  rank: number;
  candidate_id: string;
  name: string;
  education: string;
  experience: number;
  skills: string[];
  certifications: string[];
  match_details: MatchDetails;
}

export interface JobRecommendation {
  job_id: string;
  title: string;
  score: number;
  required_skills: string[];
  minimum_experience: number;
  preferred_education: string;
  matched_skills: string[];
  missing_skills: string[];
  reasoning: string;
}

export interface SkillGapAnalysis {
  candidate_id: string;
  name: string;
  job_title: string;
  matched_skills: string[];
  missing_skills: string[];
  match_percentage: number;
  learning_recommendations: string[];
}

export interface ResumeScore {
  score: number;
  rating: string;
  summary: string;
  suggestions: string[];
  breakdown: {
    skills: number;
    experience: number;
    certifications: number;
    education: number;
  };
}

export interface TalentAnalytics {
  total_candidates: number;
  average_experience: number;
  top_skills: { skill: string; count: number }[];
  education_distribution: { [key: string]: number };
  experience_distribution: { [key: string]: number };
  certification_distribution: { [key: string]: number };
  hiring_readiness_metrics: { [key: string]: number };
}
