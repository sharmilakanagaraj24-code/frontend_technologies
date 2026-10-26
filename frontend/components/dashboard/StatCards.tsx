import React from 'react';
import { Briefcase, Sparkles, BookmarkCheck, Bookmark, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface StatCardsProps {
  availableJobsCount: number;
  recommendedCount: number;
  applicationsCount: number;
  savedJobsCount: number;
  interviewCount: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  availableJobsCount,
  recommendedCount,
  applicationsCount,
  savedJobsCount,
  interviewCount,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Link
        href="/jobs"
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
        <div className="text-2xl font-bold text-slate-900 mt-2">{availableJobsCount}</div>
        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          <span>Live opportunities</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
        </p>
      </Link>

      <Link
        href="/recommendations"
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
        <div className="text-2xl font-bold text-slate-900 mt-2">{recommendedCount}</div>
        <p className="text-[11px] text-emerald-700 mt-1 font-medium">
          Personalized by skills
        </p>
      </Link>

      <Link
        href="/applications"
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
        <div className="text-2xl font-bold text-slate-900 mt-2">{applicationsCount}</div>
        <p className="text-[11px] text-indigo-700 mt-1 font-medium">
          {interviewCount > 0 ? `${interviewCount} interview invite!` : 'Track status pipeline'}
        </p>
      </Link>

      <Link
        href="/jobs"
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
        <div className="text-2xl font-bold text-slate-900 mt-2">{savedJobsCount}</div>
        <p className="text-[11px] text-slate-400 mt-1">Saved for later review</p>
      </Link>
    </div>
  );
};
