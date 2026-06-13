import React from "react";
import { motion } from "motion/react";
import { Users, Briefcase, Award, Zap, ChevronRight, TrendingUp } from "lucide-react";
import { TalentAnalytics } from "../types";

interface HomeViewProps {
  analytics: TalentAnalytics | null;
  setView: (v: string) => void;
}

export default function HomeView({ analytics, setView }: HomeViewProps) {
  const stats = [
    {
      id: "stat-candidates",
      label: "Total Candidates",
      value: analytics ? analytics.total_candidates : "20",
      icon: Users,
      color: "from-violet-500 to-indigo-500",
      desc: "Profiles parsed in index"
    },
    {
      id: "stat-jobs",
      label: "Open Positions",
      value: analytics ? Object.keys(analytics.experience_distribution).reduce((sum, k) => sum + (analytics.experience_distribution[k] || 0), 0) || "5" : "5",
      icon: Briefcase,
      color: "from-blue-500 to-cyan-500",
      desc: "Live target listings"
    },
    {
      id: "stat-experience",
      label: "Avg. Experience",
      value: analytics ? `${analytics.average_experience} Yrs` : "4.8 Yrs",
      icon: Award,
      color: "from-emerald-500 to-teal-500",
      desc: "Candidate tenure average"
    },
    {
      id: "stat-skills",
      label: "Unique Skills",
      value: analytics ? analytics.top_skills.length : "14",
      icon: Zap,
      color: "from-amber-500 to-orange-500",
      desc: "Keywords verified by AI"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
      id="home-view-container"
    >
      {/* Premium Hero Banner */}
      <div 
        className="relative overflow-hidden rounded-3xl p-8 md:p-12 glass-container bg-radial from-violet-950/20 via-slate-950/10 to-slate-950/90"
        id="home-hero-banner"
      >
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl aurora-accent-1" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl aurora-accent-2" />
        
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <TrendingUp size={12} /> Live Hackathon Demo App Active
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 leading-tight tracking-tight display-title">
            Automate Talent Discovery with RankedIn
          </h1>
          
          <p className="text-slate-400 text-base leading-relaxed">
            Upload resumes, extract core engineering skills instantly using Gemini, and rank applicants objectively using manual O(N log N) Merge Sort arrays. Match candidate capability with roles in a glassmorphic micro-recruiting workspace.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              id="hero-upload-btn"
              onClick={() => setView("upload")}
              className="px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-violet-600/20 flex items-center gap-2 cursor-pointer"
            >
              Parse New Resume <ChevronRight size={16} />
            </button>
            <button
              id="hero-rank-btn"
              onClick={() => setView("ranking")}
              className="px-6 py-3 rounded-xl font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition-all flex items-center gap-2 cursor-pointer"
            >
              Rank Algorithms Leaderboard
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="kpi-grid">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-2xl glass-card flex flex-col justify-between h-40 relative group overflow-hidden"
            id={stat.id}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            
            <div className="flex justify-between items-start">
              <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-md`}>
                <stat.icon size={20} />
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-3xl font-extrabold text-white display-title tracking-tight">{stat.value}</h3>
              <p className="text-slate-500 text-xs">{stat.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Feature highlight links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="feature-highlights">
        <div 
          onClick={() => setView("search")}
          className="p-6 rounded-2xl glass-card cursor-pointer hover:border-violet-500/20 transition-all space-y-3 group"
          id="feature-search"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center font-bold">DSA</div>
          <h4 className="text-lg font-medium text-white group-hover:text-violet-400 transition-colors">Instant Candidate Discovery</h4>
          <p className="text-slate-400 text-xs leading-normal">
            Query skills instantly in average O(1) time using an inverted Hash Table, and perform O(log N) binary searches over sorted experience limits.
          </p>
        </div>
        <div 
          onClick={() => setView("analytics")}
          className="p-6 rounded-2xl glass-card cursor-pointer hover:border-blue-500/20 transition-all space-y-3 group"
          id="feature-analytics"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold">ANL</div>
          <h4 className="text-lg font-medium text-white group-hover:text-blue-400 transition-colors">Talent Pool Analytics</h4>
          <p className="text-slate-400 text-xs leading-normal">
            Analyze certifications, educate levels, and assess applicant hiring readiness levels interactively via detailed visual distributions.
          </p>
        </div>
        <div 
          onClick={() => setView("about")}
          className="p-6 rounded-2xl glass-card cursor-pointer hover:border-emerald-500/20 transition-all space-y-3 group"
          id="feature-about"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center font-bold">OOP</div>
          <h4 className="text-lg font-medium text-white group-hover:text-emerald-400 transition-colors">Engine Diagnostics & Architecture</h4>
          <p className="text-slate-400 text-xs leading-normal">
            Inspect OOP class modeling, custom algorithmic sort complexities, and clean python patterns supporting your hackathon submission.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
