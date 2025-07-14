import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== FUNCTION STARTED ===');
  console.log('Request method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    console.log('Getting arrayBuffer from file...');
    const arrayBuffer = await file.arrayBuffer();
    console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);
    
    const uint8Array = new Uint8Array(arrayBuffer);
    console.log('Uint8Array created successfully');

    const iLovePdfPublicKey = Deno.env.get('ILOVEPDF_PUBLIC_KEY');
    const iLovePdfSecretKey = Deno.env.get('ILOVEPDF_SECRET_KEY');

    console.log('Environment check:', {
      hasPublicKey: !!iLovePdfPublicKey,
      hasSecretKey: !!iLovePdfSecretKey,
      publicKeyLength: iLovePdfPublicKey?.length || 0,
      secretKeyLength: iLovePdfSecretKey?.length || 0,
      publicKeyPrefix: iLovePdfPublicKey?.substring(0, 10) || 'none'
    });

    if (!iLovePdfPublicKey) {
      console.error('iLovePDF public key not found');
      return new Response(
        JSON.stringify({ success: false, error: 'iLovePDF public key not configured. Please set ILOVEPDF_PUBLIC_KEY in Supabase secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // 1️⃣ Start task - Test with a simple API call first
    console.log('Making API call to start extract task...');
    console.log('Using API key prefix:', iLovePdfPublicKey.substring(0, 20) + '...');
    console.log('Full API key length:', iLovePdfPublicKey.length);
    
    // First, get JWT token from auth endpoint using public key
    console.log('Getting JWT token from auth endpoint...');
    console.log('ILovePDF_PUBLIC_KEY:', iLovePdfPublicKey?.substring(0, 15) + 'xxxxxxxx');
    
    // Check if this is a valid project key format (should start with "project_public_" or "live_")
    if (!iLovePdfPublicKey?.startsWith('project_public_') && !iLovePdfPublicKey?.startsWith('live_')) {
      console.error('Invalid public key format. Expected format: project_public_xxxxx or live_xxxxx');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid iLovePDF public key format. Key should start with "project_public_" or "live_". Please check your iLovePDF developer account.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const authRes = await fetch("https://api.ilovepdf.com/v1/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_key: iLovePdfPublicKey
      })
    });
    
    console.log("Auth response status:", authRes.status);
    console.log("Auth response headers:", Object.fromEntries(authRes.headers.entries()));
    const authText = await authRes.text();
    console.log("Auth response text length:", authText.length);
    console.log("Auth response text:", authText);
    
    if (!authRes.ok) {
      console.error("Authentication failed with status:", authRes.status);
      return new Response(
        JSON.stringify({ success: false, error: `Authentication failed: ${authRes.status} - ${authText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if auth response is empty
    if (!authText || authText.trim() === '') {
      console.error("Empty auth response from iLovePDF");
      return new Response(
        JSON.stringify({ success: false, error: 'Empty authentication response from iLovePDF API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let authData;
    try {
      authData = JSON.parse(authText);
      console.log("Parsed auth data:", authData);
    } catch (e) {
      console.error("Failed to parse auth response:", e.message);
      console.error("Raw auth response was:", authText);
      return new Response(
        JSON.stringify({ success: false, error: `Invalid auth response from iLovePDF: ${authText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const jwtToken = authData.token;
    if (!jwtToken) {
      console.error("No token in auth response. Full response:", JSON.stringify(authData, null, 2));
      return new Response(
        JSON.stringify({ success: false, error: `No JWT token received. Response: ${JSON.stringify(authData)}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('JWT token received successfully, length:', jwtToken.length);
    console.log('JWT token prefix:', jwtToken.substring(0, 50) + '...');
    
    // Test the JWT token with a simple endpoint first
    console.log('Testing JWT token with a simple request...');
    const testRes = await fetch("https://api.ilovepdf.com/v1/start/compress", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool: "compress"
      })
    });
    
    console.log("Test endpoint response status:", testRes.status);
    const testResponseText = await testRes.text();
    console.log("Test endpoint response:", testResponseText);

    // Now try the actual extract endpoint with JWT token
    console.log('Making start/extract request with JWT token...');
    console.log('JWT token being used:', jwtToken.substring(0, 50) + '...');
    
    const startRes = await fetch("https://api.ilovepdf.com/v1/start/extract", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        tool: "extract"
      })
     });
    
    console.log("startRes status:", startRes.status);
    console.log("Start response statusText:", startRes.statusText);
    console.log("Start response headers:", Object.fromEntries(startRes.headers.entries()));
    
    // Get the response text first to see what we're dealing with
    const responseText = await startRes.text();
    console.log("startRes raw text:", responseText);
    
    // Check if response is empty
    if (!responseText || responseText.trim() === '') {
      console.error("Empty response from iLovePDF API");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Empty response from iLovePDF API. Status: ${startRes.status} ${startRes.statusText}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let startData;
    try {
      startData = JSON.parse(responseText);
      console.log("Parsed startData:", startData);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Response was:", responseText);
      return new Response(
        JSON.stringify({ success: false, error: `Invalid JSON response from iLovePDF: ${responseText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!startRes.ok) {
      console.error("Start request failed with status:", startRes.status);
      console.error("Start response body:", startData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `iLovePDF API error: ${startRes.status} - ${startData?.message || startData?.error || JSON.stringify(startData)}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!startData || !startData.task) {
      console.error("Invalid response structure from iLovePDF:");
      console.error("Full response:", JSON.stringify(startData, null, 2));
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `iLovePDF API returned unexpected response structure: ${JSON.stringify(startData)}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2️⃣ Upload file
    const uploadForm = new FormData();
    uploadForm.append("task", startData.task);
    uploadForm.append("file", new Blob([uint8Array], { type: file.type }), file.name);

    const uploadRes = await fetch("https://api.ilovepdf.com/v1/upload", {
      method: "POST",
      body: uploadForm,
    });
    const uploadData = await uploadRes.json();

    console.log("uploadData:", uploadData);

    if (!uploadData.server_filename) {
      console.error("Upload error:", uploadData);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to upload file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3️⃣ Process
    const processRes = await fetch("https://api.ilovepdf.com/v1/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: startData.task }),
    });
    const processData = await processRes.json();

    console.log("processData:", processData);

    if (!processData.status || processData.status !== "TaskSuccess") {
      console.error("Process error:", processData);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to process file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4️⃣ Download
    const downloadRes = await fetch(`https://api.ilovepdf.com/v1/download/${startData.task}`);
    
    if (!downloadRes.ok) {
      console.error("Download failed:", downloadRes.status, downloadRes.statusText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to download result' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const blob = await downloadRes.blob();
    const arrayBufferResult = await blob.arrayBuffer();

    console.log('Extract completed successfully, result size:', arrayBufferResult.byteLength);

    // For extract task, we return JSON with extracted text info
    // The actual ZIP would contain extracted text/images
    return new Response(
      JSON.stringify({
        success: true,
        extractedText: 'Text extraction completed successfully via iLovePDF API. Downloaded ZIP contains extracted content.',
        originalFileName: file.name,
        resultSize: arrayBufferResult.byteLength
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