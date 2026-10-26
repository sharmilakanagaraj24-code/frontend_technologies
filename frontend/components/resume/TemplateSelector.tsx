import React from 'react';

interface TemplateSelectorProps {
  currentTemplate: 'modern' | 'classic' | 'executive' | 'minimal';
  onSelectTemplate: (template: 'modern' | 'classic' | 'executive' | 'minimal') => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  currentTemplate,
  onSelectTemplate,
}) => {
  const templates = [
    { id: 'modern', label: 'Modern Tech' },
    { id: 'classic', label: 'Classic ATS' },
    { id: 'executive', label: 'Executive' },
    { id: 'minimal', label: 'Minimal' },
  ] as const;

  return (
    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
      <span className="text-slate-500 font-semibold px-2">Template:</span>
      {templates.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelectTemplate(t.id)}
          className={`px-3 py-1.5 font-medium rounded-lg transition-colors ${
            currentTemplate === t.id
              ? 'bg-white text-blue-700 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};
