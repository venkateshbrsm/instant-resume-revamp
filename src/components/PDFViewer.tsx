import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, ExternalLink, BookOpen, Scroll } from 'lucide-react';
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
  const [isScrollMode, setIsScrollMode] = useState(true); // Default to scroll mode
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadPDF();
  }, [file]);

  useEffect(() => {
    // Set timeout for loading to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('PDFViewer: Loading timeout reached');
        setLoadingTimeout(true);
        setError('PDF loading is taking too long. Please try again.');
        setLoading(false);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

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
      console.log('PDFViewer: Starting PDF load, file:', file);
      setLoading(true);
      setError(null);
      setLoadingTimeout(false);

      let url: string;
      
      if (typeof file === 'string') {
        // URL provided
        url = file;
        console.log('PDFViewer: Using URL:', url);
      } else {
        // File or Blob object provided
        url = URL.createObjectURL(file);
        console.log('PDFViewer: Created blob URL:', url);
      }

      setPdfUrl(url);
      console.log('PDFViewer: Set PDF URL for iframe display');
      
      // For iframe, we'll handle loading in the iframe onLoad event
    } catch (err) {
      console.error('PDFViewer: Error in loadPDF:', err);
      setError('Failed to load PDF document');
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

  const onIframeLoad = () => {
    console.log('PDFViewer: Iframe loaded successfully');
    setLoading(false);
    setNumPages(1); // Set a default for iframe mode
    setRetryCount(0); // Reset retry count on success
  };

  const onIframeError = (error: any) => {
    console.error('PDFViewer: Iframe load error:', error);
    setError('Failed to load PDF document');
    setLoading(false);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadPDF();
  };

  const handleFallbackIframe = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const goToNextPage = () => {
    if (currentPage < (numPages || 1)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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
        <div className="text-center space-y-3">
          <p className="text-destructive mb-2">⚠️ {error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleRetry} variant="outline" size="sm" disabled={retryCount >= 3}>
              {retryCount >= 3 ? 'Max Retries' : `Retry (${retryCount}/3)`}
            </Button>
            {pdfUrl && (
              <Button onClick={handleFallbackIframe} variant="secondary" size="sm">
                Open in New Tab
              </Button>
            )}
          </div>
          {retryCount >= 3 && (
            <p className="text-xs text-muted-foreground">
              Try opening the PDF in a new tab or download it instead.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Controls - Only show if not fullscreen */}
      {!isFullscreen && (
        <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">
            📄 PDF Preview {numPages && `(${numPages} pages)`}
          </span>
          
          <div className="flex items-center gap-2">
            {/* Page Navigation for Page Mode */}
            {!isScrollMode && numPages && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-xs px-2">
                  {currentPage} / {numPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage >= numPages}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {/* Mobile View Mode Toggle */}
            {isMobile && (
              <div className="flex items-center gap-2">
                <Button
                  variant={isScrollMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsScrollMode(true)}
                  className="flex items-center gap-1 text-xs"
                >
                  <Scroll className="h-3 w-3" />
                  Scroll
                </Button>
                <Button
                  variant={!isScrollMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsScrollMode(false)}
                  className="flex items-center gap-1 text-xs"
                >
                  <BookOpen className="h-3 w-3" />
                  Page
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF Display - Using reliable iframe approach */}
      <div 
        className={cn(
          "border rounded-lg bg-background relative shadow-lg",
          isFullscreen ? "border-0 rounded-none h-full w-full" : "mx-auto",
          isMobile && !isFullscreen && "w-full max-w-full overflow-auto"
        )}
        style={isFullscreen ? { 
          height: '100%',
          width: '100%'
        } : isMobile ? {
          height: '100vh',
          width: '100%',
          maxWidth: '100%',
          overflow: 'scroll',
          overflowX: 'auto',
          overflowY: 'auto',
          display: 'block'
        } : {
          height: '800px',
          width: '566px',
          maxWidth: '90vw'
        }}
      >
        {pdfUrl ? (
          <iframe
            src={isFullscreen 
              ? `${pdfUrl}#view=FitV&pagemode=none&toolbar=0` 
              : isMobile 
                ? isScrollMode
                  ? `${pdfUrl}#view=FitH&pagemode=bookmarks&toolbar=1`
                  : `${pdfUrl}#view=Fit&pagemode=none&toolbar=1`
                : `${pdfUrl}#view=FitH&pagemode=none&toolbar=0`
            }
            className={cn(
              "rounded-lg",
              isFullscreen ? "w-full h-full rounded-none" : "w-full h-full"
            )}
            title="PDF Preview"
            scrolling="yes"
            allowFullScreen
            onLoad={onIframeLoad}
            onError={onIframeError}
            style={{ 
              border: 'none',
              fontSmooth: 'never',
              WebkitFontSmoothing: 'none',
              overflow: 'auto',
              ...(isMobile && {
                minHeight: '100vh',
                width: '100%',
                height: '100%',
                overflow: 'auto',
                overflowX: 'auto',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch'
              }),
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