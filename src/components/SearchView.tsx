import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Brain, Hash, Sliders, Check, CircleAlert, HelpCircle } from "lucide-react";
import { Candidate } from "../types";

export default function SearchView() {
  const [skillInput, setSkillInput] = useState("");
  const [minExpInput, setMinExpInput] = useState("");
  const [eduToken, setEduToken] = useState("");
  const [results, setResults] = useState<Candidate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger searching API
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let query = `/api/search?`;
    if (skillInput.trim()) query += `skill=${encodeURIComponent(skillInput.trim())}&`;
    if (minExpInput.trim()) query += `min_exp=${encodeURIComponent(minExpInput.trim())}&`;
    if (eduToken.trim()) query += `education_token=${encodeURIComponent(eduToken.trim())}`;

    try {
      const res = await fetch(query);
      if (!res.ok) {
        throw new Error("Failed to execute indexed lookup query.");
      }
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || "An exception occurred during lookup.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSkillInput("");
    setMinExpInput("");
    setEduToken("");
    setResults(null);
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
      id="search-view-parent"
    >
      <div>
        <h2 className="text-2xl font-bold text-white display-title">Indexed Candidate Search</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Leverage sub-linear lookup indices to query candidates securely with optimized search structures.
        </p>
      </div>

      {/* Lookup Inputs Filter Dashboard Card */}
      <div className="p-6 rounded-2xl glass-container" id="search-filter-card">
        <form onSubmit={handleSearchSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="search-inputs-row">
            {/* Skill Input (Hash Inverted Index) */}
            <div>
              <label className="text-xs text-violet-400 font-semibold uppercase tracking-wider block mb-2 font-mono flex items-center gap-1.5">
                <Brain size={12} /> Technology (Hash Inverted Index)
              </label>
              <input
                id="search-skill-key"
                type="text"
                placeholder="e.g. Python, Docker, SQL"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-200 outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
              />
              <span className="text-[10px] text-slate-500 block mt-1.5 leading-normal">
                Resolves in <code className="text-violet-400 font-mono">O(1)</code> avg time matching technology hash lists.
              </span>
            </div>

            {/* Exp Input (Binary Search Lowerbound boundary) */}
            <div>
              <label className="text-xs text-emerald-400 font-semibold uppercase tracking-wider block mb-2 font-mono flex items-center gap-1.5">
                <Hash size={12} /> Min Experience (Binary Search)
              </label>
              <input
                id="search-exp-range"
                type="number"
                step="0.5"
                placeholder="e.g. 4.0, 5"
                value={minExpInput}
                onChange={(e) => setMinExpInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-200 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
              <span className="text-[10px] text-slate-500 block mt-1.5 leading-normal">
                Resolves in <code className="text-emerald-400 font-mono">O(log N)</code> search on pre-sorted numeric ranges.
              </span>
            </div>

            {/* Education Degree Token */}
            <div>
              <label className="text-xs text-blue-400 font-semibold uppercase tracking-wider block mb-2 font-mono flex items-center gap-1.5">
                <Sliders size={12} /> Education Degree Title
              </label>
              <input
                id="search-edu-key"
                type="text"
                placeholder="e.g. PHD, Master, Bachelor"
                value={eduToken}
                onChange={(e) => setEduToken(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-200 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
              <span className="text-[10px] text-slate-500 block mt-1.5 leading-normal">
                Matches academic course or degree string snippets.
              </span>
            </div>
          </div>

          <div className="flex gap-4 pt-2 border-t border-slate-900 justify-end" id="search-action-row">
            <button
              id="clear-search-btn"
              type="button"
              onClick={handleClear}
              className="px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white transition-colors cursor-pointer text-sm"
            >
              Reset Terminal
            </button>
            <button
              id="execute-search-btn"
              type="submit"
              className="px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all flex items-center gap-2 cursor-pointer text-sm shadow-md"
            >
              <Search size={15} /> Query Indices
            </button>
          </div>
        </form>
      </div>

      {results && (
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="p-20 flex justify-center items-center" id="search-indexing-loading">
              <div className="w-8 h-8 border-3 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
              id="search-results-holder"
            >
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                Indices Output: {results.length} Candidates Screened
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="results-grid">
                {results.map((cand) => (
                  <motion.div
                    key={cand.candidate_id}
                    layoutProps
                    className="p-5 rounded-xl glass-card border border-white/5 space-y-4 flex flex-col justify-between"
                    id={`search-result-${cand.candidate_id}`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start border-b border-slate-900 pb-2">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-white text-base leading-snug">{cand.name}</h4>
                          <span className="text-[10px] font-mono font-medium text-slate-500">ID: {cand.candidate_id}</span>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2 py-0.5 rounded font-semibold shrink-0">
                          {cand.experience} Yrs Tenure
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-400">
                        <p className="flex items-center gap-1.5">
                          <Check size={12} className="text-violet-400" />
                          <span className="font-semibold text-slate-300">Degree:</span> {cand.education}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Check size={12} className="text-violet-400" />
                          <span className="font-semibold text-slate-300">Certs:</span> {cand.certifications.join(" | ") || "None"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">Extracted keys:</span>
                      <div className="flex flex-wrap gap-1">
                        {cand.skills.map((s, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {results.length === 0 && (
                  <div className="p-12 text-center col-span-full rounded-2xl bg-slate-950/20 border border-slate-900 text-slate-500 flex items-center justify-center gap-2">
                    <CircleAlert size={16} />
                    <span>Search criteria yielded null candidates. Reset search parameters above.</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}
