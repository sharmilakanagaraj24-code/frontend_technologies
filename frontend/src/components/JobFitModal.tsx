import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Sliders,
  Check,
  Edit2,
  Info,
  ExternalLink,
} from 'lucide-react';
import { JobFitAnalysisResult, ResumeSuggestion } from '../types';

interface JobFitModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: JobFitAnalysisResult | null;
  onApplySuggestionsToResume: (acceptedSuggestions: ResumeSuggestion[]) => void;
  onOpenResumeBuilder: () => void;
}

export const JobFitModal: React.FC<JobFitModalProps> = ({
  isOpen,
  onClose,
  result,
  onApplySuggestionsToResume,
  onOpenResumeBuilder,
}) => {
  if (!isOpen || !result) return null;

  const [suggestions, setSuggestions] = useState<ResumeSuggestion[]>(result.suggestions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');

  const handleAccept = (id: string) => {
    setSuggestions(prev =>
      prev.map(s => (s.id === id ? { ...s, status: 'accepted' } : s))
    );
  };

  const handleReject = (id: string) => {
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
          ? { ...s, suggestedText: editText, status: 'edited' }
          : s
      )
    );
    setEditingId(null);
  };

  const handleApplyAllAccepted = () => {
    const accepted = suggestions.filter(s => s.status === 'accepted' || s.status === 'edited');
    onApplySuggestionsToResume(accepted);
    onOpenResumeBuilder();
    onClose();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  const getScoreProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-blue-600';
    return 'bg-amber-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                AI Job-Fit Prediction & Skill-Gap Report
              </h2>
              <p className="text-xs text-slate-500">
                Evaluating match for <span className="font-semibold text-slate-700">{result.jobTitle}</span> at <span className="font-semibold text-slate-700">{result.company}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Score & Weights Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-5 rounded-xl bg-slate-50 border border-slate-200">
            {/* Overall Score Dial */}
            <div className="flex flex-col items-center justify-center text-center p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Estimated Match Score
              </span>
              <div className={`text-4xl font-extrabold px-4 py-1.5 rounded-lg border ${getScoreColor(result.overallScore)}`}>
                {result.overallScore}%
              </div>
              <span className="text-[11px] text-slate-500 mt-2 font-medium">
                {result.overallScore >= 80 ? 'Exceptional Fit' : result.overallScore >= 60 ? 'Strong Candidate' : 'Moderate Match'}
              </span>
            </div>

            {/* Explainable Factor Breakdown (40/30/15/15) */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  Scoring Model Breakdown (Scikit-learn Weights)
                </span>
                <span className="text-slate-400 font-normal">Deterministic formula</span>
              </div>

              {/* Skills (40%) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Technical Skills Match <span className="text-slate-400">(40% wt)</span></span>
                  <span className="font-semibold text-slate-800">{result.breakdown.skillsMatchScore}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${result.breakdown.skillsMatchScore}%` }}
                  />
                </div>
              </div>

              {/* TF-IDF Cosine Similarity (30%) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">TF-IDF Vector Cosine Similarity <span className="text-slate-400">(30% wt)</span></span>
                  <span className="font-semibold text-slate-800">{result.breakdown.tfidfSimilarityScore}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${result.breakdown.tfidfSimilarityScore}%` }}
                  />
                </div>
              </div>

              {/* Experience Match (15%) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Experience Level Match <span className="text-slate-400">(15% wt)</span></span>
                  <span className="font-semibold text-slate-800">{result.breakdown.experienceMatchScore}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${result.breakdown.experienceMatchScore}%` }}
                  />
                </div>
              </div>

              {/* Role & Qualifications (15%) */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Role & Academic Alignment <span className="text-slate-400">(15% wt)</span></span>
                  <span className="font-semibold text-slate-800">{result.breakdown.qualificationMatchScore}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-teal-600 transition-all duration-500"
                    style={{ width: `${result.breakdown.qualificationMatchScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-950 mb-0.5">Model Assessment Rationale</p>
              <p className="text-blue-800 leading-relaxed">{result.explanation}</p>
            </div>
          </div>

          {/* Skill Gap Analysis: Matched vs Missing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Skills */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-emerald-950">
                  Matching Skills ({result.matchedSkills.length})
                </h3>
              </div>
              {result.matchedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedSkills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-white border border-emerald-200 text-emerald-800 font-medium rounded-md shadow-2xs"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No direct required skills matched yet.</p>
              )}

              {result.partiallyMatchedSkills.length > 0 && (
                <div className="mt-3 pt-3 border-t border-emerald-200/60">
                  <span className="text-[11px] font-semibold text-emerald-900 block mb-1">
                    Mentioned in Experience / Projects (Ready to promote to Skills):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.partiallyMatchedSkills.map(skill => (
                      <span
                        key={skill}
                        className="text-xs px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Missing Skills */}
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-rose-950">
                  Identified Skill Gaps ({result.missingSkills.length})
                </h3>
              </div>
              {result.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-white border border-rose-200 text-rose-800 font-medium rounded-md shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-700 font-medium">
                  Zero skill gaps! You meet 100% of listed skill requirements.
                </p>
              )}
              <p className="text-[11px] text-slate-500 mt-3">
                * Tip: Adding relevant coursework or academic projects showcasing these skills can bridge this gap.
              </p>
            </div>
          </div>

          {/* AI-Based Resume Improvement Suggestions (Interactive Accept / Reject / Edit) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Targeted Resume Improvement Suggestions
              </h3>
              <span className="text-xs text-slate-500">
                Review, edit, accept, or reject every suggestion
              </span>
            </div>

            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`p-4 rounded-xl border transition-all ${
                    suggestion.status === 'accepted'
                      ? 'border-emerald-300 bg-emerald-50/40'
                      : suggestion.status === 'rejected'
                      ? 'border-slate-200 bg-slate-50 opacity-60'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">
                          {suggestion.title}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            suggestion.impact === 'High'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {suggestion.impact} Impact
                        </span>
                        {suggestion.status === 'accepted' && (
                          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                            <Check className="w-3 h-3" /> Accepted
                          </span>
                        )}
                        {suggestion.status === 'edited' && (
                          <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded flex items-center gap-1">
                            <Edit2 className="w-3 h-3" /> Custom Edited
                          </span>
                        )}
                        {suggestion.status === 'rejected' && (
                          <span className="text-[10px] font-semibold bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                            Declined
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                        {suggestion.issue}
                      </p>

                      {/* Editing View */}
                      {editingId === suggestion.id ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={3}
                            className="w-full text-xs p-2.5 border border-blue-400 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-sans"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveEdit(suggestion.id)}
                              className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700"
                            >
                              Save Custom Text
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md hover:bg-slate-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        suggestion.suggestedText && (
                          <div className="text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-[11px] leading-relaxed">
                            <span className="font-sans font-semibold text-slate-500 text-[10px] block mb-1 uppercase tracking-wider">
                              Proposed Content:
                            </span>
                            {suggestion.suggestedText}
                          </div>
                        )
                      )}
                    </div>

                    {/* Action Buttons for suggestion */}
                    <div className="flex items-center gap-1 shrink-0">
                      {suggestion.status !== 'accepted' && (
                        <button
                          onClick={() => handleAccept(suggestion.id)}
                          className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                        >
                          Accept
                        </button>
                      )}
                      <button
                        onClick={() => handleStartEdit(suggestion)}
                        className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                        title="Edit text before applying"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {suggestion.status !== 'rejected' && (
                        <button
                          onClick={() => handleReject(suggestion.id)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Next Steps */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Recommended Next Steps
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {result.recommendedNextSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="text-[11px] text-slate-400 text-center italic border-t border-slate-100 pt-3">
            Disclaimer: The Job-Fit Score is an estimated algorithmic match based on Scikit-learn TF-IDF text similarity and skill weighting. It is intended to guide resume optimization and does not guarantee job interviews or employment.
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors"
          >
            Close Report
          </button>

          <button
            onClick={handleApplyAllAccepted}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all hover:shadow-md"
          >
            <span>Apply Accepted Suggestions to Resume Builder</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
