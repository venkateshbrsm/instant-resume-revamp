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
      {/* Modern Header with Gradient - Matching PDF layout exactly */}
      <div 
        className="relative p-6 text-white overflow-hidden"
        style={{
          background: `linear-gradient(to right, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
        }}
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold mb-2 leading-tight">
            {enhancedContent.name || 'Enhanced Resume'}
          </h1>
          <div className="text-lg mb-4 opacity-95 font-medium">
            {enhancedContent.title || 'Professional'}
          </div>
          <div className="text-sm opacity-90 font-medium">
            {enhancedContent.email || 'email@example.com'} • {enhancedContent.phone || '+1 (555) 123-4567'}
          </div>
          <div className="text-sm opacity-90 font-medium mt-1">
            {enhancedContent.location || 'City, Country'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6 p-6">
        {/* Main Content Column - matches PDF 1.4fr proportion */}
        <div className="col-span-3 space-y-6">
          {/* Professional Summary with Icon */}
          <div className="section">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xl"
                style={{
                  background: `linear-gradient(to right, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
                }}
              >
                👤
              </div>
              <h3 className="text-lg font-bold" style={{ color: selectedColorTheme.primary }}>Professional Summary</h3>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm leading-relaxed text-gray-700">
                {enhancedContent.summary || 'Dynamic and results-driven professional with extensive experience in delivering innovative solutions and driving organizational success.'}
              </p>
            </div>
          </div>

          {/* Experience Timeline - matches PDF exactly */}
          {enhancedContent.experience && enhancedContent.experience.length > 0 && (
            <div className="section">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xl"
                  style={{
                    background: `linear-gradient(to right, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
                  }}
                >
                  💼
                </div>
                <h3 className="text-lg font-bold" style={{ color: selectedColorTheme.primary }}>Professional Experience</h3>
              </div>
              <div className="relative pl-6">
                {enhancedContent.experience.map((exp: any, index: number) => (
                  <div key={index} className="relative mb-6 last:mb-0">
                    {/* Timeline dot */}
                    <div 
                      className="absolute left-[-21px] top-4 w-3 h-3 rounded-full border-2 border-white shadow-lg"
                      style={{ 
                        backgroundColor: selectedColorTheme.accent,
                        boxShadow: `0 0 0 2px ${selectedColorTheme.accent}30`
                      }}
                    ></div>
                    
                    {/* Experience card */}
                    <div 
                      className="p-4 rounded-lg border-l-2"
                      style={{ 
                        background: `linear-gradient(to right, ${selectedColorTheme.accent}08, ${selectedColorTheme.primary}08)`,
                        borderLeftColor: `${selectedColorTheme.accent}30`
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-base text-gray-900">{exp.title || 'Position Title'}</h4>
                          <p className="font-semibold text-base" style={{ color: selectedColorTheme.accent }}>{exp.company || 'Company Name'}</p>
                        </div>
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-semibold border"
                          style={{ 
                            backgroundColor: `${selectedColorTheme.accent}10`, 
                            color: selectedColorTheme.accent,
                            borderColor: `${selectedColorTheme.accent}20`
                          }}
                        >
                          {exp.duration || 'Date Range'}
                        </span>
                      </div>
                      
                      {exp.achievements && exp.achievements.length > 0 ? (
                        <ul className="space-y-2">
                          {exp.achievements.map((achievement: string, achIndex: number) => (
                            <li key={achIndex} className="flex items-start gap-3 text-sm leading-relaxed p-2 bg-white/50 rounded">
                              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex-shrink-0 mt-1"></div>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="space-y-2">
                          <li className="flex items-start gap-3 text-sm leading-relaxed p-2 bg-white/50 rounded">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex-shrink-0 mt-1"></div>
                            <span>Delivered exceptional results and exceeded performance expectations</span>
                          </li>
                          <li className="flex items-start gap-3 text-sm leading-relaxed p-2 bg-white/50 rounded">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex-shrink-0 mt-1"></div>
                            <span>Collaborated effectively with cross-functional teams to achieve strategic objectives</span>
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - matches PDF 0.6fr proportion */}
        <div className="col-span-2 space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-3">
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${selectedColorTheme.primary}08` }}>
              <div className="text-2xl font-bold" style={{ color: selectedColorTheme.primary }}>
                {enhancedContent.skills?.length || '12'}
              </div>
              <p className="text-xs text-gray-600 mt-1">Total Skills</p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${selectedColorTheme.accent}08` }}>
              <div className="text-2xl font-bold" style={{ color: selectedColorTheme.accent }}>
                {enhancedContent.experience?.length || '3'}
              </div>
              <p className="text-xs text-gray-600 mt-1">Work Experiences</p>
            </div>
          </div>

          {/* Skills with Progress Bars - matching PDF exactly */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xl"
                style={{
                  background: `linear-gradient(to right, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
                }}
              >
                ⚡
              </div>
              <h3 className="text-lg font-bold" style={{ color: selectedColorTheme.primary }}>Skills Proficiency</h3>
            </div>
            <div className="space-y-4">
              {enhancedContent.skills && enhancedContent.skills.length > 0 ? (
                enhancedContent.skills.slice(0, 6).map((skill: string, index: number) => {
                  const proficiency = 75 + (skill.length % 20);
                  return (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-900">{skill}</span>
                        <span className="text-gray-500">{Math.round(proficiency)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-sm h-1">
                        <div 
                          className="h-1 rounded-sm transition-all duration-500"
                          style={{ 
                            width: `${proficiency}%`,
                            background: `linear-gradient(90deg, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-900">Communication</span>
                    <span className="text-gray-500">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-sm h-1">
                    <div 
                      className="h-1 rounded-sm"
                      style={{ 
                        width: '92%',
                        background: `linear-gradient(90deg, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Education - matching PDF exactly */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xl"
                style={{
                  background: `linear-gradient(to right, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
                }}
              >
                🎓
              </div>
              <h3 className="text-lg font-bold" style={{ color: selectedColorTheme.primary }}>Education</h3>
            </div>
            {enhancedContent.education && enhancedContent.education.length > 0 ? (
              enhancedContent.education.map((edu: any, index: number) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg border mb-2 last:mb-0"
                  style={{ 
                    background: `linear-gradient(to right, ${selectedColorTheme.primary}08, ${selectedColorTheme.accent}08)`,
                    borderColor: `${selectedColorTheme.primary}10`
                  }}
                >
                  <h4 className="font-bold text-gray-900 text-base">{edu.degree || "Bachelor's Degree"}</h4>
                  <p className="font-semibold text-sm" style={{ color: selectedColorTheme.accent }}>{edu.institution || "University Name"}</p>
                  {edu.year && edu.year !== "N/A" && edu.year !== "Year not specified" && (
                    <p className="text-xs text-gray-600 mt-1">{edu.year}</p>
                  )}
                </div>
              ))
            ) : (
              <div 
                className="p-4 rounded-lg border"
                style={{ 
                  background: `linear-gradient(to right, ${selectedColorTheme.primary}08, ${selectedColorTheme.accent}08)`,
                  borderColor: `${selectedColorTheme.primary}10`
                }}
              >
                <h4 className="font-bold text-gray-900 text-base">Bachelor's Degree</h4>
                <p className="font-semibold text-sm" style={{ color: selectedColorTheme.accent }}>University Name</p>
                <p className="text-xs text-gray-600 mt-1">2020</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}