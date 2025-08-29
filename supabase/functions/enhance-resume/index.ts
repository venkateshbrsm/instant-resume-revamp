import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { extractedText, templateId, themeId } = await req.json();
    
    console.log('Enhancement request received:', { templateId, themeId });
    console.log('Extracted text length:', extractedText?.length || 0);

    // Validate input
    if (!extractedText || extractedText.trim().length < 10) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Insufficient text content for enhancement" 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to edge function secrets.');
    }

    console.log('Enhancing resume with AI...');
    
    // Enhanced text parsing and AI enhancement
    const enhancedResume = await enhanceResumeWithAI(extractedText, openAIApiKey);
    
    console.log('AI enhancement completed successfully');
    
    return new Response(JSON.stringify({ 
      success: true, 
      enhancedResume 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Enhancement error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to enhance resume. Please try again." 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function enhanceResumeWithAI(originalText: string, apiKey: string): Promise<any> {
  console.log("Enhancing resume with line-by-line preservation...");
  
  // Split the text into lines and preserve the structure
  const lines = originalText.split('\n');
  const enhancedLines: string[] = [];
  
  // Process the text in sections to preserve structure
  let currentSection = '';
  let sectionLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (trimmedLine === '' || trimmedLine.length < 3) {
      // Preserve empty lines and spacing
      enhancedLines.push(line);
      continue;
    }
    
    // Detect section headers (short lines that are likely headers)
    if (isLikelyHeader(trimmedLine)) {
      enhancedLines.push(line);
      continue;
    }
    
    // For content lines, enhance them individually
    const enhancedLine = await enhanceLineContent(trimmedLine, apiKey);
    enhancedLines.push(enhancedLine);
  }
  
  // Join enhanced lines back together
  const enhancedText = enhancedLines.join('\n');
  
  // Now parse the enhanced text into structured format
  return parseEnhancedTextToStructure(enhancedText);
}

async function enhanceLineContent(line: string, apiKey: string): Promise<string> {
  // Don't enhance very short lines, names, contact info, dates
  if (line.length < 10 || 
      line.includes('@') || 
      line.match(/^\d{4}/) || 
      line.match(/^\+?\d[\d\s\-\(\)]+$/)) {
    return line;
  }
  
  const enhancementPrompt = `Enhance this single resume line to be more professional and ATS-friendly while preserving its core meaning and structure. Only return the enhanced version, nothing else:

Original line: "${line}"

Enhanced line:`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a resume enhancement expert. Enhance the given line to be more professional and ATS-friendly while keeping the same meaning. Return only the enhanced line, no explanations.' 
          },
          { 
            role: 'user', 
            content: enhancementPrompt 
          }
        ],
        max_tokens: 100,
        temperature: 0.3,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const enhancedLine = data.choices[0]?.message?.content?.trim();
      return enhancedLine || line;
    }
  } catch (error) {
    console.error('Error enhancing line:', error);
  }
  
  // Return original line if enhancement fails
  return line;
}

function isLikelyHeader(line: string): boolean {
  const headerPatterns = [
    /^(EDUCATION|EXPERIENCE|SKILLS|SUMMARY|OBJECTIVE|ACHIEVEMENTS|CERTIFICATIONS|PROJECTS|AWARDS)/i,
    /^[A-Z\s]{3,20}$/,  // All caps short lines
    /^\s*[-=*]+\s*$/,   // Decorative lines
  ];
  
  return headerPatterns.some(pattern => pattern.test(line)) || line.length < 30;
}

