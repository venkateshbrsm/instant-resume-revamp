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

  // Set a global timeout for the entire function (increased for section processing)
  const globalTimeoutMs = 80000; // 80 seconds to allow for parallel section processing
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
  console.log('🔍 Starting section-based AI enhancement...');
  console.log('📄 Original text length:', originalText.length);
  console.log('📄 Text preview (first 200 chars):', originalText.substring(0, 200));

  const selectedModel = 'gpt-4.1-2025-04-14';
  const sectionTimeoutMs = 35000; // 35 seconds per section
  
  console.log(`📊 Processing complete resume: ${originalText.length} chars - Using model: ${selectedModel} with ${sectionTimeoutMs/1000}s per section`);

  try {
    // Split resume into logical sections
    const sections = await splitResumeIntoSections(originalText);
    console.log('📋 Sections identified:', sections.map(s => `${s.type} (${s.content.length} chars)`));

    // Process sections in parallel for efficiency
    const sectionPromises = sections.map(section => 
      processSectionWithAI(section, apiKey, selectedModel, sectionTimeoutMs, globalSignal)
    );

    const enhancedSections = await Promise.all(sectionPromises);
    console.log('✅ All sections processed successfully');

    // Merge sections back into expected JSON structure
    const mergedResult = mergeSectionsToResumeFormat(enhancedSections);
    console.log('🔧 Sections merged into final resume format');
    
    return mergedResult;

  } catch (error) {
    console.error('❌ Section-based enhancement failed:', error);
    throw error;
  }
}

async function splitResumeIntoSections(text: string): Promise<Array<{type: string, content: string}>> {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const sections = [];
  
  // Define section markers with more comprehensive patterns
  const sectionMarkers = {
    contact: ['email', '@', 'phone', 'mobile', 'linkedin', 'address', 'location', 'portfolio', 'website'],
    summary: ['summary', 'profile', 'objective', 'about', 'overview', 'professional summary', 'career objective'],
    experience: ['experience', 'employment', 'work history', 'professional experience', 'career history', 'work', 'positions', 'employment history'],
    education: ['education', 'academic', 'qualification', 'degree', 'university', 'college', 'school', 'academic background'],
    skills: ['skills', 'technical skills', 'competencies', 'expertise', 'proficiencies', 'technologies', 'tools', 'programming'],
    certifications: ['certification', 'certificates', 'licensed', 'accreditation', 'credentials'],
    projects: ['projects', 'portfolio', 'notable work', 'key projects', 'achievements'],
    languages: ['languages', 'linguistic', 'multilingual', 'fluent']
  };

  let currentType = 'contact';
  let currentContent: string[] = [];
  
  // Process each line and detect section boundaries
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();
    
    // Detect if this line is a section header
    const isShortLine = line.length < 80;
    const hasColonOrAllCaps = line.includes(':') || line === line.toUpperCase();
    const isHeader = isShortLine && (hasColonOrAllCaps || lowerLine.match(/^[a-z\s&-]+$/));
    
    let newType = currentType;
    
    if (isHeader) {
      // Check which section this header belongs to
      for (const [sectionType, markers] of Object.entries(sectionMarkers)) {
        if (markers.some(marker => lowerLine.includes(marker))) {
          newType = sectionType;
          break;
        }
      }
    }
    
  // Handle early contact detection (first 25 lines)
  if (i < 25 && sectionMarkers.contact.some(marker => lowerLine.includes(marker))) {
    newType = 'contact';
  }
  
  // Force experience detection for common patterns
  if (lowerLine.includes('work') || lowerLine.includes('employment') || lowerLine.includes('experience') || 
      lowerLine.includes('career') || lowerLine.includes('professional') ||
      /\d{4}.*-.*\d{4}/.test(lowerLine) || // Date ranges like "2020 - 2024"
      /\d{2}\/\d{4}.*-.*\d{2}\/\d{4}/.test(lowerLine)) { // Date ranges like "01/2020 - 12/2024"
    newType = 'experience';
  }
    
    // If section changed, save current and start new
    if (newType !== currentType && currentContent.length > 0) {
      sections.push({ type: currentType, content: currentContent.join('\n') });
      currentContent = [];
    }
    
    currentType = newType;
    currentContent.push(line);
  }
  
  // Add final section
  if (currentContent.length > 0) {
    sections.push({ type: currentType, content: currentContent.join('\n') });
  }
  
  // Ensure we have essential sections by consolidating if needed
  const consolidatedSections = consolidateSections(sections, lines);
  
  console.log('📋 Final sections:', consolidatedSections.map(s => `${s.type} (${s.content.length} chars)`));
  return consolidatedSections;
}

