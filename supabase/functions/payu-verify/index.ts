import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYU_SALT = Deno.env.get("PAYU_SALT") || "";

async function generatePayUHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(PAYU_SALT);
  const messageData = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hash;
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

    // Get form data from PayU callback
    const formData = await req.formData();
    const status = formData.get('status')?.toString() || '';
    const txnid = formData.get('txnid')?.toString() || '';
    const amount = formData.get('amount')?.toString() || '';
    const productinfo = formData.get('productinfo')?.toString() || '';
    const firstname = formData.get('firstname')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const hash = formData.get('hash')?.toString() || '';
    const payuMoneyId = formData.get('payuMoneyId')?.toString() || '';
    const error_Message = formData.get('error_Message')?.toString() || '';

    console.log('PayU verification request:', { 
      status, 
      txnid, 
      amount, 
      email,
      payuMoneyId,
      error_Message 
    });

    // Verify hash for security
    const hashString = `${PAYU_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}`;
    const computedHash = await generatePayUHash(hashString);
    
    if (hash !== computedHash) {
      console.error('Hash verification failed:', { received: hash, computed: computedHash });
      throw new Error('Invalid hash verification');
    }

    // Update payment status in database
    const paymentStatus = status === 'success' ? 'completed' : 'failed';
    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        payu_response: {
          status,
          payuMoneyId,
          error_Message,
          amount,
          email,
          firstname,
          productinfo,
          timestamp: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('payu_txnid', txnid)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment:', error);
      throw new Error('Failed to update payment status');
    }

    console.log('Payment verified and updated:', { 
      txnid, 
      status: paymentStatus,
      payuMoneyId,
      amount 
    });

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          txnid: payment.payu_txnid,
          amount: payment.amount
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error verifying PayU payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});