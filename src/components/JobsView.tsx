import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Briefcase, MapPin, Award, GraduationCap, Plus, Save, Terminal, FolderOpen } from "lucide-react";
import { Job } from "../types";

interface JobsViewProps {
  jobs: Job[];
  onAddJob: (j: Job) => void;
}

export default function JobsView({ jobs, onAddJob }: JobsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newId, setNewId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newExp, setNewExp] = useState("");
  const [newEdu, setNewEdu] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Submit trigger to save manual Jobs
  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newTitle || !newSkills) {
      setFormError("Job ID, Title, and Required Skills are mandatory.");
      return;
    }

    if (jobs.some(j => j.job_id.toUpperCase() === newId.toUpperCase())) {
      setFormError("Job ID already exists in system listings.");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    const newJob: Job = {
      job_id: newId.trim().toUpperCase(),
      title: newTitle.trim(),
      required_skills: newSkills.split(";").map(s => s.trim()).filter(Boolean),
      minimum_experience: parseFloat(newExp) || 0.0,
      preferred_education: newEdu.trim() || "B.S. in Computer Science"
    };

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create job Opening index.");
      }

      onAddJob(newJob);
      setShowAddForm(false);
      
      // Reset variables
      setNewId("");
      setNewTitle("");
      setNewSkills("");
      setNewExp("");
      setNewEdu("");
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
      id="jobs-view-container"
    >
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-900 pb-4" id="jobs-header-row">
        <div>
          <h2 className="text-2xl font-bold text-white display-title">Job Openings</h2>
          <p className="text-slate-400 text-sm mt-0.5 font-sans">
            Configured job requirements database linked with <code className="text-cyan-400 font-mono">jobs.csv</code>.
          </p>
        </div>
        <button
          id="toggle-job-form-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm shadow-md"
        >
          {showAddForm ? "View Openings Grid" : <><Plus size={16} /> Add Job Openings</>}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showAddForm ? (
          /* Manual Job Creation form box */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 rounded-2xl glass-container max-w-xl mx-auto"
            id="job-addition-form"
          >
            <h3 className="text-lg font-bold text-white display-title flex items-center gap-2 mb-4 border-b border-slate-900 pb-2">
              <Terminal className="text-cyan-400" size={18} /> Configure New Job Criteria
            </h3>
            <form onSubmit={handleAddJob} className="space-y-4 text-sm text-slate-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Job ID *</label>
                  <input
                    id="form-job-id"
                    type="text"
                    required
                    placeholder="e.g. JOB06"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-200 text-sm focus:border-cyan-600 outline-none animate-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Position Title *</label>
                  <input
                    id="form-job-title"
                    type="text"
                    required
                    placeholder="e.g. Senior DevOps Specialist"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-200 text-sm focus:border-cyan-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Min Experience Years</label>
                  <input
                    id="form-job-exp"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 5"
                    value={newExp}
                    onChange={(e) => setNewExp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-200 text-sm focus:border-cyan-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Preferred Degree</label>
                  <input
                    id="form-job-edu"
                    type="text"
                    placeholder="e.g. M.S. in Computer Science"
                    value={newEdu}
                    onChange={(e) => setNewEdu(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-200 text-sm focus:border-cyan-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Required Skills (split by ';')</label>
                <input
                  id="form-job-skills"
                  type="text"
                  required
                  placeholder="e.g. Python;Docker;AWS;Kubernetes;APIs"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-slate-200 text-sm focus:border-cyan-600 outline-none text-cyan-400 font-mono"
                />
              </div>

              {formError && (
                <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                  {formError}
                </div>
              )}

              <button
                id="submit-manual-job-btn"
                type="submit"
                disabled={formLoading}
                className="w-full py-3.5 mt-2 rounded-xl font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {formLoading ? "Saving openings..." : <><Save size={16} /> Save Vacancy to CSV</>}
              </button>
            </form>
          </motion.div>
        ) : (
          /* Card grid display of listings */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="jobs-grid">
            {jobs.map((job) => (
              <motion.div
                key={job.job_id}
                layout
                className="p-6 rounded-2xl glass-card flex flex-col justify-between h-[300px]"
                id={`job-card-${job.job_id}`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-900 pb-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-600/10 text-cyan-400 uppercase tracking-wider">
                        {job.job_id}
                      </span>
                      <h4 className="text-lg font-bold text-white leading-snug display-title lines-clamp-1">{job.title}</h4>
                    </div>
                    <div className="p-2 bg-slate-950/80 rounded-xl text-slate-400 border border-slate-900">
                      <Briefcase size={18} />
                    </div>
                  </div>

                  {/* Requirements details lists */}
                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Award className="text-emerald-400" size={14} />
                      <span className="font-medium text-slate-300">Min. Experience:</span> {job.minimum_experience} Years
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="text-blue-400" size={14} />
                      <span className="font-medium text-slate-300">Degree Focus:</span> {job.preferred_education}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Required tech capabilities:</span>
                    <div className="flex flex-wrap gap-1">
                      {job.required_skills.slice(0, 4).map((skill, i) => (
                        <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          {skill}
                        </span>
                      ))}
                      {job.required_skills.length > 4 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-500 font-medium">
                          +{job.required_skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {jobs.length === 0 && (
              <div className="p-12 text-center col-span-full text-slate-500 flex flex-col items-center justify-center gap-2">
                <FolderOpen size={36} />
                <span>No active jobs listed. Create one above to initialize testing cascades!</span>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
