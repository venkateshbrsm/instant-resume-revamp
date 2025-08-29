// Content sanitization functions for OpenAI processing

function sanitizeContentForOpenAI(content: string): string {
  console.log(`🧹 Sanitizing content (${content.length} chars)...`);
  
  let sanitized = content
    // Remove excessive whitespace and normalize line breaks
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    // Clean up "From:" markers that might confuse OpenAI
    .replace(/From:\s*/gi, 'Duration: ')
    // Normalize date formats
    .replace(/(\w+)'\d{2}/g, '$1 20$2')
    .replace(/(\w+)'(\d{2})/g, '$1 20$2')
    // Remove problematic characters that might break JSON
    .replace(/[""'']/g, '"')
    .replace(/[–—]/g, '-')
    // Clean up excessive punctuation
    .replace(/\.{3,}/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
    
  // Ensure minimum viable content length
  if (sanitized.length < 50) {
    console.warn(`⚠️ Content too short after sanitization: ${sanitized.length} chars`);
    return content.trim(); // Return original if sanitization made it too short
  }
  
  console.log(`✅ Content sanitized successfully: ${content.length} → ${sanitized.length} chars`);
  return sanitized;
}

function createFallbackJobEntry(rawContent: string): any {
  console.log(`🔧 Creating fallback job entry from raw content (${rawContent.length} chars)`);
  
  // Extract basic information using regex patterns
  const titleMatch = rawContent.match(/(?:Role|Position|Designation|Title):\s*([^\n]+)/i) || 
                    rawContent.match(/^([A-Z][A-Za-z\s&-]+(?:Specialist|Manager|Officer|Executive|Analyst|Associate|Lead|Director|Head|Consultant))/m);
  
  const companyMatch = rawContent.match(/(?:Company|Organization):\s*([^\n]+)/i) ||
                      rawContent.match(/((?:[A-Z][A-Za-z\s&.]+(?:Ltd\.?|Limited|Inc\.?|Bank|Services?|Systems?|Technologies?|Solutions?)))/);
  
  const durationMatch = rawContent.match(/(?:Duration|Period|From):\s*([^\n]+)/i) ||
                       rawContent.match(/(\w+\s*'\d{2}|\w+\s+\d{4}|\d{4}).*?(?:to|till|-).*?(\w+\s*'\d{2}|\w+\s+\d{4}|\d{4}|present|current|date)/i);
  
  // Create basic job structure
  const fallbackJob = {
    title: titleMatch ? titleMatch[1].trim() : 'Professional Role',
    company: companyMatch ? companyMatch[1].trim() : 'Company',
    duration: durationMatch ? (durationMatch[0] || `${durationMatch[1]} - ${durationMatch[2] || 'Present'}`).trim() : 'Multiple years',
    description: extractKeyResponsibilities(rawContent),
    achievements: extractAchievements(rawContent)
  };
  
  console.log(`✅ Fallback job created: ${fallbackJob.title} at ${fallbackJob.company}`);
  return { experience: [fallbackJob] };
}

function extractKeyResponsibilities(content: string): string[] {
  const responsibilities = [];
  
  // Look for bullet points or numbered lists
  const bulletMatches = content.match(/[•·▪▫\-]\s*([^•·▪▫\-\n]{20,})/g) || [];
  bulletMatches.forEach(match => {
    const cleaned = match.replace(/^[•·▪▫-]\s*/, '').trim();
    if (cleaned.length > 15) {
      responsibilities.push(cleaned);
    }
  });
  
  // Look for sentences starting with action words
  const actionMatches = content.match(/(?:^|\.)[\s]*([A-Z][^.]{30,}\.)/gm) || [];
  actionMatches.slice(0, 3).forEach(match => {
    const cleaned = match.replace(/^[.\s]*/, '').trim();
    if (cleaned.length > 20 && !responsibilities.includes(cleaned)) {
      responsibilities.push(cleaned);
    }
  });
  
  // Ensure at least one responsibility
  if (responsibilities.length === 0) {
    responsibilities.push('Managed key responsibilities and contributed to organizational objectives');
  }
  
  return responsibilities.slice(0, 5); // Max 5 responsibilities
}

function extractAchievements(content: string): string[] {
  const achievements = [];
  
  // Look for numbers/percentages that might indicate achievements
  const achievementMatches = content.match(/[^.]*(?:\d+%|\$\d+|increased|improved|reduced|achieved|delivered)[^.]*/gi) || [];
  achievementMatches.slice(0, 2).forEach(match => {
    const cleaned = match.trim();
    if (cleaned.length > 20 && cleaned.length < 150) {
      achievements.push(cleaned);
    }
  });
  
  return achievements;
}

export { sanitizeContentForOpenAI, createFallbackJobEntry };