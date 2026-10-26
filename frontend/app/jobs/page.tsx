'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Sparkles,
  Bookmark,
  CheckCircle,
  AlertTriangle,
  FileText,
  Check,
} from 'lucide-react';
import { JobListing, User, JobFitAnalysisResult, Resume } from '@/types';
import { StorageService } from '@/lib/storage';
import { analyzeJobFit } from '@/lib/mlEngine';
import { Navbar } from '@/components/Navbar';
import { JobCard } from '@/components/jobs/JobCard';
import { JobFilter } from '@/components/jobs/JobFilter';
import { JobFitModal } from '@/components/JobFitModal';

export default function JobsPage() {
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
  const [jobs] = useState<JobListing[]>(() => StorageService.getJobs());
  const [selectedJob, setSelectedJob] = useState<JobListing>(jobs[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  const [workLocationType, setWorkLocationType] = useState<string>('all');
  const [experienceLevel, setExperienceLevel] = useState<string>('all');
  const [employmentType, setEmploymentType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'match' | 'salary' | 'recent'>('match');

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [coverNote, setCoverNote] = useState('');
  const [applyMessage, setApplyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(() =>
    new Set(StorageService.getSavedJobIds(currentUser.id))
  );

  const [selectedFitResult, setSelectedFitResult] = useState<JobFitAnalysisResult | null>(null);
  const [isFitModalOpen, setIsFitModalOpen] = useState(false);

  const [applicationCount, setApplicationCount] = useState<number>(() =>
    StorageService.getApplications(currentUser.id).length
  );

  const userResumes = useMemo(() => {
    return StorageService.getResumes(currentUser.id);
  }, [currentUser.id]);

  useEffect(() => {
    const handleSync = () => {
      const u = StorageService.getCurrentUser();
      setCurrentUser(u);
      setSavedJobIds(new Set(StorageService.getSavedJobIds(u.id)));
      setApplicationCount(StorageService.getApplications(u.id).length);
    };
    window.addEventListener('userChanged', handleSync);
    return () => window.removeEventListener('userChanged', handleSync);
  }, []);

  const handleSelectJob = (job: JobListing) => {
    setSelectedJob(job);
    StorageService.recordJobView(currentUser.id, job);
  };

  const handleToggleSave = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isSaved = StorageService.toggleSavedJob(currentUser.id, jobId);
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.add(jobId);
      else next.delete(jobId);
      return next;
    });
  };

  const jobFitScores = useMemo(() => {
    const scores = new Map<string, JobFitAnalysisResult>();
    const activeResume = userResumes[0] || currentUser.profile;
    for (const job of jobs) {
      scores.set(job.id, analyzeJobFit(activeResume, job));
    }
    return scores;
  }, [jobs, userResumes, currentUser.profile]);

  const filteredJobs = useMemo(() => {
    if (searchQuery.trim().length > 2) {
      StorageService.addSearchHistory(currentUser.id, {
        query: searchQuery.trim(),
        filters: {
          location: locationQuery || undefined,
          experienceLevel: experienceLevel !== 'all' ? experienceLevel : undefined,
          employmentType: employmentType !== 'all' ? employmentType : undefined,
        },
        resultCount: 0,
      });
    }

    return jobs
      .filter((job) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchTitle = job.title.toLowerCase().includes(q);
          const matchCompany = job.company.toLowerCase().includes(q);
          const matchSkill = job.requiredSkills.some((s) => s.toLowerCase().includes(q));
          const matchDesc = job.description.toLowerCase().includes(q);
          if (!matchTitle && !matchCompany && !matchSkill && !matchDesc) return false;
        }

        if (locationQuery) {
          const l = locationQuery.toLowerCase();
          const matchLocation = job.location.toLowerCase().includes(l);
          const matchLocType = job.workLocationType.toLowerCase().includes(l);
          if (!matchLocation && !matchLocType) return false;
        }

        if (workLocationType !== 'all' && job.workLocationType !== workLocationType) {
          return false;
        }
        if (experienceLevel !== 'all' && job.experienceLevel !== experienceLevel) {
          return false;
        }
        if (employmentType !== 'all' && job.employmentType !== employmentType) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') {
          const scoreA = jobFitScores.get(a.id)?.overallScore || 0;
          const scoreB = jobFitScores.get(b.id)?.overallScore || 0;
          return scoreB - scoreA;
        }
        if (sortBy === 'salary') {
          return b.salaryMax - a.salaryMax;
        }
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      });
  }, [
    jobs,
    searchQuery,
    locationQuery,
    workLocationType,
    experienceLevel,
    employmentType,
    sortBy,
    jobFitScores,
    currentUser.id,
  ]);

  const activeAnalysis = selectedJob ? jobFitScores.get(selectedJob.id) : null;
  const hasAppliedToSelected = selectedJob
    ? StorageService.hasApplied(currentUser.id, selectedJob.id)
    : false;

  const handleOpenApplyModal = () => {
    setApplyMessage(null);
    setCoverNote('');
    setSelectedResumeId(userResumes[0]?.id || '');
    setIsApplyModalOpen(true);
  };

  const handleConfirmApply = () => {
    if (!selectedJob) return;

    if (hasAppliedToSelected) {
      setApplyMessage({
        type: 'error',
        text: 'Duplicate application prevented: You have already applied for this role.',
      });
      return;
    }

    const resumeToUse = userResumes.find((r) => r.id === selectedResumeId) || userResumes[0];
    if (!resumeToUse) {
      setApplyMessage({
        type: 'error',
        text: 'Please create or select a resume before submitting your application.',
      });
      return;
    }

    const result = StorageService.submitApplication(
      currentUser.id,
      selectedJob,
      resumeToUse,
      coverNote
    );

    if (result.success) {
      setApplyMessage({ type: 'success', text: result.message });
      setApplicationCount(StorageService.getApplications(currentUser.id).length);
      setTimeout(() => {
        setIsApplyModalOpen(false);
      }, 1400);
    } else {
      setApplyMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <>
      <Navbar
        currentUser={currentUser}
        onUserChange={(u) => setCurrentUser(u)}
        applicationCount={applicationCount}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        <JobFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          locationQuery={locationQuery}
          setLocationQuery={setLocationQuery}
          workLocationType={workLocationType}
          setWorkLocationType={setWorkLocationType}
          experienceLevel={experienceLevel}
          setExperienceLevel={setExperienceLevel}
          employmentType={employmentType}
          setEmploymentType={setEmploymentType}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onReset={() => {
            setSearchQuery('');
            setLocationQuery('');
            setWorkLocationType('all');
            setExperienceLevel('all');
            setEmploymentType('all');
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Job Cards */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found
              </span>
              <span className="text-xs text-slate-400">
                AI Scored against profile
              </span>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-800">No matching jobs found</p>
                <p className="text-xs text-slate-500">Try adjusting your filters.</p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const analysis = jobFitScores.get(job.id);
                return (
                  <JobCard
                    key={job.id}
                    job={job}
                    score={analysis?.overallScore || 0}
                    isSelected={selectedJob?.id === job.id}
                    isSaved={savedJobIds.has(job.id)}
                    userSkills={currentUser.profile.skills}
                    onSelect={handleSelectJob}
                    onToggleSave={handleToggleSave}
                  />
                );
              })
            )}
          </div>

          {/* Right Column: Detailed Job View */}
          <div className="lg:col-span-7 sticky top-20">
            {selectedJob ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div className="border-b border-slate-200 pb-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-xl font-bold text-slate-900 leading-tight">
                        {selectedJob.title}
                      </h1>
                      <div className="flex items-center gap-2 text-sm text-slate-700 font-medium mt-1">
                        <Building className="w-4 h-4 text-slate-400" />
                        <span>{selectedJob.company}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500">{selectedJob.department}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {selectedJob.location} ({selectedJob.workLocationType})
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                          ${selectedJob.salaryMin.toLocaleString()} - ${selectedJob.salaryMax.toLocaleString()} / year
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          {selectedJob.employmentType} ({selectedJob.experienceLevel})
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleToggleSave(selectedJob.id, e)}
                      className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                    >
                      <Bookmark
                        className={`w-5 h-5 ${
                          savedJobIds.has(selectedJob.id) ? 'fill-blue-600 text-blue-600' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-5">
                    <button
                      type="button"
                      onClick={handleOpenApplyModal}
                      disabled={hasAppliedToSelected}
                      className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg shadow-sm transition-all ${
                        hasAppliedToSelected
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                      }`}
                    >
                      {hasAppliedToSelected ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          Already Applied
                        </>
                      ) : (
                        <>
                          <Briefcase className="w-4 h-4" />
                          Apply Now
                        </>
                      )}
                    </button>

                    {activeAnalysis && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFitResult(activeAnalysis);
                          setIsFitModalOpen(true);
                          StorageService.saveJobFitAnalysis(currentUser.id, activeAnalysis);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200/80 transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        View AI Job-Fit Breakdown ({activeAnalysis.overallScore}%)
                      </button>
                    )}

                    <Link
                      href={`/resumes?targetJobId=${selectedJob.id}`}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-slate-500" />
                      Tailor Resume
                    </Link>
                  </div>
                </div>

                {/* AI Fit Quick Snapshot */}
                {activeAnalysis && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Quick Match Snapshot: {activeAnalysis.overallScore}% Fit
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFitResult(activeAnalysis);
                          setIsFitModalOpen(true);
                          StorageService.saveJobFitAnalysis(currentUser.id, activeAnalysis);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Full Report →
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {activeAnalysis.explanation}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Role Overview
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedJob.description}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Key Responsibilities
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {selectedJob.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Required Competencies & Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.requiredSkills.map((skill) => {
                      const isMatched = activeAnalysis?.matchedSkills.includes(skill);
                      return (
                        <span
                          key={skill}
                          className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border font-medium ${
                            isMatched
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {isMatched && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {selectedJob.preferredSkills.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Bonus / Preferred Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.preferredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-600"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Apply Modal */}
        {isApplyModalOpen && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Submit Job Application
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applying for <strong className="text-slate-800">{selectedJob.title}</strong> at {selectedJob.company}
                </p>
              </div>

              {applyMessage && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                    applyMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {applyMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{applyMessage.text}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Attach Resume
                </label>
                {userResumes.length > 0 ? (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full text-sm p-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {userResumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.title} ({resume.templateId.toUpperCase()})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    No saved resumes found. We will generate an application from your profile.
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Short Note / Cover Note (Optional)
                </label>
                <textarea
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  rows={3}
                  placeholder="Mention why you are excited about this role..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApply}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Confirm & Submit Application
                </button>
              </div>
            </div>
          </div>
        )}

        <JobFitModal
          isOpen={isFitModalOpen}
          onClose={() => setIsFitModalOpen(false)}
          result={selectedFitResult}
        />
      </main>
    </>
  );
}
