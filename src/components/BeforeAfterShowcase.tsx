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
        <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0 mb-6 sm:mb-8">
          {/* Before */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <X className="w-3 h-3 text-destructive" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-muted-foreground">Before</h3>
            </div>
            
            <Card className="bg-card/50 border-2 border-dashed border-muted">
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="border-b pb-2">
                    <h4 className="font-medium text-sm sm:text-base">John Smith</h4>
                    <p className="text-muted-foreground text-xs">john.smith@email.com | (555) 123-4567</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-1 text-xs">EXPERIENCE</h5>
                    <div className="text-muted-foreground space-y-1 text-xs">
                      <p>Software Engineer at Tech Corp (2020-2023)</p>
                      <p>- Worked on web applications</p>
                      <p>- Used React and Node.js</p>
                      <p>- Fixed bugs and added features</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-1 text-xs">EDUCATION</h5>
                    <p className="text-muted-foreground text-xs">Computer Science Degree, State University</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-1 text-xs">SKILLS</h5>
                    <p className="text-muted-foreground text-xs">JavaScript, React, Node.js, HTML, CSS</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-destructive" />
                <span>Generic formatting</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-destructive" />
                <span>Weak action words</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-destructive" />
                <span>No metrics or impact</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-primary" />
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
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="border-b border-primary/10 pb-2">
                    <h4 className="font-bold text-sm sm:text-base text-primary">John Smith</h4>
                    <p className="text-accent font-medium text-xs sm:text-sm">Senior Software Engineer</p>
                    <p className="text-muted-foreground text-xs">john.smith@email.com | (555) 123-4567</p>
                  </div>
                  
                  <div>
                    <h5 className="font-bold text-primary mb-1 flex items-center gap-1 text-xs">
                      <div className="w-1 h-3 bg-primary rounded"></div>
                      EXPERIENCE
                    </h5>
                    <div className="space-y-1">
                      <div className="bg-primary/5 p-2 rounded">
                        <h6 className="font-semibold text-primary text-xs">Senior Software Engineer | Tech Corp</h6>
                        <p className="text-xs text-accent font-medium mb-1">2020 - 2023</p>
                        <ul className="text-xs space-y-1 text-foreground">
                          <li>• Delivered 15+ React apps, +40% engagement</li>
                          <li>• Led 5-engineer team, -60% deployment time</li>
                          <li>• Optimized Node.js, +25% faster response</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <h5 className="font-bold text-primary mb-1 text-xs">EDUCATION</h5>
                      <p className="text-xs"><strong>B.S. Computer Science</strong></p>
                      <p className="text-xs text-muted-foreground">State University</p>
                    </div>
                    <div>
                      <h5 className="font-bold text-primary mb-1 text-xs">SKILLS</h5>
                      <div className="flex flex-wrap gap-1">
                        {['React', 'Node.js', 'TypeScript'].map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs px-1 py-0">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Professional design</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Powerful action verbs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
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