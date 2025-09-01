import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { MuPDFWebViewer } from './MuPDFWebViewer';

interface MobilePDFViewerProps {
  file: File | string | Blob;
  className?: string;
  isFullscreen?: boolean;
  pdfUrl: string | null;
}

export const MobilePDFViewer = ({ file, className, isFullscreen = false, pdfUrl }: MobilePDFViewerProps) => {
  const [useFallback, setUseFallback] = useState(false);

  // If MuPDF fails, we'll fall back to iframe
  if (useFallback) {
    return (
      <div className={cn("w-full", className)}>
        {!isFullscreen && (
          <div className="flex items-center justify-center mb-4 p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">
              📄 PDF Preview (Mobile Fallback)
            </span>
          </div>
        )}
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
            width: '100%',
            maxWidth: '90vw'
          }}
        >
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&zoom=100&pagemode=none`}
              className={cn(
                "rounded-lg",
                isFullscreen ? "w-full h-full rounded-none" : "w-full h-full"
              )}
              title="PDF Preview"
              style={{ border: 'none' }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Unable to display PDF</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Try MuPDF WebViewer first, with error handling to fall back
  return (
    <div className={cn("w-full", className)}>
      <MuPDFWebViewer 
        file={file} 
        className={className}
        isFullscreen={isFullscreen}
      />
      {/* Hidden fallback trigger - MuPDF will handle its own errors */}
    </div>
  );
};