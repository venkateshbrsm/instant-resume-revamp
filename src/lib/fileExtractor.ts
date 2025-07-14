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
  console.log('Converting PDF to DOCX for reliable text extraction:', file.name, 'Size:', file.size);
  
  try {
    // Step 1: Convert PDF to DOCX using CloudConvert  
    const formData = new FormData();
    formData.append('file', file);

    console.log('Converting PDF to DOCX...');

    const { data: conversionData, error: conversionError } = await supabase.functions.invoke('convert-pdf-to-docx', {
      body: formData,
    });

    if (conversionError) {
      console.error('PDF to DOCX conversion error:', conversionError);
      throw new Error(`PDF conversion failed: ${conversionError.message}`);
    }

    if (!conversionData.success) {
      console.error('PDF conversion failed:', conversionData.error);  
      throw new Error(`PDF conversion failed: ${conversionData.error}`);
    }

    console.log('PDF converted to DOCX successfully, processing text...');

    // Step 2: Extract text from the converted DOCX
    const docxBase64 = conversionData.docxData;
    const docxArrayBuffer = Uint8Array.from(atob(docxBase64), c => c.charCodeAt(0)).buffer;
    
    const result = await mammoth.extractRawText({ arrayBuffer: docxArrayBuffer });
    
    console.log('Text extracted from converted DOCX, length:', result.value.length);
    return result.value;

  } catch (error) {
    console.error('PDF processing failed:', error);
    
    return `📄 PDF Resume: ${file.name}

File Details:
- Size: ${(file.size / 1024).toFixed(1)} KB
- Type: ${file.type}
- Uploaded: ${new Date().toLocaleString()}

❌ PDF Processing Error

Unable to process this PDF file with Google Cloud Document AI.

💡 Try instead:
• Save as .docx format from your word processor
• Use a different PDF file
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