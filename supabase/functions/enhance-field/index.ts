import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    console.log('🤖 Field enhancement request received');
    
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not configured');
      throw new Error('OpenAI API key not configured');
    }

    const { fieldType, content, context } = await req.json();
    
    console.log('📝 Field enhancement details:', {
      fieldType,
      contentLength: content?.length || 0,
      hasContext: !!context
    });

    if (!fieldType || !content) {
      throw new Error('Field type and content are required');
    }

    // Create field-specific enhancement prompts
    let systemPrompt = '';
    let enhancementFocus = '';

    switch (fieldType) {
      case 'summary':
        systemPrompt = 'You are an expert resume writer specializing in ATS-optimized professional summaries.';
        enhancementFocus = `
        Enhance this professional summary to be:
        - ATS-friendly with relevant keywords
        - Concise but impactful (2-3 sentences)
        - Results-oriented and quantifiable when possible
        - Industry-specific and professional
        - Action-oriented with strong power words
        
        Original summary: "${content}"
        
        Rewrite this summary to be more compelling and ATS-optimized. Focus on achievements, skills, and value proposition.`;
        break;

      case 'description':
        systemPrompt = 'You are an expert resume writer specializing in ATS-optimized job descriptions and responsibilities.';
        enhancementFocus = `
        Enhance this job description/responsibilities section to be:
        - ATS-friendly with industry keywords
        - Action-oriented using strong power verbs (Led, Implemented, Achieved, etc.)
        - Quantified with metrics when possible
        - Clear and concise bullet points
        - Results-focused rather than task-focused
        - Professional and impactful
        
        Original description: "${content}"
        
        Rewrite this to highlight achievements and impact rather than just duties. Use metrics where possible and ensure it's keyword-rich for ATS systems.`;
        break;

      case 'skills':
        systemPrompt = 'You are an expert resume writer specializing in ATS-optimized skills sections.';
        enhancementFocus = `
        Enhance this skills section to be:
        - ATS-optimized with industry-standard terminology
        - Grouped by relevance and importance
        - Include both hard and soft skills
        - Use exact industry keywords
        - Remove outdated or basic skills
        - Prioritize high-demand skills
        
        Original skills: "${content}"
        
        Rewrite this skills section to be more comprehensive and ATS-friendly. Focus on high-value, in-demand skills relevant to the profession.`;
        break;

      case 'title':
        systemPrompt = 'You are an expert resume writer specializing in professional titles and headlines.';
        enhancementFocus = `
        Enhance this professional title to be:
        - ATS-friendly and searchable
        - Industry-standard terminology
        - Clear and specific
        - Professional and impactful
        - Keyword-optimized
        
        Original title: "${content}"
        
        Rewrite this professional title to be more compelling and ATS-optimized while remaining accurate and professional.`;
        break;

      case 'achievements':
        systemPrompt = 'You are an expert resume writer specializing in ATS-optimized achievements and accomplishments.';
        enhancementFocus = `
        Enhance these achievements to be:
        - Quantified with specific metrics and numbers
        - Action-oriented with power verbs
        - Results-focused and impactful
        - ATS-friendly with relevant keywords
        - Concise but comprehensive
        - Credible and specific
        
        Original achievements: "${content}"
        
        Rewrite these achievements to be more compelling with specific metrics and strong action verbs. Focus on measurable impact and results.`;
        break;

      default:
        systemPrompt = 'You are an expert resume writer specializing in ATS-optimized content.';
        enhancementFocus = `
        Enhance this resume content to be:
        - ATS-friendly and keyword-optimized
        - Professional and polished
        - Clear and concise
        - Action-oriented when applicable
        - Results-focused
        
        Original content: "${content}"
        
        Rewrite this content to be more professional and ATS-optimized while maintaining accuracy.`;
    }

    // Add context if provided
    if (context) {
      enhancementFocus += `\n\nContext: The candidate works in ${context.industry || 'their field'} and is targeting ${context.targetRole || 'similar'} positions.`;
    }

    const messages = [
      { 
        role: 'system', 
        content: systemPrompt 
      },
      { 
        role: 'user', 
        content: enhancementFocus 
      }
    ];

    console.log('🚀 Calling OpenAI API for field enhancement...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI API Response received');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI API');
    }

    const enhancedContent = data.choices[0].message.content.trim();

    // Remove common AI introduction phrases and return only the enhanced content
    let cleanedContent = enhancedContent;
    
    // Remove common AI prefixes and explanatory text
    const prefixesToRemove = [
      /^Certainly!?\s*/i,
      /^Here's an?\s+/i,
      /^Here is an?\s+/i,
      /^I'll\s+/i,
      /^I will\s+/i,
      /^Let me\s+/i,
      /^.*enhanced.*rewrite.*:/i,
      /^.*ATS-optimized.*:/i,
      /^.*ATS-friendly.*:/i,
      /^.*professional.*version.*:/i,
      /^.*improved.*version.*:/i,
      /^.*revised.*:/i,
      /^.*keyword-optimized.*:/i,
      /^.*optimized.*:/i,
      /^.*rewritten.*:/i,
      /^.*enhanced.*:/i,
      /^.*improved.*:/i,
      /^.*better.*:/i,
      /^.*updated.*:/i,
      /^.*refined.*:/i,
      /^---\s*/,
      /^\*\*.*\*\*\s*/,
      /^#{1,6}\s+.*\n/m,
      // Specific pattern the user mentioned
      /^.*revised.*ATS-friendly.*keyword-optimized.*:/i,
      // More specific patterns
      /^.*professional title.*:/i,
      /^.*summary.*:/i,
      /^.*description.*:/i,
      /^.*skills.*:/i,
      /^.*achievements.*:/i,
      // Remove any pattern ending with colon after descriptive text
      /^[^:]*(?:enhanced|optimized|improved|revised|better|updated|refined|professional|ATS)[^:]*:\s*/i
    ];

    // Clean the content by removing prefixes
    for (const prefix of prefixesToRemove) {
      cleanedContent = cleanedContent.replace(prefix, '');
    }

    // Remove trailing dashes or separators and explanatory suffixes
    cleanedContent = cleanedContent.replace(/^---+\s*/, '').replace(/\s*---+$/, '');
    
    // Remove any remaining explanatory phrases at the end
    const suffixesToRemove = [
      /\s*\(.*ATS.*\)$/i,
      /\s*\(.*optimized.*\)$/i,
      /\s*\(.*enhanced.*\)$/i,
      /\s*-\s*.*optimized.*/i,
      /\s*-\s*.*ATS.*/i
    ];

    for (const suffix of suffixesToRemove) {
      cleanedContent = cleanedContent.replace(suffix, '');
    }
    
    // Clean up extra whitespace and newlines at the beginning and end
    cleanedContent = cleanedContent.replace(/^\s*\n+/, '').replace(/\n+\s*$/, '').trim();

    console.log('✅ Field enhancement completed successfully');

    return new Response(JSON.stringify({ 
      enhancedContent: cleanedContent,
      originalContent: content,
      fieldType 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in enhance-field function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      details: 'Failed to enhance field content' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});