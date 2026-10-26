import React, { useState, useMemo } from 'react';
import {
  BookmarkCheck,
  Building,
  Clock,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { User, JobApplication, ApplicationStatus } from '../types';
import { StorageService } from '../services/storage';

interface MyApplicationsProps {
  currentUser: User;
  onExploreJobs: () => void;
}

export const MyApplications: React.FC<MyApplicationsProps> = ({
  currentUser,
  onExploreJobs,
}) => {
  const [applications, setApplications] = useState<JobApplication[]>(() =>
    StorageService.getApplications(currentUser.id)
  );

  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Shortlisted':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Interview Scheduled':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleWithdraw = (applicationId: string) => {
    if (confirm('Are you sure you want to withdraw this application?')) {
      StorageService.withdrawApplication(applicationId);
      setApplications(StorageService.getApplications(currentUser.id));
      if (selectedApp?.id === applicationId) {
        setSelectedApp(null);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-blue-600" />
            My Job Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track status updates, attached resumes, and review progress across all submissions.
          </p>
        </div>
        <button
          onClick={onExploreJobs}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          Explore More Opportunities
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <BookmarkCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No applications submitted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Find jobs matching your skills in the portal and submit applications with your customized ATS resume.
          </p>
          <button
            onClick={onExploreJobs}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
          >
            Browse Job Portal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Applications Table / List */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {applications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 sm:p-5 cursor-pointer transition-colors ${
                    selectedApp?.id === app.id
                      ? 'bg-blue-50/30'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {app.job.title}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.job.company}</span>
                        <span>·</span>
                        <span>{app.job.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Applied on {app.appliedDate}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> {app.resumeTitle}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-md border ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWithdraw(app.id);
                        }}
                        className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
                        title="Withdraw Application"
                      >
                        <Trash2 className="w-3 h-3" /> Withdraw
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Application Details & Timeline */}
          <div className="lg:col-span-4 sticky top-20">
            {selectedApp ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
                    Application Details
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {selectedApp.job.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {selectedApp.job.company}
                  </p>
                </div>

                {/* Status Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Application History & Pipeline
                  </h4>
                  <div className="space-y-3 relative pl-4 border-l-2 border-blue-600">
                    {selectedApp.statusUpdates.map((update, i) => (
                      <div key={i} className="text-xs space-y-0.5 relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute -left-[21px] top-1 border-2 border-white" />
                        <span className="font-bold text-slate-900 block">
                          {update.status}
                        </span>
                        <p className="text-slate-600">{update.note}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(update.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cover Note */}
                {selectedApp.coverNote && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Submitted Cover Note:
                    </span>
                    <p className="text-xs text-slate-700 italic">"{selectedApp.coverNote}"</p>
                  </div>
                )}

                {/* Attached Resume */}
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                    Attached Document:
                  </span>
                  <p className="font-semibold text-blue-950 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    {selectedApp.resumeTitle}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                Select an application from the list to view its pipeline history and notes.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
