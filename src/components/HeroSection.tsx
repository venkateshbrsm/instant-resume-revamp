
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Clock, Shield, Upload, Eye, Download, Users, Target } from "lucide-react";
import { BeforeAfterShowcase } from "@/components/BeforeAfterShowcase";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 sm:pt-0">
      <div className="w-full max-w-4xl mx-auto text-center">
        
        {/* Clean, focused headline - fully responsive */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
          <span className="text-slate-900 dark:text-white">5x your interview chances</span>
          <br className="hidden sm:block" />
          <span className="text-slate-900 dark:text-white">with </span>
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent underline decoration-emerald-500 decoration-2 sm:decoration-4 underline-offset-2 sm:underline-offset-4">
            AI Enhanced personalized
          </span>
          <br className="hidden sm:block" />
          <span className="text-slate-900 dark:text-white">Resumes</span>
        </h1>

        {/* Clean value proposition - mobile optimized */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
          Our intelligent system understands what recruiters seek in applicants. Receive your personalized AI enhanced resume.
        </p>

        {/* Primary CTA - mobile-first design */}
        <div className="mb-6 sm:mb-8 px-4">
          <Button 
            onClick={onGetStarted}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border-0 w-full sm:w-auto min-h-[44px]"
          >
            Make my resume
          </Button>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">
            Takes only 3 steps
          </p>
        </div>

        {/* Trust indicator - mobile optimized */}
        <div className="flex items-center justify-center mb-8 sm:mb-12">
          <div className="flex items-center flex-col sm:flex-row gap-2 sm:gap-0">
            <div className="flex -space-x-1 mr-0 sm:mr-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 sm:w-5 h-4 sm:h-5 text-amber-400 fill-current" />
              ))}
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Trusted by</div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">10K+</div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Professionals</div>
            </div>
          </div>
        </div>

        {/* Clean testimonial section - fully responsive */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-16 mx-2 sm:mx-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 text-slate-900 dark:text-white">
            Genuine People. Proven Results. Honest Reviews.
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 text-sm sm:text-base px-2">
            What Indian professionals share after using our resume enhancement service
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-slate-700 rounded-xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm sm:text-base">R</span>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Rajesh K.</div>
                  <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">Software Engineer, Bangalore</div>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                "Got 3 interview calls within a week of uploading my enhanced resume. The AI really understood what tech companies look for."
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-700 rounded-xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm sm:text-base">P</span>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Priya S.</div>
                  <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">Marketing Manager, Mumbai</div>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                "The formatting was perfect and content suggestions were spot-on. Worth every rupee of the ₹299!"
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-700 rounded-xl p-4 sm:p-6 shadow-lg sm:col-span-2 lg:col-span-1">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm sm:text-base">A</span>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Amit P.</div>
                  <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">Data Analyst, Delhi</div>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                "Super fast processing and the results were impressive. No registration hassle, just upload and get results."
              </p>
            </div>
          </div>
        </div>

        {/* Before/After showcase */}
        <BeforeAfterShowcase onGetStarted={onGetStarted} />
      </div>
    </div>
  );
}
