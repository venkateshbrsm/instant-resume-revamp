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
    projects: []
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
  
  // Parse individual job entries
  let currentJob: any = null;
  let responsibilities: string[] = [];
  
  for (const line of experienceLines) {
    // Check if this looks like a job header (company/position line)
    if (isJobHeader(line)) {
      // Save previous job if exists
      if (currentJob) {
        currentJob.responsibilities = responsibilities;
        experience.push(currentJob);
      }
      
      // Start new job
      const jobInfo = parseJobHeader(line);
      currentJob = jobInfo;
      responsibilities = [];
    } else if (currentJob && isResponsibility(line)) {
      responsibilities.push(line);
    }
  }
  
  // Add last job
  if (currentJob) {
    currentJob.responsibilities = responsibilities;
    experience.push(currentJob);
  }
  
  return experience;
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

const parseJobHeader = (line: string): any => {
  // Parse job header to extract company, position, duration, location
  const parts = line.split(/[|,\-–]/).map(p => p.trim());
  
  return {
    company: parts[0] || '',
    position: parts[1] || '',
    duration: extractDurationFromLine(line),
    location: extractLocationFromLine(line),
  };
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