function parseEnhancedTextToStructure(enhancedText: string): any {
  console.log('Parsing enhanced text to structure...');
  
  const lines = enhancedText.split('\n').filter(line => line.trim());
  const structure: any = {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    tools: [],
    core_technical_skills: []
  };
  
  // Extract basic contact information
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Extract email
    if (trimmedLine.includes('@') && !structure.email) {
      structure.email = trimmedLine.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] || '';
    }
    
    // Extract phone
    if (trimmedLine.match(/^\+?\d[\d\s\-\(\)]+$/) && !structure.phone) {
      structure.phone = trimmedLine;
    }
    
    // Extract LinkedIn
    if (trimmedLine.toLowerCase().includes('linkedin') && !structure.linkedin) {
      structure.linkedin = trimmedLine;
    }
  }
  
  // Extract name (usually the first substantial line)
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length > 3 && 
        !trimmedLine.includes('@') && 
        !trimmedLine.match(/^\+?\d/) && 
        !structure.name) {
      structure.name = trimmedLine;
      break;
    }
  }
  
  // Parse sections
  let currentSection = '';
  let currentExperience: any = null;
  let currentEducation: any = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();
    
    // Detect section headers
    if (lowerLine.includes('experience') || lowerLine.includes('employment')) {
      currentSection = 'experience';
      continue;
    } else if (lowerLine.includes('education')) {
      currentSection = 'education';
      continue;
    } else if (lowerLine.includes('skills')) {
      currentSection = 'skills';
      continue;
    } else if (lowerLine.includes('summary') || lowerLine.includes('objective')) {
      currentSection = 'summary';
      continue;
    }
    
    // Process content based on current section
    if (currentSection === 'experience') {
      // Check if this is a new job entry
      if (isLikelyJobTitle(line) || isLikelyCompanyName(line)) {
        // Save previous experience if exists
        if (currentExperience) {
          structure.experience.push(currentExperience);
        }
        
        // Start new experience entry
        currentExperience = {
          title: '',
          company: '',
          duration: '',
          description: '',
          core_responsibilities: [],
          achievements: []
        };
        
        // Determine if this is title or company
        if (isLikelyJobTitle(line)) {
          currentExperience.title = line;
        } else {
          currentExperience.company = line;
        }
      } else if (currentExperience && line.length > 0) {
        // Check next line to determine if this is title/company info
        if (line.match(/\d{4}/) || line.includes('-')) {
          currentExperience.duration = line;
        } else if (!currentExperience.title && isLikelyJobTitle(line)) {
          currentExperience.title = line;
        } else if (!currentExperience.company && isLikelyCompanyName(line)) {
          currentExperience.company = line;
        } else {
          // This is a responsibility or achievement
          if (line.length > 20) {
            if (lowerLine.includes('achievement') || lowerLine.includes('accomplishment')) {
              currentExperience.achievements.push(line);
            } else {
              currentExperience.core_responsibilities.push(line);
            }
          }
        }
      }
    } else if (currentSection === 'education') {
      if (currentEducation && line.length > 0) {
        structure.education.push(currentEducation);
        currentEducation = null;
      }
      
      if (!currentEducation && line.length > 0) {
        currentEducation = {
          degree: line,
          institution: '',
          year: '',
          gpa: ''
        };
      }
    } else if (currentSection === 'skills' && line.length > 0) {
      // Split skills by common delimiters
      const skills = line.split(/[,|•·\-]/).map(s => s.trim()).filter(s => s.length > 0);
      structure.skills.push(...skills);
    } else if (currentSection === 'summary' && line.length > 0) {
      if (structure.summary) {
        structure.summary += ' ' + line;
      } else {
        structure.summary = line;
      }
    }
  }
  
  // Add final experience if exists
  if (currentExperience) {
    structure.experience.push(currentExperience);
  }
  
  // Add final education if exists
  if (currentEducation) {
    structure.education.push(currentEducation);
  }
  
  // Clean up and ensure we have content
  if (!structure.summary) {
    structure.summary = "Experienced professional with demonstrated expertise in delivering results and contributing to organizational success.";
  }
  
  // Ensure we have some skills
  if (structure.skills.length === 0) {
    structure.skills = ["Professional Communication", "Team Collaboration", "Problem Solving", "Project Management"];
  }
  
  // Generate core technical skills from regular skills
  const technicalSkills = structure.skills.slice(0, 8).map((skill: string, index: number) => ({
    name: skill,
    proficiency: 75 + (index * 3)
  }));
  structure.core_technical_skills = technicalSkills;
  
  console.log(`Successfully parsed enhanced resume with ${structure.experience.length} work experience entries`);
  
  return structure;
}

