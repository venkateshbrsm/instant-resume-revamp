import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to generate Razorpay signature for verification
async function generateRazorpaySignature(
  orderId: string,
  paymentId: string,
  secret: string
): Promise<string> {
  const body = `${orderId}|${paymentId}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting Razorpay payment verification...");

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get request body
    const paymentData = await req.json();
    console.log("Received payment data:", paymentData);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = paymentData;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing required payment parameters");
    }

    // Get Razorpay secret
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeySecret) {
      throw new Error("Razorpay key secret not configured");
    }

    // Verify signature
    console.log("Verifying signature...");
    const expectedSignature = await generateRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpayKeySecret
    );

    const isSignatureValid = expectedSignature === razorpay_signature;
    console.log("Signature verification result:", isSignatureValid);

    if (!isSignatureValid) {
      throw new Error("Invalid payment signature");
    }

    // Find the payment record
    const { data: paymentRecord, error: findError } = await supabaseClient
      .from("payments")
      .select("*")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (findError || !paymentRecord) {
      console.error("Payment record not found:", findError);
      throw new Error("Payment record not found");
    }

    console.log("Found payment record:", paymentRecord.id);

    // Update payment status
    const { error: updateError } = await supabaseClient
      .from("payments")
      .update({
        status: "completed",
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        razorpay_response: paymentData,
        updated_at: new Date().toISOString()
      })
      .eq("id", paymentRecord.id);

    if (updateError) {
      console.error("Payment update error:", updateError);
      throw new Error(`Failed to update payment: ${updateError.message}`);
    }

    console.log("Payment verification completed successfully");

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      payment: {
        id: paymentRecord.id,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amount: paymentRecord.amount,
        fileName: paymentRecord.file_name,
        status: "completed"
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});