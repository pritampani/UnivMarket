import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signOut, 
  updateProfile, 
  User,
  UserCredential
} from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, query, where, orderBy, limit, startAfter, Timestamp, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async () => {
  try {
    // First try sign in with popup
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return handleGoogleAuthResult(result);
    } catch (popupError: any) {
      console.warn("Popup sign-in failed, trying redirect method:", popupError);
      
      // If popup fails (common on mobile or with popup blockers), try redirect
      if (popupError.code === 'auth/popup-blocked' || 
          popupError.code === 'auth/popup-closed-by-user' || 
          popupError.code === 'auth/cancelled-popup-request') {
        
        // Store the current URL in session storage to redirect back after auth
        sessionStorage.setItem('authRedirectUrl', window.location.href);
        
        // Use redirect method as fallback
        await signInWithRedirect(auth, googleProvider);
        return null; // This will never be reached as page will redirect
      } else {
        throw popupError; // Some other error occurred
      }
    }
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Handle the redirect result when the page loads after a redirect
export const handleGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      // User completed the sign in with redirect
      return handleGoogleAuthResult(result);
    }
    return null; // No redirect result
  } catch (error) {
    console.error("Error handling Google redirect result:", error);
    throw error;
  }
};

// Common function to handle auth result from both popup and redirect
const handleGoogleAuthResult = async (result: UserCredential) => {
  const user = result.user;
  
  // Check if user exists in Firestore
  const userDoc = await getDoc(doc(db, "users", user.uid));
  
  // If user doesn't exist in Firestore, create a new document
  if (!userDoc.exists()) {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      university: "",
      yearLevel: "",
      isAnonymousSeller: false,
      phoneNumber: user.phoneNumber || "",
      whatsappNumber: "",
      createdAt: serverTimestamp(),
    });
  }
  
  return user;
};

