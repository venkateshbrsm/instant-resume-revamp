import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Document, Paragraph, TextRun, AlignmentType, Packer } from "https://esm.sh/docx@9.5.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Theme color mapping
const themeColors = {
  navy: { primary: '1e3a8a', secondary: '1e40af', accent: '3b82f6' },
  charcoal: { primary: '374151', secondary: '1f2937', accent: '6b7280' },
  burgundy: { primary: '7c2d12', secondary: '991b1b', accent: 'dc2626' },
  forest: { primary: '166534', secondary: '15803d', accent: '22c55e' },
  bronze: { primary: 'a16207', secondary: 'ca8a04', accent: 'eab308' },
  slate: { primary: '475569', secondary: '334155', accent: '64748b' }
};

function getThemeColors(themeId: string) {
  return themeColors[themeId as keyof typeof themeColors] || themeColors.navy;
}

// Generate DOCX resume from enhanced data
async function generateResumeDocx(resumeData: any, themeId: string = 'navy'): Promise<Uint8Array> {
  const colors = getThemeColors(themeId);
  
  // Helper function to clean text and remove special characters
  const cleanText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/[^\w\s.,;:()?!@#$%&*+=\-'"/\\]/g, '') // Remove problematic characters
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  };

  const doc = new Document({
    sections: [{
      children: [
        // Header with name and title
        new Paragraph({
          children: [
            new TextRun({
              text: cleanText(resumeData.name || "Professional Resume"),
              bold: true,
              size: 32,
              color: colors.primary,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: cleanText(resumeData.title || "Professional"),
              size: 24,
              color: colors.secondary,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        
        // Contact Information
        new Paragraph({
          children: [
            new TextRun({
              text: cleanText(`Email: ${resumeData.email || ""} | Phone: ${resumeData.phone || ""} | Location: ${resumeData.location || ""}`),
              size: 20,
              color: colors.accent,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        
        // Empty line
        new Paragraph({
          children: [new TextRun({ text: "", size: 12 })],
        }),
        
        // Professional Summary
        new Paragraph({
          children: [
            new TextRun({
              text: "PROFESSIONAL SUMMARY",
              bold: true,
              size: 24,
              color: colors.primary,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: cleanText(resumeData.summary || "Professional with extensive experience in their field."),
              size: 20,
            }),
          ],
        }),
        
        // Empty line
        new Paragraph({
          children: [new TextRun({ text: "", size: 12 })],
        }),
        
        // Professional Experience
        new Paragraph({
          children: [
            new TextRun({
              text: "PROFESSIONAL EXPERIENCE",
              bold: true,
              size: 24,
              color: colors.primary,
            }),
          ],
        }),
        
        // Experience entries
        ...(resumeData.experience || []).flatMap((exp: any) => [
          new Paragraph({
            children: [
              new TextRun({
                text: cleanText(`${exp.title || "Position"} at ${exp.company || "Company"}`),
                bold: true,
                size: 22,
                color: colors.secondary,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: cleanText(exp.duration || "Duration"),
                size: 18,
                italics: true,
                color: colors.accent,
              }),
            ],
          }),
          ...(exp.achievements || []).map((achievement: string) => 
            new Paragraph({
              children: [
                new TextRun({
                  text: cleanText(`• ${achievement}`),
                  size: 18,
                }),
              ],
            })
          ),
          // Empty line after each experience
          new Paragraph({
            children: [new TextRun({ text: "", size: 12 })],
          }),
        ]),
        
        // Skills Section
        ...(resumeData.skills && resumeData.skills.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: "SKILLS",
                bold: true,
                size: 24,
                color: colors.primary,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: cleanText(resumeData.skills.join(", ")),
                size: 20,
              }),
            ],
          }),
          // Empty line
          new Paragraph({
            children: [new TextRun({ text: "", size: 12 })],
          }),
        ] : []),
        
        // Education Section
        ...(resumeData.education && resumeData.education.length > 0 ? [
          new Paragraph({
            children: [
              new TextRun({
                text: "EDUCATION",
                bold: true,
                size: 24,
                color: colors.primary,
              }),
            ],
          }),
          ...resumeData.education.flatMap((edu: any) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: cleanText(edu.degree || "Degree"),
                  bold: true,
                  size: 22,
                  color: colors.secondary,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: cleanText(`${edu.institution || "Institution"} - ${edu.year || "Year"}`),
                  size: 18,
                  color: colors.accent,
                }),
              ],
            }),
            // Empty line
            new Paragraph({
              children: [new TextRun({ text: "", size: 12 })],
            }),
          ]),
        ] : []),
      ],
    }],
  });

  return await Packer.toBuffer(doc);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting enhanced resume download...");

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { paymentId } = await req.json();
    console.log("Payment ID:", paymentId);

    if (!paymentId) {
      throw new Error("Payment ID is required");
    }

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .select("*")
      .eq("razorpay_payment_id", paymentId)
      .eq("status", "completed")
      .single();

    if (paymentError || !payment) {
      console.error("Payment not found:", paymentError);
      throw new Error("Payment not found or not completed");
    }

    console.log("Found payment:", payment.id, "for file:", payment.file_name);

    // First priority: Check if enhanced file exists in storage and download it directly
    if (payment.enhanced_file_path) {
      console.log('Downloading enhanced file from storage:', payment.enhanced_file_path);
      
      try {
        const { data: fileData, error: downloadError } = await supabaseClient.storage
          .from('resumes')
          .download(payment.enhanced_file_path);

        if (!downloadError && fileData) {
          const fileName = `enhanced_${payment.file_name.replace(/\.[^/.]+$/, '.docx')}`;
          
          // Convert blob to array buffer to ensure proper binary handling
          const arrayBuffer = await fileData.arrayBuffer();
          const fileSize = arrayBuffer.byteLength;
          
          console.log(`Downloaded DOCX file size: ${fileSize} bytes`);
          
          return new Response(arrayBuffer, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'Content-Disposition': `attachment; filename="${fileName}"`,
              'Content-Length': fileSize.toString(),
            },
          });
        } else {
          console.error('Failed to download enhanced file from storage:', downloadError);
        }
      } catch (storageError) {
        console.error('Error accessing enhanced file in storage:', storageError);
      }
    }

    // Second priority: Check if enhanced content is saved in the database and generate DOCX
    if (payment.enhanced_content) {
      console.log("Found saved enhanced content from database, generating DOCX...");
      console.log("Enhanced content preview:", JSON.stringify(payment.enhanced_content).substring(0, 200) + "...");
      
      const enhancedResume = payment.enhanced_content;
      
      try {
        // Generate DOCX content using the saved enhanced resume data with theme
        const themeId = payment.theme_id || 'navy';
        console.log("Using theme for DOCX generation:", themeId);
        const docxBuffer = await generateResumeDocx(enhancedResume, themeId);
        const fileName = `enhanced_${payment.file_name.replace(/\.[^/.]+$/, '.docx')}`;
        
        console.log(`Generated DOCX from enhanced content, size: ${docxBuffer.byteLength} bytes`);
        
        return new Response(docxBuffer, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Length': docxBuffer.byteLength.toString(),
          },
          status: 200,
        });
      } catch (docxError) {
        console.error("Error generating DOCX from enhanced content:", docxError);
        throw new Error("Failed to generate DOCX from enhanced content");
      }
    }

    // Fallback: Use the exact same data that was shown in preview by calling enhance-resume 
    // with stored file content from the payment process (for legacy payments without saved content)
    try {
      console.log("No saved enhanced content found. Calling enhance-resume function to get the same data shown in preview...");
      
      // Get the stored file from storage and extract its content
      let fileContent = '';
      if (payment.file_path) {
        try {
          const { data: fileData, error: fileError } = await supabaseClient.storage
            .from('resumes')
            .download(payment.file_path);

          if (!fileError && fileData) {
            // Extract actual text content from the file
            if (payment.file_name.toLowerCase().endsWith('.pdf')) {
              // Extract text from PDF using the extract-pdf-text function
              const formData = new FormData();
              formData.append('file', fileData, payment.file_name);
              
              try {
                const extractResponse = await supabaseClient.functions.invoke('extract-pdf-text', {
                  body: formData,
                });
                
                if (extractResponse.data && extractResponse.data.extracted_text) {
                  fileContent = extractResponse.data.extracted_text;
                  console.log("PDF text extracted successfully, length:", fileContent.length);
                  console.log("PDF content preview:", fileContent.substring(0, 200));
                } else {
                  console.log("PDF extraction failed, trying alternative approach");
                  // Try the ilovepdf extraction as fallback
                  const formData2 = new FormData();
                  formData2.append('file', fileData, payment.file_name);
                  
                  const extractResponse2 = await supabaseClient.functions.invoke('extract-pdf-ilovepdf', {
                    body: formData2,
                  });
                  
                  if (extractResponse2.data && extractResponse2.data.text) {
                    fileContent = extractResponse2.data.text;
                    console.log("PDF text extracted via ilovepdf, length:", fileContent.length);
                  } else {
                    fileContent = `PDF file: ${payment.file_name}`;
                  }
                }
              } catch (pdfError) {
                console.error("PDF extraction error:", pdfError);
                fileContent = `PDF file: ${payment.file_name}`;
              }
            } else if (payment.file_name.toLowerCase().endsWith('.docx')) {
              // For DOCX files, use proper text extraction with mammoth-like approach
              try {
                const arrayBuffer = await fileData.arrayBuffer();
                
                // Import mammoth for DOCX text extraction
                const mammoth = await import('https://cdn.skypack.dev/mammoth@1.4.21');
                
                // Extract text from DOCX
                const result = await mammoth.extractRawText({ arrayBuffer });
                fileContent = result.value;
                
                console.log("DOCX text extracted with mammoth, length:", fileContent.length);
                console.log("DOCX content preview:", fileContent.substring(0, 200));
                
                if (fileContent.length < 50) {
                  console.warn("DOCX extraction yielded very little text");
                  fileContent = `DOCX file: ${payment.file_name} (limited content extracted)`;
                }
              } catch (docxError) {
                console.error("DOCX extraction error:", docxError);
                console.log("Falling back to convert-docx-to-pdf approach");
                
                // Fallback: Convert DOCX to PDF first, then extract text
                try {
                  const formData = new FormData();
                  formData.append('file', fileData, payment.file_name);
                  
                  const convertResponse = await supabaseClient.functions.invoke('convert-docx-to-pdf', {
                    body: formData,
                  });
                  
                  if (convertResponse.data && convertResponse.data.success && convertResponse.data.pdf_base64) {
                    // Convert base64 PDF back to blob and extract text
                    const pdfBlob = new Blob([Uint8Array.from(atob(convertResponse.data.pdf_base64), c => c.charCodeAt(0))], { type: 'application/pdf' });
                    
                    const pdfFormData = new FormData();
                    pdfFormData.append('file', pdfBlob, payment.file_name.replace('.docx', '.pdf'));
                    
                    const pdfExtractResponse = await supabaseClient.functions.invoke('extract-pdf-text', {
                      body: pdfFormData,
                    });
                    
                    if (pdfExtractResponse.data && pdfExtractResponse.data.extracted_text) {
                      fileContent = pdfExtractResponse.data.extracted_text;
                      console.log("DOCX->PDF->text extraction successful, length:", fileContent.length);
                    } else {
                      fileContent = `DOCX file: ${payment.file_name}`;
                    }
                  } else {
                    fileContent = `DOCX file: ${payment.file_name}`;
                  }
                } catch (fallbackError) {
                  console.error("DOCX fallback extraction error:", fallbackError);
                  fileContent = `DOCX file: ${payment.file_name}`;
                }
              }
            } else {
              // For TXT files or others
              fileContent = await fileData.text();
              console.log("TXT file content length:", fileContent.length);
            }
          }
        } catch (err) {
          console.log("Could not extract file content, using filename:", err);
          fileContent = `Resume file: ${payment.file_name}`;
        }
      }

      const enhanceResponse = await supabaseClient.functions.invoke('enhance-resume', {
        body: {
          fileName: payment.file_name,
          originalText: fileContent,
          extractedText: fileContent || `Resume for enhancement: ${payment.file_name}`
        }
      });

      if (enhanceResponse.error) {
        console.error("Error enhancing resume:", enhanceResponse.error);
        throw new Error(`Failed to enhance resume: ${enhanceResponse.error.message}`);
      }

      const enhancedResume = enhanceResponse.data;
      console.log("Enhanced resume data received successfully:", !!enhancedResume);

      if (!enhancedResume) {
        throw new Error("No enhanced resume data received");
      }

      // Generate DOCX content using the enhanced resume data with theme
      const themeId = payment.theme_id || 'navy';
      console.log("Using theme for DOCX generation:", themeId);
      const docxBuffer = await generateResumeDocx(enhancedResume, themeId);
      const fileName = `enhanced_${payment.file_name.replace(/\.[^/.]+$/, '.docx')}`;
      
      console.log(`Generated DOCX from enhance-resume call, size: ${docxBuffer.byteLength} bytes`);
      
      return new Response(docxBuffer, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': docxBuffer.byteLength.toString(),
        },
        status: 200,
      });

    } catch (enhanceError) {
      console.error("Error calling enhance-resume function:", enhanceError);
      
      // If enhance-resume fails, create a basic resume with payment data only
      const fallbackResume = {
        name: payment.file_name.replace(/\.(pdf|docx|doc)$/i, '').replace(/[-_]/g, ' ').trim(),
        title: "Professional",
        email: payment.email,
        phone: "",
        location: "",
        summary: "Resume enhancement service temporarily unavailable. Please contact support with your payment ID: " + paymentId,
        experience: [],
        skills: [],
        education: []
      };
      
      try {
        const themeId = payment.theme_id || 'navy';
        const docxBuffer = await generateResumeDocx(fallbackResume, themeId);
        const fileName = `enhanced_${payment.file_name.replace(/\.[^/.]+$/, '.docx')}`;
        
        console.log(`Generated fallback DOCX, size: ${docxBuffer.byteLength} bytes`);
        
        return new Response(docxBuffer, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Length': docxBuffer.byteLength.toString(),
          },
          status: 200,
        });
      } catch (fallbackDocxError) {
        console.error("Error generating fallback DOCX:", fallbackDocxError);
        throw new Error("Failed to generate fallback resume document");
      }
    }

  } catch (error) {
    console.error("Download error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});