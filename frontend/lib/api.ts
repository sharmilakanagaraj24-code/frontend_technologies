import {
  JobListing,
  Resume,
  JobApplication,
  JobFitAnalysisResult,
  JobRecommendation,
  User,
} from '@/types';
import {
  getJobs,
  getJobById,
  getResumes,
  getResumeById,
  saveResume,
  deleteResume,
  getApplications,
  submitApplication,
  updateApplicationStatus,
} from './storage';
import { analyzeJobFit, generateRecommendations } from './mlEngine';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';
const ML_SERVICE_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:5000/api/ml';

/**
 * Universal API client for the Spring Boot backend + Python Scikit-learn microservice.
 * Includes automatic graceful fallback to client-side storage & ML engine so all
 * interactions work smoothly even if local backend containers are not booted.
 */
export const api = {
  // --- Jobs Endpoints (Spring Boot: JobController) ---
  async getJobs(params?: {
    keyword?: string;
    location?: string;
    employmentType?: string;
    experienceLevel?: string;
  }): Promise<JobListing[]> {
    try {
      const query = new URLSearchParams();
      if (params?.keyword) query.set('keyword', params.keyword);
      if (params?.location) query.set('location', params.location);
      if (params?.employmentType) query.set('type', params.employmentType);
      if (params?.experienceLevel) query.set('level', params.experienceLevel);

      const res = await fetch(`${API_BASE_URL}/jobs?${query.toString()}`, {
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to storage
    }

    let all = getJobs();
    if (params?.keyword) {
      const q = params.keyword.toLowerCase();
      all = all.filter(
        j =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.requiredSkills.some(s => s.toLowerCase().includes(q))
      );
    }
    if (params?.location && params.location !== 'All') {
      all = all.filter(j => j.location.toLowerCase().includes(params.location!.toLowerCase()));
    }
    if (params?.employmentType && params.employmentType !== 'All') {
      all = all.filter(j => j.employmentType === params.employmentType);
    }
    if (params?.experienceLevel && params.experienceLevel !== 'All') {
      all = all.filter(j => j.experienceLevel === params.experienceLevel);
    }
    return all;
  },

  async getJob(id: string): Promise<JobListing | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return getJobById(id) || null;
  },

  // --- Resume Endpoints (Spring Boot: ResumeController) ---
  async getResumes(userId: string): Promise<Resume[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/resumes?userId=${userId}`, {
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return getResumes(userId);
  },

  async getResume(id: string): Promise<Resume | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/resumes/${id}`, {
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return getResumeById(id) || null;
  },

  async saveResume(resume: Resume): Promise<Resume> {
    try {
      const res = await fetch(`${API_BASE_URL}/resumes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resume),
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    saveResume(resume);
    return resume;
  },

  async deleteResume(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/resumes/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(1500),
      });
    } catch {
      // fallback
    }
    deleteResume(id);
  },

  // --- Applications Endpoints (Spring Boot: ApplicationController) ---
  async getApplications(userId: string): Promise<JobApplication[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/applications?userId=${userId}`, {
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return getApplications(userId);
  },

  async applyToJob(
    job: JobListing,
    resume: Resume,
    user: User,
    coverNote?: string
  ): Promise<{ success: boolean; message: string; application?: JobApplication }> {
    try {
      const res = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          resumeId: resume.id,
          userId: user.id,
          coverNote,
        }),
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return submitApplication(job, resume, user, coverNote);
  },

  async updateApplicationStatus(
    appId: string,
    status: JobApplication['status'],
    note: string
  ): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
        signal: AbortSignal.timeout(1500),
      });
    } catch {
      // fallback
    }
    updateApplicationStatus(appId, status, note);
  },

  // --- AI / ML Service Endpoints (Python Scikit-learn Service) ---
  async predictJobFit(job: JobListing, resumeOrProfile: Resume | User['profile']): Promise<JobFitAnalysisResult> {
    try {
      const res = await fetch(`${ML_SERVICE_URL}/predict-fit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job,
          candidate: resumeOrProfile,
        }),
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Seamlessly fallback to the mathematical TF-IDF & cosine similarity engine
    }
    return analyzeJobFit(job, resumeOrProfile);
  },

  async getRecommendations(user: User): Promise<JobRecommendation[]> {
    try {
      const res = await fetch(`${ML_SERVICE_URL}/recommendations?userId=${user.id}`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) return await res.json();
    } catch {
      // Seamless fallback
    }
    const allJobs = getJobs();
    const resumes = getResumes(user.id);
    const resume = resumes[0];
    return generateRecommendations(user.profile, allJobs, resume);
  },
};
