import { useEffect, useState } from 'react';

export const useWhatsAppDetection = () => {
  const [isWhatsApp, setIsWhatsApp] = useState(false);

  useEffect(() => {
    const detectWhatsApp = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const referrer = document.referrer.toLowerCase();
      
      // Check for WhatsApp user agent patterns
      const whatsAppPatterns = [
        'whatsapp',
        'wabrowser',
        'messaging',
      ];
      
      // Check for WhatsApp referrer patterns
      const whatsAppReferrerPatterns = [
        'whatsapp',
        'wa.me',
        'chat.whatsapp.com',
      ];
      
      const isWhatsAppUA = whatsAppPatterns.some(pattern => 
        userAgent.includes(pattern)
      );
      
      const isWhatsAppReferrer = whatsAppReferrerPatterns.some(pattern => 
        referrer.includes(pattern)
      );
      
      return isWhatsAppUA || isWhatsAppReferrer;
    };

    setIsWhatsApp(detectWhatsApp());
  }, []);

  return isWhatsApp;
};