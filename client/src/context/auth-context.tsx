import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { auth, db, handleGoogleRedirectResult } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  userDetails: any | null;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userDetails: null,
  isLoading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Handle potential redirect from Google sign-in
    handleGoogleRedirectResult()
      .then(redirectUser => {
        if (redirectUser) {
          console.log("Successfully signed in with Google redirect");
          // The auth state listener below will handle setting the user
        }
      })
      .catch(error => {
        console.error("Error handling Google redirect:", error);
      });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get additional user details from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUserDetails(userDoc.data());
          } else {
            // If user somehow exists in auth but not in Firestore, create a record
            console.warn("User exists in Auth but not in Firestore. This should not happen normally.");
          }
          
          // Check if we need to redirect back to the original URL after auth
          const redirectUrl = sessionStorage.getItem('authRedirectUrl');
          if (redirectUrl) {
            sessionStorage.removeItem('authRedirectUrl');
            window.location.href = redirectUrl;
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      } else {
        setUserDetails(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userDetails, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
