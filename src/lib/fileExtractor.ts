import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun } from 'docx';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  console.log('Starting PDF text extraction for:', file.name, 'Size:', file.size);
  
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      console.error('PDF extraction timeout after 20 seconds');
      reject(new Error('PDF processing timed out. Please try a smaller PDF or convert to text format.'));
    }, 20000);

    try {
      const arrayBuffer = await file.arrayBuffer();
      console.log('PDF arrayBuffer created, size:', arrayBuffer.byteLength);
      
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0,
        disableAutoFetch: true,
        disableStream: true
      });
      
      const pdf = await loadingTask.promise;
      console.log('PDF loaded successfully, pages:', pdf.numPages);
      
      let fullText = '';
      const maxPages = Math.min(pdf.numPages, 20); // Process up to 20 pages for full content
      
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          console.log(`Processing page ${pageNum}/${maxPages}`);
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Extract text items and maintain some structure
          const pageText = textContent.items
            .map((item: any) => {
              if (item.str) {
                return item.str;
              }
              return '';
            })
            .filter(text => text.trim().length > 0)
            .join(' ');
          
          if (pageText.trim()) {
            fullText += `\n\n--- Page ${pageNum} ---\n${pageText}`;
          }
          
          // Clean up page reference
          page.cleanup();
        } catch (pageError) {
          console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
          fullText += `\n\n--- Page ${pageNum} ---\n[Text extraction failed for this page]`;
        }
      }

      // Add note if PDF was truncated
      if (pdf.numPages > maxPages) {
        fullText += `\n\n[Preview shows first ${maxPages} pages of ${pdf.numPages} total pages. Full document will be processed for enhancement.]`;
      }

      clearTimeout(timeout);
      console.log('PDF extraction completed, text length:', fullText.length);
      
      const finalText = fullText.trim();
      if (finalText.length < 50) {
        resolve(`📄 PDF Document: ${file.name}\n\nPDF processed but minimal text was extracted. This may be due to:\n- Image-based PDF (scanned document)\n- Password protection\n- Complex formatting\n\nThe AI enhancement will still work with your document structure.`);
      } else {
        resolve(finalText);
      }
      
    } catch (error) {
      clearTimeout(timeout);
      console.error('PDF extraction failed:', error);
      
      let errorMessage = 'Failed to extract text from PDF. ';
      if (error.message?.includes('Invalid PDF')) {
        errorMessage += 'The file appears to be corrupted or not a valid PDF.';
      } else if (error.message?.includes('password')) {
        errorMessage += 'The PDF is password-protected.';
      } else if (error.message?.includes('fetch') || error.message?.includes('worker')) {
        errorMessage += 'PDF processing service unavailable. Please try converting to DOCX format.';
      } else {
        errorMessage += 'Please try converting the PDF to text or DOCX format.';
      }
      
      reject(new Error(errorMessage));
    }
  });
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