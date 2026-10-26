'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, UserCheck, Briefcase } from 'lucide-react';
import { DEMO_USERS } from '@/lib/mockData';
import { StorageService } from '@/lib/storage';

export default function LoginPage() {
  const router = useRouter();
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

    StorageService.registerUser(email.split('@')[0], email.trim());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('userChanged'));
    }
    router.push('/dashboard');
  };

  const handleSelectDemo = (userId: string) => {
    StorageService.setCurrentUser(userId);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('userChanged'));
    }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/jobs" className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-900">NextHire AI</span>
        </Link>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Sign In to Your Candidate Account
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Access personalized job matching and ATS resume builder
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200 rounded-2xl sm:px-10 space-y-6">
          {/* Quick Demo Switcher */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
              Quick 1-Click Demo Profiles:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleSelectDemo(demo.id)}
                  className="p-2.5 bg-white border border-blue-200 hover:border-blue-400 rounded-lg text-left transition-colors shadow-2xs group"
                >
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                    {demo.fullName}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {demo.id === 'user-grad' ? 'Fresh Graduate' : 'Mid-Level (3+ yrs)'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Don&apos;t have an account yet?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold">
                Register here
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
