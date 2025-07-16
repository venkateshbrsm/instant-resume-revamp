import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

function generateResumeHTML(resumeData: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resumeData.name} - Resume</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .resume-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .name {
            font-size: 2.5rem;
            font-weight: bold;
            margin: 0;
            color: #1e40af;
        }
        .title {
            font-size: 1.2rem;
            color: #6b7280;
            margin: 5px 0;
        }
        .contact-info {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 10px;
            flex-wrap: wrap;
        }
        .contact-item {
            color: #4b5563;
            font-size: 0.9rem;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 1.3rem;
            font-weight: bold;
            color: #1e40af;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .summary {
            font-size: 1rem;
            line-height: 1.7;
            color: #374151;
        }
        .experience-item, .education-item {
            margin-bottom: 20px;
            padding: 15px;
            background: #f8fafc;
            border-left: 4px solid #2563eb;
            border-radius: 5px;
        }
        .job-title {
            font-weight: bold;
            font-size: 1.1rem;
            color: #1f2937;
        }
        .company {
            color: #2563eb;
            font-weight: 600;
        }
        .duration {
            color: #6b7280;
            font-style: italic;
            margin-bottom: 10px;
        }
        .achievements {
            list-style: none;
            padding: 0;
        }
        .achievements li {
            padding: 3px 0;
            position: relative;
            padding-left: 20px;
        }
        .achievements li:before {
            content: "▸";
            color: #2563eb;
            position: absolute;
            left: 0;
        }
        .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .skill-tag {
            background: #2563eb;
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        @media print {
            body { background: white; }
            .resume-container { box-shadow: none; }
        }
        @media (max-width: 600px) {
            .contact-info { flex-direction: column; gap: 5px; }
            .skills-container { justify-content: center; }
        }
    </style>
</head>
<body>
    <div class="resume-container">
        <header class="header">
            <h1 class="name">${resumeData.name}</h1>
            <p class="title">${resumeData.title}</p>
            <div class="contact-info">
                <span class="contact-item">📧 ${resumeData.email}</span>
                <span class="contact-item">📱 ${resumeData.phone}</span>
                <span class="contact-item">📍 ${resumeData.location}</span>
            </div>
        </header>

        <section class="section">
            <h2 class="section-title">Professional Summary</h2>
            <p class="summary">${resumeData.summary}</p>
        </section>

        <section class="section">
            <h2 class="section-title">Professional Experience</h2>
            ${resumeData.experience.map((exp: any) => `
                <div class="experience-item">
                    <div class="job-title">${exp.title}</div>
                    <div class="company">${exp.company}</div>
                    <div class="duration">${exp.duration}</div>
                    <ul class="achievements">
                        ${exp.achievements.map((achievement: string) => `<li>${achievement}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </section>

        <section class="section">
            <h2 class="section-title">Skills</h2>
            <div class="skills-container">
                ${resumeData.skills.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">Education</h2>
            ${resumeData.education.map((edu: any) => `
                <div class="education-item">
                    <div class="job-title">${edu.degree}</div>
                    <div class="company">${edu.institution}</div>
                    <div class="duration">${edu.year}</div>
                </div>
            `).join('')}
        </section>
    </div>
</body>
</html>`;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

    const { fileName, originalText, extractedText, filePath, userEmail, file } = await req.json();

    console.log('Enhancing resume for:', fileName);
    console.log('Original text length:', originalText?.length || 0);
    console.log('Extracted text length:', extractedText?.length || 0);

    // Use the actual extracted text from the resume
    let resumeContent = extractedText || originalText || '';
    
    // If the extracted text is insufficient and we have file data, try to re-extract
    if ((!resumeContent || resumeContent.length < 50) && file && fileName.toLowerCase().endsWith('.docx')) {
      console.log('Extracted text is insufficient, attempting DOCX re-extraction...');
      try {
        // Convert base64 file data back to ArrayBuffer
        const binaryString = atob(file);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const arrayBuffer = bytes.buffer;
        
        // Use different mammoth import approach
        const mammothModule = await import('https://esm.sh/mammoth@1.4.21');
        const mammoth = mammothModule.default || mammothModule;
        
        // Try extractRawText first
        const result = await mammoth.extractRawText({ arrayBuffer });
        console.log('DOCX re-extraction successful, text length:', result.value?.length || 0);
        
        if (result.value && result.value.trim().length > 10) {
          resumeContent = result.value;
          console.log('Using re-extracted DOCX content (first 200 chars):', resumeContent.substring(0, 200));
        } else {
          console.warn('Re-extraction yielded minimal text, trying HTML conversion...');
          const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
          const plainText = htmlResult.value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          if (plainText.length > 10) {
            resumeContent = plainText;
            console.log('Using HTML conversion fallback (first 200 chars):', resumeContent.substring(0, 200));
          }
        }
      } catch (extractError) {
        console.error('Failed to re-extract DOCX content:', extractError);
      }
    }
    
    if (!resumeContent || resumeContent.length < 10) {
      resumeContent = `DOCX file: ${fileName}`;
      console.warn('Using minimal fallback content for:', fileName);
    }
    
    console.log('Final resume content length:', resumeContent.length);
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

    // Generate HTML for the enhanced resume
    const htmlContent = generateResumeHTML(parsedContent);

    // Save enhanced content and HTML file if filePath and userEmail are provided
    if (filePath && userEmail) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Save the enhanced HTML file to storage
        const enhancedFileName = `enhanced_${fileName.replace(/\.[^/.]+$/, '.html')}`;
        const enhancedFilePath = `${filePath.split('/')[0]}/${enhancedFileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(enhancedFilePath, new Blob([htmlContent], { type: 'text/html' }), {
            upsert: true
          });

        if (uploadError) {
          console.error('Error uploading enhanced file:', uploadError);
        } else {
          console.log('Enhanced file uploaded successfully:', enhancedFilePath);
        }
        
        // Update payment record with enhanced content and file path
        const { error: updateError } = await supabase
          .from('payments')
          .update({ 
            enhanced_content: parsedContent,
            enhanced_file_path: enhancedFilePath
          })
          .eq('file_path', filePath)
          .eq('email', userEmail);

        if (updateError) {
          console.error('Error saving enhanced content:', updateError);
        } else {
          console.log('Enhanced content saved to database successfully');
        }
      } catch (saveError) {
        console.error('Failed to save enhanced content:', saveError);
      }
    }

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