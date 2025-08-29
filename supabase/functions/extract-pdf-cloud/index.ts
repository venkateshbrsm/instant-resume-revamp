import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const pdfCoApiKey = Deno.env.get('PDFCO_API_KEY');
    
    if (!pdfCoApiKey) {
      console.error('PDFCO_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'PDF processing service not configured',
          extractedText: 'PDF processing service is not properly configured. Please contact support.'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get the uploaded file from the request
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No file provided',
          extractedText: 'No PDF file was provided for processing.'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing PDF: ${file.name}, Size: ${file.size} bytes`);

    // Convert file to base64 for API upload
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64 safely without spreading large arrays
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Content = btoa(binary);

    // Step 1: Upload file to PDFCo
    console.log('Uploading PDF to PDFCo...');
    const uploadResponse = await fetch('https://api.pdf.co/v1/file/upload/base64', {
      method: 'POST',
      headers: {
        'x-api-key': pdfCoApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: file.name,
        data: base64Content
      }),
    });

    const uploadResult = await uploadResponse.json();
    
    if (!uploadResult.url) {
      console.error('Failed to upload PDF:', uploadResult);
      throw new Error('Failed to upload PDF to processing service');
    }

    console.log('PDF uploaded successfully, extracting text...');

    // Step 2: Extract text from the uploaded PDF
    const extractResponse = await fetch('https://api.pdf.co/v1/pdf/convert/to/text', {
      method: 'POST',
      headers: {
        'x-api-key': pdfCoApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: uploadResult.url,
        inline: true,
        async: false
      }),
    });

    const extractResult = await extractResponse.json();
    
    if (!extractResult.url && !extractResult.body) {
      console.error('Failed to extract text:', extractResult);
      throw new Error('Failed to extract text from PDF');
    }

    // Get the extracted text
    let extractedText = '';
    
    if (extractResult.body) {
      extractedText = extractResult.body;
    } else if (extractResult.url) {
      // Download the text file if returned as URL
      const textResponse = await fetch(extractResult.url);
      extractedText = await textResponse.text();
    }

    console.log(`Text extraction completed. Length: ${extractedText.length} characters`);

    // Clean up and format the extracted text
    const cleanedText = extractedText
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/(.{100})/g, '$1\n'); // Add line breaks for readability

    if (cleanedText && cleanedText.length > 20) {
      return new Response(
        JSON.stringify({
          success: true,
          extractedText: cleanedText,
          fileName: file.name,
          processingDetails: {
            originalSize: file.size,
            extractedLength: cleanedText.length,
            service: 'PDFCo API'
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      // Limited text extraction
      return new Response(
        JSON.stringify({
          success: true,
          extractedText: `📄 PDF Resume: ${file.name}

File Details:
- Size: ${(file.size / 1024).toFixed(1)} KB
- Processed with: PDFCo Cloud API
- Uploaded: ${new Date().toLocaleString()}

⚠️ Limited Text Content

This PDF appears to contain mostly images or has limited extractable text.

💡 Suggestions:
• Ensure the PDF contains selectable text (not just scanned images)
• Try converting to .docx format for better text extraction
• Use a text-based PDF instead of a scanned document

The AI enhancement will still process what content is available.`,
          fileName: file.name,
          isLimitedExtraction: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Error in PDF cloud processing:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        extractedText: `📄 PDF Processing Error

Unable to process the PDF using cloud services. This might be due to:
• Service temporary unavailability
• Unsupported PDF format
• File corruption or protection

💡 Alternative options:
• Try converting to .docx format
• Use a different PDF file
• Contact support if the issue persists

The resume enhancement may still work with limited content.`
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});