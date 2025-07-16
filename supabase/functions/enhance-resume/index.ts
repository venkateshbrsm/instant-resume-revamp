import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "https://esm.sh/docx@8.5.0";

// Theme color mapping - matches frontend exactly
const themeColors = {
  navy: { primary: '#1e3a8a', secondary: '#1e40af', accent: '#3b82f6' },
  charcoal: { primary: '#374151', secondary: '#1f2937', accent: '#6b7280' },
  burgundy: { primary: '#7c2d12', secondary: '#991b1b', accent: '#dc2626' },
  forest: { primary: '#166534', secondary: '#15803d', accent: '#22c55e' },
  bronze: { primary: '#a16207', secondary: '#ca8a04', accent: '#eab308' },
  slate: { primary: '#475569', secondary: '#334155', accent: '#64748b' }
};

function getThemeColors(themeId: string) {
  const colors = themeColors[themeId as keyof typeof themeColors] || themeColors.navy;
  // Convert hex colors to RGB values for DOCX (remove # and convert)
  return {
    primary: colors.primary.replace('#', ''),
    secondary: colors.secondary.replace('#', ''),
    accent: colors.accent.replace('#', '')
  };
}

async function generateResumeDocx(resumeData: any, themeId: string = 'navy'): Promise<Uint8Array> {
  const colors = getThemeColors(themeId);
  const children = [];

  // Header section
  children.push(
    new Paragraph({
      children: [new TextRun({ text: resumeData.name || 'Your Name', size: 32, bold: true })],
      heading: HeadingLevel.TITLE,
      alignment: 'center',
    }),
    new Paragraph({
      children: [new TextRun({ text: resumeData.title || 'Professional Title', size: 24, color: colors.primary })],
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
        children: [new TextRun({ text: "PROFESSIONAL SUMMARY", size: 24, bold: true, color: colors.primary })],
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
        children: [new TextRun({ text: "PROFESSIONAL EXPERIENCE", size: 24, bold: true, color: colors.primary })],
        heading: HeadingLevel.HEADING_1,
      })
    );

    resumeData.experience.forEach((exp: any) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: exp.title || 'Position Title', size: 22, bold: true, color: colors.accent })],
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
        children: [new TextRun({ text: "SKILLS", size: 24, bold: true, color: colors.primary })],
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
        children: [new TextRun({ text: "EDUCATION", size: 24, bold: true, color: colors.primary })],
        heading: HeadingLevel.HEADING_1,
      })
    );

    resumeData.education.forEach((edu: any) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: edu.degree || 'Degree', size: 22, bold: true, color: colors.accent })],
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

