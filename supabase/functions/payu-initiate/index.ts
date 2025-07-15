import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYU_MERCHANT_KEY = Deno.env.get("PAYU_MERCHANT_KEY") || "";
const PAYU_SALT = Deno.env.get("PAYU_SALT") || "";
const PAYU_BASE_URL = "https://secure.payu.in"; // Production URL

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

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('Authentication failed');
    }

    const { fileName, amount } = await req.json();
    
    if (!fileName || !amount) {
      throw new Error('Missing required fields: fileName, amount');
    }

    console.log('PayU payment initiation request:', { 
      userId: user.id, 
      email: user.email, 
      fileName, 
      amount 
    });

    // Cancel any existing pending payments for this user and file
    const { error: cancelError } = await supabase
      .from('payments')
      .update({ status: 'cancelled' })
      .eq('user_id', user.id)
      .eq('file_name', fileName)
      .in('status', ['pending', 'initiated']);

    if (cancelError) {
      console.error('Error canceling existing payments:', cancelError);
    }

    // Generate unique transaction ID
    const txnid = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // PayU payment data
    const payuData = {
      key: PAYU_MERCHANT_KEY,
      txnid: txnid,
      amount: amount.toString(),
      productinfo: `AI Resume Enhancement for ${fileName}`,
      firstname: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
      email: user.email,
      phone: user.user_metadata?.phone || '9999999999',
      surl: `${req.headers.get('origin') || 'https://revivify.lovable.app'}/payment-success`,
      furl: `${req.headers.get('origin') || 'https://revivify.lovable.app'}/payment-failure`,
      service_provider: 'payu_paisa'
    };

    // Create hash string for PayU
    const hashString = `${payuData.key}|${payuData.txnid}|${payuData.amount}|${payuData.productinfo}|${payuData.firstname}|${payuData.email}|||||||||||${PAYU_SALT}`;
    const hash = await generatePayUHash(hashString);

    // Insert payment record into database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        email: user.email!,
        amount: amount,
        payu_txnid: txnid,
        payu_hash: hash,
        file_name: fileName,
        status: 'initiated',
        currency: 'INR'
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      throw new Error('Failed to create payment record');
    }

    console.log('Payment record created successfully:', payment.id);

    // Create PayU form HTML
    const paymentFormHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Redirecting to PayU...</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
          .loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 20px auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <h2>Redirecting to PayU Payment Gateway...</h2>
        <div class="loader"></div>
        <p>Please wait while we redirect you to complete your payment.</p>
        <form action="${PAYU_BASE_URL}/_payment" method="post" id="payuform">
          <input type="hidden" name="key" value="${payuData.key}" />
          <input type="hidden" name="txnid" value="${payuData.txnid}" />
          <input type="hidden" name="amount" value="${payuData.amount}" />
          <input type="hidden" name="productinfo" value="${payuData.productinfo}" />
          <input type="hidden" name="firstname" value="${payuData.firstname}" />
          <input type="hidden" name="email" value="${payuData.email}" />
          <input type="hidden" name="phone" value="${payuData.phone}" />
          <input type="hidden" name="surl" value="${payuData.surl}" />
          <input type="hidden" name="furl" value="${payuData.furl}" />
          <input type="hidden" name="hash" value="${hash}" />
          <input type="hidden" name="service_provider" value="${payuData.service_provider}" />
        </form>
        <script>
          document.getElementById('payuform').submit();
        </script>
      </body>
      </html>
    `;

    return new Response(paymentFormHTML, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/html' 
      },
      status: 200,
    });

  } catch (error) {
    console.error('Error initiating PayU payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});