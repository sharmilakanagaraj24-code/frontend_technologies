import {
  User,
  JobListing,
  Resume,
  JobApplication,
  SearchHistoryItem,
  ViewedJobItem,
  JobFitAnalysisResult,
  UserProfile,
} from '../types';
import { DEMO_USERS, INITIAL_JOBS, INITIAL_RESUME } from '../data/mockData';

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'jobportal_current_user_id',
  USERS: 'jobportal_users',
  JOBS: 'jobportal_jobs',
  RESUMES: 'jobportal_resumes',
  APPLICATIONS: 'jobportal_applications',
  SAVED_JOBS: 'jobportal_saved_jobs',
  SEARCH_HISTORY: 'jobportal_search_history',
  VIEWED_JOBS: 'jobportal_viewed_jobs',
  JOB_FIT_ANALYSES: 'jobportal_fit_analyses',
};

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to read ${key} from storage:`, e);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

export class StorageService {
  // Users & Auth
  static getUsers(): User[] {
    const users = safeGet<User[]>(STORAGE_KEYS.USERS, []);
    if (users.length === 0) {
      safeSet(STORAGE_KEYS.USERS, DEMO_USERS);
      return DEMO_USERS;
    }
    return users;
  }

  static getCurrentUser(): User {
    const users = this.getUsers();
    const currentId = safeGet<string>(STORAGE_KEYS.CURRENT_USER_ID, 'user-grad');
    const found = users.find(u => u.id === currentId);
    return found || users[0] || DEMO_USERS[0];
  }

  static setCurrentUser(userId: string): void {
    safeSet(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  static registerUser(fullName: string, email: string): User {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      this.setCurrentUser(existing.id);
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
        phone: '',
        location: 'Remote',
        title: 'Software Developer',
        bio: 'Passionate developer interested in building innovative technology solutions.',
        preferredRoles: ['Software Engineer', 'Full Stack Developer'],
        preferredLocationType: ['Remote', 'Hybrid'],
        preferredEmploymentType: ['Full-time'],
        skills: ['Java', 'React', 'SQL', 'Git'],
        education: [],
        experience: [],
        projects: [],
        certifications: [],
      },
    };

    const updated = [newUser, ...users];
    safeSet(STORAGE_KEYS.USERS, updated);
    this.setCurrentUser(newUser.id);
    return newUser;
  }

  static updateUserProfile(userId: string, updatedProfile: Partial<UserProfile>): User {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return this.getCurrentUser();

    users[index] = {
      ...users[index],
      fullName: updatedProfile.fullName || users[index].fullName,
      profile: {
        ...users[index].profile,
        ...updatedProfile,
      },
    };

    safeSet(STORAGE_KEYS.USERS, users);
    return users[index];
  }

  // Jobs
  static getJobs(): JobListing[] {
    const jobs = safeGet<JobListing[]>(STORAGE_KEYS.JOBS, []);
    if (jobs.length === 0) {
      safeSet(STORAGE_KEYS.JOBS, INITIAL_JOBS);
      return INITIAL_JOBS;
    }
    return jobs;
  }

  static getJobById(jobId: string): JobListing | undefined {
    return this.getJobs().find(j => j.id === jobId);
  }

  // Resumes
  static getResumes(userId?: string): Resume[] {
    const all = safeGet<Resume[]>(STORAGE_KEYS.RESUMES, []);
    if (all.length === 0) {
      safeSet(STORAGE_KEYS.RESUMES, [INITIAL_RESUME]);
      return [INITIAL_RESUME];
    }
    if (userId) {
      return all.filter(r => r.userId === userId);
    }
    return all;
  }

  static getResumeById(resumeId: string): Resume | undefined {
    return this.getResumes().find(r => r.id === resumeId);
  }

  static saveResume(resume: Resume): Resume {
    const resumes = safeGet<Resume[]>(STORAGE_KEYS.RESUMES, [INITIAL_RESUME]);
    const index = resumes.findIndex(r => r.id === resume.id);
    const updatedResume = { ...resume, updatedAt: new Date().toISOString() };

    if (index >= 0) {
      resumes[index] = updatedResume;
    } else {
      resumes.unshift(updatedResume);
    }

    safeSet(STORAGE_KEYS.RESUMES, resumes);
    return updatedResume;
  }

  static deleteResume(resumeId: string): void {
    const resumes = this.getResumes().filter(r => r.id !== resumeId);
    safeSet(STORAGE_KEYS.RESUMES, resumes);
  }

  // Saved Jobs
  static getSavedJobIds(userId: string): string[] {
    const allSaved = safeGet<Record<string, string[]>>(STORAGE_KEYS.SAVED_JOBS, {});
    return allSaved[userId] || [];
  }

  static toggleSavedJob(userId: string, jobId: string): boolean {
    const allSaved = safeGet<Record<string, string[]>>(STORAGE_KEYS.SAVED_JOBS, {});
    const current = new Set(allSaved[userId] || []);
    let isSaved = false;

    if (current.has(jobId)) {
      current.delete(jobId);
      isSaved = false;
    } else {
      current.add(jobId);
      isSaved = true;
    }

    allSaved[userId] = Array.from(current);
    safeSet(STORAGE_KEYS.SAVED_JOBS, allSaved);
    return isSaved;
  }

  // Job Applications
  static getApplications(userId?: string): JobApplication[] {
    const apps = safeGet<JobApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
    if (userId) {
      return apps.filter(a => a.userId === userId);
    }
    return apps;
  }

  static hasApplied(userId: string, jobId: string): boolean {
    const apps = this.getApplications(userId);
    return apps.some(a => a.jobId === jobId);
  }

  static submitApplication(
    userId: string,
    job: JobListing,
    resume: Resume,
    coverNote?: string
  ): { success: boolean; message: string; application?: JobApplication } {
    if (this.hasApplied(userId, job.id)) {
      return {
        success: false,
        message: 'You have already submitted an application for this position.',
      };
    }

    const application: JobApplication = {
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
          note: 'Application received and logged into employer applicant tracking system.',
        },
      ],
      coverNote,
    };

    const allApps = this.getApplications();
    allApps.unshift(application);
    safeSet(STORAGE_KEYS.APPLICATIONS, allApps);

    // Increment applicantsCount on job
    const jobs = this.getJobs();
    const jobIdx = jobs.findIndex(j => j.id === job.id);
    if (jobIdx >= 0) {
      jobs[jobIdx].applicantsCount = (jobs[jobIdx].applicantsCount || 0) + 1;
      safeSet(STORAGE_KEYS.JOBS, jobs);
    }

    return {
      success: true,
      message: `Your application for "${job.title}" at ${job.company} was submitted successfully!`,
      application,
    };
  }

  static withdrawApplication(applicationId: string): void {
    const apps = this.getApplications().filter(a => a.id !== applicationId);
    safeSet(STORAGE_KEYS.APPLICATIONS, apps);
  }

  // Search History
  static getSearchHistory(userId: string): SearchHistoryItem[] {
    const all = safeGet<Record<string, SearchHistoryItem[]>>(STORAGE_KEYS.SEARCH_HISTORY, {});
    return all[userId] || [];
  }

  static addSearchHistory(userId: string, item: Omit<SearchHistoryItem, 'id' | 'timestamp'>): void {
    const all = safeGet<Record<string, SearchHistoryItem[]>>(STORAGE_KEYS.SEARCH_HISTORY, {});
    const userHistory = all[userId] || [];

    // Filter out identical recent queries
    const filtered = userHistory.filter(h => h.query.toLowerCase() !== item.query.toLowerCase());
    const newEntry: SearchHistoryItem = {
      ...item,
      id: `search-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    all[userId] = [newEntry, ...filtered].slice(0, 10);
    safeSet(STORAGE_KEYS.SEARCH_HISTORY, all);
  }

  // Viewed Jobs
  static getViewedJobs(userId: string): ViewedJobItem[] {
    const all = safeGet<Record<string, ViewedJobItem[]>>(STORAGE_KEYS.VIEWED_JOBS, {});
    return all[userId] || [];
  }

  static recordJobView(userId: string, job: JobListing): void {
    const all = safeGet<Record<string, ViewedJobItem[]>>(STORAGE_KEYS.VIEWED_JOBS, {});
    const current = all[userId] || [];
    const filtered = current.filter(item => item.jobId !== job.id);

    const newView: ViewedJobItem = {
      id: `view-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      viewedAt: new Date().toISOString(),
    };

    all[userId] = [newView, ...filtered].slice(0, 15);
    safeSet(STORAGE_KEYS.VIEWED_JOBS, all);
  }

  // Job Fit Analyses History
  static getJobFitAnalyses(userId: string): JobFitAnalysisResult[] {
    const all = safeGet<Record<string, JobFitAnalysisResult[]>>(STORAGE_KEYS.JOB_FIT_ANALYSES, {});
    return all[userId] || [];
  }

  static saveJobFitAnalysis(userId: string, result: JobFitAnalysisResult): void {
    const all = safeGet<Record<string, JobFitAnalysisResult[]>>(STORAGE_KEYS.JOB_FIT_ANALYSES, {});
    const userAnalyses = all[userId] || [];
    const filtered = userAnalyses.filter(a => a.jobId !== result.jobId);
    all[userId] = [result, ...filtered].slice(0, 10);
    safeSet(STORAGE_KEYS.JOB_FIT_ANALYSES, all);
  }
}
