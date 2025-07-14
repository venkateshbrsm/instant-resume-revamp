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
    
    // Get Adobe PDF Services environment variables
    const adobeClientId = Deno.env.get('ADOBE_CLIENT_ID');
    const adobeClientSecret = Deno.env.get('ADOBE_CLIENT_SECRET');
    
    console.log('Environment variables check:', {
      hasClientId: !!adobeClientId,
      hasClientSecret: !!adobeClientSecret,
      clientIdLength: adobeClientId?.length || 0,
      clientIdPrefix: adobeClientId?.substring(0, 15) || 'none'
    });

    if (!adobeClientId || !adobeClientSecret) {
      console.error('Adobe PDF Services credentials not found in environment');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Adobe PDF Services credentials not configured. Please set ADOBE_CLIENT_ID and ADOBE_CLIENT_SECRET in Supabase secrets.' 
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

    // 1️⃣ Get Adobe access token
    console.log('=== USING ADOBE PDF SERVICES ===');
    console.log('Getting Adobe access token...');
    console.log('Using Adobe client ID (first 20 chars):', adobeClientId?.substring(0, 20));
    
    const tokenRes = await fetch("https://ims-na1.adobelogin.com/ims/token/v1", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: adobeClientId,
        client_secret: adobeClientSecret,
        grant_type: "client_credentials",
        scope: "openid,AdobeID,session,additional_info,read_organizations,firefly_api,ff_apis"
      }),
    });

    const tokenText = await tokenRes.text();
    console.log("Token request status:", tokenRes.status);
    console.log("Token response:", tokenText);

    if (!tokenRes.ok) {
      console.error(`Adobe token API error: ${tokenRes.status} - ${tokenText}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Adobe authentication failed: ${tokenRes.status}`,
          details: tokenText,
          clientIdUsed: adobeClientId?.substring(0, 20) + '...'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let tokenData;
    try {
      tokenData = JSON.parse(tokenText);
    } catch (e) {
      console.error("Failed to parse token response:", e);
      console.error("Raw token response:", tokenText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to parse Adobe token response",
          rawResponse: tokenText 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!tokenData.access_token) {
      console.error("No access token in response:", tokenData);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to get Adobe access token" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = tokenData.access_token;
    console.log("Successfully obtained access token");

    // 2️⃣ Step 1: Create asset and get upload URL
    console.log('Creating asset and getting upload URL from Adobe...');
    
    const createAssetRes = await fetch("https://pdf-services.adobe.io/assets", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "x-api-key": adobeClientId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mediaType: "application/pdf"
      }),
    });

    if (!createAssetRes.ok) {
      const errorText = await createAssetRes.text();
      console.error('Asset creation failed:', createAssetRes.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: `Failed to create Adobe asset: ${createAssetRes.status} ${errorText}` 
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const assetData = await createAssetRes.json();
    console.log('Asset created:', assetData);
    
    const uploadUrl = assetData.uploadUri;
    const assetId = assetData.assetID;

    // Step 2: Upload PDF file to the signed URL
    console.log('Uploading PDF file to signed URL...');
    
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/pdf",
        // Don't include Authorization or x-api-key - signed URL handles auth
      },
      body: uint8Array,
    });

    const uploadText = await uploadRes.text();
    console.log("Upload status:", uploadRes.status);
    console.log("Upload response:", uploadText);

    if (!uploadRes.ok) {
      console.error("Failed to upload to Adobe:", uploadText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Adobe upload failed: ${uploadRes.status}`,
          details: uploadText 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Upload successful, using asset ID:', assetId);

    // 3️⃣ Step 2: Create extraction job
    console.log('Creating extraction job...');
    
    const jobRequestBody = {
      assetID: assetId,
      elementsToExtract: ["text"],
      elementsToExtractRenditions: []
    };
    
    console.log("Job request body:", JSON.stringify(jobRequestBody, null, 2));
    
    const jobRes = await fetch("https://pdf-services.adobe.io/operation/pdfServices/extract", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "x-api-key": adobeClientId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobRequestBody),
    });

    const jobText = await jobRes.text();
    console.log("Job creation status:", jobRes.status);
    console.log("Job response:", jobText);

    if (!jobRes.ok) {
      console.error("Failed to create extraction job:", jobText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Adobe job creation failed: ${jobRes.status}`,
          details: jobText 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jobLocation = jobRes.headers.get("location");
    if (!jobLocation) {
      console.error("No job location in response");
      return new Response(
        JSON.stringify({ success: false, error: "No job location received from Adobe" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4️⃣ Step 3: Poll for job completion
    console.log('Polling for extraction completion...');
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max
    let resultData;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      attempts++;

      const statusRes = await fetch(jobLocation, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "x-api-key": adobeClientId,
        },
      });

      const statusText = await statusRes.text();
      console.log(`Attempt ${attempts} - Status: ${statusRes.status}`);

      if (statusRes.ok) {
        try {
          resultData = JSON.parse(statusText);
          if (resultData.status === "done") {
            console.log("Extraction completed successfully");
            break;
          } else if (resultData.status === "failed") {
            console.error("Adobe extraction failed:", resultData);
            return new Response(
              JSON.stringify({ success: false, error: "Adobe PDF extraction failed", details: resultData }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          console.log("Job still in progress, waiting...");
        } catch (e) {
          console.error("Failed to parse status response:", e);
        }
      } else {
        console.error(`Status check failed: ${statusRes.status} - ${statusText}`);
      }
    }

    if (!resultData || resultData.status !== "done") {
      console.error("Extraction timed out or failed");
      return new Response(
        JSON.stringify({ success: false, error: "Adobe PDF extraction timed out" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5️⃣ Step 4: Download the extraction results
    console.log('Downloading extraction results...');
    const downloadUrl = resultData.asset?.downloadUri;
    if (!downloadUrl) {
      console.error("No download URL in result:", resultData);
      return new Response(
        JSON.stringify({ success: false, error: "No download URL received from Adobe" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const downloadRes = await fetch(downloadUrl);

    if (!downloadRes.ok) {
      console.error("Failed to download extraction results:", downloadRes.status);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to download extraction results" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const extractionResults = await downloadRes.json();
    console.log('Downloaded extraction results, elements count:', extractionResults.elements?.length || 0);

    // Extract text from the results
    let extractedText = "";
    if (extractionResults.elements) {
      for (const element of extractionResults.elements) {
        if (element.Text) {
          extractedText += element.Text + "\n";
        }
      }
    }

    if (!extractedText.trim()) {
      extractedText = "No text could be extracted from the PDF using Adobe PDF Services.";
    }
    
    console.log('Text extraction completed successfully');
    console.log('Extracted text length:', extractedText.length);

    // Return the result
    return new Response(
      JSON.stringify({
        success: true,
        extractedText: extractedText.trim(),
        originalFileName: file.name,
        method: 'Adobe PDF Services',
        textLength: extractedText.length
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