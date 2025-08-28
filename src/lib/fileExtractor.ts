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
      // For DOCX files, extract text and create preview URL
      text = await extractTextFromDOCX(file);
      // Create blob URL for DOCX preview (similar to PDF)
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
  console.log('Extracting text from DOCX using mammoth:', file.name, 'Size:', file.size);
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (result.messages && result.messages.length > 0) {
      console.warn('DOCX extraction warnings:', result.messages);
    }
    
    console.log('Mammoth extraction completed');
    console.log('Raw text length:', result.value?.length || 0);
    console.log('Sample text (first 200 chars):', result.value?.substring(0, 200));
    
    if (!result.value || result.value.trim().length < 10) {
      console.log('Mammoth extraction yielded minimal content, trying edge function...');
      
      // Fallback to edge function if mammoth fails
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('extract-docx', {
        body: formData,
      });
      
      if (error) {
        console.error('Edge function fallback failed:', error);
      } else if (data?.success && data?.extractedText) {
        console.log('Edge function fallback successful, text length:', data.extractedText.length);
        return data.extractedText;
      }
    }
    
    const extractedText = result.value || '';
    
    // If we still have very little content, provide a meaningful response
    if (extractedText.trim().length < 10) {
      return `📄 Resume Document: ${file.name}

File Details:
- Size: ${(file.size / 1024).toFixed(1)} KB
- Type: ${file.type}
- Processed: ${new Date().toLocaleString()}

⚠️ Text Extraction Notice
The document was processed but yielded limited extractable text. This can happen with:
• Complex formatting or embedded images
• Protected or encrypted documents  
• Non-standard DOCX structure

💡 For Better Results:
• Try saving as a simpler Word document
• Convert to PDF format
• Ensure the document contains readable text

The AI enhancement will still work with the document structure and attempt to create a professional resume based on common resume patterns.`;
    }
    
    console.log('DOCX extraction successful, final text length:', extractedText.length);
    return extractedText;

  } catch (error) {
    console.error('DOCX extraction failed:', error);
    
    return `📄 Resume Processing Error: ${file.name}

Error Details: ${error.message}

File Information:
- Size: ${(file.size / 1024).toFixed(1)} KB
- Type: ${file.type}

❌ Document Processing Failed

This can occur due to:
• Corrupted DOCX file
• Unsupported document format
• Complex document structure

🔧 Troubleshooting Steps:
1. Try re-saving the document in Word
2. Convert to PDF format for better compatibility
3. Ensure the file isn't password protected
4. Use a simpler document template

Please try uploading a different version of your resume or convert to PDF format.`;
  }
};