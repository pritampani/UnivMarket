import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { checkAppInstalled } from '@/utils/serviceWorkerRegistration';

/**
 * Component that shows a prompt to install the app as a PWA
 * This is shown when the app is installable but not yet installed
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  // Check if PWA is already installed
  const isAlreadyInstalled = checkAppInstalled();
  
  // Only show the prompt if not already installed
  const shouldShowPrompt = deferredPrompt && !isAlreadyInstalled;
  
  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to show install button
      setIsOpen(true);
    };
    
    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      // Clear the deferredPrompt
      setDeferredPrompt(null);
      // Hide the install button
      setIsOpen(false);
      // Log the installation to analytics
      console.log('PWA installed successfully');
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);
  
  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    
    // Show the PWA install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
      } else {
        console.log('User dismissed the PWA install prompt');
      }
      
      // Clear the deferredPrompt
      setDeferredPrompt(null);
      // Hide the install button
      setIsOpen(false);
    });
  };
  
  const handleCloseClick = () => {
    setIsOpen(false);
  };
  
  if (!shouldShowPrompt || !isOpen) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <Card className="border-primary shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Install UniMarket</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCloseClick} 
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Get the best experience by installing our app</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm">Install the UniMarket app on your device for faster access and offline capabilities.</p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleInstallClick}
          >
            <Download className="mr-2 h-4 w-4" />
            Install App
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}