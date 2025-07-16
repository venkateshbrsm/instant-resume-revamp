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
      margin: 0.75in 0.5in;
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      html, body {
        width: 210mm;
        height: 297mm;
        margin: 0;
        padding: 0;
        overflow: hidden;
        background: white !important;
        -webkit-print-color-adjust: exact !important;
      }
      
      .container {
        width: 100%;
        max-width: none;
        margin: 0;
        padding: 0;
        box-shadow: none;
        border-radius: 0;
        page-break-inside: avoid;
      }
      
      .main-content {
        grid-template-columns: 60% 40%;
        gap: 15pt;
        page-break-inside: avoid;
      }
      
      .header {
        margin-bottom: 15pt;
        padding: 18pt;
        page-break-after: avoid;
        background: linear-gradient(135deg, #3b82f6, #93c5fd) !important;
        color: white !important;
        -webkit-print-color-adjust: exact !important;
      }
      
      .section {
        margin-bottom: 15pt;
        page-break-inside: avoid;
        orphans: 2;
        widows: 2;
      }
      
      .experience-item {
        margin-bottom: 12pt;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      .skills-section {
        margin-bottom: 12pt;
        page-break-inside: avoid;
        background: rgba(59, 130, 246, 0.08) !important;
        -webkit-print-color-adjust: exact !important;
      }
      
      .stats-grid {
        margin-bottom: 12pt;
        page-break-inside: avoid;
      }
      
      .education-item {
        margin-bottom: 8pt;
        page-break-inside: avoid;
        background: rgba(147, 197, 253, 0.08) !important;
        -webkit-print-color-adjust: exact !important;
      }
      
      .skill-bar {
        background: rgba(59, 130, 246, 0.2) !important;
        -webkit-print-color-adjust: exact !important;
      }
      
      .skill-progress {
        background: linear-gradient(90deg, #3b82f6, #93c5fd) !important;
        -webkit-print-color-adjust: exact !important;
      }
      
      .achievement {
        background: rgba(255, 255, 255, 0.8) !important;
        border: 1pt solid rgba(59, 130, 246, 0.1) !important;
        -webkit-print-color-adjust: exact !important;
      }
      
      .achievement-icon {
        background: linear-gradient(135deg, #4ade80, #16a34a) !important;
        -webkit-print-color-adjust: exact !important;
      }
      
      /* Page numbering */
      @page {
        @bottom-right {
          content: "Page " counter(page) " of " counter(pages);
          font-size: 8pt;
          color: #666;
        }
      }
      
      /* Improved spacing for print */
      .section-title {
        font-size: 13pt !important;
        margin-bottom: 10pt !important;
        color: #3b82f6 !important;
        border-bottom: 1.5pt solid #3b82f6 !important;
        -webkit-print-color-adjust: exact !important;
      }
      
      .header h1 {
        font-size: 20pt !important;
        line-height: 1.1 !important;
      }
      
      .header .title {
        font-size: 13pt !important;
      }
      
      .contact-item {
        font-size: 9pt !important;
      }
      
      .summary-text {
        font-size: 10pt !important;
        line-height: 1.4 !important;
      }
      
      .experience-title {
        font-size: 12pt !important;
      }
      
      .experience-company {
        font-size: 11pt !important;
      }
      
      .achievement {
        font-size: 9pt !important;
        margin-bottom: 3pt !important;
        padding: 4pt 6pt !important;
      }
      
      .skill-name {
        font-size: 9pt !important;
      }
      
      .skill-percentage {
        font-size: 8pt !important;
      }
      
      .education-degree {
        font-size: 10pt !important;
      }
      
      .education-institution {
        font-size: 9pt !important;
      }
      
      .education-year {
        font-size: 8pt !important;
      }
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    /* Screen styles for responsive viewing */
    @media screen {
      html {
        width: 100%;
        height: auto;
        background: #f5f5f5;
      }
      
      body {
        font-family: 'Arial', 'Helvetica', sans-serif;
        line-height: 1.4;
        color: #2d3748;
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
        max-width: min(95vw, 1200px);
        margin: 0 auto;
        background: white;
        width: 100%;
        min-height: auto;
        padding: 40px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
      }
      
      .main-content {
        grid-template-columns: 1fr 380px;
        gap: 30px;
      }
      
      .header {
        margin: -40px -40px 20px -40px;
        padding: 30px 40px;
      }
      
      .header h1 {
        font-size: 28pt;
      }
      
      .header .title {
        font-size: 16pt;
      }
      
      .section-title {
        font-size: 16pt;
      }
      
      .experience-title {
        font-size: 14pt;
      }
      
      .experience-company {
        font-size: 13pt;
      }
      
      .achievement {
        font-size: 11pt;
      }
      
      .skill-name {
        font-size: 10pt;
      }
      
      .summary-text {
        font-size: 11pt;
      }
      
      /* Responsive breakpoints */
      @media screen and (max-width: 768px) {
        body {
          padding: 10px;
        }
        
        .container {
          padding: 20px;
          max-width: 100%;
        }
        
        .main-content {
          grid-template-columns: 1fr;
          gap: 20px;
        }
        
        .header {
          margin: -20px -20px 15px -20px;
          padding: 20px;
        }
        
        .header h1 {
          font-size: 24pt;
        }
        
        .contact-grid {
          grid-template-columns: 1fr;
        }
      }
    }
    
    /* Print styles - preserve A4 layout */
    html {
      width: 210mm;
      height: 297mm;
    }
    
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      line-height: 1.4;
      color: #2d3748;
      background: white;
      font-size: 11pt;
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
    
    .contact-item.with-bullet::before {
      content: "";
      width: 6pt;
      height: 6pt;
      background: #3b82f6;
      border-radius: 50%;
      flex-shrink: 0;
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
      display: flex;
      align-items: center;
      gap: 6pt;
    }
    
    .section-title::before {
      content: "🎓";
      font-size: 12pt;
    }
    
    .section-title.summary-title::before {
      content: "📝";
    }
    
    .section-title.skills-title::before {
      content: "⚡";
    }
    
    .section-title.experience-title::before {
      content: "💼";
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
      margin-bottom: 4pt;
    }
    
    .achievement-icon {
      flex-shrink: 0;
      width: 16pt;
      height: 16pt;
      background: linear-gradient(135deg, #4ade80, #16a34a);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 1pt;
    }
    
    .achievement-icon::after {
      content: "↗";
      color: white;
      font-size: 10pt;
      font-weight: bold;
      line-height: 1;
    }
    
    .achievement-text {
      flex: 1;
      color: #374151;
      line-height: 1.5;
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
    
    .skill-item:last-child {
      margin-bottom: 0;
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
      transition: width 0.3s ease;
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
      position: relative;
    }
    
    .stat-circle {
      width: 40pt;
      height: 40pt;
      border-radius: 50%;
      background: conic-gradient(${theme.primary} 0deg, ${theme.primary} calc(var(--percentage) * 3.6deg), ${theme.primary}20 calc(var(--percentage) * 3.6deg));
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 5pt;
      position: relative;
    }
    
    .stat-circle::before {
      content: '';
      width: 30pt;
      height: 30pt;
      border-radius: 50%;
      background: white;
      position: absolute;
    }
    
    .stat-number {
      font-size: 12pt;
      font-weight: bold;
      color: ${theme.primary};
      position: relative;
      z-index: 1;
    }
    
    .stat-label {
      color: #666;
      font-size: 8pt;
      margin-top: 2pt;
    }
    
    @media print {
      body {
        width: 210mm !important;
        height: 297mm !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .container {
        width: 210mm !important;
        min-height: 297mm !important;
        margin: 0 !important;
        padding: 0.75in 0.5in !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }
      
      .main-content {
        grid-template-columns: 65% 35% !important;
        gap: 15pt !important;
      }
      
      .header {
        margin: -0.75in -0.5in 12pt -0.5in !important;
        padding: 15pt !important;
      }
      
      .sidebar {
        font-size: 9pt !important;
      }
      
      .left-column {
        grid-column: 1 !important;
      }
      
      .sidebar {
        grid-column: 2 !important;
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
        <div class="contact-item with-bullet">Email: ${resumeData.email || ''}</div>
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
          <h3 class="section-title summary-title">Professional Summary</h3>
          <p class="summary-text">${resumeData.summary || 'Professional summary not available.'}</p>
        </div>

        <!-- Professional Experience -->
        ${resumeData.experience && resumeData.experience.length > 0 ? `
        <div class="section">
          <h3 class="section-title experience-title">Professional Experience</h3>
          
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
              <li class="achievement">
                <div class="achievement-icon"></div>
                <div class="achievement-text">${achievement}</div>
              </li>
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
          <h3 class="section-title skills-title">Skills</h3>
          
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
            // Fallback skills if none found
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
            <div class="skill-item">
              <div class="skill-header">
                <span class="skill-name">Problem Solving</span>
                <span class="skill-percentage">88%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-progress" style="width: 88%"></div>
              </div>
            </div>
            <div class="skill-item">
              <div class="skill-header">
                <span class="skill-name">Adaptability</span>
                <span class="skill-percentage">90%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-progress" style="width: 90%"></div>
              </div>
            </div>
            <div class="skill-item">
              <div class="skill-header">
                <span class="skill-name">Team Work</span>
                <span class="skill-percentage">87%</span>
              </div>
              <div class="skill-bar">
                <div class="skill-progress" style="width: 87%"></div>
              </div>
            </div>
            `
          }
        </div>

        <!-- Stats Overview -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-circle" style="--percentage: ${Math.min(90, ((resumeData.skills?.length || 4) * 15))}">
              <div class="stat-number">${resumeData.skills?.length || 4}</div>
            </div>
            <div class="stat-label">Skills</div>
          </div>
          <div class="stat-card">
            <div class="stat-circle" style="--percentage: ${Math.min(85, ((resumeData.experience?.length || 1) * 30))}">
              <div class="stat-number">${resumeData.experience?.length || 1}</div>
            </div>
            <div class="stat-label">Experience</div>
          </div>
          <div class="stat-card">
            <div class="stat-circle" style="--percentage: ${Math.min(75, ((resumeData.education?.length || 3) * 25))}">
              <div class="stat-number">${resumeData.education?.length || 3}</div>
            </div>
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
    
    // Use a PDF service API instead of Puppeteer (which doesn't work in edge functions)
    console.log("Converting HTML to PDF using external service...");
    
    try {
      const pdfResponse = await fetch('https://api.htmlcsstoimage.com/v1/image', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa('demo-user:demo-password'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          html: htmlContent,
          css: '',
          format: 'pdf',
          width: 794,  // A4 width in pixels at 96 DPI
          height: 1123, // A4 height in pixels at 96 DPI
          device_scale: 2,
          viewport_width: 794,
          viewport_height: 1123
        })
      });

      if (!pdfResponse.ok) {
        console.log("PDF service failed, returning HTML instead");
        // Fallback to HTML with auto-print functionality
        const printableHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Enhanced Resume - ${payment.enhanced_content?.name || 'Resume'}</title>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</head>
<body>
${htmlContent.replace('<!DOCTYPE html>', '').replace(/<html[^>]*>/, '').replace('</html>', '').replace(/<head>[\s\S]*?<\/head>/, '').replace('<body>', '').replace('</body>', '')}
</body>
</html>`;
        
        return new Response(printableHTML, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/html',
            'Content-Disposition': `inline; filename="enhanced-resume-${payment.file_name.replace(/\.[^/.]+$/, "")}.html"`,
          },
        });
      }

      const pdfBuffer = await pdfResponse.arrayBuffer();
      console.log("PDF generated successfully, size:", pdfBuffer.byteLength, "bytes");
      
      return new Response(pdfBuffer, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="enhanced-resume-${payment.file_name.replace(/\.[^/.]+$/, "")}.pdf"`,
        },
      });
      
    } catch (pdfError) {
      console.error("PDF conversion failed:", pdfError);
      console.log("Falling back to HTML with auto-print");
      
      // Enhanced HTML with better print functionality
      const printableHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Enhanced Resume - ${payment.enhanced_content?.name || 'Resume'}</title>
  <style>
    @media screen {
      .print-instructions {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #3b82f6;
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .print-instructions button {
        background: white;
        color: #3b82f6;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        margin-left: 10px;
      }
    }
    @media print {
      .print-instructions {
        display: none !important;
      }
    }
  </style>
  <script>
    function printDocument() {
      window.print();
    }
    window.onload = function() {
      // Auto-print after a short delay
      setTimeout(function() {
        if (confirm('Would you like to print or save this resume as PDF?')) {
          window.print();
        }
      }, 1000);
    };
  </script>
</head>
<body>
  <div class="print-instructions">
    📄 Ready to save as PDF!
    <button onclick="printDocument()">Print/Save PDF</button>
  </div>
${htmlContent.replace('<!DOCTYPE html>', '').replace(/<html[^>]*>/, '').replace('</html>', '').replace(/<head>[\s\S]*?<\/head>/, '').replace('<body>', '').replace('</body>', '')}
</body>
</html>`;
      
      return new Response(printableHTML, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
          'Content-Disposition': `inline; filename="enhanced-resume-${payment.file_name.replace(/\.[^/.]+$/, "")}.html"`,
        },
      });
    }

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