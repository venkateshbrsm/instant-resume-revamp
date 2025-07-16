import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// HTML template for the enhanced resume
function generateResumeHTML(resumeData: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${resumeData.name} - Resume</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px;
            background: #fff;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .name { 
            font-size: 2.5em; 
            font-weight: bold; 
            color: #1f2937; 
            margin-bottom: 10px; 
        }
        .title { 
            font-size: 1.3em; 
            color: #2563eb; 
            margin-bottom: 15px; 
        }
        .contact { 
            display: flex; 
            justify-content: center; 
            gap: 20px; 
            flex-wrap: wrap; 
            font-size: 0.95em; 
            color: #666; 
        }
        .section { 
            margin-bottom: 25px; 
        }
        .section-title { 
            font-size: 1.3em; 
            font-weight: bold; 
            color: #1f2937; 
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 5px; 
            margin-bottom: 15px; 
        }
        .summary { 
            background: #f9fafb; 
            padding: 20px; 
            border-radius: 8px; 
            border-left: 4px solid #2563eb; 
            font-style: italic; 
        }
        .experience-item { 
            margin-bottom: 20px; 
            padding: 15px; 
            border: 1px solid #e5e7eb; 
            border-radius: 6px; 
        }
        .job-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 10px; 
            flex-wrap: wrap; 
        }
        .job-title { 
            font-weight: bold; 
            color: #1f2937; 
            font-size: 1.1em; 
        }
        .company { 
            color: #2563eb; 
            font-weight: 600; 
        }
        .duration { 
            color: #666; 
            font-size: 0.9em; 
        }
        .achievements { 
            list-style-type: none; 
            padding-left: 0; 
        }
        .achievements li { 
            margin-bottom: 5px; 
            padding-left: 20px; 
            position: relative; 
        }
        .achievements li:before { 
            content: "▸"; 
            color: #2563eb; 
            position: absolute; 
            left: 0; 
        }
        .skills { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 10px; 
        }
        .skill-tag { 
            background: #dbeafe; 
            color: #1d4ed8; 
            padding: 5px 12px; 
            border-radius: 20px; 
            font-size: 0.9em; 
            font-weight: 500; 
        }
        .education-item { 
            margin-bottom: 15px; 
            padding: 12px; 
            background: #f9fafb; 
            border-radius: 6px; 
        }
        .degree { 
            font-weight: bold; 
            color: #1f2937; 
        }
        .institution { 
            color: #2563eb; 
            margin-top: 5px; 
        }
        .year { 
            color: #666; 
            font-size: 0.9em; 
        }
        
        @media print {
            body { padding: 20px; }
            .header { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="name">${resumeData.name || 'Professional Candidate'}</h1>
        <div class="title">${resumeData.title || 'Professional'}</div>
        <div class="contact">
            ${resumeData.email ? `<span>📧 ${resumeData.email}</span>` : ''}
            ${resumeData.phone ? `<span>📞 ${resumeData.phone}</span>` : ''}
            ${resumeData.location ? `<span>📍 ${resumeData.location}</span>` : ''}
        </div>
    </div>

    ${resumeData.summary ? `
    <div class="section">
        <h2 class="section-title">Professional Summary</h2>
        <div class="summary">${resumeData.summary}</div>
    </div>
    ` : ''}

    ${resumeData.experience && resumeData.experience.length > 0 ? `
    <div class="section">
        <h2 class="section-title">Professional Experience</h2>
        ${resumeData.experience.map((exp: any) => `
        <div class="experience-item">
            <div class="job-header">
                <div>
                    <div class="job-title">${exp.title || 'Position'}</div>
                    <div class="company">${exp.company || 'Company'}</div>
                </div>
                <div class="duration">${exp.duration || 'Duration'}</div>
            </div>
            ${exp.achievements && exp.achievements.length > 0 ? `
            <ul class="achievements">
                ${exp.achievements.map((achievement: string) => `<li>${achievement}</li>`).join('')}
            </ul>
            ` : ''}
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${resumeData.skills && resumeData.skills.length > 0 ? `
    <div class="section">
        <h2 class="section-title">Skills</h2>
        <div class="skills">
            ${resumeData.skills.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
    </div>
    ` : ''}

    ${resumeData.education && resumeData.education.length > 0 ? `
    <div class="section">
        <h2 class="section-title">Education</h2>
        ${resumeData.education.map((edu: any) => `
        <div class="education-item">
            <div class="degree">${edu.degree || 'Degree'}</div>
            <div class="institution">${edu.institution || 'Institution'}</div>
            <div class="year">${edu.year || 'Year'}</div>
        </div>
        `).join('')}
    </div>
    ` : ''}
</body>
</html>`;
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

    // Second priority: Check if enhanced content is saved in the database
    if (payment.enhanced_content) {
      console.log("Using saved enhanced content from database");
      
      const enhancedResume = payment.enhanced_content;
      
      // Generate HTML content using the saved enhanced resume data
      const htmlContent = generateResumeHTML(enhancedResume);
      
      const fileName = `${enhancedResume.name ? enhancedResume.name.replace(/\s+/g, '_') : 'Enhanced_Resume'}_Enhanced_Resume.html`;
      
      return new Response(htmlContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
        status: 200,
      });
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

      // Generate HTML content using the enhanced resume data
      const htmlContent = generateResumeHTML(enhancedResume);
      
      const fileName = `${enhancedResume.name ? enhancedResume.name.replace(/\s+/g, '_') : 'Enhanced_Resume'}_Enhanced_Resume.html`;
      
      return new Response(htmlContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="${fileName}"`,
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
      
      const htmlContent = generateResumeHTML(fallbackResume);
      const fileName = `${fallbackResume.name.replace(/\s+/g, '_')}_Basic_Resume.html`;
      
      return new Response(htmlContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
        status: 200,
      });
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