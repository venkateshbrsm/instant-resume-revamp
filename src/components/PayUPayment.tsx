import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Shield, Lock } from "lucide-react";

interface PayUPaymentProps {
  file: File;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PayUPayment({ file, amount, onSuccess, onCancel }: PayUPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Please log in to continue with payment");
      }

      // Call PayU initiate function
      const { data, error } = await supabase.functions.invoke('payu-initiate', {
        body: {
          fileName: file.name,
          amount: amount
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Create form data for PayU
      const formData = new URLSearchParams();
      Object.entries(data.paymentData).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      // Open PayU in a popup window
      const popup = window.open('', 'PayUPayment', 
        'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
      );

      if (!popup) {
        throw new Error("Popup blocked. Please allow popups for this site and try again.");
      }

      // Create and submit form in the popup
      const form = popup.document.createElement('form');
      form.method = 'POST';
      form.action = data.paymentUrl;

      // Add all payment data as hidden inputs
      Object.entries(data.paymentData).forEach(([key, value]) => {
        const input = popup.document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      popup.document.body.appendChild(form);
      form.submit();

      toast({
        title: "Payment Window Opened",
        description: "Please complete your payment in the popup window.",
      });

      // Listen for popup close and poll for payment status
      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);
          // Start polling for payment status
          pollPaymentStatus(data.paymentData.txnid);
        }
      }, 1000);

      // Also start polling after a delay in case popup doesn't close properly
      setTimeout(() => {
        pollPaymentStatus(data.paymentData.txnid);
      }, 5000);

    } catch (error) {
      console.error('Payment initiation error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (txnid: string) => {
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const { data: payment } = await supabase
          .from('payments')
          .select('status')
          .eq('payu_txnid', txnid)
          .single();

        if (payment?.status === 'success') {
          toast({
            title: "Payment Successful!",
            description: "Your payment has been processed successfully.",
          });
          onSuccess();
          return;
        } else if (payment?.status === 'failure' || payment?.status === 'cancel') {
          toast({
            title: "Payment Failed",
            description: "Your payment was not successful. Please try again.",
            variant: "destructive",
          });
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 10000); // Check every 10 seconds
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    // Start checking after a short delay
    setTimeout(checkStatus, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CreditCard className="h-6 w-6" />
            Secure Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">File:</span>
              <span className="font-medium">{file.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service:</span>
              <span className="font-medium">Resume Enhancement</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount:</span>
              <span>₹{amount}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secured by PayU - India's most trusted payment gateway</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>256-bit SSL encryption ensures your data is safe</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handlePayment} 
              disabled={isProcessing}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay ₹{amount} with PayU
                </>
              )}
            </Button>

            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isProcessing}
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            By proceeding, you agree to our terms of service and privacy policy.
            This payment will be processed securely through PayU.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}