'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import {
  Resume,
  JobListing,
  EducationItem,
  ExperienceItem,
  ProjectItem,
} from '@/types';

interface ResumeEditorProps {
  activeResume: Resume;
  setActiveResume: React.Dispatch<React.SetStateAction<Resume>>;
  activeTargetJob?: JobListing;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  activeResume,
  setActiveResume,
  activeTargetJob,
}) => {
  const [activeSection, setActiveSection] = useState<
    'personal' | 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'certifications'
  >('personal');
  const [newSkillInput, setNewSkillInput] = useState('');

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const skillName = newSkillInput.trim();
    if (!activeResume.skills.includes(skillName)) {
      setActiveResume((prev) => ({
        ...prev,
        skills: [...prev.skills, skillName],
      }));
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setActiveResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      jobTitle: 'Software Engineer',
      company: 'Tech Company',
      location: 'Remote',
      startDate: '2024-01',
      endDate: '2025-01',
      current: true,
      description: '• Developed scalable REST APIs and client workflows.\n• Optimized database performance and resolved critical production issues.',
      technologiesUsed: ['Java', 'React'],
    };
    setActiveResume((prev) => ({
      ...prev,
      experience: [newExp, ...prev.experience],
    }));
  };

  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: 'Full Stack Web Platform',
      role: 'Lead Developer',
      link: 'github.com/my-project',
      description: 'Built a high-performance web service with REST endpoints and responsive React frontend.',
      technologies: ['React', 'TypeScript', 'Node.js'],
    };
    setActiveResume((prev) => ({
      ...prev,
      projects: [newProj, ...prev.projects],
    }));
  };

  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      institution: 'State University',
      location: 'City, State',
      startDate: '2022',
      endDate: '2026',
      current: false,
    };
    setActiveResume((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
      {/* Section Navigation Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-3 text-xs">
        {[
          { id: 'personal', label: 'Contact' },
          { id: 'summary', label: 'Summary' },
          { id: 'skills', label: `Skills (${activeResume.skills.length})` },
          { id: 'experience', label: `Experience (${activeResume.experience.length})` },
          { id: 'projects', label: `Projects (${activeResume.projects.length})` },
          { id: 'education', label: `Education (${activeResume.education.length})` },
          { id: 'certifications', label: 'Certifications' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeSection === tab.id
                ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section 1: Contact */}
      {activeSection === 'personal' && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Personal Information
          </h3>
          <div className="space-y-2 text-xs">
            <div>
              <label className="text-slate-600 block mb-0.5">Full Name</label>
              <input
                type="text"
                value={activeResume.personalDetails.fullName}
                onChange={(e) =>
                  setActiveResume((prev) => ({
                    ...prev,
                    personalDetails: { ...prev.personalDetails, fullName: e.target.value },
                  }))
                }
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-0.5">Professional Title</label>
              <input
                type="text"
                value={activeResume.personalDetails.title}
                onChange={(e) =>
                  setActiveResume((prev) => ({
                    ...prev,
                    personalDetails: { ...prev.personalDetails, title: e.target.value },
                  }))
                }
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 block mb-0.5">Email</label>
                <input
                  type="email"
                  value={activeResume.personalDetails.email}
                  onChange={(e) =>
                    setActiveResume((prev) => ({
                      ...prev,
                      personalDetails: { ...prev.personalDetails, email: e.target.value },
                    }))
                  }
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-0.5">Phone</label>
                <input
                  type="text"
                  value={activeResume.personalDetails.phone}
                  onChange={(e) =>
                    setActiveResume((prev) => ({
                      ...prev,
                      personalDetails: { ...prev.personalDetails, phone: e.target.value },
                    }))
                  }
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="text-slate-600 block mb-0.5">Location</label>
              <input
                type="text"
                value={activeResume.personalDetails.location}
                onChange={(e) =>
                  setActiveResume((prev) => ({
                    ...prev,
                    personalDetails: { ...prev.personalDetails, location: e.target.value },
                  }))
                }
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 block mb-0.5">LinkedIn Profile</label>
                <input
                  type="text"
                  value={activeResume.personalDetails.linkedin || ''}
                  onChange={(e) =>
                    setActiveResume((prev) => ({
                      ...prev,
                      personalDetails: { ...prev.personalDetails, linkedin: e.target.value },
                    }))
                  }
                  placeholder="linkedin.com/in/..."
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-0.5">GitHub / Portfolio</label>
                <input
                  type="text"
                  value={activeResume.personalDetails.github || ''}
                  onChange={(e) =>
                    setActiveResume((prev) => ({
                      ...prev,
                      personalDetails: { ...prev.personalDetails, github: e.target.value },
                    }))
                  }
                  placeholder="github.com/..."
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Summary */}
      {activeSection === 'summary' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Professional Summary
            </h3>
            {activeTargetJob && (
              <button
                type="button"
                onClick={() => {
                  const tailored = `Results-driven developer with proven expertise in ${activeResume.skills.slice(0, 4).join(', ')}. Strong academic and project foundation in ${activeTargetJob.title} competencies, with experience delivering production-quality code.`;
                  setActiveResume((prev) => ({
                    ...prev,
                    personalDetails: { ...prev.personalDetails, summary: tailored },
                  }));
                }}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Auto-Tailor for Job
              </button>
            )}
          </div>
          <textarea
            value={activeResume.personalDetails.summary}
            onChange={(e) =>
              setActiveResume((prev) => ({
                ...prev,
                personalDetails: { ...prev.personalDetails, summary: e.target.value },
              }))
            }
            rows={5}
            className="w-full text-xs p-3 border border-slate-200 rounded-lg leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            placeholder="2-4 sentences highlighting your background, primary technical skills, and career objective..."
          />
        </div>
      )}

      {/* Section 3: Skills */}
      {activeSection === 'skills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Technical Skills ({activeResume.skills.length})
            </h3>
          </div>

          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              placeholder="e.g. Docker, Python, Spring Boot..."
              className="flex-1 text-xs p-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
            >
              Add
            </button>
          </form>

          <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
            {activeResume.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-md font-medium text-slate-800 shadow-2xs"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {activeTargetJob && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-amber-900 block">
                Skills Required by {activeTargetJob.company}:
              </span>
              <div className="flex flex-wrap gap-1">
                {activeTargetJob.requiredSkills.map((reqSkill) => {
                  const alreadyHas = activeResume.skills.some(
                    (s) => s.toLowerCase() === reqSkill.toLowerCase()
                  );
                  if (alreadyHas) return null;
                  return (
                    <button
                      key={reqSkill}
                      type="button"
                      onClick={() =>
                        setActiveResume((prev) => ({
                          ...prev,
                          skills: [...prev.skills, reqSkill],
                        }))
                      }
                      className="text-[11px] px-2 py-0.5 bg-white border border-amber-300 text-amber-900 rounded hover:bg-amber-100 flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-2.5 h-2.5" /> {reqSkill}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section 4: Experience */}
      {activeSection === 'experience' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Work Experience & Internships
            </h3>
            <button
              type="button"
              onClick={handleAddExperience}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Experience
            </button>
          </div>

          <div className="space-y-4">
            {activeResume.experience.map((exp, idx) => (
              <div
                key={exp.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Position #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveResume((prev) => ({
                        ...prev,
                        experience: prev.experience.filter((e) => e.id !== exp.id),
                      }))
                    }
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={exp.jobTitle}
                    onChange={(e) => {
                      const updated = [...activeResume.experience];
                      updated[idx].jobTitle = e.target.value;
                      setActiveResume((prev) => ({ ...prev, experience: updated }));
                    }}
                    placeholder="Job Title"
                    className="p-1.5 border border-slate-200 rounded bg-white"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const updated = [...activeResume.experience];
                      updated[idx].company = e.target.value;
                      setActiveResume((prev) => ({ ...prev, experience: updated }));
                    }}
                    placeholder="Company"
                    className="p-1.5 border border-slate-200 rounded bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={exp.startDate}
                    onChange={(e) => {
                      const updated = [...activeResume.experience];
                      updated[idx].startDate = e.target.value;
                      setActiveResume((prev) => ({ ...prev, experience: updated }));
                    }}
                    placeholder="Start Date (e.g. 2024-06)"
                    className="p-1.5 border border-slate-200 rounded bg-white"
                  />
                  <input
                    type="text"
                    value={exp.endDate}
                    onChange={(e) => {
                      const updated = [...activeResume.experience];
                      updated[idx].endDate = e.target.value;
                      setActiveResume((prev) => ({ ...prev, experience: updated }));
                    }}
                    placeholder="End Date (or 'Present')"
                    className="p-1.5 border border-slate-200 rounded bg-white"
                  />
                </div>

                <textarea
                  value={exp.description}
                  onChange={(e) => {
                    const updated = [...activeResume.experience];
                    updated[idx].description = e.target.value;
                    setActiveResume((prev) => ({ ...prev, experience: updated }));
                  }}
                  rows={3}
                  placeholder="Bullet points describing achievements and tech stack..."
                  className="w-full p-2 border border-slate-200 rounded bg-white"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 5: Projects */}
      {activeSection === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Technical Projects
            </h3>
            <button
              type="button"
              onClick={handleAddProject}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Project
            </button>
          </div>

          <div className="space-y-4">
            {activeResume.projects.map((proj, idx) => (
              <div
                key={proj.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Project #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveResume((prev) => ({
                        ...prev,
                        projects: prev.projects.filter((p) => p.id !== proj.id),
                      }))
                    }
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => {
                      const updated = [...activeResume.projects];
                      updated[idx].title = e.target.value;
                      setActiveResume((prev) => ({ ...prev, projects: updated }));
                    }}
                    placeholder="Project Title"
                    className="p-1.5 border border-slate-200 rounded bg-white"
                  />
                  <input
                    type="text"
                    value={proj.link || ''}
                    onChange={(e) => {
                      const updated = [...activeResume.projects];
                      updated[idx].link = e.target.value;
                      setActiveResume((prev) => ({ ...prev, projects: updated }));
                    }}
                    placeholder="Project Link / GitHub"
                    className="p-1.5 border border-slate-200 rounded bg-white"
                  />
                </div>

                <textarea
                  value={proj.description}
                  onChange={(e) => {
                    const updated = [...activeResume.projects];
                    updated[idx].description = e.target.value;
                    setActiveResume((prev) => ({ ...prev, projects: updated }));
                  }}
                  rows={2}
                  placeholder="Description of architecture and impact..."
                  className="w-full p-2 border border-slate-200 rounded bg-white"
                />

                <input
                  type="text"
                  value={proj.technologies.join(', ')}
                  onChange={(e) => {
                    const updated = [...activeResume.projects];
                    updated[idx].technologies = e.target.value.split(',').map((s) => s.trim());
                    setActiveResume((prev) => ({ ...prev, projects: updated }));
                  }}
                  placeholder="Technologies used (comma separated: Java, React, MySQL)"
                  className="w-full p-1.5 border border-slate-200 rounded bg-white"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 6: Education */}
      {activeSection === 'education' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Education History
            </h3>
            <button
              type="button"
              onClick={handleAddEducation}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Degree
            </button>
          </div>

          <div className="space-y-3">
            {activeResume.education.map((edu, idx) => (
              <div
                key={edu.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Degree #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveResume((prev) => ({
                        ...prev,
                        education: prev.education.filter((e) => e.id !== edu.id),
                      }))
                    }
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => {
                      const updated = [...activeResume.education];
                      updated[idx].degree = e.target.value;
                      setActiveResume((prev) => ({ ...prev, education: updated }));
                    }}
                    placeholder="Degree (e.g. B.S. Computer Science)"
                    className="p-1.5 border border-slate-200 rounded bg-white"
                  />
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => {
                      const updated = [...activeResume.education];
                      updated[idx].institution = e.target.value;
                      setActiveResume((prev) => ({ ...prev, education: updated }));
                    }}
                    placeholder="Institution"
                    className="p-1.5 border border-slate-200 rounded bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 7: Certifications */}
      {activeSection === 'certifications' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Certifications & Badges
          </h3>
          <p className="text-xs text-slate-500">
            Add relevant certifications like AWS Certified, Oracle Java SE, or Coursera credentials.
          </p>
          {activeResume.certifications.map((cert) => (
            <div key={cert.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">{cert.name}</span>
                <p className="text-slate-500">{cert.issuer} ({cert.issueDate})</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setActiveResume((prev) => ({
                    ...prev,
                    certifications: prev.certifications.filter((c) => c.id !== cert.id),
                  }))
                }
                className="text-slate-400 hover:text-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
