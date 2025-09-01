import React from "react";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Award, TrendingUp, Users, Target, Star, User, CheckCircle, MapPin } from "lucide-react";
import { extractCoreResponsibilities, extractLeadershipLearnings } from "@/lib/coreResponsibilitiesExtractor";

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

export function ExecutiveTemplatePreview({ enhancedContent, selectedColorTheme }: TemplatePreviewProps) {
  return (
    <div className="bg-white shadow-2xl overflow-hidden border border-border/50 max-w-5xl mx-auto print:shadow-none print:border-0 print:max-w-none print:w-full">
      {/* Print Layout - Single Column for PDF */}
      <div className="flex print:block">
        {/* Left Sidebar - Dark Background */}
        <div 
          className="w-1/3 p-6 text-white print:p-4 print:w-full print:mb-6 page-break-avoid"
          style={{
            background: `linear-gradient(135deg, ${selectedColorTheme.primary} 0%, ${selectedColorTheme.secondary} 50%, ${selectedColorTheme.accent} 100%)`
          }}
        >
          {/* Profile Section */}
          <div className="mb-8 page-break-avoid">
            {/* Profile Photo - Only show if photo exists */}
            {enhancedContent.photo && (
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden mb-4 mx-auto">
                <img 
                  src={enhancedContent.photo} 
                  alt={enhancedContent.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h1 className="text-2xl font-bold mb-2 text-center">{enhancedContent.name}</h1>
            <p className="text-lg opacity-95 font-medium text-center mb-4">{enhancedContent.title}</p>
            
            <div className="space-y-2 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="break-all no-underline">{enhancedContent.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="no-underline">{enhancedContent.phone}</span>
              </div>
              {enhancedContent.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="no-underline">{enhancedContent.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills in Sidebar */}
          {enhancedContent.skills && enhancedContent.skills.length > 0 && (
            <div className="mb-8 page-break-avoid skills-section">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Skills
              </h3>
              <div className="space-y-2">
                {enhancedContent.skills.slice(0, 6).map((skill: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 skill-item">
                    <div className="w-2 h-2 rounded-full bg-white/80"></div>
                    <span className="text-sm font-medium">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tools in Sidebar */}
          {enhancedContent.tools && enhancedContent.tools.length > 0 && (
            <div className="mb-8 page-break-avoid skills-section">
               <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <Star className="w-5 h-5" />
                 Tools & Technologies
               </h3>
               <div className="space-y-2">
                 {enhancedContent.tools.map((tool: string, index: number) => (
                   <div key={index} className="flex items-center gap-2 skill-item">
                     <div className="w-2 h-2 rounded-full bg-white/80"></div>
                     <span className="text-sm font-medium">{tool}</span>
                   </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Technical Skills in Sidebar */}
          {enhancedContent.core_technical_skills && enhancedContent.core_technical_skills.length > 0 && (
            <div className="mb-8 page-break-avoid skills-section">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Core Skills
              </h3>
              <div className="space-y-2">
                {enhancedContent.core_technical_skills.slice(0, 8).map((skill: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 skill-item">
                    <div className="w-2 h-2 rounded-full bg-white/80"></div>
                    <span className="text-sm font-medium">{skill.name} ({skill.proficiency}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Executive Metrics */}
          <div className="mb-8 page-break-avoid">
            <h3 className="text-lg font-bold mb-4">Leadership Impact</h3>
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">
                  {enhancedContent.experience?.length || 0}+
                </div>
                <p className="text-xs opacity-90">Years Leadership</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">
                  {enhancedContent.core_technical_skills?.length || 0}
                </div>
                <p className="text-xs opacity-90">Core Competencies</p>
              </div>
            </div>
          </div>
          
          {/* Professional Certifications */}
          {enhancedContent.certifications && enhancedContent.certifications.length > 0 && (
            <div className="mb-8 page-break-avoid">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certifications
              </h3>
              <div className="space-y-3">
                {enhancedContent.certifications.map((certification: string, index: number) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 page-break-avoid">
                    <span className="text-sm font-medium">{certification}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Language Proficiency */}
          {enhancedContent.languages && enhancedContent.languages.length > 0 && (
            <div className="mb-8 page-break-avoid">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Languages
              </h3>
              <div className="space-y-2">
                {enhancedContent.languages.map((language: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 skill-item">
                    <div className="w-2 h-2 rounded-full bg-white/80"></div>
                    <span className="text-sm font-medium">{language}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education in Sidebar */}
          {enhancedContent.education && enhancedContent.education.length > 0 && (
            <div className="page-break-avoid">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Education
              </h3>
              <div className="space-y-3">
                {enhancedContent.education.map((edu: any, index: number) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 education-item page-break-avoid">
                    <h4 className="font-bold text-sm">{edu.degree}</h4>
                    <p className="text-sm opacity-90">{edu.institution}</p>
                    {edu.year && edu.year !== "N/A" && edu.year !== "Year not specified" && (
                      <p className="text-xs opacity-75 mt-1">{edu.year}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Main Content - Light Background */}
        <div className="w-2/3 p-6 bg-gray-50 print:p-4 print:w-full print:bg-white">
          {/* Executive Summary */}
          <div className="mb-8 page-break-avoid section print:mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ background: selectedColorTheme.primary }}
              >
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold" style={{ color: selectedColorTheme.primary }}>
                Executive Summary
              </h2>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: selectedColorTheme.primary }}>
              <p className="text-sm leading-relaxed text-gray-500">
                {enhancedContent.summary}
              </p>
            </div>
          </div>

              {/* Professional Experience - Enhanced with Detailed Achievements */}
              {enhancedContent.experience && enhancedContent.experience.length > 0 && (
                <div className="section">
                  <div className="flex items-center gap-3 mb-6">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ background: selectedColorTheme.secondary }}
                    >
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold" style={{ color: selectedColorTheme.primary }}>
                      Executive Leadership Experience
                    </h2>
                  </div>
                  
                  <div className="space-y-8">
                    {enhancedContent.experience.map((exp: any, index: number) => (
                      <div key={index} className="bg-white p-6 rounded-lg shadow-sm border-l-4 experience-item page-break-avoid print:mb-8" style={{ borderColor: selectedColorTheme.accent }} data-experience>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 min-w-0 pr-4">
                            <h3 className="text-lg font-bold text-gray-600 mb-1 break-words whitespace-normal overflow-wrap-break-word">{exp.title}</h3>
                            <p className="text-base font-semibold break-words whitespace-normal overflow-wrap-break-word" style={{ color: selectedColorTheme.primary }}>
                              {exp.company}
                            </p>
                          </div>
                          <Badge 
                            className="px-3 py-1 text-white text-xs"
                            style={{ backgroundColor: selectedColorTheme.primary }}
                          >
                            {exp.duration}
                          </Badge>
                        </div>
                        
                        {exp.achievements && exp.achievements.length > 0 && (
                          <div className="page-break-avoid">
                            <h4 className="font-semibold text-gray-600 flex items-center gap-2 mb-4">
                              <Star className="w-4 h-4" style={{ color: selectedColorTheme.accent }} />
                              Strategic Achievements & Leadership Impact
                            </h4>
                            <div className="space-y-3">
                              {exp.achievements.map((achievement: string, achIndex: number) => (
                                <div key={achIndex} className="flex items-start gap-3 overflow-hidden">
                                  <div 
                                    className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0"
                                    style={{ backgroundColor: selectedColorTheme.accent }}
                                  >
                                    <span className="text-white text-xs">•</span>
                                  </div>
                                  <p className="text-sm leading-relaxed text-gray-600 font-medium break-words min-w-0 flex-1">
                                    {achievement}
                                  </p>
                                </div>
                              ))}
                            </div>
                            
                            {/* Core Responsibilities Section */}
                            {exp.core_responsibilities && exp.core_responsibilities.length > 0 && (
                              <div 
                                className="mt-4 p-4 rounded-lg border page-break-avoid print:break-inside-avoid"
                                style={{ 
                                  backgroundColor: `${selectedColorTheme.primary}08`,
                                  borderColor: `${selectedColorTheme.primary}20`
                                }}
                              >
                                <h5 className="text-sm font-semibold mb-2 text-foreground">
                                  Core Responsibilities:
                                </h5>
                                <div className="text-xs leading-relaxed text-muted-foreground space-y-1">
                                  {exp.core_responsibilities.map((responsibility: string, idx: number) => (
                                    <p key={idx} className="flex items-start">
                                      <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 mt-1.5 flex-shrink-0" 
                                            style={{ backgroundColor: selectedColorTheme.accent }}></span>
                                      {responsibility}
                                    </p>
                                  ))}
                                </div>
                               </div>
                             )}
                            
                            {/* Executive Leadership & Strategic Vision */}
                            <div className="mt-5 p-4 rounded-lg bg-gray-50 border-l-3" style={{ borderColor: selectedColorTheme.primary }}>
                              <h5 className="font-semibold text-gray-600 mb-2 text-sm">Executive Leadership & Strategic Vision:</h5>
                              <p className="text-xs leading-relaxed text-gray-600">
                                {extractLeadershipLearnings(exp.achievements, exp.title, exp.company, index)}
                              </p>
                            </div>
                          </div>
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