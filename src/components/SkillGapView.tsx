import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, BrainCircuit, CheckCircle, AlertTriangle, BookOpen, GraduationCap } from "lucide-react";
import { Candidate, Job, SkillGapAnalysis } from "../types";

interface SkillGapViewProps {
  candidates: Candidate[];
  jobs: Job[];
}

export default function SkillGapView({ candidates, jobs }: SkillGapViewProps) {
  const [selectedCandId, setSelectedCandId] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger analysis execution
  const handleAnalyze = async (candId: string, jobId: string) => {
    if (!candId || !jobId) {
      setAnalysis(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/skill-gap?candidate_id=${candId}&job_id=${jobId}`);
      if (!res.ok) {
        throw new Error("Failed to process skill gap comparisons.");
      }
      const data = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const onCandidateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCandId(val);
    if (selectedJobId) handleAnalyze(val, selectedJobId);
  };

  const onJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedJobId(val);
    if (selectedCandId) handleAnalyze(selectedCandId, val);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
      id="skill-gap-parent"
    >
      <div>
        <h2 className="text-2xl font-bold text-white display-title">Skill Gap Analysis</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Map candidates specifically against roles to locate missing technologies and structure learning recommendations.
        </p>
      </div>

      {/* Selectors card row */}
      <div className="p-6 rounded-2xl glass-container grid grid-cols-1 md:grid-cols-2 gap-6" id="skillgap-selectors">
        {/* Candidate Selector */}
        <div>
          <label className="text-xs text-slate-400 font-semibold block mb-2 uppercase tracking-wide">Select Candidate</label>
          <select
            id="skillgap-cand-select"
            value={selectedCandId}
            onChange={onCandidateChange}
            className="w-full px-4 py-3 rounded-xl glass-input text-slate-300 text-sm focus:border-violet-600 outline-none cursor-pointer appearance-none bg-slate-950/40"
          >
            <option value="">-- Choose Candidate --</option>
            {candidates.map(cand => (
              <option key={cand.candidate_id} value={cand.candidate_id}>
                {cand.name} ({cand.candidate_id})
              </option>
            ))}
          </select>
        </div>

        {/* Job opening selector */}
        <div>
          <label className="text-xs text-slate-400 font-semibold block mb-2 uppercase tracking-wide">Target Job Criteria</label>
          <select
            id="skillgap-job-select"
            value={selectedJobId}
            onChange={onJobChange}
            className="w-full px-4 py-3 rounded-xl glass-input text-slate-300 text-sm focus:border-cyan-600 outline-none cursor-pointer appearance-none bg-slate-950/40"
          >
            <option value="">-- Choose Job Opening --</option>
            {jobs.map(job => (
              <option key={job.job_id} value={job.job_id}>
                {job.title} ({job.job_id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Panel outputs */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="p-24 flex flex-col justify-center items-center space-y-3" id="skillgap-loading">
            <div className="w-10 h-10 border-3 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            <p className="text-slate-500 font-mono text-xs">Assembling skill mappings matrices...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        ) : analysis ? (
          /* Analysis presentation grid layout */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            id="skillgap-analysis-displays"
          >
            {/* Column A: Match fit score segment */}
            <div className="p-8 rounded-2xl glass-container flex flex-col justify-between space-y-6 lg:h-80" id="skillgap-score-gauge">
              <div className="space-y-3">
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 font-mono font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                  Alignment Matrix
                </span>
                <h3 className="text-xl font-bold text-white display-title leading-snug">Skills Alignment Score</h3>
                <p className="text-slate-400 text-xs">
                  Proportion of required technologies verified in {analysis.name}'s experience tags list.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold">Matched Score</span>
                  <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 display-title">
                    {analysis.match_percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-900">
                  <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full" style={{ width: `${analysis.match_percentage}%` }} />
                </div>
              </div>
            </div>

            {/* Column B: Skills side-by-side mapping */}
            <div className="p-8 rounded-2xl glass-container lg:col-span-2 space-y-6" id="skillgap-lists-card">
              <h3 className="text-lg font-bold text-white display-title flex items-center gap-2 border-b border-slate-900 pb-2">
                <BrainCircuit className="text-violet-400" size={18} /> Mapped Tech Elements
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Clean Matched green tags */}
                <div className="space-y-3">
                  <span className="text-emerald-400 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle size={14} /> Supported Core Tech ({analysis.matched_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5" id="skillgap-matched-tags">
                    {analysis.matched_skills.map((s, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                        {s}
                      </span>
                    ))}
                    {analysis.matched_skills.length === 0 && (
                      <span className="text-xs text-slate-600 italic">No overlap identified.</span>
                    )}
                  </div>
                </div>

                {/* Crimson Missing badges */}
                <div className="space-y-3">
                  <span className="text-red-400 font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={14} className="animate-bounce" /> Unmatched Tech Elements ({analysis.missing_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5" id="skillgap-missing-tags">
                    {analysis.missing_skills.map((s, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/15">
                        {s}
                      </span>
                    ))}
                    {analysis.missing_skills.length === 0 && (
                      <span className="text-xs text-emerald-400 font-semibold">Ready Callback! Fully aligned.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Course learning pathway curriculum suggestions */}
            <div className="p-8 rounded-2xl glass-container lg:col-span-3 space-y-6" id="learning-pathway-courses">
              <h4 className="text-base font-bold text-white display-title flex items-center gap-2">
                <BookOpen className="text-cyan-400" size={16} /> Course recommendations Learning Pathway
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="recommendations-courses-list">
                {analysis.learning_recommendations.map((course, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/40 border border-slate-900/60 flex gap-3 h-auto items-start">
                    <div className="p-2 bg-slate-900 rounded-lg text-cyan-400 border border-slate-800 shrink-0">
                      <GraduationCap size={16} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold block">Curriculum {idx+1}</span>
                      <p className="text-xs text-slate-200 leading-relaxed font-semibold">{course}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Select dropdown reminder */
          <div className="p-16 border rounded-2xl border-slate-900 bg-slate-950/20 text-center text-slate-500 space-y-3" id="blank-skillgap-banner">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
              <BrainCircuit size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-400">Skill Gap comparison Matrix</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Pair up a candidate and a target role criteria to chart the technical gap analysis and training suggestions.
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
