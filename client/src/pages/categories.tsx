import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CategorySelector from "@/components/product/category-selector";
import ProductGrid from "@/components/product/product-grid";
import { getCategories } from "@/lib/firebase";
import { Search } from "lucide-react";

export default function Categories() {
  const params = useParams();
  const categoryId = params.id;
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Find the current category
  const currentCategory = categories?.find((cat: any) => cat.id === categoryId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Bar (mobile - shown in main content area) */}
      <div className="md:hidden mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for items..."
            className="w-full pl-10 pr-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <Search className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">
          {categoryId 
            ? `${currentCategory?.name || categoryId.charAt(0).toUpperCase() + categoryId.slice(1)} Category` 
            : "All Categories"
          }
        </h1>
        
        {/* Category description - can be added when categories have descriptions */}
        {currentCategory?.description && (
          <p className="text-gray-600 mb-4">{currentCategory.description}</p>
        )}
        
        {/* Display all categories in grid layout */}
        {!categoryId && (
          <>
            <h2 className="text-lg font-semibold mb-4">Browse Categories</h2>
            {isCategoriesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array(8).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-24" />
                ))}
              </div>
            ) : (
              <CategorySelector variant="grid" />
            )}
          </>
        )}
      </div>

      {/* If we're on a specific category page, show the category filter bar */}
      {categoryId && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">All Categories</h2>
          <CategorySelector selectedCategoryId={categoryId} />
        </div>
      )}

      {/* Products Grid */}
      <div className="mt-8">
        <ProductGrid 
          categoryId={categoryId} 
          showLoadMore={true}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}
