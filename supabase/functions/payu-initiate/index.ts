import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PayU Production Configuration
const PAYU_BASE_URL = "https://secure.payu.in/_payment";
const MERCHANT_ID = "7d28f2fe47a4e49275bae7b2d54a1cebddaaadbe959e67602eb358e3a673439f";
const MERCHANT_KEY = "85513e8faf409ab2ee7f8180d8f1489a04849d917d36ba92abbf2eb2d54b4171";
const MERCHANT_SALT = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCzXT8uqHErzDcy8tgkrxWny/yyrxLvhCQhD+ARo3bC1bph9u0t3kSZjoatb4DjdVVIEizZg5PoJpBJp0G+QddZ0X/irtBL5XsswpudjPN6zXwCJHDm3tSO9ug1vOkEvjrBXicDd+e9XwtThSVB1d/N/NXBK8bkD2P5rYgJ4udQWrAmqeJabVuI5TqHyhYP1fu7oPUn/hLUvv9uRO2IIgXw+gg1/tlFgZRTlq8Gw/+RyAPnK0vn5sgK+FBq3CfDaCufzgKbYr2ET3zpkoHGRd7kgLrK8wKVQBDCw6uAeVYzgcryUC9nMfphrhoZZLKzDDntyMyWF7sRGPhNFWbuw94JAgMBAAECggEACVf0MKQJsTRkM70+0TplsGYJ9ez02ZFSqH5BN+oCB8hGe0/3rwoDHNS141cJqc+075oyx+n4zIElxxB1dknLxBwLw21D4JBFyGEi5iQvktgde6cWUpCNFh16n0IGCX83ZFdZRO78HXtUBbfL5xATJpHjOLrlE4BRvvHxQkKVtjPM0h9IvUb3gKE1G6hg8l7Dg9ruwBFaZSYi8NBGJlObBzo5V/Zu0DOKhXDh2KaiMxOqA+/n5H7UKWZnEMpCU3AYLDL9dwZ78J3eoSkk3diZOBtJjxepsdtS6cPrEYMrYabf58kyGr1AsOSy2Dgtln0Mw6EauIprGNaLiGdp4BVNYQKBgQDm3a4mLS+CMIW3w2Ccow8uhIAKIDnipTKOFReqJt/gEOfq3MzhE9WOfKs7R/8p4ujs0E81B/bRLpnIDvxTgFLVBUxQ1KBqkDww7az41qSBKRE3updFrcgvyBs3TnzloT4HV9lliJcy9cm5QLAJ8WfDQNGQKd+lWaNYN9Sb/beNXQKBgQDG5DH1uS+xe7aDc8QpSM4opqxYbxajLPWQxV1U4abToP051DAcluAojyDlKHZWFGluZvMyltj4MYKkA5ecC7ZvoGsS9M3Mpaeso0fp5JKW0XF8ljDJiakC8Nj7XI9YEIVVoBSQ4rO3g3u36SAz4RaltyxzCecguGLZ5oqOsOwcnQKBgDTwWGLAscg0wDTnRFwmt/B+ya2Ivj1OjE0wYQDPcT68IbIld4WVOr81rz4kwEomkirbiY4riVlmSjUp2op7PoNCd8GBQFevQ14k4ikdbxN/C0ewLcf4lZL/W95OzS0K0GJ2ro8txx4UZnFod/WPua94SZW5RGNyLpaoFsS+ZTyxAoGBAKdCfKlS5ULy8Rg3IP4/FfClykZMldMAGjt3XvflFHDg8FPTl+pTD4vMYjOVBX96hveraFZg+XIv4NehlbxLNU9GrwUwDmpN3WaXogCWkph25mOJwtmaBSJN/YvV2U6MBjVt/B2kKNLppf+R89ztLCiMlLrh1xdzON5avKcnLkkZAoGBAK2jkZ8xVFr2DxXQxlyMnRS5e8EDCg9jJkMw0Npe2rsvMwru+WAm2oNWP8VvVVwiJvDNWuojcA6RznHPWSrTmxMooLTvaIJuNW94phDUjyyDyROw1QQa4av3Y+J9I95Qi5GL68pWypo6UdECO2N8qhVqHnnbkySNQEvRrtsaF8Ar";

async function generatePayUHash(data: Record<string, string>): Promise<string> {
  const hashString = `${MERCHANT_KEY}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|||||||||||${MERCHANT_SALT}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-512', encoder.encode(hashString));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
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
    
    // Generate unique transaction ID
    const txnid = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const paymentData = {
      key: MERCHANT_ID,
      txnid,
      amount: amount.toString(),
      productinfo: `Resume Enhancement - ${fileName}`,
      firstname: user.user_metadata?.name || user.email.split('@')[0],
      email: user.email,
      phone: user.user_metadata?.phone || '9999999999',
      surl: `https://revivifymyresume.app/payment-success`,
      furl: `https://revivifymyresume.app/payment-failure`,
      curl: `https://revivifymyresume.app/payment-failure`,
      service_provider: 'payu_paisa',
    };

    // Generate hash
    const hash = await generatePayUHash(paymentData);
    
    // Store payment record in database
    await supabase.from('payments').insert({
      user_id: user.id,
      email: user.email,
      file_name: fileName,
      amount: parseFloat(amount.toString()),
      currency: 'INR',
      payu_txnid: txnid,
      payu_hash: hash,
      status: 'initiated'
    });

    console.log('Payment initiated:', { txnid, email: user.email, amount });

    return new Response(
      JSON.stringify({
        paymentUrl: PAYU_BASE_URL,
        paymentData: { ...paymentData, hash }
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