export const registerWithEmail = async (
  email: string, 
  password: string, 
  displayName: string,
  university?: string,
  yearLevel?: string,
  phoneNumber?: string,
  whatsappNumber?: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // Save user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      photoURL: user.photoURL || "",
      university: university || "",
      yearLevel: yearLevel || "",
      isAnonymousSeller: false,
      phoneNumber: phoneNumber || "",
      whatsappNumber: whatsappNumber || "",
      createdAt: serverTimestamp(),
    });
    
    return user;
  } catch (error) {
    console.error("Error registering with email:", error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in with email:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const updateUserProfile = async (
  user: User,
  data: {
    displayName?: string;
    photoURL?: string;
    university?: string;
    yearLevel?: string;
    isAnonymousSeller?: boolean;
    phoneNumber?: string;
    whatsappNumber?: string;
  }
) => {
  try {
    const updates: any = {};
    
    // Update displayName and photoURL in auth
    if (data.displayName || data.photoURL) {
      await updateProfile(user, {
        displayName: data.displayName,
        photoURL: data.photoURL,
      });
      
      if (data.displayName) updates.displayName = data.displayName;
      if (data.photoURL) updates.photoURL = data.photoURL;
    }
    
    // Update other fields in Firestore
    if (data.university) updates.university = data.university;
    if (data.yearLevel) updates.yearLevel = data.yearLevel;
    if (data.isAnonymousSeller !== undefined) updates.isAnonymousSeller = data.isAnonymousSeller;
    if (data.phoneNumber) updates.phoneNumber = data.phoneNumber;
    if (data.whatsappNumber) updates.whatsappNumber = data.whatsappNumber;
    
    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, "users", user.uid), updates);
    }
    
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Import image upload utilities
import { uploadImageToImgBB, uploadMultipleImagesToImgBB } from "@/utils/imgbb-utils";

// File upload functions
export const uploadProductImage = async (file: File, userId: string) => {
  try {
    // Upload to ImgBB instead of Firebase Storage
    const imageUrl = await uploadImageToImgBB(file);
    return imageUrl;
  } catch (error) {
    console.error("Error uploading product image:", error);
    throw error;
  }
};

export const uploadMultipleProductImages = async (files: File[], userId: string) => {
  try {
    // Limit to maximum 5 images
    const filesToUpload = files.slice(0, 5);
    
    // Upload multiple images to ImgBB
    const imageUrls = await uploadMultipleImagesToImgBB(filesToUpload);
    
    // Log successful upload
    console.log(`Successfully uploaded ${imageUrls.length} images`);
    
    return imageUrls;
  } catch (error) {
    console.error("Error uploading multiple product images:", error);
    throw error;
  }
};

export const uploadProfileImage = async (file: File, userId: string) => {
  try {
    // Upload to ImgBB instead of Firebase Storage
    const imageUrl = await uploadImageToImgBB(file);
    return imageUrl;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
};

// Product functions
export const addProduct = async (
  product: {
    title: string;
    description: string;
    price: number;
    condition: string;
    images: string[];
    location?: string;
    isBidding?: boolean;
    categoryId: string;
  },
  userId: string
) => {
  try {
    const newProduct = {
      ...product,
      userId,
      isSold: false,
      isFeatured: false,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, "products"), newProduct);
    return { id: docRef.id, ...newProduct };
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const getProducts = async (
  options: {
    categoryId?: string;
    limit?: number;
    lastVisible?: any;
    isSold?: boolean;
    userId?: string;
    isFeatured?: boolean;
    searchQuery?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string[];
    yearLevel?: string;
    university?: string;
    sortBy?: "newest" | "price_asc" | "price_desc";
    onlyAvailable?: boolean;
  } = {}
) => {
  try {
    const { 
      categoryId, 
      limit: queryLimit = 10, 
      lastVisible, 
      isSold, 
      userId, 
      isFeatured,
      searchQuery,
      minPrice,
      maxPrice,
      condition,
      yearLevel,
      university,
      sortBy = "newest",
      onlyAvailable = false
    } = options;
    
    let productQuery: any = collection(db, "products");
    let constraints = [];
    let useClientSideFiltering = false;
    let useClientSideSorting = sortBy !== "newest";
    
    // Advanced search filters force client-side processing
    if (searchQuery || minPrice !== undefined || maxPrice !== undefined || 
        (condition && condition.length > 0) || yearLevel || university || 
        onlyAvailable || useClientSideSorting) {
      useClientSideFiltering = true;
    }
    
    // Try to use a simpler query approach to avoid common Firestore index issues
    try {
      // Build query gradually starting with the simpler parts
      if (categoryId) constraints.push(where("categoryId", "==", categoryId));
      if (userId) constraints.push(where("userId", "==", userId));
      
      // These combinations often require indexes
      if (isSold !== undefined) {
        constraints.push(where("isSold", "==", isSold));
        
        // If we have both isSold and isFeatured, we might need a special index
        if (isFeatured) {
          useClientSideFiltering = true; // Will filter isFeatured client-side
        } else {
          constraints.push(orderBy("createdAt", "desc"));
        }
      } else if (isFeatured) {
        // Featured without isSold is also an index issue sometimes
        useClientSideFiltering = true; // Filter for featured client-side
        constraints.push(orderBy("createdAt", "desc"));
      } else {
        // Simple ordering by createdAt without any filtering that needs indexes
        constraints.push(orderBy("createdAt", "desc"));
      }
      
      // Always add limit, but increase it if we're doing client-side filtering
      const actualLimit = useClientSideFiltering ? queryLimit * 10 : queryLimit;
      constraints.push(limit(actualLimit));
      
      if (lastVisible) {
        constraints.push(startAfter(lastVisible));
      }
      
      productQuery = query(productQuery, ...constraints);
      
      // Execute query
      const querySnapshot = await getDocs(productQuery);
      
      const products: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
          // Safely handle createdAt timestamp
          let createdAt = new Date();
          if (data.createdAt && typeof data.createdAt === 'object' && 'toDate' in data.createdAt && 
              typeof data.createdAt.toDate === 'function') {
            createdAt = data.createdAt.toDate();
          }
          
          // Apply all client-side filters as needed
          if (useClientSideFiltering) {
            // Basic filters
            if (isFeatured && data.isFeatured !== true) {
              return; // Skip non-featured products
            }
            if (isSold !== undefined && data.isSold !== isSold) {
              return; // Skip products with incorrect sold status
            }
            
            // Advanced search filters
            if (searchQuery && searchQuery.trim() !== "") {
              const query = searchQuery.toLowerCase();
              const title = (data.title || "").toLowerCase();
              const description = (data.description || "").toLowerCase();
              const sellerName = (data.sellerName || "").toLowerCase();
              
              if (!title.includes(query) && !description.includes(query) && !sellerName.includes(query)) {
                return; // Skip if search query doesn't match
              }
            }
            
            // Price range filter
            if (minPrice !== undefined && (data.price < minPrice * 100)) {
              return; // Skip if price is less than minPrice
            }
            if (maxPrice !== undefined && (data.price > maxPrice * 100)) {
              return; // Skip if price is more than maxPrice
            }
            
            // Condition filter
            if (condition && condition.length > 0) {
              if (!condition.includes(data.condition)) {
                return; // Skip if condition doesn't match
              }
            }
            
            // Year level filter
            if (yearLevel && data.sellerYearLevel !== yearLevel) {
              return; // Skip if year level doesn't match
            }
            
            // University filter
            if (university && university.trim() !== "") {
              const uni = (data.sellerUniversity || "").toLowerCase();
              if (!uni.includes(university.toLowerCase())) {
                return; // Skip if university doesn't match
              }
            }
            
            // Only available filter
            if (onlyAvailable && data.quantity <= 0) {
              return; // Skip if quantity is 0 or less
            }
          }
            
          products.push({
            id: doc.id,
            ...data as Record<string, any>,
            createdAt
          });
        }
      });
      
      // Apply sorting if needed
      if (useClientSideSorting) {
        switch (sortBy) {
          case "price_asc":
            products.sort((a, b) => a.price - b.price);
            break;
          case "price_desc":
            products.sort((a, b) => b.price - a.price);
            break;
          default:
            // "newest" - sorts by createdAt descending, already done by Firestore query
            break;
        }
      }
      
      // If we're doing client-side filtering, limit the results to the requested number
      if ((useClientSideFiltering || useClientSideSorting) && products.length > queryLimit) {
        products.splice(queryLimit);
      }
      
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      return { products, lastVisible: lastDoc };
    } catch (indexError) {
      // If we hit an index error, fall back to a very simple query and do all filtering client-side
      console.warn("Index error in Firestore query, falling back to client-side filtering:", indexError);
      
      // Most basic query - just get products ordered by creation date
      productQuery = query(
        collection(db, "products"),
        orderBy("createdAt", "desc"),
        limit(100) // Get more to filter from
      );
      
      if (lastVisible) {
        productQuery = query(productQuery, startAfter(lastVisible));
      }
      
      // Execute the simplified query
      const querySnapshot = await getDocs(productQuery);
      
      // Do all filtering client-side
      const products: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
          // Safely handle createdAt timestamp
          let createdAt = new Date();
          if (data.createdAt && typeof data.createdAt === 'object' && 'toDate' in data.createdAt && 
              typeof data.createdAt.toDate === 'function') {
            createdAt = data.createdAt.toDate();
          }
          
          // Apply all filters client-side
          // Basic filters
          if (categoryId && data.categoryId !== categoryId) return;
          if (userId && data.userId !== userId) return;
          if (isSold !== undefined && data.isSold !== isSold) return;
          if (isFeatured && data.isFeatured !== true) return;
          
          // Advanced search filters
          if (searchQuery && searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            const title = (data.title || "").toLowerCase();
            const description = (data.description || "").toLowerCase();
            const sellerName = (data.sellerName || "").toLowerCase();
            
            if (!title.includes(query) && !description.includes(query) && !sellerName.includes(query)) {
              return; // Skip if search query doesn't match
            }
          }
          
          // Price range filter
          if (minPrice !== undefined && (data.price < minPrice * 100)) {
            return; // Skip if price is less than minPrice
          }
          if (maxPrice !== undefined && (data.price > maxPrice * 100)) {
            return; // Skip if price is more than maxPrice
          }
          
          // Condition filter
          if (condition && condition.length > 0) {
            if (!condition.includes(data.condition)) {
              return; // Skip if condition doesn't match
            }
          }
          
          // Year level filter
          if (yearLevel && data.sellerYearLevel !== yearLevel) {
            return; // Skip if year level doesn't match
          }
          
          // University filter
          if (university && university.trim() !== "") {
            const uni = (data.sellerUniversity || "").toLowerCase();
            if (!uni.includes(university.toLowerCase())) {
              return; // Skip if university doesn't match
            }
          }
          
          // Only available filter
          if (onlyAvailable && data.quantity <= 0) {
            return; // Skip if quantity is 0 or less
          }
          
          products.push({
            id: doc.id,
            ...data as Record<string, any>,
            createdAt
          });
        }
      });
      
      // Apply sorting
      switch (sortBy) {
        case "price_asc":
          products.sort((a, b) => a.price - b.price);
          break;
        case "price_desc":
          products.sort((a, b) => b.price - a.price);
          break;
        default:
          // Default is newest first, already sorted by Firestore
          break;
      }
      
      // Limit the results
      if (products.length > queryLimit) {
        products.splice(queryLimit);
      }
      
      // In this fallback approach, we don't support pagination correctly
      // so we need to inform the caller by not returning a lastVisible
      return { products, lastVisible: null };
    }
    
  } catch (error) {
    console.error("Error getting products:", error);
    // Return an empty array instead of throwing error
    return { products: [], lastVisible: null };
  }
};

