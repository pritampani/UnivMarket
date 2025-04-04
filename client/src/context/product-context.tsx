import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { getProducts, getCategories } from "@/lib/firebase";

interface ProductContextType {
  featuredProducts: any[];
  recentProducts: any[];
  categories: any[];
  isFeaturedLoading: boolean;
  isRecentLoading: boolean;
  isCategoriesLoading: boolean;
  fetchProductsByCategory: (categoryId: string) => Promise<any[]>;
  fetchProductById: (productId: string) => Promise<any>;
  refreshProducts: () => void;
}

export const ProductContext = createContext<ProductContextType>({
  featuredProducts: [],
  recentProducts: [],
  categories: [],
  isFeaturedLoading: true,
  isRecentLoading: true,
  isCategoriesLoading: true,
  fetchProductsByCategory: async () => [],
  fetchProductById: async () => ({}),
  refreshProducts: () => {},
});

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider = ({ children }: ProductProviderProps) => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [isRecentLoading, setIsRecentLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  const loadFeaturedProducts = async () => {
    setIsFeaturedLoading(true);
    try {
      const result = await getProducts({ isFeatured: true, limit: 8 });
      setFeaturedProducts(result.products || []);
    } catch (error) {
      console.error("Error loading featured products:", error);
    } finally {
      setIsFeaturedLoading(false);
    }
  };

  const loadRecentProducts = async () => {
    setIsRecentLoading(true);
    try {
      const result = await getProducts({ limit: 10 });
      setRecentProducts(result.products || []);
    } catch (error) {
      console.error("Error loading recent products:", error);
    } finally {
      setIsRecentLoading(false);
    }
  };

  const loadCategories = async () => {
    setIsCategoriesLoading(true);
    try {
      const result = await getCategories();
      setCategories(result || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryId: string): Promise<any[]> => {
    try {
      const result = await getProducts({ categoryId, limit: 20 });
      return result.products || [];
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error);
      return [];
    }
  };

  const fetchProductById = async (productId: string): Promise<any> => {
    try {
      // This function is already implemented in Firebase lib
      // Just re-exporting it from context for convenience
      const product = await import("@/lib/firebase").then(
        (module) => module.getProductById(productId)
      );
      return product;
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      throw error;
    }
  };

  const refreshProducts = () => {
    loadFeaturedProducts();
    loadRecentProducts();
  };

  useEffect(() => {
    loadFeaturedProducts();
    loadRecentProducts();
    loadCategories();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        featuredProducts,
        recentProducts,
        categories,
        isFeaturedLoading,
        isRecentLoading,
        isCategoriesLoading,
        fetchProductsByCategory,
        fetchProductById,
        refreshProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
