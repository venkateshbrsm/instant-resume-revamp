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

  const prompt = `You are an expert resume parser and enhancer. Given the following resume text, extract and enhance the information into a structured JSON format. 

IMPORTANT: Only extract real, actual information from the text. Do not make up or invent any information.

Resume text:
${originalText}

Please parse this resume and return a JSON object with the following structure:
{
  "name": "actual extracted name",
  "title": "actual job title or professional title",
  "email": "actual email address",
  "phone": "actual phone number", 
  "location": "actual location/address",
  "linkedin": "actual LinkedIn URL if present",
  "summary": "enhanced professional summary based on actual content",
  "experience": [
    {
      "title": "actual job title",
      "company": "actual company name",
      "duration": "actual employment duration",
      "description": "enhanced description of role",
      "core_responsibilities": ["actual responsibility 1", "actual responsibility 2", "actual responsibility 3"],
      "achievements": ["actual achievement 1", "actual achievement 2", "actual achievement 3"]
    }
  ],
  "education": [
    {
      "degree": "actual degree",
      "institution": "actual institution",
      "year": "actual graduation year",
      "gpa": "actual GPA if mentioned"
    }
  ],
  "skills": ["actual skill 1", "actual skill 2", "actual skill 3"],
  "tools": ["actual tool 1", "actual tool 2"],
  "core_technical_skills": [
    {"name": "actual technical skill", "proficiency": estimated_proficiency_number_0_to_100}
  ],
  "certifications": ["actual certification 1", "actual certification 2"],
  "languages": ["actual language 1", "actual language 2"]
}

Rules:
1. Extract ONLY information that is actually present in the resume
2. Do not invent or create placeholder information
3. If information is missing, use empty strings or empty arrays
4. Enhance descriptions and summaries based on actual content, but don't fabricate facts
5. Estimate proficiency levels for technical skills based on context clues
6. Return only valid JSON, no additional text or markdown formatting`;

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