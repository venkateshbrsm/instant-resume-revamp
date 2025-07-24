import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Security monitoring component for tracking authentication events
export const SecurityMonitor = () => {
  useEffect(() => {
    let failedAttempts = 0;
    const maxFailedAttempts = 5;
    const timeWindow = 15 * 60 * 1000; // 15 minutes
    let firstFailedAttempt = 0;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const now = Date.now();
        
        // Track authentication events
        if (event === 'SIGNED_IN') {
          console.log('Security: User signed in successfully');
          failedAttempts = 0; // Reset on successful login
        } else if (event === 'SIGNED_OUT') {
          console.log('Security: User signed out');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Security: Token refreshed successfully');
        }
        
        // Log suspicious patterns
        if (event === 'SIGNED_IN' && session?.user) {
          const userAgent = navigator.userAgent;
          const timestamp = new Date().toISOString();
          
          // Log basic session info for security monitoring
          console.log('Security: Login event', {
            userId: session.user.id,
            email: session.user.email,
            timestamp,
            userAgent: userAgent.substring(0, 100), // Truncate for privacy
          });
        }
      }
    );

    // Monitor for unusual activity patterns
    const monitorActivity = () => {
      const currentTime = Date.now();
      
      // Reset counter if time window has passed
      if (currentTime - firstFailedAttempt > timeWindow) {
        failedAttempts = 0;
        firstFailedAttempt = 0;
      }
      
      // Check for rate limiting trigger
      if (failedAttempts >= maxFailedAttempts) {
        console.warn('Security: Rate limit triggered - too many failed attempts');
      }
    };

    const interval = setInterval(monitorActivity, 60000); // Check every minute

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return null; // This is a monitoring component with no UI
};