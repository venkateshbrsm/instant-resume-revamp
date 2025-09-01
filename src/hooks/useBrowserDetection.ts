import { useState, useEffect } from 'react';

interface BrowserInfo {
  isAndroid: boolean;
  isChrome: boolean;
  isAndroidChrome: boolean;
  isMobile: boolean;
  isIOS: boolean;
  isSafari: boolean;
}

export function useBrowserDetection(): BrowserInfo {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo>({
    isAndroid: false,
    isChrome: false,
    isAndroidChrome: false,
    isMobile: false,
    isIOS: false,
    isSafari: false,
  });

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    const isAndroid = /android/.test(userAgent);
    const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent);
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isMobile = window.innerWidth < 768 || /mobi|android/i.test(userAgent);
    
    setBrowserInfo({
      isAndroid,
      isChrome,
      isAndroidChrome: isAndroid && isChrome,
      isMobile,
      isIOS,
      isSafari,
    });
  }, []);

  return browserInfo;
}