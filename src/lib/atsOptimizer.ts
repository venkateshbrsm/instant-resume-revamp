// ATS-friendly content optimizer with industry-specific keywords
export interface ATSOptimizedContent {
  name: string;
  title: string;
  email?: string;
  phone?: string;
  location?: string;
  summary: string;
  experience: {
    title: string;
    company: string;
    duration: string;
    achievements: string[];
  }[];
  skills: string[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
}

// Industry-specific keyword database for ATS optimization
const industryKeywords = {
  marketing: [
    'Digital Marketing', 'Content Strategy', 'SEO Optimization', 'SEM Management', 
    'Social Media Marketing', 'Brand Development', 'Market Research', 'Campaign Management',
    'Google Analytics', 'Google Ads', 'Facebook Ads', 'LinkedIn Marketing',
    'Email Marketing', 'Marketing Automation', 'Lead Generation', 'Conversion Optimization',
    'A/B Testing', 'Performance Marketing', 'Growth Hacking', 'Marketing Metrics',
    'Customer Acquisition', 'Retention Marketing', 'Influencer Marketing', 'PR Management'
  ],
  copywriting: [
    'Content Creation', 'Copywriting', 'Creative Writing', 'UX Writing', 'Technical Writing',
    'Blog Writing', 'Website Copy', 'Ad Copy', 'Email Copy', 'Landing Page Optimization',
    'Brand Voice', 'Content Marketing', 'Editorial Calendar', 'CMS Management',
    'WordPress', 'HubSpot', 'Mailchimp', 'Content Planning', 'SEO Writing',
    'Social Media Copy', 'Script Writing', 'Press Releases', 'Case Studies'
  ],
  strategy: [
    'Strategic Planning', 'Business Strategy', 'Market Analysis', 'Competitive Analysis',
    'Brand Strategy', 'Digital Strategy', 'Growth Strategy', 'Partnership Development',
    'Stakeholder Management', 'Project Management', 'Cross-functional Collaboration',
    'KPI Management', 'ROI Analysis', 'Budget Management', 'Team Leadership',
    'Client Relations', 'Business Development', 'Strategic Partnerships'
  ]
};

// Specific, results-oriented action verbs that ATS systems favor
const actionVerbs = [
  'Accelerated', 'Amplified', 'Architected', 'Boosted', 'Captured', 'Converted', 'Cultivated',
  'Delivered', 'Elevated', 'Engineered', 'Expanded', 'Facilitated', 'Generated', 'Maximized',
  'Mobilized', 'Orchestrated', 'Pioneered', 'Propelled', 'Quadrupled', 'Revolutionized',
  'Scaled', 'Spearheaded', 'Strengthened', 'Surpassed', 'Transformed', 'Tripled'
];

// Quantifiable achievement patterns for better ATS scoring
const achievementPatterns = {
  marketing: [
    'campaign performance by {metric}% through strategic optimization',
    'lead generation by {metric}% via targeted digital marketing initiatives',
    'brand awareness resulting in {metric}% increase in organic traffic',
    'social media engagement by {metric}% across all platforms',
    'customer acquisition cost by {metric}% while maintaining quality leads',
    'email campaign open rates to {metric}% above industry standard',
    'conversion rates by {metric}% through A/B testing and optimization'
  ],
  copywriting: [
    'content engagement rates by {metric}% through compelling copywriting',
    'website conversion rates by {metric}% via persuasive landing page copy',
    'click-through rates to {metric}% with optimized email subject lines',
    'content production efficiency by {metric}% while maintaining quality',
    'blog traffic by {metric}% through SEO-optimized content creation',
    'brand consistency across {metric}+ marketing materials and channels',
    'content marketing ROI by {metric}% through strategic messaging'
  ],
  strategy: [
    'revenue growth by {metric}% through strategic market expansion',
    'operational efficiency by {metric}% via process optimization',
    'market penetration in {metric} new segments within first quarter',
    'partnership portfolio by {metric}% resulting in expanded reach',
    'client retention rates to {metric}% through strategic relationship management',
    'project delivery speed by {metric}% while exceeding quality standards',
    'competitive positioning resulting in {metric}% market share increase'
  ]
};

export function optimizeForATS(originalContent: any): ATSOptimizedContent {
  // Extract role type to determine relevant keywords
  const title = originalContent.title || '';
  const isMarketing = /marketing|marketer|brand/i.test(title);
  const isCopywriting = /copy|writer|content/i.test(title);
  const isStrategy = /strategy|strategist|planning/i.test(title);

  // Build comprehensive skill set with ATS keywords
  let optimizedSkills: string[] = [];
  
  if (isMarketing) {
    optimizedSkills.push(...industryKeywords.marketing.slice(0, 12));
  }
  if (isCopywriting) {
    optimizedSkills.push(...industryKeywords.copywriting.slice(0, 10));
  }
  if (isStrategy) {
    optimizedSkills.push(...industryKeywords.strategy.slice(0, 8));
  }

  // Add original skills that don't duplicate
  if (originalContent.skills) {
    const uniqueOriginalSkills = originalContent.skills.filter((skill: string) => 
      !optimizedSkills.some(optSkill => 
        optSkill.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(optSkill.toLowerCase())
      )
    );
    optimizedSkills.push(...uniqueOriginalSkills);
  }

  // Optimize summary with ATS-friendly keywords
  const optimizedSummary = createATSSummary(originalContent, { isMarketing, isCopywriting, isStrategy });

  // Optimize experience with action verbs and quantifiable achievements
  const optimizedExperience = optimizeExperience(originalContent.experience || [], { isMarketing, isCopywriting, isStrategy });

  return {
    name: originalContent.name || 'Professional Candidate',
    title: enhanceJobTitle(originalContent.title || ''),
    email: originalContent.email || undefined,
    phone: originalContent.phone || undefined,
    location: originalContent.location || undefined,
    summary: optimizedSummary,
    experience: optimizedExperience,
    skills: optimizedSkills.slice(0, 25), // Limit to top 25 most relevant skills
    education: originalContent.education || [{
      degree: 'Bachelor\'s Degree in Marketing/Communications',
      institution: 'University',
      year: '2020'
    }]
  };
}

function createATSSummary(content: any, roles: { isMarketing: boolean; isCopywriting: boolean; isStrategy: boolean }): string {
  const { isMarketing, isCopywriting, isStrategy } = roles;
  
  let summary = 'Results-driven ';
  
  if (isMarketing && isCopywriting && isStrategy) {
    summary += 'Digital Marketing Strategist and Content Creator with proven expertise in developing comprehensive marketing campaigns, creating compelling copy, and driving strategic business initiatives. ';
  } else if (isMarketing && isCopywriting) {
    summary += 'Content Marketing Professional with extensive experience in digital marketing strategy, copywriting, and brand development. ';
  } else if (isMarketing && isStrategy) {
    summary += 'Marketing Strategist with strong background in digital marketing, brand strategy, and business development. ';
  } else if (isCopywriting && isStrategy) {
    summary += 'Strategic Content Creator with expertise in copywriting, content strategy, and cross-functional collaboration. ';
  } else if (isMarketing) {
    summary += 'Digital Marketing Professional with expertise in campaign management, social media marketing, and performance optimization. ';
  } else if (isCopywriting) {
    summary += 'Content Creator and Copywriter with strong skills in content marketing, brand voice development, and creative writing. ';
  } else if (isStrategy) {
    summary += 'Strategic Professional with experience in business planning, market analysis, and partnership development. ';
  } else {
    summary += 'Marketing and Communications Professional with diverse skills in content creation and strategic planning. ';
  }

  summary += 'Demonstrated success in client relationship management, project coordination, and delivering measurable results. ';
  summary += 'Proficient in Google Analytics, social media platforms, content management systems, and marketing automation tools. ';
  summary += 'Strong analytical skills with experience in performance tracking, A/B testing, and ROI optimization.';

  return summary;
}

function enhanceJobTitle(originalTitle: string): string {
  if (!originalTitle) return 'Digital Marketing & Content Strategy Professional';
  
  // Add ATS-friendly variations and keywords
  const title = originalTitle.toLowerCase();
  
  if (title.includes('content') && title.includes('market')) {
    return 'Content Marketing Strategist & Digital Marketing Professional';
  } else if (title.includes('copywriter') && title.includes('strategist')) {
    return 'Creative Copywriter & Marketing Strategist';
  } else if (title.includes('marketing') && title.includes('strategy')) {
    return 'Digital Marketing Strategist & Content Creator';
  } else {
    return originalTitle + ' | Digital Marketing Professional';
  }
}

function optimizeExperience(experiences: any[], roles: { isMarketing: boolean; isCopywriting: boolean; isStrategy: boolean }): any[] {
  const { isMarketing, isCopywriting, isStrategy } = roles;
  
  return experiences.map((exp, index) => {
    const optimizedAchievements = [];
    
    // Create role-specific, quantifiable achievements
    if (isMarketing) {
      optimizedAchievements.push(
        `${getRandomActionVerb()} ${getQuantifiableAchievement('marketing')}`,
        `${getRandomActionVerb()} ${getQuantifiableAchievement('marketing')}`,
        `${getRandomActionVerb()} comprehensive digital marketing campaigns across 5+ channels including Google Ads, Facebook, LinkedIn, and email marketing`
      );
    }
    
    if (isCopywriting) {
      optimizedAchievements.push(
        `${getRandomActionVerb()} ${getQuantifiableAchievement('copywriting')}`,
        `${getRandomActionVerb()} ${getQuantifiableAchievement('copywriting')}`,
        `${getRandomActionVerb()} 50+ pieces of high-converting copy including landing pages, email sequences, and ad creatives`
      );
    }
    
    if (isStrategy) {
      optimizedAchievements.push(
        `${getRandomActionVerb()} ${getQuantifiableAchievement('strategy')}`,
        `${getRandomActionVerb()} ${getQuantifiableAchievement('strategy')}`,
        `${getRandomActionVerb()} go-to-market strategies for 3+ product launches resulting in successful market entry`
      );
    }

    // Add general quantifiable business achievements
    optimizedAchievements.push(
      `${getRandomActionVerb()} cross-functional team productivity by 25% through streamlined project management processes`,
      `${getRandomActionVerb()} client satisfaction scores to 95%+ through proactive communication and quality deliverables`
    );

    return {
      title: exp.title || 'Marketing Professional',
      company: exp.company || 'Professional Organization',
      duration: exp.duration || '2023 - Present',
      achievements: optimizedAchievements.slice(0, 5) // Limit to 5 achievements per role
    };
  });
}

function getQuantifiableAchievement(role: 'marketing' | 'copywriting' | 'strategy'): string {
  const patterns = achievementPatterns[role];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  // Generate realistic metrics based on role
  let metric: number;
  if (role === 'marketing') {
    metric = Math.floor(Math.random() * 40) + 20; // 20-60% improvements
  } else if (role === 'copywriting') {
    metric = Math.floor(Math.random() * 35) + 15; // 15-50% improvements
  } else {
    metric = Math.floor(Math.random() * 30) + 10; // 10-40% improvements
  }
  
  return pattern.replace('{metric}', metric.toString());
}

function getRandomActionVerb(): string {
  return actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
}

// Function to integrate with existing resume enhancement
export function enhanceResumeWithATS(originalContent: any): any {
  const atsOptimized = optimizeForATS(originalContent);
  
  // Merge with original content, prioritizing ATS optimization
  return {
    ...originalContent,
    ...atsOptimized,
    // Keep original name, email, phone if they exist
    name: originalContent.name || atsOptimized.name,
    email: originalContent.email || atsOptimized.email,
    phone: originalContent.phone || atsOptimized.phone,
    location: originalContent.location || atsOptimized.location
  };
}
