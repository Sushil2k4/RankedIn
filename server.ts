/**
 * server.ts - Full-stack custom Express controller for RankedIn.
 * Implements real-time CSV/JSON storage syncing, AI Parsing via Gemini,
 * manual Merge Sort algorithms, Binary Search, and inverted indexing.
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client if key exists
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Data structures
interface CandidateData {
  candidate_id: string;
  name: string;
  education: string;
  skills: string[];
  experience: number;
  certifications: string[];
}

interface JobData {
  job_id: string;
  title: string;
  required_skills: string[];
  minimum_experience: number;
  preferred_education: string;
}

const CANDIDATES_FILE = path.join(process.cwd(), "data/candidates.csv");
const JOBS_FILE = path.join(process.cwd(), "data/jobs.csv");
const RANKINGS_FILE = path.join(process.cwd(), "data/rankings.json");

// Helper to ensure data dir exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// TS Custom CSV Loader
function loadCandidates(): CandidateData[] {
  ensureDataDir();
  if (!fs.existsSync(CANDIDATES_FILE)) return [];
  try {
    const csvContent = fs.readFileSync(CANDIDATES_FILE, "utf-8");
    const lines = csvContent.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length <= 1) return [];

    const headers = lines[0].split(",").map(h => h.trim());
    const candidates: CandidateData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values: string[] = [];
      let insideQuote = false;
      let currentVal = "";

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"' || char === "'") {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          values.push(currentVal.trim());
          currentVal = "";
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim());

      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || "";
      });

      // Standardize lists and numeric fields
      if (row.candidate_id && row.name) {
        candidates.push({
          candidate_id: row.candidate_id,
          name: row.name,
          education: row.education || "Unknown",
          skills: row.skills ? row.skills.split(";").map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [],
          experience: isNaN(parseFloat(row.experience)) ? 0.0 : parseFloat(row.experience),
          certifications: (!row.certifications || row.certifications.toLowerCase() === "none" || row.certifications.toLowerCase() === "null")
            ? []
            : row.certifications.split(";").map((c: string) => c.trim()).filter((c: string) => c.length > 0)
        });
      }
    }
    return candidates;
  } catch (err) {
    console.error("Error reading candidates CSV in TS:", err);
    return [];
  }
}

function loadJobs(): JobData[] {
  ensureDataDir();
  if (!fs.existsSync(JOBS_FILE)) return [];
  try {
    const csvContent = fs.readFileSync(JOBS_FILE, "utf-8");
    const lines = csvContent.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length <= 1) return [];

    const headers = lines[0].split(",").map(h => h.trim());
    const jobs: JobData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values: string[] = [];
      let insideQuote = false;
      let currentVal = "";

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"' || char === "'") {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          values.push(currentVal.trim());
          currentVal = "";
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim());

      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || "";
      });

      if (row.job_id && row.title) {
        jobs.push({
          job_id: row.job_id,
          title: row.title,
          required_skills: row.required_skills ? row.required_skills.split(";").map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [],
          minimum_experience: isNaN(parseFloat(row.minimum_experience)) ? 0.0 : parseFloat(row.minimum_experience),
          preferred_education: row.preferred_education || "Any"
        });
      }
    }
    return jobs;
  } catch (err) {
    console.error("Error loading jobs CSV in TS Server:", err);
    return [];
  }
}

// Saving helpers
function saveCandidates(candidates: CandidateData[]) {
  ensureDataDir();
  const header = "candidate_id,name,education,skills,experience,certifications\n";
  const escapeCsv = (str: string) => {
    if (str.includes(",") || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const rows = candidates.map(c => {
    return `${c.candidate_id},${escapeCsv(c.name)},${escapeCsv(c.education)},${escapeCsv(c.skills.join(";"))},${c.experience},${escapeCsv(c.certifications.length > 0 ? c.certifications.join(";") : "None")}`;
  }).join("\n");
  fs.writeFileSync(CANDIDATES_FILE, header + rows, "utf-8");
}

function saveJobs(jobs: JobData[]) {
  ensureDataDir();
  const header = "job_id,title,required_skills,minimum_experience,preferred_education\n";
  const escapeCsv = (str: string) => {
    if (str.includes(",") || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const rows = jobs.map(j => {
    return `${j.job_id},${escapeCsv(j.title)},${escapeCsv(j.required_skills.join(";"))},${j.minimum_experience},${escapeCsv(j.preferred_education)}`;
  }).join("\n");
  fs.writeFileSync(JOBS_FILE, header + rows, "utf-8");
}

// HR Math Alignment Logic
function getEducLevelInt(edu: string): number {
  const t = edu.toLowerCase();
  if (t.includes("phd") || t.includes("ph.d.") || t.includes("doctor")) return 4;
  if (t.includes("master") || t.includes("m.s.") || t.includes("m.b.a.") || t.includes("m.tech") || t.includes("msc")) return 3;
  if (t.includes("bachelor") || t.includes("b.s.") || t.includes("b.tech") || t.includes("b.a.") || t.includes("undergrad")) return 2;
  if (t.includes("high school") || t.includes("diploma") || t.includes("associate")) return 1;
  return 0;
}

function evaluateCandidateMatch(cand: CandidateData, job: JobData) {
  // 1. Skills alignment (70%)
  const reqSkills = job.required_skills.map(s => s.toLowerCase().trim());
  const candSkills = cand.skills.map(s => s.toLowerCase().trim());

  const matched = reqSkills.filter(s => candSkills.includes(s));
  const missing = reqSkills.filter(s => !candSkills.includes(s));

  // Capitalize properly using job specifications
  const matchedSkillsLabel = job.required_skills.filter(s => matched.includes(s.toLowerCase().trim()));
  const missingSkillsLabel = job.required_skills.filter(s => missing.includes(s.toLowerCase().trim()));

  const skillsPct = reqSkills.length > 0 ? matched.length / reqSkills.length : 1.0;
  const skillsScore = skillsPct * 70.0;

  // 2. Experience alignment (20%)
  let expScore = 20.0;
  let shortfall = 0.0;
  if (job.minimum_experience > 0) {
    const ratio = Math.min(1.0, cand.experience / job.minimum_experience);
    expScore = ratio * 20.0;
    shortfall = Math.max(0, job.minimum_experience - cand.experience);
  }

  // 3. Education alignment (10%)
  const candLvl = getEducLevelInt(cand.education);
  const jobLvl = getEducLevelInt(job.preferred_education);

  let eduScore = 0.0;
  let eduAligned = false;
  if (candLvl >= jobLvl) {
    eduScore = 10.0;
    eduAligned = true;
  } else if (candLvl === jobLvl - 1) {
    eduScore = 5.0;
    eduAligned = false;
  }

  const totalScore = parseFloat((skillsScore + expScore + eduScore).toFixed(1));

  return {
    score: totalScore,
    matched_skills: matchedSkillsLabel,
    missing_skills: missingSkillsLabel,
    skills_alignment_pct: parseFloat((skillsPct * 100).toFixed(1)),
    experience_shortfall_yrs: parseFloat(shortfall.toFixed(1)),
    education_aligned: eduAligned,
    breakdown: {
      skills_contrib: parseFloat(skillsScore.toFixed(1)),
      experience_contrib: parseFloat(expScore.toFixed(1)),
      education_contrib: parseFloat(eduScore.toFixed(1))
    }
  };
}

// Manual Merge Sort in TS (matches ranking.py)
function mergeSort(arr: any[]): any[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left: any[], right: any[]): any[] {
  const merged: any[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i].match_details.score >= right[j].match_details.score) {
      merged.push(left[i]);
      i++;
    } else {
      merged.push(right[j]);
      j++;
    }
  }
  return merged.concat(left.slice(i)).concat(right.slice(j));
}

// Fallback Regex parser in JS (mirrors parser.py)
function fallbackRegexParser(text: string): Omit<CandidateData, "candidate_id"> {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) {
    return { name: "Unknown", education: "None", skills: [], experience: 0.0, certifications: [] };
  }

  // 1. Extract Name
  let name = "Unknown Candidate";
  for (const line of lines.slice(0, 3)) {
    if (line.length < 30 && !/[@:/\\0-9]/.test(line) && !line.toLowerCase().startsWith("resume") && !line.toLowerCase().startsWith("curriculum")) {
      name = line;
      break;
    }
  }

  // 2. Extract Skills
  const skillDb = ["Python", "Java", "JavaScript", "C++", "SQL", "React", "Node.js", "Git", "Docker", "AWS", "Machine Learning", "Data Analysis", "Pandas", "NumPy", "Streamlit", "HTML", "CSS", "TypeScript", "Kubernetes", "Spring Boot", "TensorFlow", "PyTorch", "R", "Tableau", "APIs", "NoSQL"];
  const foundSkills: string[] = [];
  skillDb.forEach(skill => {
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(text) || (skill === "C++" && text.toLowerCase().includes("c++"))) {
      foundSkills.push(skill);
    }
  });

  // 3. Extract Education
  let education = "B.S. in Computer Science";
  const eduKeywords = ["B.S.", "Bachelor", "B.Tech", "M.S.", "Master", "M.Tech", "PhD", "Ph.D.", "B.A.", "M.B.A.", "High School"];
  const eduLines = lines.filter(l => eduKeywords.some(k => l.toLowerCase().includes(k.toLowerCase())) || l.toLowerCase().includes("university") || l.toLowerCase().includes("college"));
  if (eduLines.length > 0) {
    for (const landmark of ["PhD", "Ph.D.", "Master", "M.S.", "M.B.A.", "Bachelor", "B.S."]) {
      const matchLine = eduLines.find(el => el.toLowerCase().includes(landmark.toLowerCase()));
      if (matchLine) {
        let clean = matchLine;
        if (clean.includes(":")) clean = clean.split(":").pop() || "";
        education = clean.trim().slice(0, 60);
        break;
      }
    }
  }

  // 4. Extract Experience
  let experience = 0.0;
  const expMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\b/i);
  if (expMatch) {
    experience = parseFloat(expMatch[1]) || 0.0;
  } else {
    // try counting dates
    const dateMatches = Array.from(text.matchAll(/\b(20\d{2})\s*[-–—]\s*(20\d|Present)\b/ig));
    let yrsSum = 0;
    dateMatches.forEach(m => {
      const start = parseInt(m[1]);
      const endStr = m[2].toLowerCase();
      const end = endStr === "present" ? 2026 : (parseInt(endStr) || 2026);
      yrsSum += Math.max(0, end - start);
    });
    if (yrsSum > 0) {
      experience = Math.min(15.0, yrsSum);
    }
  }

  // 5. Extract Certifications
  const certs: string[] = [];
  const certPatterns = [/AWS Certified/i, /Certified Kubernetes/i, /Google \w+ Professional/i, /CompTIA/i, /Oracle Certified/i, /UX Design/i, /Meta Front-End/i];
  certPatterns.forEach(pat => {
    const m = text.match(pat);
    if (m) certs.push(m[0].trim());
  });

  return {
    name,
    education,
    skills: foundSkills,
    experience,
    certifications: certs.length > 0 ? certs : ["None"]
  };
}

// Binary search implementation over experience
function binarySearchExperienceLowerBound(sortedCands: CandidateData[], targetVal: number): number {
  let low = 0;
  let high = sortedCands.length - 1;
  let boundaryIdx = sortedCands.length;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (sortedCands[mid].experience >= targetVal) {
      boundaryIdx = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return boundaryIdx;
}

// Express endpoints
// 1. Get raw candidate pool data
app.get("/api/candidates", (req, res) => {
  res.json(loadCandidates());
});

// Create candidate manually
app.post("/api/candidates", (req, res) => {
  const { candidate_id, name, education, skills, experience, certifications } = req.body;
  if (!candidate_id || !name) {
    return res.status(400).json({ error: "Candidate ID and name is required." });
  }

  const list = loadCandidates();
  if (list.some(c => c.candidate_id === candidate_id)) {
    return res.status(400).json({ error: "Candidate ID already exists." });
  }

  const newCand: CandidateData = {
    candidate_id,
    name,
    education: education || "Unknown",
    skills: Array.isArray(skills) ? skills : typeof skills === "string" ? skills.split(";").map(s => s.trim()).filter(Boolean) : [],
    experience: typeof experience === "number" ? experience : parseFloat(experience) || 0,
    certifications: Array.isArray(certifications) ? certifications : typeof certifications === "string" ? certifications.split(";").map(c => c.trim()).filter(Boolean) : []
  };

  list.push(newCand);
  saveCandidates(list);
  res.json({ success: true, candidate: newCand });
});

// 2. Get active job openings
app.get("/api/jobs", (req, res) => {
  res.json(loadJobs());
});

// Create Job manually
app.post("/api/jobs", (req, res) => {
  const { job_id, title, required_skills, minimum_experience, preferred_education } = req.body;
  if (!job_id || !title) {
    return res.status(400).json({ error: "Job ID and title is required." });
  }

  const list = loadJobs();
  if (list.some(j => j.job_id === job_id)) {
    return res.status(400).json({ error: "Job ID already exists." });
  }

  const newJob: JobData = {
    job_id,
    title,
    required_skills: Array.isArray(required_skills) ? required_skills : typeof required_skills === "string" ? required_skills.split(";").map(s => s.trim()).filter(Boolean) : [],
    minimum_experience: typeof minimum_experience === "number" ? minimum_experience : parseFloat(minimum_experience) || 0,
    preferred_education: preferred_education || "Any"
  };

  list.push(newJob);
  saveJobs(list);
  res.json({ success: true, job: newJob });
});

// 3. Match candidate to job
app.get("/api/match", (req, res) => {
  const { candidate_id, job_id } = req.query;
  const cands = loadCandidates();
  const jobs = loadJobs();

  const cand = cands.find(c => c.candidate_id === candidate_id);
  const job = jobs.find(j => j.job_id === job_id);

  if (!cand || !job) {
    return res.status(404).json({ error: "Candidate or job not found." });
  }

  res.json(evaluateCandidateMatch(cand, job));
});

// 4. Rank candidates for a job (Manual Merge Sort)
app.get("/api/rank", (req, res) => {
  const { job_id } = req.query;
  const cands = loadCandidates();
  const jobs = loadJobs();

  const job = jobs.find(j => j.job_id === job_id);
  if (!job) {
    return res.status(404).json({ error: "Job specification criteria not found." });
  }

  if (cands.length === 0) {
    return res.json([]);
  }

  const scoredList = cands.map(c => {
    return {
      candidate_id: c.candidate_id,
      name: c.name,
      education: c.education,
      experience: c.experience,
      skills: c.skills,
      certifications: c.certifications,
      match_details: evaluateCandidateMatch(c, job)
    };
  });

  // Apply manual merge sort
  const sorted = mergeSort(scoredList);
  const leaderboard = sorted.map((item, index) => {
    return {
      rank: index + 1,
      ...item
    };
  });

  // Persist result into rankings.json
  try {
    ensureDataDir();
    fs.writeFileSync(RANKINGS_FILE, JSON.stringify({
      job_id: job.job_id,
      job_title: job.title,
      ranks: leaderboard.map(l => ({ rank: l.rank, candidate_id: l.candidate_id, name: l.name, score: l.match_details.score }))
    }, null, 2));
  } catch (err) {
    console.error("Failed to write rankings JSON on Node server:", err);
  }

  res.json(leaderboard);
});

// 5. Direct search (Inverted Index Hashing & Binary Search)
app.get("/api/search", (req, res) => {
  const { skill, max_exp, min_exp, education_token } = req.query;
  const list = loadCandidates();

  let results = [...list];

  // A. Inverted Skill indexing simulation (O(1) lookups)
  if (skill) {
    const targetSkill = String(skill).toLowerCase().trim();
    // Build inverted index table
    const invertedSkillsTable = new Map<string, Set<string>>();
    list.forEach(c => {
      c.skills.forEach(s => {
        const key = s.toLowerCase().trim();
        if (!invertedSkillsTable.has(key)) {
          invertedSkillsTable.set(key, new Set());
        }
        invertedSkillsTable.get(key)!.add(c.candidate_id);
      });
    });

    const matchingIds = invertedSkillsTable.get(targetSkill) || new Set();
    results = results.filter(c => matchingIds.has(c.candidate_id));
  }

  // B. Education Indexing lookup
  if (education_token) {
    const targetEdu = String(education_token).toLowerCase().trim();
    results = results.filter(c => c.education.toLowerCase().includes(targetEdu));
  }

  // C. Range filtering with Binary Search
  if (min_exp) {
    const minVal = parseFloat(String(min_exp)) || 0;
    // O(N log N) sort candidates in sublist to execute Binary Search
    const sortedSublist = [...results].sort((a,b) => a.experience - b.experience);
    const startIdx = binarySearchExperienceLowerBound(sortedSublist, minVal);
    results = sortedSublist.slice(startIdx);
  }

  res.json(results);
});

// 6. Detailed Talent Pool Statistics (mirrors analytics.py)
app.get("/api/analytics", (req, res) => {
  const cands = loadCandidates();
  if (cands.length === 0) {
    return res.json({
      total_candidates: 0,
      average_experience: 0,
      top_skills: [],
      education_distribution: {},
      experience_distribution: {},
      certification_distribution: {},
      hiring_readiness_metrics: {}
    });
  }

  // A. Avg exp
  const avgExp = cands.reduce((sum, c) => sum + c.experience, 0) / cands.length;

  // B. Top Skills Frequency Hash Map
  const skillsCount: { [key: string]: number } = {};
  cands.forEach(c => {
    c.skills.forEach(s => {
      skillsCount[s] = (skillsCount[s] || 0) + 1;
    });
  });
  const topSkills = Object.keys(skillsCount)
    .map(k => ({ skill: k, count: skillsCount[k] }))
    .sort((a,b) => b.count - a.count)
    .slice(0, 10);

  // C. Education Dist
  const eduCounts: { [key: string]: number } = { "PhD": 0, "Master's": 0, "Bachelor's": 0, "High School": 0, "Other": 0 };
  cands.forEach(c => {
    const txt = c.education.toLowerCase();
    if (txt.includes("phd") || txt.includes("ph.d.") || txt.includes("doctor")) eduCounts["PhD"]++;
    else if (txt.includes("master") || txt.includes("m.s.") || txt.includes("m.b.a.") || txt.includes("m.tech")) eduCounts["Master's"]++;
    else if (txt.includes("bachelor") || txt.includes("b.s.") || txt.includes("b.tech") || txt.includes("b.a.")) eduCounts["Bachelor's"]++;
    else if (txt.includes("high school")) eduCounts["High School"]++;
    else eduCounts["Other"]++;
  });

  // D. Experience Categorization Distribution
  const expCounts: { [key: string]: number } = { "Junior (0-2 yrs)": 0, "Mid-level (2-5 yrs)": 0, "Senior (5-8 yrs)": 0, "Lead (8+ yrs)": 0 };
  cands.forEach(c => {
    if (c.experience < 2) expCounts["Junior (0-2 yrs)"]++;
    else if (c.experience < 5) expCounts["Mid-level (2-5 yrs)"]++;
    else if (c.experience < 8) expCounts["Senior (5-8 yrs)"]++;
    else expCounts["Lead (8+ yrs)"]++;
  });

  // E. Certifications Counts
  const certsCount: { [key: string]: number } = {};
  cands.forEach(c => {
    c.certifications.forEach(cert => {
      certsCount[cert] = (certsCount[cert] || 0) + 1;
    });
  });
  const topCerts: { [key: string]: number } = {};
  Object.keys(certsCount)
    .sort((a,b) => certsCount[b] - certsCount[a])
    .slice(0, 8)
    .forEach(k => {
      topCerts[k] = certsCount[k];
    });

  // F. Readiness Dist
  const readinessCounts = { "Highly Ready (80-100)": 0, "Standard Profile (50-80)": 0, "Needs Upskilling (0-50)": 0 };
  cands.forEach(c => {
    const score = Math.min(100, (c.skills.length * 5) + (c.experience * 8) + 20);
    if (score >= 80) readinessCounts["Highly Ready (80-100)"]++;
    else if (score >= 50) readinessCounts["Standard Profile (50-80)"]++;
    else readinessCounts["Needs Upskilling (0-50)"]++;
  });

  res.json({
    total_candidates: cands.length,
    average_experience: parseFloat(avgExp.toFixed(1)),
    top_skills: topSkills,
    education_distribution: eduCounts,
    experience_distribution: expCounts,
    certification_distribution: topCerts,
    hiring_readiness_metrics: readinessCounts
  });
});

// 7. Resume Processing (GEMINI AI Integration or Regex fallbacks)
app.post("/api/parse-resume", async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 5) {
    return res.status(400).json({ error: "Please enter or paste a valid resume." });
  }

  // Generate a temporary candidate ID
  const tempId = "CANT" + Math.floor(100 + Math.random() * 900);

  // Check if Gemini is configured & provisioned
  if (ai) {
    try {
      console.log("TS Node backend calling Gemini to extract resume...");
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze the following software developer resume text and extract candidate structures. Extract EXACTLY:
        - name: Full name of candidate. If completely blank or unidentifiable, assign 'Unknown Applicant'
        - education: Their highest degree / university title (e.g. Master of Science in Computer Science, University of California)
        - skills: Array of matching core software development technological tags found (e.g. ['Python', 'SQL', 'Docker'])
        - experience: Float number representing the candidate's total numeric years of technical work experience
        - certifications: Array of industry certifications (e.g., ['AWS Certified Architect', 'Scrum Master Cert'])
        
        Resume text to parse:
        ${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              education: { type: Type.STRING },
              skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              experience: { type: Type.NUMBER },
              certifications: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["name", "education", "skills", "experience", "certifications"]
          }
        }
      });

      const extractedText = response.text;
      if (extractedText) {
        const payload = JSON.parse(extractedText.trim());
        const candidate: CandidateData = {
          candidate_id: tempId,
          name: payload.name || "AI Candidate",
          education: payload.education || "B.S. in Software Engineering",
          skills: Array.isArray(payload.skills) ? payload.skills : [],
          experience: isNaN(parseFloat(payload.experience)) ? 0.0 : parseFloat(payload.experience),
          certifications: Array.isArray(payload.certifications) ? payload.certifications : []
        };
        return res.json({ success: true, method: "Gemini AI Parser", candidate });
      }
    } catch (err: any) {
      console.warn("Gemini parsing failed, falling back to local Python-mirrored Regex parser. Error:", err.message);
    }
  }

  // Fallback regex parsing
  const fallbackResult = fallbackRegexParser(text);
  const cand: CandidateData = {
    candidate_id: tempId,
    ...fallbackResult
  };
  res.json({ success: true, method: "Heuristic Regular Expressions Parser", candidate: cand });
});

// 8. Skill Gap Analysis info
app.use("/api/skill-gap", (req, res) => {
  const { candidate_id, job_id } = req.query;
  const cands = loadCandidates();
  const jobs = loadJobs();

  const cand = cands.find(c => c.candidate_id === candidate_id);
  const job = jobs.find(j => j.job_id === job_id);

  if (!cand || !job) {
    return res.status(404).json({ error: "Candidate or job not found." });
  }

  // Compare skill arrays
  const jobSkills = job.required_skills;
  const candSkillsLower = cand.skills.map(s => s.toLowerCase().trim());

  const matched: string[] = [];
  const missing: string[] = [];
  const recommendations: string[] = [];

  const resources: { [key: string]: string[] } = {
    "python": [
      "Take 'Complete Python Bootcamp' on Udemy",
      "Read 'Effective Python: 90 Specific Ways to Write Better Python'"
    ],
    "sql": [
      "Follow 'Complete SQL Bootcamp' on Udemy",
      "Solve database query exercises on LeetCode"
    ],
    "docker": [
      "Study 'Docker Mastery' by Brett Fisher on Udemy",
      "Browse official container guides"
    ],
    "aws": [
      "Course 'AWS Certified Solutions Architect Associate' by Stephane Maarek on Udemy",
      "Build a free-tier hosting pipeline"
    ],
    "react": [
      "Complete 'React Complete Guide' on Udemy",
      "Develop interactive modular frontends styling with Tailwind"
    ],
    "node.js": [
      "Take 'Complete Node.js Developer' on Udemy",
      "Design standalone JSON REST APIs under Express framework"
    ],
    "kubernetes": [
      "Enroll CKA (Certified Kubernetes Administrator) on KodeKloud",
      "Deploy local container pods via Minikube"
    ],
    "machine learning": [
      "Finish Andrew Ng's 'Machine Learning Specialization' on Coursera",
      "Study Scikit-Learn guides and enter training loops on Kaggle"
    ],
    "pandas": [
      "Read 'Python for Data Analysis' by Wes McKinney"
    ],
    "git": [
      "Complete 'Git & GitHub Bootcamp' by Colt Steele on Udemy"
    ]
  };

  jobSkills.forEach(skill => {
    const sLow = skill.toLowerCase().trim();
    if (candSkillsLower.includes(sLow)) {
      matched.push(skill);
    } else {
      missing.push(skill);
      if (resources[sLow]) {
        recommendations.push(...resources[sLow]);
      } else {
        recommendations.push(`Explore '${skill}' core documentation and video crash courses on YouTube`);
      }
    }
  });

  const uniqueRecs = Array.from(new Set(recommendations)).slice(0, 4);
  const matchPct = jobSkills.length > 0 ? (matched.length / jobSkills.length) * 100 : 100;

  res.json({
    candidate_id: cand.candidate_id,
    name: cand.name,
    job_title: job.title,
    matched_skills: matched,
    missing_skills: missing,
    match_percentage: parseFloat(matchPct.toFixed(1)),
    learning_recommendations: uniqueRecs.length > 0 ? uniqueRecs : ["All core skills are perfectly aligned to support this position!"]
  });
});

// 9. Single Candidate job scoring recommends list
app.get("/api/recommender", (req, res) => {
  const { candidate_id } = req.query;
  const cands = loadCandidates();
  const jobs = loadJobs();

  const cand = cands.find(c => c.candidate_id === candidate_id);
  if (!cand) {
    return res.status(404).json({ error: "Candidate not found." });
  }

  const recommendations = jobs.map(job => {
    const details = evaluateCandidateMatch(cand, job);
    let reasoning = "";
    if (details.score >= 80) reasoning = "Perfect fit! Your skills and experience perfectly map this job's core criteria.";
    else if (details.score >= 60) reasoning = "Competitive matchup. Acquiring a few missing technologies will guarantee a callback.";
    else if (details.score >= 45) reasoning = "Moderate alignment. Some upskilling is requested to support this technical scope.";
    else reasoning = "Low suitability. Multiple skill and experience requirements are unfulfilled.";

    return {
      job_id: job.job_id,
      title: job.title,
      score: details.score,
      required_skills: job.required_skills,
      minimum_experience: job.minimum_experience,
      preferred_education: job.preferred_education,
      matched_skills: details.matched_skills,
      missing_skills: details.missing_skills,
      reasoning
    };
  }).sort((a,b) => b.score - a.score);

  res.json(recommendations);
});

// 10. Resume strength analyzer score
app.get("/api/resume-score", (req, res) => {
  const { candidate_id } = req.query;
  const cands = loadCandidates();

  const cand = cands.find(c => c.candidate_id === candidate_id);
  if (!cand) {
    return res.status(404).json({ error: "Candidate not found." });
  }

  // Core strengths algorithm criteria
  const skillsWeight = Math.min(40.0, cand.skills.length * 5.0);
  const expWeight = Math.min(30.0, cand.experience * 5.0);
  const certsWeight = Math.min(15.0, cand.certifications.length * 7.5);

  let eduWeight = 5.0;
  const eduLow = cand.education.toLowerCase();
  if (eduLow.includes("phd") || eduLow.includes("ph.d.")) eduWeight = 15.0;
  else if (eduLow.includes("master") || eduLow.includes("m.s.") || eduLow.includes("m.b.a.")) eduWeight = 12.0;
  else if (eduLow.includes("bachelor") || eduLow.includes("b.s.") || eduLow.includes("b.tech")) eduWeight = 10.0;
  else if (cand.education !== "Unknown" && cand.education.trim().length > 3) eduWeight = 7.0;

  const total = parseFloat((skillsWeight + expWeight + certsWeight + eduWeight).toFixed(1));

  const suggestions: string[] = [];
  if (cand.skills.length < 6) suggestions.push("Identify and append more developer tags mapping key platforms (at least 8 key skills).");
  if (cand.experience < 3) suggestions.push("Enrich work listings - break down specific custom tech tasks or personal repos in high detail.");
  if (cand.certifications.length === 0) suggestions.push("Acquire industry-certified references (such as AWS Cloud Practitioner or Kubernetes CKA).");
  if (cand.education === "Unknown" || !cand.education) suggestions.push("Explicitly report your university college degrees under a leading 'Education' header.");

  let rating = "";
  let summary = "";
  if (total >= 85) {
    rating = "Elite / Senior Profile";
    summary = "A highly competitive structure. Exhibits comprehensive experience and specialized stack competencies.";
  } else if (total >= 65) {
    rating = "Highly Competitive";
    summary = "Very robust coverage. Completing recommended courses will make this profile outstanding.";
  } else if (total >= 45) {
    rating = "Standard Solid Developer";
    summary = "Adequate presentation. Pursuing industry certifications is recommended to capture interest.";
  } else {
    rating = "Needs Upskilling / Content Addition";
    summary = "Relatively thin density. Expand technology coverage and list development tasks explicitly.";
  }

  res.json({
    score: total,
    rating,
    summary,
    suggestions: suggestions.length > 0 ? suggestions : ["Your resume content and structural layout density are in top-notch shape!"],
    breakdown: {
      skills: skillsWeight,
      experience: expWeight,
      certifications: certsWeight,
      education: eduWeight
    }
  });
});

// Serve frontend asset fallback
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Node full-stack backend server active at http://localhost:${PORT}`);
  });
}

startServer();
