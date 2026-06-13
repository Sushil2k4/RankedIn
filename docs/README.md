# RankedIn: AI-Powered Resume Ranking & Job Match Engine

RankedIn is a full-stack automated recruitment and candidate-vetting platform designed specifically for the SIC Hackathon. Unlike visual-only keyword keyword screeners, RankedIn evaluates technical candidates objectively by utilizing structured mathematical alignment scores, manual O(N log N) Stable Merge Sort, O(1) Inverted Index Hash Lookups, and O(log N) Binary Experience Filters over locally persisted records.

---

## 🚀 Key Features Demonstrated

### 🏛️ Program Architecture & OOP Models
Each candidate profile and job opening is governed by explicit typed constructors (`Candidate` and `Job` models), maintaining runtime data validation, sanitizing incoming values, and ensuring secure file synchronization.

### 🧮 Objective Vetting Mathematics
The candidate alignment scoring formula matches your recruitment specifications exactly:
1. **Skills Alignment (70%)**  
   $$\text{Skills Contribution} = \left( \frac{\text{Skills Matched}}{\text{Required Skills}} \right) \times 70.0$$
2. **Experience Suitability (20%)**  
   $$\text{Experience Contribution} = \min\left(1.0, \frac{\text{Candidate Experience}}{\text{Job Min Experience}}\right) \times 20.0$$
3. **Education Alignment (10%)**  
   Education is mapped to numeric weight ranks:
   - `PhD` / `Doctor` = 4
   - `Master` = 3
   - `Bachelor` = 2
   - `High School` = 1
   - `None` = 0  
   
   If $\text{Candidate Level} \ge \text{Preferred Level}$, score is **10.0**. If $\text{Candidate Level} = \text{Preferred Level} - 1$, score is **5.0**. Otherwise, **0.0**.

### 🧬 Manual Data Structures & Algorithms (Bilingual Symmetry)
RankedIn bypasses native library wrappers to guarantee technical depth of manual implementations:
* **Merge Sort Ranking ($O(N \log N)$ Stable)**: Dividers candidate matrices into recursive binary split blocks. Ensures deterministic stable alignments under leaderboard rankings.
* **Inverted Index Hashing ($O(1)$ Average)**: Maps skills keywords into mapped index hashes, returning matched candidate ID lists in constant sub-linear periods.
* **Binary Search experience lower-bounds ($O(\log N)$)**: Maps range filters on sorted subsets.

### 🤖 Gemini AI Structured Parsing
Integrates the `gemini-3.5-flash` model utilizing constrained schema responses, mapping unstructured text resumes directly into validated structures. Falling back gracefully to a robust, regex-pattern matched compiler in air-gapped systems.

---

## 📂 Project Structures

```
├── data/
│   ├── candidates.csv       # 20+ realistic compiled engineering applicants
│   ├── jobs.csv             # Target vacancies specification requirements
│   └── rankings.json        # Persistent manual rankings logging
├── src/
│   ├── models/
│   │   ├── candidate.py     # Python Candidate OOP class with file validation
│   │   └── job.py           # Python Job OOP specification model
│   ├── services/
│   │   ├── parser.py        # Python resume text regex matching engine 
│   │   ├── matcher.py       # Candidate matching weighting score logic
│   │   ├── ranking.py       # Manual stable Merge Sort array system
│   │   ├── search.py        # Hash Index mapping + Binary search years experience
│   │   ├── storage.py       # CSV and JSON robust IO persistence handles
│   │   ├── analytics.py     # Aggregated Pandas math calculators data
│   │   ├── skill_gap.py     # Skill gap analysis with training recommended courses
│   │   ├── recommender.py   # Job recommendation matching engine
│   │   └── resume_score.py  # Resume structural layout health evaluator
│   └── App.tsx              # React SaaS master dashboard interface
├── app.py                   # Python menu-driven CLI interactive app controller
├── server.ts                # Custom full-stack Express server API route entries
└── package.json             # Build configuration scripts
```

---

## 🛠️ Instructions for Running Applications

### Option A: Testing Interactive Python CLI Controller
1. Open up your terminal environment and run:
   ```bash
   python app.py
   ```
2. Navigate user prompts to parse resumes, rank applicants, trigger skill searches, inspect metrics, or save data updates directly.

### Option B: Interacting with the Premium React SaaS Dashboard
1. The app compiles and serves on port `3000` behind the reverse-proxy.
2. The UI features:
   - **Dashboard Home**: Explores live synced KPIs and navigation prompts.
   - **Extract Resume**: Input raw resumes to dry-run extraction with Gemini AI or Regex fallbacks. Preview profile drafts before saving them back into `candidates.csv`.
   - **Candidates / Jobs Database**: Interactive tabular grids supporting searching, inline sorting, and manual additions.
   - **Candidate Ranking**: Highlight core profiles based on Merge Sort arrays.
   - **Indexed Search**: Test logarithmic search limits first-hand.
   - **Talent Analytics**: High fidelity SVG charting of data distributions in professional glassmorphic widgets.
   - **Skill Gaps and Recommendor modules**: Pinpoints path courses based on vacancy offsets.
