import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { 
  copyToClipboard, 
  generateShareUrl, 
  isWebShareAvailable, 
  shareToFacebook, 
  shareToTwitter, 
  shareToLinkedIn, 
  shareToWhatsApp, 
  shareToTelegram,
  shareToPinterest,
  useWebShare
} from "@/utils/social-share";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Copy, 
  Share2, 
  MessageCircle,
  Send,
  Image as ImageIcon,
  PenTool,
  Share
} from "lucide-react";
import { FaWhatsapp, FaTelegram, FaPinterest } from "react-icons/fa";

interface SocialShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price: number;
    description?: string;
    images: string[];
    categoryName?: string;
  };
}

export default function SocialShareDialog({ 
  isOpen, 
  onClose,
  product 
}: SocialShareDialogProps) {
  const [customMessage, setCustomMessage] = useState(
    `Check out this amazing product: ${product.title} for ₹${product.price} on UniMarket!`
  );
  
  const [activeTab, setActiveTab] = useState("quick-share");
  
  // Generate full URL to product page
  const getProductUrl = () => {
    const baseUrl = `${window.location.origin}/product-detail?id=${product.id}`;
    return baseUrl;
  };
  
  // Handle share actions with tracking
  const handleShare = (platform: string) => {
    const shareParams = {
      title: product.title,
      text: customMessage,
      url: generateShareUrl(getProductUrl(), platform),
      image: product.images && product.images.length > 0 ? product.images[0] : undefined,
      hashtags: ["UniMarket", "StudentMarketplace", "University", product.categoryName || "Products"]
    };
    
    try {
      switch (platform) {
        case 'facebook':
          shareToFacebook(shareParams);
          break;
        case 'twitter':
          shareToTwitter(shareParams);
          break;
        case 'whatsapp':
          shareToWhatsApp(shareParams);
          break;
        case 'linkedin':
          shareToLinkedIn(shareParams);
          break;
        case 'telegram':
          shareToTelegram(shareParams);
          break;
        case 'pinterest':
          if (product.images && product.images.length > 0) {
            shareToPinterest(shareParams);
          } else {
            toast({
              title: "Image Required",
              description: "Pinterest sharing requires at least one product image.",
              variant: "destructive",
            });
          }
          break;
        case 'copy':
          copyToClipboard(getProductUrl())
            .then(() => {
              toast({
                title: "Link Copied!",
                description: "Product link copied to clipboard",
              });
            })
            .catch(() => {
              toast({
                title: "Failed to Copy",
                description: "Could not copy the link to clipboard.",
                variant: "destructive",
              });
            });
          break;
        case 'native':
          if (isWebShareAvailable()) {
            useWebShare(shareParams)
              .catch(error => {
                console.error('Web Share API error:', error);
                toast({
                  title: "Sharing Failed",
                  description: "Could not share using your device. Try another method.",
                  variant: "destructive",
                });
              });
          } else {
            toast({
              title: "Not Supported",
              description: "Web Share API is not supported on this device.",
              variant: "destructive",
            });
            setActiveTab("social");
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      toast({
        title: "Sharing Failed",
        description: `Could not share to ${platform}. Please try another option.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share Your Product
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick-share">Quick Share</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
          </TabsList>
          
          {/* Quick Share Tab */}
          <TabsContent value="quick-share" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex justify-center gap-4 py-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-14 w-14 rounded-full" 
                  onClick={() => handleShare('whatsapp')}
                >
                  <FaWhatsapp className="h-6 w-6 text-green-600" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-14 w-14 rounded-full" 
                  onClick={() => handleShare('copy')}
                >
                  <Copy className="h-6 w-6 text-gray-600" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-14 w-14 rounded-full" 
                  onClick={() => handleShare('native')}
                >
                  <Share2 className="h-6 w-6 text-indigo-600" />
                </Button>
              </div>
              
              <p className="text-center text-sm text-muted-foreground">
                Share via WhatsApp, copy the link, or use your device's share feature
              </p>
            </div>
            
            <div className="rounded-md bg-secondary p-3">
              <div className="flex items-start space-x-3">
                <div className="h-12 w-12 overflow-hidden rounded-md">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.title} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{product.title}</p>
                  <p className="text-sm text-muted-foreground">
                    ₹{product.price / 100} · {product.categoryName || "Product"}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-4 pt-4">
            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                className="flex h-20 flex-col items-center justify-center gap-1" 
                onClick={() => handleShare('facebook')}
              >
                <Facebook className="h-8 w-8 text-blue-600" />
                <span className="text-xs">Facebook</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex h-20 flex-col items-center justify-center gap-1" 
                onClick={() => handleShare('twitter')}
              >
                <Twitter className="h-8 w-8 text-sky-500" />
                <span className="text-xs">Twitter</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex h-20 flex-col items-center justify-center gap-1" 
                onClick={() => handleShare('whatsapp')}
              >
                <FaWhatsapp className="h-8 w-8 text-green-600" />
                <span className="text-xs">WhatsApp</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex h-20 flex-col items-center justify-center gap-1" 
                onClick={() => handleShare('telegram')}
              >
                <FaTelegram className="h-8 w-8 text-blue-500" />
                <span className="text-xs">Telegram</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex h-20 flex-col items-center justify-center gap-1" 
                onClick={() => handleShare('linkedin')}
              >
                <Linkedin className="h-8 w-8 text-blue-700" />
                <span className="text-xs">LinkedIn</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex h-20 flex-col items-center justify-center gap-1" 
                onClick={() => handleShare('pinterest')}
              >
                <FaPinterest className="h-8 w-8 text-red-600" />
                <span className="text-xs">Pinterest</span>
              </Button>
            </div>
          </TabsContent>
          
          {/* Customize Tab */}
          <TabsContent value="customize" className="space-y-4 pt-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="share-message">Customize Your Message</Label>
                <Textarea
                  id="share-message"
                  placeholder="Enter your custom share message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="share-link">Share Link</Label>
                <div className="flex space-x-2">
                  <Input
                    id="share-link"
                    value={getProductUrl()}
                    readOnly
                    className="flex-1"
                  />
                  <Button 
                    variant="secondary" 
                    size="icon"
                    onClick={() => handleShare('copy')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                <div className="rounded-md border p-3">
                  <p className="text-sm">{customMessage}</p>
                  <p className="mt-2 text-xs text-blue-600 underline">
                    {getProductUrl()}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Sharing helps you sell faster!
          </p>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}