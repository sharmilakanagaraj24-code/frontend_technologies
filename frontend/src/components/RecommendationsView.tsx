import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  RefreshCw,
  Briefcase,
  CheckCircle,
  MapPin,
  DollarSign,
  ArrowRight,
  TrendingUp,
  FileText,
  Sliders,
  Check,
} from 'lucide-react';
import { User, JobListing, JobRecommendation, JobFitAnalysisResult } from '../types';
import { StorageService } from '../services/storage';
import { calculateJobRecommendationScore, analyzeJobFit } from '../services/mlEngine';

interface RecommendationsViewProps {
  currentUser: User;
  onSelectJob: (job: JobListing) => void;
  onOpenJobFit: (result: JobFitAnalysisResult) => void;
  onTailorResumeForJob: (job: JobListing) => void;
  onNavigateToProfile: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  currentUser,
  onSelectJob,
  onOpenJobFit,
  onTailorResumeForJob,
  onNavigateToProfile,
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [jobs] = useState<JobListing[]>(() => StorageService.getJobs());

  const viewedJobIds = useMemo(() => {
    return new Set(StorageService.getViewedJobs(currentUser.id).map(v => v.jobId));
  }, [currentUser.id, refreshKey]);

  const appliedJobIds = useMemo(() => {
    return new Set(StorageService.getApplications(currentUser.id).map(a => a.jobId));
  }, [currentUser.id, refreshKey]);

  // Compute recommendations
  const rankedRecommendations: JobRecommendation[] = useMemo(() => {
    return jobs
      .map((job) => {
        const { score, reason, matchedKeySkills } = calculateJobRecommendationScore(
          currentUser.profile,
          job,
          viewedJobIds,
          appliedJobIds
        );
        return {
          job,
          matchScore: score,
          reason,
          matchedKeySkills,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [jobs, currentUser.profile, viewedJobIds, appliedJobIds, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Explainable Matching Engine
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Personalized Job Recommendations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ranked by multi-factor scoring: skills alignment, preferred roles ({currentUser.profile.preferredRoles.join(', ')}), work modality, and resume keyword TF-IDF similarity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToProfile}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            Update Preferences
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rankedRecommendations.map(({ job, matchScore, reason, matchedKeySkills }, idx) => {
          const isApplied = appliedJobIds.has(job.id);

          return (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header Row: Rank badge, Score badge, Job title */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <h2 className="text-base font-bold text-slate-900 leading-tight">
                        {job.title}
                      </h2>
                    </div>
                    <p className="text-xs font-medium text-slate-600 pl-7">{job.company}</p>
                  </div>

                  <div
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-md border shrink-0 ${
                      matchScore >= 80
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : matchScore >= 60
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {matchScore}% Match
                  </div>
                </div>

                {/* Quiet Metadata */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-2 pl-7">
                  <span>{job.location}</span>
                  <span>·</span>
                  <span>{job.workLocationType}</span>
                  <span>·</span>
                  <span>${(job.salaryMin / 1000).toFixed(0)}k–${(job.salaryMax / 1000).toFixed(0)}k</span>
                  <span>·</span>
                  <span>{job.experienceLevel}</span>
                </div>

                {/* Explanation Card */}
                <div className="mt-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-blue-950">Why recommended:</span>
                    <span className="text-blue-800">{reason}</span>
                  </div>
                </div>

                {/* Matched skills tags */}
                {matchedKeySkills.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Matching Skills ({matchedKeySkills.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {matchedKeySkills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-medium flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-emerald-600" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    const analysis = analyzeJobFit(currentUser.profile, job);
                    onOpenJobFit(analysis);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  View Skill Gaps
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTailorResumeForJob(job)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200"
                  >
                    Tailor Resume
                  </button>
                  <button
                    onClick={() => onSelectJob(job)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs"
                  >
                    {isApplied ? 'View Status' : 'View & Apply'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
