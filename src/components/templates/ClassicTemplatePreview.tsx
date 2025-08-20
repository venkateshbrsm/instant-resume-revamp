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
      {/* Classic Header - Centered with Photo */}
      <div className="text-center py-8 px-6 border-b border-gray-300" style={{ borderBottomWidth: '1px' }}>
        {/* Profile Photo */}
        {enhancedContent.photo && (
          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-gray-200">
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
        
        <h1 className="text-3xl font-bold mb-1 tracking-wider text-gray-900 uppercase">
          {enhancedContent.name || 'John Smith'}
        </h1>
        <p className="text-base text-gray-600 mb-3 font-normal uppercase tracking-widest">
          {enhancedContent.title || 'Software Engineer'}
        </p>
        <div className="text-sm text-gray-600 space-x-3 font-normal">
          <span>{enhancedContent.email || 'john@email.com'}</span>
          <span>•</span>
          <span>{enhancedContent.phone || '+1 (555) 123-4567'}</span>
          <span>•</span>
          <span>{enhancedContent.location || 'New York, NY'}</span>
        </div>
      </div>

      <div className="p-6 space-y-6 print:p-4 print:space-y-4">
        {/* Professional Summary */}
        <div className="print:avoid-break">
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
          <div className="print:avoid-break">
            <h2 
              className="text-xl font-bold mb-6 pb-2 border-b"
              style={{ 
                color: selectedColorTheme.primary,
                borderColor: `${selectedColorTheme.primary}30`
              }}
            >
              PROFESSIONAL EXPERIENCE
            </h2>
            <div className="space-y-6">
              {enhancedContent.experience.map((exp: any, index: number) => (
                <div key={index} className="border-l-4 pl-6 print:avoid-break" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
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
            <div className="print:avoid-break">
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
            <div className="print:avoid-break">
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
                  <div key={index} className="print:avoid-break">
                     <h3 className="font-bold text-foreground">{edu.degree}</h3>
                     <p className="font-semibold" style={{ color: selectedColorTheme.primary }}>
                       {edu.institution}
                     </p>
                     {edu.year && edu.year !== "N/A" && edu.year !== "Year not specified" && (
                       <p className="text-sm text-muted-foreground italic">{edu.year}</p>
                     )}
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