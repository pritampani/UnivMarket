import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CategorySelector from "@/components/product/category-selector";
import ProductGrid from "@/components/product/product-grid";
import RecentProducts from "@/components/product/recent-products";
import { useAuth } from "@/context/auth-context";
import LoginModal from "@/components/auth/login-modal";
import SignupModal from "@/components/auth/signup-modal";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SearchFiltersType } from "@/components/search/search-dropdown";

export default function Home() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [, setLocation] = useLocation();
  const location = useLocation()[0];

  // Parse URL query parameters on mount and when URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const newFilters: SearchFiltersType = {};

    // Extract search query
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
      newFilters.query = q;
    } else {
      setSearchQuery("");
    }

    // Extract all other filters
    if (searchParams.get('category')) newFilters.category = searchParams.get('category') || undefined;
    if (searchParams.get('minPrice')) newFilters.minPrice = searchParams.get('minPrice') || undefined;
    if (searchParams.get('maxPrice')) newFilters.maxPrice = searchParams.get('maxPrice') || undefined;
    if (searchParams.get('condition')) newFilters.condition = searchParams.get('condition') || undefined;
    if (searchParams.get('university')) newFilters.university = searchParams.get('university') || undefined;
    if (searchParams.get('sort')) newFilters.sort = searchParams.get('sort') as any || undefined;
    if (searchParams.get('available')) newFilters.available = searchParams.get('available') as any || undefined;

    setFilters(newFilters);

    // Set search active if any filters are set
    setIsSearchActive(
      !!q || Object.values(newFilters).some(value => value !== undefined)
    );
  }, [location]);

  // Reset search
  const handleResetSearch = () => {
    setSearchQuery("");
    setFilters({});
    setIsSearchActive(false);
    setLocation("/"); // Remove all query params
  };

  return (
    <div>
      {/* Hero Section */}
      {!user && !isSearchActive && (
        <section className="bg-gradient-to-r from-primary to-indigo-800 text-white py-8 px-4 md:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:w-1/2 mb-6 md:mb-0">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Buy & Sell Within Your University</h1>
                <p className="text-indigo-100 mb-4">Connect with fellow students to buy and sell unused items easily</p>
                <div className="flex space-x-4">
                  <Button 
                    className="bg-white text-primary hover:bg-gray-100"
                    onClick={() => setIsSignupModalOpen(true)}
                  >
                    Sign Up
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border border-white text-white hover:bg-white/10"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80" 
                  alt="University students" 
                  className="rounded-lg shadow-lg object-cover h-40 md:h-64 w-full"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Mobile search (no longer needed as it's in the header) */}

        {/* Active search filters display */}
        {isSearchActive && (
          <div className="mb-6 border p-4 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium">
                {searchQuery ? `Search results for "${searchQuery}"` : "Search results"}
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResetSearch}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>

            {/* Filter badges */}
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.category && (
                <Badge variant="secondary">Category: {filters.category}</Badge>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <Badge variant="secondary">
                  Price: ${filters.minPrice || '0'} - ${filters.maxPrice || '1000+'}
                </Badge>
              )}
              {filters.condition && (
                <Badge variant="secondary">Condition: {filters.condition}</Badge>
              )}
              {filters.university && (
                <Badge variant="secondary">University: {filters.university}</Badge>
              )}
              {filters.available && (
                <Badge variant="secondary">
                  {filters.available === "true" ? "Available items" : "Sold items"}
                </Badge>
              )}
              {filters.sort && (
                <Badge variant="secondary">
                  Sort: {
                    filters.sort === "newest" ? "Newest" : 
                    filters.sort === "price-low" ? "Price (Low to High)" : 
                    "Price (High to Low)"
                  }
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Search Results or Default Content */}
        {isSearchActive ? (
          <section className="py-4">
            <h2 className="text-lg font-semibold mb-4">Products</h2>
            <ProductGrid 
              searchParams={filters}
              limit={20}
              showFilters={false}
            />
          </section>
        ) : (
          <>
            {/* Categories section */}
            <section className="py-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Categories</h2>
                <Link href="/categories">
                  <span className="text-primary text-sm font-medium cursor-pointer">View All</span>
                </Link>
              </div>
              <CategorySelector />
            </section>

            {/* Featured Products */}
            <section className="py-4">
              <ProductGrid 
                featured={true} 
                limit={8}
              />
            </section>

            {/* Recently Added Products */}
            <section className="py-4">
              <RecentProducts limit={5} />
            </section>

            {/* Bulk Deals section */}
            <section className="py-4">
              <div className="bg-gradient-to-l from-secondary to-blue-600 rounded-lg overflow-hidden">
                <div className="md:flex md:items-center p-6">
                  <div className="md:w-2/3 text-white mb-4 md:mb-0">
                    <h2 className="text-xl font-bold mb-2">Graduating Student Deals</h2>
                    <p className="mb-4">Find bulk sales from graduating students - furniture, books, electronics and more at discounted prices!</p>
                    <Link href="/bulk-sales">
                      <Button className="bg-white text-primary hover:bg-gray-100">
                        Browse Bulk Sales
                      </Button>
                    </Link>
                  </div>
                  <div className="md:w-1/3 md:pl-6">
                    <img 
                      src="https://images.unsplash.com/photo-1627556592933-ffe99c1cd9eb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                      alt="Graduation" 
                      className="rounded-lg shadow-lg h-48 w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        openSignup={() => {
          setIsLoginModalOpen(false);
          setIsSignupModalOpen(true);
        }}
      />
      <SignupModal 
        isOpen={isSignupModalOpen} 
        onClose={() => setIsSignupModalOpen(false)} 
        openLogin={() => {
          setIsSignupModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </div>
  );
}