export const getProductById = async (productId: string) => {
  try {
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const productData = docSnap.data();
      // Safely handle createdAt timestamp
      let createdAt = new Date();
      if (productData.createdAt && typeof productData.createdAt === 'object' 
          && 'toDate' in productData.createdAt 
          && typeof productData.createdAt.toDate === 'function') {
        createdAt = productData.createdAt.toDate();
      }
      
      // Ensure userId is preserved in the returned object
      const userId = productData.userId || null;
      
      // Also fetch seller details if available
      let sellerDetails = null;
      if (userId) {
        try {
          const userDocRef = doc(db, "users", userId);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            sellerDetails = {
              displayName: userData.displayName || 'Anonymous',
              university: userData.university || '',
              phoneNumber: userData.phoneNumber || '',
              whatsappNumber: userData.whatsappNumber || '',
              isAnonymousSeller: userData.isAnonymousSeller || false,
              yearLevel: userData.yearLevel || '',
              photoURL: userData.photoURL || null,
            };
          }
        } catch (userFetchError) {
          console.warn("Could not fetch seller details:", userFetchError);
          // Continue with the product details even if seller info is missing
        }
      }
      
      // Create a comprehensive product object with all properties explicitly defined
      return {
        id: docSnap.id,
        ...productData, // Include all original fields
        createdAt,
        userId, // Ensure userId is explicitly included
        // Add seller details if available
        sellerName: sellerDetails?.displayName || 'Unknown Seller',
        sellerUniversity: sellerDetails?.university || '',
        sellerYearLevel: sellerDetails?.yearLevel || '',
        sellerPhotoURL: sellerDetails?.photoURL || null,
        whatsappNumber: sellerDetails?.whatsappNumber || '',
        isAnonymousSeller: sellerDetails?.isAnonymousSeller || false,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting product by ID:", error);
    throw error;
  }
};

