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
  const prompt = `You are an expert ATS resume optimizer. Take the original resume text and reword it to be ATS-friendly with industry keywords, while preserving all factual information. Each job role must have UNIQUE, role-specific content.

ORIGINAL RESUME TEXT:
${originalText}

CRITICAL RULES:
1. Use ONLY actual information from the resume - no fictional content
2. Each job role MUST have completely different, role-specific descriptions
3. Analyze each actual role and create unique, relevant responsibilities
4. Use different action verbs and terminology for each position
5. Keep all real names, companies, dates, and credentials exactly as provided
6. Focus on what each role actually did based on the resume content

CONTENT DIVERSITY REQUIREMENTS:
- Job #1: Focus on leadership and strategic responsibilities if mentioned
- Job #2: Emphasize technical skills and project management aspects
- Job #3: Highlight operational efficiency and process improvements
- Use completely different vocabulary and focus areas for each role
- NO generic statements that could apply to any job
- Extract actual specifics from the resume text for each position

REQUIRED JSON STRUCTURE:
{
  "name": "Exact name from the original resume",
  "title": "Actual professional title or role from resume", 
  "email": "Exact email address from resume",
  "phone": "Exact phone number from resume",
  "location": "Actual location from resume",
  "linkedin": "Actual LinkedIn URL if mentioned in resume",
  "summary": "Professional summary based on actual experience and skills mentioned in resume",
  "experience": [
    {
      "title": "Exact job title from resume",
      "company": "Exact company name from resume",
      "duration": "Exact dates from resume",
      "description": "ATS-friendly rewrite of actual role description from resume",
      "core_responsibilities": [
        "Reworded version of actual responsibility #1 with ATS keywords",
        "Reworded version of actual responsibility #2 with industry terms",
        "Reworded version of actual responsibility #3 with professional language"
      ],
      "achievements": [
        "ATS-enhanced version of actual achievement #1 from resume",
        "Professional rewrite of actual accomplishment #2 from resume",
        "Keyword-rich version of actual result #3 from resume"
      ]
    }
  ],
  "education": [
    {
      "degree": "Exact degree name from resume",
      "institution": "Exact institution name from resume", 
      "year": "Exact year/duration from resume",
      "gpa": "Actual GPA if mentioned in resume"
    }
  ],
  "skills": ["Actual skills from resume with ATS-friendly formatting"],
  "tools": ["Actual tools/technologies mentioned in resume"],
  "core_technical_skills": [
    {
      "name": "Actual technical skill from resume",
      "proficiency": 85
    }
  ]
}

REWRITING EXAMPLES BY ROLE TYPE:
- Facilities Management: "Managed facilities operations" → "Orchestrated comprehensive facility management operations including space planning, vendor coordination, and regulatory compliance"
- Corporate Real Estate: "Handled real estate" → "Executed strategic real estate portfolio optimization initiatives, lease negotiations, and property acquisitions"
- Consulting: "Provided consulting" → "Delivered specialized consulting solutions for operational excellence and business transformation initiatives"
- Each role should reflect its specific industry terminology and focus areas
- Use actual metrics, technologies, or achievements mentioned in the resume
- Make each role sound distinct and specialized based on the actual content`;

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
          content: 'You are an expert resume optimizer. Create unique, role-specific content for each job by rewording actual resume information. Each position must have distinct responsibilities and achievements. Never repeat generic phrases across different roles. Always return valid JSON.' 
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      max_tokens: 4000,
      temperature: 0.5, // Balanced temperature for creativity while maintaining accuracy
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