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
  templateType?: 'modern';
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

  // Helper function to create section header gradient
  const createSectionHeaderGradient = (x: number, y: number, width: number, height: number) => {
    for (let i = 0; i < width; i += 2) {
      const ratio = i / width;
      const r = Math.round(pr + (ar - pr) * ratio);
      const g = Math.round(pg + (ag - pg) * ratio);
      const b = Math.round(pb + (ab - pb) * ratio);
      doc.setFillColor(r, g, b);
      doc.rect(x + i, y, 2, height, 'F');
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
    // Section header with gradient background
    createSectionHeaderGradient(mainContentX - 2, mainY - 6, mainContentWidth + 4, 8);
    
    doc.setTextColor(255, 255, 255);
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
    // Section header with gradient background
    createSectionHeaderGradient(mainContentX - 2, mainY - 6, mainContentWidth + 4, 8);
    
    doc.setTextColor(255, 255, 255);
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