// Backend extraction methods helper function
async function tryBackendExtractionMethods(mammoth: any, arrayBuffer: ArrayBuffer) {
  const results = [];
  
  // Method 1: extractRawText
  try {
    console.log('Backend Method 1: extractRawText...');
    const result = await mammoth.extractRawText({ arrayBuffer });
    if (result.value && result.value.trim().length > 0) {
      console.log('Backend Method 1 success, length:', result.value.length);
      results.push({
        method: 'extractRawText',
        content: result.value.trim(),
        score: 0
      });
    }
  } catch (error) {
    console.warn('Backend Method 1 failed:', error.message);
  }
  
  // Method 2: convertToHtml then strip tags
  try {
    console.log('Backend Method 2: HTML conversion...');
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
    if (htmlResult.value) {
      const plainText = htmlResult.value
        .replace(/<[^>]*>/g, ' ')
        .replace(/&[^;]+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (plainText.length > 0) {
        console.log('Backend Method 2 success, length:', plainText.length);
        results.push({
          method: 'htmlConversion',
          content: plainText,
          score: 0
        });
      }
    }
  } catch (error) {
    console.warn('Backend Method 2 failed:', error.message);
  }
  
  return results;
}

// Select best content from backend extraction results
function selectBestBackendContent(results: any[], fileName: string): string {
  if (results.length === 0) {
    console.warn('No backend extraction methods succeeded');
    return '';
  }
  
  // Score each result
  for (const result of results) {
    let score = 0;
    const content = result.content;
    
    // Length score
    score += Math.min(content.length / 50, 100);
    
    // Content quality indicators
    if (content.includes('@')) score += 20;
    if (/\b\d{4}\b/.test(content)) score += 10;
    if (/\b(experience|skills?|education|resume|cv)\b/i.test(content)) score += 30;
    if (/\b(manager|engineer|developer|analyst|specialist|director)\b/i.test(content)) score += 20;
    if (/\b(university|college|bachelor|master|degree)\b/i.test(content)) score += 15;
    
    // Penalty for very short content
    if (content.length < 100) score -= 30;
    
    result.score = score;
    console.log(`Backend method ${result.method} scored: ${score}, length: ${content.length}`);
  }
  
  // Sort by score and return the best
  results.sort((a, b) => b.score - a.score);
  return results[0].content;
}

// Validate and prepare content for AI enhancement
function validateAndPrepareContent(content: string, fileName: string) {
  console.log('Validating content, length:', content.length);
  
  // Check minimum length
  if (!content || content.trim().length < 10) {
    return {
      isValid: false,
      reason: 'Content is too short or empty',
      content: content
    };
  }
  
  // Check if content is just the filename
  if (content.trim() === `DOCX file: ${fileName}` || content.trim() === fileName) {
    return {
      isValid: false,
      reason: 'Only filename detected, no resume content extracted',
      content: content
    };
  }
  
  // Check for meaningful content
  const words = content.toLowerCase().split(/\s+/);
  const meaningfulWords = words.filter(word => word.length > 2);
  
  if (meaningfulWords.length < 10) {
    return {
      isValid: false,
      reason: 'Too few meaningful words detected',
      content: content
    };
  }
  
  // Check for resume-like content
  const resumeIndicators = [
    'experience', 'education', 'skills', 'work', 'job', 'company', 
    'university', 'college', 'degree', 'project', 'achievement',
    'responsibility', 'manage', 'develop', 'design', 'implement',
    'email', 'phone', 'address', 'linkedin'
  ];
  
  const hasResumeContent = resumeIndicators.some(indicator => 
    content.toLowerCase().includes(indicator)
  );
  
  if (!hasResumeContent && content.length < 200) {
    return {
      isValid: false,
      reason: 'Content does not appear to contain resume information',
      content: content
    };
  }
  
  // Content is valid
  console.log('Content validation passed');
  return {
    isValid: true,
    reason: '',
    content: content.trim()
  };
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

    const { fileName, originalText, extractedText, filePath, userEmail, file, themeId } = await req.json();

    console.log('Enhancing resume for:', fileName);
    console.log('Original text length:', originalText?.length || 0);
    console.log('Extracted text length:', extractedText?.length || 0);

    // Use the actual extracted text from the resume
    let resumeContent = extractedText || originalText || '';
    
    console.log('Initial content assessment:', {
      extractedTextLength: extractedText?.length || 0,
      originalTextLength: originalText?.length || 0,
      hasFileData: !!file,
      fileName: fileName
    });
    
    // Enhanced re-extraction logic for insufficient content
    if ((!resumeContent || resumeContent.length < 100) && file && fileName.toLowerCase().endsWith('.docx')) {
      console.log('Content is insufficient, attempting advanced DOCX re-extraction...');
      
      try {
        // Convert base64 file data back to ArrayBuffer with validation
        const binaryString = atob(file);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const arrayBuffer = bytes.buffer;
        
        console.log('ArrayBuffer created for re-extraction, size:', arrayBuffer.byteLength);
        
        if (arrayBuffer.byteLength === 0) {
          throw new Error('ArrayBuffer is empty');
        }
        
        // Import mammoth with better error handling
        const mammothModule = await import('https://esm.sh/mammoth@1.4.21');
        const mammoth = mammothModule.default || mammothModule;
        
        // Try multiple extraction methods similar to frontend
        const extractionResults = await tryBackendExtractionMethods(mammoth, arrayBuffer);
        
        // Validate and select best result
        const bestContent = selectBestBackendContent(extractionResults, fileName);
        
        if (bestContent && bestContent.length > resumeContent.length) {
          resumeContent = bestContent;
          console.log('Successfully re-extracted content, length:', resumeContent.length);
          console.log('Re-extracted content preview (first 300 chars):', resumeContent.substring(0, 300));
        } else {
          console.warn('Re-extraction did not improve content quality');
        }
        
      } catch (extractError) {
        console.error('Backend DOCX re-extraction failed:', extractError);
        console.error('Error details:', {
          name: extractError.name,
          message: extractError.message,
          stack: extractError.stack
        });
      }
    }
    
    // Final content validation and preparation
    const processedContent = validateAndPrepareContent(resumeContent, fileName);
    
    if (!processedContent.isValid) {
      console.warn('Content validation failed, refusing to enhance with insufficient data');
      throw new Error(`Insufficient resume content for enhancement. ${processedContent.reason}. Please ensure your file contains readable text and try uploading again.`);
    }
    
    resumeContent = processedContent.content;
    
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

    // Generate DOCX for the enhanced resume with selected theme
    const selectedTheme = themeId || 'navy';
    const docxBuffer = await generateResumeDocx(parsedContent, selectedTheme);

    // Save enhanced content and DOCX file if filePath and userEmail are provided
    if (filePath && userEmail) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Validate DOCX buffer before upload
        if (!docxBuffer || docxBuffer.length === 0) {
          console.error('DOCX buffer is empty or null');
          throw new Error('Generated DOCX file is empty');
        }
        
        console.log('DOCX buffer size:', docxBuffer.length, 'bytes');
        
        // Create organized storage path with theme applied
        const userFolder = filePath.split('/')[0];
        const timestamp = Date.now();
        const enhancedFilePath = `enhanced-resumes/${userFolder}/${timestamp}/resume.docx`;
        
        console.log('Uploading enhanced DOCX blob to:', enhancedFilePath);
        
        // Upload the enhanced DOCX blob
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(enhancedFilePath, docxBuffer, {
            contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            upsert: true
          });

        if (uploadError) {
          console.error('Enhanced DOCX blob upload failed:', uploadError);
          throw uploadError;
        }

        console.log('Enhanced DOCX blob uploaded successfully:', enhancedFilePath);
        
        // Update payment record with enhanced content (backup) and blob path
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            enhanced_content: parsedContent,
            enhanced_file_path: enhancedFilePath,
            theme_id: selectedTheme,
            updated_at: new Date().toISOString()
          })
          .eq('file_path', filePath)
          .eq('email', userEmail);

        if (updateError) {
          console.error('Error updating payment with blob path:', updateError);
        } else {
          console.log('Payment record updated with enhanced blob path and theme');
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