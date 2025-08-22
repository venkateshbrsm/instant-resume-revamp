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
  
  // Financial/Revenue achievements - more tactical level
  if (lowerAchievement.includes('sales') || lowerAchievement.includes('revenue') || lowerAchievement.includes('profit')) {
    activities.push('Making outbound calls to prospects and following up on leads');
    activities.push('Updating CRM records and tracking sales activities');
    activities.push('Preparing quotes and proposals for potential clients');
    activities.push('Attending networking events and trade shows');
  }
  
  // Team/Management achievements - operational level
  if (lowerAchievement.includes('team') || lowerAchievement.includes('manage') || lowerAchievement.includes('staff')) {
    activities.push('Conducting one-on-one meetings with direct reports');
    activities.push('Reviewing daily task assignments and priorities');
    activities.push('Addressing team conflicts and performance issues');
    activities.push('Scheduling shifts and managing time-off requests');
  }
  
  // Process/Efficiency achievements - hands-on activities
  if (lowerAchievement.includes('process') || lowerAchievement.includes('efficiency') || lowerAchievement.includes('streamline')) {
    activities.push('Timing and measuring current workflow steps');
    activities.push('Creating process flowcharts and documentation');
    activities.push('Testing new procedures with pilot groups');
    activities.push('Collecting feedback from staff on process changes');
  }
  
  // Customer/Client achievements - direct interaction
  if (lowerAchievement.includes('customer') || lowerAchievement.includes('client') || lowerAchievement.includes('satisfaction')) {
    activities.push('Responding to customer inquiries via phone and email');
    activities.push('Processing customer orders and handling returns');
    activities.push('Following up on customer complaints and resolution');
    activities.push('Conducting customer satisfaction surveys');
  }
  
  // Technology/System achievements - technical work
  if (lowerAchievement.includes('system') || lowerAchievement.includes('technology') || lowerAchievement.includes('software')) {
    activities.push('Running daily system backups and health checks');
    activities.push('Installing software updates and patches');
    activities.push('Troubleshooting user technical issues');
    activities.push('Maintaining user accounts and access permissions');
  }
  
  // Project achievements - day-to-day project work
  if (lowerAchievement.includes('project') || lowerAchievement.includes('initiative') || lowerAchievement.includes('launch')) {
    activities.push('Updating project schedules and task completion status');
    activities.push('Attending daily standup meetings and status calls');
    activities.push('Coordinating deliverables between team members');
    activities.push('Documenting project progress and issues');
  }
  
  // Quality/Compliance achievements - hands-on quality work
  if (lowerAchievement.includes('quality') || lowerAchievement.includes('compliance') || lowerAchievement.includes('standard')) {
    activities.push('Performing quality inspections and testing procedures');
    activities.push('Recording compliance metrics and audit findings');
    activities.push('Reviewing work outputs against quality standards');
    activities.push('Completing regulatory forms and documentation');
  }
  
  // Budget/Cost achievements - practical financial tasks
  if (lowerAchievement.includes('budget') || lowerAchievement.includes('cost') || lowerAchievement.includes('saving')) {
    activities.push('Tracking expenses and maintaining budget spreadsheets');
    activities.push('Comparing vendor quotes and pricing options');
    activities.push('Processing purchase orders and expense reports');
    activities.push('Monitoring monthly spending against budget limits');
  }
  
  // If no specific patterns matched, generate role-appropriate activities
  if (activities.length === 0) {
    if (lowerTitle.includes('assistant') || lowerTitle.includes('associate') || lowerTitle.includes('junior')) {
      activities.push('Supporting senior staff with daily administrative tasks');
      activities.push('Preparing reports and data entry for departmental use');
    } else if (lowerTitle.includes('specialist') || lowerTitle.includes('analyst')) {
      activities.push('Analyzing data sets and preparing summary reports');
      activities.push('Researching industry trends and compiling findings');
    } else if (lowerTitle.includes('coordinator')) {
      activities.push('Scheduling meetings and coordinating team activities');
      activities.push('Tracking project timelines and following up on tasks');
    } else if (lowerTitle.includes('supervisor') || lowerTitle.includes('team lead')) {
      activities.push('Monitoring team productivity and workflow');
      activities.push('Handling escalated issues and problem resolution');
    } else if (lowerTitle.includes('manager')) {
      activities.push('Reviewing team performance and providing feedback');
      activities.push('Coordinating between departments and stakeholders');
    } else {
      activities.push('Completing assigned tasks and meeting deadlines');
      activities.push('Participating in team meetings and collaborative work');
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