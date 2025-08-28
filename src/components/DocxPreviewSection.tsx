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

  // Generate unique file identifier based on file content and metadata
  const generateFileId = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `docx-${file.name}-${file.size}-${file.lastModified}-${hashHex.substring(0, 16)}`;
  };

  // Complete cache clearing function for DOCX files
  const clearAllDocxCaches = () => {
    console.log('🧹 Performing complete DOCX cache clear...');
    
    // Clear all sessionStorage related to DOCX
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.includes('docx') || key.includes('Docx') || key.includes('lastProcessedDocxFile')) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Clear all localStorage related to DOCX resume processing
    const localKeys = Object.keys(localStorage);
    localKeys.forEach(key => {
      if (key.includes('docx') || key.includes('Docx') || key.includes('ForPayment')) {
        localStorage.removeItem(key);
      }
    });
    
    // Revoke any existing blob URLs to prevent memory leaks
    if (previewPdfBlob) {
      URL.revokeObjectURL(URL.createObjectURL(previewPdfBlob));
    }
    
    // Reset all component state
    setExtractedContent(null);
    setParsedData(null);
    setEnhancedContent(null);
    setEditedContent("");
    setPreviewPdfBlob(null);
    setIsLoading(true);
    setIsEnhancing(false);
    setIsGeneratingPdf(false);
  };

  useEffect(() => {
    const processDocxFile = async () => {
      if (!file) return;

      console.log('🔄 DocxPreviewSection: Processing file:', file.name);
      
      // Generate unique file identifier based on content hash
      const currentFileId = await generateFileId(file);
      const lastProcessedFile = sessionStorage.getItem('lastProcessedDocxFile');
      
      console.log('📁 Current DOCX file ID:', currentFileId);
      console.log('📁 Last processed DOCX file ID:', lastProcessedFile);
      
      // Check if this is a new file or returning from payment/auth
      const isNewFile = lastProcessedFile !== currentFileId;
      const isReturningFromAuth = sessionStorage.getItem('attemptingPurchase') === 'true' ||
                                  sessionStorage.getItem('returnToPreview') === 'true';

      if (isNewFile && !isReturningFromAuth) {
        console.log('🆕 New DOCX file detected - performing complete reset');
        
        // Complete cache and state reset for new file
        clearAllDocxCaches();
        
        // Update file tracking AFTER clearing
        sessionStorage.setItem('lastProcessedDocxFile', currentFileId);
        console.log('✅ DOCX file tracking updated to:', currentFileId);
        
        // Always extract content for new file
        console.log('🚀 Starting fresh DOCX extraction for new file...');
        extractFileContent();
      } else if (isReturningFromAuth) {
        console.log('🔙 Returning from auth - restoring DOCX state');
        
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
      } else {
        console.log('🔄 Same DOCX file - using existing state');
        // Same file, don't re-extract
        setIsLoading(false);
      }
      
      checkAuth();
    };

    processDocxFile();
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
      setLoadingStage("Processing with AI...");
      
      // Enhanced processing: GPT enhancement + ATS optimization
      await enhanceResumeContent(extractedContent.text);
      
      setLoadingProgress(100);
      setLoadingStage("Complete!");
      
      toast({
        title: "DOCX Processed & Enhanced",
        description: "Resume content extracted and enhanced with AI successfully.",
      });
      
    } catch (error) {
      console.error('Error extracting DOCX content:', error);
      toast({
        title: "Processing Error",
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

  const enhanceResumeContent = async (extractedText: string) => {
    if (!extractedText || extractedText.length < 50) {
      console.log('Insufficient text for GPT enhancement, applying ATS optimization only');
      const basicData = parseBasicResumeData(extractedText);
      const atsOptimized = enhanceResumeWithATS(basicData);
      setParsedData(atsOptimized);
      setEnhancedContent(atsOptimized);
      return;
    }

    try {
      console.log('🚀 Starting GPT + ATS enhancement for DOCX file');
      console.log('Content length:', extractedText.length);
      
      // Convert file to base64 for the edge function
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const fileBase64 = btoa(String.fromCharCode(...bytes));
      
      const { data, error } = await supabase.functions.invoke('enhance-resume', {
        body: {
          fileName: file.name,
          originalText: extractedText,
          extractedText: extractedText,
          file: fileBase64,
          templateId: selectedTemplate.id,
          themeId: selectedColorTheme.id,
          profilePhotoUrl: extractedContent?.profilePhotoUrl
        }
      });

      if (error) {
        console.error('❌ GPT Enhancement failed for DOCX:', error);
        throw new Error(`GPT Enhancement failed: ${error.message}`);
      }

      if (data.success && data.enhancedResume) {
        console.log('✅ GPT Enhancement successful, applying ATS optimization');
        // Apply ATS optimization to the GPT-enhanced resume
        const atsOptimizedContent = enhanceResumeWithATS(data.enhancedResume);
        setParsedData(atsOptimizedContent);
        setEnhancedContent(atsOptimizedContent);
        
        toast({
          title: "Full Enhancement Complete!",
          description: "Your DOCX resume has been enhanced with GPT + ATS optimization.",
        });
      } else {
        throw new Error('Invalid GPT enhancement response');
      }
    } catch (error) {
      console.error('❌ GPT enhancement failed, falling back to ATS-only enhancement:', error);
      
      // Fallback: Apply ATS optimization to basic parsed data
      const basicData = parseBasicResumeData(extractedText);
      const atsOptimized = enhanceResumeWithATS(basicData);
      setParsedData(atsOptimized);
      setEnhancedContent(atsOptimized);
      
      toast({
        title: "Enhancement Error - Using Fallback",
        description: `GPT enhancement failed: ${error.message}. Applied ATS optimization instead.`,
        variant: "destructive",
      });
      
      // Re-throw to show the user why GPT enhancement failed
      throw error;
    }
  };

  const generatePreviewPdf = async () => {
    if (!parsedData || isGeneratingPreview) return;
    
    setIsGeneratingPreview(true);
    
    try {
      // Use enhanced data (either GPT + ATS or ATS-only)
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
          console.log('💾 Saving current parsedData for payment (includes edits):', parsedData);
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
          console.log('💾 Saving current parsedData for unauthenticated purchase (includes edits):', parsedData);
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

  const handleSaveEdits = async () => {
    setIsEditing(false);
    
    try {
      // Re-enhance the edited content with GPT + ATS
      await enhanceResumeContent(editedContent);
      
      toast({
        title: "Edits Saved & Enhanced",
        description: "Your changes have been saved and enhanced with AI.",
      });
    } catch (error) {
      // If enhancement fails, at least apply basic parsing
      const updatedData = parseBasicResumeData(editedContent);
      setParsedData(updatedData);
      
      toast({
        title: "Edits Saved",
        description: "Your changes have been saved. Enhancement may have failed - check the errors above.",
        variant: "destructive"
      });
    }
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