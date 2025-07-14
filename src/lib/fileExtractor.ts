import * as mammoth from 'mammoth';
import { supabase } from "@/integrations/supabase/client";

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  console.log('Starting file extraction:', {
    name: file.name,
    type: fileType,
    size: file.size
  });

  try {
    if (fileType.includes('text') || fileName.endsWith('.txt')) {
      console.log('Processing as text file');
      return await file.text();
    } 
    else if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      console.log('Processing as PDF file');
      return await extractTextFromPDF(file);
    }
    else if (fileType.includes('wordprocessingml') || fileName.endsWith('.docx')) {
      console.log('Processing as DOCX file');
      return await extractTextFromWord(file);
    }
    else if (fileName.endsWith('.doc')) {
      console.log('Legacy .doc file detected');
      throw new Error('Legacy .doc files are not supported. Please convert your document to .docx, PDF, or text format and try again.');
    }
    else {
      console.log('Unsupported file type detected:', fileType);
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};

const extractTextFromPDF = async (file: File): Promise<string> => {
  console.log('Extracting PDF text using server-side processing:', file.name, 'Size:', file.size);
  
  const maxRetries = 3;
  const retryDelay = 3000; // 3 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`PDF extraction attempt ${attempt}/${maxRetries}`);
      
      // Create FormData to send the PDF file to our edge function
      const formData = new FormData();
      formData.append('file', file);

      console.log('Calling PDF extraction edge function...');

      // Call the edge function to extract PDF text
      const { data, error } = await supabase.functions.invoke('extract-pdf-text', {
        body: formData,
      });

      if (error) {
        console.error('PDF extraction edge function error:', error);
        throw new Error(`PDF processing failed: ${error.message}`);
      }

      if (data.success && data.extractedText) {
        console.log('PDF text extracted successfully, length:', data.extractedText.length);
        return data.extractedText;
      } else {
        console.error('PDF processing failed:', data.error);
        
        // If service is unavailable and we have retries left, wait and retry
        if (data.isServiceUnavailable && attempt < maxRetries) {
          console.log(`Service unavailable, retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        // Return the error content from the server
        return data.extractedText || `📄 PDF Processing Failed

The PDF could not be processed. Please try:
• Converting to .docx format for instant processing
• Re-uploading the file
• Waiting a moment and trying again`;
      }

    } catch (error) {
      console.error(`PDF extraction failed (attempt ${attempt}):`, error);
      
      // If it's a network/timeout error and we have retries left, wait and retry
      if (attempt < maxRetries && error instanceof Error && (
          error.message.includes('fetch') ||
          error.message.includes('network') ||
          error.message.includes('timeout') ||
          error.message.includes('Failed to fetch')
        )) {
        console.log(`Network error, retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      // If we're out of retries or it's not a retryable error, return fallback
      break;
    }
  }
  
  // Fallback message if all attempts failed
  return `📄 PDF Resume: ${file.name}

File Details:
- Size: ${(file.size / 1024).toFixed(1)} KB
- Type: ${file.type}
- Uploaded: ${new Date().toLocaleString()}

🔄 OCR Service Temporarily Unavailable

The enhanced PDF processing service is currently starting up. This is normal for free hosting services.

⏱️ What to do:
• Wait 1-2 minutes and try uploading again
• Convert to .docx format for immediate processing
• The service will stay active once warmed up

💡 Tip: .docx files process instantly without needing the OCR service!`;
};

const extractTextFromWord = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

export const formatResumeText = (text: string, fileName: string): string => {
  if (!text || text.trim().length < 10) {
    return `📄 Resume Document: ${fileName}\n\nFile uploaded successfully, but text extraction was limited. The AI enhancement will process the document content directly.\n\nNote: Some file formats may not display preview text, but the enhancement process will work with the original document content.`;
  }

  // Clean and format the extracted text - show full content
  const cleanedText = text
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/(.{80})/g, '$1\n') // Add line breaks for readability
    .trim();

  // Show full content without truncation
  return `📄 Original Resume Content\n\nFilename: ${fileName}\nExtracted Text:\n\n${cleanedText}`;
};