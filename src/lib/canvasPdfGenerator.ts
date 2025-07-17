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
    scale = 2
  } = options;

  try {
    // Prepare element for capture - get natural dimensions
    const cleanup = prepareElementForCapture(element);
    
    // Wait for any layout changes to settle
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get the element's actual rendered dimensions
    const rect = element.getBoundingClientRect();
    const elementWidth = Math.max(rect.width, element.scrollWidth);
    const elementHeight = Math.max(rect.height, element.scrollHeight);
    
    console.log('Element dimensions:', { width: elementWidth, height: elementHeight });
    
    // Configure html2canvas to capture the element's natural size
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
      // Let html2canvas auto-detect dimensions instead of forcing them
      width: elementWidth,
      height: elementHeight
    });

    // Clean up element styles
    cleanup();

    // Calculate PDF dimensions (A4 size in mm)
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    
    // Get canvas dimensions
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    console.log('Canvas dimensions:', { width: canvasWidth, height: canvasHeight });
    
    // Calculate scale to fit content on A4 page with some padding
    const padding = 10; // 10mm padding on all sides
    const availableWidth = pdfWidth - (padding * 2);
    const availableHeight = pdfHeight - (padding * 2);
    
    // Convert canvas pixels to mm (assuming 96 DPI: 1 inch = 25.4mm, 96px = 25.4mm)
    const pixelsToMm = 25.4 / 96;
    const contentWidthMm = (canvasWidth / scale) * pixelsToMm;
    const contentHeightMm = (canvasHeight / scale) * pixelsToMm;
    
    // Calculate scale to fit within available area
    const scaleX = availableWidth / contentWidthMm;
    const scaleY = availableHeight / contentHeightMm;
    const finalScale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down if needed
    
    // Calculate final dimensions
    const finalWidth = contentWidthMm * finalScale;
    const finalHeight = contentHeightMm * finalScale;
    
    // Center the content on the page
    const x = (pdfWidth - finalWidth) / 2;
    const y = padding; // Start from top padding
    
    console.log('PDF layout:', { 
      finalScale, 
      finalWidth, 
      finalHeight, 
      x, 
      y,
      contentWidthMm,
      contentHeightMm 
    });
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: finalHeight > finalWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/jpeg', quality);
    
    // Add image to PDF with calculated dimensions
    pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
    
    // Return as blob
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

  // Apply styles for better capture quality
  element.style.transform = 'scale(1)';
  element.style.overflow = 'visible';
  element.style.position = 'relative';
  element.style.maxWidth = 'none';
  element.style.minHeight = 'auto';
  
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