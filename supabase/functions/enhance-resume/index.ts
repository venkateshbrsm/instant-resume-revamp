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

    const enhancementPrompt = `You are an expert resume writer and career coach. Analyze the following ACTUAL resume content and create a professional, ATS-optimized enhanced version.

IMPORTANT: Use ONLY the information provided in the original resume. Do NOT make up fake data, companies, or achievements. Extract and enhance the real information from the resume.

Original Resume Content:
${resumeContent}

Candidate Name from filename: ${candidateName}

Instructions:
- Extract ALL real information from the original resume (education, experience, skills, contact info, etc.)
- Use the actual companies, institutions, and positions mentioned in the original resume
- Enhance the language and formatting while keeping all factual information accurate
- If specific details are missing, use general but realistic placeholders based on the actual content
- Maintain the candidate's actual career progression and timeline
- Use the real skills and technologies mentioned in the original resume
- Keep the actual educational background and institutions if mentioned

Generate a complete professional resume with these sections based on the ACTUAL content:
1. Contact Information (extract from original or use realistic details)
2. Professional Summary (based on actual experience and skills)
3. Professional Experience (use ACTUAL companies and positions, enhance descriptions)
4. Skills (use ACTUAL skills mentioned, enhance presentation)
5. Education (use ACTUAL institutions and degrees mentioned)

Return ONLY a JSON object in this exact format:
{
  "name": "Actual name or ${candidateName}",
  "title": "Job title based on actual experience",
  "email": "professional.email@example.com",
  "phone": "+91 XXXXX XXXXX",
  "location": "City, India",
  "summary": "Professional summary based on actual experience and background",
  "experience": [
    {
      "title": "ACTUAL job title from resume",
      "company": "ACTUAL company name from resume",
      "duration": "ACTUAL dates or estimated based on resume",
      "achievements": [
        "Enhanced version of actual responsibilities/achievements",
        "Professional rewrite of actual work done",
        "Quantified achievements based on actual experience"
      ]
    }
  ],
  "skills": ["ACTUAL skills from resume", "Technologies mentioned", "Tools used"],
  "education": [
    {
      "degree": "ACTUAL degree mentioned in resume",
      "institution": "ACTUAL institution name from resume",
      "year": "ACTUAL year or estimated"
    }
  ]
}

CRITICAL: Base everything on the actual resume content provided. Do not invent companies, skills, or experiences not mentioned in the original resume.`;

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
            content: 'You are a professional resume enhancement expert. Always return valid JSON format for enhanced resume data.' 
          },
          { role: 'user', content: enhancementPrompt }
        ],
        temperature: 0.8,
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