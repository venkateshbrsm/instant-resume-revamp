import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: 'No file uploaded' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const iLovePdfPublicKey = Deno.env.get('ILOVEPDF_API_KEY') || Deno.env.get('ILovePDF_PUBLIC_KEY');

    console.log('Environment check:', {
      hasKey: !!iLovePdfPublicKey,
      keyLength: iLovePdfPublicKey?.length || 0,
      keyPrefix: iLovePdfPublicKey?.substring(0, 10) || 'none'
    });

    if (!iLovePdfPublicKey) {
      console.error('iLovePDF public key not found');
      return new Response(
        JSON.stringify({ success: false, error: 'iLovePDF API key not configured' }),
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
    
    // Test if the API key works with a simpler endpoint first
    const testRes = await fetch("https://api.ilovepdf.com/v1/auth", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${iLovePdfPublicKey}`,
      },
    });
    
    console.log("Auth test response status:", testRes.status);
    const testText = await testRes.text();
    console.log("Auth test response:", testText);
    
    // Now try the actual extract endpoint
    const startRes = await fetch("https://api.ilovepdf.com/v1/start/extract", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${iLovePdfPublicKey}`,
        "Content-Type": "application/json",
      },
    });
    
    console.log("Start response status:", startRes.status);
    console.log("Start response statusText:", startRes.statusText);
    console.log("Start response headers:", Object.fromEntries(startRes.headers.entries()));
    
    // Get the response text first to see what we're dealing with
    const responseText = await startRes.text();
    console.log("Raw response text length:", responseText.length);
    console.log("Raw response text:", responseText);
    
    // Check if response is empty
    if (!responseText || responseText.trim() === '') {
      console.error("Empty response from iLovePDF API");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Empty response from iLovePDF API. Status: ${startRes.status} ${startRes.statusText}. Auth test status: ${testRes.status}` 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let startData;
    try {
      startData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Response was:", responseText);
      return new Response(
        JSON.stringify({ success: false, error: `Invalid JSON response from iLovePDF: ${responseText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Parsed startData:", startData);

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