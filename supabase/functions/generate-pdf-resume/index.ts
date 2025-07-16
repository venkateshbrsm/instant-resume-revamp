import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const colorThemes = {
  navy: { primary: '#1e3a8a', secondary: '#1e40af', accent: '#3b82f6' },
  emerald: { primary: '#065f46', secondary: '#047857', accent: '#10b981' },
  purple: { primary: '#6b21a8', secondary: '#7c3aed', accent: '#8b5cf6' },
  rose: { primary: '#be185d', secondary: '#e11d48', accent: '#f43f5e' },
  orange: { primary: '#c2410c', secondary: '#ea580c', accent: '#f97316' },
  slate: { primary: '#334155', secondary: '#475569', accent: '#64748b' }
};

function generateResumeHTML(resumeData: any, themeId: string = 'navy'): string {
  const theme = colorThemes[themeId as keyof typeof colorThemes] || colorThemes.navy;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enhanced Resume - ${resumeData.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #374151;
      background: linear-gradient(135deg, ${theme.primary}05, ${theme.accent}05);
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(to right, ${theme.primary}, ${theme.accent});
      color: white;
      padding: 40px;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.1);
    }
    
    .header-content {
      position: relative;
      z-index: 2;
    }
    
    .header h1 {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 8px;
      line-height: 1.2;
    }
    
    .header .title {
      font-size: 1.25rem;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
      margin-bottom: 24px;
    }
    
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.95rem;
    }
    
    .contact-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }
    
    .main-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 40px;
      padding: 40px;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section:last-child {
      margin-bottom: 0;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-bottom: 2px solid ${theme.primary}20;
    }
    
    .section-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(to right, ${theme.primary}, ${theme.accent});
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }
    
    .section-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: ${theme.primary};
    }
    
    .summary-text {
      font-size: 1rem;
      line-height: 1.7;
      color: #374151;
    }
    
    .experience-item {
      position: relative;
      padding-left: 24px;
      margin-bottom: 32px;
      border-left: 2px solid ${theme.accent}30;
    }
    
    .experience-item::before {
      content: '';
      position: absolute;
      left: -7px;
      top: 0;
      width: 12px;
      height: 12px;
      background: ${theme.accent};
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 0 2px ${theme.accent};
    }
    
    .experience-content {
      background: linear-gradient(to right, ${theme.accent}08, ${theme.primary}08);
      padding: 24px;
      border-radius: 12px;
      margin-left: 16px;
    }
    
    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }
    
    .experience-title {
      font-size: 1.125rem;
      font-weight: bold;
      color: #374151;
    }
    
    .experience-company {
      font-size: 1.125rem;
      font-weight: 600;
      color: ${theme.accent};
      margin-top: 4px;
    }
    
    .experience-duration {
      background: ${theme.accent}15;
      color: ${theme.accent};
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      border: 1px solid ${theme.accent}30;
    }
    
    .achievements {
      list-style: none;
    }
    
    .achievement {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 8px;
    }
    
    .achievement-icon {
      width: 20px;
      height: 20px;
      background: linear-gradient(to right, #10b981, #059669);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      flex-shrink: 0;
      margin-top: 2px;
    }
    
    .sidebar {
      space-y: 32px;
    }
    
    .skills-container {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid ${theme.primary}10;
      margin-bottom: 32px;
    }
    
    .skill-item {
      margin-bottom: 16px;
    }
    
    .skill-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .skill-name {
      font-weight: 500;
      color: #374151;
    }
    
    .skill-percentage {
      color: #6b7280;
      font-size: 0.875rem;
    }
    
    .skill-bar {
      width: 100%;
      height: 8px;
      background: #f3f4f6;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .skill-progress {
      height: 100%;
      background: linear-gradient(to right, ${theme.primary}, ${theme.accent});
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    
    .skills-tags {
      margin-top: 20px;
    }
    
    .skills-tags h4 {
      color: #6b7280;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 12px;
    }
    
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .skill-tag {
      background: linear-gradient(to right, ${theme.primary}10, ${theme.accent}10);
      color: #374151;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.875rem;
      border: 1px solid ${theme.primary}20;
    }
    
    .stats-grid {
      display: grid;
      gap: 16px;
      margin-bottom: 32px;
    }
    
    .stat-card {
      text-align: center;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid ${theme.primary}10;
    }
    
    .stat-card.primary {
      background: ${theme.primary}08;
    }
    
    .stat-card.accent {
      background: ${theme.accent}08;
    }
    
    .stat-card.secondary {
      background: ${theme.secondary}08;
    }
    
    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .stat-number.primary {
      color: ${theme.primary};
    }
    
    .stat-number.accent {
      color: ${theme.accent};
    }
    
    .stat-number.secondary {
      color: ${theme.secondary};
    }
    
    .stat-label {
      color: #6b7280;
      font-size: 0.875rem;
    }
    
    .education-item {
      background: linear-gradient(to right, ${theme.primary}08, ${theme.accent}08);
      border: 1px solid ${theme.primary}10;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }
    
    .education-degree {
      font-weight: bold;
      color: #374151;
      font-size: 1rem;
      margin-bottom: 4px;
    }
    
    .education-institution {
      font-weight: 500;
      color: ${theme.accent};
      margin-bottom: 4px;
    }
    
    .education-year {
      color: #6b7280;
      font-size: 0.875rem;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .container {
        box-shadow: none;
        border-radius: 0;
      }
      
      .main-content {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 20px;
      }
      
      .header {
        padding: 30px;
      }
      
      .section {
        margin-bottom: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <h1>${resumeData.name}</h1>
        <div class="title">${resumeData.title}</div>
        
        <div class="contact-grid">
          <div class="contact-item">
            <div class="contact-icon">✉</div>
            <span>${resumeData.email}</span>
          </div>
          <div class="contact-item">
            <div class="contact-icon">📞</div>
            <span>${resumeData.phone}</span>
          </div>
          <div class="contact-item">
            <div class="contact-icon">📍</div>
            <span>${resumeData.location}</span>
          </div>
          <div class="contact-item">
            <div class="contact-icon">🏆</div>
            <span>Professional</span>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- Main Content -->
      <div class="left-column">
        <!-- Professional Summary -->
        <div class="section">
          <div class="section-header">
            <div class="section-icon">👤</div>
            <h3 class="section-title">Professional Summary</h3>
          </div>
          <p class="summary-text">${resumeData.summary}</p>
        </div>

        <!-- Professional Experience -->
        ${resumeData.experience && resumeData.experience.length > 0 ? `
        <div class="section">
          <div class="section-header">
            <div class="section-icon">📅</div>
            <h3 class="section-title">Professional Experience</h3>
          </div>
          
          <div class="experience-timeline">
            ${resumeData.experience.map((exp: any) => `
            <div class="experience-item">
              <div class="experience-content">
                <div class="experience-header">
                  <div>
                    <div class="experience-title">${exp.title}</div>
                    <div class="experience-company">${exp.company}</div>
                  </div>
                  <div class="experience-duration">${exp.duration}</div>
                </div>
                
                <ul class="achievements">
                  ${exp.achievements.map((achievement: string) => `
                  <li class="achievement">
                    <div class="achievement-icon">↗</div>
                    <span>${achievement}</span>
                  </li>
                  `).join('')}
                </ul>
              </div>
            </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
      </div>

      <!-- Sidebar -->
      <div class="sidebar">
        <!-- Skills -->
        ${resumeData.skills && resumeData.skills.length > 0 ? `
        <div class="skills-container">
          <div class="section-header">
            <div class="section-icon">⚡</div>
            <h3 class="section-title">Skills Proficiency</h3>
          </div>
          
          <div class="skills-list">
            ${resumeData.skills.slice(0, 6).map((skill: string, index: number) => {
              const baseSkillLevel = 75 + (skill.length % 20);
              const proficiency = Math.min(95, baseSkillLevel + (index * 2));
              return `
              <div class="skill-item">
                <div class="skill-header">
                  <span class="skill-name">${skill}</span>
                  <span class="skill-percentage">${Math.round(proficiency)}%</span>
                </div>
                <div class="skill-bar">
                  <div class="skill-progress" style="width: ${proficiency}%"></div>
                </div>
              </div>
              `;
            }).join('')}
          </div>

          <div class="skills-tags">
            <h4>All Skills</h4>
            <div class="tags-container">
              ${resumeData.skills.map((skill: string) => `
                <span class="skill-tag">${skill}</span>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Stats Overview -->
        <div class="stats-grid">
          <div class="stat-card primary">
            <div class="stat-number primary">${resumeData.skills.length}</div>
            <div class="stat-label">Total Skills</div>
          </div>
          <div class="stat-card accent">
            <div class="stat-number accent">${resumeData.experience?.length || 0}</div>
            <div class="stat-label">Work Experiences</div>
          </div>
          <div class="stat-card secondary">
            <div class="stat-number secondary">${resumeData.education?.length || 0}</div>
            <div class="stat-label">Educational Qualifications</div>
          </div>
        </div>
        ` : ''}

        <!-- Education -->
        ${resumeData.education && resumeData.education.length > 0 ? `
        <div class="skills-container">
          <div class="section-header">
            <div class="section-icon">🎓</div>
            <h3 class="section-title">Education</h3>
          </div>
          <div class="education-list">
            ${resumeData.education.map((edu: any) => `
            <div class="education-item">
              <div class="education-degree">${edu.degree}</div>
              <div class="education-institution">${edu.institution}</div>
              <div class="education-year">${edu.year}</div>
            </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

async function generatePDFFromResumeData(resumeData: any, themeId: string = 'navy'): Promise<Uint8Array> {
  try {
    // Use jsPDF to create a structured PDF directly from resume data
    const jsPDFModule = await import("https://esm.sh/jspdf@2.5.1");
    const { jsPDF } = jsPDFModule.default || jsPDFModule;
    
    const theme = colorThemes[themeId as keyof typeof colorThemes] || colorThemes.navy;
    
    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPosition = margin;

    // Helper function to convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    // Header section with gradient effect
    const headerHeight = 60;
    const primaryColor = hexToRgb(theme.primary);
    const accentColor = hexToRgb(theme.accent);
    
    // Create gradient effect with rectangles
    for (let i = 0; i < headerHeight; i++) {
      const ratio = i / headerHeight;
      const r = Math.round(primaryColor.r + (accentColor.r - primaryColor.r) * ratio);
      const g = Math.round(primaryColor.g + (accentColor.g - primaryColor.g) * ratio);
      const b = Math.round(primaryColor.b + (accentColor.b - primaryColor.b) * ratio);
      
      doc.setFillColor(r, g, b);
      doc.rect(0, i, pageWidth, 1, 'F');
    }

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    yPosition = 25;
    doc.text(resumeData.name || '', margin, yPosition);
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    yPosition += 10;
    doc.text(resumeData.title || '', margin, yPosition);

    // Contact information
    doc.setFontSize(10);
    yPosition += 8;
    const contactInfo = [
      `📧 ${resumeData.email || ''}`,
      `📞 ${resumeData.phone || ''}`,
      `📍 ${resumeData.location || ''}`
    ].filter(info => info.length > 2);
    
    contactInfo.forEach((info, index) => {
      doc.text(info, margin + (index * 60), yPosition);
    });

    yPosition = headerHeight + 20;

    // Reset text color for content
    doc.setTextColor(0, 0, 0);

    // Professional Summary
    if (resumeData.summary) {
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text('Professional Summary', margin, yPosition);
      
      yPosition += 8;
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      
      const summaryLines = doc.splitTextToSize(resumeData.summary, pageWidth - 2 * margin);
      doc.text(summaryLines, margin, yPosition);
      yPosition += summaryLines.length * 5 + 10;
    }

    // Experience Section
    if (resumeData.experience && resumeData.experience.length > 0) {
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text('Professional Experience', margin, yPosition);
      yPosition += 10;

      resumeData.experience.forEach((exp: any) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(exp.title || '', margin, yPosition);
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        yPosition += 5;
        doc.text(exp.company || '', margin, yPosition);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(exp.duration || '', pageWidth - margin - 40, yPosition);
        
        yPosition += 8;
        
        if (exp.achievements && exp.achievements.length > 0) {
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          exp.achievements.forEach((achievement: string) => {
            const achievementLines = doc.splitTextToSize(`• ${achievement}`, pageWidth - 2 * margin - 10);
            doc.text(achievementLines, margin + 5, yPosition);
            yPosition += achievementLines.length * 4 + 2;
          });
        }
        yPosition += 5;
      });
    }

    // Skills Section (right side)
    if (resumeData.skills && resumeData.skills.length > 0) {
      yPosition += 10;
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text('Skills', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const skillsText = resumeData.skills.join(' • ');
      const skillsLines = doc.splitTextToSize(skillsText, pageWidth - 2 * margin);
      doc.text(skillsLines, margin, yPosition);
      yPosition += skillsLines.length * 4 + 10;
    }

    // Education Section
    if (resumeData.education && resumeData.education.length > 0) {
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text('Education', margin, yPosition);
      yPosition += 10;

      resumeData.education.forEach((edu: any) => {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(edu.degree || '', margin, yPosition);
        
        yPosition += 5;
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        doc.text(edu.institution || '', margin, yPosition);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(edu.year || '', pageWidth - margin - 20, yPosition);
        
        yPosition += 8;
      });
    }

    return new Uint8Array(doc.output('arraybuffer'));
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting PDF resume generation...");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { paymentId } = await req.json();
    console.log("Payment ID:", paymentId);

    if (!paymentId) {
      throw new Error("Payment ID is required");
    }

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .select("*")
      .eq("razorpay_payment_id", paymentId)
      .eq("status", "completed")
      .single();

    if (paymentError || !payment) {
      console.error("Payment not found:", paymentError);
      throw new Error("Payment not found or not completed");
    }

    console.log("Found payment:", payment.id, "for file:", payment.file_name);

    if (!payment.enhanced_content) {
      throw new Error("Enhanced content not found for this payment");
    }

    console.log("Generating PDF from resume data...");
    const themeId = payment.theme_id || 'navy';
    
    console.log("Creating structured PDF...");
    const pdfBuffer = await generatePDFFromResumeData(payment.enhanced_content, themeId);
    
    const fileName = `enhanced_${payment.file_name.replace(/\.[^/.]+$/, '.pdf')}`;
    
    console.log(`Generated PDF, size: ${pdfBuffer.byteLength} bytes`);
    
    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error("Error in PDF generation:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate PDF" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});