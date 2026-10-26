'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Check,
  Edit2,
  ThumbsDown,
  Info,
  Layers,
  Award,
} from 'lucide-react';
import { JobFitAnalysisResult, ResumeSuggestion } from '@/types';

export interface JobFitModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis?: JobFitAnalysisResult | null;
  result?: JobFitAnalysisResult | null;
  onApplyDirect?: () => void;
  alreadyApplied?: boolean;
}

export function JobFitModal({
  isOpen,
  onClose,
  analysis: propAnalysis,
  result: propResult,
  onApplyDirect,
  alreadyApplied = false,
}: JobFitModalProps) {
  const analysis = propAnalysis || propResult || null;
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<ResumeSuggestion[]>(
    analysis?.suggestions || []
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Sync state when analysis changes
  React.useEffect(() => {
    if (analysis) {
      setSuggestions(analysis.suggestions);
    }
  }, [analysis]);

  if (!isOpen || !analysis) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 border-emerald-500 bg-emerald-50';
    if (score >= 60) return 'text-blue-600 border-blue-500 bg-blue-50';
    if (score >= 40) return 'text-amber-600 border-amber-500 bg-amber-50';
    return 'text-rose-600 border-rose-500 bg-rose-50';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const handleAcceptSuggestion = (id: string) => {
    setSuggestions(prev =>
      prev.map(s => (s.id === id ? { ...s, status: 'accepted' } : s))
    );
  };

  const handleRejectSuggestion = (id: string) => {
    setSuggestions(prev =>
      prev.map(s => (s.id === id ? { ...s, status: 'rejected' } : s))
    );
  };

  const handleStartEdit = (suggestion: ResumeSuggestion) => {
    setEditingId(suggestion.id);
    setEditText(suggestion.suggestedText || suggestion.suggestedAction);
  };

  const handleSaveEdit = (id: string) => {
    setSuggestions(prev =>
      prev.map(s =>
        s.id === id
          ? {
              ...s,
              status: 'edited',
              editedContent: editText,
              suggestedText: editText,
            }
          : s
      )
    );
    setEditingId(null);
  };

  const handleGenerateTailoredResume = () => {
    onClose();
    router.push(`/resumes?targetJobId=${analysis.jobId}&title=${encodeURIComponent(analysis.jobTitle)}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                AI Job-Fit Prediction & Skill-Gap Analysis
              </h2>
              <p className="text-xs text-slate-500">
                Candidate comparison for <span className="font-semibold text-slate-700">{analysis.jobTitle}</span> at <span className="font-semibold text-slate-700">{analysis.company}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-inner">
            <div className="flex items-center gap-4">
              <div
                className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-lg ${
                  analysis.overallScore >= 75
                    ? 'border-emerald-400/80 bg-emerald-500/10 text-emerald-300'
                    : analysis.overallScore >= 50
                    ? 'border-blue-400/80 bg-blue-500/10 text-blue-300'
                    : 'border-amber-400/80 bg-amber-500/10 text-amber-300'
                }`}
              >
                <span className="text-3xl font-black tracking-tight">{analysis.overallScore}%</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">Fit Score</span>
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 mb-1">
                  Weighted Prediction
                </span>
                <h3 className="text-sm font-semibold text-white">
                  {analysis.overallScore >= 80
                    ? 'Strong Match for Role'
                    : analysis.overallScore >= 60
                    ? 'Moderate Match with Growth Potential'
                    : 'Requires Skill Realignment'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
                  {analysis.explanation}
                </p>
              </div>
            </div>

            {/* 4-Factor Breakdown */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white/5 p-3 rounded-xl border border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">Skills Match (40%)</span>
                <span className="text-base font-bold text-white mt-0.5">
                  {analysis.breakdown.skillsMatchScore}%
                </span>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all"
                    style={{ width: `${analysis.breakdown.skillsMatchScore}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">TF-IDF Vector (30%)</span>
                <span className="text-base font-bold text-white mt-0.5">
                  {analysis.breakdown.tfidfSimilarityScore}%
                </span>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-blue-400 h-full rounded-full transition-all"
                    style={{ width: `${analysis.breakdown.tfidfSimilarityScore}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">Experience (15%)</span>
                <span className="text-base font-bold text-white mt-0.5">
                  {analysis.breakdown.experienceMatchScore}%
                </span>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-indigo-400 h-full rounded-full transition-all"
                    style={{ width: `${analysis.breakdown.experienceMatchScore}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">Education (15%)</span>
                <span className="text-base font-bold text-white mt-0.5">
                  {analysis.breakdown.qualificationMatchScore}%
                </span>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-violet-400 h-full rounded-full transition-all"
                    style={{ width: `${analysis.breakdown.qualificationMatchScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skill Gap Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Skills */}
            <div className="border border-emerald-100 bg-emerald-50/40 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-emerald-950">
                    Matched Skills ({analysis.matchedSkills.length})
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Confirmed
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.matchedSkills.length > 0 ? (
                  analysis.matchedSkills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100/90 text-emerald-800 border border-emerald-200"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No direct required skills overlap detected.</p>
                )}
              </div>
            </div>

            {/* Missing Skills & Skill-Gap Analysis */}
            <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h4 className="text-sm font-bold text-amber-950">
                    Missing / Skill Gaps ({analysis.missingSkills.length})
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  Action Needed
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingSkills.length > 0 ? (
                  analysis.missingSkills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-100/90 text-amber-900 border border-amber-200"
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-emerald-700 font-medium">All mandatory skills satisfied!</p>
                )}
              </div>
              {analysis.missingSkills.length > 0 && (
                <p className="text-[11px] text-amber-800/80 mt-2.5 leading-tight">
                  <Info className="w-3 h-3 inline mr-1 text-amber-600" />
                  Adding these keywords to your resume or projects can boost your match score up to +
                  {Math.min(25, analysis.missingSkills.length * 8)}%.
                </p>
              )}
            </div>
          </div>

          {/* Actionable AI Suggestions (Accept, Reject, Edit) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Intelligent Resume Optimization Suggestions
                </h4>
              </div>
              <span className="text-xs text-slate-500">
                Review and accept suggestions to customize your application
              </span>
            </div>

            <div className="space-y-2.5">
              {suggestions.map(s => (
                <div
                  key={s.id}
                  className={`border rounded-xl p-4 transition-all ${
                    s.status === 'accepted'
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : s.status === 'rejected'
                      ? 'border-slate-200 bg-slate-50/50 opacity-60'
                      : s.status === 'edited'
                      ? 'border-blue-200 bg-blue-50/30'
                      : 'border-slate-200 bg-white hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {s.section}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            s.impact === 'High'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {s.impact} Impact
                        </span>
                        <h5 className="text-xs font-bold text-slate-800">{s.title}</h5>
                      </div>
                      <p className="text-xs text-slate-600">{s.issue}</p>

                      {editingId === s.id ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            rows={3}
                            className="w-full text-xs p-2.5 rounded-lg border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(s.id)}
                              className="px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                            >
                              Save Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        s.suggestedText && (
                          <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800">
                            <span className="font-semibold text-indigo-600 block text-[11px] mb-0.5">
                              Suggested ATS Phrase / Keyword:
                            </span>
                            {s.status === 'edited' && s.editedContent ? s.editedContent : s.suggestedText}
                          </div>
                        )
                      )}
                    </div>

                    {/* Actions: Accept, Reject, Edit */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {s.status === 'pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAcceptSuggestion(s.id)}
                            className="p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
                            title="Accept suggestion"
                          >
                            <Check className="w-3.5 h-3.5" /> Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(s)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
                            title="Edit suggestion"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectSuggestion(s.id)}
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
                            title="Dismiss suggestion"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      ) : (
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            s.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'edited'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {s.status === 'accepted' ? 'Accepted' : s.status === 'edited' ? 'Customized' : 'Dismissed'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Powered by TF-IDF vectorization & Scikit-learn similarity matching
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleGenerateTailoredResume}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Generate Tailored Resume
            </button>

            {onApplyDirect && (
              <button
                type="button"
                onClick={onApplyDirect}
                disabled={alreadyApplied}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                  alreadyApplied
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                }`}
              >
                <span>{alreadyApplied ? 'Applied' : 'Apply For Job'}</span>
                {!alreadyApplied && <ArrowRight className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobFitModal;
