import React from "react";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Award, BookOpen, Globe, Briefcase, Star } from "lucide-react";
import { BasicResumeData } from "@/lib/basicResumeParser";

interface BasicResumePreviewProps {
  resumeData: BasicResumeData;
  selectedColorTheme: {
    id: string;
    name: string;
    primary: string;
    secondary: string;
    accent: string;
  };
  templateLayout?: string;
}

export function BasicResumePreview({ resumeData, selectedColorTheme, templateLayout = 'modern' }: BasicResumePreviewProps) {
  
  // Modern template layout (same structure as ModernTemplatePreview but with basic data)
  if (templateLayout === 'modern') {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-visible border border-border/50 print:shadow-none print:border-0 flex flex-col md:flex-row min-h-[600px]" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
        {/* Left Sidebar */}
        <div 
          className="w-full md:w-64 p-4 md:p-6 text-white"
          style={{
            background: `linear-gradient(180deg, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
          }}
        >
          {/* Sidebar Sections */}
          <div className="space-y-4 md:space-y-6">
            {/* Contact Details */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm tracking-wide uppercase">Contact</h3>
              </div>
              <div className="space-y-3 text-sm opacity-90">
                {resumeData.email && (
                  <div className="flex items-start gap-2">
                    <Mail className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="break-words text-xs no-underline leading-relaxed">{resumeData.email}</span>
                  </div>
                )}
                {resumeData.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="text-xs no-underline break-words leading-relaxed">{resumeData.phone}</span>
                  </div>
                )}
                {resumeData.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="text-xs break-words leading-relaxed">{resumeData.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {resumeData.skills && resumeData.skills.length > 0 && (
              <div className="page-break-avoid section">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm tracking-wide uppercase">Skills</h3>
                </div>
                <div className="space-y-2">
                  {resumeData.skills.slice(0, 12).map((skill: string, index: number) => (
                     <div key={index} className="text-xs opacity-90 flex items-center gap-2 page-break-avoid skill-item overflow-visible" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                       <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                       <span className="font-medium break-words whitespace-normal">{skill}</span>
                     </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resumeData.education && resumeData.education.length > 0 && (
              <div className="page-break-avoid section">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm tracking-wide uppercase">Education</h3>
                </div>
                <div className="space-y-3">
                  {resumeData.education.slice(0, 2).map((edu: any, index: number) => (
                    <div key={index} className="text-xs opacity-90 page-break-avoid education-item">
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
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 overflow-visible break-words whitespace-normal" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
              {resumeData.name || 'Professional Name'}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-4 overflow-visible break-words whitespace-normal" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
              {resumeData.title || 'Professional Title'}
            </p>
          </div>

          {/* About Section */}
          {resumeData.summary && (
            <div className="mb-6 md:mb-8 page-break-avoid section">
              <div 
                className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg text-white"
                style={{ 
                  background: `linear-gradient(135deg, ${selectedColorTheme.primary}, ${selectedColorTheme.accent})`
                }}
              >
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center bg-white/20">
                  <User className="w-3 h-3" />
                </div>
                <span className="text-sm md:text-base">PROFESSIONAL SUMMARY</span>
              </div>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed break-words whitespace-normal">
                {resumeData.summary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {resumeData.experience && resumeData.experience.length > 0 && (
            <div className="page-break-before section">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3" style={{ color: selectedColorTheme.primary }}>
                <div 
                  className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: selectedColorTheme.primary }}
                >
                  <Briefcase className="w-3 h-3" />
                </div>
                <span className="text-sm md:text-base">Professional Experience</span>
              </h2>
              
              <div className="space-y-4 md:space-y-6">
                {resumeData.experience.map((exp: any, index: number) => (
                   <div key={index} className="border-l-2 pl-4 md:pl-6 relative page-break-avoid experience-item print:break-inside-avoid print:mb-6 overflow-visible" style={{ borderColor: `${selectedColorTheme.primary}20`, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                     <div 
                       className="absolute left-[-5px] top-0 w-2 h-2 rounded-full"
                       style={{ backgroundColor: selectedColorTheme.primary }}
                     ></div>
                    
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-base md:text-lg text-foreground">{exp.title}</h3>
                          <p className="font-medium text-sm md:text-base" style={{ color: selectedColorTheme.accent }}>{exp.company}</p>
                        </div>
                         <Badge 
                           variant="outline" 
                           className="text-xs px-2 py-1 self-start overflow-visible break-words" 
                           style={{ 
                             backgroundColor: `${selectedColorTheme.primary}10`, 
                             color: selectedColorTheme.primary,
                             borderColor: `${selectedColorTheme.primary}20`,
                             wordWrap: 'break-word',
                             overflowWrap: 'break-word'
                           }}
                         >
                           <span className="whitespace-normal">{exp.duration}</span>
                         </Badge>
                      </div>
                      
                      {exp.description && (
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                      
                      {exp.responsibilities && exp.responsibilities.length > 0 && (
                        <div className="mt-4 page-break-avoid">
                          <h4 className="text-sm font-semibold mb-3 opacity-90">Key Responsibilities:</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            {exp.responsibilities.slice(0, 6).map((responsibility: string, respIndex: number) => (
                               <li key={respIndex} className="flex items-start gap-3 page-break-avoid overflow-visible" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                                 <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" 
                                      style={{ backgroundColor: selectedColorTheme.accent }}></div>
                                 <span className="leading-relaxed break-words whitespace-normal">{responsibility}</span>
                               </li>
                            ))}
                          </ul>
                        </div>
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

  // Fallback for other templates - simple layout
  return (
    <div className="bg-white p-8 rounded-lg border">
      <h1 className="text-3xl font-bold mb-2">{resumeData.name || 'Professional Name'}</h1>
      <p className="text-lg text-muted-foreground mb-6">{resumeData.title || 'Professional Title'}</p>
      
      {resumeData.experience && resumeData.experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Professional Experience</h2>
          <div className="space-y-6">
            {resumeData.experience.map((exp: any, index: number) => (
              <div key={index} className="border-l-2 border-primary/20 pl-4">
                <h3 className="font-bold text-lg">{exp.title}</h3>
                <p className="font-medium text-primary">{exp.company}</p>
                <p className="text-sm text-muted-foreground mb-2">{exp.duration}</p>
                {exp.description && <p className="text-sm mb-2">{exp.description}</p>}
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {exp.responsibilities.map((resp: string, idx: number) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}