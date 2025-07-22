
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, CheckCircle, Star, Clock, Shield } from "lucide-react";
import { BeforeAfterShowcase } from "@/components/BeforeAfterShowcase";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="relative min-h-screen bg-gradient-hero flex items-center justify-center px-3 sm:px-6 lg:px-8 overflow-hidden">
      {/* Optimized background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-3" />
      <div className="absolute top-10 left-3 w-24 h-24 sm:w-48 sm:h-48 bg-primary/3 rounded-full" style={{ filter: 'blur(40px)' }} />
      <div className="absolute bottom-10 right-3 w-32 h-32 sm:w-64 sm:h-64 bg-accent/3 rounded-full" style={{ filter: 'blur(50px)' }} />
      
      <div className="relative w-full max-w-6xl mx-auto text-center">
        {/* Main headline - moved to top for immediate impact */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-[1.1] px-2 sm:px-4">
          Get Your Professional Resume Makeover in{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">
            Under 5 Minutes
          </span>
        </h1>

        {/* Enhanced subheadline with clearer value prop */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4 sm:px-6">
          Upload your resume and get a <span className="font-semibold text-accent">free professional preview</span> instantly. 
          <span className="block mt-2 text-base sm:text-lg font-medium text-primary">No email • No signup • Pay only ₹299 if you love it</span>
        </p>

        {/* Single, focused CTA with conversion triggers */}
        <div className="mb-8 sm:mb-12 px-4 sm:px-6">
          <Button 
            variant="hero" 
            size="xl" 
            onClick={onGetStarted}
            className="shadow-glow hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto max-w-md sm:max-w-none min-h-[64px] text-lg sm:text-xl font-bold relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <Sparkles className="w-6 h-6 mr-3 flex-shrink-0 animate-pulse" />
            <div className="flex flex-col items-center sm:flex-row sm:items-center">
              <span>Get My Free Preview</span>
              <span className="text-sm font-normal opacity-90 sm:ml-2">2 min upload</span>
            </div>
            <ArrowRight className="w-6 h-6 ml-3 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          {/* Trust indicators right below CTA */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Shield className="w-4 h-4 text-green-500" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Instant Preview</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-accent" />
              <span>No Signup Required</span>
            </div>
          </div>
        </div>

        {/* Social proof - moved higher for trust building */}
        <div className="mb-8 sm:mb-12">
          <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
            <Star className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" />
            Join 10,000+ professionals who upgraded their resumes
          </Badge>
          
          <Card className="max-w-2xl w-full mx-auto bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-center">
                <div className="flex-1">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">10,000+</div>
                  <div className="text-sm text-muted-foreground">Resumes Enhanced</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-border" />
                <div className="w-full sm:hidden h-px bg-border" />
                <div className="flex-1">
                  <div className="text-2xl sm:text-3xl font-bold text-accent">95%</div>
                  <div className="text-sm text-muted-foreground">Love Their Results</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-border" />
                <div className="w-full sm:hidden h-px bg-border" />
                <div className="flex-1">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">2 Min</div>
                  <div className="text-sm text-muted-foreground">Average Upload</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simplified Before/After showcase */}
        <BeforeAfterShowcase onGetStarted={onGetStarted} />
      </div>
    </div>
  );
}
