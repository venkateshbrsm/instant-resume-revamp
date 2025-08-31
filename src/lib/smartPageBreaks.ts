import { jsPDF } from 'jspdf';

export interface PageBreakOptions {
  pageHeight: number;
  marginTop: number;
  marginBottom: number;
  minSpaceForContent: number; // Minimum space needed to start new content
}

export interface ContentBlock {
  type: 'text' | 'list' | 'section' | 'experience';
  estimatedHeight: number;
  canSplit: boolean;
  content: any;
}

export class SmartPageBreaker {
  private doc: jsPDF;
  private options: PageBreakOptions;

  constructor(doc: jsPDF, options: Partial<PageBreakOptions> = {}) {
    this.doc = doc;
    this.options = {
      pageHeight: 297,
      marginTop: 20,
      marginBottom: 20,
      minSpaceForContent: 25,
      ...options
    };
  }

  /**
   * Calculates the height needed for text content
   */
  calculateTextHeight(text: string, width: number, fontSize: number = 10, lineHeight: number = 4.5): number {
    this.doc.setFontSize(fontSize);
    const lines = this.doc.splitTextToSize(text, width);
    return lines.length * lineHeight + 2; // +2 for spacing
  }

  /**
   * Calculates height needed for a list of items
   */
  calculateListHeight(items: string[], width: number, fontSize: number = 9, lineHeight: number = 4): number {
    let totalHeight = 0;
    this.doc.setFontSize(fontSize);
    
    items.forEach(item => {
      const lines = this.doc.splitTextToSize(item, width - 10); // -10 for bullet indentation
      totalHeight += lines.length * lineHeight + 2;
    });
    
    return totalHeight;
  }

  /**
   * Calculates height needed for an experience block
   */
  calculateExperienceHeight(experience: any, contentWidth: number): number {
    let height = 0;
    
    // Title + Company + Duration
    height += 15;
    
    // Description
    if (experience.description) {
      height += this.calculateTextHeight(experience.description, contentWidth, 9, 4);
    }
    
    // Core Responsibilities
    if (experience.core_responsibilities?.length > 0) {
      height += 8; // Header
      height += this.calculateListHeight(experience.core_responsibilities, contentWidth, 8, 3.5);
    }
    
    // Achievements
    if (experience.achievements?.length > 0) {
      height += 8; // Header
      height += this.calculateListHeight(experience.achievements, contentWidth, 9, 4);
    }
    
    // Spacing after experience
    height += 8;
    
    return height;
  }

  /**
   * Checks if there's enough space for content and handles page break if needed
   */
  smartPageBreak(currentY: number, requiredHeight: number, onPageBreak?: () => void): number {
    const availableSpace = this.options.pageHeight - this.options.marginBottom - currentY;
    
    if (requiredHeight > availableSpace) {
      this.doc.addPage();
      if (onPageBreak) {
        onPageBreak();
      }
      return this.options.marginTop;
    }
    
    return currentY;
  }

  /**
   * Handles smart text rendering with automatic page breaks
   */
  renderTextWithBreaks(
    text: string, 
    x: number, 
    startY: number, 
    width: number, 
    fontSize: number = 10,
    lineHeight: number = 4.5,
    onPageBreak?: () => void
  ): number {
    this.doc.setFontSize(fontSize);
    const lines = this.doc.splitTextToSize(text, width);
    let currentY = startY;
    
    for (let i = 0; i < lines.length; i++) {
      // Check if we need a page break
      if (currentY + lineHeight > this.options.pageHeight - this.options.marginBottom) {
        this.doc.addPage();
        if (onPageBreak) {
          onPageBreak();
        }
        currentY = this.options.marginTop;
      }
      
      this.doc.text(lines[i], x, currentY);
      currentY += lineHeight;
    }
    
    return currentY;
  }

