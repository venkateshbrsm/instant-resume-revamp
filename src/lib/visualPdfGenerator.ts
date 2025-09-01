import { jsPDF } from 'jspdf';

// Professional font configuration for better visual appeal
const FONTS = {
  primary: {
    normal: 'times',
    bold: 'times',
    italic: 'times'
  },
  header: {
    normal: 'times', 
    bold: 'times'
  },
  body: {
    normal: 'helvetica',
    bold: 'helvetica'
  }
};

// Helper function to remove special characters from text
function cleanSpecialCharacters(text: string): string {
  // Remove special characters but keep basic punctuation and numbers
  return text.replace(/[^\w\s.,;:!?()-]/g, '');
}

// Helper function to set professional fonts with fallbacks
function setProfessionalFont(doc: jsPDF, type: 'header' | 'body' | 'primary' = 'body', style: 'normal' | 'bold' | 'italic' = 'normal') {
  try {
    // Use only Helvetica for consistent character spacing
    doc.setFont('helvetica', style);
    // Ensure proper character spacing
    doc.setCharSpace(0);
  } catch (error) {
    // Fallback to default fonts if custom fonts fail
    doc.setFont('helvetica', style);
    doc.setCharSpace(0);
  }
}

// Smart text rendering function with justified alignment and strict boundary checking
function renderTextBlock(
  doc: jsPDF,
  text: string,
  x: number,
  currentY: number,
  maxWidth: number,
  lineHeight: number = 5,
  pageHeight: number = 297,
  marginBottom: number = 30,
  onPageBreak?: () => void
): number {
  if (!text || text.trim() === '') return currentY;
  
  // Clean and normalize the text, removing special characters
  const cleanText = cleanSpecialCharacters(text.replace(/\s+/g, ' ').trim());
  let yPosition = currentY;
  
  // Set consistent character spacing globally
  doc.setCharSpace(0);
  
  // Manual word wrapping with strict width checking
  const words = cleanText.split(' ');
  let currentLine = '';
  const lines: string[] = [];
  
  words.forEach(word => {
    // Check if adding this word would exceed maxWidth
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const testWidth = doc.getTextWidth(testLine);
    
    // If the line would be too wide, break it
    if (testWidth > maxWidth && currentLine !== '') {
      lines.push(currentLine.trim());
      currentLine = word;
    } else if (testWidth > maxWidth && currentLine === '') {
      // Handle very long single words that need to be broken
      const chars = word.split('');
      let charLine = '';
      chars.forEach(char => {
        const testCharLine = charLine + char;
        if (doc.getTextWidth(testCharLine) > maxWidth && charLine !== '') {
          lines.push(charLine);
          charLine = char;
        } else {
          charLine = testCharLine;
        }
      });
      if (charLine) currentLine = charLine;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  
  // Render each line with justified alignment
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we need a page break
    if (yPosition + lineHeight > pageHeight - marginBottom) {
      doc.addPage();
      if (onPageBreak) onPageBreak();
      yPosition = 20;
      // Reset spacing after page break
      doc.setCharSpace(0);
    }
    
    // Double-check width before rendering
    const lineWidth = doc.getTextWidth(line);
    if (lineWidth <= maxWidth) {
      const isLastLine = i === lines.length - 1;
      const wordCount = line.split(' ').length;
      
      if (!isLastLine && wordCount > 1 && lineWidth < maxWidth * 0.95) {
        // Justify text by distributing spaces (only if not too short)
        doc.text(line, x, yPosition, { 
          align: 'justify',
          maxWidth: maxWidth 
        });
      } else {
        // Left align the last line, single words, or short lines
        doc.text(line, x, yPosition);
      }
    } else {
      // Fallback: just render without justification if still too wide
      doc.text(line, x, yPosition);
    }
    
    yPosition += lineHeight;
  }
  
  return yPosition;
}

// Smart bullet point rendering with justified alignment and strict boundary checking
function renderBulletList(
  doc: jsPDF,
  items: string[],
  x: number,
  currentY: number,
  maxWidth: number,
  bulletIndent: number = 8,
  lineHeight: number = 5,
  itemSpacing: number = 2,
  pageHeight: number = 297,
  marginBottom: number = 30,
  onPageBreak?: () => void,
  bulletColor?: [number, number, number]
): number {
  if (!items || items.length === 0) return currentY;
  
  let yPosition = currentY;
  
  // Set consistent character spacing
  doc.setCharSpace(0);
  
  items.forEach((item) => {
    if (!item || item.trim() === '') return;
    
    const cleanItem = cleanSpecialCharacters(item.replace(/^[•\-\*\s]+/, '').trim());
    if (!cleanItem) return;
    
    // Calculate available width for text (excluding bullet)
    const availableWidth = maxWidth - bulletIndent;
    
    // Manual word wrapping with strict width checking
    const words = cleanItem.split(' ');
    let currentLine = '';
    const itemLines: string[] = [];
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = doc.getTextWidth(testLine);
      
      if (testWidth > availableWidth && currentLine !== '') {
        itemLines.push(currentLine.trim());
        currentLine = word;
      } else if (testWidth > availableWidth && currentLine === '') {
        // Handle very long single words
        const chars = word.split('');
        let charLine = '';
        chars.forEach(char => {
          const testCharLine = charLine + char;
          if (doc.getTextWidth(testCharLine) > availableWidth && charLine !== '') {
            itemLines.push(charLine);
            charLine = char;
          } else {
            charLine = testCharLine;
          }
        });
        if (charLine) currentLine = charLine;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine.trim()) {
      itemLines.push(currentLine.trim());
    }
    
    const itemHeight = itemLines.length * lineHeight + itemSpacing;
    
    // Check if we need a page break for the entire item
    if (yPosition + itemHeight > pageHeight - marginBottom) {
      doc.addPage();
      if (onPageBreak) onPageBreak();
      yPosition = 20;
      // Reset spacing after page break
      doc.setCharSpace(0);
    }
    
    // Render bullet
    if (bulletColor) {
      doc.setFillColor(bulletColor[0], bulletColor[1], bulletColor[2]);
    }
    doc.circle(x + 3, yPosition - 1, 0.8, 'F');
    
    // Render each line with justified alignment
    let lineY = yPosition;
    itemLines.forEach((line: string, index: number) => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // Double-check width before rendering
        const lineWidth = doc.getTextWidth(trimmedLine);
        if (lineWidth <= availableWidth) {
          const isLastLine = index === itemLines.length - 1;
          const wordCount = trimmedLine.split(' ').length;
          
          if (!isLastLine && wordCount > 1 && lineWidth < availableWidth * 0.95) {
            // Justify text except last line (and not too short lines)
            doc.text(trimmedLine, x + bulletIndent, lineY, { 
              align: 'justify',
              maxWidth: availableWidth 
            });
          } else {
            // Left align the last line, single words, or short lines
            doc.text(trimmedLine, x + bulletIndent, lineY);
          }
        } else {
          // Fallback: render without justification if still too wide
          doc.text(trimmedLine, x + bulletIndent, lineY);
        }
      }
      lineY += lineHeight;
    });
    
    yPosition = lineY + itemSpacing;
  });
  
  return yPosition;
}

