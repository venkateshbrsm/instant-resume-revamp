// Core responsibilities extraction utility to avoid code duplication across templates

/**
 * Extracts core responsibilities directly from resume achievements/content
 * Only uses information that is actually stated in the resume
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

  // Extract responsibilities directly from achievements
  const responsibilities: string[] = [];
  
  for (const achievement of achievements) {
    if (responsibilities.length >= maxResponsibilities) break;
    
    // Clean and format the achievement as a responsibility
    const cleanedAchievement = achievement
      .trim()
      .replace(/^\d+\.\s*/, '') // Remove numbering
      .replace(/^[-•]\s*/, '') // Remove bullet points
      .replace(/\.$/, ''); // Remove trailing period
    
    // Only add if it's substantial content (more than just a few words)
    if (cleanedAchievement.length > 20 && !isVagueStatement(cleanedAchievement)) {
      // Format as a responsibility statement
      const responsibility = formatAsResponsibility(cleanedAchievement);
      responsibilities.push(responsibility);
    }
  }

  return responsibilities.slice(0, maxResponsibilities);
}

/**
 * Checks if a statement is too vague or generic
 */
function isVagueStatement(text: string): boolean {
  const vaguePatterns = [
    /^(worked on|helped with|assisted in|participated in|involved in)/i,
    /^(responsible for|in charge of|handled|managed|dealt with)$/i,
    /^(various|multiple|different|several)\s+\w+$/i
  ];
  
  return vaguePatterns.some(pattern => pattern.test(text.trim()));
}

/**
 * Formats an achievement as a responsibility statement
 */
function formatAsResponsibility(achievement: string): string {
  // Ensure it starts with a present-tense action verb
  const startsWithPastTense = /^(implemented|developed|created|managed|led|coordinated|established|built|designed|executed|delivered|achieved|increased|decreased|improved|optimized|streamlined|automated)/i;
  
  if (startsWithPastTense.test(achievement)) {
    // Convert past tense to present tense action
    return achievement
      .replace(/^implemented/i, 'Implementing')
      .replace(/^developed/i, 'Developing')
      .replace(/^created/i, 'Creating')
      .replace(/^managed/i, 'Managing')
      .replace(/^led/i, 'Leading')
      .replace(/^coordinated/i, 'Coordinating')
      .replace(/^established/i, 'Establishing')
      .replace(/^built/i, 'Building')
      .replace(/^designed/i, 'Designing')
      .replace(/^executed/i, 'Executing')
      .replace(/^delivered/i, 'Delivering')
      .replace(/^achieved/i, 'Achieving')
      .replace(/^increased/i, 'Increasing')
      .replace(/^decreased/i, 'Decreasing')
      .replace(/^improved/i, 'Improving')
      .replace(/^optimized/i, 'Optimizing')
      .replace(/^streamlined/i, 'Streamlining')
      .replace(/^automated/i, 'Automating');
  }
  
  // Ensure proper capitalization
  return achievement.charAt(0).toUpperCase() + achievement.slice(1);
}