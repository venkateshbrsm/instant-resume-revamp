import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useRouteTracking } from "@/hooks/useRouteTracking";
import { useWhatsAppDetection } from "@/hooks/useWhatsAppDetection";
import { SecurityMonitor } from "./components/SecurityMonitor";
import { MobileWarning } from "./components/MobileWarning";
import { useEffect, Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

// Lazy load components to reduce initial bundle size
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentFailure = lazy(() => import("./pages/PaymentFailure"));
const Auth = lazy(() => import("./pages/Auth"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const ContactUs = lazy(() => import("./pages/ContactUs"));

const queryClient = new QueryClient();

const RouteTracker = () => {
  useRouteTracking();
  return null;
};

const WhatsAppBadgeHider = () => {
  const isWhatsApp = useWhatsAppDetection();
  
  useEffect(() => {
    if (isWhatsApp) {
      const style = document.createElement('style');
      style.id = 'whatsapp-badge-hider';
      style.textContent = `
        [data-lovable-badge],
        .lovable-badge,
        iframe[src*="lovable"],
        div[class*="lovable"],
        a[href*="lovable.dev/edit"],
        a[href*="lovable"] {
          display: none !important;
          visibility: hidden !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        const existingStyle = document.getElementById('whatsapp-badge-hider');
        if (existingStyle) {
          document.head.removeChild(existingStyle);
        }
      };
    }
  }, [isWhatsApp]);

  return null;
};

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  useEffect(() => {
    console.log('App component mounted successfully');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouteTracker />
          <WhatsAppBadgeHider />
          <SecurityMonitor />
          <MobileWarning />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-failure" element={<PaymentFailure />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/contact" element={<ContactUs />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          
          {/* Global WhatsApp Floating Action Button - Mobile Optimized */}
          <a
            href="https://wa.me/919945514909?text=Hi!%20I'm%20interested%20in%20your%20resume%20makeover%20service."
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 group animate-bounce hover:animate-none"
            aria-label="Contact us on WhatsApp"
          >
            <Button
              variant="success"
              className="px-3 py-2 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 bg-green-500 hover:bg-green-600 text-white border-2 border-green-400 flex items-center gap-1 sm:gap-2 text-sm sm:text-base min-h-[44px] min-w-[44px]"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-semibold hidden sm:inline">WhatsApp Now</span>
              <span className="font-semibold sm:hidden">Chat</span>
            </Button>
            <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-xs sm:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none hidden sm:block">
              Chat with us on WhatsApp
              <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </a>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
