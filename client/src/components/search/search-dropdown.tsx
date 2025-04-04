import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  SlidersHorizontal,
  X,
  ArrowUpDown
} from "lucide-react";
import { useProducts } from "@/context/product-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchFilters from "./search-filters";
import { getProducts } from "@/lib/firebase";

// Define search filter types (moved from search.tsx)
export type SearchFiltersType = {
  query?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  condition?: string;
  university?: string;
  sort?: "newest" | "price-low" | "price-high";
  available?: "true" | "false";
};

export default function SearchDropdown() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.condition) count++;
    if (filters.university) count++;
    if (filters.available) count++;
    if (filters.sort) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Close results dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node) && 
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsResultsVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search function
  const performSearch = async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    // If no search query and no filters, don't search
    if (!searchQuery.trim() && Object.keys(filters).length === 0) {
      setSearchResults([]);
      setIsResultsVisible(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const searchFilters: any = { ...filters };
      
      // Add search query to filters
      if (searchQuery.trim()) {
        searchFilters.query = searchQuery.trim();
      }
      
      // Convert price filters from dollars to cents for Firebase
      if (searchFilters.minPrice) {
        searchFilters.minPrice = Math.floor(Number(searchFilters.minPrice) * 100).toString();
      }
      if (searchFilters.maxPrice) {
        searchFilters.maxPrice = Math.floor(Number(searchFilters.maxPrice) * 100).toString();
      }
      
      // Add default sorting if none selected
      if (!searchFilters.sort) {
        searchFilters.sort = "newest";
      }

      // Convert available filter to isSold for Firebase
      if (searchFilters.available === "true") {
        searchFilters.isSold = false;
      } else if (searchFilters.available === "false") {
        searchFilters.isSold = true;
      }
      
      // Call Firebase search function
      const { products } = await getProducts(searchFilters);
      
      // Update results
      setSearchResults(products.slice(0, 5)); // Limit to 5 for quick results
      setIsResultsVisible(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const handleFilterChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    setIsFilterOpen(false);
    performSearch();
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({});
    performSearch();
  };

  // View all results
  const viewAllResults = () => {
    // Build query string for URL
    const queryParams = new URLSearchParams();
    
    if (searchQuery) {
      queryParams.set("q", searchQuery);
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.set(key, value);
      }
    });
    
    // Navigate to home with search params
    setLocation(`/?${queryParams.toString()}`);
    setIsResultsVisible(false);
  };

  // Show/hide results when input is focused/blurred
  const handleInputFocus = () => {
    if (searchQuery.trim() || Object.keys(filters).length > 0) {
      performSearch();
    }
  };

  return (
    <div className="relative w-full">
      {/* Search Bar */}
      <form onSubmit={performSearch} className="flex w-full items-center">
        <div className="relative flex-grow">
          <Input
            ref={searchInputRef}
            type="text"
            className="w-full pl-10 pr-4 py-2"
            placeholder="Search for items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleInputFocus}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <Search className="h-4 w-4" />
          </div>
        </div>

        {/* Filters Button */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-1 relative"
              aria-label="Filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Search Filters</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <SearchFilters 
                filters={filters} 
                onFilterChange={handleFilterChange} 
              />
            </div>
            <SheetFooter>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetFilters}
                className="w-full"
              >
                Reset All Filters
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Sort Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-1"
              aria-label="Sort"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleFilterChange({ ...filters, sort: "newest" })}>
              Newest First
              {filters.sort === "newest" && <Check className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange({ ...filters, sort: "price-low" })}>
              Price: Low to High
              {filters.sort === "price-low" && <Check className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange({ ...filters, sort: "price-high" })}>
              Price: High to Low
              {filters.sort === "price-high" && <Check className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </form>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {filters.category && (
            <Badge variant="secondary" className="flex items-center">
              Category
              <button 
                onClick={() => handleFilterChange({ ...filters, category: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <Badge variant="secondary" className="flex items-center">
              Price Range
              <button 
                onClick={() => handleFilterChange({ ...filters, minPrice: undefined, maxPrice: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.condition && (
            <Badge variant="secondary" className="flex items-center">
              {filters.condition} Condition
              <button 
                onClick={() => handleFilterChange({ ...filters, condition: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.university && (
            <Badge variant="secondary" className="flex items-center">
              {filters.university}
              <button 
                onClick={() => handleFilterChange({ ...filters, university: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.available && (
            <Badge variant="secondary" className="flex items-center">
              {filters.available === "true" ? "Available" : "Sold"}
              <button 
                onClick={() => handleFilterChange({ ...filters, available: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.sort && (
            <Badge variant="secondary" className="flex items-center">
              {filters.sort === "newest" 
                ? "Newest" 
                : filters.sort === "price-low" 
                  ? "Price ↑" 
                  : "Price ↓"
              }
              <button 
                onClick={() => handleFilterChange({ ...filters, sort: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Quick Search Results */}
      {isResultsVisible && (
        <div 
          ref={resultsRef}
          className="absolute z-50 top-full mt-1 left-0 right-0 bg-white shadow-lg rounded-md border border-gray-200 max-h-[400px] overflow-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="p-2">
                {searchResults.map((item) => (
                  <div 
                    key={item.id}
                    className="p-2 hover:bg-gray-50 rounded-md cursor-pointer flex items-center gap-3"
                    onClick={() => {
                      setLocation(`/product/${item.id}`);
                      setIsResultsVisible(false);
                    }}
                  >
                    <div className="h-12 w-12 flex-shrink-0">
                      <img 
                        src={item.images[0]} 
                        alt={item.title}
                        className="h-full w-full object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.title}</h4>
                      <p className="text-xs text-gray-500 truncate">{item.categoryName}</p>
                      <p className="text-sm font-semibold text-primary">₹{(item.price / 100).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-2 border-t">
                <Button 
                  variant="ghost" 
                  className="w-full justify-center text-sm"
                  onClick={viewAllResults}
                >
                  View all results
                </Button>
              </div>
            </>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">No results found</p>
              <Button 
                variant="ghost" 
                className="mt-2 text-xs"
                onClick={handleResetFilters}
              >
                Clear filters and try again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Missing icon import
import { Check } from "lucide-react";