import React from 'react';
import { Resume } from '@/types';

interface ResumePreviewProps {
  resume: Resume;
  templateId?: 'modern' | 'classic' | 'executive' | 'minimal';
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resume,
  templateId = resume?.templateId || 'modern',
}) => {
  if (!resume) return null;
  const p = resume.personalDetails || ({} as any);

  // Template 1: Classic ATS
  if (templateId === 'classic') {
    return (
      <div
        id="printable-resume"
        className="w-full bg-white text-slate-900 font-serif p-8 sm:p-12 shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0 min-h-[1050px] text-[13px] leading-relaxed"
      >
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-5">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-950 font-sans">
            {p.fullName || 'Candidate Name'}
          </h1>
          <p className="text-sm font-semibold text-slate-700 font-sans mt-0.5">{p.title}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 mt-2 font-sans">
            {p.location && <span>{p.location}</span>}
            {p.phone && <span>· {p.phone}</span>}
            {p.email && <span>· {p.email}</span>}
            {p.linkedin && <span>· {p.linkedin}</span>}
            {p.github && <span>· {p.github}</span>}
          </div>
        </div>

        {p.summary && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-sans">
              Professional Summary
            </h2>
            <p className="text-slate-800 text-justify">{p.summary}</p>
          </div>
        )}

        {resume.skills && resume.skills.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-sans">
              Technical & Core Competencies
            </h2>
            <p className="text-slate-800 font-sans text-xs">
              <strong>Core Skills:</strong> {resume.skills.join(' • ')}
            </p>
          </div>
        )}

        {resume.experience && resume.experience.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3 font-sans">
              Professional Experience
            </h2>
            <div className="space-y-4">
              {resume.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline font-sans">
                    <span className="font-bold text-slate-900 text-sm">{exp.jobTitle}</span>
                    <span className="text-xs text-slate-600">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs text-slate-700 italic font-sans mb-1.5">
                    <span>{exp.company}</span>
                    <span>{exp.location}</span>
                  </div>
                  <p className="text-slate-800 whitespace-pre-line text-xs">{exp.description}</p>
                  {exp.technologiesUsed && exp.technologiesUsed.length > 0 && (
                    <p className="text-[11px] text-slate-600 mt-1 font-sans">
                      <strong>Tech Stack:</strong> {exp.technologiesUsed.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {resume.projects && resume.projects.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3 font-sans">
              Key Engineering Projects
            </h2>
            <div className="space-y-3">
              {resume.projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline font-sans">
                    <span className="font-bold text-slate-900 text-sm">
                      {proj.title} {proj.role && <span className="font-normal text-xs text-slate-600">({proj.role})</span>}
                    </span>
                    {proj.link && <span className="text-xs text-slate-600 underline">{proj.link}</span>}
                  </div>
                  <p className="text-slate-800 text-xs mt-0.5">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p className="text-[11px] text-slate-600 mt-0.5 font-sans">
                      <strong>Technologies:</strong> {proj.technologies.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {resume.education && resume.education.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-sans">
              Education
            </h2>
            <div className="space-y-2">
              {resume.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline font-sans">
                    <span className="font-bold text-slate-900 text-sm">
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                    </span>
                    <span className="text-xs text-slate-600">
                      {edu.startDate} – {edu.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-700 font-sans">
                    <span>{edu.institution}, {edu.location}</span>
                    {edu.gradeOrGpa && <span>{edu.gradeOrGpa}</span>}
                  </div>
                  {edu.description && <p className="text-xs text-slate-600 mt-1">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {resume.certifications && resume.certifications.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-sans">
              Certifications & Credentials
            </h2>
            <ul className="list-disc list-inside text-xs text-slate-800 font-sans space-y-0.5">
              {resume.certifications.map((cert) => (
                <li key={cert.id}>
                  <strong>{cert.name}</strong> – {cert.issuer} ({cert.issueDate})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Template 2: Executive Navy
  if (templateId === 'executive') {
    return (
      <div
        id="printable-resume"
        className="w-full bg-white text-slate-900 font-sans shadow-md border border-slate-200 print:shadow-none print:border-none min-h-[1050px] text-[13px] leading-relaxed overflow-hidden"
      >
        <div className="bg-slate-900 text-white p-8 sm:p-10">
          <h1 className="text-2xl font-bold tracking-tight">{p.fullName || 'Candidate Name'}</h1>
          <p className="text-blue-300 font-medium text-sm mt-0.5">{p.title}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>· {p.phone}</span>}
            {p.location && <span>· {p.location}</span>}
            {p.linkedin && <span>· {p.linkedin}</span>}
            {p.github && <span>· {p.github}</span>}
          </div>
        </div>

        <div className="p-8 sm:p-10 space-y-6">
          {p.summary && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-2">
                Executive Profile
              </h2>
              <p className="text-slate-700 leading-relaxed">{p.summary}</p>
            </div>
          )}

          {resume.skills && resume.skills.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-2">
                Core Competencies & Technologies
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {resume.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {resume.experience && resume.experience.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
                Professional Experience
              </h2>
              <div className="space-y-4">
                {resume.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900 text-sm">{exp.jobTitle}</span>
                      <span className="text-xs font-medium text-slate-500">
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-blue-700 mb-1">
                      {exp.company} | {exp.location}
                    </div>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                      {exp.description}
                    </p>
                    {exp.technologiesUsed && exp.technologiesUsed.length > 0 && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        <strong>Environment:</strong> {exp.technologiesUsed.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {resume.projects && resume.projects.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">
                Key Projects & Impact
              </h2>
              <div className="space-y-3">
                {resume.projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900 text-sm">{proj.title}</span>
                      {proj.link && <span className="text-xs text-blue-600">{proj.link}</span>}
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        <strong>Stack:</strong> {proj.technologies.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {resume.education && resume.education.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 mb-2">
                Education
              </h2>
              <div className="space-y-2">
                {resume.education.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-baseline">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">
                        {edu.degree} in {edu.fieldOfStudy}
                      </span>
                      <p className="text-xs text-slate-600">{edu.institution}, {edu.location}</p>
                    </div>
                    <span className="text-xs text-slate-500">{edu.endDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Template 3: Minimal Clean
  if (templateId === 'minimal') {
    return (
      <div
        id="printable-resume"
        className="w-full bg-white text-slate-900 font-sans p-8 sm:p-12 shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0 min-h-[1050px] text-xs leading-relaxed"
      >
        <div className="mb-6">
          <h1 className="text-2xl font-light tracking-tight text-slate-900">{p.fullName}</h1>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-0.5">{p.title}</p>
          <div className="flex flex-wrap gap-3 text-[11px] text-slate-400 mt-2">
            <span>{p.email}</span>
            <span>/</span>
            <span>{p.phone}</span>
            <span>/</span>
            <span>{p.location}</span>
            {p.github && (
              <>
                <span>/</span>
                <span>{p.github}</span>
              </>
            )}
          </div>
        </div>

        {p.summary && (
          <div className="mb-6">
            <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">About</h3>
            <p className="text-slate-700 leading-relaxed">{p.summary}</p>
          </div>
        )}

        {resume.skills && resume.skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Skills</h3>
            <p className="text-slate-800">{resume.skills.join(', ')}</p>
          </div>
        )}

        {resume.experience && resume.experience.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Experience</h3>
            <div className="space-y-4">
              {resume.experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between font-medium text-slate-900 text-xs">
                    <span>{exp.jobTitle} — <span className="text-slate-600">{exp.company}</span></span>
                    <span className="text-slate-400 text-[11px]">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <p className="text-slate-600 mt-1 whitespace-pre-line text-xs">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {resume.projects && resume.projects.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Projects</h3>
            <div className="space-y-3">
              {resume.projects.map(proj => (
                <div key={proj.id}>
                  <div className="flex justify-between font-medium text-slate-900 text-xs">
                    <span>{proj.title}</span>
                    {proj.link && <span className="text-slate-400 text-[11px]">{proj.link}</span>}
                  </div>
                  <p className="text-slate-600 mt-0.5 text-xs">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {resume.education && resume.education.length > 0 && (
          <div>
            <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Education</h3>
            {resume.education.map(edu => (
              <div key={edu.id} className="flex justify-between text-xs text-slate-800">
                <span>{edu.degree} in {edu.fieldOfStudy}, {edu.institution}</span>
                <span className="text-slate-400 text-[11px]">{edu.endDate}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Template 4: Modern Tech (Default)
  return (
    <div
      id="printable-resume"
      className="w-full bg-white text-slate-900 font-sans p-8 sm:p-10 shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0 min-h-[1050px] text-[13px] leading-relaxed"
    >
      <div className="border-b-2 border-blue-600 pb-4 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {p.fullName || 'Candidate Name'}
            </h1>
            <p className="text-sm font-semibold text-blue-700 mt-0.5">{p.title}</p>
          </div>
          <div className="flex flex-col sm:items-end text-xs text-slate-600 space-y-0.5">
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
          </div>
        </div>

        {(p.linkedin || p.github || p.website) && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            {p.linkedin && <span>linkedin.com/in/{p.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\/?/i, '')}</span>}
            {p.github && <span>github.com/{p.github.replace(/https?:\/\/(www\.)?github\.com\/?/i, '')}</span>}
            {p.website && <span>{p.website.replace(/https?:\/\//i, '')}</span>}
          </div>
        )}
      </div>

      {p.summary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-slate-700 leading-relaxed">{p.summary}</p>
        </div>
      )}

      {resume.skills && resume.skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-1 mb-2">
            Technical Competencies
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {resume.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded font-medium border border-slate-200/60"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {resume.experience && resume.experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-1 mb-3">
            Work Experience & Internships
          </h2>
          <div className="space-y-4">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-sm">{exp.jobTitle}</span>
                  <span className="text-xs font-medium text-slate-500">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-700 mb-1">
                  {exp.company} <span className="text-slate-400 font-normal">| {exp.location}</span>
                </div>
                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {exp.description}
                </p>
                {exp.technologiesUsed && exp.technologiesUsed.length > 0 && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    <strong className="text-slate-600">Technologies:</strong> {exp.technologiesUsed.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {resume.projects && resume.projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-1 mb-3">
            Projects & Technical Contributions
          </h2>
          <div className="space-y-3">
            {resume.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-sm">
                    {proj.title} {proj.role && <span className="font-normal text-xs text-slate-500">({proj.role})</span>}
                  </span>
                  {proj.link && <span className="text-xs text-blue-600">{proj.link}</span>}
                </div>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{proj.description}</p>
                {proj.technologies && proj.technologies.length > 0 && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    <strong className="text-slate-600">Stack:</strong> {proj.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {resume.education && resume.education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-1 mb-2">
            Education
          </h2>
          <div className="space-y-2">
            {resume.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-sm">
                    {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {edu.startDate} – {edu.endDate}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{edu.institution}, {edu.location}</span>
                  {edu.gradeOrGpa && <span className="font-medium text-slate-700">{edu.gradeOrGpa}</span>}
                </div>
                {edu.description && <p className="text-xs text-slate-600 mt-0.5">{edu.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {resume.certifications && resume.certifications.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-200 pb-1 mb-2">
            Certifications
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700">
            {resume.certifications.map((cert) => (
              <span key={cert.id}>
                <strong>{cert.name}</strong> – {cert.issuer} ({cert.issueDate})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
