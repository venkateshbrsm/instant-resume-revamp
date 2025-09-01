import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBrowserDetection } from '@/hooks/useBrowserDetection';

interface PDFViewerProps {
  file: File | string | Blob; // File object, URL, or Blob
  className?: string;
  isFullscreen?: boolean; // Add prop to detect fullscreen mode
}

export const PDFViewer = ({ file, className, isFullscreen = false }: PDFViewerProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderMethod, setRenderMethod] = useState<'iframe' | 'object' | 'embed' | 'download'>('iframe');
  const browserInfo = useBrowserDetection();

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

      console.log('PDFViewer: Loading PDF...', { browserInfo, fileType: typeof file });

      let url: string;
      
      if (typeof file === 'string') {
        // URL provided
        url = file;
        console.log('PDFViewer: Using provided URL:', url);
      } else {
        // File or Blob object provided
        url = URL.createObjectURL(file);
        console.log('PDFViewer: Created blob URL:', url, 'File size:', file.size);
      }

      setPdfUrl(url);
      
      // Determine best rendering method based on browser
      let method: 'iframe' | 'object' | 'embed' | 'download';
      
      if (browserInfo.isAndroidChrome) {
        // Android Chrome - try download approach as blob URLs don't work reliably in embeds
        method = 'download';
        console.log('PDFViewer: Android Chrome detected, using download fallback');
      } else if (browserInfo.isMobile && !browserInfo.isIOS) {
        method = 'embed'; // Other mobile browsers
        console.log('PDFViewer: Other mobile browser detected, using embed');
      } else {
        method = 'iframe'; // Desktop and iOS
        console.log('PDFViewer: Desktop/iOS detected, using iframe');
      }
      
      console.log('PDFViewer: Selected render method:', method, 'for browser:', browserInfo);
      setRenderMethod(method);
    } catch (err) {
      console.error('PDFViewer: Error loading PDF:', err);
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
      // Open PDF in popup without browser controls
      const width = window.screen.width * 0.9;
      const height = window.screen.height * 0.9;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      window.open(
        pdfUrl, 
        'pdfViewer',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
      );
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
          <>
            {renderMethod === 'iframe' && (
              <iframe
                src={isFullscreen 
                  ? `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&zoom=100&view=FitV&pagemode=none` 
                  : `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&zoom=100&pagemode=none`
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
                onLoad={() => console.log('PDFViewer: Iframe loaded successfully')}
                onError={() => console.error('PDFViewer: Iframe failed to load')}
              />
            )}
            
            {renderMethod === 'object' && (
              <object
                data={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&zoom=100&view=FitV&pagemode=none`}
                type="application/pdf"
                className={cn(
                  "rounded-lg",
                  isFullscreen ? "w-full h-full rounded-none" : "w-full h-full"
                )}
                style={{ 
                  border: 'none',
                }}
                onLoad={() => console.log('PDFViewer: Object loaded successfully')}
                onError={() => console.error('PDFViewer: Object failed to load')}
              >
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <p className="text-muted-foreground mb-4">
                    PDF preview not available on this device
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handleDownload} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button onClick={openInNewTab} variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                  </div>
                </div>
              </object>
            )}
            
            {renderMethod === 'embed' && (
              <>
                <embed
                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&zoom=100&view=FitV&pagemode=none`}
                  type="application/pdf"
                  className={cn(
                    "rounded-lg",
                    isFullscreen ? "w-full h-full rounded-none" : "w-full h-full"
                  )}
                  style={{ 
                    border: 'none',
                  }}
                  onLoad={() => console.log('PDFViewer: Embed loaded successfully')}
                  onError={() => console.error('PDFViewer: Embed failed to load')}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-muted-foreground mb-4 text-center">
                    PDF not displaying properly?
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={openInNewTab} variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                    <Button onClick={handleDownload} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </>
            )}
            
            {renderMethod === 'download' && (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    📄
                  </div>
                  <h3 className="text-lg font-semibold mb-2">PDF Preview Ready</h3>
                  <p className="text-muted-foreground mb-6">
                    Your resume is ready to view. Click one of the options below to see your PDF.
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <Button onClick={openInNewTab} className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View PDF in New Tab
                  </Button>
                  <Button onClick={handleDownload} variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Unable to display PDF</p>
          </div>
        )}
      </div>
    </div>
  );
};