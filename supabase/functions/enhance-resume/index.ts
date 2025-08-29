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

  // Use reliable model for all processing - no size-based fallbacks
  const selectedModel = 'gpt-4.1-2025-04-14';
  const sectionTimeoutMs = 60000; // 60 seconds per section
  
  console.log(`📊 Processing ${originalText.length} chars with parallel section processing`);
  console.log(`🔧 Using model: ${selectedModel} with ${sectionTimeoutMs/1000}s per section timeout`);

  try {
    // Step 1: Parse resume into intelligent sections
    console.log('🔍 Parsing resume into sections...');
    const sections = parseResumeIntoSections(originalText);
    console.log(`📋 Identified sections: ${sections.map(s => s.type).join(', ')}`);

    // Step 2: Process sections in parallel with specialized prompts
    console.log('⚡ Starting parallel section processing...');
    const sectionPromises = sections.map(section => 
      processSectionWithSpecializedPrompt(section, apiKey, selectedModel, sectionTimeoutMs, globalSignal)
    );

    // Wait for all sections to complete (or fail)
    const sectionResults = await Promise.allSettled(sectionPromises);
    
    // Step 3: Merge successful results and handle failures
    console.log('🔄 Merging section results...');
    const enhancedResume = mergeSectionResults(sectionResults, sections);
    
    // Step 4: Validate final result
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
  console.log(`📄 Experience preview: ${experienceText.substring(0, 500)}...`);
  
  try {
    // Step 1: Try company-based detection (most reliable for structured resumes)
    const companyJobs = detectJobsByCompanyTransitions(experienceText);
    if (companyJobs.length > 1) {
      console.log(`✅ Company-based detection successful: ${companyJobs.length} jobs found`);
      return companyJobs;
    }
  } catch (error) {
    console.error('❌ Company-based detection failed:', error);
  }
  
  try {
    // Step 2: Try date-based detection for chronological resumes
    const dateJobs = detectJobsByDateRanges(experienceText);
    if (dateJobs.length > 1) {
      console.log(`✅ Date-based detection successful: ${dateJobs.length} jobs found`);
      return dateJobs;
    }
  } catch (error) {
    console.error('❌ Date-based detection failed:', error);
  }
  
  try {
    // Step 3: Try role progression detection (same company, multiple roles)
    const roleJobs = detectJobsByRoleProgression(experienceText);
    if (roleJobs.length > 1) {
      console.log(`✅ Role progression detection successful: ${roleJobs.length} jobs found`);
      return roleJobs;
    }
  } catch (error) {
    console.error('❌ Role progression detection failed:', error);
  }
  
  try {
    // Step 4: Fallback to content-based splitting
    const contentJobs = intelligentContentSplitting(experienceText);
    console.log(`🔄 Fallback content splitting: ${contentJobs.length} jobs detected`);
    return contentJobs;
  } catch (error) {
    console.error('❌ Content splitting failed:', error);
    // Final fallback - return the original text as a single job
    return [experienceText];
  }
}

