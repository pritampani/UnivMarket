import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";

/**
 * Component that shows a notification when a new version of the app is available
 * It listens for the serviceWorkerUpdate event which is dispatched when a new service worker is installed
 */
export default function UpdateNotification() {
  const [showReload, setShowReload] = useState(false);
  const { toast } = useToast();
  
  // Listen for service worker updates
  useEffect(() => {
    const handleServiceWorkerUpdate = (event: CustomEvent) => {
      if (event.detail?.hasUpdate) {
        setShowReload(true);
        showUpdateToast();
      }
    };
    
    // Add event listener
    window.addEventListener(
      'serviceWorkerUpdate', 
      handleServiceWorkerUpdate as EventListener
    );
    
    // Cleanup
    return () => {
      window.removeEventListener(
        'serviceWorkerUpdate', 
        handleServiceWorkerUpdate as EventListener
      );
    };
  }, []);
  
  // Show a toast notification with reload button
  const showUpdateToast = () => {
    toast({
      title: "Update Available",
      description: "A new version of UniMarket is available",
      action: (
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          className="bg-background hover:bg-accent"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Update Now
        </Button>
      ),
      duration: 0, // Don't auto-dismiss
    });
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    // Reload the page to activate the new service worker
    window.location.reload();
  };
  
  return null; // This component doesn't render anything directly, it just shows a toast
}