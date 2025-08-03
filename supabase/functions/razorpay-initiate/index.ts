import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting Razorpay payment initiation...");
    
    // Create Supabase client with service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Enhanced authentication validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      throw new Error("Missing authentication token");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error("Authentication error:", userError);
      throw new Error("Invalid authentication");
    }

    const user = userData.user;
    
    // Additional security check - ensure user ID is valid UUID
    if (!user.id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
      console.error("Invalid user ID format");
      throw new Error("Invalid user session");
    }
    console.log("User authenticated:", user.email);

    // Get request body
    const { fileName, amount, filePath, enhancedContent, extractedText, selectedTheme, couponCode } = await req.json();
    console.log("Payment details:", { fileName, amount, filePath, hasEnhancedContent: !!enhancedContent, themeData: selectedTheme, couponCode });
    console.log("Received theme object:", JSON.stringify(selectedTheme, null, 2));
    
    // Extract theme ID - handle both old format (string) and new format (object)
    let themeId = 'navy'; // default
    if (selectedTheme) {
      if (typeof selectedTheme === 'string') {
        themeId = selectedTheme;
      } else if (selectedTheme.id) {
        themeId = selectedTheme.id;
      }
    }
    console.log("Extracted theme ID for database:", themeId);

    // Validate coupon code and adjust amount if applicable
    let finalAmount = amount;
    let appliedCouponCode = null;
    
    if (couponCode && couponCode.toUpperCase() === "FIRST100") {
      if (amount === 299) {
        finalAmount = 299;
        appliedCouponCode = "FIRST100";
        console.log("FIRST100 coupon applied, amount set to 299 INR");
      } else {
        console.log("FIRST100 coupon provided but amount doesn't match expected discounted price");
      }
    }

    if (!fileName || !finalAmount) {
      throw new Error("Missing fileName or amount");
    }

    // Get Razorpay credentials
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // Cancel any existing pending payments for this user and file
    console.log("Cancelling existing pending payments...");
    await supabaseClient
      .from("payments")
      .update({ status: "cancelled" })
      .eq("user_id", user.id)
      .eq("file_name", fileName)
      .eq("status", "pending");

    // Create Razorpay order
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const amountInPaise = Math.round(finalAmount * 100); // Convert to paise

    const orderData = {
      amount: amountInPaise,
      currency: "INR",
      receipt: orderId,
      notes: {
        fileName: fileName,
        userEmail: user.email || ""
      }
    };

    console.log("Creating Razorpay order:", orderData);

    // Create order via Razorpay API
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error("Razorpay order creation failed:", errorText);
      throw new Error(`Failed to create Razorpay order: ${errorText}`);
    }

    const razorpayOrder = await orderResponse.json();
    console.log("Razorpay order created:", razorpayOrder.id);

    // Insert payment record in database with enhanced content and theme
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .insert({
        user_id: user.id,
        email: user.email || "",
        file_name: fileName,
        file_path: filePath || null,
        amount: finalAmount,
        currency: "INR",
        razorpay_order_id: razorpayOrder.id,
        status: "pending",
        enhanced_content: enhancedContent || null,
        theme_id: themeId,
        coupon_code: appliedCouponCode
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Database insert error:", paymentError);
      throw new Error(`Database error: ${paymentError.message}`);
    }

    console.log("Payment record created successfully");
    if (enhancedContent) {
      console.log("Enhanced content saved with payment record:", JSON.stringify(enhancedContent).substring(0, 200) + "...");
    } else {
      console.log("No enhanced content provided in payment request");
    }

    // Return payment details for frontend
    return new Response(JSON.stringify({
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: razorpayKeyId,
      name: "AI Resume Enhancer",
      description: `Enhancement for ${fileName}`,
      prefill: {
        email: user.email || "",
        name: user.user_metadata?.full_name || ""
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Payment initiation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});