/**
 * Basic resume parser that converts extracted text into a structured resume format
 * for immediate display in the edit tab
 */

export interface BasicResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  title: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
    achievements: string[];
  }>;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    details: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
  extractedAt: string;
}

export function parseBasicResumeFromText(extractedText: string): BasicResumeData {
  const lines = extractedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Initialize basic structure
  const resume: BasicResumeData = {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    title: '',
    summary: '',
    experience: [],
    skills: [],
    education: [],
    certifications: [],
    extractedAt: new Date().toISOString()
  };

  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = extractedText.match(emailRegex);
  if (emailMatch) {
    resume.email = emailMatch[0];
  }

  // Extract phone number
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = extractedText.match(phoneRegex);
  if (phoneMatch) {
    resume.phone = phoneMatch[0];
  }

  // Extract LinkedIn
  const linkedinRegex = /(linkedin\.com\/in\/[^\s]+)/i;
  const linkedinMatch = extractedText.match(linkedinRegex);
  if (linkedinMatch) {
    resume.linkedin = linkedinMatch[0];
  }

  // Extract name (usually first meaningful line that's not contact info)
  for (const line of lines.slice(0, 5)) {
    if (line.length > 2 && 
        !emailRegex.test(line) && 
        !phoneRegex.test(line) && 
        !linkedinRegex.test(line) &&
        !line.toLowerCase().includes('resume') &&
        !line.toLowerCase().includes('cv')) {
      resume.name = line;
      break;
    }
  }

  // Extract job title (look for common patterns near the top)
  const titleKeywords = ['developer', 'engineer', 'manager', 'analyst', 'specialist', 'coordinator', 'consultant', 'director', 'senior', 'junior', 'lead'];
  for (const line of lines.slice(0, 10)) {
    if (titleKeywords.some(keyword => line.toLowerCase().includes(keyword)) && 
        line !== resume.name) {
      resume.title = line;
      break;
    }
  }

  // Extract skills (look for skills section)
  const skillsSectionIndex = lines.findIndex(line => 
    /^(skills|technical skills|core competencies|expertise)/i.test(line)
  );
  
  if (skillsSectionIndex !== -1) {
    // Get next few lines after skills header
    const skillsLines = lines.slice(skillsSectionIndex + 1, skillsSectionIndex + 5);
    for (const line of skillsLines) {
      if (line.includes(',') || line.includes('•') || line.includes('·')) {
        // Split by common delimiters
        const skills = line.split(/[,•·]/).map(s => s.trim()).filter(s => s.length > 0);
        resume.skills.push(...skills);
        if (resume.skills.length > 10) break; // Limit to reasonable number
      }
    }
  }

  // Extract experience (look for work history patterns)
  const experienceKeywords = ['experience', 'work history', 'employment', 'professional experience'];
  const experienceIndex = lines.findIndex(line => 
    experienceKeywords.some(keyword => line.toLowerCase().includes(keyword))
  );

  if (experienceIndex !== -1) {
    const experienceLines = lines.slice(experienceIndex + 1);
    let currentJob: any = null;
    
    for (const line of experienceLines) {
      // Check if line looks like a job title or company
      if (line.match(/^\w+.*\s+(at|@)\s+\w+/i) || 
          line.match(/^\w+\s+(Developer|Engineer|Manager|Analyst|Specialist)/i)) {
        
        // Save previous job if exists
        if (currentJob) {
          resume.experience.push(currentJob);
        }
        
        // Start new job
        const parts = line.split(/\s+at\s+|\s+@\s+/i);
        currentJob = {
          title: parts[0] || line,
          company: parts[1] || '',
          duration: '',
          description: '',
          achievements: []
        };
      } else if (currentJob && line.match(/\d{4}|\d{1,2}\/\d{4}/)) {
        // Looks like a date range
        currentJob.duration = line;
      } else if (currentJob && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))) {
        // Bullet point - add to achievements
        const achievement = line.replace(/^[•\-*]\s*/, '');
        currentJob.achievements.push(achievement);
      } else if (currentJob && line.length > 10) {
        // Regular description text
        if (!currentJob.description) {
          currentJob.description = line;
        } else {
          currentJob.description += ' ' + line;
        }
      }
      
      // Stop if we hit another section
      if (line.toLowerCase().includes('education') || 
          line.toLowerCase().includes('skills') ||
          resume.experience.length >= 5) {
        break;
      }
    }
    
    // Don't forget the last job
    if (currentJob) {
      resume.experience.push(currentJob);
    }
  }

  // Extract education
  const educationKeywords = ['education', 'academic background', 'qualifications'];
  const educationIndex = lines.findIndex(line => 
    educationKeywords.some(keyword => line.toLowerCase().includes(keyword))
  );

  if (educationIndex !== -1) {
    const educationLines = lines.slice(educationIndex + 1, educationIndex + 5);
    for (const line of educationLines) {
      if (line.includes('University') || line.includes('College') || line.includes('Institute') ||
          line.includes('Bachelor') || line.includes('Master') || line.includes('PhD')) {
        resume.education.push({
          degree: line.includes('Bachelor') || line.includes('Master') || line.includes('PhD') ? line : '',
          institution: line.includes('University') || line.includes('College') ? line : '',
          year: line.match(/\d{4}/)?.[0] || '',
          details: line
        });
      }
    }
  }

  // Create a basic summary if none exists
  if (!resume.summary && resume.title) {
    resume.summary = `Experienced ${resume.title} with proven expertise in delivering high-quality results. Seeking to leverage skills and experience in a challenging role.`;
  }

  return resume;
}