import { Link, useLocation } from "wouter";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import LoginModal from "@/components/auth/login-modal";
import { useState } from "react";

export default function BottomNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleSellItem = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
  };

  return (
    <>
      <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-10">
        <div className="grid grid-cols-5 h-16">
          <Link href="/">
            <span className={`flex flex-col items-center justify-center cursor-pointer ${location === "/" ? "text-primary" : "text-gray-500"}`}>
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </span>
          </Link>
          <Link href="/categories">
            <span className={`flex flex-col items-center justify-center cursor-pointer ${location === "/categories" ? "text-primary" : "text-gray-500"}`}>
              <Search className="h-5 w-5" />
              <span className="text-xs mt-1">Explore</span>
            </span>
          </Link>
          <Link href={user ? "/sell" : "#"}>
            <span className="flex flex-col items-center justify-center cursor-pointer" onClick={handleSellItem}>
              <div className="bg-primary text-white rounded-full p-2 -mt-5 shadow-lg">
                <PlusCircle className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Sell</span>
            </span>
          </Link>
          <Link href="/messages">
            <span className={`flex flex-col items-center justify-center cursor-pointer ${location === "/messages" ? "text-primary" : "text-gray-500"}`}>
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs mt-1">Messages</span>
            </span>
          </Link>
          <Link href="/profile">
            <span className={`flex flex-col items-center justify-center cursor-pointer ${location === "/profile" ? "text-primary" : "text-gray-500"}`}>
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Profile</span>
            </span>
          </Link>
        </div>
      </nav>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        openSignup={() => {
          setIsLoginModalOpen(false);
          // Could add signup modal here if needed
        }} 
      />
    </>
  );
}
