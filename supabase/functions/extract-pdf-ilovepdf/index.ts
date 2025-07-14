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

    const iLovePdfPublicKey = Deno.env.get('ILOVEPDF_PUBLIC_KEY');

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

    // 1️⃣ Start task
    const startRes = await fetch("https://api.ilovepdf.com/v1/start/extract", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${iLovePdfPublicKey}`,
        "Content-Type": "application/json",
      },
    });
    const startData = await startRes.json();

    console.log("startData:", startData);

    if (!startData || !startData.task) {
      console.error("Failed to start task:", startData);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to start task with iLovePDF' }),
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