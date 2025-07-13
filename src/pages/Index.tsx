import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { FileUploadSection } from "@/components/FileUploadSection";
import { PreviewSection } from "@/components/PreviewSection";
import { PaymentSection } from "@/components/PaymentSection";

type AppStep = "hero" | "upload" | "preview" | "payment";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>("hero");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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
      />
      {renderCurrentStep()}
    </div>
  );
};

export default Index;
