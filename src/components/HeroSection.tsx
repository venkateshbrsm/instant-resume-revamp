
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, CheckCircle, Star, Clock, Shield, MessageCircle, Upload, Eye, Download, Zap, Rocket, TrendingUp, Award, Users, Target, BarChart3 } from "lucide-react";
import { BeforeAfterShowcase } from "@/components/BeforeAfterShowcase";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20 dark:from-slate-900 dark:via-orange-900/10 dark:to-amber-900/10 overflow-hidden">
      {/* Creative Background Elements */}
      <div className="absolute inset-0">
        {/* Sophisticated geometric patterns */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-orange-400/10 to-amber-400/10 rounded-2xl rotate-12 opacity-40"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full opacity-20"></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-br from-orange-300/15 to-red-300/15 rounded-xl rotate-45 opacity-30"></div>
        
        {/* Professional grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjk3MzE2IiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        
        {/* Subtle floating elements */}
        <div className="absolute top-1/4 left-1/5 animate-float opacity-20">
          <Award className="w-6 h-6 text-orange-600" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float opacity-20" style={{ animationDelay: '2s' }}>
          <Target className="w-7 h-7 text-amber-600" />
        </div>
        <div className="absolute bottom-1/3 left-1/4 animate-float opacity-20" style={{ animationDelay: '4s' }}>
          <BarChart3 className="w-6 h-6 text-orange-500" />
        </div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto">
          
          {/* Hero Content */}
          <div className="text-center mb-16 animate-fade-in">
            {/* Professional Badge */}
            <div className="inline-flex items-center mb-8">
              <Badge className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-2.5 text-sm font-semibold rounded-full border-0 shadow-lg">
                <Award className="w-4 h-4 mr-2" />
                Enterprise-Grade AI Resume Enhancement
              </Badge>
            </div>
            
            {/* Professional Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
              <span className="block text-slate-900 dark:text-white font-light">Professional</span>
              <span className="block bg-gradient-to-r from-orange-700 via-amber-600 to-orange-600 bg-clip-text text-transparent font-bold">
                Resume Enhancement
              </span>
              <span className="block text-2xl sm:text-3xl md:text-4xl font-normal text-slate-600 dark:text-slate-300 mt-4">
                Delivered in Minutes
              </span>
            </h1>

            {/* Professional subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
              Upload your resume and receive a <span className="font-semibold text-orange-700 dark:text-orange-400">comprehensive professional assessment</span> with enhanced formatting. 
              <span className="block mt-2 text-base sm:text-lg font-medium text-amber-700 dark:text-amber-400">
                Secure Process • No Registration • Pay ₹499 Only If Satisfied
              </span>
            </p>

            {/* Professional CTA Button */}
            <div className="mb-12">
              <Button 
                onClick={onGetStarted}
                className="group relative bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 border-0"
              >
                <div className="relative flex items-center">
                  <Target className="w-5 h-5 mr-3" />
                  <span>Make My Resume</span>
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>
              
              {/* Professional trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-8 mt-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-600" />
                  <span className="font-medium">Enterprise Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="font-medium">2-Minute Process</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-600" />
                  <span className="font-medium">No Registration Required</span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Process Section */}
          <div className="mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-slate-900 dark:text-white">
              Our Professional Process
            </h2>
            <p className="text-center text-lg text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-700 to-amber-700 font-semibold">Streamlined. Secure. Professional.</span>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Step 1 - Professional Upload */}
              <div className="group relative">
                <Card className="relative overflow-hidden bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-[1.02] cursor-pointer" onClick={onGetStarted}>
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Secure Upload</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">Submit your resume (PDF/DOCX) through our encrypted platform. No account creation required.</p>
                  </CardContent>
                </Card>
              </div>

              {/* Step 2 - Professional Analysis */}
              <div className="group relative">
                <Card className="relative overflow-hidden bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-[1.02] cursor-pointer" onClick={onGetStarted}>
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">AI Analysis</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">Professional AI assessment with enhanced formatting and content optimization within 2 minutes.</p>
                  </CardContent>
                </Card>
              </div>

              {/* Step 3 - Professional Delivery */}
              <div className="group relative">
                <Card className="relative overflow-hidden bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-[1.02] cursor-pointer" onClick={onGetStarted}>
                  <CardContent className="p-8 text-center">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <Download className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Instant Download</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">Satisfied with results? Complete payment (₹499) and download your professional resume immediately.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Professional Statistics Section */}
          <div className="mb-20">
            <Card className="max-w-5xl mx-auto bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2.5 text-sm font-semibold rounded-full mb-4 border-0">
                    <Users className="w-4 h-4 mr-2" />
                    Trusted by 10,000+ Professionals Worldwide
                  </Badge>
                  <p className="text-slate-300 text-lg font-light">Delivering excellence in professional resume enhancement</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                  <div className="group">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mr-4">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-4xl md:text-5xl font-bold text-white">10,000+</div>
                    </div>
                    <div className="text-slate-300 font-medium">Resumes Enhanced</div>
                    <div className="text-orange-400 text-sm mt-1">Globally Trusted</div>
                  </div>
                  
                  <div className="group">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-4xl md:text-5xl font-bold text-white">95%</div>
                    </div>
                    <div className="text-slate-300 font-medium">Satisfaction Rate</div>
                    <div className="text-amber-400 text-sm mt-1">Client Approved</div>
                  </div>
                  
                  <div className="group">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl flex items-center justify-center mr-4">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-4xl md:text-5xl font-bold text-white">2 Min</div>
                    </div>
                    <div className="text-slate-300 font-medium">Average Processing</div>
                    <div className="text-orange-400 text-sm mt-1">Lightning Fast</div>
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
