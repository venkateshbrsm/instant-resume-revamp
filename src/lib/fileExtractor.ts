import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
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
  console.log('Extracting PDF text using client-side processing:', file.name, 'Size:', file.size);
  
  try {
    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    console.log(`PDF loaded successfully - ${pdf.numPages} pages`);
    
    let extractedText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items into readable format
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .trim();
        
        if (pageText) {
          extractedText += pageText + '\n\n';
        }
        
        console.log(`Extracted text from page ${pageNum}, length: ${pageText.length}`);
      } catch (pageError) {
        console.error(`Error extracting text from page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }
    
    // Clean up the extracted text
    extractedText = extractedText.trim();
    
    if (extractedText && extractedText.length > 20) {
      console.log('PDF text extracted successfully, total length:', extractedText.length);
      return extractedText;
    } else {
      // PDF might be image-based or protected
      return `📄 PDF Resume: ${file.name}

File Details:
- Size: ${(file.size / 1024).toFixed(1)} KB
- Pages: ${pdf.numPages}
- Uploaded: ${new Date().toLocaleString()}

⚠️ Limited Text Extraction

This PDF appears to be image-based or have limited extractable text. 

💡 For best results, try:
• Converting to .docx format using Word or Google Docs
• Using a text-based PDF instead of a scanned image
• Ensuring the PDF contains selectable text

The AI will still process what it can from the document.`;
    }
    
  } catch (error) {
    console.error('PDF extraction failed:', error);
    
    return `📄 PDF Resume: ${file.name}

File Details:
- Size: ${(file.size / 1024).toFixed(1)} KB
- Type: ${file.type}
- Uploaded: ${new Date().toLocaleString()}

❌ PDF Processing Error

Unable to process this PDF file. This might be due to:
• Password protection
• Corrupted file
• Unsupported PDF format

💡 Try instead:
• Converting to .docx format for instant processing
• Using a different PDF file
• Ensuring the file isn't password-protected

The resume enhancement may still work with the original file.`;
  }
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