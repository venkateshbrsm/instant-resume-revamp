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

    // Configure html2pdf with proper page break handling
    const opt = {
      margin: margin,
      filename: filename,
      image: { 
        type: 'jpeg', 
        quality: quality 
      },
      html2canvas: {
        allowTaint: true,
        letterRendering: true,
        logging: false,
        scale: 0.8, // Increased scale for better quality
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: { 
        unit: 'mm', 
        format: format, 
        orientation: orientation,
        compress: true
      },
      // Critical: Enable CSS page break handling
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: '.page-break-avoid'
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
    /* AGGRESSIVE page break prevention - Force whole containers to next page */
    * {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      orphans: 4 !important;
      widows: 4 !important;
    }
    
    /* Ultra-aggressive container protection - prevent ANY splitting */
    div, span, p, a, strong, em, b, i, u, small, sub, sup,
    article, section, aside, nav, header, footer, main,
    figure, figcaption, blockquote, pre, code, kbd, samp, var,
    details, summary, mark, ins, del, dfn, abbr, time,
    address, cite, q, s, strike, tt, big {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      page-break-before: auto !important;
      break-before: auto !important;
      orphans: 4 !important;
      widows: 4 !important;
      /* Force containers to stay together */
      min-height: 0 !important;
      box-decoration-break: clone !important;
    }
    
    /* Smallest containers - NEVER split these */
    span, small, em, strong, b, i, u, sub, sup, code, kbd, samp, var,
    .text-xs, .text-sm, .opacity-60, .opacity-75, .opacity-80, .opacity-90 {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      display: inline-block !important;
      white-space: nowrap !important;
      orphans: 5 !important;
      widows: 5 !important;
    }
    
    /* Core page break prevention classes */
    .page-break-avoid,
    .print\\:avoid-break,
    .print\\:break-inside-avoid,
    .print\\:page-break-inside-avoid,
    .break-inside-avoid,
    .page-break-inside-avoid {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* Template-specific content structures */
    .experience-item,
    .education-item,
    .skill-item,
    .achievement-item,
    .section-content,
    .card,
    .badge,
    .progress-bar-container,
    [class*="skill"],
    [class*="progress"],
    [class*="achievement"],
    [class*="experience"],
    [class*="education"] {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* Lists and grouped content */
    ul, ol, .list-container, .space-y-3, .space-y-4, .space-y-6, .space-y-8 {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* List items that should stay together */
    li, .flex.items-center, .achievement-wrapper {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* Sections and major content blocks */
    .section, .major-section, .sidebar-section {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    
    /* Experience and education blocks */
    .border-l-2, .border-l-4, .pl-6, .relative.p-6 {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* Headers and their immediate content */
    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    
    /* Force breaks before major headings (except first) */
    .page-break-before {
      page-break-before: always !important;
      break-before: page !important;
    }
    
    /* Specific template layout protection */
    .grid, .flex, .flex-col, .flex-row {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* Badge groups and skill collections */
    .flex-wrap, .gap-2, .gap-3 {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* Print-specific layout fixes */
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      .break-inside-avoid,
      .page-break-inside-avoid,
      .print\\:avoid-break,
      .print\\:break-inside-avoid,
      .print\\:page-break-inside-avoid {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      
      /* Ensure content doesn't overflow */
      .overflow-hidden {
        overflow: visible !important;
      }
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
  
  // Apply comprehensive page break classes to all relevant elements including lowest level containers
  const allContentElements = element.querySelectorAll(`
    .section, .experience-item, .education-item, [data-section], .skills-section, .skill-item, 
    .progress-bar, [class*="skill"], [class*="progress"], [class*="achievement"], 
    .border-l-2, .border-l-4, .pl-6, .relative.p-6, .space-y-3, .space-y-4, .space-y-6, .space-y-8,
    ul, ol, .list-container, .grid, .flex-wrap, .badge, .card, 
    .experience-entry, .job-entry, .education-entry, .degree-entry,
    li, .flex.items-center, .achievement-wrapper, .sidebar-section,
    div, span, p, a, strong, em, b, i, u, small, h1, h2, h3, h4, h5, h6,
    .text-xs, .text-sm, .text-base, .text-lg, .text-xl, .text-2xl, .text-3xl,
    .font-medium, .font-semibold, .font-bold, .font-light, .font-normal,
    .opacity-90, .opacity-80, .opacity-75, .opacity-60, .opacity-50,
    .mb-2, .mb-3, .mb-4, .mb-6, .mb-8, .mt-2, .mt-3, .mt-4, .mt-6, .mt-8,
    .px-2, .px-3, .px-4, .py-1, .py-2, .py-3, .p-3, .p-4, .p-6, .p-8,
    .rounded, .rounded-lg, .rounded-full, .rounded-xl, .bg-white
  `);
  
  const addedClasses: { element: Element; className: string }[] = [];
  
  allContentElements.forEach(element => {
    element.classList.add('page-break-avoid');
    addedClasses.push({ element: element, className: 'page-break-avoid' });
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