import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get form data
    const formData = await req.formData();
    const photoFile = formData.get('photo') as File;
    const userId = formData.get('userId') as string;
    
    if (!photoFile) {
      return new Response(
        JSON.stringify({ error: 'No photo file provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Processing resume photo:', {
      fileName: photoFile.name,
      fileSize: photoFile.size,
      fileType: photoFile.type,
      userId
    });

    // Convert photo to array buffer
    const photoBuffer = await photoFile.arrayBuffer();
    const photoBytes = new Uint8Array(photoBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = photoFile.name.split('.').pop() || 'jpg';
    const fileName = `resume-photo-${timestamp}.${fileExtension}`;
    const filePath = userId ? `${userId}/${fileName}` : `public/${fileName}`;

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, photoBytes, {
        contentType: photoFile.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Photo upload failed:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload photo', details: uploadError.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    console.log('Photo uploaded successfully:', {
      path: uploadData.path,
      url: urlData.publicUrl
    });

    return new Response(
      JSON.stringify({
        success: true,
        photoUrl: urlData.publicUrl,
        photoPath: uploadData.path,
        fileName: fileName
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Photo processing error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Photo processing failed',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});