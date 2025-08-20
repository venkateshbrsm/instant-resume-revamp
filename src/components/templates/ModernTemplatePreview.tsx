import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Mail, Phone, Award, TrendingUp, Users, Zap } from "lucide-react";

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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-border/50 print:shadow-none print:border-0 max-w-none">
      {/* Header with Profile Photo and Name */}
      <div 
        className="relative px-4 md:px-6 py-6 md:py-8 text-white overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
        }}
      >
        <div className="flex items-center gap-4 md:gap-6">
          {/* Profile Photo */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/30 flex items-center justify-center text-xl md:text-2xl">
              👤
            </div>
          </div>
          
          {/* Name and Title */}
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold mb-1 leading-tight">
              {enhancedContent.name || 'John Smith'}
            </h1>
            <p className="text-sm md:text-base opacity-90 font-medium">
              {enhancedContent.title || 'Software Engineer'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 p-4 md:p-6 space-y-4 md:space-y-6" style={{ backgroundColor: `${selectedColorTheme.primary}08` }}>
          
          {/* Contact Details */}
          <div>
            <h3 className="text-sm md:text-base font-bold mb-3 md:mb-4 flex items-center gap-2" style={{ color: selectedColorTheme.primary }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: selectedColorTheme.primary }}>
                📧
              </div>
              Contact Details
            </h3>
            <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 md:w-4 md:h-4" style={{ color: selectedColorTheme.accent }} />
                <span className="text-gray-700">{enhancedContent.email || 'john.smith@email.com'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 md:w-4 md:h-4" style={{ color: selectedColorTheme.accent }} />
                <span className="text-gray-700">{enhancedContent.phone || '+1 (555) 123-4567'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 md:w-4 md:h-4" style={{ color: selectedColorTheme.accent }} />
                <span className="text-gray-700">{enhancedContent.location || 'New York, NY'}</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-sm md:text-base font-bold mb-3 md:mb-4 flex items-center gap-2" style={{ color: selectedColorTheme.primary }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: selectedColorTheme.primary }}>
                ⚡
              </div>
              Skills
            </h3>
            <div className="space-y-2 md:space-y-3">
              {enhancedContent.skills && enhancedContent.skills.length > 0 ? (
                enhancedContent.skills.slice(0, 8).map((skill: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColorTheme.accent }}></div>
                    <span className="text-xs md:text-sm text-gray-700 font-medium">{skill}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColorTheme.accent }}></div>
                    <span className="text-xs md:text-sm text-gray-700 font-medium">JavaScript</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColorTheme.accent }}></div>
                    <span className="text-xs md:text-sm text-gray-700 font-medium">React</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColorTheme.accent }}></div>
                    <span className="text-xs md:text-sm text-gray-700 font-medium">Node.js</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Languages */}
          <div>
            <h3 className="text-sm md:text-base font-bold mb-3 md:mb-4 flex items-center gap-2" style={{ color: selectedColorTheme.primary }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: selectedColorTheme.primary }}>
                🌐
              </div>
              Languages
            </h3>
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColorTheme.accent }}></div>
                <span className="text-xs md:text-sm text-gray-700 font-medium">English (Native)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColorTheme.accent }}></div>
                <span className="text-xs md:text-sm text-gray-700 font-medium">Spanish (Fluent)</span>
              </div>
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-sm md:text-base font-bold mb-3 md:mb-4 flex items-center gap-2" style={{ color: selectedColorTheme.primary }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: selectedColorTheme.primary }}>
                🎓
              </div>
              Education
            </h3>
            {enhancedContent.education && enhancedContent.education.length > 0 ? (
              enhancedContent.education.map((edu: any, index: number) => (
                <div key={index} className="mb-2 md:mb-3 last:mb-0">
                  <h4 className="font-bold text-gray-900 text-xs md:text-sm leading-tight">{edu.degree || "Bachelor's Degree"}</h4>
                  <p className="text-xs md:text-sm" style={{ color: selectedColorTheme.accent }}>{edu.institution || "University Name"}</p>
                  {edu.year && edu.year !== "N/A" && edu.year !== "Year not specified" && (
                    <p className="text-xs text-gray-600">{edu.year}</p>
                  )}
                </div>
              ))
            ) : (
              <div>
                <h4 className="font-bold text-gray-900 text-xs md:text-sm leading-tight">Bachelor's in Computer Science</h4>
                <p className="text-xs md:text-sm" style={{ color: selectedColorTheme.accent }}>University of Technology</p>
                <p className="text-xs text-gray-600">2020</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 p-4 md:p-6 space-y-4 md:space-y-6">
          
          {/* Professional Summary */}
          <div>
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4" style={{ color: selectedColorTheme.primary }}>
              About Me
            </h3>
            <p className="text-xs md:text-sm leading-relaxed text-gray-700">
              {enhancedContent.summary || 'A passionate software engineer with expertise in modern web technologies and a strong track record of delivering high-quality applications. Experienced in full-stack development with a focus on user experience and performance optimization.'}
            </p>
          </div>

          {/* Professional Experience */}
          {enhancedContent.experience && enhancedContent.experience.length > 0 && (
            <div>
              <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4" style={{ color: selectedColorTheme.primary }}>
                Work Experience
              </h3>
              <div className="space-y-4 md:space-y-6">
                {enhancedContent.experience.map((exp: any, index: number) => (
                  <div key={index} className="relative">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2 md:mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm md:text-base text-gray-900">{exp.title || 'Position Title'}</h4>
                        <p className="font-semibold text-sm md:text-base mb-1" style={{ color: selectedColorTheme.accent }}>{exp.company || 'Company Name'}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600 mt-1 md:mt-0">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{exp.duration || 'Date Range'}</span>
                      </div>
                    </div>
                    
                    {exp.achievements && exp.achievements.length > 0 ? (
                      <ul className="space-y-1 md:space-y-2 ml-4">
                        {exp.achievements.slice(0, 3).map((achievement: string, achIndex: number) => (
                          <li key={achIndex} className="text-xs md:text-sm leading-relaxed text-gray-700 relative">
                            <span className="absolute -left-4 top-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedColorTheme.accent }}></span>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="space-y-1 md:space-y-2 ml-4">
                        <li className="text-xs md:text-sm leading-relaxed text-gray-700 relative">
                          <span className="absolute -left-4 top-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedColorTheme.accent }}></span>
                          Delivered exceptional results and exceeded performance expectations
                        </li>
                        <li className="text-xs md:text-sm leading-relaxed text-gray-700 relative">
                          <span className="absolute -left-4 top-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedColorTheme.accent }}></span>
                          Collaborated effectively with cross-functional teams
                        </li>
                      </ul>
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