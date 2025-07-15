import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PayUPaymentProps {
  fileName: string;
  amount: number;
  disabled?: boolean;
}

export const PayUPayment = ({ fileName, amount, disabled }: PayUPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (isLoading) return; // Prevent double clicks
    
    setIsLoading(true);
    console.log('Starting PayU payment process...', { fileName, amount });
    
    try {
      console.log('Calling payu-initiate function...');
      const { data, error } = await supabase.functions.invoke('payu-initiate', {
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

      console.log('PayU response received:', data);

      if (!data || !data.paymentUrl) {
        console.error('Invalid response from payment service:', data);
        toast({
          title: "Payment Error",
          description: "Invalid response from payment service. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Redirect to PayU payment page
      console.log('Redirecting to PayU payment page:', data.paymentUrl);
      window.location.href = data.paymentUrl;

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
      {isLoading ? 'Processing...' : `Pay ₹${amount} with PayU`}
    </Button>
  );
};