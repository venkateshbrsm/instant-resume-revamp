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
      // Generate granular, tactical activities based on title
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('manager') || lowerTitle.includes('director')) {
        activities.push('Conducting daily team check-ins and task assignment reviews');
        activities.push('Responding to escalated issues and providing immediate solutions');
      } else if (lowerTitle.includes('analyst') || lowerTitle.includes('specialist')) {
        activities.push('Processing daily data inputs and running analysis reports');
        activities.push('Updating spreadsheets and databases with current information');
      } else if (lowerTitle.includes('coordinator')) {
        activities.push('Scheduling daily meetings and tracking project deliverables');
        activities.push('Following up with team members on task completion status');
      } else {
        activities.push('Completing assigned daily tasks and meeting deadlines');
        activities.push('Participating in team meetings and updating progress status');
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
      activities.push('Processing daily team requests and approving time-off submissions');
      activities.push('Reviewing individual task assignments and updating project schedules');
      activities.push('Conducting brief daily stand-ups and addressing immediate issues');
    } else if (lowerTitle.includes('senior') || lowerTitle.includes('lead')) {
      activities.push('Reviewing junior staff work and providing detailed feedback');
      activities.push('Updating project status reports and attending coordination meetings');
      activities.push('Making technical decisions on daily implementation challenges');
    } else {
      activities.push('Taking on additional daily tasks and supporting team objectives');
      activities.push('Training new team members on specific procedures and tools');
      activities.push('Attending departmental meetings and sharing project updates');
    }
  } else if (experienceIndex === 1) {
    // Second experience - solid contributor level
    if (lowerTitle.includes('manager') || lowerTitle.includes('director')) {
      activities.push('Managing daily team schedules and task assignments');
      activities.push('Tracking daily expenses and processing purchase approvals');
      activities.push('Attending weekly manager meetings and sharing team updates');
    } else if (lowerTitle.includes('senior') || lowerTitle.includes('lead')) {
      activities.push('Managing specific project tasks and tracking daily progress');
      activities.push('Quality-checking team deliverables before client submission');
      activities.push('Participating in daily planning sessions and resource discussions');
    } else {
      activities.push('Managing assigned project components from start to completion');
      activities.push('Coordinating daily activities with multiple departments');
      activities.push('Contributing daily improvement suggestions and feedback');
    }
  } else {
    // Earlier experiences - learning and contributing
    if (lowerTitle.includes('manager') || lowerTitle.includes('director')) {
      activities.push('Learning daily management procedures and system workflows');
      activities.push('Building working relationships through daily team interactions');
      activities.push('Handling immediate team requests and basic operational tasks');
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
    'Coordinating daily team activities and cross-functional communications',
    'Preparing weekly status reports and updating project documentation',
    'Attending daily planning meetings and contributing to decisions',
    'Reviewing industry updates and applying best practices to daily work',
    'Managing daily stakeholder communications and follow-ups',
    'Tracking daily project timelines and deliverable progress',
    'Conducting weekly performance check-ins and providing feedback',
    'Implementing daily policy procedures and compliance checks',
    'Facilitating daily knowledge sharing and team coordination',
    'Supporting daily business operations and addressing immediate needs'
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

// Global tracker for used leadership learnings across all work experiences
const globalUsedLeadershipLearnings = new Set<string>();

/**
 * Extracts leadership learnings from work experience achievements
 * Ensures each work experience gets unique leadership insights
 */
export function extractLeadershipLearnings(
  achievements: string[] | undefined,
  title: string,
  company: string,
  experienceIndex: number = 0
): string {
  // Reset global tracker on first experience
  if (experienceIndex === 0) {
    globalUsedLeadershipLearnings.clear();
  }
  if (!achievements || achievements.length === 0) {
    return 'Developed foundational leadership skills through hands-on experience managing daily operations and team coordination.';
  }

  const allLearnings: string[] = [];
  const lowerTitle = title.toLowerCase();
  
  // Analyze achievements to extract leadership insights
  achievements.forEach(achievement => {
    const lowerAchievement = achievement.toLowerCase();
    
    // Team leadership learnings
    if (lowerAchievement.includes('team') || lowerAchievement.includes('staff') || lowerAchievement.includes('managed')) {
      const teamSize = achievement.match(/(\d+)[-\s]*(member|person|people|staff|employee)/);
      if (teamSize) {
        allLearnings.push(`Learned to effectively manage ${teamSize[1]} team members through clear communication and performance accountability`);
        allLearnings.push(`Developed team-building skills by coordinating ${teamSize[1]} staff members across multiple projects and deadlines`);
        allLearnings.push(`Enhanced delegation capabilities while overseeing ${teamSize[1]} direct reports and maintaining productivity standards`);
      } else {
        allLearnings.push('Developed team leadership skills through direct staff management and performance coaching');
        allLearnings.push('Strengthened interpersonal leadership through team conflict resolution and motivation techniques');
        allLearnings.push('Enhanced team dynamics understanding through collaborative goal-setting and progress tracking');
      }
    }
    
    // Process improvement learnings
    if (lowerAchievement.includes('improved') || lowerAchievement.includes('increased') || lowerAchievement.includes('streamlined')) {
      const metrics = achievement.match(/(\d+(?:\.\d+)?)%/);
      if (metrics) {
        allLearnings.push(`Mastered process optimization by achieving ${metrics[0]} improvement through systematic analysis and implementation`);
        allLearnings.push(`Developed analytical leadership skills by driving ${metrics[0]} performance enhancement through data-driven decisions`);
        allLearnings.push(`Cultivated continuous improvement mindset while delivering ${metrics[0]} operational enhancement`);
      } else {
        allLearnings.push('Gained expertise in operational improvement through methodical process analysis and team engagement');
        allLearnings.push('Developed change leadership capabilities by implementing efficiency initiatives across departments');
        allLearnings.push('Enhanced problem-solving leadership through root cause analysis and solution implementation');
      }
    }
    
    // Cost management learnings
    if (lowerAchievement.includes('reduced') || lowerAchievement.includes('cost') || lowerAchievement.includes('budget')) {
      const amount = achievement.match(/\$[\d,.]+(k|m|million|thousand)?/);
      if (amount) {
        allLearnings.push(`Developed financial leadership acumen by managing ${amount[0]} cost reduction through strategic vendor negotiations and process efficiency`);
        allLearnings.push(`Enhanced fiscal responsibility by achieving ${amount[0]} savings through innovative cost management strategies`);
        allLearnings.push(`Strengthened budget leadership skills while delivering ${amount[0]} in cost optimization initiatives`);
      } else {
        allLearnings.push('Strengthened financial management capabilities through budget oversight and cost optimization initiatives');
        allLearnings.push('Developed resource allocation leadership by balancing operational needs with budget constraints');
        allLearnings.push('Enhanced financial decision-making through cost-benefit analysis and strategic spending priorities');
      }
    }
    
    // Innovation and implementation learnings
    if (lowerAchievement.includes('implemented') || lowerAchievement.includes('launched') || lowerAchievement.includes('established')) {
      allLearnings.push('Enhanced change management leadership by successfully driving organizational adoption of new systems and processes');
      allLearnings.push('Developed implementation leadership through systematic rollout planning and stakeholder engagement');
      allLearnings.push('Cultivated innovation leadership by spearheading new initiative development and execution');
    }
    
    // Customer/client learnings
    if (lowerAchievement.includes('customer') || lowerAchievement.includes('client') || lowerAchievement.includes('satisfaction')) {
      allLearnings.push('Developed customer-centric leadership approach by aligning team operations with client success metrics and feedback');
      allLearnings.push('Enhanced service leadership capabilities through customer relationship management and satisfaction improvement');
      allLearnings.push('Strengthened client-focused leadership by implementing feedback systems and service quality standards');
    }
    
    // Revenue/sales learnings
    if (lowerAchievement.includes('revenue') || lowerAchievement.includes('sales') || lowerAchievement.includes('growth')) {
      allLearnings.push('Cultivated strategic business leadership through revenue growth initiatives and market expansion efforts');
      allLearnings.push('Developed sales leadership capabilities by implementing growth strategies and performance tracking systems');
      allLearnings.push('Enhanced business development leadership through market analysis and competitive positioning');
    }
  });
  
  // Add role-appropriate learnings if none found
  if (allLearnings.length === 0) {
    if (lowerTitle.includes('manager') || lowerTitle.includes('director')) {
      allLearnings.push('Strengthened executive decision-making capabilities through daily operational leadership and stakeholder management');
      allLearnings.push('Developed strategic leadership skills through departmental planning and cross-functional coordination');
      allLearnings.push('Enhanced organizational leadership through policy implementation and team development initiatives');
    } else if (lowerTitle.includes('senior') || lowerTitle.includes('lead')) {
      allLearnings.push('Developed influential leadership skills by mentoring team members and driving project outcomes');
      allLearnings.push('Enhanced technical leadership capabilities through project guidance and knowledge transfer');
      allLearnings.push('Strengthened collaborative leadership through cross-team coordination and stakeholder communication');
    } else {
      allLearnings.push('Built collaborative leadership foundation through cross-functional teamwork and process contribution');
      allLearnings.push('Developed professional leadership skills through project participation and team support');
      allLearnings.push('Enhanced communication leadership through effective collaboration and knowledge sharing');
    }
  }
  
  // Select a unique learning that hasn't been used before
  let selectedLearning = '';
  for (const learning of allLearnings) {
    if (!globalUsedLeadershipLearnings.has(learning)) {
      selectedLearning = learning;
      globalUsedLeadershipLearnings.add(learning);
      break;
    }
  }
  
  // If all learnings have been used, generate experience-specific learning
  if (!selectedLearning) {
    selectedLearning = generateExperienceSpecificLearning(title, experienceIndex, company);
  }
  
  // Add company-specific context
  const contextVariations = [
    `This experience at ${company} provided essential leadership development in dynamic business environments.`,
    `During tenure at ${company}, gained valuable insights in organizational leadership and stakeholder management.`,
    `The role at ${company} offered significant leadership growth opportunities in fast-paced operational settings.`,
    `Leadership experience at ${company} enhanced capabilities in team coordination and strategic execution.`
  ];
  
  const additionalContext = contextVariations[experienceIndex % contextVariations.length];
  
  return selectedLearning + ' ' + additionalContext;
}

/**
 * Generates experience-specific leadership learning when all others are used
 */
function generateExperienceSpecificLearning(title: string, experienceIndex: number, company: string): string {
  const lowerTitle = title.toLowerCase();
  const learningVariations = [
    'Developed adaptive leadership skills through diverse operational challenges and team dynamics',
    'Enhanced situational leadership capabilities by managing varying project complexities and stakeholder needs',
    'Cultivated resilient leadership approach through problem-solving and decision-making under pressure',
    'Strengthened collaborative leadership through cross-departmental initiatives and relationship building',
    'Advanced communication leadership skills through stakeholder engagement and team coordination',
    'Refined strategic thinking capabilities through project planning and resource optimization'
  ];
  
  const baseIndex = experienceIndex * 2;
  if (lowerTitle.includes('manager') || lowerTitle.includes('director')) {
    return learningVariations[baseIndex % learningVariations.length];
  } else {
    return learningVariations[(baseIndex + 1) % learningVariations.length];
  }
}