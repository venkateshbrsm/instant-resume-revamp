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
  console.log('🤖 Starting AI enhancement...');
  console.log('📝 Original text preview (first 300 chars):', originalText.substring(0, 300));
  
  // Check if the text looks like an error message or fallback content
  const isErrorContent = originalText.includes('PDF Processing Error') || 
                        originalText.includes('Limited Text Extraction') ||
                        originalText.includes('PDF Resume:') ||
                        originalText.length < 50;
  
  if (isErrorContent) {
    console.log('⚠️ Detected error/fallback content, using comprehensive parsing mode');
    return await enhanceWithComprehensiveParsing(originalText, apiKey);
  }
  
  const prompt = `You are an expert ATS resume optimizer and career consultant. You MUST extract REAL information from the user's actual resume content and enhance it professionally.

IMPORTANT: The following text is from a REAL PERSON'S RESUME. Extract their ACTUAL information, don't create fictional content.

ORIGINAL RESUME TEXT:
${originalText}

CRITICAL REQUIREMENTS:
1. EXTRACT THE PERSON'S REAL NAME, EMAIL, PHONE, AND LOCATION from the original text
2. EXTRACT ALL REAL WORK EXPERIENCE with actual company names, job titles, and dates
3. EXTRACT ALL REAL SKILLS AND TECHNICAL SKILLS mentioned in the original
4. EXTRACT REAL EDUCATION information if available
5. DO NOT CREATE FAKE COMPANIES, NAMES, OR EXPERIENCES
6. If information is missing, use "Not provided" rather than making it up
7. Enhance the descriptions with professional language but keep the core facts accurate
8. Return ONLY valid JSON with the exact structure below
9. PRESERVE the person's actual career progression and timeline
10. ADD relevant keywords for their ACTUAL field/industry based on their real experience

REQUIRED JSON STRUCTURE:
{
  "name": "Full professional name",
  "title": "Professional title or desired role", 
  "email": "email@example.com",
  "phone": "phone number",
  "location": "City, State/Country",
  "linkedin": "LinkedIn profile URL if available",
  "summary": "Comprehensive 4-6 sentence professional summary with keywords and achievements",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start Date - End Date",
      "description": "Brief 1-2 sentence overview of the role and main focus",
      "core_responsibilities": [
        "Primary responsibility with detailed description",
        "Secondary responsibility with specific tasks and duties",
        "Third key responsibility with operational details"
      ],
      "achievements": [
        "Specific achievement with metrics and impact",
        "Another key accomplishment with quantifiable results",
        "Third major contribution with measurable outcomes"
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name", 
      "year": "Graduation Year or Duration",
      "gpa": "GPA if available"
    }
  ],
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8", "skill9", "skill10", "skill11", "skill12"],
  "tools": ["tool1", "tool2", "tool3", "tool4", "tool5", "tool6", "tool7", "tool8", "tool9", "tool10"],
  "core_technical_skills": [
    {
      "name": "Technical Skill Name",
      "proficiency": 85
    }
  ]
}

ENHANCEMENT GUIDELINES:
- Professional summary should be compelling and keyword-rich
- Experience descriptions should be brief role overviews (1-2 sentences)
- Each experience should have 3-5 core responsibilities detailing daily tasks and duties
- Each experience should have 3-5 specific achievements with metrics and impact
- Extract ALL skills from original resume and include 10-15 relevant skills including technical and soft skills
- Extract ALL tools mentioned in original resume as a separate "tools" array
- Add 8-15 core technical skills with proficiency levels (70-95%) based on original skills
- Expand on responsibilities with action verbs and specific outcomes
- Make content ATS-friendly with industry standard terminology
- Ensure all sections are comprehensive and detailed
- Focus achievements on quantifiable results and business impact`;

  console.log('🚀 Sending request to OpenAI API...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert resume optimizer. Extract REAL information from the person\'s actual resume and enhance it professionally. NEVER create fictional content. If information is missing, use "Not provided" instead of making it up. Always return valid JSON.' 
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      max_completion_tokens: 4000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const enhancedContent = data.choices[0]?.message?.content;

  if (!enhancedContent) {
    throw new Error('No content received from OpenAI');
  }

  console.log('📥 Raw AI response received, parsing JSON...');
  console.log('🔍 Response preview (first 300 chars):', enhancedContent.substring(0, 300));

  try {
    // Clean up the response to ensure it's valid JSON
    let cleanedContent = enhancedContent.trim();
    
    // Remove any markdown code block markers
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    console.log('🧹 Cleaned content preview (first 200 chars):', cleanedContent.substring(0, 200));

    const parsedResume = JSON.parse(cleanedContent);
    
    console.log('✅ Successfully parsed JSON structure');
    console.log('👤 Parsed name:', parsedResume.name);
    console.log('💼 Experience entries count:', parsedResume.experience?.length || 0);
    console.log('🎯 Skills count:', parsedResume.skills?.length || 0);
    
    // Validate the structure and content quality
    if (!parsedResume.name || parsedResume.name === "Full professional name" || parsedResume.name.includes("Professional")) {
      console.warn('⚠️ Generic or missing name detected, may be placeholder content');
    }
    
    if (!parsedResume.summary || !parsedResume.experience) {
      throw new Error('Invalid resume structure received from AI');
    }

    // Ensure arrays exist
    parsedResume.experience = parsedResume.experience || [];
    parsedResume.education = parsedResume.education || [];
    parsedResume.skills = parsedResume.skills || [];
    parsedResume.tools = parsedResume.tools || [];
    parsedResume.core_technical_skills = parsedResume.core_technical_skills || [];

    // Add some fallback data if sections are empty
    if (parsedResume.experience.length === 0) {
      parsedResume.experience.push({
        title: "Professional Experience",
        company: "Professional Organization", 
        duration: "Recent Experience",
        description: "Demonstrated expertise in various professional domains with focus on delivering measurable results.",
        core_responsibilities: [
          "Training new team members on specific procedures and tools",
          "Managing daily operations related to business initiatives and objectives",
          "Participating in team meetings and updating progress status",
          "Attending departmental meetings and sharing project updates"
        ],
        achievements: [
          "Delivered exceptional results through innovative problem-solving approaches and collaborative teamwork",
          "Drove process improvements that enhanced operational efficiency and stakeholder satisfaction", 
          "Contributed to organizational success through strategic planning and effective project management"
        ]
      });
    }

    if (parsedResume.skills.length === 0) {
      parsedResume.skills = [
        "Project Management", "Problem Solving", "Team Collaboration", "Communication",
        "Data Analysis", "Process Improvement", "Leadership", "Strategic Planning",
        "Customer Service", "Technical Skills", "Microsoft Office", "Adaptability"
      ];
    }

    if (parsedResume.core_technical_skills.length === 0) {
      parsedResume.core_technical_skills = [
        { "name": "Digital Marketing", "proficiency": 92 },
        { "name": "Content Strategy", "proficiency": 88 },
        { "name": "SEO Optimization", "proficiency": 85 },
        { "name": "SEM Management", "proficiency": 83 },
        { "name": "Social Media Marketing", "proficiency": 90 },
        { "name": "Brand Development", "proficiency": 87 },
        { "name": "Market Research", "proficiency": 84 },
        { "name": "Campaign Management", "proficiency": 91 },
        { "name": "Google Analytics", "proficiency": 89 },
        { "name": "Google Ads", "proficiency": 86 }
      ];
    }

    console.log('Successfully parsed enhanced resume');
    return parsedResume;

  } catch (parseError) {
    console.error('❌ JSON parsing error:', parseError);
    console.error('📄 Raw content that failed to parse:', enhancedContent);
    
    // Try comprehensive parsing as fallback
    console.log('🔄 Attempting comprehensive parsing fallback...');
    return await enhanceWithComprehensiveParsing(originalText, apiKey);
  }
}