  /**
   * Renders a list with smart page breaks
   */
  renderListWithBreaks(
    items: string[],
    x: number,
    startY: number,
    width: number,
    fontSize: number = 9,
    lineHeight: number = 4,
    bulletChar: string = '•',
    onPageBreak?: () => void
  ): number {
    this.doc.setFontSize(fontSize);
    let currentY = startY;
    
    items.forEach(item => {
      const lines = this.doc.splitTextToSize(item, width - 10);
      const itemHeight = lines.length * lineHeight + 2;
      
      // Check if entire item fits on current page
      if (currentY + itemHeight > this.options.pageHeight - this.options.marginBottom) {
        this.doc.addPage();
        if (onPageBreak) {
          onPageBreak();
        }
        currentY = this.options.marginTop;
      }
      
      // Render bullet
      this.doc.text(bulletChar, x, currentY);
      
      // Render item text
      lines.forEach((line: string, lineIndex: number) => {
        this.doc.text(line, x + 5, currentY + (lineIndex * lineHeight));
      });
      
      currentY += itemHeight;
    });
    
    return currentY;
  }

  /**
   * Renders an experience block with smart page breaks
   */
  renderExperienceWithBreaks(
    experience: any,
    x: number,
    startY: number,
    contentWidth: number,
    colors: { primary: [number, number, number]; accent: [number, number, number] },
    onPageBreak?: () => void
  ): number {
    const requiredHeight = this.calculateExperienceHeight(experience, contentWidth);
    let currentY = this.smartPageBreak(startY, Math.min(requiredHeight, 50), onPageBreak);
    
    // Timeline dot or decoration
    this.doc.setFillColor(...colors.primary);
    this.doc.circle(x - 3, currentY - 2, 1.5, 'F');
    
    // Job title
    this.doc.setTextColor(40, 40, 40);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(experience.title, x, currentY);
    currentY += 5;
    
    // Company and duration
    this.doc.setTextColor(...colors.primary);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(experience.company, x, currentY);
    
    if (experience.duration) {
      this.doc.setFillColor(...colors.accent, 0.3);
      const durationWidth = this.doc.getTextWidth(experience.duration) + 4;
      this.doc.rect(x + contentWidth - durationWidth, currentY - 4, durationWidth, 6, 'F');
      this.doc.setTextColor(...colors.primary);
      this.doc.text(experience.duration, x + contentWidth - durationWidth + 2, currentY);
    }
    currentY += 8;
    
    // Description
    if (experience.description) {
      const descriptionHeight = this.calculateTextHeight(experience.description, contentWidth, 9, 4);
      currentY = this.smartPageBreak(currentY, descriptionHeight, onPageBreak);
      
      this.doc.setTextColor(120, 120, 120);
      currentY = this.renderTextWithBreaks(
        experience.description, 
        x, 
        currentY, 
        contentWidth, 
        9, 
        4, 
        onPageBreak
      );
      currentY += 4;
    }
    
    // Core Responsibilities
    if (experience.core_responsibilities?.length > 0) {
      const respHeight = 8 + this.calculateListHeight(experience.core_responsibilities, contentWidth, 8, 3.5);
      currentY = this.smartPageBreak(currentY, Math.min(respHeight, 30), onPageBreak);
      
      this.doc.setTextColor(...colors.primary);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Core Responsibilities:', x, currentY);
      currentY += 6;
      
      this.doc.setTextColor(120, 120, 120);
      currentY = this.renderListWithBreaks(
        experience.core_responsibilities,
        x + 3,
        currentY,
        contentWidth - 8,
        8,
        3.5,
        '•',
        onPageBreak
      );
      currentY += 4;
    }
    
    // Achievements
    if (experience.achievements?.length > 0) {
      const achievHeight = 8 + this.calculateListHeight(experience.achievements, contentWidth, 9, 4);
      currentY = this.smartPageBreak(currentY, Math.min(achievHeight, 30), onPageBreak);
      
      this.doc.setTextColor(...colors.primary);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Key Achievements:', x, currentY);
      currentY += 6;
      
      this.doc.setTextColor(120, 120, 120);
      currentY = this.renderListWithBreaks(
        experience.achievements,
        x + 3,
        currentY,
        contentWidth - 8,
        9,
        4,
        '•',
        onPageBreak
      );
    }
    
    currentY += 8;
    return currentY;
  }

  /**
   * Checks if we should start a new section on current page
   */
  shouldStartSectionOnNewPage(currentY: number, sectionHeaderHeight: number = 15): boolean {
    const remainingSpace = this.options.pageHeight - this.options.marginBottom - currentY;
    return remainingSpace < this.options.minSpaceForContent + sectionHeaderHeight;
  }
}