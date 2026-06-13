import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, UploadCloud, Users, Briefcase, Award, Search, 
  BarChart3, BrainCircuit, Compass, Info, Sparkles, Menu, X, Landmark, Cpu
} from "lucide-react";

import { Candidate, Job, TalentAnalytics } from "./types";
import HomeView from "./components/HomeView";
import UploadView from "./components/UploadView";
import CandidatesView from "./components/CandidatesView";
import JobsView from "./components/JobsView";
import RankingView from "./components/RankingView";
import SearchView from "./components/SearchView";
import AnalyticsView from "./components/AnalyticsView";
import SkillGapView from "./components/SkillGapView";
import RecommendationsView from "./components/RecommendationsView";
import AboutView from "./components/AboutView";

export default function App() {
  const [view, setView] = useState("home");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [analytics, setAnalytics] = useState<TalentAnalytics | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load and refresh core databases from API routes
  const loadWorkspaceData = async () => {
    try {
      const cRes = await fetch("/api/candidates");
      if (cRes.ok) {
        const cData = await cRes.json();
        setCandidates(cData);
      }

      const jRes = await fetch("/api/jobs");
      if (jRes.ok) {
        const jData = await jRes.json();
        setJobs(jData);
      }

      const aRes = await fetch("/api/analytics");
      if (aRes.ok) {
        const aData = await aRes.json();
        setAnalytics(aData);
      }
    } catch (err) {
      console.error("Error refreshing workspace datasets:", err);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, []);

  // Sync callbacks when candidates/jobs are saved
  const handleCandidateAdded = (newCand: Candidate) => {
    loadWorkspaceData();
  };

  const handleJobAdded = (newJob: Job) => {
    loadWorkspaceData();
  };

  const menuItems = [
    { id: "home", label: "Dashboard Home", icon: Home },
    { id: "upload", label: "Extract Resume", icon: UploadCloud },
    { id: "candidates", label: "Candidates Pool", icon: Users },
    { id: "jobs", label: "Job Openings", icon: Briefcase },
    { id: "ranking", label: "Candidate Ranking", icon: Award },
    { id: "search", label: "Indexed Search", icon: Search },
    { id: "analytics", label: "Talent Analytics", icon: BarChart3 },
    { id: "skill-gap", label: "Skill Gap Analysis", icon: BrainCircuit },
    { id: "recommend", label: "Job Recommends", icon: Compass },
    { id: "about", label: "Engine Specs", icon: Info }
  ];

  return (
    <div className="min-h-screen bg-cosmic-glow text-slate-100 flex flex-col md:flex-row antialiased font-sans" id="ranked-in-app">
      
      {/* Mobile Top Bar */}
      <div 
        className="md:hidden flex h-16 items-center justify-between px-6 bg-slate-950/80 border-b border-white/5 backdrop-blur-md sticky top-0 z-50"
        id="mobile-topbar"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md">
            <Cpu size={18} className="animate-pulse" />
          </div>
          <span className="font-extrabold text-white tracking-tight text-lg display-title">RankedIn</span>
        </div>
        <button
          id="hamburger-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        id="side-nav-rail"
        className={`fixed inset-y-0 left-0 z-40 w-64 glass-container bg-slate-950/90 py-6 px-4 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Logo Heading (Desktop view) */}
          <div className="hidden md:flex items-center gap-3 px-2" id="sidebar-logo-container">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/10">
              <Cpu size={22} className="animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <h1 className="font-extrabold text-white tracking-tight leading-none text-xl display-title">RankedIn</h1>
              <span className="text-[10px] text-slate-500 tracking-wider font-semibold block uppercase">AI Screen System</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1" id="nav-items-list">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = view === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => {
                    setView(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer group relative ${
                    isActive 
                      ? "bg-violet-600/15 text-violet-400 border border-violet-500/15" 
                      : "text-slate-400 hover:text-white hover:bg-white/2 border border-transparent"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-bubble"
                      className="absolute inset-0 bg-violet-600/5 rounded-xl"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon size={18} className={`shrink-0 ${isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300 transition-colors"}`} />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Workspace telemetry metrics */}
        <div className="p-3 bg-slate-900/40 rounded-xl border border-white/5 space-y-2 text-[11px]" id="sidebar-telemetry">
          <div className="flex justify-between items-center text-slate-500 font-mono">
            <span>Server status:</span>
            <span className="text-emerald-400 flex items-center gap-1">● Active</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 font-mono">
            <span>Pool indexes:</span>
            <span className="text-slate-300 font-semibold">{candidates.length} Profiles</span>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:p-10 space-y-8" id="master-main-pane">
        
        {/* Dynamic active view container */}
        <div className="max-w-7xl mx-auto" id="dynamic-content-wrapper">
          <AnimatePresence mode="wait">
            {view === "home" && <HomeView key="home" analytics={analytics} setView={setView} />}
            {view === "upload" && <UploadView key="upload" onCandidateAdded={handleCandidateAdded} />}
            {view === "candidates" && <CandidatesView key="candidates" candidates={candidates} onAddCandidate={handleCandidateAdded} />}
            {view === "jobs" && <JobsView key="jobs" jobs={jobs} onAddJob={handleJobAdded} />}
            {view === "ranking" && <RankingView key="ranking" jobs={jobs} />}
            {view === "search" && <SearchView key="search" />}
            {view === "analytics" && <AnalyticsView key="analytics" analytics={analytics} />}
            {view === "skill-gap" && <SkillGapView key="skill-gap" candidates={candidates} jobs={jobs} />}
            {view === "recommend" && <RecommendationsView key="recommend" candidates={candidates} />}
            {view === "about" && <AboutView key="about" />}
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
