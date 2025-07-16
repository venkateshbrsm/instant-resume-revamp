import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Download, Home, Loader2 } from "lucide-react";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [payment, setPayment] = useState<any>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get Razorpay response parameters
      const razorpayResponse = {
        razorpay_order_id: searchParams.get('razorpay_order_id'),
        razorpay_payment_id: searchParams.get('razorpay_payment_id'),
        razorpay_signature: searchParams.get('razorpay_signature')
      };

      if (!razorpayResponse.razorpay_order_id || !razorpayResponse.razorpay_payment_id) {
        throw new Error('Invalid payment response');
      }

      // Verify payment with backend
      const { data, error } = await supabase.functions.invoke('razorpay-verify', {
        body: razorpayResponse
      });

      if (error) throw error;

      if (data.success) {
        setPayment(data.payment);
        toast({
          title: "Payment Verified!",
          description: "Your payment has been successfully verified.",
        });
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Unable to verify payment. Please contact support.",
        variant: "destructive",
      });
      navigate('/payment/failure');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownload = async () => {
    try {
      const paymentId = searchParams.get('razorpay_payment_id');
      if (!paymentId) {
        throw new Error('Payment ID not found');
      }

      toast({
        title: "Preparing Download",
        description: "Your enhanced resume is being prepared...",
      });

      const { data, error } = await supabase.functions.invoke('download-enhanced-resume', {
        body: { paymentId }
      });

      if (error) {
        throw new Error(error.message || 'Download failed');
      }

      // The data is already a Uint8Array/ArrayBuffer for DOCX files
      let blob: Blob;
      let filename: string;
      
      if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
        // Binary DOCX data
        blob = new Blob([data], { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        filename = `Enhanced_Resume_${new Date().getTime()}.docx`;
      } else {
        // Fallback for any other format (shouldn't happen with the fixed function)
        blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        filename = `Enhanced_Resume_${new Date().getTime()}.json`;
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your enhanced resume is being downloaded.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download resume",
        variant: "destructive"
      });
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <h3 className="text-lg font-semibold">Verifying Payment...</h3>
            <p className="text-muted-foreground text-center mt-2">
              Please wait while we verify your payment with Razorpay
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {payment && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-sm">{payment.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-semibold">₹{payment.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-semibold capitalize text-green-600">
                  {payment.status}
                </span>
              </div>
            </div>
          )}

          <div className="text-center space-y-2">
            <h3 className="font-semibold">Your Resume is Ready!</h3>
            <p className="text-muted-foreground text-sm">
              Your resume has been enhanced with AI-powered improvements.
              Download your professionally optimized resume now.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleDownload}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Enhanced Resume
            </Button>

            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            Keep this page bookmarked for future reference. 
            You can re-download your enhanced resume anytime.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}