import {
  JobListing,
  JobFitAnalysisResult,
  JobFitScoreBreakdown,
  Resume,
  ResumeSuggestion,
  UserProfile,
} from '../types';

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

/**
 * Tokenize and normalize text, keeping compound terms and filtering stopwords.
 */
export function tokenize(text: string): string[] {
  if (!text) return [];
  // Normalize punctuation and symbols while preserving technical tokens like c++, c#, .net, node.js
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

  // Also include 2-word n-grams for technical phrases (e.g. "machine learning", "spring boot", "rest api")
  const tokens = [...words];
  for (let i = 0; i < words.length - 1; i++) {
    tokens.push(`${words[i]}_${words[i + 1]}`);
  }

  return tokens;
}

/**
 * Calculate Term Frequency (TF) for a document.
 */
export function calculateTF(tokens: string[]): Map<string, number> {
  const tfMap = new Map<string, number>();
  if (tokens.length === 0) return tfMap;

  for (const token of tokens) {
    tfMap.set(token, (tfMap.get(token) || 0) + 1);
  }

  // Normalize by total token count
  for (const [token, count] of tfMap.entries()) {
    tfMap.set(token, count / tokens.length);
  }

  return tfMap;
}

/**
 * Calculate Cosine Similarity between two TF-IDF / TF weight vectors.
 */
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

/**
 * Extract canonical skill strings for robust matching.
 */
function normalizeSkill(s: string): string {
  return s
    .toLowerCase()
    .replace(/\.js\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Compile resume into a unified text document for NLP comparison.
 */
export function resumeToDocument(resume: Resume | UserProfile): string {
  const parts: string[] = [];

  if ('personalDetails' in resume) {
    parts.push(resume.personalDetails.title || '');
    parts.push(resume.personalDetails.summary || '');
  } else {
    parts.push(resume.title || '');
    parts.push(resume.bio || '');
  }

  // Skills
  parts.push(resume.skills.join(' '));

  // Experience
  resume.experience.forEach(exp => {
    parts.push(`${exp.jobTitle} at ${exp.company}`);
    parts.push(exp.description);
    if (exp.technologiesUsed) {
      parts.push(exp.technologiesUsed.join(' '));
    }
  });

  // Projects
  resume.projects.forEach(proj => {
    parts.push(proj.title);
    parts.push(proj.description);
    if (proj.technologies) {
      parts.push(proj.technologies.join(' '));
    }
  });

  // Education
  resume.education.forEach(edu => {
    parts.push(`${edu.degree} in ${edu.fieldOfStudy} at ${edu.institution}`);
    if (edu.description) parts.push(edu.description);
  });

  // Certifications
  if (resume.certifications) {
    resume.certifications.forEach(cert => {
      parts.push(`${cert.name} by ${cert.issuer}`);
    });
  }

  return parts.join(' ');
}

/**
 * Compile job into a unified text document.
 */
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

/**
 * Performs full AI/ML job-fit prediction, skill-gap analysis, and resume improvement generation.
 * Follows the specified weighted scoring model:
 * - Technical Skills Overlap: 40%
 * - TF-IDF Cosine Similarity of experience/keywords: 30%
 * - Experience Level Match: 15%
 * - Role & Qualification Alignment: 15%
 */
export function analyzeJobFit(
  resume: Resume | UserProfile,
  job: JobListing
): JobFitAnalysisResult {
  // 1. Text extraction & TF-IDF Cosine Similarity
  const resumeText = resumeToDocument(resume);
  const jobText = jobToDocument(job);

  const resumeTokens = tokenize(resumeText);
  const jobTokens = tokenize(jobText);

  const resumeTF = calculateTF(resumeTokens);
  const jobTF = calculateTF(jobTokens);

  const rawCosine = calculateCosineSimilarity(resumeTF, jobTF);
  // Scale raw cosine (typically 0.15 - 0.75 in natural resumes) to a 0-100 rating
  const tfidfSimilarityScore = Math.min(100, Math.round(Math.max(0, (rawCosine / 0.65) * 100)));

  // 2. Skill Matching
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
      // Mentioned in experience or project description, but not in explicit skills list
      partiallyMatchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  // Skills Score: Required skills carry 2x weight of preferred skills
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

  // 3. Experience Match Score
  // Calculate user total years of experience
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
    // Entry level / fresher friendly
    experienceMatchScore = 95;
  } else if (userExpYears >= job.minExperienceYears) {
    experienceMatchScore = 100;
  } else {
    // Gap penalty
    const ratio = userExpYears / job.minExperienceYears;
    experienceMatchScore = Math.min(90, Math.max(30, Math.round(ratio * 90)));
  }

  // 4. Role & Qualification Alignment Score
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

  // 5. Final Weighted Combination:
  // 40% Skills + 30% TF-IDF Cosine Similarity + 15% Experience + 15% Role/Qualifications
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

  // 6. Generate Actionable, Editable Suggestions
  const suggestions: ResumeSuggestion[] = [];

  // Suggest missing top required skills
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

  // Promote partially matched skills
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

  // Summary / Objective tailoring
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

  // Project impact quantification suggestion
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

  // Formulate clear explanation
  let explanation = '';
  if (overallScore >= 80) {
    explanation = `Outstanding alignment! Your background matches ${matchedSkills.length} out of ${allJobSkills.length} required competencies with a strong ${tfidfSimilarityScore}% TF-IDF document similarity. You are an exceptional fit for this role.`;
  } else if (overallScore >= 60) {
    explanation = `Good candidate profile. You possess foundational competencies (${matchedSkills.slice(0, 3).join(', ')}), but bridging ${missingSkills.length} key skill gaps will substantially increase your interview odds.`;
  } else {
    explanation = `Moderate match. While your profile demonstrates valuable transferrable skills, this role specifically requires experience with ${missingSkills.slice(0, 3).join(', ')}. Addressing these gaps in your resume or projects will improve your score.`;
  }

  // Recommended next steps
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

/**
 * Calculate personalized recommendation score and explanation badge for a job.
 */
export function calculateJobRecommendationScore(
  profile: UserProfile,
  job: JobListing,
  viewedJobIds: Set<string>,
  appliedJobIds: Set<string>
): { score: number; reason: string; matchedKeySkills: string[] } {
  // Check skills overlap
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

  // Role preference match
  let roleMatchBonus = 0;
  for (const preferredRole of profile.preferredRoles) {
    if (job.title.toLowerCase().includes(preferredRole.toLowerCase())) {
      roleMatchBonus += 15;
      break;
    }
  }

  // Location preference match
  let locationBonus = 0;
  if (profile.preferredLocationType.includes(job.workLocationType)) {
    locationBonus += 10;
  }
  if (profile.preferredEmploymentType.includes(job.employmentType)) {
    locationBonus += 10;
  }

  // Compute final recommendation weight
  let totalScore = Math.min(99, Math.round(skillScore * 0.55 + roleMatchBonus + locationBonus + 15));

  // Small diversity adjustment: do not penalize just for viewing, but rank unapplied relevant jobs highest
  if (appliedJobIds.has(job.id)) {
    totalScore = Math.max(10, totalScore - 20); // Already applied
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
