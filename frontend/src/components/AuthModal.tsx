import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, UserCheck, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { StorageService } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const user = StorageService.registerUser(
      mode === 'register' ? fullName.trim() : email.split('@')[0],
      email.trim()
    );

    onLoginSuccess(user);
    onClose();
  };

  const handleSelectDemo = (demoUser: User) => {
    StorageService.setCurrentUser(demoUser.id);
    onLoginSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'register' ? 'Create Candidate Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Access personalized job matching and ATS resume tools
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Fast Logins */}
        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-2">
          <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
            Quick Demo Candidate Profiles:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleSelectDemo(demo)}
                className="p-2 bg-white border border-blue-200 hover:border-blue-400 rounded-lg text-left transition-colors shadow-2xs group"
              >
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                  {demo.fullName}
                </div>
                <div className="text-[10px] text-slate-500">
                  {demo.id === 'user-grad' ? 'Fresh Graduate' : 'Experienced (3+ yrs)'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Custom Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'register' && (
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-700 font-semibold block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5 mt-2"
          >
            <span>{mode === 'register' ? 'Create Candidate Account' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          {mode === 'register' ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Register
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
