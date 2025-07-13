import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Download, CreditCard, Loader2, FileDown, ArrowLeft } from "lucide-react";

interface PaymentSectionProps {
  file: File;
  onBack: () => void;
  onStartOver: () => void;
}

export function PaymentSection({ file, onBack, onStartOver }: PaymentSectionProps) {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    
    // Simulate payment processing
    try {
      // In a real app, this would integrate with Stripe or similar payment processor
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setPaymentCompleted(true);
      setIsProcessingPayment(false);
      
      toast({
        title: "Payment Successful!",
        description: "Your enhanced resume is ready for download."
      });
    } catch (error) {
      setIsProcessingPayment(false);
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    // Simulate file download
    const link = document.createElement('a');
    link.href = '#'; // In real app, this would be the processed file URL
    link.download = `enhanced-${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Your enhanced resume is being downloaded."
    });
  };

  if (paymentCompleted) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <Card className="bg-card/80 backdrop-blur-sm border-accent/20">
            <CardContent className="p-8">
              <CheckCircle2 className="w-20 h-20 text-accent mx-auto mb-6" />
              
              <h2 className="text-3xl font-bold mb-4">Payment Successful! 🎉</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Your AI-enhanced resume is ready for download. You'll receive both PDF and Word formats.
              </p>

              <div className="space-y-4 mb-8">
                <Button 
                  variant="success" 
                  size="xl" 
                  onClick={handleDownload}
                  className="w-full"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Enhanced Resume
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                    <FileDown className="w-8 h-8 text-accent mx-auto mb-2" />
                    <h4 className="font-semibold">PDF Format</h4>
                    <p className="text-sm text-muted-foreground">Ready to submit</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <FileDown className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold">Word Format</h4>
                    <p className="text-sm text-muted-foreground">Easy to edit</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <h4 className="font-semibold mb-2">What's Included:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Professionally formatted PDF resume</li>
                    <li>• Editable Word document version</li>
                    <li>• ATS-optimized formatting</li>
                    <li>• Enhanced content with action verbs</li>
                    <li>• Modern, professional design</li>
                  </ul>
                </div>

                <Button variant="outline" onClick={onStartOver} className="w-full">
                  Enhance Another Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center">
              Complete Your Purchase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isProcessingPayment ? (
              <>
                {/* Order Summary */}
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <h4 className="font-semibold mb-2">Order Summary</h4>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">AI Resume Enhancement</span>
                      <span className="font-semibold">₹299</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Original file: {file.name}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">₹299</span>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <Button 
                  variant="hero" 
                  size="xl" 
                  onClick={handlePayment}
                  className="w-full"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay ₹299 & Download
                </Button>

                {/* Security Note */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    🔒 Secure payment processing • No subscription • One-time payment
                  </p>
                </div>

                {/* Features Reminder */}
                <div className="space-y-2 text-sm">
                  <h5 className="font-semibold">You'll receive:</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>✓ Professional PDF resume</li>
                    <li>✓ Editable Word document</li>
                    <li>✓ ATS-friendly formatting</li>
                    <li>✓ Instant download</li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4 py-8">
                <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
                  <p className="text-muted-foreground">
                    Please wait while we process your payment securely...
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center mt-6">
          <Button variant="ghost" onClick={onBack} disabled={isProcessingPayment}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Preview
          </Button>
        </div>
      </div>
    </div>
  );
}