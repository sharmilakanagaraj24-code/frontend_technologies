export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
export type ExperienceLevel = 'Entry-level' | 'Mid-level' | 'Senior' | 'Lead';
export type WorkLocationType = 'Remote' | 'Hybrid' | 'On-site';

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Rejected'
  | 'Accepted';

export interface Skill {
  id: string;
  name: string;
  category: 'Languages' | 'Frameworks' | 'Databases' | 'Cloud & DevOps' | 'AI & Data' | 'Tools & Methods';
}

export interface EducationItem {
  id: string;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gradeOrGpa?: string;
  description?: string;
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  technologiesUsed: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  role?: string;
  link?: string;
  description: string;
  technologies: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  bio: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  preferredRoles: string[];
  preferredLocationType: WorkLocationType[];
  preferredEmploymentType: EmploymentType[];
  skills: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'job_seeker' | 'employer';
  createdAt: string;
  profile: UserProfile;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  companyLogoUrl?: string;
  location: string;
  workLocationType: WorkLocationType;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  minExperienceYears: number;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  department: string;
  postedDate: string;
  deadlineDate: string;
  applicantsCount: number;
}

export interface ResumeSuggestion {
  id: string;
  section: 'skills' | 'projects' | 'summary' | 'experience';
  title: string;
  issue: string;
  suggestedAction: string;
  suggestedText?: string;
  originalText?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'edited';
  editedContent?: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface JobFitScoreBreakdown {
  skillsMatchScore: number;       // 40% weight
  tfidfSimilarityScore: number;   // 30% weight
  experienceMatchScore: number;   // 15% weight
  qualificationMatchScore: number;// 15% weight
}

export interface JobFitAnalysisResult {
  jobId: string;
  jobTitle: string;
  company: string;
  analyzedAt: string;
  overallScore: number;           // 0 to 100
  breakdown: JobFitScoreBreakdown;
  matchedSkills: string[];
  missingSkills: string[];
  partiallyMatchedSkills: string[];
  explanation: string;
  suggestions: ResumeSuggestion[];
  recommendedNextSteps: string[];
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  targetJobRole?: string;
  targetJobId?: string;
  templateId: 'modern' | 'classic' | 'executive' | 'minimal';
  personalDetails: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    title: string;
    summary: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  skills: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  job: JobListing;
  userId: string;
  resumeId: string;
  resumeTitle: string;
  appliedDate: string;
  status: ApplicationStatus;
  statusUpdates: {
    status: ApplicationStatus;
    timestamp: string;
    note: string;
  }[];
  coverNote?: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  filters: {
    location?: string;
    experienceLevel?: string;
    employmentType?: string;
  };
  timestamp: string;
  resultCount: number;
}

export interface ViewedJobItem {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  viewedAt: string;
}

export interface JobRecommendation {
  job: JobListing;
  matchScore: number;
  reason: string;
  matchedKeySkills: string[];
}
