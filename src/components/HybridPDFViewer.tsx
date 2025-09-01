import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HybridPDFViewerProps {
  file: File | string | Blob;
  className?: string;
  isFullscreen?: boolean;
}

export const HybridPDFViewer = ({ file, className, isFullscreen = false }: HybridPDFViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const canvasRefs = useRef<HTMLCanvasElement[]>([]);

  useEffect(() => {
    renderPDF();
  }, [file]);

  const renderPDF = async () => {
    try {
      setLoading(true);
      setError(null);

      // Dynamically import pdf.js
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      let pdfData: ArrayBuffer;

      if (typeof file === 'string') {
        // URL provided - fetch the PDF
        const response = await fetch(file);
        pdfData = await response.arrayBuffer();
      } else {
        // File or Blob object
        pdfData = await file.arrayBuffer();
      }

      // Load PDF document
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const pageImages: string[] = [];

      // Render each page to canvas
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality

        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;
        
        // Convert canvas to base64 image
        const imageData = canvas.toDataURL('image/png', 0.9);
        pageImages.push(imageData);
      }

      setPages(pageImages);
    } catch (err) {
      console.error('Error rendering PDF:', err);
      setError('Failed to render PDF document');
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Rendering PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center">
          <p className="text-destructive mb-2">⚠️ {error}</p>
          <Button onClick={renderPDF} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Controls */}
      {!isFullscreen && (
        <div className="flex items-center justify-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 3.0}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground ml-2">
            📄 PDF Canvas Viewer ({pages.length} pages)
          </span>
        </div>
      )}

      {/* PDF Pages */}
      <div 
        className={cn(
          "border rounded-lg bg-background shadow-lg overflow-auto",
          isFullscreen ? "border-0 rounded-none h-full w-full" : "mx-auto"
        )}
        style={isFullscreen ? { 
          height: '100%',
          width: '100%'
        } : { 
          height: '800px',
          maxWidth: '90vw'
        }}
      >
        <div className="p-4 space-y-4">
          {pages.map((pageImage, index) => (
            <div key={index} className="flex justify-center">
              <img
                src={pageImage}
                alt={`Page ${index + 1}`}
                className="max-w-full h-auto shadow-md border rounded"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                  transition: 'transform 0.3s ease-in-out'
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};