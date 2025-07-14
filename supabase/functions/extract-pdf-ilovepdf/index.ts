import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import ILovePDF from "npm:ilovepdf";

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
    const iLovePdfSecretKey = Deno.env.get('ILOVEPDF_API_KEY');
    
    if (!iLovePdfPublicKey || !iLovePdfSecretKey) {
      console.error('iLovePDF keys not found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'iLovePDF API keys not configured' 
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
      console.error('No file found in FormData');
      return new Response(
        JSON.stringify({ success: false, error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Save file to /tmp directory
    const fileArrayBuffer = await file.arrayBuffer();
    if (fileArrayBuffer.byteLength === 0) {
      throw new Error('File content is empty');
    }
    
    const tempFileName = `/tmp/${crypto.randomUUID()}_${file.name}`;
    console.log('Saving file to temp directory:', tempFileName, 'Size:', fileArrayBuffer.byteLength);
    
    await Deno.writeFile(tempFileName, new Uint8Array(fileArrayBuffer));
    
    // Verify file was written correctly
    const savedFileInfo = await Deno.stat(tempFileName);
    console.log('Saved file info:', { size: savedFileInfo.size, path: tempFileName });
    
    if (savedFileInfo.size === 0) {
      await Deno.remove(tempFileName);
      throw new Error('Failed to write file to temp directory');
    }

    // Use iLovePDF npm package
    console.log('Initializing iLovePDF with API keys...');
    const ilovepdf = ILovePDF(iLovePdfPublicKey, iLovePdfSecretKey);
    const task = ilovepdf.newTask('extract');

    console.log('Starting extract task...');
    await task.start();
    
    console.log('Adding file to task:', tempFileName);
    await task.addFile(tempFileName);
    
    console.log('Processing file...');
    await task.process();
    
    console.log('Downloading result...');
    const outputPath = '/tmp/output';
    await task.download(outputPath);
    
    // Read the extracted content
    let extractedText = 'Text extraction completed successfully';
    try {
      // Try to read the output file(s)
      const outputFiles = [];
      for await (const dirEntry of Deno.readDir(outputPath)) {
        if (dirEntry.isFile) {
          outputFiles.push(dirEntry.name);
        }
      }
      
      console.log('Output files found:', outputFiles);
      
      if (outputFiles.length > 0) {
        const firstOutputFile = `${outputPath}/${outputFiles[0]}`;
        const outputContent = await Deno.readTextFile(firstOutputFile);
        extractedText = outputContent || extractedText;
      }
    } catch (readError) {
      console.warn('Could not read output files:', readError);
    }

    // Clean up temporary files
    try {
      await Deno.remove(tempFileName);
      await Deno.remove(outputPath, { recursive: true });
      console.log('Temporary files cleaned up');
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary files:', cleanupError);
    }

    console.log('Text extraction completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        extractedText: extractedText,
        originalFileName: file.name
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