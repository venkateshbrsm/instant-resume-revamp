import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Mail, Phone, Award, TrendingUp, Users, User } from "lucide-react";
import { extractCoreResponsibilities } from "@/lib/coreResponsibilitiesExtractor";

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
        {/* Profile Photo - Only show if photo exists */}
        {enhancedContent.photo && (
          <div className="mb-4">
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg" style={{ borderColor: selectedColorTheme.primary }}>
              <img 
                src={enhancedContent.photo} 
                alt={enhancedContent.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: selectedColorTheme.primary }}>
          {enhancedContent.name}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-4 font-medium">
          {enhancedContent.title}
        </p>
        <div className="text-sm text-muted-foreground space-x-4">
          <span className="no-underline">{enhancedContent.email}</span>
          <span>•</span>
          <span className="no-underline">{enhancedContent.phone}</span>
          <span>•</span>
          <span>{enhancedContent.location}</span>
        </div>
      </div>

      <div className="p-6 space-y-6 print:p-4 print:space-y-4">
        {/* Professional Summary */}
        <div className="page-break-avoid section">
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

        {/* Professional Experience - Enhanced and Detailed */}
        {enhancedContent.experience && enhancedContent.experience.length > 0 && (
          <div className="page-break-before section">
            <h2 
              className="text-xl font-bold mb-6 pb-2 border-b"
              style={{ 
                color: selectedColorTheme.primary,
                borderColor: `${selectedColorTheme.primary}30`
              }}
            >
              PROFESSIONAL EXPERIENCE & ACHIEVEMENTS
            </h2>
            <div className="space-y-8">
              {enhancedContent.experience.map((exp: any, index: number) => (
                <div key={index} className="border-l-4 pl-6 page-break-avoid experience-item print:break-inside-avoid print:mb-6" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-foreground">{exp.title}</h3>
                    <p className="text-base font-semibold" style={{ color: selectedColorTheme.primary }}>
                      {exp.company}
                    </p>
                    <p className="text-sm text-muted-foreground italic">{exp.duration}</p>
                  </div>
                  
                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="page-break-avoid">
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColorTheme.primary }}></span>
                        Key Achievements & Quantifiable Results:
                      </h4>
                      <ul className="space-y-3">
                        {exp.achievements.map((achievement: string, achIndex: number) => (
                          <li key={achIndex} className="text-sm leading-relaxed text-muted-foreground flex items-start page-break-avoid">
                            <span className="mr-3 mt-1 text-base font-bold" style={{ color: selectedColorTheme.primary }}>•</span>
                            <span className="font-medium">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                      
                       {/* Job-specific Core Responsibilities */}
                       <div className="mt-4 p-4 rounded-lg border page-break-avoid print:break-inside-avoid" style={{ 
                         backgroundColor: `${selectedColorTheme.primary}05`,
                         borderColor: `${selectedColorTheme.primary}20`
                       }}>
                         <h5 className="text-sm font-semibold mb-2 text-foreground">
                           Core Responsibilities:
                         </h5>
                          <div className="text-xs leading-relaxed text-muted-foreground space-y-1">
                            {extractCoreResponsibilities(exp.achievements, exp.title || 'Professional', 'classic', index, 4).map((responsibility, idx) => (
                              <p key={idx} className="flex items-start">
                                <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 mt-1.5 flex-shrink-0" 
                                      style={{ backgroundColor: selectedColorTheme.accent }}></span>
                                {responsibility}
                              </p>
                            ))}
                         </div>
                       </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
          {/* Core Competencies - Enhanced with Proficiency Levels */}
          {enhancedContent.skills && enhancedContent.skills.length > 0 && (
            <div className="page-break-avoid section">
              <h2 
                className="text-xl font-bold mb-4 pb-2 border-b"
                style={{ 
                  color: selectedColorTheme.primary,
                  borderColor: `${selectedColorTheme.primary}30`
                }}
              >
                CORE COMPETENCIES & TECHNICAL SKILLS
              </h2>
              <div className="space-y-3">
                {enhancedContent.skills.map((skill: string, index: number) => (
                  <div key={index} className="flex items-center justify-between page-break-avoid skill-item">
                    <div className="text-sm text-muted-foreground flex items-center">
                      <span className="mr-3 w-2 h-2 rounded-full" style={{ backgroundColor: selectedColorTheme.primary }}></span>
                      <span className="font-medium">{skill}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: i < Math.min(4, 3 + (index % 2)) ? selectedColorTheme.primary : `${selectedColorTheme.primary}20`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Additional Professional Skills */}
              <div className="mt-6 p-4 rounded-lg border page-break-avoid" style={{
                backgroundColor: `${selectedColorTheme.primary}05`,
                borderColor: `${selectedColorTheme.primary}20`
              }}>
                <h4 className="text-sm font-semibold mb-2 text-foreground">Additional Professional Competencies:</h4>
                <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                  <div>• Strategic Planning & Analysis</div>
                  <div>• Team Leadership & Development</div>
                  <div>• Process Optimization</div>
                  <div>• Stakeholder Management</div>
                  <div>• Quality Assurance</div>
                  <div>• Performance Metrics</div>
                </div>
              </div>
            </div>
          )}

          {/* Education */}
          {enhancedContent.education && enhancedContent.education.length > 0 && (
            <div className="page-break-avoid section">
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
                  <div key={index} className="page-break-avoid education-item">
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