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
    const googleCloudApiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');
    
    if (!googleCloudApiKey) {
      console.error('Google Cloud API key not found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Google Cloud API key not configured' 
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

    console.log('Processing PDF with Google Cloud Document AI:', file.name, 'Size:', file.size);

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Use Google Cloud Document AI to process the PDF
    const documentAIResponse = await fetch(
      `https://documentai.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/us/processors/YOUR_PROCESSOR_ID:process?key=${googleCloudApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawDocument: {
            content: base64Content,
            mimeType: 'application/pdf'
          }
        })
      }
    );

    if (!documentAIResponse.ok) {
      const error = await documentAIResponse.text();
      console.error('Google Cloud Document AI failed:', error);
      throw new Error(`Document AI processing failed: ${error}`);
    }

    const documentAIData = await documentAIResponse.json();
    const extractedText = documentAIData.document?.text || '';
    
    console.log('Text extracted successfully, length:', extractedText.length);

    return new Response(
      JSON.stringify({
        success: true,
        extractedText: extractedText,
        originalFileName: file.name,
        processedSize: file.size
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('PDF processing error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown processing error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});