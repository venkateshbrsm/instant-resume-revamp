// Core responsibilities extraction utility to avoid code duplication across templates

// Global tracker for used responsibilities across all work experiences
const globalUsedResponsibilities = new Set<string>();

/**
 * Extracts core everyday responsibilities that would lead to the achievements stated in the resume
 * Generates the underlying daily activities that collectively make the achievements happen
 * Ensures each work experience gets unique responsibilities
 */
export function extractCoreResponsibilities(
  achievements: string[] | undefined,
  title: string,
  templateType: 'classic' | 'modern' | 'minimalist' | 'creative',
  experienceIndex: number = 0,
  maxResponsibilities: number = 4
): string[] {
  // Reset global tracker on first experience
  if (experienceIndex === 0) {
    globalUsedResponsibilities.clear();
  }

  // If no achievements provided, return empty array
  if (!achievements || achievements.length === 0) {
    return [];
  }

  const uniqueResponsibilities: string[] = [];
  
  // Generate a larger pool of activities specific to this experience
  const activityPool = generateActivityPoolForExperience(achievements, title, experienceIndex);
  
  // Select unique activities that haven't been used in other experiences
  for (const activity of activityPool) {
    if (uniqueResponsibilities.length >= maxResponsibilities) break;
    
    if (!globalUsedResponsibilities.has(activity)) {
      uniqueResponsibilities.push(activity);
      globalUsedResponsibilities.add(activity);
    }
  }

  // If we don't have enough unique activities, generate fallback activities
  if (uniqueResponsibilities.length < maxResponsibilities) {
    const fallbackActivities = generateFallbackActivities(title, experienceIndex, maxResponsibilities - uniqueResponsibilities.length);
    for (const activity of fallbackActivities) {
      if (uniqueResponsibilities.length >= maxResponsibilities) break;
      if (!globalUsedResponsibilities.has(activity)) {
        uniqueResponsibilities.push(activity);
        globalUsedResponsibilities.add(activity);
      }
    }
  }

  return uniqueResponsibilities;
}

/**
 * Generates everyday activities that would logically lead to a specific achievement
 */
