import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavigationProps {
  currentStep: string;
  onNavigate?: (step: string) => void;
  showSteps?: boolean;
}

export function Navigation({ currentStep, onNavigate, showSteps = true }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const steps = [
    { id: "hero", label: "Home", enabled: true },
    { id: "upload", label: "Upload", enabled: currentStep !== "hero" },
    { id: "preview", label: "Preview", enabled: currentStep === "preview" || currentStep === "payment" },
    { id: "payment", label: "Payment", enabled: currentStep === "payment" },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">Revivify</span>
          </div>

          {/* Desktop Navigation */}
          {showSteps && (
            <div className="hidden md:flex items-center space-x-6">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => step.enabled && onNavigate?.(step.id)}
                  disabled={!step.enabled}
                  className={`text-sm font-medium transition-colors ${
                    currentStep === step.id
                      ? "text-primary border-b-2 border-primary pb-1"
                      : step.enabled
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground/50 cursor-not-allowed"
                  }`}
                >
                  {step.label}
                </button>
              ))}
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Contact/Support */}
          <div className="hidden md:flex items-center">
            <Button variant="ghost" size="sm">
              Support
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && showSteps && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => {
                    if (step.enabled && onNavigate) {
                      onNavigate(step.id);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  disabled={!step.enabled}
                  className={`text-left px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                    currentStep === step.id
                      ? "text-primary bg-primary/10"
                      : step.enabled
                      ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                      : "text-muted-foreground/50 cursor-not-allowed"
                  }`}
                >
                  {step.label}
                </button>
              ))}
              <Button variant="ghost" size="sm" className="justify-start">
                Support
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}