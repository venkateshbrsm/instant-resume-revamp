
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
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto text-center">
        
        {/* Clean, focused headline inspired by OutSpark */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="text-slate-900 dark:text-white">5x your interview chances</span>
          <br />
          <span className="text-slate-900 dark:text-white">with </span>
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent underline decoration-emerald-500 decoration-4 underline-offset-4">
            AI Enhanced personalized
          </span>
          <br />
          <span className="text-slate-900 dark:text-white">Resumes</span>
        </h1>

        {/* Clean value proposition */}
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Our intelligent system understands what recruiters seek in applicants. Receive your personalized AI enhanced resume.
        </p>

        {/* Primary CTA - Clean and prominent */}
        <div className="mb-8">
          <Button 
            onClick={onGetStarted}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border-0"
          >
            Make my resume
          </Button>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">
            Takes only 3 steps
          </p>
        </div>

        {/* Trust indicator with Indian users focus */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center">
            <div className="flex -space-x-1 mr-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
              ))}
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Trusted by</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">10K+</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Professionals</div>
            </div>
          </div>
        </div>

        {/* Clean testimonial section inspired by OutSpark */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-slate-900 dark:text-white">
            Genuine People. Proven Results. Honest Reviews.
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-300 mb-8">
            What Indian professionals share after using our resume enhancement service
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">R</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Rajesh K.</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Software Engineer, Bangalore</div>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                "Got 3 interview calls within a week of uploading my enhanced resume. The AI really understood what tech companies look for."
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">P</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Priya S.</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Marketing Manager, Mumbai</div>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                "The formatting was perfect and content suggestions were spot-on. Worth every rupee of the ₹499!"
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">A</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">Amit P.</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Data Analyst, Delhi</div>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
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