export interface VisualPdfOptions {
  filename?: string;
  templateType?: 'modern' | 'classic' | 'minimalist' | 'executive' | 'creative';
  colorTheme?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  summary: string;
  photo?: string;
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
    achievements?: string[];
    core_responsibilities?: string[];
  }>;
  skills?: string[];
  core_technical_skills?: string[];
  tools?: string[];
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  certifications?: string[];
  languages?: string[];
}

/**
 * Generates a visually rich PDF that matches template previews
 */
export async function generateVisualPdf(
  resumeData: ResumeData,
  options: VisualPdfOptions = {}
): Promise<Blob> {
  const {
    templateType = 'modern',
    colorTheme = {
      primary: '#a855f7',
      secondary: '#c084fc',
      accent: '#d8b4fe'
    }
  } = options;

  console.log(`🎨 Generating visual PDF for ${templateType} template with neon purple theme...`);

  switch (templateType) {
    case 'modern':
      return generateModernPdf(resumeData, colorTheme);
    case 'creative':
      return generateCreativePdf(resumeData, colorTheme);
    case 'classic':
    case 'executive':
    case 'minimalist':
      return generateClassicPdf(resumeData, colorTheme, templateType);
    default:
      return generateModernPdf(resumeData, colorTheme);
  }
}

/**
 * Modern template with left sidebar and gradient backgrounds
 */
