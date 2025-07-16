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
      margin: 0.75in 0.5in;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      line-height: 1.4;
      color: #2d3748;
      background: white;
      font-size: 11pt;
      width: 210mm;
      min-height: 297mm;
    }
    
    .container {
      max-width: 100%;
      margin: 0;
      background: white;
      width: 210mm;
      min-height: 297mm;
      padding: 0.75in 0.5in;
    }
    
    .header {
      background: linear-gradient(135deg, ${theme.primary}, ${theme.accent});
      color: white;
      padding: 20pt;
      margin: -0.75in -0.5in 15pt -0.5in;
      border-radius: 0;
    }
    
    .header h1 {
      font-size: 22pt;
      font-weight: bold;
      margin-bottom: 5pt;
      line-height: 1.2;
    }
    
    .header .title {
      font-size: 14pt;
      margin-bottom: 12pt;
      opacity: 0.9;
    }
    
    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8pt;
      margin-top: 8pt;
    }
    
    .contact-item {
      font-size: 9pt;
      opacity: 0.9;
      display: flex;
      align-items: center;
      gap: 4pt;
    }
    
    .main-content {
      display: grid;
      grid-template-columns: 65% 35%;
      gap: 18pt;
      margin-top: 15pt;
    }
    
    .section {
      margin-bottom: 18pt;
      break-inside: avoid;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      color: ${theme.primary};
      margin-bottom: 8pt;
      padding-bottom: 4pt;
      border-bottom: 1.5pt solid ${theme.primary};
    }
    
    .summary-text {
      font-size: 10pt;
      line-height: 1.5;
      text-align: justify;
    }
    
    .experience-item {
      margin-bottom: 15pt;
      break-inside: avoid;
    }
    
    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8pt;
    }
    
    .experience-title {
      font-size: 13pt;
      font-weight: bold;
      color: #2d3748;
    }
    
    .experience-company {
      font-size: 12pt;
      font-weight: 600;
      color: ${theme.accent};
      margin-top: 2pt;
    }
    
    .experience-duration {
      background: ${theme.accent}20;
      color: ${theme.accent};
      padding: 3pt 8pt;
      border-radius: 3pt;
      font-size: 9pt;
      font-weight: 600;
    }
    
    .achievements {
      list-style: none;
      margin-left: 0;
    }
    
    .achievement {
      margin-bottom: 6pt;
      font-size: 10pt;
      line-height: 1.4;
      display: flex;
      align-items: flex-start;
      gap: 6pt;
      padding: 6pt 8pt;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 6pt;
    }
    
    .achievement::before {
      content: "→";
      color: ${theme.primary};
      font-weight: bold;
      flex-shrink: 0;
    }
    
    .sidebar {
      font-size: 10pt;
    }
    
    .skills-section {
      background: ${theme.primary}08;
      padding: 15pt;
      border-radius: 5pt;
      margin-bottom: 15pt;
      break-inside: avoid;
    }
    
    .skill-item {
      margin-bottom: 8pt;
    }
    
    .skill-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3pt;
    }
    
    .skill-name {
      font-weight: 600;
      color: #2d3748;
      font-size: 9pt;
    }
    
    .skill-percentage {
      font-weight: bold;
      color: ${theme.primary};
      font-size: 9pt;
    }
    
    .skill-bar {
      height: 4pt;
      background: ${theme.primary}20;
      border-radius: 2pt;
      overflow: hidden;
    }
    
    .skill-progress {
      height: 100%;
      background: linear-gradient(90deg, ${theme.primary}, ${theme.accent});
      border-radius: 2pt;
    }
    
    .education-item {
      background: ${theme.accent}08;
      padding: 12pt;
      border-radius: 5pt;
      margin-bottom: 10pt;
      break-inside: avoid;
    }
    
    .education-degree {
      font-weight: bold;
      color: #2d3748;
      font-size: 11pt;
      margin-bottom: 3pt;
    }
    
    .education-institution {
      font-weight: 600;
      color: ${theme.accent};
      margin-bottom: 2pt;
    }
    
    .education-year {
      color: #666;
      font-size: 9pt;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>${resumeData.name || 'Enhanced Resume'}</h1>
      <div class="title">${resumeData.title || ''}</div>
      
      <div class="contact-grid">
        <div class="contact-item">Email: ${resumeData.email || ''}</div>
        <div class="contact-item">Phone: ${resumeData.phone || ''}</div>
        <div class="contact-item">Location: ${resumeData.location || ''}</div>
        <div class="contact-item">Professional Resume</div>
      </div>
    </div>

    <div class="main-content">
      <!-- Main Content -->
      <div class="left-column">
        <!-- Professional Summary -->
        <div class="section">
          <h3 class="section-title">Professional Summary</h3>
          <p class="summary-text">${resumeData.summary || 'Professional summary not available.'}</p>
        </div>

        <!-- Professional Experience -->
        ${resumeData.experience && resumeData.experience.length > 0 ? `
        <div class="section">
          <h3 class="section-title">Professional Experience</h3>
          
          ${resumeData.experience.map((exp: any) => `
          <div class="experience-item">
            <div class="experience-header">
              <div>
                <div class="experience-title">${exp.title || ''}</div>
                <div class="experience-company">${exp.company || ''}</div>
              </div>
              <div class="experience-duration">${exp.duration || ''}</div>
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
        ` : ''}
      </div>

      <!-- Sidebar -->
      <div class="sidebar">
        <!-- Skills -->
        <div class="skills-section">
          <h3 class="section-title">Skills</h3>
          
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
        ${resumeData.education && resumeData.education.length > 0 ? `
        <div class="section">
          <h3 class="section-title">Education</h3>
          ${resumeData.education.map((edu: any) => `
          <div class="education-item">
            <div class="education-degree">${edu.degree || ''}</div>
            <div class="education-institution">${edu.institution || ''}</div>
            <div class="education-year">${edu.year || ''}</div>
          </div>
          `).join('')}
        </div>
        ` : ''}
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