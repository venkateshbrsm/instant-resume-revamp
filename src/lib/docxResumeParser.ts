// DOCX Resume Parser - Extracts structured data from DOCX resume text

export interface BasicResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    location: string;
    responsibilities: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    duration: string;
    location: string;
  }>;
  skills: string[];
  certifications: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  previousEngagements: Array<{
    position: string;
    company: string;
    location: string;
    duration: string;
  }>;
}

export const parseBasicResumeData = (text: string): BasicResumeData => {
  console.log('Parsing DOCX resume data from text...');
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const result: BasicResumeData = {
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    previousEngagements: []
  };

  // Extract basic contact information
  result.name = extractName(lines);
  result.email = extractEmail(text);
  result.phone = extractPhone(text);
  result.location = extractLocation(lines);
  
  // Extract sections
  result.summary = extractSummary(lines);
  result.experience = extractExperience(lines);
  result.education = extractEducation(lines);
  result.skills = extractSkills(lines);
  result.certifications = extractCertifications(lines);
  result.projects = extractProjects(lines);
  result.previousEngagements = extractPreviousEngagements(lines);
  
  console.log('Parsed resume data:', result);
  return result;
};

const extractName = (lines: string[]): string => {
  // Name is typically the first non-empty line that doesn't contain email/phone
  for (const line of lines.slice(0, 5)) {
    if (line.length > 2 && 
        !line.includes('@') && 
        !line.match(/\d{3,}/) && 
        !line.toLowerCase().includes('resume') &&
        !line.toLowerCase().includes('cv')) {
      return line;
    }
  }
  return '';
};

const extractEmail = (text: string): string => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const match = text.match(emailRegex);
  return match ? match[0] : '';
};

const extractPhone = (text: string): string => {
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
  const match = text.match(phoneRegex);
  return match ? match[0] : '';
};

const extractLocation = (lines: string[]): string => {
  // Look for location patterns in the first few lines
  for (const line of lines.slice(0, 10)) {
    if (line.match(/^[A-Za-z\s,.-]+,\s*[A-Z]{2,}/) || 
        line.match(/[A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5}/)) {
      return line;
    }
  }
  return '';
};

const extractSummary = (lines: string[]): string => {
  const summaryKeywords = ['summary', 'objective', 'profile', 'about'];
  let summaryStart = -1;
  let summaryEnd = -1;
  
  // Find summary section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (summaryKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
      summaryStart = i + 1;
      break;
    }
  }
  
  if (summaryStart > -1) {
    // Find end of summary (next section header or significant gap)
    const sectionKeywords = ['experience', 'education', 'skills', 'work history', 'employment'];
    for (let i = summaryStart; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (sectionKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
        summaryEnd = i;
        break;
      }
    }
    
    if (summaryEnd === -1) summaryEnd = Math.min(summaryStart + 5, lines.length);
    return lines.slice(summaryStart, summaryEnd).join(' ');
  }
  
  return '';
};

const extractExperience = (lines: string[]): Array<{
  company: string;
  position: string;
  duration: string;
  location: string;
  responsibilities: string[];
}> => {
  const experience = [];
  const experienceKeywords = ['experience', 'work history', 'employment', 'professional experience'];
  let experienceStart = -1;
  let experienceEnd = -1;
  
  // Find experience section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (experienceKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
      experienceStart = i + 1;
      break;
    }
  }
  
  if (experienceStart === -1) return experience;
  
  // Find end of experience section
  const nextSectionKeywords = ['education', 'skills', 'projects', 'certifications'];
  for (let i = experienceStart; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (nextSectionKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
      experienceEnd = i;
      break;
    }
  }
  
  if (experienceEnd === -1) experienceEnd = lines.length;
  
  const experienceLines = lines.slice(experienceStart, experienceEnd);
  
  // Group consecutive lines into job blocks with better separation logic
  const jobBlocks: string[][] = [];
  let currentBlock: string[] = [];
  
  for (let i = 0; i < experienceLines.length; i++) {
    const line = experienceLines[i].trim();
    const nextLine = i + 1 < experienceLines.length ? experienceLines[i + 1].trim() : '';
    
    if (line.length === 0) {
      // Empty line - potential job separator
      if (currentBlock.length > 0) {
        jobBlocks.push(currentBlock);
        currentBlock = [];
      }
    } else if (currentBlock.length > 0 && isNewJobEntry(line, nextLine, currentBlock)) {
      // Detected start of new job entry
      jobBlocks.push(currentBlock);
      currentBlock = [line];
    } else {
      currentBlock.push(line);
    }
  }
  
  // Add the last block if it exists
  if (currentBlock.length > 0) {
    jobBlocks.push(currentBlock);
  }
  
  // Process each job block
  for (const block of jobBlocks) {
    if (block.length === 0) continue;
    
    const job = parseJobBlock(block);
    if (job && (job.position || job.company)) {
      experience.push(job);
    }
  }
  
  return experience;
};

