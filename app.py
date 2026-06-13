#!/usr/bin/env python3
"""
app.py - Main Python App CLI Entrypoint for RankedIn.
Provides a robust, menu-driven command line interface to interact with candidates and jobs.
Connects OOP models, DSA Search hashes / splits, and mathematical algorithms seamlessly.
"""

import sys
from src.models.candidate import Candidate
from src.models.job import Job
from src.services.storage import (
    load_candidates_from_csv,
    save_candidates_to_csv,
    load_jobs_from_csv,
    save_jobs_to_csv,
    save_rankings_to_json,
    load_rankings_from_json
)
from src.services.ranking import rank_candidates
from src.services.search import SearchIndex
from src.services.analytics import generate_talent_analytics
from src.services.skill_gap import analyze_skill_gap
from src.services.recommender import recommend_jobs_for_candidate
from src.services.resume_score import evaluate_resume_strength

# Load working datasets on boot
candidates_db = load_candidates_from_csv()
jobs_db = load_jobs_from_csv()

def print_banner():
    """Prints a premium ASCII welcome banner."""
    print("\n" + "="*60)
    print("      ____                  __            __  ____      ")
    print("     / __ \\____ _____  / /_____  ____/ / /  _/___  ")
    print("    / /_/ / __ `/ __ \\/ //_/ _ \\/ __  / /  / / __ \ ")
    print("   / _, _/ /_/ / / / / ,< /  __/ /_/ / / _/ / / / / ")
    print("  /_/ |_|\\__,_/_/ /_/_/|_|\\___/\\__,_/_/ /___/_/ /_/  ")
    print("                                                    ")
    print("       AI-Powered Resume Ranking & Matching Engine")
    print("="*60)

def display_menu():
    """Prints actionable menu options for the interactive CLI."""
    print("\n[MAIN CONTROL PANEL]")
    print("1. Add Candidate Profile (Interactive)")
    print("2. Add Job Opening Criteria")
    print("3. Rank Applicants for a Job (Merge Sort)")
    print("4. Find Candidates (Inverted Hash Index & Binary Search)")
    print("5. Generate Talent Pool Analytics (Pandas stats)")
    print("6. Show Single Candidate Full Suite (Skill Gap, Resume Score, Recommendations)")
    print("7. Save Databases (Overwrite CSV)")
    print("8. Exit Engine")
    print("-" * 60)

def add_candidate_flow():
    """Interactive console flow to create and validate a new Candidate."""
    print("\n--- Add Candidate Profile ---")
    try:
        cand_id = input("Enter Candidate ID (e.g. CANT021): ").strip()
        if not cand_id:
            print("❌ Candidate ID cannot be empty.")
            return
            
        # Check uniqueness
        if any(c.candidate_id == cand_id for c in candidates_db):
            print("❌ Candidate ID already exists in system.")
            return
            
        name = input("Enter Candidate Full Name: ").strip()
        if not name:
            print("❌ Candidate name cannot be empty.")
            return
            
        education = input("Enter Education Details (e.g., M.S. in Computer Science): ").strip()
        skills = input("Enter Skills (separated by semicolon, e.g. Python;SQL;AWS): ").strip()
        
        while True:
            exp_str = input("Enter Years of Professional Experience: ").strip()
            try:
                experience = float(exp_str)
                if experience < 0:
                    print("Experience cannot be negative.")
                    continue
                break
            except ValueError:
                print("Invalid number format. Please enter a valid decimal/integer.")
                
        certifications = input("Enter Certifications (separated by semicolon, or None): ").strip()
        
        new_cand = Candidate(
            candidate_id=cand_id,
            name=name,
            education=education,
            skills=skills,
            experience=experience,
            certifications=certifications
        )
        
        candidates_db.append(new_cand)
        print(f"✅ Secure Candidate profile verified and cached: {new_cand.name}")
    except ValueError as val_e:
        print(f"❌ Structural Validation Error: {val_e}")
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")

