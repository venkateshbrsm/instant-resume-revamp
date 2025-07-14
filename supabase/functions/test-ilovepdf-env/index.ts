import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    console.log('=== Environment Variable Test ===');
    
    const envVars = {
      ILOVEPDF_PUBLIC_KEY: Deno.env.get('ILOVEPDF_PUBLIC_KEY'),
      ILovePDF_PUBLIC_KEY: Deno.env.get('ILovePDF_PUBLIC_KEY'),
      ILOVEPDF_API_KEY: Deno.env.get('ILOVEPDF_API_KEY'),
      ILOVEPDF_SECRET_KEY: Deno.env.get('ILOVEPDF_SECRET_KEY'),
    };

    console.log('Environment variables:', envVars);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Environment test completed',
        variables: Object.keys(envVars).reduce((acc, key) => ({
          ...acc,
          [key]: envVars[key] ? 'SET' : 'NOT_SET'
        }), {})
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in test function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});