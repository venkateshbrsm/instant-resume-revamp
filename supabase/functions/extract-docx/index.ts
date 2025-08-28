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
    
    // Extract text using server-side processing
    const extractedText = await extractTextFromDOCX(arrayBuffer);
    
    console.log('DOCX text extraction completed');
    console.log('Extracted text length:', extractedText.length);

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

async function extractTextFromDOCX(arrayBuffer: ArrayBuffer): Promise<string> {
  console.log('Starting DOCX text extraction...');
  
  try {
    // DOCX files are ZIP archives - we need to extract and parse the document.xml file
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Simple ZIP parsing to find document.xml
    let documentXML = '';
    
    // Look for the ZIP local file header signature and document.xml
    for (let i = 0; i < uint8Array.length - 30; i++) {
      // Check for ZIP local file header (0x04034b50)
      if (uint8Array[i] === 0x50 && uint8Array[i + 1] === 0x4b && 
          uint8Array[i + 2] === 0x03 && uint8Array[i + 3] === 0x04) {
        
        // Read filename length
        const filenameLength = uint8Array[i + 26] | (uint8Array[i + 27] << 8);
        const extraLength = uint8Array[i + 28] | (uint8Array[i + 29] << 8);
        
        // Get filename
        const filenameStart = i + 30;
        const filename = String.fromCharCode(...uint8Array.slice(filenameStart, filenameStart + filenameLength));
        
        // If this is document.xml, extract its content
        if (filename === 'word/document.xml') {
          const dataStart = filenameStart + filenameLength + extraLength;
          const compressedSize = uint8Array[i + 18] | (uint8Array[i + 19] << 8) | 
                                (uint8Array[i + 20] << 16) | (uint8Array[i + 21] << 24);
          
          // Extract the compressed data (this is a simplified approach)
          const compressedData = uint8Array.slice(dataStart, dataStart + compressedSize);
          
          try {
            // Try to decompress and decode
            documentXML = new TextDecoder('utf-8', { ignoreBOM: true }).decode(compressedData);
            break;
          } catch (decompressError) {
            console.warn('Failed to decompress document.xml, trying raw extraction:', decompressError);
            // Try raw extraction without decompression
            documentXML = String.fromCharCode(...compressedData.filter(byte => byte >= 32 && byte <= 126));
          }
        }
      }
    }
    
    console.log('Attempting to extract text from document XML, length:', documentXML.length);
    
    // If we couldn't find document.xml, try alternative approach
    if (!documentXML) {
      console.log('Could not find document.xml, trying alternative extraction...');
      
      // Convert entire buffer to string and look for text patterns
      const fullText = String.fromCharCode(...uint8Array.filter(byte => byte >= 32 && byte <= 126));
      
      // Look for readable text sequences
      const textMatches = fullText.match(/[A-Z][a-zA-Z0-9\s.,;:!?()'-]{15,}/g);
      
      if (textMatches && textMatches.length > 0) {
        documentXML = textMatches.join(' ');
        console.log('Alternative extraction found', textMatches.length, 'text segments');
      }
    }
    
    // Extract text from XML content
    let extractedText = '';
    
    if (documentXML) {
      // Extract text from w:t tags (Word text elements)
      const textTagPattern = /<w:t[^>]*>([^<]*)<\/w:t>/g;
      let match;
      
      while ((match = textTagPattern.exec(documentXML)) !== null) {
        const text = match[1].trim();
        if (text && text.length > 0) {
          extractedText += text + ' ';
        }
      }
      
      // Also try simpler text extraction
      if (extractedText.length < 50) {
        const simpleTextPattern = />([A-Za-z][A-Za-z0-9\s.,;:!?()'-]{5,})</g;
        while ((match = simpleTextPattern.exec(documentXML)) !== null) {
          const text = match[1].trim();
          if (text && text.length > 5 && !text.includes('xml') && !text.includes('word')) {
            extractedText += text + ' ';
          }
        }
      }
    }
    
    // Clean up extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\s]/g, '')
      .trim();
    
    console.log('Final extraction result length:', extractedText.length);
    console.log('Sample of extracted text:', extractedText.substring(0, 200));
    
    // Only return fallback if we have very little content
    if (extractedText.length < 50) {
      console.log('Insufficient text extracted, this may indicate a parsing issue');
      return `Error: Could not extract readable content from DOCX file. Document size: ${arrayBuffer.byteLength} bytes. Please try converting to PDF format for better text extraction.`;
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('DOCX extraction failed:', error);
    return `Error extracting DOCX content: ${error.message}. Please try converting your resume to PDF format for better compatibility.`;
  }
}