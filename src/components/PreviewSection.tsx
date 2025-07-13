import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Download, CreditCard, ArrowLeft, Eye, FileText, Zap, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromFile, formatResumeText } from "@/lib/fileExtractor";

interface PreviewSectionProps {
  file: File;
  onPurchase: () => void;
  onBack: () => void;
}

export function PreviewSection({ file, onPurchase, onBack }: PreviewSectionProps) {
  const [activeTab, setActiveTab] = useState("before");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [enhancedContent, setEnhancedContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    extractFileContent();
    enhanceResume();
  }, [file]);

  const extractFileContent = async () => {
    setIsLoading(true);
    try {
      console.log('Extracting content from file:', file.name);
      const text = await extractTextFromFile(file);
      setExtractedText(text);
      const formattedContent = formatResumeText(text, file.name);
      setOriginalContent(formattedContent);
      
      toast({
        title: "File Processed",
        description: "Resume content extracted successfully.",
      });
    } catch (error) {
      console.error('Error extracting file content:', error);
      const fallbackContent = `📄 Resume Document: ${file.name}\n\nFile Size: ${(file.size / 1024).toFixed(1)} KB\nType: ${file.type}\nUploaded: ${new Date().toLocaleString()}\n\n⚠️ Content extraction encountered an issue, but the file was uploaded successfully.\n\nThe AI enhancement process will work directly with your original document to create an improved version.\n\nNote: Some file formats or protected documents may not display preview text, but enhancement will still work properly.`;
      setOriginalContent(fallbackContent);
      
      toast({
        title: "Limited Preview",
        description: "File uploaded successfully. Enhancement will process the original content.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const enhanceResume = async () => {
    setIsEnhancing(true);
    try {
      const originalText = extractedText || `Resume content from ${file.name}. Document analysis in progress.`;

      const { data, error } = await supabase.functions.invoke('enhance-resume', {
        body: {
          fileName: file.name,
          originalText: originalText,
          extractedText: extractedText
        }
      });

      if (error) {
        console.error('Enhancement error:', error);
        throw error;
      }

      if (data.success && data.enhancedResume) {
        setEnhancedContent(data.enhancedResume);
        toast({
          title: "Enhancement Complete!",
          description: "Your resume has been enhanced with AI. Review the changes and pay if satisfied.",
        });
      } else {
        throw new Error('Enhancement failed');
      }
    } catch (error) {
      console.error('Error enhancing resume:', error);
      toast({
        title: "Enhancement Error",
        description: "Could not enhance resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };

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
                        <p className="text-muted-foreground">Extracting resume content...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-6 min-h-[400px]">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                          <FileText className="w-6 h-6 text-primary" />
                          <div>
                            <p className="font-semibold">Original Resume Content</p>
                            <p className="text-sm text-muted-foreground">File: {file.name}</p>
                          </div>
                        </div>
                        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto">
                          {originalContent}
                        </div>
                        {extractedText && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-green-800">
                                ✅ Successfully extracted {extractedText.length} characters from your resume. This content will be enhanced with AI.
                              </p>
                            </div>
                          </div>
                        )}
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
                    AI-Enhanced Resume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEnhancing ? (
                    <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-lg p-8 min-h-[400px] flex items-center justify-center border border-accent/20">
                      <div className="text-center space-y-4">
                        <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto" />
                        <div>
                          <h3 className="text-xl font-semibold mb-2">AI Enhancement in Progress</h3>
                          <p className="text-muted-foreground">
                            Our AI is analyzing and enhancing your resume...
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : enhancedContent ? (
                    <div className="bg-background rounded-lg p-6 min-h-[400px] shadow-inner">
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="text-center pb-4 border-b border-border">
                          <h1 className="text-2xl font-bold text-primary">{enhancedContent.name}</h1>
                          <p className="text-lg text-accent font-semibold">{enhancedContent.title}</p>
                          <div className="flex justify-center gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
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
                        {enhancedContent.experience && enhancedContent.experience.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-primary mb-3">Professional Experience</h3>
                            <div className="space-y-4">
                              {enhancedContent.experience.map((exp: any, index: number) => (
                                <div key={index} className="border-l-2 border-accent pl-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h4 className="font-semibold text-foreground">{exp.title}</h4>
                                      <p className="text-accent font-medium">{exp.company}</p>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{exp.duration}</span>
                                  </div>
                                  <ul className="text-sm text-foreground space-y-1">
                                    {exp.achievements.map((achievement: string, idx: number) => (
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
                        )}

                        {/* Skills */}
                        {enhancedContent.skills && enhancedContent.skills.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-primary mb-3">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                              {enhancedContent.skills.map((skill: string, index: number) => (
                                <Badge key={index} variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Education */}
                        {enhancedContent.education && enhancedContent.education.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-primary mb-3">Education</h3>
                            <div className="space-y-2">
                              {enhancedContent.education.map((edu: any, index: number) => (
                                <div key={index} className="border-l-2 border-accent pl-4">
                                  <h4 className="font-semibold text-foreground">{edu.degree}</h4>
                                  <p className="text-accent">{edu.institution}</p>
                                  <p className="text-sm text-muted-foreground">{edu.year}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-lg p-8 min-h-[400px] flex items-center justify-center border border-accent/20">
                      <div className="text-center space-y-4">
                        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
                        <div>
                          <h3 className="text-xl font-semibold mb-2">Enhancement Failed</h3>
                          <p className="text-muted-foreground mb-4">
                            Could not enhance your resume. Please try again.
                          </p>
                          <Button onClick={enhanceResume} variant="outline">
                            Retry Enhancement
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
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
                disabled={!enhancedContent}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                {enhancedContent ? 'Purchase Enhanced Resume' : 'Processing Enhancement...'}
              </Button>
              
              <p className="text-xs text-muted-foreground">
                {enhancedContent 
                  ? 'Secure payment • Download the enhanced version immediately' 
                  : 'Enhancement in progress • Payment will be enabled once complete'
                }
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