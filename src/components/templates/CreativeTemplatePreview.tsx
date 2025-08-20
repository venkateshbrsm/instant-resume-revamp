import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Mail, Phone, Award, TrendingUp, Users, Palette, Brush, Sparkles, User } from "lucide-react";

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

export function CreativeTemplatePreview({ enhancedContent, selectedColorTheme }: TemplatePreviewProps) {
  return (
    <div className="bg-white shadow-lg overflow-hidden max-w-5xl mx-auto print:shadow-none print:max-w-none print:mx-0 print:w-full">
      {/* Print Layout - Single Column */}
      <div className="flex print:block">
        {/* Left Column - Main Content */}
        <div className="w-2/3 p-8 print:w-full print:p-6">
          {/* Header */}
          <div className="mb-8 print:mb-6 page-break-avoid">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {enhancedContent.photo ? (
                  <img 
                    src={enhancedContent.photo} 
                    alt={enhancedContent.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">{enhancedContent.name}</h1>
                <p className="text-xl text-gray-600 print:text-lg">{enhancedContent.title}</p>
              </div>
            </div>
            
            <div className="flex gap-4 text-sm text-gray-600 print:text-xs">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{enhancedContent.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{enhancedContent.phone}</span>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="mb-8 print:mb-6 page-break-avoid">
            <h2 className="text-xl font-bold mb-3 pb-2 border-b-2" style={{ color: selectedColorTheme.primary, borderColor: selectedColorTheme.primary }}>
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed print:text-sm">
              {enhancedContent.summary}
            </p>
          </div>

          {/* Experience Section */}
          {enhancedContent.experience && enhancedContent.experience.length > 0 && (
            <div className="mb-8 print:mb-6">
              <h2 className="text-xl font-bold mb-4 pb-2 border-b-2" style={{ color: selectedColorTheme.primary, borderColor: selectedColorTheme.primary }}>
                Professional Experience
              </h2>
              <div className="space-y-6 print:space-y-4">
                {enhancedContent.experience.map((exp: any, index: number) => (
                  <div key={index} className="page-break-avoid print:mb-4">
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{exp.title}</h3>
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <p className="font-semibold" style={{ color: selectedColorTheme.primary }}>
                          {exp.company}
                        </p>
                        <span className="text-sm text-gray-600 px-3 py-1 rounded-full bg-gray-100">
                          {exp.duration}
                        </span>
                      </div>
                    </div>
                    
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="page-break-avoid">
                        <ul className="space-y-2">
                          {exp.achievements.slice(0, 4).map((achievement: string, achIndex: number) => (
                            <li key={achIndex} className="flex items-start gap-2">
                              <div 
                                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                                style={{ backgroundColor: selectedColorTheme.primary }}
                              ></div>
                              <p className="text-sm text-gray-700 leading-relaxed print:text-xs">
                                {achievement}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Circular Design & Skills */}
        <div className="w-1/3 print:w-full print:mt-6">
          {/* Large Circular Element */}
          <div className="relative h-96 print:h-80 page-break-avoid">
            <div 
              className="absolute inset-0 rounded-full flex items-center justify-center text-white"
              style={{ 
                background: `linear-gradient(135deg, ${selectedColorTheme.primary} 0%, ${selectedColorTheme.accent} 100%)`,
              }}
            >
              <div className="text-center p-8">
                <div className="space-y-6">
                  {/* Skills in Circle */}
                  {enhancedContent.skills && enhancedContent.skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold mb-4 text-white">Skills & Expertise</h3>
                      <div className="space-y-2">
                        {enhancedContent.skills.slice(0, 6).map((skill: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 justify-center">
                            <div className="w-2 h-2 rounded-full bg-white/80"></div>
                            <span className="text-sm font-medium text-white">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {enhancedContent.experience?.length || 0}
                      </div>
                      <p className="text-xs text-white/90">Years Exp.</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {enhancedContent.skills?.length || 0}
                      </div>
                      <p className="text-xs text-white/90">Skills</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Education Section Below Circle */}
          {enhancedContent.education && enhancedContent.education.length > 0 && (
            <div className="p-6 mt-6 print:p-4 page-break-avoid">
              <h3 className="text-lg font-bold mb-4" style={{ color: selectedColorTheme.primary }}>
                Education
              </h3>
              <div className="space-y-3">
                {enhancedContent.education.map((edu: any, index: number) => (
                  <div key={index} className="page-break-avoid">
                    <h4 className="font-bold text-gray-900 text-sm">{edu.degree}</h4>
                    <p className="text-sm" style={{ color: selectedColorTheme.primary }}>
                      {edu.institution}
                    </p>
                    {edu.year && edu.year !== "N/A" && edu.year !== "Year not specified" && (
                      <p className="text-xs text-gray-600">{edu.year}</p>
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