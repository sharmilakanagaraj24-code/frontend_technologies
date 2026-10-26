'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  FileText,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
  User as UserIcon,
  ChevronDown,
  Menu,
  X,
  Layers,
  ArrowRightLeft,
} from 'lucide-react';
import { getCurrentUser, subscribeAuth, switchUser } from '@/lib/auth';
import { getUsers } from '@/lib/storage';
import { User } from '@/types';

export interface NavbarProps {
  currentUser?: User | null;
  onUserChange?: (user: User) => void;
  applicationCount?: number;
}

export function Navbar({
  currentUser: propUser,
  onUserChange,
  applicationCount,
}: NavbarProps = {}) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(propUser || null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (propUser) {
      setCurrentUser(propUser);
    } else {
      setCurrentUser(getCurrentUser());
    }
    setAllUsers(getUsers());

    const unsubscribe = subscribeAuth(user => {
      setCurrentUser(user);
      if (user && onUserChange) {
        onUserChange(user);
      }
    });
    return () => unsubscribe();
  }, [propUser, onUserChange]);

  const navLinks = [
    { href: '/jobs', label: 'Explore Jobs', icon: Briefcase },
    { href: '/recommendations', label: 'AI Matches', icon: Sparkles, badge: 'Smart' },
    { href: '/resumes', label: 'Resume Builder', icon: FileText },
    {
      href: '/applications',
      label: 'Applications',
      icon: CheckCircle2,
      badge: applicationCount !== undefined && applicationCount > 0 ? `${applicationCount}` : undefined,
    },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                Talent<span className="text-blue-600">Sync</span> AI
              </span>
              <span className="text-[10px] text-slate-600 -mt-1 font-medium tracking-wide">
                Job Portal & Intelligent Resume
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-600'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Demo Switcher */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all text-left shadow-xs cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold text-xs shadow-xs">
                  {currentUser?.fullName
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2) || 'JS'}
                </div>
                <div className="flex flex-col text-xs leading-tight">
                  <span className="font-semibold text-slate-800 line-clamp-1 max-w-[110px]">
                    {currentUser?.fullName || 'Guest User'}
                  </span>
                  <span className="text-slate-600 text-[10px] line-clamp-1 max-w-[110px]">
                    {currentUser?.profile?.title || 'Job Seeker'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-600 ml-1" />
              </button>

              {/* Profile Dropdown */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2.5 border-b border-slate-100">
                      <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold">Active Profile</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{currentUser?.fullName}</p>
                      <p className="text-xs text-slate-600">{currentUser?.email}</p>
                    </div>

                    <div className="py-2 border-b border-slate-100">
                      <div className="px-3 py-1 text-[11px] font-semibold text-slate-600 uppercase flex items-center gap-1">
                        <ArrowRightLeft className="w-3 h-3 text-indigo-500" /> Switch Demo Persona
                      </div>
                      {allUsers.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            switchUser(u.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            currentUser?.id === u.id
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <p className="font-semibold">{u.fullName}</p>
                            <p className="text-[11px] text-slate-600">{u.profile.title}</p>
                          </div>
                          {currentUser?.id === u.id && (
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="pt-1.5 space-y-0.5">
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                        Edit Full Profile & Skills
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-slate-600" />
                        My Dashboard & Stats
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-violet-600 text-white rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-600 font-semibold px-2 mb-2">Switch Active Persona</p>
            <div className="space-y-1">
              {allUsers.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    switchUser(u.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between ${
                    currentUser?.id === u.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{u.fullName}</p>
                    <p className="text-[11px] text-slate-600">{u.profile.title}</p>
                  </div>
                  {currentUser?.id === u.id && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
              >
                Manage Profile & Skills
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