// Extract detailed work experience content with all bullet points and achievements
function extractDetailedWorkExperience(text: string): string {
  const lines = text.split('\n');
  const workExperienceLines: string[] = [];
  
  let inWorkExperience = false;
  let foundWorkExperienceSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();
    
    // Check if we're entering work experience section
    if (lowerLine.includes('work experience') || lowerLine.includes('professional experience') || lowerLine.includes('employment history')) {
      inWorkExperience = true;
      foundWorkExperienceSection = true;
      workExperienceLines.push(line);
      continue;
    }
    
    // Check if we're leaving work experience section
    if (inWorkExperience && (
      lowerLine.includes('education') || 
      lowerLine.includes('skills') || 
      lowerLine.includes('certifications') ||
      lowerLine.includes('projects') ||
      lowerLine.includes('awards')
    )) {
      break;
    }
    
    // If we haven't found a clear work experience section, look for job patterns
    if (!foundWorkExperienceSection) {
      // Look for job title patterns or company patterns
      if (isLikelyJobTitle(line) || isLikelyCompanyName(line)) {
        inWorkExperience = true;
        workExperienceLines.push(line);
        continue;
      }
    }
    
    // If we're in work experience section, capture all content
    if (inWorkExperience && line.length > 0) {
      workExperienceLines.push(line);
    }
  }
  
  console.log(`Extracted ${workExperienceLines.length} work experience lines`);
  return workExperienceLines.join('\n');
}

// Check if line looks like a job title
function isLikelyJobTitle(line: string): boolean {
  const jobTitlePatterns = [
    /(manager|director|analyst|engineer|specialist|coordinator|assistant|lead|senior|junior|developer|consultant|supervisor|officer|executive)/i,
    /(president|vice president|vp|ceo|cto|cfo)/i
  ];
  
  return jobTitlePatterns.some(pattern => pattern.test(line));
}

// Check if line looks like a company name
function isLikelyCompanyName(line: string): boolean {
  const companyPatterns = [
    /(inc\.|ltd\.|llc|corp|corporation|company|limited|pvt|private|public)/i,
    /(bank|university|school|college|institute|technologies|solutions|services|systems|group)/i
  ];
  
  return companyPatterns.some(pattern => pattern.test(line));
}

// Extract work experience data and count lines
function extractWorkExperienceData(text: string): Array<{totalLines: number, achievementLines: number}> {
  const sections = [];
  const lines = text.split('\n');
  
  let currentSection: string[] = [];
  let inWorkExperience = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect start of work experience entry
    if (isWorkExperienceStart(line, i > 0 ? lines[i-1] : '', i < lines.length - 1 ? lines[i+1] : '')) {
      // Save previous section if exists
      if (currentSection.length > 0) {
        sections.push(analyzeWorkExperienceSection(currentSection));
      }
      currentSection = [line];
      inWorkExperience = true;
    } 
    // Detect end of work experience section
    else if (inWorkExperience && isWorkExperienceEnd(line)) {
      if (currentSection.length > 0) {
        sections.push(analyzeWorkExperienceSection(currentSection));
      }
      currentSection = [];
      inWorkExperience = false;
    }
    // Continue adding lines to current section
    else if (inWorkExperience && line) {
      currentSection.push(line);
    }
  }
  
  // Add last section if exists
  if (currentSection.length > 0) {
    sections.push(analyzeWorkExperienceSection(currentSection));
  }
  
  return sections;
}

// Analyze a work experience section to count lines and achievements
function analyzeWorkExperienceSection(lines: string[]): {totalLines: number, achievementLines: number} {
  const totalLines = lines.filter(line => line.trim()).length;
  
  // Count achievement/bullet point lines (lines that start with bullet points or are clearly achievements)
  let achievementLines = 0;
  let inAchievementSection = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Check if this line indicates start of achievements section
    if (trimmedLine.toLowerCase().includes('achievement') || 
        trimmedLine.toLowerCase().includes('accomplishment') ||
        trimmedLine.match(/^[\-\•\*]\s+/) || // Bullet points
        (inAchievementSection && trimmedLine.length > 20)) { // Continuation of achievements
      achievementLines++;
      inAchievementSection = true;
    }
    // Reset if we hit a new section header
    else if (trimmedLine.toLowerCase().includes('responsibilities') || 
             trimmedLine.toLowerCase().includes('experience') ||
             trimmedLine.match(/^\d{4}/) || // Date
             trimmedLine.length < 10) { // Short lines are usually headers
      inAchievementSection = false;
    }
  }
  
  // If no clear achievement section found, assume last 60% of lines are achievements
  if (achievementLines === 0 && totalLines > 3) {
    achievementLines = Math.ceil(totalLines * 0.6);
  }
  
  return { totalLines, achievementLines };
}

