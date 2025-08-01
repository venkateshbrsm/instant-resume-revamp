import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RazorpayPayment } from "./RazorpayPayment";
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
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [lastPaymentAttempt, setLastPaymentAttempt] = useState<number>(0);
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
    // Enhanced rate limiting: Prevent multiple clicks within 5 seconds
    const now = Date.now();
    if (now - lastPaymentAttempt < 5000) {
      toast({
        title: "Please wait",
        description: "Please wait 5 seconds between payment attempts to prevent duplicates.",
        variant: "destructive"
      });
      return;
    }

    setLastPaymentAttempt(now);
    setIsCheckingAuth(true);
    setIsPaymentProcessing(true);
    
    try {
      // Check for any recent pending payments for this user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check for recent pending payments to prevent duplicates
        const { data: recentPayments, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .eq('email', session.user.email)
          .eq('status', 'initiated')
          .order('created_at', { ascending: false })
          .limit(1);

        if (paymentError) {
          console.error('Error checking recent payments:', paymentError);
        }

        // If there's a payment within the last 2 minutes, warn user
        if (recentPayments && recentPayments.length > 0) {
          const lastPayment = new Date(recentPayments[0].created_at);
          const timeDiff = (now - lastPayment.getTime()) / 1000; // seconds
          
            if (timeDiff < 120) { // 2 minutes
              toast({
                title: "Payment in Progress",
                description: "You have a recent payment attempt. Please check your Razorpay page or wait 2 minutes before trying again.",
                variant: "destructive"
              });
            setIsCheckingAuth(false);
            setIsPaymentProcessing(false);
            return;
          }
        }

        // User is authenticated, proceed with payment
        setShowPayment(true);
      } else {
        // User is not authenticated, redirect to login
        sessionStorage.setItem('attemptingPayment', 'true');
        // Store file info to restore after login
        sessionStorage.setItem('pendingFile', JSON.stringify({
          name: file.name,
          size: file.size,
          type: file.type
        }));
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue with your payment.",
        });
        navigate('/auth');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Unable to process payment right now. Please try again in a few minutes.",
        variant: "destructive"
      });
    }
    
    setIsCheckingAuth(false);
    setIsPaymentProcessing(false);
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
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-6 sm:py-8">
        <div className="max-w-md w-full">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-center text-lg sm:text-xl">
                Complete Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RazorpayPayment
                fileName={file.name}
                amount={499}
                file={file}
              />
              <Button variant="outline" onClick={handlePaymentCancel} className="w-full">
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-6 sm:py-8">
        <div className="max-w-2xl w-full text-center">
          <Card className="bg-card/80 backdrop-blur-sm border-accent/20">
            <CardContent className="p-6 sm:p-8">
              <CheckCircle2 className="w-16 sm:w-20 h-16 sm:h-20 text-accent mx-auto mb-4 sm:mb-6" />
              
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Payment Successful! 🎉</h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-2">
                Your AI-enhanced resume is ready for download. You'll receive both PDF and Word formats.
              </p>

              <div className="space-y-4 mb-6 sm:mb-8">
                <Button 
                  variant="success" 
                  size="xl" 
                  onClick={handleDownload}
                  className="w-full"
                >
                  <Download className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                  <span className="text-sm sm:text-base">Download Enhanced Resume</span>
                </Button>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 rounded-lg bg-accent/5 border border-accent/20">
                    <FileDown className="w-6 sm:w-8 h-6 sm:h-8 text-accent mx-auto mb-1 sm:mb-2" />
                    <h4 className="font-semibold text-sm sm:text-base">PDF Format</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Ready to submit</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <FileDown className="w-6 sm:w-8 h-6 sm:h-8 text-primary mx-auto mb-1 sm:mb-2" />
                    <h4 className="font-semibold text-sm sm:text-base">Word Format</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Easy to edit</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border">
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">What's Included:</h4>
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                    <li>• Professionally formatted PDF resume</li>
                    <li>• Editable Word document version</li>
                    <li>• ATS-optimized formatting</li>
                    <li>• Enhanced content with action verbs</li>
                    <li>• Modern, professional design</li>
                  </ul>
                </div>

                <Button variant="outline" onClick={onStartOver} className="w-full text-sm sm:text-base">
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
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-6 sm:py-8">
      <div className="max-w-md w-full">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-center text-lg sm:text-xl">
              Complete Your Purchase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Summary */}
            <div className="space-y-4">
              <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Order Summary</h4>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm">AI Resume Enhancement</span>
                  <span className="font-semibold text-sm sm:text-base">₹499</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm text-muted-foreground">
                  <span className="break-all">Original file: {file.name}</span>
                </div>
              </div>

              <div className="border-t pt-3 sm:pt-4">
                <div className="flex justify-between items-center text-base sm:text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹499</span>
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
              disabled={isCheckingAuth || isPaymentProcessing}
              className="w-full text-sm sm:text-base"
            >
              <CreditCard className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                {isCheckingAuth || isPaymentProcessing ? "Processing..." : 
                 user ? "Pay ₹499 with Razorpay" : "Sign In & Pay ₹499"}
            </Button>

            {/* Security Note */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                🔒 Secured by Razorpay • India's trusted payment gateway • No subscription
              </p>
            </div>

            {/* Features Reminder */}
            <div className="space-y-2 text-xs sm:text-sm">
              <h5 className="font-semibold text-sm sm:text-base">You'll receive:</h5>
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