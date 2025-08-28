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
  
  // Generate realistic skill proficiency percentages matching the preview
  const generateSkillProficiency = (skill: string) => {
    const baseSkillLevel = 75 + (skill.length % 20); // 75-95% based on skill name
    return Math.min(95, baseSkillLevel);
  };

  function generateModernHTML(resumeData: any, theme: any) {
    return `<!DOCTYPE html>
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
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      background: white;
    }
    
    .resume-container {
      width: 8.5in;
      min-height: 11in;
      margin: 0 auto;
      background: white;
      display: flex;
      flex-direction: column;
    }
    
    .header {
      background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%);
      color: white;
      padding: 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 4s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.1; }
      50% { transform: scale(1.1); opacity: 0.3; }
    }
    
    .name {
      font-size: 2.5em;
      font-weight: bold;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      position: relative;
      z-index: 1;
    }
    
    .title {
      font-size: 1.3em;
      opacity: 0.9;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;
    }
    
    .contact-info {
      display: flex;
      justify-content: center;
      gap: 30px;
      flex-wrap: wrap;
      position: relative;
      z-index: 1;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.95em;
    }
    
    .main-content {
      display: flex;
      flex: 1;
    }
    
    .left-column {
      width: 35%;
      background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 40px 30px;
    }
    
    .right-column {
      width: 65%;
      padding: 40px;
    }
    
    .section {
      margin-bottom: 35px;
    }
    
    .section-title {
      font-size: 1.3em;
      font-weight: bold;
      color: ${theme.primary};
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-bottom: 3px solid ${theme.accent};
      position: relative;
    }
    
    .section-title::after {
      content: '';
      position: absolute;
      bottom: -3px;
      left: 0;
      width: 50px;
      height: 3px;
      background: ${theme.primary};
    }
    
    .experience-item, .education-item {
      margin-bottom: 25px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-left: 4px solid ${theme.accent};
    }
    
    .job-title, .degree {
      font-size: 1.1em;
      font-weight: bold;
      color: ${theme.primary};
      margin-bottom: 5px;
    }
    
    .company, .institution {
      font-weight: 600;
      color: #555;
      margin-bottom: 5px;
    }
    
    .date {
      color: #777;
      font-size: 0.9em;
      margin-bottom: 10px;
    }
    
    .description {
      color: #666;
      line-height: 1.6;
      margin-bottom: 15px;
    }

    .core-responsibilities-section, .achievements-section {
      margin-top: 15px;
    }

    .section-subtitle {
      font-size: 1em;
      font-weight: 600;
      color: ${theme.primary};
      margin-bottom: 10px;
    }

    .responsibilities-list, .achievements-list {
      list-style: none;
      padding-left: 0;
    }

    .responsibilities-list li, .achievements-list li {
      position: relative;
      padding-left: 20px;
      margin-bottom: 8px;
      color: #666;
      line-height: 1.5;
    }

    .responsibilities-list li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: ${theme.secondary};
      font-weight: bold;
    }

    .achievements-list li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: ${theme.primary};
      font-weight: bold;
    }
    
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    
    .skill-item {
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .skill-name {
      font-weight: 600;
      color: ${theme.primary};
      margin-bottom: 8px;
    }
    
    .skill-bar {
      background: #e2e8f0;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .skill-progress {
      height: 100%;
      background: linear-gradient(90deg, ${theme.primary} 0%, ${theme.secondary} 100%);
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    
    .personal-info {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .info-item {
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .info-label {
      font-weight: 600;
      color: ${theme.primary};
      min-width: 80px;
    }
    
    .info-value {
      color: #555;
    }
    
    .summary {
      background: linear-gradient(135deg, ${theme.accent}20 0%, ${theme.secondary}20 100%);
      padding: 25px;
      border-radius: 8px;
      border: 1px solid ${theme.accent}40;
      font-style: italic;
      color: #555;
      line-height: 1.7;
    }
    
    @media print {
      .resume-container {
        box-shadow: none;
        margin: 0;
      }
      
      .header::before {
        animation: none;
      }
    }
  </style>
</head>
<body>
  <div class="resume-container">
    <div class="header">
      <h1 class="name">${resumeData.name || 'Professional Name'}</h1>
      <p class="title">${resumeData.title || 'Professional Title'}</p>
      <div class="contact-info">
        ${resumeData.email ? `<div class="contact-item">📧 ${resumeData.email}</div>` : ''}
        ${resumeData.phone ? `<div class="contact-item">📞 ${resumeData.phone}</div>` : ''}
        ${resumeData.location ? `<div class="contact-item">📍 ${resumeData.location}</div>` : ''}
        ${resumeData.linkedin ? `<div class="contact-item">💼 ${resumeData.linkedin}</div>` : ''}
      </div>
    </div>
    
    <div class="main-content">
      <div class="left-column">
        ${resumeData.core_technical_skills && resumeData.core_technical_skills.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Core Technical Skills</h2>
          <div class="skills-grid">
            ${resumeData.core_technical_skills.slice(0, 10).map((skill: any) => `
              <div class="skill-item">
                <div class="skill-name">${skill.name}</div>
                <div class="skill-bar">
                  <div class="skill-progress" style="width: ${skill.proficiency || generateSkillProficiency(skill.name)}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : resumeData.skills && resumeData.skills.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Core Technical Skills</h2>
          <div class="skills-grid">
            ${resumeData.skills.slice(0, 8).map((skill: string) => `
              <div class="skill-item">
                <div class="skill-name">${skill}</div>
                <div class="skill-bar">
                  <div class="skill-progress" style="width: ${generateSkillProficiency(skill)}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <div class="section">
          <h2 class="section-title">Personal Info</h2>
          <div class="personal-info">
            ${resumeData.email ? `<div class="info-item"><span class="info-label">Email:</span><span class="info-value">${resumeData.email}</span></div>` : ''}
            ${resumeData.phone ? `<div class="info-item"><span class="info-label">Phone:</span><span class="info-value">${resumeData.phone}</span></div>` : ''}
            ${resumeData.location ? `<div class="info-item"><span class="info-label">Location:</span><span class="info-value">${resumeData.location}</span></div>` : ''}
            ${resumeData.linkedin ? `<div class="info-item"><span class="info-label">LinkedIn:</span><span class="info-value">${resumeData.linkedin}</span></div>` : ''}
          </div>
        </div>
      </div>
      
      <div class="right-column">
        ${resumeData.summary ? `
        <div class="section">
          <h2 class="section-title">Professional Summary</h2>
          <div class="summary">${resumeData.summary}</div>
        </div>
        ` : ''}
        
        ${resumeData.experience && resumeData.experience.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Experience</h2>
          ${resumeData.experience.map((exp: any) => `
            <div class="experience-item">
              <div class="job-title">${exp.title || exp.position || 'Position Title'}</div>
              <div class="company">${exp.company || 'Company Name'}</div>
              <div class="date">${exp.duration || exp.dates || 'Duration'}</div>
              ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
              ${exp.core_responsibilities && exp.core_responsibilities.length > 0 ? `
                <div class="core-responsibilities-section">
                  <h4 class="section-subtitle">Core Responsibilities:</h4>
                  <ul class="responsibilities-list">
                    ${exp.core_responsibilities.map((responsibility: string) => `<li>${responsibility}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              ${exp.achievements && exp.achievements.length > 0 ? `
                <div class="achievements-section">
                  <h4 class="section-subtitle">Key Achievements & Impact:</h4>
                  <ul class="achievements-list">
                    ${exp.achievements.map((achievement: string) => `<li>${achievement}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        ${resumeData.education && resumeData.education.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Education</h2>
          ${resumeData.education.map((edu: any) => `
            <div class="education-item">
              <div class="degree">${edu.degree || edu.qualification || 'Degree/Qualification'}</div>
              <div class="institution">${edu.institution || edu.school || 'Institution Name'}</div>
              <div class="date">${edu.year || edu.duration || 'Year'}</div>
              ${edu.gpa ? `<div class="description">GPA: ${edu.gpa}</div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
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
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Times New Roman', serif;
      line-height: 1.6;
      color: #333;
      background: white;
    }
    
    .resume-container {
      max-width: 8.5in;
      margin: 0 auto;
      padding: 40px;
      background: white;
    }
    
    .header {
      text-align: center;
      border-bottom: 3px solid ${theme.primary};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .name {
      font-size: 2.2em;
      font-weight: bold;
      color: ${theme.primary};
      margin-bottom: 10px;
      letter-spacing: 1px;
    }
    
    .title {
      font-size: 1.2em;
      color: #555;
      margin-bottom: 15px;
      font-style: italic;
    }
    
    .contact-info {
      font-size: 0.95em;
      color: #666;
      line-height: 1.4;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: 1.3em;
      font-weight: bold;
      color: ${theme.primary};
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 2px solid ${theme.primary};
      padding-bottom: 5px;
      margin-bottom: 15px;
    }
    
    .experience-item, .education-item {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }
    
    .experience-item:last-child, .education-item:last-child {
      border-bottom: none;
    }
    
    .job-title, .degree {
      font-size: 1.1em;
      font-weight: bold;
      color: ${theme.primary};
      margin-bottom: 5px;
    }
    
    .company, .institution {
      font-weight: 600;
      color: #555;
      margin-bottom: 3px;
    }
    
    .date {
      color: #777;
      font-size: 0.9em;
      margin-bottom: 8px;
      font-style: italic;
    }
    
    .description {
      color: #666;
      text-align: justify;
      line-height: 1.6;
      margin-bottom: 15px;
    }

    .core-responsibilities-section, .achievements-section {
      margin-top: 15px;
    }

    .section-subtitle {
      font-size: 1em;
      font-weight: 600;
      color: ${theme.primary};
      margin-bottom: 10px;
    }

    .responsibilities-list, .achievements-list {
      list-style: none;
      padding-left: 0;
    }

    .responsibilities-list li, .achievements-list li {
      position: relative;
      padding-left: 20px;
      margin-bottom: 8px;
      color: #666;
      line-height: 1.5;
    }

    .responsibilities-list li::before {
      content: '○';
      position: absolute;
      left: 0;
      color: ${theme.secondary};
      font-weight: bold;
      font-size: 1.2em;
    }

    .achievements-list li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: ${theme.primary};
      font-weight: bold;
      font-size: 1.2em;
    }
    
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .skill-tag {
      background: ${theme.accent};
      color: ${theme.primary};
      padding: 5px 12px;
      border-radius: 15px;
      font-size: 0.9em;
      font-weight: 500;
    }
    
    .summary {
      background: #f8f9fa;
      padding: 20px;
      border-left: 4px solid ${theme.primary};
      font-style: italic;
      color: #555;
      line-height: 1.7;
    }
    
    @media print {
      .resume-container {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="resume-container">
    <div class="header">
      <h1 class="name">${resumeData.name || 'Professional Name'}</h1>
      <p class="title">${resumeData.title || 'Professional Title'}</p>
      <div class="contact-info">
        ${resumeData.email ? resumeData.email : ''}
        ${resumeData.phone ? ` • ${resumeData.phone}` : ''}
        ${resumeData.location ? ` • ${resumeData.location}` : ''}
        ${resumeData.linkedin ? ` • ${resumeData.linkedin}` : ''}
      </div>
    </div>
    
    ${resumeData.summary ? `
    <div class="section">
      <h2 class="section-title">Professional Summary</h2>
      <div class="summary">${resumeData.summary}</div>
    </div>
    ` : ''}
    
    ${resumeData.experience && resumeData.experience.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Professional Experience</h2>
      ${resumeData.experience.map((exp: any) => `
        <div class="experience-item">
          <div class="job-title">${exp.title || exp.position || 'Position Title'}</div>
          <div class="company">${exp.company || 'Company Name'}</div>
          <div class="date">${exp.duration || exp.dates || 'Duration'}</div>
          ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
          ${exp.core_responsibilities && exp.core_responsibilities.length > 0 ? `
            <div class="core-responsibilities-section">
              <h4 class="section-subtitle">Core Responsibilities:</h4>
              <ul class="responsibilities-list">
                ${exp.core_responsibilities.map((responsibility: string) => `<li>${responsibility}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${exp.achievements && exp.achievements.length > 0 ? `
            <div class="achievements-section">
              <h4 class="section-subtitle">Key Achievements & Impact:</h4>
              <ul class="achievements-list">
                ${exp.achievements.map((achievement: string) => `<li>${achievement}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${resumeData.education && resumeData.education.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Education</h2>
      ${resumeData.education.map((edu: any) => `
        <div class="education-item">
          <div class="degree">${edu.degree || edu.qualification || 'Degree/Qualification'}</div>
          <div class="institution">${edu.institution || edu.school || 'Institution Name'}</div>
          <div class="date">${edu.year || edu.duration || 'Year'}</div>
          ${edu.gpa ? `<div class="description">GPA: ${edu.gpa}</div>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${resumeData.core_technical_skills && resumeData.core_technical_skills.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Core Technical Skills</h2>
      <div class="skills-list">
        ${resumeData.core_technical_skills.map((skill: any) => `
          <span class="skill-tag">${skill.name} (${skill.proficiency || 85}%)</span>
        `).join('')}
      </div>
    </div>
    ` : resumeData.skills && resumeData.skills.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Skills</h2>
      <div class="skills-list">
        ${resumeData.skills.map((skill: string) => `
          <span class="skill-tag">${skill}</span>
        `).join('')}
      </div>
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
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .resume-container {
      max-width: 8.5in;
      margin: 0 auto;
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    
    .header {
      background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%);
      color: white;
      padding: 50px 40px;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 100%;
      height: 200%;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="25" cy="75" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      transform: rotate(15deg);
    }
    
    .header-content {
      position: relative;
      z-index: 1;
    }
    
    .name {
      font-size: 3em;
      font-weight: 300;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      letter-spacing: 2px;
    }
    
    .title {
      font-size: 1.4em;
      opacity: 0.9;
      margin-bottom: 25px;
      font-weight: 300;
    }
    
    .contact-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.95em;
      background: rgba(255,255,255,0.1);
      padding: 10px 15px;
      border-radius: 25px;
      backdrop-filter: blur(10px);
    }
    
    .main-content {
      padding: 40px;
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 40px;
    }
    
    .left-column {
      position: relative;
    }
    
    .right-column {
      position: relative;
    }
    
    .section {
      margin-bottom: 35px;
      position: relative;
    }
    
    .section-title {
      font-size: 1.4em;
      font-weight: 600;
      color: ${theme.primary};
      margin-bottom: 20px;
      position: relative;
      display: inline-block;
    }
    
    .section-title::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, ${theme.primary} 0%, ${theme.accent} 100%);
      border-radius: 2px;
    }
    
    .experience-item, .education-item {
      margin-bottom: 30px;
      padding: 25px;
      background: linear-gradient(135deg, ${theme.accent}10 0%, transparent 100%);
      border-radius: 15px;
      border: 1px solid ${theme.accent}30;
      position: relative;
      transition: transform 0.3s ease;
    }
    
    .experience-item::before, .education-item::before {
      content: '';
      position: absolute;
      top: 15px;
      left: -5px;
      width: 10px;
      height: 10px;
      background: ${theme.primary};
      border-radius: 50%;
      box-shadow: 0 0 0 5px white, 0 0 0 7px ${theme.accent};
    }
    
    .job-title, .degree {
      font-size: 1.2em;
      font-weight: 600;
      color: ${theme.primary};
      margin-bottom: 8px;
    }
    
    .company, .institution {
      font-weight: 500;
      color: #555;
      margin-bottom: 5px;
      font-size: 1.05em;
    }
    
    .date {
      color: #777;
      font-size: 0.9em;
      margin-bottom: 12px;
      font-weight: 500;
    }
    
    .description {
      color: #666;
      line-height: 1.7;
      margin-bottom: 15px;
    }

    .core-responsibilities-section, .achievements-section {
      margin-top: 15px;
    }

    .section-subtitle {
      font-size: 1em;
      font-weight: 600;
      color: ${theme.primary};
      margin-bottom: 10px;
    }

    .responsibilities-list, .achievements-list {
      list-style: none;
      padding-left: 0;
    }

    .responsibilities-list li, .achievements-list li {
      position: relative;
      padding-left: 20px;
      margin-bottom: 8px;
      color: #666;
      line-height: 1.6;
    }

    .responsibilities-list li::before {
      content: '◇';
      position: absolute;
      left: 0;
      color: ${theme.secondary};
      font-weight: bold;
    }

    .achievements-list li::before {
      content: '→';
      position: absolute;
      left: 0;
      color: ${theme.primary};
      font-weight: bold;
    }
    
    .skills-container {
      display: grid;
      gap: 15px;
    }
    
    .skill-item {
      background: white;
      padding: 15px;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      border: 1px solid ${theme.accent}20;
    }
    
    .skill-name {
      font-weight: 600;
      color: ${theme.primary};
      margin-bottom: 8px;
      font-size: 0.95em;
    }
    
    .skill-bar {
      background: #e2e8f0;
      height: 6px;
      border-radius: 3px;
      overflow: hidden;
    }
    
    .skill-progress {
      height: 100%;
      background: linear-gradient(90deg, ${theme.primary} 0%, ${theme.secondary} 100%);
      border-radius: 3px;
      transition: width 0.5s ease;
    }
    
    .summary {
      background: linear-gradient(135deg, ${theme.accent}15 0%, ${theme.secondary}15 100%);
      padding: 25px;
      border-radius: 15px;
      border: 1px solid ${theme.accent}30;
      font-style: italic;
      color: #555;
      line-height: 1.8;
      position: relative;
    }
    
    .summary::before {
      content: '"';
      font-size: 4em;
      color: ${theme.accent};
      position: absolute;
      top: -10px;
      left: 15px;
      font-family: Georgia, serif;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .resume-container {
        box-shadow: none;
        border-radius: 0;
      }
      
      .main-content {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="resume-container">
    <div class="header">
      <div class="header-content">
        <h1 class="name">${resumeData.name || 'Professional Name'}</h1>
        <p class="title">${resumeData.title || 'Professional Title'}</p>
        <div class="contact-info">
          ${resumeData.email ? `<div class="contact-item">✉️ ${resumeData.email}</div>` : ''}
          ${resumeData.phone ? `<div class="contact-item">📱 ${resumeData.phone}</div>` : ''}
          ${resumeData.location ? `<div class="contact-item">🌍 ${resumeData.location}</div>` : ''}
          ${resumeData.linkedin ? `<div class="contact-item">💼 ${resumeData.linkedin}</div>` : ''}
        </div>
      </div>
    </div>
    
    <div class="main-content">
      <div class="left-column">
        ${resumeData.core_technical_skills && resumeData.core_technical_skills.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Core Technical Skills</h2>
          <div class="skills-container">
            ${resumeData.core_technical_skills.slice(0, 10).map((skill: any) => `
              <div class="skill-item">
                <div class="skill-name">${skill.name}</div>
                <div class="skill-bar">
                  <div class="skill-progress" style="width: ${skill.proficiency || generateSkillProficiency(skill.name)}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : resumeData.skills && resumeData.skills.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Core Technical Skills</h2>
          <div class="skills-container">
            ${resumeData.skills.slice(0, 8).map((skill: string) => `
              <div class="skill-item">
                <div class="skill-name">${skill}</div>
                <div class="skill-bar">
                  <div class="skill-progress" style="width: ${generateSkillProficiency(skill)}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        ${resumeData.education && resumeData.education.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Education</h2>
          ${resumeData.education.map((edu: any) => `
            <div class="education-item">
              <div class="degree">${edu.degree || edu.qualification || 'Degree/Qualification'}</div>
              <div class="institution">${edu.institution || edu.school || 'Institution Name'}</div>
              <div class="date">${edu.year || edu.duration || 'Year'}</div>
              ${edu.gpa ? `<div class="description">GPA: ${edu.gpa}</div>` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
      
      <div class="right-column">
        ${resumeData.summary ? `
        <div class="section">
          <h2 class="section-title">About Me</h2>
          <div class="summary">${resumeData.summary}</div>
        </div>
        ` : ''}
        
        ${resumeData.experience && resumeData.experience.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Experience Journey</h2>
          ${resumeData.experience.map((exp: any) => `
            <div class="experience-item">
              <div class="job-title">${exp.title || exp.position || 'Position Title'}</div>
              <div class="company">${exp.company || 'Company Name'}</div>
              <div class="date">${exp.duration || exp.dates || 'Duration'}</div>
              ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
              ${exp.core_responsibilities && exp.core_responsibilities.length > 0 ? `
                <div class="core-responsibilities-section">
                  <h4 class="section-subtitle">Core Responsibilities:</h4>
                  <ul class="responsibilities-list">
                    ${exp.core_responsibilities.map((responsibility: string) => `<li>${responsibility}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              ${exp.achievements && exp.achievements.length > 0 ? `
                <div class="achievements-section">
                  <h4 class="section-subtitle">Key Achievements & Impact:</h4>
                  <ul class="achievements-list">
                    ${exp.achievements.map((achievement: string) => `<li>${achievement}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
    </div>
  </div>
</body>
</html>`;
  }
  
  // Template generators - now defined after the HTML functions  
  const templateGenerators = {
    modern: () => generateModernHTML(resumeData, theme),
    classic: () => generateClassicHTML(resumeData, theme),
    creative: () => generateCreativeHTML(resumeData, theme),
    executive: () => generateClassicHTML(resumeData, theme), // Use classic as fallback  
    minimalist: () => generateClassicHTML(resumeData, theme), // Use classic as fallback
  };
  
  const generateHTML = templateGenerators[templateId as keyof typeof templateGenerators] || templateGenerators.modern;
  const htmlContent = generateHTML();
  
  console.log(`Generating PDF with PDFShift for template: ${templateId}, theme: ${themeId}`);
  console.log('Resume data structure:', JSON.stringify(resumeData, null, 2).substring(0, 1000) + '...');
  console.log('HTML content length:', htmlContent.length);

  const pdfShiftApiKey = Deno.env.get('PDFSHIFT_API_KEY');
  console.log('PDFShift API key available:', !!pdfShiftApiKey);
  console.log('PDFShift API key length:', pdfShiftApiKey ? pdfShiftApiKey.length : 0);
  
  if (!pdfShiftApiKey) {
    throw new Error('PDFShift API key not found. Please configure the PDFSHIFT_API_KEY secret.');
  }

  try {
    const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${pdfShiftApiKey}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: htmlContent,
        landscape: false,
        format: 'A4',
        margin: 10
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PDFShift API error:', response.status, errorText);
      throw new Error(`PDFShift API error: ${response.status}`);
    }

    const pdfBuffer = await response.arrayBuffer();
    console.log(`PDF generated successfully, size: ${pdfBuffer.byteLength} bytes`);
    return new Uint8Array(pdfBuffer);
   } catch (error) {
     console.error('Error generating PDF with PDFShift:', error);
     throw new Error(`PDF generation failed: ${error.message}`);
   }
}

function convertToTextResume(resumeData: any): string {
  let resume = "ENHANCED RESUME\n";
  resume += "================\n\n";
  
  // Clean text function to handle potential undefined values
  const cleanText = (text: any) => {
    if (typeof text === 'string') return text;
    if (typeof text === 'object' && text !== null) return JSON.stringify(text);
    return String(text || '');
  };
  
  // Header
  if (resumeData.name) {
    resume += cleanText(resumeData.name).toUpperCase() + "\n";
    resume += "=".repeat(cleanText(resumeData.name).length) + "\n\n";
  }
  
  if (resumeData.title) {
    resume += cleanText(resumeData.title) + "\n\n";
  }
  
  // Contact Info
  if (resumeData.email || resumeData.phone || resumeData.location) {
    resume += "CONTACT INFORMATION\n";
    resume += "-".repeat(19) + "\n";
    if (resumeData.email) resume += "Email: " + cleanText(resumeData.email) + "\n";
    if (resumeData.phone) resume += "Phone: " + cleanText(resumeData.phone) + "\n";
    if (resumeData.location) resume += "Location: " + cleanText(resumeData.location) + "\n";
    if (resumeData.linkedin) resume += "LinkedIn: " + cleanText(resumeData.linkedin) + "\n";
    resume += "\n";
  }
  
  // Summary
  if (resumeData.summary) {
    resume += "PROFESSIONAL SUMMARY\n";
    resume += "-".repeat(20) + "\n";
    resume += cleanText(resumeData.summary) + "\n\n";
  }
  
  // Experience
  if (resumeData.experience && Array.isArray(resumeData.experience) && resumeData.experience.length > 0) {
    resume += "PROFESSIONAL EXPERIENCE\n";
    resume += "-".repeat(23) + "\n";
    resumeData.experience.forEach((exp: any) => {
      if (exp.title || exp.position) resume += cleanText(exp.title || exp.position) + "\n";
      if (exp.company) resume += cleanText(exp.company) + "\n";
      if (exp.duration || exp.dates) resume += cleanText(exp.duration || exp.dates) + "\n";
      if (exp.description || exp.responsibilities) {
        resume += cleanText(exp.description || exp.responsibilities) + "\n";
      }
      resume += "\n";
    });
  }
  
  // Education
  if (resumeData.education && Array.isArray(resumeData.education) && resumeData.education.length > 0) {
    resume += "EDUCATION\n";
    resume += "-".repeat(9) + "\n";
    resumeData.education.forEach((edu: any) => {
      if (edu.degree || edu.qualification) resume += cleanText(edu.degree || edu.qualification) + "\n";
      if (edu.institution || edu.school) resume += cleanText(edu.institution || edu.school) + "\n";
      if (edu.year || edu.duration) resume += cleanText(edu.year || edu.duration) + "\n";
      if (edu.gpa) resume += "GPA: " + cleanText(edu.gpa) + "\n";
      resume += "\n";
    });
  }
  
  // Skills
  if (resumeData.skills && Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
    resume += "SKILLS\n";
    resume += "-".repeat(6) + "\n";
    resume += resumeData.skills.map((skill: string) => cleanText(skill)).join(", ") + "\n\n";
  }

  return resume;
}

function sanitizeFilename(filename: string): string {
  // Remove or replace invalid characters for filenames
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 100); // Limit length
}

serve(async (req) => {
  console.log('PDF Generation function started');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      paymentId, 
      enhancedContent, 
      templateId = 'modern', 
      themeId = 'navy',
      fileName = 'Enhanced_Resume',
      hasEnhancedContent = false
    } = await req.json();

    console.log('Received request:', {
      paymentId: paymentId ? `${paymentId.slice(0, 10)}...` : 'none',
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
      
      // First try to find by razorpay_payment_id if it looks like a Razorpay ID
      let payment = null;
      let error = null;
      
      if (paymentId.startsWith('pay_')) {
        console.log('Searching by razorpay_payment_id:', paymentId);
        const result = await supabase
          .from('payments')
          .select('enhanced_content, theme_id, file_name')
          .eq('razorpay_payment_id', paymentId)
          .maybeSingle();
          
        if (result.error || !result.data) {
          console.log('Payment not found by razorpay_payment_id, trying recent completed payments...');
          // Try to find the most recent completed payment
          const fallbackResult = await supabase
            .from('payments')
            .select('enhanced_content, theme_id, file_name')
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          payment = fallbackResult.data;
          error = fallbackResult.error;
        } else {
          payment = result.data;
          error = result.error;
        }
      } else {
        console.log('Searching by UUID:', paymentId);
        const result = await supabase
          .from('payments')
          .select('enhanced_content, theme_id, file_name')
          .eq('id', paymentId)
          .maybeSingle();
        payment = result.data;
        error = result.error;
      }

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
    console.log('Resume data keys:', Object.keys(resumeData));
    console.log('Experience entries:', resumeData.experience ? resumeData.experience.length : 0);
    console.log('Education entries:', resumeData.education ? resumeData.education.length : 0);
    console.log('Skills count:', resumeData.skills ? resumeData.skills.length : 0);
    
    // Generate PDF
    console.log('Generating PDF with PDFShift...');
    const pdfBytes = await generatePDFWithPDFShift(resumeData, templateId, themeId);
    
    console.log(`PDF generated successfully from direct content, size: ${pdfBytes.length} bytes`);

    // Check if we got text fallback (when API key is missing)
    const isTextFallback = pdfBytes.length < 10000 && 
      new TextDecoder().decode(pdfBytes.slice(0, 100)).includes('ENHANCED RESUME');
    
    if (isTextFallback) {
      const cleanFilename = sanitizeFilename(fileName);
      return new Response(pdfBytes, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${cleanFilename}.txt"`,
        },
      });
    }

    const cleanFilename = sanitizeFilename(fileName);
    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${cleanFilename}.pdf"`,
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