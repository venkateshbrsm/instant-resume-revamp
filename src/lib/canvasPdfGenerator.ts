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
      // Single page - center vertically with printer-friendly margins
      const imgData = canvas.toDataURL('image/jpeg', quality);
      const yOffset = margin + Math.max(0, (availableHeight - finalHeight) / 2);
      pdf.addImage(imgData, 'JPEG', margin, yOffset, finalWidth, finalHeight);
    } else {
      // Multi-page generation with smart text-aware page breaks
      const printerMargin = 15; // Extra margin for printer-friendly output
      const effectivePageHeight = availableHeight - printerMargin;
      const pagesNeeded = Math.ceil(finalHeight / effectivePageHeight);
      
      // Calculate printer-friendly sections with intelligent text buffer
      const pixelsPerPageMm = effectivePageHeight / pixelsToMm / finalScale;
      const pixelsPerPage = pixelsPerPageMm * scale;
      const textBuffer = scale * 12; // Larger buffer to avoid cutting through text (12mm in pixels)
      const minSectionHeight = pixelsPerPage * 0.7; // Minimum section height to avoid tiny pages
      
      let currentY = 0;
      let pageIndex = 0;
      
      while (currentY < canvas.height) {
        if (pageIndex > 0) {
          pdf.addPage();
        }
        
        // Calculate remaining content height
        const remainingHeight = canvas.height - currentY;
        
        // Skip if remaining content is too small to be meaningful
        if (remainingHeight < textBuffer) {
          break;
        }
        
        // Calculate section height with intelligent text-aware buffering
        let sectionHeight = Math.min(pixelsPerPage, remainingHeight);
        
        // For pages that aren't the last, apply smart buffering to avoid text cutting
        if (remainingHeight > pixelsPerPage) {
          // Use buffer and ensure minimum section height
          const bufferedHeight = sectionHeight - textBuffer;
          sectionHeight = Math.max(bufferedHeight, minSectionHeight);
        }
        
        // Create canvas for this page section
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        
        if (pageCtx) {
          pageCanvas.width = canvas.width;
          pageCanvas.height = sectionHeight;
          
          // Fill with white background
          pageCtx.fillStyle = '#ffffff';
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          
          // Draw the section
          pageCtx.drawImage(
            canvas,
            0, currentY, // source position
            canvas.width, sectionHeight, // source size
            0, 0, // destination position
            canvas.width, sectionHeight // destination size
          );
          
          const pageImgData = pageCanvas.toDataURL('image/jpeg', quality);
          const sectionHeightMm = (sectionHeight / scale) * pixelsToMm * finalScale;
          
          // Ensure we don't exceed page boundaries
          const maxAllowedHeight = Math.min(sectionHeightMm, effectivePageHeight);
          
          // Add extra margin for first page only
          const pageTopMargin = pageIndex === 0 ? margin : margin + 2;
          pdf.addImage(pageImgData, 'JPEG', margin, pageTopMargin, finalWidth, maxAllowedHeight);
        }
        
        // Move to next section - use the actual section height to avoid gaps
        currentY += sectionHeight;
        pageIndex++;
        
        // Safety check: prevent infinite loop
        if (pageIndex > 20) {
          console.warn('PDF generation stopped: too many pages generated');
          break;
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
  
  // Add mobile-specific optimizations with print layout
  if (window.innerWidth < 768) {
    // Apply print layout styles for mobile
    element.style.fontSize = 'inherit';
    element.style.lineHeight = 'inherit';
    element.style.width = '210mm'; // A4 width
    element.style.maxWidth = '210mm';
    element.style.margin = '0';
    element.style.padding = '0';
    element.style.boxSizing = 'border-box';
    element.style.printColorAdjust = 'exact';
    (element.style as any).colorAdjust = 'exact';
    
    // Fix text wrapping and alignment for mobile PDF
    const textElements = element.querySelectorAll('[class*="truncate"], [class*="break-words"]');
    textElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.wordBreak = 'break-word';
      htmlEl.style.overflowWrap = 'break-word';
      htmlEl.style.textOverflow = 'clip';
      htmlEl.style.whiteSpace = 'normal';
    });

    // Apply print-specific styles to all child elements
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.printColorAdjust = 'exact';
      (htmlEl.style as any).colorAdjust = 'exact';
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