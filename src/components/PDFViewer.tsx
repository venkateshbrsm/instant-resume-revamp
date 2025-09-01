import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface PDFViewerProps {
  file: File | string | Blob; // File object, URL, or Blob
  className?: string;
  isFullscreen?: boolean; // Add prop to detect fullscreen mode
}

export const PDFViewer = ({ file, className, isFullscreen = false }: PDFViewerProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadPDF();
  }, [file]);

  useEffect(() => {
    // Cleanup URL when component unmounts
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
      
      if (typeof file === 'string') {
        // URL provided
        url = file;
      } else {
        // File or Blob object provided
        url = URL.createObjectURL(file);
      }

      setPdfUrl(url);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError('Failed to load PDF document');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'resume-preview.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
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

  // Calculate responsive height based on viewport and mobile detection
  const getResponsiveHeight = () => {
    if (isFullscreen) return '100%';
    if (isMobile) {
      return `${Math.min(window.innerHeight * 0.7, 600)}px`;
    }
    return '800px';
  };

  const getContainerStyle = () => {
    if (isFullscreen) {
      return { height: '100%', width: '100%' };
    }
    
    // A4 aspect ratio (1:1.414) for consistent display
    const aspectRatio = 1 / 1.414;
    const maxWidth = isMobile ? '95vw' : '90vw';
    const width = isMobile ? '100%' : '566px';
    const height = getResponsiveHeight();
    
    return {
      width,
      height,
      maxWidth,
      aspectRatio: isMobile ? aspectRatio : undefined
    };
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Controls - Only show if not fullscreen */}
      {!isFullscreen && (
        <div className="flex items-center justify-center mb-4 p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">
            📄 PDF Preview
          </span>
        </div>
      )}

      {/* PDF Display */}
      <div 
        className={cn(
          "border rounded-lg bg-background relative shadow-lg",
          isFullscreen ? "border-0 rounded-none h-full w-full" : "mx-auto",
          isMobile && !isFullscreen && "aspect-[1/1.414]"
        )}
        style={getContainerStyle()}
      >
        {pdfUrl ? (
          <iframe
            src={isFullscreen 
              ? `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=Fit&pagemode=bookmarks&zoom=page-fit` 
              : `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=Fit&pagemode=bookmarks&zoom=page-fit`
            }
            className={cn(
              "rounded-lg",
              isFullscreen ? "w-full h-full rounded-none" : "w-full h-full"
            )}
            title="PDF Preview"
            style={{ 
              border: 'none',
              fontSmooth: 'never',
              WebkitFontSmoothing: 'none',
              ...(isFullscreen && {
                transform: 'scale(1)',
                transformOrigin: 'top left',
                width: '100%',
                height: '100%'
              })
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