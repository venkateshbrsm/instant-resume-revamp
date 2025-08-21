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

// AI-powered unique content generation based on specific achievements
const generateExecutiveContext = (achievements: string[], companyName: string = "", role: string = ""): string => {
  if (!achievements || achievements.length === 0) {
    return "Demonstrated exceptional leadership capabilities by orchestrating strategic initiatives, driving organizational transformation, and cultivating high-performance cultures. Consistently exceeded performance targets while maintaining operational excellence and sustainable growth trajectories.";
  }

  // Extract specific metrics, numbers, and concrete details
  const achievementText = achievements.join(" ");
  const metrics = [];
  const initiatives = [];
  const outcomes = [];
  
  // Extract numbers and percentages for concrete impact
  const numberMatches = achievementText.match(/\d+(\.\d+)?%?/g) || [];
  const significantNumbers = numberMatches.filter(num => {
    const value = parseFloat(num.replace('%', ''));
    return value > 1; // Filter out small decimals
  });

  // Parse each achievement for specific details
  achievements.forEach(achievement => {
    const lower = achievement.toLowerCase();
    
    // Extract specific business outcomes
    if (lower.includes('revenue') || lower.includes('sales') || lower.includes('profit')) {
      outcomes.push(`financial performance excellence`);
      if (significantNumbers.length > 0) {
        const relevantNumbers = achievement.match(/\d+(\.\d+)?%?/g);
        if (relevantNumbers) {
          metrics.push(`${relevantNumbers[0]} measurable impact`);
        }
      }
    }
    
    if (lower.includes('cost') && (lower.includes('reduc') || lower.includes('sav'))) {
      outcomes.push(`operational cost optimization`);
    }
    
    if (lower.includes('team') || lower.includes('staff') || lower.includes('employee')) {
      initiatives.push(`organizational talent development`);
    }
    
    if (lower.includes('launch') || lower.includes('implement') || lower.includes('establish')) {
      initiatives.push(`strategic initiative execution`);
    }
    
    if (lower.includes('market') || lower.includes('client') || lower.includes('customer')) {
      outcomes.push(`market expansion and client relationships`);
    }
    
    if (lower.includes('digital') || lower.includes('technolog') || lower.includes('system')) {
      initiatives.push(`technological transformation`);
    }
    
    if (lower.includes('process') && (lower.includes('improv') || lower.includes('optimi'))) {
      initiatives.push(`process re-engineering`);
    }
  });

  // Create unique narrative based on extracted elements
  let context = "";
  
  // Start with role-specific leadership approach
  if (initiatives.length > 0) {
    const uniqueInitiatives = [...new Set(initiatives)];
    context = `Spearheaded ${uniqueInitiatives.slice(0, 2).join(' and ')} initiatives`;
    if (companyName) {
      context += ` at ${companyName}`;
    }
    context += ", ";
  } else {
    context = "Orchestrated comprehensive leadership strategies ";
  }
  
  // Add specific outcomes achieved
  if (outcomes.length > 0) {
    const uniqueOutcomes = [...new Set(outcomes)];
    context += `achieving ${uniqueOutcomes.slice(0, 2).join(' alongside ')}`;
  } else {
    context += "delivering sustained organizational growth";
  }
  
  // Include metrics if available
  if (metrics.length > 0) {
    context += ` with ${metrics[0]}`;
  }
  
  // Add unique strategic approach based on achievement patterns
  const achievementPatterns = achievements.join(' ').toLowerCase();
  if (achievementPatterns.includes('transform') || achievementPatterns.includes('restructur')) {
    context += ". Pioneered organizational transformation methodologies that restructured operational frameworks while maintaining stakeholder confidence and market positioning.";
  } else if (achievementPatterns.includes('expand') || achievementPatterns.includes('scale')) {
    context += ". Executed scalable growth strategies that expanded market presence through strategic partnerships and innovative business model optimization.";
  } else if (achievementPatterns.includes('innovat') || achievementPatterns.includes('develop')) {
    context += ". Cultivated innovation-driven cultures that accelerated product development cycles and enhanced competitive differentiation in dynamic market environments.";
  } else if (achievementPatterns.includes('efficienc') || achievementPatterns.includes('optimi')) {
    context += ". Implemented performance optimization frameworks that enhanced operational efficiency while reducing resource consumption and maximizing ROI across all business units.";
  } else {
    // Unique fallback based on the specific role context
    const contextEnders = [
      "through data-driven decision making and cross-functional collaboration that aligned diverse stakeholder interests with strategic business objectives.",
      "by fostering high-performance team dynamics and implementing agile methodologies that accelerated project delivery and enhanced organizational responsiveness.",
      "via comprehensive stakeholder engagement and strategic resource allocation that optimized operational workflows and strengthened market positioning.",
      "through innovative problem-solving approaches and systematic risk management that ensured sustainable competitive advantages and long-term value creation."
    ];
    // Use a simple hash of the achievements to consistently pick the same ender for the same achievements
    const hash = achievements.join('').split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    context += `. ${contextEnders[Math.abs(hash) % contextEnders.length]}`;
  }

  return context;
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
                {generateExecutiveContext(exp.achievements, exp.company, exp.title)}
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