const parseJobBlock = (block: string[]): any => {
  let company = '';
  let position = '';
  let duration = '';
  let location = '';
  let responsibilities: string[] = [];
  
  console.log('Parsing job block:', block);
  
  // First pass: identify company and dates from lines containing both
  for (let i = 0; i < block.length; i++) {
    const line = block[i].trim();
    
    // Skip explicit section headers and descriptions
    if (line.toLowerCase().includes('key achievements') || 
        line.toLowerCase().includes('responsibilities') || 
        line.toLowerCase().includes('accomplishments') ||
        line.toLowerCase().includes('is a provider of') ||
        line.toLowerCase().includes('delivers global') ||
        line.toLowerCase().includes('tech-driven innovation') ||
        line.toLowerCase().includes('focused in solving') ||
        line.length > 150) {
      continue;
    }
    
    // Look for lines with company names and dates
    if (hasDatePattern(line) && (isCompanyName(line) || line.includes(','))) {
      // Extract duration
      const extractedDuration = extractDurationFromLine(line);
      if (extractedDuration) {
        duration = extractedDuration;
      }
      
      // Extract company name (before dates and location indicators)
      let companyCandidate = line;
      
      // Remove date patterns
      companyCandidate = companyCandidate.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/gi, '');
      companyCandidate = companyCandidate.replace(/\b\d{4}\b/g, '');
      companyCandidate = companyCandidate.replace(/\s*[-–]\s*(to|Present)\s*/gi, '');
      companyCandidate = companyCandidate.replace(/\s*[-–]\s*/g, '');
      companyCandidate = companyCandidate.replace(/^[-,\s]+|[-,\s]+$/g, '').trim();
      
      // If it looks like a company, use it
      if (companyCandidate.length > 3 && companyCandidate.length < 100) {
        company = companyCandidate;
      }
      break; // Found the main company line
    }
  }
  
  // Second pass: find position (job title) - look for standalone job titles
  for (let i = 0; i < block.length; i++) {
    const line = block[i].trim();
    
    // Skip if this line was used for company or is clearly a responsibility
    if (line === company || 
        line.includes(company) ||
        line.toLowerCase().includes('handling') ||
        line.toLowerCase().includes('developed') ||
        line.toLowerCase().includes('enabling') ||
        line.toLowerCase().includes('joined') ||
        line.toLowerCase().includes('established') ||
        line.toLowerCase().includes('total portfolio') ||
        line.startsWith('•') || 
        line.length > 120) {
      continue;
    }
    
    // Look for job titles
    if (isJobTitle(line) || (line.length > 10 && line.length < 80 && !hasDatePattern(line))) {
      position = line;
      break;
    }
  }
  
  // Third pass: collect responsibilities - be more inclusive
  for (let i = 0; i < block.length; i++) {
    const line = block[i].trim();
    
    // Skip company and position lines
    if (line === company || line === position) {
      continue;
    }
    
    // Skip company descriptions and metadata
    if (line.toLowerCase().includes('is a provider of') ||
        line.toLowerCase().includes('delivers global') ||
        line.toLowerCase().includes('tech-driven innovation') ||
        line.toLowerCase().includes('focused in solving') ||
        line.toLowerCase().includes('headquartered in') ||
        line.toLowerCase().includes('subsidiary of') ||
        line.length > 200) {
      continue;
    }
    
    // Collect explicit bullet points
    if (line.match(/^[•\-*]/) || 
        line.match(/^\d+\./) || 
        line.match(/^[\u2022\u2023\u25E6]/)) {
      const cleanedLine = line.replace(/^[•\-*\d\.\s\u2022\u2023\u25E6]+/, '').trim();
      if (cleanedLine.length > 5) {
        responsibilities.push(cleanedLine);
      }
    }
    // Collect descriptive sentences and achievements - be more inclusive
    else if (line.length > 15 && 
             !hasDatePattern(line) && 
             !isCompanyName(line) &&
             !line.toLowerCase().includes('position') &&
             (line.toLowerCase().includes('manage') ||
              line.toLowerCase().includes('lead') ||
              line.toLowerCase().includes('develop') ||
              line.toLowerCase().includes('handle') ||
              line.toLowerCase().includes('direct') ||
              line.toLowerCase().includes('establish') ||
              line.toLowerCase().includes('enable') ||
              line.toLowerCase().includes('work') ||
              line.toLowerCase().includes('coordinate') ||
              line.toLowerCase().includes('implement') ||
              line.toLowerCase().includes('deliver') ||
              line.toLowerCase().includes('execute') ||
              line.toLowerCase().includes('negotiate') ||
              line.toLowerCase().includes('oversee') ||
              line.toLowerCase().includes('transform') ||
              line.toLowerCase().includes('clear') ||
              line.toLowerCase().includes('total') ||
              line.toLowerCase().includes('space') ||
              line.toLowerCase().includes('portfolio') ||
              line.toLowerCase().includes('project') ||
              line.toLowerCase().includes('responsibl') ||
              line.toLowerCase().includes('accountabilit') ||
              line.toLowerCase().includes('join') ||
              line.toLowerCase().includes('transfer') ||
              line.match(/^\s*[A-Z]/) || // Lines starting with capital letters (likely descriptions)
              line.includes(':') || // Lines with colons (often descriptions)
              line.match(/\d+[\s,]/) // Lines with numbers (metrics, sizes, etc.)
             )) {
      responsibilities.push(line);
    }
  }
  
  // Validate that we have meaningful data
  const hasValidCompany = company && company.length > 3 && !company.toLowerCase().includes('enabling');
  const hasValidPosition = position && position.length > 3 && position.length < 100;
  
  // Don't create entries with invalid data
  if (!hasValidCompany && !hasValidPosition) {
    console.log('Skipping invalid job entry:', { company, position });
    return null;
  }
  
  const result = {
    company: hasValidCompany ? company : '',
    position: hasValidPosition ? position : '',
    duration: duration || '',
    location: location || '',
    responsibilities: responsibilities.filter(r => r.length > 10)
  };
  
  console.log('Parsed job result:', result);
  return result;
};

