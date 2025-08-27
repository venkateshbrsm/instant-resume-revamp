import { jsPDF } from 'jspdf';
import { templateGenerators } from './pdfTemplates';

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

  console.log('🚀 Generating text-based PDF with native jsPDF for ATS compatibility...');

  // Create new jsPDF instance
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true
  });

  // Convert hex colors to RGB for jsPDF
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const primaryColor = hexToRgb(colorTheme.primary);
  const accentColor = hexToRgb(colorTheme.accent);

  // Generate PDF based on template type
  switch (templateType) {
    case 'modern':
      return generateModernPdf(doc, resumeData, { primaryColor, accentColor });
    case 'classic':
      return generateClassicPdf(doc, resumeData, { primaryColor, accentColor });
    case 'creative':
      return generateCreativePdf(doc, resumeData, { primaryColor, accentColor });
    case 'executive':
      return generateExecutivePdf(doc, resumeData, { primaryColor, accentColor });
    case 'minimalist':
      return generateMinimalistPdf(doc, resumeData, { primaryColor, accentColor });
    default:
      return generateModernPdf(doc, resumeData, { primaryColor, accentColor });
  }
}

/**
 * Generate Modern template PDF
 */
function generateModernPdf(doc: any, resumeData: ResumeData, colors: any): Blob {
  const { primaryColor, accentColor } = colors;
  let currentY = 20;

  // Header with gradient background effect
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.rect(0, 0, 210, 45, 'F');
  
  // Header content
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(resumeData.name || 'Enhanced Resume', 20, 20);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(resumeData.title || 'Professional', 20, 30);
  
  doc.setFontSize(10);
  const contactInfo = [resumeData.email, resumeData.phone, resumeData.location].filter(Boolean).join(' • ');
  doc.text(contactInfo, 20, 38);

  currentY = 55;

  // Reset text color for body
  doc.setTextColor(26, 32, 44);

  // Professional Summary Section
  if (resumeData.summary) {
    // Section header with colored background
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b, 0.1);
    doc.rect(15, currentY - 5, 180, 10, 'F');
    
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFESSIONAL SUMMARY', 20, currentY);
    currentY += 10;

    doc.setTextColor(45, 55, 72);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(resumeData.summary, 170);
    summaryLines.forEach((line: string) => {
      doc.text(line, 20, currentY);
      currentY += 5;
    });
    currentY += 5;
  }

  // Experience Section
  if (resumeData.experience && resumeData.experience.length > 0) {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    // Section header
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b, 0.1);
    doc.rect(15, currentY - 5, 180, 10, 'F');
    
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFESSIONAL EXPERIENCE', 20, currentY);
    currentY += 10;

    resumeData.experience.forEach((exp, index) => {
      // Check for page break
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      // Timeline dot
      doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
      doc.circle(25, currentY - 2, 2, 'F');
      
      // Experience content
      doc.setTextColor(26, 32, 44);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(exp.title || 'Position Title', 30, currentY);
      
      // Duration on the right
      if (exp.duration) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        doc.text(exp.duration, 190, currentY, { align: 'right' });
      }
      
      currentY += 6;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
      doc.text(exp.company || 'Company Name', 30, currentY);
      currentY += 8;

      // Achievements
      if (exp.achievements && exp.achievements.length > 0) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(45, 55, 72);
        
        exp.achievements.forEach((achievement: string) => {
          if (currentY > 270) {
            doc.addPage();
            currentY = 20;
          }
          
          // Bullet point
          doc.setFillColor(34, 197, 94);
          doc.circle(32, currentY - 1, 1, 'F');
          
          const achievementLines = doc.splitTextToSize(achievement, 155);
          achievementLines.forEach((line: string, lineIndex: number) => {
            doc.text(line, 36, currentY + (lineIndex * 4));
          });
          currentY += achievementLines.length * 4 + 2;
        });
      }
      currentY += 5;
    });
  }

  // Skills Section (sidebar-style on right)
  if (resumeData.skills && resumeData.skills.length > 0) {
    let skillsY = 55;
    
    // Skills header
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b, 0.1);
    doc.rect(140, skillsY - 5, 55, 8, 'F');
    
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CORE SKILLS', 145, skillsY);
    skillsY += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(45, 55, 72);
    
    resumeData.skills.slice(0, 8).forEach((skill: string) => {
      doc.text('• ' + skill, 145, skillsY);
      skillsY += 5;
    });
  }

  // Education Section
  if (resumeData.education && resumeData.education.length > 0) {
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    // Section header
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b, 0.1);
    doc.rect(15, currentY - 5, 180, 10, 'F');
    
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUCATION', 20, currentY);
    currentY += 10;

    resumeData.education.forEach((edu: any) => {
      doc.setTextColor(26, 32, 44);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.degree || 'Bachelor\'s Degree', 20, currentY);
      currentY += 5;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
      doc.text(edu.institution || 'University Name', 20, currentY);
      
      if (edu.year && edu.year !== 'N/A') {
        doc.text(edu.year, 190, currentY, { align: 'right' });
      }
      currentY += 8;
    });
  }

  console.log('✅ Modern template PDF generated successfully');
  return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
}

