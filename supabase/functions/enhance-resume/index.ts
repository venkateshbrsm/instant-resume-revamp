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

    console.log('Starting comprehensive resume parsing...');
    
    // Use AI-powered parsing for accurate content extraction
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
  console.log("Enhancing resume with comprehensive parsing...");
  console.log("Original text preview:", originalText.substring(0, 500));
  
  const enhancementPrompt = `You are an expert resume parser. Extract ALL information from the following resume text exactly as written, creating a comprehensive structured format.

ORIGINAL RESUME TEXT:
${originalText}

CRITICAL INSTRUCTIONS:
1. Extract the EXACT content from the resume - never create or add content
2. Parse ALL sections present in the resume
3. Preserve ALL original text, bullet points, and formatting
4. Structure the data for easy editing while keeping content intact
5. Include ALL sections found: personal details, summary, experience, education, skills, certifications, projects, achievements

Return this comprehensive JSON structure with REAL data from the resume:
{
  "personalDetails": {
    "name": "Exact full name from resume",
    "title": "Professional title/designation",
    "email": "actual email if found",
    "phone": "actual phone if found", 
    "location": "actual location/address if found",
    "linkedin": "LinkedIn URL if found",
    "website": "personal website if found"
  },
  "summary": "Professional summary exactly as written in resume",
  "experience": [
    {
      "title": "EXACT job title from resume",
      "company": "EXACT company name from resume", 
      "location": "job location if specified",
      "startDate": "start date in original format",
      "endDate": "end date or Present",
      "duration": "full duration string from resume",
      "description": "role description if present",
      "responsibilities": ["exact responsibility 1", "exact responsibility 2"],
      "achievements": ["exact achievement 1", "exact achievement 2"]
    }
  ],
  "education": [
    {
      "degree": "EXACT degree name from resume",
      "institution": "EXACT institution name from resume",
      "location": "institution location if found",
      "year": "graduation year or date range",
      "gpa": "GPA if mentioned",
      "honors": "honors/distinctions if mentioned"
    }
  ],
  "skills": {
    "technical": ["list of technical skills"],
    "soft": ["list of soft skills"],
    "languages": ["list of languages with proficiency"],
    "tools": ["list of tools/software"]
  },
  "certifications": [
    {
      "name": "certification name",
      "issuer": "issuing organization",
      "date": "certification date",
      "url": "certificate URL if provided"
    }
  ],
  "projects": [
    {
      "name": "project name",
      "description": "project description",
      "technologies": ["tech stack used"],
      "url": "project URL if provided",
      "date": "project date/duration"
    }
  ],
  "achievements": [
    "achievement or award 1",
    "achievement or award 2"
  ],
  "additionalSections": [
    {
      "title": "section name (e.g., Publications, Volunteer Work)",
      "content": "section content"
    }
  ]
}

IMPORTANT: 
- Use ONLY information that exists in the resume
- If a section doesn't exist, leave the array empty []
- Preserve exact wording and formatting
- Include all bullet points and details as they appear
- Don't enhance or modify the original content`;

  console.log('Sending comprehensive parsing request to OpenAI...');

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
          content: 'You are a professional resume parser. Extract EXACTLY what is written in the resume without adding or modifying content. Preserve all original text and structure it for easy editing.' 
        },
        { 
          role: 'user', 
          content: enhancementPrompt 
        }
      ],
      max_completion_tokens: 4000,
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

  console.log('Raw AI response received, parsing JSON...');

  try {
    // Clean up the response to ensure it's valid JSON
    let cleanedContent = enhancedContent.trim();
    
    // Remove any markdown code block markers
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedResponse = JSON.parse(cleanedContent);
    
    // Validate and structure the response
    const structuredResponse = {
      // Personal details
      name: parsedResponse.personalDetails?.name || parsedResponse.name || 'Professional',
      title: parsedResponse.personalDetails?.title || parsedResponse.title || '',
      email: parsedResponse.personalDetails?.email || parsedResponse.email || '',
      phone: parsedResponse.personalDetails?.phone || parsedResponse.phone || '',
      location: parsedResponse.personalDetails?.location || parsedResponse.location || '',
      linkedin: parsedResponse.personalDetails?.linkedin || '',
      website: parsedResponse.personalDetails?.website || '',
      
      // Summary
      summary: parsedResponse.summary || '',
      
      // Experience - ensure backward compatibility
      experience: (parsedResponse.experience || []).map((exp: any) => ({
        title: exp.title || '',
        company: exp.company || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        duration: exp.duration || `${exp.startDate || ''} - ${exp.endDate || ''}`.trim(),
        description: exp.description || '',
        responsibilities: exp.responsibilities || exp.core_responsibilities || [],
        achievements: exp.achievements || []
      })),
      
      // Education
      education: parsedResponse.education || [],
      
      // Skills - structured format
      skills: {
        technical: parsedResponse.skills?.technical || [],
        soft: parsedResponse.skills?.soft || [],
        languages: parsedResponse.skills?.languages || [],
        tools: parsedResponse.skills?.tools || []
      },
      
      // Legacy skills array for backward compatibility
      core_technical_skills: (parsedResponse.skills?.technical || []).slice(0, 5).map((skill: string, index: number) => ({
        name: skill,
        proficiency: 80 + index * 2
      })),
      
      // New sections
      certifications: parsedResponse.certifications || [],
      projects: parsedResponse.projects || [],
      achievements: parsedResponse.achievements || [],
      additionalSections: parsedResponse.additionalSections || []
    };

    console.log(`Successfully parsed resume with ${structuredResponse.experience.length} work experience entries`);
    console.log('Parsed name:', structuredResponse.name);
    console.log('Skills structure:', Object.keys(structuredResponse.skills));
    console.log('New sections found:', {
      certifications: structuredResponse.certifications.length,
      projects: structuredResponse.projects.length,
      achievements: structuredResponse.achievements.length
    });
    
    return structuredResponse;

  } catch (parseError) {
    console.error('JSON parsing error:', parseError);
    console.error('Raw content:', enhancedContent.substring(0, 500));
    
    // Fallback to basic structure
    return createFallbackStructure(originalText);
  }
}

function createFallbackStructure(originalText: string): any {
  console.log('Creating fallback structure from original text');
  
  return {
    name: 'Professional',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: 'Professional with experience as detailed in the original resume',
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: [],
      languages: [],
      tools: []
    },
    core_technical_skills: [],
    certifications: [],
    projects: [],
    achievements: [],
    additionalSections: []
  };
}