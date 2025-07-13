import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHash } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MERCHANT_KEY = "85513e8faf409ab2ee7f8180d8f1489a04849d917d36ba92abbf2eb2d54b4171";
const MERCHANT_SALT = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCzXT8uqHErzDcy8tgkrxWny/yyrxLvhCQhD+ARo3bC1bph9u0t3kSZjoatb4DjdVVIEizZg5PoJpBJp0G+QddZ0X/irtBL5XsswpudjPN6zXwCJHDm3tSO9ug1vOkEvjrBXicDd+e9XwtThSVB1d/N/NXBK8bkD2P5rYgJ4udQWrAmqeJabVuI5TqHyhYP1fu7oPUn/hLUvv9uRO2IIgXw+gg1/tlFgZRTlq8Gw/+RyAPnK0vn5sgK+FBq3CfDaCufzgKbYr2ET3zpkoHGRd7kgLrK8wKVQBDCw6uAeVYzgcryUC9nMfphrhoZZLKzDDntyMyWF7sRGPhNFWbuw94JAgMBAAECggEACVf0MKQJsTRkM70+0TplsGYJ9ez02ZFSqH5BN+oCB8hGe0/3rwoDHNS141cJqc+075oyx+n4zIElxxB1dknLxBwLw21D4JBFyGEi5iQvktgde6cWUpCNFh16n0IGCX83ZFdZRO78HXtUBbfL5xATJpHjOLrlE4BRvvHxQkKVtjPM0h9IvUb3gKE1G6hg8l7Dg9ruwBFaZSYi8NBGJlObBzo5V/Zu0DOKhXDh2KaiMxOqA+/n5H7UKWZnEMpCU3AYLDL9dwZ78J3eoSkk3diZOBtJjxepsdtS6cPrEYMrYabf58kyGr1AsOSy2Dgtln0Mw6EauIprGNaLiGdp4BVNYQKBgQDm3a4mLS+CMIW3w2Ccow8uhIAKIDnipTKOFReqJt/gEOfq3MzhE9WOfKs7R/8p4ujs0E81B/bRLpnIDvxTgFLVBUxQ1KBqkDww7az41qSBKRE3updFrcgvyBs3TnzloT4HV9lliJcy9cm5QLAJ8WfDQNGQKd+lWaNYN9Sb/beNXQKBgQDG5DH1uS+xe7aDc8QpSM4opqxYbxajLPWQxV1U4abToP051DAcluAojyDlKHZWFGluZvMyltj4MYKkA5ecC7ZvoGsS9M3Mpaeso0fp5JKW0XF8ljDJiakC8Nj7XI9YEIVVoBSQ4rO3g3u36SAz4RaltyxzCecguGLZ5oqOsOwcnQKBgDTwWGLAscg0wDTnRFwmt/B+ya2Ivj1OjE0wYQDPcT68IbIld4WVOr81rz4kwEomkirbiY4riVlmSjUp2op7PoNCd8GBQFevQ14k4ikdbxN/C0ewLcf4lZL/W95OzS0K0GJ2ro8txx4UZnFod/WPua94SZW5RGNyLpaoFsS+ZTyxAoGBAKdCfKlS5ULy8Rg3IP4/FfClykZMldMAGjt3XvflFHDg8FPTl+pTD4vMYjOVBX96hveraFZg+XIv4NehlbxLNU9GrwUwDmpN3WaXogCWkph25mOJwtmaBSJN/YvV2U6MBjVt/B2kKNLppf+R89ztLCiMlLrh1xdzON5avKcnLkkZAoGBAK2jkZ8xVFr2DxXQxlyMnRS5e8EDCg9jJkMw0Npe2rsvMwru+WAm2oNWP8VvVVwiJvDNWuojcA6RznHPWSrTmxMooLTvaIJuNW94phDUjyyDyROw1QQa4av3Y+J9I95Qi5GL68pWypo6UdECO2N8qhVqHnnbkySNQEvRrtsaF8Ar";

function verifyPayUHash(responseData: Record<string, string>): boolean {
  const hashString = `${MERCHANT_SALT}|${responseData.status}|||||||||||${responseData.email}|${responseData.firstname}|${responseData.productinfo}|${responseData.amount}|${responseData.txnid}|${MERCHANT_KEY}`;
  const generatedHash = createHash("sha512").update(hashString).toString();
  return generatedHash === responseData.hash;
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

    const responseData = await req.json();
    console.log('PayU Response received:', responseData);

    // Verify hash
    const isValidHash = verifyPayUHash(responseData);
    if (!isValidHash) {
      console.error('Invalid hash received from PayU');
      throw new Error('Invalid payment response');
    }

    // Update payment status in database
    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        status: responseData.status.toLowerCase(),
        payu_response: responseData,
        updated_at: new Date().toISOString()
      })
      .eq('payu_txnid', responseData.txnid)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment:', error);
      throw new Error('Failed to update payment status');
    }

    console.log('Payment verified and updated:', { 
      txnid: responseData.txnid, 
      status: responseData.status,
      amount: responseData.amount 
    });

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
    console.error('Error verifying payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});