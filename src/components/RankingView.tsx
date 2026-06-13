import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Briefcase, Sparkles, TrendingUp, Info, Activity, ShieldCheck, ChevronRight } from "lucide-react";
import { Job, RankedCandidate } from "../types";

interface RankingViewProps {
  jobs: Job[];
}

export default function RankingView({ jobs }: RankingViewProps) {
  const [selectedJobId, setSelectedJobId] = useState("");
  const [leaderboard, setLeaderboard] = useState<RankedCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger ranking fetch when jobs are selected
  const fetchRankings = async (jobId: string) => {
    if (!jobId) {
      setLeaderboard([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/rank?job_id=${jobId}`);
      if (!res.ok) {
        throw new Error("Failed to rank candidates with backend sorting algorithm.");
      }
      const data = await res.json();
      setLeaderboard(data);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedJobId(val);
    fetchRankings(val);
  };

  const selectedJob = jobs.find(j => j.job_id === selectedJobId);
  const topCandidate = leaderboard[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
      id="ranking-view-parent"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white display-title">Candidate Ranking</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Evaluate applicants aligned objectively to vacancy criteria using a manual Merge Sort <code className="text-violet-400 font-mono">O(N log N)</code> matrix.
          </p>
        </div>

        {/* Select Dropdown */}
        <div className="w-full md:w-80">
          <select
            id="ranking-job-select"
            value={selectedJobId}
            onChange={handleJobChange}
            className="w-full px-4 py-3 rounded-xl glass-input text-slate-300 text-sm focus:border-violet-600 outline-none cursor-pointer appearance-none bg-slate-950/40"
          >
            <option value="">-- Select Vacancy Criteria --</option>
            {jobs.map(job => (
              <option key={job.job_id} value={job.job_id}>
                {job.title} ({job.job_id})
              </option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4" id="ranking-loading-state">
            <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-400 font-mono">Launching Manual O(N log N) Merge Sort arrays...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm" id="ranking-error">
            {error}
          </div>
        ) : leaderboard.length > 0 && selectedJob ? (
          /* Scoring Leaderboard panel */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
            id="leaderboard-grid"
          >
            {/* Top Applicant Spotlight Card (Bento section) */}
            {topCandidate && (
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8 rounded-2xl bg-gradient-to-br from-violet-950/20 via-slate-950/30 to-slate-950/90 border border-violet-500/20 relative overflow-hidden"
                id="top-talent-bento"
              >
                <div className="absolute top-0 right-0 -mt-24 -mr-24 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl aurora-accent-1" />
                
                {/* 1/3: Top Highlights */}
                <div className="space-y-4 lg:border-r border-slate-900 lg:pr-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-[10px] font-mono font-semibold uppercase tracking-wider border border-violet-500/15">
                    <Sparkles size={11} className="animate-spin" /> Top Applicant Highlight
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white display-title leading-snug">{topCandidate.name}</h3>
                    <p className="text-slate-500 text-xs font-mono">Assigned Code: {topCandidate.candidate_id}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div>
                      <span className="text-slate-500 block">Experience:</span>
                      <span className="font-semibold text-slate-200 mt-0.5 block">{topCandidate.experience} Years</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Degree Tier:</span>
                      <span className="font-semibold text-slate-200 mt-0.5 block">{topCandidate.education}</span>
                    </div>
                  </div>
                </div>

                {/* 2/3: Scores details */}
                <div className="space-y-4 lg:col-span-2 lg:pl-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-slate-300 font-semibold text-sm">Skills Alignment: {topCandidate.match_details.skills_alignment_pct}%</span>
                      <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 display-title">
                        {topCandidate.match_details.score}% Match Fit
                      </span>
                    </div>

                    {/* Progress bars bar */}
                    <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-900 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${topCandidate.match_details.score}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full rounded-full"
                      />
                    </div>
                  </div>

                  {/* Skills tags summaries */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-widest mb-1.5">Matched skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {topCandidate.match_details.matched_skills.slice(0, 3).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                            {s}
                          </span>
                        ))}
                        {topCandidate.match_details.matched_skills.length > 3 && (
                          <span className="text-slate-500 px-1 py-0.5">+ {topCandidate.match_details.matched_skills.length - 3}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-widest mb-1.5">Missing capabilities:</span>
                      <div className="flex flex-wrap gap-1">
                        {topCandidate.match_details.missing_skills.length > 0 ? (
                          topCandidate.match_details.missing_skills.slice(0, 3).map((s, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/15">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-emerald-400">None! Perfect fit!</span>
                        )}
                        {topCandidate.match_details.missing_skills.length > 3 && (
                          <span className="text-slate-500 px-1 py-0.5">+ {topCandidate.match_details.missing_skills.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Sub-Ranking List table */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white display-title flex items-center gap-2">
                <Activity className="text-violet-400 animate-pulse" size={16} /> Leaderboard Array Matrix (manual Merge Sort outputs)
              </h3>

              <div className="rounded-2xl glass-container overflow-hidden">
                <div className="divide-y divide-white/5">
                  {leaderboard.map((item, index) => {
                    const mathVal = item.match_details;
                    return (
                      <motion.div
                        key={item.candidate_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-white/2 transition-colors duration-200"
                        id={`ranked-row-${item.candidate_id}`}
                      >
                        {/* Rank and name details */}
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                            index === 0 ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" :
                            index === 1 ? "bg-slate-300/10 text-slate-300 border border-slate-300/20" :
                            index === 2 ? "bg-amber-600/10 text-amber-600 border border-amber-600/20" :
                            "bg-slate-900 text-slate-500"
                          }`}>
                            #{index + 1}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                              {item.name}
                              <span className="font-mono text-[10px] text-slate-500 font-normal">({item.candidate_id})</span>
                            </h4>
                            <p className="text-slate-500 text-xs">{item.education} | {item.experience} Years industry experience</p>
                          </div>
                        </div>

                        {/* Scores matching preview bar */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="w-40 hidden md:block">
                            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                              <span>Match score</span>
                              <span>{mathVal.score}%</span>
                            </div>
                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full" style={{ width: `${mathVal.score}%` }} />
                            </div>
                          </div>

                          <div className="text-right space-y-1">
                            <span className="font-extrabold text-white text-base font-mono">{mathVal.score}%</span>
                            <span className={`block text-[10px] uppercase tracking-wider font-semibold ${
                              mathVal.education_aligned ? "text-emerald-400" : "text-amber-500"
                            }`}>
                              {mathVal.education_aligned ? "Education Aligned" : "Education Offset"}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Informative complexity box card */}
              <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 text-xs text-slate-400 flex gap-3 h-auto" id="sorting-complexity-panel">
                <Info size={16} className="text-violet-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <span className="font-semibold text-slate-300">Algorithmic Insight: Manual Merge Sort Matrix</span>
                  <p className="leading-relaxed">
                    Unlike naive <code className="text-violet-400">O(N²)</code> sorting lists or standard libraries runtime pivots, RankedIn implements a fully custom, memory-safe **Merge Sort** partition tree. It divides candidates array splits recursively, sorting alignments in stable <code className="text-violet-400">O(N log N)</code> complexity boundaries for reliable sorting benchmarks.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Select dropdown reminder */
          <div className="p-16 border rounded-2xl border-slate-900 bg-slate-950/20 text-center text-slate-500 space-y-3" id="blank-ranking-banner">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
              <Award size={22} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-400">Rankings Leaderboard</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select an active position requirement spec sheet on the menu selector to map and sort candidates immediately.
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
