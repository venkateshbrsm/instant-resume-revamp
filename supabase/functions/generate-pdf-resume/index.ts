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

async function generatePDFWithPDFShift(resumeData: any, themeId: string = 'navy'): Promise<Uint8Array> {
  const pdfshiftApiKey = Deno.env.get('PDFSHIFT_API_KEY');
  
  if (!pdfshiftApiKey) {
    throw new Error('PDFShift API key not found');
  }

  const theme = colorThemes[themeId as keyof typeof colorThemes] || colorThemes.navy;
  
  // Generate realistic skill proficiency percentages
  const generateSkillProficiency = (skill: string) => {
    const basePercentages = [78, 81, 85, 90, 88, 92, 79, 83, 87, 91];
    const index = skill.length % basePercentages.length;
    return basePercentages[index];
  };

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enhanced Resume - ${resumeData.name}</title>
  <style>
    @page {
      size: A4;
      margin: 0.5in;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      line-height: 1.4;
      color: #1a202c;
      background: white;
      font-size: 11pt;
      margin: 0;
      padding: 0;
    }
    
    .container {
      max-width: 100%;
      margin: 0;
      background: white;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .header {
      background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 50%, ${theme.accent} 100%);
      background-size: 300% 300%;
      color: white;
      padding: 24pt;
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
      background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%);
      pointer-events: none;
    }
    
    .header-content {
      position: relative;
      z-index: 1;
    }
    
    .header h1 {
      font-size: 28pt;
      font-weight: 800;
      margin-bottom: 6pt;
      line-height: 1.1;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .header .title {
      font-size: 16pt;
      margin-bottom: 16pt;
      opacity: 0.95;
      font-weight: 500;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12pt;
      margin-top: 16pt;
    }
    
    .contact-item {
      font-size: 10pt;
      opacity: 0.95;
      display: flex;
      align-items: center;
      gap: 8pt;
      font-weight: 500;
      background: rgba(255,255,255,0.1);
      padding: 8pt 12pt;
      border-radius: 6pt;
      backdrop-filter: blur(10px);
    }
    
    .icon {
      width: 12pt;
      height: 12pt;
      fill: currentColor;
      flex-shrink: 0;
    }
    
    .main-content {
      display: flex;
      gap: 24pt;
      padding: 24pt;
      flex: 1;
    }
    
    .left-column {
      flex: 1;
    }
    
    .sidebar {
      width: 35%;
      min-width: 250pt;
    }
    
    .section {
      margin-bottom: 24pt;
      break-inside: avoid;
    }
    
    .section-title {
      font-size: 16pt;
      font-weight: 700;
      color: ${theme.primary};
      margin-bottom: 12pt;
      padding: 12pt 16pt;
      background: linear-gradient(135deg, ${theme.primary}15 0%, ${theme.accent}10 100%);
      border-radius: 8pt;
      border-left: 4pt solid ${theme.primary};
      display: flex;
      align-items: center;
      gap: 10pt;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    .summary-card {
      background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
      padding: 20pt;
      border-radius: 12pt;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      border: 1pt solid ${theme.primary}20;
    }
    
    .summary-text {
      font-size: 11pt;
      line-height: 1.6;
      text-align: justify;
      color: #2d3748;
    }
    
    .timeline {
      position: relative;
      margin-left: 0;
    }
    
    .experience-item {
      margin-bottom: 20pt;
      page-break-inside: avoid;
      break-inside: avoid;
      position: relative;
      background: linear-gradient(135deg, #fff 0%, #f9fafb 100%);
      padding: 16pt;
      border-radius: 12pt;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      border: 1pt solid ${theme.primary}15;
      border-left: 4pt solid ${theme.primary};
    }
    
    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12pt;
    }
    
    .experience-title {
      font-size: 14pt;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 4pt;
    }
    
    .experience-company {
      font-size: 12pt;
      font-weight: 600;
      color: ${theme.primary};
      display: flex;
      align-items: center;
      gap: 6pt;
    }
    
    .experience-duration {
      background: linear-gradient(135deg, ${theme.primary}, ${theme.accent});
      color: white;
      padding: 6pt 12pt;
      border-radius: 20pt;
      font-size: 9pt;
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 4pt;
    }
    
    .achievements {
      list-style: none;
      margin-left: 0;
      margin-top: 12pt;
    }
    
    .achievement {
      margin-bottom: 8pt;
      font-size: 10pt;
      line-height: 1.5;
      display: flex;
      align-items: flex-start;
      gap: 10pt;
      padding: 10pt 14pt;
      background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%);
      border-radius: 8pt;
      border-left: 3pt solid ${theme.accent};
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    }
    
    .achievement::before {
      content: "✨";
      flex-shrink: 0;
      font-size: 12pt;
    }
    
    .sidebar {
      font-size: 10pt;
    }
    
    .skills-section {
      background: linear-gradient(135deg, ${theme.primary}12 0%, ${theme.accent}08 100%);
      padding: 20pt;
      border-radius: 12pt;
      margin-bottom: 20pt;
      break-inside: avoid;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      border: 1pt solid ${theme.primary}20;
    }
    
    .skills-header {
      display: flex;
      align-items: center;
      gap: 8pt;
      margin-bottom: 16pt;
    }
    
    .skill-item {
      margin-bottom: 12pt;
      background: rgba(255,255,255,0.7);
      padding: 10pt;
      border-radius: 8pt;
      backdrop-filter: blur(10px);
    }
    
    .skill-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6pt;
    }
    
    .skill-name {
      font-weight: 600;
      color: #1a202c;
      font-size: 10pt;
    }
    
    .skill-percentage {
      font-weight: 700;
      color: ${theme.primary};
      font-size: 9pt;
      background: ${theme.primary}15;
      padding: 2pt 6pt;
      border-radius: 10pt;
    }
    
    .skill-bar {
      height: 6pt;
      background: ${theme.primary}20;
      border-radius: 3pt;
      overflow: hidden;
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
    }
    
    .skill-progress {
      height: 100%;
      background: linear-gradient(90deg, ${theme.primary}, ${theme.accent});
      border-radius: 3pt;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      position: relative;
    }
    
    .skill-progress::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(to bottom, rgba(255,255,255,0.3), transparent);
      border-radius: 3pt 3pt 0 0;
    }
    
    .education-section {
      background: linear-gradient(135deg, ${theme.accent}10 0%, ${theme.primary}08 100%);
      padding: 20pt;
      border-radius: 12pt;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      border: 1pt solid ${theme.accent}20;
    }
    
    .education-item {
      background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
      padding: 16pt;
      border-radius: 10pt;
      margin-bottom: 12pt;
      break-inside: avoid;
      box-shadow: 0 3px 8px rgba(0,0,0,0.05);
      border: 1pt solid ${theme.accent}15;
      position: relative;
    }
    
    .education-item::before {
      content: '🎓';
      position: absolute;
      top: 12pt;
      right: 12pt;
      font-size: 16pt;
      opacity: 0.3;
    }
    
    .education-degree {
      font-weight: 700;
      color: #1a202c;
      font-size: 12pt;
      margin-bottom: 4pt;
    }
    
    .education-institution {
      font-weight: 600;
      color: ${theme.primary};
      margin-bottom: 4pt;
      font-size: 10pt;
    }
    
    .education-year {
      color: #718096;
      font-size: 9pt;
      background: ${theme.accent}15;
      padding: 2pt 8pt;
      border-radius: 10pt;
      display: inline-block;
    }
    
    .stats-overview {
      background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%);
      color: white;
      padding: 16pt;
      border-radius: 12pt;
      margin-bottom: 20pt;
      box-shadow: 0 6px 16px rgba(0,0,0,0.15);
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12pt;
      text-align: center;
    }
    
    .stat-item {
      background: rgba(255,255,255,0.15);
      padding: 10pt;
      border-radius: 8pt;
      backdrop-filter: blur(10px);
    }
    
    .stat-number {
      font-size: 16pt;
      font-weight: 700;
      display: block;
    }
    
    .stat-label {
      font-size: 8pt;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <h1>${resumeData.name || 'Enhanced Resume'}</h1>
        <div class="title">${resumeData.title || 'Professional'}</div>
        
        <div class="contact-grid">
          <div class="contact-item">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            ${resumeData.email || 'email@example.com'}
          </div>
          <div class="contact-item">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            ${resumeData.phone || '+1 (555) 123-4567'}
          </div>
          <div class="contact-item">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            ${resumeData.location || 'City, Country'}
          </div>
          <div class="contact-item">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Enhanced Resume
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- Main Content -->
      <div class="left-column">
        <!-- Professional Summary -->
        <div class="section">
          <h3 class="section-title">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Professional Summary
          </h3>
          <div class="summary-card">
            <p class="summary-text">${resumeData.summary || 'Dynamic and results-driven professional with extensive experience in delivering innovative solutions and driving organizational success. Proven track record of leadership, strategic thinking, and exceptional problem-solving abilities.'}</p>
          </div>
        </div>

        <!-- Professional Experience -->
        ${resumeData.experience && resumeData.experience.length > 0 ? `
        <div class="section">
          <h3 class="section-title">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 7h-9"/>
              <path d="M14 17H5"/>
              <circle cx="17" cy="17" r="3"/>
              <circle cx="7" cy="7" r="3"/>
            </svg>
            Professional Experience
          </h3>
          
          <div class="timeline">
            ${resumeData.experience.map((exp: any) => `
            <div class="experience-item">
              <div class="experience-header">
                <div>
                  <div class="experience-title">${exp.title || 'Position Title'}</div>
                  <div class="experience-company">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      <polyline points="7.5,4.21 12,6.81 16.5,4.21"/>
                      <polyline points="7.5,19.79 7.5,14.6 3,12"/>
                      <polyline points="21,12 16.5,14.6 16.5,19.79"/>
                    </svg>
                    ${exp.company || 'Company Name'}
                  </div>
                </div>
                <div class="experience-duration">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  ${exp.duration || 'Date Range'}
                </div>
              </div>
              
              ${exp.achievements && exp.achievements.length > 0 ? `
              <ul class="achievements">
                ${exp.achievements.map((achievement: string) => `
                <li class="achievement">${achievement}</li>
                `).join('')}
              </ul>
              ` : ''}
            </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
      </div>

      <!-- Sidebar -->
      <div class="sidebar">
        <!-- Stats Overview -->
        <div class="stats-overview">
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-number">${resumeData.experience ? resumeData.experience.length : '3'}+</span>
              <span class="stat-label">Years Experience</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${resumeData.skills ? resumeData.skills.length : '12'}+</span>
              <span class="stat-label">Core Skills</span>
            </div>
          </div>
        </div>

        <!-- Skills -->
        <div class="skills-section">
          <h3 class="section-title">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
            </svg>
            Core Skills
          </h3>
          
          ${resumeData.skills && Array.isArray(resumeData.skills) && resumeData.skills.length > 0 ? 
            resumeData.skills.map((skill: string) => {
              const proficiency = generateSkillProficiency(skill);
              return `
              <div class="skill-item">
                <div class="skill-header">
                  <span class="skill-name">${skill}</span>
                  <span class="skill-percentage">${proficiency}%</span>
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
          <h3 class="section-title">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            Education
          </h3>
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

  // Call PDFShift API
  console.log("Calling PDFShift API to generate PDF...");
  
  const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`api:${pdfshiftApiKey}`)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: htmlContent,
      format: 'A4',
      margin: '0.75in 0.5in',
      landscape: false,
      use_print: true
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("PDFShift API error:", response.status, errorText);
    throw new Error(`PDFShift API error: ${response.status} ${errorText}`);
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
    const { paymentId, enhancedContent, themeId, fileName } = requestBody;
    console.log("Request data:", { paymentId, hasEnhancedContent: !!enhancedContent, themeId, fileName });

    // If enhanced content is provided directly, use it (preferred method)
    if (enhancedContent) {
      console.log("Using provided enhanced content directly");
      const finalThemeId = themeId || 'navy';
      const finalFileName = fileName || 'enhanced-resume';
      
      // Generate PDF using provided data
      const pdfBytes = await generatePDFWithPDFShift(enhancedContent, finalThemeId);
      
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