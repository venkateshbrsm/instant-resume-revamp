import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface SmartPdfOptions {
  filename?: string;
  margin?: number | [number, number, number, number];
  format?: string;
  orientation?: 'portrait' | 'landscape';
  quality?: number;
}

/**
 * Generates PDF using html2canvas + jsPDF with intelligent page splitting
 * This approach captures content as images and splits at natural boundaries
 */
export async function generateSmartPdf(
  element: HTMLElement,
  options: SmartPdfOptions = {}
): Promise<Blob> {
  const {
    filename = 'enhanced-resume.pdf',
    margin = [10, 10, 10, 10],
    format = 'a4',
    orientation = 'portrait'
  } = options;

  // Prepare element for PDF generation
  const cleanup = prepareElementForPdf(element);
  
  try {
    // A4 dimensions in mm
    const a4Width = 210;
    const a4Height = 297;
    const marginArray = Array.isArray(margin) ? margin : [margin, margin, margin, margin];
    
    // Calculate content area
    const contentWidth = a4Width - marginArray[1] - marginArray[3];
    const contentHeight = a4Height - marginArray[0] - marginArray[2];
    
    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4'
    });

    // Capture the entire element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // High quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;
    
    // Calculate how many pages we need
    const totalPages = Math.ceil(imgHeight / contentHeight);
    
    // Add pages and content
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      
      // Calculate the portion of the image for this page
      const sourceY = i * contentHeight * (canvas.width / contentWidth);
      const sourceHeight = Math.min(contentHeight * (canvas.width / contentWidth), canvas.height - sourceY);
      
      // Create a temporary canvas for this page's content
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d');
      
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;
      
      // Draw the portion of the original image
      pageCtx!.drawImage(
        canvas,
        0, sourceY, canvas.width, sourceHeight,
        0, 0, canvas.width, sourceHeight
      );
      
      const pageImgData = pageCanvas.toDataURL('image/png');
      const pageImgHeight = (sourceHeight * contentWidth) / canvas.width;
      
      // Add image to PDF page
      pdf.addImage(
        pageImgData,
        'PNG',
        marginArray[3], // left margin
        marginArray[0], // top margin
        imgWidth,
        pageImgHeight
      );
    }

    cleanup();
    
    // Return as blob
    const pdfBlob = pdf.output('blob');
    return pdfBlob;
    
  } catch (error) {
    cleanup();
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}

/**
 * Downloads PDF using the smart generation approach
 */
export async function downloadSmartPdf(
  element: HTMLElement,
  options: SmartPdfOptions = {}
): Promise<void> {
  try {
    const blob = await generateSmartPdf(element, options);
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = options.filename || 'enhanced-resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading smart PDF:', error);
    throw error;
  }
}

/**
 * Gets all stylesheets content to include in PDF
 */
