import DOMPurify from 'dompurify';
import { PDFViewer } from './PDFViewer';
import { ExtractedContent } from '@/lib/fileExtractor';

interface RichDocumentPreviewProps {
  content: string | ExtractedContent;
  fileType?: 'docx' | 'pdf' | 'txt';
  fileName: string;
}

export const RichDocumentPreview = ({ content, fileType, fileName }: RichDocumentPreviewProps) => {
  // Handle both legacy string content and new ExtractedContent
  const extractedContent = typeof content === 'string' ? null : content;
  const textContent = typeof content === 'string' ? content : content.text;
  const actualFileType = fileType || extractedContent?.fileType || 'txt';

  const renderContent = () => {
    // If we have a PDF URL and it's a PDF or converted DOCX, show PDF viewer
    if (extractedContent?.pdfUrl) {
      return <PDFViewer file={extractedContent.pdfUrl} className="w-full" />;
    }

    // Otherwise, render based on file type
    switch (actualFileType) {
      case 'docx':
        // Sanitize and render HTML content for DOCX files
        const sanitizedHTML = DOMPurify.sanitize(textContent, {
          ALLOWED_TAGS: ['p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'div', 'span'],
          ALLOWED_ATTR: ['class', 'style'],
          ALLOW_DATA_ATTR: false
        });
        
        return (
          <div 
            className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-li:text-foreground"
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          />
        );
        
      case 'pdf':
        // For PDFs without PDF URL, display as structured text
        return (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {textContent}
          </div>
        );
        
      case 'txt':
        // For text files, preserve exact formatting
        return (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground font-mono">
            {textContent}
          </div>
        );
        
      default:
        return (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {textContent}
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b">
        <div className="w-8 h-10 bg-primary/10 rounded-sm flex items-center justify-center">
          <span className="text-xs font-medium text-primary">
            {actualFileType.toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-medium text-foreground">Original Document</h3>
          <p className="text-sm text-muted-foreground">File: {fileName}</p>
        </div>
      </div>
      <div className="overflow-y-auto max-h-[600px] pr-2">
        {renderContent()}
      </div>
    </div>
  );
};