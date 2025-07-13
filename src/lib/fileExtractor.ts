import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  // Add timeout to prevent infinite loading
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('File processing timeout - file may be too large or complex')), 30000) // 30 second timeout
  );

  try {
    const extractionPromise = (async () => {
      if (fileType.includes('text') || fileName.endsWith('.txt')) {
        // Handle text files
        return await file.text();
      } 
      else if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
        // Handle PDF files
        return await extractTextFromPDF(file);
      }
      else if (fileType.includes('wordprocessingml') || fileName.endsWith('.docx')) {
        // Handle DOCX files (XML format)
        return await extractTextFromWord(file);
      }
      else if (fileName.endsWith('.doc')) {
        // Handle .doc files using mammoth (it actually supports both .doc and .docx)
        return await extractTextFromWord(file);
      }
      else {
        throw new Error(`Unsupported file type: ${fileType}. Please upload a PDF, DOCX, DOC, or TXT file.`);
      }
    })();

    // Race between extraction and timeout
    return await Promise.race([extractionPromise, timeoutPromise]);
    
  } catch (error) {
    console.error('Error extracting text from file:', error);
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('File processing is taking too long. Please try a smaller file or a different format.');
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error during file processing. Please check your connection and try again.');
      } else if (error.message.includes('Invalid PDF')) {
        throw new Error('The PDF file appears to be corrupted or password-protected. Please try a different file.');
      }
    }
    
    throw error;
  }
};

const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    // Limit processing to first 10 pages for performance
    const maxPages = Math.min(pdf.numPages, 10);
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    if (pdf.numPages > 10) {
      fullText += `\n[Note: Only first 10 pages processed for preview. Full document will be enhanced.]`;
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to process PDF file. Please ensure the file is not corrupted or password-protected.');
  }
};

const extractTextFromWord = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Word document extraction error:', error);
    throw new Error('Failed to process Word document. Please ensure the file is not corrupted or password-protected.');
  }
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