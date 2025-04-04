import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { getProducts } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/product/product-card";
import AddProductModal from "@/components/product/add-product-modal";
import LoginModal from "@/components/auth/login-modal";
import SignupModal from "@/components/auth/signup-modal";
import SocialShareDialog from "@/components/product/social-share-dialog";
import { Package, ShoppingBag, Gavel, AlertTriangle, Plus, Share2 } from "lucide-react";

export default function MyListings() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [shareProduct, setShareProduct] = useState<any>(null);

  // Query active listings
  const { data: activeListings, isLoading: isActiveLoading } = useQuery({
    queryKey: ["myListings", user?.uid, "active"],
    queryFn: async () => {
      if (!user) return [];
      const result = await getProducts({
        userId: user.uid,
        isSold: false,
      });
      return result.products || [];
    },
    enabled: !!user,
  });

  // Query sold listings
  const { data: soldListings, isLoading: isSoldLoading } = useQuery({
    queryKey: ["myListings", user?.uid, "sold"],
    queryFn: async () => {
      if (!user) return [];
      const result = await getProducts({
        userId: user.uid,
        isSold: true,
      });
      return result.products || [];
    },
    enabled: !!user,
  });

  // Query bidding listings
  const { data: biddingListings, isLoading: isBiddingLoading } = useQuery({
    queryKey: ["myListings", user?.uid, "bidding"],
    queryFn: async () => {
      if (!user) return [];
      // Fetch all user's products and filter for bidding ones in memory
      const result = await getProducts({
        userId: user.uid,
      });
      // Filter to only get bidding products
      const biddingProducts = result.products?.filter(product => product.isBidding) || [];
      return biddingProducts;
    },
    enabled: !!user,
  });

  // Loading states
  const isLoadingListings = 
    (activeTab === "active" && isActiveLoading) ||
    (activeTab === "sold" && isSoldLoading) ||
    (activeTab === "bidding" && isBiddingLoading);

  // If not logged in, show login prompt
  if (!isAuthLoading && !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Sign in to UniMarket</CardTitle>
            <CardDescription>
              You need to be logged in to view and manage your listings
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="flex gap-4 w-full">
              <Button 
                className="flex-1" 
                onClick={() => setIsLoginModalOpen(true)}
              >
                Login
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsSignupModalOpen(true)}
              >
                Sign Up
              </Button>
            </div>
          </CardFooter>
        </Card>

        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
          openSignup={() => {
            setIsLoginModalOpen(false);
            setIsSignupModalOpen(true);
          }}
        />
        <SignupModal 
          isOpen={isSignupModalOpen} 
          onClose={() => setIsSignupModalOpen(false)} 
          openLogin={() => {
            setIsSignupModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
      </div>
    );
  }

  if (isAuthLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Listing
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Items</CardTitle>
              <CardDescription>Manage your product listings</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="flex gap-1">
                <Package className="h-4 w-4" />
                {activeListings?.length || 0} Active
              </Badge>
              <Badge variant="outline" className="flex gap-1">
                <ShoppingBag className="h-4 w-4" />
                {soldListings?.length || 0} Sold
              </Badge>
              <Badge variant="outline" className="flex gap-1">
                <Gavel className="h-4 w-4" />
                {biddingListings?.length || 0} Bidding
              </Badge>
            </div>
          </div>


        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="active">
                <Package className="h-4 w-4 mr-2" /> Active
              </TabsTrigger>
              <TabsTrigger value="sold">
                <ShoppingBag className="h-4 w-4 mr-2" /> Sold
              </TabsTrigger>
              <TabsTrigger value="bidding">
                <Gavel className="h-4 w-4 mr-2" /> Bidding
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {isLoadingListings ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="flex">
                        <Skeleton className="w-1/3 h-40" />
                        <div className="w-2/3 p-4 space-y-3">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeListings && activeListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeListings.map((listing) => (
                    <div key={listing.id} className="relative group border rounded-lg overflow-hidden hover:shadow-md transition-all">
                      <ProductCard
                        product={listing}
                        variant="horizontal"
                        isOwner={true}
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="secondary" 
                          size="icon"
                          className="h-8 w-8 rounded-full bg-white/90 shadow-sm hover:bg-white"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShareProduct(listing);
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                  <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                  <h3 className="text-lg font-medium">No active listings</h3>
                  <p className="text-gray-500 mt-1 mb-4">
                    You don't have any active listings yet
                  </p>
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add New Listing
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sold">
              {isLoadingListings ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="flex">
                        <Skeleton className="w-1/3 h-40" />
                        <div className="w-2/3 p-4 space-y-3">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : soldListings && soldListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {soldListings.map((listing) => (
                    <div key={listing.id} className="relative group border rounded-lg overflow-hidden hover:shadow-md transition-all">
                      <ProductCard
                        product={listing}
                        variant="horizontal"
                        isOwner={true}
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="secondary" 
                          size="icon"
                          className="h-8 w-8 rounded-full bg-white/90 shadow-sm hover:bg-white"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShareProduct(listing);
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                  <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">No sold items yet</h3>
                  <p className="text-gray-500 mt-1">
                    Items you've sold will appear here
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="bidding">
              {isLoadingListings ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="flex">
                        <Skeleton className="w-1/3 h-40" />
                        <div className="w-2/3 p-4 space-y-3">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : biddingListings && biddingListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {biddingListings.map((listing) => (
                    <div key={listing.id} className="relative group border rounded-lg overflow-hidden hover:shadow-md transition-all">
                      <ProductCard
                        product={listing}
                        variant="horizontal"
                        isOwner={true}
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="secondary" 
                          size="icon"
                          className="h-8 w-8 rounded-full bg-white/90 shadow-sm hover:bg-white"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShareProduct(listing);
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                  <Gavel className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">No bidding items</h3>
                  <p className="text-gray-500 mt-1 mb-4">
                    You don't have any items open for bidding
                  </p>
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Bidding Item
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Social Share Dialog */}
      {shareProduct && (
        <SocialShareDialog
          isOpen={!!shareProduct}
          onClose={() => setShareProduct(null)}
          product={shareProduct}
        />
      )}
    </div>
  );
}