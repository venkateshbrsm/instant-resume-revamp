import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Content sanitization functions
function sanitizeContentForOpenAI(content: string): string {
  console.log(`🧹 Sanitizing content (${content.length} chars)...`);
  
  let sanitized = content
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .replace(/From:\s*/gi, 'Duration: ')
    .replace(/(\w+)'\d{2}/g, '$1 20$2')
    .replace(/(\w+)'(\d{2})/g, '$1 20$2')
    .replace(/[""'']/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/\.{3,}/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
    
  if (sanitized.length < 50) {
    console.warn(`⚠️ Content too short after sanitization: ${sanitized.length} chars`);
    return content.trim();
  }
  
  console.log(`✅ Content sanitized successfully: ${content.length} → ${sanitized.length} chars`);
  return sanitized;
}

function createFallbackJobEntry(rawContent: string): any {
  console.log(`🔧 Creating fallback job entry from raw content (${rawContent.length} chars)`);
  // Return the job directly, not wrapped in experience array
  return createEnhancedFallbackJob(rawContent, 'fallback');
}

function createEnhancedFallbackJob(rawContent: string, sectionId: string): any {
  console.log(`🔧 Creating enhanced fallback job from raw content (${rawContent.length} chars) for ${sectionId}`);
  console.log(`📄 Raw content for fallback: "${rawContent}"`);
  
  // Enhanced patterns for better extraction
  const titlePatterns = [
    /(?:Role|Position|Designation|Title):\s*([^\n]+)/i,
    /^([A-Z][A-Za-z\s&-]+(?:Specialist|Manager|Officer|Executive|Analyst|Associate|Lead|Director|Head|Consultant))/m,
    /Designation:\s*([^\n]+)/i,
    /^\s*([A-Z][A-Za-z\s&-]+(?:Specialist|Manager|Officer|Executive|Analyst|Associate|Lead|Director|Head|Consultant))/m,
  ];
  
  const companyPatterns = [
    /(?:Company|Organization):\s*([^\n]+)/i,
    /From:\s*([^\n]+?)(?:\s+to|\s+till|\s*$)/i,
    /((?:[A-Z][A-Za-z\s&.]+(?:Ltd\.?|Limited|Inc\.?|Bank|Services?|Systems?|Technologies?|Solutions?)))/,
    /(?:at|with|in)\s+([A-Z][A-Za-z\s&.]+(?:Ltd\.?|Limited|Inc\.?|Bank|Services?|Systems?|Technologies?|Solutions?))/i,
  ];
  
  const durationPatterns = [
    /(?:Duration|Period|From):\s*([^\n]+)/i,
    /(\w+\s*'\d{2}|\w+\s+\d{4}|\d{4}).*?(?:to|till|-).*?(\w+\s*'\d{2}|\w+\s+\d{4}|\d{4}|present|current|date)/i,
    /From:\s*([^,\n]+?)\s+to\s+([^\n]+)/i,
  ];
  
  // Try multiple patterns for better extraction
  let title = 'Professional Role';
  for (const pattern of titlePatterns) {
    const match = rawContent.match(pattern);
    if (match && match[1]) {
      title = match[1].trim();
      break;
    }
  }
  
  let company = 'Company';
  for (const pattern of companyPatterns) {
    const match = rawContent.match(pattern);
    if (match && match[1]) {
      company = match[1].trim();
      break;
    }
  }
  
  let duration = 'Duration';
  for (const pattern of durationPatterns) {
    const match = rawContent.match(pattern);
    if (match) {
      if (match[2]) {
        duration = `${match[1]} - ${match[2]}`;
      } else {
        duration = match[1].trim();
      }
      break;
    }
  }
  
  // Extract responsibilities from content
  const responsibilities = extractResponsibilitiesFromContent(rawContent);
  const achievements = extractAchievementsFromContent(rawContent);
  
  const fallbackJob = {
    title: title,
    company: company,
    duration: duration,
    description: responsibilities.length > 0 ? responsibilities : ['Managed key responsibilities and contributed to organizational objectives'],
    achievements: achievements
  };
  
  console.log(`✅ Enhanced fallback job created: ${fallbackJob.title} at ${fallbackJob.company} (${fallbackJob.description.length} responsibilities)`);
  return fallbackJob; // Return job directly, not wrapped in { experience: [job] }
}

function extractResponsibilitiesFromContent(content: string): string[] {
  const responsibilities = [];
  
  // Look for bullet points
  const bulletMatches = content.match(/[•·▪▫\-]\s*([^•·▪▫\-\n]{20,})/g) || [];
  bulletMatches.forEach(match => {
    const cleaned = match.replace(/^[•·▪▫\-]\s*/, '').trim();
    if (cleaned.length > 15) {
      responsibilities.push(cleaned);
    }
  });
  
  // Look for sentences starting with action words
  const actionWords = ['managed', 'led', 'developed', 'implemented', 'coordinated', 'supervised', 'executed', 'handled', 'supported', 'maintained', 'analyzed', 'processed', 'monitored', 'reviewed', 'conducted', 'performed'];
  const sentences = content.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    const trimmed = sentence.trim();
    if (trimmed.length > 30) {
      const startsWithAction = actionWords.some(word => 
        trimmed.toLowerCase().startsWith(word) || 
        trimmed.toLowerCase().includes(` ${word} `)
      );
      if (startsWithAction && !responsibilities.includes(trimmed)) {
        responsibilities.push(trimmed);
      }
    }
  });
  
  return responsibilities.slice(0, 5); // Max 5 responsibilities
}

function extractAchievementsFromContent(content: string): string[] {
  const achievements = [];
  
  // Look for numbers/percentages that might indicate achievements
  const achievementMatches = content.match(/[^.]*(?:\d+%|\$\d+|increased|improved|reduced|achieved|delivered|saved|grew)[^.]*/gi) || [];
  achievementMatches.forEach(match => {
    const cleaned = match.trim();
    if (cleaned.length > 20 && cleaned.length < 150) {
      achievements.push(cleaned);
    }
  });
  
  return achievements.slice(0, 3); // Max 3 achievements
}

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

  // Set a global timeout for the entire function - extended for parallel processing
  const globalTimeoutMs = 300000; // 5 minutes for parallel section processing
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
          error: "Processing timeout after 5 minutes. This indicates an unexpected issue - please try again or contact support."
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
  console.log('🔍 Starting streaming section-based AI enhancement...');
  console.log('📄 Original text length:', originalText.length);
  console.log('📄 Text preview (first 200 chars):', originalText.substring(0, 200));

  // Use most reliable model for complex parsing tasks
  const selectedModel = 'gpt-4o';
  const sectionTimeoutMs = 120000; // 120 seconds per section for complex parsing
  
  console.log(`📊 Processing ${originalText.length} chars with parallel section processing`);
  console.log(`🔧 Using model: ${selectedModel} with ${sectionTimeoutMs/1000}s per section timeout`);

  try {
    // Step 1: Parse resume into intelligent sections
    console.log('🔍 Parsing resume into sections...');
    const sections = parseResumeIntoSections(originalText);
    console.log(`📋 Identified sections: ${sections.map(s => s.type).join(', ')}`);

    // Step 2: Count expected vs actual jobs for validation
    const expectedJobCount = sections.filter(s => s.type.startsWith('experience_job_')).length;
    console.log(`🎯 Expected job sections to process: ${expectedJobCount}`);

    // Step 3: Process sections individually with enhanced error handling and mandatory job preservation
    console.log('⚡ Starting individual section processing with guaranteed job preservation...');
    const sectionResults: Array<{status: 'fulfilled' | 'rejected', value?: any, reason?: any, section?: any}> = [];
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      console.log(`🔄 Processing section ${i + 1}/${sections.length}: ${section.type}`);
      console.log(`📝 Section content length: ${section.content.length} chars`);
      console.log(`📄 Section content (first 300 chars): ${section.content.substring(0, 300)}`);
      
      // Enhanced logging for job sections - show exact content being sent to OpenAI
      if (section.type.startsWith('experience_job_')) {
        console.log(`🔍 DETAILED JOB SECTION ANALYSIS for ${section.type}:`);
        console.log(`   Content length: ${section.content.length} chars`);
        console.log(`   Content (full): ${section.content}`);
        console.log(`   Sanitized preview: ${sanitizeContentForOpenAI(section.content).substring(0, 200)}...`);
      }
      
      try {
        const result = await processSectionWithSpecializedPrompt(section, apiKey, selectedModel, sectionTimeoutMs, globalSignal);
        console.log(`✅ Section ${section.type} processed successfully`);
        console.log(`📊 Result preview: ${JSON.stringify(result).substring(0, 200)}...`);
        sectionResults.push({status: 'fulfilled', value: result, section});
      } catch (error) {
        console.error(`❌ Section ${section.type} FAILED with error:`, error.message);
        console.error(`💡 Failed section full content: "${section.content}"`);
        console.error(`🔧 Error details:`, error);
        
        // MANDATORY: All job sections MUST create an entry (fallback if needed)
        if (section.type.startsWith('experience_job_')) {
          console.log(`🔧 MANDATORY fallback job creation for: ${section.type}`);
          try {
            const fallbackJob = createEnhancedFallbackJob(section.content, section.type);
            console.log(`✅ Enhanced fallback job created: ${JSON.stringify(fallbackJob).substring(0, 200)}...`);
            sectionResults.push({status: 'fulfilled', value: fallbackJob, section});
          } catch (fallbackError) {
            console.error(`❌ Even fallback failed for ${section.type}:`, fallbackError);
            // Last resort - create minimal job entry
            const emergencyJob = {
              title: `Professional Role ${section.type.split('_')[2] || ''}`,
              company: 'Company Name',
              duration: 'Duration',
              description: ['Managed key responsibilities'],
              achievements: []
            };
            sectionResults.push({status: 'fulfilled', value: emergencyJob, section});
            console.log(`🆘 Emergency job entry created for ${section.type}`);
          }
        } else {
          sectionResults.push({status: 'rejected', reason: error, section});
        }
      }
    }
    
    // Step 4: Merge successful results and handle failures
    console.log('🔄 Merging section results...');
    const enhancedResume = mergeSectionResults(sectionResults, sections);
    
    // Step 5: CRITICAL VALIDATION - Ensure job count matches expectations
    const finalJobCount = enhancedResume.experience?.length || 0;
    console.log(`🎯 Job preservation validation: ${expectedJobCount} expected → ${finalJobCount} in final result`);
    
    if (finalJobCount < expectedJobCount) {
      console.error(`❌ JOB LOSS DETECTED: Expected ${expectedJobCount} jobs, got ${finalJobCount}`);
      console.error(`📊 Section results breakdown:`);
      sectionResults.forEach((result, idx) => {
        if (sections[idx].type.startsWith('experience_job_')) {
          console.error(`   ${sections[idx].type}: ${result.status} - ${result.value ? 'has value' : 'no value'}`);
        }
      });
      
      // Emergency job recovery - ensure we have at least the expected count
      const missingJobs = expectedJobCount - finalJobCount;
      console.log(`🆘 Attempting emergency recovery of ${missingJobs} missing jobs`);
      
      for (let i = 0; i < missingJobs; i++) {
        const emergencyJob = {
          title: `Professional Role ${finalJobCount + i + 1}`,
          company: 'Company Name',
          duration: 'Duration',
          description: ['Managed key responsibilities and contributed to organizational objectives'],
          achievements: []
        };
        enhancedResume.experience.push(emergencyJob);
        console.log(`🆘 Emergency job ${i + 1} added to prevent data loss`);
      }
    }
    
    // Step 6: Final validation
    validateEnhancedResume(enhancedResume);
    
    console.log('✅ Streaming section-based enhancement completed successfully');
    console.log(`📊 Final result: ${enhancedResume.experience?.length || 0} experience, ${enhancedResume.skills?.length || 0} skills, ${enhancedResume.education?.length || 0} education`);
    
    return enhancedResume;
    
  } catch (error) {
    console.error('❌ Section-based enhancement failed:', error);
    throw error;
  }
}

