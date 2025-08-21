import React from "react";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Award, TrendingUp, Users, Target, Star, User } from "lucide-react";

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

// Create unique insights by extracting specific details from each achievement
const generateExecutiveContext = (achievements: string[], roleTitle: string = "", company: string = ""): string => {
  if (!achievements || achievements.length === 0) {
    return "Leadership requires adapting communication styles to different audiences while maintaining consistent strategic direction.";
  }

  // Extract specific numbers, actions, and outcomes from achievements
  const extractSpecifics = () => {
    const allText = achievements.join(" ");
    
    // Find specific numbers/percentages
    const numbers = allText.match(/\d+(?:\.\d+)?%?/g) || [];
    const actions = allText.match(/\b(increased|decreased|reduced|improved|managed|led|created|developed|launched|implemented|optimized|streamlined|grew|expanded|built|established|designed|achieved|delivered|generated|exceeded|secured|obtained)\b/gi) || [];
    const objects = allText.match(/\b(team|teams|department|division|budget|revenue|profit|sales|cost|process|system|program|project|initiative|strategy|operations|efficiency|customers|clients|employees|staff|people)\b/gi) || [];
    
    return { numbers, actions, objects };
  };

  const specifics = extractSpecifics();
  
  // Build insight using actual extracted elements
  if (specifics.numbers.length > 0 && specifics.actions.length > 0) {
    const number = specifics.numbers[0];
    const action = specifics.actions[0].toLowerCase();
    const context = specifics.objects[0]?.toLowerCase() || "organizational outcomes";
    
    return `${action.charAt(0).toUpperCase() + action.slice(1)} ${context} by ${number} required identifying root cause factors and implementing solutions that addressed systemic rather than symptomatic issues.`;
  }
  
  if (specifics.actions.length > 1 && specifics.objects.length > 1) {
    const action1 = specifics.actions[0].toLowerCase();
    const action2 = specifics.actions[1].toLowerCase();
    const object1 = specifics.objects[0]?.toLowerCase() || "operations";
    const object2 = specifics.objects[1]?.toLowerCase() || "performance";
    
    return `Successfully ${action1} ${object1} while simultaneously ${action2} ${object2} demonstrates the importance of parallel execution and resource allocation in complex environments.`;
  }
  
  // Use the first achievement directly but extract the core insight
  const firstAchievement = achievements[0];
  if (firstAchievement && firstAchievement.length > 30) {
    // Find the key verb-object combination
    const words = firstAchievement.toLowerCase().split(' ');
    const keyVerbs = ['increased', 'decreased', 'improved', 'managed', 'led', 'created', 'developed', 'launched', 'achieved', 'delivered'];
    const verbIndex = words.findIndex(word => keyVerbs.some(verb => word.includes(verb)));
    
    if (verbIndex !== -1 && verbIndex < words.length - 2) {
      const context = words.slice(verbIndex, verbIndex + 4).join(' ');
      return `The experience of ${context} highlighted the critical importance of stakeholder buy-in and clear success metrics in driving sustainable organizational change.`;
    }
  }
  
  // Last resort - use role and company info
  const roleSpecific = roleTitle ? `${roleTitle.toLowerCase()} role` : "leadership position";
  const companySpecific = company && company !== "N/A" ? `at ${company}` : "in this organization";
  
  return `This ${roleSpecific} ${companySpecific} demonstrated that sustainable results emerge from aligning individual capabilities with organizational needs while maintaining flexibility in execution methods.`;
};

