import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log('DOCX extraction request received');

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing DOCX file:', file.name, 'Size:', file.size);

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Use simple text extraction approach instead of complex ZIP parsing
    const extractedText = await extractTextFromDOCXSimple(arrayBuffer);
    
    console.log('DOCX text extraction completed');
    console.log('Extracted text length:', extractedText.length);
    console.log('Text preview:', extractedText.substring(0, 300));

    return new Response(
      JSON.stringify({
        success: true,
        extractedText: extractedText,
        fileName: file.name,
        fileSize: file.size
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('DOCX extraction error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to extract text from DOCX file'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function extractTextFromDOCXSimple(arrayBuffer: ArrayBuffer): Promise<string> {
  console.log('Starting simplified DOCX text extraction...');
  
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    console.log('Processing DOCX file, size:', arrayBuffer.byteLength, 'bytes');
    
    // Convert the entire buffer to string and look for readable text
    const decoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: false });
    const fullText = decoder.decode(uint8Array);
    
    console.log('Decoded text length:', fullText.length);
    
    // Extract text using multiple patterns for maximum coverage
    let extractedText = '';
    const textSegments = new Set<string>(); // Use Set to avoid duplicates
    
    // Pattern 1: Look for common resume sections and content
    const resumePatterns = [
      // Contact information patterns
      /[A-Za-z][A-Za-z\s]{2,30}\s*[\r\n]/g, // Names
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Emails
      /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g, // Phone numbers
      
      // Professional content patterns
      /(?:experience|Experience|EXPERIENCE)[\s\S]{0,20}([A-Za-z][A-Za-z0-9\s.,;:!?\-'"()]{20,200})/g,
      /(?:education|Education|EDUCATION)[\s\S]{0,20}([A-Za-z][A-Za-z0-9\s.,;:!?\-'"()]{20,200})/g,
      /(?:skills|Skills|SKILLS)[\s\S]{0,20}([A-Za-z][A-Za-z0-9\s.,;:!?\-'"()]{20,200})/g,
      
      // Job titles and companies
      /(?:^|\n|\r)([A-Z][A-Za-z\s]{5,50})(?:\n|\r|$)/g,
      
      // General text content (longer sequences)
      /[A-Za-z][A-Za-z0-9\s.,;:!?\-'"()@#$%&*+=<>{}[\]|\\\/]{25,}/g
    ];
    
    // Apply patterns and collect unique text segments
    for (const pattern of resumePatterns) {
      let match;
      pattern.lastIndex = 0; // Reset regex state
      
      while ((match = pattern.exec(fullText)) !== null) {
        const text = (match[1] || match[0]).trim();
        
        if (text && 
            text.length > 5 && 
            text.length < 500 && // Avoid huge chunks
            text.match(/[A-Za-z]/) && // Must contain letters
            !text.includes('<?xml') &&
            !text.includes('schemas.openxml') &&
            !text.includes('word/') &&
            !text.includes('http://') &&
            !text.includes('xmlns') &&
            !text.match(/^[0-9.]+$/)) { // Not just numbers
          
          // Clean the text
          const cleanedText = text
            .replace(/[^\w\s.,;:!?\-'"()@#$%&*+=<>{}[\]|\\\/]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (cleanedText.length > 5) {
            textSegments.add(cleanedText);
          }
        }
        
        // Prevent infinite loops
        if (pattern.lastIndex === match.index) {
          pattern.lastIndex++;
        }
      }
    }
    
    console.log('Found', textSegments.size, 'unique text segments');
    
    // Join all unique segments
    extractedText = Array.from(textSegments).join(' ');
    
    // If we still don't have much text, try a broader approach
    if (extractedText.length < 200) {
      console.log('Trying broader text extraction...');
      
      // Split by various delimiters and look for meaningful content
      const lines = fullText.split(/[\r\n\0\x01-\x1F]+/);
      const meaningfulLines: string[] = [];
      
      for (const line of lines) {
        const cleanLine = line
          .replace(/[^\w\s.,;:!?\-'"()@#$%&*+=<>{}[\]|\\\/]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (cleanLine.length > 10 && 
            cleanLine.match(/[A-Za-z]/) &&
            !cleanLine.includes('xml') &&
            !cleanLine.includes('schema') &&
            !cleanLine.match(/^[0-9.]+$/)) {
          meaningfulLines.push(cleanLine);
        }
      }
      
      if (meaningfulLines.length > 0) {
        extractedText = meaningfulLines.join(' ');
      }
    }
    
    // Final cleanup
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .trim();
    
    console.log('Final extraction result:');
    console.log('- Length:', extractedText.length);
    console.log('- Preview:', extractedText.substring(0, 500));
    
    // Validate extraction quality
    if (extractedText.length < 50) {
      console.log('Extraction yielded insufficient content');
      return `Document processed but minimal text extracted.

File: ${arrayBuffer.byteLength} bytes

This can happen when:
• The document contains mostly images or graphics
• The file has complex formatting or embedded objects
• The content is in a format that's difficult to extract

Please try:
1. Converting to PDF format
2. Saving as a simpler Word document
3. Copying content to a plain text document

The system will still attempt to create an enhanced resume based on common resume patterns.`;
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('Simplified DOCX extraction failed:', error);
    return `Error processing DOCX file: ${error.message}

Please try:
1. Converting to PDF format
2. Using a different document format
3. Ensuring the file isn't corrupted

The system will attempt to create an enhanced resume template.`;
  }
}