import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RazorpayPaymentProps {
  fileName: string;
  amount: number;
  disabled?: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const RazorpayPayment = ({ fileName, amount, disabled }: RazorpayPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    console.log('Starting Razorpay payment process...', { fileName, amount });
    
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      console.log('Calling razorpay-initiate function...');
      const { data, error } = await supabase.functions.invoke('razorpay-initiate', {
        body: { fileName, amount }
      });

      if (error) {
        console.error('Payment initiation error:', error);
        toast({
          title: "Payment Error",
          description: `Failed to initiate payment: ${error.message || 'Unknown error'}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Razorpay response received:', data);

      if (!data || !data.orderId) {
        console.error('Invalid response from payment service:', data);
        toast({
          title: "Payment Error",
          description: "Invalid response from payment service. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Initialize Razorpay payment
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: data.name,
        description: data.description,
        order_id: data.orderId,
        prefill: data.prefill,
        theme: {
          color: '#3B82F6'
        },
        handler: async (response: any) => {
          console.log('Payment successful:', response);
          
          try {
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay-verify', {
              body: response
            });

            if (verifyError || !verifyData?.success) {
              throw new Error(verifyError?.message || 'Payment verification failed');
            }

            toast({
              title: "Payment Successful",
              description: "Your payment has been processed successfully!",
            });

            // Redirect to success page with all payment details
            window.location.href = `/payment-success?razorpay_order_id=${response.razorpay_order_id}&razorpay_payment_id=${response.razorpay_payment_id}&razorpay_signature=${response.razorpay_signature}`;
            
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: "Payment was processed but verification failed. Please contact support.",
              variant: "destructive"
            });
            // Redirect to failure page
            window.location.href = `/payment-failure?razorpay_order_id=${response.razorpay_order_id}&error_description=${encodeURIComponent(error instanceof Error ? error.message : 'Verification failed')}`;
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            console.log('Payment modal dismissed');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handlePayment} 
      disabled={disabled || isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? 'Processing...' : `Pay ₹${amount} with Razorpay`}
    </Button>
  );
};