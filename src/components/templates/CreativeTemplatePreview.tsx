import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Mail, Phone, Award, TrendingUp, Users, Palette, Brush, Sparkles } from "lucide-react";

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
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/50 max-w-4xl mx-auto print:shadow-none print:border-0 print:rounded-lg print:overflow-visible">
      {/* Creative Header with Diagonal Design */}
      <div className="relative overflow-hidden print:break-inside-avoid">
        <div 
          className="h-40 flex items-center justify-center text-white relative print:h-32"
          style={{
            background: `linear-gradient(135deg, ${selectedColorTheme.primary} 0%, ${selectedColorTheme.accent} 70%, ${selectedColorTheme.secondary} 100%)`
          }}
        >
          {/* Geometric Background Pattern */}
          <div className="absolute inset-0 opacity-20 print:opacity-10">
            <div className="absolute top-4 left-4 w-16 h-16 border-2 border-white rounded-full print:hidden"></div>
            <div className="absolute top-8 right-8 w-12 h-12 border-2 border-white transform rotate-45 print:hidden"></div>
            <div className="absolute bottom-4 left-1/4 w-8 h-8 bg-white opacity-30 rounded-full print:hidden"></div>
          </div>
          
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">{enhancedContent.name}</h1>
                <p className="text-xl opacity-90">{enhancedContent.title}</p>
              </div>
            </div>
            
            <div className="flex justify-center space-x-6 text-sm">
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
        </div>
      </div>

      <div className="p-6 print:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:gap-4">
          {/* Main Content - Larger Column */}
          <div className="lg:col-span-2 space-y-6 print:space-y-4">
            {/* Creative Summary with Icon */}
            <div className="relative print:break-inside-avoid">
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})` }}
                >
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-3" style={{ color: selectedColorTheme.primary }}>
                    Creative Vision
                  </h2>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {enhancedContent.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Experience with Creative Cards */}
            {enhancedContent.experience && enhancedContent.experience.length > 0 && (
              <div className="print:break-inside-avoid">
                <div className="flex items-center gap-4 mb-6">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${selectedColorTheme.accent}, ${selectedColorTheme.secondary})` }}
                  >
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: selectedColorTheme.primary }}>
                    Experience Journey
                  </h2>
                </div>
                
                <div className="space-y-6">
                  {enhancedContent.experience.map((exp: any, index: number) => (
                    <div 
                      key={index} 
                      className="relative p-6 rounded-2xl border-l-4 shadow-md hover:shadow-lg transition-shadow print:break-inside-avoid print:shadow-none print:border-l-2"
                      style={{ 
                        background: `linear-gradient(135deg, ${selectedColorTheme.primary}05, ${selectedColorTheme.accent}10)`,
                        borderColor: selectedColorTheme.accent
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{exp.title}</h3>
                          <p className="text-lg font-semibold" style={{ color: selectedColorTheme.accent }}>
                            {exp.company}
                          </p>
                        </div>
                        <Badge 
                          className="px-4 py-2 rounded-full text-white shadow-md"
                          style={{ background: `linear-gradient(135deg, ${selectedColorTheme.secondary}, ${selectedColorTheme.accent})` }}
                        >
                          {exp.duration}
                        </Badge>
                      </div>
                      
                      {exp.achievements && exp.achievements.length > 0 && (
                        <div className="space-y-3">
                          {exp.achievements.slice(0, 3).map((achievement: string, achIndex: number) => (
                            <div key={achIndex} className="flex items-start gap-3">
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0"
                                style={{ background: `linear-gradient(135deg, ${selectedColorTheme.accent}, ${selectedColorTheme.primary})` }}
                              >
                                <span className="text-white text-xs font-bold">✓</span>
                              </div>
                              <p className="text-sm leading-relaxed text-muted-foreground">{achievement}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Creative Sidebar */}
          <div className="space-y-5 print:space-y-3 print:break-inside-avoid">
            {/* Skills as Creative Badges */}
            {enhancedContent.skills && enhancedContent.skills.length > 0 && (
              <div 
                className="p-6 rounded-2xl shadow-lg print:shadow-none print:break-inside-avoid"
                style={{ background: `linear-gradient(135deg, ${selectedColorTheme.primary}08, ${selectedColorTheme.accent}15)` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ background: `linear-gradient(135deg, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})` }}
                  >
                    <Brush className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: selectedColorTheme.primary }}>
                    Creative Skills
                  </h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {enhancedContent.skills.map((skill: string, index: number) => (
                    <Badge 
                      key={index}
                      variant="outline"
                      className="px-3 py-1 rounded-full border-2 font-medium hover:shadow-md transition-shadow"
                      style={{ 
                        borderColor: selectedColorTheme.accent,
                        color: selectedColorTheme.primary,
                        background: 'white'
                      }}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Creative Stats */}
            <div 
              className="p-6 rounded-2xl shadow-lg text-center"
              style={{ background: `linear-gradient(135deg, ${selectedColorTheme.accent}10, ${selectedColorTheme.secondary}15)` }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: selectedColorTheme.primary }}>
                Portfolio Stats
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold" style={{ color: selectedColorTheme.primary }}>
                    {enhancedContent.skills?.length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Creative Skills</p>
                </div>
                
                <div>
                  <div className="text-3xl font-bold" style={{ color: selectedColorTheme.accent }}>
                    {enhancedContent.experience?.length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Projects</p>
                </div>
              </div>
            </div>

            {/* Education with Creative Touch */}
            {enhancedContent.education && enhancedContent.education.length > 0 && (
              <div 
                className="p-6 rounded-2xl shadow-lg"
                style={{ background: `linear-gradient(135deg, ${selectedColorTheme.secondary}08, ${selectedColorTheme.primary}10)` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ background: `linear-gradient(135deg, ${selectedColorTheme.secondary}, ${selectedColorTheme.primary})` }}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: selectedColorTheme.primary }}>
                    Education
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {enhancedContent.education.map((edu: any, index: number) => (
                    <div 
                      key={index}
                      className="p-4 rounded-xl border-l-4"
                      style={{ 
                        background: 'white',
                        borderColor: selectedColorTheme.accent
                      }}
                    >
                      <h4 className="font-bold text-foreground text-sm">{edu.degree}</h4>
                      <p className="font-medium text-sm" style={{ color: selectedColorTheme.accent }}>
                        {edu.institution}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{edu.year}</p>
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