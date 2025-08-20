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
    <div className="bg-white max-w-4xl mx-auto p-12 space-y-12 print:p-8 print:space-y-8 min-h-screen">
      {/* Ultra Minimalist Header */}
      <div className="text-left space-y-6 pb-8" style={{ borderBottom: '1px solid #f0f0f0' }}>
        {/* Profile Photo - minimal */}
        {enhancedContent.photo && (
          <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 mb-6">
            <img 
              src={enhancedContent.photo} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <h1 className="text-5xl font-light tracking-wider text-gray-900 leading-tight">
          {enhancedContent.name || 'Name'}
        </h1>
        <p className="text-lg text-gray-600 font-light tracking-wide">
          {enhancedContent.title || 'Title'}
        </p>
        
        <div className="flex flex-wrap gap-8 text-sm text-gray-500 font-light pt-4">
          <span className="break-all">{enhancedContent.email || 'email@example.com'}</span>
          <span>{enhancedContent.phone || 'Phone'}</span>
          <span>{enhancedContent.location || 'Location'}</span>
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
                   {edu.year && edu.year !== "N/A" && edu.year !== "Year not specified" && (
                     <p className="text-sm text-muted-foreground font-light">{edu.year}</p>
                   )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}