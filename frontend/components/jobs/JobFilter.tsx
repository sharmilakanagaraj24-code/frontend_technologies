import React from 'react';
import { Search, MapPin, Filter } from 'lucide-react';

interface JobFilterProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  locationQuery: string;
  setLocationQuery: (l: string) => void;
  workLocationType: string;
  setWorkLocationType: (w: string) => void;
  experienceLevel: string;
  setExperienceLevel: (e: string) => void;
  employmentType: string;
  setEmploymentType: (t: string) => void;
  sortBy: 'match' | 'salary' | 'recent';
  setSortBy: (s: 'match' | 'salary' | 'recent') => void;
  onReset: () => void;
}

export const JobFilter: React.FC<JobFilterProps> = ({
  searchQuery,
  setSearchQuery,
  locationQuery,
  setLocationQuery,
  workLocationType,
  setWorkLocationType,
  experienceLevel,
  setExperienceLevel,
  employmentType,
  setEmploymentType,
  sortBy,
  setSortBy,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
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

      <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
        <span className="text-slate-500 font-semibold flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" /> Filters:
        </span>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
          {(['all', 'Remote', 'Hybrid', 'On-site'] as const).map((loc) => (
            <button
              key={loc}
              type="button"
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

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
          {(['all', 'Entry-level', 'Mid-level', 'Senior'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
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

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
          {(['all', 'Full-time', 'Internship'] as const).map((emp) => (
            <button
              key={emp}
              type="button"
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
            type="button"
            onClick={onReset}
            className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
