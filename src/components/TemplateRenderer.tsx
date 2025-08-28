import { ModernTemplatePreview } from "./templates/ModernTemplatePreview";
import { ClassicTemplatePreview } from "./templates/ClassicTemplatePreview";
import { CreativeTemplatePreview } from "./templates/CreativeTemplatePreview";
import { ExecutiveTemplatePreview } from "./templates/ExecutiveTemplatePreview";
import { MinimalistTemplatePreview } from "./templates/MinimalistTemplatePreview";
import type { ResumeTemplate } from "@/lib/resumeTemplates";

interface TemplateRendererProps {
  selectedTemplate: ResumeTemplate;
  enhancedContent: any;
  selectedColorTheme: {
    id: string;
    name: string;
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function TemplateRenderer({ 
  selectedTemplate, 
  enhancedContent, 
  selectedColorTheme 
}: TemplateRendererProps) {
  const templateProps = {
    enhancedContent,
    selectedColorTheme
  };

  switch (selectedTemplate.layout) {
    case 'modern':
      return <ModernTemplatePreview {...templateProps} />;
    case 'classic':
      return <ClassicTemplatePreview {...templateProps} />;
    case 'creative':
      return <CreativeTemplatePreview {...templateProps} />;
    case 'executive':
      return <ExecutiveTemplatePreview {...templateProps} />;
    case 'minimalist':
      return <MinimalistTemplatePreview {...templateProps} />;
    default:
      return <ModernTemplatePreview {...templateProps} />;
  }
}