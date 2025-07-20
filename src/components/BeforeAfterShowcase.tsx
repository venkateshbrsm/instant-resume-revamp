import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, X } from "lucide-react";

interface BeforeAfterShowcaseProps {
  onGetStarted: () => void;
}

export function BeforeAfterShowcase({ onGetStarted }: BeforeAfterShowcaseProps) {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
            Real Transformation
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            See the <span className="bg-gradient-primary bg-clip-text text-transparent">Difference</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Here's what happens when our AI transforms your resume. Same content, dramatically better presentation.
          </p>
        </div>

        {/* Before/After comparison */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-12">
          {/* Before */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="w-4 h-4 text-destructive" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-muted-foreground">Before</h3>
            </div>
            
            <Card className="bg-card/50 border-2 border-dashed border-muted">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 text-sm">
                  <div className="border-b pb-2">
                    <h4 className="font-medium text-base">John Smith</h4>
                    <p className="text-muted-foreground">john.smith@email.com | (555) 123-4567</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-1">EXPERIENCE</h5>
                    <div className="text-muted-foreground space-y-1 text-xs">
                      <p>Software Engineer at Tech Corp (2020-2023)</p>
                      <p>- Worked on web applications</p>
                      <p>- Used React and Node.js</p>
                      <p>- Fixed bugs and added features</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-1">EDUCATION</h5>
                    <p className="text-muted-foreground text-xs">Computer Science Degree, State University</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-1">SKILLS</h5>
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
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-primary">After</h3>
            </div>
            
            <Card className="bg-gradient-subtle border border-primary/20 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4 text-sm">
                  <div className="border-b border-primary/10 pb-3">
                    <h4 className="font-bold text-lg text-primary">John Smith</h4>
                    <p className="text-accent font-medium">Senior Software Engineer</p>
                    <p className="text-muted-foreground">john.smith@email.com | (555) 123-4567 | LinkedIn | Portfolio</p>
                  </div>
                  
                  <div>
                    <h5 className="font-bold text-primary mb-2 flex items-center gap-2">
                      <div className="w-1 h-4 bg-primary rounded"></div>
                      PROFESSIONAL EXPERIENCE
                    </h5>
                    <div className="space-y-2">
                      <div className="bg-primary/5 p-3 rounded-lg">
                        <h6 className="font-semibold text-primary">Senior Software Engineer | Tech Corp</h6>
                        <p className="text-xs text-accent font-medium mb-1">2020 - 2023</p>
                        <ul className="text-xs space-y-1 text-foreground">
                          <li>• Architected and delivered 15+ React applications, improving user engagement by 40%</li>
                          <li>• Led cross-functional team of 5 engineers, reducing deployment time by 60%</li>
                          <li>• Optimized Node.js backend services, achieving 25% faster response times</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-bold text-primary mb-1 text-xs">EDUCATION</h5>
                      <p className="text-xs"><strong>B.S. Computer Science</strong></p>
                      <p className="text-xs text-muted-foreground">State University | 2020</p>
                    </div>
                    <div>
                      <h5 className="font-bold text-primary mb-1 text-xs">CORE SKILLS</h5>
                      <div className="flex flex-wrap gap-1">
                        {['React', 'Node.js', 'TypeScript', 'AWS'].map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs px-2 py-0">
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
        <div className="text-center">
          <Button 
            variant="hero" 
            size="xl" 
            onClick={onGetStarted}
            className="shadow-glow hover:scale-105 transition-transform duration-200"
          >
            Transform Your Resume Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">
            See your transformation in <strong className="text-accent">under 5 minutes</strong>
          </p>
        </div>
      </div>
    </section>
  );
}