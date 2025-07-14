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
  console.log('Processing PDF using cloud-based extraction:', file.name, 'Size:', file.size);
  
  try {
    // Create FormData to send the PDF file to our edge function
    const formData = new FormData();
    formData.append('file', file);

    console.log('Calling cloud PDF extraction edge function...');

    // Call the edge function for cloud-based PDF processing
    const { data, error } = await supabase.functions.invoke('extract-pdf-cloud', {
      body: formData,
    });

    if (error) {
      console.error('Cloud PDF extraction error:', error);
      throw new Error(`PDF cloud processing failed: ${error.message}`);
    }

    if (data.success && data.extractedText) {
      console.log('PDF text extracted successfully via cloud API, length:', data.extractedText.length);
      return data.extractedText;
    } else {
      console.error('Cloud PDF processing failed:', data.error);
      return data.extractedText || `📄 PDF Processing Failed

The cloud-based PDF processing could not extract text from this file.

💡 Try instead:
• Converting to .docx format for instant processing
• Using a text-based PDF (not scanned images)
• Ensuring the PDF isn't password-protected

The AI enhancement may still work with the document structure.`;
    }

  } catch (error) {
    console.error('PDF cloud extraction failed:', error);
    
    return `📄 PDF Resume: ${file.name}

File Details:
- Size: ${(file.size / 1024).toFixed(1)} KB
- Type: ${file.type}
- Uploaded: ${new Date().toLocaleString()}

❌ Cloud Processing Error

Unable to process this PDF using cloud services.

💡 Alternative options:
• Convert to .docx format for better processing
• Try a different PDF file
• Ensure the file isn't corrupted or password-protected

The resume enhancement will still attempt to process the document.`;
  }

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