export function ExecutiveTemplatePreview({ enhancedContent, selectedColorTheme }: TemplatePreviewProps) {
  return (
    <div className="bg-white shadow-2xl overflow-hidden border border-border/50 max-w-5xl mx-auto print:shadow-none print:border-0 print:max-w-none print:w-full">
      {/* Print Layout - Single Column for PDF */}
      <div className="flex print:block">
        {/* Left Sidebar - Dark Background */}
        <div 
          className="w-1/3 p-6 text-white print:p-4 print:w-full print:mb-6 page-break-avoid"
          style={{
            background: `linear-gradient(135deg, ${selectedColorTheme.primary} 0%, ${selectedColorTheme.secondary} 50%, ${selectedColorTheme.accent} 100%)`
          }}
        >
          {/* Profile Section */}
          <div className="mb-8 page-break-avoid">
            {/* Profile Photo - Only show if photo exists */}
            {enhancedContent.photo && (
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden mb-4 mx-auto">
                <img 
                  src={enhancedContent.photo} 
                  alt={enhancedContent.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h1 className="text-2xl font-bold mb-2 text-center">{enhancedContent.name}</h1>
            <p className="text-lg opacity-95 font-medium text-center mb-4">{enhancedContent.title}</p>
            
            <div className="space-y-2 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="break-all no-underline">{enhancedContent.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="no-underline">{enhancedContent.phone}</span>
              </div>
            </div>
          </div>

          {/* Core Competencies in Sidebar */}
          {enhancedContent.skills && enhancedContent.skills.length > 0 && (
            <div className="mb-8 page-break-avoid skills-section">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Core Competencies
              </h3>
              <div className="space-y-2">
                {enhancedContent.skills.slice(0, 8).map((skill: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 skill-item">
                    <div className="w-2 h-2 rounded-full bg-white/80"></div>
                    <span className="text-sm font-medium">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Executive Metrics */}
          <div className="mb-8 page-break-avoid">
            <h3 className="text-lg font-bold mb-4">Leadership Impact</h3>
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">
                  {enhancedContent.experience?.length || 0}+
                </div>
                <p className="text-xs opacity-90">Years Leadership</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">
                  {enhancedContent.skills?.length || 0}
                </div>
                <p className="text-xs opacity-90">Core Competencies</p>
              </div>
            </div>
          </div>

          {/* Education in Sidebar */}
          {enhancedContent.education && enhancedContent.education.length > 0 && (
            <div className="page-break-avoid">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Education
              </h3>
              <div className="space-y-3">
                {enhancedContent.education.map((edu: any, index: number) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 education-item page-break-avoid">
                    <h4 className="font-bold text-sm">{edu.degree}</h4>
                    <p className="text-sm opacity-90">{edu.institution}</p>
                    {edu.year && edu.year !== "N/A" && edu.year !== "Year not specified" && (
                      <p className="text-xs opacity-75 mt-1">{edu.year}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Main Content - Light Background */}
        <div className="w-2/3 p-6 bg-gray-50 print:p-4 print:w-full print:bg-white">
          {/* Executive Summary */}
          <div className="mb-8 page-break-avoid section print:mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ background: selectedColorTheme.primary }}
              >
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold" style={{ color: selectedColorTheme.primary }}>
                Executive Summary
              </h2>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: selectedColorTheme.primary }}>
              <p className="text-sm leading-relaxed text-gray-700">
                {enhancedContent.summary}
              </p>
            </div>
          </div>

              {/* Professional Experience - Enhanced with Detailed Achievements */}
              {enhancedContent.experience && enhancedContent.experience.length > 0 && (
                <div className="section">
                  <div className="flex items-center gap-3 mb-6">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ background: selectedColorTheme.secondary }}
                    >
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold" style={{ color: selectedColorTheme.primary }}>
                      Executive Leadership Experience
                    </h2>
                  </div>
                  
                  <div className="space-y-8">
                    {enhancedContent.experience.map((exp: any, index: number) => (
                      <div key={index} className="bg-white p-6 rounded-lg shadow-sm border-l-4 experience-item page-break-avoid print:mb-8" style={{ borderColor: selectedColorTheme.accent }} data-experience>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{exp.title}</h3>
                            <p className="text-base font-semibold" style={{ color: selectedColorTheme.primary }}>
                              {exp.company}
                            </p>
                          </div>
                          <Badge 
                            className="px-3 py-1 text-white text-xs"
                            style={{ backgroundColor: selectedColorTheme.primary }}
                          >
                            {exp.duration}
                          </Badge>
                        </div>
                        
                        {exp.achievements && exp.achievements.length > 0 && (
                          <div className="page-break-avoid">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                              <Star className="w-4 h-4" style={{ color: selectedColorTheme.accent }} />
                              Strategic Achievements & Leadership Impact
                            </h4>
                            <div className="space-y-3">
                              {exp.achievements.map((achievement: string, achIndex: number) => (
                                <div key={achIndex} className="flex items-start gap-3">
                                  <div 
                                    className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0"
                                    style={{ backgroundColor: selectedColorTheme.accent }}
                                  >
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                  <p className="text-sm leading-relaxed text-gray-600 font-medium">
                                    {achievement}
                                  </p>
                                </div>
                              ))}
                            </div>
                            
            {/* Executive Context - AI Generated */}
            <div className="mt-5 p-4 rounded-lg bg-gray-50 border-l-3" style={{ borderColor: selectedColorTheme.primary }}>
              <h5 className="font-semibold text-gray-900 mb-2 text-sm">Leadership Learnings & Development Insights:</h5>
              <p className="text-xs leading-relaxed text-gray-600">
                {generateExecutiveContext(exp.achievements, exp.title, exp.company)}
              </p>
            </div>
                          </div>
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