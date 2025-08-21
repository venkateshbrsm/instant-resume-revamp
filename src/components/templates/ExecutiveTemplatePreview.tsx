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

// Generate leadership insights with rewording to avoid repetition
const generateExecutiveContext = (achievements: string[], roleTitle: string = "", company: string = "", experienceIndex: number = 0): string => {
  if (!achievements || achievements.length === 0) {
    const fallbacks = [
      "Strategic decision-making under pressure while balancing multiple stakeholder interests and resource constraints.",
      "Executive leadership involves navigating complex organizational dynamics while maintaining strategic focus and stakeholder alignment.",
      "Effective management requires balancing competing priorities while fostering team development and organizational growth."
    ];
    return fallbacks[experienceIndex % fallbacks.length];
  }

  const achievementText = achievements.join(" ").toLowerCase();
  
  // Revenue/Sales insights with variations
  if (achievementText.includes('revenue') || achievementText.includes('sales') || achievementText.includes('profit')) {
    if (achievementText.includes('team')) {
      const variations = [
        "Balancing revenue targets with team development requires understanding individual motivations while maintaining collective accountability for business outcomes.",
        "Achieving financial goals through people leadership involves aligning team objectives with business performance while fostering professional growth.",
        "Revenue success through team management demands balancing performance expectations with individual development and motivation strategies."
      ];
      return variations[experienceIndex % variations.length];
    } else {
      const variations = [
        "Revenue growth depends on identifying market inefficiencies and executing solutions faster than competitors can respond.",
        "Financial performance improvement requires strategic market analysis and rapid implementation of competitive advantages.",
        "Driving profitable growth involves recognizing market opportunities and deploying resources more effectively than industry peers."
      ];
      return variations[experienceIndex % variations.length];
    }
  }
  
  // Team/People insights with variations
  if (achievementText.includes('team') || achievementText.includes('people') || achievementText.includes('staff')) {
    if (achievementText.includes('process') || achievementText.includes('efficiency')) {
      const variations = [
        "High-performing teams emerge when individuals understand how their work connects to broader organizational objectives and customer value.",
        "Operational excellence through people requires clear communication of how individual contributions impact organizational success and customer outcomes.",
        "Team effectiveness increases when members grasp the relationship between their roles and the organization's strategic goals and market position."
      ];
      return variations[experienceIndex % variations.length];
    } else {
      const variations = [
        "Effective delegation requires matching tasks to individual strengths while providing clear success metrics and decision-making authority.",
        "Successful people leadership involves aligning responsibilities with team member capabilities while establishing transparent performance standards.",
        "Strategic delegation means pairing assignments with individual competencies while defining clear accountability measures and autonomy levels."
      ];
      return variations[experienceIndex % variations.length];
    }
  }
  
  // Process/Efficiency insights with variations
  if (achievementText.includes('process') || achievementText.includes('efficiency') || achievementText.includes('optimization')) {
    const variations = [
      "Sustainable process improvements come from frontline insights rather than top-down mandates, requiring leaders to listen before directing.",
      "Lasting operational enhancements emerge from ground-level observations rather than executive directives, demanding active listening before implementation.",
      "Effective process optimization stems from employee-driven insights rather than management assumptions, necessitating consultation before action."
    ];
    return variations[experienceIndex % variations.length];
  }
  
  // Innovation insights with variations
  if (achievementText.includes('launched') || achievementText.includes('created') || achievementText.includes('developed')) {
    const variations = [
      "Innovation success depends on rapid experimentation cycles and the willingness to pivot based on early customer feedback rather than initial assumptions.",
      "Creative breakthroughs require iterative testing approaches and flexibility to adjust direction based on market response rather than original hypotheses.",
      "Successful innovation relies on quick prototype cycles and readiness to modify strategies based on user input rather than predetermined concepts."
    ];
    return variations[experienceIndex % variations.length];
  }
  
  // Cost/Budget insights with variations
  if (achievementText.includes('cost') || achievementText.includes('budget') || achievementText.includes('savings')) {
    const variations = [
      "Cost management without sacrificing quality requires deep understanding of value chains and the courage to eliminate sacred cows that no longer serve customers.",
      "Financial stewardship while maintaining standards demands comprehensive value analysis and willingness to discontinue traditional practices that lack customer benefit.",
      "Budget optimization without quality compromise involves thorough value stream evaluation and boldness to remove established processes that don't add customer value."
    ];
    return variations[experienceIndex % variations.length];
  }
  
  // General fallbacks with variations
  const roleInsights = [
    "Complex organizations require leaders who can synthesize conflicting information into clear strategic direction while maintaining team morale during uncertainty.",
    "Market dynamics shift faster than planning cycles, demanding leaders who can adjust tactics while maintaining strategic consistency and stakeholder confidence.",
    "Cross-functional success depends on building trust through small commitments before attempting larger collaborative initiatives that require organizational buy-in.",
    "Stakeholder alignment emerges from understanding individual priorities and finding intersection points that serve collective interests without compromising core principles.",
    "Leadership effectiveness involves translating ambiguous market signals into actionable strategies while preserving organizational culture and employee engagement.",
    "Executive success requires balancing short-term performance pressures with long-term strategic investments while maintaining transparent communication with all stakeholders."
  ];
  
  return roleInsights[experienceIndex % roleInsights.length];
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
                {generateExecutiveContext(exp.achievements, exp.title, exp.company, index)}
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