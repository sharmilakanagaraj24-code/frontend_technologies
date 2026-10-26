'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User as UserIcon, ArrowRight, Briefcase } from 'lucide-react';
import { StorageService } from '@/lib/storage';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    StorageService.registerUser(fullName.trim(), email.trim());
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
          Create Candidate Account
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Join thousands of developers landing dream roles with AI-driven matching
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200 rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

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
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Already registered?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
                Sign in here
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
