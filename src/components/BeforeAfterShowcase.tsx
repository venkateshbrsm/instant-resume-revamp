
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, CheckCircle, X, Sparkles, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface BeforeAfterShowcaseProps {
  onGetStarted: () => void;
}

export function BeforeAfterShowcase({ onGetStarted }: BeforeAfterShowcaseProps) {
  const performanceData = [
    { name: 'Response', value: 75 },
    { name: 'Interviews', value: 60 },
    { name: 'Engagement', value: 85 },
  ];

  return (
    <section className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-5xl mx-auto">
        {/* Simplified section header */}
        <div className="text-center mb-8 sm:mb-10">
          <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-2 text-accent" />
            Real Results
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 px-2">
            See the <span className="bg-gradient-primary bg-clip-text text-transparent">Transformation</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Same content, professional presentation. Here's what our AI does to your resume.
          </p>
        </div>

        {/* Mobile-first Before/After comparison */}
        <div className="relative mb-8 sm:mb-10 px-2">
          {/* Mobile stacked layout */}
          <div className="flex flex-col sm:hidden gap-4">
            {/* Before Section - Mobile */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3 justify-center">
                <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                  <X className="w-3 h-3 text-destructive" />
                </div>
                <h3 className="text-sm font-semibold text-muted-foreground">Before</h3>
              </div>
              
              <Card className="bg-card/50 border-2 border-dashed border-muted h-48">
                <CardContent className="p-3">
                  <div className="space-y-2 text-xs">
                    <div className="border-b pb-1">
                      <h4 className="font-medium text-xs">John Smith</h4>
                      <p className="text-muted-foreground text-xs">john.smith@email.com</p>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1 text-xs">EXPERIENCE</h5>
                      <p className="text-muted-foreground text-xs">Software Engineer at Tech Corp</p>
                      <p className="text-muted-foreground text-xs">- Worked on web applications</p>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1 text-xs">SKILLS</h5>
                      <p className="text-muted-foreground text-xs">JavaScript, React, Node.js</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Arrow separator for mobile */}
            <div className="flex justify-center py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
                <ArrowRight className="w-4 h-4 text-white rotate-90" />
              </div>
            </div>

            {/* After Section - Mobile */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3 justify-center">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-primary">After</h3>
              </div>
              
              <Card className="bg-white border border-primary/30 shadow-xl relative overflow-hidden h-48">
                <div className="h-1 bg-gradient-primary"></div>
                <ScrollArea className="h-full">
                  <CardContent className="p-3">
                    <div className="space-y-2 text-xs">
                      {/* Professional header */}
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">
                          JS
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-xs">John Smith</h4>
                          <p className="text-primary font-medium text-xs">Senior Software Engineer</p>
                        </div>
                      </div>
                      
                      {/* Enhanced experience */}
                      <div>
                        <h5 className="font-bold text-gray-900 mb-1 text-xs uppercase">Experience</h5>
                        <p className="text-gray-700 text-xs">• Delivered 15+ React apps, +40% engagement</p>
                        <p className="text-gray-700 text-xs">• Led team of 5, -60% deployment time</p>
                      </div>
                      
                      {/* Skills */}
                      <div>
                        <h5 className="font-bold text-gray-900 mb-1 text-xs uppercase">Skills</h5>
                        <div className="flex flex-wrap gap-1">
                          {['React', 'Node.js', 'TypeScript'].map((skill) => (
                            <span key={skill} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </ScrollArea>
              </Card>
            </div>
          </div>

          {/* Desktop side-by-side layout */}
          <div className="hidden sm:flex gap-6 lg:gap-8 relative">
            {/* Before Section - Desktop */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                  <X className="w-4 h-4 text-destructive" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-muted-foreground">Before AI Enhancement</h3>
              </div>
              
              <Card className="bg-card/50 border-2 border-dashed border-muted h-80 lg:h-96">
                <CardContent className="p-4">
                  <div className="space-y-3 text-sm">
                    <div className="border-b pb-2">
                      <h4 className="font-medium">John Smith</h4>
                      <p className="text-muted-foreground text-xs">john.smith@email.com | 555-0123</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-1 text-xs">EXPERIENCE</h5>
                      <p className="text-muted-foreground text-xs">Software Engineer at Tech Corp (2020-2023)</p>
                      <p className="text-muted-foreground text-xs">- Worked on web applications</p>
                      <p className="text-muted-foreground text-xs">- Used JavaScript and React</p>
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
                  <span>Basic formatting, no visual hierarchy</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-destructive" />
                  <span>Vague descriptions, no quantified results</span>
                </div>
              </div>
            </div>

            {/* Arrow separator - Desktop */}
            <div className="flex items-center justify-center self-start mt-16">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* After Section - Desktop */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-primary">After AI Enhancement</h3>
              </div>
              
              <Card className="bg-white border border-primary/30 shadow-xl relative overflow-hidden h-80 lg:h-96">
                <div className="h-1 bg-gradient-primary"></div>
                
                <ScrollArea className="h-full">
                  <CardContent className="p-4">
                    <div className="space-y-3 text-sm">
                      {/* Professional header */}
                      <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                          JS
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">John Smith</h4>
                          <p className="text-primary font-medium text-xs">Senior Software Engineer</p>
                          <p className="text-gray-600 text-xs">john.smith@email.com | 555-0123</p>
                        </div>
                      </div>
                      
                      {/* Enhanced experience */}
                      <div>
                        <h5 className="font-bold text-gray-900 mb-2 text-xs uppercase tracking-wide">Experience</h5>
                        <p className="text-gray-700 text-xs font-medium">Senior Software Engineer • Tech Corp (2020-2023)</p>
                        <p className="text-gray-700 text-xs">• Delivered 15+ React applications, increasing user engagement by 40%</p>
                        <p className="text-gray-700 text-xs">• Led cross-functional team of 5, reducing deployment time by 60%</p>
                      </div>
                      
                      {/* Skills with visual enhancement */}
                      <div>
                        <h5 className="font-bold text-gray-900 mb-2 text-xs uppercase tracking-wide">Core Skills</h5>
                        <div className="flex flex-wrap gap-1">
                          {['React', 'Node.js', 'TypeScript'].map((skill) => (
                            <span key={skill} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Performance metrics */}
                      <div>
                        <h5 className="font-bold text-gray-900 mb-1 text-xs uppercase tracking-wide">Impact</h5>
                        <div className="h-16 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                              <XAxis 
                                dataKey="name" 
                                tick={{ fontSize: 8, fill: '#666' }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis hide />
                              <Bar 
                                dataKey="value" 
                                fill="hsl(var(--primary))" 
                                radius={[2, 2, 0, 0]}
                                opacity={0.9}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </ScrollArea>
              </Card>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Professional design with clear hierarchy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Quantified achievements and impact metrics</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA with urgency */}
        <div className="text-center px-4">
          <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl p-6 sm:p-8 mb-6">
            <h3 className="text-xl sm:text-2xl font-bold mb-3">
              Ready for Your <span className="bg-gradient-primary bg-clip-text text-transparent">Professional Makeover</span>?
            </h3>
            <p className="text-muted-foreground mb-6">
              Upload your resume now and see your transformation in under 2 minutes
            </p>
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
          </div>
        </div>
      </div>
    </section>
  );
}
