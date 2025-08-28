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
    const uint8Array = new Uint8Array(arrayBuffer);
    console.log('Processing DOCX file, size:', arrayBuffer.byteLength, 'bytes');
    
    // Method 1: Try to extract readable text directly from the binary data
    // DOCX files contain readable text even in compressed form
    const decoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: false });
    const fullText = decoder.decode(uint8Array);
    
    console.log('Decoded full text length:', fullText.length);
    
    // Extract meaningful text patterns from the decoded content
    let extractedText = '';
    
    // Pattern 1: Look for text between common Word XML patterns
    const xmlTextPatterns = [
      /<w:t[^>]*>([^<]+)<\/w:t>/g,
      /<w:instrText[^>]*>([^<]+)<\/w:instrText>/g,
      />([A-Za-z][A-Za-z0-9\s.,;:!?\-'"()]{10,})</g
    ];
    
    for (const pattern of xmlTextPatterns) {
      let match;
      while ((match = pattern.exec(fullText)) !== null) {
        const text = match[1]?.trim();
        if (text && text.length > 3 && 
            !text.includes('xml') && 
            !text.includes('http') && 
            !text.match(/^[0-9.]+$/) &&
            !text.includes('word/') &&
            text.match(/[A-Za-z]/)) {
          extractedText += text + ' ';
        }
      }
    }
    
    console.log('XML pattern extraction yielded:', extractedText.length, 'characters');
    
    // Method 2: If XML patterns didn't work well, try broader text extraction
    if (extractedText.length < 200) {
      console.log('Trying broader text extraction...');
      
      // Look for sequences of readable text (letters, numbers, common punctuation)
      const readableTextPattern = /[A-Za-z][A-Za-z0-9\s.,;:!?\-'"()@#$%&*+=<>{}[\]|\\\/]{15,}/g;
      const matches = fullText.match(readableTextPattern);
      
      if (matches && matches.length > 0) {
        console.log('Found', matches.length, 'readable text sequences');
        
        // Filter and clean the matches
        const cleanedMatches = matches
          .filter(match => {
            // Filter out XML/technical content
            return !match.includes('<?xml') &&
                   !match.includes('schemas.openxmlformats') &&
                   !match.includes('w:') &&
                   !match.includes('xmlns') &&
                   match.length > 10 &&
                   match.match(/[A-Za-z]/) && // Must contain letters
                   !match.match(/^[0-9.]+$/); // Not just numbers
          })
          .map(match => match
            .replace(/[^\w\s.,;:!?\-'"()@#$%&*+=<>{}[\]|\\\/]/g, ' ') // Clean special chars
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim()
          )
          .filter(match => match.length > 5);
        
        extractedText = cleanedMatches.join(' ');
        console.log('Cleaned text extraction yielded:', extractedText.length, 'characters');
      }
    }
    
    // Method 3: Final fallback - extract any text that looks like resume content
    if (extractedText.length < 100) {
      console.log('Trying final fallback extraction...');
      
      // Look for common resume keywords and extract surrounding context
      const resumeKeywords = ['experience', 'education', 'skills', 'work', 'university', 'degree', 'phone', 'email', 'address', 'summary', 'objective'];
      const lines = fullText.split(/[\n\r]+/);
      
      for (const line of lines) {
        const cleanLine = line.replace(/[^\w\s.,;:!?\-'"()@]/g, ' ').replace(/\s+/g, ' ').trim();
        
        if (cleanLine.length > 10 && cleanLine.match(/[A-Za-z]/)) {
          // Check if line contains resume-related content
          const hasResumeKeyword = resumeKeywords.some(keyword => 
            cleanLine.toLowerCase().includes(keyword)
          );
          
          // Or if it looks like contact info, names, etc.
          const looksLikeResumeContent = cleanLine.match(/^[A-Z][a-zA-Z\s]+$/) || // Names
                                       cleanLine.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) || // Phone numbers
                                       cleanLine.match(/@[\w.-]+\.\w+/) || // Email addresses
                                       cleanLine.match(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/); // Names
          
          if (hasResumeKeyword || looksLikeResumeContent) {
            extractedText += cleanLine + ' ';
          }
        }
      }
      
      console.log('Final fallback extraction yielded:', extractedText.length, 'characters');
    }
    
    // Clean up the final result
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .trim();
    
    console.log('Final DOCX extraction result:');
    console.log('- Length:', extractedText.length);
    console.log('- Preview (first 500 chars):', extractedText.substring(0, 500));
    
    // Validate extraction quality
    if (extractedText.length < 50) {
      console.log('Extraction yielded insufficient content');
      return `⚠️ Limited Content Extracted from DOCX

Document: ${arrayBuffer.byteLength} bytes processed

The DOCX file was processed but yielded minimal readable text. This can happen with:
• Documents with complex formatting or embedded objects
• Password-protected or encrypted files
• Files with mostly images/graphics
• Corrupted or non-standard DOCX structure

💡 Recommended solutions:
1. Try saving as a simpler Word document format
2. Convert to PDF format for better text extraction
3. Copy and paste the content into a plain text document
4. Ensure the document contains readable text content

The AI will still attempt to enhance based on available content and common resume patterns.`;
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('DOCX extraction failed:', error);
    return `❌ DOCX Processing Error

Failed to extract text from DOCX file.

Error: ${error.message}
Document size: ${(arrayBuffer.byteLength / 1024).toFixed(1)} KB

🔧 Recommended solutions:
1. Re-save the document in Microsoft Word
2. Convert to PDF format for better compatibility
3. Ensure the file isn't corrupted or password-protected
4. Try a different DOCX file

The system will still attempt enhancement based on document structure patterns.`;
  }
}