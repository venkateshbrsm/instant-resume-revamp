import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { FileUploadSection } from "@/components/FileUploadSection";
import { PreviewSection } from "@/components/PreviewSection";
import { PaymentSection } from "@/components/PaymentSection";
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
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    setCurrentStep("upload");
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
          <PreviewSection
            file={uploadedFile}
            onPurchase={handlePurchase}
            onBack={handleBackToUpload}
          />
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
    <div className="min-h-screen">
      <Navigation 
        currentStep={currentStep} 
        onNavigate={handleNavigate}
        showSteps={true}
        user={user}
        onAuthAction={() => navigate('/auth')}
      />
      {renderCurrentStep()}
    </div>
  );
};

export default Index;