const isNewJobEntry = (line: string, nextLine: string, currentBlock: string[]): boolean => {
  // Don't start new job entry if current block is too small (less than 3 lines)
  if (currentBlock.length < 3) return false;
  
  // Strong indicators of new job entry
  const lineHasDatePattern = hasDatePattern(line);
  const hasCompanyPattern = isCompanyName(line);
  const hasJobTitlePattern = isJobTitle(line);
  
  // Check if line looks like a job header with dates
  if (lineHasDatePattern && (line.includes(' at ') || line.includes(' | ') || line.includes(' - '))) {
    return true;
  }
  
  // Check if line is a company name followed by a job title
  if (hasCompanyPattern && nextLine && isJobTitle(nextLine)) {
    return true;
  }
  
  // Check if line is a job title and we already have substantial content in current block
  if (hasJobTitlePattern && currentBlock.length > 5) {
    return true;
  }
  
  // Check if line contains a year pattern and looks like start of job entry
  if (line.match(/\b\d{4}\b/) && line.length > 20 && !line.match(/^[•\-*]/)) {
    return true;
  }
  
  return false;
};

const hasDatePattern = (line: string): boolean => {
  return !!(line.match(/\b\d{4}\b/) || 
           line.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i) ||
           line.match(/\b(Present|Current)\b/i));
};

