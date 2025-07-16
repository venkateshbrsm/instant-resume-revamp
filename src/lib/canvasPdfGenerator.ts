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
    quality = 2,
    scale = 2,
    width = 794, // A4 width in pixels at 96 DPI
    height = 1123 // A4 height in pixels at 96 DPI
  } = options;

  try {
    // Configure html2canvas for high quality output
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: width,
      height: height,
      scrollX: 0,
      scrollY: 0,
      windowWidth: width,
      windowHeight: height,
      logging: false,
      imageTimeout: 15000,
      removeContainer: true
    });

    // Calculate PDF dimensions (A4 size in mm)
    const pdfWidth = 210;
    const pdfHeight = 297;
    
    // Calculate scaling to fit content properly
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = Math.min(pdfWidth / (canvasWidth * 0.264583), pdfHeight / (canvasHeight * 0.264583));
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/jpeg', quality);
    
    // Add image to PDF with proper scaling
    const imgWidth = canvasWidth * 0.264583 * ratio;
    const imgHeight = canvasHeight * 0.264583 * ratio;
    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;
    
    pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
    
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
    position: element.style.position
  };

  // Apply styles for better capture quality
  element.style.transform = 'scale(1)';
  element.style.width = '794px'; // A4 width
  element.style.overflow = 'visible';
  element.style.position = 'relative';

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