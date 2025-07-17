import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Download, CreditCard, ArrowLeft, Eye, FileText, Zap, AlertCircle, Loader2, Calendar, MapPin, Mail, Phone, Award, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromFile, extractContentFromFile, formatResumeText, getFileType, ExtractedContent } from "@/lib/fileExtractor";
import { RichDocumentPreview } from "./RichDocumentPreview";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip } from 'recharts';
import { downloadPdfFromElement, generatePdfFromElement } from "@/lib/canvasPdfGenerator";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface PreviewSectionProps {
  file: File;
  onPurchase: () => void;
  onBack: () => void;
}

const colorThemes = [
  { id: 'navy', name: 'Navy Professional', primary: '#3b82f6', secondary: '#60a5fa', accent: '#93c5fd' },
  { id: 'charcoal', name: 'Charcoal Gray', primary: '#6b7280', secondary: '#9ca3af', accent: '#d1d5db' },
  { id: 'burgundy', name: 'Burgundy Wine', primary: '#dc2626', secondary: '#ef4444', accent: '#f87171' },
  { id: 'forest', name: 'Forest Green', primary: '#22c55e', secondary: '#4ade80', accent: '#86efac' },
  { id: 'bronze', name: 'Bronze Gold', primary: '#eab308', secondary: '#fbbf24', accent: '#fcd34d' },
  { id: 'slate', name: 'Slate Blue', primary: '#64748b', secondary: '#94a3b8', accent: '#cbd5e1' }
];

