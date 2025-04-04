// Service Worker for UniMarket PWA
const CACHE_VERSION = 2;
const STATIC_CACHE_NAME = `unimarket-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `unimarket-dynamic-v${CACHE_VERSION}`;
const DATA_CACHE_NAME = `unimarket-data-v${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Assets to pre-cache during installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // Main entry points that should be available offline
  '/home',
  '/product-detail',
  '/categories',
  '/my-listings',
  '/sell',
  // Offline fallback page
  OFFLINE_URL
];

// Font URLs to cache
const FONT_URLS = [
  'https://fonts.googleapis.com/css2',
  'https://fonts.gstatic.com'
];

// URLs that should use cache-first strategy
const CACHE_FIRST_URLS = [
  '/icon-',
  '/apple-touch-icon/',
  '/screenshots/',
  '.png',
  '.jpg',
  '.svg',
  '.webp',
  '.woff',
  '.woff2',
  '.ttf'
];

// URLs we don't want to cache
const CACHE_EXCLUDE_URLS = [
  'chrome-extension',
  'firebase.auth',
  'firestore.googleapis.com',
  'www.googletagmanager.com',
  'analytics',
  '__/auth'
];

// Check if a request URL should use cache-first strategy
function shouldUseCacheFirst(url) {
  return CACHE_FIRST_URLS.some(pattern => url.includes(pattern));
}

// Check if a request URL should be excluded from caching
function shouldExcludeFromCache(url) {
  return CACHE_EXCLUDE_URLS.some(pattern => url.includes(pattern));
}

// Check if a request is for API or Firebase data
function isApiOrFirebaseRequest(url) {
  return url.includes('/api/') || 
         url.includes('firebaseapp') ||
         url.includes('firebase') ||
         url.includes('imgbb') ||
         url.includes('firestore');
}

// Check if it's a navigation request
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing new version');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME)
        .then((cache) => {
          console.log('[Service Worker] Caching static assets');
          return cache.addAll(STATIC_ASSETS);
        }),
      
      // Create empty dynamic cache
      caches.open(DYNAMIC_CACHE_NAME)
        .then((cache) => {
          console.log('[Service Worker] Initializing dynamic cache');
        }),
        
      // Create empty data cache
      caches.open(DATA_CACHE_NAME)
        .then((cache) => {
          console.log('[Service Worker] Initializing data cache');
        })
    ])
    .then(() => {
      // Activate immediately
      return self.skipWaiting();
    })
    .catch(err => console.error('[Service Worker] Error during installation:', err))
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating new version');
  
  // List of caches to keep
  const currentCaches = [
    STATIC_CACHE_NAME, 
    DYNAMIC_CACHE_NAME, 
    DATA_CACHE_NAME
  ];
  
  event.waitUntil(
    // Remove old cache versions
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Keep only if it's not in our whitelist
              return cacheName.startsWith('unimarket-') && 
                     !currentCaches.includes(cacheName);
            })
            .map((cacheName) => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        // Claim any clients immediately
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Helper: Fetch and cache with different strategies
async function fetchAndCache(request, cacheName, options = {}) {
  try {
    const response = await fetch(request);
    
    // Only cache valid responses
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      
      // Store in cache
      cache.put(request, response.clone());
      
      if (options.logSuccess) {
        console.log(`[Service Worker] Successfully fetched and cached: ${request.url}`);
      }
    }
    
    return response;
  } catch (error) {
    console.error(`[Service Worker] Failed to fetch: ${request.url}`, error);
    throw error;
  }
}

// Fetch event - Using different strategies based on request type
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip cross-origin requests except for fonts
  if (!url.origin.includes(self.location.origin) && 
      !FONT_URLS.some(fontUrl => request.url.includes(fontUrl))) {
    return;
  }
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip requests that should be excluded
  if (shouldExcludeFromCache(request.url)) {
    return;
  }
  
  // API & Firebase requests - Network-first with fallback to offline data
  if (isApiOrFirebaseRequest(request.url)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone the response to store in cache and return the original
          const responseToCache = response.clone();
          
          if (response.ok) {
            // Store API responses in the DATA cache
            caches.open(DATA_CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });
          }
          
          return response;
        })
        .catch(error => {
          console.log('[Service Worker] Fallback to cached API data');
          
          // Try to get from cache first
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // If no cached data, return a JSON with offline flag
              return new Response(
                JSON.stringify({
                  error: 'You are offline',
                  offline: true,
                  timestamp: new Date().toISOString()
                }), 
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: new Headers({
                    'Content-Type': 'application/json'
                  })
                }
              );
            });
        })
    );
    return;
  }
  
  // Static assets like images - Cache-first strategy
  if (shouldUseCacheFirst(request.url)) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Cache hit - return the response from cache
            return cachedResponse;
          }
          
          // Not in cache, get from network and cache for later
          return fetchAndCache(request, DYNAMIC_CACHE_NAME);
        })
        .catch(error => {
          console.error('[Service Worker] Failed to fetch cache-first resource:', error);
          
          // For image requests, return a fallback image
          if (request.url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
            return caches.match('/icon-192x192.png');
          }
          
          // For other resources, just propagate the error
          throw error;
        })
    );
    return;
  }
  
  // HTML navigation requests - Network-first with offline fallback
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone the response to store in cache and return the original
          const responseToCache = response.clone();
          
          if (response.ok) {
            // Store navigation responses in the STATIC cache
            caches.open(STATIC_CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });
          }
          
          return response;
        })
        .catch(error => {
          console.log('[Service Worker] Fallback to cached page or offline page');
          
          // Try to get from cache first
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // If not in cache, try to return the root page
              return caches.match('/')
                .then(rootResponse => {
                  if (rootResponse) {
                    return rootResponse;
                  }
                  
                  // Last resort, return the offline page
                  return caches.match(OFFLINE_URL);
                });
            });
        })
    );
    return;
  }
  
  // All other requests - Network-first with dynamic caching
  event.respondWith(
    fetch(request)
      .then(response => {
        // Clone the response to store in cache and return the original
        const responseToCache = response.clone();
        
        if (response.ok) {
          // Store in dynamic cache
          caches.open(DYNAMIC_CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
        }
        
        return response;
      })
      .catch(error => {
        // Try to get from cache if network fails
        return caches.match(request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If not in cache and not a navigation request, throw network error
            console.error('[Service Worker] No cached version of', request.url);
            throw error;
          });
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  } else if (event.tag === 'sync-listings') {
    event.waitUntil(syncListings());
  }
});

