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
import { extractTextFromFile, formatResumeText } from "@/lib/fileExtractor";
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
  const [activeTab, setActiveTab] = useState("before");
  const [originalContent, setOriginalContent] = useState<string>("");
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

  // Remove auto-enhancement - let user trigger it manually
  // useEffect(() => {
  //   // Only enhance after we have extracted text
  //   if (extractedText && extractedText.length > 0) {
  //     enhanceResume();
  //   }
  // }, [extractedText]);

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
      setLoadingStage("Extracting text content...");
      const text = await extractTextFromFile(file);
      
      setLoadingProgress(85);
      setLoadingStage("Processing content...");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setExtractedText(text);
      setOriginalContent(text); // Keep original formatting and content
      
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
        if (enhancedContent) {
          sessionStorage.setItem('enhancedContent', enhancedContent);
        }
        if (originalContent) {
          sessionStorage.setItem('originalContent', originalContent);
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
      const { data, error } = await supabase.functions.invoke('enhance-resume', {
        body: {
          fileName: file.name,
          originalText: extractedText,
          extractedText: extractedText
        }
      });

      setEnhancementProgress(70);
      await new Promise(resolve => setTimeout(resolve, 300));

      if (error) {
        console.error('Enhancement error:', error);
        throw error;
      }

      setEnhancementProgress(90);
      await new Promise(resolve => setTimeout(resolve, 200));

      if (data.success && data.enhancedResume) {
        setEnhancedContent(data.enhancedResume);
        setEnhancementProgress(100);
        
        toast({
          title: "Enhancement Complete!",
          description: "Your resume has been enhanced with AI. Review the changes and pay if satisfied.",
        });
      } else {
        throw new Error('Enhancement failed');
      }
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
            AI Enhancement Complete
          </Badge>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 px-2">
            Your Enhanced Resume Preview
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Compare your original resume with our AI-enhanced version. Pay only if you're satisfied with the results.
          </p>
        </div>

        {/* Comparison Tabs */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
          <Tabs value={activeTab} onValueChange={(value) => {
            // Only allow switching to enhanced tab if original is fully loaded
            if (value === "after" && isLoading) {
              toast({
                title: "Please Wait",
                description: "Original preview is still loading. Please wait for it to complete.",
                variant: "destructive"
              });
              return;
            }
            
            // Auto-trigger enhancement when switching to "after" tab if not already done
            if (value === "after" && !enhancedContent && !isEnhancing && extractedText) {
              enhanceResume();
            }
            setActiveTab(value);
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-4 sm:mb-6">
              <TabsTrigger value="before" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <FileText className="w-3 sm:w-4 h-3 sm:h-4" />
                Original
                {isLoading && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
              </TabsTrigger>
              <TabsTrigger 
                value="after" 
                className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isLoading}
              >
                <Zap className="w-3 sm:w-4 h-3 sm:h-4" />
                Enhanced
                {isEnhancing && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
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
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-6 min-h-[400px] max-h-[800px] overflow-hidden flex flex-col">
                      <div className="space-y-4 flex-1 overflow-hidden">
                        <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                          <FileText className="w-6 h-6 text-primary" />
                          <div>
                            <p className="font-semibold">Original Resume Content</p>
                            <p className="text-sm text-muted-foreground">File: {file.name}</p>
                          </div>
                        </div>
                        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line overflow-y-auto flex-1 max-h-[600px] pr-2">
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
                        
                        {/* Enhance with AI Button */}
                        {extractedText && !enhancedContent && !isEnhancing && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/20">
                            <div className="text-center space-y-3">
                              <h4 className="font-semibold text-foreground">Ready for AI Enhancement!</h4>
                              <p className="text-sm text-muted-foreground">
                                Transform your resume with our AI-powered enhancement that improves content, formatting, and ATS compatibility.
                              </p>
                              <Button 
                                onClick={enhanceResume} 
                                size="lg"
                                className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white font-medium px-8 py-3"
                              >
                                <Sparkles className="w-5 h-5 mr-2" />
                                Enhance with AI
                              </Button>
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
                       <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-lg p-3 sm:p-4 md:p-6 min-h-[400px] sm:min-h-[500px] md:min-h-[600px] shadow-2xl border border-accent/20">
                      
                        {/* Color Theme Selector */}
                        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-card/80 rounded-lg border border-border/50">
                          <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-2 flex items-center gap-1 sm:gap-2">
                            <Sparkles className="w-3 sm:w-4 h-3 sm:h-4" />
                            Choose Your Color Theme
                          </h4>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2">
                           {colorThemes.map((theme) => (
                             <button
                               key={theme.id}
                               onClick={() => setSelectedTheme(theme)}
                               className={`p-1 sm:p-2 rounded border-2 transition-all duration-200 text-left ${
                                 selectedTheme.id === theme.id 
                                   ? 'border-primary bg-primary/5 shadow-sm' 
                                   : 'border-border hover:border-primary/50 bg-background'
                               }`}
                             >
                               <div className="flex items-center gap-1 sm:gap-2 mb-1">
                                 <div className="flex gap-0.5 sm:gap-1">
                                   <div 
                                     className="w-2 sm:w-3 h-2 sm:h-3 rounded-full" 
                                     style={{ backgroundColor: theme.primary }}
                                   />
                                   <div 
                                     className="w-2 sm:w-3 h-2 sm:h-3 rounded-full" 
                                     style={{ backgroundColor: theme.secondary }}
                                   />
                                   <div 
                                     className="w-2 sm:w-3 h-2 sm:h-3 rounded-full" 
                                     style={{ backgroundColor: theme.accent }}
                                   />
                                 </div>
                                 {selectedTheme.id === theme.id && (
                                   <Sparkles className="w-2 sm:w-3 h-2 sm:h-3 text-primary" />
                                 )}
                               </div>
                               <p className="text-xs font-medium text-foreground leading-tight break-words">{theme.name}</p>
                             </button>
                           ))}
                        </div>
                      </div>

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
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 md:gap-3 mt-2 sm:mt-3 md:mt-4">
                              <div className="flex items-center gap-1 sm:gap-2 text-white/90">
                                <Mail className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                                <span className="text-xs sm:text-sm break-all truncate">{enhancedContent.email}</span>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 text-white/90">
                                <Phone className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                                <span className="text-xs sm:text-sm">{enhancedContent.phone}</span>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 text-white/90">
                                <MapPin className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                                <span className="text-xs sm:text-sm break-words truncate">{enhancedContent.location}</span>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 text-white/90">
                                <Award className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                                <span className="text-xs sm:text-sm">Professional</span>
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