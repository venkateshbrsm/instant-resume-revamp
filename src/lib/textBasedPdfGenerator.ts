import { jsPDF } from 'jspdf';

export interface TextBasedPdfOptions {
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
  summary: string;
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    achievements: string[];
  }>;
  skills?: string[];
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
}

/**
 * Generates a text-based PDF that ATS systems can read using native jsPDF rendering
 */
export async function generateTextBasedPdf(
  resumeData: ResumeData,
  options: TextBasedPdfOptions = {}
): Promise<Blob> {
  const {
    filename = 'enhanced-resume.pdf',
    templateType = 'modern',
    colorTheme = {
      primary: '#2563eb',
      secondary: '#1e40af',
      accent: '#3b82f6'
    }
  } = options;

  console.log('🚀 Generating clean text-based PDF for ATS compatibility...');

  // Use the clean fallback implementation for all templates to ensure reliability
  return generateCleanTextPdf(resumeData, options);
}

/**
 * Clean text-based PDF generator with proper spacing and formatting
 */
async function generateCleanTextPdf(
  resumeData: ResumeData,
  options: TextBasedPdfOptions = {}
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let currentY = margin;
  const lineHeight = 6;
  const sectionSpacing = 10;

  // Color scheme
  const primaryColor = options.colorTheme?.primary || '#2563eb';
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [37, 99, 235]; // Default blue
  };
  const [pr, pg, pb] = hexToRgb(primaryColor);

  // Helper function to check page breaks
  const checkPageBreak = (neededSpace: number = 20) => {
    if (currentY + neededSpace > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
      return true;
    }
    return false;
  };

  // Helper function to add section titles
  const addSectionTitle = (title: string) => {
    checkPageBreak(15);
    currentY += sectionSpacing;
    
    // Section background for modern look
    if (options.templateType === 'modern' || options.templateType === 'creative') {
      doc.setFillColor(pr, pg, pb, 0.1);
      doc.rect(margin - 2, currentY - 4, contentWidth + 4, 8, 'F');
    }
    
    doc.setTextColor(pr, pg, pb);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin, currentY);
    
    // Underline for classic templates
    if (options.templateType === 'classic' || options.templateType === 'executive' || options.templateType === 'minimalist') {
      const textWidth = doc.getTextWidth(title.toUpperCase());
      doc.setLineWidth(0.5);
      doc.line(margin, currentY + 2, margin + textWidth, currentY + 2);
    }
    
    currentY += lineHeight + 4;
  };

  // Enhanced text wrapping with better line breaking
  const addWrappedText = (text: string, x: number, fontSize: number = 10, fontWeight: string = 'normal', color: number[] = [60, 60, 60], maxWidth?: number) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontWeight);
    doc.setTextColor(color[0], color[1], color[2]);
    
    const textWidth = maxWidth || (contentWidth - (x - margin));
    const lines = splitTextIntelligently(text, textWidth, doc);
    
    lines.forEach((line: string) => {
      checkPageBreak(8);
      doc.text(line, x, currentY);
      currentY += lineHeight;
    });
  };

  // Intelligent text splitting that preserves word boundaries and handles special characters
  const splitTextIntelligently = (text: string, maxWidth: number, pdfDoc: any): string[] => {
    if (!text) return [''];
    
    // Handle very short texts that don't need splitting
    if (pdfDoc.getTextWidth(text) <= maxWidth) {
      return [text];
    }
    
    const words = text.split(/(\s+)/); // Split on whitespace but keep separators
    const lines: string[] = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + word;
      const testWidth = pdfDoc.getTextWidth(testLine);
      
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        // If current line has content, save it
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
          currentLine = word;
        } else {
          // Handle very long single words by breaking them
          const brokenWord = breakLongWord(word, maxWidth, pdfDoc);
          lines.push(...brokenWord.slice(0, -1));
          currentLine = brokenWord[brokenWord.length - 1] || '';
        }
      }
    }
    
    // Add remaining text
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }
    
    return lines.length > 0 ? lines : [''];
  };

  // Break very long words that exceed line width
  const breakLongWord = (word: string, maxWidth: number, pdfDoc: any): string[] => {
    if (pdfDoc.getTextWidth(word) <= maxWidth) {
      return [word];
    }
    
    const result: string[] = [];
    let currentPart = '';
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const testPart = currentPart + char;
      
      if (pdfDoc.getTextWidth(testPart) <= maxWidth) {
        currentPart = testPart;
      } else {
        if (currentPart) {
          result.push(currentPart);
          currentPart = char;
        } else {
          // Even single character is too wide, force it
          result.push(char);
          currentPart = '';
        }
      }
    }
    
    if (currentPart) {
      result.push(currentPart);
    }
    
    return result;
  };

  // HEADER SECTION
  if (options.templateType === 'modern' || options.templateType === 'creative') {
    // Modern header with colored background
    doc.setFillColor(pr, pg, pb);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(resumeData.name || 'Enhanced Resume', margin, 25);
    
    if (resumeData.title) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(resumeData.title, margin, 35);
    }
    
    // Contact info
    const contactInfo = [resumeData.email, resumeData.phone, resumeData.location].filter(Boolean).join(' • ');
    if (contactInfo) {
      doc.setFontSize(10);
      doc.text(contactInfo, margin, 42);
    }
    
    currentY = 55;
  } else {
    // Classic/Minimalist centered header
    doc.setTextColor(pr, pg, pb);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    const nameWidth = doc.getTextWidth(resumeData.name || 'Enhanced Resume');
    doc.text(resumeData.name || 'Enhanced Resume', (pageWidth - nameWidth) / 2, currentY);
    currentY += 8;
    
    if (resumeData.title) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      const titleWidth = doc.getTextWidth(resumeData.title);
      doc.text(resumeData.title, (pageWidth - titleWidth) / 2, currentY);
      currentY += 6;
    }
    
    // Contact info
    const contactInfo = [resumeData.email, resumeData.phone, resumeData.location].filter(Boolean).join(' | ');
    if (contactInfo) {
      doc.setFontSize(10);
      const contactWidth = doc.getTextWidth(contactInfo);
      doc.text(contactInfo, (pageWidth - contactWidth) / 2, currentY);
      currentY += 8;
    }
    
    // Separator line
    doc.setLineWidth(0.8);
    doc.setDrawColor(pr, pg, pb);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;
  }

  // PROFESSIONAL SUMMARY
  if (resumeData.summary) {
    addSectionTitle('Professional Summary');
    addWrappedText(resumeData.summary, margin, 10, 'normal', [60, 60, 60]);
    currentY += 5;
  }

  // PROFESSIONAL EXPERIENCE
  if (resumeData.experience && resumeData.experience.length > 0) {
    addSectionTitle('Professional Experience');
    
    resumeData.experience.forEach((exp, index) => {
      checkPageBreak(25);
      
      // Job title
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(exp.title || 'Position Title', margin, currentY);
      currentY += 6;
      
      // Company and duration
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(pr, pg, pb);
      doc.text(exp.company || 'Company Name', margin, currentY);
      
      if (exp.duration) {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        const durationWidth = doc.getTextWidth(exp.duration);
        doc.text(exp.duration, pageWidth - margin - durationWidth, currentY);
      }
      currentY += 8;
      
      // Achievements
      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach((achievement) => {
          checkPageBreak(10);
          
          // Simple bullet point
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(60, 60, 60);
          doc.text('•', margin + 5, currentY);
          
          // Achievement text with intelligent wrapping
          const lines = splitTextIntelligently(achievement, contentWidth - 15, doc);
          lines.forEach((line: string, lineIndex: number) => {
            if (lineIndex > 0) checkPageBreak(8);
            doc.text(line, margin + 10, currentY + (lineIndex * lineHeight));
          });
          currentY += lines.length * lineHeight + 2;
        });
      }
      
      // Space between experiences
      if (index < resumeData.experience!.length - 1) {
        currentY += 6;
      }
    });
  }

  // SKILLS SECTION
  if (resumeData.skills && resumeData.skills.length > 0) {
    addSectionTitle('Core Competencies');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    // Display skills in rows
    const skillsPerRow = 2;
    const colWidth = contentWidth / skillsPerRow;
    
    for (let i = 0; i < resumeData.skills.length; i += skillsPerRow) {
      checkPageBreak(8);
      const rowSkills = resumeData.skills.slice(i, i + skillsPerRow);
      
      rowSkills.forEach((skill, colIndex) => {
        const x = margin + (colIndex * colWidth);
        doc.text(`• ${skill}`, x, currentY);
      });
      
      currentY += lineHeight + 2;
    }
    currentY += 5;
  }

  // EDUCATION SECTION
  if (resumeData.education && resumeData.education.length > 0) {
    addSectionTitle('Education');
    
    resumeData.education.forEach((edu, index) => {
      checkPageBreak(15);
      
      // Degree
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text(edu.degree || 'Bachelor\'s Degree', margin, currentY);
      currentY += 5;
      
      // Institution and year
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(pr, pg, pb);
      doc.text(edu.institution || 'University Name', margin, currentY);
      
      if (edu.year && edu.year !== 'N/A' && edu.year !== 'Year not specified') {
        const yearWidth = doc.getTextWidth(edu.year);
        doc.setTextColor(100, 100, 100);
        doc.text(edu.year, pageWidth - margin - yearWidth, currentY);
      }
      currentY += 6;
      
      // Space between education entries
      if (index < resumeData.education!.length - 1) {
        currentY += 4;
      }
    });
  }

  console.log('✅ Clean text-based PDF generated successfully');
  return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
}

/**
 * Downloads the text-based PDF
 */
export async function downloadTextBasedPdf(
  resumeData: ResumeData,
  options: TextBasedPdfOptions = {}
): Promise<void> {
  try {
    const blob = await generateTextBasedPdf(resumeData, options);
    
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
    console.error('Error downloading text-based PDF:', error);
    throw error;
  }
}

/**
 * Extracts resume data from enhanced content for text-based PDF generation
 */
export function extractResumeDataFromEnhanced(enhancedContent: any): ResumeData {
  return {
    name: enhancedContent.name || 'Enhanced Resume',
    title: enhancedContent.title || 'Professional',
    email: enhancedContent.email || '',
    phone: enhancedContent.phone || '',
    location: enhancedContent.location || '',
    summary: enhancedContent.summary || '',
    experience: enhancedContent.experience || [],
    skills: enhancedContent.skills || [],
    education: enhancedContent.education || []
  };
}