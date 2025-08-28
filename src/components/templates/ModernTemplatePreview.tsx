import React from "react";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Award, BookOpen, Globe, Briefcase, Star } from "lucide-react";
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

export function ModernTemplatePreview({ enhancedContent, selectedColorTheme }: TemplatePreviewProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-border/50 print:shadow-none print:border-0 flex min-h-[600px]">
      {/* Left Sidebar */}
      <div 
        className="w-64 p-6 text-white"
        style={{
          background: `linear-gradient(180deg, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
        }}
      >
        {/* Profile Photo - Only show if photo exists */}
        {enhancedContent.photo && (
          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
              <img 
                src={enhancedContent.photo} 
                alt={enhancedContent.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Sidebar Sections */}
        <div className="space-y-6">
          {/* Contact Details */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm tracking-wide uppercase">Contact</h3>
            </div>
            <div className="space-y-3 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <span className="break-all text-xs no-underline">{enhancedContent.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span className="text-xs no-underline">{enhancedContent.phone}</span>
              </div>
              {enhancedContent.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs">{enhancedContent.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {enhancedContent.skills && enhancedContent.skills.length > 0 && (
            <div className="page-break-avoid section">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm tracking-wide uppercase">Skills</h3>
              </div>
              <div className="space-y-2">
                {enhancedContent.skills.map((skill: string, index: number) => (
                  <div key={index} className="text-xs opacity-90 flex items-center gap-2 page-break-avoid skill-item">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                    <span className="font-medium">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tools */}
          {enhancedContent.tools && enhancedContent.tools.length > 0 && (
            <div className="page-break-avoid section">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Star className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm tracking-wide uppercase">Tools</h3>
              </div>
              <div className="space-y-2">
                {enhancedContent.tools.map((tool: string, index: number) => (
                  <div key={index} className="text-xs opacity-90 flex items-center gap-2 page-break-avoid skill-item">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                    <span className="font-medium">{tool}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Technical Skills */}
          {enhancedContent.core_technical_skills && enhancedContent.core_technical_skills.length > 0 && (
            <div className="page-break-avoid section">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Star className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm tracking-wide uppercase">Core Skills</h3>
              </div>
              <div className="space-y-2">
                {enhancedContent.core_technical_skills.map((skill: any, index: number) => (
                  <div key={index} className="text-xs opacity-90 flex items-center gap-2 page-break-avoid skill-item">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                    <span className="font-medium">{skill.name}</span>
                    <div className="flex-1 flex justify-end">
                      <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white/70 rounded-full" style={{width: `${skill.proficiency}%`}}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Language Proficiency - Only show if languages exist */}
          {enhancedContent.languages && enhancedContent.languages.length > 0 && (
            <div className="page-break-avoid section">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm tracking-wide uppercase">Language Proficiency</h3>
              </div>
              <div className="space-y-3 text-xs opacity-90">
                {enhancedContent.languages.map((language: string, index: number) => (
                  <div key={index} className="flex justify-between items-center page-break-avoid">
                    <span className="font-medium">{language}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional Certifications */}
          {enhancedContent.certifications && enhancedContent.certifications.length > 0 && (
            <div className="page-break-avoid section">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm tracking-wide uppercase">Certifications</h3>
              </div>
              <div className="space-y-2 text-xs opacity-90">
                {enhancedContent.certifications.map((certification: string, index: number) => (
                  <div key={index} className="font-medium page-break-avoid">• {certification}</div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {enhancedContent.education && enhancedContent.education.length > 0 && (
            <div className="page-break-avoid section">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm tracking-wide uppercase">Education</h3>
              </div>
              <div className="space-y-3">
                {enhancedContent.education.slice(0, 2).map((edu: any, index: number) => (
                  <div key={index} className="text-xs opacity-90 page-break-avoid education-item">
                    <div className="font-medium">{edu.degree}</div>
                    <div className="text-xs opacity-75">{edu.institution}</div>
                    {edu.year && edu.year !== "N/A" && (
                      <div className="text-xs opacity-75">{edu.year}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {enhancedContent.name}
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            {enhancedContent.title}
          </p>
        </div>

        {/* About Section */}
        <div className="mb-8 page-break-avoid section">
          <div 
            className="text-xl font-bold mb-4 flex items-center gap-3 px-4 py-3 rounded-lg text-white"
            style={{ 
              background: `linear-gradient(135deg, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
            }}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/20">
              <User className="w-3 h-3" />
            </div>
            PROFESSIONAL SUMMARY
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {enhancedContent.summary}
          </p>
        </div>

        {/* Work Experience */}
        {enhancedContent.experience && enhancedContent.experience.length > 0 && (
          <div className="page-break-before section">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3" style={{ color: selectedColorTheme.primary }}>
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: selectedColorTheme.primary }}
              >
                <Briefcase className="w-3 h-3" />
              </div>
              Work & Related Experience
            </h2>
            
            <div className="space-y-6">
              {enhancedContent.experience.map((exp: any, index: number) => (
                <div key={index} className="border-l-2 pl-6 relative page-break-avoid experience-item print:break-inside-avoid print:mb-6" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
                  <div 
                    className="absolute left-[-5px] top-0 w-2 h-2 rounded-full"
                    style={{ backgroundColor: selectedColorTheme.primary }}
                  ></div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-3 gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-foreground leading-tight">{exp.title}</h3>
                        <p className="font-medium text-base mt-1" style={{ color: selectedColorTheme.accent }}>{exp.company}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge 
                          variant="outline" 
                          className="text-xs px-3 py-1.5 font-medium" 
                          style={{ 
                            backgroundColor: `${selectedColorTheme.primary}10`, 
                            color: selectedColorTheme.primary,
                            borderColor: `${selectedColorTheme.primary}30`
                          }}
                        >
                          {exp.duration}
                        </Badge>
                      </div>
                    </div>
                    
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="mt-4 page-break-avoid">
                        <h4 className="text-sm font-semibold mb-3 opacity-90">Key Achievements & Impact:</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                           {exp.achievements.map((achievement: string, achIndex: number) => (
                             <li key={achIndex} className="flex items-start gap-3 page-break-avoid">
                               <div className="w-4 h-4 rounded-full flex items-center justify-center mt-1 flex-shrink-0" style={{ backgroundColor: selectedColorTheme.accent }}>
                                 <span className="text-white text-xs font-bold">✓</span>
                               </div>
                               <span className="leading-relaxed font-medium text-sm" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                                 {achievement}
                               </span>
                             </li>
                           ))}
                        </ul>
                        
                         {/* Job-specific Core Responsibilities */}
                         {exp.core_responsibilities && exp.core_responsibilities.length > 0 && (
                           <div className="mt-5 p-4 rounded-lg bg-gray-50 border border-gray-200 page-break-avoid print:break-inside-avoid">
                             <h5 className="text-sm font-semibold mb-3 opacity-90">Core Responsibilities:</h5>
                              <div className="text-sm opacity-80 leading-relaxed space-y-2">
                                {exp.core_responsibilities.map((responsibility: string, idx: number) => (
                                  <div key={idx} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0" 
                                         style={{ backgroundColor: selectedColorTheme.accent }}></div>
                                    <span className="text-sm leading-relaxed break-words">{responsibility}</span>
                                  </div>
                                ))}
                             </div>
                           </div>
                         )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}