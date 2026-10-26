import re
import math
from typing import Dict, List, Any, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def normalize_text(text: str) -> str:
    """Normalize text while preserving common technical terms."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'\bnode\.js\b', 'nodejs', text)
    text = re.sub(r'\breact\.js\b', 'react', text)
    text = re.sub(r'c\+\+', 'cpp', text)
    text = re.sub(r'c#', 'csharp', text)
    text = re.sub(r'\.net', 'dotnet', text)
    text = re.sub(r'[^a-z0-9\s_-]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def normalize_skill(skill: str) -> str:
    """Normalize a skill token for string equality checks."""
    return re.sub(r'[^a-z0-9]', '', skill.lower())

class JobFitMatchingEngine:
    def __init__(self):
        # Configure Scikit-learn TF-IDF Vectorizer with unigrams and bigrams
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words='english',
            max_features=5000
        )

    def compute_tfidf_similarity(self, resume_doc: str, job_doc: str) -> float:
        """
        Compute TF-IDF cosine similarity between resume and job description.
        Returns a score scaled from 0 to 100.
        """
        norm_resume = normalize_text(resume_doc)
        norm_job = normalize_text(job_doc)

        if not norm_resume or not norm_job:
            return 0.0

        try:
            tfidf_matrix = self.vectorizer.fit_transform([norm_resume, norm_job])
            raw_cosine = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            # Standard resume-job text overlap is between 0.15 and 0.65; scale nicely
            scaled_score = min(100.0, max(0.0, (float(raw_cosine) / 0.65) * 100.0))
            return round(scaled_score, 1)
        except Exception:
            return 50.0

    def evaluate_skills(
        self,
        user_skills: List[str],
        resume_full_text: str,
        required_skills: List[str],
        preferred_skills: List[str]
    ) -> Tuple[List[str], List[str], List[str], float]:
        """
        Compare user skills with job required and preferred skills.
        Calculates matched, missing, and partially matched skills, along with a weighted skills score.
        """
        norm_user_skills = {normalize_skill(s) for s in user_skills}
        norm_resume_text = normalize_text(resume_full_text)

        matched = []
        missing = []
        partially_matched = []

        all_job_skills = list(dict.fromkeys(required_skills + preferred_skills))

        for skill in all_job_skills:
            norm_s = normalize_skill(skill)
            if norm_s in norm_user_skills:
                matched.append(skill)
            elif skill.lower() in norm_resume_text:
                partially_matched.append(skill)
            else:
                missing.append(skill)

        # Weighted calculation: required skills count 2x
        points_earned = 0.0
        points_possible = 0.0

        for s in required_skills:
            points_possible += 2.0
            if normalize_skill(s) in norm_user_skills:
                points_earned += 2.0
            elif s in partially_matched:
                points_earned += 1.2

        for s in preferred_skills:
            points_possible += 1.0
            if normalize_skill(s) in norm_user_skills:
                points_earned += 1.0
            elif s in partially_matched:
                points_earned += 0.6

        skills_score = round((points_earned / points_possible) * 100.0, 1) if points_possible > 0 else 75.0
        return matched, missing, partially_matched, min(100.0, skills_score)

    def predict_fit(
        self,
        resume_data: Dict[str, Any],
        job_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute full Job-Fit prediction using the documented 40/30/15/15 weighted model.
        Weights:
          - Technical Skills Match: 40%
          - TF-IDF Cosine Similarity: 30%
          - Experience Level Alignment: 15%
          - Role & Qualifications Alignment: 15%
        """
        # Assemble resume document
        resume_parts = [
            resume_data.get('title', ''),
            resume_data.get('summary', ''),
            " ".join(resume_data.get('skills', [])),
            " ".join([exp.get('description', '') for exp in resume_data.get('experience', [])]),
            " ".join([proj.get('description', '') for proj in resume_data.get('projects', [])]),
        ]
        resume_doc = " ".join(resume_parts)

        # Assemble job document
        job_parts = [
            job_data.get('title', ''),
            job_data.get('description', ''),
            " ".join(job_data.get('responsibilities', [])),
            " ".join(job_data.get('qualifications', [])),
            " ".join(job_data.get('requiredSkills', [])),
            " ".join(job_data.get('preferredSkills', [])),
        ]
        job_doc = " ".join(job_parts)

        # 1. TF-IDF Cosine Similarity (30%)
        tfidf_score = self.compute_tfidf_similarity(resume_doc, job_doc)

        # 2. Skills Match (40%)
        user_skills = resume_data.get('skills', [])
        req_skills = job_data.get('requiredSkills', [])
        pref_skills = job_data.get('preferredSkills', [])
        matched_skills, missing_skills, partial_skills, skills_score = self.evaluate_skills(
            user_skills, resume_doc, req_skills, pref_skills
        )

        # 3. Experience Match (15%)
        min_years = job_data.get('minExperienceYears', 0)
        user_years = resume_data.get('experienceYears', 1.0)
        if min_years == 0:
            exp_score = 95.0
        elif user_years >= min_years:
            exp_score = 100.0
        else:
            exp_score = round(max(30.0, (user_years / float(min_years)) * 90.0), 1)

        # 4. Role & Qualification Alignment (15%)
        qual_score = 75.0
        target_role = resume_data.get('title', '').lower()
        job_title = job_data.get('title', '').lower()
        if any(w in job_title for w in target_role.split()):
            qual_score += 20.0
        qual_score = min(100.0, qual_score)

        # Overall Weighted Score
        overall_score = round(
            skills_score * 0.40 +
            tfidf_score * 0.30 +
            exp_score * 0.15 +
            qual_score * 0.15
        )

        # Formulate explanation
        if overall_score >= 80:
            explanation = f"High fit! Your profile matches {len(matched_skills)} key competencies with strong TF-IDF content alignment ({tfidf_score}%)."
        elif overall_score >= 60:
            explanation = f"Solid candidate. You meet primary requirements but bridging {len(missing_skills)} missing skills will improve interview probability."
        else:
            explanation = f"Moderate match. Emphasizing relevant projects in {', '.join(missing_skills[:3])} is recommended."

        # Generate actionable suggestions
        suggestions = []
        if missing_skills:
            top_missing = missing_skills[:3]
            suggestions.append({
                'id': 'sug-ml-1',
                'section': 'skills',
                'title': f"Add missing core skills: {', '.join(top_missing)}",
                'issue': f"Job specifically prioritizes {', '.join(top_missing)}.",
                'suggestedAction': "Add these skills to your Technical Skills section if you have practical experience.",
                'suggestedText': ", ".join(top_missing),
                'impact': 'High',
                'status': 'pending'
            })

        company = job_data.get('company', 'the hiring team')
        job_t = job_data.get('title', 'Software Engineer')
        suggestions.append({
            'id': 'sug-ml-2',
            'section': 'summary',
            'title': f"Tailor Objective for {job_t} at {company}",
            'issue': "Generic summaries perform lower in automated recruiter screening.",
            'suggestedAction': "Highlight target competencies directly aligned with this job description.",
            'suggestedText': f"Proactive software engineer skilled in {', '.join(matched_skills[:3])}. Passionate about building reliable solutions for {company}'s {job_t} position.",
            'impact': 'High',
            'status': 'pending'
        })

        return {
            'overallScore': int(overall_score),
            'breakdown': {
                'skillsMatchScore': round(skills_score),
                'tfidfSimilarityScore': round(tfidf_score),
                'experienceMatchScore': round(exp_score),
                'qualificationMatchScore': round(qual_score),
            },
            'matchedSkills': matched_skills,
            'missingSkills': missing_skills,
            'partiallyMatchedSkills': partial_skills,
            'explanation': explanation,
            'suggestions': suggestions,
            'recommendedNextSteps': [
                f"Review and bridge missing skills: {', '.join(missing_skills[:2]) if missing_skills else 'None'}",
                f"Incorporate target keywords for {company} into project bullet points.",
                "Export an ATS-friendly PDF resume using the Intelligent Resume Builder."
            ]
        }
