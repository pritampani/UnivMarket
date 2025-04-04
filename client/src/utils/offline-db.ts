/**
 * Utility functions for working with IndexedDB for offline storage
 */

const DB_NAME = 'UniMarketOfflineDB';
const DB_VERSION = 1;

// Store names
export const STORES = {
  PENDING_MESSAGES: 'pendingMessages',
  PENDING_LISTINGS: 'pendingListings',
  CACHED_PRODUCTS: 'cachedProducts',
  CACHED_CATEGORIES: 'cachedCategories',
  USER_PREFERENCES: 'userPreferences',
};

// Open a connection to the database
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      reject(new Error('Failed to open offline database'));
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBRequest).result;
      resolve(db);
    };
    
    // Create the object stores on first load or version upgrade
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBRequest).result;
      
      // Create object stores with indexes if they don't exist
      if (!db.objectStoreNames.contains(STORES.PENDING_MESSAGES)) {
        const messageStore = db.createObjectStore(STORES.PENDING_MESSAGES, { keyPath: 'id' });
        messageStore.createIndex('receiverId', 'receiverId', { unique: false });
        messageStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.PENDING_LISTINGS)) {
        const listingStore = db.createObjectStore(STORES.PENDING_LISTINGS, { keyPath: 'id' });
        listingStore.createIndex('categoryId', 'categoryId', { unique: false });
        listingStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.CACHED_PRODUCTS)) {
        const productStore = db.createObjectStore(STORES.CACHED_PRODUCTS, { keyPath: 'id' });
        productStore.createIndex('categoryId', 'categoryId', { unique: false });
        productStore.createIndex('isFeatured', 'isFeatured', { unique: false });
        productStore.createIndex('isSold', 'isSold', { unique: false });
        productStore.createIndex('userId', 'userId', { unique: false });
        productStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.CACHED_CATEGORIES)) {
        db.createObjectStore(STORES.CACHED_CATEGORIES, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.USER_PREFERENCES)) {
        db.createObjectStore(STORES.USER_PREFERENCES, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Add an item to a store
 * @param storeName The name of the store
 * @param item The item to add
 * @returns Promise that resolves when the item is added
 */
export async function addToStore<T extends { id: string }>(
  storeName: string, 
  item: T
): Promise<void> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.add(item);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to add item to ${storeName}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB error:', error);
    throw error;
  }
}

/**
 * Get all items from a store
 * @param storeName The name of the store
 * @returns Promise that resolves with an array of items
 */
export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to get items from ${storeName}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB error:', error);
    return [];
  }
}

/**
 * Get an item from a store by ID
 * @param storeName The name of the store
 * @param id The ID of the item
 * @returns Promise that resolves with the item or null if not found
 */
export async function getFromStore<T>(
  storeName: string, 
  id: string
): Promise<T | null> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to get item from ${storeName}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB error:', error);
    return null;
  }
}

/**
 * Update an item in a store
 * @param storeName The name of the store
 * @param item The item with updated values
 * @returns Promise that resolves when the item is updated
 */
export async function updateInStore<T extends { id: string }>(
  storeName: string, 
  item: T
): Promise<void> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.put(item);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to update item in ${storeName}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB error:', error);
    throw error;
  }
}

/**
 * Remove an item from a store
 * @param storeName The name of the store
 * @param id The ID of the item to remove
 * @returns Promise that resolves when the item is removed
 */
export async function removeFromStore(
  storeName: string, 
  id: string
): Promise<void> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to remove item from ${storeName}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB error:', error);
    throw error;
  }
}

/**
 * Clear all items from a store
 * @param storeName The name of the store to clear
 * @returns Promise that resolves when the store is cleared
 */
export async function clearStore(storeName: string): Promise<void> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to clear store ${storeName}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB error:', error);
    throw error;
  }
}

/**
 * Query items from a store using an index
 * @param storeName The name of the store
 * @param indexName The name of the index to query
 * @param value The value to match
 * @returns Promise that resolves with an array of matching items
 */
export async function queryByIndex<T>(
  storeName: string,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  try {
    const db = await openDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      
      const request = index.getAll(value);
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to query items by index ${indexName}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('IndexedDB error:', error);
    return [];
  }
}

/**
 * Save user preferences to IndexedDB
 * @param preferences The user preferences to save
 * @returns Promise that resolves when preferences are saved
 */
export async function saveUserPreferences(preferences: Record<string, any>): Promise<void> {
  return updateInStore(STORES.USER_PREFERENCES, {
    id: 'userPreferences',
    ...preferences,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Get user preferences from IndexedDB
 * @returns Promise that resolves with user preferences or null if not found
 */
export async function getUserPreferences(): Promise<Record<string, any> | null> {
  return getFromStore(STORES.USER_PREFERENCES, 'userPreferences');
}

/**
 * Cache products for offline use
 * @param products Array of products to cache
 * @returns Promise that resolves when products are cached
 */
export async function cacheProducts(products: any[]): Promise<void> {
  try {
    // Clear existing cache first to avoid duplicates
    await clearStore(STORES.CACHED_PRODUCTS);
    
    // Add each product to the store
    const promises = products.map(product => 
      updateInStore(STORES.CACHED_PRODUCTS, {
        ...product,
        cachedAt: new Date().toISOString()
      })
    );
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Failed to cache products:', error);
    throw error;
  }
}

/**
 * Cache categories for offline use
 * @param categories Array of categories to cache
 * @returns Promise that resolves when categories are cached
 */
export async function cacheCategories(categories: any[]): Promise<void> {
  try {
    // Clear existing cache first
    await clearStore(STORES.CACHED_CATEGORIES);
    
    // Add each category to the store
    const promises = categories.map(category => 
      updateInStore(STORES.CACHED_CATEGORIES, {
        ...category,
        cachedAt: new Date().toISOString()
      })
    );
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Failed to cache categories:', error);
    throw error;
  }
}

/**
 * Save a message for offline syncing
 * @param message The message to save
 * @returns Promise that resolves when the message is saved
 */
export async function savePendingMessage(message: any): Promise<void> {
  return addToStore(STORES.PENDING_MESSAGES, {
    ...message,
    id: message.id || `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    pendingSince: new Date().toISOString(),
    attempts: 0
  });
}

/**
 * Save a product listing for offline syncing
 * @param listing The product listing to save
 * @returns Promise that resolves when the listing is saved
 */
export async function savePendingListing(listing: any): Promise<void> {
  return addToStore(STORES.PENDING_LISTINGS, {
    ...listing,
    id: listing.id || `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    pendingSince: new Date().toISOString(),
    attempts: 0
  });
}

/**
 * Register a background sync for pending messages and listings
 * @returns Promise that resolves when sync is registered
 */
export async function registerBackgroundSync(): Promise<void> {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Register sync for messages
      await registration.sync.register('sync-messages');
      
      // Register sync for listings
      await registration.sync.register('sync-listings');
      
      console.log('Background sync registered');
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }
}