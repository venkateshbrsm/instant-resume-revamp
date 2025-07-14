import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Import PDF.js for proper PDF parsing
import * as pdfjsLib from "https://esm.sh/pdfjs-dist@4.0.379/build/pdf.min.mjs";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configure PDF.js worker - disable for server-side use
pdfjsLib.GlobalWorkerOptions.workerSrc = null;

// PDF text extraction using PDF.js
const extractPDFTextWithPDFJS = async (pdfBuffer: ArrayBuffer): Promise<string> => {
  try {
    console.log('Starting PDF.js text extraction...');
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      verbosity: 0, // Reduce console output
      isEvalSupported: false, // Disable eval for security
      disableFontFace: true, // Disable font loading
      disableStream: true, // Disable streaming
      disableAutoFetch: true, // Disable auto-fetch
    });
    
    const pdf = await loadingTask.promise;
    console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);
    
    let fullText = '';
    const maxPages = Math.min(pdf.numPages, 20); // Process up to 20 pages
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        console.log(`Processing page ${pageNum}/${maxPages}`);
        
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Extract text items and maintain structure
        const pageTexts = textContent.items
          .map((item: any) => {
            if (item.str && typeof item.str === 'string') {
              return item.str.trim();
            }
            return '';
          })
          .filter(text => text.length > 0);
        
        if (pageTexts.length > 0) {
          const pageText = pageTexts.join(' ');
          fullText += `\n\n--- Page ${pageNum} ---\n${pageText}`;
        }
        
        // Clean up page reference
        page.cleanup();
        
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        fullText += `\n\n--- Page ${pageNum} ---\n[Error extracting text from this page]`;
      }
    }
    
    // Add truncation note if needed
    if (pdf.numPages > maxPages) {
      fullText += `\n\n--- Note ---\nShowing first ${maxPages} pages of ${pdf.numPages} total pages.`;
    }
    
    // Clean up PDF document
    pdf.cleanup();
    
    console.log(`Text extraction completed. Total length: ${fullText.length} characters`);
    return fullText.trim();
    
  } catch (error) {
    console.error('PDF.js extraction failed:', error);
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
};

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

    // Get the PDF content as ArrayBuffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    
    // Extract text using PDF.js
    const extractedText = await extractPDFTextWithPDFJS(arrayBuffer);
    
    let finalContent = '';
    
    if (extractedText && extractedText.length > 50) {
      // Successfully extracted meaningful text
      finalContent = `📄 ${pdfFile.name}

EXTRACTED CONTENT:
${extractedText}

---
📊 Extraction Summary:
• File Size: ${(pdfFile.size / 1024).toFixed(1)} KB
• Text Length: ${extractedText.length} characters
• Extraction Method: PDF.js
• Status: ✅ Successfully extracted text content`;
      
      console.log('✅ Text extraction successful');
    } else {
      // Limited text extracted
      finalContent = `📄 ${pdfFile.name}

⚠️ Limited text extraction results.

Possible reasons:
• Image-based PDF (scanned document)
• Password-protected content
• Complex formatting or non-standard encoding
• Encrypted or secured PDF

Extracted content (if any):
${extractedText || '[No readable text found]'}

---
📊 File Details:
• Size: ${(pdfFile.size / 1024).toFixed(1)} KB
• Type: ${pdfFile.type || 'application/pdf'}
• Processing: PDF.js engine

💡 For better results, try:
• Converting to Word (.docx) format
• Ensuring PDF contains selectable text (not scanned images)
• Using an unprotected PDF version`;
      
      console.log('⚠️ Limited text extraction');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedText: finalContent,
        fileName: pdfFile.name,
        fileSize: pdfFile.size,
        rawTextLength: extractedText.length,
        extractionMethod: 'pdfjs'
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
• Corrupted PDF file
• Unsupported PDF version
• Network connectivity issues
• Server processing limitations

Please try:
• Re-uploading the PDF file
• Converting to .docx or .txt format
• Using a different PDF version

The AI enhancement may still work with the file structure.`;

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        extractedText: errorContent,
        extractionMethod: 'pdfjs-failed'
      }),
      {
        status: 200, // Return 200 to not break the UI flow
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});