import React from "react";
import { Mail, Phone, Award, TrendingUp, Users } from "lucide-react";

interface TemplatePreviewProps {
  enhancedContent: any;
  selectedColorTheme: {
    id: string;
    name: string;
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function MinimalistTemplatePreview({ enhancedContent, selectedColorTheme }: TemplatePreviewProps) {
  return (
    <div className="bg-white max-w-4xl mx-auto p-6 md:p-8 space-y-8 print:p-4 print:space-y-6">
      {/* Minimalist Header */}
      <div className="text-left space-y-3 border-b pb-6 print:pb-4" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
        <h1 className="text-4xl md:text-5xl font-light tracking-wide" style={{ color: selectedColorTheme.primary }}>
          {enhancedContent.name}
        </h1>
        <p className="text-xl text-muted-foreground font-light">
          {enhancedContent.title}
        </p>
        
        <div className="flex flex-wrap gap-8 text-sm text-muted-foreground font-light pt-2">
          <span>{enhancedContent.email}</span>
          <span>{enhancedContent.phone}</span>
          <span>{enhancedContent.location}</span>
        </div>
      </div>

      {/* Professional Summary */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium tracking-wide" style={{ color: selectedColorTheme.primary }}>
          PROFESSIONAL SUMMARY
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground font-light max-w-4xl">
          {enhancedContent.summary}
        </p>
      </div>

      {/* Experience */}
      {enhancedContent.experience && enhancedContent.experience.length > 0 && (
        <div className="space-y-6 print:space-y-4">
          <h2 className="text-lg font-medium tracking-wide" style={{ color: selectedColorTheme.primary }}>
            EXPERIENCE
          </h2>
          
          <div className="space-y-8">
            {enhancedContent.experience.map((exp: any, index: number) => (
              <div key={index} className="space-y-3">
                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-2">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">{exp.title}</h3>
                    <p className="text-base font-light" style={{ color: selectedColorTheme.primary }}>
                      {exp.company}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground font-light">{exp.duration}</p>
                </div>
                
                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="pl-4 space-y-2 border-l print:keep-together" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
                    {exp.achievements.map((achievement: string, achIndex: number) => (
                      <p key={achIndex} className="text-sm leading-relaxed text-muted-foreground font-light">
                        {achievement}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-6">
        {/* Skills */}
        {enhancedContent.skills && enhancedContent.skills.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium tracking-wide" style={{ color: selectedColorTheme.primary }}>
              SKILLS
            </h2>
            
            <div className="space-y-2">
              {enhancedContent.skills.map((skill: string, index: number) => (
                <p key={index} className="text-sm text-muted-foreground font-light">
                  {skill}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {enhancedContent.education && enhancedContent.education.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium tracking-wide" style={{ color: selectedColorTheme.primary }}>
              EDUCATION
            </h2>
            
            <div className="space-y-4">
              {enhancedContent.education.map((edu: any, index: number) => (
                <div key={index} className="space-y-1">
                  <h3 className="text-base font-medium text-foreground">{edu.degree}</h3>
                  <p className="text-sm font-light" style={{ color: selectedColorTheme.primary }}>
                    {edu.institution}
                  </p>
                  <p className="text-sm text-muted-foreground font-light">{edu.year}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}