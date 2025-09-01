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
  layout: 'modern' | 'classic' | 'creative' | 'executive' | 'minimalist';
  features: string[];
}

const allTemplates: ResumeTemplate[] = [
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
  },
  {
    id: 'classic',
    name: 'Classic Executive',
    description: 'Traditional business format with professional typography and clean lines',
    preview: '/template-previews/classic.jpg',
    colorThemes: [
      { id: 'charcoal', name: 'Charcoal Gray', primary: '#374151', secondary: '#6b7280', accent: '#9ca3af' },
      { id: 'navy-classic', name: 'Navy Classic', primary: '#1e40af', secondary: '#3b82f6', accent: '#60a5fa' },
      { id: 'burgundy', name: 'Burgundy Wine', primary: '#dc2626', secondary: '#ef4444', accent: '#f87171' },
      { id: 'neon-purple', name: 'Neon Purple', primary: '#a855f7', secondary: '#c084fc', accent: '#d8b4fe' },
    ],
    layout: 'classic',
    features: ['Traditional layout', 'Clean typography', 'Professional spacing', 'Conservative design']
  },
  {
    id: 'creative',
    name: 'Creative Portfolio',
    description: 'Bold design with creative elements and dynamic layouts for designers',
    preview: '/template-previews/creative.jpg',
    colorThemes: [
      { id: 'orange', name: 'Vibrant Orange', primary: '#f97316', secondary: '#fb923c', accent: '#fdba74' },
      { id: 'rose', name: 'Rose Pink', primary: '#f43f5e', secondary: '#fb7185', accent: '#fda4af' },
      { id: 'teal', name: 'Teal Blue', primary: '#0d9488', secondary: '#14b8a6', accent: '#5eead4' },
      { id: 'neon-purple', name: 'Neon Purple', primary: '#a855f7', secondary: '#c084fc', accent: '#d8b4fe' },
    ],
    layout: 'creative',
    features: ['Creative sections', 'Dynamic layouts', 'Visual elements', 'Portfolio focus']
  },
  {
    id: 'executive',
    name: 'Executive Leadership',
    description: 'Sophisticated design for senior professionals and executives',
    preview: '/template-previews/executive.jpg',
    colorThemes: [
      { id: 'slate', name: 'Executive Slate', primary: '#475569', secondary: '#64748b', accent: '#94a3b8' },
      { id: 'indigo', name: 'Indigo Elite', primary: '#4f46e5', secondary: '#6366f1', accent: '#8b5cf6' },
      { id: 'bronze', name: 'Bronze Gold', primary: '#d97706', secondary: '#f59e0b', accent: '#fbbf24' },
      { id: 'neon-purple', name: 'Neon Purple', primary: '#a855f7', secondary: '#c084fc', accent: '#d8b4fe' },
    ],
    layout: 'executive',
    features: ['Executive summary', 'Achievement focus', 'Leadership emphasis', 'Premium feel']
  },
  {
    id: 'minimalist',
    name: 'Minimalist Clean',
    description: 'Ultra-clean design with maximum white space and minimal colors',
    preview: '/template-previews/minimalist.jpg',
    colorThemes: [
      { id: 'minimal-black', name: 'Pure Black', primary: '#1f2937', secondary: '#374151', accent: '#6b7280' },
      { id: 'minimal-blue', name: 'Minimal Blue', primary: '#1e40af', secondary: '#3b82f6', accent: '#93c5fd' },
      { id: 'minimal-gray', name: 'Subtle Gray', primary: '#64748b', secondary: '#94a3b8', accent: '#cbd5e1' },
      { id: 'neon-purple', name: 'Neon Purple', primary: '#a855f7', secondary: '#c084fc', accent: '#d8b4fe' },
    ],
    layout: 'minimalist',
    features: ['Maximum white space', 'Minimal colors', 'Clean typography', 'Simple layout']
  }
];

// Export only modern and executive templates
export const resumeTemplates: ResumeTemplate[] = allTemplates.filter(
  template => template.id === 'modern' || template.id === 'executive'
);

export const getTemplateById = (id: string): ResumeTemplate | undefined => {
  return allTemplates.find(template => template.id === id);
};

export const getDefaultTemplate = (): ResumeTemplate => {
  return resumeTemplates[0]; // Modern template as default
};