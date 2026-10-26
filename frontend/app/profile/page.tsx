'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User as UserIcon,
  Save,
  Plus,
  Trash2,
  Check,
  Briefcase,
  Code,
  FileText,
} from 'lucide-react';
import { User, UserProfile, WorkLocationType, EmploymentType } from '@/types';
import { StorageService } from '@/lib/storage';
import { Navbar } from '@/components/Navbar';

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
  const [profile, setProfile] = useState<UserProfile>(currentUser.profile);
  const [newSkill, setNewSkill] = useState('');
  const [newRole, setNewRole] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleSync = () => {
      const u = StorageService.getCurrentUser();
      setCurrentUser(u);
      setProfile(u.profile);
    };
    window.addEventListener('userChanged', handleSync);
    return () => window.removeEventListener('userChanged', handleSync);
  }, []);

  const handleSave = () => {
    const updated = StorageService.updateUserProfile(currentUser.id, profile);
    setCurrentUser(updated);
    setSaveMessage('Profile saved successfully!');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('userChanged'));
    }
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!profile.skills.includes(newSkill.trim())) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.trim()) return;
    if (!profile.preferredRoles.includes(newRole.trim())) {
      setProfile((prev) => ({
        ...prev,
        preferredRoles: [...prev.preferredRoles, newRole.trim()],
      }));
    }
    setNewRole('');
  };

  const handleRemoveRole = (role: string) => {
    setProfile((prev) => ({
      ...prev,
      preferredRoles: prev.preferredRoles.filter((r) => r !== role),
    }));
  };

  const toggleLocationType = (type: WorkLocationType) => {
    setProfile((prev) => {
      const exists = prev.preferredLocationType.includes(type);
      return {
        ...prev,
        preferredLocationType: exists
          ? prev.preferredLocationType.filter((t) => t !== type)
          : [...prev.preferredLocationType, type],
      };
    });
  };

  const toggleEmploymentType = (type: EmploymentType) => {
    setProfile((prev) => {
      const exists = prev.preferredEmploymentType.includes(type);
      return {
        ...prev,
        preferredEmploymentType: exists
          ? prev.preferredEmploymentType.filter((t) => t !== type)
          : [...prev.preferredEmploymentType, type],
      };
    });
  };

  return (
    <>
      <Navbar currentUser={currentUser} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              Candidate Profile & Preferences
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Keep your competencies up-to-date to drive accurate AI recommendations and job-fit predictions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saveMessage && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> {saveMessage}
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Profile
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-slate-400" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Location / City</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-slate-600 block mb-1">Professional Headline</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                  placeholder="e.g. Aspiring Full Stack Java Engineer"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-slate-600 block mb-1">Career Bio / Summary</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400" />
              Job & Work Preferences
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-600 block mb-1">Target Job Roles</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {profile.preferredRoles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-medium"
                    >
                      {role}
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(role)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <form onSubmit={handleAddRole} className="flex gap-2">
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="e.g. Backend Engineer, Full Stack Lead"
                    className="flex-1 p-2 border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 text-white font-medium rounded-lg"
                  >
                    Add Role
                  </button>
                </form>
              </div>

              <div>
                <label className="text-slate-600 block mb-1.5">Preferred Work Modality</label>
                <div className="flex gap-2">
                  {(['Remote', 'Hybrid', 'On-site'] as WorkLocationType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleLocationType(type)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        profile.preferredLocationType.includes(type)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1.5">Preferred Employment Type</label>
                <div className="flex gap-2">
                  {(['Full-time', 'Internship', 'Contract', 'Part-time'] as EmploymentType[]).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleEmploymentType(type)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                          profile.preferredEmploymentType.includes(type)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {type}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Code className="w-4 h-4 text-slate-400" />
              Skills & Competencies ({profile.skills.length})
            </h2>

            <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-md text-xs font-medium shadow-2xs"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill (e.g. TypeScript, AWS, Docker)"
                className="flex-1 p-2 border border-slate-200 rounded-lg text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
              >
                Add Skill
              </button>
            </form>
          </div>

          <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Export these skills and qualifications directly to your ATS resume.
            </p>
            <Link
              href="/resumes"
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Open in Resume Builder
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
