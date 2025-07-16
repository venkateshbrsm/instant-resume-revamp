import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from "https://esm.sh/docx@8.5.0";

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
  
  // Enhanced helper function to clean text and handle special characters
  const cleanText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/[""]/g, '"') // Smart quotes to regular quotes
      .replace(/['']/g, "'") // Smart apostrophes
      .replace(/[—–]/g, '-') // Em dash and en dash to regular dash
      .replace(/[…]/g, '...') // Ellipsis
      .replace(/[•]/g, '*') // Bullet points
      .replace(/[\u00A0]/g, ' ') // Non-breaking space
      .replace(/[\u2000-\u206F]/g, ' ') // Various Unicode spaces
      .normalize('NFKD') // Normalize Unicode
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\w\s.,;:()?!@#$%&*+=\-'"/\\]/g, ' ') // Replace remaining special chars with space
      .replace(/\s+/g, ' ') // Normalize multiple spaces
      .trim();
  };

  const doc = new Document({
    sections: [{
      children: [
        // Header with name and title - enhanced with better spacing
        new Paragraph({
          children: [
            new TextRun({
              text: cleanText(resumeData.name || "Professional Resume"),
              bold: true,
              size: 36,
              color: colors.primary,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 200,
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: cleanText(resumeData.title || "Professional"),
              size: 26,
              color: colors.secondary,
              bold: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 300,
          },
        }),
        
        // Contact Information Table - styled for better presentation
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `📧 ${resumeData.email || ""}`,
                          size: 18,
                          color: colors.accent,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  width: {
                    size: 33,
                    type: WidthType.PERCENTAGE,
                  },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `📞 ${resumeData.phone || ""}`,
                          size: 18,
                          color: colors.accent,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  width: {
                    size: 33,
                    type: WidthType.PERCENTAGE,
                  },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `📍 ${resumeData.location || ""}`,
                          size: 18,
                          color: colors.accent,
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  width: {
                    size: 34,
                    type: WidthType.PERCENTAGE,
                  },
                }),
              ],
            }),
          ],
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
        }),
        
        // Separator line
        new Paragraph({
          children: [
            new TextRun({
              text: "─".repeat(60),
              size: 16,
              color: colors.primary,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 300,
            after: 300,
          },
        }),
        
        // Professional Summary - enhanced with better formatting
        new Paragraph({
          children: [
            new TextRun({
              text: "👥 PROFESSIONAL SUMMARY",
              bold: true,
              size: 24,
              color: colors.primary,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: {
            after: 200,
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: cleanText(resumeData.summary || "Professional with extensive experience in their field."),
              size: 20,
            }),
          ],
          spacing: {
            after: 400,
          },
        }),
        
        // Professional Experience - enhanced with better hierarchy
        new Paragraph({
          children: [
            new TextRun({
              text: "📅 PROFESSIONAL EXPERIENCE",
              bold: true,
              size: 24,
              color: colors.primary,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: {
            after: 200,
          },
        }),
        
        // Experience entries with improved formatting
        ...(resumeData.experience || []).flatMap((exp: any, index: number) => [
          new Paragraph({
            children: [
              new TextRun({
                text: cleanText(exp.title || "Position"),
                bold: true,
                size: 22,
                color: colors.secondary,
              }),
            ],
            spacing: {
              after: 100,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: cleanText(`${exp.company || "Company"} | ${exp.duration || "Duration"}`),
                size: 18,
                italics: true,
                color: colors.accent,
              }),
            ],
            spacing: {
              after: 150,
            },
          }),
          ...(exp.achievements || []).map((achievement: string) => 
            new Paragraph({
              children: [
                new TextRun({
                  text: cleanText(`• ${achievement}`),
                  size: 18,
                }),
              ],
              spacing: {
                after: 100,
              },
            })
          ),
          // Separator between experiences
          ...(index < (resumeData.experience || []).length - 1 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "─".repeat(40),
                  size: 12,
                  color: colors.accent,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                before: 200,
                after: 200,
              },
            }),
          ] : [
            new Paragraph({
              children: [new TextRun({ text: "", size: 12 })],
              spacing: {
                after: 300,
              },
            }),
          ]),
        ]),
        
        // Skills Section - enhanced with better presentation
        ...(resumeData.skills && resumeData.skills.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: "🛠️ SKILLS",
                bold: true,
                size: 24,
                color: colors.primary,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: {
              after: 200,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: cleanText(resumeData.skills.join(" • ")),
                size: 20,
              }),
            ],
            spacing: {
              after: 400,
            },
          }),
        ] : []),
        
        // Education Section - enhanced with better structure
        ...(resumeData.education && resumeData.education.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: "🎓 EDUCATION",
                bold: true,
                size: 24,
                color: colors.primary,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: {
              after: 200,
            },
          }),
          ...resumeData.education.flatMap((edu: any, index: number) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: cleanText(edu.degree || "Degree"),
                  bold: true,
                  size: 22,
                  color: colors.secondary,
                }),
              ],
              spacing: {
                after: 100,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: cleanText(`${edu.institution || "Institution"} | ${edu.year || "Year"}`),
                  size: 18,
                  color: colors.accent,
                }),
              ],
              spacing: {
                after: index < (resumeData.education || []).length - 1 ? 300 : 200,
              },
            }),
          ]),
        ] : []),
        
        // Footer with theme indication
        new Paragraph({
          children: [
            new TextRun({
              text: "─".repeat(60),
              size: 16,
              color: colors.primary,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 400,
            after: 200,
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Enhanced by AI • Professional Resume",
              size: 14,
              color: colors.accent,
              italics: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
      ],
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

// Multiple PDF extraction methods with timeouts
async function tryMultiplePDFExtractionMethods(fileBytes: Uint8Array, fileName: string, supabaseUrl: string, supabaseServiceKey: string) {
  const extractionMethods = [];
  
  console.log('=== STARTING MULTIPLE PDF EXTRACTION METHODS ===');
  
  // Method 1: Adobe PDF Services (current primary method)
  try {
    console.log('PDF Method 1: Adobe PDF Services...');
    const startTime = Date.now();
    
    const formData = new FormData();
    const blob = new Blob([fileBytes], { type: 'application/pdf' });
    formData.append('file', blob, fileName);
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Adobe extraction timeout')), 15000)
    );
    
    const extractPromise = fetch(`${supabaseUrl}/functions/v1/extract-pdf-ilovepdf`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: formData
    });
    
    const response = await Promise.race([extractPromise, timeoutPromise]);
    const duration = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.extractedText) {
        console.log(`PDF Method 1 success in ${duration}ms, length:`, data.extractedText.length);
        extractionMethods.push({
          method: 'Adobe PDF Services',
          content: data.extractedText.trim(),
          duration,
          score: 0
        });
      }
    }
  } catch (error) {
    console.warn('PDF Method 1 failed:', error.message);
  }
  
  // Method 2: Python OCR Service (fallback)
  try {
    console.log('PDF Method 2: Python OCR Service...');
    const startTime = Date.now();
    
    const formData = new FormData();
    const blob = new Blob([fileBytes], { type: 'application/pdf' });
    formData.append('file', blob, fileName);
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('OCR extraction timeout')), 20000)
    );
    
    const extractPromise = fetch(`${supabaseUrl}/functions/v1/extract-pdf-text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: formData
    });
    
    const response = await Promise.race([extractPromise, timeoutPromise]);
    const duration = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.text) {
        console.log(`PDF Method 2 success in ${duration}ms, length:`, data.text.length);
        extractionMethods.push({
          method: 'Python OCR Service',
          content: data.text.trim(),
          duration,
          score: 0
        });
      }
    }
  } catch (error) {
    console.warn('PDF Method 2 failed:', error.message);
  }
  
  return extractionMethods;
}

// Enhanced content validation with PDF-specific handling
function validateAndPrepareContent(content: string, fileName: string) {
  console.log('Validating content, length:', content.length);
  
  const isPDF = fileName.toLowerCase().endsWith('.pdf');
  const isDocx = fileName.toLowerCase().endsWith('.docx');
  
  // Create fallback content if needed
  const createFallbackContent = () => {
    const nameFromFile = fileName.replace(/\.(pdf|docx)$/i, '').replace(/[-_]/g, ' ');
    return `Name: ${nameFromFile}
Professional Summary: Experienced professional with expertise in their field.
Skills: Communication, Problem-solving, Team collaboration
Education: Bachelor's Degree
Experience: Professional experience in relevant industry`;
  };
  
  // Check minimum length with file-type specific requirements
  if (!content || content.trim().length < 5) {
    if (isPDF) {
      console.log('PDF content too short, creating fallback content');
      return {
        isValid: true,
        reason: 'Using fallback content for PDF',
        content: createFallbackContent(),
        usedFallback: true
      };
    }
    return {
      isValid: false,
      reason: 'Content is too short or empty',
      content: content
    };
  }
  
  // Check if content is just the filename
  if (content.trim() === `DOCX file: ${fileName}` || content.trim() === fileName) {
    console.log('Only filename detected, creating fallback content');
    return {
      isValid: true,
      reason: 'Using fallback content for filename-only extraction',
      content: createFallbackContent(),
      usedFallback: true
    };
  }
  
  // Check for meaningful content
  const words = content.toLowerCase().split(/\s+/);
  const meaningfulWords = words.filter(word => word.length > 2);
  
  // Significantly more relaxed validation for PDFs
  const minWords = isPDF ? 3 : (isDocx ? 5 : 10);
  
  if (meaningfulWords.length < minWords) {
    if (isPDF) {
      console.log(`PDF has only ${meaningfulWords.length} meaningful words, creating enhanced fallback`);
      // For PDFs, try to extract any useful info and supplement with fallback
      const nameMatch = content.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
      const emailMatch = content.match(/[\w.-]+@[\w.-]+\.\w+/);
      
      let enhancedContent = createFallbackContent();
      if (nameMatch) {
        enhancedContent = enhancedContent.replace(/Name: [^\\n]+/, `Name: ${nameMatch[1]}`);
      }
      if (emailMatch) {
        enhancedContent += `\nEmail: ${emailMatch[0]}`;
      }
      if (content.length > 20) {
        enhancedContent += `\nExtracted text: ${content.substring(0, 200)}`;
      }
      
      return {
        isValid: true,
        reason: 'Using enhanced fallback content for PDF',
        content: enhancedContent,
        usedFallback: true
      };
    }
    
    return {
      isValid: false,
      reason: `Too few meaningful words detected (found ${meaningfulWords.length}, minimum ${minWords})`,
      content: content
    };
  }
  
  // Check for resume-like content with more indicators
  const resumeIndicators = [
    'experience', 'education', 'skills', 'work', 'job', 'company', 
    'university', 'college', 'degree', 'project', 'achievement',
    'responsibility', 'manage', 'develop', 'design', 'implement',
    'email', 'phone', 'address', 'linkedin', 'name', 'professional',
    'summary', 'objective', 'contact', 'profile', 'qualification',
    'bachelor', 'master', 'graduate', 'certificate', 'diploma',
    'manager', 'engineer', 'developer', 'analyst', 'coordinator',
    'specialist', 'executive', 'director', 'assistant', 'lead'
  ];
  
  const hasResumeContent = resumeIndicators.some(indicator => 
    content.toLowerCase().includes(indicator)
  );
  
  // Much more relaxed content check for PDFs
  const minLength = isPDF ? 25 : (isDocx ? 100 : 200);
  
  if (!hasResumeContent && content.length < minLength) {
    if (isPDF) {
      console.log('PDF lacks resume indicators but has some content, proceeding with enhancement');
      return {
        isValid: true,
        reason: 'PDF content accepted despite limited indicators',
        content: content.trim()
      };
    }
    
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
    
    // Enhanced re-extraction logic for insufficient content with stricter thresholds
    if ((!resumeContent || resumeContent.length < 200)) {
      console.log(`Content insufficient (${resumeContent.length} chars), attempting re-extraction...`);
      
      if (file && fileName.toLowerCase().endsWith('.docx')) {
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
            console.log('Successfully re-extracted DOCX content, length:', resumeContent.length);
            console.log('Re-extracted content preview (first 300 chars):', resumeContent.substring(0, 300));
          } else {
            console.warn('DOCX re-extraction did not improve content quality');
          }
          
        } catch (extractError) {
          console.error('Backend DOCX re-extraction failed:', extractError);
          console.error('Error details:', {
            name: extractError.name,
            message: extractError.message,
            stack: extractError.stack
          });
        }
      } else if (file && fileName.toLowerCase().endsWith('.pdf')) {
        console.log('PDF content is insufficient, attempting multiple extraction methods...');
        
        try {
          // Convert base64 file data back to Uint8Array
          const binaryString = atob(file);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          console.log('PDF bytes prepared, attempting multiple extraction methods...');
          
          // Try multiple PDF extraction methods with timeouts
          const pdfExtractionResults = await tryMultiplePDFExtractionMethods(bytes, fileName, supabaseUrl, supabaseServiceKey);
          
          if (pdfExtractionResults.length > 0) {
            // Score each result similar to DOCX methods
            for (const result of pdfExtractionResults) {
              let score = 0;
              const content = result.content;
              
              // Length score (favor longer content)
              score += Math.min(content.length / 20, 100);
              
              // Content quality indicators
              if (content.includes('@')) score += 20;
              if (/\b\d{4}\b/.test(content)) score += 10;
              if (/\b(experience|skills?|education|resume|cv)\b/i.test(content)) score += 30;
              if (/\b(manager|engineer|developer|analyst|specialist|director)\b/i.test(content)) score += 20;
              if (/\b(university|college|bachelor|master|degree)\b/i.test(content)) score += 15;
              
              // Speed bonus (faster methods get slight preference)
              if (result.duration < 10000) score += 5;
              
              result.score = score;
              console.log(`PDF method ${result.method} scored: ${score}, length: ${content.length}, duration: ${result.duration}ms`);
            }
            
            // Sort by score and select best
            pdfExtractionResults.sort((a, b) => b.score - a.score);
            const bestPDFContent = pdfExtractionResults[0];
            
            if (bestPDFContent.content.length > resumeContent.length) {
              resumeContent = bestPDFContent.content;
              console.log(`Successfully re-extracted PDF content using ${bestPDFContent.method}, length:`, resumeContent.length);
              console.log('Re-extracted PDF content preview (first 300 chars):', resumeContent.substring(0, 300));
            } else {
              console.warn('PDF re-extraction did not improve content quality');
            }
          } else {
            console.warn('All PDF extraction methods failed');
          }
          
        } catch (extractError) {
          console.error('Backend PDF re-extraction failed:', extractError);
          console.error('Error details:', {
            name: extractError.name,
            message: extractError.message,
            stack: extractError.stack
          });
        }
      }
    }
    
    // Final content validation and preparation with guaranteed success
    const processedContent = validateAndPrepareContent(resumeContent, fileName);
    
    if (!processedContent.isValid) {
      console.error('Content validation failed, but continuing with fallback approach');
      console.error('Validation failure reason:', processedContent.reason);
      
      // Create minimal fallback content to ensure something always gets enhanced
      const nameFromFile = fileName.replace(/\.(pdf|docx)$/i, '').replace(/[-_]/g, ' ');
      const fallbackContent = `Name: ${nameFromFile}
Professional Summary: Experienced professional with a strong background and skills.
Work Experience: Professional experience in relevant field
Skills: Communication, Problem-solving, Team collaboration, Leadership
Education: Professional qualifications and education background`;
      
      console.log('Using emergency fallback content for enhancement');
      resumeContent = fallbackContent;
    } else {
      resumeContent = processedContent.content;
      if (processedContent.usedFallback) {
        console.log('Using enhanced fallback content due to extraction limitations');
      }
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