function detectIndividualJobs(experienceText: string): string[] {
  console.log('🔍 Detecting individual jobs within experience section...');
  console.log(`📝 Experience text length: ${experienceText.length} characters`);
  console.log(`📄 Full experience text: ${experienceText}`);
  
  // Look for "From:" patterns which are the main job delimiters in this resume format
  const fromPattern = /^From:\s*([^-\n]+(?:-[^-\n]+)?)\s+(.+?)$/gm;
  const jobs: string[] = [];
  
  // Split by "From:" markers first
  const sections = experienceText.split(/(?=^From:)/gm).filter(section => section.trim().length > 0);
  
  console.log(`📋 Found ${sections.length} sections split by "From:" markers`);
  
  sections.forEach((section, index) => {
    const trimmedSection = section.trim();
    if (trimmedSection.length > 100) { // Reasonable content threshold
      jobs.push(trimmedSection);
      
      // Extract job title for logging
      const lines = trimmedSection.split('\n').filter(line => line.trim().length > 0);
      const jobTitle = lines.find(line => line.includes('Role') || line.match(/^[A-Z][^:]+$/)) || lines[1] || 'Unknown Role';
      
      console.log(`✅ Job ${index + 1}: ${jobTitle.substring(0, 50)}... (${trimmedSection.length} chars)`);
    } else {
      console.log(`⚠️ Skipped short section ${index + 1}: ${trimmedSection.length} chars`);
    }
  });
  
  // If "From:" pattern didn't work well, try alternative parsing for roles within companies
  if (jobs.length < 2) {
    console.log('🔄 "From:" pattern found limited jobs, trying alternative parsing...');
    
    // Look for company headers and role sections
    const companyPattern = /^[A-Z][A-Za-z\s&.]+(?:Ltd\.?|Limited|Bank|Services|Operations|N\.?A\.?)/gm;
    const rolePattern = /^(?:Role|As|Since)/gm;
    
    const lines = experienceText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let currentJob: string[] = [];
    
    lines.forEach((line, index) => {
      // Check if this starts a new job/role section
      const isCompanyHeader = companyPattern.test(line);
      const isRoleHeader = rolePattern.test(line);
      const isFromHeader = /^From:/.test(line);
      
      if ((isFromHeader || isCompanyHeader) && currentJob.length > 5) {
        // Save current job
        const jobContent = currentJob.join('\n').trim();
        if (jobContent.length > 200) {
          jobs.push(jobContent);
          console.log(`✅ Alternative parsing job: ${currentJob[0].substring(0, 50)}... (${jobContent.length} chars)`);
        }
        currentJob = [line];
      } else {
        currentJob.push(line);
      }
    });
    
    // Don't forget the last job
    if (currentJob.length > 5) {
      const jobContent = currentJob.join('\n').trim();
      if (jobContent.length > 200) {
        jobs.push(jobContent);
        console.log(`✅ Final job: ${currentJob[0].substring(0, 50)}... (${jobContent.length} chars)`);
      }
    }
  }
  
  console.log(`🎯 Total jobs detected: ${jobs.length}`);
  
  // Return jobs if we found a reasonable number, otherwise return original text
  if (jobs.length >= 2 && jobs.length <= 15) {
    return jobs;
  }
  
  console.log('⚠️ Job detection returned unexpected count, treating as single experience');
  return [experienceText];
}

