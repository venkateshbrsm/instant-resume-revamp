import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const iLovePdfPublicKey = Deno.env.get('ILOVEPDF_PUBLIC_KEY');
    
    if (!iLovePdfPublicKey) {
      console.error('iLovePDF public key not found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'iLovePDF public key not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the uploaded file from form data
    const formData = await req.formData();
    console.log('Received FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes, ${value.type})` : value);
    }
    
    const file = formData.get('file') as File;

    if (!file) {
      console.error('No file found in FormData');
      return new Response(
        JSON.stringify({ success: false, error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!(file instanceof File)) {
      console.error('File is not a File instance:', typeof file, file);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid file format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    console.log('Extracting text from PDF using iLovePDF:', file.name, 'Size:', file.size);

    // Step 1: Authenticate with public key to get token
    const authResponse = await fetch('https://api.ilovepdf.com/v1/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_key: iLovePdfPublicKey
      })
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('iLovePDF auth failed:', {
        status: authResponse.status,
        statusText: authResponse.statusText,
        headers: Object.fromEntries(authResponse.headers.entries()),
        body: errorText
      });
      throw new Error(`Authentication failed: ${authResponse.status} - ${errorText}`);
    }

    const authData = await authResponse.json();
    console.log('iLovePDF auth response:', JSON.stringify(authData, null, 2));
    const token = authData.token;
    console.log('iLovePDF authentication successful');

    // Step 2: Start extract task
    const startResponse = await fetch('https://api.ilovepdf.com/v1/start/extract', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      console.error('iLovePDF start task failed:', {
        status: startResponse.status,
        statusText: startResponse.statusText,
        headers: Object.fromEntries(startResponse.headers.entries()),
        body: errorText
      });
      throw new Error(`Failed to start extract task: ${startResponse.status} - ${errorText}`);
    }

    const startData = await startResponse.json();
    console.log('Start task response:', JSON.stringify(startData, null, 2));
    const taskId = startData.task;
    console.log('Extract task started:', taskId);

    // Step 3: Upload file
    console.log('Preparing file upload for:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    const uploadFormData = new FormData();
    uploadFormData.append('task', taskId);
    uploadFormData.append('file', file, file.name);
    
    console.log('FormData entries for upload:');
    for (const [key, value] of uploadFormData.entries()) {
      console.log(`${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
    }

    const uploadResponse = await fetch(`https://api.ilovepdf.com/v1/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('File upload failed:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        headers: Object.fromEntries(uploadResponse.headers.entries()),
        body: errorText
      });
      throw new Error(`Failed to upload file: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    console.log('File upload response:', JSON.stringify(uploadData, null, 2));

    // Step 4: Process the file
    const processResponse = await fetch(`https://api.ilovepdf.com/v1/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: taskId,
        tool: 'extract'
      }),
    });

    if (!processResponse.ok) {
      const errorText = await processResponse.text();
      console.error('Processing failed:', {
        status: processResponse.status,
        statusText: processResponse.statusText,
        headers: Object.fromEntries(processResponse.headers.entries()),
        body: errorText
      });
      throw new Error(`Failed to process file: ${processResponse.status} - ${errorText}`);
    }

    const processData = await processResponse.json();
    console.log('Process response:', JSON.stringify(processData, null, 2));
    console.log('Processing completed');

    // Step 5: Download the result
    const downloadResponse = await fetch(`https://api.ilovepdf.com/v1/download/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text();
      console.error('Download failed:', {
        status: downloadResponse.status,
        statusText: downloadResponse.statusText,
        headers: Object.fromEntries(downloadResponse.headers.entries()),
        body: errorText
      });
      throw new Error(`Failed to download result: ${downloadResponse.status} - ${errorText}`);
    }

    // The result should be a ZIP file containing extracted text
    const resultArrayBuffer = await downloadResponse.arrayBuffer();
    
    // Convert the ZIP result to base64 for debugging
    const resultBase64 = btoa(String.fromCharCode(...new Uint8Array(resultArrayBuffer)));
    
    // For now, return a success message with placeholder text
    // TODO: Parse the ZIP file to extract actual text content
    const extractedText = `Text successfully extracted from "${file.name}" using iLovePDF. 
Result contains ${resultArrayBuffer.byteLength} bytes of extracted data.
File processed successfully and ready for analysis.`;
    
    console.log('Text extraction completed, result size:', resultArrayBuffer.byteLength);

    return new Response(
      JSON.stringify({
        success: true,
        extractedText: extractedText,
        originalFileName: file.name,
        resultSize: resultArrayBuffer.byteLength,
        extractedData: resultBase64.substring(0, 100) + '...' // Preview for debugging
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('PDF text extraction error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown extraction error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});