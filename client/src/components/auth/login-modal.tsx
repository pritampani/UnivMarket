import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { X, Mail, ArrowLeft } from "lucide-react";
import { loginWithEmail, signInWithGoogle } from "@/lib/firebase";
import { FcGoogle } from "react-icons/fc";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  openSignup: () => void;
}

export default function LoginModal({ isOpen, onClose, openSignup }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { toast } = useToast();
  const { resetPassword } = useFirebaseAuth();

  const handleSignInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await loginWithEmail(email, password);
      
      toast({
        title: "Login successful",
        description: "Welcome back to UniMarket!"
      });
      
      onClose();
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMessage = "Failed to sign in. Please check your credentials.";
      
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later.";
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      await signInWithGoogle();
      
      toast({
        title: "Login successful",
        description: "Welcome to UniMarket!"
      });
      
      onClose();
    } catch (error: any) {
      console.error("Google sign in error:", error);
      
      toast({
        title: "Login failed",
        description: "Failed to sign in with Google.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupClick = () => {
    onClose();
    openSignup();
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await resetPassword(resetEmail);
      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password",
      });
      setShowResetPassword(false);
    } catch (error: any) {
      console.error("Password reset error:", error);
      
      let errorMessage = "Failed to send password reset email.";
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account exists with this email.";
      }
      
      toast({
        title: "Password reset failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleResetPassword = () => {
    setShowResetPassword(!showResetPassword);
    if (!showResetPassword) {
      setResetEmail(email);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {showResetPassword ? "Reset Password" : "Sign In"}
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        {showResetPassword ? (
          <>
            <Button 
              variant="ghost" 
              className="flex items-center justify-start px-0 mb-4" 
              onClick={toggleResetPassword}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Button>
            
            <form onSubmit={handleResetPassword}>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="your@email.edu"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
                
                <p className="text-sm text-muted-foreground mt-4">
                  We'll send you an email with a link to reset your password.
                </p>
              </div>
            </form>
          </>
        ) : (
          <>
            <form onSubmit={handleSignInWithEmail}>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className="flex justify-end">
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-xs" 
                      onClick={toggleResetPassword} 
                      type="button"
                    >
                      Forgot password?
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>
            
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or sign in with</span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <FcGoogle className="h-5 w-5 mr-2" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Email Link
                </Button>
              </div>
            </div>
            
            <div className="mt-4 text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Button variant="link" className="p-0" onClick={handleSignupClick}>
                  Sign up
                </Button>
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
