import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Enhancement function started');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Set a global timeout for the entire function
  const globalTimeoutMs = 360000; // 6 minutes (accommodate 5min OpenAI timeout + buffer)
  const globalController = new AbortController();
  const globalTimeout = setTimeout(() => {
    console.log('⏰ Global function timeout reached');
    globalController.abort();
  }, globalTimeoutMs);

  try {
    const { extractedText, templateId, themeId } = await req.json();
    
    console.log('🚀 Enhancement request received:', { 
      templateId, 
      themeId, 
      textLength: extractedText?.length || 0,
      textPreview: extractedText?.substring(0, 100) + '...'
    });

    // Validate input - fail if insufficient content
    if (!extractedText || extractedText.trim().length < 50) {
      clearTimeout(globalTimeout);
      throw new Error("Insufficient text content for enhancement. PDF extraction may have failed.");
    }

    // Check for error content and fail immediately
    const isErrorContent = extractedText.includes('PDF Processing Error') || 
                          extractedText.includes('Limited Text Extraction') ||
                          extractedText.includes('service temporary unavailability') ||
                          extractedText.includes('Unable to process the PDF');

    if (isErrorContent) {
      clearTimeout(globalTimeout);
      throw new Error('PDF extraction failed. Cannot process error content.');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      clearTimeout(globalTimeout);
      throw new Error('OpenAI API key not configured');
    }

    console.log('Enhancing resume with AI...');
    
    // Pass the abort signal to the enhancement function
    const enhancedResume = await enhanceResumeWithAI(extractedText, openAIApiKey, globalController.signal);
    
    clearTimeout(globalTimeout);
    console.log('AI enhancement completed successfully');
    
    return new Response(JSON.stringify({ 
      success: true, 
      enhancedResume 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    clearTimeout(globalTimeout);
    console.error('❌ Enhancement failed:', error);
    
    // Handle timeout errors specifically
    if (error.name === 'AbortError') {
      console.error('⏰ Function timed out after', globalTimeoutMs/1000, 'seconds');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Processing timeout. Your resume is quite large - try shortening it or contact support."
        }),
        {
          status: 408, // Request Timeout
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
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

async function enhanceResumeWithAI(originalText: string, apiKey: string, globalSignal?: AbortSignal): Promise<any> {
  console.log('🔍 Starting AI enhancement...');
  console.log('📄 Original text length:', originalText.length);
  console.log('📄 Text preview (first 200 chars):', originalText.substring(0, 200));

  // Use more reliable approach - always use single prompt for consistency
  const selectedModel = 'gpt-4o-mini'; // Fast and reliable model
  const timeoutMs = 300000; // 5 minutes timeout
  
  console.log(`📊 Processing with model: ${selectedModel} (${timeoutMs/1000}s timeout)`);

  // Simplified prompt that works reliably
  const prompt = `Extract and organize the following resume information into JSON format. Use ONLY actual information from the text - no placeholders.

Resume text:
${originalText}

Return ONLY a JSON object with this structure:
{
  "name": "person's actual name",
  "title": "professional title or role", 
  "email": "email address",
  "phone": "phone number",
  "location": "location/city",
  "linkedin": "LinkedIn URL if present",
  "summary": "professional summary (2-3 sentences based on resume content)",
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "duration": "employment dates", 
      "description": "role description",
      "achievements": ["achievement 1", "achievement 2"]
    }
  ],
  "education": [
    {
      "degree": "degree name",
      "institution": "institution name",
      "year": "graduation year",
      "gpa": "GPA if mentioned"
    }
  ],
  "skills": ["skill1", "skill2"],
  "tools": ["tool1", "tool2"],
  "certifications": ["cert1"],
  "languages": ["lang1"]
}

Important: Extract only actual information. Use empty arrays [] or empty strings "" if information is not found.`;

  try {
    const result = await makeOpenAIRequestWithTimeout(prompt, apiKey, selectedModel, timeoutMs, globalSignal);
    
    // Validate and sanitize result
    if (!result || typeof result !== 'object') {
      console.log('⚠️ Invalid AI response, creating basic structure from text');
      return createBasicResumeFromText(originalText);
    }

    // Ensure all required fields exist with proper defaults
    const validatedResult = {
      name: (result.name || "").toString().trim(),
      title: (result.title || "").toString().trim(),
      email: (result.email || "").toString().trim(),
      phone: (result.phone || "").toString().trim(),
      location: (result.location || "").toString().trim(),
      linkedin: (result.linkedin || "").toString().trim(),
      summary: (result.summary || "").toString().trim(),
      experience: Array.isArray(result.experience) ? result.experience.slice(0, 15) : [], // Limit to 15 jobs
      education: Array.isArray(result.education) ? result.education.slice(0, 10) : [],
      skills: Array.isArray(result.skills) ? result.skills.slice(0, 30) : [],
      tools: Array.isArray(result.tools) ? result.tools.slice(0, 20) : [],
      certifications: Array.isArray(result.certifications) ? result.certifications.slice(0, 10) : [],
      languages: Array.isArray(result.languages) ? result.languages.slice(0, 10) : []
    };
    
    console.log('✅ AI enhancement completed successfully');
    console.log(`📊 Results: ${validatedResult.experience.length} jobs, ${validatedResult.skills.length} skills, ${validatedResult.education.length} education`);
    
    return validatedResult;

  } catch (error) {
    console.error('❌ AI enhancement failed, falling back to basic parsing:', error);
    return createBasicResumeFromText(originalText);
  }
}

function createBasicResumeFromText(text: string): any {
  console.log('📝 Creating basic resume structure from text');
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Extract basic info
  const firstLine = lines[0] || "";
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/[\+]?[0-9\s\-\(\)]{10,}/);
  
  return {
    name: firstLine.length < 50 ? firstLine : "",
    title: "",
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? phoneMatch[0].replace(/\s+/g, ' ').trim() : "",
    location: "",
    linkedin: "",
    summary: "Professional with experience in various roles and responsibilities.",
    experience: [],
    education: [],
    skills: [],
    tools: [],
    certifications: [],
    languages: []
  };
}

async function makeOpenAIRequestWithTimeout(prompt: string, apiKey: string, model: string, timeoutMs: number, globalSignal?: AbortSignal): Promise<any> {
  const controller = new AbortController();
  
  const timeoutId = setTimeout(() => {
    console.log('⏰ OpenAI request timeout reached');
    controller.abort();
  }, timeoutMs);
  
  // Check for global abort
  if (globalSignal?.aborted) {
    clearTimeout(timeoutId);
    throw new Error('Request cancelled');
  }

  try {
    console.log(`📤 Sending request to OpenAI (${model})...`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.3,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('📥 OpenAI response received');
    
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    console.log('📄 Response preview:', content.substring(0, 150));

    // Clean and parse the JSON response
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsedResult = JSON.parse(cleanedContent);
    console.log('✅ Successfully parsed OpenAI response');
    
    return parsedResult;

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error('⏰ OpenAI request timed out');
      throw new Error('Request timed out');
    }
    
    console.error('❌ OpenAI request failed:', error);
    throw error;
  }
}