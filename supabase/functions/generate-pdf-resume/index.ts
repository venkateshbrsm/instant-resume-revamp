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

function createSimplePDF(resumeData: any, themeId: string = 'navy'): Uint8Array {
  const theme = colorThemes[themeId as keyof typeof colorThemes] || colorThemes.navy;
  
  // Create a simple PDF-like structure using plain text
  const content = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Resources <<
/Font <<
/F1 4 0 R
/F2 5 0 R
>>
>>
/Contents 6 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

6 0 obj
<<
/Length 2000
>>
stream
BT
/F1 24 Tf
50 750 Td
(${(resumeData.name || 'Enhanced Resume').replace(/[()\\]/g, '')}) Tj
0 -30 Td
/F1 16 Tf
(${(resumeData.title || '').replace(/[()\\]/g, '')}) Tj
0 -40 Td
/F2 12 Tf
(Email: ${(resumeData.email || '').replace(/[()\\]/g, '')}) Tj
0 -20 Td
(Phone: ${(resumeData.phone || '').replace(/[()\\]/g, '')}) Tj
0 -20 Td
(Location: ${(resumeData.location || '').replace(/[()\\]/g, '')}) Tj
0 -40 Td
/F1 14 Tf
(Professional Summary) Tj
0 -25 Td
/F2 10 Tf
${resumeData.summary ? resumeData.summary.replace(/[()\\]/g, '').substring(0, 500).split(' ').map((word: string, index: number) => {
    if (index > 0 && index % 10 === 0) return `0 -12 Td\n(${word}`;
    return word;
  }).join(' ') + ')' : '(No summary available)'}
0 -40 Td
/F1 14 Tf
(Professional Experience) Tj
${resumeData.experience ? resumeData.experience.slice(0, 3).map((exp: any, index: number) => `
0 -25 Td
/F1 12 Tf
(${(exp.title || '').replace(/[()\\]/g, '')}) Tj
0 -15 Td
/F2 10 Tf
(${(exp.company || '').replace(/[()\\]/g, '')} - ${(exp.duration || '').replace(/[()\\]/g, '')}) Tj
${exp.achievements ? exp.achievements.slice(0, 2).map((achievement: string) => `
0 -12 Td
(• ${achievement.replace(/[()\\]/g, '').substring(0, 60)}...) Tj`).join('') : ''}
`).join('') : ''}
0 -40 Td
/F1 14 Tf
(Skills) Tj
0 -20 Td
/F2 10 Tf
(${resumeData.skills ? resumeData.skills.slice(0, 15).join(', ').replace(/[()\\]/g, '') : 'No skills listed'}) Tj
${resumeData.education ? `
0 -40 Td
/F1 14 Tf
(Education) Tj
${resumeData.education.slice(0, 3).map((edu: any) => `
0 -20 Td
/F1 11 Tf
(${(edu.degree || '').replace(/[()\\]/g, '')}) Tj
0 -12 Td
/F2 10 Tf
(${(edu.institution || '').replace(/[()\\]/g, '')} - ${(edu.year || '').replace(/[()\\]/g, '')}) Tj`).join('')}` : ''}
ET
endstream
endobj

xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000268 00000 n 
0000000343 00000 n 
0000000413 00000 n 
trailer
<<
/Size 7
/Root 1 0 R
>>
startxref
2500
%%EOF`;

  return new TextEncoder().encode(content);
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

    console.log("Generating simple PDF from resume data...");
    const themeId = payment.theme_id || 'navy';
    
    console.log("Creating PDF document...");
    const pdfBuffer = createSimplePDF(payment.enhanced_content, themeId);
    
    console.log(`Generated PDF, size: ${pdfBuffer.byteLength} bytes`);
    
    const fileName = `enhanced_${payment.file_name.replace(/\.[^/.]+$/, '.pdf')}`;
    
    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
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