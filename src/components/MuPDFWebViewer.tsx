import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Note: This requires copying the library assets from node_modules/mupdf-webviewer/lib to public/lib
// Run: cp -r ./node_modules/mupdf-webviewer/lib ./public

interface MuPDFWebViewerProps {
  file: File | string | Blob;
  className?: string;
  isFullscreen?: boolean;
}

export const MuPDFWebViewer = ({ file, className, isFullscreen = false }: MuPDFWebViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mupdfInstance, setMupdfInstance] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    initializeMuPDF();
    return () => {
      // Cleanup
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [file]);

  const createBlobUrl = async (file: File | Blob | string): Promise<string> => {
    if (typeof file === 'string') {
      return file;
    }
    return URL.createObjectURL(file);
  };

  const initializeMuPDF = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if MuPDF library assets are available
      try {
        const response = await fetch('/lib/mupdf-wasm.js');
        if (!response.ok) {
          throw new Error('MuPDF library assets not found. Please run the setup script.');
        }
      } catch {
        throw new Error('MuPDF library assets not found. Please run: npm run setup:mupdf');
      }

      // Dynamically import MuPDF WebViewer
      const { initMuPDFWebViewer } = await import('mupdf-webviewer');
      
      // Create blob URL for the file
      const url = await createBlobUrl(file);
      setPdfUrl(url);

      if (!viewerRef.current) {
        throw new Error('Viewer container not found');
      }

      // Generate unique ID for this viewer instance
      const viewerId = `mupdf-viewer-${Date.now()}`;
      viewerRef.current.id = viewerId;

      // Initialize MuPDF WebViewer
      const mupdf = await initMuPDFWebViewer(`#${viewerId}`, url, {
        libraryPath: '/lib', // Path where MuPDF library assets are copied
        licenseKey: 'TRIAL', // Use trial license for development
        // Note: For production, you'll need a valid license key from https://webviewer.mupdf.com/
      });

      setMupdfInstance(mupdf);
      
      // Show success toast if available
      if (mupdf.toast) {
        mupdf.toast.show({ type: 'success', content: 'PDF loaded successfully' });
      }

    } catch (err) {
      console.error('Error initializing MuPDF WebViewer:', err);
      setError(`Failed to load PDF viewer: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    initializeMuPDF();
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
          <p className="text-muted-foreground">Loading MuPDF WebViewer...</p>
          <p className="text-xs text-muted-foreground mt-1">
            High-performance PDF rendering
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center space-y-3">
          <p className="text-destructive">⚠️ {error}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCcw className="w-4 h-4 mr-1" />
              Retry
            </Button>
            <Button onClick={openInNewTab} variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-1" />
              Open in New Tab
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Note: MuPDF WebViewer requires library assets in /public/lib/
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Controls */}
      {!isFullscreen && (
        <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">
            📄 PDF Preview (MuPDF WebViewer)
          </span>
          <Button onClick={openInNewTab} variant="ghost" size="sm">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* MuPDF WebViewer Container */}
      <div 
        ref={viewerRef}
        className={cn(
          "border rounded-lg bg-background relative shadow-lg",
          isFullscreen ? "border-0 rounded-none h-full w-full" : "mx-auto"
        )}
        style={isFullscreen ? { 
          height: '100%',
          width: '100%'
        } : { 
          height: '800px',
          width: '100%',
          maxWidth: '90vw'
        }}
      />
    </div>
  );
};