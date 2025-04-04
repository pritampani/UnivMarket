import { useState } from 'react';
import { 
  getProducts, 
  getProductById, 
  addProduct, 
  updateProduct,
  uploadProductImage,
  getBidsForProduct,
  placeBid,
  createPurchase,
  getCategories
} from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';

export function useProducts() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products with filters
  const fetchProducts = async (options: {
    categoryId?: string;
    limit?: number;
    lastVisible?: any;
    isSold?: boolean;
    userId?: string;
    isFeatured?: boolean;
  } = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getProducts(options);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a specific product by ID
  const fetchProductById = async (productId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const product = await getProductById(productId);
      return product;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all product categories
  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const categories = await getCategories();
      return categories;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new product
  const createProduct = async (productData: {
    title: string;
    description: string;
    price: number;
    condition: string;
    images: string[];
    location?: string;
    isBidding?: boolean;
    categoryId: string;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user) throw new Error("User must be logged in to create a product");
      
      const result = await addProduct(productData, user.uid);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Upload product images
  const uploadImages = async (files: File[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user) throw new Error("User must be logged in to upload images");
      
      const uploadPromises = files.map(file => uploadProductImage(file, user.uid));
      const imageUrls = await Promise.all(uploadPromises);
      
      return imageUrls;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Place a bid on a product
  const submitBid = async (productId: string, amount: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user) throw new Error("User must be logged in to place a bid");
      
      const result = await placeBid(productId, user.uid, amount);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get all bids for a product
  const fetchBids = async (productId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const bids = await getBidsForProduct(productId);
      return bids;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Purchase a product
  const purchaseProduct = async (productId: string, sellerId: string, amount: number, receipt?: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user) throw new Error("User must be logged in to purchase a product");
      
      const result = await createPurchase(user.uid, sellerId, productId, amount, receipt);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    fetchProducts,
    fetchProductById,
    fetchCategories,
    createProduct,
    uploadImages,
    submitBid,
    fetchBids,
    purchaseProduct
  };
}
