import React from "react";
import { motion } from "motion/react";
import { Code2, Cpu, Database, Award, Info, Terminal, Sparkles, Check } from "lucide-react";

export default function AboutView() {
  const dsAlgorithms = [
    {
      title: "OOP Modeling Architectures",
      tech: "SaaS Blueprinting",
      complexity: "O(1) Memory Space",
      desc: "Uses decoupled Candidate and Job constructors to validate types, sanitize string structures, and automatically parse nested CSV data records smoothly."
    },
    {
      title: "Manual stable Merge Sort",
      tech: "Divide and Conquer",
      complexity: "O(N log N) Stable Time",
      desc: "Instead of relying on standard list libraries or quicksort, we implement manual Merge Sort splits. Generates deterministic, stable arrays, ranking matches symmetrically."
    },
    {
      title: "Inverted Index Skill Hash Table",
      tech: "Skill Key Lookups",
      complexity: "O(1) Average Lookup",
      desc: "Converts candidate skill lists into a mapped inverted table mapping technology strings directly to Candidate ID Sets, bypassing expensive full-loop linear sweeps."
    },
    {
      title: "Binary Experience Filtering Range Search",
      tech: "Segment Boundaries",
      complexity: "O(log N) Search Time",
      desc: "Sorts candidate sub-arrays on sorted years of experience to run binary search lower-bounds checks. Pins index limits in logarithmic dimensions."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
      id="about-view-parent"
    >
      {/* Intro section */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 glass-container" id="about-intro">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl aurora-accent-1" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Terminal size={12} /> SIC Hackathon Submission Blueprint
          </div>
          <h2 className="text-3xl font-bold text-white display-title">
            RankedIn: Resume Ranking and Job Matching Engine
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            RankedIn is a modern HR-Tech SaaS dashboard built from scratch to address bias, sluggish manual screenings, and unscientific candidate-to-job matches. Rather than evaluating resumes based on visual keywords, RankedIn applies formal mathematical alignment criteria (70% Skills, 20% Experience, 10% Academic degree tiers) over sandboxed candidate files.
          </p>
        </div>
      </div>

      {/* Grid mapping algorithms Complexity */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white display-title flex items-center gap-2">
          <Code2 className="text-violet-400" size={18} /> Algorithmic complexity Diagnostics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="complexity-cards-grid">
          {dsAlgorithms.map((algo, i) => (
            <div key={i} className="p-6 rounded-2xl glass-card space-y-3" id={`complexity-card-${i}`}>
              <div className="flex justify-between items-start border-b border-slate-900 pb-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-violet-400 font-mono font-semibold uppercase tracking-wider">{algo.tech}</span>
                  <h4 className="text-base font-bold text-white display-title">{algo.title}</h4>
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-900 text-slate-300 border border-slate-800 rounded">
                  {algo.complexity}
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{algo.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Persistence Architecture details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="architecture-matrix-row">
        {/* Core A: CSV Data Vetting */}
        <div className="p-6 rounded-2xl glass-container space-y-3" id="arch-csv">
          <div className="p-2 w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/10">
            <Database size={20} />
          </div>
          <h4 className="text-base font-bold text-white display-title">Local Durable csv Store</h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            Data persists safely in <code className="text-cyan-400 font-mono">candidates.csv</code> and <code className="text-cyan-400 font-mono">jobs.csv</code>. The parser automatically structures raw inputs via Node and Python IO streams cleanly.
          </p>
        </div>

        {/* Core B: AI Schema Vetting */}
        <div className="p-6 rounded-2xl glass-container space-y-3" id="arch-gemini">
          <div className="p-2 w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center border border-violet-500/10">
            <Cpu size={20} />
          </div>
          <h4 className="text-base font-bold text-white display-title">Gemini Struct Schema parser</h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            Resumes are extracted via Gemini's structured output controls, strictly validating parameters (Name, Degree, Experience, Certifications).
          </p>
        </div>

        {/* Core C: Pure Python and TS Cohesion */}
        <div className="p-6 rounded-2xl glass-container space-y-3" id="arch-purity">
          <div className="p-2 w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/10">
            <Award size={20} />
          </div>
          <h4 className="text-base font-bold text-white display-title">Bilingual Code Symmetry</h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            Whether you test with App Controller commands or click our interactive design screens, the algorithms behind scoring and matching remain strictly and scientifically matched.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
