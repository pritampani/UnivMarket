import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Heart, ShoppingCart, MessageCircle, Gavel, Star } from "lucide-react";
import { getProductById, getBidsForProduct, placeBid, createPurchase, sendMessage } from "@/lib/firebase";
import { format } from "date-fns";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { generateReceipt } from "@/utils/pdf-generator";
import ProductCard from "./product-card";

interface ProductDetailModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
  product?: any; // Add optional product prop
}

export default function ProductDetailModal({ productId, isOpen, onClose, product: initialProduct }: ProductDetailModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch product details if not provided
  const { data: fetchedProduct, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const data = await getProductById(productId);
      return data;
    },
    enabled: isOpen && !!productId && !initialProduct,
  });

  const product = initialProduct || fetchedProduct;

  // Fetch bids for the product
  const { data: bids, isLoading: isLoadingBids, refetch: refetchBids } = useQuery({
    queryKey: ["bids", productId],
    queryFn: async () => {
      const data = await getBidsForProduct(productId);
      return data;
    },
    enabled: isOpen && !!productId && !!product?.isBidding,
  });

  // Get highest bid amount
  const highestBid = bids && bids.length > 0 ? bids[0].amount : 0;

  // // Fetch similar products (simplified mock for now)
  // useEffect(() => {
  //   if (product?.categoryId) {
  //     // In a real app, this would query Firebase for similar products
  //     setSimilarProducts([
  //       {
  //         id: "1",
  //         title: "Similar Item 1",
  //         price: 4000,
  //         images: ["https://images.unsplash.com/photo-1603871165848-0aa92c869fa1"],
  //         categoryName: product.categoryName,
  //         createdAt: new Date()
  //       },
  //       {
  //         id: "2",
  //         title: "Similar Item 2",
  //         price: 3000,
  //         images: ["https://images.unsplash.com/photo-1598618443855-232ee0f819f6"],
  //         categoryName: product.categoryName,
  //         createdAt: new Date()
  //       },
  //       {
  //         id: "3",
  //         title: "Similar Item 3",
  //         price: 3800,
  //         images: ["https://images.unsplash.com/photo-1576333804216-89eb7443a97a"],
  //         categoryName: product.categoryName,
  //         createdAt: new Date()
  //       },
  //       {
  //         id: "4",
  //         title: "Similar Item 4",
  //         price: 4200,
  //         images: ["https://images.unsplash.com/photo-1543002588-bfa74002ed7e"],
  //         categoryName: product.categoryName,
  //         createdAt: new Date()
  //       }
  //     ]);
  //   }
  // }, [product]);

  const handleBidSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to place a bid",
        variant: "destructive"
      });
      return;
    }

    if (!bidAmount || isNaN(parseFloat(bidAmount))) {
      toast({
        title: "Invalid bid",
        description: "Please enter a valid bid amount",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(bidAmount) ; // Convert to cents

    if (amount <= highestBid) {
      toast({
        title: "Bid too low",
        description: `Your bid must be higher than the current highest bid (₹${(highestBid / 100).toFixed(2)})`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await placeBid(productId, user.uid, amount);
      await refetchBids();
      setBidAmount("");

      toast({
        title: "Bid placed",
        description: "Your bid has been placed successfully",
      });
    } catch (error) {
      console.error("Error placing bid:", error);
      toast({
        title: "Error",
        description: "Failed to place bid. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to purchase this item",
        variant: "destructive"
      });
      return;
    }

    if (!product || !product.userId) {
      toast({
        title: "Error",
        description: "Product information is incomplete",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate receipt data
      const receipt = await generateReceipt({
        buyerName: user.displayName || "User",
        sellerName: product.sellerName || "Seller",
        productTitle: product.title,
        price: product.price,
        date: new Date(),
        transactionId: `TRX-${Date.now()}`
      });

      // Create purchase record
      await createPurchase(
        user.uid,
        product.userId,
        productId,
        product.price,
        receipt
      );

      toast({
        title: "Purchase successful",
        description: "Your purchase has been completed successfully",
      });

      // Close modal after purchase
      onClose();
    } catch (error) {
      console.error("Error completing purchase:", error);
      toast({
        title: "Error",
        description: "Failed to complete purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMessageSend = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to message the seller",
        variant: "destructive"
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message to send",
        variant: "destructive"
      });
      return;
    }

    if (!product || !product.userId) {
      toast({
        title: "Error",
        description: "Seller information is unavailable",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await sendMessage(
        user.uid,
        product.userId,
        message,
        productId
      );

      setMessage("");

      toast({
        title: "Message sent",
        description: "Your message has been sent to the seller",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    if (!product?.whatsappNumber) {
      toast({
        title: "WhatsApp unavailable",
        description: "This seller has not provided a WhatsApp number",
        variant: "destructive"
      });
      return;
    }

    const text = `Hi, I'm interested in your product "${product.title}" on UniMarket.`;
    const whatsappUrl = `https://wa.me/${product.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoadingProduct) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading product details...</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!product) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product not found</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="text-center py-8">
            <p>This product could not be found or has been removed.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="p-4">
          <div className="md:flex">
            {/* Product Images */}
            <div className="md:w-1/2 md:pr-4">
              <div className="relative pb-[75%] mb-2 rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={product.images[selectedImageIndex]} 
                  alt={product.title} 
                  className="absolute h-full w-full object-cover" 
                />
              </div>
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button 
                    key={index}
                    className={`flex-none w-16 h-16 rounded-md overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-primary' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img 
                      src={image} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="h-full w-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 mt-4 md:mt-0">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{product.title}</h1>
                  <p className="text-gray-500 text-sm">{product.categoryName} {product.subcategory && `• ${product.subcategory}`}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-4">
                <p className="text-2xl font-bold text-primary">₹{(product.price / 100).toFixed(2)}</p>
                {product.isBidding && highestBid > 0 && (
                  <p className="text-sm text-gray-600">Current highest bid: ₹{(highestBid / 100).toFixed(2)}</p>
                )}
                {product.sellerRating && (
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.round(product.sellerRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-sm text-gray-500 ml-1">
                      Seller rating ({product.sellerRating}/5)
                    </span>
                  </div>
                )}
              </div>

              <Tabs defaultValue="description" className="mt-4">
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="pt-2">
                  <p className="text-gray-600 text-sm">{product.description}</p>
                </TabsContent>
                <TabsContent value="details" className="pt-2">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Condition:</span>
                      <span className="ml-1 text-gray-900">{product.condition}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Posted:</span>
                      <span className="ml-1 text-gray-900">
                        {format(new Date(product.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {product.isbn && (
                      <div>
                        <span className="text-gray-500">ISBN:</span>
                        <span className="ml-1 text-gray-900">{product.isbn}</span>
                      </div>
                    )}
                    {product.location && (
                      <div>
                        <span className="text-gray-500">Location:</span>
                        <span className="ml-1 text-gray-900">{product.location}</span>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4">
                <h3 className="font-medium">Seller</h3>
                <div className="flex items-center mt-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={product.sellerPhotoURL} alt="Seller" />
                    <AvatarFallback>{product.sellerName?.charAt(0) || 'S'}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {product.isAnonymousSeller ? 'Anonymous Seller' : product.sellerName}
                    </p>
                    {product.sellerYearLevel && product.sellerUniversity && (
                      <p className="text-xs text-gray-500">
                        {product.sellerUniversity}, {product.sellerYearLevel}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {product.isBidding ? (
                <div className="mt-6">
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Enter bid amount"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="flex-1"
                      min={(highestBid / 100) + 0.01}
                      step="0.01"
                    />
                    <Button 
                      onClick={handleBidSubmit}
                      disabled={isSubmitting}
                      className="whitespace-nowrap"
                    >
                      <Gavel className="h-4 w-4 mr-2" />
                      Place Bid
                    </Button>
                  </div>
                  {isLoadingBids ? (
                    <p className="text-sm text-gray-500 mt-2">Loading bids...</p>
                  ) : bids && bids.length > 0 ? (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">{bids.length} bid(s) so far</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">No bids yet. Be the first!</p>
                  )}
                </div>
              ) : (
                <div className="mt-6 flex flex-col space-y-3">
                  <Button 
                    onClick={handleBuyNow}
                    disabled={isSubmitting || product.isSold}
                    className="w-full"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.isSold ? 'Sold Out' : 'Buy Now'}
                  </Button>
                </div>
              )}

              <div className="mt-3 flex flex-col space-y-3">
                <Button 
                  variant="secondary" 
                  onClick={openWhatsApp}
                  className="w-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp Seller
                </Button>

                <div className="flex space-x-2">
                  <Textarea 
                    placeholder="Message the seller..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleMessageSend}
                    disabled={isSubmitting}
                    className="self-end"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Items */}
          {similarProducts.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h3 className="font-medium mb-3">Similar Items</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {similarProducts.map((item) => (
                  <ProductCard key={item.id} product={item} variant="small" />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}