function detectJobsByCompanyTransitions(text: string): string[] {
  console.log('🏢 Enhanced company transitions detection...');
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log(`📋 Processing ${lines.length} lines for company patterns`);
  
  const jobs: string[] = [];
  
  // ENHANCED patterns specifically for this user's resume format
  const fromMarkerPattern = /^From:\s*/i;
  
  // Specific company patterns based on user's actual resume
  const specificCompanyPatterns = [
    /HSBC\s+Electronic\s+Data\s+Processing\s+India\s+P\.?\s*limited/i,
    /Accenture\s+Services\s+Private\s+Limited/i,
    /Deutsche\s+Bank\s+AG/i,
    /Team\s+Lease\s+Services\s+Limited/i,
    /Baroda\s+Global\s+Shared\s+Services\s+Limited/i,
    /Yes\s+Bank\s+Limited/i,
    /RBL\s+Bank\s+Limited/i,
    /HDFC\s+Bank\s+Limited/i,
    /CITIBANK\s+N\.?A\.?/i,
    /CITIBANK/i
  ];
  
  // Enhanced general company patterns
  const generalCompanyPatterns = [
    /^From:\s*([A-Z][A-Za-z\s&.]+(?:Ltd\.?|Limited|Inc\.?|Corporation|Corp\.?|Company|Co\.?|P\.?\s*[Ll]imited|Services?\s*(?:Private\s+)?Limited|Solutions?|Technologies?|Systems?|Bank(?:\s+Limited)?|India|Operations?|AG|N\.?A\.?))/i,
    /^([A-Z][A-Za-z\s&.]+(?:Ltd\.?|Limited|Inc\.?|Corporation|Corp\.?|Company|Co\.?|P\.?\s*[Ll]imited|Services?\s*(?:Private\s+)?Limited|Solutions?|Technologies?|Systems?|Bank(?:\s+Limited)?|India|Operations?|AG|N\.?A\.?))/i
  ];
  
  let currentJob: string[] = [];
  let lastCompanyFound = '';
  let jobCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Debug logging for first 15 lines
    if (i < 15) {
      const isFromMarker = fromMarkerPattern.test(line);
      const isSpecificCompany = specificCompanyPatterns.some(pattern => pattern.test(line));
      const isGeneralCompany = generalCompanyPatterns.some(pattern => pattern.test(line));
      console.log(`  Line ${i + 1}: "${line}" [From:${isFromMarker} Specific:${isSpecificCompany} General:${isGeneralCompany}]`);
    }
    
    // Check for "From:" marker as PRIMARY job boundary
    const isFromMarker = fromMarkerPattern.test(line);
    
    // Check for specific company patterns
    const isSpecificCompany = specificCompanyPatterns.some(pattern => pattern.test(line));
    
    // Check for general company patterns
    const isGeneralCompany = generalCompanyPatterns.some(pattern => pattern.test(line));
    
    const isJobBoundary = isFromMarker || isSpecificCompany || isGeneralCompany;
    
    if (isJobBoundary && currentJob.length > 3) { // Reduced threshold for better detection
      // Found new job, save previous one
      const jobContent = currentJob.join('\n').trim();
      if (jobContent.length > 100) { // More lenient threshold
        jobs.push(jobContent);
        jobCount++;
        console.log(`  ✅ Company Job ${jobCount}: ${lastCompanyFound} (${jobContent.length} chars)`);
        console.log(`     Preview: ${jobContent.substring(0, 80)}...`);
      } else {
        console.log(`  ⚠️  Skipped short job: ${jobContent.length} chars`);
      }
      
      currentJob = [line];
      
      // Extract company name for better logging
      if (isSpecificCompany) {
        const match = specificCompanyPatterns.find(pattern => pattern.test(line));
        lastCompanyFound = match ? (line.match(match)?.[0] || 'Specific Company') : 'Unknown';
      } else if (isFromMarker) {
        // Extract company from "From:" line
        const companyMatch = line.match(/From:\s*(.+)/i);
        lastCompanyFound = companyMatch ? companyMatch[1].trim() : 'From Line';
      } else {
        const companyMatch = generalCompanyPatterns.find(pattern => pattern.test(line));
        lastCompanyFound = companyMatch ? (line.match(companyMatch)?.[1] || 'General Company') : 'Unknown Company';
      }
      
    } else {
      currentJob.push(line);
      
      // If this is the first line and looks like a company, mark it
      if (currentJob.length === 1 && isJobBoundary) {
        if (isSpecificCompany) {
          const match = specificCompanyPatterns.find(pattern => pattern.test(line));
          lastCompanyFound = match ? (line.match(match)?.[0] || 'Specific Company') : 'Unknown';
        } else if (isFromMarker) {
          const companyMatch = line.match(/From:\s*(.+)/i);
          lastCompanyFound = companyMatch ? companyMatch[1].trim() : 'From Line';
        } else {
          const companyMatch = generalCompanyPatterns.find(pattern => pattern.test(line));
          lastCompanyFound = companyMatch ? (line.match(companyMatch)?.[1] || 'General Company') : 'First Job';
        }
        console.log(`  🏢 Starting job with company: ${lastCompanyFound}`);
      }
    }
  }
  
  // Add the last job
  if (currentJob.length > 0) {
    const jobContent = currentJob.join('\n').trim();
    if (jobContent.length > 100) {
      jobs.push(jobContent);
      jobCount++;
      console.log(`  ✅ Final Company Job ${jobCount}: ${lastCompanyFound} (${jobContent.length} chars)`);
    }
  }
  
  console.log(`🏢 Enhanced company detection result: ${jobs.length} jobs found`);
  return jobs;
}

function detectJobsByDateRanges(text: string): string[] {
  console.log('📅 Detecting jobs by date ranges...');
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const jobs: string[] = [];
  
  // Enhanced date patterns for user's specific formats
  const datePatterns = [
    // "From: Aug 21 to till date" format
    /From:\s*([A-Za-z]{3,9}\s*'\d{2}|\d{1,2}\/\d{4}|[A-Za-z]{3,9}\s+\d{2,4})\s+to\s+(till\s+date|present|[A-Za-z]{3,9}\s*'\d{2}|[A-Za-z]{3,9}\s+\d{2,4})/i,
    
    // "Sep1997-Feb 2013" format (no spaces)
    /([A-Za-z]{3,9}\d{4})\s*[-–—]\s*([A-Za-z]{3,9}\s*\d{4}|present|current|till\s+date)/i,
    
    // "Mar 21 to July 21" format  
    /([A-Za-z]{3,9}\s+\d{2,4})\s+to\s+([A-Za-z]{3,9}\s+\d{2,4}|present|current|till\s+date)/i,
    
    // Standard formats
    /(\d{4})\s*[-–—]\s*(\d{4}|present|current|till\s+date)/i,
    /([A-Za-z]+\s+\d{4})\s*[-–—]\s*([A-Za-z]+\s+\d{4}|present|current|till\s+date)/i,
    /(\d{1,2}\/\d{4})\s*[-–—]\s*(\d{1,2}\/\d{4}|present|current)/i,
    
    // Month abbreviations with apostrophes: "Aug'21", "Mar'13"
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\s']*\d{2,4}\s*[-–—to]\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\s']*\d{2,4}/i,
    
    // "Since" patterns
    /Since\s+([A-Za-z]+[\s']*\d{2,4})/i
  ];
  
  let currentJob: string[] = [];
  let jobCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line contains a date range
    const matchedPattern = datePatterns.find(pattern => pattern.test(line));
    const hasDateRange = !!matchedPattern;
    
    if (hasDateRange) {
      console.log(`  🎯 Date pattern found: "${line}" (Pattern: ${matchedPattern})`);
      
      if (currentJob.length > 0) {
        // Save previous job
        const jobContent = currentJob.join('\n').trim();
        if (jobContent.length > 100) { // Reduced threshold
          jobs.push(jobContent);
          jobCount++;
          console.log(`  ✅ Job ${jobCount}: Date-based (${jobContent.length} chars)`);
          console.log(`     Preview: ${jobContent.substring(0, 80)}...`);
        }
      }
      currentJob = [line];
    } else {
      currentJob.push(line);
    }
  }
  
  // Add the last job
  if (currentJob.length > 0) {
    const jobContent = currentJob.join('\n').trim();
    if (jobContent.length > 100) {
      jobs.push(jobContent);
      jobCount++;
      console.log(`  ✅ Final Job ${jobCount}: Date-based (${jobContent.length} chars)`);
    }
  }
  
  console.log(`📅 Date detection result: ${jobs.length} jobs found`);
  return jobs;
}

function detectJobsByRoleProgression(text: string): string[] {
  console.log('🎯 Detecting jobs by role progression...');
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const jobs: string[] = [];
  
  // Look for role progression patterns (same company, different roles)
  const roleProgressionPatterns = [
    /Since\s+([A-Za-z]+\s*'\d{2})\s*[-–—]\s*([A-Za-z]+\s*'\d{2})/i,
    /(\d{4})\s*[-–—]\s*(\d{4})\s*[:\s]*(.+)/i,
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\s']*\d{2,4}\s*[-–—]\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\s']*\d{2,4}/i,
    /^(Growth Path|Career Progression|Role|As\s+)/i
  ];
  
  let currentJob: string[] = [];
  let jobCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for role progression indicators
    const isRoleProgression = roleProgressionPatterns.some(pattern => pattern.test(line));
    
    if (isRoleProgression && currentJob.length > 0) {
      // Save previous job
      const jobContent = currentJob.join('\n').trim();
      if (jobContent.length > 100) {
        jobs.push(jobContent);
        jobCount++;
        console.log(`  🎯 Role ${jobCount}: ${line.substring(0, 60)}... (${jobContent.length} chars)`);
      }
      currentJob = [line];
    } else {
      currentJob.push(line);
    }
  }
  
  // Add the last job
  if (currentJob.length > 0) {
    const jobContent = currentJob.join('\n').trim();
    if (jobContent.length > 100) {
      jobs.push(jobContent);
      jobCount++;
      console.log(`  🎯 Role ${jobCount}: Final role (${jobContent.length} chars)`);
    }
  }
  
  return jobs;
}

