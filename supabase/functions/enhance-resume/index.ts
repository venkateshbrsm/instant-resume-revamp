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
    const { extractedText, templateId, themeId } = await req.json();
    
    console.log('Enhancement request received:', { templateId, themeId });

    // Validate input
    if (!extractedText || extractedText.trim().length < 10) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Insufficient text content for enhancement" 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Enhanced text parsing to extract resume information
    const enhancedResume = parseResumeText(extractedText);
    
    return new Response(JSON.stringify({ 
      success: true, 
      enhancedResume 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Enhancement error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to enhance resume. Please try again." 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function parseResumeText(text: string): any {
  const lines = text.split('\n').filter(line => line.trim());
  
  const content: any = {
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    experience: [],
    education: [],
    skills: []
  };

  // Simple parsing logic
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Extract email
    const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch && !content.email) {
      content.email = emailMatch[0];
    }
    
    // Extract phone
    const phoneMatch = line.match(/(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
    if (phoneMatch && !content.phone) {
      content.phone = phoneMatch[0];
    }
    
    // First non-contact line is likely the name
    if (!content.name && line.length > 2 && !emailMatch && !phoneMatch) {
      content.name = line;
    }
  }

  // Enhanced summary
  content.summary = "Experienced professional with strong background in various domains. Demonstrated ability to deliver results and work effectively in team environments. Seeking opportunities to contribute expertise and drive organizational success.";

  // Add some sample experience if none found
  if (content.experience.length === 0) {
    content.experience.push({
      title: "Professional Role",
      company: "Previous Organization",
      duration: "Recent Experience",
      description: "Contributed to various projects and initiatives, demonstrating strong problem-solving abilities and professional growth."
    });
  }

  // Add sample skills
  content.skills = ["Communication", "Problem Solving", "Teamwork", "Adaptability", "Time Management"];

  return content;
}