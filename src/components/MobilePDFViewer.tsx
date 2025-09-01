import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MobilePDFViewerProps {
  pdfBlob: Blob;
  className?: string;
  onError?: (error: string) => void;
}

export function MobilePDFViewer({ pdfBlob, className, onError }: MobilePDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!pdfBlob) return;

    try {
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setIsLoading(false);

      // Cleanup function
      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error('Error creating PDF URL:', error);
      setIsLoading(false);
      onError?.('Failed to load PDF. Please try again.');
      toast.error('Failed to load PDF');
    }
  }, [pdfBlob, onError]);

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const downloadPdf = () => {
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

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-sm text-muted-foreground">Loading PDF...</div>
          <Progress value={100} className="w-full max-w-xs" />
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Mobile-optimized Control Bar */}
      <Card className="p-3 mb-2">
        <div className="flex items-center justify-between gap-2">
          {/* PDF Info */}
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">PDF Preview</div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadPdf}
              className="h-8 px-2 text-xs"
            >
              Download
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={openInNewTab}
              className="h-8 px-2 text-xs"
            >
              Open
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>

      {/* Mobile-optimized PDF Container */}
      <Card 
        className={cn(
          "relative overflow-hidden bg-gray-50 dark:bg-gray-900",
          isFullscreen && "fixed inset-0 z-50 rounded-none"
        )}
        style={{ 
          height: isFullscreen ? '100vh' : '70vh',
          maxHeight: isFullscreen ? '100vh' : '70vh'
        }}
      >
        {pdfUrl ? (
          <iframe
            ref={iframeRef}
            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&zoom=page-fit&view=FitV&pagemode=bookmarks`}
            className={cn(
              "w-full h-full border-0",
              isFullscreen ? "rounded-none" : "rounded-lg"
            )}
            title="PDF Preview"
            style={{
              minHeight: '100%',
              background: 'white'
            }}
            onLoad={() => {
              // Add mobile-specific iframe optimizations
              const iframe = iframeRef.current;
              if (iframe && iframe.contentWindow) {
                try {
                  // Try to add mobile viewport meta tag to iframe if accessible
                  const iframeDoc = iframe.contentWindow.document;
                  if (iframeDoc) {
                    const viewport = iframeDoc.createElement('meta');
                    viewport.name = 'viewport';
                    viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=yes';
                    iframeDoc.head?.appendChild(viewport);
                  }
                } catch (e) {
                  // Cross-origin restrictions prevent this, which is fine
                  console.log('Could not modify iframe document (expected for cross-origin)');
                }
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Unable to display PDF</p>
          </div>
        )}
      </Card>

      {/* Mobile-specific help text */}
      <div className="text-xs text-muted-foreground mt-2 text-center px-2">
        💡 Tip: Use browser's built-in PDF controls for zoom and navigation • 
        Tap "Open" to view in full browser tab
      </div>
    </div>
  );
}