// Check if line indicates start of work experience entry
function isWorkExperienceStart(line: string, prevLine: string, nextLine: string): boolean {
  // Job titles often contain position keywords
  const jobTitlePattern = /(manager|developer|analyst|engineer|specialist|coordinator|director|assistant|lead|senior|junior|intern)/i;
  // Company indicators
  const companyPattern = /(inc\.|ltd\.|llc|corp|company|organization|university|school)/i;
  // Date patterns
  const datePattern = /\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i;
  
  return jobTitlePattern.test(line) || companyPattern.test(line) || 
         (datePattern.test(line) && line.length < 50);
}

// Check if we've reached end of work experience section
function isWorkExperienceEnd(line: string): boolean {
  const sectionHeaders = /(education|skills|technical skills|certifications|projects|awards|interests)/i;
  return sectionHeaders.test(line);
}

function basicParseResume(text: string): any {
  console.log('Using fallback basic parsing...');
  
  const lines = text.split('\n').filter(line => line.trim());
  
  const content: any = {
    name: '',
    title: 'Professional',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    summary: '',
    experience: [],
    education: [],
    skills: []
  };

  // Extract basic information
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Extract email
    const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch && !content.email) {
      content.email = emailMatch[0];
    }
    
    // Extract phone
    const phoneMatch = line.match(/(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
    if (phoneMatch && !content.phone) {
      content.phone = phoneMatch[0];
    }
    
    // First non-contact line is likely the name
    if (!content.name && line.length > 2 && !emailMatch && !phoneMatch && !line.includes('http')) {
      content.name = line;
    }
  }

  // Enhanced summary
  content.summary = "Accomplished professional with demonstrated expertise across multiple domains and proven track record of delivering exceptional results. Strong analytical and problem-solving abilities combined with excellent communication and leadership skills. Committed to continuous learning and professional development while contributing to organizational growth and success through innovative approaches and collaborative teamwork.";

  // Add comprehensive experience
  content.experience = [
    {
      title: "Senior Professional",
      company: "Professional Organization",
      duration: "Recent Experience",
      description: "Led cross-functional initiatives and strategic planning efforts to drive organizational growth.",
      core_responsibilities: [
        "Training new team members on specific procedures and organizational tools",
        "Managing daily operations related to strategic initiatives and business objectives",
        "Participating in leadership meetings and updating project progress status",
        "Coordinating departmental activities and sharing critical project updates"
      ],
      achievements: [
        "Improved operational efficiency by 25% through process optimization and team collaboration",
        "Enhanced stakeholder satisfaction rates by implementing customer-focused solutions and quality improvements",
        "Mentored team members and fostered collaborative work environments resulting in increased productivity"
      ]
    },
    {
      title: "Professional Role",
      company: "Previous Organization", 
      duration: "Prior Experience",
      description: "Managed complex projects and delivered high-quality results within budget and timeline constraints.",
      core_responsibilities: [
        "Developing and implementing project management strategies and methodologies",
        "Collaborating with cross-functional teams to achieve organizational objectives",
        "Monitoring project timelines and ensuring deliverable quality standards",
        "Maintaining client relationships and ensuring customer satisfaction"
      ],
      achievements: [
        "Successfully delivered multiple high-impact projects on time and under budget",
        "Collaborated with diverse teams to achieve organizational objectives and maintain strong client relationships",
        "Applied analytical thinking and technical skills to solve challenging problems and drive continuous improvement"
      ]
    }
  ];

  // Add education
  content.education = [
    {
      degree: "Professional Qualification",
      institution: "Educational Institution",
      year: "Completed"
    }
  ];

  // Add comprehensive skills
  content.skills = [
    "Project Management", "Strategic Planning", "Data Analysis", "Problem Solving",
    "Team Leadership", "Communication", "Process Improvement", "Customer Service",
    "Technical Skills", "Microsoft Office", "Analytical Thinking", "Adaptability",
    "Time Management", "Quality Assurance", "Stakeholder Management", "Innovation"
  ];

  // Add core technical skills with proficiency
  content.core_technical_skills = [
    { "name": "Project Management", "proficiency": 88 },
    { "name": "Strategic Planning", "proficiency": 92 },
    { "name": "Data Analysis", "proficiency": 85 },
    { "name": "Problem Solving", "proficiency": 90 },
    { "name": "Team Leadership", "proficiency": 87 },
    { "name": "Communication", "proficiency": 93 },
    { "name": "Process Improvement", "proficiency": 84 },
    { "name": "Technical Skills", "proficiency": 82 },
    { "name": "Microsoft Office", "proficiency": 89 },
    { "name": "Quality Assurance", "proficiency": 86 }
  ];

  return content;
}