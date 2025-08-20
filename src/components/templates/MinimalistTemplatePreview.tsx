import React from "react";
import { Mail, Phone, Award, TrendingUp, Users, User } from "lucide-react";

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
    <div className="bg-white max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 print:p-4 print:space-y-6">
      {/* Minimalist Header */}
      <div className="text-left space-y-2 sm:space-y-3 border-b pb-4 sm:pb-6 print:pb-4" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
        <div className="flex items-start gap-4 sm:gap-6">
          {/* Profile Photo */}
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 border" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
            {enhancedContent.photo ? (
              <img 
                src={enhancedContent.photo} 
                alt={enhancedContent.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide" style={{ color: selectedColorTheme.primary }}>
              {enhancedContent.name}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground font-light">
              {enhancedContent.title}
            </p>
            
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 md:gap-8 text-sm text-muted-foreground font-light pt-2">
              <span className="break-all">{enhancedContent.email}</span>
              <span>{enhancedContent.phone}</span>
              <span>{enhancedContent.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-medium tracking-wide" style={{ color: selectedColorTheme.primary }}>
          PROFESSIONAL SUMMARY
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-light max-w-4xl">
          {enhancedContent.summary}
        </p>
      </div>

      {/* Experience */}
      {enhancedContent.experience && enhancedContent.experience.length > 0 && (
        <div className="space-y-4 sm:space-y-6 print:space-y-4">
          <h2 className="text-base sm:text-lg font-medium tracking-wide" style={{ color: selectedColorTheme.primary }}>
            EXPERIENCE
          </h2>
          
          <div className="space-y-6 sm:space-y-8">
            {enhancedContent.experience.map((exp: any, index: number) => (
              <div key={index} className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-foreground">{exp.title}</h3>
                    <p className="text-sm sm:text-base font-light" style={{ color: selectedColorTheme.primary }}>
                      {exp.company}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-light">{exp.duration}</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 print:gap-6">
        {/* Skills */}
        {enhancedContent.skills && enhancedContent.skills.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-base sm:text-lg font-medium tracking-wide" style={{ color: selectedColorTheme.primary }}>
              SKILLS
            </h2>
            
            <div className="space-y-2">
              {enhancedContent.skills.map((skill: string, index: number) => (
                <p key={index} className="text-xs sm:text-sm text-muted-foreground font-light">
                  {skill}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {enhancedContent.education && enhancedContent.education.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-base sm:text-lg font-medium tracking-wide" style={{ color: selectedColorTheme.primary }}>
              EDUCATION
            </h2>
            
            <div className="space-y-3 sm:space-y-4">
              {enhancedContent.education.map((edu: any, index: number) => (
                <div key={index} className="space-y-1">
                   <h3 className="text-sm sm:text-base font-medium text-foreground">{edu.degree}</h3>
                   <p className="text-xs sm:text-sm font-light" style={{ color: selectedColorTheme.primary }}>
                     {edu.institution}
                   </p>
                   {edu.year && edu.year !== "N/A" && edu.year !== "Year not specified" && (
                     <p className="text-xs sm:text-sm text-muted-foreground font-light">{edu.year}</p>
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