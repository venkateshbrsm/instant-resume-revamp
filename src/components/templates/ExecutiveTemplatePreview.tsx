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

// AI-powered content generation based on specific achievements and leadership qualities
const generateExecutiveContext = (achievements: string[]): string => {
  if (!achievements || achievements.length === 0) {
    return "Demonstrated exceptional leadership capabilities by orchestrating strategic initiatives, driving organizational transformation, and cultivating high-performance cultures. Consistently exceeded performance targets while maintaining operational excellence and sustainable growth trajectories.";
  }

  const achievementText = achievements.join(" ");
  
  // Extract specific metrics and numbers
  const metrics = {
    percentages: achievementText.match(/\d+%/g) || [],
    monetary: achievementText.match(/\$[\d,]+[MBK]?|\d+[MBK]\s*(?:revenue|sales|profit|budget|cost)/gi) || [],
    teamSize: achievementText.match(/\d+\s*(?:team|people|employees|staff|members)/gi) || [],
    timeframes: achievementText.match(/\d+\s*(?:months?|years?|quarters?)/gi) || [],
    growth: achievementText.match(/(?:increased?|grew|improved|boosted|enhanced|expanded)[\s\w]*?(?:by\s+)?\d+%?/gi) || []
  };

  // Extract specific leadership actions and outcomes
  const actions = {
    strategic: achievementText.match(/(?:launched|developed|implemented|created|established|built|designed|initiated)[\s\w]*?(?:strategy|program|initiative|system|process|framework)/gi) || [],
    transformation: achievementText.match(/(?:transformed|restructured|reorganized|optimized|streamlined|modernized|digitized)[\s\w]*?(?:operations|processes|team|department|organization)/gi) || [],
    leadership: achievementText.match(/(?:led|managed|directed|supervised|guided|mentored|coached)[\s\w]*?(?:team|department|division|project|initiative)/gi) || [],
    results: achievementText.match(/(?:achieved|delivered|exceeded|surpassed|generated|secured|obtained)[\s\w]*?(?:targets|goals|results|outcomes|objectives)/gi) || []
  };

  // Extract industry/company context
  const context = {
    industry: achievementText.match(/(?:technology|healthcare|finance|retail|manufacturing|consulting|media|energy|automotive|pharmaceutical|aerospace|telecommunications)/gi) || [],
    companyType: achievementText.match(/(?:startup|enterprise|fortune\s*\d+|multinational|global|public|private|b2b|b2c)/gi) || [],
    markets: achievementText.match(/(?:international|global|domestic|regional|emerging|mature|competitive)/gi) || []
  };

  // Extract leadership qualities demonstrated
  const qualities = [];
  const lowerText = achievementText.toLowerCase();
  
  if (lowerText.includes("innovation") || lowerText.includes("creative") || lowerText.includes("pioneered")) {
    qualities.push("innovative thinking");
  }
  if (metrics.percentages.length > 0 || lowerText.includes("data-driven") || lowerText.includes("analytics")) {
    qualities.push("data-driven decision making");
  }
  if (actions.transformation.length > 0 || lowerText.includes("change") || lowerText.includes("transformation")) {
    qualities.push("transformational leadership");
  }
  if (metrics.teamSize.length > 0 || actions.leadership.length > 0) {
    qualities.push("people leadership");
  }
  if (lowerText.includes("collaboration") || lowerText.includes("cross-functional") || lowerText.includes("stakeholder")) {
    qualities.push("collaborative execution");
  }
  if (actions.strategic.length > 0 || lowerText.includes("vision") || lowerText.includes("strategic")) {
    qualities.push("strategic vision");
  }

  // Build unique narrative based on extracted elements
  let narrative = "";
  
  // Start with leadership style based on qualities
  if (qualities.includes("transformational leadership") && qualities.includes("innovative thinking")) {
    narrative += "Transformational innovator who ";
  } else if (qualities.includes("data-driven decision making") && qualities.includes("strategic vision")) {
    narrative += "Strategic architect with analytical expertise who ";
  } else if (qualities.includes("people leadership") && qualities.includes("collaborative execution")) {
    narrative += "Collaborative leader and team builder who ";
  } else {
    narrative += "Executive leader who ";
  }

  // Add specific accomplishments with metrics
  const accomplishments = [];
  
  if (metrics.growth.length > 0) {
    const growthExample = metrics.growth[0].replace(/increased?|improved|boosted|enhanced/i, "drove");
    accomplishments.push(growthExample.toLowerCase());
  }
  
  if (metrics.monetary.length > 0 && metrics.percentages.length > 0) {
    accomplishments.push(`delivered ${metrics.monetary[0]} in value while achieving ${metrics.percentages[0]} performance improvements`);
  } else if (metrics.monetary.length > 0) {
    accomplishments.push(`generated ${metrics.monetary[0]} in measurable business value`);
  } else if (metrics.percentages.length > 0) {
    accomplishments.push(`achieved ${metrics.percentages[0]} improvement in key performance indicators`);
  }

  if (actions.strategic.length > 0) {
    const strategicAction = actions.strategic[0].replace(/launched|developed|implemented/i, "orchestrated");
    accomplishments.push(strategicAction.toLowerCase() + " that transformed organizational capabilities");
  }

  if (metrics.teamSize.length > 0) {
    accomplishments.push(`successfully scaled and led ${metrics.teamSize[0]} to exceed operational targets`);
  }

  // Add accomplishments to narrative
  if (accomplishments.length > 0) {
    narrative += accomplishments.slice(0, 2).join(", and ");
  } else {
    narrative += "consistently delivered exceptional results through strategic planning and execution";
  }

  // Add industry/context-specific insights
  if (context.industry.length > 0 || context.companyType.length > 0) {
    const industryContext = context.industry[0] || context.companyType[0];
    narrative += `. Specialized expertise in ${industryContext.toLowerCase()} environments`;
    
    if (context.markets.length > 0) {
      narrative += ` with proven success in ${context.markets[0].toLowerCase()} markets`;
    }
    narrative += ", leveraging deep sector knowledge to navigate complex challenges and capitalize on emerging opportunities.";
  } else {
    // Add leadership approach based on demonstrated qualities
    if (qualities.includes("collaborative execution")) {
      narrative += ". Builds high-performance cultures through cross-functional collaboration and stakeholder alignment, ensuring sustainable competitive advantages.";
    } else if (qualities.includes("data-driven decision making")) {
      narrative += ". Leverages advanced analytics and data insights to drive evidence-based strategies that deliver measurable business impact.";
    } else {
      narrative += ". Combines strategic acumen with operational excellence to drive sustainable growth and organizational transformation.";
    }
  }

  return narrative;
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
              <h5 className="font-semibold text-gray-900 mb-2 text-sm">Executive Leadership & Strategic Vision:</h5>
              <p className="text-xs leading-relaxed text-gray-600">
                {generateExecutiveContext(exp.achievements)}
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