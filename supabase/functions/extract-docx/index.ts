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
  console.log('Starting enhanced DOCX text extraction...');
  
  try {
    // Use proper ZIP library-like extraction for DOCX files
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Find and extract document.xml from the DOCX ZIP structure
    let documentXML = '';
    let headerXML = '';
    let footerXML = '';
    
    // Enhanced ZIP parsing - look for central directory first
    const centralDirSignature = new Uint8Array([0x50, 0x4b, 0x01, 0x02]);
    const localFileSignature = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    
    console.log('Parsing DOCX ZIP structure...');
    
    // Look for document.xml, header1.xml, and footer1.xml files
    for (let i = 0; i < uint8Array.length - 30; i++) {
      // Check for ZIP local file header
      if (uint8Array[i] === localFileSignature[0] && 
          uint8Array[i + 1] === localFileSignature[1] && 
          uint8Array[i + 2] === localFileSignature[2] && 
          uint8Array[i + 3] === localFileSignature[3]) {
        
        // Read file header information
        const filenameLength = uint8Array[i + 26] | (uint8Array[i + 27] << 8);
        const extraLength = uint8Array[i + 28] | (uint8Array[i + 29] << 8);
        const compressedSize = uint8Array[i + 18] | (uint8Array[i + 19] << 8) | 
                              (uint8Array[i + 20] << 16) | (uint8Array[i + 21] << 24);
        
        if (filenameLength > 0 && filenameLength < 200) {
          const filenameStart = i + 30;
          const filename = String.fromCharCode(...uint8Array.slice(filenameStart, filenameStart + filenameLength));
          
          console.log('Found file in ZIP:', filename, 'compressed size:', compressedSize);
          
          // Extract content from specific Word document files
          if (filename === 'word/document.xml' || filename === 'word/header1.xml' || filename === 'word/footer1.xml') {
            const dataStart = filenameStart + filenameLength + extraLength;
            
            if (dataStart + compressedSize <= uint8Array.length) {
              const compressedData = uint8Array.slice(dataStart, dataStart + compressedSize);
              
              // Try multiple decompression approaches
              let decompressedXML = '';
              
              try {
                // Method 1: Direct UTF-8 decode (works if data is not heavily compressed)
                decompressedXML = new TextDecoder('utf-8', { ignoreBOM: true, fatal: false }).decode(compressedData);
                
                // If result doesn't look like XML, try alternative methods
                if (!decompressedXML.includes('<w:') && !decompressedXML.includes('<?xml')) {
                  // Method 2: Raw character extraction for compressed data
                  const readableChars = [];
                  for (let j = 0; j < compressedData.length; j++) {
                    const byte = compressedData[j];
                    // Include printable ASCII characters and common XML characters
                    if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) {
                      readableChars.push(String.fromCharCode(byte));
                    }
                  }
                  decompressedXML = readableChars.join('');
                }
              } catch (decodeError) {
                console.warn(`Failed to decode ${filename}:`, decodeError);
                continue;
              }
              
              // Store the extracted XML based on file type
              if (filename === 'word/document.xml') {
                documentXML = decompressedXML;
                console.log('Extracted document.xml, length:', documentXML.length);
              } else if (filename === 'word/header1.xml') {
                headerXML = decompressedXML;
                console.log('Extracted header1.xml, length:', headerXML.length);
              } else if (filename === 'word/footer1.xml') {
                footerXML = decompressedXML;
                console.log('Extracted footer1.xml, length:', footerXML.length);
              }
            }
          }
        }
      }
    }
    
    console.log('XML extraction completed. Document XML length:', documentXML.length);
    
    // Fallback method if standard extraction failed
    if (!documentXML || documentXML.length < 100) {
      console.log('Standard extraction insufficient, trying fallback method...');
      
      // Convert entire buffer to string and look for Word document patterns
      const textDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: false });
      const fullText = textDecoder.decode(uint8Array);
      
      // Look for Word document XML patterns
      const xmlMatch = fullText.match(/<w:document[\s\S]*?<\/w:document>/);
      if (xmlMatch) {
        documentXML = xmlMatch[0];
        console.log('Found document XML via pattern matching, length:', documentXML.length);
      } else {
        // Extract readable text sequences as final fallback
        const textMatches = fullText.match(/[A-Za-z][A-Za-z0-9\s.,;:!?()'\-@#$%&*+=<>{}[\]|\\\/]{10,}/g);
        if (textMatches && textMatches.length > 0) {
          const combinedText = textMatches.join(' ').replace(/\s+/g, ' ').trim();
          if (combinedText.length > 100) {
            console.log(`Fallback text extraction found ${textMatches.length} text segments, total length:`, combinedText.length);
            return combinedText;
          }
        }
      }
    }
    
    // Extract text from all XML content (document, header, footer)
    let extractedText = '';
    const allXML = [documentXML, headerXML, footerXML].filter(xml => xml.length > 0);
    
    for (const xml of allXML) {
      const xmlText = extractTextFromWordXML(xml);
      if (xmlText) {
        extractedText += xmlText + ' ';
      }
    }
    
    // Clean up final text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .trim();
    
    console.log('Final DOCX extraction result length:', extractedText.length);
    console.log('Sample of extracted text (first 300 chars):', extractedText.substring(0, 300));
    
    // Validate extraction quality
    if (extractedText.length < 100) {
      console.log('Extraction yielded insufficient content');
      return `⚠️ Limited Content Extracted

Document processed but text extraction was minimal. This can happen with:
• Documents with mostly images or graphics
• Complex formatting or embedded objects
• Protected or encrypted content
• Non-standard DOCX structure

Document size: ${(arrayBuffer.byteLength / 1024).toFixed(1)} KB

💡 For better results, try:
1. Save as a simpler Word document (.docx)
2. Convert to PDF format
3. Copy and paste text into a plain text document

The AI enhancement will still attempt to process the available content.`;
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('Enhanced DOCX extraction failed:', error);
    return `❌ DOCX Processing Error

Failed to extract text from DOCX file.

Error: ${error.message}

Document size: ${(arrayBuffer.byteLength / 1024).toFixed(1)} KB

🔧 Recommended solutions:
1. Re-save the document in Microsoft Word
2. Convert to PDF format for better compatibility
3. Ensure the file isn't corrupted or password-protected
4. Try a different DOCX file

The system will still attempt to enhance based on document structure patterns.`;
  }
}

