import { useEffect, useState } from "react";
import { useSearchParams } from "@/hooks/use-search-params";
import ProductGrid from "@/components/product/product-grid";
import SearchFilters from "@/components/search/search-filters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  X, 
  SlidersHorizontal, 
  Grid2X2, 
  ArrowUpDown,
  Search as SearchIcon 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Define search filter types
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

export default function Search() {
  const { getParam, setParam, getParams, setParams, clearParams } = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(getParam("q") || "");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFiltersType>({});
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  
  // Initialize active filters from URL parameters
  useEffect(() => {
    const params = getParams();
    const filters: SearchFiltersType = {};
    
    if (params.q) filters.query = params.q;
    if (params.category) filters.category = params.category;
    if (params.minPrice) filters.minPrice = params.minPrice;
    if (params.maxPrice) filters.maxPrice = params.maxPrice;
    if (params.condition) filters.condition = params.condition;
    if (params.university) filters.university = params.university;
    if (params.sort) filters.sort = params.sort as any;
    if (params.available) filters.available = params.available as any;
    
    setActiveFilters(filters);
    if (params.q) setSearchQuery(params.q);
  }, []);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParam("q", searchQuery.trim());
    
    // Update active filters
    setActiveFilters(prev => ({
      ...prev,
      query: searchQuery.trim()
    }));
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: SearchFiltersType) => {
    // Update URL params
    const updatedParams: Record<string, string> = {};
    
    if (newFilters.query) updatedParams.q = newFilters.query;
    if (newFilters.category) updatedParams.category = newFilters.category;
    if (newFilters.minPrice) updatedParams.minPrice = newFilters.minPrice;
    if (newFilters.maxPrice) updatedParams.maxPrice = newFilters.maxPrice;
    if (newFilters.condition) updatedParams.condition = newFilters.condition;
    if (newFilters.university) updatedParams.university = newFilters.university;
    if (newFilters.sort) updatedParams.sort = newFilters.sort;
    if (newFilters.available) updatedParams.available = newFilters.available;
    
    setParams(updatedParams);
    setActiveFilters(newFilters);
    setIsFilterSheetOpen(false);
  };

  // Remove a single filter
  const removeFilter = (key: keyof SearchFiltersType) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    
    handleFilterChange(newFilters);
  };

  // Count active filters (excluding query and sort)
  const activeFilterCount = Object.keys(activeFilters).filter(
    key => key !== 'query' && key !== 'sort'
  ).length;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Search Products</h1>
        <form onSubmit={handleSearch} className="flex w-full gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <SearchIcon className="h-4 w-4" />
            </div>
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      {/* Filter Pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(activeFilters).map(([key, value]) => {
            // Skip query and sort from pills
            if (key === 'query' || key === 'sort') return null;
            
            let label = '';
            switch (key) {
              case 'category':
                label = `Category: ${value}`;
                break;
              case 'minPrice':
                label = `Min: $${value}`;
                break;
              case 'maxPrice':
                label = `Max: $${value}`;
                break;
              case 'condition':
                label = `Condition: ${value}`;
                break;
              case 'university':
                label = `University: ${value}`;
                break;
              case 'available':
                label = value === 'true' ? 'Available' : 'Sold';
                break;
              default:
                label = `${key}: ${value}`;
            }
            
            return (
              <Badge 
                key={key} 
                variant="outline" 
                className="py-1 px-3 flex items-center gap-1"
              >
                {label}
                <X 
                  className="h-3 w-3 cursor-pointer ml-1" 
                  onClick={() => removeFilter(key as keyof SearchFiltersType)} 
                />
              </Badge>
            );
          })}
          
          {activeFilterCount > 1 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7"
              onClick={() => {
                // Clear all except query and sort
                const newFilters: SearchFiltersType = {};
                if (activeFilters.query) newFilters.query = activeFilters.query;
                if (activeFilters.sort) newFilters.sort = activeFilters.sort;
                
                handleFilterChange(newFilters);
              }}
            >
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <div className="flex items-center gap-2">
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Search Filters</SheetTitle>
                <SheetDescription>
                  Narrow down your search results
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                <SearchFilters 
                  filters={activeFilters} 
                  onFilterChange={handleFilterChange} 
                />
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewType === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none px-2"
              onClick={() => setViewType("grid")}
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none px-2"
              onClick={() => setViewType("list")}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Sort by:</span>
          <Tabs 
            defaultValue={activeFilters.sort || "newest"}
            className="mr-2"
            onValueChange={(value) => {
              handleFilterChange({
                ...activeFilters,
                sort: value as any
              });
            }}
          >
            <TabsList>
              <TabsTrigger value="newest">Newest</TabsTrigger>
              <TabsTrigger value="price-low">Price: Low to High</TabsTrigger>
              <TabsTrigger value="price-high">Price: High to Low</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Products Grid */}
      <ProductGrid 
        searchQuery={activeFilters.query}
        filters={activeFilters}
        showLoadMore={true}
      />
    </div>
  );
}