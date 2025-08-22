import html2pdf from 'html2pdf.js';

export interface AdvancedPdfOptions {
  filename?: string;
  margin?: number | [number, number, number, number];
  format?: string;
  orientation?: 'portrait' | 'landscape';
  quality?: number;
  dynamicScale?: boolean;
  minScale?: number;
  maxScale?: number;
  scaleStrategy?: 'conservative' | 'balanced' | 'quality';
  templateType?: 'modern' | 'classic' | 'minimalist' | 'executive' | 'creative';
  contentAwareOptimization?: boolean;
  fallbackRecovery?: boolean;
}

interface ContentAnalysis {
  textDensity: number;
  elementCount: number;
  averageLineHeight: number;
  contentHeight: number;
  contentWidth: number;
  hasComplexLayouts: boolean;
  templateType: string;
  sectionBreakdowns: SectionAnalysis[];
}

interface SectionAnalysis {
  type: 'header' | 'summary' | 'experience' | 'skills' | 'education' | 'other';
  element: HTMLElement;
  height: number;
  textLength: number;
  complexity: number;
  breakSensitivity: number;
}

interface ScaleTestResult {
  scale: number;
  hasTextSplitting: boolean;
  quality: number;
  success: boolean;
  problematicElements: HTMLElement[];
  pageBreakViolations: number;
  renderTime: number;
}

interface TemplateConfig {
  name: string;
  preferredScale: number;
  minScale: number;
  maxScale: number;
  pageBreakStrategy: 'aggressive' | 'moderate' | 'conservative';
  sectionPadding: number;
  marginStrategy: [number, number, number, number];
  specificSelectors: string[];
}

// Template-specific configurations with enhanced buffer zones
const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  modern: {
    name: 'Modern',
    preferredScale: 0.24, // More conservative for better text protection
    minScale: 0.12,
    maxScale: 0.3,
    pageBreakStrategy: 'aggressive',
    sectionPadding: 12, // Increased padding for better spacing
    marginStrategy: [8, 20, 8, 20], // Added top/bottom margins for buffer
    specificSelectors: ['.sidebar', '.main-content', '.experience-item', '.skill-item']
  },
  classic: {
    name: 'Classic',
    preferredScale: 0.26, // More conservative
    minScale: 0.14,
    maxScale: 0.32,
    pageBreakStrategy: 'aggressive', // Changed to aggressive for better protection
    sectionPadding: 10,
    marginStrategy: [8, 22, 8, 22], // Enhanced margins
    specificSelectors: ['.experience-item', '.education-item', '.skills-section']
  },
  minimalist: {
    name: 'Minimalist',
    preferredScale: 0.28, // More conservative
    minScale: 0.16,
    maxScale: 0.35,
    pageBreakStrategy: 'aggressive', // Changed to aggressive
    sectionPadding: 8,
    marginStrategy: [10, 25, 10, 25], // Enhanced margins
    specificSelectors: ['.space-y-8 > div', '.space-y-6 > div']
  },
  executive: {
    name: 'Executive',
    preferredScale: 0.25, // More conservative
    minScale: 0.13,
    maxScale: 0.31,
    pageBreakStrategy: 'aggressive',
    sectionPadding: 14, // Increased padding
    marginStrategy: [8, 20, 8, 20], // Enhanced margins
    specificSelectors: ['.profile-section', '.experience-section', '.metrics-section']
  },
  creative: {
    name: 'Creative',
    preferredScale: 0.22, // More conservative for complex layouts
    minScale: 0.11,
    maxScale: 0.28,
    pageBreakStrategy: 'aggressive',
    sectionPadding: 16, // Increased padding for complex content
    marginStrategy: [8, 18, 8, 18], // Enhanced margins
    specificSelectors: ['.creative-header', '.portfolio-section', '.skills-badges']
  }
};

/**
 * Advanced PDF generator with comprehensive text splitting prevention
 */