function detectJobsByCompanyTransitions(text: string): string[] {
  console.log('🏢 Detecting jobs by company transitions...');
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const jobs: string[] = [];
  
  // Enhanced patterns for user's resume format
  const fromMarkerPattern = /^From:\s*/i;
  const specificCompanyPatterns = [
    /HSBC\s+Electronic\s+Data\s+Processing\s+India\s+P\.?\s*limited/i,
    /Accenture\s+Services\s+Private\s+Limited/i,
    /Deutsche\s+Bank\s+AG/i,
    /Team\s+Lease\s+Services\s+Limited/i,
    /Baroda\s+Global\s+Shared\s+Services\s+Limited/i,
    /Yes\s+Bank\s+Limited/i,
    /RBL\s+Bank\s+Limited/i,
    /HDFC\s+Bank\s+Limited/i,
    /CITIBANK/i
  ];
  
  const generalCompanyPatterns = [
    /^([A-Z][A-Za-z\s&.]+(?:Ltd\.?|Limited|Inc\.?|Corporation|Corp\.?|Company|Co\.?|P\.?\s*[Ll]imited|Services?\s*(?:Private\s+)?Limited|Solutions?|Technologies?|Systems?|Bank(?:\s+Limited)?|India|Operations?|AG))/i,
    /^From:\s*([A-Z][A-Za-z\s&.]+(?:Ltd\.?|Limited|Inc\.?|Corporation|Corp\.?|Company|Co\.?|P\.?\s*[Ll]imited|Services?\s*(?:Private\s+)?Limited|Solutions?|Technologies?|Systems?|Bank(?:\s+Limited)?|India|Operations?|AG))/i
  ];
  
  let currentJob: string[] = [];
  let lastCompanyFound = '';
  let jobCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    console.log(`  🔍 Line ${i}: "${line.substring(0, 80)}..."`);
    
    // Check for "From:" marker as primary job boundary
    const isFromMarker = fromMarkerPattern.test(line);
    
    // Check for specific company patterns
    const isSpecificCompany = specificCompanyPatterns.some(pattern => pattern.test(line));
    
    // Check for general company patterns
    const isGeneralCompany = generalCompanyPatterns.some(pattern => pattern.test(line));
    
    const isJobBoundary = isFromMarker || isSpecificCompany || isGeneralCompany;
    
    if (isJobBoundary && currentJob.length > 0) {
      // Found new job, save previous one
      const jobContent = currentJob.join('\n').trim();
      if (jobContent.length > 150) { // Reduced threshold for better detection
        jobs.push(jobContent);
        jobCount++;
        console.log(`  ✅ Job ${jobCount}: ${lastCompanyFound} (${jobContent.length} chars)`);
        console.log(`     Preview: ${jobContent.substring(0, 100)}...`);
      } else {
        console.log(`  ⚠️  Skipped short job: ${jobContent.length} chars`);
      }
      
      currentJob = [line];
      
      // Extract company name for better logging
      if (isSpecificCompany) {
        const match = specificCompanyPatterns.find(pattern => pattern.test(line));
        lastCompanyFound = match ? line.match(match)?.[0] || 'Unknown' : 'Unknown';
      } else if (isFromMarker) {
        // Extract company from "From:" line
        const companyMatch = line.match(/From:\s*(.+)/i);
        lastCompanyFound = companyMatch ? companyMatch[1].trim() : 'From Line';
      } else {
        const companyMatch = line.match(/([A-Z][A-Za-z\s&.]+(?:Ltd\.?|Limited|Inc\.?|Corporation|Corp\.?|Company|Co\.?|P\.?\s*[Ll]imited|Services?\s*(?:Private\s+)?Limited|Solutions?|Technologies?|Systems?|Bank(?:\s+Limited)?|India|Operations?|AG))/i);
        lastCompanyFound = companyMatch ? companyMatch[1].trim() : 'Unknown Company';
      }
      
    } else {
      currentJob.push(line);
      
      // If this is the first line and looks like a company, mark it
      if (currentJob.length === 1 && isJobBoundary) {
        if (isSpecificCompany) {
          const match = specificCompanyPatterns.find(pattern => pattern.test(line));
          lastCompanyFound = match ? line.match(match)?.[0] || 'Unknown' : 'Unknown';
        } else {
          const companyMatch = line.match(/([A-Z][A-Za-z\s&.]+(?:Ltd\.?|Limited|Inc\.?|Corporation|Corp\.?|Company|Co\.?|P\.?\s*[Ll]imited|Services?\s*(?:Private\s+)?Limited|Solutions?|Technologies?|Systems?|Bank(?:\s+Limited)?|India|Operations?|AG))/i);
          lastCompanyFound = companyMatch ? companyMatch[1].trim() : 'First Job';
        }
      }
    }
  }
  
  // Add the last job
  if (currentJob.length > 0) {
    const jobContent = currentJob.join('\n').trim();
    if (jobContent.length > 150) {
      jobs.push(jobContent);
      jobCount++;
      console.log(`  ✅ Final Job ${jobCount}: ${lastCompanyFound} (${jobContent.length} chars)`);
    }
  }
  
  console.log(`🏢 Company detection result: ${jobs.length} jobs found`);
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
  console.log('  🎯 Splitting by "From:" markers...');
  const fromPattern = /^From:\s*/im;
  const sections = text.split(fromPattern).filter(section => section.trim().length > 100);
  
  // Add back "From:" prefix to all but first section
  const jobs = sections.map((section, index) => {
    if (index === 0) return section.trim();
    return 'From: ' + section.trim();
  });
  
  return jobs.filter(job => job.length > 150);
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
  if (experienceSection && experienceSection.content.length > 100) {
    // Detect individual jobs within the experience section
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

async function processSectionWithSpecializedPrompt(
  section: {type: string, content: string, priority: number},
  apiKey: string,
  model: string,
  timeoutMs: number,
  globalSignal?: AbortSignal
): Promise<{type: string, result: any}> {
  
  console.log(`🔄 Processing ${section.type} section (${section.content.length} chars)...`);
  
  const prompts = {
    contact: `Extract contact information from this resume section. Return ONLY JSON:
{
  "name": "actual full name",
  "email": "actual email address",
  "phone": "actual phone number",
  "location": "actual city/location",
  "linkedin": "actual LinkedIn URL if present"
}

Resume section:
${section.content}

CRITICAL: Extract only real data. Use empty string "" if not found. No placeholders.`,

    summary: `Create a professional summary based on this resume content. Return ONLY JSON:
{
  "summary": "2-3 sentence professional summary highlighting key experience, skills and achievements"
}

Resume content:
${section.content}

CRITICAL: Base summary on actual content. No generic placeholders.`,

    experience: `Extract work experience from this individual job entry. Return ONLY JSON:
{
  "title": "actual job title",
  "company": "actual company name",
  "duration": "actual employment dates or period",
  "description": "brief role description based on actual content",
  "achievements": ["specific achievement 1", "specific achievement 2", "specific achievement 3"]
}

Job entry content:
${section.content}

CRITICAL: This is ONE job entry. Extract the specific job title, company name, employment dates, and actual achievements from this role only. Focus on concrete accomplishments and responsibilities.`,

    education: `Extract education information from this section. Return ONLY JSON:
{
  "education": [
    {
      "degree": "actual degree name",
      "institution": "actual institution name",
      "year": "actual graduation year or date range",
      "gpa": "actual GPA if mentioned, otherwise empty string"
    }
  ]
}

Education section:
${section.content}

CRITICAL: Extract actual educational credentials. Use empty array [] if none found.`,

    skills: `Extract skills, tools, certifications, and languages from this section. Return ONLY JSON:
{
  "skills": ["actual skill 1", "actual skill 2"],
  "tools": ["actual tool/software 1", "actual tool 2"],
  "certifications": ["actual certification 1"],
  "languages": ["actual language 1"]
}

Skills section:
${section.content}

CRITICAL: Categorize properly. Extract only mentioned items. Use empty arrays [] for missing categories.`
  };

  // Handle individual job processing
  const isExperienceJob = section.type.startsWith('experience_job_');
  const prompt = isExperienceJob ? prompts.experience : (prompts[section.type as keyof typeof prompts] || prompts.skills);

  
  try {
    const result = await makeOpenAIRequestWithTimeout(prompt, apiKey, model, timeoutMs, globalSignal);
    console.log(`✅ Successfully processed ${section.type} section`);
    return { type: section.type, result };
  } catch (error) {
    console.error(`❌ Failed to process ${section.type} section:`, error);
    throw new Error(`Failed to process ${section.type}: ${error.message}`);
  }
}

function mergeSectionResults(
  sectionResults: PromiseSettledResult<{type: string, result: any}>[],
  originalSections: Array<{type: string, content: string, priority: number}>
): any {
  console.log('🔄 Merging section results...');
  
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
  
  for (let i = 0; i < sectionResults.length; i++) {
    const result = sectionResults[i];
    const originalSection = originalSections[i];
    
    if (result.status === 'fulfilled') {
      const { type, result: sectionData } = result.value;
      console.log(`✅ Merging successful ${type} section`);
      
      // Handle individual job results
      if (type.startsWith('experience_job_')) {
        console.log(`✅ Merging individual job: ${sectionData.title || 'Unknown Title'}`);
        // Individual job data comes as a single job object, not an array
        if (sectionData.title || sectionData.company) {
          enhancedResume.experience.push({
            title: sectionData.title || "",
            company: sectionData.company || "",
            duration: sectionData.duration || "",
            description: sectionData.description || "",
            achievements: Array.isArray(sectionData.achievements) ? sectionData.achievements : []
          });
        }
      } else {
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
            
          case 'experience':
            enhancedResume.experience = Array.isArray(sectionData.experience) ? sectionData.experience : [];
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
    }
  }
  
  // If critical sections failed, throw error (no fallbacks)
  if (failedSections.includes('contact') || failedSections.includes('experience')) {
    throw new Error(`Critical sections failed to process: ${failedSections.join(', ')}. Cannot continue without contact and experience data.`);
  }
  
  // If we have some failed sections but not critical ones, continue
  if (failedSections.length > 0) {
    console.warn(`⚠️ Some sections failed but continuing: ${failedSections.join(', ')}`);
  }
  
  return enhancedResume;
}

function validateEnhancedResume(resume: any): void {
  console.log('🔍 Validating enhanced resume...');
  
  // Critical validations - must have these
  if (!resume.name || resume.name.trim().length === 0) {
    throw new Error('No name extracted from resume. Contact section processing failed.');
  }
  
  if (!Array.isArray(resume.experience) || resume.experience.length === 0) {
    throw new Error('No work experience extracted from resume. Experience section processing failed.');
  }
  
  // Ensure all required fields exist (but can be empty)
  const requiredFields = ['name', 'title', 'email', 'phone', 'location', 'linkedin', 'summary', 'experience', 'education', 'skills', 'tools', 'certifications', 'languages'];
  for (const field of requiredFields) {
    if (!(field in resume)) {
      console.warn(`⚠️ Missing field: ${field}, adding empty value`);
      resume[field] = Array.isArray(resume[field]) ? [] : "";
    }
  }
  
  console.log('✅ Resume validation completed');
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