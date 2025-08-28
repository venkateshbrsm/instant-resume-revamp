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

    // Validate input - be more lenient with DOCX extraction
    if (!extractedText || extractedText.trim().length < 5) {
      console.log('Insufficient text content, extracted text preview:', extractedText?.substring(0, 200));
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Insufficient text content for enhancement. Please ensure your document contains readable text." 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log the actual extracted text for debugging
    console.log('Extracted text preview (first 300 chars):', extractedText.substring(0, 300));

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to edge function secrets.');
    }

    console.log('Enhancing resume with AI...');
    console.log('Using extracted text (length:', extractedText?.length, ')');
    console.log('Text preview:', extractedText?.substring(0, 200));
    
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
  const prompt = `You are an expert ATS resume optimizer and career consultant. Transform the following resume content into a comprehensive, ATS-friendly, keyword-rich professional resume.

ORIGINAL RESUME TEXT:
${originalText}

CRITICAL INSTRUCTIONS:
1. Extract and enhance ALL work experience entries from the original resume - DO NOT REDUCE THE NUMBER OF JOBS
2. Preserve EVERY job position, company, and time period from the original
3. Create UNIQUE, DIVERSE content for each job - NO REPETITIVE LANGUAGE between positions
4. Each job must have DISTINCT responsibilities and achievements that reflect the actual role
5. Extract and preserve ALL skills and technical skills from the original resume
6. Use the actual extracted content as the foundation - don't create fictional information
7. Make each job description significantly different from others in language, focus, and responsibilities
8. Avoid generic phrases like "cross-functional team collaboration" across multiple roles
9. Return ONLY a valid JSON object with the exact structure shown below
10. MANDATORY: Each experience entry must be substantially different in content and language

DIVERSITY REQUIREMENTS FOR EXPERIENCE:
- Use different action verbs for each role (developed, implemented, managed, led, created, optimized, etc.)
- Focus on role-specific responsibilities (technical for dev roles, creative for marketing, etc.)
- Vary the achievement metrics and outcomes for each position
- Use different industry terminology appropriate to each role
- Ensure no phrases or sentence structures are repeated across jobs

REQUIRED JSON STRUCTURE:
{
  "name": "Full professional name from resume",
  "title": "Professional title or desired role from resume", 
  "email": "actual email from resume",
  "phone": "actual phone number from resume",
  "location": "actual location from resume",
  "linkedin": "LinkedIn profile URL if available in resume",
  "summary": "Comprehensive 4-6 sentence professional summary based on actual experience and skills",
  "experience": [
    {
      "title": "Exact Job Title from Resume",
      "company": "Exact Company Name from Resume",
      "duration": "Exact Start Date - End Date from Resume",
      "description": "Unique 1-2 sentence overview specific to this role's focus and industry",
      "core_responsibilities": [
        "Role-specific responsibility with unique language and technical details",
        "Different responsibility using varied action verbs and industry terms",
        "Third unique responsibility with distinct focus from other roles"
      ],
      "achievements": [
        "Specific achievement with unique metrics and role-appropriate outcomes",
        "Different accomplishment with varied language and distinct results",
        "Third achievement with unique phrasing and role-specific impact"
      ]
    }
  ],
  "education": [
    {
      "degree": "Exact Degree Name from Resume",
      "institution": "Exact Institution Name from Resume", 
      "year": "Exact Graduation Year from Resume",
      "gpa": "GPA if mentioned in resume"
    }
  ],
  "skills": ["Extract ALL skills mentioned in original resume - maintain exact list"],
  "tools": ["Extract ALL tools/technologies mentioned in original resume"],
  "core_technical_skills": [
    {
      "name": "Technical Skill from Resume",
      "proficiency": 85
    }
  ]
}

ENHANCEMENT GUIDELINES:
- Use ONLY information that can be inferred from the original resume text
- Professional summary should reflect actual experience and skills mentioned
- Each experience description must be unique - no copy-paste language between jobs
- Vary sentence structures, vocabulary, and focus areas for each role
- Core responsibilities should reflect actual job functions with enhanced detail
- Achievements should be role-specific with realistic metrics
- Skills and tools must come from the original resume content
- Add technical skills with proficiency based on experience level shown
- Ensure all personal information (name, email, phone) matches the original exactly
- Make content comprehensive but authentic to the original resume`;

  console.log('Sending request to OpenAI with model: gpt-4o');

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
          content: 'You are an expert resume optimizer. Create unique, diverse content for each job role. Never repeat language or phrases between different positions. Always return valid JSON.' 
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      max_tokens: 4000,
      temperature: 0.8, // Increased for more creative, diverse content
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, response.statusText);
    console.error('Error response body:', errorText);
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const enhancedContent = data.choices[0]?.message?.content;

  if (!enhancedContent) {
    throw new Error('No content received from OpenAI');
  }

  console.log('Raw AI response received, parsing JSON...');

  try {
    // Clean up the response to ensure it's valid JSON
    let cleanedContent = enhancedContent.trim();
    
    // Log the raw AI response for debugging
    console.log('Raw AI response (first 500 chars):', cleanedContent.substring(0, 500));
    
    // Remove any markdown code block markers
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    console.log('Attempting to parse cleaned JSON...');
    const parsedResume = JSON.parse(cleanedContent);
    
    console.log('Successfully parsed JSON, validating structure...');
    
    // Validate the structure
    if (!parsedResume.name || !parsedResume.summary || !parsedResume.experience) {
      console.log('Invalid resume structure, missing required fields:', {
        hasName: !!parsedResume.name,
        hasSummary: !!parsedResume.summary, 
        hasExperience: !!parsedResume.experience
      });
      throw new Error('Invalid resume structure received from AI');
    }

    // Ensure arrays exist
    parsedResume.experience = parsedResume.experience || [];
    parsedResume.education = parsedResume.education || [];
    parsedResume.skills = parsedResume.skills || [];
    parsedResume.tools = parsedResume.tools || [];
    parsedResume.core_technical_skills = parsedResume.core_technical_skills || [];
    parsedResume.skills = parsedResume.skills || [];
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
    console.error('JSON parsing error:', parseError);
    console.error('Raw AI response length:', enhancedContent?.length || 0);
    console.error('Raw content preview:', enhancedContent?.substring(0, 500));
    
    // Instead of falling back to placeholder data, throw the error
    throw new Error(`Failed to parse AI response: ${parseError.message}. Please try again with a clearer document.`);
  }
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