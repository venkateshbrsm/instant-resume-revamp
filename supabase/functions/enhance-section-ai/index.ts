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
    const { section, content, sectionType } = await req.json();

    console.log('Enhancing section:', sectionType, 'with content:', content);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let prompt = '';
    
    switch (sectionType) {
      case 'summary':
        prompt = `Enhance this professional summary to be more compelling and ATS-friendly. Make it 2-3 sentences, highlight key strengths, and use action-oriented language:

Current summary: "${content}"

Provide only the enhanced summary text, no additional formatting or explanation.`;
        break;

      case 'experience':
        prompt = `Enhance these work experience bullet points to be more impactful, quantified, and ATS-optimized. Each bullet should start with a strong action verb and include specific achievements when possible:

Current bullet points:
${Array.isArray(content) ? content.join('\n') : content}

Rules:
- Start each bullet with a strong action verb
- Include numbers, percentages, or metrics where possible
- Focus on achievements and impact, not just responsibilities
- Make each bullet 1-2 lines maximum
- Use keywords relevant to the role

Provide only the enhanced bullet points, one per line, with no additional formatting.`;
        break;

      case 'skills':
        prompt = `Organize and enhance this skills list to be more comprehensive and ATS-friendly. Group related skills and suggest additional relevant skills:

Current skills: ${Array.isArray(content) ? content.join(', ') : content}

Rules:
- Group skills into logical categories (e.g., Programming Languages, Frameworks, Tools)
- Add relevant skills that complement the existing ones
- Remove duplicates and outdated technologies
- Prioritize in-demand skills
- Keep it concise but comprehensive

Provide only the enhanced skills as a comma-separated list, no categories or formatting.`;
        break;

      case 'education':
        prompt = `Enhance this education entry to highlight relevant achievements, coursework, or activities:

Current education: ${content}

Rules:
- Add relevant coursework if beneficial
- Include GPA if it's strong (3.5+)
- Mention relevant projects, honors, or activities
- Keep it concise and professional

Provide only the enhanced education details.`;
        break;

      default:
        throw new Error('Invalid section type');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional resume writer and career expert. Provide concise, impactful suggestions that will help candidates stand out to employers and pass ATS systems.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedContent = data.choices[0].message.content.trim();

    console.log('AI enhancement completed for section:', sectionType);

    return new Response(JSON.stringify({ 
      success: true, 
      enhancedContent,
      originalContent: content 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhance-section-ai function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});