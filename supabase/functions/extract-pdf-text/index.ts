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

// OpenAI Vision API text extraction
const extractTextWithOpenAIVision = async (pdfBuffer: ArrayBuffer): Promise<string> => {
  try {
    console.log('Starting OpenAI Vision text extraction...');
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
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
    console.log(`PDF loaded for Vision API. Pages: ${pdf.numPages}`);
    
    let visionText = '';
    const maxPages = Math.min(pdf.numPages, 10); // Process up to 10 pages with Vision API
    
    // Process each page with OpenAI Vision
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        console.log(`Vision API processing page ${pageNum}/${maxPages}`);
        
        const page = await pdf.getPage(pageNum);
        
        // Render page to canvas
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
        const canvas = new OffscreenCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
        
        // Convert canvas to base64 image
        const imageBlob = await canvas.convertToBlob({ type: 'image/png' });
        const imageBuffer = await imageBlob.arrayBuffer();
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
        
        // Call OpenAI Vision API
        console.log(`Calling OpenAI Vision API for page ${pageNum}...`);
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini', // Vision-capable model
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Please extract ALL text content from this resume/document image. Maintain the structure and formatting as much as possible. Include:
- Personal information (name, contact details)
- Professional summary/objective
- Work experience with dates and descriptions
- Education details
- Skills and certifications
- Any other text content visible

Please provide the extracted text in a clean, readable format while preserving the document structure.`
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/png;base64,${base64Image}`
                    }
                  }
                ]
              }
            ],
            max_tokens: 2000,
            temperature: 0.1 // Low temperature for consistent extraction
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const extractedPageText = data.choices[0]?.message?.content;

        if (extractedPageText && extractedPageText.trim().length > 10) {
          visionText += `\n\n--- Page ${pageNum} (OpenAI Vision) ---\n${extractedPageText.trim()}`;
        } else {
          visionText += `\n\n--- Page ${pageNum} (OpenAI Vision) ---\n[No text detected on this page]`;
        }
        
        // Clean up
        page.cleanup();
        
      } catch (pageError) {
        console.error(`Vision API error on page ${pageNum}:`, pageError);
        visionText += `\n\n--- Page ${pageNum} (OpenAI Vision) ---\n[Vision API failed for this page: ${pageError.message}]`;
      }
    }
    
    // Add truncation note if needed
    if (pdf.numPages > maxPages) {
      visionText += `\n\n--- Vision API Note ---\nProcessed first ${maxPages} pages of ${pdf.numPages} total pages with OpenAI Vision.`;
    }
    
    // Clean up PDF document
    pdf.cleanup();
    
    console.log(`OpenAI Vision extraction completed. Total length: ${visionText.length} characters`);
    return visionText.trim();
    
  } catch (error) {
    console.error('OpenAI Vision extraction failed:', error);
    throw error;
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
        console.log('🤖 PDF.js yielded insufficient text, trying OpenAI Vision API...');
        
        try {
          const visionText = await extractTextWithOpenAIVision(arrayBuffer);
          if (visionText && visionText.length > 50) {
            extractedText = visionText;
            extractionMethod = 'OpenAI Vision API';
            console.log('✅ OpenAI Vision extraction successful');
          } else {
            // Combine both results if available
            extractedText = extractedText + '\n\n' + (visionText || '');
            extractionMethod = 'PDF.js + OpenAI Vision (limited)';
          }
        } catch (visionError) {
          console.error('OpenAI Vision fallback failed:', visionError);
          extractionMethod = 'PDF.js only (Vision API failed)';
        }
      }
      
    } catch (pdfError) {
      console.error('PDF.js failed, trying OpenAI Vision directly:', pdfError);
      
      try {
        extractedText = await extractTextWithOpenAIVision(arrayBuffer);
        extractionMethod = 'OpenAI Vision only';
        console.log('✅ Vision-only extraction successful');
      } catch (visionError) {
        console.error('Both PDF.js and Vision API failed:', visionError);
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
      // Very limited text extracted even with AI Vision
      finalContent = `📄 ${pdfFile.name}

⚠️ Limited text extraction results even with AI Vision processing.

Attempted Methods:
• PDF.js text extraction
• OpenAI Vision API (GPT-4 Vision)

Extracted content (if any):
${extractedText || '[No readable text found]'}

---
📊 Processing Details:
• File Size: ${(pdfFile.size / 1024).toFixed(1)} KB
• Type: ${pdfFile.type || 'application/pdf'}
• Methods Used: ${extractionMethod}

Possible reasons for limited results:
• Extremely poor image quality
• Handwritten content in difficult script
• Heavily corrupted or encrypted PDF
• Non-text content (pure images/graphics)
• Unusual document formatting

💡 Recommendations:
• Try uploading a higher resolution/quality PDF
• Convert to Word (.docx) format if possible
• Ensure the document contains clear, machine-readable text
• For handwritten content, consider manual text entry`;
      
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