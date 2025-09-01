import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use CDN for reliability  
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.js';

interface PDFiOSRendererProps {
  file: File | string | Blob;
  className?: string;
  isFullscreen?: boolean;
}

export const PDFiOSRenderer = ({ file, className, isFullscreen = false }: PDFiOSRendererProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPDF();
  }, [file]);

  useEffect(() => {
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError(null);

      let url: string;
      let pdfData: ArrayBuffer;
      
      if (typeof file === 'string') {
        url = file;
        const response = await fetch(file);
        pdfData = await response.arrayBuffer();
      } else {
        url = URL.createObjectURL(file);
        pdfData = await file.arrayBuffer();
      }

      // Use PDF.js to get page count
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      setTotalPages(pdf.numPages);
      
      setPdfUrl(url);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError('Failed to load PDF document');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      // Navigate iframe to specific page
      updateIframePage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      // Navigate iframe to specific page
      updateIframePage(currentPage + 1);
    }
  };

  const updateIframePage = (pageNum: number) => {
    const iframe = document.querySelector('iframe[title="PDF Preview"]') as HTMLIFrameElement;
    if (iframe && pdfUrl) {
      // Use PDF.js viewer URL fragment to navigate to specific page
      iframe.src = `${pdfUrl}#page=${pageNum}&toolbar=0&navpanes=0&scrollbar=1&zoom=100`;
    }
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center">
          <p className="text-destructive mb-2">⚠️ {error}</p>
          <Button onClick={loadPDF} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Enhanced Controls for iOS */}
      <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentPage} of {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            variant="outline"
            size="sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <span className="text-sm text-muted-foreground">
          📄 PDF Preview (iOS Enhanced)
        </span>
      </div>

      {/* Enhanced PDF Display with iOS-specific optimizations */}
      <div 
        className={cn(
          "border rounded-lg bg-background relative shadow-lg",
          isFullscreen ? "border-0 rounded-none h-full w-full" : "mx-auto"
        )}
        style={isFullscreen ? { 
          height: '100%',
          width: '100%'
        } : { 
          height: '800px',
          width: '566px',
          maxWidth: '90vw'
        }}
      >
        {pdfUrl ? (
          <iframe
            src={`${pdfUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=1&zoom=100&view=FitV&pagemode=none`}
            className={cn(
              "rounded-lg",
              isFullscreen ? "w-full h-full rounded-none" : "w-full h-full"
            )}
            title="PDF Preview"
            style={{ 
              border: 'none',
              WebkitOverflowScrolling: 'touch', // iOS smooth scrolling
              ...(isFullscreen && {
                transform: 'scale(1)',
                transformOrigin: 'top left',
                width: '100%',
                height: '100%'
              })
            }}
            onLoad={() => {
              // Ensure we're on the correct page after load
              setTimeout(() => updateIframePage(currentPage), 100);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Unable to display PDF</p>
          </div>
        )}
      </div>
    </div>
  );
};