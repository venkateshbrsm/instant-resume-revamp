import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Mail, Phone, Award, TrendingUp, Users } from "lucide-react";

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

export function ClassicTemplatePreview({ enhancedContent, selectedColorTheme }: TemplatePreviewProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-border/50 max-w-4xl mx-auto print:shadow-none print:border-0">
      {/* Classic Header - Centered */}
      <div className="text-center py-6 px-4 border-b-2 print:py-4 print:px-3" style={{ borderColor: selectedColorTheme.primary }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: selectedColorTheme.primary }}>
          {enhancedContent.name}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-4 font-medium">
          {enhancedContent.title}
        </p>
        <div className="text-sm text-muted-foreground space-x-4">
          <span>{enhancedContent.email}</span>
          <span>•</span>
          <span>{enhancedContent.phone}</span>
          <span>•</span>
          <span>{enhancedContent.location}</span>
        </div>
      </div>

      <div className="p-6 space-y-6 print:p-4 print:space-y-4">
        {/* Professional Summary */}
        <div>
          <h2 
            className="text-xl font-bold mb-4 pb-2 border-b"
            style={{ 
              color: selectedColorTheme.primary,
              borderColor: `${selectedColorTheme.primary}30`
            }}
          >
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground text-justify">
            {enhancedContent.summary}
          </p>
        </div>

        {/* Professional Experience */}
        {enhancedContent.experience && enhancedContent.experience.length > 0 && (
          <div>
            <h2 
              className="text-xl font-bold mb-6 pb-2 border-b"
              style={{ 
                color: selectedColorTheme.primary,
                borderColor: `${selectedColorTheme.primary}30`
              }}
            >
              PROFESSIONAL EXPERIENCE
            </h2>
            <div className="space-y-8 print:space-y-12">{/* Much larger spacing for print */}
              {enhancedContent.experience.map((exp: any, index: number) => (
                <div key={index} className="border-l-4 pl-6" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
                  <div className="mb-2">
                    <h3 className="text-lg font-bold text-foreground">{exp.title}</h3>
                    <p className="text-base font-semibold" style={{ color: selectedColorTheme.primary }}>
                      {exp.company}
                    </p>
                    <p className="text-sm text-muted-foreground italic">{exp.duration}</p>
                  </div>
                  
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="mt-3 space-y-2 print:keep-together">
                      {exp.achievements.map((achievement: string, achIndex: number) => (
                        <li key={achIndex} className="text-sm leading-relaxed text-muted-foreground flex items-start">
                          <span className="mr-3 mt-1">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
          {/* Core Competencies */}
          {enhancedContent.skills && enhancedContent.skills.length > 0 && (
            <div>
              <h2 
                className="text-xl font-bold mb-4 pb-2 border-b"
                style={{ 
                  color: selectedColorTheme.primary,
                  borderColor: `${selectedColorTheme.primary}30`
                }}
              >
                CORE COMPETENCIES
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {enhancedContent.skills.map((skill: string, index: number) => (
                  <div key={index} className="text-sm text-muted-foreground flex items-center">
                    <span className="mr-3" style={{ color: selectedColorTheme.primary }}>•</span>
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {enhancedContent.education && enhancedContent.education.length > 0 && (
            <div>
              <h2 
                className="text-xl font-bold mb-4 pb-2 border-b"
                style={{ 
                  color: selectedColorTheme.primary,
                  borderColor: `${selectedColorTheme.primary}30`
                }}
              >
                EDUCATION
              </h2>
              <div className="space-y-4">
                {enhancedContent.education.map((edu: any, index: number) => (
                  <div key={index}>
                    <h3 className="font-bold text-foreground">{edu.degree}</h3>
                    <p className="font-semibold" style={{ color: selectedColorTheme.primary }}>
                      {edu.institution}
                    </p>
                    <p className="text-sm text-muted-foreground italic">{edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}