function consolidateSections(sections: Array<{type: string, content: string}>, allLines: string[]): Array<{type: string, content: string}> {
  const result = [];
  
  // Ensure contact section exists (use first 15 lines if not found)
  let contactSection = sections.find(s => s.type === 'contact');
  if (!contactSection) {
    contactSection = { type: 'contact', content: allLines.slice(0, 15).join('\n') };
  }
  result.push(contactSection);
  
  // Consolidate summary/profile sections
  const summaryContent = sections
    .filter(s => ['summary', 'profile', 'objective', 'about'].includes(s.type))
    .map(s => s.content)
    .join('\n\n');
  if (summaryContent.trim()) {
    result.push({ type: 'summary', content: summaryContent });
  }
  
  // Keep experience section as is (most important)
  const experienceSection = sections.find(s => s.type === 'experience');
  if (experienceSection) {
    result.push(experienceSection);
  }
  
  // Consolidate education
  const educationContent = sections
    .filter(s => s.type === 'education')
    .map(s => s.content)
    .join('\n\n');
  if (educationContent.trim()) {
    result.push({ type: 'education', content: educationContent });
  }
  
  // Consolidate skills, tools, and technologies
  const skillsContent = sections
    .filter(s => ['skills', 'technical skills', 'competencies', 'tools'].includes(s.type))
    .map(s => s.content)
    .join('\n\n');
  if (skillsContent.trim()) {
    result.push({ type: 'skills', content: skillsContent });
  }
  
  // Consolidate certifications and projects
  const otherContent = sections
    .filter(s => ['certifications', 'projects', 'languages', 'achievements'].includes(s.type))
    .map(s => s.content)
    .join('\n\n');
  if (otherContent.trim()) {
    result.push({ type: 'additional', content: otherContent });
  }
  
  return result;
}

async function processSectionWithAI(section: {type: string, content: string}, apiKey: string, model: string, timeoutMs: number, globalSignal?: AbortSignal): Promise<any> {
  console.log(`🔄 Processing ${section.type} section (${section.content.length} chars)...`);
  console.log(`📄 Section content preview: ${section.content.substring(0, 200)}...`);
  
  const prompts = {
    contact: `Extract contact information from this resume section. Return ONLY a JSON object:

Content:
${section.content}

Return:
{
  "name": "full name",
  "email": "email address", 
  "phone": "phone number",
  "location": "city/location",
  "linkedin": "LinkedIn URL if present",
  "title": "professional title/role if mentioned"
}`,

    summary: `Create a professional summary from this resume section. Return ONLY a JSON object:

Content: 
${section.content}

Return:
{
  "summary": "2-3 sentence professional summary highlighting key qualifications and experience"
}`,

    experience: `Extract ALL work experience from this section. Parse every job/position mentioned. Return ONLY a JSON array:

Content:
${section.content}

Instructions:
- Extract EVERY job, position, or work experience mentioned
- Look for company names, job titles, dates, and responsibilities
- Each job should have unique achievements and descriptions
- Do NOT skip any work experience entries

Return:
[
  {
    "title": "actual job title from resume",
    "company": "actual company name from resume",
    "duration": "actual employment dates from resume", 
    "description": "brief role description based on content",
    "achievements": ["unique achievement 1", "unique achievement 2", "unique achievement 3"]
  }
]

CRITICAL: If you find ANY work experience, return it as an array. If no work experience is found, return an empty array [].`,

    education: `Extract education information. Return ONLY a JSON array:

Content:
${section.content}

Return:
[
  {
    "degree": "degree name",
    "institution": "school/university name",
    "year": "graduation year or duration",
    "gpa": "GPA if mentioned"
  }
]`,

    skills: `Extract skills, tools, and technologies. Return ONLY a JSON object:

Content:
${section.content}

Return:
{
  "skills": ["skill1", "skill2", "skill3"],
  "tools": ["tool1", "tool2", "tool3"]
}`,

    additional: `Extract certifications, projects, languages, and other information. Return ONLY a JSON object:

Content:
${section.content}

Return:
{
  "certifications": ["certification1", "certification2"],
  "languages": ["language1", "language2"],
  "projects": ["project1", "project2"]
}`
  };
  
  const prompt = prompts[section.type as keyof typeof prompts] || prompts.additional;
  
  try {
    const result = await makeOpenAIRequestWithTimeout(prompt, apiKey, model, timeoutMs, globalSignal);
    console.log(`✅ ${section.type} section processed successfully`);
    console.log(`📊 ${section.type} result preview:`, JSON.stringify(result).substring(0, 200) + '...');
    return { type: section.type, data: result };
  } catch (error) {
    console.error(`❌ Failed to process ${section.type} section:`, error);
    // Return appropriate empty structure for failed sections
    const fallbackData = section.type === 'experience' ? [] : 
                        section.type === 'education' ? [] :
                        section.type === 'skills' ? { skills: [], tools: [] } :
                        section.type === 'summary' ? { summary: '' } :
                        section.type === 'contact' ? { name: '', email: '', phone: '', location: '', linkedin: '', title: '' } :
                        { certifications: [], languages: [], projects: [] };
    
    return { type: section.type, data: fallbackData };
  }
}

