import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File | string | Blob; // File object, URL, or Blob
  className?: string;
}

export const PDFViewer = ({ file, className }: PDFViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [optimalScale, setOptimalScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPDF();
  }, [file]);

  useEffect(() => {
    if (pdf && currentPage) {
      renderPage();
    }
  }, [pdf, currentPage, scale]);

  useEffect(() => {
    if (pdf) {
      calculateOptimalScale();
    }
  }, [pdf]);

  useEffect(() => {
    const handleResize = () => {
      if (pdf) {
        calculateOptimalScale();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdf]);

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError(null);

      let pdfData: ArrayBuffer;
      
      if (typeof file === 'string') {
        // URL provided
        const response = await fetch(file);
        pdfData = await response.arrayBuffer();
      } else {
        // File or Blob object provided
        pdfData = await file.arrayBuffer();
      }

      const loadedPdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      setPdf(loadedPdf);
      setTotalPages(loadedPdf.numPages);
      setCurrentPage(1);
      
      // Calculate optimal scale after PDF loads
      setTimeout(() => calculateOptimalScale(), 100);
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError('Failed to load PDF document');
    } finally {
      setLoading(false);
    }
  };

  const calculateOptimalScale = async () => {
    if (!pdf || !containerRef.current) return;

    try {
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 });
      
      const container = containerRef.current;
      const containerWidth = container.clientWidth - 32; // Account for padding
      const containerHeight = container.clientHeight - 32;
      
      // Calculate scale to fit width with some margin
      const scaleToFitWidth = (containerWidth * 0.95) / viewport.width;
      const scaleToFitHeight = (containerHeight * 0.9) / viewport.height;
      
      // Use the smaller scale to ensure it fits in both dimensions
      const calculatedScale = Math.min(scaleToFitWidth, scaleToFitHeight, 2.0);
      const finalScale = Math.max(calculatedScale, 0.5); // Minimum scale
      
      setOptimalScale(finalScale);
      setScale(finalScale);
    } catch (err) {
      console.error('Error calculating optimal scale:', err);
    }
  };

  const renderPage = async () => {
    if (!pdf || !canvasRef.current) return;

    try {
      const page = await pdf.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      // Set canvas dimensions
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Clear canvas before rendering
      context.clearRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error('Error rendering page:', err);
      setError('Failed to render PDF page');
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(optimalScale);
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
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            variant="outline"
            size="sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={zoomOut} variant="outline" size="sm">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            onClick={resetZoom} 
            variant="outline" 
            size="sm"
            className="px-2"
          >
            Reset
          </Button>
          <span className="text-sm text-muted-foreground min-w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button onClick={zoomIn} variant="outline" size="sm">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div 
        ref={containerRef}
        className="border rounded-lg bg-background relative"
        style={{ 
          height: '70vh',
          minHeight: '500px',
          maxHeight: '800px'
        }}
      >
        <div className="absolute inset-0 overflow-auto">
          <div className="flex justify-center items-center min-h-full p-4">
            <canvas
              ref={canvasRef}
              className="shadow-lg rounded border border-border/50"
              style={{ 
                display: 'block',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};