def add_job_flow():
    """Interactive console flow to input a Job Listing."""
    print("\n--- Add Job Opening ---")
    try:
        job_id = input("Enter Job ID (e.g. JOB06): ").strip()
        if not job_id:
            print("❌ Job ID cannot be empty.")
            return
            
        if any(j.job_id == job_id for j in jobs_db):
            print("❌ Job ID already exists.")
            return
            
        title = input("Enter Job Title: ").strip()
        required_skills = input("Enter Required Skills (semicolon-separated): ").strip()
        
        while True:
            exp_str = input("Enter Minimum Required Experience: ").strip()
            try:
                min_exp = float(exp_str)
                if min_exp < 0:
                    print("Experience threshold cannot be negative.")
                    continue
                break
            except ValueError:
                print("Invalid number. Please enter a non-negative number.")
                
        pref_edu = input("Preferred Educational Degree (e.g. B.S. in Computer Science): ").strip()
        
        new_job = Job(
            job_id=job_id,
            title=title,
            required_skills=required_skills,
            minimum_experience=min_exp,
            preferred_education=pref_edu
        )
        
        jobs_db.append(new_job)
        print(f"✅ Job Opening listed and cached successfully: {new_job.title}")
    except ValueError as val_e:
        print(f"❌ Input format validation failed: {val_e}")

def rank_flow():
    """Applies Merge Sort algorithm to candidates matching standard Job metrics."""
    print("\n--- Rank Applicants (Manual Merge Sort) ---")
    if not candidates_db:
        print("❌ Cannot rank: no candidates in the talent pool.")
        return
    if not jobs_db:
        print("❌ Cannot rank: no active jobs to match against.")
        return
        
    print("Available Job Openings:")
    for idx, job in enumerate(jobs_db, start=1):
        print(f" [{idx}] {job.title} (ID: {job.job_id})")
        
    choice = input("\nSelect Job Index to rank for: ").strip()
    try:
        val = int(choice)
        if val < 1 or val > len(jobs_db):
            print("❌ Invalid selection index.")
            return
        selected_job = jobs_db[val - 1]
    except ValueError:
        print("❌ Please enter a valid number.")
        return
        
    print(f"\nSorting and Ranking {len(candidates_db)} candidates against '{selected_job.title}'...")
    leaderboard = rank_candidates(candidates_db, selected_job)
    
    print("\n" + "="*70)
    print(f"RANK LEADBOARD FOR: {selected_job.title} ({selected_job.job_id})")
    print("="*70)
    print(f"{'Rank':<5} | {'Cand ID':<8} | {'Candidate Name':<20} | {'Align Score':<12} | {'Education Aligned'}")
    print("-" * 70)
    for row in leaderboard:
        details = row["match_details"]
        edu_status = "Aligned" if details["education_aligned"] else "Discrepancy"
        print(f"#{row['rank']:<4} | {row['candidate_id']:<8} | {row['name']:<20} | {details['score']}%{'':<6} | {edu_status}")
    print("="*70)
    
    # Save rankings calculations to rankings.json automatically
    try:
        save_rankings_to_json({
            "job_id": selected_job.job_id,
            "job_title": selected_job.title,
            "ranks": [{
                "rank": r["rank"],
                "candidate_id": r["candidate_id"],
                "name": r["name"],
                "score": r["match_details"]["score"]
            } for r in leaderboard]
        })
        print("💾 Leaderboard matrix stored successfully in data/rankings.json!")
    except Exception as e:
        print(f"⚠️ Failed to cache ranking JSON: {e}")

def search_flow():
    """Locates candidates efficiently combining dictionary lookups and binary split sorting."""
    print("\n--- Direct Candidate Search (DSA Hashing & Binary Range) ---")
    if not candidates_db:
        print("❌ Talent pool is currently empty.")
        return
        
    skill_query = input("Filter by Skill (Hit Enter to skip, e.g. Python): ").strip()
    edu_query = input("Filter by Education Landmark Keyword (Hit Enter to skip, e.g. PhD): ").strip()
    exp_query = input("Filter by Minimum Years of Experience (Hit Enter to skip): ").strip()
    
    min_exp = 0.0
    if exp_query:
        try:
            min_exp = float(exp_query)
        except ValueError:
            print("⚠️ Invalid experience input, skipping numerical filters.")
            
    # Load into Search Index (inverted indices build automatically)
    index = SearchIndex(candidates_db)
    results = index.search_candidates(skill=skill_query, min_exp=min_exp, education_token=edu_query)
    
    print(f"\nFound {len(results)} candidate(s) matching your specs:")
    print("-" * 65)
    for c in results:
        print(f"▸ [{c.candidate_id}] {c.name}")
        print(f"  Exp: {c.experience} yrs | Edu: {c.education}")
        print(f"  Skills: {', '.join(c.skills[:5])}")
        print("-" * 65)

