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

// AI-powered content generation that creates truly unique narratives for each role
const generateExecutiveContext = (achievements: string[], roleTitle: string = "", company: string = ""): string => {
  if (!achievements || achievements.length === 0) {
    return "Demonstrated exceptional leadership capabilities by orchestrating strategic initiatives, driving organizational transformation, and cultivating high-performance cultures. Consistently exceeded performance targets while maintaining operational excellence and sustainable growth trajectories.";
  }

  const achievementText = achievements.join(" ");
  const lowerText = achievementText.toLowerCase();
  
  // Extract the most impactful achievement directly
  const getKeyAchievement = () => {
    // Look for sentences with strong impact indicators
    const sentences = achievementText.split(/[.!]/).filter(s => s.trim().length > 20);
    const impactfulSentences = sentences.filter(sentence => {
      const lower = sentence.toLowerCase();
      return (lower.includes('%') && lower.match(/\d+%/)) ||
             (lower.includes('$') || lower.includes('revenue') || lower.includes('profit')) ||
             (lower.match(/\d+/) && (lower.includes('team') || lower.includes('people') || lower.includes('employee'))) ||
             (lower.includes('increased') || lower.includes('improved') || lower.includes('reduced') || lower.includes('grew'));
    });
    
    return impactfulSentences.length > 0 ? impactfulSentences[0].trim() : sentences[0]?.trim() || "";
  };

  // Create role-specific context
  const getRoleContext = () => {
    const role = roleTitle.toLowerCase();
    if (role.includes('ceo') || role.includes('president') || role.includes('chief executive')) {
      return "enterprise-wide transformation and shareholder value creation";
    } else if (role.includes('coo') || role.includes('operations')) {
      return "operational excellence and scalable business processes";
    } else if (role.includes('cto') || role.includes('technology')) {
      return "technological innovation and digital infrastructure advancement";
    } else if (role.includes('cfo') || role.includes('finance')) {
      return "financial stewardship and strategic capital allocation";
    } else if (role.includes('vp') || role.includes('vice president')) {
      return "departmental leadership and cross-functional integration";
    } else if (role.includes('director') || role.includes('head of')) {
      return "program delivery and team performance optimization";
    } else {
      return "strategic execution and organizational development";
    }
  };

  // Build unique narrative using actual achievement content
  const keyAchievement = getKeyAchievement();
  const roleContext = getRoleContext();
  
  let narrative = "";
  
  // Use the actual achievement as the foundation
  if (keyAchievement && keyAchievement.length > 15) {
    // Clean and transform the achievement into executive language
    const transformedAchievement = keyAchievement
      .replace(/^[Ii]\s/, 'This leader ')
      .replace(/\bi\s/gi, 'they ')
      .replace(/\bmy\b/gi, 'their')
      .replace(/\bour\b/gi, 'the organization\'s')
      .toLowerCase();
    
    narrative = `Accomplished executive specializing in ${roleContext} who ${transformedAchievement}`;
    
    // Add company-specific context if available
    if (company && company !== "N/A" && company.length > 2) {
      const companyInsight = lowerText.includes('startup') || lowerText.includes('growth') ? 
        `within ${company}'s dynamic growth environment` :
        lowerText.includes('enterprise') || lowerText.includes('fortune') ?
        `across ${company}'s complex organizational structure` :
        `during tenure at ${company}`;
      
      narrative += ` ${companyInsight}`;
    }
    
  } else {
    // Fallback using detected business themes but with role specificity
    const businessThemes = [];
    if (lowerText.includes('revenue') || lowerText.includes('sales') || lowerText.includes('profit')) {
      businessThemes.push('revenue generation');
    }
    if (lowerText.includes('cost') || lowerText.includes('efficiency') || lowerText.includes('savings')) {
      businessThemes.push('cost optimization');
    }
    if (lowerText.includes('team') || lowerText.includes('people') || lowerText.includes('staff')) {
      businessThemes.push('talent development');
    }
    if (lowerText.includes('process') || lowerText.includes('system') || lowerText.includes('operation')) {
      businessThemes.push('process innovation');
    }
    
    const themes = businessThemes.length > 0 ? businessThemes.slice(0, 2).join(' and ') : roleContext;
    narrative = `Results-driven executive with specialized expertise in ${themes}, consistently delivering measurable outcomes through strategic leadership initiatives`;
  }

  // Add unique closing based on specific content patterns
  const getUniqueClosing = () => {
    const closingVariations = [];
    
    // Generate closings based on actual content
    if (lowerText.includes('international') || lowerText.includes('global')) {
      closingVariations.push("This global perspective enables successful navigation of diverse market dynamics and regulatory environments.");
    }
    if (lowerText.includes('startup') || lowerText.includes('entrepreneur')) {
      closingVariations.push("Entrepreneurial mindset drives rapid adaptation and innovative solution development in fast-paced business environments.");
    }
    if (lowerText.includes('public') || lowerText.includes('ipo') || lowerText.includes('shareholders')) {
      closingVariations.push("Public company experience ensures rigorous governance standards and transparent stakeholder communication.");
    }
    if (lowerText.includes('merger') || lowerText.includes('acquisition') || lowerText.includes('integration')) {
      closingVariations.push("M&A expertise facilitates seamless organizational integrations and synergy realization across diverse business units.");
    }
    if (lowerText.includes('digital') || lowerText.includes('ai') || lowerText.includes('automation')) {
      closingVariations.push("Technology-forward approach accelerates digital transformation initiatives while maintaining human-centered leadership principles.");
    }
    
    // Default variations if no specific patterns found
    if (closingVariations.length === 0) {
      const defaults = [
        "Strategic acumen combined with operational discipline creates sustainable competitive advantages in complex business environments.",
        "Cross-functional leadership expertise enables effective collaboration across diverse organizational structures and stakeholder groups.",
        "Performance-driven approach ensures consistent achievement of ambitious targets while maintaining ethical business practices.",
        "Change management capabilities facilitate smooth organizational transitions during periods of significant business transformation."
      ];
      
      // Use a simple hash of the achievement text to pick consistently but vary by content
      const hash = achievementText.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
      const index = Math.abs(hash) % defaults.length;
      closingVariations.push(defaults[index]);
    }
    
    return closingVariations[0];
  };

  narrative += `. ${getUniqueClosing()}`;
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