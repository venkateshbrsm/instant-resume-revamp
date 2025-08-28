import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, Download, CreditCard, ArrowLeft, Eye, FileText, Zap, AlertCircle, Loader2, Calendar, MapPin, Mail, Phone, Award, TrendingUp, Users, Maximize2, Minimize2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromFile, extractContentFromFile, formatResumeText, getFileType, ExtractedContent } from "@/lib/fileExtractor";
import { RichDocumentPreview } from "./RichDocumentPreview";
import { TemplateSelector } from "./TemplateSelector";
import { PDFViewer } from "./PDFViewer";
import { EditablePreview } from "./EditablePreview";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip } from 'recharts';
import { toast } from "sonner";
import { generateVisualPdf, extractResumeDataFromEnhanced } from "@/lib/visualPdfGenerator";
import { enhanceResumeWithATS } from "@/lib/atsOptimizer";
import { resumeTemplates, getDefaultTemplate, type ResumeTemplate } from "@/lib/resumeTemplates";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface PreviewSectionProps {
  file: File;
  onPurchase: () => void;
  onBack: () => void;
}

// Template system now imported from resumeTemplates.ts

export function PreviewSection({ file, onPurchase, onBack }: PreviewSectionProps) {
  const [activeTab, setActiveTab] = useState("before");
  const [showEditablePreview, setShowEditablePreview] = useState(false);
  const [originalContent, setOriginalContent] = useState<string | ExtractedContent>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [enhancedContent, setEnhancedContent] = useState<any>(null);
  const [editedContent, setEditedContent] = useState<any>(null);
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
  const enhancedResumeRef = useRef<HTMLDivElement>(null);
  const resumeContentRef = useRef<HTMLDivElement>(null); // Separate ref for just the resume content
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
    // Only enhance after we have extracted text
    if (extractedText && extractedText.length > 0 && !enhancedContent && !isEnhancing) {
      enhanceResume();
    }
  }, [extractedText]);

  // Generate preview PDF when enhanced content or template/theme changes
  useEffect(() => {
    // Use edited content if available, otherwise use enhanced content
    const contentToUse = editedContent || enhancedContent;
    if (contentToUse && !isGeneratingPreview) {
      generatePreviewPdf();
    }
  }, [enhancedContent, editedContent, selectedTemplate, selectedColorTheme]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  const extractFileContent = async () => {
    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingStage("Preparing file...");
    
    try {
      // Simulate realistic loading stages with progress
      setLoadingProgress(10);
      setLoadingStage("Reading file content...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingProgress(30);
      setLoadingStage("Analyzing document structure...");
      console.log('Extracting content from file:', file.name);
      
      setLoadingProgress(50);
      setLoadingStage("Scanning for photos and images...");
      
      // Use the new enhanced extraction function
      const extractedContent = await extractContentFromFile(file);
      
      setLoadingProgress(70);
      
      // Provide feedback about photo extraction
      if (extractedContent.profilePhotoUrl) {
        console.log('✅ Profile photo found and extracted:', extractedContent.profilePhotoUrl);
        setLoadingStage("Profile photo detected! Processing...");
        toast({
          title: "Photo Found!",
          description: "A profile photo was detected and extracted from your resume.",
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log('❌ No profile photo found in document');
        setLoadingStage("No photos found in document");
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setLoadingProgress(85);
      setLoadingStage("Processing content...");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setExtractedText(extractedContent.text);
      // Store the complete extracted content for visual preview
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

  const handlePurchaseClick = async () => {
    setIsCheckingAuth(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // User is authenticated, generate canvas PDF and save for payment
        if (enhancedContent && resumeContentRef.current) {
          try {
            // Generate the canvas PDF blob for exact visual fidelity
            toast({
              title: "Preparing Payment",
              description: "Generating high-quality PDF preview...",
            });
            
            const resumeData = extractResumeDataFromEnhanced(enhancedContent);
            const pdfBlob = await generateVisualPdf(resumeData, {
              filename: 'enhanced-resume.pdf',
              templateType: selectedTemplate.layout,
              colorTheme: {
                primary: selectedColorTheme.primary,
                secondary: selectedColorTheme.secondary,
                accent: selectedColorTheme.accent
              }
            });
            
            // Convert blob to base64 for session storage
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result as string;
              sessionStorage.setItem('canvasPdfBlob', base64data);
              
              // Also save other data
              localStorage.setItem('enhancedContentForPayment', JSON.stringify(enhancedContent));
              localStorage.setItem('extractedTextForPayment', extractedText);
              console.log('Saving template and theme to localStorage for payment:', selectedTemplate, selectedColorTheme);
              localStorage.setItem('selectedTemplateForPayment', JSON.stringify(selectedTemplate));
              localStorage.setItem('selectedColorThemeForPayment', JSON.stringify(selectedColorTheme));
              
              onPurchase();
            };
            reader.readAsDataURL(pdfBlob);
            return; // Exit early to wait for blob processing
          } catch (error) {
            console.error('Error generating canvas PDF for purchase:', error);
            // Continue with normal flow as fallback
            toast({
              title: "Proceeding with Purchase",
              description: "Will use server-side PDF generation as fallback.",
            });
          }
        }
        
        // Fallback: save enhanced content and theme before proceeding with purchase
        if (enhancedContent) {
          localStorage.setItem('enhancedContentForPayment', JSON.stringify(enhancedContent));
          localStorage.setItem('extractedTextForPayment', extractedText);
          console.log('Saving template and theme to localStorage for payment:', selectedTemplate, selectedColorTheme);
          localStorage.setItem('selectedTemplateForPayment', JSON.stringify(selectedTemplate));
          localStorage.setItem('selectedColorThemeForPayment', JSON.stringify(selectedColorTheme));
        }
        onPurchase();
      } else {
        // User is not authenticated, redirect to login
        sessionStorage.setItem('attemptingPurchase', 'true');
        sessionStorage.setItem('returnToPreview', 'true'); // Stay on preview after login
        // Store file info and preview state to restore after login
        sessionStorage.setItem('pendingFile', JSON.stringify({
          name: file.name,
          size: file.size,
          type: file.type
        }));
        if (extractedText) {
          sessionStorage.setItem('extractedText', extractedText);
        }
        if (enhancedContent && resumeContentRef.current) {
          try {
            // Generate visual PDF for login flow too
            const resumeData = extractResumeDataFromEnhanced(enhancedContent);
            const pdfBlob = await generateVisualPdf(resumeData, {
              filename: 'enhanced-resume.pdf',
              templateType: selectedTemplate.layout,
              colorTheme: {
                primary: selectedColorTheme.primary,
                secondary: selectedColorTheme.secondary,
                accent: selectedColorTheme.accent
              }
            });
            
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result as string;
              sessionStorage.setItem('canvasPdfBlob', base64data);
              
              sessionStorage.setItem('enhancedContent', JSON.stringify(enhancedContent));
              localStorage.setItem('enhancedContentForPayment', JSON.stringify(enhancedContent));
              localStorage.setItem('extractedTextForPayment', extractedText);
              console.log('Saving template and theme to localStorage for login flow:', selectedTemplate, selectedColorTheme);
              localStorage.setItem('selectedTemplateForPayment', JSON.stringify(selectedTemplate));
              localStorage.setItem('selectedColorThemeForPayment', JSON.stringify(selectedColorTheme));
              
              // Navigate after saving
              navigate('/auth');
            };
            reader.readAsDataURL(pdfBlob);
            return; // Exit early to wait for blob processing
          } catch (error) {
            console.error('Error generating canvas PDF for login flow:', error);
            // Continue with normal flow as fallback
          }
        }
        if (enhancedContent) {
          sessionStorage.setItem('enhancedContent', JSON.stringify(enhancedContent));
          localStorage.setItem('enhancedContentForPayment', JSON.stringify(enhancedContent));
          localStorage.setItem('extractedTextForPayment', extractedText);
          console.log('Saving template and theme to localStorage for login flow:', selectedTemplate, selectedColorTheme);
          localStorage.setItem('selectedTemplateForPayment', JSON.stringify(selectedTemplate));
          localStorage.setItem('selectedColorThemeForPayment', JSON.stringify(selectedColorTheme));
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

  const handleTestDownload = async () => {
    if (!enhancedContent) {
      toast({
        title: "Preview Not Ready",
        description: "Please wait for the enhanced resume to load completely.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPdf(true);
    
    try {
      toast({
        title: "Generating Beautiful Visual PDF",
        description: "Creating a stunning resume that matches your template preview...",
      });

      // Use visual PDF generator that matches template preview
      const resumeData = extractResumeDataFromEnhanced(enhancedContent);
      const pdfBlob = await generateVisualPdf(resumeData, {
        templateType: selectedTemplate.layout,
        colorTheme: {
          primary: selectedColorTheme.primary,
          secondary: selectedColorTheme.secondary,
          accent: selectedColorTheme.accent
        },
        filename: `Enhanced_Resume_${enhancedContent.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Resume'}_${new Date().getTime()}.pdf`
      });
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Enhanced_Resume_${enhancedContent.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Resume'}_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Visual PDF Downloaded! 🎨",
        description: "Your beautifully designed resume has been downloaded - matches the preview exactly!",
      });
    } catch (error) {
      console.error('Error generating visual PDF:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const generatePreviewPdf = async () => {
    // Use edited content if available, otherwise use enhanced content
    const contentToUse = editedContent || enhancedContent;
    if (!contentToUse || isGeneratingPreview) return;

    setIsGeneratingPreview(true);
    
    try {
      console.log('🎨 Generating preview PDF for template:', selectedTemplate.layout);
      console.log('🎨 Content preview:', contentToUse);
      
      const resumeData = extractResumeDataFromEnhanced(contentToUse);
      console.log('🎨 Extracted resume data:', resumeData);
      
      const pdfBlob = await generateVisualPdf(resumeData, {
        templateType: selectedTemplate.layout,
        colorTheme: {
          primary: selectedColorTheme.primary,
          secondary: selectedColorTheme.secondary,
          accent: selectedColorTheme.accent
        }
      });
      
      setPreviewPdfBlob(pdfBlob);
      console.log('✅ Preview PDF generated successfully with', editedContent ? 'edited' : 'enhanced', 'content');
    } catch (error) {
      console.error('❌ Error generating preview PDF:', error);
      console.error('❌ Template type:', selectedTemplate.layout);
      console.error('❌ Error details:', error.message);
      toast({
        title: "Preview Error", 
        description: `Failed to generate PDF preview for ${selectedTemplate.name}. Please try a different template.`,
        variant: "destructive"
      });
      // Clear the blob so fallback display shows
      setPreviewPdfBlob(null);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const enhanceResume = async () => {
    if (!extractedText || extractedText.length < 50) {
      console.log('Skipping enhancement - insufficient text content length:', extractedText?.length || 0);
      toast({
        title: "Content Required",
        description: "Waiting for file content to be extracted before enhancement.",
        variant: "destructive"
      });
      return;
    }

    setIsEnhancing(true);
    setEnhancementProgress(0);
    
    try {
      console.log('Starting enhancement with extracted text length:', extractedText.length);
      console.log('Content preview (first 200 chars):', extractedText.substring(0, 200));
      
      // Simulate enhancement progress stages
      setEnhancementProgress(10);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setEnhancementProgress(30);
      
      // Convert file to base64 for potential re-extraction in edge function
      let fileBase64 = '';
      if (file.name.toLowerCase().endsWith('.docx')) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          fileBase64 = btoa(String.fromCharCode(...bytes));
          console.log('File converted to base64, size:', fileBase64.length);
        } catch (error) {
          console.warn('Failed to convert file to base64:', error);
        }
      }
      
      const { data, error } = await supabase.functions.invoke('enhance-resume', {
        body: {
          fileName: file.name,
          originalText: extractedText,
          extractedText: extractedText,
          file: fileBase64 || null,
          templateId: selectedTemplate.id,
          themeId: selectedColorTheme.id,
          profilePhotoUrl: typeof originalContent === 'object' && originalContent.profilePhotoUrl ? originalContent.profilePhotoUrl : undefined
        }
      });

      setEnhancementProgress(70);
      await new Promise(resolve => setTimeout(resolve, 300));

      if (error) {
        console.error('Enhancement service error:', error);
        
        // Handle specific error messages from content validation
        if (error.message?.includes('Insufficient resume content')) {
          toast({
            title: "Content Extraction Issue",
            description: "Unable to extract enough readable content from your file. Please try re-saving your document or converting to PDF format.",
            variant: "destructive",
          });
        } else if (error.message?.includes('does not appear to contain resume information')) {
          toast({
            title: "File Content Issue", 
            description: "The uploaded file doesn't appear to contain resume content. Please ensure you're uploading a valid resume document.",
            variant: "destructive",
          });
        } else if (error.message?.includes('Too few meaningful words')) {
          toast({
            title: "Content Quality Issue",
            description: "The extracted content appears to be incomplete. Please try re-saving your document in a different format.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Enhancement Error",
            description: error.message || "Could not enhance resume. Please try again.",
            variant: "destructive"
          });
        }
        return;
      }

      setEnhancementProgress(90);
      await new Promise(resolve => setTimeout(resolve, 200));

      if (data.success && data.enhancedResume) {
        // Apply ATS optimization to the enhanced resume
        const atsOptimizedContent = enhanceResumeWithATS(data.enhancedResume);
        setEnhancedContent(atsOptimizedContent);
        setEnhancementProgress(100);
        
        console.log('Enhancement successful, enhanced content:', data.enhancedResume);
        
        toast({
          title: "Enhancement Complete!",
          description: "Your resume has been enhanced with AI. Review the changes and pay if satisfied.",
        });
      } else {
        console.error('Invalid enhancement response:', data);
        throw new Error('Enhancement failed - invalid response');
      }
    } catch (error) {
      console.error('Error enhancing resume:', error);
      setEnhancementProgress(0);
      
      // Provide helpful guidance based on the error type
      let errorMessage = "Could not enhance resume. Please try again.";
      let errorTitle = "Enhancement Error";
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "Network connection issue. Please check your internet connection and try again.";
        errorTitle = "Connection Error";
      } else if (error.message?.includes('OpenAI') || error.message?.includes('AI service')) {
        errorMessage = "AI service temporarily unavailable. Please try again in a moment.";
        errorTitle = "Service Unavailable";
      } else if (error.message?.includes('Insufficient') || error.message?.includes('content')) {
        errorMessage = "Unable to extract enough content from your file. Try re-saving your document or converting to PDF format.";
        errorTitle = "Content Extraction Issue";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "Request timed out. Please try again with a smaller file or check your connection.";
        errorTitle = "Timeout Error";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <Badge variant="secondary" className="mb-2 sm:mb-3 md:mb-4 px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-xs sm:text-sm">
            <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            AI Enhancement Complete
          </Badge>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 px-2 sm:px-4">
            Your Enhanced Resume Preview
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4 sm:px-6">
            Compare your original resume with our AI-enhanced version. Pay only if you're satisfied with the results.
          </p>
        </div>

        {/* Enhanced Resume Display */}
        <div className="w-full max-w-4xl mx-auto mb-6 sm:mb-8">

          <Card className="bg-card/80 backdrop-blur-sm border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                AI-Enhanced Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEnhancing ? (
                <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-lg p-4 sm:p-6 md:p-8 min-h-[300px] sm:min-h-[400px] flex items-center justify-center border border-accent/20">
                  <div className="text-center space-y-4 w-full max-w-md">
                    <Loader2 className="w-10 sm:w-12 h-10 sm:h-12 text-accent animate-spin mx-auto" />
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">AI Enhancement in Progress</h3>
                      <p className="text-muted-foreground text-sm sm:text-base mb-4">
                        Our AI is analyzing and enhancing your resume...
                      </p>
                      <Progress value={enhancementProgress} className="w-full h-2 sm:h-3" />
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                        {Math.round(enhancementProgress)}% complete
                      </p>
                    </div>
                  </div>
                </div>
              ) : enhancedContent ? (
                 <div className="w-full border border-border/20 rounded-lg overflow-hidden">
                   <div 
                     ref={enhancedResumeRef}
                     className="bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-lg p-3 sm:p-4 md:p-6 shadow-2xl border border-accent/20"
                   >
                  
                       {/* Template and Color Selector */}
                       <TemplateSelector
                         selectedTemplate={selectedTemplate}
                         selectedColorTheme={selectedColorTheme}
                         onTemplateChange={setSelectedTemplate}
                         onColorThemeChange={setSelectedColorTheme}
                       />

                         {/* Tabbed Preview */}
                         <Tabs defaultValue="pdf" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="pdf">📄 PDF Preview</TabsTrigger>
                            <TabsTrigger value="edit">✏️ Edit & Download</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="pdf" className="space-y-4">
                            <div className="relative">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-muted-foreground text-center flex-1">
                                  📄 PDF Preview • This is exactly what you'll receive
                                </p>
                                <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="ml-2">
                                      <Maximize2 className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-2">
                                    <div className="flex items-center justify-between mb-4">
                                      <h2 className="text-lg font-semibold">PDF Preview - Fullscreen</h2>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setIsFullscreen(false)}
                                      >
                                        <Minimize2 className="w-4 h-4 mr-2" />
                                        Exit Fullscreen
                                      </Button>
                                    </div>
                                    {previewPdfBlob ? (
                                      <PDFViewer 
                                        file={previewPdfBlob} 
                                        className="h-full w-full"
                                      />
                                    ) : (
                                      <div className="flex items-center justify-center h-full">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        <span className="ml-2">Generating PDF preview...</span>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </div>
                              
                              {isGeneratingPreview ? (
                                <div className="h-[600px] w-full border rounded-lg shadow-inner flex items-center justify-center bg-muted/10">
                                  <div className="text-center space-y-4">
                                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                                    <div>
                                      <h3 className="text-lg font-semibold mb-2">Generating PDF Preview</h3>
                                      <p className="text-muted-foreground">
                                        Creating your resume PDF with the selected template and colors...
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ) : previewPdfBlob ? (
                                <PDFViewer 
                                  file={previewPdfBlob} 
                                  className="h-[600px] w-full"
                                />
                              ) : (
                                <div className="h-[600px] w-full border rounded-lg shadow-inner flex items-center justify-center bg-muted/10">
                                  <div className="text-center space-y-4">
                                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
                                    <div>
                                      <h3 className="text-lg font-semibold mb-2">Preview Unavailable</h3>
                                      <p className="text-muted-foreground">
                                        Unable to generate PDF preview. Your resume is ready for purchase.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                          
                           <TabsContent value="edit" className="space-y-4">
                             <EditablePreview
                               enhancedContent={enhancedContent}
                               selectedTemplate={selectedTemplate}
                               selectedColorTheme={selectedColorTheme}
                               onContentUpdate={(updatedContent) => {
                                 setEditedContent(updatedContent);
                               }}
                             />
                           </TabsContent>
                        </Tabs>
                    </div>
                  </div>
              ) : (
                <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-lg p-6 sm:p-8 min-h-[400px] sm:min-h-[500px] flex items-center justify-center border border-accent/20">
                  <div className="text-center space-y-4 sm:space-y-6 w-full max-w-md">
                    <Loader2 className="w-12 sm:w-16 h-12 sm:h-16 text-accent mx-auto animate-spin" />
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">Processing Your Resume</h3>
                      <p className="text-muted-foreground mb-4 text-sm sm:text-base px-4">
                        {loadingStage}
                      </p>
                      <div className="space-y-2">
                        <Progress value={loadingProgress} className="w-full h-2 sm:h-3" />
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {Math.round(loadingProgress)}% complete
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhancement Features */}
        <Card className="max-w-4xl mx-auto mb-6 sm:mb-8 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 text-center">What We Enhanced</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 rounded-lg bg-accent/5 border border-accent/20">
                <Sparkles className="w-6 sm:w-8 h-6 sm:h-8 text-accent mx-auto mb-1 sm:mb-2" />
                <h4 className="font-semibold mb-1 text-xs sm:text-sm md:text-base">Content Optimization</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Enhanced descriptions with action verbs and quantified achievements</p>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20">
                <Eye className="w-6 sm:w-8 h-6 sm:h-8 text-primary mx-auto mb-1 sm:mb-2" />
                <h4 className="font-semibold mb-1 text-xs sm:text-sm md:text-base">Visual Appeal</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Professional formatting with better typography and layout</p>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-lg bg-accent/5 border border-accent/20">
                <Zap className="w-6 sm:w-8 h-6 sm:h-8 text-accent mx-auto mb-1 sm:mb-2" />
                <h4 className="font-semibold mb-1 text-xs sm:text-sm md:text-base">ATS Optimization</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Structured for better parsing by applicant tracking systems</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Section */}
        <Card className="max-w-md mx-auto bg-gradient-primary/5 border-primary/20">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="mb-4 sm:mb-6">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">₹299</div>
              <p className="text-muted-foreground text-xs sm:text-sm">One-time payment • Instant download</p>
            </div>
            
            <div className="space-y-3 mb-6">
              <Button 
                variant="success" 
                size="xl" 
                onClick={handlePurchaseClick}
                className="w-full"
                disabled={!enhancedContent || isCheckingAuth}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                {isCheckingAuth ? 'Checking authentication...' : 
                 !enhancedContent ? 'Processing Enhancement...' :
                 user ? 'Purchase Enhanced Resume' : 'Sign In & Purchase'}
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
                <span>ATS-optimized format</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full" />
                <span>ATS-friendly formatting</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full" />
                <span>Instant download</span>
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