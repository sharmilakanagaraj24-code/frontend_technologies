'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Search,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { User, JobListing, JobFitAnalysisResult } from '@/types';
import { StorageService } from '@/lib/storage';
import { Navbar } from '@/components/Navbar';
import { StatCards } from '@/components/dashboard/StatCards';
import { PipelineTracker } from '@/components/dashboard/PipelineTracker';
import { JobFitModal } from '@/components/JobFitModal';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
  const [jobs] = useState<JobListing[]>(() => StorageService.getJobs());
  const [applications, setApplications] = useState(() => StorageService.getApplications(currentUser.id));
  const [savedJobIds, setSavedJobIds] = useState(() => StorageService.getSavedJobIds(currentUser.id));
  const [searchHistory, setSearchHistory] = useState(() => StorageService.getSearchHistory(currentUser.id));
  const [viewedJobs, setViewedJobs] = useState(() => StorageService.getViewedJobs(currentUser.id));
  const [fitAnalyses, setFitAnalyses] = useState(() => StorageService.getJobFitAnalyses(currentUser.id));
  const [selectedFitResult, setSelectedFitResult] = useState<JobFitAnalysisResult | null>(null);
  const [isFitModalOpen, setIsFitModalOpen] = useState(false);

  useEffect(() => {
    const handleSync = () => {
      const u = StorageService.getCurrentUser();
      setCurrentUser(u);
      setApplications(StorageService.getApplications(u.id));
      setSavedJobIds(StorageService.getSavedJobIds(u.id));
      setSearchHistory(StorageService.getSearchHistory(u.id));
      setViewedJobs(StorageService.getViewedJobs(u.id));
      setFitAnalyses(StorageService.getJobFitAnalyses(u.id));
    };
    window.addEventListener('userChanged', handleSync);
    return () => window.removeEventListener('userChanged', handleSync);
  }, []);

  const statusCounts = useMemo(() => {
    const counts = { applied: 0, underReview: 0, shortlisted: 0, interview: 0, rejected: 0 };
    applications.forEach((a) => {
      if (a.status === 'Applied') counts.applied++;
      else if (a.status === 'Under Review') counts.underReview++;
      else if (a.status === 'Shortlisted') counts.shortlisted++;
      else if (a.status === 'Interview Scheduled') counts.interview++;
      else if (a.status === 'Rejected') counts.rejected++;
    });
    return counts;
  }, [applications]);

  const resumeScore = useMemo(() => {
    let score = 0;
    const p = currentUser.profile;
    if (p.fullName && p.email) score += 20;
    if (p.skills && p.skills.length >= 5) score += 25;
    if (p.experience && p.experience.length > 0) score += 20;
    if (p.education && p.education.length > 0) score += 20;
    if (p.projects && p.projects.length > 0) score += 15;
    return Math.min(100, score);
  }, [currentUser.profile]);

  return (
    <>
      <Navbar
        currentUser={currentUser}
        onUserChange={(u) => setCurrentUser(u)}
        applicationCount={applications.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-200 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" /> Next.js AI-Driven Career Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser.fullName.split(' ')[0]}!
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              Your career cockpit: explore matching jobs, review AI skill-gap predictions, and fine-tune your ATS resume with Scikit-learn TF-IDF analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/jobs"
              className="px-4 py-2.5 bg-white text-slate-900 hover:bg-blue-50 text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Explore All Jobs
            </Link>
            <Link
              href="/resumes"
              className="px-4 py-2.5 bg-blue-700/80 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl border border-blue-500/40 transition-all"
            >
              Open Resume Builder
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <StatCards
          availableJobsCount={jobs.length}
          recommendedCount={Math.max(3, Math.min(jobs.length, 6))}
          applicationsCount={applications.length}
          savedJobsCount={savedJobIds.length}
          interviewCount={statusCounts.interview}
        />

        {/* Pipeline & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <PipelineTracker
              appliedCount={statusCounts.applied}
              underReviewCount={statusCounts.underReview}
              shortlistedCount={statusCounts.shortlisted}
              interviewCount={statusCounts.interview}
            />

            {/* Recent AI Job-Fit Analyses */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Recent Job-Fit Prediction Reports
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Scikit-learn TF-IDF text similarity and skill gap reports
                  </p>
                </div>
                <Link
                  href="/jobs"
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Analyze More Jobs
                </Link>
              </div>

              {fitAnalyses.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-700">No recent analyses run yet</p>
                  <p className="text-xs text-slate-500">
                    Select any job in the portal and click &quot;View AI Job-Fit Breakdown&quot; to calculate match scores and skill gaps.
                  </p>
                  <Link
                    href="/jobs"
                    className="inline-block px-3 py-1.5 text-xs bg-blue-600 text-white font-semibold rounded-lg"
                  >
                    Go to Jobs Portal
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {fitAnalyses.slice(0, 4).map((analysis) => (
                    <div
                      key={analysis.jobId}
                      className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {analysis.jobTitle}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            ({analysis.company})
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                          {analysis.explanation}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>{analysis.matchedSkills.length} matched skills</span>
                          <span>·</span>
                          <span className="text-rose-600 font-medium">
                            {analysis.missingSkills.length} skill gaps
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div
                          className={`text-sm font-extrabold px-3 py-1 rounded-lg border ${
                            analysis.overallScore >= 80
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : analysis.overallScore >= 60
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {analysis.overallScore}%
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFitResult(analysis);
                            setIsFitModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          View Breakdown
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Viewed Jobs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Recently Viewed Jobs ({viewedJobs.length})
              </h2>

              {viewedJobs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No job views recorded yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewedJobs.slice(0, 4).map((item) => (
                    <Link
                      key={item.id}
                      href="/jobs"
                      className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition-all text-xs space-y-1 block"
                    >
                      <span className="font-bold text-slate-900 block truncate">
                        {item.jobTitle}
                      </span>
                      <div className="text-slate-600 flex justify-between">
                        <span>{item.company}</span>
                        <span className="text-slate-400">{item.location}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Resume Strength & Search History */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  Resume ATS Strength
                </h2>
                <span className="text-xs font-extrabold text-blue-700">{resumeScore}%</span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    resumeScore >= 80 ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${resumeScore}%` }}
                />
              </div>

              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      currentUser.profile.skills.length >= 5 ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                  <span className="text-slate-700">
                    Technical skills ({currentUser.profile.skills.length} listed)
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      currentUser.profile.experience.length > 0 ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                  <span className="text-slate-700">Work experience / internships</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      currentUser.profile.projects.length > 0 ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                  <span className="text-slate-700">Engineering capstones & projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      currentUser.profile.education.length > 0 ? 'text-emerald-600' : 'text-slate-300'
                    }`}
                  />
                  <span className="text-slate-700">Verified academic background</span>
                </li>
              </ul>

              <Link
                href="/resumes"
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Fine-Tune in Resume Builder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                Recent Queries ({searchHistory.length})
              </h2>

              {searchHistory.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No search logs yet.</p>
              ) : (
                <div className="space-y-2">
                  {searchHistory.slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      href="/jobs"
                      className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50 hover:bg-white text-xs flex items-center justify-between transition-colors block"
                    >
                      <span className="font-medium text-slate-800">&quot;{item.query}&quot;</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <JobFitModal
          isOpen={isFitModalOpen}
          onClose={() => setIsFitModalOpen(false)}
          result={selectedFitResult}
        />
      </main>
    </>
  );
}