export const updateProduct = async (productId: string, updates: any) => {
  try {
    const productRef = doc(db, "products", productId);
    
    // Get the product data first to verify it exists
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) {
      throw new Error("Product not found");
    }
    
    // Prepare the update data
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    
    // If the product is marked as sold, set the soldAt timestamp
    if (updates.isSold && !productSnap.data().soldAt) {
      updateData.soldAt = serverTimestamp();
    }
    
    // If the product is marked as unsold, remove the soldAt timestamp
    if (updates.isSold === false && productSnap.data().soldAt) {
      updateData.soldAt = null;
    }
    
    await updateDoc(productRef, updateData);
    
    return true;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Bid functions
export const placeBid = async (productId: string, userId: string, amount: number) => {
  try {
    const newBid = {
      productId,
      userId,
      amount,
      isAccepted: false,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, "bids"), newBid);
    return { id: docRef.id, ...newBid };
  } catch (error) {
    console.error("Error placing bid:", error);
    throw error;
  }
};

export const getBidsForProduct = async (productId: string) => {
  try {
    const bidsQuery = query(
      collection(db, "bids"),
      where("productId", "==", productId),
      orderBy("amount", "desc")
    );
    
    const querySnapshot = await getDocs(bidsQuery);
    
    const bids: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data) {
        // Safely handle createdAt timestamp
        let createdAt = new Date();
        if (data.createdAt && typeof data.createdAt === 'object' && 
            'toDate' in data.createdAt && typeof data.createdAt.toDate === 'function') {
          createdAt = data.createdAt.toDate();
        }
        
        bids.push({
          id: doc.id,
          ...data,
          createdAt,
        });
      }
    });
    
    return bids;
  } catch (error) {
    console.error("Error getting bids for product:", error);
    throw error;
  }
};

