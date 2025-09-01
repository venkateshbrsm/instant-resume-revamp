// Resume template definitions with distinct layouts and styles

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  preview: string; // Path to preview image
  colorThemes: Array<{
    id: string;
    name: string;
    primary: string;
    secondary: string;
    accent: string;
  }>;
  layout: 'modern';
  features: string[];
}

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'modern',
    name: 'Modern Professional',
    description: 'Clean, contemporary design with gradient accents and modern typography',
    preview: '/template-previews/modern.jpg',
    colorThemes: [
      { id: 'navy', name: 'Navy Blue', primary: '#3b82f6', secondary: '#60a5fa', accent: '#93c5fd' },
      { id: 'emerald', name: 'Emerald Green', primary: '#10b981', secondary: '#34d399', accent: '#6ee7b7' },
      { id: 'purple', name: 'Deep Purple', primary: '#8b5cf6', secondary: '#a78bfa', accent: '#c4b5fd' },
      { id: 'neon-purple', name: 'Neon Purple', primary: '#a855f7', secondary: '#c084fc', accent: '#d8b4fe' },
    ],
    layout: 'modern',
    features: ['Gradient headers', 'Timeline experience', 'Skill bars', 'Modern icons']
  }
];

export const getTemplateById = (id: string): ResumeTemplate | undefined => {
  return resumeTemplates.find(template => template.id === id);
};

export const getDefaultTemplate = (): ResumeTemplate => {
  return resumeTemplates[0]; // Modern template as default
};