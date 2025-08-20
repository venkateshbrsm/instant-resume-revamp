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
  // Debug logging to check for N/A values
  console.log('CreativeTemplate - Education data:', enhancedContent.education);
  return (
    <div 
      className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/50 max-w-4xl mx-auto print:shadow-none print:border-0 print:rounded-none print:overflow-visible print:max-w-none print:mx-0 print:bg-white"
      style={{
        pageBreakInside: 'avoid',
        breakInside: 'avoid'
      }}
    >
      {/* Creative Header with Diagonal Design */}
      <div 
        className="relative overflow-hidden print:break-inside-avoid print:page-break-inside-avoid" 
        style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
      >
        <div 
          className="h-32 sm:h-40 flex items-center justify-center text-white relative print:h-24 print:break-inside-avoid"
          style={{
            background: `linear-gradient(135deg, ${selectedColorTheme.primary} 0%, ${selectedColorTheme.accent} 70%, ${selectedColorTheme.secondary} 100%)`,
            pageBreakInside: 'avoid'
          }}
        >
          {/* Geometric Background Pattern */}
          <div className="absolute inset-0 opacity-20 print:opacity-10">
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 w-12 h-12 sm:w-16 sm:h-16 border-2 border-white rounded-full print:hidden"></div>
            <div className="absolute top-4 sm:top-8 right-4 sm:right-8 w-8 h-8 sm:w-12 sm:h-12 border-2 border-white transform rotate-45 print:hidden"></div>
            <div className="absolute bottom-2 sm:bottom-4 left-1/4 w-6 h-6 sm:w-8 sm:h-8 bg-white opacity-30 rounded-full print:hidden"></div>
          </div>
          
          <div className="relative z-10 text-center px-4">
            <div className="flex flex-col sm:flex-row items-center justify-center mb-3 sm:mb-4 print:mb-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 sm:mb-0 sm:mr-4 overflow-hidden print:w-12 print:h-12 print:mb-2 print:sm:mb-0">
                {enhancedContent.photo ? (
                  <img 
                    src={enhancedContent.photo} 
                    alt={enhancedContent.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-white print:w-6 print:h-6" />
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold print:text-xl">{enhancedContent.name}</h1>
                <p className="text-base sm:text-xl opacity-90 print:text-sm">{enhancedContent.title}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center sm:space-x-6 space-y-1 sm:space-y-0 text-xs sm:text-sm print:flex-col print:space-x-0 print:space-y-1 print:text-xs">
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 print:w-3 print:h-3" />
                <span className="break-all">{enhancedContent.email}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 print:w-3 print:h-3" />
                <span>{enhancedContent.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 print:p-4">
        {/* Main Content in Single Column for Print */}
        <div className="print:space-y-6">
          
          {/* Creative Summary with Icon */}
          <div 
            className="relative mb-6 print:mb-4 print:break-inside-avoid print:page-break-inside-avoid" 
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
          >
            <div className="flex items-start gap-4 print:gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg print:w-10 print:h-10 print:shadow-none"
                style={{ background: `linear-gradient(135deg, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})` }}
              >
                <Sparkles className="w-6 h-6 print:w-5 print:h-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3 print:text-xl print:mb-2" style={{ color: selectedColorTheme.primary }}>
                  Creative Vision
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground print:text-sm print:leading-normal">
                  {enhancedContent.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Grid Layout for Large Screens, Single Column for Print */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:gap-4 print:grid-cols-1">
            {/* Main Content - Experience */}
            <div className="lg:col-span-2 space-y-6 print:space-y-4 print:col-span-1">
              {/* Experience with Creative Cards */}
              {enhancedContent.experience && enhancedContent.experience.length > 0 && (
                <div 
                  className="print:break-inside-avoid print:page-break-inside-avoid" 
                  style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                >
                  <div className="flex items-center gap-4 mb-6 print:mb-4 print:gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg print:w-10 print:h-10 print:shadow-none"
                      style={{ background: `linear-gradient(135deg, ${selectedColorTheme.accent}, ${selectedColorTheme.secondary})` }}
                    >
                      <TrendingUp className="w-6 h-6 print:w-5 print:h-5" />
                    </div>
                    <h2 className="text-2xl font-bold print:text-xl" style={{ color: selectedColorTheme.primary }}>
                      Experience Journey
                    </h2>
                  </div>
                  
                  <div className="space-y-6 print:space-y-4">
                    {enhancedContent.experience.map((exp: any, index: number) => (
                      <div 
                        key={index} 
                        className="relative p-6 rounded-2xl border-l-4 shadow-md print:break-inside-avoid print:page-break-inside-avoid print:shadow-none print:border-l-2 print:p-4 print:mb-6 print:rounded-lg"
                        style={{ 
                          background: `linear-gradient(135deg, ${selectedColorTheme.primary}05, ${selectedColorTheme.accent}10)`,
                          borderColor: selectedColorTheme.accent,
                          pageBreakInside: 'avoid',
                          breakInside: 'avoid'
                        }}
                      >
                        <div className="flex flex-col gap-3 mb-4 print:mb-2">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 print:flex-col print:gap-2">
                            <div>
                              <h3 className="text-xl font-bold text-foreground print:text-lg">{exp.title}</h3>
                              <p className="text-lg font-semibold print:text-base" style={{ color: selectedColorTheme.accent }}>
                                {exp.company}
                              </p>
                            </div>
                            <Badge 
                              className="px-4 py-2 rounded-full text-white shadow-md print:px-3 print:py-1 print:shadow-none print:text-xs print:self-start"
                              style={{ background: `linear-gradient(135deg, ${selectedColorTheme.secondary}, ${selectedColorTheme.accent})` }}
                            >
                              {exp.duration}
                            </Badge>
                          </div>
                        </div>
                        
                        {exp.achievements && exp.achievements.length > 0 && (
                          <div 
                            className="space-y-3 print:space-y-2" 
                            style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                          >
                            {exp.achievements.map((achievement: string, achIndex: number) => (
                              <div 
                                key={achIndex} 
                                className="flex items-start gap-3 print:gap-2 print:break-inside-avoid" 
                                style={{ pageBreakInside: 'avoid' }}
                              >
                                <div 
                                  className="w-6 h-6 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 print:w-4 print:h-4"
                                  style={{ background: `linear-gradient(135deg, ${selectedColorTheme.accent}, ${selectedColorTheme.primary})` }}
                                >
                                  <span className="text-white text-xs font-bold">✓</span>
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground print:text-xs print:leading-normal">{achievement}</p>
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
            <div className="space-y-5 print:space-y-4 print:col-span-1">
              {/* Skills as Creative Badges */}
              {enhancedContent.skills && enhancedContent.skills.length > 0 && (
                <div 
                  className="p-6 rounded-2xl shadow-lg print:shadow-none print:break-inside-avoid print:p-4 print:rounded-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${selectedColorTheme.primary}08, ${selectedColorTheme.accent}15)`,
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid'
                  }}
                >
                  <div className="flex items-center gap-3 mb-4 print:mb-3 print:gap-2">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white print:w-8 print:h-8"
                      style={{ background: `linear-gradient(135deg, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})` }}
                    >
                      <Brush className="w-5 h-5 print:w-4 print:h-4" />
                    </div>
                    <h3 className="text-lg font-bold print:text-base" style={{ color: selectedColorTheme.primary }}>
                      Creative Skills
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 print:gap-1">
                    {enhancedContent.skills.map((skill: string, index: number) => (
                      <Badge 
                        key={index}
                        variant="outline"
                        className="px-3 py-1 rounded-full border-2 font-medium print:px-2 print:py-0.5 print:text-xs"
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
                className="p-6 rounded-2xl shadow-lg text-center print:p-4 print:shadow-none print:rounded-lg print:break-inside-avoid"
                style={{ 
                  background: `linear-gradient(135deg, ${selectedColorTheme.accent}10, ${selectedColorTheme.secondary}15)`,
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid'
                }}
              >
                <h3 className="text-lg font-bold mb-4 print:text-base print:mb-3" style={{ color: selectedColorTheme.primary }}>
                  Portfolio Stats
                </h3>
                
                <div className="space-y-4 print:space-y-2">
                  <div>
                    <div className="text-3xl font-bold print:text-2xl" style={{ color: selectedColorTheme.primary }}>
                      {enhancedContent.skills?.length || 0}
                    </div>
                    <p className="text-sm text-muted-foreground print:text-xs">Creative Skills</p>
                  </div>
                  
                  <div>
                    <div className="text-3xl font-bold print:text-2xl" style={{ color: selectedColorTheme.accent }}>
                      {enhancedContent.experience?.length || 0}
                    </div>
                    <p className="text-sm text-muted-foreground print:text-xs">Projects</p>
                  </div>
                </div>
              </div>

              {/* Education with Creative Touch */}
              {enhancedContent.education && enhancedContent.education.length > 0 && (
                <div 
                  className="p-6 rounded-2xl shadow-lg print:p-4 print:shadow-none print:rounded-lg print:break-inside-avoid"
                  style={{ 
                    background: `linear-gradient(135deg, ${selectedColorTheme.secondary}08, ${selectedColorTheme.primary}10)`,
                    pageBreakInside: 'avoid',
                    breakInside: 'avoid'
                  }}
                >
                  <div className="flex items-center gap-3 mb-4 print:mb-3 print:gap-2">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white print:w-8 print:h-8"
                      style={{ background: `linear-gradient(135deg, ${selectedColorTheme.secondary}, ${selectedColorTheme.primary})` }}
                    >
                      <Award className="w-5 h-5 print:w-4 print:h-4" />
                    </div>
                    <h3 className="text-lg font-bold print:text-base" style={{ color: selectedColorTheme.primary }}>
                      Education
                    </h3>
                  </div>
                  
                  <div className="space-y-4 print:space-y-2">
                    {enhancedContent.education.map((edu: any, index: number) => (
                      <div 
                        key={index}
                        className="p-4 rounded-xl border-l-4 print:p-3 print:rounded-lg print:break-inside-avoid"
                        style={{ 
                          background: 'white',
                          borderColor: selectedColorTheme.accent,
                          pageBreakInside: 'avoid',
                          breakInside: 'avoid'
                        }}
                      >
                        <h4 className="font-bold text-foreground text-sm print:text-xs">{edu.degree}</h4>
                        <p className="font-medium text-sm print:text-xs" style={{ color: selectedColorTheme.accent }}>
                          {edu.institution}
                        </p>
                         {edu.year && edu.year !== "N/A" && edu.year !== "Year not specified" && (
                           <p className="text-xs text-muted-foreground mt-1">{edu.year}</p>
                         )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}