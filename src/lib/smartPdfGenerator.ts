import html2pdf from 'html2pdf.js';

export interface SmartPdfOptions {
  filename?: string;
  margin?: number | [number, number, number, number];
  format?: string;
  orientation?: 'portrait' | 'landscape';
  quality?: number;
}

/**
 * Generates PDF using html2pdf.js which properly respects CSS page break rules
 * This is much better than html2canvas approach for handling page breaks
 */
export async function generateSmartPdf(
  element: HTMLElement,
  options: SmartPdfOptions = {}
): Promise<Blob> {
  const {
    filename = 'enhanced-resume.pdf',
    margin = 10,
    format = 'a4',
    orientation = 'portrait',
    quality = 0.98
  } = options;

  // Prepare element for better PDF generation
  const cleanup = prepareElementForPdf(element);
  
  try {
    // Wait for any layout changes to settle
    await new Promise(resolve => setTimeout(resolve, 100));

  // Configure html2pdf with printer-friendly settings
  const opt = {
    margin: Array.isArray(margin) ? margin : [15, 15, 15, 15], // Generous margins for printing
    filename: filename,
    image: { 
      type: 'jpeg', 
      quality: 0.95 // Higher quality for print
    },
    html2canvas: {
      allowTaint: true,
      letterRendering: true,
      logging: false,
      scale: 1.2, // Higher scale for crisp print quality
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      dpi: 300, // Print-quality DPI
      backgroundColor: '#ffffff'
    },
    jsPDF: { 
      unit: 'mm', 
      format: format, 
      orientation: orientation,
      compress: false, // Don't compress for better print quality
      precision: 16
    },
    // Enhanced page break handling for printer-friendly output
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: '.page-break-avoid, .print-keep-together'
    }
  };

    // Generate PDF blob
    const pdf = await html2pdf().set(opt).from(element).output('blob');
    
    cleanup();
    return pdf;
  } catch (error) {
    cleanup();
    console.error('Error generating smart PDF:', error);
    throw new Error('Failed to generate PDF with smart page breaks');
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
 * Prepares element for PDF generation with proper page break classes
 */
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

  // Inject CSS for printer-friendly page break handling
  const style = document.createElement('style');
  style.textContent = `
    /* Print-specific optimizations */
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      body {
        margin: 0 !important;
        padding: 15mm !important;
        background: white !important;
        font-size: 11pt !important;
        line-height: 1.3 !important;
      }
    }
    
    /* Prevent content from being cut off at page breaks */
    .page-break-avoid,
    .print-keep-together,
    .skills-section,
    .experience-item,
    .education-item,
    .skill-item,
    .progress-bar-container,
    .card,
    [class*="skill"],
    [class*="progress"],
    .border-l-4,
    .pl-6 {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      display: block !important;
      overflow: visible !important;
    }
    
    /* Ensure sections stay together */
    .section, .major-section {
      page-break-after: avoid !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* Force breaks before major headings (except first) */
    .page-break-before {
      page-break-before: always !important;
      break-before: page !important;
    }
    
    /* General content protection with orphan/widow control */
    div, p, li, span, h1, h2, h3, h4, h5, h6 {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      orphans: 3 !important;
      widows: 3 !important;
    }
    
    /* Specific protection for lists and containers */
    ul, ol, .list-container, .grid, .space-y-3, .space-y-4, .space-y-6, .space-y-8 {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* Printer-friendly spacing */
    .print-section {
      margin-bottom: 8mm !important;
      padding-bottom: 4mm !important;
    }
    
    /* Ensure images and badges stay with their content */
    img, .badge, .rounded-full {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
  `;
  document.head.appendChild(style);

  // Apply PDF-optimized styles
  element.style.width = '210mm'; // A4 width
  element.style.maxWidth = '210mm';
  element.style.margin = '0';
  element.style.padding = '0';
  element.style.overflow = 'visible';
  element.style.fontSize = '12pt';
  element.style.lineHeight = '1.4';
  
  // Apply page break classes to sections and skill-related elements
  const sections = element.querySelectorAll('.section, .experience-item, .education-item, [data-section], .skills-section, .skill-item, .progress-bar, [class*="skill"], [class*="progress"]');
  const addedClasses: { element: Element; className: string }[] = [];
  
  sections.forEach(section => {
    section.classList.add('page-break-avoid');
    addedClasses.push({ element: section, className: 'page-break-avoid' });
  });

  // Add page break avoidance to experience and education blocks
  const experienceItems = element.querySelectorAll('[data-experience], .experience-entry, .job-entry');
  const educationItems = element.querySelectorAll('[data-education], .education-entry, .degree-entry');
  
  [...experienceItems, ...educationItems].forEach(item => {
    item.classList.add('page-break-avoid');
    addedClasses.push({ element: item, className: 'page-break-avoid' });
  });

  // Add page break avoidance to skill and progress elements specifically
  const skillElements = element.querySelectorAll('.skill-bar, .progress-container, .skill-list, ul, ol, .list-group, .grid, [role="progressbar"]');
  skillElements.forEach(skillElement => {
    skillElement.classList.add('page-break-avoid');
    addedClasses.push({ element: skillElement, className: 'page-break-avoid' });
  });

  // Add break-before class to major sections (except first)
  const majorSections = element.querySelectorAll('h1, h2, .section-title, .major-section');
  majorSections.forEach((section, index) => {
    if (index > 0) { // Skip first section
      section.classList.add('page-break-before');
      addedClasses.push({ element: section, className: 'page-break-before' });
    }
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