// Enhanced comprehensive parsing function
async function enhanceWithComprehensiveParsing(originalText: string, apiKey: string): Promise<any> {
  console.log('🔬 Starting comprehensive parsing for complex/error content...');
  
  const comprehensivePrompt = `You are an expert resume parser and career consultant. The text below may be from a PDF extraction error or contain formatting issues, but you need to extract any real information available and create a professional resume.

TEXT TO ANALYZE:
${originalText}

INSTRUCTIONS:
1. Look for ANY real personal information (name, email, phone, location)
2. Look for ANY real work experience, company names, job titles, dates
3. Look for ANY real skills, education, or qualifications mentioned
4. If you find real information, use it and enhance it professionally
5. If the text is mostly error messages or has very little real content, create a basic professional template but indicate missing information
6. NEVER invent specific company names, dates, or personal details that aren't in the original
7. Return ONLY valid JSON with the structure below

REQUIRED JSON STRUCTURE (same as before):
{
  "name": "Extract real name or use 'Name Not Provided'",
  "title": "Extract real title or use 'Professional'", 
  "email": "Extract real email or use 'Email Not Provided'",
  "phone": "Extract real phone or use 'Phone Not Provided'",
  "location": "Extract real location or use 'Location Not Provided'",
  "linkedin": "Extract real LinkedIn or use ''",
  "summary": "Professional summary based on any available information",
  "experience": [/* Extract real experience or provide basic template */],
  "education": [/* Extract real education or provide basic template */],
  "skills": [/* Extract real skills or provide relevant basic skills */],
  "tools": [/* Extract real tools mentioned */],
  "core_technical_skills": [/* Based on extracted information */]
}`;

  console.log('🚀 Sending comprehensive parsing request to OpenAI...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert at extracting real information from resumes, even when the text has formatting issues or extraction errors. Extract only real information and clearly indicate when information is not available rather than making it up.' 
        },
        { 
          role: 'user', 
          content: comprehensivePrompt 
        }
      ],
      max_completion_tokens: 3000,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ OpenAI API error in comprehensive parsing:', response.status, errorText);
    
    // Ultimate fallback to basic parsing
    console.log('🔄 Falling back to basic parsing...');
    return basicParseResume(originalText);
  }

  const data = await response.json();
  const comprehensiveContent = data.choices[0]?.message?.content;

  if (!comprehensiveContent) {
    console.log('❌ No content from comprehensive parsing, using basic fallback');
    return basicParseResume(originalText);
  }

  try {
    // Clean and parse the comprehensive response
    let cleanedContent = comprehensiveContent.trim();
    
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedResume = JSON.parse(cleanedContent);
    console.log('✅ Comprehensive parsing successful');
    console.log('👤 Extracted name:', parsedResume.name);
    
    return parsedResume;

  } catch (error) {
    console.error('❌ Comprehensive parsing also failed:', error);
    console.log('🔄 Using basic parsing as final fallback');
    return basicParseResume(originalText);
  }

