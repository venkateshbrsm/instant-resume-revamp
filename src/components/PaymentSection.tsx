import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PayUPayment } from "./PayUPayment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Download, CreditCard, FileDown, ArrowLeft, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

interface PaymentSectionProps {
  file: File;
  onBack: () => void;
  onStartOver: () => void;
}

export function PaymentSection({ file, onBack, onStartOver }: PaymentSectionProps) {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session and set up auth listener
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        
        // If user just logged in and they were trying to pay, continue to payment
        if (event === 'SIGNED_IN' && session?.user) {
          const wasTriyingToPay = sessionStorage.getItem('attemptingPayment');
          if (wasTriyingToPay === 'true') {
            sessionStorage.removeItem('attemptingPayment');
            setShowPayment(true);
            toast({
              title: "Logged in successfully!",
              description: "Continuing with your payment...",
            });
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [toast]);

  const handlePaymentClick = async () => {
    setIsCheckingAuth(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // User is authenticated, proceed with payment
        setShowPayment(true);
      } else {
        // User is not authenticated, redirect to login
        sessionStorage.setItem('attemptingPayment', 'true');
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue with your payment.",
        });
        navigate('/auth');
      }
    } catch (error) {
      toast({
        title: "Authentication Check Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
    
    setIsCheckingAuth(false);
  };

  const handlePaymentSuccess = () => {
    setPaymentCompleted(true);
    setShowPayment(false);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  const handleDownload = () => {
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `enhanced-${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (showPayment) {
    return (
      <PayUPayment
        file={file}
        amount={299}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    );
  }

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

            {/* Authentication Status */}
            {user && (
              <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Signed in as {user.email}</span>
                </div>
              </div>
            )}

            {/* Payment Button */}
            <Button 
              variant="hero" 
              size="xl" 
              onClick={handlePaymentClick}
              disabled={isCheckingAuth}
              className="w-full"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              {isCheckingAuth ? "Checking authentication..." : 
               user ? "Pay ₹299 with PayU" : "Sign In & Pay ₹299"}
            </Button>

            {/* Security Note */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                🔒 Secured by PayU • India's trusted payment gateway • No subscription
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
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center mt-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Preview
          </Button>
        </div>
      </div>
    </div>
  );
}