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
 * Generates a text-based PDF that ATS systems can read using HTML templates
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

  console.log('🚀 Generating text-based PDF using HTML template for ATS compatibility...');

  try {
    // Get the appropriate template generator
    const templateGenerator = templateGenerators[templateType as keyof typeof templateGenerators] || templateGenerators.modern;
    
    // Generate HTML content using the same template system as preview
    const htmlContent = templateGenerator({
      resumeData,
      theme: colorTheme
    });

    // Create new jsPDF instance
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      putOnlyUsedFonts: true
    });

    // Create a temporary container to render HTML
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlContent;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '210mm';
    tempContainer.style.fontSize = '12px';
    tempContainer.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(tempContainer);

    try {
      // Use jsPDF's HTML functionality to convert HTML to PDF
      await new Promise<void>((resolve, reject) => {
        doc.html(tempContainer, {
          callback: (doc) => {
            resolve();
          },
          x: 0,
          y: 0,
          width: 210, // A4 width in mm
          windowWidth: 794, // A4 width in pixels at 96 DPI
          autoPaging: 'text',
          margin: [20, 20, 20, 20],
          html2canvas: {
            scale: 0.5,
            useCORS: true,
            allowTaint: true,
            letterRendering: true
          }
        });
      });
    } finally {
      // Clean up temporary container
      document.body.removeChild(tempContainer);
    }

    console.log('✅ Template-based PDF generated successfully');
    
    // Return as blob
    const pdfBlob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
    return pdfBlob;
  } catch (error) {
    console.error('Error generating template-based PDF, falling back to simple text-based PDF:', error);
    
    // Fallback to simple text-based PDF if HTML conversion fails
    return generateSimpleTextPdf(resumeData, options);
  }
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