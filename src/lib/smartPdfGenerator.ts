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

    // Configure html2pdf with conservative settings to prevent text splitting
    const opt = {
      margin: [15, 15, 15, 15], // Smaller margins to fit more content
      filename: filename,
      image: { 
        type: 'jpeg', 
        quality: quality 
      },
      html2canvas: {
        allowTaint: true,
        letterRendering: true,
        logging: false,
        scale: 1.5, // Balanced scale for quality vs stability
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        width: 210 * 3.78, // A4 width in mm * pixels per mm at 96 DPI
        height: 297 * 3.78, // A4 height in mm * pixels per mm at 96 DPI
        windowWidth: 210 * 3.78,
        windowHeight: 297 * 3.78,
        removeContainer: true,
        imageTimeout: 15000,
        onrendered: function() {
          // Force layout recalculation after render
        }
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: orientation,
        compress: false, // Disable compression to avoid text issues
        putOnlyUsedFonts: true,
        floatPrecision: 2 // Lower precision for stability
      },
      // Disable automatic page breaking to prevent text splitting
      pagebreak: { 
        mode: ['avoid-all'],
        avoid: ['*'] // Avoid breaking anywhere
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
    
    /* Smart text protection - prevent awkward splitting */
    .badge, .skill-item, .progress-bar {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      display: inline-block !important;
      orphans: 2 !important;
      widows: 2 !important;
    }
    
    /* Prevent splitting of important content blocks */
    p, li, h1, h2, h3, h4, h5, h6 {
      orphans: 2 !important;
      widows: 2 !important;
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
      hyphens: auto !important;
    }
    
    /* Keep inline elements readable */
    span, a, strong, em, b, i, code, small {
      word-break: break-word !important;
      overflow-wrap: break-word !important;
    }
    
    /* Bulletproof text containers - aggressive protection */
    p, div, li, span, strong, em, b, i, small, code, pre {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      orphans: 100 !important;
      widows: 100 !important;
      min-height: 1.2em !important;
      display: block !important;
    }
    
    /* Force inline elements to stay together */
    span, strong, em, b, i, small, code {
      display: inline-block !important;
      white-space: nowrap !important;
      word-break: keep-all !important;
    }
    
    /* Prevent line breaking within ANY text elements */
    .text-content, .content-text, [class*="text"], 
    .skill-name, .progress-text, .badge-text,
    h1, h2, h3, h4, h5, h6, p, li, span, div {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      orphans: 100 !important;
      widows: 100 !important;
      word-break: keep-all !important;
    }
    
    /* Ultra-aggressive text line protection */
    * {
      orphans: 100 !important;
      widows: 100 !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
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

  // Apply PDF-optimized styles for proper A4 layout
  element.style.width = '210mm'; // A4 width
  element.style.maxWidth = '210mm';
  element.style.margin = '0';
  element.style.padding = '20mm'; // Professional margins
  element.style.overflow = 'visible';
  element.style.fontSize = '11pt'; // Standard readable font size
  element.style.lineHeight = '1.4';
  element.style.boxSizing = 'border-box';
  element.style.wordBreak = 'break-word';
  element.style.hyphens = 'auto';
  element.style.whiteSpace = 'normal';
  element.style.textOverflow = 'ellipsis';
  
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