export async function generateAdvancedPdf(
  element: HTMLElement,
  options: AdvancedPdfOptions = {}
): Promise<Blob> {
  const {
    filename = 'enhanced-resume.pdf',
    margin = 10,
    format = 'a4',
    orientation = 'portrait',
    quality = 0.98,
    dynamicScale = true,
    templateType = 'modern',
    contentAwareOptimization = true,
    fallbackRecovery = true,
    scaleStrategy = 'conservative'
  } = options;

  console.log('🚀 Starting Advanced PDF Generation...');
  console.log(`📋 Template: ${templateType}, Strategy: ${scaleStrategy}`);

  // Get template configuration
  const templateConfig = TEMPLATE_CONFIGS[templateType] || TEMPLATE_CONFIGS.modern;
  
  // Prepare element with template-specific optimizations
  const cleanup = await prepareElementForAdvancedPdf(element, templateConfig);
  
  try {
    // Wait for layout stabilization
    await new Promise(resolve => setTimeout(resolve, 150));

    let optimalScale = templateConfig.preferredScale;
    let testResults: ScaleTestResult[] = [];

    if (dynamicScale && contentAwareOptimization) {
      console.log('🔍 Running content-aware scale optimization...');
      
      // Enhanced content analysis
      const analysis = await analyzeContentAdvanced(element, templateConfig);
      console.log('📊 Advanced analysis completed:', {
        templateType: analysis.templateType,
        sections: analysis.sectionBreakdowns.length,
        totalHeight: Math.round(analysis.contentHeight),
        complexity: analysis.hasComplexLayouts
      });

      // Multi-strategy scale calculation
      const scaleResults = await calculateOptimalScaleAdvanced(
        element, 
        analysis, 
        templateConfig, 
        scaleStrategy
      );
      
      optimalScale = scaleResults.scale;
      testResults = scaleResults.testResults;
      
      console.log(`🎯 Optimal scale determined: ${optimalScale.toFixed(3)}`);
    }

    // Configure html2pdf with enhanced buffer zones
    const bufferScale = Math.max(0.85, optimalScale / 1.15); // Additional buffer reduction
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    
    // Calculate buffer zones (minimum 15mm on all sides)
    const horizontalBuffer = Math.max(15, templateConfig.marginStrategy[1]);
    const verticalBuffer = Math.max(10, templateConfig.marginStrategy[0]);
    
    const opt = {
      margin: [verticalBuffer, horizontalBuffer, verticalBuffer, horizontalBuffer],
      filename: filename,
      image: { 
        type: 'jpeg', 
        quality: quality 
      },
      html2canvas: {
        allowTaint: true,
        letterRendering: true,
        logging: false,
        scale: bufferScale, // Use buffer-adjusted scale
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        width: Math.round((pageWidth - (horizontalBuffer * 2)) / bufferScale),
        height: Math.round((pageHeight - (verticalBuffer * 2)) / bufferScale),
        windowWidth: Math.round((pageWidth - (horizontalBuffer * 2)) / bufferScale),
        windowHeight: Math.round((pageHeight - (verticalBuffer * 2)) / bufferScale),
        backgroundColor: '#ffffff',
        removeContainer: false,
        foreignObjectRendering: true,
        // Additional buffer settings
        x: 0,
        y: 0,
        imageTimeout: 15000,
        onclone: (clonedDoc: Document) => {
          // Apply additional buffer styles to cloned document
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              margin-bottom: 3mm !important;
              padding-bottom: 2mm !important;
            }
            .section, .experience-item, .education-item, .skill-item {
              margin-bottom: ${templateConfig.sectionPadding + 4}mm !important;
              padding-bottom: ${templateConfig.sectionPadding / 2 + 2}mm !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      },
      jsPDF: { 
        unit: 'mm', 
        format: format.toLowerCase(), 
        orientation: orientation,
        compress: true,
        putOnlyUsedFonts: true,
        floatPrecision: 16,
        precision: 16
      },
      pagebreak: getEnhancedPageBreakConfig(templateConfig)
    };

    console.log('📄 Generating PDF with optimized settings...');
    const pdf = await html2pdf().set(opt).from(element).output('blob');
    
    // Post-generation validation if enabled
    if (fallbackRecovery && testResults.length > 0) {
      const hasIssues = testResults.some(result => result.hasTextSplitting);
      if (hasIssues) {
        console.log('⚠️ Potential issues detected, considering regeneration...');
        // Could implement re-generation logic here with different parameters
      }
    }
    
    cleanup();
    console.log('✅ Advanced PDF generation completed successfully');
    return pdf;
    
  } catch (error) {
    cleanup();
    console.error('❌ Error in advanced PDF generation:', error);
    
    if (fallbackRecovery) {
      console.log('🔄 Attempting fallback generation...');
      return generateFallbackPdf(element, options);
    }
    
    throw new Error('Failed to generate advanced PDF');
  }
}

/**
 * Enhanced content analysis with template awareness
 */
async function analyzeContentAdvanced(
  element: HTMLElement, 
  templateConfig: TemplateConfig
): Promise<ContentAnalysis> {
  const rect = element.getBoundingClientRect();
  
  // Detect template type from DOM structure
  const detectedTemplate = detectTemplateType(element);
  
  // Analyze sections based on template-specific selectors
  const sectionBreakdowns: SectionAnalysis[] = [];
  
  // Common section selectors
  const sectionSelectors = [
    ...templateConfig.specificSelectors,
    '.section', '.page-break-avoid', '.experience-item', '.education-item',
    '.skill-item', '.summary-section', '.header-section'
  ];
  
  for (const selector of sectionSelectors) {
    const elements = element.querySelectorAll(selector);
    elements.forEach((el: HTMLElement) => {
      const sectionRect = el.getBoundingClientRect();
      const textContent = el.textContent?.trim() || '';
      
      if (sectionRect.height > 10 && textContent.length > 10) {
        sectionBreakdowns.push({
          type: classifySectionType(el, selector),
          element: el,
          height: sectionRect.height,
          textLength: textContent.length,
          complexity: calculateElementComplexity(el),
          breakSensitivity: calculateBreakSensitivity(el, selector)
        });
      }
    });
  }

  // Calculate overall metrics
  const textElements = element.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, li');
  const complexElements = element.querySelectorAll('table, .grid, .flex, .progress-bar, canvas, svg');
  
  const totalText = Array.from(textElements)
    .map(el => el.textContent?.trim() || '')
    .join(' ');
  
  const textDensity = totalText.length / Math.max(rect.width * rect.height, 1);
  
  const lineHeights = Array.from(textElements)
    .map(el => parseFloat(window.getComputedStyle(el).lineHeight) || 16);
  const averageLineHeight = lineHeights.reduce((sum, height) => sum + height, 0) / lineHeights.length || 16;

  return {
    textDensity,
    elementCount: textElements.length,
    averageLineHeight,
    contentHeight: rect.height,
    contentWidth: rect.width,
    hasComplexLayouts: complexElements.length > 0,
    templateType: detectedTemplate,
    sectionBreakdowns
  };
}

/**
 * Advanced scale calculation with multiple testing strategies
 */
async function calculateOptimalScaleAdvanced(
  element: HTMLElement,
  analysis: ContentAnalysis,
  templateConfig: TemplateConfig,
  strategy: string
): Promise<{ scale: number; testResults: ScaleTestResult[] }> {
  
  const testResults: ScaleTestResult[] = [];
  let currentScale = calculateBaseScaleAdvanced(analysis, templateConfig, strategy);
  
  console.log(`🎯 Starting from base scale: ${currentScale.toFixed(3)}`);
  
  // Test multiple scales in parallel for efficiency
  const scaleVariants = [
    currentScale,
    currentScale * 0.9,
    currentScale * 0.85,
    currentScale * 0.8,
    Math.max(templateConfig.minScale, currentScale * 0.75)
  ].filter(scale => scale >= templateConfig.minScale && scale <= templateConfig.maxScale);
  
  console.log(`🔄 Testing ${scaleVariants.length} scale variants...`);
  
  const testPromises = scaleVariants.map((scale, index) => 
    testScaleAdvanced(element, scale, templateConfig, analysis, index)
  );
  
  const results = await Promise.all(testPromises);
  testResults.push(...results);
  
  // Find the best scale based on comprehensive scoring
  const scoredResults = testResults.map(result => ({
    ...result,
    score: calculateScaleScore(result, templateConfig, strategy)
  }));
  
  scoredResults.sort((a, b) => b.score - a.score);
  
  const bestResult = scoredResults[0];
  console.log(`✅ Best scale: ${bestResult.scale.toFixed(3)} (score: ${bestResult.score.toFixed(2)})`);
  
  return {
    scale: bestResult.scale,
    testResults
  };
}

/**
 * Advanced scale testing with accurate rendering simulation
 */
async function testScaleAdvanced(
  element: HTMLElement,
  scale: number,
  templateConfig: TemplateConfig,
  analysis: ContentAnalysis,
  testIndex: number
): Promise<ScaleTestResult> {
  const startTime = performance.now();
  
  try {
    // Create accurate test clone
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = `${210 / scale}px`;
    clone.style.visibility = 'hidden';
    clone.style.transform = `scale(${scale})`;
    clone.style.transformOrigin = 'top left';
    
    document.body.appendChild(clone);
    
    // Wait for layout and apply template-specific styles
    await new Promise(resolve => setTimeout(resolve, 50 + (testIndex * 10)));
    
    // Apply template-specific page break protection
    applyTemplateSpecificStyles(clone, templateConfig);
    
    const rect = clone.getBoundingClientRect();
    const scaledHeight = rect.height;
    const pageHeight = 297; // A4 height in mm
    const pages = Math.ceil((scaledHeight * scale * 0.352778) / pageHeight); // Convert px to mm
    
    // Advanced text splitting detection
    const { hasTextSplitting, problematicElements, violations } = 
      await detectTextSplittingAdvanced(clone, scale, pageHeight, analysis);
    
    const quality = Math.min(100, (scale * 125) - (violations * 10));
    const renderTime = performance.now() - startTime;
    
    document.body.removeChild(clone);
    
    console.log(`🔍 Scale ${scale.toFixed(3)}: splitting=${hasTextSplitting}, violations=${violations}, time=${renderTime.toFixed(1)}ms`);
    
    return {
      scale,
      hasTextSplitting,
      quality,
      success: !hasTextSplitting && violations === 0,
      problematicElements,
      pageBreakViolations: violations,
      renderTime
    };
    
  } catch (error) {
    console.warn(`⚠️ Error testing scale ${scale.toFixed(3)}:`, error);
    return {
      scale,
      hasTextSplitting: true,
      quality: 0,
      success: false,
      problematicElements: [],
      pageBreakViolations: 999,
      renderTime: performance.now() - startTime
    };
  }
}

/**
 * Enhanced text splitting detection with dynamic buffer zones
 */
async function detectTextSplittingAdvanced(
  element: HTMLElement,
  scale: number,
  pageHeight: number,
  analysis: ContentAnalysis
): Promise<{ hasTextSplitting: boolean; problematicElements: HTMLElement[]; violations: number }> {
  const rect = element.getBoundingClientRect();
  const scaledHeight = rect.height * scale * 0.352778; // Convert to mm
  const pages = Math.ceil(scaledHeight / pageHeight);
  
  let violations = 0;
  const problematicElements: HTMLElement[] = [];
  
  if (pages <= 1) {
    return { hasTextSplitting: false, problematicElements, violations: 0 };
  }
  
  // Enhanced page break points with buffer zones
  const bufferZone = 15; // 15mm buffer zone around page breaks
  const pageBreakPoints = [];
  
  for (let i = 1; i < pages; i++) {
    const breakPoint = (i * pageHeight) / (scale * 0.352778);
    pageBreakPoints.push({
      exact: breakPoint,
      dangerZoneStart: breakPoint - (bufferZone / (scale * 0.352778)),
      dangerZoneEnd: breakPoint + (bufferZone / (scale * 0.352778))
    });
  }
  
  // Test each section with enhanced buffer detection
  for (const section of analysis.sectionBreakdowns) {
    const sectionEl = section.element;
    const sectionRect = sectionEl.getBoundingClientRect();
    const relativeTop = sectionRect.top - rect.top;
    const relativeBottom = sectionRect.bottom - rect.top;
    
    for (const breakZone of pageBreakPoints) {
      // Check for content in danger zones (more aggressive detection)
      const inDangerZone = (
        (relativeTop >= breakZone.dangerZoneStart && relativeTop <= breakZone.dangerZoneEnd) ||
        (relativeBottom >= breakZone.dangerZoneStart && relativeBottom <= breakZone.dangerZoneEnd) ||
        (relativeTop < breakZone.dangerZoneStart && relativeBottom > breakZone.dangerZoneEnd)
      );
      
      if (inDangerZone) {
        // Calculate violation severity based on proximity to page break
        const distanceToBreak = Math.min(
          Math.abs(relativeTop - breakZone.exact),
          Math.abs(relativeBottom - breakZone.exact)
        );
        
        const proximityFactor = Math.max(0, 1 - (distanceToBreak / (bufferZone / (scale * 0.352778))));
        const violationWeight = section.breakSensitivity * proximityFactor;
        
        // More aggressive violation detection
        if (violationWeight > 0.05) { // Lower threshold
          violations += Math.ceil(violationWeight * 15); // Higher penalty
          problematicElements.push(sectionEl);
        }
      }
    }
  }
  
  // Enhanced checks for critical elements with larger buffer zones
  const criticalElements = element.querySelectorAll('h1, h2, h3, .job-title, .company-name, .skill-name, p, li');
  for (const criticalEl of criticalElements) {
    const elRect = criticalEl.getBoundingClientRect();
    const relativeTop = elRect.top - rect.top;
    const relativeBottom = elRect.bottom - rect.top;
    
    for (const breakZone of pageBreakPoints) {
      // Extended danger zone for critical elements
      const extendedBuffer = bufferZone * 1.5;
      const extendedStart = breakZone.exact - (extendedBuffer / (scale * 0.352778));
      const extendedEnd = breakZone.exact + (extendedBuffer / (scale * 0.352778));
      
      const inExtendedDangerZone = (
        (relativeTop >= extendedStart && relativeTop <= extendedEnd) ||
        (relativeBottom >= extendedStart && relativeBottom <= extendedEnd) ||
        (relativeTop < extendedStart && relativeBottom > extendedEnd)
      );
      
      if (inExtendedDangerZone) {
        violations += 8; // High penalty for critical elements in danger zones
        problematicElements.push(criticalEl as HTMLElement);
      }
    }
  }
  
  return {
    hasTextSplitting: violations > 0,
    problematicElements,
    violations
  };
}

// Helper functions

function detectTemplateType(element: HTMLElement): string {
  // Detect template based on DOM structure
  if (element.querySelector('.sidebar') && element.querySelector('.main-content')) return 'modern';
  if (element.querySelector('.text-center') && element.querySelector('.border-b-2')) return 'classic';
  if (element.querySelector('.font-light') && element.querySelector('.tracking-wide')) return 'minimalist';
  if (element.querySelector('.profile-section') && element.querySelector('.metrics-section')) return 'executive';
  if (element.querySelector('.creative-header') || element.querySelector('.gradient')) return 'creative';
  return 'modern'; // default
}

function classifySectionType(element: HTMLElement, selector: string): SectionAnalysis['type'] {
  const classNames = element.className.toLowerCase();
  const textContent = element.textContent?.toLowerCase() || '';
  
  if (classNames.includes('header') || selector.includes('header')) return 'header';
  if (classNames.includes('summary') || textContent.includes('summary')) return 'summary';
  if (classNames.includes('experience') || textContent.includes('experience')) return 'experience';
  if (classNames.includes('skill') || textContent.includes('skill')) return 'skills';
  if (classNames.includes('education') || textContent.includes('education')) return 'education';
  return 'other';
}

function calculateElementComplexity(element: HTMLElement): number {
  const childCount = element.children.length;
  const nestedLevels = getMaxNestingLevel(element);
  const hasComplexStyles = hasComplexStyling(element);
  
  return (childCount * 0.1) + (nestedLevels * 0.5) + (hasComplexStyles ? 1 : 0);
}

function calculateBreakSensitivity(element: HTMLElement, selector: string): number {
  let sensitivity = 1;
  
  // Higher sensitivity for critical sections
  if (selector.includes('experience') || selector.includes('skill')) sensitivity *= 2;
  if (element.querySelector('h1, h2, h3')) sensitivity *= 1.5;
  if (element.textContent && element.textContent.length > 200) sensitivity *= 1.3;
  
  return Math.min(sensitivity, 5);
}

function calculateBaseScaleAdvanced(
  analysis: ContentAnalysis,
  templateConfig: TemplateConfig,
  strategy: string
): number {
  let baseScale = templateConfig.preferredScale;
  
  // Adjust based on content analysis
  const densityFactor = Math.min(analysis.textDensity * 0.2, 0.2);
  const complexityFactor = analysis.hasComplexLayouts ? 0.05 : 0;
  const sectionFactor = analysis.sectionBreakdowns.length * 0.01;
  
  switch (strategy) {
    case 'conservative':
      baseScale = templateConfig.minScale + (baseScale - templateConfig.minScale) * 0.5;
      baseScale -= (densityFactor + complexityFactor + sectionFactor);
      break;
    case 'quality':
      baseScale = templateConfig.maxScale - (baseScale - templateConfig.minScale) * 0.3;
      baseScale -= (densityFactor * 0.5 + complexityFactor * 0.5);
      break;
    case 'balanced':
    default:
      baseScale -= (densityFactor + complexityFactor + sectionFactor * 0.5);
      break;
  }
  
  return Math.max(templateConfig.minScale, Math.min(templateConfig.maxScale, baseScale));
}

function calculateScaleScore(
  result: ScaleTestResult,
  templateConfig: TemplateConfig,
  strategy: string
): number {
  let score = 0;
  
  // Base score from quality
  score += result.quality * 0.3;
  
  // Heavy penalty for text splitting
  if (result.hasTextSplitting) score -= 50;
  
  // Penalty for page break violations
  score -= result.pageBreakViolations * 5;
  
  // Bonus for successful render
  if (result.success) score += 30;
  
  // Performance factor
  score -= Math.max(0, result.renderTime - 100) * 0.1;
  
  // Strategy-specific adjustments
  switch (strategy) {
    case 'conservative':
      if (!result.hasTextSplitting) score += 20;
      break;
    case 'quality':
      score += result.quality * 0.2;
      break;
  }
  
  return score;
}

function getMaxNestingLevel(element: HTMLElement, level = 0): number {
  const children = Array.from(element.children);
  if (children.length === 0) return level;
  
  return Math.max(...children.map(child => 
    getMaxNestingLevel(child as HTMLElement, level + 1)
  ));
}

function hasComplexStyling(element: HTMLElement): boolean {
  const computedStyle = window.getComputedStyle(element);
  return !!(
    computedStyle.transform !== 'none' ||
    computedStyle.position === 'absolute' ||
    computedStyle.position === 'fixed' ||
    computedStyle.display === 'grid' ||
    computedStyle.display === 'flex'
  );
}

/**
 * Enhanced page break configuration with comprehensive text protection
 */
function getEnhancedPageBreakConfig(templateConfig: TemplateConfig) {
  const baseConfig = {
    mode: ['avoid-all', 'css', 'legacy'],
    before: '.page-break-before',
    after: '.page-break-after'
  };
  
  // All templates now use aggressive protection to prevent text cutting
  return {
    ...baseConfig,
    avoid: [
      '.page-break-avoid', '.section', '.experience-item', '.education-item', 
      '.skill-item', '.sidebar', '.main-content', '.summary-section',
      '.contact-section', '.skills-section', '.portfolio-section',
      'p', 'li', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      '.job-title', '.company-name', '.skill-name', '.degree-title',
      '.progress-container', '.skill-bar', '.badge', '.card',
      // Template-specific selectors
      ...templateConfig.specificSelectors,
      // Catch-all for any remaining elements
      '*'
    ]
  };
}

/**
 * Apply template-specific styles for PDF optimization
 */
function applyTemplateSpecificStyles(element: HTMLElement, templateConfig: TemplateConfig) {
  // Add template-specific padding and margins
  const sections = element.querySelectorAll('.section, .experience-item, .education-item, .skill-item');
  sections.forEach(section => {
    (section as HTMLElement).style.marginBottom = `${templateConfig.sectionPadding}mm`;
    (section as HTMLElement).style.paddingBottom = `${templateConfig.sectionPadding / 2}mm`;
  });
  
  // Apply template-specific selector styles
  templateConfig.specificSelectors.forEach(selector => {
    const elements = element.querySelectorAll(selector);
    elements.forEach(el => {
      (el as HTMLElement).style.pageBreakInside = 'avoid';
      (el as HTMLElement).style.breakInside = 'avoid';
    });
  });
}

/**
 * Enhanced element preparation with template-specific optimizations
 */
async function prepareElementForAdvancedPdf(
  element: HTMLElement, 
  templateConfig: TemplateConfig
): Promise<() => void> {
  const originalStyles = {
    width: element.style.width,
    maxWidth: element.style.maxWidth,
    margin: element.style.margin,
    padding: element.style.padding,
    overflow: element.style.overflow
  };

  // Inject enhanced CSS with comprehensive buffer protection
  const style = document.createElement('style');
  const bufferPadding = templateConfig.sectionPadding + 4; // Extra buffer
  const bufferMargin = Math.max(15, templateConfig.marginStrategy[1]); // Minimum 15mm buffer
  
  style.textContent = `
    /* Enhanced Page Break Control with Buffer Zones */
    .page-break-avoid, .section, .experience-item, .education-item, .skill-item,
    .summary-section, .contact-section, .skills-section, .portfolio-section {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      margin-bottom: ${bufferPadding}mm !important;
      padding-bottom: ${bufferPadding / 2}mm !important;
      margin-top: 4mm !important;
      padding-top: 2mm !important;
    }
    
    /* Comprehensive text protection */
    p, li, span, div, h1, h2, h3, h4, h5, h6,
    .job-title, .company-name, .skill-name, .degree-title,
    .progress-container, .skill-bar, .badge, .card {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      orphans: 4 !important;
      widows: 4 !important;
      margin-bottom: 3mm !important;
    }
    
    /* Template-specific optimizations with enhanced buffers */
    ${templateConfig.specificSelectors.map(selector => `
      ${selector} {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        orphans: 4 !important;
        widows: 4 !important;
        margin-bottom: ${bufferPadding}mm !important;
        padding: 2mm !important;
      }
    `).join('\n')}
    
    /* Enhanced print styles with buffer protection */
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        box-sizing: border-box !important;
        max-width: 100% !important;
      }
      
      body {
        margin: ${bufferMargin}mm !important;
        padding: 5mm !important;
        font-size: 10.5pt !important;
        line-height: 1.25 !important;
        background: white !important;
        color: black !important;
      }
      
      /* Critical element protection with enhanced buffers */
      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid !important;
        page-break-inside: avoid !important;
        break-after: avoid !important;
        break-inside: avoid !important;
        orphans: 4 !important;
        widows: 4 !important;
        margin-top: 6mm !important;
        margin-bottom: 4mm !important;
        padding-bottom: 2mm !important;
      }
      
      /* Prevent content from being too close to page edges */
      .content-wrapper, .resume-content {
        margin: 8mm 0 !important;
        padding: 4mm !important;
      }
      
      /* Enhanced orphan/widow control */
      p, li, div {
        orphans: 4 !important;
        widows: 4 !important;
        margin-bottom: 3mm !important;
      }
      
      /* Skill bars and progress elements */
      .progress-bar, .skill-bar, .progress-container {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        margin: 2mm 0 4mm 0 !important;
        padding: 1mm !important;
      }
    }
  `;
  
  document.head.appendChild(style);
  
  // Apply element optimizations
  element.style.width = '210mm';
  element.style.maxWidth = '210mm';
  element.style.margin = '0';
  element.style.padding = '0';
  element.style.overflow = 'visible';
  
  return () => {
    document.head.removeChild(style);
    Object.assign(element.style, originalStyles);
  };
}

/**
 * Fallback PDF generation with basic settings
 */
async function generateFallbackPdf(
  element: HTMLElement,
  options: AdvancedPdfOptions
): Promise<Blob> {
  console.log('🔄 Generating fallback PDF...');
  
  const opt = {
    margin: [0, 20, 0, 20],
    filename: options.filename || 'resume.pdf',
    image: { type: 'jpeg', quality: 0.92 },
    html2canvas: {
      scale: 0.25,
      allowTaint: true,
      letterRendering: true,
      logging: false
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    },
    pagebreak: { mode: ['css'] }
  };
  
  return await html2pdf().set(opt).from(element).output('blob');
}

/**
 * Download function using advanced PDF generation
 */
export async function downloadAdvancedPdf(
  element: HTMLElement,
  options: AdvancedPdfOptions = {}
): Promise<void> {
  try {
    const blob = await generateAdvancedPdf(element, options);
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = options.filename || 'enhanced-resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('✅ Advanced PDF download completed');
  } catch (error) {
    console.error('❌ Error downloading advanced PDF:', error);
    throw error;
  }
}