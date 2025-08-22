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
  const lowerTitle = title.toLowerCase();
  
  // Financial/Revenue achievements
  if (lowerAchievement.includes('sales') || lowerAchievement.includes('revenue') || lowerAchievement.includes('profit')) {
    activities.push('Conducting daily sales pipeline reviews and client outreach');
    activities.push('Analyzing market trends and competitor activity');
    activities.push('Preparing weekly sales forecasts and performance reports');
    activities.push('Negotiating contracts and pricing strategies with prospects');
  }
  
  // Team/Management achievements
  if (lowerAchievement.includes('team') || lowerAchievement.includes('manage') || lowerAchievement.includes('staff')) {
    activities.push('Facilitating weekly team meetings and performance reviews');
    activities.push('Providing coaching and mentorship to team members');
    activities.push('Managing team schedules and workload distribution');
    activities.push('Conducting recruitment interviews and talent assessments');
  }
  
  // Process/Efficiency achievements
  if (lowerAchievement.includes('process') || lowerAchievement.includes('efficiency') || lowerAchievement.includes('streamline')) {
    activities.push('Reviewing and optimizing operational workflows');
    activities.push('Documenting standard operating procedures');
    activities.push('Identifying bottlenecks and implementing process improvements');
    activities.push('Training staff on new procedures and best practices');
  }
  
  // Customer/Client achievements
  if (lowerAchievement.includes('customer') || lowerAchievement.includes('client') || lowerAchievement.includes('satisfaction')) {
    activities.push('Maintaining regular client communication and relationship building');
    activities.push('Monitoring customer feedback and service quality metrics');
    activities.push('Resolving escalated customer issues and complaints');
    activities.push('Conducting customer surveys and satisfaction assessments');
  }
  
  // Technology/System achievements
  if (lowerAchievement.includes('system') || lowerAchievement.includes('technology') || lowerAchievement.includes('software')) {
    activities.push('Overseeing daily system maintenance and performance monitoring');
    activities.push('Coordinating with technical teams on implementation progress');
    activities.push('Reviewing system logs and troubleshooting technical issues');
    activities.push('Managing software updates and security patches');
  }
  
  // Project achievements
  if (lowerAchievement.includes('project') || lowerAchievement.includes('initiative') || lowerAchievement.includes('launch')) {
    activities.push('Tracking project milestones and deliverable completion');
    activities.push('Coordinating cross-functional team collaboration');
    activities.push('Managing project budgets and resource allocation');
    activities.push('Conducting risk assessments and mitigation planning');
  }
  
  // Quality/Compliance achievements
  if (lowerAchievement.includes('quality') || lowerAchievement.includes('compliance') || lowerAchievement.includes('standard')) {
    activities.push('Conducting regular quality assurance checks and audits');
    activities.push('Ensuring adherence to regulatory and company standards');
    activities.push('Developing quality control procedures and testing protocols');
    activities.push('Training teams on compliance requirements and policies');
  }
  
  // Budget/Cost achievements
  if (lowerAchievement.includes('budget') || lowerAchievement.includes('cost') || lowerAchievement.includes('saving')) {
    activities.push('Monitoring daily expenditures and budget allocations');
    activities.push('Reviewing vendor contracts and cost optimization opportunities');
    activities.push('Preparing monthly financial reports and variance analysis');
    activities.push('Negotiating supplier agreements and procurement strategies');
  }
  
  // If no specific patterns matched, generate role-based activities
  if (activities.length === 0) {
    if (lowerTitle.includes('manager') || lowerTitle.includes('director') || lowerTitle.includes('lead')) {
      activities.push('Overseeing daily operational activities and team coordination');
      activities.push('Making strategic decisions and resource allocation');
    } else if (lowerTitle.includes('analyst') || lowerTitle.includes('specialist')) {
      activities.push('Conducting daily data analysis and reporting');
      activities.push('Researching industry trends and best practices');
    } else if (lowerTitle.includes('developer') || lowerTitle.includes('engineer')) {
      activities.push('Writing and reviewing code according to project requirements');
      activities.push('Participating in technical discussions and problem-solving');
    } else {
      activities.push('Managing day-to-day operational responsibilities');
      activities.push('Collaborating with stakeholders on ongoing initiatives');
    }
  }
  
  return activities;
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
 * Generates activities specific to the experience index (seniority level)
 */
function generateExperienceSpecificActivities(title: string, experienceIndex: number): string[] {
  const lowerTitle = title.toLowerCase();
  const activities: string[] = [];
  
  if (experienceIndex === 0) {
    // Most recent/senior experience - strategic activities
    if (lowerTitle.includes('manager') || lowerTitle.includes('director') || lowerTitle.includes('lead')) {
      activities.push('Developing long-term strategic plans and vision');
      activities.push('Leading board presentations and stakeholder meetings');
      activities.push('Mentoring senior staff and succession planning');
    } else {
      activities.push('Leading cross-functional initiatives and innovation projects');
      activities.push('Serving as subject matter expert and technical advisor');
      activities.push('Driving continuous improvement and best practice adoption');
    }
  } else if (experienceIndex === 1) {
    // Second experience - operational excellence
    if (lowerTitle.includes('manager') || lowerTitle.includes('director') || lowerTitle.includes('lead')) {
      activities.push('Implementing operational improvements and efficiency measures');
      activities.push('Managing departmental budgets and performance metrics');
      activities.push('Coordinating with senior leadership on strategic initiatives');
    } else {
      activities.push('Managing complex projects and client relationships');
      activities.push('Training and mentoring junior team members');
      activities.push('Analyzing performance data and recommending improvements');
    }
  } else {
    // Earlier experiences - foundational activities
    if (lowerTitle.includes('manager') || lowerTitle.includes('director') || lowerTitle.includes('lead')) {
      activities.push('Building team capabilities and establishing processes');
      activities.push('Developing standard operating procedures and workflows');
      activities.push('Managing day-to-day operations and team development');
    } else {
      activities.push('Contributing to team projects and collaborative initiatives');
      activities.push('Learning industry best practices and developing expertise');
      activities.push('Supporting senior staff with research and analysis');
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