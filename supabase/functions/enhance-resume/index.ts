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

  // Use more reliable model and shorter timeout
  const selectedModel = 'gpt-4.1-2025-04-14'; // More reliable than GPT-5
  const timeoutMs = 20000; // 20 seconds max
  
  console.log(`📊 Content size: ${originalText.length} chars - Using model: ${selectedModel} with ${timeoutMs/1000}s timeout`);

  // For any content over 8000, use simplified processing
  if (originalText.length > 8000) {
    console.log('📋 Large content detected - using simplified enhancement...');
    return await processWithSinglePrompt(originalText, apiKey, selectedModel, timeoutMs, globalSignal);
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

async function processWithSinglePrompt(originalText: string, apiKey: string, model: string, timeoutMs: number, globalSignal?: AbortSignal): Promise<any> {
  console.log('🔄 Processing with simplified single prompt...');
  
  // Use a more focused prompt that extracts key sections efficiently
  const prompt = `Extract information from this resume and return ONLY a JSON object. Focus on actual data, not placeholders.

Resume content:
${originalText.substring(0, 10000)} // Limit content to prevent timeouts

Return ONLY this JSON structure:
{
  "name": "actual person's name (required)",
  "title": "job title or professional role",
  "email": "email address", 
  "phone": "phone number",
  "location": "city/location",
  "linkedin": "LinkedIn URL if present",
  "summary": "2-3 sentence professional summary based on the resume content",
  "experience": [
    {
      "title": "actual job title",
      "company": "actual company name", 
      "duration": "employment dates",
      "description": "brief role description",
      "achievements": ["specific achievement 1", "specific achievement 2"]
    }
  ],
  "education": [
    {
      "degree": "actual degree name",
      "institution": "actual school/university name",
      "year": "graduation year",
      "gpa": "GPA if mentioned"
    }
  ],
  "skills": ["actual skill 1", "actual skill 2", "actual skill 3"],
  "tools": ["tool/technology used"],
  "certifications": ["certification name if any"],
  "languages": ["language if mentioned"]
}

CRITICAL: Extract actual information only. If a section is not found, use empty array [] or empty string "". No placeholder text.`;

  try {
    const result = await makeOpenAIRequestWithTimeout(prompt, apiKey, model, Math.min(timeoutMs, 30000), globalSignal);
    
    // Validate the result has minimum required data
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response format from AI');
    }
    
    // Ensure required fields exist
    const validatedResult = {
      name: result.name || "",
      title: result.title || "",
      email: result.email || "",
      phone: result.phone || "",
      location: result.location || "",
      linkedin: result.linkedin || "",
      summary: result.summary || "",
      experience: Array.isArray(result.experience) ? result.experience : [],
      education: Array.isArray(result.education) ? result.education : [],
      skills: Array.isArray(result.skills) ? result.skills : [],
      tools: Array.isArray(result.tools) ? result.tools : [],
      certifications: Array.isArray(result.certifications) ? result.certifications : [],
      languages: Array.isArray(result.languages) ? result.languages : []
    };
    
    console.log('✅ Single prompt processing complete');
    console.log(`📊 Results: ${validatedResult.experience.length} experience, ${validatedResult.skills.length} skills, ${validatedResult.education.length} education`);
    
    return validatedResult;
  } catch (error) {
    console.error('❌ Single prompt processing failed:', error);
    throw error;
  }
}

