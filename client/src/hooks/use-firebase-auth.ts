import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface UseFirebaseAuthReturn {
  user: User | null;
  userDetails: any | null;
  isLoading: boolean;
  error: string | null;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  googleSignInWithRedirect: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export function useFirebaseAuth(): UseFirebaseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUserDetails(userDoc.data());
          }
        } catch (err) {
          console.error("Error fetching user details:", err);
        }
      } else {
        setUserDetails(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, displayName: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Set display name
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName,
        photoURL: user.photoURL || "",
        university: "",
        yearLevel: "",
        isAnonymousSeller: false,
        phoneNumber: "",
        whatsappNumber: "",
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      // If not, create a new user document
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
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateUserProfile = async (data: any): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user) throw new Error("No user logged in");
      
      // Update auth profile if displayName or photoURL is provided
      if (data.displayName || data.photoURL) {
        await updateProfile(user, {
          displayName: data.displayName || user.displayName,
          photoURL: data.photoURL || user.photoURL
        });
      }
      
      // Update user document in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      // Refresh user details
      const updatedUserDoc = await getDoc(doc(db, "users", user.uid));
      if (updatedUserDoc.exists()) {
        setUserDetails(updatedUserDoc.data());
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Google sign in with redirect - more reliable on mobile
  const googleSignInWithRedirect = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      
      // The result will be handled in a useEffect with getRedirectResult
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check for redirect result on component mount
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User successfully signed in with redirect
          const user = result.user;
          
          // Check if user exists in Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          // If not, create a new user document
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
        }
      } catch (error) {
        console.error("Error with redirect sign in:", error);
      }
    };
    
    handleRedirectResult();
  }, []);
  
  // Reset password functionality
  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    userDetails,
    isLoading,
    error,
    signup,
    login,
    googleSignIn,
    googleSignInWithRedirect,
    logout,
    updateUserProfile,
    resetPassword
  };
}
