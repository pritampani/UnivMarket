import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import ProductCard from "@/components/product/product-card";
import EditProductModal from "@/components/product/edit-product-modal";
import SocialShareDialog from "@/components/product/social-share-dialog";
import { getProductById, getBidsForProduct, placeBid, sendMessage, createPurchase } from "@/lib/firebase";
import { generateReceipt } from "@/utils/pdf-generator";
import { Heart, MessageCircle, ShoppingCart, Gavel, Star, Phone, Edit, Tag, Share2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Fetch product details
  const { data: product, isLoading: isLoadingProduct, refetch: refetchProduct } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!productId) return null;
      const result = await getProductById(productId);
      console.log("Fetched product data:", result);
      return result;
    },
    enabled: !!productId,
  });

  // Fetch bids for product
  const { data: bids, isLoading: isLoadingBids, refetch: refetchBids } = useQuery({
    queryKey: ["bids", productId],
    queryFn: async () => {
      if (!productId) return [];
      return await getBidsForProduct(productId);
    },
    enabled: !!productId && !!product?.isBidding,
  });

  // Get highest bid amount
  const highestBid = bids && bids.length > 0 ? bids[0].amount : 0;

  // Fetch similar products from the same category
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);

  useEffect(() => {
    async function fetchSimilarProducts() {
      if (product?.categoryId && product?.id) {
        setIsSimilarLoading(true);
        try {
          // Import getProducts function from firebase.ts
          const { getProducts } = await import('@/lib/firebase');

          // Fetch products from the same category, excluding the current product
          const { products: queryProducts } = await getProducts({
            categoryId: product.categoryId,
            limit: 5,  // Fetch a few extra in case we need to filter out this product or sold ones
            isSold: false
          });

          // Filter out the current product and ensure we show max 4 items
          const relevantProducts = queryProducts
            .filter(p => p.id !== product.id)
            .slice(0, 4);

          setSimilarProducts(relevantProducts);
        } catch (error) {
          console.error("Error fetching similar products:", error);
          setSimilarProducts([]);
        } finally {
          setIsSimilarLoading(false);
        }
      }
    }

    fetchSimilarProducts();
  }, [product]);

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

    const amount = parseFloat(bidAmount) * 100; // Convert to cents

    if (amount <= highestBid) {
      toast({
        title: "Bid too low",
        description: `Your bid must be higher than the current highest bid ($${(highestBid / 100).toFixed(2)})`,
        variant: "destructive"
      });
      return;
    }

    setIsBidding(true);

    try {
      await placeBid(productId!, user.uid, amount);
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
      setIsBidding(false);
    }
  };

  const [showSellerContact, setShowSellerContact] = useState(false);

  // Function to show seller contact information 
  const showContactInformation = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to view seller contact information",
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

    // Show contact information UI
    setShowSellerContact(true);

    // Also show in a toast for immediate feedback
    const sellerPhoneNumber = product.whatsappNumber || "Not provided";
    toast({
      title: "Seller Contact Information",
      description: `Phone/WhatsApp: ${sellerPhoneNumber}`,
      duration: 5000,
    });
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

    setIsMessaging(true);

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
      setIsMessaging(false);
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

    try {
      // Format the phone number by removing any non-digit characters
      const formattedNumber = product.whatsappNumber.replace(/\D/g, '');

      // Create a message with product details
      const text = `Hi, I'm interested in your product "${product.title}" on UniMarket.`;

      // Create the WhatsApp URL - Make sure to include country code if missing
      const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(text)}`;

      // Open in a new tab
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      // Log for debugging
      console.log(`Opening WhatsApp with number: ${formattedNumber}`);
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      toast({
        title: "WhatsApp Error",
        description: "There was a problem opening WhatsApp. Please try copying the seller's number manually.",
        variant: "destructive"
      });
    }
  };

  // Loading state
  if (isLoadingProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="md:flex">
          <div className="md:w-1/2 md:pr-4">
            <div className="relative pb-[75%] mb-2 rounded-lg overflow-hidden border border-gray-200">
              <Skeleton className="absolute h-full w-full" />
            </div>
            <div className="flex space-x-2 overflow-x-auto">
              {[1, 2, 3].map((_, index) => (
                <Skeleton key={index} className="flex-none w-16 h-16 rounded-md" />
              ))}
            </div>
          </div>

          <div className="md:w-1/2 mt-4 md:mt-0">
            <Skeleton className="h-8 w-2/3 mb-1" />
            <Skeleton className="h-4 w-1/3 mb-4" />

            <Skeleton className="h-8 w-1/4 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />

            <Skeleton className="h-36 w-full mb-4" />

            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p>The product you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const isProductOwner = user && user.uid === product.userId;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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
              {product.isSold && (
                <Badge variant="destructive" className="mt-1">
                  <Tag className="h-3 w-3 mr-1" />
                  Sold
                </Badge>
              )}
            </div>
            <div className="flex space-x-1">
              {isProductOwner && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-400 hover:text-blue-500"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit className="h-5 w-5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                <Heart className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-blue-500"
                onClick={() => setIsShareDialogOpen(true)}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
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
                  disabled={isBidding}
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
              {/* Show contact information alert if it's displayed */}
              {showSellerContact && (
                <Alert className="bg-green-50 border-green-200">
                  <Phone className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Seller Contact</AlertTitle>
                  <AlertDescription className="text-green-700">
                    <div className="font-medium">Phone/WhatsApp: {product.whatsappNumber || "Not provided"}</div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Show "Edit Listing" for owner, WhatsApp contact for others */}
              {isProductOwner ? (
                <Button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product Listing
                </Button>
              ) : (
                <Button 
                  onClick={openWhatsApp}
                  disabled={product.isSold || !product.whatsappNumber}
                  className="w-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {product.isSold ? 'Sold Out' : 'Contact Seller on WhatsApp'}
                </Button>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-col space-y-3">

            <div className="flex space-x-2">
              <Input 
                placeholder="Message the seller..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={handleMessageSend}
                disabled={isMessaging}
                className="self-end"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>

      

      {/* Edit Product Modal */}
      {product && isEditModalOpen && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            refetchProduct(); // Refresh product data after editing
          }}
          product={product}
        />
      )}

      {/* Share Dialog */}
      {product && (
        <SocialShareDialog
          isOpen={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          product={{
            id: product.id,
            title: product.title,
            price: product.price,
            description: product.description,
            images: product.images,
            categoryName: product.categoryName
          }}
        />
      )}
    </div>
  );
}