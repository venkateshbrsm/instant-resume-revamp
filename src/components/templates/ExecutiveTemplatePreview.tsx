import React from "react";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Award, TrendingUp, Users, Crown, Target, Star } from "lucide-react";

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
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-border/50 max-w-5xl mx-auto">
      {/* Executive Header - Premium Feel */}
      <div 
        className="relative p-8 text-white"
        style={{
          background: `linear-gradient(135deg, ${selectedColorTheme.primary} 0%, ${selectedColorTheme.secondary} 50%, ${selectedColorTheme.accent} 100%)`
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-1">{enhancedContent.name}</h1>
                  <p className="text-xl opacity-95 font-medium">{enhancedContent.title}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm opacity-90">
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
            
            {/* Executive Stats */}
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {enhancedContent.experience?.length || 0}+
                </div>
                <div className="text-sm opacity-90">Years Leadership</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Executive Summary - Premium Focus */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})` }}
            >
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: selectedColorTheme.primary }}>
              Executive Summary
            </h2>
          </div>
          
          <div 
            className="p-6 rounded-xl border-l-4 bg-gradient-to-r from-transparent to-opacity-5"
            style={{ 
              borderColor: selectedColorTheme.primary,
              background: `linear-gradient(135deg, ${selectedColorTheme.primary}03, ${selectedColorTheme.accent}08)`
            }}
          >
            <p className="text-lg leading-relaxed text-muted-foreground">
              {enhancedContent.summary}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Experience Column */}
          <div className="lg:col-span-2">
            {enhancedContent.experience && enhancedContent.experience.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${selectedColorTheme.secondary}, ${selectedColorTheme.accent})` }}
                  >
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: selectedColorTheme.primary }}>
                    Leadership Experience
                  </h2>
                </div>
                
                <div className="space-y-6">
                  {enhancedContent.experience.map((exp: any, index: number) => (
                    <div 
                      key={index}
                      className="relative p-6 rounded-xl border shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-r from-white to-opacity-5"
                      style={{ 
                        borderColor: `${selectedColorTheme.primary}20`,
                        background: `linear-gradient(135deg, white 0%, ${selectedColorTheme.primary}02 100%)`
                      }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-1">{exp.title}</h3>
                          <p className="text-lg font-semibold" style={{ color: selectedColorTheme.primary }}>
                            {exp.company}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            className="px-4 py-2 text-white font-medium shadow-md"
                            style={{ background: `linear-gradient(135deg, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})` }}
                          >
                            {exp.duration}
                          </Badge>
                        </div>
                      </div>
                      
                      {exp.achievements && exp.achievements.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Star className="w-4 h-4" style={{ color: selectedColorTheme.accent }} />
                            Key Achievements
                          </h4>
                          <div className="grid gap-3">
                            {exp.achievements.slice(0, 4).map((achievement: string, achIndex: number) => (
                              <div key={achIndex} className="flex items-start gap-3">
                                <div 
                                  className="w-6 h-6 rounded-full flex items-center justify-center mt-1 flex-shrink-0"
                                  style={{ background: `linear-gradient(135deg, ${selectedColorTheme.accent}, ${selectedColorTheme.primary})` }}
                                >
                                  <span className="text-white text-xs font-bold">✓</span>
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground font-medium">
                                  {achievement}
                                </p>
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

          {/* Executive Sidebar */}
          <div className="space-y-6">
            {/* Core Competencies */}
            {enhancedContent.skills && enhancedContent.skills.length > 0 && (
              <div 
                className="p-6 rounded-xl shadow-lg border"
                style={{ 
                  borderColor: `${selectedColorTheme.primary}20`,
                  background: `linear-gradient(135deg, ${selectedColorTheme.primary}05, ${selectedColorTheme.accent}10)`
                }}
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: selectedColorTheme.primary }}>
                  <Users className="w-5 h-5" />
                  Core Competencies
                </h3>
                
                <div className="space-y-3">
                  {enhancedContent.skills.slice(0, 8).map((skill: string, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{skill}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className="w-3 h-3"
                            style={{ 
                              color: star <= 4 ? selectedColorTheme.accent : '#e5e7eb',
                              fill: star <= 4 ? selectedColorTheme.accent : 'transparent'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Executive Metrics */}
            <div 
              className="p-6 rounded-xl shadow-lg text-center border"
              style={{ 
                borderColor: `${selectedColorTheme.secondary}20`,
                background: `linear-gradient(135deg, ${selectedColorTheme.secondary}08, ${selectedColorTheme.primary}10)`
              }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: selectedColorTheme.primary }}>
                Leadership Impact
              </h3>
              
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-white/50">
                  <div className="text-2xl font-bold" style={{ color: selectedColorTheme.primary }}>
                    {enhancedContent.experience?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Leadership Roles</p>
                </div>
                
                <div className="p-3 rounded-lg bg-white/50">
                  <div className="text-2xl font-bold" style={{ color: selectedColorTheme.accent }}>
                    {enhancedContent.skills?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Core Competencies</p>
                </div>
              </div>
            </div>

            {/* Education - Executive Style */}
            {enhancedContent.education && enhancedContent.education.length > 0 && (
              <div 
                className="p-6 rounded-xl shadow-lg border"
                style={{ 
                  borderColor: `${selectedColorTheme.accent}20`,
                  background: `linear-gradient(135deg, ${selectedColorTheme.accent}05, ${selectedColorTheme.secondary}08)`
                }}
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: selectedColorTheme.primary }}>
                  <Award className="w-5 h-5" />
                  Executive Education
                </h3>
                
                <div className="space-y-4">
                  {enhancedContent.education.map((edu: any, index: number) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg bg-white/70 border-l-4"
                      style={{ borderColor: selectedColorTheme.accent }}
                    >
                      <h4 className="font-bold text-foreground text-sm">{edu.degree}</h4>
                      <p className="font-semibold text-sm" style={{ color: selectedColorTheme.primary }}>
                        {edu.institution}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">{edu.year}</p>
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