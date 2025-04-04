import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { getPurchasesByUser, getProductById } from "@/lib/firebase";
import { downloadReceipt } from "@/utils/pdf-generator";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import LoginModal from "@/components/auth/login-modal";
import SignupModal from "@/components/auth/signup-modal";
import { format } from "date-fns";
import { Download, FileText, ShoppingBag, Filter } from "lucide-react";

export default function PurchaseHistory() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // Fetch user's purchases
  const { data: purchases, isLoading: isPurchasesLoading } = useQuery({
    queryKey: ["purchases", user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const result = await getPurchasesByUser(user.uid, "buyer");
      
      // Fetch additional product details for each purchase
      const purchasesWithDetails = await Promise.all(
        result.map(async (purchase: any) => {
          const product = await getProductById(purchase.productId);
          return {
            ...purchase,
            product
          };
        })
      );
      
      return purchasesWithDetails;
    },
    enabled: !!user,
  });

  const handleDownloadReceipt = async (purchase: any) => {
    try {
      // Generate receipt data
      await downloadReceipt({
        buyerName: user?.displayName || "Buyer",
        sellerName: purchase.product?.sellerName || "Seller",
        productTitle: purchase.product?.title || "Product",
        price: purchase.amount,
        date: new Date(purchase.createdAt),
        transactionId: purchase.id
      });
    } catch (error) {
      console.error("Error downloading receipt:", error);
    }
  };

  // If not logged in, show login prompt
  if (!isAuthLoading && !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Sign in to UniMarket</CardTitle>
            <CardDescription>
              You need to be logged in to view your purchase history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
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
          </CardContent>
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

  if (isAuthLoading || isPurchasesLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Purchase History</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-9 w-32" />
              </div>
              <div className="p-4">
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Purchase History</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Purchases</CardTitle>
          <CardDescription>
            View and manage your purchase history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {purchases && purchases.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-500">
                  Showing {purchases.length} purchase{purchases.length !== 1 ? 's' : ''}
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" /> Filter
                </Button>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((purchase: any) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">
                          {purchase.product?.title || "Unknown Product"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(purchase.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {purchase.product?.isAnonymousSeller 
                            ? "Anonymous Seller" 
                            : purchase.product?.sellerName || "Unknown"
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          ${(purchase.amount / 100).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadReceipt(purchase)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
              <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">No purchase history</h3>
              <p className="text-gray-500 mt-1">
                You haven't made any purchases yet
              </p>
              <Button className="mt-4" variant="outline">
                Browse Products
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