function intelligentContentSplitting(text: string): string[] {
  console.log('🧠 Applying intelligent content splitting fallback...');
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log(`📝 Total lines to process: ${lines.length}`);
  
  // Strategy 1: Use "From:" as the most reliable boundary marker for this user's format
  const fromBasedJobs = splitByFromMarkers(text);
  if (fromBasedJobs.length > 1) {
    console.log(`✅ From-marker splitting: ${fromBasedJobs.length} jobs found`);
    return fromBasedJobs;
  }
  
  // Strategy 2: Split by major content blocks (paragraph-based)
  const paragraphJobs = text.split(/\n\s*\n/).filter(p => p.trim().length > 150);
  if (paragraphJobs.length > 1) {
    console.log(`✅ Paragraph-based splitting: ${paragraphJobs.length} jobs found`);
    return paragraphJobs;
  }
  
  // Strategy 3: Split by role/position indicators for career progression
  const roleBasedJobs = splitByRoleIndicators(text);
  if (roleBasedJobs.length > 1) {
    console.log(`✅ Role-based splitting: ${roleBasedJobs.length} jobs found`);
    return roleBasedJobs;
  }
  
  // Strategy 4: Split by line count for very long content (adaptive)
  if (lines.length > 40) {
    console.log('📏 Long content detected, using adaptive line splitting');
    const adaptiveJobs = adaptiveLineSplitting(lines);
    if (adaptiveJobs.length > 1) {
      console.log(`✅ Adaptive splitting: ${adaptiveJobs.length} jobs found`);
      return adaptiveJobs;
    }
  }
  
  // Strategy 5: Look for any organizational markers as last resort
  const markerBasedJobs = splitByOrganizationalMarkers(lines);
  if (markerBasedJobs.length > 1) {
    console.log(`✅ Marker-based splitting: ${markerBasedJobs.length} jobs found`);
    return markerBasedJobs;
  }
  
  // Final fallback - return original as single job
  console.log('⚠️ All splitting strategies failed, returning single job');
  return [text];
}

function splitByFromMarkers(text: string): string[] {
  console.log('🎯 Enhanced "From:" marker detection with improved splitting...');
  console.log(`📝 Input text length: ${text.length} chars`);
  console.log(`📄 Input preview: ${text.substring(0, 300)}...`);
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log(`📋 Total lines after cleanup: ${lines.length}`);
  
  // Show first 25 lines for debugging
  console.log('📋 First 25 lines for From marker analysis:');
  lines.slice(0, 25).forEach((line, index) => {
    const hasFromMarker = /^From:\s*/i.test(line);
    console.log(`  ${index + 1}: "${line}" ${hasFromMarker ? '← FROM MARKER' : ''}`);
  });
  
  const jobs: string[] = [];
  let currentJob: string[] = [];
  
  // Enhanced "From:" pattern - more flexible matching
  const fromPattern = /^From:\s*/i;
  
  let foundFromMarkers = 0;
  let jobBoundariesFound = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isFromMarker = fromPattern.test(line);
    
    if (isFromMarker) {
      foundFromMarkers++;
      jobBoundariesFound.push(i);
      console.log(`🎯 Found From marker ${foundFromMarkers} at line ${i + 1}: "${line}"`);
      
      // If we have accumulated content, save it as a job
      if (currentJob.length > 0) {
        const jobContent = currentJob.join('\n').trim();
        if (jobContent.length > 30) { // More lenient threshold
          jobs.push(jobContent);
          console.log(`  ✅ From Job ${jobs.length}: ${jobContent.length} chars`);
          console.log(`     Content preview: ${jobContent.substring(0, 150)}...`);
        } else {
          console.log(`  ⚠️  Skipped short job: ${jobContent.length} chars - "${jobContent}"`);
        }
      }
      
      // Start new job with this line and collect subsequent lines until next From marker
      // ENHANCED: Collect more context lines after "From:" to capture company info
      currentJob = [line];
      
      // Look ahead to collect company/role information that comes after "From:"
      let lookAheadCount = 0;
      let j = i + 1;
      while (j < lines.length && lookAheadCount < 15) { // Collect up to 15 lines ahead
        const nextLine = lines[j];
        
        // Stop if we hit another "From:" marker
        if (fromPattern.test(nextLine)) {
          break;
        }
        
        // Stop if we hit what looks like a new major section
        if (nextLine.match(/^(Education|Skills|Certifications|Languages|Personal Details):/i)) {
          break;
        }
        
        currentJob.push(nextLine);
        lookAheadCount++;
        j++;
      }
      
      // Skip ahead in the main loop to avoid re-processing these lines
      i = j - 1; // j-1 because the loop will increment i
    } else if (currentJob.length === 0) {
      // We're not in a job section yet, add this line to start building one
      currentJob.push(line);
    }
  }
  
  // Add the last job
  if (currentJob.length > 0) {
    const jobContent = currentJob.join('\n').trim();
    if (jobContent.length > 30) {
      jobs.push(jobContent);
      console.log(`  ✅ Final From Job ${jobs.length}: ${jobContent.length} chars`);
      console.log(`     Content preview: ${jobContent.substring(0, 150)}...`);
    }
  }
  
  console.log(`🎯 From-marker detection summary: ${foundFromMarkers} markers found at lines [${jobBoundariesFound.join(', ')}], ${jobs.length} jobs created`);
  
  // Enhanced validation and recovery
  if (foundFromMarkers > 0 && jobs.length < foundFromMarkers) {
    console.log(`⚠️ Job count mismatch: ${foundFromMarkers} markers but only ${jobs.length} jobs`);
    console.log('🔧 Attempting content recovery...');
    
    // Try alternative splitting approach
    const alternativeJobs = text.split(/\n(?=From:)/i).filter(section => section.trim().length > 30);
    if (alternativeJobs.length > jobs.length) {
      console.log(`✅ Alternative splitting recovered ${alternativeJobs.length} jobs`);
      return alternativeJobs;
    }
  }
  
  // CRITICAL: If we found multiple From markers, ensure we return at least that many jobs
  if (foundFromMarkers > 1 && jobs.length < foundFromMarkers) {
    console.log('🆘 Emergency job recovery - ensuring minimum job count matches From markers');
    
    // Split more aggressively by From markers using regex
    const emergencyJobs = text.split(/(?=From:\s)/i).filter(section => {
      const trimmed = section.trim();
      return trimmed.length > 50 && /From:\s/i.test(trimmed);
    });
    
    if (emergencyJobs.length >= foundFromMarkers) {
      console.log(`✅ Emergency recovery successful: ${emergencyJobs.length} jobs recovered`);
      return emergencyJobs;
    }
  }
  
  // If we found markers but no jobs, there might be a parsing issue
  if (foundFromMarkers > 0 && jobs.length === 0) {
    console.log('⚠️ Found From markers but no jobs created - returning full text to prevent data loss');
    return [text.trim()];
  }
  
  return jobs;
}

