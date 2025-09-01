import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FullscreenPDFViewer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pdfUrl = searchParams.get('url');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Enter fullscreen mode immediately
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (error) {
        console.log('Fullscreen not supported or denied');
      }
    };

    enterFullscreen();

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.log('Error exiting fullscreen');
    }
    navigate(-1); // Go back to previous page
  };

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">No PDF URL provided</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-black">
      {/* Exit button - only show when not in fullscreen */}
      {!isFullscreen && (
        <Button
          onClick={exitFullscreen}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-50 bg-black/50 text-white hover:bg-black/70"
        >
          <X className="w-4 h-4" />
        </Button>
      )}

      {/* PDF Viewer */}
      <iframe
        src={`${pdfUrl}#toolbar=0&navpanes=0&statusbar=0&view=FitV&pagemode=none`}
        className="w-full h-full border-0"
        title="PDF Fullscreen Viewer"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default FullscreenPDFViewer;