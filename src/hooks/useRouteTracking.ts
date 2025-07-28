import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    clarity: (action: string, ...args: any[]) => void;
    lintrk: (action: string, data?: any) => void;
    fbq: (action: string, ...args: any[]) => void;
  }
}

export const useRouteTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view in Microsoft Clarity
    if (typeof window.clarity === 'function') {
      window.clarity('set', 'page_path', location.pathname + location.search);
      window.clarity('set', 'page_title', document.title);
    }

    // Track page view in LinkedIn Analytics
    if (typeof window.lintrk === 'function') {
      window.lintrk('track', { conversion_id: 'pageview' });
    }

    // Track page view in Facebook Pixel
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }

    // Update document title based on route for better tracking
    const routeTitles: Record<string, string> = {
      '/': 'AI Resume Makeover - Transform Your Resume with AI',
      '/auth': 'Sign In - AI Resume Makeover',
      '/payment-success': 'Payment Successful - AI Resume Makeover',
      '/payment-failure': 'Payment Failed - AI Resume Makeover',
      '/terms': 'Terms & Conditions - AI Resume Makeover',
      '/refund': 'Refund Policy - AI Resume Makeover',
      '/about': 'About Us - AI Resume Makeover',
      '/privacy': 'Privacy Policy - AI Resume Makeover',
      '/contact': 'Contact Us - AI Resume Makeover',
    };

    const newTitle = routeTitles[location.pathname] || 'AI Resume Makeover';
    if (document.title !== newTitle) {
      document.title = newTitle;
    }

    // Debug logging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('Route tracked:', {
        path: location.pathname,
        search: location.search,
        title: document.title,
        clarityAvailable: typeof window.clarity === 'function',
        linkedinAvailable: typeof window.lintrk === 'function',
        facebookPixelAvailable: typeof window.fbq === 'function'
      });
    }
  }, [location]);
};