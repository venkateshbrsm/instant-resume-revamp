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

    // Validate input - fail if insufficient content
    if (!extractedText || extractedText.trim().length < 50) {
      throw new Error("Insufficient text content for enhancement. PDF extraction may have failed.");
    }

    // Check for error content and fail immediately
    const isErrorContent = extractedText.includes('PDF Processing Error') || 
                          extractedText.includes('Limited Text Extraction') ||
                          extractedText.includes('service temporary unavailability') ||
                          extractedText.includes('Unable to process the PDF');

    if (isErrorContent) {
      throw new Error('PDF extraction failed. Cannot process error content.');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Enhancing resume with AI...');
    
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
        error: error.message || "Failed to enhance resume"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function enhanceResumeWithAI(originalText: string, apiKey: string): Promise<any> {
  console.log('🔍 Starting AI enhancement...');
  console.log('📄 Original text length:', originalText.length);
  console.log('📄 Text preview (first 200 chars):', originalText.substring(0, 200));

  const prompt = `You are an expert resume parser and enhancer. Extract ONLY actual information from the resume text provided below. 

CRITICAL: DO NOT USE PLACEHOLDER TEXT. Extract real data from the resume or leave fields empty if not found.

Resume text:
${originalText}

Parse this resume and return ONLY a JSON object with this exact structure:
{
  "name": "extract the actual person's name",
  "title": "extract the actual professional title or role",
  "email": "extract the actual email address",
  "phone": "extract the actual phone number", 
  "location": "extract the actual location/city",
  "linkedin": "extract the actual LinkedIn URL if present",
  "summary": "create a professional summary based on the actual profile summary and experience in the resume",
  "experience": [
    {
      "title": "extract the actual job title from work experience section",
      "company": "extract the actual company name from work experience section",
      "duration": "extract the actual employment dates/duration",
      "description": "extract or enhance the actual job description",
      "achievements": ["extract actual bullet points, achievements, or responsibilities from this job", "convert each bullet point to a clear achievement", "include quantifiable results when mentioned"]
    }
  ],
  "education": [
    {
      "degree": "extract the actual degree name",
      "institution": "extract the actual institution/university name", 
      "year": "extract the actual graduation year or duration",
      "gpa": "extract actual GPA if mentioned, otherwise empty string"
    }
  ],
  "skills": ["extract actual skills mentioned in the resume"],
  "tools": ["extract actual tools/software mentioned"],
  "certifications": ["extract actual certifications mentioned"],
  "languages": ["extract actual languages mentioned"]
}

EXTRACTION GUIDELINES:
1. For work experience: Look for job titles, company names, employment dates, and bullet points describing responsibilities/achievements
2. For education: Look for degree names, institution names, graduation dates, GPA if mentioned
3. For skills: Extract from dedicated skills section or mentioned throughout the resume
4. For contact info: Extract name, email, phone, location from the header/contact section
5. For summary: Create based on profile summary section and overall experience
6. NEVER use phrases like "Professional Role 1", "Company Name", "Achievement based on extracted content" - these are placeholders
7. If you cannot find specific information, use empty string "" or empty array []

Return ONLY the JSON object, no additional text or formatting.`;

  try {
    console.log('📤 Sending request to OpenAI...');
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
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('📥 OpenAI response received');
    
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    console.log('📄 Raw OpenAI response preview:', content.substring(0, 200));

    // Clean and parse the response
    let cleanedContent = content.trim();
    
    // Remove markdown code blocks if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    console.log('🧹 Cleaned content preview:', cleanedContent.substring(0, 200));

    const parsedResume = JSON.parse(cleanedContent);
    
    console.log('✅ Successfully parsed enhanced resume');
    console.log('👤 Extracted name:', parsedResume.name);
    console.log('💼 Experience entries:', parsedResume.experience?.length || 0);
    console.log('🎓 Education entries:', parsedResume.education?.length || 0);
    console.log('🛠️ Skills count:', parsedResume.skills?.length || 0);

    return parsedResume;

  } catch (error) {
    console.error('❌ Enhancement failed:', error);
    throw error;
  }
}