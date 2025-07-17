import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface CanvasPdfOptions {
  filename?: string;
  quality?: number;
  scale?: number;
  width?: number;
  height?: number;
}

/**
 * Generates a PDF from a DOM element using canvas-based rendering
 * This ensures 100% visual fidelity between preview and downloaded PDF
 */
export async function generatePdfFromElement(
  element: HTMLElement,
  options: CanvasPdfOptions = {}
): Promise<Blob> {
  const {
    filename = 'document.pdf',
    quality = 0.95,
    scale = window.innerWidth < 768 ? 3.0 : 2.5 // Higher scale for mobile devices
  } = options;

  try {
    // Prepare element for capture
    const cleanup = prepareElementForCapture(element);
    
    // Wait for any layout changes to settle
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Get the element's actual rendered dimensions
    const rect = element.getBoundingClientRect();
    const elementWidth = Math.max(rect.width, element.scrollWidth);
    const elementHeight = Math.max(rect.height, element.scrollHeight);
    
    console.log('Element dimensions:', { width: elementWidth, height: elementHeight });
    
    // Configure html2canvas to capture at high resolution with mobile optimizations
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
      removeContainer: true,
      scrollX: 0,
      scrollY: 0,
      width: elementWidth,
      height: elementHeight,
      foreignObjectRendering: false, // Better for mobile text rendering
      ignoreElements: (element) => {
        // Skip elements that might cause alignment issues
        return element.classList?.contains('ignore-pdf') || false;
      }
    });

    // Clean up element styles
    cleanup();

    // PDF dimensions (A4 size in mm)
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 12; // Professional margins
    const availableWidth = pdfWidth - (margin * 2);
    const availableHeight = pdfHeight - (margin * 2);
    
    console.log('Canvas dimensions:', { width: canvas.width, height: canvas.height });
    
    // Convert pixels to mm (96 DPI standard)
    const pixelsToMm = 25.4 / 96;
    const contentWidthMm = (canvas.width / scale) * pixelsToMm;
    const contentHeightMm = (canvas.height / scale) * pixelsToMm;
    
    // Calculate scale to fit width, ensuring readability (minimum 60% scale)
    const widthScale = availableWidth / contentWidthMm;
    const minReadableScale = 0.6;
    const finalScale = Math.max(widthScale, minReadableScale);
    
    // Calculate final dimensions
    const finalWidth = Math.min(contentWidthMm * finalScale, availableWidth);
    const finalHeight = contentHeightMm * finalScale;
    
    console.log('PDF calculations:', { 
      contentWidthMm, 
      contentHeightMm, 
      finalScale, 
      finalWidth, 
      finalHeight,
      availableHeight 
    });
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Check if content fits on one page
    if (finalHeight <= availableHeight) {
      // Single page - center vertically
      const imgData = canvas.toDataURL('image/jpeg', quality);
      const yOffset = margin + Math.max(0, (availableHeight - finalHeight) / 2);
      pdf.addImage(imgData, 'JPEG', margin, yOffset, finalWidth, finalHeight);
    } else {
      // Multi-page generation for long content
      const pagesNeeded = Math.ceil(finalHeight / availableHeight);
      const pixelsPerPage = canvas.height / pagesNeeded;
      
      for (let pageIndex = 0; pageIndex < pagesNeeded; pageIndex++) {
        if (pageIndex > 0) {
          pdf.addPage();
        }
        
        // Create canvas for this page section
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        
        if (pageCtx) {
          const startY = pageIndex * pixelsPerPage;
          const sectionHeight = Math.min(pixelsPerPage, canvas.height - startY);
          
          pageCanvas.width = canvas.width;
          pageCanvas.height = sectionHeight;
          
          // Fill with white background
          pageCtx.fillStyle = '#ffffff';
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          
          // Draw the section of original canvas
          pageCtx.drawImage(
            canvas,
            0, startY, // source position
            canvas.width, sectionHeight, // source size
            0, 0, // destination position
            canvas.width, sectionHeight // destination size
          );
          
          const pageImgData = pageCanvas.toDataURL('image/jpeg', quality);
          const sectionHeightMm = (sectionHeight / scale) * pixelsToMm * finalScale;
          
          pdf.addImage(pageImgData, 'JPEG', margin, margin, finalWidth, sectionHeightMm);
        }
      }
    }
    
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF from canvas:', error);
    throw new Error('Failed to generate PDF from visual content');
  }
}

/**
 * Downloads a PDF generated from a DOM element
 */
export async function downloadPdfFromElement(
  element: HTMLElement,
  options: CanvasPdfOptions = {}
): Promise<void> {
  const { filename = 'enhanced-resume.pdf' } = options;
  
  try {
    const blob = await generatePdfFromElement(element, options);
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
}

/**
 * Prepares an element for high-quality PDF capture by temporarily modifying styles
 */
export function prepareElementForCapture(element: HTMLElement): () => void {
  const originalStyles = {
    transform: element.style.transform,
    width: element.style.width,
    height: element.style.height,
    overflow: element.style.overflow,
    position: element.style.position,
    maxWidth: element.style.maxWidth,
    minHeight: element.style.minHeight
  };

  // Apply styles for better capture quality, especially on mobile
  element.style.transform = 'scale(1)';
  element.style.overflow = 'visible';
  element.style.position = 'relative';
  element.style.maxWidth = 'none';
  element.style.minHeight = 'auto';
  
  // Add mobile-specific optimizations
  if (window.innerWidth < 768) {
    element.style.fontSize = 'inherit';
    element.style.lineHeight = 'inherit';
    
    // Fix text wrapping and alignment for mobile PDF
    const textElements = element.querySelectorAll('[class*="truncate"], [class*="break-words"]');
    textElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.wordBreak = 'break-word';
      htmlEl.style.overflowWrap = 'break-word';
      htmlEl.style.textOverflow = 'clip';
      htmlEl.style.whiteSpace = 'normal';
    });
  }
  
  // Ensure the element has explicit dimensions based on its content
  const rect = element.getBoundingClientRect();
  if (rect.width > 0) {
    element.style.width = rect.width + 'px';
  }

  // Return cleanup function
  return () => {
    Object.entries(originalStyles).forEach(([key, value]) => {
      if (value) {
        (element.style as any)[key] = value;
      } else {
        (element.style as any)[key] = '';
      }
    });
  };
}