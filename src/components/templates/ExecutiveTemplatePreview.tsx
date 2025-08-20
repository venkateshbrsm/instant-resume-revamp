import React from "react";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Award, TrendingUp, Users, Target, Star, User } from "lucide-react";

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
    <div className="bg-white shadow-2xl overflow-hidden border border-border/50 max-w-5xl mx-auto print:shadow-none print:border-0 print:max-w-none print:w-full print:mx-0">
      {/* Print Layout - Single Column for PDF */}
      <div className="flex flex-col lg:flex-row print:block">
        {/* Left Sidebar - Dark Background */}
        <div 
          className="w-full lg:w-1/3 p-4 sm:p-6 text-white print:p-4 print:w-full print:mb-6 page-break-avoid"
          style={{
            background: `linear-gradient(135deg, ${selectedColorTheme.primary} 0%, ${selectedColorTheme.secondary} 50%, ${selectedColorTheme.accent} 100%)`
          }}
        >
          {/* Profile Section */}
          <div className="mb-6 sm:mb-8 page-break-avoid print:mb-6">
            {/* Profile Photo - Only show if photo exists */}
            {enhancedContent.photo && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden mb-4 mx-auto print:w-16 print:h-16">
                <img 
                  src={enhancedContent.photo} 
                  alt={enhancedContent.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h1 className="text-xl sm:text-2xl font-bold mb-2 text-center print:text-xl">{enhancedContent.name}</h1>
            <p className="text-base sm:text-lg opacity-95 font-medium text-center mb-4 print:text-base">{enhancedContent.title}</p>
            
            <div className="space-y-2 text-xs sm:text-sm opacity-90 print:text-xs">
              <div className="flex items-start gap-2">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 print:w-3 print:h-3" />
                <span className="break-all">{enhancedContent.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 print:w-3 print:h-3" />
                <span>{enhancedContent.phone}</span>
              </div>
            </div>
          </div>

          {/* Core Competencies in Sidebar */}
          {enhancedContent.skills && enhancedContent.skills.length > 0 && (
            <div className="mb-8 page-break-avoid skills-section">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Core Competencies
              </h3>
              <div className="space-y-2">
                {enhancedContent.skills.map((skill: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 skill-item">
                    <div className="w-2 h-2 rounded-full bg-white/80"></div>
                    <span className="text-sm font-medium">{skill}</span>
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
                  {enhancedContent.skills?.length || 0}
                </div>
                <p className="text-xs opacity-90">Core Competencies</p>
              </div>
            </div>
          </div>

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
        <div className="w-full lg:w-2/3 p-4 sm:p-6 bg-gray-50 print:p-4 print:w-full print:bg-white">
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
              <p className="text-sm leading-relaxed text-gray-700">
                {enhancedContent.summary}
              </p>
            </div>
          </div>

          {/* Professional Experience */}
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
                  Professional Experience
                </h2>
              </div>
              
              <div className="space-y-6">
                {enhancedContent.experience.map((exp: any, index: number) => (
                  <div key={index} className="bg-white p-5 rounded-lg shadow-sm border-l-4 experience-item page-break-avoid print:mb-6" style={{ borderColor: selectedColorTheme.accent }} data-experience>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{exp.title}</h3>
                        <p className="text-base font-semibold" style={{ color: selectedColorTheme.primary }}>
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
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                          <Star className="w-4 h-4" style={{ color: selectedColorTheme.accent }} />
                          Key Achievements & Responsibilities
                        </h4>
                        <div className="space-y-3">
                          {exp.achievements.map((achievement: string, achIndex: number) => (
                            <div key={achIndex} className="flex items-start gap-3">
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0"
                                style={{ backgroundColor: selectedColorTheme.accent }}
                              >
                                <span className="text-white text-xs font-bold">✓</span>
                              </div>
                              <p className="text-sm leading-relaxed text-gray-600 flex-1">
                                {achievement}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="mt-4 page-break-avoid">
                        <h4 className="font-semibold text-gray-900 mb-3">Technologies & Tools</h4>
                        <div className="flex flex-wrap gap-2">
                          {exp.technologies.map((tech: string, techIndex: number) => (
                            <Badge key={techIndex} variant="outline" className="text-xs px-2 py-1" 
                              style={{ borderColor: selectedColorTheme.primary, color: selectedColorTheme.primary }}>
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {exp.metrics && exp.metrics.length > 0 && (
                      <div className="mt-4 page-break-avoid">
                        <h4 className="font-semibold text-gray-900 mb-3">Key Metrics & Results</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {exp.metrics.map((metric: any, metricIndex: number) => (
                            <div key={metricIndex} className="bg-gray-50 p-3 rounded-lg text-center">
                              <div className="text-lg font-bold" style={{ color: selectedColorTheme.primary }}>
                                {metric.value}
                              </div>
                              <p className="text-xs text-gray-600">{metric.label}</p>
                            </div>
                          ))}
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

      {/* Additional Executive Sections */}
      <div className="print:block">
        <div className="bg-white p-6 print:p-4">
          <div className="max-w-5xl mx-auto space-y-8 print:space-y-6">
            
            {/* Board Positions & Advisory Roles */}
            {enhancedContent.boardPositions && enhancedContent.boardPositions.length > 0 && (
              <div className="page-break-avoid">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ color: selectedColorTheme.primary }}>
                  <Users className="w-6 h-6" />
                  Board Positions & Advisory Roles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enhancedContent.boardPositions.map((position: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4" style={{ borderColor: selectedColorTheme.primary }}>
                      <h3 className="font-bold text-gray-900">{position.title}</h3>
                      <p className="font-semibold" style={{ color: selectedColorTheme.primary }}>{position.organization}</p>
                      <p className="text-sm text-gray-600">{position.duration}</p>
                      {position.description && <p className="text-sm text-gray-600 mt-2">{position.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Professional Certifications */}
            {enhancedContent.certifications && enhancedContent.certifications.length > 0 && (
              <div className="page-break-avoid">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ color: selectedColorTheme.primary }}>
                  <Award className="w-6 h-6" />
                  Professional Certifications & Licenses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enhancedContent.certifications.map((cert: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4" style={{ borderColor: selectedColorTheme.accent }}>
                      <h3 className="font-bold text-gray-900">{cert.name}</h3>
                      <p className="font-semibold" style={{ color: selectedColorTheme.accent }}>{cert.issuer}</p>
                      {cert.date && <p className="text-sm text-gray-600">{cert.date}</p>}
                      {cert.id && <p className="text-xs text-gray-500">Credential ID: {cert.id}</p>}
                      {cert.expires && <p className="text-xs text-gray-500">Expires: {cert.expires}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Awards & Recognition */}
            {enhancedContent.awards && enhancedContent.awards.length > 0 && (
              <div className="page-break-avoid">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ color: selectedColorTheme.primary }}>
                  <Star className="w-6 h-6" />
                  Awards & Recognition
                </h2>
                <div className="space-y-4">
                  {enhancedContent.awards.map((award: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4" style={{ borderColor: selectedColorTheme.secondary }}>
                      <div className="flex items-start gap-4">
                        <div className="text-2xl">🏆</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{award.title}</h3>
                          <p className="font-semibold" style={{ color: selectedColorTheme.secondary }}>{award.issuer}</p>
                          {award.date && <p className="text-sm text-gray-600">{award.date}</p>}
                          {award.description && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{award.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Publications & Speaking */}
            {enhancedContent.publications && enhancedContent.publications.length > 0 && (
              <div className="page-break-avoid">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ color: selectedColorTheme.primary }}>
                  <TrendingUp className="w-6 h-6" />
                  Publications & Speaking Engagements
                </h2>
                <div className="space-y-4">
                  {enhancedContent.publications.map((pub: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-bold text-gray-900">{pub.title}</h3>
                      <p className="font-semibold" style={{ color: selectedColorTheme.primary }}>{pub.venue || pub.journal}</p>
                      {pub.date && <p className="text-sm text-gray-600">{pub.date}</p>}
                      {pub.authors && <p className="text-sm text-gray-600">Co-authors: {pub.authors}</p>}
                      {pub.url && <p className="text-sm" style={{ color: selectedColorTheme.primary }}>URL: {pub.url}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages & International Experience */}
            {enhancedContent.languages && enhancedContent.languages.length > 0 && (
              <div className="page-break-avoid">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-3" style={{ color: selectedColorTheme.primary }}>
                  <Target className="w-6 h-6" />
                  Languages & International Experience
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {enhancedContent.languages.map((lang: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                      <h3 className="font-bold text-gray-900">{lang.name}</h3>
                      <p className="text-sm font-semibold" style={{ color: selectedColorTheme.primary }}>{lang.proficiency}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}