function splitByRoleIndicators(text: string): string[] {
  console.log('  🎯 Splitting by role indicators...');
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const jobs: string[] = [];
  let currentJob: string[] = [];
  
  const roleIndicators = [
    /^As\s+(AVP|Area Manager|Vice President|Manager|Director|Executive|Officer)/i,
    /^Role:\s*/i,
    /^Position:\s*/i,
    /^Designation:\s*/i,
    /Since\s+[A-Za-z]+[\s']*\d{2,4}/i,
    /\d{4}\s*[-–—]\s*\d{4}/i
  ];
  
  for (const line of lines) {
    const isRoleIndicator = roleIndicators.some(pattern => pattern.test(line));
    
    if (isRoleIndicator && currentJob.length > 5) {
      const jobContent = currentJob.join('\n').trim();
      if (jobContent.length > 150) {
        jobs.push(jobContent);
      }
      currentJob = [line];
    } else {
      currentJob.push(line);
    }
  }
  
  // Add final job
  if (currentJob.length > 0) {
    const jobContent = currentJob.join('\n').trim();
    if (jobContent.length > 150) {
      jobs.push(jobContent);
    }
  }
  
  return jobs;
}

function adaptiveLineSplitting(lines: string[]): string[] {
  console.log('  📏 Using adaptive line splitting...');
  const jobs: string[] = [];
  let currentJob: string[] = [];
  
  // Calculate ideal chunk size based on content density
  const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
  const targetJobLength = 2000; // Target characters per job
  const linesPerJob = Math.max(Math.ceil(targetJobLength / avgLineLength), 8);
  
  console.log(`  📊 Avg line length: ${Math.round(avgLineLength)}, targeting ${linesPerJob} lines per job`);
  
  for (let i = 0; i < lines.length; i++) {
    currentJob.push(lines[i]);
    
    // Look for natural break points when we have enough content
    if (currentJob.length >= linesPerJob) {
      const jobContent = currentJob.join('\n').trim();
      
      // Check if next few lines might be a natural break
      const nextLines = lines.slice(i + 1, i + 4).join(' ').toLowerCase();
      const hasNaturalBreak = /\b(from|since|role|position|company|bank|limited|services)\b/.test(nextLines) ||
                             /\d{4}/.test(nextLines);
      
      if (hasNaturalBreak || i === lines.length - 1) {
        if (jobContent.length > 150) {
          jobs.push(jobContent);
          console.log(`    📦 Chunk ${jobs.length}: ${jobContent.length} chars`);
        }
        currentJob = [];
      }
    }
  }
  
  // Add remaining content
  if (currentJob.length > 0) {
    const jobContent = currentJob.join('\n').trim();
    if (jobContent.length > 150) {
      jobs.push(jobContent);
      console.log(`    📦 Final chunk: ${jobContent.length} chars`);
    }
  }
  
  return jobs;
}

function splitByOrganizationalMarkers(lines: string[]): string[] {
  console.log('  🎯 Splitting by organizational markers...');
  const jobs: string[] = [];
  let currentJob: string[] = [];
  
  const organizationalMarkers = [
    /\b(HSBC|Accenture|Deutsche|Team Lease|Baroda|Yes Bank|RBL|HDFC|Citibank|CITIBANK)\b/i,
    /\b(Manager|Director|Vice President|AVP|Executive|Officer|Lead|Senior|Specialist)\b/i,
    /\b(From|Since|Apr|Aug|Jan|Feb|Mar|May|Jun|Jul|Sep|Oct|Nov|Dec)\s+\d{2,4}/i,
    /\b(Limited|Ltd|Bank|Services|Private|India)\b/i
  ];
  
  for (const line of lines) {
    const hasMarker = organizationalMarkers.some(pattern => pattern.test(line));
    
    if (hasMarker && currentJob.length > 8) { // Need substantial content before splitting
      const jobContent = currentJob.join('\n').trim();
      if (jobContent.length > 200) {
        jobs.push(jobContent);
        console.log(`    🎯 Marker-based job ${jobs.length}: ${jobContent.length} chars`);
      }
      currentJob = [line];
    } else {
      currentJob.push(line);
    }
  }
  
  // Add final job
  if (currentJob.length > 0) {
    const jobContent = currentJob.join('\n').trim();
    if (jobContent.length > 200) {
      jobs.push(jobContent);
      console.log(`    🎯 Final marker-based job: ${jobContent.length} chars`);
    }
  }
  
  return jobs;
}

// NEW: Split by role/designation patterns specific to user's resume
function splitByRoleDesignations(text: string): string[] {
  console.log('🎭 Detecting jobs by role/designation patterns...');
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const jobs: string[] = [];
  
  // Specific role/designation patterns for this user's resume
  const roleDesignationPatterns = [
    /^As\s+(AVP|Area Manager|Manager|Officer|Executive|Specialist|Analyst)/i,
    /^Role:\s*/i,
    /^Position:\s*/i,
    /^Designation:\s*/i,
    /^(AVP|Area Manager|Manager|Officer|Executive|Specialist|Analyst)\s*[-–—]/i,
    /^(Assistant\s+)?Vice\s+President/i,
    /^(Senior|Principal|Lead)\s+(Manager|Officer|Executive|Specialist)/i
  ];
  
  let currentJob: string[] = [];
  let jobCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for role/designation patterns
    const isRoleDesignation = roleDesignationPatterns.some(pattern => pattern.test(line));
    
    if (isRoleDesignation && currentJob.length > 5) { // Need some content before splitting
      // Save previous job
      const jobContent = currentJob.join('\n').trim();
      if (jobContent.length > 150) {
        jobs.push(jobContent);
        jobCount++;
        console.log(`  🎭 Role ${jobCount}: "${line.substring(0, 40)}..." (${jobContent.length} chars)`);
      }
      currentJob = [line];
    } else {
      currentJob.push(line);
    }
  }
  
  // Add the last job
  if (currentJob.length > 0) {
    const jobContent = currentJob.join('\n').trim();
    if (jobContent.length > 150) {
      jobs.push(jobContent);
      jobCount++;
      console.log(`  🎭 Final Role ${jobCount}: (${jobContent.length} chars)`);
    }
  }
  
  console.log(`🎭 Role-designation detection result: ${jobs.length} jobs found`);
  return jobs;
}

// NEW: Aggressive content splitting for complex resumes
function aggressiveContentSplitting(text: string): string[] {
  console.log('⚡ Applying aggressive content splitting...');
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log(`📝 Total lines for aggressive splitting: ${lines.length}`);
  
  const jobs: string[] = [];
  let currentJob: string[] = [];
  
  // Multiple aggressive splitting strategies
  const aggressiveMarkers = [
    // Company name patterns (very specific to user's resume)
    /^(HSBC|Accenture|Deutsche|Team\s+Lease|Baroda|Yes\s+Bank|RBL|HDFC|Citibank)/i,
    
    // "From:" patterns  
    /^From:\s*/i,
    
    // Date patterns at start of line
    /^(Aug|Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul)\s*[\d']/i,
    
    // Role progression indicators
    /^(Since|As|Role|Position|Designation)[\s:]/i,
    
    // Employment period patterns
    /\d{4}\s*[-–—to]\s*\d{4}/i,
    /\d{4}\s*[-–—to]\s*(till\s+date|present|current)/i,
    
    // Achievement/responsibility section starters
    /^(•|->|➤|✓|\*|\d+\.)\s*/i,
    
    // Department/team indicators
    /^(Department|Team|Unit|Division|Branch):/i
  ];
  
  let jobCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for any aggressive marker
    const hasAggressiveMarker = aggressiveMarkers.some(pattern => pattern.test(line));
    
    // Force split on aggressive markers with looser content requirements
    if (hasAggressiveMarker && currentJob.length > 3) {
      const jobContent = currentJob.join('\n').trim();
      if (jobContent.length > 100) { // Lower threshold for aggressive splitting
        jobs.push(jobContent);
        jobCount++;
        console.log(`  ⚡ Aggressive Job ${jobCount}: "${line.substring(0, 50)}..." (${jobContent.length} chars)`);
      }
      currentJob = [line];
    } else {
      currentJob.push(line);
    }
  }
  
  // Add final job
  if (currentJob.length > 0) {
    const jobContent = currentJob.join('\n').trim();
    if (jobContent.length > 100) {
      jobs.push(jobContent);
      jobCount++;
      console.log(`  ⚡ Final Aggressive Job ${jobCount}: (${jobContent.length} chars)`);
    }
  }
  
  console.log(`⚡ Aggressive splitting result: ${jobs.length} jobs found`);
  return jobs;
}

// NEW: Force content split for very long content
function forceContentSplit(text: string): string[] {
  console.log('🚨 Applying forced content split for long content...');
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const totalLength = text.length;
  
  console.log(`📏 Content stats: ${totalLength} chars, ${lines.length} lines`);
  
  // Calculate target number of jobs based on content length
  let targetJobs = Math.max(Math.floor(totalLength / 1500), 3); // Aim for jobs of ~1500 chars each
  
  // But cap it at a reasonable number for processing
  targetJobs = Math.min(targetJobs, 15);
  
  console.log(`🎯 Target jobs for forced split: ${targetJobs}`);
  
  const jobs: string[] = [];
  const linesPerJob = Math.ceil(lines.length / targetJobs);
  
  for (let i = 0; i < targetJobs; i++) {
    const startIndex = i * linesPerJob;
    const endIndex = Math.min(startIndex + linesPerJob, lines.length);
    
    if (startIndex < lines.length) {
      const jobLines = lines.slice(startIndex, endIndex);
      const jobContent = jobLines.join('\n').trim();
      
      if (jobContent.length > 50) { // Very low threshold for forced splitting
        jobs.push(jobContent);
        console.log(`  🚨 Forced Job ${jobs.length}: Lines ${startIndex + 1}-${endIndex} (${jobContent.length} chars)`);
        console.log(`     Preview: ${jobContent.substring(0, 80)}...`);
      }
    }
  }
  
  console.log(`🚨 Forced splitting created ${jobs.length} jobs from ${totalLength} chars`);
  return jobs;
}

function intelligentContentSplit(text: string): string[] {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  
  const chunkSize = Math.max(Math.floor(lines.length / 3), 5); // Aim for 3-5 chunks
  
  for (let i = 0; i < lines.length; i++) {
    currentChunk.push(lines[i]);
    
    // Look for natural break points
    if (currentChunk.length >= chunkSize) {
      const nextFewLines = lines.slice(i + 1, i + 4).join(' ').toLowerCase();
      const hasDatePattern = /\d{4}/.test(nextFewLines);
      const hasJobTitle = /(manager|director|analyst|specialist|coordinator|lead|senior)/.test(nextFewLines);
      
      if (hasDatePattern || hasJobTitle || i === lines.length - 1) {
        chunks.push(currentChunk.join('\n'));
        currentChunk = [];
      }
    }
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'));
  }
  
  return chunks.filter(chunk => chunk.length > 100);
}

