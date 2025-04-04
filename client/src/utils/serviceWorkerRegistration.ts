/**
 * Service Worker Registration
 * This utility script handles the registration of the service worker
 * for Progressive Web App functionality.
 */

// Check if service workers are supported
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/service-worker.js';
      
      navigator.serviceWorker
        .register(swUrl)
        .then(registration => {
          console.log('Service Worker registered successfully:', registration.scope);
          
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }
            
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content is available; notify the user
                  console.log('New content is available. Please refresh.');
                  
                  // You can show a toast notification here
                  const event = new CustomEvent('serviceWorkerUpdate', {
                    detail: { hasUpdate: true }
                  });
                  window.dispatchEvent(event);
                } else {
                  // Content is cached for offline use
                  console.log('Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch(error => {
          console.error('Error registering service worker:', error);
        });
    });
  }
}

// Check if the app is installed or in standalone mode
export function checkAppInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
}

// Unregister the service worker (useful for development)
export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error('Error unregistering service worker:', error);
      });
  }
}