import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createGoogleDriveViewerUrl, createOffice365ViewerUrl } from '@/lib/pdfUrlUtils';

interface ExternalPDFViewerProps {
  pdfUrl: string;
  className?: string;
  isFullscreen?: boolean;
}

export const ExternalPDFViewer = ({ pdfUrl, className, isFullscreen = false }: ExternalPDFViewerProps) => {
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [viewerType, setViewerType] = useState<'google' | 'office365'>('google');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadViewer();
  }, [pdfUrl, viewerType]);

  const loadViewer = () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = viewerType === 'google' 
        ? createGoogleDriveViewerUrl(pdfUrl)
        : createOffice365ViewerUrl(pdfUrl);
      
      setViewerUrl(url);
    } catch (err) {
      console.error('Error creating viewer URL:', err);
      setError('Failed to load PDF viewer');
    } finally {
      setLoading(false);
    }
  };

  const handleViewerError = () => {
    if (viewerType === 'google') {
      // Fallback to Office 365 viewer
      setViewerType('office365');
    } else {
      setError('Unable to load PDF with external viewers');
    }
  };

  const openInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const retryLoading = () => {
    setViewerType('google'); // Reset to Google viewer
    loadViewer();
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading PDF viewer...</p>
          <p className="text-xs text-muted-foreground mt-1">
            Using {viewerType === 'google' ? 'Google Drive' : 'Office 365'} viewer
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
            <Button onClick={retryLoading} variant="outline" size="sm">
              <RefreshCcw className="w-4 h-4 mr-1" />
              Retry
            </Button>
            <Button onClick={openInNewTab} variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-1" />
              Open in New Tab
            </Button>
          </div>
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
            📄 PDF Preview ({viewerType === 'google' ? 'Google Drive' : 'Office 365'})
          </span>
          <Button onClick={openInNewTab} variant="ghost" size="sm">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* External Viewer */}
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
        <iframe
          src={viewerUrl}
          className={cn(
            "rounded-lg",
            isFullscreen ? "w-full h-full rounded-none" : "w-full h-full"
          )}
          title="PDF Preview"
          onError={handleViewerError}
          style={{ 
            border: 'none',
            ...(isFullscreen && {
              width: '100%',
              height: '100%'
            })
          }}
        />
      </div>
    </div>
  );
};