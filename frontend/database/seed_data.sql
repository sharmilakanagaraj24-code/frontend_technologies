-- ====================================================================
-- AI-Powered Job Portal with Intelligent Resume Builder
-- Seed Data Script
-- ====================================================================

USE job_portal_db;

-- 1. Insert Initial Skills
INSERT INTO skills (id, name, category) VALUES
('sk-1', 'Java', 'Languages'),
('sk-2', 'Python', 'Languages'),
('sk-3', 'JavaScript', 'Languages'),
('sk-4', 'TypeScript', 'Languages'),
('sk-5', 'SQL', 'Languages'),
('sk-6', 'Spring Boot', 'Frameworks'),
('sk-7', 'React', 'Frameworks'),
('sk-8', 'Node.js', 'Frameworks'),
('sk-9', 'FastAPI', 'Frameworks'),
('sk-10', 'MySQL', 'Databases'),
('sk-11', 'PostgreSQL', 'Databases'),
('sk-12', 'Redis', 'Databases'),
('sk-13', 'Docker', 'Cloud & DevOps'),
('sk-14', 'Kubernetes', 'Cloud & DevOps'),
('sk-15', 'AWS', 'Cloud & DevOps'),
('sk-16', 'Git', 'Tools & Methods'),
('sk-17', 'REST APIs', 'Tools & Methods'),
('sk-18', 'Scikit-learn', 'AI & Data'),
('sk-19', 'Pandas', 'AI & Data'),
('sk-20', 'Tailwind CSS', 'Frameworks');

-- 2. Insert Demo Users
-- Passwords hashed using standard BCrypt ($2a$10$... demo is 'password123')
INSERT INTO users (id, email, password_hash, full_name, role) VALUES
('user-grad', 'alex.rivera@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Alex Rivera', 'job_seeker'),
('user-mid', 'priya.sharma@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Priya Sharma', 'job_seeker');

-- 3. Insert User Profiles
INSERT INTO user_profiles (id, user_id, phone, location, title, bio, linkedin_url, github_url, portfolio_url, preferred_roles, preferred_location_types, preferred_employment_types) VALUES
('prof-grad', 'user-grad', '+1 (555) 349-8201', 'San Francisco, CA', 'Aspiring Full Stack & Java Software Engineer',
 'Enthusiastic Computer Science graduate passionate about building robust backend REST services in Java and interactive web applications with React.',
 'https://linkedin.com/in/alex-rivera-dev', 'https://github.com/alexrivera-tech', 'https://alexrivera.dev',
 '["Full Stack Developer", "Software Engineer", "Java Developer"]', '["Hybrid", "Remote"]', '["Full-time", "Internship"]'),
('prof-mid', 'user-mid', '+1 (555) 782-9012', 'Austin, TX', 'Senior Full Stack Software Engineer',
 'Versatile software engineer with 3.5+ years of experience designing microservices, RESTful APIs, and cloud deployments using Java, Spring Boot, React, and AWS.',
 'https://linkedin.com/in/priyasharma-eng', 'https://github.com/priyasharma-code', 'https://priyasharma.io',
 '["Senior Full Stack Developer", "Backend Architect", "Java Engineer"]', '["Remote", "Hybrid"]', '["Full-time"]');

-- 4. Insert Jobs
INSERT INTO jobs (id, title, company, location, work_location_type, employment_type, experience_level, min_experience_years, salary_min, salary_max, currency, department, description, responsibilities, qualifications, posted_date, deadline_date, applicants_count) VALUES
('job-1', 'Full Stack Java & React Developer', 'FinEdge Global', 'San Francisco, CA', 'Hybrid', 'Full-time', 'Mid-level', 2, 95000, 135000, 'USD', 'Core Banking Engineering',
 'We are seeking a proactive Full Stack Developer to build high-performance financial service applications with Spring Boot and React.',
 '["Design resilient Spring Boot REST APIs.", "Construct modern React/TypeScript components.", "Optimize MySQL queries."]',
 '["B.S. in Computer Science or equivalent.", "2+ years experience in Java and React.", "Proficiency in SQL."]',
 '2026-10-18', '2026-11-30', 14),

('job-2', 'AI/ML Software Engineer', 'Cognitive Health AI', 'Remote', 'Remote', 'Full-time', 'Mid-level', 2, 110000, 155000, 'USD', 'Applied Machine Learning',
 'Cognitive Health AI is looking for an AI/ML Engineer to train predictive models with Scikit-learn and build NLP text extraction pipelines.',
 '["Implement NLP pipelines with Scikit-learn.", "Deploy inference APIs using FastAPI and Docker.", "Evaluate models and dataset drift."]',
 '["Degree in Data Science or CS.", "Proficiency in Python and Pandas.", "Knowledge of TF-IDF and vector similarity."]',
 '2026-10-19', '2026-12-15', 22),

('job-3', 'Junior Software Engineer (Graduate / Entry-Level)', 'NextGen Cloud Labs', 'Austin, TX', 'Hybrid', 'Full-time', 'Entry-level', 0, 72000, 90000, 'USD', 'Software Engineering',
 'An outstanding entry-level opportunity for recent computer science graduates and junior engineers building cloud developer tools.',
 '["Participate in agile sprints.", "Write clean code in Java or Python.", "Assist in building REST API endpoints."]',
 '["Recent CS graduate (2025/2026).", "Good understanding of OOP, data structures, and algorithms.", "Familiarity with web basics."]',
 '2026-10-15', '2026-11-20', 38);

-- 5. Insert Job Skills
INSERT INTO job_required_skills (id, job_id, skill_name, is_mandatory, importance_weight) VALUES
('js-1', 'job-1', 'Java', TRUE, 1.00),
('js-2', 'job-1', 'Spring Boot', TRUE, 1.00),
('js-3', 'job-1', 'React', TRUE, 0.90),
('js-4', 'job-1', 'MySQL', TRUE, 0.85),
('js-5', 'job-1', 'REST APIs', TRUE, 0.80),
('js-6', 'job-2', 'Python', TRUE, 1.00),
('js-7', 'job-2', 'Scikit-learn', TRUE, 1.00),
('js-8', 'job-2', 'Pandas', TRUE, 0.90),
('js-9', 'job-2', 'FastAPI', TRUE, 0.85),
('js-10', 'job-3', 'Java', TRUE, 1.00),
('js-11', 'job-3', 'SQL', TRUE, 0.90),
('js-12', 'job-3', 'Git', TRUE, 0.80);

-- 6. Insert Sample Resume
INSERT INTO resumes (id, user_id, title, template_id, full_name, email, phone, location, headline, summary, linkedin_link, github_link, skills_json) VALUES
('res-default-1', 'user-grad', 'Full Stack Software Engineer Resume (ATS Optimized)', 'modern',
 'Alex Rivera', 'alex.rivera@example.com', '+1 (555) 349-8201', 'San Francisco, CA', 'Full Stack Software Engineer',
 'Proactive Computer Science graduate with strong hands-on expertise in Java, Spring Boot, React, and RESTful architectures.',
 'linkedin.com/in/alex-rivera-dev', 'github.com/alexrivera-tech',
 '["Java", "Spring Boot", "React", "TypeScript", "MySQL", "REST APIs", "Git", "Tailwind CSS"]');
