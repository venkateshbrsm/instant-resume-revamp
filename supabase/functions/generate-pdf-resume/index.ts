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
    creative: () => generateCreativeHTML(resumeData, theme), // Use creative template
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
      page-break-inside: avoid;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      text-decoration: none !important;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    /* Page break rules for printer-friendly output */
    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
      break-after: avoid;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    .section, .header, .content-section, .contact-info, .skills-grid, .experience-item, .education-item {
      page-break-inside: avoid;
      break-inside: avoid;
      orphans: 3;
      widows: 3;
    }
    
    .skills-item, .skill-bar, .contact-item {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    /* Avoid breaks right after headings */
    h1:not(:last-child), h2:not(:last-child), h3:not(:last-child) {
      page-break-after: avoid;
      break-after: avoid;
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
       page-break-inside: avoid;
       break-inside: avoid;
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
       page-break-inside: avoid;
       break-inside: avoid;
     }
    
     .left-column {
       space-y: 12pt;
       page-break-inside: avoid;
       break-inside: avoid;
     }
     
     .sidebar {
       space-y: 12pt;
       page-break-inside: avoid;
       break-inside: avoid;
     }
    
     .section {
       margin-bottom: 12pt;
       break-inside: avoid;
       page-break-inside: avoid;
       break-inside: avoid;
     }
    
     /* Section titles with gradient icons matching preview */
     .section-header {
       display: flex;
       align-items: center;
       gap: 6pt;
       margin-bottom: 8pt;
       page-break-inside: avoid;
       break-inside: avoid;
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
       page-break-inside: avoid;
       break-inside: avoid;
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
       page-break-inside: avoid;
       break-inside: avoid;
     }
    
     .experience-item {
       position: relative;
       margin-bottom: 12pt;
       padding: 10pt;
       border-radius: 6pt;
       background: linear-gradient(to right, ${theme.accent}08, ${theme.primary}08);
       border-left: 2pt solid ${theme.accent}30;
       page-break-inside: avoid;
       break-inside: avoid;
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
       page-break-inside: avoid;
       break-inside: avoid;
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
       page-break-inside: avoid;
       break-inside: avoid;
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
       page-break-inside: avoid;
       break-inside: avoid;
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
    
    /* Skills section matching preview with progress bars */
    .skills-section {
      background: white;
      padding: 12pt;
      border-radius: 8pt;
      box-shadow: 0 2px 8pt rgba(0,0,0,0.05);
      border: 1pt solid rgba(0,0,0,0.05);
      margin-bottom: 12pt;
    }
    
     .skill-item {
       margin-bottom: 12pt;
       page-break-inside: avoid;
       break-inside: avoid;
     }
    
     .skill-header {
       display: flex;
       justify-content: space-between;
       align-items: center;
       margin-bottom: 4pt;
       page-break-inside: avoid;
       break-inside: avoid;
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
    
    /* Stats cards matching preview */
     .stats-grid {
       display: grid;
       grid-template-columns: 1fr;
       gap: 8pt;
       page-break-inside: avoid;
       break-inside: avoid;
     }
    
     .stat-item {
       text-align: center;
       padding: 8pt;
       border-radius: 6pt;
       background: ${theme.primary}08;
       page-break-inside: avoid;
       break-inside: avoid;
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
    
    /* Education section matching preview */
     .education-section {
       background: white;
       padding: 12pt;
       border-radius: 8pt;
       box-shadow: 0 2px 8pt rgba(0,0,0,0.05);
       border: 1pt solid rgba(0,0,0,0.05);
       page-break-inside: avoid;
       break-inside: avoid;
     }
    
     .education-item {
       padding: 10pt;
       border-radius: 6pt;
       margin-bottom: 6pt;
       background: linear-gradient(to right, ${theme.primary}08, ${theme.accent}08);
       border: 1pt solid ${theme.primary}10;
       page-break-inside: avoid;
       break-inside: avoid;
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
    <div class="header">
      <div class="header-content">
        <h1>${resumeData.name || 'Enhanced Resume'}</h1>
        <div class="title">${resumeData.title || 'Professional'}</div>
        <div class="contact-grid">
          <div class="contact-item">
            <span>📧</span>
            <span>${resumeData.email || 'email@example.com'}</span>
          </div>
          <div class="contact-item">
            <span>📱</span>
            <span>${resumeData.phone || '+1 (555) 123-4567'}</span>
          </div>
          <div class="contact-item">
            <span>📍</span>
            <span>${resumeData.location || 'City, Country'}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="left-column">
        <div class="section">
          <div class="section-header">
            <div class="section-icon">👤</div>
            <h3 class="section-title">Professional Summary</h3>
          </div>
          <div class="summary-card">
            <p class="summary-text">${resumeData.summary || 'Dynamic and results-driven professional with extensive experience in delivering innovative solutions and driving organizational success.'}</p>
          </div>
        </div>

        ${resumeData.experience && resumeData.experience.length > 0 ? `
        <div class="section">
          <div class="section-header">
            <div class="section-icon">💼</div>
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
                ${exp.achievements.map((achievement: string) => `<li class="achievement">${achievement}</li>`).join('')}
              </ul>
              ` : `
              <ul class="achievements">
                <li class="achievement">Delivered exceptional results and exceeded performance expectations</li>
                <li class="achievement">Collaborated effectively with cross-functional teams to achieve strategic objectives</li>
              </ul>
              `}
            </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
      </div>

      <div class="sidebar">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">${resumeData.skills ? resumeData.skills.length : '12'}</div>
            <div class="stat-label">Total Skills</div>
          </div>
          <div class="stat-item" style="background: ${theme.accent}08;">
            <div class="stat-number" style="color: ${theme.accent};">${resumeData.experience ? resumeData.experience.length : '3'}</div>
            <div class="stat-label">Work Experiences</div>
          </div>
        </div>

        <div class="skills-section">
          <div class="section-header">
            <div class="section-icon">⚡</div>
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
            `
          }
        </div>

        <div class="education-section">
          <div class="section-header">
            <div class="section-icon">🎓</div>
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enhanced Resume - ${resumeData.name}</title>
  <style>
    @page { 
      size: A4; 
      margin: 0.5in; 
      page-break-inside: avoid;
    }
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
      text-decoration: none !important;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    /* Page break rules for printer-friendly output */
    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
      break-after: avoid;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    .section, .header, .content-section, .contact-info, .skills-grid, .experience-item, .education-item {
      page-break-inside: avoid;
      break-inside: avoid;
      orphans: 3;
      widows: 3;
    }
    
    .skills-item, .skill-bar, .contact-item {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    /* Avoid breaks right after headings */
    h1:not(:last-child), h2:not(:last-child), h3:not(:last-child) {
      page-break-after: avoid;
      break-after: avoid;
    }
    
    body {
      font-family: 'Times New Roman', 'Georgia', serif;
      line-height: 1.6; color: #2c3e50; background: white;
      font-size: 11pt; width: 100%; min-height: auto;
    }
    
     .container { 
       background: white; 
       width: 100%; 
       max-width: none; 
       page-break-inside: avoid;
       break-inside: avoid;
     }
    
    .header {
      text-align: center; padding: 20pt 0; border-bottom: 2pt solid ${theme.primary};
      margin-bottom: 20pt;
    }
    
    .header h1 { font-size: 28pt; font-weight: 700; margin-bottom: 8pt; color: ${theme.primary}; }
    .header .title { font-size: 16pt; margin-bottom: 12pt; color: #2c3e50; font-weight: 500; }
    .header .contact { font-size: 11pt; color: #34495e; }
    
     .section { 
       margin-bottom: 24pt;
       page-break-inside: avoid;
       break-inside: avoid;
     }
    .section-title { 
      font-size: 16pt; font-weight: 700; color: ${theme.primary}; 
      margin-bottom: 12pt; padding-bottom: 4pt; 
      border-bottom: 1pt solid ${theme.primary}30;
    }
    
    .summary { font-size: 12pt; line-height: 1.6; color: #2c3e50; text-align: justify; }
    
     .experience-item { 
       margin-bottom: 16pt;
       page-break-inside: avoid;
       break-inside: avoid;
     }
     .experience-header { 
       margin-bottom: 8pt;
       page-break-inside: avoid;
       break-inside: avoid;
     }
    .experience-title { font-size: 14pt; font-weight: 700; color: #2c3e50; }
    .experience-company { font-size: 12pt; font-weight: 600; color: ${theme.primary}; margin-bottom: 4pt; }
    .experience-duration { font-size: 10pt; color: #7f8c8d; font-style: italic; }
    
     .achievements { 
       margin-top: 8pt; 
       padding-left: 20pt;
       page-break-inside: avoid;
       break-inside: avoid;
     }
     .achievement { 
       margin-bottom: 4pt; 
       font-size: 11pt; 
       line-height: 1.5;
       page-break-inside: avoid;
       break-inside: avoid;
     }
    
    .skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8pt; }
    .skill-item { font-size: 11pt; color: #2c3e50; padding: 4pt; }
    
     .education-item { 
       margin-bottom: 12pt;
       page-break-inside: avoid;
       break-inside: avoid;
     }
    .education-degree { font-weight: 700; color: #2c3e50; font-size: 12pt; }
    .education-institution { font-weight: 600; color: ${theme.primary}; font-size: 11pt; }
    .education-year { font-size: 10pt; color: #7f8c8d; font-style: italic; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${resumeData.name || 'Enhanced Resume'}</h1>
      <div class="title">${resumeData.title || 'Professional'}</div>
      <div class="contact">
        ${resumeData.email || 'email@example.com'} | ${resumeData.phone || '+1 (555) 123-4567'} | ${resumeData.location || 'City, Country'}
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">PROFESSIONAL SUMMARY</h2>
      <p class="summary">${resumeData.summary || 'Experienced professional with a proven track record of delivering high-quality results and driving organizational success through strategic thinking and effective leadership.'}</p>
    </div>

    ${resumeData.experience && resumeData.experience.length > 0 ? `
    <div class="section">
      <h2 class="section-title">PROFESSIONAL EXPERIENCE</h2>
      ${resumeData.experience.map((exp: any) => `
      <div class="experience-item">
        <div class="experience-header">
          <div class="experience-title">${exp.title || 'Position Title'}</div>
          <div class="experience-company">${exp.company || 'Company Name'}</div>
          <div class="experience-duration">${exp.duration || 'Date Range'}</div>
        </div>
        ${exp.achievements && exp.achievements.length > 0 ? `
        <ul class="achievements">
          ${exp.achievements.map((achievement: string) => `<li class="achievement">${achievement}</li>`).join('')}
        </ul>
        ` : `
        <ul class="achievements">
          <li class="achievement">Delivered exceptional results and exceeded performance expectations</li>
          <li class="achievement">Demonstrated strong leadership and collaboration skills</li>
        </ul>
        `}
      </div>
      `).join('')}
    </div>
    ` : ''}

    ${resumeData.skills && resumeData.skills.length > 0 ? `
    <div class="section">
      <h2 class="section-title">CORE COMPETENCIES</h2>
      <div class="skills-grid">
        ${resumeData.skills.map((skill: string) => `<div class="skill-item">• ${skill}</div>`).join('')}
      </div>
    </div>
    ` : ''}

    ${resumeData.education && resumeData.education.length > 0 ? `
    <div class="section">
      <h2 class="section-title">EDUCATION</h2>
      ${resumeData.education.map((edu: any) => `
      <div class="education-item">
        <div class="education-degree">${edu.degree || 'Bachelor\'s Degree'}</div>
        <div class="education-institution">${edu.institution || 'University Name'}</div>
        <div class="education-year">${edu.year || 'Year'}</div>
      </div>
      `).join('')}
    </div>
    ` : ''}
  </div>
</body>
</html>`;
  }

  function generateCreativeHTML(resumeData: any, theme: any) {
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
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    /* Page break rules for printer-friendly output */
    h1, h2, h3, h4, h5, h6 {
      page-break-after: avoid;
      break-after: avoid;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    .section, .header, .content-section, .contact-info, .skills-grid, .experience-item, .education-item, .card {
      page-break-inside: avoid;
      break-inside: avoid;
      orphans: 3;
      widows: 3;
    }
    
    .skills-item, .skill-bar, .contact-item, .experience-card, .summary-card, .education-section, .skills-section {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    /* Avoid breaks right after headings */
    h1:not(:last-child), h2:not(:last-child), h3:not(:last-child) {
      page-break-after: avoid;
      break-after: avoid;
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
       page-break-inside: avoid;
       break-inside: avoid;
     }
    
    /* Creative Header with gradient */
    .header {
      background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 70%, ${theme.secondary} 100%);
      color: white;
      padding: 12pt;
      position: relative;
      overflow: hidden;
      break-inside: avoid;
      page-break-inside: avoid;
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
    
     /* Main content - single column for independent cards */
     .main-content {
       padding: 12pt;
       width: 100%;
       page-break-inside: avoid;
       break-inside: avoid;
     }
     
     .card {
       margin-bottom: 16pt;
       break-inside: avoid;
       page-break-inside: avoid;
       position: relative;
       page-break-inside: avoid;
       break-inside: avoid;
     }
    
    .section {
      margin-bottom: 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    
     /* Creative section headers */
     .section-header {
       display: flex;
       align-items: center;
       gap: 6pt;
       margin-bottom: 8pt;
       page-break-inside: avoid;
       break-inside: avoid;
     }
    
    .section-icon {
      width: 24pt;
      height: 24pt;
      border-radius: 6pt;
      background: linear-gradient(135deg, ${theme.primary}, ${theme.accent});
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
    
     /* Creative summary card */
     .summary-card {
       background: linear-gradient(135deg, ${theme.primary}08, ${theme.accent}15);
       padding: 12pt;
       border-radius: 8pt;
       box-shadow: 0 2px 8pt rgba(0,0,0,0.06);
       border-left: 3pt solid ${theme.accent};
       page-break-inside: avoid;
       break-inside: avoid;
     }
    
    .summary-text {
      font-size: 10pt;
      line-height: 1.6;
      color: #2d3748;
    }
    
     /* Experience items - independent cards */
     .experience-card {
       background: linear-gradient(135deg, ${theme.primary}08, ${theme.accent}15);
       padding: 12pt;
       border-radius: 8pt;
       box-shadow: 0 2px 8pt rgba(0,0,0,0.06);
       border-left: 3pt solid ${theme.accent};
       position: static;
       page-break-inside: avoid;
       break-inside: avoid;
     }
    
     .experience-header {
       display: flex;
       justify-content: space-between;
       align-items: flex-start;
       margin-bottom: 8pt;
       page-break-inside: avoid;
       break-inside: avoid;
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
      background: linear-gradient(135deg, ${theme.accent}, ${theme.secondary});
      color: white;
      padding: 4pt 8pt;
      border-radius: 12pt;
      font-size: 8pt;
      font-weight: 600;
      border: 1pt solid ${theme.accent}20;
    }
    
     .achievements {
       list-style: none;
       margin-top: 8pt;
       page-break-inside: avoid;
       break-inside: avoid;
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
       page-break-inside: avoid;
       break-inside: avoid;
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
    
     /* Creative skills section */
     .skills-section {
       background: linear-gradient(135deg, ${theme.primary}08, ${theme.accent}15);
       padding: 12pt;
       border-radius: 8pt;
       box-shadow: 0 2px 8pt rgba(0,0,0,0.05);
       border-left: 3pt solid ${theme.accent};
       page-break-inside: avoid;
       break-inside: avoid;
     }
    
     .skill-item {
       margin-bottom: 12pt;
       page-break-inside: avoid;
       break-inside: avoid;
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
    
    /* Creative stats */
    .stats-grid {
      display: flex;
      gap: 12pt;
      justify-content: space-between;
    }
    
    .stat-item {
      text-align: center;
      padding: 8pt;
      border-radius: 6pt;
      background: linear-gradient(135deg, ${theme.accent}10, ${theme.secondary}15);
      flex: 1;
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
    
     /* Creative education */
     .education-section {
       background: linear-gradient(135deg, ${theme.secondary}08, ${theme.primary}10);
       padding: 12pt;
       border-radius: 8pt;
       box-shadow: 0 2px 8pt rgba(0,0,0,0.05);
       border-left: 3pt solid ${theme.accent};
       page-break-inside: avoid;
       break-inside: avoid;
     }
    
     .education-item {
       padding: 10pt;
       border-radius: 6pt;
       margin-bottom: 6pt;
       background: rgba(255,255,255,0.8);
       border-left: 2pt solid ${theme.accent}40;
       page-break-inside: avoid;
       break-inside: avoid;
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
    <div class="header">
      <div class="header-content">
        <h1>${resumeData.name || 'Enhanced Resume'}</h1>
        <div class="title">${resumeData.title || 'Creative Professional'}</div>
        <div class="contact-grid">
          <div class="contact-item">
            <span>📧</span>
            <span>${resumeData.email || 'email@example.com'}</span>
          </div>
          <div class="contact-item">
            <span>📱</span>
            <span>${resumeData.phone || '+1 (555) 123-4567'}</span>
          </div>
          <div class="contact-item">
            <span>📍</span>
            <span>${resumeData.location || 'City, Country'}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- Creative Vision Card -->
      <div class="card">
        <div class="section">
          <div class="section-header">
            <div class="section-icon">✨</div>
            <h3 class="section-title">Creative Vision</h3>
          </div>
          <div class="summary-card">
            <p class="summary-text">${resumeData.summary || 'Dynamic creative professional with a passion for innovative design and strategic thinking. Expertise in delivering compelling visual solutions that drive engagement and achieve business objectives.'}</p>
          </div>
        </div>
      </div>

      <!-- Portfolio Stats Card -->
      <div class="card">
        <div class="section">
          <div class="section-header">
            <div class="section-icon">📊</div>
            <h3 class="section-title">Portfolio Stats</h3>
          </div>
          <div class="summary-card">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">${resumeData.skills ? resumeData.skills.length : '12'}</div>
                <div class="stat-label">Creative Skills</div>
              </div>
              <div class="stat-item" style="background: linear-gradient(135deg, ${theme.primary}10, ${theme.accent}15);">
                <div class="stat-number" style="color: ${theme.accent};">${resumeData.experience ? resumeData.experience.length : '3'}</div>
                <div class="stat-label">Projects</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Individual Experience Cards -->
      ${resumeData.experience && resumeData.experience.length > 0 ? 
        resumeData.experience.map((exp: any, index: number) => `
        <div class="card">
          <div class="section">
            <div class="section-header">
              <div class="section-icon">💼</div>
              <h3 class="section-title">${index === 0 ? 'Experience Journey' : 'Professional Experience'}</h3>
            </div>
            <div class="experience-card">
              <div class="experience-header">
                <div>
                  <div class="experience-title">${exp.title || 'Position Title'}</div>
                  <div class="experience-company">${exp.company || 'Company Name'}</div>
                </div>
                <div class="experience-duration">${exp.duration || 'Date Range'}</div>
              </div>
              ${exp.achievements && exp.achievements.length > 0 ? `
              <ul class="achievements">
                ${exp.achievements.map((achievement: string) => `<li class="achievement">${achievement}</li>`).join('')}
              </ul>
              ` : `
              <ul class="achievements">
                <li class="achievement">Delivered exceptional creative solutions and exceeded client expectations</li>
                <li class="achievement">Collaborated effectively with cross-functional teams to achieve strategic objectives</li>
              </ul>
              `}
            </div>
          </div>
        </div>
        `).join('') : ''}

      <!-- Individual Education Cards -->
      ${resumeData.education && resumeData.education.length > 0 ? 
        resumeData.education.map((edu: any, index: number) => `
        <div class="card">
          <div class="section">
            <div class="section-header">
              <div class="section-icon">🎓</div>
              <h3 class="section-title">${index === 0 ? 'Education' : 'Academic Background'}</h3>
            </div>
            <div class="education-section">
              <div class="education-item">
                <div class="education-degree">${edu.degree || 'Bachelor\'s Degree'}</div>
                <div class="education-institution">${edu.institution || 'University Name'}</div>
                <div class="education-year">${edu.year || 'Year'}</div>
              </div>
            </div>
          </div>
        </div>
        `).join('') : ''}

      <!-- Creative Skills Card -->
      ${resumeData.skills && Array.isArray(resumeData.skills) && resumeData.skills.length > 0 ? `
      <div class="card">
        <div class="section">
          <div class="section-header">
            <div class="section-icon">⚡</div>
            <h3 class="section-title">Creative Skills</h3>
          </div>
          <div class="skills-section">
            ${resumeData.skills.slice(0, 8).map((skill: string) => {
              const proficiency = 75 + (skill.length % 20);
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
        </div>
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>`;
  }

  console.log(`Generating PDF with PDFShift for template: ${templateId}, theme: ${themeId}`);
  console.log('HTML content length:', htmlContent.length);

  const API_KEY = Deno.env.get('PDFSHIFT_API_KEY');
  if (!API_KEY) {
    throw new Error('PDFSHIFT_API_KEY not found in environment variables');
  }

  const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(API_KEY + ':')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: htmlContent,
      landscape: false,
      use_print: true,
      format: 'A4',
      margin: '0.25in',
      zoom: 1,
      wait_for: 3000,
      sandbox: false,
      protect: false,
      filename: 'enhanced_resume.pdf',
      // Enhanced page break handling options
      css: `
        @media print {
          * { 
            -webkit-print-color-adjust: exact !important; 
            color-adjust: exact !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .page-break-before { page-break-before: always !important; }
          .page-break-after { page-break-after: always !important; }
          .page-break-avoid { page-break-inside: avoid !important; break-inside: avoid !important; }
          .section, .header, .experience-item, .education-item, .skills-section, .card {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            orphans: 3 !important;
            widows: 3 !important;
          }
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid !important;
            break-after: avoid !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('PDFShift API error:', errorText);
    throw new Error(`PDFShift API failed: ${response.status} ${response.statusText}`);
  }

  const pdfBuffer = await response.arrayBuffer();
  console.log('PDF generated successfully via PDFShift');
  
  return new Uint8Array(pdfBuffer);
}

serve(async (req) => {
  console.log('PDF Generation function started');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting PDF resume generation...');
    
    const { enhancedContent, paymentId, templateId = 'modern', themeId = 'navy', fileName } = await req.json();
    
    console.log('Request data:', {
      paymentId,
      hasEnhancedContent: !!enhancedContent,
      themeId,
      fileName: fileName || `Enhanced_Resume_${Date.now()}`
    });

    let resumeData = enhancedContent;

    // If no enhanced content provided, fetch from payment data
    if (!enhancedContent && paymentId) {
      console.log('Fetching enhanced content from payment data...');
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase configuration');
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: payment, error } = await supabase
        .from('payments')
        .select('enhanced_content')
        .eq('id', paymentId)
        .single();

      if (error) {
        console.error('Error fetching payment data:', error);
        throw new Error('Failed to fetch payment data');
      }

      if (!payment?.enhanced_content) {
        throw new Error('No enhanced content found for this payment');
      }

      resumeData = payment.enhanced_content;
    }

    if (!resumeData) {
      throw new Error('No resume data provided');
    }

    console.log('Using provided enhanced content directly');
    
    // Generate PDF
    console.log('Generating PDF with PDFShift...');
    const pdfBytes = await generatePDFWithPDFShift(resumeData, templateId, themeId);
    
    console.log(`PDF generated successfully from direct content, size: ${pdfBytes.length} bytes`);

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName || `Enhanced_Resume_${Date.now()}`}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error in PDF generation function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate PDF',
        details: error.message 
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});