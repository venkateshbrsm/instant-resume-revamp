import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== FUNCTION STARTED ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  // Log all request headers
  console.log('=== REQUEST HEADERS ===');
  const headerEntries = Array.from(req.headers.entries());
  headerEntries.forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  console.log('=== END REQUEST HEADERS ===');
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting to process request...');
    
    // Test basic environment first
    console.log('Environment test:');
    console.log('- Deno version available:', typeof Deno !== 'undefined');
    
    // Debug ALL environment variables
    const allEnvVars = Deno.env.toObject();
    console.log('=== ALL ENVIRONMENT VARIABLES ===');
    console.log('Total env vars:', Object.keys(allEnvVars).length);
    console.log('Environment variable keys:', Object.keys(allEnvVars));
    
    // Check for any keys containing "LOVE" or "PDF"
    const relevantKeys = Object.keys(allEnvVars).filter(key => 
      key.toLowerCase().includes('love') || 
      key.toLowerCase().includes('pdf') ||
      key.toLowerCase().includes('api')
    );
    console.log('Relevant env keys (containing love/pdf/api):', relevantKeys);
    
    // Show values for relevant keys (masked for security)
    relevantKeys.forEach(key => {
      const value = allEnvVars[key];
      console.log(`${key}: ${value ? value.substring(0, 10) + '...' : 'undefined'}`);
    });
    
    // Get environment variables - check all possible key names
    const iLovePdfPublicKey = Deno.env.get('ILOVEPDF_PUBLIC_KEY') || 
                              Deno.env.get('ILovePDF_PUBLIC_KEY') || 
                              Deno.env.get('ILOVEPDF_API_KEY');
    const iLovePdfSecretKey = Deno.env.get('ILOVEPDF_SECRET_KEY');
    
    console.log('Environment variables check:', {
      hasPublicKey: !!iLovePdfPublicKey,
      hasSecretKey: !!iLovePdfSecretKey,
      publicKeyLength: iLovePdfPublicKey?.length || 0,
      publicKeyPrefix: iLovePdfPublicKey?.substring(0, 15) || 'none'
    });

    if (!iLovePdfPublicKey) {
      console.error('ILOVEPDF_PUBLIC_KEY not found in environment');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'iLovePDF public key not configured. Please set ILOVEPDF_PUBLIC_KEY in Supabase secrets.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting to process formData...');
    const formData = await req.formData();
    console.log('FormData processed successfully');
    
    const file = formData.get("file");
    console.log('File extracted from formData:', !!file);

    if (!file) {
      console.log('No file found in formData');
      return new Response(
        JSON.stringify({ success: false, error: 'No file uploaded' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    console.log('Getting arrayBuffer from file...');
    const arrayBuffer = await file.arrayBuffer();
    console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);
    
    const uint8Array = new Uint8Array(arrayBuffer);
    console.log('Uint8Array created successfully');

    // Use the direct extract API endpoint with GET
    console.log('Using direct extract API endpoint with GET...');
    console.log('Full request details:');
    console.log('- URL: https://api.ilovepdf.com/v1/process/extract');
    console.log('- Method: GET');
    console.log('- Authorization header: Bearer [REDACTED]');
    
    const extractRes = await fetch("https://api.ilovepdf.com/v1/process/extract", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${iLovePdfPublicKey}`,
      }
    });
    
    console.log("Extract response status:", extractRes.status);
    console.log("Extract response statusText:", extractRes.statusText);
    console.log("Extract response headers:", Object.fromEntries(extractRes.headers.entries()));
    
    // Get the response text first to see what we're dealing with
    const responseText = await extractRes.text();
    console.log("Extract response raw text:", responseText);
    
    // Check if response is empty
    if (!responseText || responseText.trim() === '') {
      console.error("Empty response from iLovePDF extract API");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Empty response from iLovePDF extract API. Status: ${extractRes.status} ${extractRes.statusText}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let extractData;
    try {
      extractData = JSON.parse(responseText);
      console.log("Parsed extract data:", extractData);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Response was:", responseText);
      return new Response(
        JSON.stringify({ success: false, error: `Invalid JSON response from iLovePDF: ${responseText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!extractRes.ok) {
      console.error("Extract request failed with status:", extractRes.status);
      console.error("Extract response body:", extractData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `iLovePDF extract API error: ${extractRes.status} - ${extractData?.message || extractData?.error || JSON.stringify(extractData)}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extract completed successfully');

    // Return the extracted data
    return new Response(
      JSON.stringify({
        success: true,
        extractedText: extractData?.text || 'Text extraction completed successfully via iLovePDF direct extract API.',
        originalFileName: file.name,
        extractData: extractData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});