async function generateModernPdf(
  resumeData: ResumeData,
  colorTheme: { primary: string; secondary: string; accent: string }
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const pageBorder = 10; // Account for page borders
  const sidebarWidth = 70;
  const mainContentX = sidebarWidth + 10; // Add margin for border
  const mainContentWidth = pageWidth - mainContentX - pageBorder - 5;
  
  // Convert hex colors to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [168, 85, 247]; // Neon purple fallback
  };

  const [pr, pg, pb] = hexToRgb(colorTheme.primary);
  const [sr, sg, sb] = hexToRgb(colorTheme.secondary);
  const [ar, ag, ab] = hexToRgb(colorTheme.accent);

  // Helper function to recreate sidebar gradient and page border on new pages
  const recreateSidebarGradient = () => {
    // Add page border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(1);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10, 'S');
    
    for (let i = 0; i < sidebarWidth; i += 2) {
      const ratio = i / sidebarWidth;
      const r = Math.round(pr + (ar - pr) * ratio);
      const g = Math.round(pg + (ag - pg) * ratio);
      const b = Math.round(pb + (ab - pb) * ratio);
      
      doc.setFillColor(r, g, b);
      doc.rect(i, 0, 2, pageHeight, 'F');
    }
  };

  // Create initial gradient sidebar background and page border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(1);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10, 'S');
  recreateSidebarGradient();

  let sidebarY = 15;
  let mainY = 20;

  // SIDEBAR CONTENT
  // Profile photo placeholder (if exists)
  if (resumeData.photo) {
    doc.setFillColor(255, 255, 255, 0.3);
    doc.circle(sidebarWidth/2, sidebarY + 15, 12, 'F');
    sidebarY += 35;
  }

  // Contact section in sidebar
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  setProfessionalFont(doc, 'header', 'bold');
  doc.text('CONTACT', 8, sidebarY);
  sidebarY += 8;

  // Contact details
  doc.setFontSize(8);
  setProfessionalFont(doc, 'body', 'normal');
  if (resumeData.email) {
    doc.text('EMAIL', 8, sidebarY);
    sidebarY += 4;
    doc.text(resumeData.email, 8, sidebarY);
    sidebarY += 6;
  }
  if (resumeData.phone) {
    doc.text('PHONE', 8, sidebarY);
    sidebarY += 4;
    doc.text(resumeData.phone, 8, sidebarY);
    sidebarY += 6;
  }
  if (resumeData.location) {
    doc.text('LOCATION', 8, sidebarY);
    sidebarY += 4;
    doc.text(resumeData.location, 8, sidebarY);
    sidebarY += 8;
  }

  // Skills section in sidebar with progress bars
  if (resumeData.skills && resumeData.skills.length > 0) {
    doc.setFontSize(10);
    setProfessionalFont(doc, 'header', 'bold');
    doc.text('CORE SKILLS', 8, sidebarY);
    sidebarY += 8;

    resumeData.skills.slice(0, 8).forEach((skill, index) => {
      // Skill name
      doc.setFontSize(7);
      setProfessionalFont(doc, 'body', 'normal');
      // Use manual word wrapping for consistent spacing
      const words = skill.split(' ');
      let skillText = skill;
      if (doc.getTextWidth(skill) > sidebarWidth - 16) {
        // Find first word that fits
        for (let i = words.length - 1; i >= 0; i--) {
          const testText = words.slice(0, i + 1).join(' ');
          if (doc.getTextWidth(testText) <= sidebarWidth - 16) {
            skillText = testText;
            break;
          }
        }
      }
      doc.text(skillText, 8, sidebarY);
      
      // Progress bar background
      doc.setFillColor(255, 255, 255, 0.3);
      doc.rect(8, sidebarY + 2, sidebarWidth - 16, 2, 'F');
      
      // Progress bar fill
      doc.setFillColor(255, 255, 255, 0.8);
      const progressWidth = (sidebarWidth - 16) * (0.7 + (index * 0.03));
      doc.rect(8, sidebarY + 2, progressWidth, 2, 'F');
      
      sidebarY += 8;
    });
  }

  // Education in sidebar
  if (resumeData.education && resumeData.education.length > 0) {
    sidebarY += 5;
    doc.setFontSize(10);
    setProfessionalFont(doc, 'header', 'bold');
    doc.text('EDUCATION', 8, sidebarY);
    sidebarY += 8;

    resumeData.education.slice(0, 2).forEach((edu) => {
      doc.setFontSize(7);
      setProfessionalFont(doc, 'body', 'bold');
      // Use manual word wrapping for consistent spacing
      const words = edu.degree.split(' ');
      let degreeText = edu.degree;
      if (doc.getTextWidth(edu.degree) > sidebarWidth - 16) {
        for (let i = words.length - 1; i >= 0; i--) {
          const testText = words.slice(0, i + 1).join(' ');
          if (doc.getTextWidth(testText) <= sidebarWidth - 16) {
            degreeText = testText;
            break;
          }
        }
      }
      doc.text(degreeText, 8, sidebarY);
      sidebarY += 4;
      
      setProfessionalFont(doc, 'body', 'normal');
      const instWords = edu.institution.split(' ');
      let instText = edu.institution;
      if (doc.getTextWidth(edu.institution) > sidebarWidth - 16) {
        for (let i = instWords.length - 1; i >= 0; i--) {
          const testText = instWords.slice(0, i + 1).join(' ');
          if (doc.getTextWidth(testText) <= sidebarWidth - 16) {
            instText = testText;
            break;
          }
        }
      }
      doc.text(instText, 8, sidebarY);
      sidebarY += 4;
      
      if (edu.year && edu.year !== 'N/A') {
        doc.text(edu.year, 8, sidebarY);
        sidebarY += 6;
      }
    });
  }

  // MAIN CONTENT AREA
  // Header
  doc.setTextColor(pr, pg, pb);
  doc.setFontSize(24);
  setProfessionalFont(doc, 'header', 'bold');
  doc.text(resumeData.name, mainContentX, mainY);
  mainY += 8;

  doc.setFontSize(14);
  setProfessionalFont(doc, 'header', 'normal');
  doc.text(resumeData.title, mainContentX, mainY);
  mainY += 15;

  // Professional Summary section
  if (resumeData.summary) {
    // Section header with colored background
    doc.setFillColor(pr, pg, pb, 0.1);
    doc.rect(mainContentX - 2, mainY - 6, mainContentWidth + 4, 8, 'F');
    
    doc.setTextColor(pr, pg, pb);
    doc.setFontSize(12);
    setProfessionalFont(doc, 'header', 'bold');
    doc.text('PROFESSIONAL SUMMARY', mainContentX, mainY);
    mainY += 10;

    doc.setTextColor(120, 120, 120);
    doc.setFontSize(10);
    setProfessionalFont(doc, 'body', 'normal');
    mainY = renderTextBlock(
      doc,
      resumeData.summary,
      mainContentX,
      mainY,
      mainContentWidth,
      5,
      pageHeight,
      30,
      recreateSidebarGradient
    );
    mainY += 8;
  }

  // Professional Experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    // Section header
    doc.setFillColor(pr, pg, pb, 0.1);
    doc.rect(mainContentX - 2, mainY - 6, mainContentWidth + 4, 8, 'F');
    
    doc.setTextColor(pr, pg, pb);
    doc.setFontSize(12);
    setProfessionalFont(doc, 'header', 'bold');
    doc.text('PROFESSIONAL EXPERIENCE', mainContentX, mainY);
    mainY += 12;

    resumeData.experience.forEach((exp, index) => {
      // Timeline dot
      doc.setFillColor(pr, pg, pb);
      doc.circle(mainContentX - 3, mainY - 2, 1.5, 'F');
      
      // Job title
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(11);
      setProfessionalFont(doc, 'header', 'bold');
      doc.text(exp.title, mainContentX, mainY);
      mainY += 5;

      // Company and duration
      doc.setTextColor(pr, pg, pb);
      doc.setFontSize(10);
      setProfessionalFont(doc, 'body', 'bold');
      doc.text(exp.company, mainContentX, mainY);
      
      // Duration badge
      if (exp.duration) {
        doc.setFillColor(ar, ag, ab, 0.3);
        const durationWidth = doc.getTextWidth(exp.duration) + 4;
        doc.rect(mainContentX + mainContentWidth - durationWidth, mainY - 4, durationWidth, 6, 'F');
        doc.setTextColor(pr, pg, pb);
        doc.text(exp.duration, mainContentX + mainContentWidth - durationWidth + 2, mainY);
      }
      mainY += 8;

      // Description
      if (exp.description) {
        doc.setTextColor(120, 120, 120);
        doc.setFontSize(10);
        setProfessionalFont(doc, 'body', 'normal');
        mainY = renderTextBlock(
          doc,
          exp.description,
          mainContentX,
          mainY,
          mainContentWidth,
          5,
          pageHeight,
          30,
          recreateSidebarGradient
        );
        mainY += 4;
      }

      // Core Responsibilities
      if (exp.core_responsibilities && exp.core_responsibilities.length > 0) {
        doc.setTextColor(pr, pg, pb);
        doc.setFontSize(9);
        setProfessionalFont(doc, 'body', 'bold');
        doc.text('Core Responsibilities:', mainContentX, mainY);
        mainY += 6;

        mainY = renderBulletList(
          doc,
          exp.core_responsibilities,
          mainContentX,
          mainY,
          mainContentWidth,
          6,
          3.5,
          2,
          pageHeight,
          30,
          recreateSidebarGradient,
          [ar, ag, ab]
        );
        mainY += 4;
      }

      // Achievements
      if (exp.achievements && exp.achievements.length > 0) {
        doc.setTextColor(pr, pg, pb);
        doc.setFontSize(9);
        setProfessionalFont(doc, 'body', 'bold');
        doc.text('Key Achievements:', mainContentX, mainY);
        mainY += 6;

        mainY = renderBulletList(
          doc,
          exp.achievements,
          mainContentX,
          mainY,
          mainContentWidth,
          6,
          4,
          2,
          pageHeight,
          30,
          recreateSidebarGradient,
          [ar, ag, ab]
        );
      }
      
      mainY += 8;
    });
  }

  console.log('✅ Modern visual PDF generated successfully');
  return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
}

