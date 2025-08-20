import React from "react";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Award, BookOpen, Globe, Briefcase, Star } from "lucide-react";

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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-border/50 print:shadow-none print:border-0 print:rounded-none flex flex-col lg:flex-row min-h-[600px] print:flex-col print:min-h-0">
      {/* Left Sidebar */}
      <div 
        className="w-full lg:w-64 p-4 sm:p-6 text-white print:w-full print:p-4"
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
                <span className="break-all text-xs">{enhancedContent.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span className="text-xs">{enhancedContent.phone}</span>
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
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Star className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm tracking-wide uppercase">Skills</h3>
              </div>
              <div className="space-y-2">
                {enhancedContent.skills.map((skill: string, index: number) => (
                  <div key={index} className="text-xs opacity-90 p-1 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    • {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm tracking-wide uppercase">Languages</h3>
            </div>
            <div className="space-y-2 text-xs opacity-90">
              <div>• English (Native)</div>
              <div>• Spanish (Intermediate)</div>
            </div>
          </div>

          {/* Education */}
          {enhancedContent.education && enhancedContent.education.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm tracking-wide uppercase">Education</h3>
              </div>
              <div className="space-y-3">
                {enhancedContent.education.map((edu: any, index: number) => (
                  <div key={index} className="text-xs opacity-90 p-2 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="font-medium">{edu.degree}</div>
                    <div className="text-xs opacity-75 mt-1">{edu.institution}</div>
                    {edu.year && edu.year !== "N/A" && edu.year !== "Year not specified" && (
                      <div className="text-xs opacity-75">{edu.year}</div>
                    )}
                    {edu.gpa && <div className="text-xs opacity-75 mt-1">GPA: {edu.gpa}</div>}
                    {edu.honors && edu.honors.length > 0 && (
                      <div className="text-xs opacity-75 mt-1">
                        Honors: {edu.honors.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 print:p-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8 print:mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 print:text-2xl">
            {enhancedContent.name}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-4 print:text-base">
            {enhancedContent.title}
          </p>
        </div>

        {/* About Section */}
        <div className="mb-6 sm:mb-8 print:mb-4 print:page-break-inside-avoid">
          <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-3 print:text-lg print:mb-3" style={{ color: selectedColorTheme.primary }}>
            <div 
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white print:w-5 print:h-5"
              style={{ backgroundColor: selectedColorTheme.primary }}
            >
              <User className="w-3 h-3" />
            </div>
            About & Professional Summary
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed print:text-sm print:leading-normal">
            {enhancedContent.summary}
          </p>
        </div>

        {/* Work Experience */}
        {enhancedContent.experience && enhancedContent.experience.length > 0 && (
          <div>
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
                <div key={index} className="border-l-2 pl-6 relative" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
                  <div 
                    className="absolute left-[-5px] top-0 w-2 h-2 rounded-full"
                    style={{ backgroundColor: selectedColorTheme.primary }}
                  ></div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{exp.title}</h3>
                        <p className="font-medium text-base" style={{ color: selectedColorTheme.accent }}>{exp.company}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="text-xs px-2 py-1" 
                        style={{ 
                          backgroundColor: `${selectedColorTheme.primary}10`, 
                          color: selectedColorTheme.primary,
                          borderColor: `${selectedColorTheme.primary}20`
                        }}
                      >
                        {exp.duration}
                      </Badge>
                    </div>
                    
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-sm mb-3" style={{ color: selectedColorTheme.primary }}>
                          Key Achievements & Responsibilities:
                        </h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                          {exp.achievements.map((achievement: string, achIndex: number) => (
                            <li key={achIndex} className="flex items-start gap-2">
                              <span className="font-bold flex-shrink-0 mt-0.5" style={{ color: selectedColorTheme.accent }}>▸</span>
                              <span className="leading-relaxed">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="mt-3">
                        <h4 className="font-semibold text-sm mb-2" style={{ color: selectedColorTheme.primary }}>
                          Technologies:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {exp.technologies.map((tech: string, techIndex: number) => (
                            <Badge key={techIndex} variant="outline" className="text-xs px-2 py-0.5" 
                              style={{ borderColor: selectedColorTheme.accent, color: selectedColorTheme.accent }}>
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Professional Sections */}
        {(enhancedContent.certifications || enhancedContent.projects || enhancedContent.awards) && (
          <div className="mt-8 space-y-6">
            {/* Certifications */}
            {enhancedContent.certifications && enhancedContent.certifications.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ color: selectedColorTheme.primary }}>
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedColorTheme.primary }}
                  >
                    <Award className="w-3 h-3" />
                  </div>
                  Professional Certifications
                </h2>
                <div className="space-y-3">
                  {enhancedContent.certifications.map((cert: any, index: number) => (
                    <div key={index} className="border-l-2 pl-4" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
                      <h3 className="font-bold text-foreground">{cert.name}</h3>
                      <p className="text-sm font-medium" style={{ color: selectedColorTheme.accent }}>{cert.issuer}</p>
                      {cert.date && <p className="text-sm text-muted-foreground">{cert.date}</p>}
                      {cert.id && <p className="text-xs text-muted-foreground">Credential ID: {cert.id}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notable Projects */}
            {enhancedContent.projects && enhancedContent.projects.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ color: selectedColorTheme.primary }}>
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedColorTheme.secondary }}
                  >
                    <Briefcase className="w-3 h-3" />
                  </div>
                  Notable Projects
                </h2>
                <div className="space-y-4">
                  {enhancedContent.projects.map((project: any, index: number) => (
                    <div key={index} className="border-l-2 pl-4 pb-4" style={{ borderColor: `${selectedColorTheme.secondary}20` }}>
                      <h3 className="font-bold text-lg text-foreground">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                      )}
                      {project.technologies && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((tech: string, techIndex: number) => (
                            <Badge key={techIndex} variant="outline" className="text-xs" 
                              style={{ borderColor: selectedColorTheme.secondary, color: selectedColorTheme.secondary }}>
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}