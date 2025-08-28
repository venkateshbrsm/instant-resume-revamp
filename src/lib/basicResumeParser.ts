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
    const fullDateRangeMatch = line.match(/(\b(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september|oct|october|nov|november|dec|december)\.?\s+\d{4})\s*[-–—to]\s*(\b(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september|oct|october|nov|november|dec|december)\.?\s+\d{4}|present|current|till\s+date)/gi);
    const singleDateMatch = line.match(/\b(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september|oct|october|nov|november|dec|december)\.?\s+\d{4}\b/gi);
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
        currentExp.responsibilities = enhanceResponsibilitiesForATS(responsibilities);
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
        const nextDateMatch = nextLine.match(/(\b(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september|oct|october|nov|november|dec|december)\.?\s+\d{4})\s*[-–—to]\s*(\b(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september|oct|october|nov|november|dec|december)\.?\s+\d{4}|present|current|till\s+date)/gi) ||
                            nextLine.match(/\b(\d{4})\s*[-–—to]\s*(\d{4}|present|current)\b/gi);
        
        if (nextDateMatch) {
          foundDate = nextDateMatch[0];
          console.log('📅 Found date in next line:', foundDate);
          break;
        }
      }

      // Save previous experience
      if (currentExp) {
        currentExp.responsibilities = enhanceResponsibilitiesForATS(responsibilities);
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
    currentExp.responsibilities = enhanceResponsibilitiesForATS(responsibilities);
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

function enhanceResponsibilitiesForATS(responsibilities: string[]): string[] {
  const actionVerbs = [
    'Spearheaded', 'Orchestrated', 'Pioneered', 'Championed', 'Executed', 'Implemented', 'Developed', 
    'Managed', 'Led', 'Directed', 'Coordinated', 'Supervised', 'Oversaw', 'Facilitated', 'Streamlined',
    'Optimized', 'Enhanced', 'Improved', 'Transformed', 'Delivered', 'Achieved', 'Exceeded', 'Generated',
    'Established', 'Created', 'Designed', 'Built', 'Initiated', 'Launched', 'Collaborated', 'Partnered',
    'Accelerated', 'Architected', 'Automated', 'Consolidated', 'Cultivated', 'Demonstrated', 'Engineered',
    'Formulated', 'Maximized', 'Modernized', 'Negotiated', 'Standardized', 'Strategized', 'Synthesized'
  ];

  const enhancedResponsibilities = responsibilities.map(responsibility => {
    let enhanced = responsibility.trim();
    
    // Remove bullet points and clean up
    enhanced = enhanced.replace(/^[•\-▪\*]\s*/, '').trim();
    
    // Skip if too short
    if (enhanced.length < 10) return enhanced;
    
    // Skip obvious company info/headers - be more specific
    const isCompanyHeader = (
      enhanced.match(/^[A-Z\s]+,\s*[A-Z][a-z]+,?\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i) ||
      enhanced.match(/^\d{4}\s*[-–—]\s*\d{4}/) ||
      enhanced.match(/^[A-Z][A-Z\s&]+\s+(PVT|PRIVATE|LIMITED|LTD|INC|CORP)/i)
    );
    
    if (isCompanyHeader) {
      return enhanced;
    }
    
    // Convert to sentence case if all caps
    if (enhanced === enhanced.toUpperCase()) {
      enhanced = enhanced.toLowerCase();
      enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
    }
    
    // More aggressive ATS-friendly rewriting
    const needsActionVerb = !actionVerbs.some(verb => 
      enhanced.toLowerCase().startsWith(verb.toLowerCase())
    );
    
    if (needsActionVerb) {
      // Replace weak starts with stronger action verbs
      if (enhanced.toLowerCase().startsWith('responsible for')) {
        const verbs = ['Orchestrated', 'Spearheaded', 'Managed', 'Led', 'Supervised', 'Coordinated'];
        const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];
        enhanced = enhanced.replace(/^responsible for\s*/i, `${randomVerb} `);
      } else if (enhanced.toLowerCase().startsWith('worked on') || enhanced.toLowerCase().startsWith('worked with')) {
        enhanced = enhanced.replace(/^worked (on|with)\s*/i, 'Collaborated on ');
      } else if (enhanced.toLowerCase().startsWith('helped with') || enhanced.toLowerCase().startsWith('helped in')) {
        enhanced = enhanced.replace(/^helped (with|in)\s*/i, 'Facilitated ');  
      } else if (enhanced.toLowerCase().startsWith('helped')) {
        enhanced = enhanced.replace(/^helped\s*/i, 'Assisted with ');
      } else if (enhanced.toLowerCase().startsWith('involved in')) {
        enhanced = enhanced.replace(/^involved in\s*/i, 'Participated in ');
      } else if (enhanced.toLowerCase().startsWith('handled')) {
        enhanced = enhanced.replace(/^handled\s*/i, 'Managed ');
      } else if (enhanced.toLowerCase().startsWith('performed')) {
        enhanced = enhanced.replace(/^performed\s*/i, 'Executed ');
      } else if (enhanced.toLowerCase().startsWith('took care of')) {
        enhanced = enhanced.replace(/^took care of\s*/i, 'Oversaw ');
      } else if (enhanced.toLowerCase().startsWith('was in charge of')) {
        enhanced = enhanced.replace(/^was in charge of\s*/i, 'Led ');
      } else if (enhanced.toLowerCase().startsWith('supported')) {
        enhanced = enhanced.replace(/^supported\s*/i, 'Facilitated ');
      } else if (enhanced.toLowerCase().startsWith('assisted')) {
        enhanced = enhanced.replace(/^assisted\s*/i, 'Collaborated in ');
      } else if (enhanced.toLowerCase().startsWith('participated')) {
        enhanced = enhanced.replace(/^participated\s*/i, 'Contributed to ');
      } else if (enhanced.toLowerCase().startsWith('contributed')) {
        enhanced = enhanced.replace(/^contributed\s*/i, 'Delivered ');
      } else if (enhanced.toLowerCase().startsWith('completed')) {
        enhanced = enhanced.replace(/^completed\s*/i, 'Accomplished ');
      } else if (enhanced.toLowerCase().startsWith('conducted')) {
        enhanced = enhanced.replace(/^conducted\s*/i, 'Orchestrated ');
      } else if (enhanced.toLowerCase().startsWith('organized')) {
        enhanced = enhanced.replace(/^organized\s*/i, 'Streamlined ');
      } else if (enhanced.toLowerCase().startsWith('monitored')) {
        enhanced = enhanced.replace(/^monitored\s*/i, 'Oversaw ');
      } else if (enhanced.toLowerCase().startsWith('reviewed')) {
        enhanced = enhanced.replace(/^reviewed\s*/i, 'Analyzed ');
      } else if (enhanced.toLowerCase().startsWith('updated')) {
        enhanced = enhanced.replace(/^updated\s*/i, 'Enhanced ');
      } else if (enhanced.toLowerCase().startsWith('prepared')) {
        enhanced = enhanced.replace(/^prepared\s*/i, 'Developed ');
      } else if (enhanced.toLowerCase().startsWith('coordinated')) {
        // Keep as is - already strong
      } else if (enhanced.toLowerCase().startsWith('managed')) {
        // Keep as is - already strong
      } else if (enhanced.toLowerCase().startsWith('developed')) {
        // Keep as is - already strong
      } else if (enhanced.toLowerCase().startsWith('implemented')) {
        // Keep as is - already strong
      } else if (enhanced.toLowerCase().startsWith('created')) {
        // Keep as is - already strong
      } else if (enhanced.toLowerCase().startsWith('designed')) {
        // Keep as is - already strong
      } else if (enhanced.toLowerCase().startsWith('established')) {
        // Keep as is - already strong
      } else if (enhanced.toLowerCase().startsWith('improved')) {
        // Keep as is - already strong
      } else if (enhanced.toLowerCase().startsWith('enhanced')) {
        // Keep as is - already strong
      } else if (enhanced.toLowerCase().startsWith('optimized')) {
        // Keep as is - already strong
      } else if (enhanced.toLowerCase().startsWith('streamlined')) {
        // Keep as is - already strong
      } else if (enhanced.toLowerCase().startsWith('maintained')) {
        enhanced = enhanced.replace(/^maintained\s*/i, 'Sustained ');
      } else if (enhanced.toLowerCase().startsWith('ensured')) {
        enhanced = enhanced.replace(/^ensured\s*/i, 'Guaranteed ');
      } else {
        // For any other case, try to add a strong action verb at the beginning
        const defaultVerbs = ['Executed', 'Delivered', 'Accomplished', 'Achieved', 'Implemented'];
        const randomVerb = defaultVerbs[Math.floor(Math.random() * defaultVerbs.length)];
        // Only add if it doesn't already start with a verb-like word
        if (!enhanced.match(/^[A-Z][a-z]+(ed|ing|s)\s/)) {
          enhanced = `${randomVerb} ${enhanced.toLowerCase()}`;
        }
      }
    }
    
    // Ensure proper capitalization
    enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
    
    // Add professional terminology improvements (but keep it natural)
    enhanced = enhanced
      .replace(/\bcustomers?\b/gi, 'clients')
      .replace(/\bfix(ed|ing)?\b/gi, 'resolve')
      .replace(/\bproblems?\b/gi, 'challenges')
      .replace(/\bissues?\b/gi, 'challenges');
    
    // Ensure it ends properly
    if (!enhanced.endsWith('.') && !enhanced.endsWith(';') && enhanced.length > 20) {
      enhanced += '.';
    }
    
    return enhanced;
  });

  // Filter out very short or empty responsibilities
  return enhancedResponsibilities.filter(resp => resp && resp.trim().length > 10);
}