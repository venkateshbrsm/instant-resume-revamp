import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Shield, Lock, X } from "lucide-react";

interface PayUPaymentProps {
  file: File;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PayUPayment({ file, amount, onSuccess, onCancel }: PayUPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<number>(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentFormHtml, setPaymentFormHtml] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const handlePayment = async () => {
    // Prevent double-click and rapid clicking (3 seconds cooldown)
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttempt;
    const cooldownPeriod = 3000; // 3 seconds minimum between attempts

    if (lastAttempt > 0 && timeSinceLastAttempt < cooldownPeriod) {
      const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastAttempt) / 1000);
      toast({
        title: "Please Wait",
        description: `Please wait ${remainingTime} seconds before trying again to prevent duplicate payments.`,
        variant: "destructive",
      });
      return;
    }

    // Check if payment is already in progress
    if (isProcessing) {
      toast({
        title: "Payment in Progress",
        description: "A payment is already being processed. Please wait.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setLastAttempt(now);
    
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

      // Create HTML form for the modal iframe
      const formInputs = Object.entries(data.paymentData)
        .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
        .join('');

      const formHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>PayU Payment</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .loading { text-align: center; margin-top: 50px; }
          </style>
        </head>
        <body>
          <div class="loading">Redirecting to PayU...</div>
          <form id="payuForm" method="POST" action="${data.paymentUrl}">
            ${formInputs}
          </form>
          <script>
            document.getElementById('payuForm').submit();
          </script>
        </body>
        </html>
      `;

      setPaymentFormHtml(formHtml);
      setShowPaymentModal(true);

      toast({
        title: "Payment Window Opened",
        description: "Please complete your payment in the modal window.",
      });

      // Start polling for payment status after a delay
      setTimeout(() => {
        pollPaymentStatus(data.paymentData.txnid);
      }, 5000);

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      
      // Handle specific PayU errors
      let errorMessage = "Failed to initiate payment. Please try again.";
      let errorTitle = "Payment Error";
      
      if (error.message?.includes('Too many Requests')) {
        errorTitle = "Rate Limit Exceeded";
        errorMessage = "Too many payment requests. Please wait 60 seconds and try again.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
      // Reset state to allow new attempts after error
      setLastAttempt(0);
      setShowPaymentModal(false);
      setPaymentFormHtml("");
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
          setShowPaymentModal(false);
          setPaymentFormHtml("");
          setLastAttempt(0); // Reset on success
          toast({
            title: "Payment Successful!",
            description: "Your payment has been processed successfully.",
          });
          onSuccess();
          return;
        } else if (payment?.status === 'failure' || payment?.status === 'cancel' || payment?.status === 'cancelled') {
          setShowPaymentModal(false);
          setPaymentFormHtml("");
          setLastAttempt(0); // Reset on failure to allow retry
          toast({
            title: "Payment Failed",
            description: "Your payment was not successful. You can try again with a new payment attempt.",
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
    <>
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

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>Complete Your Payment</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPaymentModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-6 pt-0">
            {paymentFormHtml && (
              <iframe
                ref={iframeRef}
                srcDoc={paymentFormHtml}
                className="w-full h-full border-0 rounded-lg"
                title="PayU Payment"
                sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}