export interface BasicResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
    responsibilities: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string[];
}

export function parseBasicResumeFromText(text: string): BasicResumeData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  console.log('🔍 Parsing resume from text, total lines:', lines.length);
  console.log('📝 Sample lines:', lines.slice(0, 10));

  const result: BasicResumeData = {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    experience: [],
    education: [],
    skills: []
  };

  // Extract basic contact information
  let currentSection = 'header';
  let experienceBuffer: string[] = [];
  let currentJob: any = null;
  let summaryBuffer: string[] = [];
  let educationBuffer: string[] = [];
  let skillsBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Extract contact info from any line
    if (!result.email) {
      const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        result.email = emailMatch[0];
        console.log('✉️ Found email:', result.email);
      }
    }

    if (!result.phone) {
      const phoneMatch = line.match(/(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
      if (phoneMatch) {
        result.phone = phoneMatch[0];
        console.log('📞 Found phone:', result.phone);
      }
    }

    if (!result.linkedin) {
      const linkedinMatch = line.match(/linkedin\.com[\/\w\-\.]+/i);
      if (linkedinMatch) {
        result.linkedin = linkedinMatch[0];
        console.log('💼 Found LinkedIn:', result.linkedin);
      }
    }

    // Detect sections
    if (lowerLine.includes('experience') || lowerLine.includes('employment') || lowerLine.includes('work history')) {
      currentSection = 'experience';
      console.log('📋 Switched to experience section at line:', i);
      continue;
    }

    if (lowerLine.includes('education') || lowerLine.includes('academic')) {
      currentSection = 'education';
      console.log('🎓 Switched to education section at line:', i);
      continue;
    }

    if (lowerLine.includes('skills') || lowerLine.includes('competencies') || lowerLine.includes('expertise')) {
      currentSection = 'skills';
      console.log('🛠️ Switched to skills section at line:', i);
      continue;
    }

    if (lowerLine.includes('summary') || lowerLine.includes('profile') || lowerLine.includes('objective')) {
      currentSection = 'summary';
      console.log('📄 Switched to summary section at line:', i);
      continue;
    }

    // Extract name (usually first substantial line)
    if (!result.name && currentSection === 'header' && line.length > 2 && !line.includes('@') && !line.match(/\d{3}/)) {
      result.name = line;
      console.log('👤 Found name:', result.name);
      continue;
    }

    // Process content based on current section
    switch (currentSection) {
      case 'experience':
        experienceBuffer.push(line);
        break;
      case 'education':
        educationBuffer.push(line);
        break;
      case 'skills':
        skillsBuffer.push(line);
        break;
      case 'summary':
        summaryBuffer.push(line);
        break;
    }
  }

  // Process experience buffer
  result.experience = parseExperienceSection(experienceBuffer);
  console.log('💼 Parsed experience items:', result.experience.length);

  // Process education buffer
  result.education = parseEducationSection(educationBuffer);
  console.log('🎓 Parsed education items:', result.education.length);

  // Process skills buffer
  result.skills = parseSkillsSection(skillsBuffer);
  console.log('🛠️ Parsed skills:', result.skills.length);

  // Process summary
  result.summary = summaryBuffer.join(' ').trim() || 'Professional with demonstrated expertise and commitment to excellence.';

  // Set a default title if not found
  if (!result.title && result.experience.length > 0) {
    result.title = result.experience[0].title || 'Professional';
  }

  // Set location from phone number area code or other patterns
  if (!result.location && result.phone) {
    result.location = 'Professional Location'; // Placeholder
  }

  return result;
}

function parseExperienceSection(lines: string[]): Array<{
  title: string;
  company: string;
  duration: string;
  description: string;
  responsibilities: string[];
}> {
  const experiences: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
    responsibilities: string[];
  }> = [];

  let currentExp: any = null;
  let responsibilities: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if this looks like a job title or company (often in caps or at start of section)
    const isJobTitle = (
      line.length > 5 && 
      line.length < 100 && 
      !line.startsWith('•') && 
      !line.startsWith('-') &&
      !line.toLowerCase().startsWith('responsible') &&
      !line.toLowerCase().startsWith('managed') &&
      !line.toLowerCase().startsWith('developed')
    );

    // Look for date patterns to identify position headers
    const dateMatch = line.match(/(\d{4}|\d{1,2}\/\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
    
    if ((isJobTitle && dateMatch) || (i === 0 && isJobTitle)) {
      // Save previous experience
      if (currentExp) {
        currentExp.responsibilities = responsibilities;
        experiences.push(currentExp);
      }

      // Start new experience
      const parts = line.split(/[-–—|]/).map(p => p.trim());
      
      if (parts.length >= 2) {
        currentExp = {
          title: parts[0] || 'Professional Position',
          company: parts[1] || 'Professional Organization',
          duration: dateMatch ? dateMatch[0] : 'Recent',
          description: '',
          responsibilities: []
        };
      } else {
        currentExp = {
          title: line,
          company: 'Professional Organization',
          duration: dateMatch ? dateMatch[0] : 'Recent',
          description: '',
          responsibilities: []
        };
      }
      
      responsibilities = [];
      console.log('📋 Found job:', currentExp.title, 'at', currentExp.company);
    } else {
      // This is likely a responsibility or description
      if (line.length > 10) {
        responsibilities.push(line);
      }
    }
  }

  // Add the last experience
  if (currentExp) {
    currentExp.responsibilities = responsibilities;
    experiences.push(currentExp);
  }

  // If no structured experiences found, create a generic one from all content
  if (experiences.length === 0 && lines.length > 0) {
    experiences.push({
      title: 'Professional Experience',
      company: 'Professional Organization',
      duration: 'Recent Experience', 
      description: lines.join(' ').substring(0, 200),
      responsibilities: lines.slice(0, 5)
    });
  }

  return experiences;
}

function parseEducationSection(lines: string[]): Array<{
  degree: string;
  institution: string;
  year: string;
}> {
  const education: Array<{
    degree: string;
    institution: string;
    year: string;
  }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const dateMatch = line.match(/\d{4}/);
    
    if (line.length > 5) {
      const parts = line.split(/[-–—|,]/).map(p => p.trim());
      
      education.push({
        degree: parts[0] || 'Academic Qualification',
        institution: parts[1] || 'Educational Institution',
        year: dateMatch ? dateMatch[0] : 'Completed'
      });
      
      console.log('🎓 Found education:', parts[0]);
    }
  }

  // Default education if none found
  if (education.length === 0) {
    education.push({
      degree: 'Professional Qualification',
      institution: 'Educational Institution',
      year: 'Completed'
    });
  }

  return education;
}

function parseSkillsSection(lines: string[]): string[] {
  const skills: string[] = [];
  
  for (const line of lines) {
    if (!line) continue;
    
    // Split by common delimiters
    const lineSkills = line.split(/[,|•\-]/).map(s => s.trim()).filter(s => s.length > 1);
    skills.push(...lineSkills);
  }

  // Default skills if none found
  if (skills.length === 0) {
    skills.push('Professional Skills', 'Problem Solving', 'Communication', 'Team Collaboration');
  }

  return skills.slice(0, 15); // Limit to first 15 skills
}