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

  const selectedModel = 'gpt-4.1-2025-04-14';
  const sectionTimeoutMs = 15000; // 15 seconds per section
  
  console.log(`📊 Content size: ${originalText.length} chars - Using model: ${selectedModel}`);

  // For content over 7000 characters, use chunking strategy
  if (originalText.length > 7000) {
    console.log('📋 Large content detected - using chunking strategy...');
    return await processWithChunking(originalText, apiKey, selectedModel, sectionTimeoutMs, globalSignal);
  }

  // For smaller content, use the original single-prompt approach
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

Return ONLY the JSON object, no additional text or formatting.`;

  return await makeOpenAIRequestWithTimeout(prompt, apiKey, selectedModel, 20000, globalSignal);
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

async function processWithChunking(originalText: string, apiKey: string, model: string, timeoutMs: number, globalSignal?: AbortSignal): Promise<any> {
  console.log('🔄 Processing with chunking strategy...');
  
  // Split resume into sections
  const sections = splitResumeIntoSections(originalText);
  console.log(`📋 Split into ${sections.length} sections:`, sections.map(s => s.type));
  
  // Process sections in parallel
  const sectionPromises = sections.map(async (section) => {
    try {
      console.log(`🔧 Processing section: ${section.type} (${section.content.length} chars)`);
      const result = await processSectionWithAI(section, apiKey, model, timeoutMs, globalSignal);
      console.log(`✅ Completed section: ${section.type}`);
      return { type: section.type, result, success: true };
    } catch (error) {
      console.error(`❌ Failed section: ${section.type}`, error);
      return { type: section.type, error: error.message, success: false };
    }
  });
  
  // Wait for all sections to complete (or fail)
  const results = await Promise.allSettled(sectionPromises);
  console.log(`📊 Processing complete. ${results.filter(r => r.status === 'fulfilled').length}/${results.length} sections succeeded`);
  
  // Merge successful results
  return mergeChunkedResults(results, originalText);
}

async function processSectionWithAI(section: { type: string, content: string }, apiKey: string, model: string, timeoutMs: number, globalSignal?: AbortSignal): Promise<any> {
  let prompt = '';
  
  switch (section.type) {
    case 'contact':
      prompt = `Extract contact information from this resume section. Return ONLY a JSON object:

Section content:
${section.content}

Return format:
{
  "name": "actual person's name",
  "title": "job title or professional role",
  "email": "email address",
  "phone": "phone number",
  "location": "city/location",
  "linkedin": "LinkedIn URL if present"
}`;
      break;
      
    case 'experience':
      prompt = `Extract work experience from this resume section. Return ONLY a JSON array of experience objects:

Section content:
${section.content}

Return format:
[
  {
    "title": "actual job title",
    "company": "actual company name",
    "duration": "employment dates",
    "description": "brief role description",
    "achievements": ["specific achievement 1", "specific achievement 2"]
  }
]`;
      break;
      
    case 'education':
      prompt = `Extract education information from this resume section. Return ONLY a JSON array:

Section content:
${section.content}

Return format:
[
  {
    "degree": "actual degree name",
    "institution": "actual school/university name",
    "year": "graduation year",
    "gpa": "GPA if mentioned"
  }
]`;
      break;
      
    case 'skills':
    case 'skills_education':
      prompt = `Extract skills, education, tools, certifications, and languages from this resume section. Return ONLY a JSON object:

Section content:
${section.content}

Return format:
{
  "skills": ["skill 1", "skill 2"],
  "tools": ["tool 1", "tool 2"],
  "certifications": ["certification 1", "certification 2"],
  "languages": ["language 1", "language 2"],
  "education": [
    {
      "degree": "degree name if found",
      "institution": "institution name if found",
      "year": "year if found",
      "gpa": "gpa if found"
    }
  ]
}`;
      break;
      
    default:
      prompt = `Extract any relevant information from this resume section:

Section content:
${section.content}

