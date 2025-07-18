import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, CheckCircle, Star } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="relative min-h-screen bg-gradient-hero flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="relative w-full max-w-6xl mx-auto text-center">
        {/* Trust badge */}
        <Badge variant="secondary" className="mb-4 sm:mb-6 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium">
          <Star className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 text-yellow-500" fill="currentColor" />
          Trusted by 10,000+ professionals
        </Badge>

        {/* Main headline */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight px-2 sm:px-4">
          Transform Your Resume with{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            AI Power
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-muted-foreground mb-4 sm:mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-6">
          Upload your current resume and get a <span className="font-semibold text-accent">free preview</span> of your professionally redesigned version in minutes. 
          No sign-up required. Pay only if you love the result.
        </p>

        {/* Value propositions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-6 sm:mb-8 md:mb-10 px-4 sm:px-6 max-w-2xl mx-auto">
          {[
            "AI-Powered Enhancement",
            "Professional Templates",
            "ATS-Friendly Format",
            "Instant Preview"
          ].map((feature) => (
            <div key={feature} className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 text-foreground text-xs sm:text-sm md:text-base">
              <CheckCircle className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 text-accent flex-shrink-0" />
              <span className="font-medium text-center sm:text-left">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA section */}
        <div className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          <div className="flex justify-center">
            <Button 
              variant="hero" 
              size="xl" 
              onClick={onGetStarted}
              className="shadow-glow animate-pulse-gentle w-full sm:w-auto max-w-xs sm:max-w-none"
            >
              <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">Upload Your Resume</span>
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
            </Button>
          </div>
          
          <p className="text-xs sm:text-sm text-center">
            <span className="text-muted-foreground">Upload</span> • <span className="font-bold text-accent">Free Preview</span> • <span className="text-muted-foreground">Pay Only ₹299 if Satisfied</span>
          </p>
        </div>

        {/* Social proof */}
        <Card className="mt-12 sm:mt-16 max-w-2xl w-full mx-auto bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-center">
              <div className="flex-1">
                <div className="text-lg sm:text-2xl font-bold text-primary">10,000+</div>
                <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Resumes Enhanced</div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-border" />
              <div className="w-full sm:hidden h-px bg-border" />
              <div className="flex-1">
                <div className="text-lg sm:text-2xl font-bold text-accent">95%</div>
                <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Satisfaction Rate</div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-border" />
              <div className="w-full sm:hidden h-px bg-border" />
              <div className="flex-1">
                <div className="text-lg sm:text-2xl font-bold text-primary">5 Min</div>
                <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Average Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}