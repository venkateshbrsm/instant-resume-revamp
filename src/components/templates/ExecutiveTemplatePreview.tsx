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
  const lowerText = achievementText.toLowerCase();
  
  // Extract concrete metrics and quantifiable outcomes
  const metrics = {
    percentages: achievementText.match(/\d+(?:\.\d+)?%/g) || [],
    monetary: achievementText.match(/(?:\$|USD|€|£)?\s*\d+(?:,\d{3})*(?:\.\d+)?[MBK]?\b|\d+[MBK]?\s*(?:million|billion|thousand|revenue|sales|profit|budget|cost|savings)/gi) || [],
    teamSize: achievementText.match(/(?:team of\s+)?\d+\s*(?:team|people|employees|staff|members|person team)/gi) || [],
    numbers: achievementText.match(/\d+(?:,\d{3})*\s*(?:projects|clients|customers|locations|stores|offices|departments|initiatives|programs)/gi) || []
  };

  // Extract actual achievement phrases with context
  const concreteAchievements = [];
  const achievementPatterns = [
    /(?:increased|grew|improved|boosted|enhanced|expanded|raised)\s+[^.]*?(?:\d+%|\$\d+|by\s+\d+)/gi,
    /(?:reduced|decreased|cut|lowered|minimized)\s+[^.]*?(?:\d+%|\$\d+|by\s+\d+)/gi,
    /(?:launched|created|developed|built|established|implemented)\s+[^.]*?(?:resulting|leading|generating|achieving)/gi,
    /(?:managed|directed|led|oversaw)\s+[^.]*?(?:team|project|department|initiative|budget)/gi
  ];

  achievementPatterns.forEach(pattern => {
    const matches = achievementText.match(pattern) || [];
    concreteAchievements.push(...matches.slice(0, 1));
  });

  // Determine unique leadership approach based on actual content
  const getLeadershipStyle = () => {
    const styleIndicators = [
      { keywords: ["transformation", "restructur", "change management", "turnaround"], style: "Transformation catalyst" },
      { keywords: ["innovation", "digital", "technology", "ai", "automation"], style: "Innovation architect" },
      { keywords: ["revenue", "profit", "sales", "market share", "growth"], style: "Growth strategist" },
      { keywords: ["team", "culture", "people", "talent", "leadership development"], style: "Organizational builder" },
      { keywords: ["efficiency", "process", "optimization", "lean", "operations"], style: "Operational excellence driver" },
      { keywords: ["strategic", "vision", "planning", "roadmap", "direction"], style: "Strategic visionary" }
    ];

    for (const indicator of styleIndicators) {
      if (indicator.keywords.some(keyword => lowerText.includes(keyword))) {
        return indicator.style;
      }
    }
    return "Executive leader";
  };

  // Build narrative from actual achievements
  let narrative = `${getLeadershipStyle()} who `;

  // Use concrete achievements first
  if (concreteAchievements.length > 0) {
    const primaryAchievement = concreteAchievements[0]
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .replace(/^(increased|improved|grew|boosted|enhanced|expanded|raised|reduced|decreased|cut|lowered|minimized|launched|created|developed|built|established|implemented|managed|directed|led|oversaw)/, 'delivered');
    
    narrative += primaryAchievement.trim();
    
    // Add quantified impact if available
    if (metrics.monetary.length > 0) {
      narrative += `, generating ${metrics.monetary[0]} in measurable business impact`;
    } else if (metrics.percentages.length > 0) {
      narrative += `, achieving ${metrics.percentages[0]} performance enhancement`;
    }
  } else {
    // Create unique fallbacks based on detected patterns
    if (metrics.monetary.length > 0 && metrics.percentages.length > 0) {
      narrative += `orchestrated initiatives generating ${metrics.monetary[0]} while delivering ${metrics.percentages[0]} operational improvements`;
    } else if (metrics.numbers.length > 0) {
      narrative += `successfully scaled operations across ${metrics.numbers[0]} while maintaining excellence standards`;
    } else if (lowerText.includes("process") || lowerText.includes("system")) {
      narrative += "architected robust operational frameworks that enhanced organizational capability and scalability";
    } else if (lowerText.includes("market") || lowerText.includes("customer")) {
      narrative += "pioneered market-driven strategies that strengthened competitive positioning and customer value delivery";
    } else {
      narrative += "orchestrated strategic initiatives that transformed organizational performance and market positioning";
    }
  }

  // Add contextual closing based on content themes
  const getContextualClosing = () => {
    if (lowerText.includes("data") || lowerText.includes("analytics") || lowerText.includes("metrics")) {
      return ". Leverages analytical rigor and data-driven insights to optimize decision-making processes and ensure sustainable competitive advantages.";
    } else if (lowerText.includes("stakeholder") || lowerText.includes("collaboration") || lowerText.includes("partnership")) {
      return ". Builds strategic partnerships and cross-functional alignment to accelerate organizational objectives and stakeholder value creation.";
    } else if (lowerText.includes("culture") || lowerText.includes("development") || lowerText.includes("talent")) {
      return ". Cultivates high-performance organizational cultures that attract top talent and foster innovation-driven growth trajectories.";
    } else if (lowerText.includes("technology") || lowerText.includes("digital") || lowerText.includes("innovation")) {
      return ". Integrates cutting-edge technological solutions with strategic business objectives to drive digital transformation and operational modernization.";
    } else {
      return ". Combines strategic foresight with operational discipline to navigate complex business challenges and capitalize on emerging market opportunities.";
    }
  };

  narrative += getContextualClosing();
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