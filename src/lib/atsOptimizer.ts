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

// Action verbs that ATS systems favor
const actionVerbs = [
  'Developed', 'Implemented', 'Managed', 'Led', 'Created', 'Optimized', 'Increased',
  'Decreased', 'Improved', 'Streamlined', 'Executed', 'Launched', 'Coordinated',
  'Collaborated', 'Analyzed', 'Generated', 'Delivered', 'Achieved', 'Exceeded',
  'Designed', 'Established', 'Built', 'Enhanced', 'Strategized', 'Drove'
];

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
    
    // Create role-specific, ATS-friendly achievements
    if (isMarketing) {
      optimizedAchievements.push(
        `${getRandomActionVerb()} comprehensive digital marketing campaigns across multiple channels including social media, email marketing, and paid advertising`,
        `${getRandomActionVerb()} SEO optimization strategies that improved organic search visibility and website traffic through keyword research and content optimization`,
        `${getRandomActionVerb()} social media marketing initiatives across platforms (Facebook, Instagram, LinkedIn, Twitter) to enhance brand presence and engagement`
      );
    }
    
    if (isCopywriting) {
      optimizedAchievements.push(
        `${getRandomActionVerb()} compelling copy for various marketing materials including website content, email campaigns, blog posts, and advertising materials`,
        `${getRandomActionVerb()} content marketing strategy and editorial calendar to ensure consistent brand messaging across all communication channels`,
        `${getRandomActionVerb()} UX writing and landing page optimization to improve user experience and conversion rates`
      );
    }
    
    if (isStrategy) {
      optimizedAchievements.push(
        `${getRandomActionVerb()} strategic marketing plans and go-to-market strategies in collaboration with cross-functional teams and stakeholders`,
        `${getRandomActionVerb()} competitive analysis and market research to identify opportunities for business growth and competitive advantage`,
        `${getRandomActionVerb()} client relationships and partnership development initiatives to expand business opportunities and revenue streams`
      );
    }

    // Add general business achievements
    optimizedAchievements.push(
      `${getRandomActionVerb()} project management and coordination across multiple initiatives while maintaining quality standards and meeting deadlines`,
      `${getRandomActionVerb()} with cross-functional teams including design, development, and sales to ensure alignment on business objectives and deliverables`
    );

    return {
      title: exp.title || 'Marketing Professional',
      company: exp.company || 'Professional Organization',
      duration: exp.duration || '2023 - Present',
      achievements: optimizedAchievements.slice(0, 5) // Limit to 5 achievements per role
    };
  });
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
