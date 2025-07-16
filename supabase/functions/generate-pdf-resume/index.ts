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
  // Legacy themes for backward compatibility
  emerald: { primary: '#10b981', secondary: '#34d399', accent: '#6ee7b7' },
  purple: { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#c4b5fd' },
  rose: { primary: '#f43f5e', secondary: '#fb7185', accent: '#fda4af' },
  orange: { primary: '#f97316', secondary: '#fb923c', accent: '#fdba74' }
};

function generatePrintableHTML(resumeData: any, themeId: string = 'navy'): string {
  const theme = colorThemes[themeId as keyof typeof colorThemes] || colorThemes.navy;
  
  // Generate realistic skill proficiency percentages
  const generateSkillProficiency = (skill: string) => {
    const basePercentages = [78, 81, 85, 90, 88, 92, 79, 83, 87, 91];
    const index = skill.length % basePercentages.length;
    return basePercentages[index];
  };
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enhanced Resume - ${resumeData.name}</title>
  <style>
    @page {
      size: A4;
      margin: 1in;
    }
    
    @media print {
      html, body {
        width: 210mm;
        height: 297mm;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
      
      .container {
        width: 100%;
        max-width: none;
        margin: 0;
        padding: 1in;
        box-shadow: none;
      }
    }
    
    /* Screen styles for responsive viewing */
    @media screen {
      html {
        width: 100%;
        height: auto;
        background: #f5f5f5;
      }
      
      body {
        font-family: 'Times New Roman', 'Georgia', serif;
        line-height: 1.6;
        color: #000000;
        background: #f5f5f5;
        font-size: 12pt;
        width: 100%;
        min-height: 100vh;
        margin: 0;
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
      }
      
      .container {
        max-width: min(95vw, 800px);
        margin: 0 auto;
        background: white;
        width: 100%;
        min-height: auto;
        padding: 1in;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
      }
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    /* Print styles - standard Word document */
    html {
      width: 210mm;
      height: 297mm;
    }
    
    body {
      font-family: 'Times New Roman', 'Georgia', serif;
      line-height: 1.6;
      color: #000000;
      background: white;
      font-size: 12pt;
      width: 210mm;
      min-height: 297mm;
      margin: 0;
      padding: 0;
    }
    
    .container {
      max-width: 100%;
      margin: 0;
      background: white;
      width: 210mm;
      min-height: 297mm;
      padding: 1in;
    }
    
    /* Header styling */
    .header {
      text-align: center;
      margin-bottom: 24pt;
      padding-bottom: 12pt;
      border-bottom: 1pt solid ${theme.primary};
    }
    
    .header h1 {
      font-size: 20pt;
      font-weight: bold;
      color: ${theme.primary};
      margin-bottom: 6pt;
      text-transform: uppercase;
      letter-spacing: 1pt;
    }
    
    .header .title {
      font-size: 14pt;
      color: ${theme.secondary};
      margin-bottom: 12pt;
      font-style: italic;
    }
    
    .contact-info {
      font-size: 11pt;
      color: #333333;
      line-height: 1.4;
    }
    
    .contact-line {
      margin-bottom: 4pt;
    }
    
    /* Section styling */
    .section {
      margin-bottom: 20pt;
      break-inside: avoid;
    }
    
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      color: ${theme.primary};
      margin-bottom: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
      border-bottom: 1pt solid ${theme.primary};
      padding-bottom: 4pt;
    }
    
    /* Summary styling */
    .summary-text {
      font-size: 11pt;
      line-height: 1.6;
      text-align: justify;
      margin-bottom: 12pt;
    }
    
    /* Experience styling */
    .experience-item {
      margin-bottom: 16pt;
      break-inside: avoid;
    }
    
    .experience-header {
      margin-bottom: 6pt;
    }
    
    .experience-title {
      font-size: 13pt;
      font-weight: bold;
      color: #000000;
      display: inline;
    }
    
    .experience-company {
      font-size: 12pt;
      color: ${theme.secondary};
      font-weight: 600;
      display: inline;
      margin-left: 8pt;
    }
    
    .experience-duration {
      font-size: 11pt;
      color: #666666;
      float: right;
      font-style: italic;
    }
    
    .achievements {
      list-style: disc;
      margin-left: 20pt;
      margin-top: 6pt;
    }
    
    .achievement {
      margin-bottom: 4pt;
      font-size: 11pt;
      line-height: 1.4;
    }
    
    /* Skills styling */
    .skills-container {
      columns: 2;
      column-gap: 30pt;
      margin-bottom: 12pt;
    }
    
    .skill-item {
      break-inside: avoid;
      margin-bottom: 4pt;
      font-size: 11pt;
      position: relative;
      padding-left: 12pt;
    }
    
    .skill-item::before {
      content: "•";
      position: absolute;
      left: 0;
      color: ${theme.primary};
      font-weight: bold;
    }
    
    /* Education styling */
    .education-item {
      margin-bottom: 12pt;
      break-inside: avoid;
    }
    
    .education-degree {
      font-weight: bold;
      color: #000000;
      font-size: 12pt;
      display: inline;
    }
    
    .education-institution {
      color: ${theme.secondary};
      font-size: 12pt;
      display: inline;
      margin-left: 8pt;
    }
    
    .education-year {
      color: #666666;
      font-size: 11pt;
      float: right;
      font-style: italic;
    }
    
    /* Clear floats */
    .clearfix::after {
      content: "";
      display: table;
      clear: both;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>${resumeData.name || 'Enhanced Resume'}</h1>
      <div class="title">${resumeData.title || ''}</div>
      
      <div class="contact-info">
        ${resumeData.email ? `<div class="contact-line">Email: ${resumeData.email}</div>` : ''}
        ${resumeData.phone ? `<div class="contact-line">Phone: ${resumeData.phone}</div>` : ''}
        ${resumeData.location ? `<div class="contact-line">Location: ${resumeData.location}</div>` : ''}
      </div>
    </div>

    <!-- Professional Summary -->
    <div class="section">
      <h2 class="section-title">Professional Summary</h2>
      <p class="summary-text">${resumeData.summary || 'Professional summary not available.'}</p>
    </div>

    <!-- Professional Experience -->
    ${resumeData.experience && resumeData.experience.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Professional Experience</h2>
      
      ${resumeData.experience.map((exp: any) => `
      <div class="experience-item">
        <div class="experience-header clearfix">
          <span class="experience-title">${exp.title || ''}</span>
          <span class="experience-company">${exp.company || ''}</span>
          <span class="experience-duration">${exp.duration || ''}</span>
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

    <!-- Skills -->
    <div class="section">
      <h2 class="section-title">Skills</h2>
      
      <div class="skills-container">
        ${resumeData.skills && Array.isArray(resumeData.skills) && resumeData.skills.length > 0 ? 
          resumeData.skills.map((skill: string) => `
          <div class="skill-item">${skill}</div>
          `).join('') :
          // Fallback skills if none found
          `
          <div class="skill-item">Communication</div>
          <div class="skill-item">Problem Solving</div>
          <div class="skill-item">Adaptability</div>
          <div class="skill-item">Team Work</div>
          <div class="skill-item">Leadership</div>
          <div class="skill-item">Project Management</div>
          `
        }
      </div>
    </div>

    <!-- Education -->
    ${resumeData.education && resumeData.education.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Education</h2>
      ${resumeData.education.map((edu: any) => `
      <div class="education-item clearfix">
        <span class="education-degree">${edu.degree || ''}</span>
        <span class="education-institution">${edu.institution || ''}</span>
        <span class="education-year">${edu.year || ''}</span>
      </div>
      `).join('')}
    </div>
    ` : ''}
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  console.log("PDF Generation function started");
  
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting PDF resume generation...");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log("Supabase client initialized");

    const requestBody = await req.json();
    const { paymentId } = requestBody;
    console.log("Payment ID:", paymentId);

    if (!paymentId) {
      throw new Error("Payment ID is required");
    }

    // Get payment details
    console.log("Fetching payment details...");
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

    console.log("Generating printable HTML...");
    const themeId = payment.theme_id || 'navy';
    
    // Debug: Log the enhanced content structure
    console.log("Enhanced content structure:", JSON.stringify(payment.enhanced_content, null, 2));
    console.log("Skills data:", payment.enhanced_content?.skills || 'No skills found');
    
    const htmlContent = generatePrintableHTML(payment.enhanced_content, themeId);
    
    console.log("Generated HTML content for PDF printing");
    
    // Return HTML that will auto-print as PDF
    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
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