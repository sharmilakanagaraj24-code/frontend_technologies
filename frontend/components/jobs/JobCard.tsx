import React from 'react';
import { Bookmark } from 'lucide-react';
import { JobListing } from '@/types';

interface JobCardProps {
  job: JobListing;
  score: number;
  isSelected: boolean;
  isSaved: boolean;
  userSkills: string[];
  onSelect: (job: JobListing) => void;
  onToggleSave: (jobId: string, e: React.MouseEvent) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  score,
  isSelected,
  isSaved,
  userSkills,
  onSelect,
  onToggleSave,
}) => {
  return (
    <div
      onClick={() => onSelect(job)}
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

          <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-0.5">
            <span>{job.location}</span>
            <span aria-hidden="true">·</span>
            <span>{job.workLocationType}</span>
            <span aria-hidden="true">·</span>
            <span>${(job.salaryMin / 1000).toFixed(0)}k–${(job.salaryMax / 1000).toFixed(0)}k</span>
          </div>
        </div>

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
              type="button"
              onClick={(e) => onToggleSave(job.id, e)}
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

      <div className="flex flex-wrap gap-1 mt-3">
        {job.requiredSkills.slice(0, 4).map((skill) => {
          const isUserSkill = userSkills.some(
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
};
