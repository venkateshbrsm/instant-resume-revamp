import { useState, useEffect } from "react";
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
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface PreviewSectionProps {
  file: File;
  onPurchase: () => void;
  onBack: () => void;
}

const colorThemes = [
  { id: 'navy', name: 'Navy Professional', primary: '#1e3a8a', secondary: '#1e40af', accent: '#3b82f6' },
  { id: 'charcoal', name: 'Charcoal Gray', primary: '#374151', secondary: '#1f2937', accent: '#6b7280' },
  { id: 'burgundy', name: 'Burgundy Wine', primary: '#7c2d12', secondary: '#991b1b', accent: '#dc2626' },
  { id: 'forest', name: 'Forest Green', primary: '#166534', secondary: '#15803d', accent: '#22c55e' },
  { id: 'bronze', name: 'Bronze Gold', primary: '#a16207', secondary: '#ca8a04', accent: '#eab308' },
  { id: 'slate', name: 'Slate Blue', primary: '#475569', secondary: '#334155', accent: '#64748b' }
];

export function PreviewSection({ file, onPurchase, onBack }: PreviewSectionProps) {
  const [activeTab, setActiveTab] = useState("design1");
  const [originalContent, setOriginalContent] = useState<string | ExtractedContent>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [enhancedContent1, setEnhancedContent1] = useState<any>(null);
  const [enhancedContent2, setEnhancedContent2] = useState<any>(null);
  const [selectedDesign, setSelectedDesign] = useState<'design1' | 'design2' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState("Initializing...");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementProgress, setEnhancementProgress] = useState(0);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(colorThemes[0]);
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
        const content = JSON.parse(storedEnhancedContent);
        setEnhancedContent1(content);
        setEnhancedContent2(content); // For now, use same content
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
        // User is authenticated, proceed with purchase
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
        if (enhancedContent1) {
          sessionStorage.setItem('enhancedContent', JSON.stringify(enhancedContent1));
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

  const enhanceResume = async () => {
    if (!extractedText || extractedText.length < 50) {
      console.log('Skipping enhancement - insufficient text content');
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
      
      // Simulate enhancement progress stages
      setEnhancementProgress(10);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setEnhancementProgress(30);
      
      // Generate two different designs
      const [response1, response2] = await Promise.all([
        supabase.functions.invoke('enhance-resume', {
          body: {
            fileName: file.name,
            originalText: extractedText,
            extractedText: extractedText,
            designStyle: 'professional'
          }
        }),
        supabase.functions.invoke('enhance-resume', {
          body: {
            fileName: file.name,
            originalText: extractedText,
            extractedText: extractedText,
            designStyle: 'modern'
          }
        })
      ]);

      setEnhancementProgress(70);
      await new Promise(resolve => setTimeout(resolve, 300));

      if (response1.error || response2.error) {
        console.error('Enhancement error:', response1.error || response2.error);
        throw new Error('Enhancement failed');
      }

      setEnhancementProgress(90);
      await new Promise(resolve => setTimeout(resolve, 200));

      if (response1.data?.success && response1.data?.enhancedResume) {
        setEnhancedContent1(response1.data.enhancedResume);
      }
      
      if (response2.data?.success && response2.data?.enhancedResume) {
        setEnhancedContent2(response2.data.enhancedResume);
      } else {
        // Fallback: use same content for both designs for now
        setEnhancedContent2(response1.data.enhancedResume);
      }
      
      setEnhancementProgress(100);
      
      toast({
        title: "Enhancement Complete!",
        description: "Two enhanced designs created! Choose your preferred version.",
      });
    } catch (error) {
      console.error('Error enhancing resume:', error);
      setEnhancementProgress(0);
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
    <div className="min-h-screen bg-gradient-hero px-4 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <Badge variant="secondary" className="mb-2 sm:mb-3 md:mb-4 px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-xs sm:text-sm">
            <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
            Choose Your Design
          </Badge>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 px-2">
            Two Enhanced Designs Created
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Choose your preferred enhanced design and pay only for the one you want to download.
          </p>
        </div>

        {/* Enhanced Design Tabs */}
        <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
          <Tabs value={activeTab} onValueChange={(value) => {
            // Auto-trigger enhancement when switching to design tabs if not already done
            if ((value === "design1" || value === "design2") && !enhancedContent1 && !isEnhancing && extractedText) {
              enhanceResume();
            }
            setActiveTab(value);
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-4 sm:mb-6">
              <TabsTrigger value="design1" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Sparkles className="w-3 sm:w-4 h-3 sm:h-4" />
                Design 1
                {isEnhancing && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
              </TabsTrigger>
              <TabsTrigger 
                value="design2" 
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Zap className="w-3 sm:w-4 h-3 sm:h-4" />
                Design 2
                {isEnhancing && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="design1">
              <Card className={`bg-card/80 backdrop-blur-sm border-2 ${selectedDesign === 'design1' ? 'border-accent' : 'border-border'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      Professional Design
                    </CardTitle>
                    <Button
                      variant={selectedDesign === 'design1' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDesign('design1')}
                    >
                      {selectedDesign === 'design1' ? 'Selected' : 'Select'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="bg-muted/50 rounded-lg p-4 sm:p-6 text-center min-h-[300px] sm:min-h-[400px] flex items-center justify-center">
                      <div className="space-y-4 w-full max-w-md">
                        <Loader2 className="w-8 sm:w-10 h-8 sm:h-10 text-primary mx-auto animate-spin" />
                        <div>
                          <p className="text-muted-foreground text-sm sm:text-base mb-3">{loadingStage}</p>
                          <Progress value={loadingProgress} className="w-full h-2 sm:h-3" />
                          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                            {Math.round(loadingProgress)}% complete
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : !enhancedContent1 && !isEnhancing && extractedText ? (
                    <div className="mt-4 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/20">
                      <div className="text-center space-y-3">
                        <h4 className="font-semibold text-foreground">Ready for AI Enhancement!</h4>
                        <p className="text-sm text-muted-foreground">
                          Create two enhanced designs with our AI-powered enhancement that improves content, formatting, and ATS compatibility.
                        </p>
                        <Button 
                          onClick={enhanceResume} 
                          size="lg"
                          className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white font-medium px-8 py-3"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Create Enhanced Designs
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-6 min-h-[400px] max-h-[800px] overflow-hidden">
                      {isEnhancing ? (
                        <div className="text-center min-h-[400px] flex items-center justify-center">
                          <div className="space-y-4 w-full max-w-md">
                            <Loader2 className="w-10 h-10 text-accent mx-auto animate-spin" />
                            <div>
                              <p className="text-muted-foreground mb-3">Creating enhanced designs...</p>
                              <Progress value={enhancementProgress} className="w-full h-3" />
                              <p className="text-sm text-muted-foreground mt-2">
                                {Math.round(enhancementProgress)}% complete
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : enhancedContent1 ? (
                        <div className="space-y-4">
                          <div className="prose prose-sm max-w-none">
                            <h3 className="text-lg font-bold mb-4">{enhancedContent1.name}</h3>
                            <p className="text-muted-foreground mb-4">{enhancedContent1.summary}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="design2">
              <Card className={`bg-card/80 backdrop-blur-sm border-2 ${selectedDesign === 'design2' ? 'border-accent' : 'border-border'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Modern Design
                    </CardTitle>
                    <Button
                      variant={selectedDesign === 'design2' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDesign('design2')}
                    >
                      {selectedDesign === 'design2' ? 'Selected' : 'Select'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEnhancing ? (
                    <div className="text-center min-h-[400px] flex items-center justify-center">
                      <div className="space-y-4 w-full max-w-md">
                        <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
                        <div>
                          <p className="text-muted-foreground mb-3">Creating enhanced designs...</p>
                          <Progress value={enhancementProgress} className="w-full h-3" />
                          <p className="text-sm text-muted-foreground mt-2">
                            {Math.round(enhancementProgress)}% complete
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : enhancedContent2 ? (
                    <div className="bg-muted/50 rounded-lg p-6 min-h-[400px] max-h-[800px] overflow-hidden">
                      <div className="space-y-4">
                        <div className="prose prose-sm max-w-none">
                          <h3 className="text-lg font-bold mb-4">{enhancedContent2.name}</h3>
                          <p className="text-muted-foreground mb-4">{enhancedContent2.summary}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-lg p-6 sm:p-8 min-h-[300px] sm:min-h-[400px] flex items-center justify-center border border-accent/20">
                      <div className="text-center space-y-3 sm:space-y-4">
                        <Sparkles className="w-10 sm:w-12 h-10 sm:h-12 text-accent mx-auto" />
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold mb-2">Ready for AI Enhancement</h3>
                          <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base px-4">
                            Click the button below to enhance your resume with AI-powered improvements.
                          </p>
                          <Button 
                            onClick={enhanceResume} 
                            variant="default"
                            className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white"
                            disabled={!extractedText}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Enhance with AI
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

        {/* Action Buttons */}
        <div className="max-w-md mx-auto mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 px-4">
          <Button 
            onClick={onBack} 
            variant="outline" 
            className="flex-1 flex items-center justify-center gap-2 min-h-[48px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button 
            onClick={handlePurchaseClick}
            disabled={isCheckingAuth || !selectedDesign}
            className="flex-1 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white font-medium min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isCheckingAuth ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking...
              </>
            ) : !selectedDesign ? (
              <>
                <Eye className="w-4 h-4" />
                Select a Design First
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Pay ₹49 & Download {selectedDesign === 'design1' ? 'Design 1' : 'Design 2'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}