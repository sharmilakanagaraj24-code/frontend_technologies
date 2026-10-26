import React, { useMemo } from 'react';
import {
  Briefcase,
  Sparkles,
  BookmarkCheck,
  Bookmark,
  Clock,
  Search,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileCheck,
  ChevronRight,
  Sliders,
  Award,
} from 'lucide-react';
import {
  User,
  JobListing,
  JobApplication,
  SearchHistoryItem,
  ViewedJobItem,
  JobFitAnalysisResult,
} from '../types';
import { StorageService } from '../services/storage';

interface DashboardProps {
  currentUser: User;
  onNavigate: (tab: 'jobs' | 'dashboard' | 'resume' | 'applications' | 'recommendations' | 'profile') => void;
  onOpenJobFit: (result: JobFitAnalysisResult) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  onNavigate,
  onOpenJobFit,
}) => {
  const jobs = useMemo(() => StorageService.getJobs(), []);
  const applications = useMemo(() => StorageService.getApplications(currentUser.id), [currentUser.id]);
  const savedJobIds = useMemo(() => StorageService.getSavedJobIds(currentUser.id), [currentUser.id]);
  const searchHistory = useMemo(() => StorageService.getSearchHistory(currentUser.id), [currentUser.id]);
  const viewedJobs = useMemo(() => StorageService.getViewedJobs(currentUser.id), [currentUser.id]);
  const fitAnalyses = useMemo(() => StorageService.getJobFitAnalyses(currentUser.id), [currentUser.id]);
  const resumes = useMemo(() => StorageService.getResumes(currentUser.id), [currentUser.id]);

  // Application status breakdown
  const statusCounts = useMemo(() => {
    const counts = {
      applied: 0,
      underReview: 0,
      shortlisted: 0,
      interview: 0,
      rejected: 0,
    };
    applications.forEach((a) => {
      if (a.status === 'Applied') counts.applied++;
      else if (a.status === 'Under Review') counts.underReview++;
      else if (a.status === 'Shortlisted') counts.shortlisted++;
      else if (a.status === 'Interview Scheduled') counts.interview++;
      else if (a.status === 'Rejected') counts.rejected++;
    });
    return counts;
  }, [applications]);

  // Calculate resume completion score
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-200 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" /> AI-Driven Career Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.fullName.split(' ')[0]}!
          </h1>
          <p className="text-sm text-blue-100/90 leading-relaxed">
            Your career cockpit: explore matching jobs, review AI skill-gap predictions, and fine-tune your ATS resume with Scikit-learn TF-IDF analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('jobs')}
            className="px-4 py-2.5 bg-white text-slate-900 hover:bg-blue-50 text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Explore All Jobs
          </button>
          <button
            onClick={() => onNavigate('resume')}
            className="px-4 py-2.5 bg-blue-700/80 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl border border-blue-500/40 transition-all"
          >
            Open Resume Builder
          </button>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Available Jobs */}
        <div
          onClick={() => onNavigate('jobs')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Jobs
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{jobs.length}</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Live opportunities</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </p>
        </div>

        {/* Recommended Jobs */}
        <div
          onClick={() => onNavigate('recommendations')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Recommended
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {Math.max(3, Math.min(jobs.length, 6))}
          </div>
          <p className="text-[11px] text-emerald-700 mt-1 font-medium">
            Personalized by skills
          </p>
        </div>

        {/* Total Applications */}
        <div
          onClick={() => onNavigate('applications')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Applications
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{applications.length}</div>
          <p className="text-[11px] text-indigo-700 mt-1 font-medium">
            {statusCounts.interview > 0
              ? `${statusCounts.interview} interview invite!`
              : 'Track status pipeline'}
          </p>
        </div>

        {/* Saved Jobs */}
        <div
          onClick={() => onNavigate('jobs')}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Bookmarked Jobs
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{savedJobIds.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Saved for later review</p>
        </div>
      </div>

      {/* Main Two-Column Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Applications Pipeline & Fit Analyses */}
        <div className="lg:col-span-8 space-y-6">
          {/* Application Pipeline Status Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-blue-600" />
                Application Funnel Status
              </h2>
              <button
                onClick={() => onNavigate('applications')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                View Details <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-medium">Applied</span>
                <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {statusCounts.applied}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-center">
                <span className="text-xs text-blue-700 font-medium">Under Review</span>
                <div className="text-xl font-extrabold text-blue-900 mt-0.5">
                  {statusCounts.underReview}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-center">
                <span className="text-xs text-purple-700 font-medium">Shortlisted</span>
                <div className="text-xl font-extrabold text-purple-900 mt-0.5">
                  {statusCounts.shortlisted}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
                <span className="text-xs text-emerald-700 font-medium">Interviewing</span>
                <div className="text-xl font-extrabold text-emerald-900 mt-0.5">
                  {statusCounts.interview}
                </div>
              </div>
            </div>
          </div>

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
              <button
                onClick={() => onNavigate('jobs')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Analyze More Jobs
              </button>
            </div>

            {fitAnalyses.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-700">No recent analyses run yet</p>
                <p className="text-xs text-slate-500">
                  Select any job in the portal and click "Run AI Job-Fit Prediction" to calculate match scores and skill gaps.
                </p>
                <button
                  onClick={() => onNavigate('jobs')}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white font-semibold rounded-lg"
                >
                  Go to Jobs Portal
                </button>
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
                        onClick={() => onOpenJobFit(analysis)}
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
                  <div
                    key={item.id}
                    onClick={() => onNavigate('jobs')}
                    className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 cursor-pointer bg-slate-50/50 hover:bg-white transition-all text-xs space-y-1"
                  >
                    <span className="font-bold text-slate-900 block truncate">
                      {item.jobTitle}
                    </span>
                    <div className="text-slate-600 flex justify-between">
                      <span>{item.company}</span>
                      <span className="text-slate-400">{item.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Resume Strength & Search History */}
        <div className="lg:col-span-4 space-y-6">
          {/* Resume Health & Completion Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                Resume ATS Strength
              </h2>
              <span className="text-xs font-extrabold text-blue-700">{resumeScore}%</span>
            </div>

            {/* Progress bar */}
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

            <button
              onClick={() => onNavigate('resume')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Fine-Tune in Resume Builder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recent Searches */}
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
                  <div
                    key={item.id}
                    onClick={() => onNavigate('jobs')}
                    className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50 hover:bg-white cursor-pointer text-xs flex items-center justify-between transition-colors"
                  >
                    <span className="font-medium text-slate-800">"{item.query}"</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