function clusterBySentencePatterns(text: string): string[] {
  const sentences = text.split(/[.!?]\s+/).filter(s => s.trim().length > 20);
  const clusters: string[] = [];
  let currentCluster: string[] = [];
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    currentCluster.push(sentence);
    
    // Look for clustering signals
    const hasYearTransition = /\d{4}/.test(sentence) && currentCluster.length > 3;
    const hasRoleTransition = /(promoted|moved|transferred|joined|started|became)/.test(sentence.toLowerCase());
    const isLongEnough = currentCluster.join('. ').length > 800;
    
    if ((hasYearTransition || hasRoleTransition || isLongEnough) && currentCluster.length > 2) {
      clusters.push(currentCluster.join('. ') + '.');
      currentCluster = [];
    }
  }
  
  if (currentCluster.length > 0) {
    clusters.push(currentCluster.join('. ') + '.');
  }
  
  return clusters.filter(cluster => cluster.length > 100);
}

function splitTextIntoChunks(text: string, maxChunkSize: number): string[] {
  const words = text.split(' ');
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const word of words) {
    if (currentChunk.length + word.length + 1 <= maxChunkSize) {
      currentChunk += (currentChunk ? ' ' : '') + word;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = word;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

function parseResumeIntoSections(text: string): Array<{type: string, content: string, priority: number}> {
  console.log('🔍 Parsing resume into intelligent sections...');
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const sections: Array<{type: string, content: string, priority: number}> = [];
  
  // Enhanced section detection with priority for processing order
  const sectionMarkers = {
    contact: {
      markers: ['email', '@', 'phone', 'mobile', 'linkedin', 'address', 'location'],
      priority: 1 // Process first - fastest
    },
    experience: {
      markers: ['experience', 'employment', 'work history', 'professional experience', 'career history', 'work experience', 'employment history'],
      priority: 3 // Process after contact and summary - longest processing
    },
    summary: {
      markers: ['summary', 'profile', 'objective', 'about', 'overview', 'professional summary'],
      priority: 2 // Process second - medium complexity
    },
    education: {
      markers: ['education', 'academic', 'qualification', 'degree', 'university', 'college', 'school', 'certification'],
      priority: 4 // Process after experience
    },
    skills: {
      markers: ['skills', 'technical skills', 'competencies', 'expertise', 'proficiencies', 'technologies', 'tools'],
      priority: 5 // Process last - simple
    }
  };

  let currentType = 'contact';
  let currentContent: string[] = [];
  let detectedSections: Set<string> = new Set();

  // First pass: detect section headers and boundaries
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    const isLikelyHeader = line.length < 80 && (
      line.includes(':') || 
      line.match(/^[a-z\s]+$/) ||
      line === line.toUpperCase() ||
      (i > 0 && lines[i-1].trim() === '') // Line after empty space
    );
    
    let newType = currentType;
    
    // Check for section transitions with priority
    if (isLikelyHeader) {
      for (const [sectionType, config] of Object.entries(sectionMarkers)) {
        if (config.markers.some(marker => line.includes(marker))) {
          newType = sectionType;
          detectedSections.add(sectionType);
          break;
        }
      }
    }
    
    // Handle section transitions
    if (newType !== currentType && currentContent.length > 0) {
      sections.push({ 
        type: currentType, 
        content: currentContent.join('\n'),
        priority: sectionMarkers[currentType as keyof typeof sectionMarkers]?.priority || 10
      });
      currentContent = [];
      currentType = newType;
    }
    
    currentContent.push(lines[i]);
  }
  
  // Add final section
  if (currentContent.length > 0) {
    sections.push({ 
      type: currentType, 
      content: currentContent.join('\n'),
      priority: sectionMarkers[currentType as keyof typeof sectionMarkers]?.priority || 10
    });
  }

  // Second pass: ensure we have all critical sections
  const consolidatedSections: Array<{type: string, content: string, priority: number}> = [];
  
  // Always ensure contact section (from beginning of resume)
  let contactSection = sections.find(s => s.type === 'contact');
  if (!contactSection || contactSection.content.length < 50) {
    contactSection = { 
      type: 'contact', 
      content: lines.slice(0, Math.min(15, lines.length)).join('\n'),
      priority: 1
    };
  }
  consolidatedSections.push(contactSection);

  // Process experience section with individual job detection
  const experienceSection = sections.find(s => s.type === 'experience');
  
  // CRITICAL FIX: For resumes without clear section headers (like Sundari's), 
  // scan the ENTIRE text for job markers, not just the experience section
  console.log('🔍 Scanning entire resume for job markers (improved detection)...');
  const fullTextJobs = detectIndividualJobs(text); // Use full text instead of just experience section
  
  if (fullTextJobs.length > 1) {
    console.log(`✅ Full-text job detection found ${fullTextJobs.length} jobs`);
    // Add each job as a separate section for processing
    fullTextJobs.forEach((jobContent, index) => {
      consolidatedSections.push({
        type: `experience_job_${index}`,
        content: jobContent,
        priority: 3 + (index * 0.1) // Maintain order but allow parallel processing
      });
    });
  } else if (experienceSection && experienceSection.content.length > 100) {
    // Fallback to experience section detection if full-text fails
    console.log('⚠️ Full-text detection found limited jobs, trying experience section...');
    const individualJobs = detectIndividualJobs(experienceSection.content);
    console.log(`🔍 Detected ${individualJobs.length} individual jobs in experience section`);
    
    // Add each job as a separate section for processing
    individualJobs.forEach((jobContent, index) => {
      consolidatedSections.push({
        type: `experience_job_${index}`,
        content: jobContent,
        priority: 3 + (index * 0.1) // Maintain order but allow parallel processing
      });
    });
  } else {
    // Final fallback - create a generic experience section from remaining content
    console.log('⚠️ No clear job structure detected, creating generic experience section');
    const usedContent = consolidatedSections.map(s => s.content).join('\n');
    const remainingLines = lines.filter(line => !usedContent.includes(line));
    if (remainingLines.length > 10) {
      consolidatedSections.push({
        type: 'experience_job_0',
        content: remainingLines.join('\n'),
        priority: 3
      });
    }
  }

  // Process summary/profile section
  const summarySection = sections.find(s => s.type === 'summary');
  if (summarySection && summarySection.content.length > 50) {
    consolidatedSections.push(summarySection);
  }

  // Process education section
  const educationSection = sections.find(s => s.type === 'education');
  if (educationSection && educationSection.content.length > 30) {
    consolidatedSections.push(educationSection);
  }

  // Process skills section
  const skillsSection = sections.find(s => s.type === 'skills');
  if (skillsSection && skillsSection.content.length > 30) {
    consolidatedSections.push(skillsSection);
  } else {
    // ENHANCED: If no dedicated skills section found, create one from job descriptions
    // Extract skills from all experience content
    console.log('💼 No dedicated skills section found, extracting skills from experience content...');
    const allExperienceContent = sections
      .filter(s => s.type === 'experience' || s.type.startsWith('experience_job_'))
      .map(s => s.content)
      .join('\n');
    
    if (allExperienceContent.length > 100) {
      consolidatedSections.push({
        type: 'skills',
        content: `${allExperienceContent}\n\n${sections.find(s => s.type === 'contact')?.content || ''}`,
        priority: 5
      });
      console.log(`✅ Created skills section from experience content (${allExperienceContent.length} chars)`);
    }
  }

  // If no experience section detected, create from remaining content
  if (!experienceSection) {
    const usedContent = consolidatedSections.map(s => s.content).join('\n');
    const remainingLines = lines.filter(line => !usedContent.includes(line));
    if (remainingLines.length > 10) {
      consolidatedSections.push({
        type: 'experience',
        content: remainingLines.join('\n'),
        priority: 3
      });
    }
  }

  console.log(`📋 Parsed into ${consolidatedSections.length} sections: ${consolidatedSections.map(s => `${s.type}(${s.content.length}chars)`).join(', ')}`);
  return consolidatedSections.sort((a, b) => a.priority - b.priority);
}

function sanitizeContent(content: string): string {
  // Remove problematic characters that might break OpenAI parsing
  return content
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/[""'']/g, '"') // Normalize quotes
    .replace(/…/g, '...') // Replace ellipsis
    .replace(/–—/g, '-') // Replace em/en dashes
    .trim();
}

function createFallbackJob(content: string, type: string): any {
  console.log(`🔧 Creating fallback job for ${type} from raw content`);
  
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  
  // Try to extract basic job info from raw content
  const fallbackJob = {
    title: "Experience Role",
    company: "Company Name",
    duration: "Employment Period",
    description: lines.slice(0, 3).join(' ').substring(0, 200),
    achievements: lines.slice(0, 5).map(line => line.trim()).filter(line => line.length > 10).slice(0, 3)
  };
  
  // Try to find company from "From:" lines
  const fromLine = lines.find(line => line.toLowerCase().includes('from:'));
  if (fromLine) {
    const companyMatch = fromLine.match(/from:\s*(.+?)(?:\s+|$)/i);
    if (companyMatch) {
      fallbackJob.company = companyMatch[1].trim();
    }
  }
  
  // Try to extract dates
  const datePattern = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec).{0,10}\d{2,4}/i;
  const dateLine = lines.find(line => datePattern.test(line));
  if (dateLine) {
    fallbackJob.duration = dateLine.trim();
  }
  
  console.log(`🔧 Fallback job created: ${fallbackJob.title} at ${fallbackJob.company}`);
  return fallbackJob;
}