Return a JSON object with any relevant fields you can identify.`;
  }
  
  return await makeOpenAIRequestWithTimeout(prompt, apiKey, model, timeoutMs, globalSignal);
}

function mergeChunkedResults(results: PromiseSettledResult<{ type: string, result?: any, success: boolean }>[], originalText: string): any {
  console.log('🔗 Merging chunked results...');
  
  const mergedResume = {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    summary: "",
    experience: [] as any[],
    education: [] as any[],
    skills: [] as string[],
    tools: [] as string[],
    certifications: [] as string[],
    languages: [] as string[]
  };
  
  // Process successful results
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.success) {
      const { type, result: data } = result.value;
      
      try {
        switch (type) {
          case 'contact':
            if (data?.name) mergedResume.name = data.name;
            if (data?.title) mergedResume.title = data.title;
            if (data?.email) mergedResume.email = data.email;
            if (data?.phone) mergedResume.phone = data.phone;
            if (data?.location) mergedResume.location = data.location;
            if (data?.linkedin) mergedResume.linkedin = data.linkedin;
            break;
            
          case 'experience':
            if (Array.isArray(data)) {
              mergedResume.experience = data;
            }
            break;
            
          case 'education':
            if (Array.isArray(data)) {
              mergedResume.education = data;
            }
            break;
            
          case 'skills':
          case 'skills_education':
            if (data?.skills) mergedResume.skills = [...mergedResume.skills, ...(Array.isArray(data.skills) ? data.skills : [])];
            if (data?.tools) mergedResume.tools = [...mergedResume.tools, ...(Array.isArray(data.tools) ? data.tools : [])];
            if (data?.certifications) mergedResume.certifications = [...mergedResume.certifications, ...(Array.isArray(data.certifications) ? data.certifications : [])];
            if (data?.languages) mergedResume.languages = [...mergedResume.languages, ...(Array.isArray(data.languages) ? data.languages : [])];
            if (data?.education && Array.isArray(data.education)) {
              mergedResume.education = [...mergedResume.education, ...data.education];
            }
            break;
        }
      } catch (error) {
        console.error(`❌ Error merging ${type} section:`, error);
      }
    }
  });
  
  // Generate summary if we have enough information
  if (mergedResume.experience.length > 0 || mergedResume.skills.length > 0) {
    const experienceTitles = mergedResume.experience.map(exp => exp.title).filter(Boolean);
    const topSkills = mergedResume.skills.slice(0, 5);
    
    mergedResume.summary = `Professional ${mergedResume.title || 'with expertise'} with experience in ${experienceTitles.join(', ')}. Skilled in ${topSkills.join(', ')}.`;
  }
  
  // Remove duplicates from arrays
  mergedResume.skills = [...new Set(mergedResume.skills)];
  mergedResume.tools = [...new Set(mergedResume.tools)];
  mergedResume.certifications = [...new Set(mergedResume.certifications)];
  mergedResume.languages = [...new Set(mergedResume.languages)];
  
  console.log('✅ Merging complete');
  console.log(`📊 Final results: ${mergedResume.experience.length} experience, ${mergedResume.skills.length} skills, ${mergedResume.education.length} education`);
  
  return mergedResume;
}

function splitResumeIntoSections(text: string): Array<{type: string, content: string}> {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const sections = [];
  
  // Enhanced section markers
  const contactMarkers = ['email', '@', 'phone', 'mobile', 'linkedin', 'address', 'location'];
  const experienceMarkers = ['experience', 'employment', 'work history', 'professional experience', 'career', 'work', 'positions held', 'job history'];
  const educationMarkers = ['education', 'academic', 'qualification', 'degree', 'university', 'college', 'school', 'certification'];
  const skillsMarkers = ['skills', 'technical skills', 'competencies', 'expertise', 'proficiencies', 'technologies', 'tools', 'software'];
  
  let currentType = 'contact';
  let currentContent: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    const isHeader = line.length < 60 && (line.includes(':') || line.match(/^[a-z\s\-]+$/));
    
    // Check for section transitions with better detection
    let newType = currentType;
    if (experienceMarkers.some(marker => line.includes(marker))) {
      newType = 'experience';
    } else if (educationMarkers.some(marker => line.includes(marker))) {
      newType = 'education';
    } else if (skillsMarkers.some(marker => line.includes(marker))) {
      newType = 'skills';
    } else if (i < 20 && contactMarkers.some(marker => line.includes(marker))) {
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
  
  // Smart consolidation
  const consolidated = [];
  
  // Always include contact section (first 15 lines if not found)
  const contactSection = sections.find(s => s.type === 'contact') || { type: 'contact', content: lines.slice(0, 15).join('\n') };
  consolidated.push(contactSection);
  
  // Include experience section if found
  const experienceSection = sections.find(s => s.type === 'experience');
  if (experienceSection && experienceSection.content.length > 50) {
    consolidated.push(experienceSection);
  }
  
  // Handle education and skills - combine if both are small
  const educationSection = sections.find(s => s.type === 'education');
  const skillsSection = sections.find(s => s.type === 'skills');
  
  if (educationSection && skillsSection) {
    // If both exist, combine them into skills_education
    consolidated.push({ 
      type: 'skills_education', 
      content: `${educationSection.content}\n\n${skillsSection.content}` 
    });
  } else if (educationSection) {
    consolidated.push({ type: 'education', content: educationSection.content });
  } else if (skillsSection) {
    consolidated.push({ type: 'skills', content: skillsSection.content });
  } else {
    // Use remaining content after contact and experience
    const usedLines = contactSection.content.split('\n').length + (experienceSection?.content.split('\n').length || 0);
    if (usedLines < lines.length) {
      const remainingContent = lines.slice(usedLines).join('\n');
      if (remainingContent.trim().length > 20) {
        consolidated.push({ type: 'skills_education', content: remainingContent });
      }
    }
  }
  
  return consolidated.filter(section => section.content.trim().length > 10);
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
        max_tokens: 4000, // GPT-4.1 uses max_tokens, not max_completion_tokens
        temperature: 0.3, // GPT-4.1 supports temperature
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
    
    // Add detailed logging of response structure
    console.log('🔍 Full OpenAI response structure:', JSON.stringify(data, null, 2));
    console.log('🔍 Response has choices:', !!data.choices);
    console.log('🔍 Choices length:', data.choices?.length || 0);
    console.log('🔍 First choice structure:', JSON.stringify(data.choices?.[0], null, 2));
    
    // Handle different response formats
    let content = null;
    
    // Try different ways to extract content
    if (data.choices?.[0]?.message?.content) {
      content = data.choices[0].message.content;
      console.log('✅ Content found in choices[0].message.content');
    } else if (data.choices?.[0]?.text) {
      content = data.choices[0].text;
      console.log('✅ Content found in choices[0].text');
    } else if (data.content) {
      content = data.content;
      console.log('✅ Content found in direct content field');
    } else if (data.message?.content) {
      content = data.message.content;
      console.log('✅ Content found in message.content');
    }
    
    if (!content) {
      console.error('❌ No content found in any expected field');
      console.error('❌ Available fields:', Object.keys(data));
      throw new Error('No content returned from OpenAI - unexpected response format');
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