function generateDailyActivitiesFromAchievement(achievement: string, title: string): string[] {
  const activities: string[] = [];
  const lowerAchievement = achievement.toLowerCase();
  
  // Extract specific numbers, percentages, or metrics to make activities specific
  const numbers = achievement.match(/\d+(\.\d+)?%?/g) || [];
  const hasPercentage = achievement.includes('%');
  const hasDollarAmount = achievement.includes('$') || lowerAchievement.includes('revenue') || lowerAchievement.includes('cost');
  
  // Analyze the specific achievement content to generate relevant activities
  if (lowerAchievement.includes('increased') || lowerAchievement.includes('improved') || lowerAchievement.includes('boosted')) {
    if (lowerAchievement.includes('sales') || lowerAchievement.includes('revenue')) {
      activities.push(`Conducting daily sales calls and tracking conversion rates from ${numbers[0] || 'current'} metrics`);
      activities.push(`Analyzing customer purchase patterns to identify upselling opportunities`);
    } else if (lowerAchievement.includes('efficiency') || lowerAchievement.includes('productivity')) {
      activities.push(`Monitoring daily workflow bottlenecks and timing process steps`);
      activities.push(`Implementing small workflow adjustments based on efficiency measurements`);
    } else if (lowerAchievement.includes('customer') || lowerAchievement.includes('satisfaction')) {
      activities.push(`Following up with customers within 24 hours of service interactions`);
      activities.push(`Documenting customer feedback and tracking resolution times`);
    }
  }
  
  if (lowerAchievement.includes('reduced') || lowerAchievement.includes('decreased') || lowerAchievement.includes('cut')) {
    if (lowerAchievement.includes('cost') || lowerAchievement.includes('expense')) {
      activities.push(`Reviewing daily expenses and comparing against budget targets`);
      activities.push(`Negotiating with suppliers and tracking cost savings initiatives`);
    } else if (lowerAchievement.includes('time') || lowerAchievement.includes('processing')) {
      activities.push(`Timing current processes and identifying time-saving opportunities`);
      activities.push(`Testing streamlined procedures and measuring time improvements`);
    } else if (lowerAchievement.includes('error') || lowerAchievement.includes('defect')) {
      activities.push(`Conducting quality checks and documenting error patterns`);
      activities.push(`Training team members on error prevention techniques`);
    }
  }
  
  if (lowerAchievement.includes('implemented') || lowerAchievement.includes('launched') || lowerAchievement.includes('established')) {
    if (lowerAchievement.includes('system') || lowerAchievement.includes('software') || lowerAchievement.includes('platform')) {
      activities.push(`Testing system functionality and documenting user requirements`);
      activities.push(`Training staff on new system features and troubleshooting issues`);
    } else if (lowerAchievement.includes('process') || lowerAchievement.includes('procedure')) {
      activities.push(`Creating step-by-step procedure documentation and training materials`);
      activities.push(`Monitoring process adoption and collecting feedback from users`);
    } else if (lowerAchievement.includes('program') || lowerAchievement.includes('initiative')) {
      activities.push(`Coordinating program activities and tracking participation metrics`);
      activities.push(`Collecting feedback from program participants and stakeholders`);
    }
  }
  
  if (lowerAchievement.includes('managed') || lowerAchievement.includes('led') || lowerAchievement.includes('supervised')) {
    if (lowerAchievement.includes('team') || lowerAchievement.includes('staff')) {
      const teamSize = numbers.find(n => parseInt(n) < 100) || 'team';
      activities.push(`Conducting weekly one-on-ones with ${teamSize} team members`);
      activities.push(`Assigning daily tasks and monitoring progress through team check-ins`);
    } else if (lowerAchievement.includes('project')) {
      activities.push(`Tracking project milestones and updating stakeholders on progress`);
      activities.push(`Coordinating deliverables between team members and external partners`);
    }
  }
  
  if (lowerAchievement.includes('developed') || lowerAchievement.includes('created') || lowerAchievement.includes('designed')) {
    if (lowerAchievement.includes('training') || lowerAchievement.includes('program')) {
      activities.push(`Researching training needs and developing curriculum content`);
      activities.push(`Conducting training sessions and collecting participant feedback`);
    } else if (lowerAchievement.includes('report') || lowerAchievement.includes('dashboard')) {
      activities.push(`Collecting daily data inputs and validating report accuracy`);
      activities.push(`Meeting with stakeholders to review report requirements and updates`);
    } else if (lowerAchievement.includes('strategy') || lowerAchievement.includes('plan')) {
      activities.push(`Researching market conditions and competitive landscape daily`);
      activities.push(`Meeting with department heads to gather input on strategic initiatives`);
    }
  }
  
  // If achievement mentions specific industries, tools, or domains, make activities specific
  if (lowerAchievement.includes('crm') || lowerAchievement.includes('salesforce')) {
    activities.push('Updating CRM records and maintaining data accuracy daily');
  }
  if (lowerAchievement.includes('excel') || lowerAchievement.includes('spreadsheet')) {
    activities.push('Building and maintaining Excel models for data analysis');
  }
  if (lowerAchievement.includes('social media') || lowerAchievement.includes('digital marketing')) {
    activities.push('Creating daily social media content and monitoring engagement metrics');
  }
  
  // If no specific patterns found, extract key nouns/verbs and create related activities
  if (activities.length === 0) {
    // Extract key action words and objects from the achievement
    const keyWords = extractKeyTerms(achievement);
    if (keyWords.length > 0) {
      activities.push(`Managing daily activities related to ${keyWords[0]} operations`);
      activities.push(`Monitoring and reporting on ${keyWords[0]} performance metrics`);
    }
  }
  
  return activities;
}

/**
 * Extracts key terms from achievement text to make activities more specific
 */
function extractKeyTerms(achievement: string): string[] {
  const text = achievement.toLowerCase();
  const terms: string[] = [];
  
  // Extract business domain terms
  const domains = ['sales', 'marketing', 'operations', 'finance', 'hr', 'it', 'customer service', 'logistics', 'procurement', 'quality assurance'];
  domains.forEach(domain => {
    if (text.includes(domain)) terms.push(domain);
  });
  
  // Extract specific tools/systems mentioned
  const tools = ['excel', 'crm', 'erp', 'sql', 'tableau', 'powerbi', 'salesforce', 'sap'];
  tools.forEach(tool => {
    if (text.includes(tool)) terms.push(tool);
  });
  
  return terms;
}

/**
 * Generates a pool of activities specific to a work experience
 */
function generateActivityPoolForExperience(achievements: string[], title: string, experienceIndex: number): string[] {
  const allActivities: string[] = [];
  
  // Generate activities from all achievements
  for (const achievement of achievements) {
    const activities = generateDailyActivitiesFromAchievement(achievement, title);
    allActivities.push(...activities);
  }
  
  // Add experience-specific variations based on index
  const experienceVariations = generateExperienceSpecificActivities(title, experienceIndex);
  allActivities.push(...experienceVariations);
  
  // Remove duplicates and shuffle for variety
  const uniqueActivities = Array.from(new Set(allActivities));
  return shuffleArray(uniqueActivities);
}

