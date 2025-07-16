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
    /* Print-specific styles */
    @page {
      size: A4;
      margin: 0.5in;
      @bottom-right {
        content: counter(page) " / " counter(pages);
        font-size: 9pt;
        color: #666;
      }
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
        font-size: 11pt;
        line-height: 1.3;
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
      
      .header {
        margin-bottom: 15pt;
        padding: 20pt 0;
        page-break-after: avoid;
      }
      
      .main-content {
        display: grid;
        grid-template-columns: 65% 35%;
        gap: 15pt;
        page-break-inside: avoid;
      }
      
      .section {
        margin-bottom: 12pt;
        page-break-inside: avoid;
      }
      
      .section-title {
        page-break-after: avoid;
        margin-bottom: 8pt;
      }
      
      .experience-item {
        margin-bottom: 10pt;
        page-break-inside: avoid;
      }
      
      .skills-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8pt;
      }
      
      .stat-card {
        margin-bottom: 8pt;
      }
      
      /* Force colors in print */
      .header {
        background: ${theme.primary} !important;
        color: white !important;
      }
      
      .section-title {
        color: ${theme.primary} !important;
        border-bottom: 1pt solid ${theme.primary} !important;
      }
      
      .skill-progress {
        background: ${theme.primary} !important;
      }
      
      .stat-circle {
        border: 2pt solid ${theme.primary} !important;
      }
    }
    
    /* Base styles */
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
        background: #f8fafc;
        scroll-behavior: smooth;
      }
      
      body {
        font-family: 'Segoe UI', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif;
        line-height: 1.5;
        color: #1a202c;
        background: #f8fafc;
        font-size: 14px;
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
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
        border-radius: 12px;
        border: 1px solid rgba(0, 0, 0, 0.05);
        animation: fade-in 0.6s ease-out;
      }
      
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      /* Responsive grid layout */
      .main-content {
        display: grid;
        grid-template-columns: 1fr 380px;
        gap: 40px;
        margin-top: 30px;
      }
      
      /* Header styling */
      .header {
        background: linear-gradient(135deg, ${theme.primary}, ${theme.secondary});
        margin: -40px -40px 0 -40px;
        padding: 40px;
        color: white;
        border-radius: 12px 12px 0 0;
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
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        opacity: 0.1;
      }
      
      .header h1 {
        font-size: clamp(24px, 4vw, 36px);
        font-weight: 700;
        margin-bottom: 8px;
        position: relative;
        z-index: 1;
      }
      
      .header .title {
        font-size: clamp(16px, 2.5vw, 20px);
        font-weight: 400;
        margin-bottom: 20px;
        opacity: 0.95;
        position: relative;
        z-index: 1;
      }
      
      .contact-info {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        position: relative;
        z-index: 1;
      }
      
      .contact-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        opacity: 0.9;
      }
      
      /* Section styling */
      .section {
        margin-bottom: 30px;
      }
      
      .section-title {
        font-size: clamp(18px, 3vw, 22px);
        font-weight: 600;
        color: ${theme.primary};
        margin-bottom: 20px;
        padding-bottom: 8px;
        border-bottom: 2px solid ${theme.accent};
        position: relative;
      }
      
      .section-title::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 40px;
        height: 2px;
        background: ${theme.primary};
      }
      
      /* Typography responsive sizing */
      .summary-text {
        font-size: clamp(14px, 2vw, 16px);
        line-height: 1.6;
        color: #4a5568;
      }
      
      .experience-title {
        font-size: clamp(16px, 2.5vw, 18px);
        font-weight: 600;
        color: ${theme.primary};
      }
      
      .experience-company {
        font-size: clamp(14px, 2vw, 16px);
        color: #718096;
        margin: 4px 0;
      }
      
      .experience-duration {
        font-size: clamp(12px, 1.8vw, 14px);
        color: #a0aec0;
      }
      
      .achievement {
        font-size: clamp(13px, 1.9vw, 15px);
        line-height: 1.5;
        margin: 8px 0;
        color: #4a5568;
      }
      
      /* Mobile-first responsive breakpoints */
      @media screen and (max-width: 1024px) {
        .main-content {
          grid-template-columns: 1fr 300px;
          gap: 30px;
        }
      }
      
      @media screen and (max-width: 768px) {
        body {
          padding: 10px;
        }
        
        .container {
          padding: 20px;
          max-width: 100%;
          border-radius: 8px;
        }
        
        .main-content {
          grid-template-columns: 1fr;
          gap: 25px;
        }
        
        .header {
          margin: -20px -20px 0 -20px;
          padding: 25px 20px;
          border-radius: 8px 8px 0 0;
        }
        
        .contact-info {
          gap: 15px;
        }
        
        .contact-item {
          font-size: 12px;
        }
        
        .section {
          margin-bottom: 25px;
        }
      }
      
      @media screen and (max-width: 480px) {
        body {
          padding: 8px;
        }
        
        .container {
          padding: 16px;
        }
        
        .header {
          margin: -16px -16px 0 -16px;
          padding: 20px 16px;
        }
        
        .contact-info {
          flex-direction: column;
          gap: 8px;
        }
        
        .section {
          margin-bottom: 20px;
        }
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
    const { paymentId, isPreview, resumeData, themeId: requestThemeId } = requestBody;
    console.log("Payment ID:", paymentId);
    console.log("Is Preview:", isPreview);

    let enhancedContent;
    let themeId = requestThemeId || 'navy';

    if (isPreview && resumeData) {
      // Handle preview request with provided resume data
      console.log("Generating preview with provided resume data");
      enhancedContent = resumeData;
    } else {
      // Handle regular payment-based request
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

      enhancedContent = payment.enhanced_content;
      themeId = payment.theme_id || 'navy';
    }

    console.log("Generating printable HTML...");
    
    // Debug: Log the enhanced content structure
    console.log("Enhanced content structure:", JSON.stringify(enhancedContent, null, 2));
    console.log("Skills data:", enhancedContent?.skills || 'No skills found');
    
    const htmlContent = generatePrintableHTML(enhancedContent, themeId);
    
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