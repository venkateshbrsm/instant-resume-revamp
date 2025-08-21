import html2pdf from 'html2pdf.js';

export interface SmartPdfOptions {
  filename?: string;
  margin?: number | [number, number, number, number];
  format?: string;
  orientation?: 'portrait' | 'landscape';
  quality?: number;
  dynamicScale?: boolean;
  minScale?: number;
  maxScale?: number;
  scaleStrategy?: 'conservative' | 'balanced' | 'quality';
}

interface ContentAnalysis {
  textDensity: number;
  elementCount: number;
  averageLineHeight: number;
  contentHeight: number;
  contentWidth: number;
  hasComplexLayouts: boolean;
}

interface ScaleTestResult {
  scale: number;
  hasTextSplitting: boolean;
  quality: number;
  success: boolean;
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
    quality = 0.98,
    dynamicScale = true,
    minScale = 0.2,
    maxScale = 0.8,
    scaleStrategy = 'balanced'
  } = options;

  // Prepare element for better PDF generation
  const cleanup = prepareElementForPdf(element);
  
  try {
    // Wait for any layout changes to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    // Calculate optimal scale dynamically if enabled
    let optimalScale = 0.355; // fallback scale
    if (dynamicScale) {
      console.log('🎯 Starting dynamic scale calculation...');
      optimalScale = await calculateOptimalScale(element, {
        minScale,
        maxScale,
        scaleStrategy,
        format,
        orientation
      });
      console.log(`📐 Calculated optimal scale: ${optimalScale}`);
    }

    // Configure html2pdf with proper page break handling
    const opt = {
      margin: [0, 20, 0, 20], // No top/bottom margins, keep left/right margins in mm
      filename: filename,
      image: { 
        type: 'jpeg', 
        quality: quality 
      },
      html2canvas: {
        allowTaint: true,
        letterRendering: true,
        logging: false,
        scale: optimalScale,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        width: Math.round(210 / optimalScale), // A4 width scaled
        height: Math.round(297 / optimalScale), // A4 height scaled
        windowWidth: Math.round(210 / optimalScale),
        windowHeight: Math.round(297 / optimalScale),
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: orientation,
        compress: true,
        putOnlyUsedFonts: true,
        floatPrecision: 16 // Higher precision for better layout
      },
      // Critical: Enable CSS page break handling with aggressive text protection
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: ['.page-break-avoid', 'p', 'li', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', '*']
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
 * Analyzes content to determine optimal scaling parameters
 */
async function analyzeContent(element: HTMLElement): Promise<ContentAnalysis> {
  // Get computed styles and dimensions
  const computedStyle = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  
  // Count different types of elements
  const textElements = element.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li');
  const complexElements = element.querySelectorAll('table, .grid, .flex, .progress-bar, canvas, svg');
  
  // Calculate text density
  const totalText = Array.from(textElements)
    .map(el => el.textContent?.trim() || '')
    .join(' ');
  
  const textDensity = totalText.length / Math.max(rect.width * rect.height, 1);
  
  // Calculate average line height
  const lineHeights = Array.from(textElements)
    .map(el => parseFloat(window.getComputedStyle(el).lineHeight) || 16);
  const averageLineHeight = lineHeights.reduce((sum, height) => sum + height, 0) / lineHeights.length || 16;
  
  return {
    textDensity,
    elementCount: textElements.length,
    averageLineHeight,
    contentHeight: rect.height,
    contentWidth: rect.width,
    hasComplexLayouts: complexElements.length > 0
  };
}

/**
 * Calculates base scale based on content analysis and strategy
 */
function calculateBaseScale(
  analysis: ContentAnalysis,
  strategy: 'conservative' | 'balanced' | 'quality',
  minScale: number,
  maxScale: number
): number {
  let baseScale: number;
  
  switch (strategy) {
    case 'conservative':
      // Prioritize avoiding text splitting over quality
      baseScale = Math.max(0.2, minScale + (analysis.textDensity * 0.1));
      break;
      
    case 'quality':
      // Prioritize visual quality, accept some risk of splitting
      baseScale = Math.min(0.7, maxScale - (analysis.textDensity * 0.2));
      break;
      
    case 'balanced':
    default:
      // Balance between quality and text integrity
      const densityFactor = Math.min(analysis.textDensity * 0.3, 0.3);
      const complexityFactor = analysis.hasComplexLayouts ? 0.05 : 0;
      baseScale = 0.5 - densityFactor - complexityFactor;
      break;
  }
  
  return Math.max(minScale, Math.min(maxScale, baseScale));
}

/**
 * Tests a specific scale by simulating PDF generation
 */
async function testScale(
  element: HTMLElement,
  scale: number,
  pageHeight: number = 297 // A4 height in mm
): Promise<ScaleTestResult> {
  try {
    // Create a temporary clone for testing
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = `${210 / scale}px`; // A4 width scaled
    clone.style.visibility = 'hidden';
    document.body.appendChild(clone);
    
    // Wait for layout
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const rect = clone.getBoundingClientRect();
    const scaledHeight = rect.height * scale;
    const pages = Math.ceil(scaledHeight / pageHeight);
    
    // Check for potential text splitting at page boundaries
    let hasTextSplitting = false;
    const pageBreakPoints = [];
    
    for (let i = 1; i < pages; i++) {
      const breakPoint = (i * pageHeight) / scale;
      pageBreakPoints.push(breakPoint);
    }
    
    // Analyze text elements near page break points
    const textElements = clone.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li');
    
    for (const textEl of textElements) {
      const textRect = textEl.getBoundingClientRect();
      const relativeTop = textRect.top - rect.top;
      const relativeBottom = textRect.bottom - rect.top;
      
      for (const breakPoint of pageBreakPoints) {
        // Check if text element spans across a page break
        if (relativeTop < breakPoint && relativeBottom > breakPoint) {
          // Additional check: is this a substantial text element?
          const textHeight = relativeBottom - relativeTop;
          if (textHeight > 10) { // Minimum height threshold
            hasTextSplitting = true;
            break;
          }
        }
      }
      
      if (hasTextSplitting) break;
    }
    
    // Calculate quality score (higher scale = better quality)
    const quality = Math.min(100, scale * 125);
    
    document.body.removeChild(clone);
    
    return {
      scale,
      hasTextSplitting,
      quality,
      success: !hasTextSplitting
    };
    
  } catch (error) {
    console.warn(`Error testing scale ${scale}:`, error);
    return {
      scale,
      hasTextSplitting: true,
      quality: 0,
      success: false
    };
  }
}

/**
 * Calculates optimal scale using iterative testing
 */
async function calculateOptimalScale(
  element: HTMLElement,
  options: {
    minScale: number;
    maxScale: number;
    scaleStrategy: 'conservative' | 'balanced' | 'quality';
    format: string;
    orientation: string;
  }
): Promise<number> {
  const { minScale, maxScale, scaleStrategy } = options;
  
  console.log('🔍 Analyzing content for optimal scale...');
  
  // Step 1: Analyze content
  const analysis = await analyzeContent(element);
  console.log('📊 Content analysis:', {
    textDensity: analysis.textDensity.toFixed(4),
    elementCount: analysis.elementCount,
    hasComplexLayouts: analysis.hasComplexLayouts
  });
  
  // Step 2: Calculate base scale
  let currentScale = calculateBaseScale(analysis, scaleStrategy, minScale, maxScale);
  console.log(`🎯 Base scale calculated: ${currentScale.toFixed(3)}`);
  
  // Step 3: Test scale and adjust if needed
  const maxIterations = 5;
  let iteration = 0;
  
  while (iteration < maxIterations) {
    console.log(`🔄 Testing scale: ${currentScale.toFixed(3)} (iteration ${iteration + 1})`);
    
    const testResult = await testScale(element, currentScale);
    
    if (testResult.success) {
      console.log(`✅ Scale ${currentScale.toFixed(3)} passed test - no text splitting detected`);
      return currentScale;
    }
    
    console.log(`⚠️ Scale ${currentScale.toFixed(3)} failed - text splitting detected, reducing scale`);
    
    // Reduce scale by 10% and try again
    currentScale = Math.max(minScale, currentScale * 0.9);
    
    // If we've hit minimum scale, stop
    if (currentScale <= minScale) {
      console.log(`🛡️ Reached minimum scale: ${minScale}`);
      return minScale;
    }
    
    iteration++;
  }
  
  console.log(`⏰ Max iterations reached, using scale: ${currentScale.toFixed(3)}`);
  return currentScale;
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
        margin: 0 2cm !important;
        padding: 0 !important;
        border: none !important;
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
    
    /* ULTRA-AGGRESSIVE text protection - prevent ALL text splitting */
    *, *::before, *::after {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      orphans: 10 !important;
      widows: 10 !important;
      word-break: keep-all !important;
      overflow-wrap: normal !important;
      hyphens: none !important;
      -webkit-hyphens: none !important;
      -ms-hyphens: none !important;
    }
    
    /* Force all text elements to be unbreakable blocks */
    p, span, div, li, h1, h2, h3, h4, h5, h6, a, strong, em, b, i, code, small {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      display: block !important;
      orphans: 10 !important;
      widows: 10 !important;
      white-space: normal !important;
      word-wrap: normal !important;
      overflow-wrap: normal !important;
    }
    
    /* Keep inline elements together */
    span, a, strong, em, b, i, code, small {
      display: inline !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      white-space: nowrap !important;
    }
    
    /* Bulletproof text containers */
    p, div, li {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      orphans: 10 !important;
      widows: 10 !important;
      min-height: 1.2em !important;
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

  // Apply PDF-optimized styles with EXTREME conservative sizing to prevent any splitting
  element.style.width = '100mm'; // EXTREME small width to absolutely guarantee no cutoff
  element.style.maxWidth = '100mm';
  element.style.margin = '0'; // Remove margins to prevent sizing conflicts
  element.style.padding = '1mm'; // Minimal padding
  element.style.overflow = 'visible';
  element.style.fontSize = '6pt'; // Extremely small font to prevent splitting
  element.style.lineHeight = '0.9';
  element.style.boxSizing = 'border-box';
  element.style.wordBreak = 'keep-all';
  element.style.hyphens = 'none';
  element.style.whiteSpace = 'nowrap';
  element.style.textOverflow = 'clip';
  
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