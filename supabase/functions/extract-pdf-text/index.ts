import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Python OCR service URL - update this after deployment
const PYTHON_OCR_SERVICE_URL = Deno.env.get('PYTHON_OCR_SERVICE_URL') || 'http://localhost:5000';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('PDF text extraction request received');

    const formData = await req.formData();
    const pdfFile = formData.get('file') as File;

    if (!pdfFile) {
      throw new Error('No PDF file provided');
    }

    console.log(`Processing PDF: ${pdfFile.name}, Size: ${pdfFile.size} bytes`);

    // Forward the PDF to the Python OCR service
    const ocrFormData = new FormData();
    ocrFormData.append('file', pdfFile);

    console.log(`Calling Python OCR service at: ${PYTHON_OCR_SERVICE_URL}`);

    const ocrResponse = await fetch(`${PYTHON_OCR_SERVICE_URL}/extract-pdf-text`, {
      method: 'POST',
      body: ocrFormData,
    });

    if (!ocrResponse.ok) {
      const errorText = await ocrResponse.text();
      throw new Error(`Python OCR service error (${ocrResponse.status}): ${errorText}`);
    }

    const ocrResult = await ocrResponse.json();

    if (!ocrResult.success) {
      throw new Error(`OCR processing failed: ${ocrResult.error}`);
    }

    console.log(`✅ OCR extraction successful using ${ocrResult.method}`);
    console.log(`Pages processed: ${ocrResult.pages_processed}/${ocrResult.total_pages}`);
    console.log(`Text length: ${ocrResult.text_length} characters`);

    // Format the response for the frontend
    let finalContent = '';
    
    if (ocrResult.extracted_text && ocrResult.extracted_text.length > 50) {
      finalContent = `📄 ${pdfFile.name}

EXTRACTED CONTENT:
${ocrResult.extracted_text}

---
📊 Extraction Summary:
• File Size: ${(pdfFile.size / 1024).toFixed(1)} KB
• Method: ${ocrResult.method}
• Pages Processed: ${ocrResult.pages_processed}/${ocrResult.total_pages}
• Text Length: ${ocrResult.text_length} characters
• Status: ✅ Successfully extracted using Python OCR service`;
    } else {
      finalContent = `📄 ${pdfFile.name}

⚠️ Limited text extraction results.

Processing Details:
• File Size: ${(pdfFile.size / 1024).toFixed(1)} KB
• Method: ${ocrResult.method}
• Pages Processed: ${ocrResult.pages_processed}/${ocrResult.total_pages}

Extracted content (if any):
${ocrResult.extracted_text || '[No readable text found]'}

Possible reasons for limited results:
• Very low quality scan/image
• Handwritten content (not machine readable)
• Heavily compressed or corrupted PDF
• Non-standard fonts or languages

💡 Recommendations:
• Try uploading a higher quality PDF
• Convert to Word (.docx) format if possible
• Ensure the document has clear, readable text`;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedText: finalContent,
        fileName: pdfFile.name,
        fileSize: pdfFile.size,
        extractionMethod: ocrResult.method,
        pagesProcessed: ocrResult.pages_processed,
        totalPages: ocrResult.total_pages
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('PDF extraction error:', error);
    
    const errorContent = `📄 PDF Processing Error

Error Details: ${error.message}

This could be due to:
• Python OCR service unavailable
• Network connectivity issues
• PDF file corruption
• Service processing limitations

Please try:
• Re-uploading the PDF file
• Converting to .docx or .txt format
• Checking service connectivity

The Python OCR service uses PyMuPDF + pytesseract for the best text extraction results.`;

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        extractedText: errorContent,
        extractionMethod: 'failed'
      }),
      {
        status: 200, // Return 200 to not break the UI flow
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});