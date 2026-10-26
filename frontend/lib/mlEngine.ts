import {
  JobListing,
  JobFitAnalysisResult,
  JobFitScoreBreakdown,
  Resume,
  ResumeSuggestion,
  UserProfile,
  JobRecommendation,
} from '@/types';

// Standard English stop words
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any',
  'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
  'between', 'both', 'but', 'by', 'can', 'cannot', 'could', 'did', 'do', 'does',
  'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'its',
  'itself', 'just', 'll', 'm', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor',
  'not', 'now', 'o', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours',
  'ourselves', 'out', 'over', 'own', 're', 's', 'same', 'she', 'should', 'so',
  'some', 'such', 't', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under',
  'until', 'up', 've', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which',
  'while', 'who', 'whom', 'why', 'will', 'with', 'won\'t', 'would', 'you', 'your',
  'yours', 'yourself', 'yourselves'
]);

export function tokenize(text: string): string[] {
  if (!text) return [];
  const normalized = text
    .toLowerCase()
    .replace(/\bnode\.js\b/g, 'nodejs')
    .replace(/\bvue\.js\b/g, 'vuejs')
    .replace(/\bnext\.js\b/g, 'nextjs')
    .replace(/\breact\.js\b/g, 'react')
    .replace(/c\+\+/g, 'cpp')
    .replace(/c#/g, 'csharp')
    .replace(/\.net/g, 'dotnet')
    .replace(/[^a-z0-9\s_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = normalized.split(' ').filter(w => w.length > 1 && !STOP_WORDS.has(w));
  const tokens = [...words];
  for (let i = 0; i < words.length - 1; i++) {
    tokens.push(`${words[i]}_${words[i + 1]}`);
  }
  return tokens;
}

export function calculateTF(tokens: string[]): Map<string, number> {
  const tfMap = new Map<string, number>();
  if (tokens.length === 0) return tfMap;

  for (const token of tokens) {
    tfMap.set(token, (tfMap.get(token) || 0) + 1);
  }

  for (const [token, count] of tfMap.entries()) {
    tfMap.set(token, count / tokens.length);
  }

  return tfMap;
}

export function calculateCosineSimilarity(
  tf1: Map<string, number>,
  tf2: Map<string, number>
): number {
  if (tf1.size === 0 || tf2.size === 0) return 0;

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (const val of tf1.values()) {
    norm1 += val * val;
  }
  for (const val of tf2.values()) {
    norm2 += val * val;
  }

  for (const [term, val1] of tf1.entries()) {
    if (tf2.has(term)) {
      dotProduct += val1 * (tf2.get(term) || 0);
    }
  }

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

function normalizeSkill(s: string): string {
  return s
    .toLowerCase()
    .replace(/\.js\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export function resumeToDocument(resume: Resume | UserProfile): string {
  const parts: string[] = [];

  if ('personalDetails' in resume) {
    parts.push(resume.personalDetails.title || '');
    parts.push(resume.personalDetails.summary || '');
  } else {
    parts.push(resume.title || '');
    parts.push(resume.bio || '');
  }

  parts.push(resume.skills.join(' '));

  resume.experience.forEach(exp => {
    parts.push(`${exp.jobTitle} at ${exp.company}`);
    parts.push(exp.description);
    if (exp.technologiesUsed) {
      parts.push(exp.technologiesUsed.join(' '));
    }
  });

  resume.projects.forEach(proj => {
    parts.push(proj.title);
    parts.push(proj.description);
    if (proj.technologies) {
      parts.push(proj.technologies.join(' '));
    }
  });

  resume.education.forEach(edu => {
    parts.push(`${edu.degree} in ${edu.fieldOfStudy} at ${edu.institution}`);
    if (edu.description) parts.push(edu.description);
  });

  if (resume.certifications) {
    resume.certifications.forEach(cert => {
      parts.push(`${cert.name} by ${cert.issuer}`);
    });
  }

  return parts.join(' ');
}

export function jobToDocument(job: JobListing): string {
  return [
    job.title,
    job.department,
    job.description,
    job.responsibilities.join(' '),
    job.qualifications.join(' '),
    job.requiredSkills.join(' '),
    job.preferredSkills.join(' '),
  ].join(' ');
}

export function analyzeJobFit(
  resumeOrJob: Resume | UserProfile | JobListing,
  jobOrResume: JobListing | Resume | UserProfile
): JobFitAnalysisResult {
  const isFirstJob = 'responsibilities' in resumeOrJob || 'salaryMin' in resumeOrJob;
  const resume = (isFirstJob ? jobOrResume : resumeOrJob) as Resume | UserProfile;
  const job = (isFirstJob ? resumeOrJob : jobOrResume) as JobListing;

  const resumeText = resumeToDocument(resume);
  const jobText = jobToDocument(job);

  const resumeTokens = tokenize(resumeText);
  const jobTokens = tokenize(jobText);

  const resumeTF = calculateTF(resumeTokens);
  const jobTF = calculateTF(jobTokens);

  const rawCosine = calculateCosineSimilarity(resumeTF, jobTF);
  const tfidfSimilarityScore = Math.min(100, Math.round(Math.max(0, (rawCosine / 0.65) * 100)));

  const userSkillSet = new Set(resume.skills.map(s => normalizeSkill(s)));
  const userTextLower = resumeText.toLowerCase();

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  const partiallyMatchedSkills: string[] = [];

  const allJobSkills = [...new Set([...job.requiredSkills, ...job.preferredSkills])];

  for (const skill of allJobSkills) {
    const norm = normalizeSkill(skill);
    if (userSkillSet.has(norm)) {
      matchedSkills.push(skill);
    } else if (userTextLower.includes(skill.toLowerCase())) {
      partiallyMatchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  let skillPointsEarned = 0;
  let totalSkillPointsPossible = 0;

  for (const skill of job.requiredSkills) {
    totalSkillPointsPossible += 2;
    const norm = normalizeSkill(skill);
    if (userSkillSet.has(norm)) {
      skillPointsEarned += 2;
    } else if (partiallyMatchedSkills.includes(skill)) {
      skillPointsEarned += 1.2;
    }
  }

  for (const skill of job.preferredSkills) {
    totalSkillPointsPossible += 1;
    const norm = normalizeSkill(skill);
    if (userSkillSet.has(norm)) {
      skillPointsEarned += 1;
    } else if (partiallyMatchedSkills.includes(skill)) {
      skillPointsEarned += 0.6;
    }
  }

  const skillsMatchScore = totalSkillPointsPossible > 0
    ? Math.min(100, Math.round((skillPointsEarned / totalSkillPointsPossible) * 100))
    : 75;

  let totalMonths = 0;
  for (const exp of resume.experience) {
    const startYear = parseInt(exp.startDate.split('-')[0] || '2023', 10);
    const endYear = exp.current
      ? 2026
      : parseInt(exp.endDate.split('-')[0] || '2025', 10);
    const yearsDiff = Math.max(0.5, endYear - startYear);
    totalMonths += yearsDiff * 12;
  }
  const userExpYears = totalMonths / 12;

  let experienceMatchScore = 70;
  if (job.minExperienceYears === 0) {
    experienceMatchScore = 95;
  } else if (userExpYears >= job.minExperienceYears) {
    experienceMatchScore = 100;
  } else {
    const ratio = userExpYears / job.minExperienceYears;
    experienceMatchScore = Math.min(90, Math.max(30, Math.round(ratio * 90)));
  }

  const userTitle = ('personalDetails' in resume ? resume.personalDetails.title : resume.title) || '';
  const titleTokens = tokenize(userTitle);
  const jobTitleTokens = tokenize(job.title);
  let titleOverlap = 0;
  for (const token of titleTokens) {
    if (jobTitleTokens.includes(token)) titleOverlap++;
  }

  let qualificationMatchScore = 65;
  if (titleOverlap > 0) qualificationMatchScore += 20;
  if (resume.education.length > 0) qualificationMatchScore += 15;
  qualificationMatchScore = Math.min(100, qualificationMatchScore);

  const breakdown: JobFitScoreBreakdown = {
    skillsMatchScore,
    tfidfSimilarityScore,
    experienceMatchScore,
    qualificationMatchScore,
  };

  const overallScore = Math.round(
    breakdown.skillsMatchScore * 0.40 +
    breakdown.tfidfSimilarityScore * 0.30 +
    breakdown.experienceMatchScore * 0.15 +
    breakdown.qualificationMatchScore * 0.15
  );

  const suggestions: ResumeSuggestion[] = [];

  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 3);
    suggestions.push({
      id: `sug-skill-${Date.now()}-1`,
      section: 'skills',
      title: `Add targeted skills: ${topMissing.join(', ')}`,
      issue: `The job listing strongly emphasizes ${topMissing.join(', ')}, which are not listed in your technical skills.`,
      suggestedAction: `If you have academic, project, or self-taught experience with these tools, explicitly add them to your skills list.`,
      suggestedText: topMissing.join(', '),
      status: 'pending',
      impact: 'High',
    });
  }

  if (partiallyMatchedSkills.length > 0) {
    suggestions.push({
      id: `sug-skill-${Date.now()}-2`,
      section: 'skills',
      title: `Promote mention of ${partiallyMatchedSkills.slice(0, 2).join(' & ')} to Primary Skills`,
      issue: `You mentioned ${partiallyMatchedSkills.join(', ')} in your project text, but ATS parsers index skills section first.`,
      suggestedAction: `Add ${partiallyMatchedSkills.join(', ')} to your core Technical Skills section.`,
      suggestedText: partiallyMatchedSkills.join(', '),
      status: 'pending',
      impact: 'Medium',
    });
  }

  const currentSummary = ('personalDetails' in resume ? resume.personalDetails.summary : resume.bio) || '';
  const tailoredSummary = `Results-driven software developer with hands-on proficiency in ${matchedSkills.slice(0, 4).join(', ')}${job.requiredSkills.length > 0 ? ` and a strong focus on ${job.title} competencies` : ''}. Eager to contribute to ${job.company}'s engineering objectives by building scalable, maintainable solutions.`;

  suggestions.push({
    id: `sug-summary-${Date.now()}-3`,
    section: 'summary',
    title: `Tailor Career Objective for ${job.title} at ${job.company}`,
    issue: `A tailored summary incorporating the target company and key role keywords significantly increases recruiter engagement.`,
    suggestedAction: `Update your summary to highlight relevant overlap with ${job.company}'s tech stack.`,
    originalText: currentSummary,
    suggestedText: tailoredSummary,
    status: 'pending',
    impact: 'High',
  });

  if (resume.projects.length > 0) {
    const firstProj = resume.projects[0];
    const enhancedProjDesc = `${firstProj.description} Engineered using ${firstProj.technologies.join(', ')}, achieving optimized performance and modular REST API integration.`;
    suggestions.push({
      id: `sug-proj-${Date.now()}-4`,
      section: 'projects',
      title: `Quantify impact in project: "${firstProj.title}"`,
      issue: `Recruiters look for concrete engineering metrics and specific tech stacks in project bullet points.`,
      suggestedAction: `Enhance project description with specific engineering contributions and outcomes.`,
      originalText: firstProj.description,
      suggestedText: enhancedProjDesc,
      status: 'pending',
      impact: 'Medium',
    });
  }

  let explanation = '';
  if (overallScore >= 80) {
    explanation = `Outstanding alignment! Your background matches ${matchedSkills.length} out of ${allJobSkills.length} required competencies with a strong ${tfidfSimilarityScore}% TF-IDF document similarity. You are an exceptional fit for this role.`;
  } else if (overallScore >= 60) {
    explanation = `Good candidate profile. You possess foundational competencies (${matchedSkills.slice(0, 3).join(', ')}), but bridging ${missingSkills.length} key skill gaps will substantially increase your interview odds.`;
  } else {
    explanation = `Moderate match. While your profile demonstrates valuable transferrable skills, this role specifically requires experience with ${missingSkills.slice(0, 3).join(', ')}. Addressing these gaps in your resume or projects will improve your score.`;
  }

  const recommendedNextSteps: string[] = [
    missingSkills.length > 0
      ? `Review the missing skills (${missingSkills.slice(0, 2).join(', ')}) and add relevant project coursework if applicable.`
      : `Highlight your work with ${matchedSkills.slice(0, 2).join(', ')} prominently in your top work experience.`,
    `Apply the tailored summary to align your resume with ${job.company}'s specific engineering stack.`,
    `Run the built-in Intelligent Resume Builder to export an ATS-compliant PDF for submission.`
  ];

  return {
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    analyzedAt: new Date().toISOString(),
    overallScore,
    breakdown,
    matchedSkills,
    missingSkills,
    partiallyMatchedSkills,
    explanation,
    suggestions,
    recommendedNextSteps,
  };
}

export function calculateJobRecommendationScore(
  profile: UserProfile,
  job: JobListing,
  viewedJobIds: Set<string>,
  appliedJobIds: Set<string>
): { score: number; reason: string; matchedKeySkills: string[] } {
  const userSkillNorms = new Set(profile.skills.map(s => normalizeSkill(s)));
  const matchedKeySkills: string[] = [];

  for (const skill of [...job.requiredSkills, ...job.preferredSkills]) {
    if (userSkillNorms.has(normalizeSkill(skill))) {
      matchedKeySkills.push(skill);
    }
  }

  const skillScore = job.requiredSkills.length > 0
    ? (matchedKeySkills.length / job.requiredSkills.length) * 100
    : 60;

  let roleMatchBonus = 0;
  for (const preferredRole of profile.preferredRoles) {
    if (job.title.toLowerCase().includes(preferredRole.toLowerCase())) {
      roleMatchBonus += 15;
      break;
    }
  }

  let locationBonus = 0;
  if (profile.preferredLocationType.includes(job.workLocationType)) {
    locationBonus += 10;
  }
  if (profile.preferredEmploymentType.includes(job.employmentType)) {
    locationBonus += 10;
  }

  let totalScore = Math.min(99, Math.round(skillScore * 0.55 + roleMatchBonus + locationBonus + 15));

  if (appliedJobIds.has(job.id)) {
    totalScore = Math.max(10, totalScore - 20);
  }

  let reason = '';
  if (matchedKeySkills.length >= 3) {
    reason = `Matches your core skills in ${matchedKeySkills.slice(0, 3).join(', ')}`;
  } else if (roleMatchBonus > 0) {
    reason = `Aligns with your preferred career target: "${job.title}"`;
  } else if (job.workLocationType === 'Remote') {
    reason = `Remote opportunity matching your technical background`;
  } else {
    reason = `Recommended based on your engineering profile and preferences`;
  }

  return {
    score: totalScore,
    reason,
    matchedKeySkills,
  };
}

export function generateRecommendations(
  profile: UserProfile,
  allJobs: JobListing[],
  resume?: Resume
): JobRecommendation[] {
  const viewedSet = new Set<string>();
  const appliedSet = new Set<string>();
  return allJobs
    .map((job) => {
      const { score, reason, matchedKeySkills } = calculateJobRecommendationScore(
        profile,
        job,
        viewedSet,
        appliedSet
      );
      return {
        job,
        matchScore: score,
        reason,
        matchedKeySkills,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
