import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Sparkles,
  Bookmark,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Filter,
  Layers,
  ArrowUpRight,
  FileText,
  Building,
  Check,
} from 'lucide-react';
import { JobListing, User, Resume, JobFitAnalysisResult, WorkLocationType, ExperienceLevel, EmploymentType } from '../types';
import { StorageService } from '../services/storage';
import { analyzeJobFit } from '../services/mlEngine';

interface JobPortalProps {
  currentUser: User;
  onOpenJobFit: (result: JobFitAnalysisResult) => void;
  onTailorResumeForJob: (job: JobListing) => void;
  onApplicationSubmitted: () => void;
}

export const JobPortal: React.FC<JobPortalProps> = ({
  currentUser,
  onOpenJobFit,
  onTailorResumeForJob,
  onApplicationSubmitted,
}) => {
  const [jobs] = useState<JobListing[]>(() => StorageService.getJobs());
  const [selectedJob, setSelectedJob] = useState<JobListing>(jobs[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  // Filters
  const [workLocationType, setWorkLocationType] = useState<string>('all');
  const [experienceLevel, setExperienceLevel] = useState<string>('all');
  const [employmentType, setEmploymentType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'match' | 'salary' | 'recent'>('match');

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [coverNote, setCoverNote] = useState('');
  const [applyMessage, setApplyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Saved Jobs Set
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(() =>
    new Set(StorageService.getSavedJobIds(currentUser.id))
  );

  const userResumes = useMemo(() => {
    return StorageService.getResumes(currentUser.id);
  }, [currentUser.id]);

  // Record job view in history
  const handleSelectJob = (job: JobListing) => {
    setSelectedJob(job);
    StorageService.recordJobView(currentUser.id, job);
  };

  const handleToggleSave = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isSaved = StorageService.toggleSavedJob(currentUser.id, jobId);
    setSavedJobIds(prev => {
      const next = new Set(prev);
      if (isSaved) next.add(jobId);
      else next.delete(jobId);
      return next;
    });
  };

  // Pre-calculate Job-fit scores for all jobs for active user
  const jobFitScores = useMemo(() => {
    const scores = new Map<string, JobFitAnalysisResult>();
    const activeResume = userResumes[0] || currentUser.profile;
    for (const job of jobs) {
      scores.set(job.id, analyzeJobFit(activeResume, job));
    }
    return scores;
  }, [jobs, userResumes, currentUser.profile]);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    // Record search history if user typed a meaningful query
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
        // Text search
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchTitle = job.title.toLowerCase().includes(q);
          const matchCompany = job.company.toLowerCase().includes(q);
          const matchSkill = job.requiredSkills.some(s => s.toLowerCase().includes(q));
          const matchDesc = job.description.toLowerCase().includes(q);
          if (!matchTitle && !matchCompany && !matchSkill && !matchDesc) return false;
        }

        // Location search
        if (locationQuery) {
          const l = locationQuery.toLowerCase();
          const matchLocation = job.location.toLowerCase().includes(l);
          const matchLocType = job.workLocationType.toLowerCase().includes(l);
          if (!matchLocation && !matchLocType) return false;
        }

        // Filter: Work location type
        if (workLocationType !== 'all' && job.workLocationType !== workLocationType) {
          return false;
        }

        // Filter: Experience level
        if (experienceLevel !== 'all' && job.experienceLevel !== experienceLevel) {
          return false;
        }

        // Filter: Employment type
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
  }, [jobs, searchQuery, locationQuery, workLocationType, experienceLevel, employmentType, sortBy, jobFitScores, currentUser.id]);

  const activeAnalysis = selectedJob ? jobFitScores.get(selectedJob.id) : null;
  const hasAppliedToSelected = selectedJob ? StorageService.hasApplied(currentUser.id, selectedJob.id) : false;

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

    const resumeToUse = userResumes.find(r => r.id === selectedResumeId) || userResumes[0];
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
      onApplicationSubmitted();
      setTimeout(() => {
        setIsApplyModalOpen(false);
      }, 1400);
    } else {
      setApplyMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Search Bar Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, skill (e.g. Java, React), or company"
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            />
          </div>

          {/* Location Search */}
          <div className="md:col-span-4 relative">
            <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="City, state, or 'Remote'"
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
            >
              <option value="match">Sort: AI Best Match</option>
              <option value="recent">Sort: Most Recent</option>
              <option value="salary">Sort: Highest Salary</option>
            </select>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1 mr-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filters:
          </span>

          {/* Work Location Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            {(['all', 'Remote', 'Hybrid', 'On-site'] as const).map((loc) => (
              <button
                key={loc}
                onClick={() => setWorkLocationType(loc)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  workLocationType === loc
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {loc === 'all' ? 'All Locations' : loc}
              </button>
            ))}
          </div>

          {/* Experience Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            {(['all', 'Entry-level', 'Mid-level', 'Senior'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setExperienceLevel(lvl)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  experienceLevel === lvl
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl === 'all' ? 'All Experience' : lvl}
              </button>
            ))}
          </div>

          {/* Employment Type Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            {(['all', 'Full-time', 'Internship'] as const).map((emp) => (
              <button
                key={emp}
                onClick={() => setEmploymentType(emp)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  employmentType === emp
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {emp === 'all' ? 'All Types' : emp}
              </button>
            ))}
          </div>

          {(searchQuery || locationQuery || workLocationType !== 'all' || experienceLevel !== 'all' || employmentType !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setLocationQuery('');
                setWorkLocationType('all');
                setExperienceLevel('all');
                setEmploymentType('all');
              }}
              className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Job Cards List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found
            </span>
            <span className="text-xs text-slate-400">
              Scored against your profile
            </span>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">No matching jobs found</p>
              <p className="text-xs text-slate-500">Try broadening your search keywords or clearing active filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLocationQuery('');
                  setWorkLocationType('all');
                  setExperienceLevel('all');
                }}
                className="px-3 py-1.5 text-xs bg-blue-600 text-white font-medium rounded-md"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const analysis = jobFitScores.get(job.id);
              const isSelected = selectedJob?.id === job.id;
              const isSaved = savedJobIds.has(job.id);
              const score = analysis?.overallScore || 0;

              return (
                <div
                  key={job.id}
                  onClick={() => handleSelectJob(job)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/20 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors">
                          {job.title}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-600">{job.company}</p>

                      {/* Quiet Unboxed Metadata with Typographic Separator */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-0.5">
                        <span>{job.location}</span>
                        <span aria-hidden="true">·</span>
                        <span>{job.workLocationType}</span>
                        <span aria-hidden="true">·</span>
                        <span>${(job.salaryMin / 1000).toFixed(0)}k–${(job.salaryMax / 1000).toFixed(0)}k</span>
                      </div>
                    </div>

                    {/* Fit Score Badge & Save Button */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1">
                        <div
                          className={`text-xs font-bold px-2 py-0.5 rounded border ${
                            score >= 80
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : score >= 60
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {score}% Match
                        </div>
                        <button
                          onClick={(e) => handleToggleSave(job.id, e)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title={isSaved ? 'Remove from Saved' : 'Save Job'}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${isSaved ? 'fill-blue-600 text-blue-600' : ''}`}
                          />
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {job.experienceLevel}
                      </span>
                    </div>
                  </div>

                  {/* Key Skills List */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {job.requiredSkills.slice(0, 4).map((skill) => {
                      const isUserSkill = currentUser.profile.skills.some(
                        (s) => s.toLowerCase() === skill.toLowerCase()
                      );
                      return (
                        <span
                          key={skill}
                          className={`text-[11px] px-2 py-0.5 rounded ${
                            isUserSkill
                              ? 'bg-emerald-50 text-emerald-800 font-medium border border-emerald-200/50'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                    {job.requiredSkills.length > 4 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{job.requiredSkills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Job View */}
        <div className="lg:col-span-7 sticky top-20">
          {selectedJob ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Header */}
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

                  {/* Bookmark Button */}
                  <button
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

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <button
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

                  {/* AI Fit Analysis Button */}
                  {activeAnalysis && (
                    <button
                      onClick={() => onOpenJobFit(activeAnalysis)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200/80 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      View AI Job-Fit Breakdown ({activeAnalysis.overallScore}%)
                    </button>
                  )}

                  {/* Tailor Resume Button */}
                  <button
                    onClick={() => onTailorResumeForJob(selectedJob)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-500" />
                    Tailor Resume
                  </button>
                </div>
              </div>

              {/* AI Fit Summary Card inside detail */}
              {activeAnalysis && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Quick Match Snapshot: {activeAnalysis.overallScore}% Fit
                    </span>
                    <button
                      onClick={() => onOpenJobFit(activeAnalysis)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    >
                      Full Report <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {activeAnalysis.explanation}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span>
                      <strong className="text-emerald-700 font-bold">{activeAnalysis.matchedSkills.length}</strong> Matched Skills
                    </span>
                    <span>·</span>
                    <span>
                      <strong className="text-rose-700 font-bold">{activeAnalysis.missingSkills.length}</strong> Skill Gaps
                    </span>
                    <span>·</span>
                    <span>
                      <strong className="text-indigo-700 font-bold">{activeAnalysis.breakdown.tfidfSimilarityScore}%</strong> TF-IDF Similarity
                    </span>
                  </div>
                </div>
              )}

              {/* Job Description */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Role Overview
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedJob.description}
                </p>
              </div>

              {/* Responsibilities */}
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

              {/* Required Skills */}
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

              {/* Preferred Skills */}
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

              {/* Qualifications */}
              <div className="space-y-2.5">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Qualifications & Education
                </h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  {selectedJob.qualifications.map((qual, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-2" />
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              Select a job from the list to view details
            </div>
          )}
        </div>
      </div>

      {/* Application Modal */}
      {isApplyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
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

            {/* Resume Selection */}
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
                      {resume.title} ({resume.templateId.toUpperCase()} template)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  You don't have any saved resumes yet. We will generate an application from your profile.
                </div>
              )}
            </div>

            {/* Cover Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Short Note / Why You're a Great Fit (Optional)
              </label>
              <textarea
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                rows={3}
                placeholder="Mention key highlights or relevant projects matching this role..."
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApply}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                Confirm & Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
