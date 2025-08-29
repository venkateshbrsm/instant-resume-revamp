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
  const globalTimeoutMs = 55000; // 55 seconds (less than edge function limit)
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

  // Determine model and timeout based on content size
  const isLargeContent = originalText.length > 8000;
  const selectedModel = isLargeContent ? 'gpt-5-mini-2025-08-07' : 'gpt-5-2025-08-07';
  const timeoutMs = isLargeContent ? 45000 : 30000; // Reduced timeouts for testing
  
  console.log(`📊 Content size: ${originalText.length} chars - Using model: ${selectedModel} with ${timeoutMs/1000}s timeout`);

  // If content is very large (>12000 chars), split into sections
  if (originalText.length > 12000) {
    console.log('📋 Large content detected - processing in chunks...');
    return await processLargeResumeInChunks(originalText, apiKey, timeoutMs, globalSignal);
  }

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
      "description": "extract or enhance the actual job description specific to this role",
      "achievements": ["extract UNIQUE actual bullet points specific to THIS job only", "each achievement must be distinct and role-specific", "avoid repeating similar content across different positions"]
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

CRITICAL EXPERIENCE EXTRACTION RULES:
1. Each experience entry MUST have UNIQUE achievements - never repeat similar bullet points across different jobs
2. Focus on role-specific responsibilities and outcomes for each position
3. If the original resume has generic content, differentiate it based on job title, company, and timeframe
4. Look for subtle differences in responsibilities, tools used, industry focus, or scope of work
5. Extract actual metrics, numbers, and specific outcomes when available
6. If multiple similar roles exist, emphasize different aspects of each (e.g., strategy vs execution, team leadership vs individual contributor)
7. For work experience: Look for job titles, company names, employment dates, and unique bullet points per role
8. For education: Look for degree names, institution names, graduation dates, GPA if mentioned
9. For skills: Extract from dedicated skills section or mentioned throughout the resume
10. For contact info: Extract name, email, phone, location from the header/contact section
11. For summary: Create based on profile summary section and overall experience
12. NEVER use phrases like "Professional Role 1", "Company Name", "Achievement based on extracted content" - these are placeholders
13. If you cannot find specific information, use empty string "" or empty array []

Return ONLY the JSON object, no additional text or formatting.`;

  return await makeOpenAIRequestWithTimeout(prompt, apiKey, selectedModel, timeoutMs, globalSignal);
}

async function processLargeResumeInChunks(originalText: string, apiKey: string, timeoutMs: number, globalSignal?: AbortSignal): Promise<any> {
  console.log('🔄 Processing large resume in chunks...');
  
  // Split content into logical sections
  const sections = splitResumeIntoSections(originalText);
  console.log(`📊 Split into ${sections.length} sections: ${sections.map(s => s.type).join(', ')}`);
  
  const results: any = {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    summary: "",
    experience: [],
    education: [],
    skills: [],
    tools: [],
    certifications: [],
    languages: []
  };

  // Process contact and basic info first
  const contactSection = sections.find(s => s.type === 'contact') || sections[0];
  if (contactSection) {
    console.log('👤 Processing contact information...');
    const contactPrompt = `Extract contact information from this resume section:

${contactSection.content}

Return ONLY a JSON object with:
{
  "name": "actual person's name",
  "title": "professional title/role",
  "email": "email address",
  "phone": "phone number",
  "location": "location/city",
  "linkedin": "LinkedIn URL if present"
}`;

    try {
      const contactResult = await makeOpenAIRequestWithTimeout(contactPrompt, apiKey, 'gpt-5-mini-2025-08-07', 30000, globalSignal);
      Object.assign(results, contactResult);
    } catch (error) {
      console.error('Error processing contact section:', error);
      if (error.name === 'AbortError' || globalSignal?.aborted) throw error;
    }
  }

  // Process experience section
  const experienceSection = sections.find(s => s.type === 'experience');
  if (experienceSection) {
    console.log('💼 Processing work experience...');
    const expPrompt = `Extract work experience from this section:

${experienceSection.content}

Return ONLY a JSON object with:
{
  "experience": [
    {
      "title": "job title",
      "company": "company name",
      "duration": "employment dates",
      "description": "job description",
      "achievements": ["unique achievements for this role"]
    }
  ]
}`;

    try {
      const expResult = await makeOpenAIRequestWithTimeout(expPrompt, apiKey, 'gpt-5-mini-2025-08-07', 45000, globalSignal);
      results.experience = expResult.experience || [];
    } catch (error) {
      console.error('Error processing experience section:', error);
      if (error.name === 'AbortError' || globalSignal?.aborted) throw error;
    }
  }

  // Process other sections in parallel for speed
  const otherPromises = sections
    .filter(s => s.type !== 'contact' && s.type !== 'experience')
    .map(async (section) => {
      console.log(`🔧 Processing ${section.type} section...`);
      try {
        let sectionPrompt = '';
        
        if (section.type === 'skills_education') {
          sectionPrompt = `Extract skills and education from this resume section:

