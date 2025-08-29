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
      // For DOCX files, extract text using mammoth
      text = await extractTextFromDOCX(file);
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
  console.log('Extracting text from PDF using multiple methods:', file.name, 'Size:', file.size);
  
  // Try multiple extraction methods in order of preference
  const extractionMethods = [
    { name: 'ilovepdf', endpoint: 'extract-pdf-ilovepdf' },
    { name: 'cloud', endpoint: 'extract-pdf-cloud' },
    { name: 'text', endpoint: 'extract-pdf-text' }
  ];

  for (const method of extractionMethods) {
    try {
      console.log(`Trying ${method.name} extraction method...`);
      
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke(method.endpoint, {
        body: formData,
      });
      
      if (error) {
        console.warn(`${method.name} extraction failed:`, error);
        continue; // Try next method
      }
      
      if (data && data.success && data.extractedText && data.extractedText.trim().length > 50) {
        console.log(`PDF extraction completed successfully using ${method.name}`);
        return data.extractedText;
      }
      
      console.warn(`${method.name} returned insufficient text, trying next method`);
      
    } catch (error) {
      console.warn(`${method.name} extraction method failed:`, error);
      continue; // Try next method
    }
  }
  
  // If all methods fail, throw error instead of returning error message text
  console.error('All PDF extraction methods failed for file:', file.name);
  throw new Error(`Unable to extract text from PDF: ${file.name}. Please try converting to DOCX or TXT format.`);
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
  console.log('Extracting text from DOCX file:', file.name);
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX extraction warnings:', result.messages);
    }
    
    console.log('DOCX extraction completed successfully');
    return result.value || 'No text content found in DOCX file';
  } catch (error) {
    console.error('DOCX extraction failed:', error);
    throw new Error(`Failed to extract text from DOCX file: ${error.message}`);
  }
};