function getAllStylesheets(): string {
  let css = '';
  Array.from(document.styleSheets).forEach(styleSheet => {
    try {
      Array.from(styleSheet.cssRules).forEach(rule => {
        css += rule.cssText + '\n';
      });
    } catch (e) {
      // Skip external stylesheets that can't be accessed
    }
  });
  return css;
}
function prepareElementForPdf(element: HTMLElement): () => void {
  const originalStyles = {
    width: element.style.width,
    maxWidth: element.style.maxWidth,
    margin: element.style.margin,
    padding: element.style.padding,
    overflow: element.style.overflow,
    fontSize: element.style.fontSize,
    lineHeight: element.style.lineHeight
  };

  // Inject CSS for comprehensive page break handling
  const style = document.createElement('style');
  style.textContent = `
    /* Enhanced Page Break Control Classes */
    .page-break {
      page-break-before: always !important;
      page-break-after: always !important;
      page-break-inside: avoid !important;
      break-before: page !important;
      break-after: page !important;
      break-inside: avoid !important;
    }
    
    .page-break-before {
      page-break-before: always !important;
      break-before: page !important;
    }
    
    .page-break-after {
      page-break-after: always !important;
      break-after: page !important;
    }
    
    .page-break-avoid {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      page-break-before: avoid !important;
      page-break-after: avoid !important;
    }
    
    /* Media Print Styles for PDF Generation */
    @media print {
      body {
        margin: 2cm !important;
        font-size: 11pt !important;
        line-height: 1.3 !important;
        color: black !important;
        background: white !important;
        box-sizing: border-box !important;
      }
      
      /* Ensure content fits within printable area */
      * {
        box-sizing: border-box !important;
        max-width: 100% !important;
      }
      
      /* Ensure proper margins and spacing */
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      /* Page break control for content */
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid !important;
        page-break-inside: avoid !important;
        break-after: avoid !important;
        break-inside: avoid !important;
      }
      
      /* Keep sections together */
      .section, .major-section {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      
      /* Prevent orphans and widows */
      p, li, div {
        orphans: 2 !important;
        widows: 2 !important;
      }
    }
    
    /* Content-specific page break avoidance with margins */
    .skills-section,
    .experience-item,
    .education-item,
    .skill-item,
    .progress-bar-container,
    .card,
    [class*="skill"],
    [class*="progress"],
    .section {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      margin-bottom: 8mm !important;
      padding: 2mm !important;
    }
    
    /* Prevent content from getting too close to page edges */
    .content-section {
      margin: 5mm 0 !important;
      padding: 2mm !important;
    }
    
    /* Natural text flow with break protection */
    .keep-together {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    .no-break {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      display: block !important;
      margin-bottom: 5mm !important;
    }
    
    /* Improved text rendering */
    p, div, span, li {
      orphans: 3 !important;
      widows: 3 !important;
      word-break: normal !important;
      hyphens: none !important;
      -webkit-hyphens: none !important;
    }
    
    /* Section grouping */
    .experience-item,
    .education-item,
    .skill-section,
    .section {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      margin-bottom: 8mm !important;
    }
    
    /* Prevent line breaking within important text elements */
    .text-content, .content-text, [class*="text"] {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      orphans: 4 !important;
      widows: 4 !important;
    }
    
    /* List protection */
    ul, ol, .list-container {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* Table protection */
    table, thead, tbody, tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* Checkbox alignment with text */
    input[type="checkbox"],
    [role="checkbox"],
    .checkbox,
    button[role="checkbox"] {
      vertical-align: baseline !important;
      margin-top: 0.1em !important;
      margin-right: 0.3em !important;
      display: inline-block !important;
    }
    
    /* Remove underlines from email and phone in PDFs */
    .no-underline,
    .no-underline *,
    span.no-underline,
    a[href^="mailto:"],
    a[href^="tel:"],
    span:has(a[href^="mailto:"]),
    span:has(a[href^="tel:"]),
    [data-email],
    [data-phone],
    .email,
    .phone,
    span[class*="no-underline"] {
      text-decoration: none !important;
      text-decoration-line: none !important;
      text-decoration-color: transparent !important;
      text-decoration-thickness: 0 !important;
      border-bottom: none !important;
      -webkit-text-decoration: none !important;
      -moz-text-decoration: none !important;
    }
  `;
  document.head.appendChild(style);

  // Apply PDF-optimized styles that match A4 proportions
  element.style.width = '180mm'; // A4 content width minus margins
  element.style.maxWidth = '180mm';
  element.style.margin = '0';
  element.style.padding = '5mm';
  element.style.overflow = 'visible';
  element.style.fontSize = '10pt'; // Readable font size
  element.style.lineHeight = '1.2';
  element.style.boxSizing = 'border-box';
  element.style.wordBreak = 'normal';
  element.style.hyphens = 'none';
  element.style.whiteSpace = 'normal';
  element.style.backgroundColor = '#ffffff';
  
  // Apply break protection classes to content sections
  const sections = element.querySelectorAll('.section, .experience-item, .education-item, [data-section], .skills-section');
  const addedClasses: { element: Element; className: string }[] = [];
  
  sections.forEach(section => {
    section.classList.add('keep-together');
    addedClasses.push({ element: section, className: 'keep-together' });
  });

  // Protect text blocks from breaking
  const textBlocks = element.querySelectorAll('p, .text-block, .job-description, .achievement, li');
  textBlocks.forEach(block => {
    block.classList.add('no-break');
    addedClasses.push({ element: block, className: 'no-break' });
  });

  // Only add page breaks to major sections if needed
  const majorSections = element.querySelectorAll('.major-section-break');
  majorSections.forEach((section, index) => {
    section.classList.add('force-page-break');
    addedClasses.push({ element: section, className: 'force-page-break' });
  });

  // Return cleanup function
  return () => {
    // Restore original styles
    Object.entries(originalStyles).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        (element.style as any)[key] = value;
      } else {
        (element.style as any)[key] = '';
      }
    });

    // Remove added classes
    addedClasses.forEach(({ element, className }) => {
      element.classList.remove(className);
    });

    // Remove injected style
    document.head.removeChild(style);
  };
}