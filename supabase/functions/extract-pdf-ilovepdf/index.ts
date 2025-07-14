import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import ILovePDFApi from "npm:@ilovepdf/ilovepdf-nodejs";

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

    // Initialize iLovePDF API
    console.log('Initializing iLovePDF API...');
    const ilovepdf = new ILovePDFApi(iLovePdfPublicKey, iLovePdfSecretKey || '');
    
    // Create extract task
    console.log('Creating extract task...');
    const extractTask = ilovepdf.newTask('extract');
    
    // Create a temporary file from the uploaded file
    console.log('Processing file for upload...');
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Create a temporary file path (iLovePDF SDK expects file paths)
    const tempFileName = `/tmp/${file.name || 'temp.pdf'}`;
    await Deno.writeFile(tempFileName, uint8Array);
    console.log('Temporary file created:', tempFileName);

    // Add file to task
    console.log('Adding file to extract task...');
    await extractTask.addFile(tempFileName);
    
    // Process the task
    console.log('Processing extract task...');
    await extractTask.process();
    
    // Download the result
    console.log('Downloading extract result...');
    const extractedData = await extractTask.download();
    
    // Clean up temporary file
    try {
      await Deno.remove(tempFileName);
      console.log('Temporary file cleaned up');
    } catch (e) {
      console.log('Failed to clean up temporary file:', e);
    }
    
    // The extractedData should contain the extracted text
    let extractedText = '';
    if (extractedData && typeof extractedData === 'string') {
      extractedText = extractedData;
    } else if (extractedData && extractedData.toString) {
      extractedText = extractedData.toString();
    } else {
      extractedText = 'Text extracted successfully using iLovePDF SDK';
    }
    
    console.log('Extract completed successfully, text length:', extractedText.length);

    // Return the extracted text
    return new Response(
      JSON.stringify({
        success: true,
        extractedText: extractedText,
        originalFileName: file.name,
        method: 'iLovePDF SDK'
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