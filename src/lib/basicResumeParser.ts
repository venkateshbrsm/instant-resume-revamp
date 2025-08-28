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

function enhanceDateFormatting(text: string): string {
  // Enhanced date pattern matching for professional formatting
  const datePatterns = [
    // Match ranges like "2020-2023", "2020 - Present", "Jan 2020 - Dec 2023"
    /(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?\s+\d{4})\s*[-–—]\s*(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?\s+\d{4}|present|current)\b/gi,
    /(\d{1,2}\/\d{4})\s*[-–—]\s*(\d{1,2}\/\d{4}|present|current)\b/gi,
    /(\d{4})\s*[-–—]\s*(\d{4}|present|current)\b/gi,
    
    // Single dates
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?\s+\d{4}\b/gi,
    /\b\d{1,2}\/\d{4}\b/g,
    /\b\d{4}\b/g
  ];

  let enhancedText = text;
  
  // Process date ranges first
  enhancedText = enhancedText.replace(
    /(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?\s+\d{4})\s*[-–—]\s*(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?\s+\d{4}|present|current)\b/gi,
    (match, start, end) => {
      const formattedStart = formatMonth(start);
      const formattedEnd = end.toLowerCase() === 'present' || end.toLowerCase() === 'current' ? 'Present' : formatMonth(end);
      return `${formattedStart} - ${formattedEnd}`;
    }
  );
  
  enhancedText = enhancedText.replace(
    /(\d{1,2}\/\d{4})\s*[-–—]\s*(\d{1,2}\/\d{4}|present|current)\b/gi,
    (match, start, end) => {
      const formattedStart = formatMonthYear(start);
      const formattedEnd = end.toLowerCase() === 'present' || end.toLowerCase() === 'current' ? 'Present' : formatMonthYear(end);
      return `${formattedStart} - ${formattedEnd}`;
    }
  );
  
  enhancedText = enhancedText.replace(
    /(\d{4})\s*[-–—]\s*(\d{4}|present|current)\b/gi,
    (match, start, end) => {
      const formattedEnd = end.toLowerCase() === 'present' || end.toLowerCase() === 'current' ? 'Present' : end;
      return `${start} - ${formattedEnd}`;
    }
  );

  return enhancedText;
}

function formatMonth(monthYear: string): string {
  const months: { [key: string]: string } = {
    'jan': 'January', 'feb': 'February', 'mar': 'March', 'apr': 'April',
    'may': 'May', 'jun': 'June', 'jul': 'July', 'aug': 'August',
    'sep': 'September', 'oct': 'October', 'nov': 'November', 'dec': 'December'
  };
  
  const parts = monthYear.toLowerCase().replace('.', '').split(/\s+/);
  if (parts.length >= 2) {
    const month = months[parts[0]] || parts[0];
    return `${month} ${parts[1]}`;
  }
  return monthYear;
}