export const acceptBid = async (bidId: string, productId: string) => {
  try {
    // Update bid as accepted
    const bidDocRef = doc(db, "bids", bidId);
    await updateDoc(bidDocRef, { isAccepted: true });
    
    // Update product as sold
    const productDocRef = doc(db, "products", productId);
    await updateDoc(productDocRef, { isSold: true });
    
    return true;
  } catch (error) {
    console.error("Error accepting bid:", error);
    throw error;
  }
};

// Purchase functions
export const createPurchase = async (
  buyerId: string,
  sellerId: string,
  productId: string,
  amount: number,
  receipt?: any
) => {
  try {
    const newPurchase = {
      buyerId,
      sellerId,
      productId,
      amount,
      receipt,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, "purchases"), newPurchase);
    
    // Update product as sold
    await updateDoc(doc(db, "products", productId), { isSold: true });
    
    return { id: docRef.id, ...newPurchase };
  } catch (error) {
    console.error("Error creating purchase:", error);
    throw error;
  }
};

export const getPurchasesByUser = async (userId: string, role: "buyer" | "seller") => {
  try {
    const fieldName = role === "buyer" ? "buyerId" : "sellerId";
    
    const purchasesQuery = query(
      collection(db, "purchases"),
      where(fieldName, "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(purchasesQuery);
    
    const purchases: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data) {
        // Safely handle createdAt timestamp
        let createdAt = new Date();
        if (data.createdAt && typeof data.createdAt === 'object' && 
            'toDate' in data.createdAt && typeof data.createdAt.toDate === 'function') {
          createdAt = data.createdAt.toDate();
        }
        
        purchases.push({
          id: doc.id,
          ...data,
          createdAt,
        });
      }
    });
    
    return purchases;
  } catch (error) {
    console.error("Error getting purchases by user:", error);
    throw error;
  }
};

