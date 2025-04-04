import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/firebase";
import ProductCard from "./product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

interface RecentProductsProps {
  limit?: number;
  showViewAll?: boolean;
}

export default function RecentProducts({ limit = 5, showViewAll = true }: RecentProductsProps) {
  const [products, setProducts] = useState<any[]>([]);
  
  const { data, isLoading } = useQuery({
    queryKey: ["recent-products", limit],
    queryFn: async () => {
      return await getProducts({
        limit,
        isSold: false,
      });
    },
  });

  useEffect(() => {
    if (data?.products) {
      setProducts(data.products);
    }
  }, [data]);

  // Skeleton loading state
  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-36" />
          {showViewAll && <Skeleton className="h-6 w-16" />}
        </div>
        <div className="flex overflow-x-auto scrollbar-hide space-x-4 pb-2">
          {Array(limit).fill(0).map((_, index) => (
            <div key={index} className="flex-none w-64 border border-gray-200 rounded-lg overflow-hidden">
              <Skeleton className="h-36 w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) {
    return null;
  }

  return (
    <div>
      <section className="py-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Categories</h2>
          <Link href="/categories">
            <span className="text-primary text-sm font-medium cursor-pointer">View All</span>
          </Link>
        </div>
      </section>
      
      <div className="flex overflow-x-auto scrollbar-hide space-x-4 pb-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} variant="small" />
        ))}
      </div>
    </div>
  );
}
