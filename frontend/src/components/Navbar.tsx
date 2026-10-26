import React, { useState } from 'react';
import {
  Briefcase,
  FileText,
  User as UserIcon,
  Sparkles,
  BookmarkCheck,
  LayoutDashboard,
  Compass,
  ChevronDown,
  LogOut,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { User } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { StorageService } from '../services/storage';

interface NavbarProps {
  activeTab: 'jobs' | 'dashboard' | 'resume' | 'applications' | 'recommendations' | 'profile';
  setActiveTab: (tab: 'jobs' | 'dashboard' | 'resume' | 'applications' | 'recommendations' | 'profile') => void;
  currentUser: User;
  onUserChange: (user: User) => void;
  onOpenAuth: () => void;
  applicationCount: number;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onUserChange,
  onOpenAuth,
  applicationCount,
  savedCount,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleSelectDemoUser = (user: User) => {
    StorageService.setCurrentUser(user.id);
    onUserChange(user);
    setShowUserDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div
            onClick={() => setActiveTab('jobs')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg">NextHire AI</span>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                  ML-Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Smart Job Portal & Intelligent Resume Builder
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'jobs'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4" />
              Jobs
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('resume')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'resume'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Resume Builder
              <span className="text-[10px] font-medium bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                ATS
              </span>
            </button>

            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'recommendations'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              Recommendations
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors relative ${
                activeTab === 'applications'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              Applications
              {applicationCount > 0 && (
                <span className="w-5 h-5 text-xs bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {applicationCount}
                </span>
              )}
            </button>
          </nav>

          {/* User Controls & Account Switcher */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-sm">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                    {currentUser.profile.title.split('&')[0]}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Account Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                      Active Account
                    </p>
                    <p className="text-sm font-semibold text-slate-900">{currentUser.fullName}</p>
                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      View & Edit Profile
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-2 pb-1">
                    <div className="px-4 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Demo Profile
                    </div>
                    {DEMO_USERS.map((demo) => (
                      <button
                        key={demo.id}
                        onClick={() => handleSelectDemoUser(demo)}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                          demo.id === currentUser.id ? 'bg-blue-50/70 text-blue-800 font-medium' : 'text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <div>
                            <span className="font-medium text-slate-800">{demo.fullName}</span>
                            <span className="block text-[10px] text-slate-500">
                              {demo.id === 'user-grad' ? 'Graduate (Entry Level)' : 'Mid-Level (3+ Yrs Exp)'}
                            </span>
                          </div>
                        </div>
                        {demo.id === currentUser.id && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenAuth();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Register New / Sign In Custom Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'jobs' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Jobs
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'resume' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Resume Builder
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'recommendations' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'applications' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Applications ({applicationCount})
          </button>
        </div>
      </div>
    </header>
  );
};
