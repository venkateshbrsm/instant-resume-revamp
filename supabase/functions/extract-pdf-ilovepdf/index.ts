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

    // Step 1: Start extract task
    console.log('Step 1: Starting extract task...');
    const startRes = await fetch("https://api.ilovepdf.com/v1/start/extract", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${iLovePdfPublicKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });
    
    const text = await startRes.text();
    console.log("startRes status:", startRes.status);
    console.log("startRes raw text:", text);

    let startData = null;
    try {
      startData = JSON.parse(text);
    } catch (e) {
      console.error("JSON parse error:", e);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to parse JSON response: ${e.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!startData || !startData.task) {
      console.error("Failed to start task or invalid response:", startData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to start extract task: ${startRes.status} - Invalid response structure` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { task, server } = startData;
    console.log("Task:", task, "Server:", server);
    
    if (!task) {
      console.error("No task ID received from start endpoint");
      return new Response(
        JSON.stringify({ success: false, error: "No task ID received from iLovePDF" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Upload PDF file
    console.log('Step 2: Uploading PDF file...');
    const uploadFormData = new FormData();
    uploadFormData.append("task", task);
    uploadFormData.append("file", file);

    const uploadRes = await fetch("https://api.ilovepdf.com/v1/upload", {
      method: "POST",
      body: uploadFormData
    });
    
    console.log("Upload response status:", uploadRes.status);
    console.log("Upload response statusText:", uploadRes.statusText);
    
    if (!uploadRes.ok) {
      const uploadError = await uploadRes.text();
      console.error("Upload failed:", uploadError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to upload file: ${uploadRes.status} - ${uploadError}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const uploadData = await uploadRes.json();
    console.log("Upload data:", uploadData);

    // Step 3: Process the file
    console.log('Step 3: Processing file...');
    const processRes = await fetch("https://api.ilovepdf.com/v1/process", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task })
    });
    
    console.log("Process response status:", processRes.status);
    console.log("Process response statusText:", processRes.statusText);
    
    if (!processRes.ok) {
      const processError = await processRes.text();
      console.error("Process failed:", processError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to process file: ${processRes.status} - ${processError}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const processData = await processRes.json();
    console.log("Process data:", processData);

    // Step 4: Download/get the extracted text
    console.log('Step 4: Getting extracted text...');
    const downloadRes = await fetch(`https://api.ilovepdf.com/v1/download/${task}`);
    
    console.log("Download response status:", downloadRes.status);
    console.log("Download response statusText:", downloadRes.statusText);
    
    if (!downloadRes.ok) {
      const downloadError = await downloadRes.text();
      console.error("Download failed:", downloadError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to download result: ${downloadRes.status} - ${downloadError}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const extractedText = await downloadRes.text();
    console.log('Extract completed successfully, text length:', extractedText.length);

    // Return the extracted text
    return new Response(
      JSON.stringify({
        success: true,
        extractedText: extractedText || 'Text extraction completed successfully via iLovePDF.',
        originalFileName: file.name,
        taskId: task
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