const isCompanyName = (line: string): boolean => {
  // Reject obvious non-company patterns
  if (line.toLowerCase().startsWith('from was') || 
      line.toLowerCase().startsWith('position') ||
      line.toLowerCase().includes('is a multinational') ||
      line.toLowerCase().includes('company headquartered') ||
      line.toLowerCase().includes('subsidiary of') ||
      line.length > 200) {
    return false;
  }
  
  return !!(line.includes('Ltd') || 
           line.includes('Inc') || 
           line.includes('Corp') || 
           line.includes('Company') ||
           line.includes('Systems') || 
           line.includes('Technologies') ||
           line.includes('Solutions') ||
           line.includes('Services') ||
           line.includes('Group') ||
           line.includes('Enterprises') ||
           line.includes('Networks') ||
           line.includes('Bank') ||
           line.includes('Pvt') ||
           line.includes('Private') ||
           line.includes('Limited') ||
           line.match(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\s*(Pvt|Private|Limited|LLC|Inc|Corp)\b/));
};

const isJobTitle = (line: string): boolean => {
  const jobTitles = [
    'manager', 'director', 'president', 'vice president', 'associate', 'senior',
    'junior', 'lead', 'head', 'chief', 'officer', 'analyst', 'consultant',
    'specialist', 'coordinator', 'supervisor', 'executive', 'developer',
    'engineer', 'architect'
  ];
  
  const lowerLine = line.toLowerCase();
  return jobTitles.some(title => lowerLine.includes(title)) && line.length < 100;
};

const extractJobHeaderInfo = (line: string): any => {
  let duration = '';
  let location = '';
  let company = '';
  let position = '';
  
  // Extract dates
  const dateMatches = line.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/gi);
  if (dateMatches && dateMatches.length >= 1) {
    if (dateMatches.length >= 2) {
      duration = `${dateMatches[0]} - ${dateMatches[1]}`;
    } else {
      duration = `${dateMatches[0]} - Present`;
    }
  } else {
    const yearMatches = line.match(/\b\d{4}\b/g);
    if (yearMatches && yearMatches.length >= 2) {
      duration = `${yearMatches[0]} - ${yearMatches[1]}`;
    } else if (yearMatches && yearMatches.length === 1) {
      duration = `${yearMatches[0]} - Present`;
    }
  }
  
  // Extract location (typically before dates)
  const locationMatch = line.match(/^([A-Za-z\s,]+?)\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})/i);
  if (locationMatch) {
    location = locationMatch[1].trim();
  }
  
  // Extract remaining text as company/position
  let remainingText = line;
  if (location) remainingText = remainingText.replace(location, '');
  if (duration) {
    remainingText = remainingText.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/gi, '');
    remainingText = remainingText.replace(/\b\d{4}\b/g, '');
  }
  remainingText = remainingText.replace(/^[\s\-–]+|[\s\-–]+$/g, '').trim();
  
  if (remainingText.includes('–') || remainingText.includes('-')) {
    const parts = remainingText.split(/[–-]/);
    position = parts[0]?.trim();
    company = parts[1]?.trim();
  } else {
    company = remainingText;
  }
  
  return { duration, location, company, position };
};

const isStrongJobHeader = (line: string, nextLine: string): boolean => {
  // Look for lines that contain dates (strong indicator of job header)
  const hasDate = !!line.match(/\b\d{4}\b/) || !!line.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
  
  // Or lines that look like "Position at Company" or "Company | Position"
  const hasJobPattern = line.includes(' at ') || line.includes(' | ') || line.includes(' - ');
  
  // Or if current line is a location/date and next line is company
  const isLocationDateLine = (line.match(/^[A-Za-z\s,]+\s+\d{4}/) || line.match(/[A-Z][a-z]+\s+\d{4}/)) && 
                              nextLine && nextLine.length > 5 && !nextLine.match(/^[•\-*]/);
  
  return hasDate || (hasJobPattern && line.length > 10) || isLocationDateLine;
};

