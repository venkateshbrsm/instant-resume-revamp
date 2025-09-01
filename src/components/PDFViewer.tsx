import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, ExternalLink, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
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
  const [zoom, setZoom] = useState(100);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const openFullView = () => {
    setIsModalOpen(true);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center", 
        isFullscreen ? "h-full" : "h-64 sm:h-96", className)}>
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground text-sm sm:text-base">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center", 
        isFullscreen ? "h-full" : "h-64 sm:h-96", className)}>
        <div className="text-center p-4">
          <p className="text-destructive mb-2 text-sm sm:text-base">⚠️ {error}</p>
          <Button onClick={loadPDF} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Mobile-optimized PDF display
  if (isMobile && !isFullscreen) {
    return (
      <div className={cn("w-full", className)}>
        {/* Mobile Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-3 p-3 bg-muted/50 rounded-lg gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground text-center">
            📄 PDF Preview (Mobile-Optimized)
          </span>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openFullView}
                className="text-xs px-2 py-1 h-8"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Full View
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0">
              <div className="w-full h-full">
                <PDFViewer file={file} isFullscreen={true} />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Mobile PDF Container */}
        <div className="w-full border rounded-lg bg-background shadow-lg overflow-hidden">
          <div className="relative" style={{ height: '400px' }}>
            {pdfUrl ? (
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&zoom=85&view=FitW&pagemode=none`}
                className="w-full h-full border-none"
                title="PDF Preview"
                style={{ 
                  border: 'none',
                  minHeight: '400px'
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-sm">Unable to display PDF</p>
              </div>
            )}
          </div>
          <div className="p-2 bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground">
              💡 Tap "Full View" for better mobile reading experience
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop/Fullscreen Controls */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg gap-2">
          <span className="text-sm text-muted-foreground">
            📄 PDF Preview
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="px-2 py-1 h-8"
              >
                <ZoomOut className="w-3 h-3" />
              </Button>
              <span className="text-xs px-2 min-w-[50px] text-center">{zoom}%</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                className="px-2 py-1 h-8"
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openFullView}
                  className="px-2 py-1 h-8"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Full View</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0">
                <div className="w-full h-full">
                  <PDFViewer file={file} isFullscreen={true} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {/* PDF Display */}
      <div 
        className={cn(
          "border rounded-lg bg-background relative shadow-lg overflow-hidden",
          isFullscreen ? "border-0 rounded-none h-full w-full" : "mx-auto"
        )}
        style={isFullscreen ? { 
          height: '100%',
          width: '100%'
        } : { 
          height: isMobile ? '500px' : '800px',
          width: isMobile ? '100%' : '566px',
          maxWidth: '100%'
        }}
      >
        {pdfUrl ? (
          <iframe
            src={isFullscreen 
              ? `${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&zoom=100&view=FitV&pagemode=none` 
              : `${pdfUrl}#toolbar=${isMobile ? '1' : '0'}&navpanes=0&scrollbar=1&zoom=${zoom}&view=${isMobile ? 'FitW' : 'FitV'}&pagemode=none`
            }
            className={cn(
              "w-full h-full",
              isFullscreen ? "rounded-none" : "rounded-lg"
            )}
            title="PDF Preview"
            style={{ 
              border: 'none',
              fontSmooth: 'never',
              WebkitFontSmoothing: 'none'
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Unable to display PDF</p>
          </div>
        )}
      </div>
      
      {/* Mobile helpful hint */}
      {isMobile && !isFullscreen && (
        <div className="mt-2 text-center">
          <p className="text-xs text-muted-foreground">
            📱 Pinch to zoom • Swipe to scroll
          </p>
        </div>
      )}
    </div>
  );
};