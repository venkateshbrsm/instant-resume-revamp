import * as mammoth from 'mammoth';
import { supabase } from "@/integrations/supabase/client";
// Note: PDF.js import removed to avoid worker configuration issues
// PDF text extraction now handled by backend services
import { extractPhotosFromFile, optimizePhoto } from './photoExtractor';

export interface ExtractedContent {
  text: string;
  pdfUrl?: string; // For visual preview
  profilePhotoUrl?: string; // Profile photo if found
  originalFile: File;
  fileType: 'pdf' | 'txt' | 'docx';
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
    let profilePhotoUrl: string | undefined;

    // Extract photos in parallel with text
    const photoExtractionPromise = extractPhotosFromFile(file);

    if (fileType === 'pdf') {
      // For PDFs, extract text and keep original file for visual preview
      text = await extractTextFromPDF(file);
      pdfUrl = URL.createObjectURL(file);
    } else if (fileType === 'docx') {
      // For DOCX files, extract text using enhanced server-side processing
      text = await extractTextFromDOCX(file);
      // Create blob URL for DOCX preview (browsers can often display DOCX files)
      pdfUrl = URL.createObjectURL(file);
    } else {
      // For text files, just extract text
      text = await file.text();
    }

    // Process photos
    try {
      const photoResult = await photoExtractionPromise;
      if (photoResult.profilePhoto) {
        console.log('Profile photo found, optimizing...');
        const optimizedPhoto = await optimizePhoto(photoResult.profilePhoto);
        profilePhotoUrl = URL.createObjectURL(optimizedPhoto);
        console.log('Profile photo processed successfully');
      }
    } catch (error) {
      console.warn('Photo extraction failed:', error);
    }

    return {
      text,
      pdfUrl,
      profilePhotoUrl,
      originalFile: file,
      fileType
    };
  } catch (error) {
    console.error('Error extracting content from file:', error);
    throw error;
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
      return await extractTextFromDOCX(file);
    }
    else if (fileName.endsWith('.doc')) {
      console.log('Legacy .doc file detected');
      throw new Error('Legacy .doc files are not supported. Please convert your document to PDF or text format and try again.');
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

    const { data, error } = await supabase.functions.invoke('extract-pdf-ilovepdf', {
      body: formData,
    });
    
    if (error) {
      console.error('PDF extraction request failed:', error);
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
    
    if (!data) {
      console.error('PDF extraction request failed: No data returned');
      throw new Error('PDF extraction failed: No data returned');
    }

    const extractionData = data;

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
• Convert to PDF format from your word processor
• Use a different PDF file
• Ensure the file isn't corrupted or password-protected

The resume enhancement will still attempt to process the document.`;
  }
};



export const formatResumeText = (text: string, fileName: string): string => {
  if (!text || text.trim().length < 10) {
    return `📄 Resume Document: ${fileName}\n\nFile uploaded successfully, but text extraction was limited. The AI enhancement will process the document content directly.\n\nNote: Some file formats may not display preview text, but the enhancement process will work with the original document content.`;
  }

  // Return content as-is to preserve original formatting
  return text;
};

export const getFileType = (file: File): 'pdf' | 'txt' | 'docx' => {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  
  if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
    return 'pdf';
  } else if (fileType.includes('wordprocessingml') || fileName.endsWith('.docx')) {
    return 'docx';
  } else {
    return 'txt';
  }
};

const extractTextFromDOCX = async (file: File): Promise<string> => {
  console.log('Extracting text from DOCX using enhanced server-side processing:', file.name, 'Size:', file.size);
  
  try {
    // Use server-side edge function for robust DOCX text extraction
    const formData = new FormData();
    formData.append('file', file);

    console.log('Sending DOCX to server-side processor...');

    const { data, error } = await supabase.functions.invoke('extract-docx', {
      body: formData,
    });
    
    if (error) {
      console.error('DOCX extraction request failed:', error);
      throw new Error(`DOCX extraction failed: ${error.message}`);
    }
    
    if (!data) {
      console.error('DOCX extraction request failed: No data returned');
      throw new Error('DOCX extraction failed: No data returned');
    }

    if (!data.success) {
      console.error('DOCX extraction failed:', data.error);
      throw new Error(`DOCX extraction failed: ${data.error}`);
    }

    console.log('DOCX extraction completed successfully');
    return data.extractedText || 'Text extracted successfully from DOCX';

  } catch (error) {
    console.error('DOCX processing failed:', error);
    
    return `📄 DOCX Resume: ${file.name}

File Details:
- Size: ${(file.size / 1024).toFixed(1)} KB
- Type: ${file.type}
- Uploaded: ${new Date().toLocaleString()}

❌ DOCX Processing Error

Unable to process this DOCX file with server-side extraction.

💡 Try instead:
• Convert to PDF format from your word processor
• Use a different DOCX file
• Ensure the file isn't corrupted or password-protected

The resume enhancement will still attempt to process the document.`;
  }
};