/**
 * Creative template with gradient header and visual elements
 */
async function generateCreativePdf(
  resumeData: ResumeData,
  colorTheme: { primary: string; secondary: string; accent: string }
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const pageBorder = 10; // Account for page borders
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2) - pageBorder;
  
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [168, 85, 247];
  };

  const [pr, pg, pb] = hexToRgb(colorTheme.primary);
  const [sr, sg, sb] = hexToRgb(colorTheme.secondary);
  const [ar, ag, ab] = hexToRgb(colorTheme.accent);

  // Add page border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(1);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10, 'S');
  
  // Add initial gradient background
  for (let i = 0; i < pageWidth; i += 5) {
    const ratio = i / pageWidth;
    const r = Math.round(pr + (sr - pr) * ratio);
    const g = Math.round(pg + (sg - pg) * ratio);
    const b = Math.round(pb + (sb - pb) * ratio);
    
    doc.setFillColor(r, g, b, 0.1);
    doc.rect(i, 0, 5, pageHeight, 'F');
  }

  let currentY = 20;

  // Helper function for page breaks with creative background recreation
  const handlePageBreak = () => {
    // Add page border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(1);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10, 'S');
    
    // Recreate gradient background
    for (let i = 0; i < pageWidth; i += 5) {
      const ratio = i / pageWidth;
      const r = Math.round(pr + (sr - pr) * ratio);
      const g = Math.round(pg + (sg - pg) * ratio);
      const b = Math.round(pb + (sb - pb) * ratio);
      
      doc.setFillColor(r, g, b, 0.1);
      doc.rect(i, 0, 5, pageHeight, 'F');
    }
    
    // Recreate geometric shapes
    doc.setFillColor(ar, ag, ab, 0.3);
    doc.circle(pageWidth - 30, 40, 15, 'F');
    doc.setFillColor(pr, pg, pb, 0.2);
    doc.rect(pageWidth - 60, pageHeight - 80, 40, 40, 'F');
  };

  // Creative gradient header matching preview exactly
  const headerHeight = 50;
  
  // Create gradient from primary to accent to secondary (matching preview)
  for (let i = 0; i < headerHeight; i += 0.5) {
    let ratio1, ratio2;
    let r, g, b;
    
    if (i < headerHeight * 0.7) {
      // First 70%: primary to accent
      ratio1 = i / (headerHeight * 0.7);
      r = Math.round(pr + (ar - pr) * ratio1);
      g = Math.round(pg + (ag - pg) * ratio1);
      b = Math.round(pb + (ab - pb) * ratio1);
    } else {
      // Last 30%: accent to secondary
      ratio2 = (i - headerHeight * 0.7) / (headerHeight * 0.3);
      r = Math.round(ar + (sr - ar) * ratio2);
      g = Math.round(ag + (sg - ag) * ratio2);
      b = Math.round(ab + (sb - ab) * ratio2);
    }
    
    doc.setFillColor(r, g, b);
    doc.rect(0, i, pageWidth, 0.5, 'F');
  }

  // Geometric shapes in header with white transparency
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(255, 255, 255);
  
  // Create circles and shapes with reduced opacity by using lighter colors instead
  doc.setFillColor(255, 255, 255, 0.3); // Use alpha parameter instead of setGState
  doc.circle(25, 20, 10, 'F');
  doc.rect(pageWidth - 35, 15, 15, 15, 'F');
  doc.circle(pageWidth / 4, 35, 5, 'F');

  // Profile photo area (matching preview)
  doc.setFillColor(255, 255, 255, 0.3); // Use alpha parameter instead of setGState
  doc.circle(margin + 25, 25, 12, 'F');

  // Header text (matching preview layout)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  setProfessionalFont(doc, 'header', 'bold');
  doc.text(resumeData.name, margin + 45, 25);
  
  doc.setFontSize(16);
  setProfessionalFont(doc, 'header', 'normal');
  doc.text(resumeData.title, margin + 45, 32);

  // Contact info in header (matching preview)
  const contactInfo = [resumeData.email, resumeData.phone].filter(Boolean).join(' • ');
  if (contactInfo) {
    doc.setFontSize(10);
    setProfessionalFont(doc, 'body', 'normal');
    doc.text(contactInfo, margin + 45, 40);
  }

  currentY = headerHeight + 15;

  // Creative Vision section with light background (no black)
  doc.setFillColor(pr, pg, pb, 0.05); // Use alpha parameter instead of setGState
  doc.rect(margin - 5, currentY - 5, contentWidth + 10, 30, 'F');

  doc.setTextColor(pr, pg, pb);
  doc.setFontSize(14);
  setProfessionalFont(doc, 'header', 'bold');
  doc.text('CREATIVE VISION', margin, currentY);
  currentY += 8;

    if (resumeData.summary) {
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(10);
      setProfessionalFont(doc, 'body', 'normal');
      currentY = renderTextBlock(
        doc,
        resumeData.summary,
        margin,
        currentY,
        contentWidth,
        5,
        pageHeight,
        30,
        handlePageBreak
      );
    }
  currentY += 10;

  // Skills as creative badges
  if (resumeData.skills && resumeData.skills.length > 0) {
    doc.setTextColor(pr, pg, pb);
    doc.setFontSize(12);
    setProfessionalFont(doc, 'header', 'bold');
    doc.text('CREATIVE SKILLS', margin, currentY);
    currentY += 10;

    // Create skill badges in rows
    const skillsPerRow = 3;
    const badgeWidth = (contentWidth - 10) / skillsPerRow;
    let skillIndex = 0;

    for (let i = 0; i < Math.ceil(resumeData.skills.length / skillsPerRow); i++) {
      for (let j = 0; j < skillsPerRow && skillIndex < resumeData.skills.length; j++) {
        const skill = resumeData.skills[skillIndex];
        const x = margin + (j * badgeWidth);
        
        // Badge background (white with colored border - matching preview)
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, currentY - 4, badgeWidth - 2, 8, 2, 2, 'F');
        
        // Badge border (matching preview style)
        doc.setDrawColor(ar, ag, ab);
        doc.setLineWidth(1);
        doc.roundedRect(x, currentY - 4, badgeWidth - 2, 8, 2, 2, 'S');
        
        // Skill text
        doc.setTextColor(pr, pg, pb);
        doc.setFontSize(8);
        setProfessionalFont(doc, 'body', 'bold');
        // Use manual word wrapping for consistent spacing
        const words = skill.split(' ');
        let skillText = skill;
        if (doc.getTextWidth(skill) > badgeWidth - 4) {
          for (let i = words.length - 1; i >= 0; i--) {
            const testText = words.slice(0, i + 1).join(' ');
            if (doc.getTextWidth(testText) <= badgeWidth - 4) {
              skillText = testText;
              break;
            }
          }
        }
        doc.text(skillText, x + 2, currentY);
        
        skillIndex++;
      }
      currentY += 12;
    }
    currentY += 5;
  }

  // CREATIVE EXPERIENCE section
  if (resumeData.experience && resumeData.experience.length > 0) {
    doc.setTextColor(pr, pg, pb);
    doc.setFontSize(12);
    setProfessionalFont(doc, 'header', 'bold');
    doc.text('PROFESSIONAL EXPERIENCE', margin, currentY);
    currentY += 12;

    resumeData.experience.forEach((exp) => {
      // Experience container background
      doc.setFillColor(pr, pg, pb, 0.05);
      const containerHeight = 30 + (exp.achievements?.length || 0) * 5;
      doc.roundedRect(margin - 2, currentY - 5, contentWidth + 4, containerHeight, 3, 3, 'F');
      
      // Left border accent
      doc.setFillColor(ar, ag, ab);
      doc.rect(margin - 2, currentY - 5, 3, containerHeight, 'F');

      // Job title with creative flair
      doc.setTextColor(pr, pg, pb);
      doc.setFontSize(11);
      setProfessionalFont(doc, 'header', 'bold');
      doc.text(exp.title, margin + 5, currentY);
      currentY += 5;

      // Company
      doc.setTextColor(ar, ag, ab);
      doc.setFontSize(10);
      setProfessionalFont(doc, 'body', 'bold');
      doc.text(exp.company, margin + 5, currentY);

      // Duration badge
      if (exp.duration) {
        doc.setFillColor(ar, ag, ab);
        const durationWidth = doc.getTextWidth(exp.duration) + 6;
        doc.roundedRect(pageWidth - margin - durationWidth, currentY - 4, durationWidth, 6, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        setProfessionalFont(doc, 'body', 'bold');
        doc.text(exp.duration, pageWidth - margin - durationWidth + 3, currentY);
      }
      currentY += 8;

      // Description
      if (exp.description) {
        doc.setTextColor(120, 120, 120);
        doc.setFontSize(10);
        setProfessionalFont(doc, 'body', 'normal');
        currentY = renderTextBlock(
          doc,
          exp.description,
          margin + 5,
          currentY,
          contentWidth - 10,
          5,
          pageHeight,
          30,
          handlePageBreak
        );
        currentY += 4;
      }

      // Core Responsibilities
      if (exp.core_responsibilities && exp.core_responsibilities.length > 0) {
        doc.setTextColor(pr, pg, pb);
        doc.setFontSize(9);
        setProfessionalFont(doc, 'body', 'bold');
        doc.text('Core Responsibilities:', margin + 5, currentY);
        currentY += 6;

        currentY = renderBulletList(
          doc,
          exp.core_responsibilities,
          margin + 5,
          currentY,
          contentWidth - 15,
          8,
          5,
          2,
          pageHeight,
          30,
          handlePageBreak,
          [ar, ag, ab]
        );
        currentY += 4;
      }

      // Key Achievements with checkmarks
      if (exp.achievements && exp.achievements.length > 0) {
        doc.setTextColor(pr, pg, pb);
        doc.setFontSize(9);
        setProfessionalFont(doc, 'body', 'bold');
        doc.text('Key Achievements:', margin + 5, currentY);
        currentY += 6;

        // Use custom rendering for checkmark bullets with consistent spacing
        exp.achievements.slice(0, 4).forEach((achievement) => {
          // Manual word wrapping for uniform character spacing
          const words = achievement.split(' ');
          let currentLine = '';
          const achievementLines: string[] = [];
          
          words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = doc.getTextWidth(testLine);
            
            if (testWidth > contentWidth - 20 && currentLine !== '') {
              achievementLines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          });
          
          if (currentLine.trim()) {
            achievementLines.push(currentLine);
          }
          
          const itemHeight = achievementLines.length * 4 + 2;
          
          // Check if we need a page break for the entire item
          if (currentY + itemHeight > pageHeight - 30) {
            doc.addPage();
            handlePageBreak();
            currentY = 20;
          }
          
          // Checkmark
          doc.setFillColor(ar, ag, ab);
          doc.circle(margin + 8, currentY - 1, 2, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          setProfessionalFont(doc, 'body', 'bold');
          doc.text('V', margin + 6.5, currentY + 0.5);
          
          // Render achievement text with uniform spacing
          let lineY = currentY;
          achievementLines.forEach((line: string) => {
            doc.text(line.trim(), margin + 15, lineY);
            lineY += 4;
          });
          
          currentY = lineY + 2;
        });
      }

      currentY += 10;
    });
  }

  // Education section
  if (resumeData.education && resumeData.education.length > 0) {
    currentY += 10;
    doc.setTextColor(pr, pg, pb);
    doc.setFontSize(12);
    setProfessionalFont(doc, 'header', 'bold');
    doc.text('EDUCATION', margin, currentY);
    currentY += 10;

    resumeData.education.forEach((edu) => {
      doc.setFillColor(sr, sg, sb, 0.1);
      doc.roundedRect(margin - 2, currentY - 3, contentWidth + 4, 15, 2, 2, 'F');
      
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      setProfessionalFont(doc, 'body', 'bold');
      doc.text(edu.degree, margin + 2, currentY);
      currentY += 4;
      
      doc.setTextColor(ar, ag, ab);
      doc.setFontSize(9);
      setProfessionalFont(doc, 'body', 'normal');
      doc.text(edu.institution, margin + 2, currentY);
      
      if (edu.year && edu.year !== 'N/A') {
        doc.text(edu.year, pageWidth - margin - doc.getTextWidth(edu.year), currentY);
      }
      currentY += 8;
    });
  }

  console.log('✅ Creative visual PDF generated successfully');
  return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
}

