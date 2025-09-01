import { useState, useEffect } from 'react';

export type DeviceType = 'android' | 'ios' | 'desktop';

export const useDeviceType = (): DeviceType => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Check for Android
      if (userAgent.includes('android')) {
        setDeviceType('android');
        return;
      }
      
      // Check for iOS (iPhone, iPad, iPod)
      if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
        setDeviceType('ios');
        return;
      }
      
      // Default to desktop
      setDeviceType('desktop');
    };

    detectDevice();
  }, []);

  return deviceType;
};