
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, CheckCircle, Star, Clock, Shield, MessageCircle, Upload, Eye, Download, Zap, Rocket, TrendingUp } from "lucide-react";
import { BeforeAfterShowcase } from "@/components/BeforeAfterShowcase";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-red-900/20 overflow-hidden">
      {/* Creative Background Elements */}
      <div className="absolute inset-0">
        {/* Geometric shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-orange-400 to-red-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl rotate-45 opacity-15 animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-25"></div>
        
        {/* Floating icons */}
        <div className="absolute top-1/4 left-1/4 animate-float">
          <Upload className="w-8 h-8 text-orange-500 opacity-30" />
        </div>
        <div className="absolute top-1/3 right-1/3 animate-float" style={{ animationDelay: '1s' }}>
          <Eye className="w-10 h-10 text-amber-500 opacity-30" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-float" style={{ animationDelay: '2s' }}>
          <Download className="w-9 h-9 text-red-500 opacity-30" />
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBlNGU3IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-10"></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto">
          
          {/* Hero Content */}
          <div className="text-center mb-16 animate-fade-in">
            {/* Animated Badge */}
            <div className="inline-flex items-center mb-6">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 text-sm font-medium rounded-full animate-pulse">
                <Rocket className="w-4 h-4 mr-2" />
                AI-Powered Resume Enhancement
              </Badge>
            </div>
            
            {/* Main Headline with Creative Typography */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              <span className="block text-gray-900 dark:text-white">Transform Your</span>
              <span className="block bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                Resume in Minutes
              </span>
              <span className="block text-2xl sm:text-3xl md:text-4xl font-normal text-gray-600 dark:text-gray-300 mt-4">
                Not Hours
              </span>
            </h1>

            {/* Enhanced subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Upload your resume and get a <span className="font-bold text-orange-600 dark:text-orange-400">free professional preview</span> instantly. 
              <span className="block mt-2 text-base sm:text-lg font-medium text-red-600 dark:text-red-400">
                No email • No signup • Pay only ₹1 if you love it
              </span>
            </p>

            {/* Creative CTA Button */}
            <div className="mb-12">
              <Button 
                onClick={onGetStarted}
                className="group relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center">
                  <Zap className="w-6 h-6 mr-3 animate-pulse" />
                  <span>Start Your Transformation</span>
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-500" />
                  <span>100% Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>2 Min Process</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-red-500" />
                  <span>No Signup Required</span>
                </div>
              </div>
            </div>
          </div>

          {/* Creative Process Section */}
          <div className="mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              How It Works - <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Simple as 1, 2, 3</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Step 1 */}
              <div className="group relative">
                <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 cursor-pointer" onClick={onGetStarted}>
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <Upload className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center text-black font-bold text-sm">
                        1
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Upload Resume</h3>
                    <p className="text-gray-600 dark:text-gray-300">Drop your resume (PDF/DOCX). No signup needed.</p>
                  </CardContent>
                </Card>
              </div>

              {/* Step 2 */}
              <div className="group relative">
                <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 cursor-pointer" onClick={onGetStarted}>
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <Eye className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center text-black font-bold text-sm">
                        2
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Get Preview</h3>
                    <p className="text-gray-600 dark:text-gray-300">See your enhanced resume in 2 minutes - free.</p>
                  </CardContent>
                </Card>
              </div>

              {/* Step 3 */}
              <div className="group relative">
                <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 cursor-pointer" onClick={onGetStarted}>
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <Download className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center text-black font-bold text-sm">
                        3
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Download</h3>
                    <p className="text-gray-600 dark:text-gray-300">Love it? Pay ₹1 and download instantly.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Creative Stats Section */}
          <div className="mb-20">
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-orange-800 to-red-800 dark:from-orange-900 dark:to-red-900 border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <Badge className="bg-yellow-300 text-orange-900 px-4 py-2 text-sm font-medium rounded-full mb-4">
                    <Star className="w-4 h-4 mr-2" />
                    Join 10,000+ professionals who upgraded their resumes
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                  <div className="group">
                    <div className="flex items-center justify-center mb-4">
                      <TrendingUp className="w-8 h-8 text-yellow-300 mr-3" />
                      <div className="text-4xl md:text-5xl font-bold text-white">10,000+</div>
                    </div>
                    <div className="text-orange-200 font-medium">Resumes Enhanced</div>
                  </div>
                  
                  <div className="group">
                    <div className="flex items-center justify-center mb-4">
                      <Star className="w-8 h-8 text-yellow-300 mr-3" />
                      <div className="text-4xl md:text-5xl font-bold text-white">95%</div>
                    </div>
                    <div className="text-orange-200 font-medium">Love Results</div>
                  </div>
                  
                  <div className="group">
                    <div className="flex items-center justify-center mb-4">
                      <Clock className="w-8 h-8 text-yellow-300 mr-3" />
                      <div className="text-4xl md:text-5xl font-bold text-white">2 Min</div>
                    </div>
                    <div className="text-orange-200 font-medium">Avg Upload</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Before/After showcase */}
          <BeforeAfterShowcase onGetStarted={onGetStarted} />
        </div>
      </div>
    </div>
  );
}
