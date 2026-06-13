import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, Plus, ArrowUpAz, ArrowDownZa, Calendar, GraduationCap, Sparkles, UserPlus } from "lucide-react";
import { Candidate } from "../types";

interface CandidatesViewProps {
  candidates: Candidate[];
  onAddCandidate: (c: Candidate) => void;
}

export default function CandidatesView({ candidates, onAddCandidate }: CandidatesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expFilter, setExpFilter] = useState("");
  const [eduFilter, setEduFilter] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "experience" | "id">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showAddForm, setShowAddForm] = useState(false);

  // Manual Add Form states
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newEdu, setNewEdu] = useState("");
  const [newExp, setNewExp] = useState("");
  const [newSkillsStr, setNewSkillsStr] = useState("");
  const [newCertsStr, setNewCertsStr] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Sorting and Filtering logic
  const handleSort = (field: "name" | "experience" | "id") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const filteredCandidates = candidates
    .filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.candidate_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchExp = expFilter === "" || 
                        (expFilter === "junior" && c.experience <= 2) || 
                        (expFilter === "mid" && c.experience > 2 && c.experience < 6) ||
                        (expFilter === "senior" && c.experience >= 6);
                        
      const matchEdu = eduFilter === "" || 
                        c.education.toLowerCase().includes(eduFilter.toLowerCase());
                        
      return matchSearch && matchExp && matchEdu;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "experience") {
        comparison = a.experience - b.experience;
      } else {
        comparison = a.candidate_id.localeCompare(b.candidate_id);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Manual Profile addition callback
  const handleSubmitCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newName) {
      setFormError("ID and Full Name are strictly required.");
      return;
    }

    if (candidates.some(c => c.candidate_id.toUpperCase() === newId.toUpperCase())) {
      setFormError("ID already exists in system database.");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    const newCandidate: Candidate = {
      candidate_id: newId.trim().toUpperCase(),
      name: newName.trim(),
      education: newEdu.trim() || "B.S. in Computer Science",
      experience: parseFloat(newExp) || 0.0,
      skills: newSkillsStr.split(";").map(s => s.trim()).filter(Boolean),
      certifications: newCertsStr.split(";").map(c => c.trim()).filter(Boolean)
    };

    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCandidate)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit candidate details.");
      }

      onAddCandidate(newCandidate);
      setShowAddForm(false);
      
      // Reset fields
      setNewId("");
      setNewName("");
      setNewEdu("");
      setNewExp("");
      setNewSkillsStr("");
      setNewCertsStr("");
    } catch (err: any) {
      setFormError(err.message || "An error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
      id="candidates-view-container"
    >
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-900 pb-4" id="cand-list-header">
        <div>
          <h2 className="text-2xl font-bold text-white display-title">Candidates Database</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Active applicant pool currently synchronized with <code className="text-indigo-400 font-mono">candidates.csv</code>.
          </p>
        </div>
        <button
          id="toggle-add-form-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm shadow-md"
        >
          {showAddForm ? "View Data Grid" : <><UserPlus size={16} /> Add Candidate manually</>}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showAddForm ? (
          /* Manual Candidate Entry Form */
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 rounded-2xl glass-container max-w-2xl mx-auto overflow-hidden"
            id="manual-add-form"
          >
            <h3 className="text-lg font-bold text-white display-title flex items-center gap-2 mb-4 border-b border-slate-900 pb-2">
              <Sparkles className="text-violet-400" size={18} /> Add Candidate Profile Manually
            </h3>
            <form onSubmit={handleSubmitCandidate} className="space-y-4 text-sm text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Candidate ID *</label>
                  <input
                    id="form-cand-id"
                    type="text"
                    required
                    placeholder="e.g. CANT021"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-200 text-sm focus:border-violet-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Full Name *</label>
                  <input
                    id="form-cand-name"
                    type="text"
                    required
                    placeholder="e.g. Jane Foster"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-200 text-sm focus:border-violet-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Highest Degree / School</label>
                  <input
                    id="form-cand-edu"
                    type="text"
                    placeholder="e.g. B.S. in Computer Science"
                    value={newEdu}
                    onChange={(e) => setNewEdu(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-200 text-sm focus:border-violet-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Experience Years</label>
                  <input
                    id="form-cand-exp"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 3.5"
                    value={newExp}
                    onChange={(e) => setNewExp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-200 text-sm focus:border-violet-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Skills List (seperate by semicolon ';')</label>
                <input
                  id="form-cand-skills"
                  type="text"
                  placeholder="e.g. Python;SQL;AWS;React"
                  value={newSkillsStr}
                  onChange={(e) => setNewSkillsStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-200 text-sm focus:border-violet-600 outline-none text-violet-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Certifications Listed (seperate by ';')</label>
                <input
                  id="form-cand-certs"
                  type="text"
                  placeholder="e.g. AWS Certified Developer;CKA Kubernetes Developer"
                  value={newCertsStr}
                  onChange={(e) => setNewCertsStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-200 text-sm focus:border-violet-600 outline-none text-blue-400 font-mono"
                />
              </div>

              {formError && (
                <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {formError}
                </div>
              )}

              <button
                id="submit-manual-cand-btn"
                type="submit"
                disabled={formLoading}
                className="w-full py-3.5 mt-2 rounded-xl font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {formLoading ? "Saving Candidate..." : "Verify and Add Candidate to CSV"}
              </button>
            </form>
          </motion.div>
        ) : (
          /* Main Interactive Table */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
            id="candidates-grid-parent"
          >
            {/* Filter controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="candidates-filters-bar">
              {/* Search by Name */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
                <input
                  id="search-candidate-input"
                  type="text"
                  placeholder="Query Name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-slate-300 text-sm focus:border-violet-600 outline-none"
                />
              </div>

              {/* Filter by Exp */}
              <div className="relative">
                <Filter className="absolute left-3.5 top-3 text-slate-500" size={16} />
                <select
                  id="filter-exp-select"
                  value={expFilter}
                  onChange={(e) => setExpFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-slate-400 text-sm focus:border-violet-600 outline-none cursor-pointer appearance-none"
                >
                  <option value="">All Experience Levels</option>
                  <option value="junior">Junior (0-2 Yrs)</option>
                  <option value="mid">Mid-level (2.5-5.5 Yrs)</option>
                  <option value="senior">Senior (6+ Yrs)</option>
                </select>
              </div>

              {/* Filter by Education */}
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-3 text-slate-500" size={16} />
                <select
                  id="filter-edu-select"
                  value={eduFilter}
                  onChange={(e) => setEduFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-slate-400 text-sm focus:border-violet-600 outline-none cursor-pointer appearance-none"
                >
                  <option value="">All Degree Tiers</option>
                  <option value="phd">PhD / Doctorates</option>
                  <option value="master">Master's</option>
                  <option value="bachelor">Bachelor's</option>
                </select>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-2xl glass-container" id="cand-list-scrollable">
              <table className="w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-950/40">
                    <th 
                      onClick={() => handleSort("id")}
                      className="p-4 cursor-pointer hover:text-white transition-colors"
                    >
                      ID {sortBy === "id" && (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th 
                      onClick={() => handleSort("name")}
                      className="p-4 cursor-pointer hover:text-white transition-all"
                    >
                      Applicant {sortBy === "name" && (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="p-4">Education</th>
                    <th 
                      onClick={() => handleSort("experience")}
                      className="p-4 cursor-pointer hover:text-white transition-all"
                    >
                      Experience {sortBy === "experience" && (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th className="p-4">Extracted Technology stack</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                  {filteredCandidates.map((c) => (
                    <tr key={c.candidate_id} className="hover:bg-white/2 transition-colors duration-150">
                      <td className="p-4 font-mono text-xs text-indigo-400 font-semibold">{c.candidate_id}</td>
                      <td className="p-4 font-semibold text-white">{c.name}</td>
                      <td className="p-4 text-xs text-slate-400">{c.education}</td>
                      <td className="p-4 font-mono text-xs font-medium text-emerald-400">{c.experience} Yrs</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {c.skills.slice(0, 5).map((skill, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-violet-600/10 text-violet-300 border border-violet-500/15">
                              {skill}
                            </span>
                          ))}
                          {c.skills.length > 5 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              +{c.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredCandidates.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-500">
                        No candidates located under current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
