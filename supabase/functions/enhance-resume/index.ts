import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { fileName, originalText, extractedText } = await req.json();

    console.log('Enhancing resume for:', fileName);
    console.log('Original text length:', originalText?.length || 0);
    console.log('Extracted text length:', extractedText?.length || 0);

    // Use the actual extracted text from the resume
    const resumeContent = extractedText || originalText || 'No content available';
    console.log('Using resume content (first 500 chars):', resumeContent.substring(0, 500));

    // Extract name from filename for better personalization
    const nameMatch = fileName.match(/RESUME[-_\s]*(.+)/i);
    const candidateName = nameMatch ? nameMatch[1].replace(/[-_]/g, ' ').trim() : 'Professional Candidate';

    const enhancementPrompt = `You are an expert resume analyzer. You MUST extract and enhance ONLY the actual information from the provided resume. DO NOT CREATE or INVENT any data.

ACTUAL RESUME CONTENT TO ANALYZE:
${resumeContent}

CRITICAL INSTRUCTIONS:
1. READ the resume content above carefully
2. Extract ONLY the real information present in the resume
3. DO NOT invent companies, achievements, or metrics not mentioned
4. DO NOT create fake numbers, percentages, or project counts
5. If a detail is missing, leave it out or use a generic placeholder
6. Use the ACTUAL name, education, experience, and skills from the resume

Based STRICTLY on the actual resume content above, create a JSON response with:
- name: Extract from the resume or use "${candidateName}"
- title: Based on actual job titles mentioned in resume
- contact: Use realistic placeholders (email/phone/location)
- summary: Write based on ACTUAL experience mentioned in resume
- experience: Use ONLY actual companies and roles from the resume
- skills: Use ONLY skills actually mentioned in the resume  
- education: Use ONLY actual institutions and degrees from the resume

If the resume mentions specific projects, companies, or achievements, use those. If not, write generic descriptions without fake metrics.

DO NOT INCLUDE:
- Fake project counts (like "50+ projects")
- Made-up percentages or metrics
- Fictional companies or achievements
- Revenue numbers not in original resume
- Team size numbers not mentioned

Return ONLY this JSON format:
{
  "name": "actual name from resume",
  "title": "actual or inferred job title",
  "email": "professional.email@example.com",
  "phone": "+91 XXXXX XXXXX", 
  "location": "City, India",
  "summary": "Summary based on actual experience without fake metrics",
  "experience": [
    {
      "title": "actual job title from resume",
      "company": "actual company name from resume", 
      "duration": "actual dates from resume",
      "achievements": [
        "actual responsibility from resume",
        "actual achievement from resume",
        "generic but realistic task description"
      ]
    }
  ],
  "skills": ["actual skills from resume"],
  "education": [
    {
      "degree": "actual degree from resume",
      "institution": "actual institution from resume", 
      "year": "actual year from resume"
    }
  ]
}

REMEMBER: Use ONLY information from the actual resume provided. Do not invent data.`;

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
            content: 'You are a professional resume enhancement expert. You MUST only use actual information from the provided resume. DO NOT invent or create fake data, metrics, achievements, or companies. Always return valid JSON format.' 
          },
          { role: 'user', content: enhancementPrompt }
        ],
        temperature: 0.3, // Lower temperature for more consistent, factual output
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedContent = data.choices[0].message.content;

      console.log('Raw AI response:', enhancedContent);
      console.log('Resume content used for enhancement (first 500 chars):', resumeContent.substring(0, 500));
      
      if (!enhancedContent || enhancedContent.trim() === '') {
        throw new Error('Empty response from OpenAI');
      }

    // Parse the JSON response
    let parsedContent;
    try {
      // Clean the response to extract JSON
      const jsonMatch = enhancedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Failed AI response:', enhancedContent);
      throw new Error('Failed to parse AI response - invalid JSON format');
    }

    console.log('Enhanced resume created successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        enhancedResume: parsedContent,
        originalFileName: fileName
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in enhance-resume function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});