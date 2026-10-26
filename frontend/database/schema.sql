-- ====================================================================
-- AI-Powered Job Portal with Intelligent Resume Builder
-- Database Schema: job_portal_db
-- Target Engine: MySQL 8.0+
-- ====================================================================

CREATE DATABASE IF NOT EXISTS job_portal_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE job_portal_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role ENUM('job_seeker', 'employer', 'admin') DEFAULT 'job_seeker',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE,
    phone VARCHAR(30),
    location VARCHAR(120),
    title VARCHAR(150),
    bio TEXT,
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    preferred_roles JSON,
    preferred_location_types JSON,
    preferred_employment_types JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Skills Master Catalog Table
CREATE TABLE IF NOT EXISTS skills (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(80) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_skill_name (name)
) ENGINE=InnoDB;

-- 4. User Skills Association Table
CREATE TABLE IF NOT EXISTS user_skills (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    skill_id VARCHAR(64) NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    years_of_experience DECIMAL(4, 1) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_skill (user_id, skill_id),
    CONSTRAINT fk_userskill_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_userskill_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(64) PRIMARY KEY,
    employer_id VARCHAR(64),
    title VARCHAR(180) NOT NULL,
    company VARCHAR(150) NOT NULL,
    company_logo_url VARCHAR(255),
    location VARCHAR(120) NOT NULL,
    work_location_type ENUM('Remote', 'Hybrid', 'On-site') NOT NULL,
    employment_type ENUM('Full-time', 'Part-time', 'Contract', 'Internship') NOT NULL,
    experience_level ENUM('Entry-level', 'Mid-level', 'Senior', 'Lead') NOT NULL,
    min_experience_years INT DEFAULT 0,
    salary_min INT NOT NULL,
    salary_max INT NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    department VARCHAR(100),
    description TEXT NOT NULL,
    responsibilities JSON NOT NULL,
    qualifications JSON NOT NULL,
    posted_date DATE NOT NULL,
    deadline_date DATE NOT NULL,
    applicants_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_job_title (title),
    INDEX idx_job_company (company),
    INDEX idx_job_location (location),
    INDEX idx_job_work_type (work_location_type),
    INDEX idx_job_exp_level (experience_level)
) ENGINE=InnoDB;

-- 6. Job Required Skills Association Table
CREATE TABLE IF NOT EXISTS job_required_skills (
    id VARCHAR(64) PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    importance_weight DECIMAL(3, 2) DEFAULT 1.00,
    CONSTRAINT fk_jobskill_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_jobskill_name (skill_name)
) ENGINE=InnoDB;

-- 7. Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(180) NOT NULL,
    template_id VARCHAR(50) DEFAULT 'modern',
    target_job_id VARCHAR(64),
    target_job_role VARCHAR(150),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL,
    phone VARCHAR(40),
    location VARCHAR(120),
    headline VARCHAR(150),
    summary TEXT,
    linkedin_link VARCHAR(255),
    github_link VARCHAR(255),
    website_link VARCHAR(255),
    skills_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_resume_user (user_id)
) ENGINE=InnoDB;

-- 8. Resume Education Table
CREATE TABLE IF NOT EXISTS resume_education (
    id VARCHAR(64) PRIMARY KEY,
    resume_id VARCHAR(64) NOT NULL,
    degree VARCHAR(150) NOT NULL,
    field_of_study VARCHAR(150) NOT NULL,
    institution VARCHAR(180) NOT NULL,
    location VARCHAR(120),
    start_date VARCHAR(20),
    end_date VARCHAR(20),
    is_current BOOLEAN DEFAULT FALSE,
    grade_or_gpa VARCHAR(50),
    description TEXT,
    CONSTRAINT fk_resedu_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Resume Experience Table
CREATE TABLE IF NOT EXISTS resume_experience (
    id VARCHAR(64) PRIMARY KEY,
    resume_id VARCHAR(64) NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    company VARCHAR(150) NOT NULL,
    location VARCHAR(120),
    start_date VARCHAR(20),
    end_date VARCHAR(20),
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT NOT NULL,
    technologies_json JSON,
    CONSTRAINT fk_resexp_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Resume Projects Table
CREATE TABLE IF NOT EXISTS resume_projects (
    id VARCHAR(64) PRIMARY KEY,
    resume_id VARCHAR(64) NOT NULL,
    title VARCHAR(180) NOT NULL,
    role VARCHAR(100),
    link VARCHAR(255),
    description TEXT NOT NULL,
    technologies_json JSON,
    CONSTRAINT fk_resproj_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Resume Certifications Table
CREATE TABLE IF NOT EXISTS resume_certifications (
    id VARCHAR(64) PRIMARY KEY,
    resume_id VARCHAR(64) NOT NULL,
    name VARCHAR(180) NOT NULL,
    issuer VARCHAR(150) NOT NULL,
    issue_date VARCHAR(40),
    credential_url VARCHAR(255),
    CONSTRAINT fk_rescert_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
    id VARCHAR(64) PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    resume_id VARCHAR(64) NOT NULL,
    status ENUM('Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Accepted') DEFAULT 'Applied',
    applied_date DATE NOT NULL,
    cover_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_job_application (user_id, job_id),
    CONSTRAINT fk_app_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    INDEX idx_app_status (status)
) ENGINE=InnoDB;

-- 13. Application Status History Log Table
CREATE TABLE IF NOT EXISTS application_status_history (
    id VARCHAR(64) PRIMARY KEY,
    application_id VARCHAR(64) NOT NULL,
    status ENUM('Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Accepted') NOT NULL,
    note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_apphist_app FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 14. Saved Jobs Table
CREATE TABLE IF NOT EXISTS saved_jobs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    job_id VARCHAR(64) NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_saved_job (user_id, job_id),
    CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 15. Search History Table
CREATE TABLE IF NOT EXISTS search_history (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    search_query VARCHAR(255) NOT NULL,
    filters_json JSON,
    result_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_search_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_search_created (created_at)
) ENGINE=InnoDB;

-- 16. Viewed Jobs History Table
CREATE TABLE IF NOT EXISTS viewed_jobs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    job_id VARCHAR(64) NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_view_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_view_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 17. Job Fit Analysis History Table
CREATE TABLE IF NOT EXISTS job_fit_analysis (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    job_id VARCHAR(64) NOT NULL,
    resume_id VARCHAR(64),
    overall_score INT NOT NULL,
    skills_score INT NOT NULL,
    tfidf_score INT NOT NULL,
    experience_score INT NOT NULL,
    qualification_score INT NOT NULL,
    matched_skills JSON,
    missing_skills JSON,
    explanation TEXT,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_fit_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 18. Resume Suggestions Table
CREATE TABLE IF NOT EXISTS resume_suggestions (
    id VARCHAR(64) PRIMARY KEY,
    analysis_id VARCHAR(64) NOT NULL,
    section ENUM('skills', 'projects', 'summary', 'experience') NOT NULL,
    title VARCHAR(200) NOT NULL,
    issue TEXT NOT NULL,
    suggested_action TEXT NOT NULL,
    suggested_text TEXT,
    status ENUM('pending', 'accepted', 'rejected', 'edited') DEFAULT 'pending',
    impact ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sug_analysis FOREIGN KEY (analysis_id) REFERENCES job_fit_analysis(id) ON DELETE CASCADE
) ENGINE=InnoDB;
