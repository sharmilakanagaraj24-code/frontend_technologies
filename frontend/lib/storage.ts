import {
  JobListing,
  User,
  UserProfile,
  Resume,
  JobApplication,
  ApplicationStatus,
  SearchHistoryItem,
  ViewedJobItem,
  JobFitAnalysisResult,
} from '@/types';
import {
  INITIAL_JOBS,
  INITIAL_USERS,
  INITIAL_RESUME,
  INITIAL_APPLICATIONS,
} from './mockData';

const KEYS = {
  USERS: 'jobportal_users',
  ACTIVE_USER_ID: 'jobportal_active_user_id',
  JOBS: 'jobportal_jobs',
  RESUMES: 'jobportal_resumes',
  APPLICATIONS: 'jobportal_applications',
  SAVED_JOB_IDS: 'jobportal_saved_job_ids',
  SEARCH_HISTORY: 'jobportal_search_history',
  VIEWED_JOBS: 'jobportal_viewed_jobs',
  JOB_FIT_ANALYSES: 'jobportal_fit_analyses',
};

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function getItem<T>(key: string, defaultValue: T): T {
  if (!isClient()) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing to localStorage key "${key}":`, err);
  }
}

// Ensure default data exists
export function initLocalStorage(): void {
  if (!isClient()) return;

  if (!localStorage.getItem(KEYS.USERS)) {
    setItem(KEYS.USERS, INITIAL_USERS);
  }
  if (!localStorage.getItem(KEYS.ACTIVE_USER_ID)) {
    setItem(KEYS.ACTIVE_USER_ID, INITIAL_USERS[0].id);
  }
  if (!localStorage.getItem(KEYS.JOBS)) {
    setItem(KEYS.JOBS, INITIAL_JOBS);
  }
  if (!localStorage.getItem(KEYS.RESUMES)) {
    setItem(KEYS.RESUMES, [INITIAL_RESUME]);
  }
  if (!localStorage.getItem(KEYS.APPLICATIONS)) {
    setItem(KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  }
  if (!localStorage.getItem(KEYS.SAVED_JOB_IDS)) {
    setItem(KEYS.SAVED_JOB_IDS, ['job-1', 'job-3']);
  }
}

// User operations
export function getUsers(): User[] {
  initLocalStorage();
  const users = getItem<User[]>(KEYS.USERS, []);
  if (!users || users.length === 0) {
    setItem(KEYS.USERS, INITIAL_USERS);
    return INITIAL_USERS;
  }
  return users;
}

export function saveUser(user: User): void {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  setItem(KEYS.USERS, users);
}

export function getActiveUserId(): string {
  initLocalStorage();
  return getItem<string>(KEYS.ACTIVE_USER_ID, INITIAL_USERS[0].id);
}

export function setActiveUserId(id: string): void {
  setItem(KEYS.ACTIVE_USER_ID, id);
}

export function getActiveUser(): User {
  const users = getUsers();
  const activeId = getActiveUserId();
  const found = users.find(u => u.id === activeId);
  return found || users[0] || INITIAL_USERS[0];
}

export function registerUser(fullName: string, email: string): User {
  const users = getUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    setActiveUserId(existing.id);
    return existing;
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    fullName,
    role: 'job_seeker',
    createdAt: new Date().toISOString(),
    profile: {
      id: `prof-${Date.now()}`,
      fullName,
      email,
      phone: '+1 (555) 000-0000',
      location: 'Remote',
      title: 'Software Developer',
      bio: 'Passionate developer interested in building innovative technology solutions.',
      preferredRoles: ['Software Engineer', 'Full Stack Developer'],
      preferredLocationType: ['Remote', 'Hybrid'],
      preferredEmploymentType: ['Full-time'],
      skills: ['Java', 'React', 'TypeScript', 'SQL', 'Git'],
      education: [],
      experience: [],
      projects: [],
      certifications: [],
    },
  };

  saveUser(newUser);
  setActiveUserId(newUser.id);
  return newUser;
}

export function updateUserProfile(userId: string, updatedProfile: Partial<UserProfile>): User {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return getActiveUser();

  users[index] = {
    ...users[index],
    fullName: updatedProfile.fullName || users[index].fullName,
    profile: {
      ...users[index].profile,
      ...updatedProfile,
    },
  };

  setItem(KEYS.USERS, users);
  return users[index];
}

// Jobs operations
export function getJobs(): JobListing[] {
  initLocalStorage();
  return getItem<JobListing[]>(KEYS.JOBS, INITIAL_JOBS);
}

export function getJobById(id: string): JobListing | undefined {
  return getJobs().find(j => j.id === id);
}

export function getSavedJobIds(userId?: string): string[] {
  initLocalStorage();
  if (userId) {
    const userSaved = getItem<Record<string, string[]>>('jobportal_user_saved_jobs', {});
    if (userSaved[userId]) {
      return userSaved[userId];
    }
  }
  return getItem<string[]>(KEYS.SAVED_JOB_IDS, ['job-1', 'job-3']);
}

export function toggleSavedJob(arg1: string, arg2?: string): boolean {
  const userId = arg2 !== undefined ? arg1 : undefined;
  const jobId = arg2 !== undefined ? arg2 : arg1;

  if (userId) {
    const userSaved = getItem<Record<string, string[]>>('jobportal_user_saved_jobs', {});
    const current = new Set(userSaved[userId] || []);
    let isSaved = false;
    if (current.has(jobId)) {
      current.delete(jobId);
      isSaved = false;
    } else {
      current.add(jobId);
      isSaved = true;
    }
    userSaved[userId] = Array.from(current);
    setItem('jobportal_user_saved_jobs', userSaved);
    return isSaved;
  }

  const saved = getSavedJobIds();
  let updated: string[];
  let isNowSaved = false;
  if (saved.includes(jobId)) {
    updated = saved.filter(id => id !== jobId);
  } else {
    updated = [...saved, jobId];
    isNowSaved = true;
  }
  setItem(KEYS.SAVED_JOB_IDS, updated);
  return isNowSaved;
}

// Resume operations
export function getResumes(userId?: string): Resume[] {
  initLocalStorage();
  const allResumes = getItem<Resume[]>(KEYS.RESUMES, [INITIAL_RESUME]);
  if (!userId) return allResumes;
  return allResumes.filter(r => r.userId === userId);
}

export function getResumeById(id: string): Resume | undefined {
  return getResumes().find(r => r.id === id);
}

export function saveResume(resume: Resume): Resume {
  const resumes = getResumes();
  const idx = resumes.findIndex(r => r.id === resume.id);
  const updatedResume = { ...resume, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    resumes[idx] = updatedResume;
  } else {
    resumes.unshift(updatedResume);
  }
  setItem(KEYS.RESUMES, resumes);
  return updatedResume;
}

export function deleteResume(id: string): void {
  const resumes = getResumes().filter(r => r.id !== id);
  setItem(KEYS.RESUMES, resumes);
}

// Applications operations
export function getApplications(userId?: string): JobApplication[] {
  initLocalStorage();
  const all = getItem<JobApplication[]>(KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  if (!userId) return all;
  return all.filter(a => a.userId === userId);
}

export function hasAppliedToJob(userId: string, jobId: string): boolean {
  const userApps = getApplications(userId);
  return userApps.some(a => a.jobId === jobId);
}

export function hasApplied(userId: string, jobId: string): boolean {
  return hasAppliedToJob(userId, jobId);
}

export function submitApplication(
  arg1: any,
  arg2: any,
  arg3: any,
  arg4?: string
): { success: boolean; message: string; application?: JobApplication } {
  let userId: string;
  let job: JobListing;
  let resume: Resume;
  let coverNote: string | undefined;

  if (typeof arg1 === 'string') {
    userId = arg1;
    job = arg2 as JobListing;
    resume = arg3 as Resume;
    coverNote = arg4;
  } else {
    job = arg1 as JobListing;
    resume = arg2 as Resume;
    const user = arg3 as User;
    userId = user.id;
    coverNote = arg4;
  }

  if (hasAppliedToJob(userId, job.id)) {
    return {
      success: false,
      message: 'You have already applied for this position. Duplicate applications are prevented.',
    };
  }

  const newApp: JobApplication = {
    id: `app-${Date.now()}`,
    jobId: job.id,
    job,
    userId,
    resumeId: resume.id,
    resumeTitle: resume.title,
    appliedDate: new Date().toISOString().split('T')[0],
    status: 'Applied',
    statusUpdates: [
      {
        status: 'Applied',
        timestamp: new Date().toISOString(),
        note: 'Application submitted successfully with tailored resume.',
      },
    ],
    coverNote,
  };

  const all = getApplications();
  all.unshift(newApp);
  setItem(KEYS.APPLICATIONS, all);

  // Update job applicant count
  const allJobs = getJobs();
  const jIdx = allJobs.findIndex(j => j.id === job.id);
  if (jIdx >= 0) {
    allJobs[jIdx].applicantsCount = (allJobs[jIdx].applicantsCount || 0) + 1;
    setItem(KEYS.JOBS, allJobs);
  }

  return {
    success: true,
    message: `Application for "${job.title}" at ${job.company} submitted successfully!`,
    application: newApp,
  };
}

export function withdrawApplication(applicationId: string): void {
  const apps = getApplications().filter(a => a.id !== applicationId);
  setItem(KEYS.APPLICATIONS, apps);
}

export function updateApplicationStatus(
  appId: string,
  newStatus: ApplicationStatus,
  note: string
): void {
  const all = getApplications();
  const idx = all.findIndex(a => a.id === appId);
  if (idx >= 0) {
    all[idx].status = newStatus;
    all[idx].statusUpdates.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note,
    });
    setItem(KEYS.APPLICATIONS, all);
  }
}

// Search & Viewed History
export function getSearchHistory(userId?: string): SearchHistoryItem[] {
  initLocalStorage();
  if (userId) {
    const all = getItem<Record<string, SearchHistoryItem[]>>('jobportal_user_search_history', {});
    if (all[userId]) return all[userId];
  }
  return getItem<SearchHistoryItem[]>(KEYS.SEARCH_HISTORY, [
    {
      id: 'sh-1',
      query: 'Java Spring Boot',
      filters: { location: 'San Francisco, CA' },
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      resultCount: 8,
    },
    {
      id: 'sh-2',
      query: 'Full Stack React',
      filters: { employmentType: 'Full-time' },
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      resultCount: 14,
    },
  ]);
}

export function addSearchHistory(arg1: any, arg2?: any, arg3?: number): void {
  let userId: string | undefined;
  let query = '';
  let filters: SearchHistoryItem['filters'] = {};
  let resultCount = 0;

  if (typeof arg1 === 'string' && typeof arg2 === 'object' && arg2 !== null && 'query' in arg2) {
    userId = arg1;
    query = arg2.query;
    filters = arg2.filters || {};
    resultCount = arg2.resultCount || 0;
  } else if (typeof arg1 === 'string') {
    query = arg1;
    filters = (arg2 as SearchHistoryItem['filters']) || {};
    resultCount = arg3 || 0;
  }

  if (!query && !Object.values(filters).some(Boolean)) return;

  const newItem: SearchHistoryItem = {
    id: `sh-${Date.now()}`,
    query: query || 'All Jobs',
    filters,
    timestamp: new Date().toISOString(),
    resultCount,
  };

  if (userId) {
    const all = getItem<Record<string, SearchHistoryItem[]>>('jobportal_user_search_history', {});
    const userHistory = all[userId] || [];
    const filtered = userHistory.filter(h => h.query.toLowerCase() !== query.toLowerCase());
    all[userId] = [newItem, ...filtered].slice(0, 10);
    setItem('jobportal_user_search_history', all);
  }

  const history = getSearchHistory();
  const updated = [newItem, ...history.filter(h => h.query !== query).slice(0, 9)];
  setItem(KEYS.SEARCH_HISTORY, updated);
}

export function getViewedJobs(userId?: string): ViewedJobItem[] {
  initLocalStorage();
  if (userId) {
    const all = getItem<Record<string, ViewedJobItem[]>>('jobportal_user_viewed_jobs', {});
    if (all[userId]) return all[userId];
  }
  return getItem<ViewedJobItem[]>(KEYS.VIEWED_JOBS, [
    {
      id: 'vj-1',
      jobId: 'job-1',
      jobTitle: 'Full Stack Java & React Developer',
      company: 'FinEdge Global',
      location: 'San Francisco, CA',
      viewedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'vj-2',
      jobId: 'job-2',
      jobTitle: 'AI/ML Software Engineer',
      company: 'Cognitive Health AI',
      location: 'Remote',
      viewedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ]);
}

export function recordJobView(arg1: any, arg2?: any): void {
  const userId = typeof arg1 === 'string' ? arg1 : undefined;
  const job = (typeof arg1 === 'string' ? arg2 : arg1) as JobListing;
  if (!job) return;

  const newItem: ViewedJobItem = {
    id: `vj-${Date.now()}`,
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    location: job.location,
    viewedAt: new Date().toISOString(),
  };

  if (userId) {
    const all = getItem<Record<string, ViewedJobItem[]>>('jobportal_user_viewed_jobs', {});
    const current = all[userId] || [];
    const filtered = current.filter(item => item.jobId !== job.id);
    all[userId] = [newItem, ...filtered].slice(0, 15);
    setItem('jobportal_user_viewed_jobs', all);
  }

  const viewed = getViewedJobs();
  const filtered = viewed.filter(v => v.jobId !== job.id);
  const updated = [newItem, ...filtered].slice(0, 9);
  setItem(KEYS.VIEWED_JOBS, updated);
}

export function addViewedJob(arg1: any, arg2?: any): void {
  recordJobView(arg1, arg2);
}

// Job Fit Analyses History
export function getJobFitAnalyses(userId?: string): JobFitAnalysisResult[] {
  initLocalStorage();
  const all = getItem<Record<string, JobFitAnalysisResult[]>>(KEYS.JOB_FIT_ANALYSES, {});
  if (userId) {
    return all[userId] || [];
  }
  const current = getActiveUserId();
  return all[current] || [];
}

export function saveJobFitAnalysis(arg1: any, arg2?: any): void {
  const userId = typeof arg1 === 'string' ? arg1 : getActiveUserId();
  const result = (typeof arg1 === 'string' ? arg2 : arg1) as JobFitAnalysisResult;
  if (!result) return;

  const all = getItem<Record<string, JobFitAnalysisResult[]>>(KEYS.JOB_FIT_ANALYSES, {});
  const userAnalyses = all[userId] || [];
  const filtered = userAnalyses.filter(a => a.jobId !== result.jobId);
  all[userId] = [result, ...filtered].slice(0, 10);
  setItem(KEYS.JOB_FIT_ANALYSES, all);
}

/**
 * Universal StorageService class providing static facade methods
 * to match both Vite application and Next.js page requirements.
 */
export class StorageService {
  static initLocalStorage = initLocalStorage;
  static getUsers = getUsers;
  static saveUser = saveUser;
  static getActiveUserId = getActiveUserId;
  static setActiveUserId = setActiveUserId;
  static getActiveUser = getActiveUser;
  static getCurrentUser = getActiveUser;
  static setCurrentUser = setActiveUserId;
  static registerUser = registerUser;
  static updateUserProfile = updateUserProfile;

  static getJobs = getJobs;
  static getJobById = getJobById;
  static getSavedJobIds = getSavedJobIds;
  static toggleSavedJob = toggleSavedJob;

  static getResumes = getResumes;
  static getResumeById = getResumeById;
  static saveResume = saveResume;
  static deleteResume = deleteResume;

  static getApplications = getApplications;
  static hasAppliedToJob = hasAppliedToJob;
  static hasApplied = hasApplied;
  static submitApplication = submitApplication;
  static withdrawApplication = withdrawApplication;
  static updateApplicationStatus = updateApplicationStatus;

  static getSearchHistory = getSearchHistory;
  static addSearchHistory = addSearchHistory;
  static getViewedJobs = getViewedJobs;
  static addViewedJob = addViewedJob;
  static recordJobView = recordJobView;

  static getJobFitAnalyses = getJobFitAnalyses;
  static saveJobFitAnalysis = saveJobFitAnalysis;
}

export default StorageService;
