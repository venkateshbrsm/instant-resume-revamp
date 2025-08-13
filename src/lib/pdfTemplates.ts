// PDF template generators for different resume layouts

export interface PDFTemplateContext {
  resumeData: any;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function generateModernTemplate({ resumeData, theme }: PDFTemplateContext): string {
  const generateSkillProficiency = (skill: string) => {
    const baseSkillLevel = 75 + (skill.length % 20);
    return Math.min(95, baseSkillLevel);
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enhanced Resume - ${resumeData.name}</title>
  <style>
    @page { size: A4; margin: 0.25in; }
    * { margin: 0; padding: 0; box-sizing: border-box; text-decoration: none !important; }
    
    body {
      font-family: 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      line-height: 1.5; color: #1a202c; background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      font-size: 9pt; width: 100%; min-height: auto;
    }
    
    .container { background: white; border-radius: 6pt; overflow: hidden; box-shadow: 0 15px 30px rgba(0,0,0,0.08); width: 100%; max-width: none; }
    
    .header {
      background: linear-gradient(to right, ${theme.primary}, ${theme.accent});
      color: white; padding: 12pt; position: relative; overflow: hidden;
    }
    
    .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.1); pointer-events: none; }
    .header-content { position: relative; z-index: 10; }
    .header h1 { font-size: 24pt; font-weight: 800; margin-bottom: 4pt; line-height: 1.1; }
    .header .title { font-size: 14pt; margin-bottom: 16pt; opacity: 0.95; font-weight: 500; }
    .contact-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8pt; margin-top: 12pt; }
    .contact-item { font-size: 9pt; opacity: 0.9; display: flex; align-items: flex-start; gap: 6pt; font-weight: 500; text-decoration: none; line-height: 1.15; padding: 2.3pt 0; }
    
    .main-content { display: grid; grid-template-columns: 1.4fr 0.6fr; gap: 12pt; padding: 12pt; min-height: calc(297mm - 60pt); width: 100%; }
    .left-column { space-y: 12pt; }
    .sidebar { space-y: 12pt; }
    .section { margin-bottom: 12pt; break-inside: avoid; }
    
    .section-header { display: flex; align-items: center; gap: 6pt; margin-bottom: 8pt; }
    .section-icon { width: 24pt; height: 24pt; border-radius: 6pt; background: linear-gradient(to right, ${theme.primary}, ${theme.accent}); display: flex; align-items: center; justify-content: center; color: white; }
    .section-title { font-size: 14pt; font-weight: 700; color: ${theme.primary}; }
    
    .summary-card { background: white; padding: 12pt; border-radius: 8pt; box-shadow: 0 2px 8pt rgba(0,0,0,0.06); border: 1pt solid rgba(0,0,0,0.05); }
    .summary-text { font-size: 10pt; line-height: 1.6; color: #2d3748; }
    
    .experience-timeline { position: relative; padding-left: 12pt; margin-bottom: 12pt; }
    .experience-item { position: relative; margin-bottom: 12pt; padding: 10pt; border-radius: 6pt; background: linear-gradient(to right, ${theme.accent}08, ${theme.primary}08); border-left: 2pt solid ${theme.accent}30; }
    .experience-item::before { content: ''; position: absolute; left: -21pt; top: 16pt; width: 12pt; height: 12pt; background: ${theme.accent}; border-radius: 50%; border: 2pt solid white; box-shadow: 0 0 0 2pt ${theme.accent}30; }
    
    .experience-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8pt; }
    .experience-title { font-size: 12pt; font-weight: 700; color: #1a202c; margin-bottom: 2pt; }
    .experience-company { font-size: 11pt; font-weight: 600; color: ${theme.accent}; }
    .experience-duration { background: ${theme.accent}10; color: ${theme.accent}; padding: 4pt 8pt; border-radius: 12pt; font-size: 8pt; font-weight: 600; border: 1pt solid ${theme.accent}20; }
    
    .achievements { list-style: none; margin-top: 8pt; }
    .achievement { margin-bottom: 6pt; font-size: 9pt; line-height: 1.5; display: flex; align-items: flex-start; gap: 8pt; padding: 6pt 8pt; background: rgba(255,255,255,0.5); border-radius: 6pt; }
    .achievement::before { content: ''; width: 12pt; height: 12pt; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 50%; flex-shrink: 0; margin-top: 2pt; position: relative; }
    
    .skills-section { background: white; padding: 12pt; border-radius: 8pt; box-shadow: 0 2px 8pt rgba(0,0,0,0.05); border: 1pt solid rgba(0,0,0,0.05); margin-bottom: 12pt; }
    .skill-item { margin-bottom: 12pt; }
    .skill-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4pt; }
    .skill-name { font-weight: 600; color: #1a202c; font-size: 9pt; }
    .skill-percentage { font-size: 8pt; color: #6b7280; }
    .skill-bar { height: 4pt; background: #e5e7eb; border-radius: 2pt; overflow: hidden; }
    .skill-progress { height: 100%; background: linear-gradient(90deg, ${theme.primary}, ${theme.accent}); border-radius: 2pt; }
    
    .stats-grid { display: grid; grid-template-columns: 1fr; gap: 8pt; }
    .stat-item { text-align: center; padding: 8pt; border-radius: 6pt; background: ${theme.primary}08; }
    .stat-number { font-size: 18pt; font-weight: 700; color: ${theme.primary}; }
    .stat-label { font-size: 8pt; color: #6b7280; margin-top: 2pt; }
    
    .education-section { background: white; padding: 12pt; border-radius: 8pt; box-shadow: 0 2px 8pt rgba(0,0,0,0.05); border: 1pt solid rgba(0,0,0,0.05); }
    .education-item { padding: 10pt; border-radius: 6pt; margin-bottom: 6pt; background: linear-gradient(to right, ${theme.primary}08, ${theme.accent}08); border: 1pt solid ${theme.primary}10; }
    .education-degree { font-weight: 700; color: #1a202c; font-size: 11pt; margin-bottom: 2pt; }
    .education-institution { font-weight: 600; color: ${theme.accent}; font-size: 10pt; margin-bottom: 2pt; }
    .education-year { font-size: 8pt; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-content">
        <h1>${resumeData.name || 'Enhanced Resume'}</h1>
        <div class="title">${resumeData.title || 'Professional'}</div>
        <div class="contact-info">
          <div class="title">${resumeData.email || 'email@example.com'} • ${resumeData.phone || '+1 (555) 123-4567'}</div>
          <div class="title">${resumeData.location || 'City, Country'}</div>
          <div style="height: 12px;"></div>
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

export function generateClassicTemplate({ resumeData, theme }: PDFTemplateContext): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Enhanced Resume - ${resumeData.name}</title>
  <style>
    @page { size: A4; margin: 0.5in; }
    * { margin: 0; padding: 0; box-sizing: border-box; text-decoration: none !important; }
    
    body {
      font-family: 'Times New Roman', 'Georgia', serif;
      line-height: 1.6; color: #2c3e50; background: white;
      font-size: 11pt; width: 100%; min-height: auto;
    }
    
    .container { background: white; width: 100%; max-width: none; }
    
    .header {
      text-align: center; padding: 20pt 0; border-bottom: 2pt solid ${theme.primary};
      margin-bottom: 20pt;
    }
    
    .header h1 { font-size: 28pt; font-weight: 700; margin-bottom: 8pt; color: ${theme.primary}; }
    .header .title { font-size: 16pt; margin-bottom: 12pt; color: #2c3e50; font-weight: 500; }
    .header .contact { font-size: 11pt; color: #34495e; }
    
    .section { margin-bottom: 24pt; }
    .section-title { 
      font-size: 16pt; font-weight: 700; color: ${theme.primary}; 
      margin-bottom: 12pt; padding-bottom: 4pt; 
      border-bottom: 1pt solid ${theme.primary}30;
    }
    
    .summary { font-size: 12pt; line-height: 1.6; color: #2c3e50; text-align: justify; }
    
    .experience-item { margin-bottom: 16pt; }
    .experience-header { margin-bottom: 8pt; }
    .experience-title { font-size: 14pt; font-weight: 700; color: #2c3e50; }
    .experience-company { font-size: 12pt; font-weight: 600; color: ${theme.primary}; margin-bottom: 4pt; }
    .experience-duration { font-size: 10pt; color: #7f8c8d; font-style: italic; }
    
    .achievements { margin-top: 8pt; padding-left: 20pt; }
    .achievement { margin-bottom: 4pt; font-size: 11pt; line-height: 1.5; }
    
    .skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8pt; }
    .skill-item { font-size: 11pt; color: #2c3e50; padding: 4pt; }
    
    .education-item { margin-bottom: 12pt; }
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

// Add more template generators here for creative, executive, and minimalist...
export function generateCreativeTemplate({ resumeData, theme }: PDFTemplateContext): string {
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
    }
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
      text-decoration: none !important; 
    }
    
    body {
      font-family: 'Inter', 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      line-height: 1.5; 
      color: #1a202c; 
      background: white;
      font-size: 10pt; 
      width: 100%; 
      min-height: auto;
    }
    
    .container { 
      background: white; 
      width: 100%; 
      max-width: none;
    }
    
    .header {
      background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 70%, ${theme.secondary} 100%);
      color: white; 
      padding: 16pt; 
      position: relative; 
      overflow: hidden;
      margin-bottom: 16pt;
    }
    
    .header::before { 
      content: ''; 
      position: absolute; 
      top: 8pt; 
      left: 8pt; 
      width: 32pt; 
      height: 32pt; 
      border: 2pt solid rgba(255,255,255,0.3); 
      border-radius: 50%; 
    }
    
    .header::after { 
      content: ''; 
      position: absolute; 
      top: 16pt; 
      right: 16pt; 
      width: 24pt; 
      height: 24pt; 
      border: 2pt solid rgba(255,255,255,0.3); 
      transform: rotate(45deg); 
    }
    
    .header-content { 
      position: relative; 
      z-index: 10; 
      text-align: center; 
    }
    
    .header h1 { 
      font-size: 26pt; 
      font-weight: 800; 
      margin-bottom: 6pt; 
      line-height: 1.1; 
    }
    
    .header .title { 
      font-size: 14pt; 
      margin-bottom: 12pt; 
      opacity: 0.95; 
      font-weight: 500; 
    }
    
    .contact-info { 
      font-size: 10pt; 
      font-weight: 500; 
    }
    
    .main-content { 
      padding: 0 16pt; 
    }
    
    .section { 
      margin-bottom: 20pt; 
      break-inside: avoid;
    }
    
    .section-header { 
      display: flex; 
      align-items: center; 
      gap: 8pt; 
      margin-bottom: 12pt; 
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
      font-size: 12pt;
      font-weight: bold;
    }
    
    .section-title { 
      font-size: 16pt; 
      font-weight: 700; 
      color: ${theme.primary}; 
    }
    
    .creative-summary { 
      background: linear-gradient(135deg, ${theme.primary}05, ${theme.accent}10); 
      padding: 14pt; 
      border-radius: 8pt; 
      border-left: 3pt solid ${theme.accent}; 
      break-inside: avoid;
    }
    
    .summary-text { 
      font-size: 11pt; 
      line-height: 1.6; 
      color: #2d3748; 
    }
    
    .experience-item { 
      background: linear-gradient(135deg, ${theme.primary}05, ${theme.accent}10); 
      padding: 14pt; 
      border-radius: 8pt; 
      border-left: 3pt solid ${theme.accent}; 
      margin-bottom: 14pt;
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
      background: linear-gradient(135deg, ${theme.secondary}, ${theme.accent}); 
      color: white; 
      padding: 4pt 8pt; 
      border-radius: 12pt; 
      font-size: 9pt; 
      font-weight: 600; 
    }
    
    .achievements { 
      list-style: none; 
      margin-top: 8pt; 
    }
    
    .achievement { 
      display: flex; 
      align-items: flex-start; 
      gap: 6pt; 
      margin-bottom: 6pt; 
      font-size: 10pt; 
      line-height: 1.5; 
    }
    
    .achievement::before { 
      content: '✓'; 
      background: linear-gradient(135deg, ${theme.accent}, ${theme.primary}); 
      color: white; 
      width: 14pt; 
      height: 14pt; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-size: 7pt; 
      font-weight: bold; 
      flex-shrink: 0; 
      margin-top: 1pt; 
    }
    
    .skills-section { 
      background: linear-gradient(135deg, ${theme.primary}08, ${theme.accent}15); 
      padding: 14pt; 
      border-radius: 8pt; 
      margin-bottom: 16pt;
      break-inside: avoid;
    }
    
    .skills-header { 
      display: flex; 
      align-items: center; 
      gap: 8pt; 
      margin-bottom: 10pt; 
    }
    
    .skills-icon { 
      width: 20pt; 
      height: 20pt; 
      border-radius: 4pt; 
      background: linear-gradient(135deg, ${theme.primary}, ${theme.accent}); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: white; 
      font-size: 8pt;
      font-weight: bold;
    }
    
    .skills-title { 
      font-size: 14pt; 
      font-weight: 700; 
      color: ${theme.primary}; 
    }
    
    .skills-grid { 
      display: flex; 
      flex-wrap: wrap; 
      gap: 4pt; 
    }
    
    .skill-badge { 
      background: white; 
      border: 1pt solid ${theme.accent}; 
      color: ${theme.primary}; 
      padding: 3pt 6pt; 
      border-radius: 12pt; 
      font-size: 9pt; 
      font-weight: 600; 
    }
    
    .stats-section { 
      background: linear-gradient(135deg, ${theme.accent}10, ${theme.secondary}15); 
      padding: 14pt; 
      border-radius: 8pt; 
      text-align: center; 
      margin-bottom: 16pt;
      break-inside: avoid;
    }
    
    .stats-header { 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      gap: 8pt; 
      margin-bottom: 10pt; 
    }
    
    .stats-icon { 
      width: 20pt; 
      height: 20pt; 
      border-radius: 4pt; 
      background: linear-gradient(135deg, ${theme.primary}, ${theme.accent}); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: white; 
      font-size: 8pt;
      font-weight: bold;
    }
    
    .stats-title { 
      font-size: 14pt; 
      font-weight: 700; 
      color: ${theme.primary}; 
    }
    
    .stats-grid { 
      display: flex; 
      justify-content: center; 
      gap: 16pt; 
    }
    
    .stat-item { 
      text-align: center; 
    }
    
    .stat-number { 
      font-size: 20pt; 
      font-weight: 700; 
      color: ${theme.primary}; 
    }
    
    .stat-label { 
      font-size: 9pt; 
      color: #6b7280; 
      margin-top: 2pt; 
    }
    
    .education-section { 
      background: linear-gradient(135deg, ${theme.secondary}08, ${theme.primary}10); 
      padding: 14pt; 
      border-radius: 8pt; 
      break-inside: avoid;
    }
    
    .education-header { 
      display: flex; 
      align-items: center; 
      gap: 8pt; 
      margin-bottom: 10pt; 
    }
    
    .education-icon { 
      width: 20pt; 
      height: 20pt; 
      border-radius: 4pt; 
      background: linear-gradient(135deg, ${theme.secondary}, ${theme.primary}); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: white; 
      font-size: 8pt;
      font-weight: bold;
    }
    
    .education-title { 
      font-size: 14pt; 
      font-weight: 700; 
      color: ${theme.primary}; 
    }
    
    .education-item { 
      background: white; 
      border-left: 3pt solid ${theme.accent}; 
      padding: 8pt; 
      border-radius: 4pt; 
      margin-bottom: 6pt;
      break-inside: avoid;
    }
    
    .education-degree { 
      font-weight: 700; 
      color: #1a202c; 
      font-size: 10pt; 
      margin-bottom: 2pt; 
    }
    
    .education-institution { 
      font-weight: 600; 
      color: ${theme.accent}; 
      font-size: 9pt; 
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
        <div class="contact-info">
          ${resumeData.email || 'email@example.com'} • ${resumeData.phone || '+1 (555) 123-4567'} • ${resumeData.location || 'City, Country'}
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="section">
        <div class="section-header">
          <div class="section-icon">✨</div>
          <h2 class="section-title">Creative Vision</h2>
        </div>
        <div class="creative-summary">
          <p class="summary-text">${resumeData.summary || 'Dynamic creative professional with a passion for innovative design and strategic thinking. Expertise in delivering compelling visual solutions that drive engagement and achieve business objectives.'}</p>
        </div>
      </div>

      ${resumeData.experience && resumeData.experience.length > 0 ? `
      <div class="section">
        <div class="section-header">
          <div class="section-icon">📈</div>
          <h2 class="section-title">Experience Journey</h2>
        </div>
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
            ${exp.achievements.slice(0, 3).map((achievement: string) => `<li class="achievement">${achievement}</li>`).join('')}
          </ul>
          ` : `
          <ul class="achievements">
            <li class="achievement">Delivered exceptional creative solutions and exceeded client expectations</li>
            <li class="achievement">Collaborated effectively with cross-functional teams to achieve project goals</li>
          </ul>
          `}
        </div>
        `).join('')}
      </div>
      ` : ''}

      ${resumeData.skills && resumeData.skills.length > 0 ? `
      <div class="skills-section">
        <div class="skills-header">
          <div class="skills-icon">🎨</div>
          <h3 class="skills-title">Creative Skills</h3>
        </div>
        <div class="skills-grid">
          ${resumeData.skills.map((skill: string) => `<span class="skill-badge">${skill}</span>`).join('')}
        </div>
      </div>
      ` : ''}

      <div class="stats-section">
        <div class="stats-header">
          <div class="stats-icon">📊</div>
          <h3 class="stats-title">Portfolio Stats</h3>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">${resumeData.skills ? resumeData.skills.length : '12'}</div>
            <div class="stat-label">Creative Skills</div>
          </div>
          <div class="stat-item">
            <div class="stat-number" style="color: ${theme.accent};">${resumeData.experience ? resumeData.experience.length : '3'}</div>
            <div class="stat-label">Projects</div>
          </div>
        </div>
      </div>

      ${resumeData.education && resumeData.education.length > 0 ? `
      <div class="education-section">
        <div class="education-header">
          <div class="education-icon">🎓</div>
          <h3 class="education-title">Education</h3>
        </div>
        ${resumeData.education.map((edu: any) => `
        <div class="education-item">
          <div class="education-degree">${edu.degree || 'Bachelor\'s Degree'}</div>
          <div class="education-institution">${edu.institution || 'University Name'}</div>
          ${edu.year && edu.year !== 'Year not specified' ? `<div class="education-year">${edu.year}</div>` : ''}
        </div>
        `).join('')}
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>`;
}

export function generateExecutiveTemplate({ resumeData, theme }: PDFTemplateContext): string {
  return generateClassicTemplate({ resumeData, theme }); // Placeholder - use classic for now
}

export function generateMinimalistTemplate({ resumeData, theme }: PDFTemplateContext): string {
  return generateClassicTemplate({ resumeData, theme }); // Placeholder - use classic for now
}

export const templateGenerators = {
  modern: generateModernTemplate,
  classic: generateClassicTemplate,
  creative: generateCreativeTemplate,
  executive: generateExecutiveTemplate,
  minimalist: generateMinimalistTemplate,
};