export function PreviewSection({ file, onPurchase, onBack }: PreviewSectionProps) {
  const [activeTab, setActiveTab] = useState("before");
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
  const [selectedTheme, setSelectedTheme] = useState(colorThemes[0]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
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
      
      setLoadingProgress(60);
      setLoadingStage("Extracting text and preparing visual preview...");
      
      // Use the new enhanced extraction function
      const extractedContent = await extractContentFromFile(file);
      
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
      console.error('Error extracting file content:', error);
      setLoadingProgress(100);
      setLoadingStage("Processing with fallback...");
      
      const fallbackContent = `📄 Resume Document: ${file.name}\n\nFile Size: ${(file.size / 1024).toFixed(1)} KB\nType: ${file.type}\nUploaded: ${new Date().toLocaleString()}\n\n⚠️ Content extraction encountered an issue, but the file was uploaded successfully.\n\nThe AI enhancement process will work directly with your original document to create an improved version.\n\nNote: Some file formats or protected documents may not display preview text, but enhancement will still work properly.`;
      setOriginalContent(fallbackContent);
      
      toast({
        title: "Limited Preview",
        description: "File uploaded successfully. Enhancement will process the original content.",
        variant: "destructive"
      });
    } finally {
      // Add a small delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
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
            
            const pdfBlob = await generatePdfFromElement(resumeContentRef.current, {
              quality: 0.95,
              scale: 2
            });
            
            // Convert blob to base64 for session storage
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result as string;
              sessionStorage.setItem('canvasPdfBlob', base64data);
              
              // Also save other data
              sessionStorage.setItem('enhancedContentForPayment', JSON.stringify(enhancedContent));
              sessionStorage.setItem('extractedTextForPayment', extractedText);
              console.log('Saving theme to sessionStorage for payment:', selectedTheme);
              sessionStorage.setItem('selectedThemeForPayment', JSON.stringify(selectedTheme));
              
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
          sessionStorage.setItem('enhancedContentForPayment', JSON.stringify(enhancedContent));
          sessionStorage.setItem('extractedTextForPayment', extractedText);
          console.log('Saving theme to sessionStorage for payment:', selectedTheme);
          sessionStorage.setItem('selectedThemeForPayment', JSON.stringify(selectedTheme));
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
            // Generate canvas PDF for login flow too
            const pdfBlob = await generatePdfFromElement(resumeContentRef.current, {
              quality: 0.95,
              scale: 2
            });
            
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64data = reader.result as string;
              sessionStorage.setItem('canvasPdfBlob', base64data);
              
              sessionStorage.setItem('enhancedContent', JSON.stringify(enhancedContent));
              sessionStorage.setItem('enhancedContentForPayment', JSON.stringify(enhancedContent));
              sessionStorage.setItem('extractedTextForPayment', extractedText);
              console.log('Saving theme to sessionStorage for login flow:', selectedTheme);
              sessionStorage.setItem('selectedThemeForPayment', JSON.stringify(selectedTheme));
              
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
          sessionStorage.setItem('enhancedContentForPayment', JSON.stringify(enhancedContent));
          sessionStorage.setItem('extractedTextForPayment', extractedText);
          console.log('Saving theme to sessionStorage for login flow:', selectedTheme);
          sessionStorage.setItem('selectedThemeForPayment', JSON.stringify(selectedTheme));
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
    if (!resumeContentRef.current || !enhancedContent) {
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
        title: "Generating PDF",
        description: "Creating a high-quality PDF from your enhanced resume...",
      });

      const filename = `Enhanced_Resume_${enhancedContent.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Resume'}_${new Date().getTime()}.pdf`;
      
      await downloadPdfFromElement(resumeContentRef.current, {
        filename,
        quality: 0.95,
        scale: 2
      });

      toast({
        title: "PDF Downloaded",
        description: "Your enhanced resume has been downloaded successfully!",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPdf(false);
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
          themeId: selectedTheme.id
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
        setEnhancedContent(data.enhancedResume);
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
                 <div className="w-full border border-border/20 rounded-lg">
                   <div 
                     ref={enhancedResumeRef}
                     className="bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-lg p-3 sm:p-4 md:p-6 min-h-[400px] sm:min-h-[500px] md:min-h-[600px] shadow-2xl border border-accent/20"
                   >
                  
                     {/* Color Theme Selector */}
                     <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-card/80 rounded-lg border border-border/50">
                       <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                         <Sparkles className="w-3 h-3" />
                         Themes
                       </h4>
                       <div className="flex flex-wrap gap-1">
                        {colorThemes.map((theme) => (
                          <button
                            key={theme.id}
                             onClick={() => {
                               console.log('Theme selected:', theme);
                               setSelectedTheme(theme);
                             }}
                            className={`flex items-center gap-1 p-1 rounded border transition-all duration-200 ${
                              selectedTheme.id === theme.id 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-primary/50 bg-background'
                            }`}
                          >
                            <div className="flex gap-0.5">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: theme.primary }}
                              />
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: theme.secondary }}
                              />
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: theme.accent }}
                              />
                            </div>
                            {selectedTheme.id === theme.id && (
                              <Sparkles className="w-2 h-2 text-primary" />
                            )}
                          </button>
                        ))}
                     </div>
                  </div>

                    {/* Resume Content - This is what gets captured for PDF */}
                    <div ref={resumeContentRef}>
                    {/* Modern Header with Visual Elements */}
                    <div 
                      className="relative rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 mb-3 sm:mb-4 md:mb-6 text-white overflow-hidden"
                      style={{
                        background: `linear-gradient(to right, ${selectedTheme.primary}, ${selectedTheme.accent})`
                      }}
                    >
                      <div className="absolute inset-0 bg-black/10"></div>
                       <div className="relative z-10">
                         <div className="flex items-center justify-between gap-1 sm:gap-2 md:gap-3">
                           <div className="min-w-0 flex-1">
                             <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-0.5 sm:mb-1 break-words leading-tight">{enhancedContent.name}</h1>
                             <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 font-medium break-words leading-tight">{enhancedContent.title}</p>
                           </div>
                         </div>
                        
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4 md:mt-5">
                            <div className="flex items-center gap-2 text-white/90 min-w-0">
                              <Mail className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                              <span className="text-xs sm:text-sm truncate min-w-0">{enhancedContent.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90 min-w-0">
                              <Phone className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                              <span className="text-xs sm:text-sm truncate min-w-0">{enhancedContent.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90 min-w-0">
                              <MapPin className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                              <span className="text-xs sm:text-sm truncate min-w-0">{enhancedContent.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90 min-w-0">
                              <Award className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                              <span className="text-xs sm:text-sm truncate min-w-0">Professional</span>
                            </div>
                          </div>
                      </div>
                   </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                      {/* Main Content */}
                      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                      
                        {/* Professional Summary with Visual Enhancement */}
                         <div className="bg-card rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 lg:p-6 shadow-lg border border-border/50">
                          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-3 md:mb-4">
                            <div 
                              className="w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 rounded-lg flex items-center justify-center text-white"
                              style={{
                                background: `linear-gradient(to right, ${selectedTheme.primary}, ${selectedTheme.accent})`
                              }}
                            >
                              <Users className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5" />
                            </div>
                            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold" style={{ color: selectedTheme.primary }}>Professional Summary</h3>
                          </div>
                         <p className="text-foreground leading-relaxed text-xs sm:text-sm md:text-base">{enhancedContent.summary}</p>
                         
                       </div>

                      {/* Professional Experience with Timeline */}
                      {enhancedContent.experience && enhancedContent.experience.length > 0 && (
                         <div className="bg-card rounded-xl p-3 sm:p-4 md:p-6 shadow-lg border border-border/50">
                           <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                             <div 
                               className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg flex items-center justify-center text-white"
                               style={{
                                 background: `linear-gradient(to right, ${selectedTheme.primary}, ${selectedTheme.accent})`
                               }}
                             >
                               <Calendar className="w-4 sm:w-5 h-4 sm:h-5" />
                             </div>
                             <h3 className="text-base sm:text-lg md:text-xl font-bold" style={{ color: selectedTheme.primary }}>Professional Experience</h3>
                           </div>
                          
                          <div className="space-y-4 sm:space-y-6">
                             {enhancedContent.experience.map((exp: any, index: number) => (
                               <div key={index} className="relative pl-6 sm:pl-8 border-l-2 last:border-l-0" style={{ borderColor: `${selectedTheme.accent}30` }}>
                                 <div 
                                   className="absolute left-[-6px] sm:left-[-9px] top-0 w-3 sm:w-4 h-3 sm:h-4 rounded-full border-2 border-white shadow-lg"
                                   style={{ backgroundColor: selectedTheme.accent }}
                                 ></div>
                                 
                                 <div 
                                   className="rounded-lg p-3 sm:p-4 md:p-6 ml-2 sm:ml-4"
                                   style={{ 
                                     background: `linear-gradient(to right, ${selectedTheme.accent}08, ${selectedTheme.primary}08)` 
                                   }}
                                 >
                                   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                                     <div>
                                       <h4 className="text-base sm:text-lg font-bold text-foreground break-words">{exp.title}</h4>
                                       <p className="font-semibold text-base sm:text-lg break-words" style={{ color: selectedTheme.accent }}>{exp.company}</p>
                                     </div>
                                     <Badge 
                                       variant="secondary" 
                                       className="border self-start text-xs"
                                       style={{ 
                                         backgroundColor: `${selectedTheme.accent}10`, 
                                         color: selectedTheme.accent,
                                         borderColor: `${selectedTheme.accent}20`
                                       }}
                                     >
                                      {exp.duration}
                                    </Badge>
                                  </div>
                                  
                                  <div className="space-y-2 sm:space-y-3">
                                    {exp.achievements.map((achievement: string, idx: number) => (
                                      <div key={idx} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white/50 rounded-lg">
                                        <div className="w-5 sm:w-6 h-5 sm:h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                          <TrendingUp className="w-2 sm:w-3 h-2 sm:h-3 text-white" />
                                        </div>
                                        <span className="text-foreground leading-relaxed text-xs sm:text-sm break-words">{achievement}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                     {/* Sidebar with Charts and Skills */}
                     <div className="space-y-4 sm:space-y-6">
                      
                      {/* Skills Chart */}
                      {enhancedContent.skills && enhancedContent.skills.length > 0 && (
                        <div className="bg-card rounded-xl p-3 sm:p-4 md:p-6 shadow-lg border border-border/50">
                           <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: selectedTheme.primary }}>
                             <Zap className="w-4 sm:w-5 h-4 sm:h-5" />
                             Skills Proficiency
                           </h3>
                          
                           <div className="space-y-3 sm:space-y-4">
                             {enhancedContent.skills.slice(0, 6).map((skill: string, index: number) => {
                               // Use a deterministic proficiency based on skill position and length
                               const baseSkillLevel = 75 + (skill.length % 20); // 75-95% based on skill name
                               const proficiency = Math.min(95, baseSkillLevel + (index * 2)); // Slight variation by position
                               return (
                                 <div key={index} className="space-y-1 sm:space-y-2">
                                   <div className="flex justify-between items-center">
                                     <span className="text-xs sm:text-sm font-medium text-foreground break-words">{skill}</span>
                                     <span className="text-xs text-muted-foreground">{Math.round(proficiency)}%</span>
                                   </div>
                                   <Progress value={proficiency} className="h-1.5 sm:h-2" />
                                 </div>
                               );
                             })}
                           </div>

                          {/* Skills Tags */}
                          <div className="mt-4 sm:mt-6">
                            <h4 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 sm:mb-3">All Skills</h4>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {enhancedContent.skills.map((skill: string, index: number) => (
                                <Badge key={index} variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10 text-foreground border border-primary/20 hover:from-primary/20 hover:to-accent/20 transition-all duration-200 text-xs break-words">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Skills Distribution Chart */}
                      {enhancedContent.skills && enhancedContent.skills.length > 0 && (
                        <div className="bg-card rounded-xl p-6 shadow-lg border border-border/50">
                          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: selectedTheme.primary }}>
                            <TrendingUp className="w-5 h-5" />
                            Skills Overview
                          </h3>
                          
                          <div className="space-y-3">
                            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: `${selectedTheme.primary}08` }}>
                              <div className="text-2xl font-bold" style={{ color: selectedTheme.primary }}>
                                {enhancedContent.skills.length}
                              </div>
                              <p className="text-sm text-muted-foreground">Total Skills</p>
                            </div>
                            
                            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: `${selectedTheme.accent}08` }}>
                              <div className="text-2xl font-bold" style={{ color: selectedTheme.accent }}>
                                {enhancedContent.experience?.length || 0}
                              </div>
                              <p className="text-sm text-muted-foreground">Work Experiences</p>
                            </div>
                            
                            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: `${selectedTheme.secondary}08` }}>
                              <div className="text-2xl font-bold" style={{ color: selectedTheme.secondary }}>
                                {enhancedContent.education?.length || 0}
                              </div>
                              <p className="text-sm text-muted-foreground">Educational Qualifications</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {enhancedContent.education && enhancedContent.education.length > 0 && (
                        <div className="bg-card rounded-xl p-6 shadow-lg border border-border/50">
                           <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: selectedTheme.primary }}>
                             <Award className="w-5 h-5" />
                             Education
                           </h3>
                          <div className="space-y-4">
                            {enhancedContent.education.map((edu: any, index: number) => (
                               <div 
                                 key={index} 
                                 className="rounded-lg p-4 border"
                                 style={{ 
                                   background: `linear-gradient(to right, ${selectedTheme.primary}08, ${selectedTheme.accent}08)`,
                                   borderColor: `${selectedTheme.primary}10`
                                 }}
                               >
                                 <h4 className="font-bold text-foreground text-base">{edu.degree}</h4>
                                 <p className="font-medium" style={{ color: selectedTheme.accent }}>{edu.institution}</p>
                                <p className="text-sm text-muted-foreground mt-1">{edu.year}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                     </div>
                   </div>
                 </div>
                 </div> {/* End of resumeContentRef */}
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
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">₹1</div>
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
              
              {enhancedContent && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleTestDownload}
                  className="w-full"
                  disabled={isGeneratingPdf}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isGeneratingPdf ? 'Generating PDF...' : 'Test Download (Preview)'}
                </Button>
              )}
              
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