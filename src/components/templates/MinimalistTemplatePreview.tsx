import React from "react";
import { Mail, Phone, Award, TrendingUp, Users, User } from "lucide-react";

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

export function MinimalistTemplatePreview({ enhancedContent, selectedColorTheme }: TemplatePreviewProps) {
  return (
    <div className="bg-white max-w-4xl mx-auto p-6 md:p-8 space-y-8 print:p-4 print:space-y-6">
      {/* Minimalist Header */}
      <div className="text-left space-y-3 border-b pb-6 print:pb-4" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
        <div className="flex items-start gap-6">
          {/* Profile Photo - Only show if photo exists */}
          {enhancedContent.photo && (
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
              <img 
                src={enhancedContent.photo} 
                alt={enhancedContent.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-light tracking-wide" style={{ color: selectedColorTheme.primary }}>
              {enhancedContent.name}
            </h1>
            <p className="text-xl text-muted-foreground font-light">
              {enhancedContent.title}
            </p>
            
            <div className="flex flex-wrap gap-4 sm:gap-8 text-sm text-muted-foreground font-light pt-2">
              <span className="break-all no-underline">{enhancedContent.email}</span>
              <span className="no-underline">{enhancedContent.phone}</span>
              <span>{enhancedContent.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium tracking-wide" style={{ color: selectedColorTheme.primary }}>
          PROFESSIONAL SUMMARY
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground font-light max-w-4xl">
          {enhancedContent.summary}
        </p>
      </div>

      {/* Experience - Enhanced with Detailed Descriptions */}
      {enhancedContent.experience && enhancedContent.experience.length > 0 && (
        <div className="space-y-6 print:space-y-4">
          <h2 className="text-lg font-medium tracking-wide" style={{ color: selectedColorTheme.primary }}>
            PROFESSIONAL EXPERIENCE & CAREER PROGRESSION
          </h2>
          
          <div className="space-y-8">
            {enhancedContent.experience.map((exp: any, index: number) => (
              <div key={index} className="space-y-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-2">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">{exp.title}</h3>
                    <p className="text-base font-light" style={{ color: selectedColorTheme.primary }}>
                      {exp.company}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground font-light">{exp.duration}</p>
                </div>
                
                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="pl-4 space-y-3 border-l print:keep-together" style={{ borderColor: `${selectedColorTheme.primary}20` }}>
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Key Achievements & Measurable Impact:
                    </h4>
                    {exp.achievements.map((achievement: string, achIndex: number) => (
                      <p key={achIndex} className="text-sm leading-relaxed text-muted-foreground font-light">
                        <span className="mr-2" style={{ color: selectedColorTheme.primary }}>•</span>
                        {achievement}
                      </p>
                    ))}
                    
                     {/* Job-specific Core Responsibilities */}
                     <div className="mt-4 p-3 rounded border" style={{ 
                       backgroundColor: `${selectedColorTheme.primary}03`,
                       borderColor: `${selectedColorTheme.primary}15`
                     }}>
                       <h5 className="text-xs font-medium mb-2 text-foreground">Core Responsibilities:</h5>
                       <div className="text-xs leading-relaxed text-muted-foreground font-light space-y-1">
                         {(() => {
                           // Generate responsibilities based on actual achievements and experience content
                           const generateResponsibilitiesFromAchievements = (achievements, title, company) => {
                             const responsibilities = [];
                             
                             if (achievements && achievements.length > 0) {
                               // Extract key themes from achievements
                               const achievementText = achievements.join(' ').toLowerCase();
                               
                               // Categorize based on achievement content
                               if (achievementText.includes('team') || achievementText.includes('lead') || achievementText.includes('manage')) {
                                 responsibilities.push(`Team leadership and management of ${title.toLowerCase()} operations at ${company}`);
                               }
                               
                               if (achievementText.includes('risk') || achievementText.includes('control') || achievementText.includes('compliance')) {
                                 responsibilities.push('Risk assessment, control implementation and regulatory compliance oversight');
                               }
                               
                               if (achievementText.includes('process') || achievementText.includes('operational') || achievementText.includes('workflow')) {
                                 responsibilities.push('Process optimization and operational efficiency improvement initiatives');
                               }
                               
                               if (achievementText.includes('client') || achievementText.includes('customer') || achievementText.includes('stakeholder')) {
                                 responsibilities.push('Client relationship management and stakeholder engagement activities');
                               }
                               
                               if (achievementText.includes('audit') || achievementText.includes('review') || achievementText.includes('assessment')) {
                                 responsibilities.push('Audit coordination, review processes and assessment activities');
                               }
                               
                               if (achievementText.includes('data') || achievementText.includes('report') || achievementText.includes('analysis')) {
                                 responsibilities.push('Data analysis, reporting and business intelligence support');
                               }
                               
                               if (achievementText.includes('quality') || achievementText.includes('standard') || achievementText.includes('control')) {
                                 responsibilities.push('Quality assurance and standard maintenance across operations');
                               }
                               
                               // If no specific themes found, create general responsibilities
                               if (responsibilities.length === 0) {
                                 responsibilities.push(`Primary operational duties in ${title} role at ${company}`);
                                 responsibilities.push('Cross-functional collaboration and project support activities');
                                 responsibilities.push('Performance monitoring and continuous improvement initiatives');
                               }
                             } else {
                               // Fallback if no achievements
                               responsibilities.push(`Core operational responsibilities in ${title} position`);
                               responsibilities.push(`Supporting organizational objectives at ${company}`);
                             }
                             
                             // Limit to 3-4 responsibilities for readability
                             return responsibilities.slice(0, 4);
                           };
                           
                           const responsibilities = generateResponsibilitiesFromAchievements(
                             exp.achievements, 
                             exp.title || 'Professional', 
                             exp.company || 'organization'
                           );
                           
                           return responsibilities.map((responsibility, idx) => (
                             <p key={idx} className="flex items-start">
                               <span className="inline-block w-1 h-1 rounded-full mr-2 mt-1.5 flex-shrink-0" 
                                     style={{ backgroundColor: selectedColorTheme.primary }}></span>
                               {responsibility}
                             </p>
                           ));
                         })()}
                       </div>
                     </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-6">
        {/* Skills - Enhanced with Categories */}
        {enhancedContent.skills && enhancedContent.skills.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium tracking-wide" style={{ color: selectedColorTheme.primary }}>
              TECHNICAL SKILLS & COMPETENCIES
            </h2>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Core Technical Skills:</h4>
                <div className="space-y-2">
                  {enhancedContent.skills.map((skill: string, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground font-light">{skill}</p>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(level => (
                          <div
                            key={level}
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: level <= Math.min(5, 3 + (index % 3)) ? selectedColorTheme.primary : `${selectedColorTheme.primary}20`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 p-3 rounded border" style={{
                backgroundColor: `${selectedColorTheme.primary}03`,
                borderColor: `${selectedColorTheme.primary}15`
              }}>
                <h4 className="text-sm font-medium text-foreground mb-2">Additional Professional Skills:</h4>
                <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground font-light">
                  <p>• Project Management & Coordination</p>
                  <p>• Strategic Planning & Analysis</p>
                  <p>• Team Leadership & Mentoring</p>
                  <p>• Process Optimization & Improvement</p>
                  <p>• Client Relations & Communication</p>
                  <p>• Quality Assurance & Control</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Education */}
        {enhancedContent.education && enhancedContent.education.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium tracking-wide" style={{ color: selectedColorTheme.primary }}>
              EDUCATION
            </h2>
            
            <div className="space-y-4">
              {enhancedContent.education.map((edu: any, index: number) => (
                <div key={index} className="space-y-1">
                   <h3 className="text-base font-medium text-foreground">{edu.degree}</h3>
                   <p className="text-sm font-light" style={{ color: selectedColorTheme.primary }}>
                     {edu.institution}
                   </p>
                   {edu.year && edu.year !== "N/A" && edu.year !== "Year not specified" && (
                     <p className="text-sm text-muted-foreground font-light">{edu.year}</p>
                   )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}