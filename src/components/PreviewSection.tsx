import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Download, CreditCard, ArrowLeft, Eye, FileText, Zap, AlertCircle } from "lucide-react";

interface PreviewSectionProps {
  file: File;
  onPurchase: () => void;
  onBack: () => void;
}

export function PreviewSection({ file, onPurchase, onBack }: PreviewSectionProps) {
  const [activeTab, setActiveTab] = useState("before");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    extractFileContent();
  }, [file]);

  const extractFileContent = async () => {
    setIsLoading(true);
    try {
      // Extract name from filename for personalization
      const fileName = file.name.replace(/\.(pdf|docx?|txt)$/i, '');
      const nameMatch = fileName.match(/RESUME[-_\s]*(.+)/i);
      const extractedName = nameMatch ? nameMatch[1].replace(/[-_]/g, ' ').trim() : fileName;
      
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setOriginalContent(`📄 PDF Resume Document\n\nFilename: ${file.name}\nDocument Type: PDF Resume\nSize: ${(file.size / 1024).toFixed(1)} KB\n\nYour PDF resume has been successfully uploaded and is ready for enhancement. The AI will analyze your content and improve:\n\n✓ Professional formatting and layout\n✓ ATS-optimized structure\n✓ Enhanced language and action verbs\n✓ Better visual hierarchy\n✓ Quantified achievements\n\nYour original content and all personal information will be preserved.`);
      } else if (file.type.includes('word') || file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) {
        setOriginalContent(`📝 Word Resume Document\n\nCandidate: ${extractedName}\nFilename: ${file.name}\nDocument Type: Microsoft Word Resume\nSize: ${(file.size / 1024).toFixed(1)} KB\nUploaded: ${new Date().toLocaleDateString()}\n\nYour Word document has been successfully processed. This resume will be enhanced with:\n\n✓ Professional formatting and modern design\n✓ ATS-compliant structure for better parsing\n✓ Improved language with strong action verbs\n✓ Better visual hierarchy and readability\n✓ Quantified achievements highlighting\n✓ Industry-standard formatting\n\nAll your original information, experience, and achievements will be preserved while improving presentation and impact.`);
      } else {
        setOriginalContent(`📋 Resume Document\n\nFilename: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\n\nDocument uploaded successfully and ready for enhancement.`);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setOriginalContent("Document uploaded. Processing preview...");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate personalized enhanced content based on the filename
  const generateEnhancedContent = () => {
    const fileName = file.name.replace(/\.(pdf|docx?|txt)$/i, '');
    const nameMatch = fileName.match(/RESUME[-_\s]*(.+)/i);
    const extractedName = nameMatch ? nameMatch[1].replace(/[-_]/g, ' ').trim() : "Your Name";
    
    return {
      name: extractedName,
      title: "Professional Title", // This would be extracted from actual resume
      email: "your.email@example.com",
      phone: "+91 XXXXX XXXXX",
      location: "Your City, India",
      summary: `Results-driven professional with proven track record of success. This enhanced version of ${extractedName}'s resume features improved formatting, ATS optimization, and strategic content enhancement while preserving all original achievements and experience.`,
      experience: [
        {
          title: "Current/Recent Position",
          company: "Company Name",
          duration: "Duration",
          achievements: [
            "Enhanced achievement statement with quantified results",
            "Improved bullet point with action verbs and impact metrics", 
            "Optimized description for ATS compatibility and readability"
          ]
        },
        {
          title: "Previous Position", 
          company: "Previous Company",
          duration: "Duration",
          achievements: [
            "Professional accomplishment with improved language",
            "Enhanced achievement highlighting key contributions",
            "Refined description emphasizing value and impact"
          ]
        }
      ],
      skills: ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7", "Skill 8"]
    };
  };

  const enhancedContent = generateEnhancedContent();

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Enhancement Complete
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Enhanced Resume Preview
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compare your original resume with our AI-enhanced version. Pay only if you're satisfied with the results.
          </p>
        </div>

        {/* Comparison Tabs */}
        <div className="max-w-4xl mx-auto mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
              <TabsTrigger value="before" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Original
              </TabsTrigger>
              <TabsTrigger value="after" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Enhanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="before">
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    Original Resume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="bg-muted/50 rounded-lg p-6 text-center min-h-[400px] flex items-center justify-center">
                      <div className="space-y-4">
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-muted-foreground">Processing document...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-6 min-h-[400px]">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                          <FileText className="w-6 h-6 text-primary" />
                          <div>
                            <p className="font-semibold">Original Resume</p>
                            <p className="text-sm text-muted-foreground">File: {file.name}</p>
                          </div>
                        </div>
                        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                          {originalContent}
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-800">
                              Your document has been successfully uploaded and analyzed. The enhanced version will improve formatting, structure, and content presentation while preserving all your original information.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="after">
              <Card className="bg-card/80 backdrop-blur-sm border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    AI-Enhanced Resume Preview
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Sample enhancement for: {file.name} • Your actual enhanced resume will reflect your specific content
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-background rounded-lg p-6 min-h-[400px] shadow-inner">
                    {/* Enhanced Resume Preview */}
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="text-center pb-4 border-b border-border">
                        <h1 className="text-2xl font-bold text-primary">{enhancedContent.name}</h1>
                        <p className="text-lg text-accent font-semibold">{enhancedContent.title}</p>
                        <div className="flex justify-center gap-4 text-sm text-muted-foreground mt-2">
                          <span>{enhancedContent.email}</span>
                          <span>•</span>
                          <span>{enhancedContent.phone}</span>
                          <span>•</span>
                          <span>{enhancedContent.location}</span>
                        </div>
                      </div>

                      {/* Professional Summary */}
                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-2">Professional Summary</h3>
                        <p className="text-sm text-foreground leading-relaxed">{enhancedContent.summary}</p>
                      </div>

                      {/* Experience */}
                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-3">Professional Experience</h3>
                        <div className="space-y-4">
                          {enhancedContent.experience.map((exp, index) => (
                            <div key={index} className="border-l-2 border-accent pl-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold text-foreground">{exp.title}</h4>
                                  <p className="text-accent font-medium">{exp.company}</p>
                                </div>
                                <span className="text-sm text-muted-foreground">{exp.duration}</span>
                              </div>
                              <ul className="text-sm text-foreground space-y-1">
                                {exp.achievements.map((achievement, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-accent mt-1.5">•</span>
                                    <span>{achievement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills */}
                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-3">Technical Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {enhancedContent.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Enhancement Features */}
        <Card className="max-w-4xl mx-auto mb-8 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-center">What We Enhanced</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-accent/5 border border-accent/20">
                <Sparkles className="w-8 h-8 text-accent mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Content Optimization</h4>
                <p className="text-sm text-muted-foreground">Enhanced descriptions with action verbs and quantified achievements</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Visual Appeal</h4>
                <p className="text-sm text-muted-foreground">Professional formatting with better typography and layout</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/5 border border-accent/20">
                <Zap className="w-8 h-8 text-accent mx-auto mb-2" />
                <h4 className="font-semibold mb-1">ATS Optimization</h4>
                <p className="text-sm text-muted-foreground">Structured for better parsing by applicant tracking systems</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Section */}
        <Card className="max-w-md mx-auto bg-gradient-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="mb-6">
              <div className="text-3xl font-bold text-primary mb-2">₹299</div>
              <p className="text-muted-foreground">One-time payment • Instant download</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <Button 
                variant="success" 
                size="xl" 
                onClick={onPurchase}
                className="w-full"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Purchase & Download
              </Button>
              
              <p className="text-xs text-muted-foreground">
                Secure payment • Download immediately after payment
              </p>
            </div>

            <div className="text-left space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full" />
                <span>Professional PDF format</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full" />
                <span>Editable Word document</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full" />
                <span>ATS-friendly formatting</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full" />
                <span>Lifetime access</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center mt-8">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Upload Different Resume
          </Button>
        </div>
      </div>
    </div>
  );
}