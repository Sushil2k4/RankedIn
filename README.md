# RankedIn: AI-Powered Resume Ranking & Job Match Engine

Developed for the **Samsung Innovation Campus (SIC) Hackathon**, **RankedIn** is a full-stack automated recruitment and candidate-vetting platform. Unlike visual-only keyword screeners, RankedIn evaluates technical candidates objectively by utilizing structured mathematical alignment scores, manual $O(N \log N)$ Stable Merge Sort, $O(1)$ Inverted Index Hash Lookups, and $O(\log N)$ Binary Experience Filters over locally persisted records.

---

## 👥 Hackathon Team Members & Individual Contributions

Our project represents a collaborative effort with distinct areas of ownership. Below is the breakdown of responsibilities and individual module contributions:

### 🛠️ Sushil Kumar Mishra — Full-Stack Architecture, API Integration & Synchronization
* **Express API backend (`server.ts`)**: Built and configured the Express application routing, middleware, and request/response pipelines.
* **Database & File Synchronization**: Implemented local CSV storage sync logic to read and write records to `data/candidates.csv` and `data/jobs.csv` with safe formatting and error boundaries.
* **Dashboard Client Integration (`src/App.tsx`)**: Configured the frontend-to-backend communication layer, enabling real-time UI state refreshes from server responses.
* **Serverless Deployment configuration**: Set up and configured `vercel.json` routing rewrites and `api/index.ts` adapters for serverless deployment.

### 🤖 Achintya Dwivedi — Artificial Intelligence Services, UI Features & Parsers
* **Gemini AI Integration**: Coded the `gemini-3.5-flash` client SDK calls in `server.ts` using structured parsing JSON schemas to extract developer details.
* **Heuristic Parser Fallback**: Developed the regular expression parser and string compiler fallback mechanisms to process resumes in offline/air-gapped systems.
* **Dashboard Visual Elements**: Implemented interactive React views, including the **Extract Resume** interface (`src/components/UploadView.tsx`) and the SVG distributions dashboard (**Talent Analytics** widget at `src/components/AnalyticsView.tsx`).

### 🧮 Gautam Prasad Upadhyay — Algorithmic Logic, Vetting Models & Core Mathematics
* **Custom Algorithms & Data Structures**: Hand-crafted the core algorithms from scratch to prove technical depth:
  * **Stable Merge Sort ($O(N \log N)$)**: Written manually to rank candidate score matrices deterministically without native sort instability (`src/services/ranking.py`).
  * **Inverted Index Hashing ($O(1)$)**: Programmed skills inverted hashing maps for instant filter operations.
  * **Binary Search ($O(\log N)$)**: Coded the experience years lower-bound quick-finder.
* **Alignment Math & Vetting**: Formulated the weighted HR scoring models (Skills 70%, Experience 20%, Education 10%).
* **Feature Services**: Implemented the standalone **Skill Gap Analysis** courses suggester (`src/services/skill_gap.py`) and **Resume Structural Strength Evaluator** (`src/services/resume_score.py`).

---

## 🔗 How it all Integrates (Symmetry & Flow)
RankedIn behaves as a single cohesive unit:
1. **Frontend Trigger**: The React frontend (`App.tsx`) triggers requests based on user actions (e.g., inputting a resume, selecting a job, or setting search filters).
2. **API Delegation**: The Express API router (`server.ts`) captures the action and directs it to the appropriate subsystem:
   - Resumes go through **Achintya's AI/Regex parsing engine**.
   - Filtering operations invoke **Gautam's Inverted Index & Binary Search services**.
   - Profile sorting redirects into **Gautam's Merge Sort service**.
3. **Data Sync**: Read and write transactions are synchronized against the CSV/JSON data files using **Sushil's storage routines**, keeping the data pool and CLI console inputs aligned in real time.

---

---
## 🌐 Live Demo
[Visit the RankedIn Platform](https://ranked-in.vercel.app/)
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
