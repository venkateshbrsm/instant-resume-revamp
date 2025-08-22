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
  
  // Extract specific context from the achievement
  const context = extractSpecificContext(achievement);
  const metrics = extractMetrics(achievement);
  const actions = extractActionWords(achievement);
  const objects = extractBusinessObjects(achievement);
  
  // Generate highly specific activities based on the exact achievement content
  if (actions.includes('increased') || actions.includes('improved') || actions.includes('boosted')) {
    if (objects.includes('sales') && metrics.percentage) {
      activities.push(`Conducting daily prospect research and lead qualification to build pipeline for ${metrics.percentage} sales growth`);
      activities.push(`Tracking daily sales activities and conversion rates against ${metrics.percentage} target increase`);
    } else if (objects.includes('efficiency') && metrics.percentage) {
      activities.push(`Monitoring current process completion times to identify ${metrics.percentage} efficiency improvement opportunities`);
      activities.push(`Testing workflow modifications and measuring time savings toward ${metrics.percentage} efficiency goal`);
    } else if (objects.includes('customer satisfaction') && metrics.percentage) {
      activities.push(`Following up with customers within 2 hours to ensure satisfaction scores meet ${metrics.percentage} improvement target`);
      activities.push(`Documenting customer feedback patterns to support ${metrics.percentage} satisfaction increase initiative`);
    } else if (objects.includes('revenue') && metrics.amount) {
      activities.push(`Managing key accounts and upselling opportunities to contribute to ${metrics.amount} revenue increase`);
      activities.push(`Analyzing customer purchase history to identify revenue growth opportunities worth ${metrics.amount}`);
    }
  }
  
  if (actions.includes('reduced') || actions.includes('decreased') || actions.includes('cut')) {
    if (objects.includes('costs') && metrics.amount) {
      activities.push(`Reviewing daily vendor invoices and expense reports to identify ${metrics.amount} cost reduction opportunities`);
      activities.push(`Negotiating with suppliers and tracking savings initiatives toward ${metrics.amount} cost reduction goal`);
    } else if (objects.includes('processing time') && metrics.timeUnit) {
      activities.push(`Timing each step of current process to eliminate ${metrics.timeUnit} from processing time`);
      activities.push(`Implementing process shortcuts and measuring time reductions against ${metrics.timeUnit} target`);
    } else if (objects.includes('errors') && metrics.percentage) {
      activities.push(`Implementing quality checks at each process step to achieve ${metrics.percentage} error reduction`);
      activities.push(`Training team on error prevention techniques to reach ${metrics.percentage} error decrease target`);
    }
  }
  
  if (actions.includes('implemented') || actions.includes('launched') || actions.includes('deployed')) {
    if (context.system) {
      activities.push(`Configuring ${context.system} system settings and user permissions for department rollout`);
      activities.push(`Training ${context.teamSize || 'team members'} on ${context.system} functionality and daily usage`);
      activities.push(`Monitoring ${context.system} system performance and resolving user issues during implementation`);
    } else if (context.process) {
      activities.push(`Creating detailed documentation for ${context.process} implementation across departments`);
      activities.push(`Conducting pilot testing of ${context.process} with select team members before full rollout`);
      activities.push(`Collecting feedback on ${context.process} effectiveness and making daily adjustments`);
    } else if (context.program) {
      activities.push(`Coordinating ${context.program} launch activities and participant onboarding`);
      activities.push(`Tracking ${context.program} participation rates and gathering participant feedback`);
    }
  }
  
  if (actions.includes('managed') || actions.includes('led') || actions.includes('supervised')) {
    if (context.teamSize) {
      activities.push(`Conducting weekly one-on-ones with ${context.teamSize} direct reports on performance and development`);
      activities.push(`Assigning daily tasks to ${context.teamSize} team members based on priorities and deadlines`);
      activities.push(`Reviewing work quality from ${context.teamSize} team members and providing constructive feedback`);
    } else if (context.project) {
      activities.push(`Updating stakeholders on ${context.project} progress through daily status reports`);
      activities.push(`Coordinating ${context.project} deliverables between internal teams and external vendors`);
      activities.push(`Managing ${context.project} timeline and resource allocation to meet deadlines`);
    } else if (context.budget) {
      activities.push(`Monitoring daily expenses against ${context.budget} budget allocations and spending limits`);
      activities.push(`Reviewing and approving purchase requests within ${context.budget} budget parameters`);
    }
  }
  
  if (actions.includes('developed') || actions.includes('created') || actions.includes('designed')) {
    if (context.training) {
      activities.push(`Researching ${context.training} training content and developing curriculum materials`);
      activities.push(`Conducting ${context.training} training sessions and collecting participant evaluation feedback`);
      activities.push(`Updating ${context.training} training materials based on participant performance and feedback`);
    } else if (context.reports) {
      activities.push(`Collecting daily data inputs for ${context.reports} reporting and validation`);
      activities.push(`Analyzing trends in ${context.reports} data and preparing summary insights`);
      activities.push(`Meeting with stakeholders to review ${context.reports} requirements and format updates`);
    } else if (context.strategy) {
      activities.push(`Researching market conditions and competitive analysis for ${context.strategy} development`);
      activities.push(`Meeting with department heads to gather input on ${context.strategy} implementation`);
    }
  }
  
  // If no specific patterns matched, extract key business terms and create contextual activities
  if (activities.length === 0) {
    const keyTerms = extractKeyBusinessTerms(achievement);
    if (keyTerms.length > 0) {
      activities.push(`Managing daily operations related to ${keyTerms[0]} initiatives and objectives`);
      activities.push(`Monitoring ${keyTerms[0]} performance metrics and progress indicators`);
    } else {
      // Generate role-appropriate activities based on title
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('manager') || lowerTitle.includes('director')) {
        activities.push('Overseeing daily departmental operations and team coordination');
        activities.push('Reviewing performance metrics and providing strategic guidance');
      } else if (lowerTitle.includes('analyst') || lowerTitle.includes('specialist')) {
        activities.push('Conducting daily data analysis and performance monitoring');
        activities.push('Preparing detailed reports and recommendations for management');
      } else {
        activities.push('Executing core operational responsibilities and deliverables');
        activities.push('Collaborating with team members on daily objectives and tasks');
      }
    }
  }
  
  return activities;
}

