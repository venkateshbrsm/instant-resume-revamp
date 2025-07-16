import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// HTML template for the enhanced resume
function generateResumeHTML(resumeData: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${resumeData.name} - Resume</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px;
            background: #fff;
        }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .name { 
            font-size: 2.5em; 
            font-weight: bold; 
            color: #1f2937; 
            margin-bottom: 10px; 
        }
        .title { 
            font-size: 1.3em; 
            color: #2563eb; 
            margin-bottom: 15px; 
        }
        .contact { 
            display: flex; 
            justify-content: center; 
            gap: 20px; 
            flex-wrap: wrap; 
            font-size: 0.95em; 
            color: #666; 
        }
        .section { 
            margin-bottom: 25px; 
        }
        .section-title { 
            font-size: 1.3em; 
            font-weight: bold; 
            color: #1f2937; 
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 5px; 
            margin-bottom: 15px; 
        }
        .summary { 
            background: #f9fafb; 
            padding: 20px; 
            border-radius: 8px; 
            border-left: 4px solid #2563eb; 
            font-style: italic; 
        }
        .experience-item { 
            margin-bottom: 20px; 
            padding: 15px; 
            border: 1px solid #e5e7eb; 
            border-radius: 6px; 
        }
        .job-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 10px; 
            flex-wrap: wrap; 
        }
        .job-title { 
            font-weight: bold; 
            color: #1f2937; 
            font-size: 1.1em; 
        }
        .company { 
            color: #2563eb; 
            font-weight: 600; 
        }
        .duration { 
            color: #666; 
            font-size: 0.9em; 
        }
        .achievements { 
            list-style-type: none; 
            padding-left: 0; 
        }
        .achievements li { 
            margin-bottom: 5px; 
            padding-left: 20px; 
            position: relative; 
        }
        .achievements li:before { 
            content: "▸"; 
            color: #2563eb; 
            position: absolute; 
            left: 0; 
        }
        .skills { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 10px; 
        }
        .skill-tag { 
            background: #dbeafe; 
            color: #1d4ed8; 
            padding: 5px 12px; 
            border-radius: 20px; 
            font-size: 0.9em; 
            font-weight: 500; 
        }
        .education-item { 
            margin-bottom: 15px; 
            padding: 12px; 
            background: #f9fafb; 
            border-radius: 6px; 
        }
        .degree { 
            font-weight: bold; 
            color: #1f2937; 
        }
        .institution { 
            color: #2563eb; 
            margin-top: 5px; 
        }
        .year { 
            color: #666; 
            font-size: 0.9em; 
        }
        
        @media print {
            body { padding: 20px; }
            .header { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="name">${resumeData.name || 'Professional Candidate'}</h1>
        <div class="title">${resumeData.title || 'Professional'}</div>
        <div class="contact">
            ${resumeData.email ? `<span>📧 ${resumeData.email}</span>` : ''}
            ${resumeData.phone ? `<span>📞 ${resumeData.phone}</span>` : ''}
            ${resumeData.location ? `<span>📍 ${resumeData.location}</span>` : ''}
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
            <div class="job-header">
                <div>
                    <div class="job-title">${exp.title || 'Position'}</div>
                    <div class="company">${exp.company || 'Company'}</div>
                </div>
                <div class="duration">${exp.duration || 'Duration'}</div>
            </div>
            ${exp.achievements && exp.achievements.length > 0 ? `
            <ul class="achievements">
                ${exp.achievements.map((achievement: string) => `<li>${achievement}</li>`).join('')}
            </ul>
            ` : ''}
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${resumeData.skills && resumeData.skills.length > 0 ? `
    <div class="section">
        <h2 class="section-title">Skills</h2>
        <div class="skills">
            ${resumeData.skills.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
    </div>
    ` : ''}

    ${resumeData.education && resumeData.education.length > 0 ? `
    <div class="section">
        <h2 class="section-title">Education</h2>
        ${resumeData.education.map((edu: any) => `
        <div class="education-item">
            <div class="degree">${edu.degree || 'Degree'}</div>
            <div class="institution">${edu.institution || 'Institution'}</div>
            <div class="year">${edu.year || 'Year'}</div>
        </div>
        `).join('')}
    </div>
    ` : ''}
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting enhanced resume download...");

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { paymentId } = await req.json();
    console.log("Payment ID:", paymentId);

    if (!paymentId) {
      throw new Error("Payment ID is required");
    }

    // Get payment details
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

    // For now, create a mock enhanced resume since we don't have the actual file processing pipeline
    // In a real implementation, you would:
    // 1. Retrieve the original file from storage
    // 2. Extract text from the file
    // 3. Call the enhance-resume function
    // 4. Generate the enhanced PDF

    const mockEnhancedResume = {
      name: payment.file_name.replace(/\.(pdf|docx|doc)$/i, '').replace(/[-_]/g, ' ').trim(),
      title: "Professional Developer",
      email: payment.email,
      phone: "+91 XXXXX XXXXX",
      location: "India",
      summary: "Experienced professional with a strong background in technology and innovation. Proven track record of delivering high-quality solutions and contributing to team success.",
      experience: [
        {
          title: "Software Developer",
          company: "Technology Company",
          duration: "2021 - Present",
          achievements: [
            "Developed and maintained web applications using modern technologies",
            "Collaborated with cross-functional teams to deliver project milestones",
            "Implemented best practices for code quality and performance optimization"
          ]
        }
      ],
      skills: [
        "JavaScript", "React", "Node.js", "Python", "SQL", "Git", 
        "Problem Solving", "Team Collaboration", "Project Management"
      ],
      education: [
        {
          degree: "Bachelor's Degree",
          institution: "University/College",
          year: "2020"
        }
      ]
    };

    // Generate HTML content
    const htmlContent = generateResumeHTML(mockEnhancedResume);
    
    // For demo purposes, return the HTML as a downloadable file
    // In production, you would convert this to PDF using a service like Puppeteer
    
    const fileName = `${mockEnhancedResume.name.replace(/\s+/g, '_')}_Enhanced_Resume.html`;
    
    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
      status: 200,
    });

  } catch (error) {
    console.error("Download error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});