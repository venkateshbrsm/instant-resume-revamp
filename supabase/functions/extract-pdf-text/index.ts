import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple PDF text extraction function
const extractPDFText = async (pdfBuffer: ArrayBuffer): Promise<string> => {
  try {
    const uint8Array = new Uint8Array(pdfBuffer);
    const decoder = new TextDecoder('latin1');
    const pdfText = decoder.decode(uint8Array);
    
    console.log('PDF size:', pdfBuffer.byteLength, 'bytes');
    
    // Extract text content using regex patterns
    let extractedText = '';
    
    // Method 1: Extract text from stream objects
    const streamPattern = /stream\s*\n([\s\S]*?)\nendstream/g;
    let streamMatch;
    
    while ((streamMatch = streamPattern.exec(pdfText)) !== null) {
      const streamContent = streamMatch[1];
      
      // Look for text commands in the stream
      const textCommands = streamContent.match(/\((.*?)\)\s*Tj/g);
      if (textCommands) {
        textCommands.forEach(command => {
          const text = command.match(/\((.*?)\)/);
          if (text && text[1]) {
            extractedText += text[1] + ' ';
          }
        });
      }
      
      // Look for text arrays
      const textArrays = streamContent.match(/\[(.*?)\]\s*TJ/g);
      if (textArrays) {
        textArrays.forEach(array => {
          const matches = array.match(/\((.*?)\)/g);
          if (matches) {
            matches.forEach(match => {
              const text = match.replace(/[()]/g, '');
              extractedText += text + ' ';
            });
          }
        });
      }
    }
    
    // Method 2: Extract text from parentheses (simple text strings)
    const textPattern = /\(([^)]+)\)/g;
    let textMatch;
    const foundTexts = new Set(); // Avoid duplicates
    
    while ((textMatch = textPattern.exec(pdfText)) !== null) {
      const text = textMatch[1];
      // Filter out non-readable content
      if (text && 
          text.length > 1 && 
          /[a-zA-Z0-9]/.test(text) && 
          !text.includes('\\') && 
          !foundTexts.has(text)) {
        foundTexts.add(text);
        extractedText += text + ' ';
      }
    }
    
    // Method 3: Look for BT...ET text blocks
    const textBlockPattern = /BT\s*([\s\S]*?)\s*ET/g;
    let blockMatch;
    
    while ((blockMatch = textBlockPattern.exec(pdfText)) !== null) {
      const block = blockMatch[1];
      const textInBlock = block.match(/\(([^)]+)\)/g);
      if (textInBlock) {
        textInBlock.forEach(text => {
          const cleanText = text.replace(/[()]/g, '');
          if (cleanText && cleanText.length > 1 && /[a-zA-Z]/.test(cleanText)) {
            extractedText += cleanText + ' ';
          }
        });
      }
    }
    
    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\\/g, '') // Remove backslashes
      .trim();
    
    console.log('Extracted text length:', extractedText.length);
    console.log('First 200 chars:', extractedText.substring(0, 200));
    
    return extractedText;
    
  } catch (error) {
    console.error('PDF text extraction error:', error);
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

    console.log('Processing PDF:', pdfFile.name, 'Size:', pdfFile.size);

    // Get the PDF content as ArrayBuffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    
    // Extract text from PDF
    const extractedText = await extractPDFText(arrayBuffer);
    
    let finalContent = '';
    
    if (extractedText && extractedText.length > 50) {
      // Successfully extracted text - format it nicely
      finalContent = `📄 ${pdfFile.name}

${extractedText}

---
File Details:
• Size: ${(pdfFile.size / 1024).toFixed(1)} KB
• Pages: Detected text content
• Status: Text extracted successfully`;
      
      console.log('Text extraction successful, length:', extractedText.length);
    } else {
      // Minimal text extracted - provide helpful message
      finalContent = `📄 ${pdfFile.name}

⚠️ Limited text extraction from this PDF.

This could be due to:
• Image-based PDF (scanned document)
• Complex formatting or special encoding
• Password protection or security settings
• Non-standard PDF structure

File Details:
• Size: ${(pdfFile.size / 1024).toFixed(1)} KB
• Type: ${pdfFile.type || 'application/pdf'}
• Uploaded: ${new Date().toLocaleString()}

💡 For better text extraction, try:
• Converting to Word (.docx) format
• Using a text (.txt) version
• Ensuring the PDF contains selectable text

The AI enhancement will still work with your document structure and any available content.`;
      
      console.log('Limited text extraction - providing fallback message');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedText: finalContent,
        fileName: pdfFile.name,
        fileSize: pdfFile.size,
        rawTextLength: extractedText.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in extract-pdf-text function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        extractedText: `PDF Processing Error

An error occurred while extracting text from your PDF:
${error.message}

Please try:
• Uploading a different PDF format
• Converting to .docx or .txt format
• Ensuring the file is not corrupted

The AI enhancement may still work with the document structure.`
      }),
      {
        status: 200, // Still return 200 to not break the flow
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});