/**
 * Extracts specific context from achievement text
 */
function extractSpecificContext(achievement: string): any {
  const context: any = {};
  const text = achievement.toLowerCase();
  
  // Extract team size
  const teamSizeMatch = text.match(/(\d+)[-\s]*(member|person|people|staff|employee|team)/);
  if (teamSizeMatch) {
    context.teamSize = `${teamSizeMatch[1]} ${teamSizeMatch[2]}${teamSizeMatch[2] === 'person' ? 's' : ''}`;
  }
  
  // Extract specific systems/tools
  const systems = ['salesforce', 'sap', 'oracle', 'excel', 'powerbi', 'tableau', 'crm', 'erp', 'sharepoint', 'sql', 'aws', 'azure'];
  systems.forEach(system => {
    if (text.includes(system)) context.system = system;
  });
  
  // Extract specific processes
  const processWords = ['onboarding', 'procurement', 'workflow', 'procedure', 'protocol', 'methodology'];
  processWords.forEach(proc => {
    if (text.includes(proc)) context.process = proc;
  });
  
  // Extract programs
  const programWords = ['training program', 'initiative', 'campaign', 'project', 'rollout'];
  programWords.forEach(prog => {
    if (text.includes(prog)) context.program = prog;
  });
  
  // Extract budget amounts
  const budgetMatch = text.match(/\$[\d,.]+(k|m|million|thousand)?/);
  if (budgetMatch) {
    context.budget = budgetMatch[0];
  }
  
  return context;
}

/**
 * Extracts metrics from achievement text
 */
function extractMetrics(achievement: string): any {
  const metrics: any = {};
  
  // Extract percentages
  const percentageMatch = achievement.match(/(\d+(?:\.\d+)?)%/);
  if (percentageMatch) {
    metrics.percentage = percentageMatch[0];
  }
  
  // Extract dollar amounts
  const amountMatch = achievement.match(/\$[\d,.]+(k|m|million|thousand)?/);
  if (amountMatch) {
    metrics.amount = amountMatch[0];
  }
  
  // Extract time units
  const timeMatch = achievement.match(/(\d+)\s*(hours?|days?|weeks?|months?)/);
  if (timeMatch) {
    metrics.timeUnit = `${timeMatch[1]} ${timeMatch[2]}`;
  }
  
  return metrics;
}

/**
 * Extracts action words from achievement
 */
function extractActionWords(achievement: string): string[] {
  const actions = ['increased', 'decreased', 'improved', 'reduced', 'implemented', 'launched', 'developed', 'created', 'managed', 'led', 'supervised', 'established', 'optimized', 'streamlined', 'boosted', 'enhanced', 'delivered', 'executed', 'coordinated', 'built', 'designed', 'deployed'];
  return actions.filter(action => achievement.toLowerCase().includes(action));
}

/**
 * Extracts business objects from achievement
 */
function extractBusinessObjects(achievement: string): string[] {
  const objects = ['sales', 'revenue', 'costs', 'efficiency', 'productivity', 'customer satisfaction', 'processing time', 'errors', 'quality', 'team', 'project', 'system', 'process', 'training', 'budget'];
  return objects.filter(obj => achievement.toLowerCase().includes(obj));
}

/**
 * Extracts key business terms for fallback activities
 */
function extractKeyBusinessTerms(achievement: string): string[] {
  const terms = achievement.toLowerCase().match(/\b(sales|marketing|operations|finance|hr|customer|client|project|team|system|process|training|quality|budget|revenue|cost|efficiency|productivity)\w*\b/g) || [];
  return [...new Set(terms)];
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