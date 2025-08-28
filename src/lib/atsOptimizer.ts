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
    'comprehensive digital marketing campaigns across multiple channels including Google Ads, social media, and email marketing',
    'brand awareness and market penetration through strategic content marketing and SEO optimization',
    'lead generation programs that consistently exceeded target goals through multi-channel acquisition strategies',
    'social media engagement and community building across LinkedIn, Facebook, Instagram, and Twitter platforms',
    'customer acquisition cost optimization while maintaining high-quality lead generation standards',
    'email marketing campaigns with compelling subject lines and conversion-focused content',
    'marketing automation workflows that streamlined lead nurturing and customer onboarding processes'
  ],
  copywriting: [
    'high-converting copy for landing pages, email campaigns, and digital advertising materials',
    'content marketing strategy development including editorial calendars and brand voice guidelines',
    'website copy optimization that enhanced user experience and supported business objectives',
    'compelling blog content and thought leadership articles that established industry authority',
    'persuasive sales copy for product launches and promotional campaigns',
    'brand messaging consistency across all marketing materials and communication channels',
    'SEO-optimized content creation that improved organic search visibility and website traffic'
  ],
  strategy: [
    'comprehensive business strategies that aligned with organizational goals and market opportunities',
    'competitive analysis and market research initiatives that informed strategic decision-making',
    'partnership development programs that expanded market reach and revenue opportunities',
    'cross-functional collaboration frameworks that improved team efficiency and project outcomes',
    'client relationship management systems that enhanced satisfaction and retention rates',
    'go-to-market strategies for new product launches and market expansion initiatives',
    'process optimization initiatives that streamlined operations and improved team productivity'
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
    
    // Create role-specific achievements with strong action verbs
    if (isMarketing) {
      optimizedAchievements.push(
        `${getRandomActionVerb()} ${getAchievementPattern('marketing')}`,
        `${getRandomActionVerb()} ${getAchievementPattern('marketing')}`,
        `${getRandomActionVerb()} integrated marketing campaigns that enhanced brand visibility across digital and traditional channels`
      );
    }
    
    if (isCopywriting) {
      optimizedAchievements.push(
        `${getRandomActionVerb()} ${getAchievementPattern('copywriting')}`,
        `${getRandomActionVerb()} ${getAchievementPattern('copywriting')}`,
        `${getRandomActionVerb()} content libraries and style guides that ensured consistent brand messaging across all touchpoints`
      );
    }
    
    if (isStrategy) {
      optimizedAchievements.push(
        `${getRandomActionVerb()} ${getAchievementPattern('strategy')}`,
        `${getRandomActionVerb()} ${getAchievementPattern('strategy')}`,
        `${getRandomActionVerb()} strategic initiatives that drove business growth and competitive advantage in target markets`
      );
    }

    // Add general business achievements
    optimizedAchievements.push(
      `${getRandomActionVerb()} cross-functional team collaboration and project coordination to ensure timely delivery of high-quality results`,
      `${getRandomActionVerb()} client relationships and stakeholder engagement through proactive communication and exceptional service delivery`
    );

    return {
      title: exp.title || 'Marketing Professional',
      company: exp.company || 'Professional Organization',
      duration: exp.duration || '2023 - Present',
      achievements: optimizedAchievements.slice(0, 5) // Limit to 5 achievements per role
    };
  });
}

function getAchievementPattern(role: 'marketing' | 'copywriting' | 'strategy'): string {
  const patterns = achievementPatterns[role];
  return patterns[Math.floor(Math.random() * patterns.length)];
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