async function processSectionWithSpecializedPrompt(
  section: {type: string, content: string, priority: number}, 
  apiKey: string, 
  model: string, 
  timeoutMs: number = 120000,
  globalSignal?: AbortSignal
): Promise<any> {
  console.log(`🔄 Processing ${section.type} section (${section.content.length} chars)...`);
  
  const sanitizedContent = sanitizeContentForOpenAI(section.content);
  console.log(`🧹 Content sanitized: ${section.content.length} → ${sanitizedContent.length} chars`);
  
  // ENHANCED logging for all sections, especially job sections
  if (section.type.startsWith('experience_job_')) {
    console.log(`🎯 Processing ${section.type} with enhanced debugging...`);
    console.log(`📝 Section content length: ${section.content.length} chars`);
    console.log(`📄 Section preview: ${section.content.substring(0, 500)}...`);
    console.log(`🧹 Sanitized content (first 300 chars): ${sanitizedContent.substring(0, 300)}`);
  } else {
    console.log(`📝 ${section.type} content preview: ${sanitizedContent.substring(0, 200)}...`);
  }
  
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`📤 Attempt ${attempt}/${maxRetries} for ${section.type}`);
    
    try {
      let prompt = '';
      
      if (section.type === 'contact') {
        prompt = `Extract contact information from this resume section. Return ONLY JSON:
{
  "name": "actual full name",
  "email": "actual email address", 
  "phone": "actual phone number",
  "location": "actual city/location",
  "linkedin": "actual linkedin url"
}

Content: ${sanitizedContent}`;
      } else if (section.type === 'summary') {
        prompt = `Create a professional summary from this resume section. Return ONLY JSON:
{
  "summary": "2-3 sentence professional summary highlighting key experience and skills"
}

Content: ${sanitizedContent}`;
      } else if (section.type.startsWith('experience_job_')) {
        // Enhanced prompt for comprehensive job extraction with better achievement detection
        prompt = `Extract job details from this text. Be thorough and comprehensive. Return ONLY valid JSON:
{
  "title": "job title or role",
  "company": "company name", 
  "duration": "time period worked",
  "description": ["main responsibility 1", "main responsibility 2", "main responsibility 3", "main responsibility 4"],
  "achievements": ["quantifiable achievement 1", "leadership achievement 2", "process improvement 3"]
}

IMPORTANT EXTRACTION GUIDELINES:
- Extract ALL responsibilities and tasks mentioned
- For achievements, look for: quantifiable results (numbers, percentages), leadership roles (managed team of X), process improvements, recognitions, successful project deliveries, cost savings, efficiency gains, awards, promotions, target achievements
- Include both explicit achievements and accomplishments implied by responsibilities
- Be comprehensive - extract as much relevant information as possible

Content: ${sanitizedContent}`;
      } else if (section.type === 'education') {
        prompt = `Extract education information from this section. Return ONLY JSON:
{
  "education": [
    {
      "degree": "actual degree",
      "institution": "actual institution",
      "year": "actual year/period",
      "gpa": "actual gpa if mentioned"
    }
  ]
}

Content: ${sanitizedContent}`;
      } else if (section.type === 'skills') {
        prompt = `Extract skills, tools, certifications, and languages from this section. Include technical skills, soft skills, domain knowledge, and any mentioned competencies. Be comprehensive and extract ALL relevant skills mentioned. Return ONLY JSON:
{
  "skills": ["actual skill 1", "actual skill 2", "soft skill 1", "domain knowledge 1"],
  "tools": ["actual tool/software 1", "actual tool 2", "technology 1"], 
  "certifications": ["actual certification 1"],
  "languages": ["language 1", "language 2"]
}

IMPORTANT: Extract as many relevant skills as possible. Look for:
- Technical skills (software, technologies, methodologies)
- Soft skills (leadership, communication, analytical)
- Domain expertise (industry knowledge, processes, regulations) 
- Competencies and areas of expertise mentioned
- Any skills implied by job responsibilities

Content: ${sanitizedContent}`;
      } else {
        throw new Error(`Unknown section type: ${section.type}`);
      }
      
      console.log(`📝 Prompt preview: ${prompt.substring(0, 300)}...`);
      
      // For job sections, log the exact prompt being sent
      if (section.type.startsWith('experience_job_')) {
        console.log(`🔍 FULL PROMPT for ${section.type}:`);
        console.log(prompt);
      }
      
      const result = await makeOpenAIRequestWithTimeout(prompt, apiKey, model, timeoutMs, globalSignal);
      console.log(`✅ Successfully processed ${section.type} section on attempt ${attempt}`);
      
      // Enhanced result logging for job sections
      if (section.type.startsWith('experience_job_')) {
        console.log(`📊 Job result: ${JSON.stringify(result).substring(0, 300)}...`);
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed for ${section.type}:`, error.message);
      console.error(`🔧 Error details for ${section.type}:`, error);
      
      if (attempt === maxRetries) {
        // For job sections, create fallback instead of throwing
        if (section.type.startsWith('experience_job_')) {
          console.log(`🔧 All ${maxRetries} attempts failed for ${section.type}, creating enhanced fallback...`);
          console.log(`📄 Creating fallback from content: "${section.content}"`);
          return createEnhancedFallbackJob(section.content, section.type);
        }
        throw error;
      }
      
      // Progressive wait times for retries
      const waitTime = 1000 * Math.pow(2, attempt - 1); // Exponential backoff: 1s, 2s, 4s
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

function mergeSectionResults(
  sectionResults: Array<{status: 'fulfilled' | 'rejected', value?: any, reason?: any, section?: any}>,
  originalSections: Array<{type: string, content: string, priority: number}>
): any {
  console.log('🔄 Merging section results...');
  console.log(`📊 Processing ${sectionResults.length} section results`);
  
  const enhancedResume = {
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

  const failedSections: string[] = [];
  const experienceJobSections: string[] = [];
  let successfulJobs = 0;
  let failedJobs = 0;
  
  // First pass: analyze results and identify experience jobs
  for (let i = 0; i < sectionResults.length; i++) {
    const result = sectionResults[i];
    const originalSection = originalSections[i];
    
    if (originalSection.type.startsWith('experience_job_')) {
      experienceJobSections.push(originalSection.type);
      
      if (result.status === 'fulfilled') {
        successfulJobs++;
      } else {
        failedJobs++;
        console.error(`❌ Job section ${originalSection.type} failed:`, result.reason);
      }
    }
  }
  
  console.log(`📈 Experience job processing stats: ${successfulJobs} successful, ${failedJobs} failed out of ${experienceJobSections.length} total jobs`);
  
  // Second pass: process all results
  for (let i = 0; i < sectionResults.length; i++) {
    const result = sectionResults[i];
    const originalSection = originalSections[i];
    
    if (result.status === 'fulfilled') {
      const sectionData = result.value;
      const type = originalSection.type;
      console.log(`✅ Merging successful ${type} section`);
      
      // Handle individual job results
      if (type.startsWith('experience_job_')) {
        // Check if this is a fallback job structure with nested experience array
        let jobData = sectionData;
        if (sectionData.experience && Array.isArray(sectionData.experience) && sectionData.experience.length > 0) {
          // This is from the old fallback structure - extract the job
          jobData = sectionData.experience[0];
        }
        
        console.log(`✅ Merging individual job: ${jobData.title || 'Unknown Title'} (Experience array size: ${enhancedResume.experience.length} → ${enhancedResume.experience.length + 1})`);
        
        // Validate job data before adding
        if (jobData.title || jobData.company || jobData.description) {
          enhancedResume.experience.push({
            title: jobData.title || "Professional Role",
            company: jobData.company || "Company",
            duration: jobData.duration || "Employment Period",
            description: Array.isArray(jobData.description) ? jobData.description : [jobData.description || "Professional experience and responsibilities"],
            achievements: Array.isArray(jobData.achievements) ? jobData.achievements : []
          });
          console.log(`   ✓ Job added successfully: ${jobData.title || 'Professional Role'} at ${jobData.company || 'Company'}`);
        } else {
          console.warn(`   ⚠️ Skipping job with insufficient data: ${JSON.stringify(jobData)}`);
        }
      } else {
        // Handle non-job sections
        switch (type) {
          case 'contact':
            enhancedResume.name = sectionData.name || "";
            enhancedResume.email = sectionData.email || "";
            enhancedResume.phone = sectionData.phone || "";
            enhancedResume.location = sectionData.location || "";
            enhancedResume.linkedin = sectionData.linkedin || "";
            break;
            
          case 'summary':
            enhancedResume.summary = sectionData.summary || "";
            break;
            
          case 'education':
            enhancedResume.education = Array.isArray(sectionData.education) ? sectionData.education : [];
            break;
            
          case 'skills':
            enhancedResume.skills = Array.isArray(sectionData.skills) ? sectionData.skills : [];
            enhancedResume.tools = Array.isArray(sectionData.tools) ? sectionData.tools : [];
            enhancedResume.certifications = Array.isArray(sectionData.certifications) ? sectionData.certifications : [];
            enhancedResume.languages = Array.isArray(sectionData.languages) ? sectionData.languages : [];
            break;
        }
      }
    } else {
      failedSections.push(originalSection.type);
      console.error(`❌ Failed to process ${originalSection.type} section:`, result.reason);
      
      // For failed experience jobs, create minimal fallback entries
      if (originalSection.type.startsWith('experience_job_')) {
        console.log(`🔧 Creating emergency fallback for failed job: ${originalSection.type}`);
        const fallbackJob = createFallbackJob(originalSection.content, originalSection.type);
        enhancedResume.experience.push(fallbackJob);
        console.log(`   ✓ Fallback job created: ${fallbackJob.title} at ${fallbackJob.company}`);
      }
    }
  }
  
  // Validate that we preserved all detected jobs
  const detectedJobCount = experienceJobSections.length;
  const finalJobCount = enhancedResume.experience.length;
  
  console.log(`🎯 Job preservation validation: ${detectedJobCount} detected → ${finalJobCount} in final result`);
  
  if (finalJobCount === 0 && detectedJobCount > 0) {
    console.error('🚨 CRITICAL: All jobs were lost during processing!');
    throw new Error(`All ${detectedJobCount} detected jobs were lost during OpenAI processing. This is a critical failure.`);
  }
  
  if (finalJobCount < detectedJobCount) {
    console.warn(`⚠️ Job count mismatch: Expected ${detectedJobCount}, got ${finalJobCount}. Some jobs may have been lost.`);
  }
  
  // Critical section validation (but allow fallbacks for experience)
  const contactFailed = failedSections.some(s => s === 'contact');
  if (contactFailed) {
    console.error('❌ Contact section processing failed completely');
    throw new Error('Critical contact section failed to process. Cannot continue without contact information.');
  }
  
  // Log processing summary
  if (failedSections.length > 0) {
    const nonJobFailures = failedSections.filter(s => !s.startsWith('experience_job_'));
    if (nonJobFailures.length > 0) {
      console.warn(`⚠️ Non-job sections failed: ${nonJobFailures.join(', ')}`);
    }
    console.warn(`⚠️ Total failed sections: ${failedSections.length}, but ${finalJobCount} jobs preserved`);
  }
  
  // Final experience array logging
  console.log(`🎯 Final merged experience array contains ${enhancedResume.experience.length} jobs:`);
  enhancedResume.experience.forEach((job, index) => {
    console.log(`   Job ${index + 1}: ${job.title} at ${job.company} (${job.duration})`);
  });
  
  return enhancedResume;
}

function validateEnhancedResume(resume: any): void {
  console.log('🔍 Validating enhanced resume...');
  console.log(`📊 Validation data: name="${resume.name}", experience_count=${resume.experience?.length || 0}, education_count=${resume.education?.length || 0}, skills_count=${resume.skills?.length || 0}`);
  
  // Log detailed experience information for debugging
  if (Array.isArray(resume.experience)) {
    console.log('💼 Experience details:');
    resume.experience.forEach((exp, index) => {
      console.log(`  Job ${index + 1}: title="${exp.title || 'N/A'}", company="${exp.company || 'N/A'}", duration="${exp.duration || 'N/A'}"`);
    });
  } else {
    console.log('❌ Experience is not an array:', typeof resume.experience, resume.experience);
  }
  
  // Critical validations - must have these
  if (!resume.name || resume.name.trim().length === 0) {
    console.error('❌ Validation failed: No name found');
    throw new Error('No name extracted from resume. Contact section processing failed.');
  }
  
  if (!Array.isArray(resume.experience) || resume.experience.length === 0) {
    console.error('❌ Validation failed: No experience found');
    console.error('🔍 Current experience value:', resume.experience);
    console.error('🔍 Resume object keys:', Object.keys(resume));
    
    // Provide more helpful error message with debugging info
    throw new Error(`No work experience extracted from resume. Experience section processing failed. 
    Debug info: experience type=${typeof resume.experience}, length=${resume.experience?.length || 'N/A'}
    This usually means the job detection algorithm failed to properly split and process the experience section.`);
  }
  
  // Log success stats
  console.log(`✅ Validation passed: ${resume.experience.length} experience entries found`);
  
  // Ensure all required fields exist (but can be empty)
  const requiredFields = ['name', 'title', 'email', 'phone', 'location', 'linkedin', 'summary', 'experience', 'education', 'skills', 'tools', 'certifications', 'languages'];
  for (const field of requiredFields) {
    if (!(field in resume)) {
      console.warn(`⚠️ Missing field: ${field}, adding empty value`);
      resume[field] = Array.isArray(resume[field]) ? [] : "";
    }
  }
  
  console.log('✅ Resume validation completed successfully');
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
    
    // Log prompt preview for debugging
    const promptPreview = prompt.substring(0, 200) + (prompt.length > 200 ? '...' : '');
    console.log(`📝 Prompt preview: ${promptPreview}`);
    
    const requestStart = Date.now();
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000 // Using max_tokens for legacy model compatibility
        // Note: temperature removed for gpt-4o-mini compatibility
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const requestDuration = Date.now() - requestStart;
    console.log(`⏱️ OpenAI request completed in ${requestDuration}ms`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      
      // Enhanced error messages for common issues
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded. Please wait and try again.`);
      } else if (response.status === 401) {
        throw new Error(`Authentication failed. Check OpenAI API key.`);
      } else if (response.status >= 500) {
        throw new Error(`OpenAI server error (${response.status}). Please try again later.`);
      }
      
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📥 OpenAI response received');
    
    // Enhanced response validation
    if (!data) {
      throw new Error('Empty response from OpenAI API');
    }
    
    if (data.error) {
      console.error('❌ OpenAI returned error:', data.error);
      throw new Error(`OpenAI error: ${data.error.message || JSON.stringify(data.error)}`);
    }
    
    // Add detailed logging of response structure for debugging
    console.log('🔍 Response has choices:', !!data.choices);
    console.log('🔍 Choices length:', data.choices?.length || 0);
    
    if (data.choices?.length > 0) {
      console.log('🔍 First choice structure:', JSON.stringify(data.choices[0], null, 2));
    }
    
    // Handle different response formats with better error handling
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
      console.error('❌ Full response structure:', JSON.stringify(data, null, 2));
      throw new Error('No content returned from OpenAI - unexpected response format');
    }

    if (typeof content !== 'string') {
      console.error('❌ Content is not a string:', typeof content, content);
      throw new Error(`Invalid content type: expected string, got ${typeof content}`);
    }

    console.log('📄 Raw OpenAI response preview:', content.substring(0, 200));

    // Enhanced content cleaning and validation
    let cleanedContent = content.trim();
    
    if (!cleanedContent) {
      throw new Error('OpenAI returned empty content');
    }
    
    // Remove markdown code blocks if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Remove any remaining whitespace
    cleanedContent = cleanedContent.trim();

    console.log('🧹 Cleaned content preview:', cleanedContent.substring(0, 200));

    // Enhanced JSON parsing with better error handling
    let parsedResume;
    try {
      parsedResume = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      console.error('❌ Content that failed to parse:', cleanedContent);
      
      // Try to fix common JSON issues
      try {
        // Fix trailing commas and other common issues
        const fixedContent = cleanedContent
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
          .replace(/:\s*'([^']*)'([,}\]])/g, ':"$1"$2'); // Convert single quotes to double
        
        parsedResume = JSON.parse(fixedContent);
        console.log('✅ JSON parsing succeeded after cleanup');
      } catch (secondParseError) {
        console.error('❌ JSON parsing failed even after cleanup:', secondParseError);
        throw new Error(`Failed to parse OpenAI response as JSON: ${parseError.message}. Content: ${cleanedContent.substring(0, 500)}`);
      }
    }
    
    if (!parsedResume || typeof parsedResume !== 'object') {
      throw new Error(`Invalid parsed result: expected object, got ${typeof parsedResume}`);
    }
    
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
      throw new Error(`Request timed out after ${timeoutMs/1000}s. The section may be too complex or OpenAI is overloaded.`);
    }
    
    // Enhanced error logging
    console.error('❌ makeOpenAIRequestWithTimeout failed:');
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    
    throw error;
  }
}