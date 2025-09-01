import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HybridPDFViewer } from './HybridPDFViewer';

interface PDFViewerProps {
  file: File | string | Blob; // File object, URL, or Blob
  className?: string;
  isFullscreen?: boolean; // Add prop to detect fullscreen mode
}

export const PDFViewer = ({ file, className, isFullscreen = false }: PDFViewerProps) => {

  // Use hybrid canvas-based PDF viewer for all devices
  return (
    <HybridPDFViewer 
      file={file} 
      className={className}
      isFullscreen={isFullscreen}
    />
  );
};