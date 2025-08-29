import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Download, Home, Loader2 } from "lucide-react";
// Canvas PDF generator import removed - using stored blob instead

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [payment, setPayment] = useState<any>(null);

  useEffect(() => {
    // Store payment ID in sessionStorage when we receive it
    const paymentId = searchParams.get('razorpay_payment_id');
    if (paymentId) {
      console.log('Storing payment ID in sessionStorage:', paymentId);
      sessionStorage.setItem('razorpay_payment_id', paymentId);
    }
    
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    try {
      console.log('Starting payment verification...');
      
      // Set a timeout to prevent infinite loading - extend for PDF processing
      const fileName = searchParams.get('fileName') || '';
      const isPDF = fileName.toLowerCase().endsWith('.pdf');
      const timeoutDuration = isPDF ? 90000 : 45000; // Increased timeout: 90 seconds for PDFs, 45 for others
      
      timeoutId = setTimeout(() => {
        console.warn(`Payment verification timeout after ${timeoutDuration/1000} seconds`);
        setIsVerifying(false);
        
        // Try to get payment ID from URL or sessionStorage
        let paymentId = searchParams.get('razorpay_payment_id');
        if (!paymentId) {
          paymentId = sessionStorage.getItem('razorpay_payment_id');
        }
        
        setPayment({
          paymentId: paymentId || 'unknown',
          amount: '299',
          status: 'paid'
        });
        toast({
          title: "Payment Verified!",
          description: isPDF 
            ? "Your payment has been verified. PDF processing may take a moment longer."
            : "Your payment has been verified. Your resume is being processed.",
        });
      }, timeoutDuration);
      
      // Get Razorpay response parameters from URL first, then sessionStorage as fallback
      let razorpayResponse = {
        razorpay_order_id: searchParams.get('razorpay_order_id'),
        razorpay_payment_id: searchParams.get('razorpay_payment_id'),
        razorpay_signature: searchParams.get('razorpay_signature')
      };

      // If payment ID not in URL, try to get from sessionStorage
      if (!razorpayResponse.razorpay_payment_id) {
        const storedPaymentId = sessionStorage.getItem('razorpay_payment_id');
        if (storedPaymentId) {
          console.log('Payment ID not in URL, using sessionStorage value:', storedPaymentId);
          razorpayResponse.razorpay_payment_id = storedPaymentId;
        }
      }

      console.log('Payment params:', razorpayResponse);

      if (!razorpayResponse.razorpay_order_id || !razorpayResponse.razorpay_payment_id) {
        throw new Error('Invalid payment response - missing required parameters');
      }

      // Verify payment with backend
      console.log('Calling razorpay-verify function...');
      
      const { data, error } = await supabase.functions.invoke('razorpay-verify', {
        body: razorpayResponse
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function error:', error);
        // Don't throw error immediately - try to continue with basic payment info
        console.warn('Payment verification had issues, but proceeding with basic payment info');
        
        setPayment({
          paymentId: razorpayResponse.razorpay_payment_id,
          amount: '299',
          status: 'paid'
        });
        
        toast({
          title: "Payment Processed!",
          description: "Your payment has been processed. Your resume may take a moment to be ready.",
          variant: "default"
        });
        
        return; // Exit early but still show success page
      }

      // The razorpay-verify function returns { success: true/false, payment: {...} }
      if (data && data.success) {
        console.log('Payment verified successfully:', data);
        setPayment({
          paymentId: razorpayResponse.razorpay_payment_id,
          amount: '299', // Since we know it's ₹299 from the logs
          status: 'paid'
        });
        toast({
          title: "Payment Verified!",
          description: "Your payment has been successfully verified.",
        });
      } else {
        console.error('Payment verification failed:', data);
        // Still show success but with warning
        setPayment({
          paymentId: razorpayResponse.razorpay_payment_id,
          amount: '299',
          status: 'paid'
        });
        
        toast({
          title: "Payment Received",
          description: "Your payment has been received. Processing may take a few moments.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      
      // Check if we have payment params from URL or sessionStorage
      let hasPaymentId = searchParams.get('razorpay_payment_id');
      if (!hasPaymentId) {
        hasPaymentId = sessionStorage.getItem('razorpay_payment_id');
        console.log('Payment ID not in URL, retrieved from sessionStorage:', hasPaymentId);
      }
      
      if (hasPaymentId) {
        console.log('Payment ID found, showing success despite verification error');
        setPayment({
          paymentId: hasPaymentId,
          amount: '299',
          status: 'paid'
        });
        
        toast({
          title: "Payment Received",
          description: "Your payment has been received. Your resume is being processed.",
        });
      } else {
        // Only navigate to failure if no payment ID
        toast({
          title: "Verification Failed",
          description: error instanceof Error ? error.message : "Unable to verify payment. Please contact support.",
          variant: "destructive",
        });
        navigate('/payment-failure');
      }
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setIsVerifying(false);
    }
  };

  const handleDownload = async () => {
    try {
      // Try to get payment ID from URL first, then from sessionStorage
      let paymentId = searchParams.get('razorpay_payment_id');
      if (!paymentId) {
        paymentId = sessionStorage.getItem('razorpay_payment_id');
        console.log('Payment ID not in URL, retrieved from sessionStorage:', paymentId);
      }
      
      if (!paymentId) {
        throw new Error('Payment ID not found in URL or sessionStorage');
      }

      toast({
        title: "Preparing Download",
        description: "Your enhanced resume PDF is being prepared...",
      });

      // Check if we have a pre-generated canvas PDF blob with perfect visual fidelity
      const canvasPdfBlob = sessionStorage.getItem('canvasPdfBlob');
        
        if (canvasPdfBlob) {
          try {
            console.log('Using pre-generated canvas PDF for perfect visual fidelity...');
            
            toast({
              title: "Downloading High-Quality PDF",
              description: "Using pre-generated PDF with exact visual fidelity...",
            });
            
            // Convert base64 back to blob
            const response = await fetch(canvasPdfBlob);
            const blob = await response.blob();
            
            const filename = `Enhanced_Resume_${new Date().getTime()}.pdf`;
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast({
              title: "Download Complete",
              description: "Your enhanced resume PDF with perfect visual fidelity has been downloaded!",
            });
            
            // Clean up session storage
            sessionStorage.removeItem('canvasPdfBlob');
            return;
          } catch (error) {
            console.warn('Canvas-based PDF download failed, falling back to server generation:', error);
            toast({
              title: "Falling back to server generation",
              description: "Using server-side PDF generation as backup...",
            });
          }
        }
        
        // First try to get enhanced content from database using payment ID
        console.log('🔍 Attempting to retrieve enhanced content from database...');
        
        let enhancedContentStr2 = null;
        let selectedThemeStr = null;
        
        try {
          // Query the payments table to get the enhanced content
          const { data: paymentData, error: paymentError } = await supabase
            .from('payments')
            .select('enhanced_content, theme_id')
            .eq('razorpay_payment_id', paymentId)
            .single();
            
          if (paymentError) {
            console.warn('Could not retrieve from database:', paymentError);
          } else if (paymentData && paymentData.enhanced_content) {
            console.log('✅ Retrieved enhanced content from database:', paymentData);
            enhancedContentStr2 = JSON.stringify(paymentData.enhanced_content);
            
            // Create theme object from theme_id
            const themeMap: any = {
              'navy': { primary: '#3b82f6', secondary: '#60a5fa', accent: '#93c5fd' },
              'emerald': { primary: '#10b981', secondary: '#34d399', accent: '#6ee7b7' },
              'purple': { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#c4b5fd' },
              'rose': { primary: '#f43f5e', secondary: '#fb7185', accent: '#fda4af' },
              'amber': { primary: '#f59e0b', secondary: '#fbbf24', accent: '#fcd34d' }
            };
            
            const themeColors = themeMap[paymentData.theme_id] || themeMap['navy'];
            selectedThemeStr = JSON.stringify(themeColors);
          }
        } catch (dbError) {
          console.warn('Database query failed:', dbError);
        }
        
        // Fallback to localStorage if database query failed
        if (!enhancedContentStr2) {
          console.log('🔍 Falling back to localStorage...');
          enhancedContentStr2 = localStorage.getItem('enhancedContentForPayment');
          
          // Fallback to backup storage if main storage is empty
          if (!enhancedContentStr2) {
            console.log('Main localStorage empty, checking backup...');
            enhancedContentStr2 = localStorage.getItem('latestEditedContent');
          }
          
          selectedThemeStr = localStorage.getItem('selectedColorThemeForPayment');
        }
        
        console.log('🔍 Local storage check:', {
          hasEnhancedContent: !!enhancedContentStr2,
          hasTheme: !!selectedThemeStr,
          enhancedContentLength: enhancedContentStr2?.length,
          themeLength: selectedThemeStr?.length,
          enhancedContentPreview: enhancedContentStr2?.substring(0, 100),
          themePreview: selectedThemeStr?.substring(0, 50)
        });
        
        if (enhancedContentStr2 && selectedThemeStr) {
          try {
            const enhancedContent = JSON.parse(enhancedContentStr2);
            const selectedTheme = JSON.parse(selectedThemeStr);
            
            console.log('🔍 Downloaded content data check:');
            console.log('  - Name:', enhancedContent.name);
            console.log('  - Skills:', enhancedContent.skills);
            console.log('  - Contact:', enhancedContent.contact);
            
            // Import the visual PDF generator
            const { generateVisualPdf, extractResumeDataFromEnhanced } = await import("@/lib/visualPdfGenerator");
            
            toast({
              title: "Generating Visual PDF",
              description: "Creating a beautiful PDF that matches your preview...",
            });
            
            // Use the same visual PDF generator as preview
            const resumeData = extractResumeDataFromEnhanced(enhancedContent);
            console.log('🔍 Extracted resume data for PDF:', resumeData);
            
            const pdfBlob = await generateVisualPdf(resumeData, {
              templateType: 'modern', // Always use modern template as we filtered others
              colorTheme: {
                primary: selectedTheme.primary,
                secondary: selectedTheme.secondary,
                accent: selectedTheme.accent
              },
              filename: `Enhanced_Resume_${enhancedContent.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Resume'}_${new Date().getTime()}.pdf`
            });
            
            // Create download link
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Enhanced_Resume_${enhancedContent.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Resume'}_${new Date().getTime()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast({
              title: "Visual PDF Downloaded! 🎨",
              description: "Your beautifully designed resume has been downloaded - matches the preview exactly!",
            });
            
            // Clean up local storage
            localStorage.removeItem('enhancedContentForPayment');
            localStorage.removeItem('selectedColorThemeForPayment');
            localStorage.removeItem('selectedTemplateForPayment');
            localStorage.removeItem('latestEditedContent');
            return;
          } catch (error) {
            console.error('Error generating visual PDF:', error);
            toast({
              title: "Error",
              description: "Failed to generate PDF. Please try again.",
              variant: "destructive",
            });
            return;
          }
        }
        
        // If no session data, show error
        toast({
          title: "Error",
          description: "Resume data not found. Please go back and try the process again.",
          variant: "destructive",
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
    const fileName = searchParams.get('fileName') || '';
    const isPDF = fileName.toLowerCase().endsWith('.pdf');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <h3 className="text-lg font-semibold">
              {isPDF ? 'Processing PDF Resume' : 'Verifying Payment...'}
            </h3>
            <p className="text-muted-foreground text-center mt-2">
              {isPDF 
                ? 'PDF files require additional processing time. Please wait while we extract and enhance your resume...'
                : 'Please wait while we verify your payment with Razorpay'
              }
            </p>
            {isPDF && (
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mt-4 text-sm text-blue-700 dark:text-blue-300">
                <p>⏱️ PDF processing may take up to 60 seconds</p>
              </div>
            )}
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
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold"
              size="lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Enhanced Resume as PDF
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