import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "https://esm.sh/docx@8.5.0";

async function generateResumeDocx(resumeData: any): Promise<Uint8Array> {
  const children = [];

  // Header section
  children.push(
    new Paragraph({
      children: [new TextRun({ text: resumeData.name || 'Your Name', size: 32, bold: true })],
      heading: HeadingLevel.TITLE,
      alignment: 'center',
    }),
    new Paragraph({
      children: [new TextRun({ text: resumeData.title || 'Professional Title', size: 24 })],
      alignment: 'center',
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${resumeData.email || ''} | ${resumeData.phone || ''} | ${resumeData.location || ''}`, size: 20 })
      ],
      alignment: 'center',
    }),
    new Paragraph({ text: "" }) // Empty line
  );

  // Professional Summary
  if (resumeData.summary) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "PROFESSIONAL SUMMARY", size: 24, bold: true })],
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        children: [new TextRun({ text: resumeData.summary, size: 20 })],
      }),
      new Paragraph({ text: "" })
    );
  }

  // Professional Experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "PROFESSIONAL EXPERIENCE", size: 24, bold: true })],
        heading: HeadingLevel.HEADING_1,
      })
    );

    resumeData.experience.forEach((exp: any) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: exp.title || 'Position Title', size: 22, bold: true })],
        }),
        new Paragraph({
          children: [new TextRun({ text: `${exp.company || 'Company Name'} | ${exp.duration || 'Duration'}`, size: 20 })],
        })
      );

      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach((achievement: string) => {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `• ${achievement}`, size: 20 })],
            })
          );
        });
      }

      children.push(new Paragraph({ text: "" }));
    });
  }

  // Skills
  if (resumeData.skills && resumeData.skills.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "SKILLS", size: 24, bold: true })],
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        children: [new TextRun({ text: resumeData.skills.join(', '), size: 20 })],
      }),
      new Paragraph({ text: "" })
    );
  }

  // Education
  if (resumeData.education && resumeData.education.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "EDUCATION", size: 24, bold: true })],
        heading: HeadingLevel.HEADING_1,
      })
    );

    resumeData.education.forEach((edu: any) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: edu.degree || 'Degree', size: 22, bold: true })],
        }),
        new Paragraph({
          children: [new TextRun({ text: `${edu.institution || 'Institution'} | ${edu.year || 'Year'}`, size: 20 })],
        }),
        new Paragraph({ text: "" })
      );
    });
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: children,
    }],
  });

  return await Packer.toBuffer(doc);
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

    // Generate DOCX for the enhanced resume
    const docxBuffer = await generateResumeDocx(parsedContent);

    // Save enhanced content and DOCX file if filePath and userEmail are provided
    if (filePath && userEmail) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Save the enhanced DOCX file to storage
        const enhancedFileName = `enhanced_${fileName.replace(/\.[^/.]+$/, '.docx')}`;
        const enhancedFilePath = `${filePath.split('/')[0]}/${enhancedFileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(enhancedFilePath, docxBuffer, {
            contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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