function splitResumeIntoSections(text: string): Array<{type: string, content: string}> {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const sections = [];
  
  // Define section markers
  const contactMarkers = ['email', '@', 'phone', 'mobile', 'linkedin', 'address'];
  const experienceMarkers = ['experience', 'employment', 'work history', 'professional experience', 'career', 'work', 'positions held'];
  const educationMarkers = ['education', 'academic', 'qualification', 'degree', 'university', 'college', 'school'];
  const skillsMarkers = ['skills', 'technical skills', 'competencies', 'expertise', 'proficiencies', 'technologies'];
  
  let currentType = 'contact';
  let currentContent: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    const isHeader = line.length < 50 && (line.includes(':') || line.match(/^[a-z\s]+$/));
    
    // Check for section transitions
    let newType = currentType;
    if (isHeader && experienceMarkers.some(marker => line.includes(marker))) {
      newType = 'experience';
    } else if (isHeader && educationMarkers.some(marker => line.includes(marker))) {
      newType = 'education';
    } else if (isHeader && skillsMarkers.some(marker => line.includes(marker))) {
      newType = 'skills';
    } else if (i < 15 && contactMarkers.some(marker => line.includes(marker))) {
      newType = 'contact';
    }
    
    // If section changed, save current and start new
    if (newType !== currentType && currentContent.length > 0) {
      sections.push({ type: currentType, content: currentContent.join('\n') });
      currentContent = [];
      currentType = newType;
    }
    
    currentContent.push(lines[i]);
  }
  
  // Add final section
  if (currentContent.length > 0) {
    sections.push({ type: currentType, content: currentContent.join('\n') });
  }
  
  // Merge small sections and ensure we have main sections
  const consolidated = [];
  const contactSection = sections.find(s => s.type === 'contact') || { type: 'contact', content: lines.slice(0, 10).join('\n') };
  consolidated.push(contactSection);
  
  const experienceSection = sections.find(s => s.type === 'experience');
  if (experienceSection) {
    consolidated.push(experienceSection);
  }
  
  // Combine education and skills if separate, or create from remaining content
  const educationSection = sections.find(s => s.type === 'education');
  const skillsSection = sections.find(s => s.type === 'skills');
  
  if (educationSection || skillsSection) {
    const combinedContent = [
      ...(educationSection ? [educationSection.content] : []),
      ...(skillsSection ? [skillsSection.content] : [])
    ].join('\n\n');
    
    if (combinedContent.trim()) {
      consolidated.push({ type: 'skills_education', content: combinedContent });
    }
  } else {
    // Use remaining content
    const usedLines = contactSection.content.split('\n').length + (experienceSection?.content.split('\n').length || 0);
    const remainingContent = lines.slice(usedLines).join('\n');
    if (remainingContent.trim()) {
      consolidated.push({ type: 'skills_education', content: remainingContent });
    }
  }
  
  return consolidated;
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
    console.log(`📤 Sending streaming request to OpenAI (${model}, ${timeoutMs/1000}s timeout)...`);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000, // GPT-4.1 uses max_tokens, not max_completion_tokens
        temperature: 0.3, // GPT-4.1 supports temperature
        stream: true, // Enable streaming
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      clearTimeout(timeoutId);
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    console.log('🌊 Streaming response started...');
    
    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      clearTimeout(timeoutId);
      throw new Error('No reader available for streaming response');
    }

    let fullContent = '';
    const decoder = new TextDecoder();

    try {
      while (true) {
        // Check if aborted
        if (globalSignal?.aborted || controller.signal.aborted) {
          reader.cancel();
          throw new Error('Request aborted');
        }

        const { done, value } = await reader.read();
        
        if (done) {
          console.log('🏁 Streaming completed');
          break;
        }

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.trim() === 'data: [DONE]') continue;
          
          if (line.startsWith('data: ')) {
            try {
              const jsonData = line.slice(6); // Remove 'data: '
              const parsed = JSON.parse(jsonData);
              
              // Extract content from the streaming chunk
              const deltaContent = parsed.choices?.[0]?.delta?.content;
              if (deltaContent) {
                fullContent += deltaContent;
                // Log progress periodically
                if (fullContent.length % 500 === 0) {
                  console.log(`📊 Streaming progress: ${fullContent.length} characters received`);
                }
              }
            } catch (parseError) {
              // Skip invalid JSON chunks (common in streaming)
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
      clearTimeout(timeoutId);
    }

    console.log('📥 Full streaming response received');
    console.log(`📊 Total content length: ${fullContent.length} characters`);
    console.log('📄 Raw streaming content preview:', fullContent.substring(0, 200));

    if (!fullContent) {
      throw new Error('No content received from streaming response');
    }

    // Clean and parse the response
    let cleanedContent = fullContent.trim();
    
    // Remove markdown code blocks if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    console.log('🧹 Cleaned streaming content preview:', cleanedContent.substring(0, 200));

    const parsedResume = JSON.parse(cleanedContent);
    
    console.log('✅ Successfully parsed enhanced resume from streaming');
    console.log('👤 Extracted name:', parsedResume.name || 'Not found');
    console.log('💼 Experience entries:', parsedResume.experience?.length || 0);
    console.log('🎓 Education entries:', parsedResume.education?.length || 0);
    console.log('🛠️ Skills count:', parsedResume.skills?.length || 0);

    return parsedResume;

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error('❌ Streaming request timed out after', timeoutMs/1000, 'seconds');
      throw new Error(`Request timed out. Your resume may be too large. Please try with a shorter resume or contact support.`);
    }
    
    console.error('❌ Streaming enhancement failed:', error);
    throw error;
  }
}