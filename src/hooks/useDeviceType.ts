import { useState, useEffect } from 'react';

export type DeviceType = 'desktop' | 'android' | 'ios' | 'mobile';

export const useDeviceType = (): DeviceType => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Android detection
      if (userAgent.includes('android')) {
        return 'android';
      }
      
      // iOS detection (iPhone, iPad, iPod)
      if (/iphone|ipad|ipod/.test(userAgent)) {
        return 'ios';
      }
      
      // General mobile detection for other devices
      if (isTouchDevice && window.innerWidth < 768) {
        return 'mobile';
      }
      
      return 'desktop';
    };

    setDeviceType(detectDevice());

    // Listen for orientation changes on mobile devices
    const handleResize = () => {
      setDeviceType(detectDevice());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceType;
};