const isCompanyOrPositionLine = (line: string): boolean => {
  // Check if line looks like a company name or position
  const matchesPattern = !!line.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/);
  return line.length > 5 && 
         !line.match(/^[•\-*]/) && 
         !line.match(/^\d/) && 
         (line.includes('Ltd') || line.includes('Inc') || line.includes('Corp') || 
          line.includes('Systems') || line.includes('Technologies') || 
          matchesPattern);
};

const parseJobHeader = (line: string, nextLine: string = ''): any => {
  let company = '';
  let position = '';
  let duration = '';
  let location = '';
  
  // Extract dates first
  const dateMatches = line.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/gi);
  if (dateMatches && dateMatches.length >= 1) {
    if (dateMatches.length >= 2) {
      duration = `${dateMatches[0]} - ${dateMatches[1]}`;
    } else {
      duration = `${dateMatches[0]} - Present`;
    }
  } else {
    // Try to extract year ranges
    const yearMatches = line.match(/\b\d{4}\b/g);
    if (yearMatches && yearMatches.length >= 2) {
      duration = `${yearMatches[0]} - ${yearMatches[1]}`;
    } else if (yearMatches && yearMatches.length === 1) {
      duration = `${yearMatches[0]} - Present`;
    }
  }
  
  // Extract location (usually at the beginning with date)
  const locationMatch = line.match(/^([A-Za-z\s,]+?)\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})/i);
  if (locationMatch) {
    location = locationMatch[1].trim();
  }
  
  // Parse company and position
  if (line.includes(' | ')) {
    const parts = line.split(' | ');
    company = parts[0].replace(location, '').replace(duration, '').trim();
    position = parts[1].replace(duration, '').trim();
  } else if (line.includes(' at ')) {
    const parts = line.split(' at ');
    position = parts[0].replace(location, '').replace(duration, '').trim();
    company = parts[1].replace(duration, '').trim();
  } else if (nextLine && isCompanyOrPositionLine(nextLine)) {
    // Current line might be location + date, next line is company
    company = nextLine.trim();
    // Position will be extracted from subsequent lines or left empty
  } else {
    // Try to extract from the remaining text after removing location and date
    let remainingText = line.replace(location, '').replace(duration, '').trim();
    // Remove date patterns
    remainingText = remainingText.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/gi, '').trim();
    remainingText = remainingText.replace(/\b\d{4}\b/g, '').trim();
    remainingText = remainingText.replace(/^[-\s]+|[-\s]+$/g, '').trim();
    
    if (remainingText.length > 0) {
      company = remainingText;
    }
  }
  
  return {
    company: company || 'Company',
    position: position || 'Position',
    duration: duration,
    location: location
  };
};

const isJobHeader = (line: string): boolean => {
  // Check if line contains common job header patterns
  return line.length > 10 && 
         (line.includes('|') || 
          !!line.match(/\d{4}/) || 
          !!line.match(/[A-Z][a-z]+\s+[A-Z][a-z]+/) ||
          line.includes(' - ') ||
          line.includes(' at '));
};


const extractDurationFromLine = (line: string): string => {
  const datePattern = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}/gi;
  const matches = line.match(datePattern);
  if (matches && matches.length >= 2) {
    return `${matches[0]} - ${matches[1]}`;
  } else if (matches && matches.length === 1) {
    return `${matches[0]} - Present`;
  }
  
  const yearPattern = /\b\d{4}\b/g;
  const years = line.match(yearPattern);
  if (years && years.length >= 2) {
    return `${years[0]} - ${years[1]}`;
  }
  
  return '';
};

const extractLocationFromLine = (line: string): string => {
  const locationPattern = /[A-Za-z\s]+,\s*[A-Z]{2,}/;
  const match = line.match(locationPattern);
  return match ? match[0] : '';
};

const isResponsibility = (line: string): boolean => {
  return line.length > 15 && 
         (line.startsWith('•') || 
          line.startsWith('-') || 
          line.startsWith('*') ||
          !!line.match(/^\d+\./) ||
          (!!line.match(/^[A-Z]/) && !isJobHeader(line)));
};

