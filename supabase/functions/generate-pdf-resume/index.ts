import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const colorThemes = {
  navy: { primary: '#3b82f6', secondary: '#60a5fa', accent: '#93c5fd' },
  charcoal: { primary: '#6b7280', secondary: '#9ca3af', accent: '#d1d5db' },
  burgundy: { primary: '#dc2626', secondary: '#ef4444', accent: '#f87171' },
  forest: { primary: '#22c55e', secondary: '#4ade80', accent: '#86efac' },
  bronze: { primary: '#eab308', secondary: '#fbbf24', accent: '#fcd34d' },
  slate: { primary: '#64748b', secondary: '#94a3b8', accent: '#cbd5e1' },
  emerald: { primary: '#10b981', secondary: '#34d399', accent: '#6ee7b7' },
  purple: { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#c4b5fd' },
  rose: { primary: '#f43f5e', secondary: '#fb7185', accent: '#fda4af' },
  orange: { primary: '#f97316', secondary: '#fb923c', accent: '#fdba74' }
};

async function generatePDFWithPDFShift(resumeData: any, templateId: string = 'modern', themeId: string = 'navy'): Promise<Uint8Array> {
  const theme = colorThemes[themeId as keyof typeof colorThemes] || colorThemes.navy;
  
  // Template generators - for now using simplified versions
  const templateGenerators = {
    modern: () => generateModernHTML(resumeData, theme),
    classic: () => generateClassicHTML(resumeData, theme),
    creative: () => generateModernHTML(resumeData, theme), // Use modern as fallback
    executive: () => generateClassicHTML(resumeData, theme), // Use classic as fallback  
    minimalist: () => generateClassicHTML(resumeData, theme), // Use classic as fallback
  };
  
  const generateHTML = templateGenerators[templateId as keyof typeof templateGenerators] || templateGenerators.modern;
  
  // Generate realistic skill proficiency percentages matching the preview
  const generateSkillProficiency = (skill: string) => {
    const baseSkillLevel = 75 + (skill.length % 20); // 75-95% based on skill name
    return Math.min(95, baseSkillLevel);
  };

  const htmlContent = generateHTML();
  
  function generateModernHTML(resumeData: any, theme: any) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enhanced Resume - ${resumeData.name}</title>
  <style>
    @page {
      size: A4;
      margin: 0.25in;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      text-decoration: none !important;
    }
    
    /* Prevent any auto-linking behavior */
    a, a:link, a:visited, a:hover, a:active {
      text-decoration: none !important;
      color: inherit !important;
    }
    
    body {
      font-family: 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      line-height: 1.5;
      color: #1a202c;
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      font-size: 9pt;
      width: 100%;
      min-height: auto;
    }
    
    .container {
      background: white;
      border-radius: 6pt;
      overflow: hidden;
      box-shadow: 0 15px 30px rgba(0,0,0,0.08);
      width: 100%;
      max-width: none;
    }
    
    /* Header matching the enhanced preview exactly */
    .header {
      background: linear-gradient(to right, ${theme.primary}, ${theme.accent});
      color: white;
      padding: 12pt;
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
      background: rgba(0,0,0,0.1);
      pointer-events: none;
    }
    
    .header-content {
      position: relative;
      z-index: 10;
    }
    
    .header h1 {
      font-size: 24pt;
      font-weight: 800;
      margin-bottom: 4pt;
      line-height: 1.1;
    }
    
    .header .title {
      font-size: 14pt;
      margin-bottom: 16pt;
      opacity: 0.95;
      font-weight: 500;
    }
    
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8pt;
      margin-top: 12pt;
    }
    
    .contact-item {
      font-size: 9pt;
      opacity: 0.9;
      display: flex;
      align-items: flex-start;
      gap: 6pt;
      font-weight: 500;
      text-decoration: none;
      line-height: 1.15;
      padding: 2.3pt 0;
    }
    
    .icon {
      width: 10pt;
      height: 10pt;
      fill: currentColor;
      flex-shrink: 0;
    }
    
    /* Main content grid matching the preview layout */
    .main-content {
      display: grid;
      grid-template-columns: 1.4fr 0.6fr;
      gap: 12pt;
      padding: 12pt;
      min-height: calc(297mm - 60pt);
      width: 100%;
    }
    
    .left-column {
      space-y: 12pt;
    }
    
    .sidebar {
      space-y: 12pt;
    }
    
    .section {
      margin-bottom: 12pt;
      break-inside: avoid;
    }
    
    /* Section titles with gradient icons matching preview */
    .section-header {
      display: flex;
      align-items: center;
      gap: 6pt;
      margin-bottom: 8pt;
    }
    
    .section-icon {
      width: 24pt;
      height: 24pt;
      border-radius: 6pt;
      background: linear-gradient(to right, ${theme.primary}, ${theme.accent});
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: 700;
      color: ${theme.primary};
    }
    
    /* Professional Summary Card */
    .summary-card {
      background: white;
      padding: 12pt;
      border-radius: 8pt;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      border: 1pt solid rgba(0,0,0,0.05);
    }
    
    .summary-text {
      font-size: 10pt;
      line-height: 1.6;
      color: #2d3748;
    }
    
    /* Experience timeline matching preview */
    .experience-timeline {
      position: relative;
      padding-left: 12pt;
      margin-bottom: 12pt;
    }
    
    .experience-item {
      position: relative;
      margin-bottom: 12pt;
      padding: 10pt;
      border-radius: 6pt;
      background: linear-gradient(to right, ${theme.accent}08, ${theme.primary}08);
      border-left: 2pt solid ${theme.accent}30;
    }
    
    .experience-item::before {
      content: '';
      position: absolute;
      left: -21pt;
      top: 16pt;
      width: 12pt;
      height: 12pt;
      background: ${theme.accent};
      border-radius: 50%;
      border: 2pt solid white;
      box-shadow: 0 0 0 2pt ${theme.accent}30;
    }
    
    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8pt;
    }
    
    .experience-title {
      font-size: 12pt;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 2pt;
    }
    
    .experience-company {
      font-size: 11pt;
      font-weight: 600;
      color: ${theme.accent};
    }
    
    .experience-duration {
      background: ${theme.accent}10;
      color: ${theme.accent};
      padding: 4pt 8pt;
      border-radius: 12pt;
      font-size: 8pt;
      font-weight: 600;
      border: 1pt solid ${theme.accent}20;
    }
    
    .achievements {
      list-style: none;
      margin-top: 8pt;
    }
    
    .achievement {
      margin-bottom: 6pt;
      font-size: 9pt;
      line-height: 1.5;
      display: flex;
      align-items: flex-start;
      gap: 8pt;
      padding: 6pt 8pt;
      background: rgba(255,255,255,0.5);
      border-radius: 6pt;
    }
    
    .achievement::before {
      content: '';
      width: 12pt;
      height: 12pt;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 2pt;
      position: relative;
    }
    
    .achievement::after {
      content: '↗';
      position: absolute;
      left: 3pt;
      top: 2pt;
      color: white;
      font-size: 6pt;
      font-weight: bold;
    }
    
    /* Skills section matching preview exactly */
    .skills-section {
      background: white;
      padding: 12pt;
      border-radius: 8pt;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      border: 1pt solid rgba(0,0,0,0.05);
      margin-bottom: 12pt;
    }
    
    .skill-item {
      margin-bottom: 12pt;
    }
    
    .skill-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4pt;
    }
    
    .skill-name {
      font-weight: 600;
      color: #1a202c;
      font-size: 9pt;
    }
    
    .skill-percentage {
      font-size: 8pt;
      color: #6b7280;
    }
    
    .skill-bar {
      height: 4pt;
      background: #e5e7eb;
      border-radius: 2pt;
      overflow: hidden;
    }
    
    .skill-progress {
      height: 100%;
      background: linear-gradient(90deg, ${theme.primary}, ${theme.accent});
      border-radius: 2pt;
    }
    
    /* Skills overview stats matching preview */
    .skills-overview {
      margin-bottom: 12pt;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8pt;
    }
    
    .stat-item {
      text-align: center;
      padding: 8pt;
      border-radius: 6pt;
      background: ${theme.primary}08;
    }
    
    .stat-number {
      font-size: 18pt;
      font-weight: 700;
      color: ${theme.primary};
    }
    
    .stat-label {
      font-size: 8pt;
      color: #6b7280;
      margin-top: 2pt;
    }
    
    /* Education section */
    .education-section {
      background: white;
      padding: 12pt;
      border-radius: 8pt;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      border: 1pt solid rgba(0,0,0,0.05);
    }
    
    .education-item {
      padding: 10pt;
      border-radius: 6pt;
      margin-bottom: 6pt;
      background: linear-gradient(to right, ${theme.primary}08, ${theme.accent}08);
      border: 1pt solid ${theme.primary}10;
    }
    
    .education-degree {
      font-weight: 700;
      color: #1a202c;
      font-size: 11pt;
      margin-bottom: 2pt;
    }
    
    .education-institution {
      font-weight: 600;
      color: ${theme.accent};
      font-size: 10pt;
      margin-bottom: 2pt;
    }
    
    .education-year {
      font-size: 8pt;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header exactly matching enhanced preview -->
    <div class="header">
      <div class="header-content">
        <h1>${resumeData.name || 'Enhanced Resume'}</h1>
        <div class="title">${resumeData.title || 'Professional'}</div>
        
        <div class="contact-info">
          <div class="title">${resumeData.email || 'email@example.com'} • ${resumeData.phone || '+1 (555) 123-4567'}</div>
          <div class="title">${resumeData.location || 'City, Country'}</div>
          <div style="height: 12px;"></div> <!-- Spacer to maintain header height -->
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- Main Content -->
      <div class="left-column">
        <!-- Professional Summary -->
        <div class="section">
          <div class="section-header">
            <div class="section-icon">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3 class="section-title">Professional Summary</h3>
          </div>
          <div class="summary-card">
            <p class="summary-text">${resumeData.summary || 'Dynamic and results-driven professional with extensive experience in delivering innovative solutions and driving organizational success. Proven track record of leadership, strategic thinking, and exceptional problem-solving abilities.'}</p>
          </div>
        </div>

        <!-- Professional Experience -->
        ${resumeData.experience && resumeData.experience.length > 0 ? `
        <div class="section">
          <div class="section-header">
            <div class="section-icon">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 2v4l-3 2 3 2v4"/>
                <path d="M16 6l3-2-3-2"/>
                <path d="M8 10l3 2 3-2"/>
                <path d="M8 14l3 2 3-2"/>
                <path d="M8 18l3 2 3-2"/>
              </svg>
            </div>
            <h3 class="section-title">Professional Experience</h3>
          </div>
          
          <div class="experience-timeline">
            ${resumeData.experience.map((exp: any) => `
            <div class="experience-item">
              <div class="experience-header">
                <div>
                  <div class="experience-title">${exp.title || 'Position Title'}</div>
                  <div class="experience-company">${exp.company || 'Company Name'}</div>
                </div>
                <div class="experience-duration">${exp.duration || 'Date Range'}</div>
              </div>
              
              ${exp.achievements && exp.achievements.length > 0 ? `
              <ul class="achievements">
                ${exp.achievements.map((achievement: string) => `
                <li class="achievement">${achievement}</li>
                `).join('')}
              </ul>
              ` : `
              <ul class="achievements">
                <li class="achievement">Delivered exceptional results and exceeded performance expectations</li>
                <li class="achievement">Collaborated effectively with cross-functional teams to achieve strategic objectives</li>
                <li class="achievement">Implemented innovative solutions that improved operational efficiency</li>
              </ul>
              `}
            </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
      </div>

      <!-- Sidebar -->
      <div class="sidebar">
        <!-- Skills Overview Stats -->
        <div class="skills-overview">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">${resumeData.skills ? resumeData.skills.length : '12'}</div>
              <div class="stat-label">Total Skills</div>
            </div>
            <div class="stat-item" style="background: ${theme.accent}08;">
              <div class="stat-number" style="color: ${theme.accent};">${resumeData.experience ? resumeData.experience.length : '3'}</div>
              <div class="stat-label">Work Experiences</div>
            </div>
            <div class="stat-item" style="background: ${theme.secondary}08;">
              <div class="stat-number" style="color: ${theme.secondary};">${resumeData.education ? resumeData.education.length : '1'}</div>
              <div class="stat-label">Educational Qualifications</div>
            </div>
          </div>
        </div>

        <!-- Skills -->
        <div class="skills-section">
          <div class="section-header">
            <div class="section-icon">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
              </svg>
            </div>
            <h3 class="section-title">Skills Proficiency</h3>
          </div>
          
          ${resumeData.skills && Array.isArray(resumeData.skills) && resumeData.skills.length > 0 ? 
            resumeData.skills.slice(0, 6).map((skill: string) => {
              const proficiency = generateSkillProficiency(skill);
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
            }).join('') :
            `
            <div class="skill-item">
              <div class="skill-header">
                <span class="skill-name">Communication</span>
                <span class="skill-percentage">92%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-progress" style="width: 92%"></div>
              </div>
            </div>
            <div class="skill-item">
              <div class="skill-header">
                <span class="skill-name">Leadership</span>
                <span class="skill-percentage">88%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-progress" style="width: 88%"></div>
              </div>
            </div>
            <div class="skill-item">
              <div class="skill-header">
                <span class="skill-name">Problem Solving</span>
                <span class="skill-percentage">85%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-progress" style="width: 85%"></div>
              </div>
            </div>
            `
          }
        </div>

        <!-- Education -->
        <div class="education-section">
          <div class="section-header">
            <div class="section-icon">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <h3 class="section-title">Education</h3>
          </div>
          ${resumeData.education && resumeData.education.length > 0 ? 
            resumeData.education.map((edu: any) => `
            <div class="education-item">
              <div class="education-degree">${edu.degree || 'Bachelor\'s Degree'}</div>
              <div class="education-institution">${edu.institution || 'University Name'}</div>
              <div class="education-year">${edu.year || 'Year'}</div>
            </div>
            `).join('') :
            `
            <div class="education-item">
              <div class="education-degree">Bachelor's Degree</div>
              <div class="education-institution">University Name</div>
              <div class="education-year">2020</div>
            </div>
            `
          }
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
  }
  
  function generateClassicHTML(resumeData: any, theme: any) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 0.5in; }
    body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #2c3e50; }
    .header { text-align: center; padding: 20pt 0; border-bottom: 2pt solid ${theme.primary}; margin-bottom: 20pt; }
    .header h1 { font-size: 28pt; color: ${theme.primary}; }
    .section { margin-bottom: 24pt; }
    .section-title { font-size: 16pt; font-weight: 700; color: ${theme.primary}; border-bottom: 1pt solid ${theme.primary}30; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${resumeData.name || 'Enhanced Resume'}</h1>
    <div>${resumeData.title || 'Professional'}</div>
    <div>${resumeData.email || 'email@example.com'} | ${resumeData.phone || 'phone'}</div>
  </div>
  <div class="section">
    <h2 class="section-title">PROFESSIONAL SUMMARY</h2>
    <p>${resumeData.summary || 'Professional summary here.'}</p>
  </div>
</body>
</html>`;
  }

  // Use PDFShift as the reliable solution
  const pdfshiftApiKey = Deno.env.get('PDFSHIFT_API_KEY');
  
  if (!pdfshiftApiKey) {
    console.error('PDFShift API key not found');
    throw new Error('PDF generation service not configured');
  }

  console.log("Generating PDF with PDFShift...");
  
  const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`api:${pdfshiftApiKey}`)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: htmlContent,
      format: 'A4',
      margin: '0.5in',
      landscape: false,
      use_print: true
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("PDFShift API error:", response.status, errorText);
    throw new Error(`PDF generation failed: ${response.status} ${errorText}`);
  }

  console.log("PDF generated successfully via PDFShift");
  
  const pdfArrayBuffer = await response.arrayBuffer();
  return new Uint8Array(pdfArrayBuffer);
}


serve(async (req) => {
  console.log("PDF Generation function started");
  
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting PDF resume generation...");

    const requestBody = await req.json();
    const { paymentId, enhancedContent, templateId, themeId, fileName } = requestBody;
    console.log("Request data:", { paymentId, hasEnhancedContent: !!enhancedContent, themeId, fileName });

    // If enhanced content is provided directly, use it (preferred method)
    if (enhancedContent) {
      console.log("Using provided enhanced content directly");
      const finalThemeId = themeId || 'navy';
      const finalFileName = fileName || 'enhanced-resume';
      
      // Generate PDF using provided data
      const finalTemplateId = templateId || 'modern';
      const pdfBytes = await generatePDFWithPDFShift(enhancedContent, finalTemplateId, finalThemeId);
      
      console.log("PDF generated successfully from direct content, size:", pdfBytes.length, "bytes");
      
      return new Response(pdfBytes, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="enhanced-resume-${finalFileName.replace(/\.[^/.]+$/, "")}.pdf"`,
          'Content-Length': pdfBytes.length.toString(),
        },
      });
    }

    // Fallback: use payment ID to fetch from database
    if (!paymentId) {
      throw new Error("Either enhancedContent or paymentId is required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log("Fallback: Fetching payment details from database...");
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

    console.log("Generating PDF with PDFShift using database content...");
    const finalThemeId = payment.theme_id || 'navy';
    
    // Generate PDF using database content
    const pdfBytes = await generatePDFWithPDFShift(payment.enhanced_content, finalThemeId);
    
    console.log("PDF generated successfully from database, size:", pdfBytes.length, "bytes");
    
    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="enhanced-resume-${payment.file_name.replace(/\.[^/.]+$/, "")}.pdf"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    });

  } catch (error) {
    console.error("Error in PDF generation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate PDF",
        details: error instanceof Error ? error.stack : "Unknown error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});