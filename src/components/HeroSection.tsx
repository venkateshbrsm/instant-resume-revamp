
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
    <div className="relative min-h-screen bg-gradient-hero flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Optimized background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-3" />
      <div className="absolute top-10 left-3 w-16 h-16 sm:w-24 sm:h-24 md:w-48 md:h-48 bg-primary/3 rounded-full" style={{ filter: 'blur(30px)' }} />
      <div className="absolute bottom-10 right-3 w-20 h-20 sm:w-32 sm:h-32 md:w-64 md:h-64 bg-accent/3 rounded-full" style={{ filter: 'blur(40px)' }} />
      
      <div className="relative w-full max-w-6xl mx-auto text-center">
        {/* Main headline - optimized for mobile */}
        <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-[1.1] px-2">
          Get Your Professional Resume Makeover in{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent block xs:inline">
            Under 5 Minutes
          </span>
        </h1>

        {/* Enhanced subheadline with clearer value prop */}
        <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-muted-foreground mb-4 sm:mb-6 md:mb-8 max-w-4xl mx-auto leading-relaxed px-2">
          Upload your resume and get a <span className="font-semibold text-accent">free professional preview</span> instantly. 
          <span className="block mt-1 sm:mt-2 text-xs sm:text-sm md:text-base font-medium text-primary">No email • No signup • Pay only ₹299 if you love it</span>
        </p>

        {/* Single, focused CTA with conversion triggers */}
        <div className="mb-6 sm:mb-8 md:mb-12 px-4 sm:px-4">
          <Button 
            variant="hero" 
            size="xl" 
            onClick={onGetStarted}
            className="shadow-glow hover:scale-105 active:scale-95 transition-all duration-300 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-none lg:w-auto min-h-[56px] sm:min-h-[64px] text-base sm:text-lg font-bold relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 flex-shrink-0 animate-pulse" />
            <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-0">
              <span>Get My Free Preview</span>
              <span className="text-xs sm:text-sm font-normal opacity-90 sm:ml-2">2 min upload</span>
            </div>
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          {/* Trust indicators right below CTA */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-6 mt-3 sm:mt-4 text-xs sm:text-sm px-2">
            <div className="flex items-center gap-1 text-muted-foreground min-w-0">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
              <span className="truncate">100% Secure</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground min-w-0">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">Instant Preview</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground min-w-0">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-accent flex-shrink-0" />
              <span className="truncate">No Signup</span>
            </div>
          </div>
        </div>

        {/* How it Works Section - Mobile optimized */}
        <div className="mb-6 sm:mb-8 md:mb-12 max-w-4xl mx-auto px-2">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-center">
            How It Works - <span className="text-accent">Simple as 1, 2, 3</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 px-2">
            <div className="text-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">1</span>
              </div>
              <h3 
                className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-foreground cursor-pointer hover:text-primary transition-colors duration-200 underline-offset-4 hover:underline"
                onClick={onGetStarted}
              >
                Upload Resume
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground px-2">
                Drop your resume (PDF/DOCX). No signup needed.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">2</span>
              </div>
              <h3 
                className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-foreground cursor-pointer hover:text-primary transition-colors duration-200 underline-offset-4 hover:underline"
                onClick={onGetStarted}
              >
                Get Preview
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground px-2">
                See your enhanced resume in 2 minutes - free.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">3</span>
              </div>
              <h3 
                className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-foreground cursor-pointer hover:text-primary transition-colors duration-200 underline-offset-4 hover:underline"
                onClick={onGetStarted}
              >
                Download
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground px-2">
                Love it? Pay ₹299 and download instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Social proof - Mobile optimized */}
        <div className="mb-6 sm:mb-8 md:mb-12 px-2">
          <Badge variant="secondary" className="mb-3 sm:mb-4 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-yellow-500" fill="currentColor" />
            <span className="hidden xs:inline">Join 10,000+ professionals who upgraded their resumes</span>
            <span className="xs:hidden">10,000+ professionals upgraded</span>
          </Badge>
          
          <Card className="max-w-2xl w-full mx-auto bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-8 text-center">
                <div className="flex-1 min-w-0">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">10,000+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Resumes Enhanced</div>
                </div>
                <div className="hidden sm:block w-px h-8 sm:h-12 bg-border" />
                <div className="w-full sm:hidden h-px bg-border" />
                <div className="flex-1 min-w-0">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-accent">95%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Love Results</div>
                </div>
                <div className="hidden sm:block w-px h-8 sm:h-12 bg-border" />
                <div className="w-full sm:hidden h-px bg-border" />
                <div className="flex-1 min-w-0">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">2 Min</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Avg Upload</div>
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
