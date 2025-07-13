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
        <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
          <Star className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" />
          Trusted by 10,000+ professionals
        </Badge>

        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Transform Your Resume with{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            AI Power
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          Upload your current resume and get a professionally redesigned version in minutes. 
          No sign-up required. Pay only if you love the result.
        </p>

        {/* Value propositions */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          {[
            "AI-Powered Enhancement",
            "Professional Templates",
            "ATS-Friendly Format",
            "Instant Preview"
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-foreground">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span className="font-medium">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA section */}
        <div className="space-y-6">
          <Button 
            variant="hero" 
            size="xl" 
            onClick={onGetStarted}
            className="shadow-glow animate-pulse-gentle"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Your Makeover
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Upload • Preview • Pay Only ₹299 if Satisfied
          </p>
        </div>

        {/* Social proof */}
        <Card className="mt-16 max-w-2xl mx-auto bg-card/80 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">10,000+</div>
                <div className="text-sm text-muted-foreground">Resumes Enhanced</div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <div className="text-2xl font-bold text-accent">95%</div>
                <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <div className="text-2xl font-bold text-primary">5 Min</div>
                <div className="text-sm text-muted-foreground">Average Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}