import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, Menu, Plus, X } from "lucide-react";
import UserMenu from "@/components/auth/user-menu";
import { useAuth } from "@/context/auth-context";
import LoginModal from "@/components/auth/login-modal";
import SignupModal from "@/components/auth/signup-modal";
import SearchDropdown from "@/components/search/search-dropdown";

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const openSignupModal = () => {
    setIsSignupModalOpen(true);
  };

  const closeSignupModal = () => {
    setIsSignupModalOpen(false);
  };

  const handleSellItem = () => {
    if (!user) {
      openLoginModal();
      return;
    }
    setLocation("/sell");
  };

  // Close mobile menu on location change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [useLocation()[0]]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <span className="text-primary font-bold text-xl cursor-pointer">UniMarket</span>
            </Link>
          </div>
          
          {/* Enhanced Search bar - visible on desktop */}
          <div className="hidden md:block flex-1 max-w-xl mx-4">
            <SearchDropdown />
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <span className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Home</span>
            </Link>
            <Link href="/categories">
              <span className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Explore</span>
            </Link>
            
            {user && (
              <>
                <Link href="/my-listings">
                  <span className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer">My Items</span>
                </Link>
                <Link href="/messages">
                  <span className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Messages</span>
                </Link>
              </>
            )}
            
            {!isLoading && (
              <>
                {user ? (
                  <UserMenu user={user} />
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="ghost" onClick={openLoginModal}>Login</Button>
                    <Button variant="outline" onClick={openSignupModal}>Sign Up</Button>
                  </div>
                )}
              </>
            )}
            
            <Button onClick={handleSellItem} className="flex items-center">
              <Plus className="h-4 w-4 mr-1" /> Sell Item
            </Button>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={toggleSearch}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost" 
              size="icon"
              onClick={toggleMobileMenu}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile search bar */}
      {isSearchOpen && (
        <div className="md:hidden px-4 pb-4">
          <SearchDropdown />
        </div>
      )}

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex flex-col space-y-2">
            <Link href="/">
              <span className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Home</span>
            </Link>
            <Link href="/categories">
              <span className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Explore</span>
            </Link>
            
            {user ? (
              <>
                <Link href="/my-listings">
                  <span className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer">My Items</span>
                </Link>
                <Link href="/messages">
                  <span className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Messages</span>
                </Link>
                <Link href="/profile">
                  <span className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Profile</span>
                </Link>
                <Link href="/purchase-history">
                  <span className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium cursor-pointer">Purchase History</span>
                </Link>
                <div className="pt-2 border-t border-gray-200">
                  <Button variant="destructive" onClick={() => console.log("Sign out")}>Sign Out</Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                <Button onClick={openLoginModal}>Login</Button>
                <Button variant="outline" onClick={openSignupModal}>Sign Up</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} openSignup={openSignupModal} />
      <SignupModal isOpen={isSignupModalOpen} onClose={closeSignupModal} openLogin={openLoginModal} />
    </header>
  );
}
