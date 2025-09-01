import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use CDN for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.js';

interface PDFJSCanvasRendererProps {
  file: File | string | Blob;
  className?: string;
  isFullscreen?: boolean;
}

export const PDFJSCanvasRenderer = ({ file, className, isFullscreen = false }: PDFJSCanvasRendererProps) => {
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadPDF();
  }, [file]);

  useEffect(() => {
    if (pdfDocument && currentPage) {
      renderPage(currentPage);
    }
  }, [pdfDocument, currentPage, scale]);

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError(null);

      let pdfData: ArrayBuffer;
      
      if (typeof file === 'string') {
        const response = await fetch(file);
        pdfData = await response.arrayBuffer();
      } else {
        pdfData = await file.arrayBuffer();
      }

      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      setPdfDocument(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError('Failed to load PDF document');
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async (pageNumber: number) => {
    if (!pdfDocument || !canvasRef.current) return;

    setRendering(true);
    try {
      const page = await pdfDocument.getPage(pageNumber);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      const viewport = page.getViewport({ scale });
      
      // Set canvas dimensions with device pixel ratio for crisp rendering
      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.height = viewport.height * devicePixelRatio;
      canvas.width = viewport.width * devicePixelRatio;
      canvas.style.height = viewport.height + 'px';
      canvas.style.width = viewport.width + 'px';
      
      // Scale context for device pixel ratio
      context.scale(devicePixelRatio, devicePixelRatio);

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Render PDF page
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };
      
      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Error rendering page:', err);
      setError('Failed to render PDF page');
    } finally {
      setRendering(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setScale(Math.min(scale * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale / 1.2, 0.5));
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
      {/* Controls */}
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
        
        <div className="flex items-center gap-2">
          <Button onClick={handleZoomOut} variant="outline" size="sm">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
          <Button onClick={handleZoomIn} variant="outline" size="sm">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div 
        className={cn(
          "border rounded-lg bg-background relative shadow-lg overflow-auto",
          isFullscreen ? "border-0 rounded-none h-full w-full" : "mx-auto max-h-[800px]"
        )}
      >
        <canvas
          ref={canvasRef}
          className={cn(
            "block mx-auto",
            rendering && "opacity-50"
          )}
          style={{
            maxWidth: '100%',
            touchAction: 'pan-x pan-y'
          }}
        />
        
        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
};