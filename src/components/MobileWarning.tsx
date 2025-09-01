import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Monitor, X } from "lucide-react";
import { useState } from "react";

export const MobileWarning = () => {
  const isMobile = useIsMobile();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isMobile || isDismissed) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-40 animate-fade-in">
      <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200 relative">
        <Monitor className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between gap-2 text-sm pr-6">
          <span>
            📱 Mobile-optimized experience! Swipe and tap to navigate.
          </span>
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute right-2 top-2 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </AlertDescription>
      </Alert>
    </div>
  );
};