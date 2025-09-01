import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Monitor, Smartphone } from "lucide-react";

export const MobileWarning = () => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-b">
      <Alert className="max-w-4xl mx-auto border-orange-200 bg-orange-50 text-orange-800">
        <Monitor className="h-4 w-4" />
        <AlertDescription className="flex items-center gap-2 text-sm">
          <Smartphone className="h-4 w-4 flex-shrink-0" />
          <span>
            This site is optimized for laptop/computer screens. For the best experience, please visit on a desktop or laptop device.
          </span>
        </AlertDescription>
      </Alert>
    </div>
  );
};