const extractEducation = (lines: string[]): Array<{
  institution: string;
  degree: string;
  duration: string;
  location: string;
}> => {
  const education = [];
  const educationKeywords = ['education', 'academic', 'university', 'college'];
  let educationStart = -1;
  let educationEnd = -1;
  
  // Find education section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (educationKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
      educationStart = i + 1;
      break;
    }
  }
  
  if (educationStart === -1) return education;
  
  // Find end of education section
  const nextSectionKeywords = ['skills', 'projects', 'certifications', 'experience'];
  for (let i = educationStart; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (nextSectionKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
      educationEnd = i;
      break;
    }
  }
  
  if (educationEnd === -1) educationEnd = lines.length;
  
  const educationLines = lines.slice(educationStart, educationEnd);
  
  // Parse education entries
  for (const line of educationLines) {
    if (line.length > 10) {
      education.push({
        institution: line.split(',')[0] || line,
        degree: extractDegreeFromLine(line),
        duration: extractDurationFromLine(line),
        location: extractLocationFromLine(line)
      });
    }
  }
  
  return education;
};

const extractDegreeFromLine = (line: string): string => {
  const degreePattern = /\b(?:Bachelor|Master|PhD|B\.?[AS]|M\.?[AS]|Ph\.?D|Associate)[^,]*/gi;
  const match = line.match(degreePattern);
  return match ? match[0] : '';
};

const extractSkills = (lines: string[]): string[] => {
  const skills = [];
  const skillsKeywords = ['skills', 'technical skills', 'core competencies'];
  let skillsStart = -1;
  let skillsEnd = -1;
  
  // Find skills section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (skillsKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
      skillsStart = i + 1;
      break;
    }
  }
  
  if (skillsStart === -1) return skills;
  
  // Find end of skills section
  const nextSectionKeywords = ['projects', 'certifications', 'awards', 'languages'];
  for (let i = skillsStart; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (nextSectionKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
      skillsEnd = i;
      break;
    }
  }
  
  if (skillsEnd === -1) skillsEnd = lines.length;
  
  const skillsLines = lines.slice(skillsStart, skillsEnd);
  
  // Parse skills
  for (const line of skillsLines) {
    if (line.includes(',')) {
      skills.push(...line.split(',').map(s => s.trim()));
    } else if (line.includes('•') || line.includes('-')) {
      skills.push(line.replace(/[•\-*]/g, '').trim());
    } else if (line.length > 2) {
      skills.push(line);
    }
  }
  
  return skills.filter(skill => skill.length > 1);
};

const extractCertifications = (lines: string[]): string[] => {
  const certifications = [];
  const certKeywords = ['certifications', 'certificates', 'licenses'];
  let certStart = -1;
  let certEnd = -1;
  
  // Find certifications section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (certKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
      certStart = i + 1;
      break;
    }
  }
  
  if (certStart === -1) return certifications;
  
  // Find end of certifications section
  const nextSectionKeywords = ['projects', 'awards', 'languages', 'references'];
  for (let i = certStart; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (nextSectionKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
      certEnd = i;
      break;
    }
  }
  
  if (certEnd === -1) certEnd = lines.length;
  
  const certLines = lines.slice(certStart, certEnd);
  
  // Parse certifications
  for (const line of certLines) {
    if (line.length > 2) {
      certifications.push(line.replace(/[•\-*]/g, '').trim());
    }
  }
  
  return certifications;
};

const extractProjects = (lines: string[]): Array<{
  name: string;
  description: string;
  technologies: string[];
}> => {
  const projects = [];
  const projectKeywords = ['projects', 'portfolio', 'personal projects'];
  let projectStart = -1;
  let projectEnd = -1;
  
  // Find projects section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (projectKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
      projectStart = i + 1;
      break;
    }
  }
  
  if (projectStart === -1) return projects;
  
  // Find end of projects section
  const nextSectionKeywords = ['awards', 'languages', 'references', 'interests'];
  for (let i = projectStart; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (nextSectionKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
      projectEnd = i;
      break;
    }
  }
  
  if (projectEnd === -1) projectEnd = lines.length;
  
  const projectLines = lines.slice(projectStart, projectEnd);
  
  // Parse projects (simplified)
  for (const line of projectLines) {
    if (line.length > 10) {
      projects.push({
        name: line.split('-')[0]?.trim() || line,
        description: line,
        technologies: []
      });
    }
  }
  
  return projects;
};

