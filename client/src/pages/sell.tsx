import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCategories, addProduct, uploadProductImage } from "@/lib/firebase";
import LoginModal from "@/components/auth/login-modal";
import SignupModal from "@/components/auth/signup-modal";
import { z } from "zod";
import { Plus, Upload, X } from "lucide-react";

const productFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }).max(100),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Price must be a positive number",
  }),
  condition: z.string().min(1, { message: "Please select a condition" }),
  categoryId: z.string().min(1, { message: "Please select a category" }),
  location: z.string().optional(),
  isBidding: z.boolean().default(false),
});

export default function Sell() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      condition: "",
      categoryId: "",
      location: "",
      isBidding: false,
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setIsUploading(true);

    try {
      const newImages = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = await uploadProductImage(file, user.uid);
        newImages.push(imageUrl);
      }

      setUploadedImages([...uploadedImages, ...newImages]);
      
      toast({
        title: "Images uploaded",
        description: `Successfully uploaded ${newImages.length} image(s)`,
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...uploadedImages];
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  const onSubmit = async (values: z.infer<typeof productFormSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a listing",
        variant: "destructive",
      });
      setIsLoginModalOpen(true);
      return;
    }

    if (uploadedImages.length === 0) {
      toast({
        title: "Images required",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        title: values.title,
        description: values.description,
        price: parseFloat(values.price) * 100, // Convert to cents
        condition: values.condition,
        images: uploadedImages,
        location: values.location,
        isBidding: values.isBidding,
        categoryId: values.categoryId,
      };

      await addProduct(productData, user.uid);
      
      toast({
        title: "Listing created",
        description: "Your product has been listed successfully!",
      });
      
      // Reset form and redirect to my listings
      form.reset();
      setUploadedImages([]);
      setLocation("/my-listings");
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
              You need to be logged in to create a listing
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create a New Listing</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>
            Provide information about what you're selling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Calculus Textbook 8th Edition" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A clear title helps buyers find your item
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your item in detail" 
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Include details like brand, model, age, and any defects
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          step="0.01"
                          min="0"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="like-new">Like New</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category: any) => (
                          <SelectItem 
                            key={category.id} 
                            value={category.id}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. North Campus Library" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Where on campus can buyers meet you?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isBidding"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Allow bidding on this item</FormLabel>
                      <FormDescription>
                        Buyers can place bids instead of purchasing directly
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel>Images</FormLabel>
                <div className="mt-2">
                  <FormDescription className="mb-2">
                    Upload at least one image of your item
                  </FormDescription>
                  
                  <div className="flex flex-wrap gap-4 mt-2">
                    {uploadedImages.map((imageUrl, index) => (
                      <div 
                        key={index}
                        className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200"
                      >
                        <img 
                          src={imageUrl} 
                          alt={`Product ${index}`} 
                          className="w-full h-full object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-5 w-5"
                          onClick={() => removeImage(index)}
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    <label className="w-24 h-24 flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-md cursor-pointer hover:border-primary transition">
                      {isUploading ? (
                        <div className="animate-spin h-5 w-5 border-b-2 rounded-full border-primary" />
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500">Add Image</span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  
                  {uploadedImages.length === 0 && (
                    <p className="text-red-500 text-sm mt-2">
                      At least one image is required
                    </p>
                  )}
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-b-2 rounded-full border-current" />
                    Creating Listing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Listing
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
