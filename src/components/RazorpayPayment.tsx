import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RazorpayPaymentProps {
  fileName: string;
  amount: number;
  file: File;
  disabled?: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const RazorpayPayment = ({ fileName, amount, file, disabled }: RazorpayPaymentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    console.log('Starting Razorpay payment process...', { fileName, amount });
    
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      console.log('Calling razorpay-initiate function...');
      
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('User not authenticated. Please sign in again.');
      }

      console.log('User authenticated:', user.email);

      // Upload file to storage with better error handling
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      console.log('Uploading file to path:', filePath);
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('File upload error:', uploadError);
        if (uploadError.message.includes('already exists')) {
          // Try with a different filename
          const newFilePath = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2)}_${file.name}`;
          const { error: retryUploadError } = await supabase.storage
            .from('resumes')
            .upload(newFilePath, file);
          
          if (retryUploadError) {
            throw new Error(`Failed to upload file: ${retryUploadError.message}`);
          }
          console.log('File uploaded successfully on retry to:', newFilePath);
        } else {
          throw new Error(`Failed to upload file: ${uploadError.message}`);
        }
      } else {
        console.log('File uploaded successfully to:', filePath);
      }

      // Get enhanced content and theme from session storage if available
      const enhancedContentString = sessionStorage.getItem('enhancedContentForPayment');
      const extractedTextString = sessionStorage.getItem('extractedTextForPayment');
      const selectedThemeString = sessionStorage.getItem('selectedThemeForPayment');
      
      let enhancedContent = null;
      let extractedText = null;
      let selectedTheme = null;
      
      if (enhancedContentString) {
        try {
          enhancedContent = JSON.parse(enhancedContentString);
          extractedText = extractedTextString;
          console.log('Found enhanced content for payment, including in request');
          
          if (selectedThemeString) {
            selectedTheme = JSON.parse(selectedThemeString);
            console.log('Found selected theme for payment:', selectedTheme);
          } else {
            console.log('No theme found in sessionStorage, will default to navy');
          }
          
          // Clear from storage after using
          sessionStorage.removeItem('enhancedContentForPayment');
          sessionStorage.removeItem('extractedTextForPayment');
          sessionStorage.removeItem('selectedThemeForPayment');
        } catch (error) {
          console.warn('Failed to parse enhanced content or theme from storage:', error);
        }
      }

      console.log('Initiating payment with data:', { 
        fileName, 
        amount, 
        filePath, 
        hasEnhanced: !!enhancedContent, 
        hasTheme: !!selectedTheme 
      });

      const { data, error } = await supabase.functions.invoke('razorpay-initiate', {
        body: { 
          fileName, 
          amount, 
          filePath,
          enhancedContent: enhancedContent,
          extractedText: extractedText,
          selectedTheme: selectedTheme
        }
      });

      if (error) {
        console.error('Payment initiation error:', error);
        let errorMessage = 'Failed to initiate payment. Please try again.';
        
        if (error.message.includes('credentials')) {
          errorMessage = 'Payment system configuration error. Please contact support.';
        } else if (error.message.includes('authentication')) {
          errorMessage = 'Authentication failed. Please sign in again.';
        } else if (error.message) {
          errorMessage = `Payment error: ${error.message}`;
        }
        
        toast({
          title: "Payment Error",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      console.log('Razorpay response received:', data);

      if (!data || !data.orderId) {
        console.error('Invalid response from payment service:', data);
        toast({
          title: "Payment Error",
          description: "Invalid response from payment service. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Initialize Razorpay payment
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: data.name,
        description: data.description,
        order_id: data.orderId,
        prefill: data.prefill,
        theme: {
          color: '#3B82F6'
        },
        handler: async (response: any) => {
          console.log('Payment successful:', response);
          
          toast({
            title: "Payment Successful",
            description: "Your payment has been processed successfully!",
          });

          // Redirect to success page with all payment details for verification
          window.location.href = `/payment-success?razorpay_order_id=${response.razorpay_order_id}&razorpay_payment_id=${response.razorpay_payment_id}&razorpay_signature=${response.razorpay_signature}`;
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            console.log('Payment modal dismissed');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.';
      toast({
        title: "Payment Error",
        description: errorMessage,
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
      {isLoading ? 'Processing...' : `Pay ₹${amount} with Razorpay`}
    </Button>
  );
};