${section.content}

Return ONLY a JSON object with:
{
  "skills": ["actual skill 1", "actual skill 2", "actual skill 3"],
  "education": [
    {
      "degree": "actual degree name",
      "institution": "actual institution name", 
      "year": "graduation year",
      "gpa": "GPA if mentioned"
    }
  ]
}`;
        } else {
          sectionPrompt = `Extract ${section.type} information from:

${section.content}

Return ONLY a JSON object with the ${section.type} data.`;
        }

        const result = await makeOpenAIRequestWithTimeout(sectionPrompt, apiKey, 'gpt-5-mini-2025-08-07', 20000, globalSignal);
        return { type: section.type, data: result };
      } catch (error) {
        console.error(`Error processing ${section.type} section:`, error);
        return null;
      }
    });

  const otherResults = await Promise.allSettled(otherPromises);
  
  // Merge results
  otherResults.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      const { type, data } = result.value;
      if (data && typeof data === 'object') {
        Object.assign(results, data);
      }
    }
  });

  // Generate summary from all collected data
  if (!results.summary && (results.experience.length > 0 || results.skills.length > 0)) {
    try {
      const summaryPrompt = `Create a professional summary based on this data:
Experience: ${JSON.stringify(results.experience)}
Skills: ${JSON.stringify(results.skills)}

Return ONLY: {"summary": "professional summary text"}`;
      
      const summaryResult = await makeOpenAIRequestWithTimeout(summaryPrompt, apiKey, 'gpt-5-mini-2025-08-07', 15000, globalSignal);
      results.summary = summaryResult.summary || "";
    } catch (error) {
      console.error('Error generating summary:', error);
      if (error.name === 'AbortError' || globalSignal?.aborted) throw error;
    }
  }

  console.log('✅ Chunked processing complete');
  return results;
}

function splitResumeIntoSections(text: string): Array<{type: string, content: string}> {
  const sections = [];
  const lines = text.split('\n');
  
  let currentSection = { type: 'contact', content: '' };
  let lineIndex = 0;
  
  // Take first part as contact info
  const contactLines = lines.slice(0, Math.min(20, Math.floor(lines.length * 0.15)));
  sections.push({ type: 'contact', content: contactLines.join('\n') });
  lineIndex = contactLines.length;
  
  // Find experience section
  const experienceKeywords = ['experience', 'employment', 'work history', 'professional experience', 'career'];
  const expStart = lines.findIndex((line, idx) => 
    idx >= lineIndex && experienceKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    )
  );
  
  if (expStart !== -1) {
    // Take experience section (up to next major section or 60% of remaining content)
    const remainingLines = lines.slice(expStart);
    const expLines = remainingLines.slice(0, Math.min(remainingLines.length, Math.floor(remainingLines.length * 0.6)));
    sections.push({ type: 'experience', content: expLines.join('\n') });
    lineIndex = expStart + expLines.length;
  }
  
  // Rest as skills/education section
  if (lineIndex < lines.length) {
    sections.push({ type: 'skills_education', content: lines.slice(lineIndex).join('\n') });
  }
  
  return sections;
}

async function makeOpenAIRequestWithTimeout(prompt: string, apiKey: string, model: string, timeoutMs: number, globalSignal?: AbortSignal): Promise<any> {
  const controller = new AbortController();
  
  // Use the shorter of our timeout or global timeout
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  // If global signal is already aborted, abort immediately
  if (globalSignal?.aborted) {
    clearTimeout(timeoutId);
    throw new Error('Global timeout reached');
  }

  try {
    console.log(`📤 Sending request to OpenAI (${model}, ${timeoutMs/1000}s timeout)...`);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_completion_tokens: model.includes('mini') ? 2000 : 4000,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
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
    console.log('👤 Extracted name:', parsedResume.name || 'Not found');
    console.log('💼 Experience entries:', parsedResume.experience?.length || 0);
    console.log('🎓 Education entries:', parsedResume.education?.length || 0);
    console.log('🛠️ Skills count:', parsedResume.skills?.length || 0);

    return parsedResume;

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error('❌ Request timed out after', timeoutMs/1000, 'seconds');
      throw new Error(`Request timed out. Your resume may be too large. Please try with a shorter resume or contact support.`);
    }
    
    console.error('❌ Enhancement failed:', error);
    throw error;
  }
}