/**
 * Generate Classic template PDF
 */
function generateClassicPdf(doc: any, resumeData: ResumeData, colors: any): Blob {
  const { primaryColor } = colors;
  let currentY = 20;

  // Header - centered classic style
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text(resumeData.name || 'Enhanced Resume', 105, currentY, { align: 'center' });
  
  currentY += 8;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(resumeData.title || 'Professional', 105, currentY, { align: 'center' });
  
  currentY += 6;
  doc.setFontSize(10);
  const contactInfo = [resumeData.email, resumeData.phone, resumeData.location].filter(Boolean).join(' | ');
  doc.text(contactInfo, 105, currentY, { align: 'center' });
  
  // Horizontal line
  currentY += 8;
  doc.setLineWidth(0.8);
  doc.line(20, currentY, 190, currentY);
  currentY += 10;

  // Professional Summary
  if (resumeData.summary) {
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFESSIONAL SUMMARY', 20, currentY);
    
    // Underline
    doc.setLineWidth(0.5);
    doc.line(20, currentY + 2, 75, currentY + 2);
    currentY += 8;

    doc.setTextColor(44, 62, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(resumeData.summary, 170);
    summaryLines.forEach((line: string) => {
      doc.text(line, 20, currentY);
      currentY += 5;
    });
    currentY += 5;
  }

  // Experience Section
  if (resumeData.experience && resumeData.experience.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFESSIONAL EXPERIENCE', 20, currentY);
    doc.setLineWidth(0.5);
    doc.line(20, currentY + 2, 90, currentY + 2);
    currentY += 8;

    resumeData.experience.forEach((exp) => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }

      doc.setTextColor(44, 62, 80);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(exp.title || 'Position Title', 20, currentY);
      currentY += 5;
      
      doc.setFontSize(11);
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text(exp.company || 'Company Name', 20, currentY);
      
      if (exp.duration) {
        doc.setFontSize(10);
        doc.setTextColor(127, 140, 141);
        doc.setFont('helvetica', 'italic');
        doc.text(exp.duration, 190, currentY, { align: 'right' });
      }
      currentY += 6;

      if (exp.achievements && exp.achievements.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(44, 62, 80);
        
        exp.achievements.forEach((achievement: string) => {
          doc.text('• ' + achievement, 25, currentY);
          currentY += 5;
        });
      }
      currentY += 3;
    });
  }

  // Skills and Education in two columns
  const startY = Math.max(currentY, 140);
  
  // Skills (left column)
  if (resumeData.skills && resumeData.skills.length > 0) {
    let skillY = startY;
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CORE COMPETENCIES', 20, skillY);
    doc.setLineWidth(0.5);
    doc.line(20, skillY + 2, 75, skillY + 2);
    skillY += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(44, 62, 80);
    
    resumeData.skills.forEach((skill: string) => {
      doc.text('• ' + skill, 20, skillY);
      skillY += 5;
    });
  }

  // Education (right column)
  if (resumeData.education && resumeData.education.length > 0) {
    let eduY = startY;
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUCATION', 110, eduY);
    doc.setLineWidth(0.5);
    doc.line(110, eduY + 2, 140, eduY + 2);
    eduY += 8;

    resumeData.education.forEach((edu: any) => {
      doc.setTextColor(44, 62, 80);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.degree || 'Bachelor\'s Degree', 110, eduY);
      eduY += 4;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text(edu.institution || 'University Name', 110, eduY);
      eduY += 4;
      
      if (edu.year && edu.year !== 'N/A') {
        doc.setFontSize(9);
        doc.setTextColor(127, 140, 141);
        doc.text(edu.year, 110, eduY);
        eduY += 4;
      }
      eduY += 2;
    });
  }

  return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
}