// Message functions
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string,
  productId?: string
) => {
  try {
    const newMessage = {
      senderId,
      receiverId,
      content,
      productId,
      isRead: false,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, "messages"), newMessage);
    return { id: docRef.id, ...newMessage };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const getMessagesForUser = async (userId: string) => {
  try {
    // First attempt with the full query including order by
    try {
      const messagesQuery = query(
        collection(db, "messages"),
        where("receiverId", "==", userId),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(messagesQuery);
      
      const messages: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
          // Safely handle createdAt timestamp
          let createdAt = new Date();
          if (data.createdAt && typeof data.createdAt === 'object' && 
              'toDate' in data.createdAt && typeof data.createdAt.toDate === 'function') {
            createdAt = data.createdAt.toDate();
          }
          
          messages.push({
            id: doc.id,
            ...data,
            createdAt,
          });
        }
      });
      
      return messages;
    } catch (indexError) {
      console.warn("Index error in messages query, falling back to client-side filtering:", indexError);
      
      // If we hit an index error, fall back to a simpler query without complex filters
      const simpleQuery = query(
        collection(db, "messages"),
        where("receiverId", "==", userId)
      );
      
      const querySnapshot = await getDocs(simpleQuery);
      
      const messages: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data) {
          // Safely handle createdAt timestamp
          let createdAt = new Date();
          if (data.createdAt && typeof data.createdAt === 'object' && 
              'toDate' in data.createdAt && typeof data.createdAt.toDate === 'function') {
            createdAt = data.createdAt.toDate();
          }
          
          messages.push({
            id: doc.id,
            ...data,
            createdAt,
          });
        }
      });
      
      // Sort by createdAt desc (client-side sorting)
      messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return messages;
    }
  } catch (error) {
    console.error("Error getting messages for user:", error);
    // Return empty array instead of throwing error to prevent app crashes
    return [];
  }
};

// Categories
export const getCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "categories"));
    
    // If no categories exist in Firestore, return default categories
    if (querySnapshot.empty) {
      const defaultCategories = [
        { id: "books", name: "Books", icon: "books" },
        { id: "electronics", name: "Electronics", icon: "electronics" },
        { id: "furniture", name: "Furniture", icon: "furniture" },
        { id: "clothing", name: "Clothing", icon: "clothing" },
        { id: "stationery", name: "Stationery", icon: "stationery" },
        { id: "gaming", name: "Gaming", icon: "gaming" },
        { id: "more", name: "More", icon: "more" }
      ];
      
      // Create the categories in Firestore
      try {
        for (const category of defaultCategories) {
          await setDoc(doc(db, "categories", category.id), {
            name: category.name,
            icon: category.icon
          });
        }
      } catch (err) {
        console.log("Error creating default categories:", err);
      }
      
      return defaultCategories;
    }
    
    const categories: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data) {
        categories.push({
          id: doc.id,
          ...data,
        });
      }
    });
    
    return categories;
  } catch (error) {
    console.error("Error getting categories:", error);
    // Return default categories instead of throwing error
    return [
      { id: "books", name: "Books", icon: "books" },
      { id: "electronics", name: "Electronics", icon: "electronics" },
      { id: "furniture", name: "Furniture", icon: "furniture" },
      { id: "clothing", name: "Clothing", icon: "clothing" },
      { id: "stationery", name: "Stationery", icon: "stationery" },
      { id: "gaming", name: "Gaming", icon: "gaming" },
      { id: "more", name: "More", icon: "more" }
    ];
  }
};

// Bulk Sales
export const createBulkSale = async (
  title: string,
  description: string,
  userId: string,
  productIds: string[],
  discount?: number
) => {
  try {
    // Create bulk sale record
    const bulkSaleData = {
      title,
      description,
      userId,
      discount,
      isActive: true,
      createdAt: serverTimestamp(),
    };
    
    const bulkSaleRef = await addDoc(collection(db, "bulkSales"), bulkSaleData);
    
    // Add products to the bulk sale
    const bulkSaleProducts = productIds.map((productId) => ({
      bulkSaleId: bulkSaleRef.id,
      productId,
    }));
    
    for (const bulkSaleProduct of bulkSaleProducts) {
      await addDoc(collection(db, "bulkSaleProducts"), bulkSaleProduct);
    }
    
    return {
      id: bulkSaleRef.id,
      ...bulkSaleData,
      productIds,
    };
  } catch (error) {
    console.error("Error creating bulk sale:", error);
    throw error;
  }
};

