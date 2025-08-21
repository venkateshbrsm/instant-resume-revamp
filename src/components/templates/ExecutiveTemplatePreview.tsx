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
    return "Demonstrated exceptional leadership capabilities through strategic initiatives and performance optimization, delivering measurable business impact across organizational functions.";
  }

  // Extract specific metrics, actions, and outcomes from achievements
  const achievementText = achievements.join(" ");
  const specificElements = {
    metrics: [],
    actions: [],
    outcomes: [],
    domains: []
  };

  // Extract quantifiable metrics
  const metricPatterns = [
    /(\d+%|\d+\.\d+%)/g, // percentages
    /\$[\d,]+[KMB]?/g, // dollar amounts
    /(\d+[KMB]?\+?)/g, // numbers with K/M/B
    /(\d+x|\d+ times)/g // multipliers
  ];
  
  metricPatterns.forEach(pattern => {
    const matches = achievementText.match(pattern);
    if (matches) specificElements.metrics.push(...matches.slice(0, 2));
  });

  // Extract action verbs and key accomplishments
  const actionWords = achievementText.toLowerCase().match(/\b(led|managed|increased|reduced|improved|implemented|developed|transformed|optimized|delivered|achieved|spearheaded|orchestrated|streamlined|launched|executed|drove|established|built)\w*/g);
  if (actionWords) {
    specificElements.actions.push(...[...new Set(actionWords)].slice(0, 3));
  }

  // Extract business domains and focus areas
  const domainKeywords = ['revenue', 'cost', 'efficiency', 'team', 'process', 'customer', 'market', 'digital', 'strategy', 'quality', 'performance', 'operations', 'growth', 'innovation', 'technology', 'sales', 'product', 'service'];
  domainKeywords.forEach(domain => {
    if (achievementText.toLowerCase().includes(domain)) {
      specificElements.domains.push(domain);
    }
  });

  // Generate unique contextual narrative
  const templates = [
    "Visionary executive who {actions} while {outcomes}, achieving {metrics} through {domains}-focused initiatives.",
    "Strategic leader with expertise in {domains} who {actions}, resulting in {metrics} improvements and {outcomes}.",
    "Results-driven executive specializing in {domains} transformation, {actions} to deliver {metrics} performance gains and {outcomes}.",
    "Dynamic leader who {actions} across {domains} functions, securing {metrics} results through {outcomes}-oriented strategies."
  ];

  const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  // Build context with specific details
  let context = selectedTemplate;
  
  // Replace placeholders with extracted elements
  if (specificElements.actions.length > 0) {
    const actionPhrase = specificElements.actions.slice(0, 2).join(' and ');
    context = context.replace('{actions}', actionPhrase);
  } else {
    context = context.replace('{actions}', 'implemented strategic initiatives');
  }

  if (specificElements.domains.length > 0) {
    const domainPhrase = specificElements.domains.slice(0, 2).join(' and ');
    context = context.replace('{domains}', domainPhrase);
  } else {
    context = context.replace('{domains}', 'organizational');
  }

  if (specificElements.metrics.length > 0) {
    const metricPhrase = specificElements.metrics.slice(0, 2).join(' and ');
    context = context.replace('{metrics}', metricPhrase);
  } else {
    context = context.replace('{metrics}', 'significant');
  }

  // Add outcome context based on achievement themes
  const outcomeContext = generateOutcomeContext(achievementText);
  context = context.replace('{outcomes}', outcomeContext);

  // Ensure professional executive language and proper length
  if (context.length < 100) {
    context += " Consistently exceeded stakeholder expectations through data-driven decision making and cross-functional collaboration.";
  }

  return context;
};

// Generate outcome-focused context based on achievement content
const generateOutcomeContext = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('revenue') || lowerText.includes('sales') || lowerText.includes('profit')) {
    return 'sustainable revenue growth';
  } else if (lowerText.includes('cost') || lowerText.includes('efficiency') || lowerText.includes('savings')) {
    return 'operational efficiency optimization';
  } else if (lowerText.includes('team') || lowerText.includes('leadership') || lowerText.includes('culture')) {
    return 'high-performance team development';
  } else if (lowerText.includes('customer') || lowerText.includes('satisfaction') || lowerText.includes('experience')) {
    return 'enhanced customer experience delivery';
  } else if (lowerText.includes('process') || lowerText.includes('workflow') || lowerText.includes('system')) {
    return 'streamlined process innovation';
  } else if (lowerText.includes('digital') || lowerText.includes('technology') || lowerText.includes('automation')) {
    return 'digital transformation excellence';
  } else {
    return 'strategic business transformation';
  }
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