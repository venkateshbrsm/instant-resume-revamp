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
    const cloudConvertApiKey = Deno.env.get('CLOUDCONVERT_API_KEY');
    
    if (!cloudConvertApiKey) {
      console.error('CloudConvert API key not found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'CloudConvert API key not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the uploaded file from form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Converting PDF to DOCX:', file.name, 'Size:', file.size);

    // Step 1: Create a job
    const jobResponse = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cloudConvertApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tasks: {
          'import-my-file': {
            operation: 'import/upload'
          },
          'convert-my-file': {
            operation: 'convert',
            input: 'import-my-file',
            output_format: 'docx'
          },
          'export-my-file': {
            operation: 'export/url',
            input: 'convert-my-file'
          }
        }
      })
    });

    if (!jobResponse.ok) {
      const error = await jobResponse.text();
      console.error('CloudConvert job creation failed:', error);
      throw new Error(`Failed to create conversion job: ${error}`);
    }

    const jobData = await jobResponse.json();
    console.log('CloudConvert job created:', jobData.data.id);

    // Step 2: Upload the file
    const uploadTask = jobData.data.tasks.find((task: any) => task.name === 'import-my-file');
    
    if (!uploadTask || !uploadTask.result || !uploadTask.result.form) {
      console.error('Upload task not found in job response:', JSON.stringify(jobData, null, 2));
      throw new Error('Upload task not properly configured in CloudConvert response');
    }
    
    const uploadForm = uploadTask.result.form;
    console.log('Upload form details:', JSON.stringify(uploadForm, null, 2));
    
    const uploadFormData = new FormData();
    
    // Add all the required form fields from CloudConvert
    if (uploadForm.parameters) {
      for (const [key, value] of Object.entries(uploadForm.parameters)) {
        uploadFormData.append(key, value as string);
        console.log(`Added form parameter: ${key} = ${value}`);
      }
    }
    
    // Add the file last
    uploadFormData.append('file', file);
    console.log('Added file to form data:', file.name, file.size);

    console.log('Uploading to:', uploadForm.url);
    const uploadResponse = await fetch(uploadForm.url, {
      method: 'POST',
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.error('File upload failed with status:', uploadResponse.status);
      console.error('Upload error response:', error);
      throw new Error(`Failed to upload file: ${error}`);
    }

    console.log('File uploaded successfully');

    // Step 3: Wait for conversion to complete
    let conversionComplete = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    while (!conversionComplete && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobData.data.id}`, {
        headers: {
          'Authorization': `Bearer ${cloudConvertApiKey}`,
        },
      });

      const statusData = await statusResponse.json();
      const exportTask = statusData.data.tasks.find((task: any) => task.name === 'export-my-file');
      
      if (exportTask && exportTask.status === 'finished') {
        conversionComplete = true;
        
        // Step 4: Download the converted file
        const downloadUrl = exportTask.result.files[0].url;
        const downloadResponse = await fetch(downloadUrl);
        
        if (!downloadResponse.ok) {
          throw new Error('Failed to download converted file');
        }

        const docxArrayBuffer = await downloadResponse.arrayBuffer();
        const docxBase64 = btoa(String.fromCharCode(...new Uint8Array(docxArrayBuffer)));
        
        console.log('PDF converted to DOCX successfully, size:', docxArrayBuffer.byteLength);

        return new Response(
          JSON.stringify({
            success: true,
            docxData: docxBase64,
            originalFileName: file.name,
            convertedSize: docxArrayBuffer.byteLength
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      if (exportTask && exportTask.status === 'error') {
        throw new Error(`Conversion failed: ${exportTask.message}`);
      }
      
      attempts++;
    }

    if (!conversionComplete) {
      throw new Error('Conversion timeout - file may be too large or complex');
    }

  } catch (error) {
    console.error('PDF to DOCX conversion error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown conversion error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});