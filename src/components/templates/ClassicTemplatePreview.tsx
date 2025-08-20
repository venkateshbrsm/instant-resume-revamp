import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Mail, Phone, Award, TrendingUp, Users, User } from "lucide-react";

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
          <span>{enhancedContent.email}</span>
          <span>•</span>
          <span>{enhancedContent.phone}</span>
          <span>•</span>
          <span>{enhancedContent.location}</span>
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
                    <div className="mt-4">
                      <h4 className="font-semibold text-base mb-3" style={{ color: selectedColorTheme.primary }}>
                        Key Responsibilities & Achievements:
                      </h4>
                      <ul className="space-y-3 print:keep-together">
                        {exp.achievements.map((achievement: string, achIndex: number) => (
                          <li key={achIndex} className="text-sm leading-relaxed text-muted-foreground flex items-start">
                            <span className="mr-3 mt-1 font-bold" style={{ color: selectedColorTheme.primary }}>•</span>
                            <span className="flex-1">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-sm mb-2" style={{ color: selectedColorTheme.primary }}>
                        Technologies Used:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech: string, techIndex: number) => (
                          <Badge key={techIndex} variant="outline" className="text-xs px-2 py-1">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
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
              <div className="grid grid-cols-2 gap-3">
                {enhancedContent.skills.map((skill: string, index: number) => (
                  <div key={index} className="text-sm text-muted-foreground flex items-start p-2 rounded-md border" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
                    <span className="mr-3 mt-0.5" style={{ color: selectedColorTheme.primary }}>▪</span>
                    <span className="flex-1 font-medium">{skill}</span>
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
              <div className="space-y-5">
                {enhancedContent.education.map((edu: any, index: number) => (
                  <div key={index} className="print:avoid-break p-3 rounded-md border-l-4" style={{ borderColor: selectedColorTheme.primary, backgroundColor: `${selectedColorTheme.primary}05` }}>
                     <h3 className="font-bold text-lg text-foreground">{edu.degree}</h3>
                     <p className="font-semibold text-base mb-1" style={{ color: selectedColorTheme.primary }}>
                       {edu.institution}
                     </p>
                     {edu.year && edu.year !== "N/A" && edu.year !== "Year not specified" && (
                       <p className="text-sm text-muted-foreground italic mb-2">{edu.year}</p>
                     )}
                     {edu.gpa && (
                       <p className="text-sm text-muted-foreground">GPA: {edu.gpa}</p>
                     )}
                     {edu.honors && edu.honors.length > 0 && (
                       <div className="mt-2">
                         <p className="text-sm font-medium text-muted-foreground">Honors & Awards:</p>
                         <ul className="text-sm text-muted-foreground ml-4">
                           {edu.honors.map((honor: string, honorIndex: number) => (
                             <li key={honorIndex}>• {honor}</li>
                           ))}
                         </ul>
                       </div>
                     )}
                     {edu.coursework && edu.coursework.length > 0 && (
                       <div className="mt-2">
                         <p className="text-sm font-medium text-muted-foreground">Relevant Coursework:</p>
                         <p className="text-sm text-muted-foreground">{edu.coursework.join(', ')}</p>
                       </div>
                     )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional Sections for More Detail */}
        {(enhancedContent.certifications || enhancedContent.projects || enhancedContent.awards || enhancedContent.languages) && (
          <div className="mt-8 space-y-6 print:mt-6 print:space-y-4">
            {/* Certifications */}
            {enhancedContent.certifications && enhancedContent.certifications.length > 0 && (
              <div className="print:avoid-break">
                <h2 
                  className="text-xl font-bold mb-4 pb-2 border-b"
                  style={{ 
                    color: selectedColorTheme.primary,
                    borderColor: `${selectedColorTheme.primary}30`
                  }}
                >
                  CERTIFICATIONS & LICENSES
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enhancedContent.certifications.map((cert: any, index: number) => (
                    <div key={index} className="p-3 rounded-md border-l-4" style={{ borderColor: selectedColorTheme.accent, backgroundColor: `${selectedColorTheme.accent}05` }}>
                      <h3 className="font-bold text-foreground">{cert.name}</h3>
                      <p className="text-sm font-medium" style={{ color: selectedColorTheme.accent }}>{cert.issuer}</p>
                      {cert.date && <p className="text-sm text-muted-foreground">{cert.date}</p>}
                      {cert.id && <p className="text-xs text-muted-foreground">ID: {cert.id}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {enhancedContent.projects && enhancedContent.projects.length > 0 && (
              <div className="print:avoid-break">
                <h2 
                  className="text-xl font-bold mb-4 pb-2 border-b"
                  style={{ 
                    color: selectedColorTheme.primary,
                    borderColor: `${selectedColorTheme.primary}30`
                  }}
                >
                  KEY PROJECTS
                </h2>
                <div className="space-y-4">
                  {enhancedContent.projects.map((project: any, index: number) => (
                    <div key={index} className="p-4 rounded-md border-l-4" style={{ borderColor: selectedColorTheme.secondary, backgroundColor: `${selectedColorTheme.secondary}05` }}>
                      <h3 className="font-bold text-lg text-foreground mb-2">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                      )}
                      {project.technologies && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {project.technologies.map((tech: string, techIndex: number) => (
                            <Badge key={techIndex} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {project.url && (
                        <p className="text-sm" style={{ color: selectedColorTheme.primary }}>
                          URL: {project.url}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Awards & Recognition */}
            {enhancedContent.awards && enhancedContent.awards.length > 0 && (
              <div className="print:avoid-break">
                <h2 
                  className="text-xl font-bold mb-4 pb-2 border-b"
                  style={{ 
                    color: selectedColorTheme.primary,
                    borderColor: `${selectedColorTheme.primary}30`
                  }}
                >
                  AWARDS & RECOGNITION
                </h2>
                <div className="space-y-3">
                  {enhancedContent.awards.map((award: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-md" style={{ backgroundColor: `${selectedColorTheme.primary}05` }}>
                      <span className="text-xl" style={{ color: selectedColorTheme.primary }}>🏆</span>
                      <div>
                        <h3 className="font-bold text-foreground">{award.title}</h3>
                        <p className="text-sm font-medium" style={{ color: selectedColorTheme.primary }}>{award.issuer}</p>
                        {award.date && <p className="text-sm text-muted-foreground">{award.date}</p>}
                        {award.description && <p className="text-sm text-muted-foreground mt-1">{award.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {enhancedContent.languages && enhancedContent.languages.length > 0 && (
              <div className="print:avoid-break">
                <h2 
                  className="text-xl font-bold mb-4 pb-2 border-b"
                  style={{ 
                    color: selectedColorTheme.primary,
                    borderColor: `${selectedColorTheme.primary}30`
                  }}
                >
                  LANGUAGES
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {enhancedContent.languages.map((lang: any, index: number) => (
                    <div key={index} className="p-3 rounded-md text-center border" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
                      <h3 className="font-bold text-foreground">{lang.name}</h3>
                      <p className="text-sm" style={{ color: selectedColorTheme.primary }}>{lang.proficiency}</p>
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