/**
 * Generates activities specific to the experience index (appropriate for actual job levels)
 */
function generateExperienceSpecificActivities(title: string, experienceIndex: number): string[] {
  const lowerTitle = title.toLowerCase();
  const activities: string[] = [];
  
  if (experienceIndex === 0) {
    // Most recent experience - more responsibility but still realistic
    if (lowerTitle.includes('manager') || lowerTitle.includes('director')) {
      activities.push('Approving team requests and handling escalations');
      activities.push('Reviewing monthly department reports and metrics');
      activities.push('Conducting staff meetings and performance check-ins');
    } else if (lowerTitle.includes('senior') || lowerTitle.includes('lead')) {
      activities.push('Mentoring junior staff and reviewing their work');
      activities.push('Leading project meetings and status updates');
      activities.push('Making technical decisions and recommendations');
    } else {
      activities.push('Taking on additional project responsibilities');
      activities.push('Training new team members on processes');
      activities.push('Representing the team in cross-departmental meetings');
    }
  } else if (experienceIndex === 1) {
    // Second experience - solid contributor level
    if (lowerTitle.includes('manager') || lowerTitle.includes('director')) {
      activities.push('Managing daily team operations and workflow');
      activities.push('Handling budget tracking and expense approvals');
      activities.push('Coordinating with other department managers');
    } else if (lowerTitle.includes('senior') || lowerTitle.includes('lead')) {
      activities.push('Overseeing specific project components');
      activities.push('Reviewing and quality-checking team deliverables');
      activities.push('Participating in planning and resource allocation');
    } else {
      activities.push('Managing assigned projects from start to finish');
      activities.push('Collaborating with multiple departments on initiatives');
      activities.push('Contributing to process improvements and suggestions');
    }
  } else {
    // Earlier experiences - learning and contributing
    if (lowerTitle.includes('manager') || lowerTitle.includes('director')) {
      activities.push('Learning company procedures and management systems');
      activities.push('Building relationships with team members and peers');
      activities.push('Focusing on immediate team needs and daily operations');
    } else if (lowerTitle.includes('senior') || lowerTitle.includes('lead')) {
      activities.push('Developing expertise in specific technical areas');
      activities.push('Supporting team goals and departmental objectives');
      activities.push('Building professional relationships and networks');
    } else {
      activities.push('Learning job-specific skills and company procedures');
      activities.push('Completing assigned tasks and meeting expectations');
      activities.push('Participating in team activities and training programs');
    }
  }
  
  return activities;
}

/**
 * Generates fallback activities when not enough unique activities are found
 */
function generateFallbackActivities(title: string, experienceIndex: number, count: number): string[] {
  const lowerTitle = title.toLowerCase();
  const fallbacks: string[] = [];
  
  const genericActivities = [
    'Collaborating with cross-functional teams on key initiatives',
    'Preparing detailed reports and presentations for leadership',
    'Participating in strategic planning and decision-making processes',
    'Maintaining industry knowledge and professional development',
    'Managing stakeholder communications and relationship building',
    'Overseeing project timelines and deliverable quality',
    'Conducting regular performance assessments and feedback sessions',
    'Implementing organizational policies and compliance measures',
    'Facilitating knowledge transfer and documentation processes',
    'Supporting business continuity and risk management activities'
  ];
  
  // Add role-specific fallbacks
  if (lowerTitle.includes('sales') || lowerTitle.includes('business development')) {
    fallbacks.push('Managing client portfolio and relationship development');
    fallbacks.push('Conducting market research and competitive analysis');
  } else if (lowerTitle.includes('marketing')) {
    fallbacks.push('Coordinating marketing campaigns and brand initiatives');
    fallbacks.push('Analyzing campaign performance and ROI metrics');
  } else if (lowerTitle.includes('finance') || lowerTitle.includes('accounting')) {
    fallbacks.push('Managing financial reporting and budget oversight');
    fallbacks.push('Conducting financial analysis and variance reporting');
  } else if (lowerTitle.includes('hr') || lowerTitle.includes('human resources')) {
    fallbacks.push('Managing employee relations and performance management');
    fallbacks.push('Coordinating recruitment and talent acquisition processes');
  }
  
  // Combine and filter based on experience index
  const allFallbacks = [...fallbacks, ...genericActivities];
  const startIndex = experienceIndex * 2; // Offset to get different activities for each experience
  
  return allFallbacks.slice(startIndex, startIndex + count);
}

/**
 * Shuffles an array to provide variety
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}