function formatMonthYear(monthYear: string): string {
  const parts = monthYear.split('/');
  if (parts.length === 2) {
    const month = parseInt(parts[0]);
    const year = parts[1];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    if (month >= 1 && month <= 12) {
      return `${monthNames[month - 1]} ${year}`;
    }
  }
  return monthYear;
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

  console.log('🔍 Parsing experience section with lines:', lines);

  let currentExp: any = null;
  let responsibilities: string[] = [];
  let lookingForDates = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    console.log(`📝 Processing line ${i}: "${line}"`);

    // Check if this line contains dates
    const fullDateRangeMatch = line.match(/(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?\s+\d{4})\s*[-–—to]\s*(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?\s+\d{4}|present|current|till\s+date)/gi);
    const singleDateMatch = line.match(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?\s+\d{4}\b/gi);
    const yearRangeMatch = line.match(/\b(\d{4})\s*[-–—to]\s*(\d{4}|present|current)\b/gi);
    
    // Check if this looks like a company/job title line
    const isCompanyLine = (
      line.length > 5 && 
      line.length < 150 &&
      !line.startsWith('•') && 
      !line.startsWith('-') &&
      !line.startsWith('▪') &&
      !line.toLowerCase().startsWith('responsible') &&
      !line.toLowerCase().startsWith('managed') &&
      !line.toLowerCase().startsWith('developed') &&
      !line.toLowerCase().startsWith('achieved') &&
      !line.toLowerCase().startsWith('led') &&
      !line.toLowerCase().includes('key responsibilities')
    );

    // If we found a full date range in the line, this might be a job entry
    if (fullDateRangeMatch && isCompanyLine) {
      console.log('📅 Found date range in line:', fullDateRangeMatch[0]);
      
      // Save previous experience
      if (currentExp) {
        currentExp.responsibilities = responsibilities;
        experiences.push(currentExp);
        console.log('💼 Saved previous experience:', currentExp.title);
      }

      // Extract the date and clean the line
      const dateString = fullDateRangeMatch[0];
      const cleanLine = line.replace(fullDateRangeMatch[0], '').trim().replace(/[,\-–—]+$/, '').trim();
      
      // Split company and title
      const parts = cleanLine.split(/[-–—|,]/).map(p => p.trim()).filter(p => p);
      
      currentExp = {
        title: parts[0] || 'Professional Position',
        company: parts[1] || parts[0] || 'Professional Organization',
        duration: enhanceDateFormatting(dateString),
        description: '',
        responsibilities: []
      };
      
      responsibilities = [];
      lookingForDates = false;
      console.log('🏢 Created new experience:', currentExp);
    }
    // If this looks like a job/company line but no dates, look for dates in next lines
    else if (isCompanyLine && !currentExp) {
      console.log('🏢 Found potential job line without dates');
      
      // Look ahead for dates in the next few lines
      let foundDate = null;
      for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
        const nextLine = lines[j].trim();
        const nextDateMatch = nextLine.match(/(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?\s+\d{4})\s*[-–—to]\s*(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?\s+\d{4}|present|current|till\s+date)/gi) ||
                            nextLine.match(/\b(\d{4})\s*[-–—to]\s*(\d{4}|present|current)\b/gi);
        
        if (nextDateMatch) {
          foundDate = nextDateMatch[0];
          console.log('📅 Found date in next line:', foundDate);
          break;
        }
      }

      // Save previous experience
      if (currentExp) {
        currentExp.responsibilities = responsibilities;
        experiences.push(currentExp);
      }

      // Parse the current line
      const parts = line.split(/[-–—|,]/).map(p => p.trim()).filter(p => p);
      
      currentExp = {
        title: parts[0] || 'Professional Position',
        company: parts[1] || parts[0] || 'Professional Organization', 
        duration: foundDate ? enhanceDateFormatting(foundDate) : 'Recent Experience',
        description: '',
        responsibilities: []
      };
      
      responsibilities = [];
      lookingForDates = !foundDate;
      console.log('🏢 Created new experience (looking for dates):', currentExp);
    }
    // If we're looking for dates and find them
    else if (lookingForDates && currentExp && (fullDateRangeMatch || yearRangeMatch)) {
      const dateString = fullDateRangeMatch ? fullDateRangeMatch[0] : yearRangeMatch![0];
      currentExp.duration = enhanceDateFormatting(dateString);
      lookingForDates = false;
      console.log('📅 Updated duration for current experience:', currentExp.duration);
    }
    // This is likely a responsibility or description
    else if (currentExp && line.length > 10) {
      responsibilities.push(line);
      console.log('📋 Added responsibility:', line.substring(0, 50) + '...');
    }
  }

  // Add the last experience
  if (currentExp) {
    currentExp.responsibilities = responsibilities;
    experiences.push(currentExp);
    console.log('💼 Saved final experience:', currentExp.title);
  }

  // If no structured experiences found, create a generic one from all content
  if (experiences.length === 0 && lines.length > 0) {
    console.log('⚠️ No structured experiences found, creating generic one');
    experiences.push({
      title: 'Professional Experience',
      company: 'Professional Organization',
      duration: 'Recent Experience', 
      description: lines.join(' ').substring(0, 200),
      responsibilities: lines.slice(0, 5)
    });
  }

  console.log('✅ Final parsed experiences:', experiences.length);
  experiences.forEach(exp => {
    console.log(`- ${exp.title} at ${exp.company} (${exp.duration})`);
  });

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