/**
 * Classic template with clean typography and professional layout
 */
async function generateClassicPdf(
  resumeData: ResumeData,
  colorTheme: { primary: string; secondary: string; accent: string },
  templateType: string
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const pageBorder = 10; // Account for page borders
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2) - pageBorder;
  
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [168, 85, 247];
  };

  const [pr, pg, pb] = hexToRgb(colorTheme.primary);

  // Helper function for page breaks
  const handlePageBreak = () => {
    // Add page border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(1);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10, 'S');
  };

  // Add page border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(1);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10, 'S');

  let currentY = 25;

  doc.setFontSize(14);
  setProfessionalFont(doc, 'header', 'normal');
  const titleWidth = doc.getTextWidth(resumeData.title);
  doc.text(resumeData.title, (pageWidth - titleWidth) / 2, currentY);
  currentY += 6;

  // Contact info
  const contactInfo = [resumeData.email, resumeData.phone, resumeData.location].filter(Boolean).join(' | ');
  if (contactInfo) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const contactWidth = doc.getTextWidth(contactInfo);
    doc.text(contactInfo, (pageWidth - contactWidth) / 2, currentY);
    currentY += 8;
  }

  // Separator line
  doc.setLineWidth(1);
  doc.setDrawColor(pr, pg, pb);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 12;

  // Helper function for section headers
  const addSectionHeader = (title: string) => {
    doc.setTextColor(pr, pg, pb);
    doc.setFontSize(14);
    setProfessionalFont(doc, 'header', 'bold');
    doc.text(title.toUpperCase(), margin, currentY);
    
    // Underline
    const titleWidth = doc.getTextWidth(title.toUpperCase());
    doc.setLineWidth(0.5);
    doc.line(margin, currentY + 2, margin + titleWidth, currentY + 2);
    currentY += 10;
  };

  // Professional Summary
  if (resumeData.summary) {
    addSectionHeader('Professional Summary');
    
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(10);
    setProfessionalFont(doc, 'body', 'normal');
    currentY = renderTextBlock(
      doc,
      resumeData.summary,
      margin,
      currentY,
      contentWidth,
      5,
      pageHeight,
      30,
      handlePageBreak
    );
    currentY += 8;
  }

  // Experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    addSectionHeader('Professional Experience');
    
    resumeData.experience.forEach((exp) => {
      // Job title
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(12);
      setProfessionalFont(doc, 'header', 'bold');
      doc.text(exp.title, margin, currentY);
      currentY += 5;

      // Company and duration 
      doc.setTextColor(pr, pg, pb);
      doc.setFontSize(11);
      setProfessionalFont(doc, 'body', 'bold');
      doc.text(exp.company, margin, currentY);
      
      if (exp.duration) {
        const durationWidth = doc.getTextWidth(exp.duration);
        doc.setTextColor(100, 100, 100);
        setProfessionalFont(doc, 'body', 'italic');
        doc.text(exp.duration, pageWidth - margin - durationWidth, currentY);
      }
      currentY += 7;

      // Description
      if (exp.description) {
        doc.setTextColor(120, 120, 120);
        doc.setFontSize(10);
        setProfessionalFont(doc, 'body', 'normal');
        currentY = renderTextBlock(
          doc,
          exp.description,
          margin,
          currentY,
          contentWidth,
          5,
          pageHeight,
          30,
          handlePageBreak
        );
        currentY += 4;
      }

      // Core Responsibilities
      if (exp.core_responsibilities && exp.core_responsibilities.length > 0) {
        doc.setTextColor(pr, pg, pb);
        doc.setFontSize(10);
        setProfessionalFont(doc, 'body', 'bold');
        doc.text('Core Responsibilities:', margin, currentY);
        currentY += 6;

        currentY = renderBulletList(
          doc,
          exp.core_responsibilities,
          margin,
          currentY,
          contentWidth - 10,
          10,
          5,
          2,
          pageHeight,
          30,
          handlePageBreak
        );
        currentY += 4;
      }

      // Key Achievements
      if (exp.achievements && exp.achievements.length > 0) {
        doc.setTextColor(pr, pg, pb);
        doc.setFontSize(10);
        setProfessionalFont(doc, 'body', 'bold');
        doc.text('Key Achievements:', margin, currentY);
        currentY += 6;

        currentY = renderBulletList(
          doc,
          exp.achievements,
          margin,
          currentY,
          contentWidth - 10,
          10,
          5,
          2,
          pageHeight,
          30,
          handlePageBreak
        );
      }
      currentY += 8;
    });
  }

  // Skills
  if (resumeData.skills && resumeData.skills.length > 0) {
    addSectionHeader('Core Competencies');
    
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(10);
    setProfessionalFont(doc, 'body', 'normal');
    
    const skillsPerRow = 2;
    const colWidth = contentWidth / skillsPerRow;
    
    for (let i = 0; i < resumeData.skills.length; i += skillsPerRow) {
      const rowSkills = resumeData.skills.slice(i, i + skillsPerRow);
      
      rowSkills.forEach((skill, colIndex) => {
        const x = margin + (colIndex * colWidth);
        doc.text(`• ${skill}`, x, currentY);
      });
      
      currentY += 6;
    }
    currentY += 8;
  }

  // Education
  if (resumeData.education && resumeData.education.length > 0) {
    addSectionHeader('Education');
    
    resumeData.education.forEach((edu) => {
      // Degree
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(11);
      setProfessionalFont(doc, 'header', 'bold');
      doc.text(edu.degree, margin, currentY);
      currentY += 5;
      
      doc.setTextColor(pr, pg, pb);
      doc.setFontSize(10);
      setProfessionalFont(doc, 'body', 'normal');
      doc.text(edu.institution, margin, currentY);
      
      if (edu.year && edu.year !== 'N/A') {
        const yearWidth = doc.getTextWidth(edu.year);
        doc.setTextColor(100, 100, 100);
        doc.text(edu.year, pageWidth - margin - yearWidth, currentY);
      }
      currentY += 8;
    });
  }

  console.log(`✅ ${templateType} visual PDF generated successfully`);
  return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
}

