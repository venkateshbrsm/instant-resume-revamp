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
  { id: 'classic', name: 'Classic Blue', primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6' },
  { id: 'emerald', name: 'Emerald Green', primary: '#059669', secondary: '#047857', accent: '#10b981' },
  { id: 'purple', name: 'Royal Purple', primary: '#7c3aed', secondary: '#6d28d9', accent: '#8b5cf6' },
  { id: 'rose', name: 'Rose Gold', primary: '#e11d48', secondary: '#be185d', accent: '#f43f5e' },
  { id: 'amber', name: 'Golden Amber', primary: '#d97706', secondary: '#b45309', accent: '#f59e0b' },
  { id: 'slate', name: 'Professional Gray', primary: '#475569', secondary: '#334155', accent: '#64748b' }
];

export function PreviewSection({ file, onPurchase, onBack }: PreviewSectionProps) {
  const [activeTab, setActiveTab] = useState("before");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [enhancedContent, setEnhancedContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnhancing, setIsEnhancing] = useState(false);
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

  useEffect(() => {
    // Only enhance after we have extracted text
    if (extractedText && extractedText.length > 0) {
      enhanceResume();
    }
  }, [extractedText]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  const extractFileContent = async () => {
    setIsLoading(true);
    try {
      console.log('Extracting content from file:', file.name);
      const text = await extractTextFromFile(file);
      setExtractedText(text);
      setOriginalContent(text); // Keep original formatting and content
      
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
    try {
      console.log('Starting enhancement with extracted text length:', extractedText.length);

      const { data, error } = await supabase.functions.invoke('enhance-resume', {
        body: {
          fileName: file.name,
          originalText: extractedText,
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
                        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line overflow-y-auto">
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
                     <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-lg p-4 md:p-8 min-h-[600px] shadow-2xl border border-accent/20">
                      
                      {/* Color Theme Selector */}
                      <div className="mb-6 p-3 md:p-4 bg-card/80 rounded-lg border border-border/50">
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Choose Your Color Theme
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                          {colorThemes.map((theme) => (
                            <button
                              key={theme.id}
                              onClick={() => setSelectedTheme(theme)}
                              className={`p-2 md:p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                                selectedTheme.id === theme.id 
                                  ? 'border-primary bg-primary/5 shadow-md' 
                                  : 'border-border hover:border-primary/50 bg-background'
                              }`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex gap-1">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: theme.primary }}
                                  />
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: theme.secondary }}
                                  />
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: theme.accent }}
                                  />
                                </div>
                                {selectedTheme.id === theme.id && (
                                  <Sparkles className="w-3 h-3 text-primary" />
                                )}
                              </div>
                              <p className="text-xs font-medium text-foreground">{theme.name}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Modern Header with Visual Elements */}
                      <div 
                        className="relative rounded-xl p-4 md:p-8 mb-8 text-white overflow-hidden"
                        style={{
                          background: `linear-gradient(to right, ${selectedTheme.primary}, ${selectedTheme.accent})`
                        }}
                      >
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative z-10">
                           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                             <div className="text-center sm:text-left">
                               <h1 className="text-2xl md:text-3xl font-bold mb-2">{enhancedContent.name}</h1>
                               <p className="text-lg md:text-xl text-white/90 font-medium">{enhancedContent.title}</p>
                             </div>
                           </div>
                          
                          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-6 mt-6">
                            <div className="flex items-center gap-2 text-white/90 min-w-0 w-full sm:w-auto">
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              <span className="text-xs md:text-sm truncate">{enhancedContent.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90 min-w-0 w-full sm:w-auto">
                              <Phone className="w-4 h-4 flex-shrink-0" />
                              <span className="text-xs md:text-sm">{enhancedContent.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90 min-w-0 w-full sm:w-auto">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="text-xs md:text-sm">{enhancedContent.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90 min-w-0 w-full sm:w-auto">
                              <Award className="w-4 h-4 flex-shrink-0" />
                              <span className="text-xs md:text-sm">Professional</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                          
                          {/* Professional Summary with Visual Enhancement */}
                           <div className="bg-card rounded-xl p-4 md:p-6 shadow-lg border border-border/50">
                             <div className="flex items-center gap-3 mb-4">
                               <div 
                                 className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                                 style={{
                                   background: `linear-gradient(to right, ${selectedTheme.primary}, ${selectedTheme.accent})`
                                 }}
                               >
                                 <Users className="w-5 h-5" />
                               </div>
                               <h3 className="text-xl font-bold" style={{ color: selectedTheme.primary }}>Professional Summary</h3>
                             </div>
                            <p className="text-foreground leading-relaxed text-base">{enhancedContent.summary}</p>
                            
                          </div>

                          {/* Professional Experience with Timeline */}
                          {enhancedContent.experience && enhancedContent.experience.length > 0 && (
                             <div className="bg-card rounded-xl p-6 shadow-lg border border-border/50">
                               <div className="flex items-center gap-3 mb-6">
                                 <div 
                                   className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                                   style={{
                                     background: `linear-gradient(to right, ${selectedTheme.primary}, ${selectedTheme.accent})`
                                   }}
                                 >
                                   <Calendar className="w-5 h-5" />
                                 </div>
                                 <h3 className="text-xl font-bold" style={{ color: selectedTheme.primary }}>Professional Experience</h3>
                               </div>
                              
                              <div className="space-y-6">
                                 {enhancedContent.experience.map((exp: any, index: number) => (
                                   <div key={index} className="relative pl-8 border-l-2 last:border-l-0" style={{ borderColor: `${selectedTheme.accent}30` }}>
                                     <div 
                                       className="absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-lg"
                                       style={{ backgroundColor: selectedTheme.accent }}
                                     ></div>
                                     
                                     <div 
                                       className="rounded-lg p-6 ml-4"
                                       style={{ 
                                         background: `linear-gradient(to right, ${selectedTheme.accent}08, ${selectedTheme.primary}08)` 
                                       }}
                                     >
                                       <div className="flex justify-between items-start mb-4">
                                         <div>
                                           <h4 className="text-lg font-bold text-foreground">{exp.title}</h4>
                                           <p className="font-semibold text-lg" style={{ color: selectedTheme.accent }}>{exp.company}</p>
                                         </div>
                                         <Badge 
                                           variant="secondary" 
                                           className="border"
                                           style={{ 
                                             backgroundColor: `${selectedTheme.accent}10`, 
                                             color: selectedTheme.accent,
                                             borderColor: `${selectedTheme.accent}20`
                                           }}
                                         >
                                          {exp.duration}
                                        </Badge>
                                      </div>
                                      
                                      <div className="space-y-3">
                                        {exp.achievements.map((achievement: string, idx: number) => (
                                          <div key={idx} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                                            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                              <TrendingUp className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-foreground leading-relaxed">{achievement}</span>
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
                        <div className="space-y-6">
                          
                          {/* Skills Chart */}
                          {enhancedContent.skills && enhancedContent.skills.length > 0 && (
                            <div className="bg-card rounded-xl p-6 shadow-lg border border-border/50">
                               <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: selectedTheme.primary }}>
                                 <Zap className="w-5 h-5" />
                                 Skills Proficiency
                               </h3>
                              
                              <div className="space-y-4">
                                {enhancedContent.skills.slice(0, 6).map((skill: string, index: number) => {
                                  const proficiency = 85 + Math.random() * 15; // Random between 85-100%
                                  return (
                                    <div key={index} className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-foreground">{skill}</span>
                                        <span className="text-xs text-muted-foreground">{Math.round(proficiency)}%</span>
                                      </div>
                                      <Progress value={proficiency} className="h-2" />
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Skills Tags */}
                              <div className="mt-6">
                                <h4 className="text-sm font-semibold text-muted-foreground mb-3">All Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                  {enhancedContent.skills.map((skill: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10 text-foreground border border-primary/20 hover:from-primary/20 hover:to-accent/20 transition-all duration-200">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Experience Chart */}
                          <div className="bg-card rounded-xl p-6 shadow-lg border border-border/50">
                             <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: selectedTheme.primary }}>
                               <TrendingUp className="w-5 h-5" />
                               Career Growth
                             </h3>
                            
                            <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={[
                                    { year: '2018', level: 1, role: 'Junior' },
                                    { year: '2020', level: 3, role: 'Mid-Level' },
                                    { year: '2022', level: 5, role: 'Senior' },
                                    { year: '2024', level: 7, role: 'Lead' },
                                  ]}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                  <XAxis dataKey="year" stroke="#6b7280" />
                                  <YAxis stroke="#6b7280" />
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: '#f8fafc', 
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '8px'
                                    }}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="level" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

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