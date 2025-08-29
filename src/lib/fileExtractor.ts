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
  console.log('🔍 Extracting text from PDF:', file.name, 'Size:', file.size);
  
  try {
    // Use multiple extraction services with fallback
    const formData = new FormData();
    formData.append('file', file);

    console.log('📤 Trying primary PDF extraction service...');

    // Try the cloud extraction service first (alternative to Adobe)
    let data, error;
    try {
      const result = await supabase.functions.invoke('extract-pdf-cloud', {
        body: formData,
      });
      data = result.data;
      error = result.error;
    } catch (primaryError) {
      console.warn('❌ Primary extraction service failed:', primaryError);
      
      // Fallback to text extraction service
      console.log('📤 Trying fallback PDF extraction service...');
      try {
        const result = await supabase.functions.invoke('extract-pdf-text', {
          body: formData,
        });
        data = result.data;
        error = result.error;
      } catch (fallbackError) {
        console.error('❌ All extraction services failed:', fallbackError);
        throw new Error('PDF extraction services are currently unavailable');
      }
    }
    
    if (error) {
      console.error('❌ PDF extraction request failed:', error);
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
    
    if (!data) {
      console.error('❌ No data returned from extraction service');
      throw new Error('PDF extraction failed: No data returned');
    }

    console.log('📄 Extraction response received:', { success: data.success, hasText: !!data.extractedText });

    if (!data.success) {
      console.error('❌ Extraction service failed:', data.error);
      throw new Error(`PDF extraction failed: ${data.error}`);
    }

    // Validate that we actually got meaningful text content
    const extractedText = data.extractedText || '';
    console.log('📝 Extracted text length:', extractedText.length);
    console.log('📝 Text preview (first 200 chars):', extractedText.substring(0, 200));
    
    if (extractedText.length < 10) {
      console.warn('⚠️ Very short text extracted, this may be a scanned PDF');
      return `📄 PDF Resume: ${file.name}

File Details:
- Size: ${(file.size / 1024).toFixed(1)} KB
- Type: ${file.type}
- Uploaded: ${new Date().toLocaleString()}

⚠️ Limited Text Extraction

This appears to be a scanned PDF or image-based document. Only ${extractedText.length} characters were extracted.

Original content: ${extractedText}

💡 For best results:
• Use a text-based PDF (not scanned)
• Convert from Word/Google Docs to PDF
• Ensure the PDF has selectable text

The AI will still attempt to enhance based on available content.`;
    }

    console.log('✅ PDF text extraction completed successfully');
    return extractedText;

  } catch (error) {
    console.error('❌ PDF processing failed:', error);
    
    return `📄 PDF Resume: ${file.name}

File Details:
- Size: ${(file.size / 1024).toFixed(1)} KB
- Type: ${file.type}
- Uploaded: ${new Date().toLocaleString()}

❌ PDF Processing Error

Error: ${error.message}

💡 Troubleshooting:
• Ensure the file isn't corrupted or password-protected
• Try converting to a different PDF format
• Use a text-based document instead of scanned images

The system will still attempt enhancement with available data.`;
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