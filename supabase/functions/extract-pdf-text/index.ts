import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Import PDF.js for proper PDF parsing
import * as pdfjsLib from "https://esm.sh/pdfjs-dist@4.0.379/build/pdf.min.mjs";

// Import Tesseract.js for OCR functionality
import Tesseract from "https://esm.sh/tesseract.js@5.0.4";


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

// Tesseract OCR text extraction
const extractTextWithTesseractOCR = async (pdfBuffer: ArrayBuffer): Promise<string> => {
  try {
    console.log('Starting Tesseract OCR text extraction...');
    
    // Load the PDF document for image conversion
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      verbosity: 0,
      isEvalSupported: false,
      disableFontFace: true,
      disableStream: true,
      disableAutoFetch: true,
    });
    
    const pdf = await loadingTask.promise;
    console.log(`PDF loaded for OCR. Pages: ${pdf.numPages}`);
    
    let ocrText = '';
    const maxPages = Math.min(pdf.numPages, 5); // Process up to 5 pages for performance
    
    // Process each page with Tesseract OCR
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        console.log(`OCR processing page ${pageNum}/${maxPages}`);
        
        const page = await pdf.getPage(pageNum);
        
        // Render page to canvas with high resolution for better OCR
        const viewport = page.getViewport({ scale: 3.0 }); // Higher scale for better OCR accuracy
        const canvas = new OffscreenCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
        
        // Convert canvas to image blob
        const imageBlob = await canvas.convertToBlob({ type: 'image/png' });
        const imageBuffer = await imageBlob.arrayBuffer();
        
        // Run Tesseract OCR on the image
        console.log(`Running Tesseract OCR on page ${pageNum}...`);
        const { data: { text } } = await Tesseract.recognize(
          new Uint8Array(imageBuffer),
          'eng',
          {
            logger: m => {
              if (m.status === 'recognizing text') {
                console.log(`OCR page ${pageNum} progress: ${Math.round(m.progress * 100)}%`);
              }
            },
            // OCR configuration for better accuracy
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?@#$%^&*()_+-=[]{}|;:\'",.<>/ ',
            tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
            tessedit_ocr_engine_mode: '1', // LSTM OCR Engine
          }
        );
        
        if (text && text.trim().length > 10) {
          // Clean up the OCR text
          const cleanedText = text
            .replace(/\n+/g, '\n') // Remove excessive line breaks
            .replace(/\s+/g, ' ') // Replace multiple spaces
            .trim();
          
          ocrText += `\n\n--- Page ${pageNum} (OCR) ---\n${cleanedText}`;
        } else {
          ocrText += `\n\n--- Page ${pageNum} (OCR) ---\n[No readable text detected on this page]`;
        }
        
        // Clean up page reference
        page.cleanup();
        
      } catch (pageError) {
        console.error(`OCR error on page ${pageNum}:`, pageError);
        ocrText += `\n\n--- Page ${pageNum} (OCR) ---\n[OCR processing failed for this page]`;
      }
    }
    
    // Add truncation note if needed
    if (pdf.numPages > maxPages) {
      ocrText += `\n\n--- OCR Note ---\nProcessed first ${maxPages} pages of ${pdf.numPages} total pages with Tesseract OCR.`;
    }
    
    // Clean up PDF document
    pdf.cleanup();
    
    console.log(`Tesseract OCR extraction completed. Total length: ${ocrText.length} characters`);
    return ocrText.trim();
    
  } catch (error) {
    console.error('Tesseract OCR extraction failed:', error);
    throw new Error(`OCR processing failed: ${error.message}`);
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
    
    let extractedText = '';
    let extractionMethod = '';
    
    try {
      // First attempt: Extract text using PDF.js
      console.log('🔍 Attempting PDF.js text extraction...');
      extractedText = await extractPDFTextWithPDFJS(arrayBuffer);
      extractionMethod = 'PDF.js';
      
      // Check if PDF.js extraction was successful
      const meaningfulTextThreshold = 100; // Minimum characters for meaningful content
      const hasEnoughText = extractedText && extractedText.length > meaningfulTextThreshold;
      
      if (!hasEnoughText) {
        console.log('📷 PDF.js yielded insufficient text, falling back to Tesseract OCR...');
        
        try {
          const ocrText = await extractTextWithTesseractOCR(arrayBuffer);
          if (ocrText && ocrText.length > 50) {
            extractedText = ocrText;
            extractionMethod = 'Tesseract OCR';
            console.log('✅ Tesseract OCR extraction successful');
          } else {
            // Combine both results if available
            extractedText = extractedText + '\n\n' + (ocrText || '');
            extractionMethod = 'PDF.js + Tesseract OCR (limited)';
          }
        } catch (ocrError) {
          console.error('Tesseract OCR fallback failed:', ocrError);
          extractionMethod = 'PDF.js only (OCR failed)';
        }
      }
      
    } catch (pdfError) {
      console.error('PDF.js failed, trying Tesseract OCR directly:', pdfError);
      
      try {
        extractedText = await extractTextWithTesseractOCR(arrayBuffer);
        extractionMethod = 'Tesseract OCR only';
        console.log('✅ OCR-only extraction successful');
      } catch (ocrError) {
        console.error('Both PDF.js and Tesseract OCR failed:', ocrError);
        throw new Error('Both text extraction methods failed');
      }
    }
    
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
• Extraction Method: ${extractionMethod}
• Status: ✅ Successfully extracted text content`;
      
      console.log(`✅ Text extraction successful using ${extractionMethod}`);
    } else {
      // Very limited text extracted even with OCR
      finalContent = `📄 ${pdfFile.name}

⚠️ Limited text extraction results even with Tesseract OCR processing.

Attempted Methods:
• PDF.js text extraction
• Tesseract OCR (Optical Character Recognition)

Extracted content (if any):
${extractedText || '[No readable text found]'}

---
📊 Processing Details:
• File Size: ${(pdfFile.size / 1024).toFixed(1)} KB
• Type: ${pdfFile.type || 'application/pdf'}
• Methods Used: ${extractionMethod}

Possible reasons for limited results:
• Very low quality scan/image
• Handwritten content (not machine readable)
• Extremely complex formatting
• Non-standard fonts or languages
• Heavily compressed images

💡 Recommendations:
• Try uploading a higher quality PDF
• Convert to Word (.docx) format if possible
• Ensure the document has clear, readable text
• Consider manual text entry for handwritten content`;
      
      console.log(`⚠️ Limited text extraction using ${extractionMethod}`);
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