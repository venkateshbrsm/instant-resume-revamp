import * as mammoth from 'mammoth';
import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from 'pdfjs-dist';
import { extractPhotosFromFile, optimizePhoto } from './photoExtractor';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractedContent {
  text: string;
  pdfUrl?: string; // For visual preview
  profilePhotoUrl?: string; // Profile photo if found
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
    let profilePhotoUrl: string | undefined;

    // Extract photos in parallel with text
    const photoExtractionPromise = extractPhotosFromFile(file);

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
  console.log('Extracting text from DOCX file:', file.name, 'Size:', file.size);
  
  // Validate file first
  if (file.size === 0) {
    throw new Error('DOCX file is empty');
  }
  
  if (file.size > 50 * 1024 * 1024) { // 50MB limit
    throw new Error('DOCX file is too large (max 50MB)');
  }
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);
    
    // Validate ArrayBuffer
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Unable to read DOCX file content');
    }
    
    // Multiple extraction strategies
    const extractionResults = await tryMultipleExtractionMethods(arrayBuffer, file.name);
    
    // Validate extracted content
    const bestResult = validateAndSelectBestContent(extractionResults, file.name);
    
    console.log('Final extracted content length:', bestResult.length);
    console.log('Content preview (first 200 chars):', bestResult.substring(0, 200));
    
    return bestResult;
    
  } catch (error) {
    console.error('Critical error extracting text from DOCX:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Return formatted error with guidance instead of minimal fallback
    return `📄 DOCX Resume: ${file.name}

⚠️ Text Extraction Issues

Unable to extract text content from this DOCX file.

🔧 Please try:
• Re-saving the document in your word processor
• Saving as a different DOCX file
• Converting to PDF format instead
• Ensuring the file isn't corrupted or password-protected

File Details:
- Size: ${(file.size / 1024).toFixed(1)} KB
- Type: ${file.type}

The enhancement process will still attempt to work with the document.`;
  }
};

// Try multiple extraction methods for better compatibility
async function tryMultipleExtractionMethods(arrayBuffer: ArrayBuffer, fileName: string) {
  const results = [];
  
  // Method 1: extractRawText (preferred)
  try {
    console.log('Trying Method 1: extractRawText...');
    const result = await mammoth.extractRawText({ arrayBuffer });
    if (result.value && result.value.trim().length > 0) {
      console.log('Method 1 success, length:', result.value.length);
      results.push({
        method: 'extractRawText',
        content: result.value.trim(),
        messages: result.messages || []
      });
    }
  } catch (error) {
    console.warn('Method 1 (extractRawText) failed:', error.message);
  }
  
  // Method 2: convertToHtml then strip tags
  try {
    console.log('Trying Method 2: HTML conversion...');
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
    if (htmlResult.value) {
      // More aggressive HTML tag removal and text cleaning
      const plainText = htmlResult.value
        .replace(/<[^>]*>/g, ' ')           // Remove HTML tags
        .replace(/&[^;]+;/g, ' ')          // Remove HTML entities
        .replace(/\s+/g, ' ')              // Normalize whitespace
        .trim();
      
      if (plainText.length > 0) {
        console.log('Method 2 success, length:', plainText.length);
        results.push({
          method: 'htmlConversion',
          content: plainText,
          messages: htmlResult.messages || []
        });
      }
    }
  } catch (error) {
    console.warn('Method 2 (HTML conversion) failed:', error.message);
  }
  
  // Method 3: Try HTML conversion with different options
  try {
    console.log('Trying Method 3: HTML conversion with image handling...');
    const options = {
      convertImage: mammoth.images.dataUri
    };
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer }, options);
    if (htmlResult.value) {
      // Extract text more aggressively, preserving structure
      const plainText = htmlResult.value
        .replace(/<img[^>]*>/g, '[IMAGE]')   // Replace images with placeholder
        .replace(/<br\s*\/?>/gi, '\n')      // Convert breaks to newlines
        .replace(/<\/p>/gi, '\n\n')         // Convert paragraph ends to double newlines
        .replace(/<[^>]*>/g, ' ')           // Remove remaining HTML tags
        .replace(/&[^;]+;/g, ' ')          // Remove HTML entities
        .replace(/\s+/g, ' ')              // Normalize whitespace
        .replace(/\n\s+/g, '\n')           // Clean up line starts
        .trim();
      
      if (plainText.length > 0) {
        console.log('Method 3 success, length:', plainText.length);
        results.push({
          method: 'htmlConversionAdvanced',
          content: plainText,
          messages: htmlResult.messages || []
        });
      }
    }
  } catch (error) {
    console.warn('Method 3 (HTML conversion advanced) failed:', error.message);
  }
  
  console.log('Extraction methods completed. Results:', results.length);
  return results;
}

// Validate and select the best extracted content
function validateAndSelectBestContent(results: any[], fileName: string): string {
  if (results.length === 0) {
    console.warn('No extraction methods succeeded');
    return `DOCX file: ${fileName}`;
  }
  
  // Score each result based on content quality
  const scoredResults = results.map(result => {
    let score = 0;
    const content = result.content;
    
    // Length score (longer is generally better, but with diminishing returns)
    score += Math.min(content.length / 100, 50);
    
    // Content quality indicators
    if (content.includes('@')) score += 10; // Email
    if (/\b\d{4}\b/.test(content)) score += 5; // Years
    if (/\b(experience|skills?|education|resume|cv)\b/i.test(content)) score += 15;
    if (/\b(manager|engineer|developer|analyst|specialist)\b/i.test(content)) score += 10;
    if (/\b(company|corporation|inc|ltd|llc)\b/i.test(content)) score += 5;
    
    // Penalty for very short content
    if (content.length < 50) score -= 20;
    
    // Penalty for repetitive content
    const words = content.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    if (words.length > 0 && uniqueWords.size / words.length < 0.3) score -= 15;
    
    console.log(`Method ${result.method} scored: ${score}, length: ${content.length}`);
    
    return { ...result, score };
  });
  
  // Sort by score and return the best result
  scoredResults.sort((a, b) => b.score - a.score);
  const bestResult = scoredResults[0];
  
  console.log(`Selected best method: ${bestResult.method} with score: ${bestResult.score}`);
  
  // Final validation - ensure minimum content quality
  if (bestResult.content.trim().length < 10) {
    console.warn('Best result still has minimal content');
    return `DOCX file: ${fileName}\n\nMinimal text content detected. File may have formatting issues.`;
  }
  
  return bestResult.content;
}

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