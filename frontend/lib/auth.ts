import { User, UserProfile } from '@/types';
import {
  getActiveUser,
  getActiveUserId,
  setActiveUserId,
  getUsers,
  saveUser,
} from './storage';
import { INITIAL_USERS } from './mockData';

// Simple event bus for reactive auth state updates across components
type AuthListener = (user: User | null) => void;
const listeners = new Set<AuthListener>();

export function subscribeAuth(listener: AuthListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(user: User | null) {
  listeners.forEach(fn => {
    try {
      fn(user);
    } catch (e) {
      console.error('Error in auth listener:', e);
    }
  });
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return INITIAL_USERS[0];
  const activeId = getActiveUserId();
  if (!activeId) return null;
  return getActiveUser();
}

export function switchUser(userId: string): User | null {
  const users = getUsers();
  const target = users.find(u => u.id === userId);
  if (target) {
    setActiveUserId(target.id);
    notifyListeners(target);
    return target;
  }
  return null;
}

export function login(email: string, _password?: string): { success: boolean; message: string; user?: User } {
  const users = getUsers();
  const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (found) {
    setActiveUserId(found.id);
    notifyListeners(found);
    return { success: true, message: `Welcome back, ${found.fullName}!`, user: found };
  }
  return { success: false, message: 'Invalid email or password. You can also pick a demo profile directly.' };
}

export function register(
  fullName: string,
  email: string,
  role: 'job_seeker' | 'employer' = 'job_seeker'
): { success: boolean; message: string; user?: User } {
  const users = getUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return { success: false, message: 'An account with this email address already exists.' };
  }

  const newProfile: UserProfile = {
    id: `prof-${Date.now()}`,
    fullName,
    email,
    phone: '+1 (555) 000-0000',
    location: 'San Francisco, CA',
    title: 'Software Developer',
    bio: 'Passionate technologist eager to solve high-impact challenges.',
    preferredRoles: ['Full Stack Developer', 'Software Engineer'],
    preferredLocationType: ['Hybrid', 'Remote'],
    preferredEmploymentType: ['Full-time'],
    skills: ['JavaScript', 'React', 'HTML/CSS', 'Git'],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
  };

  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    fullName,
    role,
    createdAt: new Date().toISOString(),
    profile: newProfile,
  };

  saveUser(newUser);
  setActiveUserId(newUser.id);
  notifyListeners(newUser);
  return { success: true, message: `Account created! Welcome, ${fullName}.`, user: newUser };
}

export function logout(): void {
  // Rather than leaving completely logged out which breaks SSR, we can reset or mark null
  setActiveUserId('');
  notifyListeners(null);
}

export function updateUserProfile(profile: UserProfile): User {
  const current = getActiveUser();
  const updatedUser: User = {
    ...current,
    fullName: profile.fullName,
    profile,
  };
  saveUser(updatedUser);
  notifyListeners(updatedUser);
  return updatedUser;
}
