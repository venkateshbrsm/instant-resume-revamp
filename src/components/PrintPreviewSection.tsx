import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Download, CreditCard, ArrowLeft, Eye, FileText, Zap, AlertCircle, Loader2, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractContentFromFile, ExtractedContent } from "@/lib/fileExtractor";
import { TemplateSelector } from "./TemplateSelector";
import { ModernTemplatePreview } from "./templates/ModernTemplatePreview";
import { ClassicTemplatePreview } from "./templates/ClassicTemplatePreview";
import { CreativeTemplatePreview } from "./templates/CreativeTemplatePreview";
import { ExecutiveTemplatePreview } from "./templates/ExecutiveTemplatePreview";
import { MinimalistTemplatePreview } from "./templates/MinimalistTemplatePreview";
import { generatePdfFromElement } from "@/lib/canvasPdfGenerator";
import { resumeTemplates, getDefaultTemplate, type ResumeTemplate } from "@/lib/resumeTemplates";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface PrintPreviewSectionProps {
  file: File;
  onPurchase: () => void;
  onBack: () => void;
}

export function PrintPreviewSection({ file, onPurchase, onBack }: PrintPreviewSectionProps) {
  const [originalContent, setOriginalContent] = useState<string | ExtractedContent>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [enhancedContent, setEnhancedContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState("Initializing...");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementProgress, setEnhancementProgress] = useState(0);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>(getDefaultTemplate());
  const [selectedColorTheme, setSelectedColorTheme] = useState(getDefaultTemplate().colorThemes[0]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const resumeContentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we're returning from login and restore state
    const storedExtractedText = sessionStorage.getItem('extractedText');
    const storedEnhancedContent = sessionStorage.getItem('enhancedContent');
    const storedOriginalContent = sessionStorage.getItem('originalContent');
    
    if (storedExtractedText) {
      setExtractedText(storedExtractedText);
      sessionStorage.removeItem('extractedText');
    }
    
    if (storedEnhancedContent) {
      try {
        setEnhancedContent(JSON.parse(storedEnhancedContent));
        sessionStorage.removeItem('enhancedContent');
      } catch (error) {
        console.error('Error parsing stored enhanced content:', error);
      }
    }
    
    if (storedOriginalContent) {
      setOriginalContent(storedOriginalContent);
      sessionStorage.removeItem('originalContent');
    }
    
    // Only extract file content if we don't have stored content
    if (!storedExtractedText || !storedOriginalContent) {
      extractFileContent();
    } else {
      setIsLoading(false);
    }
    
    checkAuth();
  }, [file]);

  useEffect(() => {
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        
        // If user just logged in and they were trying to purchase, continue to purchase
        if (event === 'SIGNED_IN' && session?.user) {
          const wasAttemptingPurchase = sessionStorage.getItem('attemptingPurchase');
          if (wasAttemptingPurchase === 'true') {
            sessionStorage.removeItem('attemptingPurchase');
            onPurchase();
            toast({
              title: "Logged in successfully!",
              description: "Continuing with your purchase...",
            });
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [onPurchase, toast]);

  // Auto-enhance after extracting text
  useEffect(() => {
    if (extractedText && extractedText.length > 0 && !enhancedContent && !isEnhancing) {
      enhanceResume();
    }
  }, [extractedText]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  const extractFileContent = async () => {
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingStage("Preparing file...");
    
    try {
      setLoadingProgress(10);
      setLoadingStage("Reading file content...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingProgress(30);
      setLoadingStage("Analyzing document structure...");
      
      setLoadingProgress(50);
      setLoadingStage("Scanning for photos and images...");
      
      const extractedContent = await extractContentFromFile(file);
      
      setLoadingProgress(70);
      
      if (extractedContent.profilePhotoUrl) {
        setLoadingStage("Profile photo detected! Processing...");
        toast({
          title: "Photo Found!",
          description: "A profile photo was detected and extracted from your resume.",
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        setLoadingStage("No photos found in document");
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setLoadingProgress(85);
      setLoadingStage("Processing content...");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setExtractedText(extractedContent.text);
      setOriginalContent(extractedContent);
      
      setLoadingProgress(100);
      setLoadingStage("Complete!");
      
      toast({
        title: "File Processed",
        description: "Resume content extracted successfully.",
      });
      
    } catch (error) {
      console.error('Error extracting content:', error);
      toast({
        title: "Extraction Error",
        description: "There was an issue processing your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
        setLoadingStage("");
      }, 1000);
    }
  };

  const enhanceResume = async () => {
    if (!extractedText || isEnhancing) return;
    
    setIsEnhancing(true);
    setEnhancementProgress(0);
    
    try {
      const { data, error } = await supabase.functions.invoke('enhance-resume', {
        body: { 
          text: extractedText,
          fileName: file.name,
          extractedText: extractedText,
          originalText: extractedText
        }
      });

      if (error) throw error;
      
      setEnhancementProgress(100);
      setEnhancedContent(data);
      
      toast({
        title: "Resume Enhanced!",
        description: "Your resume has been intelligently enhanced with AI.",
      });
    } catch (error) {
      console.error('Error enhancing resume:', error);
      toast({
        title: "Enhancement Failed",
        description: "Failed to enhance resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handlePurchaseClick = async () => {
    setIsCheckingAuth(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        if (enhancedContent && resumeContentRef.current) {
          try {
            toast({
              title: "Preparing Payment",
              description: "Generating high-quality PDF preview...",
            });
            
            const pdfBlob = await generatePdfFromElement(resumeContentRef.current, {
              quality: 0.95,
              scale: 2
            });
            
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result as string;
              sessionStorage.setItem('canvasPdfBlob', base64data);
              sessionStorage.setItem('enhancedContentForPayment', JSON.stringify(enhancedContent));
              sessionStorage.setItem('extractedTextForPayment', extractedText);
              sessionStorage.setItem('selectedTemplateForPayment', JSON.stringify(selectedTemplate));
              sessionStorage.setItem('selectedColorThemeForPayment', JSON.stringify(selectedColorTheme));
              onPurchase();
            };
            reader.readAsDataURL(pdfBlob);
            return;
          } catch (error) {
            console.error('Error generating canvas PDF for purchase:', error);
            toast({
              title: "Proceeding with Purchase",
              description: "Will use server-side PDF generation as fallback.",
            });
          }
        }
        
        if (enhancedContent) {
          sessionStorage.setItem('enhancedContentForPayment', JSON.stringify(enhancedContent));
          sessionStorage.setItem('extractedTextForPayment', extractedText);
          sessionStorage.setItem('selectedTemplateForPayment', JSON.stringify(selectedTemplate));
          sessionStorage.setItem('selectedColorThemeForPayment', JSON.stringify(selectedColorTheme));
        }
        onPurchase();
      } else {
        sessionStorage.setItem('attemptingPurchase', 'true');
        sessionStorage.setItem('returnToPreview', 'true');
        sessionStorage.setItem('pendingFile', JSON.stringify({
          name: file.name,
          size: file.size,
          type: file.type
        }));
        if (extractedText) {
          sessionStorage.setItem('extractedText', extractedText);
        }
        if (enhancedContent) {
          sessionStorage.setItem('enhancedContent', JSON.stringify(enhancedContent));
          sessionStorage.setItem('enhancedContentForPayment', JSON.stringify(enhancedContent));
          sessionStorage.setItem('extractedTextForPayment', extractedText);
          sessionStorage.setItem('selectedTemplateForPayment', JSON.stringify(selectedTemplate));
          sessionStorage.setItem('selectedColorThemeForPayment', JSON.stringify(selectedColorTheme));
        }
        if (originalContent) {
          const contentToStore = typeof originalContent === 'string' ? originalContent : JSON.stringify(originalContent);
          sessionStorage.setItem('originalContent', contentToStore);
        }
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue with your purchase.",
        });
        navigate('/auth');
      }
    } catch (error) {
      toast({
        title: "Authentication Check Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
    
    setIsCheckingAuth(false);
  };

  const renderTemplate = () => {
    if (!enhancedContent) return null;

    const templateProps = {
      enhancedContent: enhancedContent,
      selectedColorTheme: selectedColorTheme
    };

    switch (selectedTemplate.id) {
      case 'modern':
        return <ModernTemplatePreview {...templateProps} />;
      case 'classic':
        return <ClassicTemplatePreview {...templateProps} />;
      case 'creative':
        return <CreativeTemplatePreview {...templateProps} />;
      case 'executive':
        return <ExecutiveTemplatePreview {...templateProps} />;
      case 'minimalist':
        return <MinimalistTemplatePreview {...templateProps} />;
      default:
        return <ModernTemplatePreview {...templateProps} />;
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-br from-background via-background to-muted/30">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-dashed border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="flex items-center gap-3 mb-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div>
                  <h3 className="text-xl font-semibold">Processing Your Resume</h3>
                  <p className="text-muted-foreground mt-1">{loadingStage}</p>
                </div>
              </div>
              <Progress value={loadingProgress} className="w-full max-w-md mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                This may take a few moments while we analyze your document and extract any images...
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header with controls */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-primary" />
                <span className="font-semibold">Print Preview</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEnhancing && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Enhancing...</span>
                </div>
              )}
              
              <Button
                onClick={handlePurchaseClick}
                disabled={!enhancedContent || isCheckingAuth}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                {isCheckingAuth ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Purchase Enhanced Resume
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Template Selector Sidebar */}
          <div className="w-80 shrink-0">
            <div className="sticky top-28">
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onTemplateChange={setSelectedTemplate}
                selectedColorTheme={selectedColorTheme}
                onColorThemeChange={setSelectedColorTheme}
              />
            </div>
          </div>

          {/* Print Preview Area */}
          <div className="flex-1 max-w-4xl">
            <div className="bg-white shadow-2xl rounded-lg overflow-hidden print-preview-container" style={{
              minHeight: '297mm',
              width: '100%',
              maxWidth: '210mm',
              margin: '0 auto',
              background: 'white',
              boxShadow: '0 0 20px rgba(0,0,0,0.1)'
            }}>
              <div 
                ref={resumeContentRef}
                className="print-preview-page"
                style={{
                  width: '100%',
                  minHeight: '297mm',
                  padding: '20mm',
                  background: 'white',
                  fontSize: '11pt',
                  lineHeight: '1.3',
                  color: '#000'
                }}
              >
                {renderTemplate()}
              </div>
            </div>

            {/* Enhancement status */}
            {isEnhancing && (
              <Card className="mt-6">
                <CardContent className="py-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    <span className="font-medium">Enhancing your resume with AI...</span>
                  </div>
                  <Progress value={enhancementProgress} className="w-full" />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}