function mergeSectionsToResumeFormat(enhancedSections: Array<{type: string, data: any}>): any {
  console.log('🔧 Merging sections into final resume format...');
  console.log('📋 Processing sections:', enhancedSections.map(s => `${s.type}: ${JSON.stringify(s.data).substring(0, 100)}...`));
  
  const result = {
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
  
  for (const section of enhancedSections) {
    try {
      console.log(`🔧 Processing section: ${section.type}`);
      console.log(`📊 Section data type: ${Array.isArray(section.data) ? 'array' : typeof section.data}`);
      
      switch (section.type) {
        case 'contact':
          if (section.data && typeof section.data === 'object') {
            result.name = section.data.name || result.name;
            result.title = section.data.title || result.title;
            result.email = section.data.email || result.email;
            result.phone = section.data.phone || result.phone;
            result.location = section.data.location || result.location;
            result.linkedin = section.data.linkedin || result.linkedin;
            console.log(`✅ Contact merged: ${result.name} - ${result.email}`);
          }
          break;
          
        case 'summary':
          if (section.data?.summary) {
            result.summary = section.data.summary;
            console.log(`✅ Summary merged: ${result.summary.substring(0, 50)}...`);
          }
          break;
          
        case 'experience':
          console.log(`🔍 Experience section data:`, section.data);
          if (Array.isArray(section.data)) {
            const validExperience = section.data.filter(exp => exp && (exp.title || exp.company));
            result.experience = validExperience;
            console.log(`✅ Experience merged: ${validExperience.length} entries`);
          } else if (section.data && typeof section.data === 'object') {
            // Handle case where AI returns object instead of array
            console.log('⚠️ Experience data is object, attempting to convert...');
            console.log('Experience object keys:', Object.keys(section.data));
            // If it's a single experience object, wrap it in array
            if (section.data.title || section.data.company) {
              result.experience = [section.data];
              console.log(`✅ Single experience converted to array`);
            }
          }
          break;
          
        case 'education':
          if (Array.isArray(section.data)) {
            const validEducation = section.data.filter(edu => edu && (edu.degree || edu.institution));
            result.education = validEducation;
            console.log(`✅ Education merged: ${validEducation.length} entries`);
          }
          break;
          
        case 'skills':
          if (section.data && typeof section.data === 'object') {
            result.skills = Array.isArray(section.data.skills) ? section.data.skills : [];
            result.tools = Array.isArray(section.data.tools) ? section.data.tools : [];
            console.log(`✅ Skills merged: ${result.skills.length} skills, ${result.tools.length} tools`);
          }
          break;
          
        case 'additional':
          if (section.data && typeof section.data === 'object') {
            result.certifications = Array.isArray(section.data.certifications) ? section.data.certifications : [];
            result.languages = Array.isArray(section.data.languages) ? section.data.languages : [];
            console.log(`✅ Additional merged: ${result.certifications.length} certs, ${result.languages.length} languages`);
          }
          break;
      }
    } catch (error) {
      console.error(`❌ Error merging ${section.type} section:`, error);
    }
  }
  
  console.log('📊 Final merged results:');
  console.log(`👤 Name: ${result.name}`);
  console.log(`💼 Experience entries: ${result.experience.length}`);
  console.log(`🎓 Education entries: ${result.education.length}`);
  console.log(`🛠️ Skills count: ${result.skills.length}`);
  console.log(`📜 Certifications: ${result.certifications.length}`);
  
  return result;
}

// This function is now replaced by the new section-based approach above

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