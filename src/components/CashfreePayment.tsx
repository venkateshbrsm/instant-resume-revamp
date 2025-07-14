import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CashfreePaymentProps {
  fileName: string;
  amount: number;
  disabled?: boolean;
}

declare global {
  interface Window {
    Cashfree: {
      checkout: (options: any) => Promise<any>;
    };
  }
}

export const CashfreePayment = ({ fileName, amount, disabled }: CashfreePaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (isLoading) return; // Prevent double clicks
    
    setIsLoading(true);
    console.log('Starting Cashfree payment process...', { fileName, amount });
    
    try {
      console.log('Calling cashfree-initiate function...');
      const { data, error } = await supabase.functions.invoke('cashfree-initiate', {
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

      console.log('Cashfree response received:', data);

      if (!data || !data.payment_session_id) {
        console.error('Invalid response from payment service:', data);
        toast({
          title: "Payment Error",
          description: "Invalid response from payment service. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Load Cashfree SDK if not already loaded
      if (!window.Cashfree) {
        console.log('Loading Cashfree SDK...');
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onload = () => {
          console.log('Cashfree SDK loaded successfully');
          initiateCashfreePayment(data);
        };
        script.onerror = () => {
          console.error('Failed to load Cashfree SDK');
          toast({
            title: "Payment Error",
            description: "Failed to load payment SDK. Please try again.",
            variant: "destructive"
          });
          setIsLoading(false);
        };
        document.head.appendChild(script);
      } else {
        console.log('Using existing Cashfree SDK');
        initiateCashfreePayment(data);
      }

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

  const initiateCashfreePayment = async (paymentData: any) => {
    try {
      console.log('Initiating Cashfree payment with data:', paymentData);
      
      if (!paymentData.payment_session_id) {
        throw new Error('No payment session ID received');
      }

      const checkoutOptions = {
        paymentSessionId: paymentData.payment_session_id,
        redirectTarget: "_self"
      };

      console.log('Cashfree checkout options:', checkoutOptions);
      const result = await window.Cashfree.checkout(checkoutOptions);
      console.log('Cashfree checkout result:', result);
      
      if (result.error) {
        console.error('Cashfree checkout error:', result.error);
        toast({
          title: "Payment Error",
          description: result.error.message || "Payment failed. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Cashfree payment error:', error);
      toast({
        title: "Payment Error",
        description: `Payment processing failed: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
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
      {isLoading ? 'Processing...' : `Pay ₹${amount} with Cashfree`}
    </Button>
  );
};