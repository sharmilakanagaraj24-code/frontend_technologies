import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Printer,
  Save,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  Target,
  Download,
  Upload,
  AlertCircle,
  Eye,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import {
  Resume,
  User,
  JobListing,
  ResumeSuggestion,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  CertificationItem,
} from '../types';
import { StorageService } from '../services/storage';
import { analyzeJobFit } from '../services/mlEngine';
import { ResumePreview } from './ResumePreview';

interface ResumeBuilderProps {
  currentUser: User;
  targetedJob?: JobListing | null;
  onClearTargetedJob?: () => void;
  pendingSuggestions?: ResumeSuggestion[];
  onClearPendingSuggestions?: () => void;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({
  currentUser,
  targetedJob,
  onClearTargetedJob,
  pendingSuggestions = [],
  onClearPendingSuggestions,
}) => {
  const [resumes, setResumes] = useState<Resume[]>(() =>
    StorageService.getResumes(currentUser.id)
  );

  const [activeResume, setActiveResume] = useState<Resume>(() => {
    const list = StorageService.getResumes(currentUser.id);
    return list[0] || {
      id: `res-${Date.now()}`,
      userId: currentUser.id,
      title: 'Software Developer Resume',
      templateId: 'modern',
      personalDetails: {
        fullName: currentUser.fullName,
        email: currentUser.email,
        phone: currentUser.profile.phone || '+1 (555) 000-0000',
        location: currentUser.profile.location || 'Remote',
        title: currentUser.profile.title || 'Software Developer',
        summary: currentUser.profile.bio || '',
      },
      skills: [...currentUser.profile.skills],
      education: [...currentUser.profile.education],
      experience: [...currentUser.profile.experience],
      projects: [...currentUser.profile.projects],
      certifications: [...currentUser.profile.certifications],
      updatedAt: new Date().toISOString(),
    };
  });

  const [availableJobs] = useState<JobListing[]>(() => StorageService.getJobs());
  const [selectedTargetJobId, setSelectedTargetJobId] = useState<string>(
    targetedJob?.id || ''
  );

  const [activeSection, setActiveSection] = useState<
    'personal' | 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'certifications'
  >('personal');

  const [newSkillInput, setNewSkillInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [aiSuggestionsModal, setAiSuggestionsModal] = useState<ResumeSuggestion[] | null>(null);

  // Set target job when prop updates
  useEffect(() => {
    if (targetedJob) {
      setSelectedTargetJobId(targetedJob.id);
    }
  }, [targetedJob]);

  // Apply pending suggestions if passed from JobFitModal
  useEffect(() => {
    if (pendingSuggestions && pendingSuggestions.length > 0) {
      applySuggestions(pendingSuggestions);
      if (onClearPendingSuggestions) onClearPendingSuggestions();
    }
  }, [pendingSuggestions]);

  const activeTargetJob = availableJobs.find((j) => j.id === selectedTargetJobId);

  const applySuggestions = (suggestionsToApply: ResumeSuggestion[]) => {
    let updated = { ...activeResume };

    for (const sug of suggestionsToApply) {
      if (sug.section === 'skills' && sug.suggestedText) {
        const skillsToAdd = sug.suggestedText.split(',').map((s) => s.trim());
        const skillSet = new Set(updated.skills);
        skillsToAdd.forEach((s) => skillSet.add(s));
        updated.skills = Array.from(skillSet);
      } else if (sug.section === 'summary' && sug.suggestedText) {
        updated.personalDetails = {
          ...updated.personalDetails,
          summary: sug.suggestedText,
        };
      } else if (sug.section === 'projects' && sug.suggestedText && updated.projects.length > 0) {
        updated.projects[0] = {
          ...updated.projects[0],
          description: sug.suggestedText,
        };
      }
    }

    setActiveResume(updated);
    StorageService.saveResume(updated);
    setSaveStatus('Applied AI suggestions & saved!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleSave = () => {
    const saved = StorageService.saveResume(activeResume);
    setResumes(StorageService.getResumes(currentUser.id));
    setActiveResume(saved);
    setSaveStatus('Resume saved successfully!');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleCreateNewResume = () => {
    const newResume: Resume = {
      id: `res-${Date.now()}`,
      userId: currentUser.id,
      title: `Resume v${resumes.length + 1} (${new Date().toLocaleDateString()})`,
      templateId: 'modern',
      personalDetails: {
        fullName: currentUser.fullName,
        email: currentUser.email,
        phone: currentUser.profile.phone || '',
        location: currentUser.profile.location || '',
        title: currentUser.profile.title || 'Software Engineer',
        summary: currentUser.profile.bio || '',
        linkedin: currentUser.profile.linkedinUrl || '',
        github: currentUser.profile.githubUrl || '',
        website: currentUser.profile.portfolioUrl || '',
      },
      skills: [...currentUser.profile.skills],
      education: [...currentUser.profile.education],
      experience: [...currentUser.profile.experience],
      projects: [...currentUser.profile.projects],
      certifications: [...currentUser.profile.certifications],
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveResume(newResume);
    const updatedList = StorageService.getResumes(currentUser.id);
    setResumes(updatedList);
    setActiveResume(newResume);
    setSaveStatus('Created new resume template!');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const skillName = newSkillInput.trim();
    if (!activeResume.skills.includes(skillName)) {
      setActiveResume((prev) => ({
        ...prev,
        skills: [...prev.skills, skillName],
      }));
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setActiveResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // Run AI enhancement analysis against targeted job
  const handleRunAiEnhancement = () => {
    if (!activeTargetJob) return;
    const analysis = analyzeJobFit(activeResume, activeTargetJob);
    setAiSuggestionsModal(analysis.suggestions);
  };

  // Add items
  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      jobTitle: 'Software Engineer',
      company: 'Tech Company',
      location: 'Remote',
      startDate: '2024-01',
      endDate: '2025-01',
      current: true,
      description: '• Developed scalable REST APIs and client workflows.\n• Optimized database performance and resolved critical production issues.',
      technologiesUsed: ['Java', 'React'],
    };
    setActiveResume((prev) => ({
      ...prev,
      experience: [newExp, ...prev.experience],
    }));
  };

  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: 'Full Stack Web Platform',
      role: 'Lead Developer',
      link: 'github.com/my-project',
      description: 'Built a high-performance web service with REST endpoints and responsive React frontend.',
      technologies: ['React', 'TypeScript', 'Node.js'],
    };
    setActiveResume((prev) => ({
      ...prev,
      projects: [newProj, ...prev.projects],
    }));
  };

  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      institution: 'State University',
      location: 'City, State',
      startDate: '2022',
      endDate: '2026',
      current: false,
    };
    setActiveResume((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Controls & Template Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Active Resume Selector & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={activeResume.title}
                onChange={(e) =>
                  setActiveResume((prev) => ({ ...prev, title: e.target.value }))
                }
                className="font-bold text-slate-900 text-sm hover:border-slate-300 border border-transparent px-1.5 py-0.5 rounded focus:border-blue-500 focus:outline-hidden"
              />
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                ATS-Compliant
              </span>
            </div>
            <p className="text-xs text-slate-400 px-1.5">
              Updated {new Date(activeResume.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Template Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
          <span className="text-slate-500 font-semibold px-2">Template:</span>
          {[
            { id: 'modern', label: 'Modern Tech' },
            { id: 'classic', label: 'Classic ATS' },
            { id: 'executive', label: 'Executive' },
            { id: 'minimal', label: 'Minimal' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() =>
                setActiveResume((prev) => ({
                  ...prev,
                  templateId: t.id as any,
                }))
              }
              className={`px-3 py-1.5 font-medium rounded-lg transition-colors ${
                activeResume.templateId === t.id
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Action Buttons: Save & Print/Download */}
        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> {saveStatus}
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>

          <button
            onClick={handleCreateNewResume}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Resume
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Download PDF / Print
          </button>
        </div>
      </div>

      {/* Target Job Optimizer Bar */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-blue-950 uppercase tracking-wider block">
              Target Job for AI ATS Optimization
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={selectedTargetJobId}
                onChange={(e) => setSelectedTargetJobId(e.target.value)}
                className="text-xs p-1.5 border border-blue-300 rounded-lg bg-white text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Select a Job from Portal to Tailor Against --</option>
                {availableJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.company})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {activeTargetJob && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAiEnhancement}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Tailored AI Suggestions
            </button>
          </div>
        )}
      </div>

      {/* Main Two-Column Builder: Left = Editor, Right = Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Editor Sections */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
          {/* Section Navigation Tabs */}
          <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-3 text-xs">
            {[
              { id: 'personal', label: 'Contact' },
              { id: 'summary', label: 'Summary' },
              { id: 'skills', label: `Skills (${activeResume.skills.length})` },
              { id: 'experience', label: `Experience (${activeResume.experience.length})` },
              { id: 'projects', label: `Projects (${activeResume.projects.length})` },
              { id: 'education', label: `Education (${activeResume.education.length})` },
              { id: 'certifications', label: 'Certifications' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeSection === tab.id
                    ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Section 1: Contact Details */}
          {activeSection === 'personal' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Personal Information
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-600 block mb-0.5">Full Name</label>
                  <input
                    type="text"
                    value={activeResume.personalDetails.fullName}
                    onChange={(e) =>
                      setActiveResume((prev) => ({
                        ...prev,
                        personalDetails: { ...prev.personalDetails, fullName: e.target.value },
                      }))
                    }
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-0.5">Professional Title</label>
                  <input
                    type="text"
                    value={activeResume.personalDetails.title}
                    onChange={(e) =>
                      setActiveResume((prev) => ({
                        ...prev,
                        personalDetails: { ...prev.personalDetails, title: e.target.value },
                      }))
                    }
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 block mb-0.5">Email</label>
                    <input
                      type="email"
                      value={activeResume.personalDetails.email}
                      onChange={(e) =>
                        setActiveResume((prev) => ({
                          ...prev,
                          personalDetails: { ...prev.personalDetails, email: e.target.value },
                        }))
                      }
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-0.5">Phone</label>
                    <input
                      type="text"
                      value={activeResume.personalDetails.phone}
                      onChange={(e) =>
                        setActiveResume((prev) => ({
                          ...prev,
                          personalDetails: { ...prev.personalDetails, phone: e.target.value },
                        }))
                      }
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-600 block mb-0.5">Location</label>
                  <input
                    type="text"
                    value={activeResume.personalDetails.location}
                    onChange={(e) =>
                      setActiveResume((prev) => ({
                        ...prev,
                        personalDetails: { ...prev.personalDetails, location: e.target.value },
                      }))
                    }
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 block mb-0.5">LinkedIn Profile</label>
                    <input
                      type="text"
                      value={activeResume.personalDetails.linkedin || ''}
                      onChange={(e) =>
                        setActiveResume((prev) => ({
                          ...prev,
                          personalDetails: { ...prev.personalDetails, linkedin: e.target.value },
                        }))
                      }
                      placeholder="linkedin.com/in/..."
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-0.5">GitHub / Portfolio</label>
                    <input
                      type="text"
                      value={activeResume.personalDetails.github || ''}
                      onChange={(e) =>
                        setActiveResume((prev) => ({
                          ...prev,
                          personalDetails: { ...prev.personalDetails, github: e.target.value },
                        }))
                      }
                      placeholder="github.com/..."
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Summary */}
          {activeSection === 'summary' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Professional Summary
                </h3>
                {activeTargetJob && (
                  <button
                    onClick={() => {
                      const tailored = `Results-driven developer with proven expertise in ${activeResume.skills.slice(0, 4).join(', ')}. Strong academic and project foundation in ${activeTargetJob.title} competencies, with experience delivering production-quality code.`;
                      setActiveResume((prev) => ({
                        ...prev,
                        personalDetails: { ...prev.personalDetails, summary: tailored },
                      }));
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Tailor for Job
                  </button>
                )}
              </div>
              <textarea
                value={activeResume.personalDetails.summary}
                onChange={(e) =>
                  setActiveResume((prev) => ({
                    ...prev,
                    personalDetails: { ...prev.personalDetails, summary: e.target.value },
                  }))
                }
                rows={5}
                className="w-full text-xs p-3 border border-slate-200 rounded-lg leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                placeholder="2-4 sentences highlighting your background, primary technical skills, and career objective..."
              />
            </div>
          )}

          {/* Section 3: Skills */}
          {activeSection === 'skills' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Technical Skills ({activeResume.skills.length})
                </h3>
              </div>

              {/* Add Skill form */}
              <form onSubmit={handleAddSkill} className="flex gap-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  placeholder="e.g. Docker, Python, Spring Boot..."
                  className="flex-1 text-xs p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
                >
                  Add
                </button>
              </form>

              {/* Tag Cloud */}
              <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {activeResume.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-md font-medium text-slate-800 shadow-2xs group"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick Suggestions from Target Job */}
              {activeTargetJob && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-amber-900 block">
                    Skills Required by {activeTargetJob.company}:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {activeTargetJob.requiredSkills.map((reqSkill) => {
                      const alreadyHas = activeResume.skills.some(
                        (s) => s.toLowerCase() === reqSkill.toLowerCase()
                      );
                      if (alreadyHas) return null;
                      return (
                        <button
                          key={reqSkill}
                          type="button"
                          onClick={() =>
                            setActiveResume((prev) => ({
                              ...prev,
                              skills: [...prev.skills, reqSkill],
                            }))
                          }
                          className="text-[11px] px-2 py-0.5 bg-white border border-amber-300 text-amber-900 rounded hover:bg-amber-100 flex items-center gap-1 font-medium"
                        >
                          <Plus className="w-2.5 h-2.5" /> {reqSkill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 4: Experience */}
          {activeSection === 'experience' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Work Experience & Internships
                </h3>
                <button
                  onClick={handleAddExperience}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </button>
              </div>

              <div className="space-y-4">
                {activeResume.experience.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">Position #{idx + 1}</span>
                      <button
                        onClick={() =>
                          setActiveResume((prev) => ({
                            ...prev,
                            experience: prev.experience.filter((e) => e.id !== exp.id),
                          }))
                        }
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={exp.jobTitle}
                        onChange={(e) => {
                          const updated = [...activeResume.experience];
                          updated[idx].jobTitle = e.target.value;
                          setActiveResume((prev) => ({ ...prev, experience: updated }));
                        }}
                        placeholder="Job Title"
                        className="p-1.5 border border-slate-200 rounded bg-white"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...activeResume.experience];
                          updated[idx].company = e.target.value;
                          setActiveResume((prev) => ({ ...prev, experience: updated }));
                        }}
                        placeholder="Company"
                        className="p-1.5 border border-slate-200 rounded bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => {
                          const updated = [...activeResume.experience];
                          updated[idx].startDate = e.target.value;
                          setActiveResume((prev) => ({ ...prev, experience: updated }));
                        }}
                        placeholder="Start Date (e.g. 2024-06)"
                        className="p-1.5 border border-slate-200 rounded bg-white"
                      />
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => {
                          const updated = [...activeResume.experience];
                          updated[idx].endDate = e.target.value;
                          setActiveResume((prev) => ({ ...prev, experience: updated }));
                        }}
                        placeholder="End Date (or 'Present')"
                        className="p-1.5 border border-slate-200 rounded bg-white"
                      />
                    </div>

                    <textarea
                      value={exp.description}
                      onChange={(e) => {
                        const updated = [...activeResume.experience];
                        updated[idx].description = e.target.value;
                        setActiveResume((prev) => ({ ...prev, experience: updated }));
                      }}
                      rows={3}
                      placeholder="Bullet points describing achievements and tech stack..."
                      className="w-full p-2 border border-slate-200 rounded bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Projects */}
          {activeSection === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Technical Projects
                </h3>
                <button
                  onClick={handleAddProject}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>

              <div className="space-y-4">
                {activeResume.projects.map((proj, idx) => (
                  <div
                    key={proj.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">Project #{idx + 1}</span>
                      <button
                        onClick={() =>
                          setActiveResume((prev) => ({
                            ...prev,
                            projects: prev.projects.filter((p) => p.id !== proj.id),
                          }))
                        }
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...activeResume.projects];
                          updated[idx].title = e.target.value;
                          setActiveResume((prev) => ({ ...prev, projects: updated }));
                        }}
                        placeholder="Project Title"
                        className="p-1.5 border border-slate-200 rounded bg-white"
                      />
                      <input
                        type="text"
                        value={proj.link || ''}
                        onChange={(e) => {
                          const updated = [...activeResume.projects];
                          updated[idx].link = e.target.value;
                          setActiveResume((prev) => ({ ...prev, projects: updated }));
                        }}
                        placeholder="Project Link / GitHub"
                        className="p-1.5 border border-slate-200 rounded bg-white"
                      />
                    </div>

                    <textarea
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...activeResume.projects];
                        updated[idx].description = e.target.value;
                        setActiveResume((prev) => ({ ...prev, projects: updated }));
                      }}
                      rows={2}
                      placeholder="Description of architecture and impact..."
                      className="w-full p-2 border border-slate-200 rounded bg-white"
                    />

                    <input
                      type="text"
                      value={proj.technologies.join(', ')}
                      onChange={(e) => {
                        const updated = [...activeResume.projects];
                        updated[idx].technologies = e.target.value.split(',').map((s) => s.trim());
                        setActiveResume((prev) => ({ ...prev, projects: updated }));
                      }}
                      placeholder="Technologies used (comma separated: Java, React, MySQL)"
                      className="w-full p-1.5 border border-slate-200 rounded bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 6: Education */}
          {activeSection === 'education' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Education History
                </h3>
                <button
                  onClick={handleAddEducation}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Degree
                </button>
              </div>

              <div className="space-y-3">
                {activeResume.education.map((edu, idx) => (
                  <div
                    key={edu.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">Degree #{idx + 1}</span>
                      <button
                        onClick={() =>
                          setActiveResume((prev) => ({
                            ...prev,
                            education: prev.education.filter((e) => e.id !== edu.id),
                          }))
                        }
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...activeResume.education];
                          updated[idx].degree = e.target.value;
                          setActiveResume((prev) => ({ ...prev, education: updated }));
                        }}
                        placeholder="Degree (e.g. B.S. Computer Science)"
                        className="p-1.5 border border-slate-200 rounded bg-white"
                      />
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...activeResume.education];
                          updated[idx].institution = e.target.value;
                          setActiveResume((prev) => ({ ...prev, education: updated }));
                        }}
                        placeholder="Institution"
                        className="p-1.5 border border-slate-200 rounded bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 7: Certifications */}
          {activeSection === 'certifications' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Certifications & Badges
              </h3>
              <p className="text-xs text-slate-500">
                Add relevant certifications like AWS Certified, Oracle Java SE, or Coursera credentials.
              </p>
              {activeResume.certifications.map((cert, idx) => (
                <div key={cert.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{cert.name}</span>
                    <p className="text-slate-500">{cert.issuer} ({cert.issueDate})</p>
                  </div>
                  <button
                    onClick={() =>
                      setActiveResume((prev) => ({
                        ...prev,
                        certifications: prev.certifications.filter((c) => c.id !== cert.id),
                      }))
                    }
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Live Printable ATS Resume Preview */}
        <div className="lg:col-span-7 sticky top-20">
          <div className="flex items-center justify-between pb-2 px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" /> Live ATS Preview
            </span>
            <span className="text-xs text-slate-400">
              Interactive updates in real-time
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl shadow-lg border border-slate-200 bg-slate-100 p-2 sm:p-4">
            <ResumePreview
              resume={activeResume}
              templateId={activeResume.templateId}
            />
          </div>
        </div>
      </div>

      {/* AI Suggestions Modal for Resume Builder */}
      {aiSuggestionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Targeted Suggestions for {activeTargetJob?.title}
                </h3>
              </div>
              <button
                onClick={() => setAiSuggestionsModal(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              {aiSuggestionsModal.map((sug) => (
                <div key={sug.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{sug.title}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
                      {sug.impact}
                    </span>
                  </div>
                  <p className="text-slate-600">{sug.issue}</p>
                  {sug.suggestedText && (
                    <div className="p-2 bg-white rounded border border-slate-200 font-mono text-[11px] text-slate-800">
                      {sug.suggestedText}
                    </div>
                  )}
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        applySuggestions([sug]);
                        setAiSuggestionsModal((prev) =>
                          prev ? prev.filter((s) => s.id !== sug.id) : null
                        );
                      }}
                      className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700"
                    >
                      Apply This Change
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setAiSuggestionsModal(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
