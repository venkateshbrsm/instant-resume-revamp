import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// PDF.js imports
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface MobilePDFViewerProps {
  pdfBlob: Blob;
  className?: string;
  onError?: (error: string) => void;
}

export function MobilePDFViewer({ pdfBlob, className, onError }: MobilePDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  // Load PDF document
  useEffect(() => {
    const loadPDF = async () => {
      if (!pdfBlob) return;

      setIsLoading(true);
      setLoadingProgress(0);

      try {
        const arrayBuffer = await pdfBlob.arrayBuffer();
        
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        });

        // Track loading progress
        loadingTask.onProgress = (progress) => {
          if (progress.total > 0) {
            const percent = (progress.loaded / progress.total) * 100;
            setLoadingProgress(percent);
          }
        };

        const pdf = await loadingTask.promise;
        setPdfDocument(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        
        // Calculate initial scale based on container width
        if (containerRef.current) {
          const containerWidth = containerRef.current.offsetWidth - 32; // Account for padding
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 1 });
          const initialScale = containerWidth / viewport.width;
          setScale(Math.min(initialScale, 1.5)); // Cap at 1.5x for readability
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setIsLoading(false);
        onError?.('Failed to load PDF. Please try again.');
        toast.error('Failed to load PDF');
      }
    };

    loadPDF();
  }, [pdfBlob, onError]);

  // Render current page
  const renderPage = useCallback(async (pageNumber: number) => {
    if (!pdfDocument || !canvasRef.current) return;

    try {
      const page = await pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      // Set canvas dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setCanvasWidth(viewport.width);
      setCanvasHeight(viewport.height);

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Render page
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
      toast.error('Failed to render page');
    }
  }, [pdfDocument, scale]);

  // Re-render page when document, page, or scale changes
  useEffect(() => {
    if (pdfDocument && currentPage) {
      renderPage(currentPage);
    }
  }, [pdfDocument, currentPage, scale, renderPage]);

  // Navigation functions
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3)); // Max 3x zoom
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.5)); // Min 0.5x zoom
  };

  const resetZoom = () => {
    if (containerRef.current && pdfDocument) {
      const containerWidth = containerRef.current.offsetWidth - 32;
      pdfDocument.getPage(1).then(page => {
        const viewport = page.getViewport({ scale: 1 });
        const fitScale = containerWidth / viewport.width;
        setScale(Math.min(fitScale, 1.5));
      });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  // Touch gesture handling for mobile
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let initialPinchDistance = 0;
    let initialScale = scale;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch gesture started
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialPinchDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );
        initialScale = scale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch1.clientX - touch2.clientX,
          touch1.clientY - touch2.clientY
        );
        
        if (initialPinchDistance > 0) {
          const scaleChange = currentDistance / initialPinchDistance;
          const newScale = Math.max(0.5, Math.min(3, initialScale * scaleChange));
          setScale(newScale);
        }
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [scale]);

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-sm text-muted-foreground">Loading PDF...</div>
          <Progress value={loadingProgress} className="w-full max-w-xs" />
          <div className="text-xs text-muted-foreground">{Math.round(loadingProgress)}%</div>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Control Bar */}
      <Card className="p-2 mb-2">
        <div className="flex items-center justify-between gap-2">
          {/* Page Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1 text-sm">
              <span className="min-w-[2ch] text-center">{currentPage}</span>
              <span>/</span>
              <span>{totalPages}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <div className="text-xs min-w-[3ch] text-center">
              {Math.round(scale * 100)}%
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={resetZoom}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="h-4 w-4" />
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

      {/* PDF Canvas Container */}
      <Card 
        ref={containerRef}
        className={cn(
          "relative overflow-auto bg-gray-50 dark:bg-gray-900",
          isFullscreen && "fixed inset-0 z-50 rounded-none"
        )}
        style={{ 
          height: isFullscreen ? '100vh' : '70vh',
          maxHeight: isFullscreen ? '100vh' : '70vh'
        }}
      >
        <div className="flex justify-center p-4 min-h-full">
          <canvas
            ref={canvasRef}
            className="shadow-lg bg-white dark:bg-white max-w-full h-auto"
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              maxWidth: '100%'
            }}
          />
        </div>
      </Card>

      {/* Mobile-specific help text */}
      <div className="text-xs text-muted-foreground mt-2 text-center">
        Use pinch gestures to zoom • Swipe to scroll • Tap controls to navigate
      </div>
    </div>
  );
}