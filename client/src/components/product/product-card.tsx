import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Clock, ImageOff, Loader2, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ProductDetailModal from "./product-detail-modal";
import { getSecureImageUrl } from "@/utils/storage-utils";
import EditProductModal from "./edit-product-modal";


interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    images: string[];
    categoryName: string;
    subcategory?: string;
    createdAt: Date;
    isFeatured?: boolean;
    isBidding?: boolean;
    currentBid?: number;
  };
  variant?: "grid" | "horizontal" | "small";
  isOwner?: boolean; // Added isOwner prop
}

export default function ProductCard({
  product,
  variant = "grid",
  isOwner = false, // Added default value for isOwner
}: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Added edit modal state

  // Get secure image URL to avoid CORS issues
  useEffect(() => {
    async function loadImage() {
      if (!product.images || product.images.length === 0) {
        setIsLoading(false);
        setHasError(true);
        return;
      }

      try {
        setIsLoading(true);
        // Try to get secure URL for Firebase Storage images
        if (product.images[0].includes("firebasestorage.googleapis.com")) {
          const secureUrl = await getSecureImageUrl(product.images[0]);
          setImageSrc(secureUrl);
        } else {
          // For regular URLs
          setImageSrc(product.images[0]);
        }
        setHasError(false);
      } catch (error) {
        console.error("Error loading image:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadImage();
  }, [product.images]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  // Format the timeAgo string
  const timeAgo = formatDistanceToNow(new Date(product.createdAt), {
    addSuffix: true,
  });

  // Function to render image with error handling
  const renderImage = () => {
    if (isLoading) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      );
    }

    if (hasError || !imageSrc) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <ImageOff className="h-8 w-8 text-gray-400" />
        </div>
      );
    }

    return (
      <img
        src={imageSrc}
        alt={product.title}
        className="h-full w-full object-cover"
        onError={() => setHasError(true)}
      />
    );
  };

  // Small variant
  if (variant === "small") {
    return (
      <>
        <Card
          className="flex-none w-64 overflow-hidden hover:shadow-md transition cursor-pointer"
          onClick={openModal}
        >
          <div className="relative h-36">{renderImage()}</div>
          <CardContent className="p-3">
            <h3 className="font-medium text-gray-900 text-sm">
              {product.title}
            </h3>
            <p className="text-primary font-semibold text-sm mt-1">
              ₹{(product.price / 100).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {isModalOpen && (
          <ProductDetailModal
            productId={product.id}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        )}
        {isEditModalOpen && (
          <EditProductModal product={product} isOpen={isEditModalOpen} onClose={closeEditModal} />
        )}
      </>
    );
  }

  // Horizontal variant
  if (variant === "horizontal") {
    return (
      <>
        <Card
          className="overflow-hidden hover:shadow-md transition cursor-pointer"
          onClick={openModal}
        >
          <div className="flex">
            <div className="w-1/3 relative">
              {renderImage()}
              {product.isFeatured && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-secondary hover:bg-secondary">
                    Featured
                  </Badge>
                </div>
              )}
            </div>
            <CardContent className="w-2/3 p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900 mb-1">
                  {product.title}
                </h3>
                <div className="flex gap-1">
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-blue-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={isFavorite ? "text-red-500" : "text-gray-400"}
                    onClick={toggleFavorite}
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                {product.categoryName}{" "}
                {product.subcategory && `• ${product.subcategory}`}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary font-semibold">
                    ₹{(product.price / 100).toFixed(2)}
                  </p>
                  {product.isBidding && product.currentBid && (
                    <p className="text-xs text-gray-500">
                      Current bid: ₹{(product.currentBid / 100).toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {timeAgo}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {isModalOpen && (
          <ProductDetailModal
            productId={product.id}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        )}
        {isEditModalOpen && (
          <EditProductModal product={product} isOpen={isEditModalOpen} onClose={closeEditModal} />
        )}
      </>
    );
  }

  // Default grid variant
  return (
    <>
      <Card
        className="overflow-hidden hover:shadow-md transition cursor-pointer"
        onClick={openModal}
      >
        <div className="relative pb-[70%]">
          <div className="absolute inset-0">{renderImage()}</div>
          {product.isFeatured && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-secondary hover:bg-secondary">
                Featured
              </Badge>
            </div>
          )}
          {product.isBidding && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-yellow-500 hover:bg-yellow-600">
                Bidding
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900 mb-1">{product.title}</h3>
            <div className="flex gap-1">
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditModalOpen(true);
                  }}
                >
                  <Edit className="h-5 w-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={isFavorite ? "text-red-500" : "text-gray-400"}
                onClick={toggleFavorite}
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            {product.categoryName}{" "}
            {product.subcategory && `• ${product.subcategory}`}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary font-semibold">
                ₹{(product.price / 100).toFixed(2)}
              </p>
              {product.isBidding && product.currentBid && (
                <p className="text-xs text-gray-500">
                  Current bid: ₹{(product.currentBid / 100).toFixed(2)}
                </p>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {timeAgo}
            </div>
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <ProductDetailModal
          productId={product.id}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
      {isEditModalOpen && (
        <EditProductModal product={product} isOpen={isEditModalOpen} onClose={closeEditModal} />
      )}
    </>
  );
}