import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, CheckCircle, Star } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="relative min-h-screen bg-gradient-hero flex items-center justify-center px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-6xl mx-auto text-center">
        {/* Trust badge */}
        <Badge variant="secondary" className="mb-4 sm:mb-6 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium">
          <Star className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 text-yellow-500" fill="currentColor" />
          Trusted by 10,000+ professionals
        </Badge>

        {/* Main headline */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight px-2">
          Transform Your Resume with{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            AI Power
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-muted-foreground mb-4 sm:mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
          Upload your current resume and get a professionally redesigned version in minutes. 
          No sign-up required. Pay only if you love the result.
        </p>

        {/* Value propositions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-6 sm:mb-8 md:mb-10 px-4 max-w-2xl mx-auto">
          {[
            "AI-Powered Enhancement",
            "Professional Templates",
            "ATS-Friendly Format",
            "Instant Preview"
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-1 sm:gap-2 text-foreground text-xs sm:text-sm md:text-base">
              <CheckCircle className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 text-accent flex-shrink-0" />
              <span className="font-medium break-words">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA section */}
        <div className="space-y-4 sm:space-y-6 px-4">
          <Button 
            variant="hero" 
            size="xl" 
            onClick={onGetStarted}
            className="shadow-glow animate-pulse-gentle w-full sm:w-auto"
          >
            <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
            <span className="text-sm sm:text-base">Start Your Makeover</span>
            <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
          </Button>
          
          <p className="text-xs sm:text-sm text-muted-foreground">
            Upload • Preview • Pay Only ₹1 if Satisfied
          </p>
        </div>

        {/* Social proof */}
        <Card className="mt-12 sm:mt-16 max-w-2xl mx-4 sm:mx-auto bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-center gap-4 sm:gap-8 text-center">
              <div>
                <div className="text-lg sm:text-2xl font-bold text-primary">10,000+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Resumes Enhanced</div>
              </div>
              <div className="w-px h-8 sm:h-12 bg-border" />
              <div>
                <div className="text-lg sm:text-2xl font-bold text-accent">95%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
              <div className="w-px h-8 sm:h-12 bg-border" />
              <div>
                <div className="text-lg sm:text-2xl font-bold text-primary">5 Min</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Average Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}