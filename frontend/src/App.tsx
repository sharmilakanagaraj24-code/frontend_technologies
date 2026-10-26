import React, { useState, useEffect } from 'react';
import { User, JobListing, JobFitAnalysisResult, ResumeSuggestion } from './types';
import { StorageService } from './services/storage';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { JobPortal } from './components/JobPortal';
import { ResumeBuilder } from './components/ResumeBuilder';
import { MyApplications } from './components/MyApplications';
import { RecommendationsView } from './components/RecommendationsView';
import { UserProfileView } from './components/UserProfileView';
import { JobFitModal } from './components/JobFitModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'jobs' | 'dashboard' | 'resume' | 'applications' | 'recommendations' | 'profile'
  >('jobs');

  const [currentUser, setCurrentUser] = useState<User>(() =>
    StorageService.getCurrentUser()
  );

  const [selectedFitResult, setSelectedFitResult] = useState<JobFitAnalysisResult | null>(null);
  const [isFitModalOpen, setIsFitModalOpen] = useState(false);
  const [targetedJobForResume, setTargetedJobForResume] = useState<JobListing | null>(null);
  const [pendingSuggestions, setPendingSuggestions] = useState<ResumeSuggestion[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Application and saved counters
  const [applicationCount, setApplicationCount] = useState<number>(() =>
    StorageService.getApplications(currentUser.id).length
  );
  const [savedCount, setSavedCount] = useState<number>(() =>
    StorageService.getSavedJobIds(currentUser.id).length
  );

  const refreshCounts = () => {
    setApplicationCount(StorageService.getApplications(currentUser.id).length);
    setSavedCount(StorageService.getSavedJobIds(currentUser.id).length);
  };

  useEffect(() => {
    refreshCounts();
  }, [currentUser.id]);

  const handleOpenJobFit = (result: JobFitAnalysisResult) => {
    setSelectedFitResult(result);
    setIsFitModalOpen(true);
    StorageService.saveJobFitAnalysis(currentUser.id, result);
  };

  const handleTailorResumeForJob = (job: JobListing) => {
    setTargetedJobForResume(job);
    setActiveTab('resume');
  };

  const handleApplySuggestionsToResume = (acceptedSuggestions: ResumeSuggestion[]) => {
    setPendingSuggestions(acceptedSuggestions);
  };

  const handleUserChange = (newUser: User) => {
    setCurrentUser(newUser);
    refreshCounts();
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onUserChange={handleUserChange}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        applicationCount={applicationCount}
        savedCount={savedCount}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'jobs' && (
          <JobPortal
            currentUser={currentUser}
            onOpenJobFit={handleOpenJobFit}
            onTailorResumeForJob={handleTailorResumeForJob}
            onApplicationSubmitted={refreshCounts}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenJobFit={handleOpenJobFit}
          />
        )}

        {activeTab === 'resume' && (
          <ResumeBuilder
            currentUser={currentUser}
            targetedJob={targetedJobForResume}
            onClearTargetedJob={() => setTargetedJobForResume(null)}
            pendingSuggestions={pendingSuggestions}
            onClearPendingSuggestions={() => setPendingSuggestions([])}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsView
            currentUser={currentUser}
            onSelectJob={(job) => {
              setActiveTab('jobs');
            }}
            onOpenJobFit={handleOpenJobFit}
            onTailorResumeForJob={handleTailorResumeForJob}
            onNavigateToProfile={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'applications' && (
          <MyApplications
            currentUser={currentUser}
            onExploreJobs={() => setActiveTab('jobs')}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfileView
            currentUser={currentUser}
            onProfileUpdated={(u) => setCurrentUser(u)}
            onNavigateToResume={() => setActiveTab('resume')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">NextHire AI</span>
            <span>·</span>
            <span>Job Portal with Intelligent Resume Builder</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Spring Boot Architecture</span>
            <span>·</span>
            <span>Scikit-learn TF-IDF Engine</span>
            <span>·</span>
            <span>MySQL Schema Persistence</span>
          </div>
        </div>
      </footer>

      {/* AI Job-Fit & Skill-Gap Analysis Modal */}
      <JobFitModal
        isOpen={isFitModalOpen}
        onClose={() => setIsFitModalOpen(false)}
        result={selectedFitResult}
        onApplySuggestionsToResume={handleApplySuggestionsToResume}
        onOpenResumeBuilder={() => setActiveTab('resume')}
      />

      {/* Auth Modal (Register / Switch) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleUserChange}
      />
    </div>
  );
}
