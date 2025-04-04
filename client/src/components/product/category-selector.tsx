import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { getCategories } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Icons mapping
import {
  BookOpen,
  Laptop,
  Home,
  ShoppingBag,
  Edit,
  Gamepad2,
  MoreHorizontal,
  Menu,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  books: <BookOpen className="h-6 w-6" />,
  electronics: <Laptop className="h-6 w-6" />,
  furniture: <Home className="h-6 w-6" />,
  clothing: <ShoppingBag className="h-6 w-6" />,
  stationery: <Edit className="h-6 w-6" />,
  gaming: <Gamepad2 className="h-6 w-6" />,
  more: <MoreHorizontal className="h-6 w-6" />,
};

interface CategorySelectorProps {
  className?: string;
  variant?: "horizontal" | "grid";
  selectedCategoryId?: string;
}

export default function CategorySelector({
  className,
  variant = "horizontal",
  selectedCategoryId,
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<any[]>([]);

  // Fetch categories from Firebase
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  useEffect(() => {
    if (data) {
      setCategories(data);
    }
  }, [data]);

  // Use mock data if Firebase data is not available yet
  useEffect(() => {
    if (!data && !isLoading) {
      setCategories([
        { id: "books", name: "Books", icon: "books" },
        { id: "electronics", name: "Electronics", icon: "electronics" },
        { id: "furniture", name: "Furniture", icon: "furniture" },
        { id: "clothing", name: "Clothing", icon: "clothing" },
        { id: "stationery", name: "Stationery", icon: "stationery" },
        { id: "gaming", name: "Gaming", icon: "gaming" },
        { id: "more", name: "More", icon: "more" },
      ]);
    }
  }, [data, isLoading]);

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex overflow-x-auto scrollbar-hide space-x-4 pb-2",
          className,
        )}
      >
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-2 min-w-[80px]"
            >
              <Skeleton className="h-[80px] w-[80px] rounded-lg" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div
        className={cn(
          "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4",
          className,
        )}
      >
        {categories.map((category) => (
          <Link key={category.id} href={`/categories/${category.id}`}>
            <div
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-lg border hover:border-primary transition cursor-pointer",
                selectedCategoryId === category.id
                  ? "bg-primary/10 border-primary"
                  : "bg-white border-gray-200",
              )}
            >
              <div
                className={cn(
                  "mb-2 text-gray-600",
                  selectedCategoryId === category.id && "text-primary",
                )}
              >
                {iconMap[category.icon] || <Menu className="h-6 w-6" />}
              </div>
              <span className="text-sm font-medium">{category.name}</span>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  // Default horizontal variant
  return (
    <div
      className={cn(
        "flex overflow-x-auto scrollbar-hide space-x-4 pb-2",
        className,
      )}
    >
      {categories.map((category) => (
        <Link key={category.id} href={`/categories/${category.id}`}>
          <div
            className={cn(
              "flex flex-col items-center justify-center min-w-[80px] p-3 rounded-lg border hover:border-primary transition cursor-pointer",
              selectedCategoryId === category.id
                ? "bg-primary/10 border-primary"
                : "bg-white border-gray-200",
            )}
          >
            <div
              className={cn(
                "mb-1 text-gray-600",
                selectedCategoryId === category.id && "text-primary",
              )}
            >
              {iconMap[category.icon] || <Menu className="h-6 w-6" />}
            </div>
            <span className="text-xs font-medium">{category.name}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
