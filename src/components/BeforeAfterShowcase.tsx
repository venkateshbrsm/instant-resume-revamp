import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, X } from "lucide-react";

interface BeforeAfterShowcaseProps {
  onGetStarted: () => void;
}

export function BeforeAfterShowcase({ onGetStarted }: BeforeAfterShowcaseProps) {
  return (
    <section className="py-8 sm:py-12 md:py-16 px-3 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Value propositions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 px-2 sm:px-4 max-w-2xl mx-auto">
          {[
            "AI-Powered Enhancement",
            "Professional Templates",
            "ATS-Friendly Format",
            "Instant Preview"
          ].map((feature) => (
            <div key={feature} className="flex items-center justify-center gap-1 sm:gap-2 text-foreground text-xs sm:text-sm">
              <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4 text-accent flex-shrink-0" />
              <span className="font-medium text-center">{feature}</span>
            </div>
          ))}
        </div>

        {/* Section header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <Badge variant="secondary" className="mb-3 px-3 py-1 text-xs sm:text-sm font-medium">
            Real Transformation
          </Badge>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-2">
            See the <span className="bg-gradient-primary bg-clip-text text-transparent">Difference</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-2">
            Here's what happens when our AI transforms your resume. Same content, dramatically better presentation.
          </p>
        </div>

        {/* Before/After comparison */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:gap-8 mb-6 sm:mb-8">
          {/* Before */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <X className="w-3 h-3 text-destructive" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-muted-foreground">Before</h3>
            </div>
            
            <Card className="bg-card/50 border-2 border-dashed border-muted">
              <CardContent className="p-2 sm:p-3">
                <div className="space-y-1 text-xs">
                  <div className="border-b pb-1">
                    <h4 className="font-medium text-xs">John Smith</h4>
                    <p className="text-muted-foreground text-xs">john.smith@email.com</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-0.5 text-xs">EXPERIENCE</h5>
                    <p className="text-muted-foreground text-xs">Software Engineer at Tech Corp</p>
                    <p className="text-muted-foreground text-xs">- Worked on web applications</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-0.5 text-xs">SKILLS</h5>
                    <p className="text-muted-foreground text-xs">JavaScript, React, Node.js</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <X className="w-3 h-3 text-destructive" />
                <span>Generic formatting</span>
              </div>
              <div className="flex items-center gap-1">
                <X className="w-3 h-3 text-destructive" />
                <span>No metrics or impact</span>
              </div>
            </div>
          </div>


          {/* After */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-3 h-3 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-primary">After</h3>
            </div>
            
            <Card className="bg-gradient-subtle border border-primary/20 shadow-glow relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-primary opacity-10 rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-accent/10 rounded-tr-full"></div>
              
              <CardContent className="p-2 sm:p-3 relative z-10">
                <div className="space-y-1 text-xs">
                  <div className="border-b border-primary/20 pb-1 bg-primary/5 rounded-t px-2 py-1 -mx-2 -mt-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">JS</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-primary">John Smith</h4>
                        <p className="text-accent font-semibold text-xs">Senior Software Engineer</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 rounded p-1.5 border-l-2 border-primary">
                    <h5 className="font-bold text-primary mb-0.5 text-xs flex items-center gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      EXPERIENCE
                    </h5>
                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-1 rounded border border-primary/20">
                      <h6 className="font-semibold text-primary text-xs">Senior Software Engineer | Tech Corp</h6>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        <span className="bg-primary text-white text-xs px-1 py-0 rounded text-xs font-medium">+40% engagement</span>
                        <span className="bg-accent text-white text-xs px-1 py-0 rounded text-xs font-medium">-60% deploy time</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/30 rounded p-1">
                    <h5 className="font-bold text-primary mb-0.5 text-xs flex items-center gap-1">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      SKILLS
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {['React', 'Node.js', 'TypeScript'].map((skill, index) => (
                        <Badge key={skill} variant="secondary" className={`text-xs px-1 py-0 ${
                          index === 0 ? 'bg-primary/20 text-primary' : 
                          index === 1 ? 'bg-accent/20 text-accent' : 
                          'bg-secondary'
                        }`}>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-primary" />
                <span>Professional design</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-primary" />
                <span>Quantified achievements</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center px-4">
          <Button 
            variant="hero" 
            size="xl" 
            onClick={onGetStarted}
            className="shadow-glow hover:scale-105 active:scale-95 transition-transform duration-200 w-full sm:w-auto max-w-sm sm:max-w-none min-h-[56px] text-base sm:text-lg font-semibold"
          >
            <span>Transform Your Resume Now</span>
            <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
          </Button>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground">
            See your transformation in <strong className="text-accent">under 5 minutes</strong>
          </p>
        </div>
      </div>
    </section>
  );
}