import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Theme color mapping
const themeColors = {
  navy: { primary: '#1e3a8a', secondary: '#1e40af', accent: '#3b82f6' },
  charcoal: { primary: '#374151', secondary: '#1f2937', accent: '#6b7280' },
  burgundy: { primary: '#7c2d12', secondary: '#991b1b', accent: '#dc2626' },
  forest: { primary: '#166534', secondary: '#15803d', accent: '#22c55e' },
  bronze: { primary: '#a16207', secondary: '#ca8a04', accent: '#eab308' },
  slate: { primary: '#475569', secondary: '#334155', accent: '#64748b' }
};

function getThemeColors(themeId: string) {
  const theme = themeColors[themeId as keyof typeof themeColors] || themeColors.navy;
  return {
    primary: theme.primary.replace('#', ''),
    secondary: theme.secondary.replace('#', ''),
    accent: theme.accent.replace('#', '')
  };
}

// Clean text function to remove special characters
const cleanText = (text: string) => {
  if (!text) return '';
  return text
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[—–]/g, '-')
    .replace(/[…]/g, '...')
    .replace(/[•]/g, '*')
    .replace(/[\u00A0]/g, ' ')
    .replace(/[\u2000-\u206F]/g, ' ')
    .replace(/[\u2070-\u209F]/g, '')
    .replace(/[\uFEFF]/g, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s.,;:()?!@#$%&*+=\-'"/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

async function generateResumeText(resumeData: any): Promise<string> {
  let content = '';
  
  // Header
  content += `${cleanText(resumeData.name || "Professional Resume")}\n`;
  content += `${cleanText(resumeData.title || "Professional")}\n`;
  content += '='.repeat(60) + '\n\n';
  
  // Contact Information
  content += 'CONTACT INFORMATION\n';
  content += '-'.repeat(20) + '\n';
  if (resumeData.email) content += `Email: ${resumeData.email}\n`;
  if (resumeData.phone) content += `Phone: ${resumeData.phone}\n`;
  if (resumeData.location) content += `Location: ${resumeData.location}\n`;
  content += '\n';
  
  // Professional Summary
  if (resumeData.summary) {
    content += 'PROFESSIONAL SUMMARY\n';
    content += '-'.repeat(20) + '\n';
    content += `${cleanText(resumeData.summary)}\n\n`;
  }
  
  // Professional Experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    content += 'PROFESSIONAL EXPERIENCE\n';
    content += '-'.repeat(25) + '\n';
    
    resumeData.experience.forEach((exp: any, index: number) => {
      content += `${cleanText(exp.title || "Position")}\n`;
      content += `${cleanText(exp.company || "Company")} | ${cleanText(exp.duration || "Duration")}\n`;
      
      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach((achievement: string) => {
          content += `• ${cleanText(achievement)}\n`;
        });
      }
      
      if (index < resumeData.experience.length - 1) {
        content += '\n';
      }
    });
    content += '\n';
  }
  
  // Skills
  if (resumeData.skills && resumeData.skills.length > 0) {
    content += 'SKILLS\n';
    content += '-'.repeat(6) + '\n';
    content += `${resumeData.skills.map((skill: string) => cleanText(skill)).join(' • ')}\n\n`;
  }
  
  // Education
  if (resumeData.education && resumeData.education.length > 0) {
    content += 'EDUCATION\n';
    content += '-'.repeat(9) + '\n';
    
    resumeData.education.forEach((edu: any) => {
      content += `${cleanText(edu.degree || "Degree")}\n`;
      content += `${cleanText(edu.institution || "Institution")} | ${cleanText(edu.year || "Year")}\n\n`;
    });
  }
  
  // Footer
  content += '='.repeat(60) + '\n';
  content += 'Enhanced by AI • Professional Resume\n';
  
  return content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting free download...");

    const { fileName, resumeData, themeId } = await req.json();
    console.log("Generating DOCX for:", fileName);

    if (!resumeData) {
      throw new Error("Resume data is required");
    }

    // Generate text content
    const textContent = await generateResumeText(resumeData);
    const cleanFileName = `enhanced_${fileName.replace(/\.[^/.]+$/, '.txt')}`;
    const buffer = new TextEncoder().encode(textContent);
    
    console.log(`Generated text file, size: ${buffer.byteLength} bytes`);
    
    return new Response(buffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${cleanFileName}"`,
        'Content-Length': buffer.byteLength.toString(),
      },
      status: 200,
    });
  } catch (error) {
    console.error('Free download error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});