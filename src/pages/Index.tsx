import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { FileUploadSection } from "@/components/FileUploadSection";
import { PreviewSection } from "@/components/PreviewSection";
import { PaymentSection } from "@/components/PaymentSection";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppStep = "hero" | "upload" | "preview" | "payment";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>("hero");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if user should be redirected after login
        if (event === 'SIGNED_IN' && session?.user) {
          const shouldRedirectToPayment = sessionStorage.getItem('redirectToPayment');
          const shouldReturnToPreview = sessionStorage.getItem('returnToPreview');
          const wasAttemptingPurchase = sessionStorage.getItem('attemptingPurchase');
          
          if (shouldRedirectToPayment === 'true') {
            sessionStorage.removeItem('redirectToPayment');
            // Restore file if available
            const pendingFileInfo = sessionStorage.getItem('pendingFile');
            if (pendingFileInfo) {
              try {
                const fileInfo = JSON.parse(pendingFileInfo);
                // Create a placeholder file object for the preview
                const blob = new Blob([''], { type: fileInfo.type });
                const restoredFile = new File([blob], fileInfo.name, { type: fileInfo.type });
                setUploadedFile(restoredFile);
              } catch (error) {
                console.error('Error restoring file info:', error);
              }
              sessionStorage.removeItem('pendingFile');
            }
            setCurrentStep('payment');
          } else if (shouldReturnToPreview === 'true' || wasAttemptingPurchase === 'true') {
            sessionStorage.removeItem('returnToPreview');
            sessionStorage.removeItem('attemptingPurchase');
            // Restore file if available
            const pendingFileInfo = sessionStorage.getItem('pendingFile');
            if (pendingFileInfo) {
              try {
                const fileInfo = JSON.parse(pendingFileInfo);
                // Create a placeholder file object for the preview
                const blob = new Blob([''], { type: fileInfo.type });
                const restoredFile = new File([blob], fileInfo.name, { type: fileInfo.type });
                setUploadedFile(restoredFile);
              } catch (error) {
                console.error('Error restoring file info:', error);
              }
              sessionStorage.removeItem('pendingFile');
            }
            setCurrentStep('preview');
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check if user should be redirected after page load
      if (session?.user) {
        const shouldRedirectToPayment = sessionStorage.getItem('redirectToPayment');
        const shouldReturnToPreview = sessionStorage.getItem('returnToPreview');
        const wasAttemptingPurchase = sessionStorage.getItem('attemptingPurchase');
        
        if (shouldRedirectToPayment === 'true') {
          sessionStorage.removeItem('redirectToPayment');
          // Restore file if available
          const pendingFileInfo = sessionStorage.getItem('pendingFile');
          if (pendingFileInfo) {
            try {
              const fileInfo = JSON.parse(pendingFileInfo);
              // Create a placeholder file object for the preview
              const blob = new Blob([''], { type: fileInfo.type });
              const restoredFile = new File([blob], fileInfo.name, { type: fileInfo.type });
              setUploadedFile(restoredFile);
            } catch (error) {
              console.error('Error restoring file info:', error);
            }
            sessionStorage.removeItem('pendingFile');
          }
          setCurrentStep('payment');
        } else if (shouldReturnToPreview === 'true' || wasAttemptingPurchase === 'true') {
          sessionStorage.removeItem('returnToPreview');
          sessionStorage.removeItem('attemptingPurchase');
          // Restore file if available
          const pendingFileInfo = sessionStorage.getItem('pendingFile');
          if (pendingFileInfo) {
            try {
              const fileInfo = JSON.parse(pendingFileInfo);
              // Create a placeholder file object for the preview
              const blob = new Blob([''], { type: fileInfo.type });
              const restoredFile = new File([blob], fileInfo.name, { type: fileInfo.type });
              setUploadedFile(restoredFile);
            } catch (error) {
              console.error('Error restoring file info:', error);
            }
            sessionStorage.removeItem('pendingFile');
          }
          setCurrentStep('preview');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleGetStarted = () => {
    setCurrentStep("upload");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileProcessed = (file: File) => {
    setUploadedFile(file);
    setCurrentStep("preview");
  };

  const handlePurchase = () => {
    setCurrentStep("payment");
  };

  const handleBackToHero = () => {
    setCurrentStep("hero");
    setUploadedFile(null);
  };

  const handleBackToUpload = () => {
    setCurrentStep("upload");
  };

  const handleBackToPreview = () => {
    setCurrentStep("preview");
  };

  const handleNavigate = (step: string) => {
    const validSteps: AppStep[] = ["hero", "upload", "preview", "payment"];
    if (validSteps.includes(step as AppStep)) {
      setCurrentStep(step as AppStep);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "hero":
        return <HeroSection onGetStarted={handleGetStarted} />;
      case "upload":
        return (
          <FileUploadSection
            onFileProcessed={handleFileProcessed}
            onBack={handleBackToHero}
          />
        );
      case "preview":
        return uploadedFile ? (
          <div className="hidden">
            <PreviewSection
              file={uploadedFile}
              onPurchase={handlePurchase}
              onBack={handleBackToUpload}
            />
          </div>
        ) : (
          <HeroSection onGetStarted={handleGetStarted} />
        );
      case "payment":
        return uploadedFile ? (
          <PaymentSection
            file={uploadedFile}
            onBack={handleBackToPreview}
            onStartOver={handleBackToHero}
          />
        ) : (
          <HeroSection onGetStarted={handleGetStarted} />
        );
      default:
        return <HeroSection onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden touch-scroll">
      <Navigation 
        currentStep={currentStep} 
        onNavigate={handleNavigate}
        showSteps={true}
        user={user}
        onAuthAction={() => navigate('/auth')}
      />
      <main className="flex-1 w-full">
        {renderCurrentStep()}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
