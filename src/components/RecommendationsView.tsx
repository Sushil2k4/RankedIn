import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ThumbsUp, Medal, AlertCircle, Bookmark } from "lucide-react";
import { Candidate, Job, JobRecommendation } from "../types";

interface RecommendationsViewProps {
  candidates: Candidate[];
}

export default function RecommendationsView({ candidates }: RecommendationsViewProps) {
  const [selectedCandId, setSelectedCandId] = useState("");
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger Recommendations fetch from Node server
  const handleLoadRecommendations = async (candId: string) => {
    if (!candId) {
      setRecommendations([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/recommender?candidate_id=${candId}`);
      if (!res.ok) {
        throw new Error("Failed to load recommended job indexes.");
      }
      const data = await res.json();
      setRecommendations(data);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const onCandidateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCandId(val);
    handleLoadRecommendations(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
      id="recommendations-view"
    >
      <div>
        <h2 className="text-2xl font-bold text-white display-title">AI Job Recommendations</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Generate matching role lists sorted descending specifically of a developer profile's experience and skill tags.
        </p>
      </div>

      {/* Candidate Selector */}
      <div className="p-6 rounded-2xl glass-container max-w-md" id="recommender-header-card">
        <label className="text-xs text-slate-400 font-semibold block mb-2 uppercase tracking-wide">Select Candidate</label>
        <select
          id="recommender-cand-select"
          value={selectedCandId}
          onChange={onCandidateSelect}
          className="w-full px-4 py-3 rounded-xl glass-input text-slate-300 text-sm focus:border-violet-600 outline-none cursor-pointer appearance-none bg-slate-950/40"
        >
          <option value="">-- Select Active Candidate --</option>
          {candidates.map(cand => (
            <option key={cand.candidate_id} value={cand.candidate_id}>
              {cand.name} ({cand.candidate_id})
            </option>
          ))}
        </select>
      </div>

      {/* Recommendations Cards layout */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="p-24 flex flex-col justify-center items-center space-y-3" id="recommends-loading">
            <div className="w-10 h-10 border-3 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            <p className="text-slate-500 font-mono text-xs text-center">Formulating job recomendation alignments...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        ) : recommendations.length > 0 ? (
          /* Cards Grid list */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            id="recommendations-grid"
          >
            {recommendations.map((rec, idx) => (
              <motion.div
                key={rec.job_id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="p-6 rounded-2xl glass-card flex flex-col justify-between h-[360px] relative overflow-hidden"
                id={`recommendation-card-${rec.job_id}`}
              >
                {/* Visual score accent in corners */}
                <div className="absolute top-0 right-0 p-3 flex gap-1.5 items-center">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    rec.score >= 80 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    rec.score >= 60 ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                    rec.score >= 45 ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                    "bg-red-500/10 text-red-400"
                  }`}>
                    {rec.score}% Fit
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5 border-b border-slate-900 pb-3">
                    <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-semibold block">{rec.job_id}</span>
                    <h3 className="text-lg font-bold text-white display-title leading-snug">{rec.title}</h3>
                  </div>

                  {/* Criteria info */}
                  <div className="space-y-1 text-xs text-slate-400">
                    <p><span className="font-semibold text-slate-300">Min. Exp:</span> {rec.minimum_experience} Years</p>
                    <p><span className="font-semibold text-slate-300">Degree Focus:</span> {rec.preferred_education}</p>
                  </div>

                  {/* Match reasoning text block */}
                  <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900 flex gap-2.5 h-auto text-xs leading-normal">
                    <ThumbsUp className="text-indigo-400 shrink-0 mt-0.5" size={14} />
                    <p className="text-slate-300 font-semibold italic">{rec.reasoning}</p>
                  </div>
                </div>

                {/* Badges footer */}
                <div className="space-y-2 pt-2 border-t border-slate-900">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Matched tags:</span>
                  <div className="flex flex-wrap gap-1">
                    {rec.matched_skills.map((s, i) => (
                      <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                        {s}
                      </span>
                    ))}
                    {rec.matched_skills.length === 0 && (
                      <span className="text-[9px] text-slate-600 italic">None.</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Choose candidate reminder banner */
          <div className="p-16 border rounded-2xl border-slate-900 bg-slate-950/20 text-center text-slate-500 space-y-3" id="blank-recommender-banner">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
              <Bookmark size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-400">Match Recommendations Generator</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select an active developer's profile to execute automated career mapping score list cascades.
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
