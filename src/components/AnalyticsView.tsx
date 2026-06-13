import React from "react";
import { motion } from "motion/react";
import { BarChart3, PieChart, ShieldAlert, Award, Compass, Sparkles } from "lucide-react";
import { TalentAnalytics } from "../types";

interface AnalyticsViewProps {
  analytics: TalentAnalytics | null;
}

export default function AnalyticsView({ analytics }: AnalyticsViewProps) {
  if (!analytics) {
    return (
      <div className="p-20 flex justify-center items-center flex-col space-y-3" id="analytics-pre-loading">
        <div className="w-8 h-8 border-3 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-mono">Syncing talent metrics metrics...</p>
      </div>
    );
  }

  // A. Calculations for Skills charts dimensions
  const maxSkillCount = Math.max(...analytics.top_skills.map(s => s.count), 1);
  
  // B. Calculations for Education distributions
  const totalEduCount = Object.values(analytics.education_distribution).reduce((sum, v) => sum + v, 0) || 1;

  // C. Calculations for Experience distributions
  const totalExpCount = Object.values(analytics.experience_distribution).reduce((sum, v) => sum + v, 0) || 1;

  // D. Readiness breakdowns
  const totalReadiness = Object.values(analytics.hiring_readiness_metrics).reduce((sum, v) => sum + v, 0) || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
      id="analytics-dashboard"
    >
      <div>
        <h2 className="text-2xl font-bold text-white display-title flex items-center gap-2">
          Talent Analytics Workspace <Sparkles className="text-violet-400" size={20} />
        </h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Real-time aggregates of verified skills, tenure, and hiring readiness parameters.
        </p>
      </div>

      {/* Grid containing distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="graphs-grid">
        {/* 1. Top Skills Frequency (Modern SVG Horizontal Bar Chart) */}
        <div className="p-6 rounded-2xl glass-container space-y-6" id="skills-freq-graph">
          <h3 className="text-base font-bold text-white display-title flex items-center gap-2 border-b border-slate-900 pb-3">
            <BarChart3 className="text-violet-400" size={16} /> Technical Skills Occurrence
          </h3>
          <div className="space-y-4">
            {analytics.top_skills.slice(0, 7).map((skillObj, idx) => {
              const percentage = (skillObj.count / maxSkillCount) * 100;
              return (
                <div key={skillObj.skill} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono font-medium text-slate-300">
                    <span>{skillObj.skill}</span>
                    <span className="text-violet-400">{skillObj.count} Profiles</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-900">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.05 }}
                      className="bg-gradient-to-r from-violet-600 to-indigo-500 h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Education Tier Distribution (Modern Ring Segments Chart) */}
        <div className="p-6 rounded-2xl glass-container space-y-6 flex flex-col justify-between" id="education-tier-graph">
          <h3 className="text-base font-bold text-white display-title flex items-center gap-2 border-b border-slate-900 pb-3">
            <PieChart className="text-cyan-400" size={16} /> Education Tiers Frequency
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* SVG Ring Segment visualizer */}
            <div className="flex justify-center relative">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle cx="72" cy="72" r="50" fill="none" stroke="#0a0a0f" strokeWidth="12" />
                {/* Visualizing PHD percentage in Ring */}
                <circle
                  cx="72"
                  cy="72"
                  r="50"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="12"
                  strokeDasharray={`${(analytics.education_distribution["PhD"] || 0) / totalEduCount * 314} 314`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
                <span className="text-xs text-slate-500 font-mono">Indices</span>
                <span className="text-lg font-bold text-white display-title">{totalEduCount} Total</span>
              </div>
            </div>

            {/* Labels ledger list */}
            <div className="space-y-3 font-medium text-xs text-slate-400">
              {Object.keys(analytics.education_distribution).map((key, i) => {
                const count = analytics.education_distribution[key] || 0;
                const ratio = ((count / totalEduCount) * 100).toFixed(0);
                const colors = ["bg-violet-400", "bg-indigo-400", "bg-cyan-400", "bg-emerald-400", "bg-slate-400"];
                return (
                  <div key={key} className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg border border-slate-900/60">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded ${colors[i % colors.length]}`} />
                      <span className="text-slate-300">{key}</span>
                    </div>
                    <span className="font-mono text-white text-xs">{count} ({ratio}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Developer Tenure Split (Experience Distribution Segment blocks) */}
        <div className="p-6 rounded-2xl glass-container space-y-6" id="seniority-splits-graph">
          <h3 className="text-base font-bold text-white display-title flex items-center gap-2 border-b border-slate-900 pb-3">
            <Compass className="text-emerald-400" size={16} /> Experience Seniority Splits
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(analytics.experience_distribution).map((key, i) => {
              const val = analytics.experience_distribution[key] || 0;
              const pct = val / totalExpCount;
              return (
                <div key={key} className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">{key}</span>
                    <span className="font-mono text-emerald-400 font-bold">{val} Candidates</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Hiring Readiness Index (Metric highlights) */}
        <div className="p-6 rounded-2xl glass-container space-y-6" id="hiring-readiness-graph">
          <h3 className="text-base font-bold text-white display-title flex items-center gap-2 border-b border-slate-900 pb-3">
            <Award className="text-amber-400 animate-pulse" size={16} /> General Hiring Readiness Indices
          </h3>
          <div className="space-y-4">
            {Object.keys(analytics.hiring_readiness_metrics).map((key, i) => {
              const val = analytics.hiring_readiness_metrics[key] || 0;
              const ratio = val / totalReadiness;
              const colorSchemes = ["from-amber-500 to-orange-500", "from-cyan-500 to-blue-500", "from-slate-500 to-slate-400"];
              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{key}</span>
                    <span className="text-slate-400">{val} Candidates</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900">
                    <div className={`bg-gradient-to-r ${colorSchemes[i % colorSchemes.length]} h-full rounded-full`} style={{ width: `${ratio * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
