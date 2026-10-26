import React from 'react';
import Link from 'next/link';
import { BookmarkCheck, ChevronRight } from 'lucide-react';

interface PipelineTrackerProps {
  appliedCount: number;
  underReviewCount: number;
  shortlistedCount: number;
  interviewCount: number;
}

export const PipelineTracker: React.FC<PipelineTrackerProps> = ({
  appliedCount,
  underReviewCount,
  shortlistedCount,
  interviewCount,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <BookmarkCheck className="w-4 h-4 text-blue-600" />
          Application Funnel Status
        </h2>
        <Link
          href="/applications"
          className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
        >
          View Details <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-xs text-slate-500 font-medium">Applied</span>
          <div className="text-xl font-extrabold text-slate-900 mt-0.5">
            {appliedCount}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-center">
          <span className="text-xs text-blue-700 font-medium">Under Review</span>
          <div className="text-xl font-extrabold text-blue-900 mt-0.5">
            {underReviewCount}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-center">
          <span className="text-xs text-purple-700 font-medium">Shortlisted</span>
          <div className="text-xl font-extrabold text-purple-900 mt-0.5">
            {shortlistedCount}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center">
          <span className="text-xs text-emerald-700 font-medium">Interviewing</span>
          <div className="text-xl font-extrabold text-emerald-900 mt-0.5">
            {interviewCount}
          </div>
        </div>
      </div>
    </div>
  );
};
