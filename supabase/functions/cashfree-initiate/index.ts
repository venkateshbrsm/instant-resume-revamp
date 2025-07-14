import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cashfree Configuration
const CASHFREE_BASE_URL = "https://api.cashfree.com/pg/orders";
const CASHFREE_APP_ID = Deno.env.get("CASHFREE_APP_ID") || "";
const CASHFREE_SECRET_KEY = Deno.env.get("CASHFREE_SECRET_KEY") || "";

async function generateCashfreeSignature(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(CASHFREE_SECRET_KEY);
  const messageData = encoder.encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: userData } = await supabase.auth.getUser(token);
    const user = userData.user;

    if (!user?.email) {
      throw new Error('User not authenticated');
    }

    const { fileName, amount } = await req.json();
    
    // Check for existing pending payments from this user for this file
    const { data: existingPayments } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('file_name', fileName)
      .eq('status', 'initiated')
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes
    
    if (existingPayments && existingPayments.length > 0) {
      // Cancel/invalidate old pending payments before creating new one
      await supabase
        .from('payments')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString(),
          payu_response: { reason: 'New payment attempt initiated, old payment cancelled' }
        })
        .eq('user_id', user.id)
        .eq('file_name', fileName)
        .eq('status', 'initiated');
      
      console.log('Cancelled old pending payments for user:', user.id);
    }
    
    // Generate completely unique order ID with multiple entropy sources
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substr(2, 12);
    const userHash = user.id.substr(0, 8);
    const orderId = `order_${timestamp}_${userHash}_${randomPart}`;
    
    // Ensure order ID is unique in database
    const { data: existingOrder } = await supabase
      .from('payments')
      .select('payu_txnid')
      .eq('payu_txnid', orderId)
      .single();
    
    if (existingOrder) {
      // If by any chance the orderId exists, add more entropy
      const extraEntropy = Math.random().toString(36).substr(2, 6);
      const finalOrderId = `${orderId}_${extraEntropy}`;
      console.log('Duplicate orderId detected, using:', finalOrderId);
    }
    
    const cashfreeOrderData = {
      order_id: orderId,
      order_amount: parseFloat(amount.toString()),
      order_currency: "INR",
      customer_details: {
        customer_id: user.id.substr(0, 8),
        customer_name: user.user_metadata?.name || user.email.split('@')[0],
        customer_email: user.email,
        customer_phone: user.user_metadata?.phone || "9999999999"
      },
      order_meta: {
        return_url: `https://revivifymyresume.app/payment-success`,
        notify_url: `https://goorszhscvxywfigydfp.supabase.co/functions/v1/cashfree-verify`,
        payment_methods: ""
      },
      order_note: `Resume Enhancement - ${fileName}`
    };

    // Create order with Cashfree
    const orderResponse = await fetch(CASHFREE_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
      },
      body: JSON.stringify(cashfreeOrderData)
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('Cashfree order creation failed:', errorText);
      throw new Error('Failed to create Cashfree order');
    }

    const orderResult = await orderResponse.json();
    console.log('Cashfree order created:', orderResult);
    
    // Store NEW payment record in database
    const { data: newPayment, error: insertError } = await supabase.from('payments').insert({
      user_id: user.id,
      email: user.email,
      file_name: fileName,
      amount: parseFloat(amount.toString()),
      currency: 'INR',
      payu_txnid: orderId,
      payu_hash: orderResult.payment_session_id || '',
      status: 'initiated'
    }).select().single();

    if (insertError) {
      console.error('Error creating payment record:', insertError);
      throw new Error('Failed to create payment record');
    }

    console.log('NEW Payment initiated:', { 
      orderId, 
      email: user.email, 
      amount, 
      paymentId: newPayment.id,
      cancelledOldPayments: existingPayments?.length || 0
    });

    return new Response(
      JSON.stringify({
        payment_session_id: orderResult.payment_session_id,
        order_id: orderId,
        order_status: orderResult.order_status,
        debug: {
          orderId,
          cancelledOldPayments: existingPayments?.length || 0,
          timestamp: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error initiating payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});