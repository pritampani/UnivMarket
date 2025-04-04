import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProducts, getBulkSales } from "@/lib/firebase";
import ProductCard from "@/components/product/product-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import LoginModal from "@/components/auth/login-modal";
import { Package, Tag, ExternalLink, Users, GraduationCap } from "lucide-react";

export default function BulkSales() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Query bulk sales
  const { data: bulkSales, isLoading: isBulkSalesLoading } = useQuery({
    queryKey: ["bulkSales"],
    queryFn: getBulkSales,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Graduating Student Deals</h1>
          <p className="text-gray-600 mt-1">
            Find bulk sales from graduating students at discounted prices
          </p>
        </div>
        <Badge className="px-4 py-2 bg-secondary hover:bg-secondary/90 flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          <span>Graduation Discounts</span>
        </Badge>
      </div>

      {/* Hero section */}
      <div className="mb-10 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-secondary to-orange-600 p-6 md:p-10">
          <div className="md:flex md:items-center">
            <div className="md:w-2/3 text-white mb-6 md:mb-0 md:pr-6">
              <h2 className="text-xl md:text-2xl font-bold mb-3">Bulk Deals from Graduating Students</h2>
              <p className="mb-6">
                Graduating students often need to sell multiple items at once. Find furniture sets,
                complete study materials, electronic bundles, and more at special discounted prices!
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-white text-secondary hover:bg-gray-100">
                  <Tag className="h-4 w-4 mr-2" />
                  View All Deals
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  <Users className="h-4 w-4 mr-2" />
                  Find Sellers
                </Button>
              </div>
            </div>
            <div className="md:w-1/3">
              <img 
                src="https://images.unsplash.com/photo-1627556592933-ffe99c1cd9eb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                alt="Graduation" 
                className="rounded-lg shadow-lg h-48 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Featured bulk sales */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6">Featured Bulk Sales</h2>
        
        {isBulkSalesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : bulkSales && bulkSales.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bulkSales.map((sale: any) => (
              <Card key={sale.id} className="overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative h-40">
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 to-orange-600/80 flex items-center justify-center">
                      <div className="text-center text-white p-4">
                        <h3 className="text-xl font-bold">{sale.title}</h3>
                        {sale.discount && (
                          <Badge className="mt-2 bg-white text-secondary hover:bg-white/90">
                            {sale.discount}% OFF
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                    {sale.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-500">
                        {sale.productIds?.length || 0} items
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Posted {new Date(sale.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full">View Bundle</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">No bulk sales available</h3>
              <p className="text-gray-500 mt-1 mb-4">
                Check back soon for new bulk sales from graduating students
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* How it works */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6">How Bulk Sales Work</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
                Bundle Creation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Graduating students create bundles of items they want to sell together at a discount.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
                Browse and Select
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Browse through available bundles and select the one that contains items you need.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
                Save with Discounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Purchase the entire bundle at a discounted price, saving money compared to buying items individually.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create your own bulk sale CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="mb-6 md:mb-0 md:mr-6">
              <h3 className="text-xl font-bold mb-2">Are You Graduating?</h3>
              <p className="text-gray-600">
                Create your own bulk sale bundle and sell multiple items at once.
                Perfect for when you're moving out and need to sell quickly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setIsLoginModalOpen(true)}>
                Create Bulk Sale
              </Button>
              <Button variant="outline">
                Learn More <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        openSignup={() => {
          setIsLoginModalOpen(false);
        }}
      />
    </div>
  );
}