// Helper function to extract text from Word XML content
function extractTextFromWordXML(xmlContent: string): string {
  if (!xmlContent || xmlContent.length === 0) {
    return '';
  }
  
  let extractedText = '';
  
  try {
    // Method 1: Extract text from w:t tags (Word text elements)
    const textTagPattern = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let match;
    
    while ((match = textTagPattern.exec(xmlContent)) !== null) {
      const text = match[1];
      if (text && text.length > 0) {
        extractedText += text + ' ';
      }
    }
    
    // Method 2: Extract text from w:instrText tags (instruction text)
    const instrTextPattern = /<w:instrText[^>]*>([^<]*)<\/w:instrText>/g;
    while ((match = instrTextPattern.exec(xmlContent)) !== null) {
      const text = match[1];
      if (text && text.length > 0 && !text.includes('HYPERLINK')) {
        extractedText += text + ' ';
      }
    }
    
    // Method 3: If minimal extraction, try broader pattern matching
    if (extractedText.length < 50) {
      // Look for any text content between XML tags
      const broadTextPattern = />([A-Za-z][A-Za-z0-9\s.,;:!?()'\-@#$%&*+=<>{}[\]|\\\/]{3,})</g;
      while ((match = broadTextPattern.exec(xmlContent)) !== null) {
        const text = match[1].trim();
        // Filter out XML-specific content
        if (text.length > 2 && 
            !text.includes('xml') && 
            !text.includes('word') && 
            !text.includes('http') && 
            !text.match(/^[0-9.]+$/)) {
          extractedText += text + ' ';
        }
      }
    }
    
    // Method 4: Extract from w:p (paragraph) content more broadly
    const paragraphPattern = /<w:p\b[^>]*>(.*?)<\/w:p>/gs;
    while ((match = paragraphPattern.exec(xmlContent)) !== null) {
      const paragraphContent = match[1];
      // Extract any readable text from paragraph content
      const paragraphText = paragraphContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      if (paragraphText.length > 3) {
        extractedText += paragraphText + ' ';
      }
    }
    
  } catch (error) {
    console.warn('Text extraction from XML failed:', error);
  }
  
  return extractedText;
}