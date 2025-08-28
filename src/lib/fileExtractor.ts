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
  
  console.log('🚀 [EXTRACTION] Starting enhanced file extraction:', {
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
      console.log('🔍 [EXTRACTION] Processing as PDF file');
      // For PDFs, extract text and keep original file for visual preview
      text = await extractTextFromPDF(file);
      pdfUrl = URL.createObjectURL(file);
    } else if (fileType === 'docx') {
      console.log('🔍 [EXTRACTION] Processing as DOCX file');
      // For DOCX files, extract text using enhanced server-side processing
      text = await extractTextFromDOCX(file);
      // Create blob URL for DOCX preview (browsers can often display DOCX files)
      pdfUrl = URL.createObjectURL(file);
    } else {
      console.log('🔍 [EXTRACTION] Processing as text file');
      // For text files, just extract text
      text = await file.text();
    }

    console.log('✅ [EXTRACTION] Text extraction completed, length:', text?.length || 0);
    console.log('🔍 [EXTRACTION] Text preview (first 200 chars):', text?.substring(0, 200));

    // Process photos
    try {
      const photoResult = await photoExtractionPromise;
      if (photoResult.profilePhoto) {
        console.log('📷 [EXTRACTION] Profile photo found, optimizing...');
        const optimizedPhoto = await optimizePhoto(photoResult.profilePhoto);
        profilePhotoUrl = URL.createObjectURL(optimizedPhoto);
        console.log('✅ [EXTRACTION] Profile photo processed successfully');
      } else {
        console.log('📷 [EXTRACTION] No profile photo found');
      }
    } catch (error) {
      console.warn('⚠️ [EXTRACTION] Photo extraction failed:', error);
    }

    const result = {
      text,
      pdfUrl,
      profilePhotoUrl,
      originalFile: file,
      fileType
    };
    
    console.log('🎉 [EXTRACTION] Complete extraction result:', {
      textLength: result.text?.length || 0,
      hasPdfUrl: !!result.pdfUrl,
      hasProfilePhoto: !!result.profilePhotoUrl,
      fileType: result.fileType
    });

    return result;
  } catch (error) {
    console.error('💥 [EXTRACTION] Error extracting content from file:', error);
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
  console.log('🔍 [DOCX] Starting DOCX extraction with mammoth:', file.name, 'Size:', file.size, 'Type:', file.type);
  
  try {
    // First try mammoth library (client-side)
    console.log('🔍 [DOCX] Attempting mammoth extraction...');
    const arrayBuffer = await file.arrayBuffer();
    
    // Import mammoth dynamically to ensure it's available
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    console.log('🔍 [DOCX] Mammoth extraction result:', {
      textLength: result.value?.length || 0,
      hasMessages: result.messages && result.messages.length > 0,
      messages: result.messages?.length || 0
    });
    
    if (result.messages && result.messages.length > 0) {
      console.warn('🔍 [DOCX] Mammoth extraction warnings:', result.messages);
    }
    
    let extractedText = result.value || '';
    
    // If mammoth worked well, use its result
    if (extractedText && extractedText.trim().length > 50) {
      console.log('✅ [DOCX] Mammoth extraction successful, text length:', extractedText.length);
      console.log('🔍 [DOCX] Mammoth text preview:', extractedText.substring(0, 200));
      return extractedText.trim();
    }
    
    // If mammoth didn't extract enough, fall back to edge function
    console.log('⚠️ [DOCX] Mammoth extraction insufficient, trying edge function fallback...');
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await supabase.functions.invoke('extract-docx', {
      body: formData,
    });
    
    console.log('🔍 [DOCX] Edge function response:', response);
    
    if (response.error) {
      console.error('❌ [DOCX] Edge function failed:', response.error);
      throw new Error(`DOCX extraction failed: ${response.error.message}`);
    }
    
    if (!response.data || !response.data.success) {
      console.error('❌ [DOCX] Edge function reported failure:', response.data?.error);
      throw new Error(`DOCX extraction failed: ${response.data?.error || 'Unknown error'}`);
    }

    const edgeExtractedText = response.data.extractedText || '';
    console.log('🔍 [DOCX] Edge function extracted text length:', edgeExtractedText.length);
    
    // Use the better result between mammoth and edge function
    if (edgeExtractedText.length > extractedText.length) {
      console.log('✅ [DOCX] Using edge function result (longer text)');
      extractedText = edgeExtractedText;
    } else if (extractedText.length > 0) {
      console.log('✅ [DOCX] Using mammoth result (better quality)');
    } else {
      console.log('⚠️ [DOCX] Both methods failed, using edge function result as fallback');
      extractedText = edgeExtractedText;
    }
    
    if (extractedText.length < 20) {
      throw new Error('Insufficient text extracted from DOCX file');
    }
    
    console.log('✅ [DOCX] Final extraction result length:', extractedText.length);
    console.log('🔍 [DOCX] Final text preview:', extractedText.substring(0, 300));
    return extractedText;

  } catch (error) {
    console.error('💥 [DOCX] All extraction methods failed:', error);
    console.error('💥 [DOCX] Error stack:', error.stack);
    
    return `📄 DOCX Resume: ${file.name}

File Details:
- Size: ${(file.size / 1024).toFixed(1)} KB
- Type: ${file.type}
- Uploaded: ${new Date().toLocaleString()}

❌ DOCX Processing Error

Unable to process this DOCX file. Both client-side and server-side extraction failed.

Error: ${error.message}

💡 Try instead:
• Convert to PDF format from your word processor
• Save as a newer DOCX format (.docx)
• Ensure the file isn't corrupted or password-protected
• Try copying content to a plain text document

The resume enhancement will still attempt to process any available content.`;
  }
};