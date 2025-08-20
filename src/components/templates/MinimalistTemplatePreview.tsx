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
    <div className="bg-white max-w-4xl mx-auto p-6 md:p-8 space-y-8 print:p-4 print:space-y-6">
      {/* Minimalist Header */}
      <div className="text-left space-y-3 border-b pb-6 print:pb-4" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
        <div className="flex items-start gap-6">
          {/* Profile Photo - Only show if photo exists */}
          {enhancedContent.photo && (
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
              <img 
                src={enhancedContent.photo} 
                alt={enhancedContent.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-light tracking-wide" style={{ color: selectedColorTheme.primary }}>
              {enhancedContent.name}
            </h1>
            <p className="text-xl text-muted-foreground font-light">
              {enhancedContent.title}
            </p>
            
            <div className="flex flex-wrap gap-4 sm:gap-8 text-sm text-muted-foreground font-light pt-2">
              <span className="break-all">{enhancedContent.email}</span>
              <span>{enhancedContent.phone}</span>
              <span>{enhancedContent.location}</span>
            </div>
          </div>
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
                  <div className="pl-4 space-y-3 border-l print:keep-together" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
                    <h4 className="text-sm font-medium tracking-wide" style={{ color: selectedColorTheme.primary }}>
                      RESPONSIBILITIES & ACHIEVEMENTS
                    </h4>
                    {exp.achievements.map((achievement: string, achIndex: number) => (
                      <p key={achIndex} className="text-sm leading-relaxed text-muted-foreground font-light pl-2">
                        — {achievement}
                      </p>
                    ))}
                  </div>
                )}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="pl-4 mt-3 border-l" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
                    <h4 className="text-sm font-medium tracking-wide mb-2" style={{ color: selectedColorTheme.primary }}>
                      TECHNOLOGIES
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech: string, techIndex: number) => (
                        <span key={techIndex} className="text-xs px-2 py-1 rounded border font-light" 
                          style={{ borderColor: `${selectedColorTheme.primary}30`, color: selectedColorTheme.primary }}>
                          {tech}
                        </span>
                      ))}
                    </div>
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
            
            <div className="space-y-5">
              {enhancedContent.education.map((edu: any, index: number) => (
                <div key={index} className="space-y-2 pb-4 border-b" style={{ borderColor: `${selectedColorTheme.primary}10` }}>
                   <h3 className="text-base font-medium text-foreground">{edu.degree}</h3>
                   <p className="text-sm font-light" style={{ color: selectedColorTheme.primary }}>
                     {edu.institution}
                   </p>
                   {edu.year && edu.year !== "N/A" && edu.year !== "Year not specified" && (
                     <p className="text-sm text-muted-foreground font-light">{edu.year}</p>
                   )}
                   {edu.gpa && (
                     <p className="text-sm text-muted-foreground font-light">GPA: {edu.gpa}</p>
                   )}
                   {edu.honors && edu.honors.length > 0 && (
                     <div className="text-sm text-muted-foreground font-light">
                       <span className="font-medium">Honors:</span> {edu.honors.join(', ')}
                     </div>
                   )}
                   {edu.coursework && edu.coursework.length > 0 && (
                     <div className="text-sm text-muted-foreground font-light">
                       <span className="font-medium">Relevant Coursework:</span> {edu.coursework.join(', ')}
                     </div>
                   )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Extended Professional Information */}
      {(enhancedContent.certifications || enhancedContent.projects || enhancedContent.awards || enhancedContent.publications) && (
        <div className="space-y-8 mt-8 print:space-y-6 print:mt-6">
          
          {/* Professional Certifications */}
          {enhancedContent.certifications && enhancedContent.certifications.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium tracking-wide" style={{ color: selectedColorTheme.primary }}>
                PROFESSIONAL CERTIFICATIONS
              </h2>
              <div className="space-y-4">
                {enhancedContent.certifications.map((cert: any, index: number) => (
                  <div key={index} className="border-l pl-4" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
                    <h3 className="text-base font-medium text-foreground">{cert.name}</h3>
                    <p className="text-sm font-light" style={{ color: selectedColorTheme.primary }}>{cert.issuer}</p>
                    {cert.date && <p className="text-sm text-muted-foreground font-light">{cert.date}</p>}
                    {cert.id && <p className="text-xs text-muted-foreground font-light">ID: {cert.id}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Projects */}
          {enhancedContent.projects && enhancedContent.projects.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium tracking-wide" style={{ color: selectedColorTheme.primary }}>
                KEY PROJECTS
              </h2>
              <div className="space-y-6">
                {enhancedContent.projects.map((project: any, index: number) => (
                  <div key={index} className="border-l pl-4 space-y-2" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
                    <h3 className="text-base font-medium text-foreground">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-muted-foreground font-light leading-relaxed">{project.description}</p>
                    )}
                    {project.technologies && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.technologies.map((tech: string, techIndex: number) => (
                          <span key={techIndex} className="text-xs px-2 py-1 rounded border font-light" 
                            style={{ borderColor: `${selectedColorTheme.primary}30`, color: selectedColorTheme.primary }}>
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {project.url && (
                      <p className="text-sm font-light" style={{ color: selectedColorTheme.primary }}>
                        {project.url}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awards & Recognition */}
          {enhancedContent.awards && enhancedContent.awards.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium tracking-wide" style={{ color: selectedColorTheme.primary }}>
                AWARDS & RECOGNITION
              </h2>
              <div className="space-y-4">
                {enhancedContent.awards.map((award: any, index: number) => (
                  <div key={index} className="border-l pl-4" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
                    <h3 className="text-base font-medium text-foreground">{award.title}</h3>
                    <p className="text-sm font-light" style={{ color: selectedColorTheme.primary }}>{award.issuer}</p>
                    {award.date && <p className="text-sm text-muted-foreground font-light">{award.date}</p>}
                    {award.description && <p className="text-sm text-muted-foreground font-light mt-1 leading-relaxed">{award.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publications */}
          {enhancedContent.publications && enhancedContent.publications.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium tracking-wide" style={{ color: selectedColorTheme.primary }}>
                PUBLICATIONS & RESEARCH
              </h2>
              <div className="space-y-4">
                {enhancedContent.publications.map((pub: any, index: number) => (
                  <div key={index} className="border-l pl-4" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
                    <h3 className="text-base font-medium text-foreground">{pub.title}</h3>
                    <p className="text-sm font-light" style={{ color: selectedColorTheme.primary }}>{pub.journal || pub.venue}</p>
                    {pub.date && <p className="text-sm text-muted-foreground font-light">{pub.date}</p>}
                    {pub.authors && <p className="text-sm text-muted-foreground font-light">Authors: {pub.authors}</p>}
                    {pub.url && <p className="text-sm font-light" style={{ color: selectedColorTheme.primary }}>{pub.url}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}