def analytics_flow():
    """Summarizes overall datasets trends using Pandas aggregates."""
    print("\n--- Talent Pool Aggregation Analytics ---")
    stats = generate_talent_analytics(candidates_db)
    print(f"Total Profiles Indexed:        {stats['total_candidates']}")
    print(f"Average Industry Experience:   {stats['average_experience']} years")
    
    print("\nTop 5 Demanded Skills Count:")
    for skill_info in stats["top_skills"][:5]:
        print(f" • {skill_info['skill']}: {skill_info['count']}")
        
    print("\nEducation Distribution:")
    for k, v in stats["education_distribution"].items():
        print(f" • {k}: {v}")
        
    print("\nHiring Readiness metrics:")
    for k, v in stats["hiring_readiness_metrics"].items():
        print(f" • {k}: {v}")

def single_candidate_full_report():
    """Generates the resume score, recommendations and skill gap for a single candidate."""
    print("\n--- Single Candidate Full Audit Report ---")
    if not candidates_db:
        print("❌ No candidates in system.")
        return
        
    # Search for candidate
    cand_id = input("Enter Candidate ID (e.g., CANT001): ").strip()
    selected_cand = next((c for c in candidates_db if c.candidate_id.upper() == cand_id.upper()), None)
    
    if not selected_cand:
        print("❌ Candidate profile not found.")
        return
        
    # 1. Resume Strength Score
    resume_details = evaluate_resume_strength(selected_cand)
    print("\n=============================================")
    print(f"🏆 RESUME STRENGTH EVALUATION: {selected_cand.name}")
    print("=============================================")
    print(f"Structure Strength Score: {resume_details['score']}/100")
    print(f"Talent Rating Categorization: {resume_details['rating']}")
    print(f"Core Critique Summary: {resume_details['summary']}")
    print("\nActionable Improvement Suggestions:")
    for sug in resume_details["suggestions"]:
        print(f" ▸ {sug}")
        
    # 2. Recommended Jobs (and skill-gapping on top option)
    if jobs_db:
        job_recs = recommend_jobs_for_candidate(selected_cand, jobs_db)
        print("\n=============================================")
        print("🎯 RELEVANT JOB OPENINGS RANKED IN ENGINE")
        print("=============================================")
        top_rec_job = None
        for i, rec in enumerate(job_recs, start=1):
            if i == 1:
                # Get the core job model of the top recommendation to do a skill gap analysis
                top_rec_job = next((j for j in jobs_db if j.job_id == rec["job_id"]), None)
            print(f"#{i} [{rec['score']}% Fit] - {rec['title']} (Min Exp: {rec['minimum_experience']} yrs)")
            print(f"   Reasoning: {rec['reasoning']}")
            
        if top_rec_job:
            gap = analyze_skill_gap(selected_cand, top_rec_job)
            print("\n=============================================")
            print(f"🛠️ TARGETED SKILL GAP FOR: {top_rec_job.title}")
            print("=============================================")
            print(f"Matched Skills: {', '.join(gap['matched_skills']) if gap['matched_skills'] else 'None'}")
            print(f"Missing Tech:   {', '.join(gap['missing_skills']) if gap['missing_skills'] else 'None'}")
            print("\nLearning Recommendations Pathway:")
            for learn in gap["learning_recommendations"]:
                print(f" ✔ {learn}")
    print("=============================================")

def save_databases():
    """Saves all run changes."""
    print("\n--- Syncing operational datasets to CSV/JSON ---")
    try:
        save_candidates_to_csv(candidates_db)
        save_jobs_to_csv(jobs_db)
        print("💾 Progress saved and synchronized to CSV databases!")
    except Exception as e:
        print(f"❌ Storage output failure: {e}")

def main():
    """Application CLI event loop."""
    print_banner()
    while True:
        display_menu()
        choice = input("Enter option [1-8]: ").strip()
        if choice == "1":
            add_candidate_flow()
        elif choice == "2":
            add_job_flow()
        elif choice == "3":
            rank_flow()
        elif choice == "4":
            search_flow()
        elif choice == "5":
            analytics_flow()
        elif choice == "6":
            single_candidate_full_report()
        elif choice == "7":
            save_databases()
        elif choice == "8":
            # Save before termination safeguard
            save_databases()
            print("\nShutting down engine. Thank you for utilizing RankedIn. Happy recruiting!")
            sys.exit(0)
        else:
            print("❌ Invalid menu choice. Please select from codes [1-8].")

if __name__ == "__main__":
    main()
