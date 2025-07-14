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
    
    try {
      const { data, error } = await supabase.functions.invoke('cashfree-initiate', {
        body: { fileName, amount }
      });

      if (error) {
        console.error('Payment initiation error:', error);
        throw error;
      }

      console.log('Cashfree response:', data);

      // Load Cashfree SDK if not already loaded
      if (!window.Cashfree) {
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onload = () => initiateCashfreePayment(data);
        document.head.appendChild(script);
      } else {
        initiateCashfreePayment(data);
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initiateCashfreePayment = async (paymentData: any) => {
    try {
      const checkoutOptions = {
        paymentSessionId: paymentData.payment_session_id,
        redirectTarget: "_self"
      };

      const result = await window.Cashfree.checkout(checkoutOptions);
      
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
        description: "Payment processing failed. Please try again.",
        variant: "destructive"
      });
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