// Sync cached messages when back online
async function syncMessages() {
  try {
    const offlineData = await getOfflineData('pendingMessages');
    
    if (offlineData && offlineData.length > 0) {
      // Process each pending message
      const syncPromises = offlineData.map(async (message) => {
        try {
          const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(message)
          });
          
          if (response.ok) {
            // Remove from offline data if successful
            return removeOfflineData('pendingMessages', message.id);
          }
        } catch (error) {
          console.error('[Service Worker] Error syncing message:', error);
        }
      });
      
      return Promise.all(syncPromises);
    }
  } catch (error) {
    console.error('[Service Worker] Error during message sync:', error);
  }
}

// Sync cached product listings when back online
async function syncListings() {
  try {
    const offlineData = await getOfflineData('pendingListings');
    
    if (offlineData && offlineData.length > 0) {
      // Process each pending listing
      const syncPromises = offlineData.map(async (listing) => {
        try {
          const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(listing)
          });
          
          if (response.ok) {
            // Remove from offline data if successful
            return removeOfflineData('pendingListings', listing.id);
          }
        } catch (error) {
          console.error('[Service Worker] Error syncing listing:', error);
        }
      });
      
      return Promise.all(syncPromises);
    }
  } catch (error) {
    console.error('[Service Worker] Error during listing sync:', error);
  }
}

// Helper to get offline data from IndexedDB
async function getOfflineData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('UniMarketOfflineDB', 1);
    
    request.onerror = event => {
      reject('Error opening offline database');
    };
    
    request.onsuccess = event => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(storeName)) {
        resolve([]);
        return;
      }
      
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || []);
      };
      
      getAllRequest.onerror = () => {
        reject('Error retrieving offline data');
      };
    };
    
    // Handle first-time setup
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('pendingMessages')) {
        db.createObjectStore('pendingMessages', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('pendingListings')) {
        db.createObjectStore('pendingListings', { keyPath: 'id' });
      }
    };
  });
}

// Helper to remove synced data from IndexedDB
async function removeOfflineData(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('UniMarketOfflineDB', 1);
    
    request.onerror = event => {
      reject('Error opening offline database');
    };
    
    request.onsuccess = event => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(storeName)) {
        resolve();
        return;
      }
      
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      deleteRequest.onerror = () => {
        reject('Error removing offline data');
      };
    };
  });
}

// Handle push notifications
self.addEventListener('push', (event) => {
  try {
    const data = event.data ? event.data.json() : {};
    
    const options = {
      body: data.body || 'New notification from UniMarket',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: data.url || '/',
      vibrate: [100, 50, 100],
      actions: [
        {
          action: 'explore',
          title: 'View',
        },
        {
          action: 'close',
          title: 'Close',
        },
      ],
      tag: data.tag || 'default', // Tag to group similar notifications
      renotify: data.renotify || false, // Whether to alert if this tag already exists
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'UniMarket', 
        options
      )
    );
  } catch (error) {
    console.error('[Service Worker] Push notification error:', error);
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  // Close the notification
  event.notification.close();
  
  // Handle different actions
  if (event.action === 'close') {
    return;
  }
  
  // Get the target URL from notification data
  const targetUrl = event.notification.data || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open to target URL
        for (const client of clientList) {
          const url = new URL(client.url);
          const targetPath = typeof targetUrl === 'string' ? targetUrl : '/';
          
          // If window path matches target path, focus that window
          if (url.pathname === targetPath && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no matching window, open a new one
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
      .catch(error => {
        console.error('[Service Worker] Error handling notification click:', error);
      })
  );
});