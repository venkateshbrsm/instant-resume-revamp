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

    let enhancedContent = data.choices[0].message.content.trim();

    // Clean up the response to remove AI explanatory text and formatting
    // Remove markdown formatting and separators
    enhancedContent = enhancedContent.replace(/\*\*(.*?)\*\*/g, '$1');
    enhancedContent = enhancedContent.replace(/\*(.*?)\*/g, '$1');
    enhancedContent = enhancedContent.replace(/---/g, '');
    
    // Remove introductory phrases at the beginning
    const introPatterns = [
      /^Absolutely[!]?\s*Here.*?:/i,
      /^Certainly[!]?\s*Here is.*?:/i,
      /^Here is.*?:/i,
      /^Here's.*?:/i,
      /^I've enhanced.*?:/i,
      /^The enhanced.*?:/i,
      /^This is.*?:/i,
      /^Below is.*?:/i,
      /^.*?enhanced.*?version.*?:/i,
      /^.*?ATS-optimized.*?:/i,
      /^.*?rewrite.*?:/i,
      /^Perfect[!]?\s*Here.*?:/i,
      /^Great[!]?\s*Here.*?:/i,
      /^Excellent[!]?\s*Here.*?:/i
    ];
    
    for (const pattern of introPatterns) {
      enhancedContent = enhancedContent.replace(pattern, '').trim();
    }
    
    // Remove concluding phrases and everything after them
    const cleanupPatterns = [
      /Let me know if.*/i,
      /Feel free to.*/i,
      /Please let me know.*/i,
      /If you need.*/i,
      /This version.*/i,
      /The enhanced.*/i,
      /I've enhanced.*/i,
      /Here's the enhanced.*/i,
      /This rewrite.*/i,
      /This improved.*/i,
      /The rewritten.*/i,
      /This professional.*/i,
      /This description.*/i,
      /This skills section.*/i,
      /This title.*/i,
      /These achievements.*/i,
      /This content.*/i,
      /Note:.*/i,
      /Key improvements:.*/i,
      /Changes made:.*/i,
      /Enhancement details:.*/i,
      /Would you like.*/i,
      /Do you need.*/i
    ];
    
    for (const pattern of cleanupPatterns) {
      enhancedContent = enhancedContent.replace(pattern, '').trim();
    }
    
    // Remove extra whitespace and clean up
    enhancedContent = enhancedContent.replace(/\n\s*\n/g, '\n').trim();
    
    console.log('✅ Field enhancement completed successfully');

    return new Response(JSON.stringify({ 
      enhancedContent,
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