/**
 * Downloads the visual PDF
 */
export async function downloadVisualPdf(
  resumeData: ResumeData,
  options: VisualPdfOptions = {}
): Promise<void> {
  try {
    const blob = await generateVisualPdf(resumeData, options);
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = options.filename || 'enhanced-resume-visual.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading visual PDF:', error);
    throw error;
  }
}

/**
 * Extracts resume data from enhanced content for visual PDF generation
 */
export function extractResumeDataFromEnhanced(enhancedContent: any): ResumeData {
  console.log('🔍 Extracting resume data from:', enhancedContent);
  
  // Function to clean AI intro text from descriptions
  const cleanAIIntroText = (text: string): string => {
    if (!text) return '';
    
    // Remove common AI intro phrases
    const aiIntroPatterns = [
      /^(Certainly!?|Absolutely!?|Here's|Below is|I've)\s+.*?(?=\n|$)/i,
      /^.*?(ATS-optimized|achievement-focused|rewrite|enhanced|tailored).*?(?=\n|$)/i,
      /^.*?I've (incorporated|reframed|enhanced|optimized).*?(?=\n|$)/i,
      /^.*?(Here's an?|Below is an?).*?(?=\n|$)/i
    ];
    
    let cleanedText = text.trim();
    
    // Remove AI intro patterns from the beginning
    for (const pattern of aiIntroPatterns) {
      cleanedText = cleanedText.replace(pattern, '').trim();
    }
    
    // Remove any remaining leading explanatory text before the actual content
    const lines = cleanedText.split('\n');
    let contentStartIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Skip lines that look like AI explanations
      if (line.includes('rewrite') || line.includes('optimized') || 
          line.includes('enhanced') || line.includes('tailored') ||
          line.includes('incorporated') || line.includes('I\'ve') ||
          line.length < 10) {
        contentStartIndex = i + 1;
      } else {
        break;
      }
    }
    
    return lines.slice(contentStartIndex).join('\n').trim();
  };
  
  const extractedData = {
    name: enhancedContent.name || 'Enhanced Resume',
    title: enhancedContent.title || 'Professional',
    email: enhancedContent.contact?.email || enhancedContent.email || '',
    phone: enhancedContent.contact?.phone || enhancedContent.phone || '',
    location: enhancedContent.contact?.location || enhancedContent.location || '',
    linkedin: enhancedContent.linkedin || enhancedContent.contact?.linkedin || '',
    summary: cleanAIIntroText(enhancedContent.summary || ''),
    photo: enhancedContent.profilePhotoUrl || enhancedContent.photo || undefined,
    experience: (enhancedContent.experience || []).map((exp: any) => ({
      title: exp.title || '',
      company: exp.company || '',
      duration: exp.duration || '',
      description: cleanAIIntroText(exp.description || ''),
      achievements: (exp.achievements || []).map((ach: string) => cleanAIIntroText(ach)),
      core_responsibilities: (exp.core_responsibilities || []).map((resp: string) => cleanAIIntroText(resp))
    })),
    skills: enhancedContent.skills || [],
    core_technical_skills: enhancedContent.core_technical_skills || [],
    tools: enhancedContent.tools || [],
    education: enhancedContent.education || [],
    certifications: enhancedContent.certifications || [],
    languages: enhancedContent.languages || []
  };
  
  console.log('🔍 Extracted resume data:', extractedData);
  return extractedData;
}