import * as mammoth from 'mammoth';
import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractedContent {
  text: string;
  pdfUrl?: string; // For visual preview
  originalFile: File;
  fileType: 'docx' | 'pdf' | 'txt';
}

// Enhanced function that returns both text and PDF URL for visual preview
export const extractContentFromFile = async (file: File): Promise<ExtractedContent> => {
  const fileType = getFileType(file);
  
  console.log('Starting enhanced file extraction:', {
    name: file.name,
    type: file.type,
    size: file.size,
    detectedType: fileType
  });

  try {
    let text: string;
    let pdfUrl: string | undefined;

    if (fileType === 'pdf') {
      // For PDFs, extract text and keep original file for visual preview
      text = await extractTextFromPDF(file);
      pdfUrl = URL.createObjectURL(file);
    } else if (fileType === 'docx') {
      // For DOCX, extract text and convert to PDF for visual preview
      text = await extractTextFromWord(file);
      pdfUrl = await convertDocxToPdf(file);
    } else {
      // For text files, just extract text
      text = await file.text();
    }

    return {
      text,
      pdfUrl,
      originalFile: file,
      fileType
    };
  } catch (error) {
    console.error('Error extracting content from file:', error);
    throw error;
  }
};

// Convert DOCX to PDF using the new edge function
const convertDocxToPdf = async (file: File): Promise<string | undefined> => {
  try {
    console.log('Converting DOCX to PDF for visual preview...');
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://goorszhscvxywfigydfp.supabase.co/functions/v1/convert-docx-to-pdf', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvb3JzemhzY3Z4eXdmaWd5ZGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjI5NzgsImV4cCI6MjA2Nzk5ODk3OH0.RVgMvTUS_16YAjsZreolaAoqfKVy4DdrjwWsjOOjaSI`,
      },
      body: formData,
    });

    if (!response.ok) {
      console.warn('DOCX to PDF conversion failed, using text preview fallback');
      return undefined;
    }

    const result = await response.json();
    
    if (!result.success) {
      console.warn('DOCX to PDF conversion failed:', result.error);
      return undefined;
    }

    // Convert base64 to blob URL
    const pdfData = atob(result.pdfData);
    const pdfArray = new Uint8Array(pdfData.length);
    for (let i = 0; i < pdfData.length; i++) {
      pdfArray[i] = pdfData.charCodeAt(i);
    }
    
    const pdfBlob = new Blob([pdfArray], { type: 'application/pdf' });
    return URL.createObjectURL(pdfBlob);
    
  } catch (error) {
    console.warn('DOCX to PDF conversion failed:', error);
    return undefined;
  }
};

// Keep the original function for backward compatibility
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
  console.log('Extracting text from PDF using Adobe PDF Services:', file.name, 'Size:', file.size);
  
  try {
    // Use Adobe PDF Services to extract text from PDF
    const formData = new FormData();
    formData.append('file', file);

    console.log('Sending PDF to Adobe PDF Services...');

    // Use direct fetch instead of supabase.functions.invoke to preserve FormData
    const response = await fetch('https://goorszhscvxywfigydfp.supabase.co/functions/v1/extract-pdf-ilovepdf', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvb3JzemhzY3Z4eXdmaWd5ZGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjI5NzgsImV4cCI6MjA2Nzk5ODk3OH0.RVgMvTUS_16YAjsZreolaAoqfKVy4DdrjwWsjOOjaSI`,
      },
      body: formData,
    });

    if (!response.ok) {
      console.error('Adobe PDF Services request failed:', response.status, response.statusText);
      throw new Error(`PDF extraction failed: ${response.statusText}`);
    }

    const extractionData = await response.json();

    if (!extractionData.success) {
      console.error('PDF extraction failed:', extractionData.error);
      throw new Error(`PDF extraction failed: ${extractionData.error}`);
    }

    console.log('PDF extraction completed successfully');
    return extractionData.extractedText || 'Text extracted successfully from PDF';

  } catch (error) {
    console.error('PDF processing failed:', error);
    
    return `📄 PDF Resume: ${file.name}

File Details:
- Size: ${(file.size / 1024).toFixed(1)} KB
- Type: ${file.type}
- Uploaded: ${new Date().toLocaleString()}

❌ PDF Processing Error

Unable to process this PDF file with Adobe PDF Services.

💡 Try instead:
• Save as .docx format from your word processor
• Use a different PDF file
• Ensure the file isn't corrupted or password-protected

The resume enhancement will still attempt to process the document.`;
  }
};

const extractTextFromWord = async (file: File): Promise<string> => {
  console.log('Extracting text from DOCX file:', file.name);
  const arrayBuffer = await file.arrayBuffer();
  
  try {
    // Use extractRawText to get plain text content instead of HTML
    const result = await mammoth.extractRawText({ arrayBuffer });
    console.log('DOCX extraction successful, text length:', result.value?.length || 0);
    
    if (!result.value || result.value.trim().length < 10) {
      console.warn('Very little text extracted from DOCX, trying HTML conversion as fallback');
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
      // Strip HTML tags to get plain text
      const plainText = htmlResult.value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      console.log('HTML fallback extraction, text length:', plainText.length);
      return plainText || `DOCX file: ${file.name}`;
    }
    
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    return `DOCX file: ${file.name}`;
  }
};

export const formatResumeText = (text: string, fileName: string): string => {
  if (!text || text.trim().length < 10) {
    return `📄 Resume Document: ${fileName}\n\nFile uploaded successfully, but text extraction was limited. The AI enhancement will process the document content directly.\n\nNote: Some file formats may not display preview text, but the enhancement process will work with the original document content.`;
  }

  // Return content as-is to preserve original formatting
  return text;
};

export const getFileType = (file: File): 'docx' | 'pdf' | 'txt' => {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  
  if (fileType.includes('wordprocessingml') || fileName.endsWith('.docx')) {
    return 'docx';
  } else if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
    return 'pdf';
  } else {
    return 'txt';
  }
};