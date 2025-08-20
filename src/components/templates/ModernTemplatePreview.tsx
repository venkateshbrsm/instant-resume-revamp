import React from "react";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Award, BookOpen, Globe, Briefcase, Star } from "lucide-react";

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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-border/50 print:shadow-none print:border-0 flex flex-col lg:flex-row min-h-[600px]">
      {/* Left Sidebar */}
      <div 
        className="w-full lg:w-64 p-4 lg:p-6 text-white"
        style={{
          background: `linear-gradient(180deg, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
        }}
      >
        {/* Profile Photo */}
        <div className="text-center mb-4 lg:mb-6">
          <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-3 lg:mb-4 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
            {enhancedContent.photo ? (
              <img 
                src={enhancedContent.photo} 
                alt={enhancedContent.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-white/70" />
            )}
          </div>
        </div>

        {/* Sidebar Sections */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:space-y-6 lg:gap-0">
          {/* Contact Details */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm tracking-wide uppercase">Contact</h3>
            </div>
            <div className="space-y-2 lg:space-y-3 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <span className="break-all text-xs">{enhancedContent.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span className="text-xs">{enhancedContent.phone}</span>
              </div>
              {enhancedContent.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs">{enhancedContent.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {enhancedContent.skills && enhancedContent.skills.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Star className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm tracking-wide uppercase">Skills</h3>
              </div>
              <div className="space-y-2">
                {enhancedContent.skills.slice(0, 6).map((skill: string, index: number) => (
                  <div key={index} className="text-xs opacity-90">
                    • {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm tracking-wide uppercase">Languages</h3>
            </div>
            <div className="space-y-2 text-xs opacity-90">
              <div>• English (Native)</div>
              <div>• Spanish (Intermediate)</div>
            </div>
          </div>

          {/* Education */}
          {enhancedContent.education && enhancedContent.education.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm tracking-wide uppercase">Education</h3>
              </div>
              <div className="space-y-3">
                {enhancedContent.education.slice(0, 2).map((edu: any, index: number) => (
                  <div key={index} className="text-xs opacity-90">
                    <div className="font-medium">{edu.degree}</div>
                    <div className="text-xs opacity-75">{edu.institution}</div>
                    {edu.year && edu.year !== "N/A" && (
                      <div className="text-xs opacity-75">{edu.year}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            {enhancedContent.name}
          </h1>
          <p className="text-base lg:text-lg text-muted-foreground mb-4">
            {enhancedContent.title}
          </p>
        </div>

        {/* About Section */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4 flex items-center gap-2 lg:gap-3" style={{ color: selectedColorTheme.primary }}>
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: selectedColorTheme.primary }}
            >
              <User className="w-3 h-3" />
            </div>
            About & Professional Summary
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {enhancedContent.summary}
          </p>
        </div>

        {/* Work Experience */}
        {enhancedContent.experience && enhancedContent.experience.length > 0 && (
          <div>
            <h2 className="text-lg lg:text-xl font-bold mb-4 lg:mb-6 flex items-center gap-2 lg:gap-3" style={{ color: selectedColorTheme.primary }}>
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: selectedColorTheme.primary }}
              >
                <Briefcase className="w-3 h-3" />
              </div>
              Work & Related Experience
            </h2>
            
            <div className="space-y-4 lg:space-y-6">
              {enhancedContent.experience.map((exp: any, index: number) => (
                <div key={index} className="border-l-2 pl-4 lg:pl-6 relative" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
                  <div 
                    className="absolute left-[-5px] top-0 w-2 h-2 rounded-full"
                    style={{ backgroundColor: selectedColorTheme.primary }}
                  ></div>
                  
                  <div className="mb-3 lg:mb-4">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-2 gap-2 lg:gap-0">
                      <div>
                        <h3 className="font-bold text-base lg:text-lg text-foreground">{exp.title}</h3>
                        <p className="font-medium text-sm lg:text-base" style={{ color: selectedColorTheme.accent }}>{exp.company}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="text-xs px-2 py-1" 
                        style={{ 
                          backgroundColor: `${selectedColorTheme.primary}10`, 
                          color: selectedColorTheme.primary,
                          borderColor: `${selectedColorTheme.primary}20`
                        }}
                      >
                        {exp.duration}
                      </Badge>
                    </div>
                    
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="space-y-2 text-sm text-muted-foreground mt-3">
                        {exp.achievements.slice(0, 3).map((achievement: string, achIndex: number) => (
                          <li key={achIndex} className="flex items-start gap-2">
                            <span className="font-bold flex-shrink-0 mt-0.5" style={{ color: selectedColorTheme.accent }}>•</span>
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
        )}
      </div>
    </div>
  );
}