/**
 * Generate Creative template PDF
 */
function generateCreativePdf(doc: any, resumeData: ResumeData, colors: any): Blob {
  const { primaryColor, accentColor } = colors;
  let currentY = 15;

  // Creative header with side accent
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.rect(0, 0, 8, 297, 'F');
  
  doc.setFillColor(accentColor.r, accentColor.g, accentColor.b, 0.1);
  doc.rect(8, 0, 202, 50, 'F');
  
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(resumeData.name || 'Enhanced Resume', 15, 25);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(resumeData.title || 'Creative Professional', 15, 35);
  
  doc.setFontSize(9);
  const contactInfo = [resumeData.email, resumeData.phone, resumeData.location].filter(Boolean).join(' • ');
  doc.text(contactInfo, 15, 44);

  currentY = 60;

  // Summary with creative border
  if (resumeData.summary) {
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b, 0.05);
    doc.rect(12, currentY - 3, 186, 20, 'F');
    
    doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
    doc.setLineWidth(0.8);
    doc.line(12, currentY - 3, 12, currentY + 17);
    
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CREATIVE VISION', 15, currentY + 3);
    
    currentY += 8;
    doc.setTextColor(45, 55, 72);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(resumeData.summary, 180);
    summaryLines.forEach((line: string) => {
      doc.text(line, 15, currentY);
      currentY += 4;
    });
    currentY += 8;
  }

  // Use modern template logic for the rest but with creative styling
  return generateModernPdf(doc, resumeData, colors);
}

/**
 * Generate Executive template PDF
 */
function generateExecutivePdf(doc: any, resumeData: ResumeData, colors: any): Blob {
  const { primaryColor, accentColor } = colors;
  
  // Use classic layout but with executive styling
  return generateClassicPdf(doc, resumeData, colors);
}

/**
 * Generate Minimalist template PDF
 */
function generateMinimalistPdf(doc: any, resumeData: ResumeData, colors: any): Blob {
  const { primaryColor } = colors;
  let currentY = 25;

  // Minimalist header - simple and clean
  doc.setTextColor(26, 32, 44);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'normal');
  doc.text(resumeData.name || 'Enhanced Resume', 20, currentY);
  
  currentY += 8;
  doc.setFontSize(12);
  doc.text(resumeData.title || 'Professional', 20, currentY);
  
  currentY += 6;
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  const contactInfo = [resumeData.email, resumeData.phone, resumeData.location].filter(Boolean).join(' | ');
  doc.text(contactInfo, 20, currentY);
  
  currentY += 12;

  // Simple line separator
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(20, currentY, 190, currentY);
  currentY += 8;

  // Use simplified modern template logic
  return generateModernPdf(doc, resumeData, { primaryColor, accentColor: primaryColor });
}

/**
 * Fallback function to generate simple text-based PDF
 */
