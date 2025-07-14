import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CASHFREE_APP_ID = Deno.env.get("CASHFREE_APP_ID") || "";
const CASHFREE_SECRET_KEY = Deno.env.get("CASHFREE_SECRET_KEY") || "";

async function verifyCashfreeSignature(signature: string, timestamp: string, body: string): Promise<boolean> {
  const signatureData = `${timestamp}${body}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(CASHFREE_SECRET_KEY);
  const messageData = encoder.encode(signatureData);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const computedSignature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(computedSignature));
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return computedHash === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const signature = req.headers.get('x-webhook-signature') || '';
    const timestamp = req.headers.get('x-webhook-timestamp') || '';
    const body = await req.text();
    const webhookData = JSON.parse(body);

    console.log('Cashfree webhook received:', webhookData);

    // Verify webhook signature
    const isValidSignature = await verifyCashfreeSignature(signature, timestamp, body);
    if (!isValidSignature) {
      console.error('Invalid webhook signature from Cashfree');
      throw new Error('Invalid webhook signature');
    }

    const { order_id, payment_status, cf_payment_id, order_amount } = webhookData.data;

    // Update payment status in database
    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        status: payment_status.toLowerCase(),
        payu_response: webhookData,
        updated_at: new Date().toISOString()
      })
      .eq('payu_txnid', order_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment:', error);
      throw new Error('Failed to update payment status');
    }

    console.log('Payment verified and updated:', { 
      order_id, 
      payment_status,
      cf_payment_id,
      amount: order_amount 
    });

    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          order_id: payment.payu_txnid,
          amount: payment.amount
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error verifying Cashfree payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});