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
            
            <Card className="bg-gradient-subtle border border-primary/20 shadow-lg">
              <CardContent className="p-2 sm:p-3">
                <div className="space-y-1 text-xs">
                  <div className="border-b border-primary/10 pb-1">
                    <h4 className="font-bold text-xs text-primary">John Smith</h4>
                    <p className="text-accent font-medium text-xs">Senior Software Engineer</p>
                  </div>
                  
                  <div>
                    <h5 className="font-bold text-primary mb-0.5 text-xs">EXPERIENCE</h5>
                    <div className="bg-primary/5 p-1 rounded">
                      <h6 className="font-semibold text-primary text-xs">Senior Software Engineer | Tech Corp</h6>
                      <p className="text-xs text-foreground">• Delivered 15+ React apps, +40% engagement</p>
                      <p className="text-xs text-foreground">• Led team of 5, -60% deployment time</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-bold text-primary mb-0.5 text-xs">SKILLS</h5>
                    <div className="flex flex-wrap gap-1">
                      {['React', 'Node.js', 'TypeScript'].map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs px-1 py-0">
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