import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useRouteTracking } from "@/hooks/useRouteTracking";
import { SecurityMonitor } from "./components/SecurityMonitor";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import Auth from "./pages/Auth";
import TermsAndConditions from "./pages/TermsAndConditions";
import RefundPolicy from "./pages/RefundPolicy";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ContactUs from "./pages/ContactUs";

const queryClient = new QueryClient();

const RouteTracker = () => {
  useRouteTracking();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteTracker />
        <SecurityMonitor />
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
        
        {/* Global WhatsApp Floating Action Button */}
        <a
          href="https://wa.me/919945514909?text=Hi!%20I'm%20interested%20in%20your%20resume%20makeover%20service."
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 group animate-bounce hover:animate-none"
          aria-label="Contact us on WhatsApp"
        >
          <Button
            variant="success"
            size="icon"
            className="w-16 h-16 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 bg-green-500 hover:bg-green-600 text-white border-2 border-green-400"
          >
            <MessageCircle className="w-8 h-8" />
          </Button>
          <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            Chat with us on WhatsApp
            <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </a>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
