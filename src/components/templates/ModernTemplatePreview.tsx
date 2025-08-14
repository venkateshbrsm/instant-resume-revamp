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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-border/50 print:shadow-none print:border-0">
      {/* Modern Header with Gradient */}
      <div 
        className="relative rounded-lg sm:rounded-xl p-4 mb-4 text-white overflow-hidden print:p-3 print:mb-3"
        style={{
          background: `linear-gradient(to right, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
        }}
      >
        <div className="relative z-10">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
            {enhancedContent.name}
          </h1>
          <p className="text-sm sm:text-base md:text-lg mb-2 sm:mb-4 opacity-90">
            {enhancedContent.title}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm opacity-80">
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span className="break-all">{enhancedContent.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{enhancedContent.phone}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 print:gap-3 print:p-3">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-4 print:space-y-3">
          {/* Professional Summary with Icon */}
          <div className="flex items-start gap-3">
            <div 
              className="w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 rounded-lg flex items-center justify-center text-white"
              style={{
                background: `linear-gradient(to right, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
              }}
            >
              <Users className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold" style={{ color: selectedColorTheme.primary }}>Professional Summary</h3>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1 sm:mt-2 leading-relaxed">
                {enhancedContent.summary}
              </p>
            </div>
          </div>

          {/* Experience Timeline */}
          {enhancedContent.experience && enhancedContent.experience.length > 0 && (
            <div className="flex items-start gap-3">
              <div 
                className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg flex items-center justify-center text-white"
                style={{
                  background: `linear-gradient(to right, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
                }}
              >
                <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg md:text-xl font-bold" style={{ color: selectedColorTheme.primary }}>Professional Experience</h3>
                <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
                  {enhancedContent.experience.map((exp: any, index: number) => (
                    <div key={index} className="relative pl-6 sm:pl-8 border-l-2 last:border-l-0" style={{ borderColor: `${selectedColorTheme.accent}30` }}>
                      <div 
                        className="absolute left-[-6px] sm:left-[-9px] top-0 w-3 sm:w-4 h-3 sm:h-4 rounded-full border-2 border-white shadow-lg"
                        style={{ backgroundColor: selectedColorTheme.accent }}
                      ></div>
                      
                      <div 
                        className="rounded-lg p-3 sm:p-4 md:p-6 ml-2 sm:ml-4"
                        style={{ 
                          background: `linear-gradient(to right, ${selectedColorTheme.accent}08, ${selectedColorTheme.primary}08)` 
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2 mb-2 sm:mb-3">
                          <div>
                            <h4 className="font-bold text-sm sm:text-base md:text-lg text-foreground break-words">{exp.title}</h4>
                            <p className="font-semibold text-base sm:text-lg break-words" style={{ color: selectedColorTheme.accent }}>{exp.company}</p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-xs px-2 py-1 border flex-shrink-0" 
                            style={{ 
                              backgroundColor: `${selectedColorTheme.accent}10`, 
                              color: selectedColorTheme.accent,
                              borderColor: `${selectedColorTheme.accent}20`
                            }}
                          >
                            {exp.duration}
                          </Badge>
                        </div>
                        
                        {exp.achievements && exp.achievements.length > 0 && (
                          <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground print:keep-together">
                            {exp.achievements.slice(0, 3).map((achievement: string, achIndex: number) => (
                              <li key={achIndex} className="flex items-start gap-2">
                                <span className="text-accent font-bold flex-shrink-0 mt-0.5">▸</span>
                                <span className="leading-relaxed">{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 print:space-y-3">
          {/* Skills with Progress Bars */}
          {enhancedContent.skills && enhancedContent.skills.length > 0 && (
            <div className="bg-card rounded-xl p-4 sm:p-6 shadow-lg border border-border/50">
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: selectedColorTheme.primary }}>
                <Zap className="w-4 sm:w-5 h-4 sm:h-5" />
                Skills Proficiency
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {enhancedContent.skills.slice(0, 6).map((skill: string, index: number) => {
                  const proficiency = 75 + (skill.length % 20);
                  return (
                    <div key={index}>
                      <div className="flex justify-between text-xs sm:text-sm mb-1">
                        <span className="font-medium">{skill}</span>
                        <span className="text-muted-foreground">{proficiency}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${proficiency}%`,
                            background: `linear-gradient(90deg, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stats Overview */}
          {enhancedContent.skills && enhancedContent.skills.length > 0 && (
            <div className="bg-card rounded-xl p-4 sm:p-6 shadow-lg border border-border/50">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: selectedColorTheme.primary }}>
                <TrendingUp className="w-5 h-5" />
                Skills Overview
              </h3>
              
              <div className="space-y-3">
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: `${selectedColorTheme.primary}08` }}>
                  <div className="text-2xl font-bold" style={{ color: selectedColorTheme.primary }}>
                    {enhancedContent.skills.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Skills</p>
                </div>
                
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: `${selectedColorTheme.accent}08` }}>
                  <div className="text-2xl font-bold" style={{ color: selectedColorTheme.accent }}>
                    {enhancedContent.experience?.length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Work Experiences</p>
                </div>
                
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: `${selectedColorTheme.secondary}08` }}>
                  <div className="text-2xl font-bold" style={{ color: selectedColorTheme.secondary }}>
                    {enhancedContent.education?.length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Educational Qualifications</p>
                </div>
              </div>
            </div>
          )}

          {/* Education */}
          {enhancedContent.education && enhancedContent.education.length > 0 && (
            <div className="bg-card rounded-xl p-6 shadow-lg border border-border/50">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: selectedColorTheme.primary }}>
                <Award className="w-5 h-5" />
                Education
              </h3>
              <div className="space-y-4">
                {enhancedContent.education.map((edu: any, index: number) => (
                  <div 
                    key={index} 
                    className="rounded-lg p-4 border"
                    style={{ 
                      background: `linear-gradient(to right, ${selectedColorTheme.primary}08, ${selectedColorTheme.accent}08)`,
                      borderColor: `${selectedColorTheme.primary}10`
                    }}
                  >
                     <h4 className="font-bold text-foreground text-base">{edu.degree}</h4>
                     <p className="font-medium" style={{ color: selectedColorTheme.accent }}>{edu.institution}</p>
                     {edu.year && edu.year !== "N/A" && edu.year !== "Year not specified" && (
                       <p className="text-sm text-muted-foreground mt-1">{edu.year}</p>
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