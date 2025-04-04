import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/firebase";
import ProductCard from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchFiltersType } from "@/components/search/search-dropdown";
import { useLocation } from "wouter";

interface ProductGridProps {
  categoryId?: string;
  limit?: number;
  featured?: boolean;
  searchQuery?: string;
  showLoadMore?: boolean;
  showFilters?: boolean;
  filters?: SearchFiltersType;
  searchParams?: SearchFiltersType; // Direct search params from URL
}

export default function ProductGrid({
  categoryId,
  limit = 8,
  featured = false,
  searchQuery,
  showLoadMore = true,
  showFilters = true,
  filters,
  searchParams, // Use these first if provided (from URL params)
}: ProductGridProps) {
  // We use UI-friendly sort values in the component, but map them to API values
  type UISortValue = "newest" | "price-low" | "price-high";
  
  // Prioritize searchParams over filters
  const effectiveFilters = searchParams || filters;
  
  const [sortBy, setSortBy] = useState<UISortValue>(
    effectiveFilters?.sort === "price-low" ? "price-low" :
    effectiveFilters?.sort === "price-high" ? "price-high" : 
    "newest"
  );
  const [displayedProducts, setDisplayedProducts] = useState<any[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [, setLocation] = useLocation();
  
  // Map the UI sort values to the Firebase API sort values
  const getSortValue = (uiSortValue: UISortValue): "newest" | "price_asc" | "price_desc" => {
    switch (uiSortValue) {
      case "price-low": return "price_asc";
      case "price-high": return "price_desc";
      case "newest": 
      default: return "newest";
    }
  };

  // Get products from Firebase with all available filters
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["products", categoryId, featured, limit, sortBy, searchQuery, 
               effectiveFilters?.query, effectiveFilters?.category,
               effectiveFilters?.minPrice, effectiveFilters?.maxPrice, 
               effectiveFilters?.condition, effectiveFilters?.available, 
               effectiveFilters?.university],
    queryFn: async () => {
      return await getProducts({
        categoryId: categoryId || effectiveFilters?.category,
        limit,
        isFeatured: featured,
        searchQuery: searchQuery || effectiveFilters?.query,
        minPrice: effectiveFilters?.minPrice ? parseInt(effectiveFilters.minPrice) * 100 : undefined, // Convert to cents
        maxPrice: effectiveFilters?.maxPrice ? parseInt(effectiveFilters.maxPrice) * 100 : undefined, // Convert to cents
        condition: effectiveFilters?.condition ? [effectiveFilters.condition] : undefined,
        university: effectiveFilters?.university,
        sortBy: getSortValue(sortBy),
        onlyAvailable: effectiveFilters?.available === "true" ? true : 
                     effectiveFilters?.available === "false" ? false : undefined
      });
    },
  });

  useEffect(() => {
    if (data?.products) {
      setDisplayedProducts(data.products);
      setLastVisible(data.lastVisible);
    }
  }, [data]);

  // Refresh when sort option changes
  useEffect(() => {
    refetch();
  }, [sortBy, refetch]);

  // Refresh when filters change
  useEffect(() => {
    if (effectiveFilters) {
      // Update the local sort state when filters change
      if (effectiveFilters.sort && effectiveFilters.sort !== sortBy) {
        setSortBy(effectiveFilters.sort);
      }
      refetch();
    }
  }, [effectiveFilters, refetch, sortBy]);

  const loadMore = async () => {
    if (!lastVisible) return;
    
    setIsLoadingMore(true);
    
    try {
      const moreProducts = await getProducts({
        categoryId: categoryId || effectiveFilters?.category,
        limit,
        lastVisible,
        isFeatured: featured,
        searchQuery: searchQuery || effectiveFilters?.query,
        minPrice: effectiveFilters?.minPrice ? parseInt(effectiveFilters.minPrice) * 100 : undefined, // Convert to cents
        maxPrice: effectiveFilters?.maxPrice ? parseInt(effectiveFilters.maxPrice) * 100 : undefined, // Convert to cents
        condition: effectiveFilters?.condition ? [effectiveFilters.condition] : undefined,
        university: effectiveFilters?.university,
        sortBy: getSortValue(sortBy),
        onlyAvailable: effectiveFilters?.available === "true" ? true : 
                     effectiveFilters?.available === "false" ? false : undefined
      });
      
      setDisplayedProducts([...displayedProducts, ...moreProducts.products]);
      setLastVisible(moreProducts.lastVisible);
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as UISortValue);

    // If we have URL search parameters, update them with the new sort value
    if (window.location.search && searchParams) {
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.set('sort', value);
      setLocation(`/?${currentParams.toString()}`);
    }
  };

  // Skeleton loading state
  if (isLoading) {
    return (
      <div>
        {showFilters && (
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-10 w-44" />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(limit).fill(0).map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {showFilters && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {featured ? "Featured Items" : categoryId ? `${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)}` : "All Items"}
            {displayedProducts.length > 0 && (
              <span className="ml-2 text-sm text-gray-500 font-normal">
                ({displayedProducts.length} {displayedProducts.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </h2>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By: Newest" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Sort By: Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      {displayedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {showLoadMore && lastVisible && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">
            {(searchQuery || (effectiveFilters && Object.values(effectiveFilters).some(val => val !== undefined)))
              ? "No products match your search criteria" 
              : "There are no products in this category yet"}
          </p>
        </div>
      )}
    </div>
  );
}
