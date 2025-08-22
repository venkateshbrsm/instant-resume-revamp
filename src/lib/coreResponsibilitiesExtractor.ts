// Core responsibilities extraction utility to avoid code duplication across templates

/**
 * Extracts core everyday responsibilities that would lead to the achievements stated in the resume
 * Generates the underlying daily activities that collectively make the achievements happen
 */
export function extractCoreResponsibilities(
  achievements: string[] | undefined,
  title: string,
  templateType: 'classic' | 'modern' | 'minimalist' | 'creative',
  experienceIndex: number = 0,
  maxResponsibilities: number = 4
): string[] {
  // If no achievements provided, return empty array
  if (!achievements || achievements.length === 0) {
    return [];
  }

  const responsibilities: string[] = [];
  
  for (const achievement of achievements) {
    if (responsibilities.length >= maxResponsibilities) break;
    
    // Generate everyday activities that would lead to this achievement
    const dailyActivities = generateDailyActivitiesFromAchievement(achievement, title);
    responsibilities.push(...dailyActivities);
  }

  // Remove duplicates and return only the requested amount
  const uniqueResponsibilities = Array.from(new Set(responsibilities));
  return uniqueResponsibilities.slice(0, maxResponsibilities);
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
  }
  
  // Team/Management achievements
  if (lowerAchievement.includes('team') || lowerAchievement.includes('manage') || lowerAchievement.includes('staff')) {
    activities.push('Facilitating weekly team meetings and performance reviews');
    activities.push('Providing coaching and mentorship to team members');
  }
  
  // Process/Efficiency achievements
  if (lowerAchievement.includes('process') || lowerAchievement.includes('efficiency') || lowerAchievement.includes('streamline')) {
    activities.push('Reviewing and optimizing operational workflows');
    activities.push('Documenting standard operating procedures');
  }
  
  // Customer/Client achievements
  if (lowerAchievement.includes('customer') || lowerAchievement.includes('client') || lowerAchievement.includes('satisfaction')) {
    activities.push('Maintaining regular client communication and relationship building');
    activities.push('Monitoring customer feedback and service quality metrics');
  }
  
  // Technology/System achievements
  if (lowerAchievement.includes('system') || lowerAchievement.includes('technology') || lowerAchievement.includes('software')) {
    activities.push('Overseeing daily system maintenance and performance monitoring');
    activities.push('Coordinating with technical teams on implementation progress');
  }
  
  // Project achievements
  if (lowerAchievement.includes('project') || lowerAchievement.includes('initiative') || lowerAchievement.includes('launch')) {
    activities.push('Tracking project milestones and deliverable completion');
    activities.push('Coordinating cross-functional team collaboration');
  }
  
  // Quality/Compliance achievements
  if (lowerAchievement.includes('quality') || lowerAchievement.includes('compliance') || lowerAchievement.includes('standard')) {
    activities.push('Conducting regular quality assurance checks and audits');
    activities.push('Ensuring adherence to regulatory and company standards');
  }
  
  // Budget/Cost achievements
  if (lowerAchievement.includes('budget') || lowerAchievement.includes('cost') || lowerAchievement.includes('saving')) {
    activities.push('Monitoring daily expenditures and budget allocations');
    activities.push('Reviewing vendor contracts and cost optimization opportunities');
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