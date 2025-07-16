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

function generatePrintableHTML(resumeData: any, themeId: string = 'navy'): string {
  const theme = colorThemes[themeId as keyof typeof colorThemes] || colorThemes.navy;
  
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
      margin: 0.5in;
      @top-center {
        content: "${resumeData.name} - Enhanced Resume";
      }
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
    }
    
    .container {
      max-width: 100%;
      margin: 0;
      background: white;
    }
    
    .header {
      background: linear-gradient(135deg, ${theme.primary}, ${theme.accent});
      color: white;
      padding: 20pt;
      margin-bottom: 15pt;
      border-radius: 5pt;
    }
    
    .header h1 {
      font-size: 24pt;
      font-weight: bold;
      margin-bottom: 5pt;
      line-height: 1.2;
    }
    
    .header .title {
      font-size: 16pt;
      margin-bottom: 15pt;
      opacity: 0.9;
    }
    
    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10pt;
    }
    
    .contact-item {
      font-size: 10pt;
      opacity: 0.9;
    }
    
    .main-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20pt;
    }
    
    .section {
      margin-bottom: 20pt;
      break-inside: avoid;
    }
    
    .section-title {
      font-size: 16pt;
      font-weight: bold;
      color: ${theme.primary};
      margin-bottom: 10pt;
      padding-bottom: 5pt;
      border-bottom: 2pt solid ${theme.primary};
    }
    
    .summary-text {
      font-size: 11pt;
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
      position: relative;
      padding-left: 12pt;
    }
    
    .achievement:before {
      content: "▶";
      position: absolute;
      left: 0;
      color: ${theme.accent};
      font-size: 8pt;
      top: 1pt;
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
    
    .skill-category {
      margin-bottom: 10pt;
    }
    
    .skill-category:last-child {
      margin-bottom: 0;
    }
    
    .skill-category-title {
      font-weight: bold;
      color: ${theme.primary};
      margin-bottom: 5pt;
      font-size: 11pt;
    }
    
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 4pt;
    }
    
    .skill-tag {
      background: ${theme.primary}15;
      color: ${theme.primary};
      padding: 2pt 6pt;
      border-radius: 3pt;
      font-size: 9pt;
      border: 1pt solid ${theme.primary}30;
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
    
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8pt;
      margin-bottom: 15pt;
    }
    
    .stat-card {
      text-align: center;
      padding: 10pt;
      border-radius: 5pt;
      border: 1pt solid ${theme.primary}20;
    }
    
    .stat-number {
      font-size: 18pt;
      font-weight: bold;
      color: ${theme.primary};
      margin-bottom: 2pt;
    }
    
    .stat-label {
      color: #666;
      font-size: 8pt;
    }
    
    @media print {
      .main-content {
        grid-template-columns: 1fr;
      }
      
      .sidebar {
        grid-column: 1;
      }
      
      .left-column {
        grid-column: 1;
      }
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
        ${resumeData.skills && resumeData.skills.length > 0 ? `
        <div class="skills-section">
          <h3 class="section-title">Skills</h3>
          
          <div class="skill-category">
            <div class="skills-list">
              ${resumeData.skills.map((skill: string) => `
                <span class="skill-tag">${skill}</span>
              `).join('')}
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Stats Overview -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${resumeData.skills?.length || 0}</div>
            <div class="stat-label">Skills</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${resumeData.experience?.length || 0}</div>
            <div class="stat-label">Experience</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${resumeData.education?.length || 0}</div>
            <div class="stat-label">Education</div>
          </div>
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
  
  <script>
    // Auto-print when opened
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    }
  </script>
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