const extractPreviousEngagements = (lines: string[]): Array<{
  position: string;
  company: string;
  location: string;
  duration: string;
}> => {
  const previousEngagements = [];
  const engagementKeywords = ['previous engagements', 'previous experience', 'prior engagements', 'past engagements'];
  let engagementStart = -1;
  let engagementEnd = -1;
  
  // Find previous engagements section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (engagementKeywords.some(keyword => line.includes(keyword)) && line.length < 100) {
      engagementStart = i + 1;
      break;
    }
  }
  
  if (engagementStart === -1) return previousEngagements;
  
  // Find end of previous engagements section
  const nextSectionKeywords = ['awards', 'languages', 'references', 'interests', 'hobbies'];
  for (let i = engagementStart; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (nextSectionKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
      engagementEnd = i;
      break;
    }
  }
  
  if (engagementEnd === -1) engagementEnd = lines.length;
  
  const engagementLines = lines.slice(engagementStart, engagementEnd);
  
  // Parse previous engagements entries
  for (const line of engagementLines) {
    if (line.length > 10 && (line.includes('→') || line.includes('--') || line.includes('Manager') || line.includes('Asst'))) {
      const engagement = parsePreviousEngagementLine(line);
      if (engagement) {
        previousEngagements.push(engagement);
      }
    }
  }
  
  return previousEngagements;
};

const parsePreviousEngagementLine = (line: string): any => {
  // Handle format like: "→ Manager--Infrastructure-&-Facilities,-Sykes-Enterprises-(India)-Pvt.-Ltd.,-Bangalore,-Mar-2004—Jan-2005"
  let cleanLine = line.replace(/^[→•\-*\s]+/, '').trim();
  
  // Extract duration first (pattern like Mar-2004—Jan-2005 or May-1993—Jun-1997)
  const durationPattern = /([A-Za-z]{3}-\d{4})[—\-]([A-Za-z]{3}-\d{4})/;
  const durationMatch = cleanLine.match(durationPattern);
  let duration = '';
  
  if (durationMatch) {
    duration = `${durationMatch[1]} - ${durationMatch[2]}`;
    cleanLine = cleanLine.replace(durationPattern, '').trim();
  }
  
  // Remove trailing commas and clean up
  cleanLine = cleanLine.replace(/,$/, '').trim();
  
  // Split by commas to get components
  const parts = cleanLine.split(',').map(part => part.trim()).filter(part => part.length > 0);
  
  if (parts.length < 2) return null;
  
  // Extract position (usually contains -- or specific job titles)
  let position = '';
  let company = '';
  let location = '';
  
  // Find position (usually the first part with -- or job title keywords)
  const positionIndex = parts.findIndex(part => 
    part.includes('--') || 
    part.toLowerCase().includes('manager') || 
    part.toLowerCase().includes('executive') || 
    part.toLowerCase().includes('asst') ||
    part.toLowerCase().includes('assistant')
  );
  
  if (positionIndex !== -1) {
    position = parts[positionIndex].replace(/--/g, ' - ').trim();
    
    // Remaining parts are company and location
    const remainingParts = [...parts];
    remainingParts.splice(positionIndex, 1);
    
    // Last part is usually location if it's a single word/city
    if (remainingParts.length > 0) {
      const lastPart = remainingParts[remainingParts.length - 1];
      if (lastPart.length < 20 && !lastPart.includes('Ltd') && !lastPart.includes('Inc')) {
        location = lastPart;
        remainingParts.pop();
      }
    }
    
    // Remaining parts form the company name
    company = remainingParts.join(', ').replace(/\-/g, ' ').trim();
  }
  
  // Fallback parsing if specific pattern not found
  if (!position && parts.length >= 2) {
    position = parts[0];
    company = parts[1];
    if (parts.length > 2) {
      location = parts[2];
    }
  }
  
  if (position && company) {
    return {
      position: position.trim(),
      company: company.trim(),
      location: location.trim(),
      duration: duration
    };
  }
  
  return null;
};