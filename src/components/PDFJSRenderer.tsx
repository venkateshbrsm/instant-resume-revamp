import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

// Disable PDF.js worker for better mobile compatibility - run in main thread
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

interface PDFJSRendererProps {
  file: File | string | Blob;
  className?: string;
  isFullscreen?: boolean;
}

export const PDFJSRenderer = ({ file, className, isFullscreen = false }: PDFJSRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [renderTask, setRenderTask] = useState<pdfjsLib.RenderTask | null>(null);

  const loadPDF = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let arrayBuffer: ArrayBuffer;
      
      if (typeof file === 'string') {
        console.log('Loading PDF from URL:', file);
        const response = await fetch(file);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status}`);
        }
        arrayBuffer = await response.arrayBuffer();
      } else {
        console.log('Loading PDF from file/blob:', file);
        arrayBuffer = await file.arrayBuffer();
      }

      console.log('PDF ArrayBuffer size:', arrayBuffer.byteLength);
      
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        // Mobile optimizations
        useSystemFonts: true,
        stopAtErrors: false,
        maxImageSize: 1024 * 1024,
        cMapPacked: true,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@5.4.149/cmaps/',
        // Disable worker if it fails
        useWorkerFetch: false,
        isEvalSupported: false
      });
      
      const pdf = await loadingTask.promise;
      console.log('PDF loaded successfully, pages:', pdf.numPages);
      
      setPdfDoc(pdf);
      setPageCount(pdf.numPages);
      setPageNum(1);
    } catch (err) {
      console.error('Error loading PDF:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load PDF: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [file]);

  const renderPage = useCallback(async (num: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      // Cancel previous render task
      if (renderTask) {
        renderTask.cancel();
      }

      const page = await pdfDoc.getPage(num);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d')!;
      
      const viewport = page.getViewport({ scale });
      
      // Set canvas dimensions
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      const task = page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      });
      
      setRenderTask(task);
      await task.promise;
      setRenderTask(null);
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', err);
      }
    }
  }, [pdfDoc, scale, renderTask]);

  useEffect(() => {
    loadPDF();
  }, [loadPDF]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pageNum);
    }
  }, [pdfDoc, pageNum, renderPage]);

  const goToPrevPage = () => {
    if (pageNum > 1) {
      setPageNum(pageNum - 1);
    }
  };

  const goToNextPage = () => {
    if (pageNum < pageCount) {
      setPageNum(pageNum + 1);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
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
    <div className={cn("w-full flex flex-col", className)}>
      {/* Controls */}
      {!isFullscreen && (
        <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Button
              onClick={goToPrevPage}
              disabled={pageNum <= 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pageNum} of {pageCount}
            </span>
            <Button
              onClick={goToNextPage}
              disabled={pageNum >= pageCount}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={zoomOut} variant="outline" size="sm" disabled={scale <= 0.5}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button onClick={zoomIn} variant="outline" size="sm" disabled={scale >= 3.0}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* PDF Canvas */}
      <div className={cn(
        "border rounded-lg bg-background relative shadow-lg overflow-auto",
        isFullscreen ? "border-0 rounded-none h-full w-full" : "mx-auto"
      )}>
        <div className="flex justify-center p-4">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto shadow-sm"
            style={{ 
              maxHeight: isFullscreen ? 'calc(100vh - 100px)' : '800px'
            }}
          />
        </div>
      </div>
    </div>
  );
};