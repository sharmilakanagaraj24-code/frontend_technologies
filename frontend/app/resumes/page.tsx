'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Sparkles,
  Printer,
  Save,
  Plus,
  Check,
  Target,
  Eye,
} from 'lucide-react';
import {
  Resume,
  User,
  JobListing,
  ResumeSuggestion,
} from '@/types';
import { StorageService } from '@/lib/storage';
import { analyzeJobFit } from '@/lib/mlEngine';
import { Navbar } from '@/components/Navbar';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { ResumeEditor } from '@/components/resume/ResumeEditor';
import { TemplateSelector } from '@/components/resume/TemplateSelector';

function ResumeBuilderContent() {
  const searchParams = useSearchParams();
  const targetJobIdFromQuery = searchParams ? searchParams.get('targetJobId') : null;

  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
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
    targetJobIdFromQuery || ''
  );

  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [aiSuggestionsModal, setAiSuggestionsModal] = useState<ResumeSuggestion[] | null>(null);

  useEffect(() => {
    if (targetJobIdFromQuery) {
      setSelectedTargetJobId(targetJobIdFromQuery);
    }
  }, [targetJobIdFromQuery]);

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
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleRunAiEnhancement = () => {
    if (!activeTargetJob) return;
    const analysis = analyzeJobFit(activeResume, activeTargetJob);
    setAiSuggestionsModal(analysis.suggestions);
  };

  return (
    <>
      <Navbar currentUser={currentUser} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Top Controls & Template Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
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

          <TemplateSelector
            currentTemplate={activeResume.templateId}
            onSelectTemplate={(tpl) =>
              setActiveResume((prev) => ({ ...prev, templateId: tpl }))
            }
          />

          <div className="flex items-center gap-2">
            {saveStatus && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> {saveStatus}
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>

            <button
              type="button"
              onClick={handleCreateNewResume}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Resume
            </button>

            <button
              type="button"
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
                type="button"
                onClick={handleRunAiEnhancement}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 shadow-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Tailored AI Suggestions
              </button>
            </div>
          )}
        </div>

        {/* Two-Column: Editor & Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <ResumeEditor
              activeResume={activeResume}
              setActiveResume={setActiveResume}
              activeTargetJob={activeTargetJob}
            />
          </div>

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

        {/* AI Suggestions Modal */}
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
                  type="button"
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
                        type="button"
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
                  type="button"
                  onClick={() => setAiSuggestionsModal(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default function ResumesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Resume Builder...</div>}>
      <ResumeBuilderContent />
    </Suspense>
  );
}