function basicParseResume(text: string): any {
  console.log('📋 Using basic parsing as final fallback...');
  console.log('📄 Text being parsed (first 200 chars):', text.substring(0, 200));
  
  const lines = text.split('\n').filter(line => line.trim());
  
  const content: any = {
    name: 'Name Not Provided',
    title: 'Professional',
    email: 'Email Not Provided',
    phone: 'Phone Not Provided',
    location: 'Location Not Provided',
    linkedin: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    tools: [],
    core_technical_skills: []
  };

  let realInfoFound = false;

  // Extract basic information
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip error message lines
    if (line.includes('PDF Processing Error') || 
        line.includes('Limited Text Extraction') ||
        line.includes('File Details:') ||
        line.includes('💡') ||
        line.includes('❌') ||
        line.includes('⚠️')) {
      continue;
    }
    
    // Extract email
    const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      content.email = emailMatch[0];
      realInfoFound = true;
      console.log('📧 Found email:', content.email);
    }
    
    // Extract phone
    const phoneMatch = line.match(/(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
    if (phoneMatch) {
      content.phone = phoneMatch[0];
      realInfoFound = true;
      console.log('📞 Found phone:', content.phone);
    }
    
    // Extract name (first meaningful line that's not contact info)
    if (content.name === 'Name Not Provided' && 
        line.length > 2 && 
        line.length < 50 && 
        !emailMatch && 
        !phoneMatch && 
        !line.includes('http') &&
        !line.includes('.pdf') &&
        !line.includes('Size:') &&
        !line.includes('Type:')) {
      content.name = line;
      realInfoFound = true;
      console.log('👤 Found name:', content.name);
    }
  }

  console.log('🔍 Real information found:', realInfoFound);

  // Create summary based on whether real info was found
  if (realInfoFound) {
    content.summary = `Experienced professional with expertise in multiple domains. Demonstrated ability to deliver results and collaborate effectively in team environments. Skilled in problem-solving and committed to continuous improvement and professional development.`;
  } else {
    content.summary = `Professional seeking opportunities to contribute skills and experience. Due to file processing limitations, please refer to the original resume document for complete details. Strong commitment to excellence and collaborative approach to achieving organizational objectives.`;
  }

  // Add experience based on whether real info was found
  if (realInfoFound) {
    content.experience = [
      {
        title: "Professional Experience",
        company: "Please refer to original document",
        duration: "See original resume for dates",
        description: "Professional experience details extracted from uploaded resume. Due to file processing limitations, some formatting may have been affected.",
        core_responsibilities: [
          "Professional duties and responsibilities as detailed in original resume",
          "Key tasks and project management activities",
          "Collaboration and team coordination efforts"
        ],
        achievements: [
          "Professional accomplishments as outlined in original document",
          "Successful project delivery and performance metrics",
          "Contributions to organizational goals and objectives"
        ]
      }
    ];
  } else {
    content.experience = [
      {
        title: "Experience Details Not Available",
        company: "Please refer to original document",
        duration: "See original resume",
        description: "Due to file processing limitations, experience details could not be extracted. Please refer to your original resume document for complete work history.",
        core_responsibilities: [
          "Professional responsibilities as detailed in original resume",
          "Key duties and task management",
          "Team collaboration and project coordination"
        ],
        achievements: [
          "Professional achievements as outlined in original document",
          "Successful completion of assigned projects and initiatives",
          "Contributions to team and organizational success"
        ]
      }
    ];
  }

  // Add education
  content.education = [
    {
      degree: realInfoFound ? "Education details in original document" : "Education Not Provided",
      institution: realInfoFound ? "Please refer to original resume" : "Institution Not Provided",
      year: realInfoFound ? "See original document" : "Year Not Provided"
    }
  ];

  // Add skills - more conservative when no real info found
  if (realInfoFound) {
    content.skills = [
      "Professional Skills", "Communication", "Problem Solving", "Team Collaboration",
      "Project Management", "Analytical Thinking", "Technical Proficiency", "Adaptability",
      "Time Management", "Quality Focus", "Customer Service", "Process Improvement"
    ];
  } else {
    content.skills = [
      "Skills details in original document", "Professional capabilities as listed in resume",
      "Technical skills per original document", "Soft skills as outlined in original resume"
    ];
  }

  // Add tools
  content.tools = realInfoFound ? 
    ["Microsoft Office", "Email Communication", "Professional Software"] :
    ["Tools and software listed in original document"];

  // Add core technical skills with proficiency
  if (realInfoFound) {
    content.core_technical_skills = [
      { "name": "Professional Skills", "proficiency": 85 },
      { "name": "Communication", "proficiency": 90 },
      { "name": "Problem Solving", "proficiency": 88 },
      { "name": "Team Collaboration", "proficiency": 87 },
      { "name": "Technical Proficiency", "proficiency": 82 }
    ];
  } else {
    content.core_technical_skills = [
      { "name": "Technical skills from original document", "proficiency": 80 },
      { "name": "Professional capabilities as listed", "proficiency": 85 }
    ];
  }

  console.log('📋 Basic parsing completed. Real info found:', realInfoFound);

  return content;
}