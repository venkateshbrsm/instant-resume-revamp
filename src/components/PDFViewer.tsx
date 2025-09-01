import React from 'react';
import { cn } from '@/lib/utils';
import { useDeviceType } from '@/hooks/useDeviceType';
import { PDFJSCanvasRenderer } from './PDFJSCanvasRenderer';
import { PDFiOSRenderer } from './PDFiOSRenderer';

interface PDFViewerProps {
  file: File | string | Blob; // File object, URL, or Blob
  className?: string;
  isFullscreen?: boolean; // Add prop to detect fullscreen mode
}

// Fallback iframe renderer for desktop
const DesktopPDFRenderer = ({ file, className, isFullscreen }: PDFViewerProps) => {
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadPDF();
  }, [file]);

  React.useEffect(() => {
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

export const PDFViewer = ({ file, className, isFullscreen = false }: PDFViewerProps) => {
  const deviceType = useDeviceType();
  // Route to appropriate renderer based on device type
  switch (deviceType) {
    case 'android':
      return <PDFJSCanvasRenderer file={file} className={className} isFullscreen={isFullscreen} />;
    case 'ios':
      return <PDFiOSRenderer file={file} className={className} isFullscreen={isFullscreen} />;
    case 'desktop':
    default:
      return <DesktopPDFRenderer file={file} className={className} isFullscreen={isFullscreen} />;
  }
};