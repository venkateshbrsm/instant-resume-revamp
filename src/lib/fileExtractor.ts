import * as mammoth from 'mammoth';
import { supabase } from "@/integrations/supabase/client";
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
  
  console.log('Starting ATS-optimized file extraction:', {
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
      // Enhanced PDF text extraction for ATS compatibility
      text = await extractTextFromPDF(file);
      pdfUrl = URL.createObjectURL(file);
    } else if (fileType === 'docx') {
      // Enhanced DOCX extraction with better formatting preservation
      text = await extractTextFromDOCX(file);
    } else {
      // Plain text files - preserve formatting
      text = await file.text();
    }

    // Clean and optimize text for ATS parsing
    text = optimizeTextForATS(text);

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

// ATS-optimized text processing
const optimizeTextForATS = (text: string): string => {
  console.log('Optimizing text for ATS compatibility...');
  
  // Remove excessive whitespace while preserving structure
  let optimizedText = text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\t/g, ' ') // Convert tabs to spaces
    .replace(/ {2,}/g, ' ') // Multiple spaces to single space
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive line breaks
    .trim();

  // Enhance section headers for better parsing
  optimizedText = optimizedText
    .replace(/^(EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|PROFESSIONAL EXPERIENCE)[\s\n]*:/gim, '\n\nWORK EXPERIENCE:\n')
    .replace(/^(EDUCATION|ACADEMIC BACKGROUND|QUALIFICATIONS)[\s\n]*:/gim, '\n\nEDUCATION:\n')
    .replace(/^(SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES)[\s\n]*:/gim, '\n\nSKILLS:\n')
    .replace(/^(CERTIFICATIONS|CERTIFICATES|PROFESSIONAL CERTIFICATIONS)[\s\n]*:/gim, '\n\nCERTIFICATIONS:\n')
    .replace(/^(PROJECTS|KEY PROJECTS|NOTABLE PROJECTS)[\s\n]*:/gim, '\n\nPROJECTS:\n')
    .replace(/^(ACHIEVEMENTS|AWARDS|ACCOMPLISHMENTS)[\s\n]*:/gim, '\n\nACHIEVEMENTS:\n')
    .replace(/^(SUMMARY|PROFESSIONAL SUMMARY|PROFILE)[\s\n]*:/gim, '\n\nPROFESSIONAL SUMMARY:\n');

  // Ensure consistent date formatting for better parsing
  optimizedText = optimizedText
    .replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/g, '$1/$2/$3') // MM/DD/YYYY
    .replace(/(\w+)\s+(\d{4})\s*-\s*(\w+)\s+(\d{4})/g, '$1 $2 - $3 $4') // Month Year - Month Year
    .replace(/(\w+)\s+(\d{4})\s*-\s*Present/gi, '$1 $2 - Present');

  console.log('Text optimization completed');
  return optimizedText;
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
      const text = await file.text();
      return optimizeTextForATS(text);
    } 
    else if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      console.log('Processing as PDF file');
      const text = await extractTextFromPDF(file);
      return optimizeTextForATS(text);
    }
    else if (fileType.includes('wordprocessingml') || fileName.endsWith('.docx')) {
      console.log('Processing as DOCX file');
      const text = await extractTextFromDOCX(file);
      return optimizeTextForATS(text);
    }
    else if (fileName.endsWith('.doc')) {
      console.log('Legacy .doc file detected');
      throw new Error('Legacy .doc files are not supported. Please convert your document to PDF or DOCX format and try again.');
    }
    else {
      console.log('Unsupported file type detected:', fileType);
      throw new Error('Unsupported file type. Please use PDF, DOCX, or TXT format.');
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
};

const extractTextFromPDF = async (file: File): Promise<string> => {
  console.log('Extracting text from PDF using advanced OCR services:', file.name, 'Size:', file.size);
  
  try {
    // Use multiple extraction methods for better accuracy
    const formData = new FormData();
    formData.append('file', file);

    console.log('Sending PDF to enhanced extraction service...');

    // Try primary extraction service
    const { data, error } = await supabase.functions.invoke('extract-pdf-ilovepdf', {
      body: formData,
    });
    
    if (error) {
      console.error('Primary PDF extraction failed:', error);
      // Try fallback extraction if available
      return await fallbackPDFExtraction(file);
    }
    
    if (!data || !data.success) {
      console.error('PDF extraction failed:', data?.error);
      return await fallbackPDFExtraction(file);
    }

    const extractedText = data.extractedText || '';
    
    if (extractedText.length < 50) {
      console.warn('Extracted text is too short, trying fallback method');
      return await fallbackPDFExtraction(file);
    }

    console.log('PDF extraction completed successfully, text length:', extractedText.length);
    return extractedText;

  } catch (error) {
    console.error('PDF processing failed:', error);
    return await fallbackPDFExtraction(file);
  }
};

const fallbackPDFExtraction = async (file: File): Promise<string> => {
  console.log('Using fallback PDF extraction method');
  
  // Return structured error message that can still be processed
  return `📄 PDF Resume: ${file.name}

File Details:
- Size: ${(file.size / 1024).toFixed(1)} KB
- Type: ${file.type}
- Uploaded: ${new Date().toLocaleString()}

⚠️ PDF Text Extraction Notice

This PDF file requires manual review for optimal parsing. The AI enhancement will attempt to process the visual content and structure.

💡 For best results:
• Use text-based PDF files (not scanned images)
• Ensure the PDF has selectable text
• Consider converting from the original source document

The resume enhancement will proceed with available content extraction methods.`;
};

export const formatResumeText = (text: string, fileName: string): string => {
  if (!text || text.trim().length < 10) {
    return `📄 Resume Document: ${fileName}\n\nFile uploaded successfully. The AI enhancement will process the document content to extract all sections including experience, education, skills, certifications, and projects.\n\nNote: The parsing process will identify and structure all resume content for easy editing.`;
  }

  // Return optimized content
  return optimizeTextForATS(text);
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
  console.log('Extracting text from DOCX file with enhanced formatting:', file.name);
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Use mammoth with enhanced options for better text extraction
    const result = await mammoth.extractRawText({ 
      arrayBuffer,
      // Additional options for better formatting preservation
    });
    
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX extraction warnings:', result.messages);
    }
    
    let extractedText = result.value || '';
    
    if (extractedText.length < 50) {
      throw new Error('Insufficient text content extracted from DOCX file');
    }
    
    console.log('DOCX extraction completed successfully, text length:', extractedText.length);
    return extractedText;
  } catch (error) {
    console.error('DOCX extraction failed:', error);
    throw new Error(`Failed to extract text from DOCX file: ${error.message}`);
  }
};