async function generateSimpleTextPdf(
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
  const sectionSpacing = 12;

  // Helper functions
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    const { fontSize = 10, fontStyle = 'normal', maxWidth = contentWidth, align = 'left' } = options;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    
    if (maxWidth && text.length * (fontSize * 0.35) > maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string, index: number) => {
        doc.text(line, x, y + (index * lineHeight), { align });
      });
      return lines.length * lineHeight;
    } else {
      doc.text(text, x, y, { align });
      return lineHeight;
    }
  };

  const addSectionTitle = (title: string) => {
    if (currentY > pageHeight - 30) {
      doc.addPage();
      currentY = margin;
    }
    
    currentY += sectionSpacing;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin, currentY);
    
    const textWidth = doc.getTextWidth(title.toUpperCase());
    doc.setLineWidth(0.5);
    doc.line(margin, currentY + 2, margin + textWidth, currentY + 2);
    
    currentY += lineHeight + 4;
  };

  const checkPageBreak = (neededSpace: number = 20) => {
    if (currentY + neededSpace > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
      return true;
    }
    return false;
  };

  // Header Section
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(resumeData.name || 'Enhanced Resume', margin, currentY);
  currentY += 10;

  if (resumeData.title) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(resumeData.title, margin, currentY);
    currentY += 8;
  }

  // Contact information
  currentY += 4;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const contactInfo = [
    resumeData.email,
    resumeData.phone,
    resumeData.location
  ].filter(Boolean).join(' | ');
  
  if (contactInfo) {
    doc.text(contactInfo, margin, currentY);
    currentY += lineHeight + 2;
  }

  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // Professional Summary
  if (resumeData.summary) {
    addSectionTitle('Professional Summary');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(resumeData.summary, contentWidth);
    summaryLines.forEach((line: string) => {
      checkPageBreak();
      doc.text(line, margin, currentY);
      currentY += lineHeight;
    });
  }

  // Professional Experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    addSectionTitle('Professional Experience');
    
    resumeData.experience.forEach((exp, index) => {
      checkPageBreak(25);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(exp.title || 'Position Title', margin, currentY);
      currentY += lineHeight;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(exp.company || 'Company Name', margin, currentY);
      
      if (exp.duration) {
        doc.text(exp.duration, pageWidth - margin, currentY, { align: 'right' });
      }
      currentY += lineHeight + 2;
      
      if (exp.achievements && exp.achievements.length > 0) {
        doc.setFontSize(10);
        exp.achievements.forEach((achievement) => {
          checkPageBreak();
          doc.text('•', margin + 5, currentY);
          const achievementLines = doc.splitTextToSize(achievement, contentWidth - 10);
          achievementLines.forEach((line: string, lineIndex: number) => {
            doc.text(line, margin + 10, currentY + (lineIndex * lineHeight));
          });
          currentY += achievementLines.length * lineHeight + 1;
        });
      }
      
      if (index < resumeData.experience!.length - 1) {
        currentY += 4;
      }
    });
  }

  // Skills
  if (resumeData.skills && resumeData.skills.length > 0) {
    addSectionTitle('Core Competencies');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const skillsPerRow = 3;
    const colWidth = contentWidth / skillsPerRow;
    
    for (let i = 0; i < resumeData.skills.length; i += skillsPerRow) {
      checkPageBreak();
      const rowSkills = resumeData.skills.slice(i, i + skillsPerRow);
      
      rowSkills.forEach((skill, colIndex) => {
        const x = margin + (colIndex * colWidth);
        doc.text(`• ${skill}`, x, currentY);
      });
      
      currentY += lineHeight + 1;
    }
  }

  // Education
  if (resumeData.education && resumeData.education.length > 0) {
    addSectionTitle('Education');
    
    resumeData.education.forEach((edu, index) => {
      checkPageBreak(15);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.degree || 'Bachelor\'s Degree', margin, currentY);
      currentY += lineHeight;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(edu.institution || 'University Name', margin, currentY);
      
      if (edu.year && edu.year !== 'N/A' && edu.year !== 'Year not specified') {
        doc.text(edu.year, pageWidth - margin, currentY, { align: 'right' });
      }
      currentY += lineHeight;
      
      if (index < resumeData.education!.length - 1) {
        currentY += 4;
      }
    });
  }

  console.log('✅ Fallback text-based PDF generated successfully');
  
  const pdfBlob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
  return pdfBlob;
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