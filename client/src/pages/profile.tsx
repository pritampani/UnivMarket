import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getProductById, uploadProfileImage, updateUserProfile } from "@/lib/firebase";
import ProductCard from "@/components/product/product-card";
import LoginModal from "@/components/auth/login-modal";
import SignupModal from "@/components/auth/signup-modal";
import { z } from "zod";
import { User, Upload, Settings, Package, Clock } from "lucide-react";

const profileFormSchema = z.object({
  displayName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  university: z.string().optional(),
  yearLevel: z.string().optional(),
  phoneNumber: z.string().optional(),
  whatsappNumber: z.string().optional(),
  isAnonymousSeller: z.boolean().default(false),
  bio: z.string().max(500).optional(),
});

export default function Profile() {
  const { user, userDetails, isLoading } = useAuth();
  const { toast } = useToast();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: userDetails?.displayName || user?.displayName || "",
      university: userDetails?.university || "",
      yearLevel: userDetails?.yearLevel || "",
      phoneNumber: userDetails?.phoneNumber || "",
      whatsappNumber: userDetails?.whatsappNumber || "",
      isAnonymousSeller: userDetails?.isAnonymousSeller || false,
      bio: userDetails?.bio || "",
    },
  });

  // Query user's listings
  const { data: userListings } = useQuery({
    queryKey: ["userListings", user?.uid],
    queryFn: async () => {
      // This would be replaced with an actual call to get user's listings
      // For now, using mock data
      return [
        {
          id: "listing1",
          title: "Calculus Textbook",
          price: 4500,
          images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f"],
          categoryName: "Books",
          createdAt: new Date(),
        },
        {
          id: "listing2",
          title: "Study Desk Lamp",
          price: 2500,
          images: ["https://images.unsplash.com/photo-1519710164239-da123dc03ef4"],
          categoryName: "Furniture",
          createdAt: new Date(),
        },
      ];
    },
    enabled: !!user,
  });

  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      await updateUserProfile(user, values);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);

    try {
      const imageUrl = await uploadProfileImage(file, user.uid);
      
      // Update user profile with new image
      await updateUserProfile(user, { photoURL: imageUrl });
      
      toast({
        title: "Profile image updated",
        description: "Your profile image has been updated successfully",
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // If user is not logged in, show login prompt
  if (!isLoading && !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Sign in to UniMarket</CardTitle>
            <CardDescription>
              You need to be logged in to view and manage your profile
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="md:flex md:items-start md:gap-8">
        {/* Profile sidebar */}
        <div className="md:w-1/3 lg:w-1/4 mb-6 md:mb-0">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback className="text-3xl">
                      {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User />}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Image upload button */}
                  <label 
                    htmlFor="profile-image" 
                    className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    <input 
                      id="profile-image" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                
                <h2 className="mt-4 text-xl font-bold">{user?.displayName}</h2>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                
                {userDetails?.university && userDetails?.yearLevel && (
                  <div className="mt-2 text-sm text-center">
                    <p>{userDetails.university}</p>
                    <p>{userDetails.yearLevel}</p>
                  </div>
                )}
                
                <div className="mt-4 w-full">
                  <Separator />
                  
                  <div className="mt-4 flex justify-between text-sm text-gray-500">
                    <div className="text-center">
                      <p className="font-bold text-black">{userListings?.length || 0}</p>
                      <p>Listings</p>
                    </div>
                    <Separator orientation="vertical" />
                    <div className="text-center">
                      <p className="font-bold text-black">0</p>
                      <p>Sold</p>
                    </div>
                    <Separator orientation="vertical" />
                    <div className="text-center">
                      <p className="font-bold text-black">0</p>
                      <p>Purchases</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="md:flex-1">
          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" /> Profile
              </TabsTrigger>
              <TabsTrigger value="listings">
                <Package className="h-4 w-4 mr-2" /> My Listings
              </TabsTrigger>
              <TabsTrigger value="purchases">
                <Clock className="h-4 w-4 mr-2" /> Purchase History
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" /> Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Manage your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="university"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>University</FormLabel>
                              <FormControl>
                                <Input placeholder="Your University" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="yearLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year Level</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Junior Year" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Phone Number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="whatsappNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WhatsApp Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Your WhatsApp Number" {...field} />
                              </FormControl>
                              <FormDescription>
                                Used for direct WhatsApp messaging
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell others a bit about yourself..." 
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum 500 characters
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isAnonymousSeller"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Anonymous Seller
                              </FormLabel>
                              <FormDescription>
                                Hide your identity when selling items
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isUpdating}
                      >
                        {isUpdating ? "Updating..." : "Update Profile"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="listings">
              <Card>
                <CardHeader>
                  <CardTitle>My Listings</CardTitle>
                  <CardDescription>
                    Manage your product listings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userListings && userListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userListings.map((listing) => (
                        <ProductCard
                          key={listing.id}
                          product={listing}
                          variant="horizontal"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium">No listings yet</h3>
                      <p className="text-gray-500 mt-1">
                        Start selling by adding your first listing
                      </p>
                      <Button className="mt-4">Add New Listing</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="purchases">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase History</CardTitle>
                  <CardDescription>
                    View your past purchases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">No purchase history</h3>
                    <p className="text-gray-500 mt-1">
                      Your purchase history will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-500">
                        Configure your email notification preferences
                      </p>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="new-messages" />
                          <label htmlFor="new-messages" className="text-sm font-medium">
                            New messages
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="new-bids" />
                          <label htmlFor="new-bids" className="text-sm font-medium">
                            New bids
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="sold-items" />
                          <label htmlFor="sold-items" className="text-sm font-medium">
                            Sold items
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Privacy Settings</h3>
                      <p className="text-sm text-gray-500">
                        Manage your privacy preferences
                      </p>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="profile-visibility" />
                          <label htmlFor="profile-visibility" className="text-sm font-medium">
                            Public profile visibility
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="font-medium text-red-500">Danger Zone</h3>
                      <p className="text-sm text-gray-500">
                        Permanently delete your account and all of your content
                      </p>
                      <Button variant="destructive" className="mt-2">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
