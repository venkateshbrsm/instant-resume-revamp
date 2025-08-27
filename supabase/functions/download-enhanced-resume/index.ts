import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId, enhancedContent, themeId } = await req.json();
    
    console.log('Download request received for:', { paymentId, themeId });

    // Generate a simple text resume for now
    const resumeText = generateResumeText(enhancedContent);
    
    // Create text file blob
    const blob = new Blob([resumeText], { type: 'text/plain' });
    const arrayBuffer = await blob.arrayBuffer();
    
    return new Response(arrayBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="enhanced-resume.txt"',
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateResumeText(content: any): string {
  if (!content) {
    return "Enhanced Resume\n\nNo content available.";
  }

  let resume = "ENHANCED RESUME\n";
  resume += "=".repeat(50) + "\n\n";

  if (content.name) {
    resume += `Name: ${content.name}\n`;
  }
  
  if (content.email) {
    resume += `Email: ${content.email}\n`;
  }
  
  if (content.phone) {
    resume += `Phone: ${content.phone}\n`;
  }
  
  if (content.location) {
    resume += `Location: ${content.location}\n`;
  }
  
  resume += "\n";

  if (content.summary) {
    resume += "PROFESSIONAL SUMMARY\n";
    resume += "-".repeat(20) + "\n";
    resume += content.summary + "\n\n";
  }

  if (content.experience && content.experience.length > 0) {
    resume += "WORK EXPERIENCE\n";
    resume += "-".repeat(15) + "\n";
    content.experience.forEach((exp: any) => {
      resume += `${exp.title} at ${exp.company}\n`;
      if (exp.duration) resume += `Duration: ${exp.duration}\n`;
      if (exp.description) resume += `${exp.description}\n`;
      resume += "\n";
    });
  }

  if (content.education && content.education.length > 0) {
    resume += "EDUCATION\n";
    resume += "-".repeat(9) + "\n";
    content.education.forEach((edu: any) => {
      resume += `${edu.degree} from ${edu.institution}\n`;
      if (edu.year) resume += `Year: ${edu.year}\n`;
      resume += "\n";
    });
  }

  if (content.skills && content.skills.length > 0) {
    resume += "SKILLS\n";
    resume += "-".repeat(6) + "\n";
    resume += content.skills.join(", ") + "\n\n";
  }

  return resume;
}