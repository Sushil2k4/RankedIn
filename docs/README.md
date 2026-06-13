# RankedIn: AI-Powered Resume Ranking & Job Match Engine

Developed for the **Samsung Innovation Campus (SIC) Hackathon**, **RankedIn** is a full-stack automated recruitment and candidate-vetting platform. Unlike visual-only keyword screeners, RankedIn evaluates technical candidates objectively by utilizing structured mathematical alignment scores, manual $O(N \log N)$ Stable Merge Sort, $O(1)$ Inverted Index Hash Lookups, and $O(\log N)$ Binary Experience Filters over locally persisted records.

---

## 👥 Our Team
* **Sushil Kumar Mishra**
* **Achintya Dwivedi**
* **Gautam Prasad Upadhyay**

---

## 🚀 Key Features Demonstrated

### 🏛️ Program Architecture & OOP Models
Each candidate profile and job opening is governed by explicit typed constructors (`Candidate` and `Job` models), maintaining runtime data validation, sanitizing incoming values, and ensuring secure file synchronization.

### 🧮 Objective Vetting Mathematics
The candidate alignment scoring formula matches our recruitment specifications:
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
* **Merge Sort Ranking ($O(N \log N)$ Stable)**: Divides candidate matrices into recursive binary split blocks. Ensures deterministic stable alignments under leaderboard rankings.
* **Inverted Index Hashing ($O(1)$ Average)**: Maps skills keywords into mapped index hashes, returning matched candidate ID lists in constant sub-linear periods.
* **Binary Search experience lower-bounds ($O(\log N)$)**: Maps range filters on sorted subsets.

### 🤖 Gemini AI Structured Parsing
Integrates the `gemini-3.5-flash` model utilizing constrained schema responses, mapping unstructured text resumes directly into validated structures. Falls back gracefully to a robust, regex-pattern matched compiler in air-gapped systems.

---

## 📂 Project Structure

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

## 🛠️ Instructions for Running the Application

### Option A: Interacting with the Premium React SaaS Dashboard
1. **Install Dependencies**
   ```bash
   npm install
   ```
2. **Start the Web App (Server + Frontend Middleware)**
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option B: Testing Interactive Python CLI Controller
1. Run the script:
   ```bash
   python app.py
   ```
2. Follow the user prompts to parse resumes, rank applicants, trigger skill searches, inspect metrics, or save data updates directly.
