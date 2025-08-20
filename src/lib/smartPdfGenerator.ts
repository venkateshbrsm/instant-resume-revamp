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
    /* Prevent content from being cut off at page breaks */
    .page-break-avoid,
    .skills-section,
    .experience-item,
    .education-item,
    .skill-item,
    .progress-bar-container,
    .card,
    [class*="skill"],
    [class*="progress"] {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* Ensure proper spacing around sections */
    .section, .major-section {
      page-break-after: avoid !important;
    }
    
    /* Force breaks before major headings (except first) */
    .page-break-before {
      page-break-before: always !important;
      break-before: page !important;
    }
    
    /* Enhanced span protection - force spans to next page if they would be cut */
    span {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      orphans: 2 !important;
      widows: 2 !important;
      display: inline-block !important;
    }
    
    /* General content protection */
    div, p, li {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* Specific protection for skill bars and lists */
    ul, ol, .list-container {
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