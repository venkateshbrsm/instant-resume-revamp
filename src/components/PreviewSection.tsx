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
      const fileName = file.name.replace(/\.(pdf|docx?|txt)$/i, '');
      
      setOriginalContent(`Document Information:\n\nFilename: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\nType: ${file.type || 'Unknown'}\nUploaded: ${new Date().toLocaleString()}\n\nYour resume has been successfully uploaded and is ready for AI enhancement.`);
    } catch (error) {
      console.error('Error processing file:', error);
      setOriginalContent(`Document uploaded: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB`);
    } finally {
      setIsLoading(false);
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
                    Enhanced Resume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-lg p-8 min-h-[400px] flex items-center justify-center border border-accent/20">
                    <div className="text-center space-y-6 max-w-md">
                      <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                        <Sparkles className="w-10 h-10 text-accent" />
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold mb-3">Your Enhanced Resume Will Be Ready</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          After payment, our AI will analyze your uploaded resume and create a professionally enhanced version with improved formatting, ATS optimization, and content refinement.
                        </p>
                      </div>

                      <div className="bg-card rounded-lg p-4 text-left">
                        <h4 className="font-semibold mb-3">Enhancement Process:</h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-accent rounded-full" />
                            <span>Content analysis and optimization</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-accent rounded-full" />
                            <span>Professional formatting and design</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-accent rounded-full" />
                            <span>ATS-friendly structure</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-accent rounded-full" />
                            <span>Language and impact enhancement</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Your enhanced resume will be available for download immediately after payment completion.
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