/**
 * Get all active bulk sales
 * NOTE: This function might require Firestore indexes to be created.
 * If you encounter index errors, you can click on the URL provided
 * in the error to create the required indexes automatically.
 * 
 * Indexes needed:
 * - Collection: bulkSales, Fields: isActive Ascending, createdAt Descending
 * - Collection: products, Fields: isSold Ascending, createdAt Descending
 * - Collection: messages, Fields: receiverId Ascending, createdAt Descending
 */
export const getBulkSales = async () => {
  try {
    // First try with the full query including ordering
    try {
      // This query requires a composite index on isActive and createdAt
      const bulkSalesQuery = query(
        collection(db, "bulkSales"),
        where("isActive", "==", true),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(bulkSalesQuery);
      
      const bulkSales: any[] = [];
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        if (data) {
          // Safely handle createdAt timestamp
          let createdAt = new Date();
          if (data.createdAt && typeof data.createdAt === 'object' && 
              'toDate' in data.createdAt && typeof data.createdAt.toDate === 'function') {
            createdAt = data.createdAt.toDate();
          }
            
          const bulkSale = {
            id: docSnapshot.id,
            ...data,
            createdAt,
          };
        
          // Get products in this bulk sale
          const productsQuery = query(
            collection(db, "bulkSaleProducts"),
            where("bulkSaleId", "==", docSnapshot.id)
          );
          
          const productsSnapshot = await getDocs(productsQuery);
          const productIds: string[] = [];
          
          productsSnapshot.forEach((productDoc) => {
            const productData = productDoc.data();
            if (productData && productData.productId) {
              productIds.push(productData.productId);
            }
          });
          
          bulkSales.push({
            ...bulkSale,
            productIds,
          });
        }
      }
      
      return bulkSales;
    } catch (indexError) {
      console.warn("Index error in bulk sales query, falling back to client-side filtering:", indexError);
      
      // If we hit an index error, fall back to a simpler query without complex filters
      const simpleQuery = query(
        collection(db, "bulkSales")
      );
      
      const querySnapshot = await getDocs(simpleQuery);
      
      const bulkSales: any[] = [];
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        if (data) {
          // Client-side filtering for active bulk sales
          if (data.isActive !== true) {
            continue; // Skip inactive bulk sales
          }
          
          // Safely handle createdAt timestamp
          let createdAt = new Date();
          if (data.createdAt && typeof data.createdAt === 'object' && 
              'toDate' in data.createdAt && typeof data.createdAt.toDate === 'function') {
            createdAt = data.createdAt.toDate();
          }
            
          const bulkSale = {
            id: docSnapshot.id,
            ...data,
            createdAt,
          };
        
          // Get products in this bulk sale
          const productsQuery = query(
            collection(db, "bulkSaleProducts"),
            where("bulkSaleId", "==", docSnapshot.id)
          );
          
          const productsSnapshot = await getDocs(productsQuery);
          const productIds: string[] = [];
          
          productsSnapshot.forEach((productDoc) => {
            const productData = productDoc.data();
            if (productData && productData.productId) {
              productIds.push(productData.productId);
            }
          });
          
          bulkSales.push({
            ...bulkSale,
            productIds,
          });
        }
      }
      
      // Sort by createdAt desc (client-side sorting)
      bulkSales.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return bulkSales;
    }
  } catch (error) {
    console.error("Error getting bulk sales:", error);
    // Return empty array instead of throwing error
    return [];
  }
};

export { auth, db, storage };
