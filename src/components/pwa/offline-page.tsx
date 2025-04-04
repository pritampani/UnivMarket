import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Component that shows when the user is offline
 * This component can be used with a network listener to detect offline status
 */
export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  useEffect(() => {
    // Handle online status
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };
    
    // Add event listeners for online/offline status
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);
  
  // If online, don't show the offline page
  if (isOnline) {
    return null;
  }
  
  const handleRefresh = () => {
    // Try to reload the page
    window.location.reload();
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50 p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="rounded-full bg-muted p-6 mx-auto w-24 h-24 flex items-center justify-center">
          <WifiOff className="h-12 w-12 text-muted-foreground" />
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight">You're Offline</h2>
        
        <p className="text-muted-foreground">
          It looks like you've lost your internet connection. 
          Some features may be limited until you're back online.
        </p>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            UniMarket will automatically reconnect when you're back online.
          </p>
          
          <Button 
            onClick={handleRefresh} 
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        </div>
      </div>
    </div>
  );
}