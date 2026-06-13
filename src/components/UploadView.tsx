import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Cpu, Save, FileText, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Candidate } from "../types";

interface UploadViewProps {
  onCandidateAdded: (c: Candidate) => void;
}

export default function UploadView({ onCandidateAdded }: UploadViewProps) {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedCandidate, setParsedCandidate] = useState<Candidate | null>(null);
  const [parsingMethod, setParsingMethod] = useState("");
  const [saved, setSaved] = useState(false);

  // File Upload handler (TXT files)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
      setError("Only plain text (.txt) resumes are supported under this demo parser.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
      setError(null);
    };
    reader.onerror = () => {
      setError("Failed to read selected file.");
    };
    reader.readAsText(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
      setError("Only plain text (.txt) resumes are supported.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setInputText(event.target?.result as string);
      setError(null);
    };
    reader.readAsText(file);
  };

  // Submit trigger to Node backend for parser pipeline
  const handleParse = async () => {
    if (!inputText.trim()) {
      setError("Resume container is empty. Please paste some text first.");
      return;
    }

    setLoading(true);
    setError(null);
    setParsedCandidate(null);
    setSaved(false);

    try {
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to parse resume.");
      }

      setParsedCandidate(data.candidate);
      setParsingMethod(data.method);
    } catch (err: any) {
      setError(err.message || "An error occurred during parsing.");
    } finally {
      setLoading(false);
    }
  };

  // Save parsed Candidate to global CSV lists
  const handleSaveToPool = async () => {
    if (!parsedCandidate) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedCandidate)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to store candidate profile.");
      }

      setSaved(true);
      onCandidateAdded(parsedCandidate);
    } catch (err: any) {
      setError(err.message || "Could not save candidate to pool.");
    } finally {
      setLoading(false);
    }
  };

  // Load a rich sample resume text to make testing extremely fast and easy for judges
  const loadSampleResume = () => {
    const sample = `Johnathan Doe
johndoe@email.com | +1 (555) 019-2834 | Denver, CO
linkedin.com/in/johndoee

SUMMARY
Experienced Software Developer with 5 years of industry experience specializing in Python backends, web service architecture, and microcontainers. Highly proficient in schema definitions, Docker environments, and cloud databases.

EDUCATION
Master of Science in Computer Science
Colorado State University, Graduate G.P.A: 3.8 / 4.0

EXPERIENCE
Senior Backend Developer | TechApex Inc (2022 - Present)
- Architected data-dense web APIs using Python, SQL, and FastAPI, improving response delays by 35%
- Orchestrated system container environments using Docker and Kubernetes to coordinate automated health checks
- Authored custom cloud pipelines on AWS (APIs, Lambda, RDS) supporting over 10K active connections

Software Engineer II | CoreSystems LLC (2021 - 2022)
- Maintained distributed database systems using SQL, optimizing query schemas and pandas aggregation tasks
- Integrated CI/CD automation pipelines utilizing Git, Docker, and shell execution triggers

KEY SKILLS
Languages: Python, SQL, JavaScript, Java, C++
Frameworks & Libraries: React, Node.js, Express, Pandas, NumPy, Streamlit
Tools & DevOps: Git, Docker, AWS, APIs, Kubernetes, Linux, Docker-compose

CERTIFICATIONS
- AWS Certified Developer Associate (2024)
- Certified Kubernetes Administrator - CKA (2025)`;
    
    setInputText(sample);
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
      id="upload-container"
    >
      <div>
        <h2 className="text-2xl font-bold text-white display-title">AI-Powered Resume Parsing Engine</h2>
        <p className="text-slate-400 text-sm mt-1">
          Paste plain resume text or upload a plain-text file to automatically extract candidate insights with Gemini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="upload-grid">
        {/* Left Side: Input Field and File target */}
        <div className="space-y-6">
          <div className="flex justify-between items-center" id="input-header-row">
            <span className="text-slate-300 font-medium text-sm">Resume Input Text</span>
            <button
              id="load-sample-btn"
              onClick={loadSampleResume}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              Fill Sample Resume
            </button>
          </div>

          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/40 p-1 flex flex-col h-[400px] relative focus-within:border-violet-600 transition-colors"
            id="drag-drop-container"
          >
            {/* Tiny header overlay for files drop */}
            <div className="flex items-center justify-between p-3 border-b border-slate-900 bg-slate-950/80 rounded-t-2xl">
              <span className="text-xs text-slate-500">Drag/Drop .txt file or paste plain text info</span>
              <label className="text-xs text-violet-400 hover:text-violet-300 transition-colors cursor-pointer font-medium">
                Browse Files
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              id="resume-textarea"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste raw, unformatted resume data here (e.g., Name, Education, Experience, Skills, Certifications info)..."
              className="w-full flex-1 p-4 bg-transparent outline-none resize-none text-slate-300 text-sm leading-relaxed"
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3" id="upload-error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button
            id="trigger-parse-btn"
            onClick={handleParse}
            disabled={loading || !inputText.trim()}
            className="w-full py-4 rounded-xl font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-violet-600/10 flex items-center justify-center gap-2 cursor-pointer text-base"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={20} /> Processing via AI Extractor...
              </>
            ) : (
              <>
                <Cpu size={20} /> Extract Candidate Profile (Gemini 3.5-Flash)
              </>
            )}
          </button>
        </div>

        {/* Right Side: Parsing Insights Preview */}
        <AnimatePresence mode="wait">
          {parsedCandidate ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 rounded-2xl glass-container flex flex-col justify-between space-y-6 relative"
              id="parsed-profile-card"
            >
              <div className="absolute top-4 right-4 text-xs font-mono px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5 animate-pulse">
                <CheckCircle size={12} /> {parsingMethod}
              </div>

              <div className="space-y-6">
                <div className="border-b border-slate-900 pb-4 space-y-1">
                  <span className="text-xs text-indigo-400 font-mono tracking-wider uppercase font-semibold">Extracted Profile</span>
                  <h3 className="text-2xl font-bold text-white display-title">{parsedCandidate.name}</h3>
                  <p className="text-slate-500 text-xs font-mono">Assigned temporary index: {parsedCandidate.candidate_id}</p>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900/60">
                      <span className="text-xs text-slate-500">Education Degree</span>
                      <p className="font-semibold text-slate-200 mt-1 lines-clamp-1">{parsedCandidate.education}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900/60">
                      <span className="text-xs text-slate-500">Experience Tenure</span>
                      <p className="font-semibold text-slate-200 mt-1">{parsedCandidate.experience} Years</p>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="space-y-2">
                    <span className="text-xs text-slate-500 block">Skills Extracted ({parsedCandidate.skills.length})</span>
                    <div className="flex flex-wrap gap-1.5" id="extracted-skills-tags">
                      {parsedCandidate.skills.map((skill, i) => (
                        <span key={`skill-${i}`} className="text-xs px-2.5 py-1 rounded-md bg-violet-600/10 text-violet-300 border border-violet-500/15">
                          {skill}
                        </span>
                      ))}
                      {parsedCandidate.skills.length === 0 && <span className="text-xs text-slate-600">None detected.</span>}
                    </div>
                  </div>

                  {/* Certifications Section */}
                  <div className="space-y-2">
                    <span className="text-xs text-slate-500 block">Certifications Recognized</span>
                    <div className="flex flex-wrap gap-1.5" id="extracted-certs-tags">
                      {parsedCandidate.certifications.map((cert, i) => (
                        <span key={`cert-${i}`} className="text-xs px-2.5 py-1 rounded-md bg-blue-600/10 text-blue-300 border border-blue-500/15">
                          {cert}
                        </span>
                      ))}
                      {parsedCandidate.certifications.length === 0 && <span className="text-xs text-slate-600">None detected.</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900">
                {saved ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-center gap-2" id="saved-confirmation-badge">
                    <CheckCircle size={18} /> Candidate successfully synchronized and saved to Pool!
                  </div>
                ) : (
                  <button
                    id="save-to-pool-btn"
                    onClick={handleSaveToPool}
                    className="w-full py-3.5 rounded-xl font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg hover:shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Save size={18} /> Save Candidate Profile
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <div 
              className="rounded-2xl border border-slate-900 bg-slate-950/20 flex flex-col items-center justify-center p-8 space-y-4 text-center text-slate-500 h-[510px]"
              id="empty-preview-container"
            >
              <div className="w-16 h-16 rounded-full bg-slate-900 text-slate-400 flex items-center justify-center">
                <FileText size={28} />
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-semibold text-slate-400">Profile Preview Panel</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Parsed candidate matrices (Skills, Education, experience thresholds) are compiled here instantly upon submit triggers.
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
