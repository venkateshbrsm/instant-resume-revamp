import { jsPDF } from 'jspdf';

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
  summary: string;
  photo?: string;
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
  const sidebarWidth = 70;
  const mainContentX = sidebarWidth + 5;
  const mainContentWidth = pageWidth - mainContentX - 15;
  
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

  // Create gradient sidebar background using multiple rectangles
  for (let i = 0; i < sidebarWidth; i += 2) {
    const ratio = i / sidebarWidth;
    const r = Math.round(pr + (ar - pr) * ratio);
    const g = Math.round(pg + (ag - pg) * ratio);
    const b = Math.round(pb + (ab - pb) * ratio);
    
    doc.setFillColor(r, g, b);
    doc.rect(i, 0, 2, pageHeight, 'F');
  }

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
  doc.setFont('helvetica', 'bold');
  doc.text('CONTACT', 8, sidebarY);
  sidebarY += 8;

  // Contact details
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
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
    doc.setFont('helvetica', 'bold');
    doc.text('CORE SKILLS', 8, sidebarY);
    sidebarY += 8;

    resumeData.skills.slice(0, 8).forEach((skill, index) => {
      // Skill name with proper wrapping
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const skillLines = doc.splitTextToSize(skill, sidebarWidth - 16);
      skillLines.forEach((line: string, lineIndex: number) => {
        doc.text(line, 8, sidebarY + (lineIndex * 3));
      });
      const skillHeight = Math.max(3, skillLines.length * 3);
      sidebarY += skillHeight;
      
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
    doc.setFont('helvetica', 'bold');
    doc.text('EDUCATION', 8, sidebarY);
    sidebarY += 8;

    resumeData.education.slice(0, 2).forEach((edu) => {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      const degreeLines = doc.splitTextToSize(edu.degree, sidebarWidth - 16);
      degreeLines.forEach((line: string, lineIndex: number) => {
        doc.text(line, 8, sidebarY + (lineIndex * 3));
      });
      sidebarY += Math.max(4, degreeLines.length * 3);
      
      doc.setFont('helvetica', 'normal');
      const instLines = doc.splitTextToSize(edu.institution, sidebarWidth - 16);
      instLines.forEach((line: string, lineIndex: number) => {
        doc.text(line, 8, sidebarY + (lineIndex * 3));
      });
      sidebarY += Math.max(4, instLines.length * 3);
      
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
  doc.setFont('helvetica', 'bold');
  doc.text(resumeData.name, mainContentX, mainY);
  mainY += 8;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(resumeData.title, mainContentX, mainY);
  mainY += 15;

  // Professional Summary section
  if (resumeData.summary) {
    // Section header with colored background
    doc.setFillColor(pr, pg, pb, 0.1);
    doc.rect(mainContentX - 2, mainY - 6, mainContentWidth + 4, 8, 'F');
    
    doc.setTextColor(pr, pg, pb);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFESSIONAL SUMMARY', mainContentX, mainY);
    mainY += 10;

    doc.setTextColor(120, 120, 120);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(resumeData.summary, mainContentWidth);
    summaryLines.forEach((line: string) => {
      doc.text(line, mainContentX, mainY);
      mainY += 4.5;
    });
    mainY += 8;
  }

  // Professional Experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    // Section header
    doc.setFillColor(pr, pg, pb, 0.1);
    doc.rect(mainContentX - 2, mainY - 6, mainContentWidth + 4, 8, 'F');
    
    doc.setTextColor(pr, pg, pb);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFESSIONAL EXPERIENCE', mainContentX, mainY);
    mainY += 12;

    resumeData.experience.forEach((exp, index) => {
      // Timeline dot
      doc.setFillColor(pr, pg, pb);
      doc.circle(mainContentX - 3, mainY - 2, 1.5, 'F');
      
      // Job title
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(exp.title, mainContentX, mainY);
      mainY += 5;

      // Company and duration
      doc.setTextColor(pr, pg, pb);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
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

      // Achievements
      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach((achievement) => {
          // Check page break
          if (mainY > pageHeight - 30) {
            doc.addPage();
            // Re-create sidebar on new page
            for (let i = 0; i < sidebarWidth; i += 2) {
              const ratio = i / sidebarWidth;
              const r = Math.round(pr + (ar - pr) * ratio);
              const g = Math.round(pg + (ag - pg) * ratio);
              const b = Math.round(pb + (ab - pb) * ratio);
              
              doc.setFillColor(r, g, b);
              doc.rect(i, 0, 2, pageHeight, 'F');
            }
            mainY = 20;
          }

          // Achievement bullet
          doc.setFillColor(ar, ag, ab);
          doc.circle(mainContentX + 3, mainY - 1, 1, 'F');
          
          doc.setTextColor(120, 120, 120);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          const achievementLines = doc.splitTextToSize(achievement, mainContentWidth - 8);
          achievementLines.forEach((line: string, lineIndex: number) => {
            doc.text(line, mainContentX + 6, mainY + (lineIndex * 4));
          });
          mainY += achievementLines.length * 4 + 2;
        });
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
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
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

  let currentY = 20;

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
  doc.setFont('helvetica', 'bold');
  doc.text(resumeData.name, margin + 45, 25);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(resumeData.title, margin + 45, 32);

  // Contact info in header (matching preview)
  const contactInfo = [resumeData.email, resumeData.phone].filter(Boolean).join(' • ');
  if (contactInfo) {
    doc.setFontSize(10);
    doc.text(contactInfo, margin + 45, 40);
  }

  currentY = headerHeight + 15;

  // Creative Vision section with light background (no black)
  doc.setFillColor(pr, pg, pb, 0.05); // Use alpha parameter instead of setGState
  doc.rect(margin - 5, currentY - 5, contentWidth + 10, 30, 'F');

  doc.setTextColor(pr, pg, pb);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CREATIVE VISION', margin, currentY);
  currentY += 8;

  if (resumeData.summary) {
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(resumeData.summary, contentWidth);
    summaryLines.forEach((line: string) => {
      doc.text(line, margin, currentY);
      currentY += 5;
    });
  }
  currentY += 10;

  // Skills as creative badges
  if (resumeData.skills && resumeData.skills.length > 0) {
    doc.setTextColor(pr, pg, pb);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
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
        doc.setFont('helvetica', 'bold');
        const skillLines = doc.splitTextToSize(skill, badgeWidth - 4);
        skillLines.forEach((line: string, lineIndex: number) => {
          doc.text(line, x + 2, currentY + (lineIndex * 3));
        });
        
        skillIndex++;
      }
      currentY += 12;
    }
    currentY += 5;
  }

  // Professional Experience with enhanced visual style
  if (resumeData.experience && resumeData.experience.length > 0) {
    doc.setTextColor(pr, pg, pb);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFESSIONAL EXPERIENCE', margin, currentY);
    currentY += 12;

    resumeData.experience.forEach((exp) => {
      // Check for page break before each experience
      if (currentY > pageHeight - 80) {
        doc.addPage();
        currentY = 20;
        
        // Re-add section header on new page
        doc.setTextColor(pr, pg, pb);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('PROFESSIONAL EXPERIENCE', margin, currentY);
        currentY += 12;
      }
      
      // Experience container background
      doc.setFillColor(pr, pg, pb, 0.05);
      const containerHeight = 30 + (exp.achievements?.length || 0) * 5;
      doc.roundedRect(margin - 2, currentY - 5, contentWidth + 4, containerHeight, 3, 3, 'F');
      
      // Left border accent
      doc.setFillColor(ar, ag, ab);
      doc.rect(margin - 2, currentY - 5, 3, containerHeight, 'F');

      // Job title
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(exp.title, margin + 5, currentY);
      currentY += 5;

      // Company
      doc.setTextColor(pr, pg, pb);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(exp.company, margin + 5, currentY);

      // Duration badge
      if (exp.duration) {
        doc.setFillColor(ar, ag, ab);
        const durationWidth = doc.getTextWidth(exp.duration) + 6;
        doc.roundedRect(pageWidth - margin - durationWidth, currentY - 4, durationWidth, 6, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(exp.duration, pageWidth - margin - durationWidth + 3, currentY);
      }
      currentY += 8;

      // Achievements with checkmarks
      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach((achievement) => {
          // Check for page break before adding achievement
          if (currentY > pageHeight - 40) {
            doc.addPage();
            currentY = 20;
          }
          // Achievement bullet (matching preview)
          doc.setFillColor(ar, ag, ab);
          doc.circle(margin + 7, currentY - 1, 2, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text('V', margin + 5.5, currentY + 0.5);
          
          // Achievement text
          doc.setTextColor(120, 120, 120);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          const achievementLines = doc.splitTextToSize(achievement, contentWidth - 20);
          achievementLines.forEach((line: string, lineIndex: number) => {
            doc.text(line, margin + 12, currentY + (lineIndex * 4));
          });
          currentY += achievementLines.length * 4 + 2;
        });
      }

      currentY += containerHeight - 15;
    });
  }

  // Education section
  if (resumeData.education && resumeData.education.length > 0) {
    currentY += 10;
    doc.setTextColor(pr, pg, pb);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('EDUCATION', margin, currentY);
    currentY += 10;

    resumeData.education.forEach((edu) => {
      doc.setFillColor(sr, sg, sb, 0.1);
      doc.roundedRect(margin - 2, currentY - 3, contentWidth + 4, 15, 2, 2, 'F');
      
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.degree, margin + 2, currentY);
      currentY += 4;
      
      doc.setTextColor(ar, ag, ab);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
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
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [168, 85, 247];
  };

  const [pr, pg, pb] = hexToRgb(colorTheme.primary);
  let currentY = margin;

  // Centered header
  doc.setTextColor(pr, pg, pb);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  const nameWidth = doc.getTextWidth(resumeData.name);
  doc.text(resumeData.name, (pageWidth - nameWidth) / 2, currentY);
  currentY += 8;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
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
    doc.setFont('helvetica', 'bold');
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
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(resumeData.summary, contentWidth);
    summaryLines.forEach((line: string) => {
      doc.text(line, margin, currentY);
      currentY += 5;
    });
    currentY += 8;
  }

  // Experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    addSectionHeader('Professional Experience');
    
    resumeData.experience.forEach((exp) => {
      // Check for page break before each experience
      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 20;
        
        // Re-add section header on new page
        addSectionHeader('Professional Experience');
      }
      
      // Job title
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(exp.title, margin, currentY);
      currentY += 5;

      // Company and duration
      doc.setTextColor(pr, pg, pb);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(exp.company, margin, currentY);
      
      if (exp.duration) {
        const durationWidth = doc.getTextWidth(exp.duration);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'italic');
        doc.text(exp.duration, pageWidth - margin - durationWidth, currentY);
      }
      currentY += 7;

      // Achievements
      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach((achievement) => {
          doc.setTextColor(120, 120, 120);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text('•', margin + 5, currentY);
          
          const achievementLines = doc.splitTextToSize(achievement, contentWidth - 10);
          achievementLines.forEach((line: string, lineIndex: number) => {
            doc.text(line, margin + 10, currentY + (lineIndex * 5));
          });
          currentY += achievementLines.length * 5 + 2;
        });
      }
      currentY += 8;
    });
  }

  // Skills
  if (resumeData.skills && resumeData.skills.length > 0) {
    addSectionHeader('Core Competencies');
    
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
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
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(edu.degree, margin, currentY);
      currentY += 5;
      
      doc.setTextColor(pr, pg, pb);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
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
  
  const extractedData = {
    name: enhancedContent.name || 'Enhanced Resume',
    title: enhancedContent.title || 'Professional',
    email: enhancedContent.contact?.email || enhancedContent.email || '',
    phone: enhancedContent.contact?.phone || enhancedContent.phone || '',
    location: enhancedContent.contact?.location || enhancedContent.location || '',
    summary: enhancedContent.summary || '',
    photo: enhancedContent.profilePhotoUrl || enhancedContent.photo || undefined,
    experience: enhancedContent.experience || [],
    skills: enhancedContent.skills || [],
    education: enhancedContent.education || [],
    certifications: enhancedContent.certifications || [],
    languages: enhancedContent.languages || []
  };
  
  console.log('🔍 Extracted resume data:', extractedData);
  return extractedData;
}