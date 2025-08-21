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

// AI-powered content generation based on specific achievements
const generateExecutiveContext = (achievements: string[]): string => {
  if (!achievements || achievements.length === 0) {
    return "Demonstrated exceptional leadership capabilities by orchestrating strategic initiatives, driving organizational transformation, and cultivating high-performance cultures. Consistently exceeded performance targets while maintaining operational excellence and sustainable growth trajectories.";
  }

  const achievementText = achievements.join(" ");
  
  // Extract specific metrics and numbers
  const metrics = {
    percentages: achievementText.match(/\d+%/g) || [],
    dollars: achievementText.match(/\$[\d,]+[KMB]?/g) || [],
    numbers: achievementText.match(/\b\d{1,3}(?:,\d{3})*\b/g) || [],
    years: achievementText.match(/\b(20\d{2}|19\d{2})\b/g) || []
  };

  // Extract specific actions and initiatives
  const actions = [];
  const actionWords = ['launched', 'implemented', 'led', 'developed', 'established', 'created', 'transformed', 'optimized', 'streamlined', 'expanded', 'built', 'designed', 'executed', 'delivered', 'achieved', 'increased', 'reduced', 'improved', 'managed', 'directed', 'spearheaded'];
  
  actionWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\s+([^.!?]*?)(?=[.!?]|$)`, 'gi');
    const matches = achievementText.match(regex);
    if (matches) {
      actions.push(...matches.slice(0, 2)); // Limit to avoid overflow
    }
  });

  // Extract industry/domain context
  const domains = [];
  const industryTerms = ['technology', 'digital', 'software', 'healthcare', 'finance', 'manufacturing', 'retail', 'consulting', 'marketing', 'sales', 'operations', 'product', 'engineering', 'data', 'analytics', 'cloud', 'AI', 'machine learning', 'automation', 'supply chain', 'customer', 'market', 'business'];
  
  industryTerms.forEach(term => {
    if (achievementText.toLowerCase().includes(term)) {
      domains.push(term);
    }
  });

  // Extract specific outcomes and results
  const outcomes = [];
  const outcomePatterns = [
    /increased.*?(?:revenue|sales|profits?|growth|efficiency|productivity).*?by.*?(\d+%|\$[\d,]+[KMB]?)/gi,
    /reduced.*?(?:costs?|expenses?|time|waste).*?by.*?(\d+%|\$[\d,]+[KMB]?)/gi,
    /achieved.*?(\d+%|\$[\d,]+[KMB]?|[\d,]+).*?(?:growth|increase|improvement|savings?)/gi,
    /delivered.*?(\d+%|\$[\d,]+[KMB]?|[\d,]+).*?(?:in|of).*?(?:revenue|savings?|value|results?)/gi
  ];

  outcomePatterns.forEach(pattern => {
    const matches = achievementText.match(pattern);
    if (matches) {
      outcomes.push(...matches.slice(0, 2));
    }
  });

  // Generate truly unique narrative
  let narrative = "";
  
  // Start with specific domain expertise if available
  if (domains.length > 0) {
    const primaryDomains = [...new Set(domains)].slice(0, 2);
    narrative += `Specialized executive leader in ${primaryDomains.join(' and ')} sectors, `;
  } else {
    narrative += "Strategic executive leader ";
  }

  // Add specific quantifiable achievements
  if (outcomes.length > 0) {
    const bestOutcome = outcomes[0].toLowerCase();
    narrative += `who ${bestOutcome}. `;
  } else if (metrics.percentages.length > 0 || metrics.dollars.length > 0) {
    const topMetric = metrics.percentages[0] || metrics.dollars[0];
    narrative += `with demonstrated success delivering ${topMetric} performance improvements. `;
  }

  // Add specific actions taken
  if (actions.length > 0) {
    const uniqueActions = [...new Set(actions.slice(0, 2))];
    const actionSummary = uniqueActions.join(' and ').replace(/\b(launched|implemented|led|developed|established|created|transformed|optimized|streamlined|expanded|built|designed|executed|delivered|achieved|increased|reduced|improved|managed|directed|spearheaded)\b/gi, (match) => match.charAt(0).toUpperCase() + match.slice(1));
    narrative += `${actionSummary}. `;
  }

  // Add context about scale and complexity
  if (metrics.numbers.length > 0) {
    const largestNumber = Math.max(...metrics.numbers.map(n => parseInt(n.replace(/,/g, ''))));
    if (largestNumber > 1000000) {
      narrative += "Operated at enterprise scale with multi-million dollar impact, ";
    } else if (largestNumber > 100000) {
      narrative += "Managed substantial operations with six-figure implications, ";
    } else if (largestNumber > 1000) {
      narrative += "Directed significant initiatives involving thousands of stakeholders, ";
    }
  }

  // Conclude with leadership approach based on specific evidence
  if (achievementText.toLowerCase().includes('team') && (metrics.percentages.length > 0 || outcomes.length > 0)) {
    narrative += "demonstrating exceptional team leadership through measurable business transformation and sustainable competitive advantage creation.";
  } else if (achievementText.toLowerCase().includes('strategic') || achievementText.toLowerCase().includes('vision')) {
    narrative += "showcasing visionary strategic thinking that translates complex market opportunities into tangible organizational success.";
  } else if (domains.includes('technology') || domains.includes('digital')) {
    narrative += "leveraging cutting-edge technological innovation to drive unprecedented organizational evolution and market positioning.";
  } else {
    narrative += "combining analytical rigor with inspirational leadership to deliver transformational results that exceed stakeholder expectations.";
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