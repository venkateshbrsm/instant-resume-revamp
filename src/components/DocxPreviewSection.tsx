import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, Download, CreditCard, ArrowLeft, Eye, FileText, Zap, AlertCircle, Loader2, Maximize2, Minimize2, X, CheckCircle, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractContentFromFile, ExtractedContent } from "@/lib/fileExtractor";
import { TemplateSelector } from "./TemplateSelector";
import { DocxResumePreview } from "./DocxResumePreview";
import { toast } from "sonner";
import { generateVisualPdf, extractResumeDataFromEnhanced } from "@/lib/visualPdfGenerator";
import { enhanceResumeWithATS } from "@/lib/atsOptimizer";
import { resumeTemplates, getDefaultTemplate, type ResumeTemplate } from "@/lib/resumeTemplates";
import { parseBasicResumeData } from "@/lib/docxResumeParser";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Textarea } from "@/components/ui/textarea";

interface DocxPreviewSectionProps {
  file: File;
  onPurchase: () => void;
  onBack: () => void;
}

export function DocxPreviewSection({ file, onPurchase, onBack }: DocxPreviewSectionProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [extractedContent, setExtractedContent] = useState<ExtractedContent | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [enhancedContent, setEnhancedContent] = useState<any>(null);
  const [editedContent, setEditedContent] = useState<string>("");
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewPdfBlob, setPreviewPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const enhancedResumeRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we're returning from login and restore state
    const storedExtractedText = sessionStorage.getItem('docxExtractedText');
    const storedEnhancedContent = sessionStorage.getItem('docxEnhancedContent');
    
    if (storedExtractedText && storedEnhancedContent) {
      setEditedContent(storedExtractedText);
      try {
        setEnhancedContent(JSON.parse(storedEnhancedContent));
        sessionStorage.removeItem('docxExtractedText');
        sessionStorage.removeItem('docxEnhancedContent');
      } catch (error) {
        console.error('Error parsing stored enhanced content:', error);
      }
    }
    
    // Only extract file content if we don't have stored content
    if (!storedExtractedText || !storedEnhancedContent) {
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

  // Don't auto-enhance - show raw content first

  // Generate preview PDF when parsed data or template/theme changes
  useEffect(() => {
    if (parsedData && !isGeneratingPreview) {
      generatePreviewPdf();
    }
  }, [parsedData, selectedTemplate, selectedColorTheme]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  const extractFileContent = async () => {
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingStage("Preparing DOCX file...");
    
    try {
      setLoadingProgress(10);
      setLoadingStage("Reading DOCX content...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingProgress(30);
      setLoadingStage("Analyzing document structure...");
      console.log('Extracting content from DOCX file:', file.name);
      
      setLoadingProgress(50);
      setLoadingStage("Extracting text and formatting...");
      
      // Extract content using the enhanced extraction function
      const extractedContent = await extractContentFromFile(file);
      setExtractedContent(extractedContent);
      setEditedContent(extractedContent.text);
      
      setLoadingProgress(70);
      setLoadingStage("Parsing resume structure...");
      
      // Parse the basic resume data for enhancement
      const basicData = parseBasicResumeData(extractedContent.text);
      setParsedData(basicData);
      
      setLoadingProgress(100);
      setLoadingStage("Complete!");
      
      toast({
        title: "DOCX Processed",
        description: "Resume content extracted and parsed successfully.",
      });
      
    } catch (error) {
      console.error('Error extracting DOCX content:', error);
      toast({
        title: "Extraction Error",
        description: "There was an issue processing your DOCX file. Please try again.",
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
    if (!parsedData || isEnhancing) return;
    
    setIsEnhancing(true);
    setEnhancementProgress(0);
    
    const progressInterval = setInterval(() => {
      setEnhancementProgress(prev => Math.min(prev + Math.random() * 10, 90));
    }, 500);
    
    try {
      console.log('Enhancing DOCX resume with ATS optimizer...');
      
      // Use ATS optimizer for enhancement
      const enhanced = await enhanceResumeWithATS(parsedData);
      
      setEnhancedContent(enhanced);
      setEnhancementProgress(100);
      
      toast({
        title: "Resume Enhanced! ✨",
        description: "Your DOCX resume has been optimized for ATS and recruiters.",
      });
      
    } catch (error) {
      console.error('Error enhancing resume:', error);
      toast({
        title: "Enhancement Error",
        description: "There was an issue enhancing your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsEnhancing(false);
        setEnhancementProgress(0);
      }, 1000);
    }
  };

  const generatePreviewPdf = async () => {
    if (!parsedData || isGeneratingPreview) return;
    
    setIsGeneratingPreview(true);
    
    try {
      // Use parsed data directly without enhancement
      const pdfBlob = await generateVisualPdf(parsedData, {
        filename: 'preview.pdf',
        templateType: selectedTemplate.layout,
        colorTheme: {
          primary: selectedColorTheme.primary,
          secondary: selectedColorTheme.secondary,
          accent: selectedColorTheme.accent
        }
      });
      
      setPreviewPdfBlob(pdfBlob);
    } catch (error) {
      console.error('Error generating preview PDF:', error);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handlePurchaseClick = async () => {
    setIsCheckingAuth(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // User is authenticated, save content for payment
        if (parsedData) {
          localStorage.setItem('docxEnhancedContentForPayment', JSON.stringify(parsedData));
          localStorage.setItem('docxExtractedTextForPayment', editedContent);
          localStorage.setItem('docxSelectedTemplateForPayment', JSON.stringify(selectedTemplate));
          localStorage.setItem('docxSelectedColorThemeForPayment', JSON.stringify(selectedColorTheme));
        }
        onPurchase();
      } else {
        // User is not authenticated, redirect to login
        sessionStorage.setItem('attemptingPurchase', 'true');
        sessionStorage.setItem('returnToPreview', 'true');
        
        // Store DOCX specific data
        if (editedContent) {
          sessionStorage.setItem('docxExtractedText', editedContent);
        }
        if (parsedData) {
          sessionStorage.setItem('docxEnhancedContent', JSON.stringify(parsedData));
          localStorage.setItem('docxEnhancedContentForPayment', JSON.stringify(parsedData));
          localStorage.setItem('docxExtractedTextForPayment', editedContent);
          localStorage.setItem('docxSelectedTemplateForPayment', JSON.stringify(selectedTemplate));
          localStorage.setItem('docxSelectedColorThemeForPayment', JSON.stringify(selectedColorTheme));
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

  const handleSaveEdits = () => {
    setIsEditing(false);
    // Re-parse the edited content
    const updatedData = parseBasicResumeData(editedContent);
    setParsedData(updatedData);
    
    toast({
      title: "Edits Saved",
      description: "Your changes have been saved and will be applied to the enhanced version.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
              <div>
                <h3 className="text-lg font-semibold mb-2">{loadingStage}</h3>
                <Progress value={loadingProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">
                  {Math.round(loadingProgress)}% complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={handlePurchaseClick}
              disabled={!parsedData || isCheckingAuth}
              className="flex items-center gap-2"
            >
              {isCheckingAuth ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              Purchase Resume
            </Button>
          </div>
        </div>


        <div className="max-w-4xl mx-auto">
          {/* Resume Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Resume Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {parsedData ? (
                  <div>
                    {/* Template Selector */}
                    <div className="mb-4">
                      <TemplateSelector
                        selectedTemplate={selectedTemplate}
                        selectedColorTheme={selectedColorTheme}
                        onTemplateChange={setSelectedTemplate}
                        onColorThemeChange={setSelectedColorTheme}
                      />
                    </div>
                    
                    {/* Resume Preview */}
                    <div className="bg-background rounded-lg border p-4">
                      <DocxResumePreview
                        parsedData={parsedData}
                        selectedTemplate={selectedTemplate}
                        selectedColorTheme={selectedColorTheme}
                        onContentUpdate={setParsedData}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Loading resume content...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}