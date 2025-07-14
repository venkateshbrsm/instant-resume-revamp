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
    console.log('Starting to process request...');
    
    // Get environment variables
    const iLovePdfPublicKey = Deno.env.get('ILOVEPDF_PUBLIC_KEY') || 
                              Deno.env.get('ILovePDF_PUBLIC_KEY') || 
                              Deno.env.get('ILOVEPDF_API_KEY');
    
    console.log('Environment variables check:', {
      hasPublicKey: !!iLovePdfPublicKey,
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

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // 1️⃣ Start task for PDF to Word conversion
    console.log('Starting iLovePDF task...');
    const startRes = await fetch("https://api.ilovepdf.com/v1/start/pdf2word", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${iLovePdfPublicKey}`,
        "Content-Type": "application/json",
      },
    });

    const startText = await startRes.text();
    console.log("Start task status:", startRes.status);
    console.log("Start task response:", startText);

    let startData;
    try {
      startData = JSON.parse(startText);
    } catch (e) {
      console.error("Failed to parse start task response:", e);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to parse iLovePDF response" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!startData || !startData.task || !startData.server) {
      console.error("Failed to start task or invalid response:", startData);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to start task with iLovePDF" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { task, server } = startData;
    console.log("Task ID:", task, "Server:", server);

    // 2️⃣ Upload file to assigned server
    console.log('Uploading file to iLovePDF server...');
    const uploadForm = new FormData();
    uploadForm.append("task", task);
    uploadForm.append("file", new Blob([uint8Array]), file.name || "file.pdf");

    const uploadUrl = `https://${server}.ilovepdf.com/v1/upload`;
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      body: uploadForm,
    });

    const uploadText = await uploadRes.text();
    console.log("Upload status:", uploadRes.status);
    console.log("Upload response:", uploadText);

    let uploadData;
    try {
      uploadData = JSON.parse(uploadText);
    } catch (e) {
      console.error("Failed to parse upload response:", e);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to parse upload response" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!uploadData || !uploadData.server_filename) {
      console.error("Failed to upload file or invalid response:", uploadData);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to upload file to iLovePDF" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3️⃣ Process task
    console.log('Processing conversion task...');
    const processRes = await fetch("https://api.ilovepdf.com/v1/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task }),
    });

    const processText = await processRes.text();
    console.log("Process status:", processRes.status);
    console.log("Process response:", processText);

    let processData;
    try {
      processData = JSON.parse(processText);
    } catch (e) {
      console.error("Failed to parse process response:", e);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to parse process response" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!processData || processData.status !== "TaskSuccess") {
      console.error("Failed to process task:", processData);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to process file with iLovePDF" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4️⃣ Download converted Word file
    console.log('Downloading converted file...');
    const downloadRes = await fetch(`https://api.ilovepdf.com/v1/download/${task}`);
    
    if (!downloadRes.ok) {
      console.error("Failed to download converted file:", downloadRes.status);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to download converted file" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const convertedFileBuffer = await downloadRes.arrayBuffer();
    console.log('Downloaded converted file, size:', convertedFileBuffer.byteLength);

    // For now, return a success message indicating the conversion worked
    // In a real implementation, you'd extract text from the Word document here
    const extractedText = `PDF successfully converted to Word format using iLovePDF Direct API. 
Original file: ${file.name}
Converted file size: ${convertedFileBuffer.byteLength} bytes
Task ID: ${task}

Note: Text extraction from the converted Word document would require additional processing.`;
    
    console.log('Process completed successfully');

    // Return the result
    return new Response(
      JSON.stringify({
        success: true,
        extractedText: extractedText,
        originalFileName: file.name,
        method: 'iLovePDF Direct API',
        taskId: task,
        convertedFileSize: convertedFileBuffer.byteLength
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
        error: err.message || 'Internal server error',
        details: err.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});