import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MapPin, Send, AlertCircle, CheckCircle } from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof contactFormSchema>) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, this would send the contact form data to an API
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      setIsSubmitted(true);
      toast({
        title: "Message sent",
        description: "We've received your message and will get back to you soon!",
      });
      
      form.reset();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-center">Contact Us</h1>
      <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
        Have questions or feedback about UniMarket? We'd love to hear from you!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">unimarket.84eca@gmail.com</p>
             {/* <p className="text-gray-600">feedback@unimarket.com</p> */}
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">We respond within 24 hours</p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Phone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">+91 8658635176</p>
            <p className="text-gray-600">Monday - Friday, 9am - 5pm EST</p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">Call us for urgent matters</p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">C.V. Raman Global University</p>
            <p className="text-gray-600">Khorda, 752054</p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">Main campus location</p>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-2xl font-bold mb-4">Send Us a Message</h2>
          <p className="text-gray-600 mb-6">
            Fill out the form and we'll get back to you as soon as possible.
            We appreciate your feedback and questions!
          </p>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Before contacting support
            </h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
              <li>Check our <a href="#" className="text-primary hover:underline">FAQ page</a> for common questions</li>
              <li>For account issues, make sure you're logged in</li>
              <li>For buying/selling issues, try messaging the other party first</li>
              <li>Include your order/listing ID if applicable</li>
            </ul>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact Form</CardTitle>
            <CardDescription>
              All fields are required unless specified otherwise
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-gray-600 mb-4">
                  Thank you for reaching out. We've received your message and will respond shortly.
                </p>
                <Button onClick={() => setIsSubmitted(false)}>Send Another Message</Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.edu" {...field} />
                        </FormControl>
                        <FormDescription>
                          We'll never share your email with anyone else
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="What is this about?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Your message here..." 
                            rows={4}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <span className="animate-spin h-4 w-4 mr-2 border-b-2 rounded-full border-current" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How do I list an item for sale?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To list an item, log in to your account, click on "Sell Item" in the navigation menu, fill out the product details form, upload images, and submit!
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is there a fee for using UniMarket?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                UniMarket is completely free to use for university students. We don't charge any listing or transaction fees.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How do I contact a seller?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Click on a listing, then use either the in-app messaging system or the "WhatsApp Seller" button to contact them directly.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I sell items in bulk?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Yes! Our bulk selling feature is perfect for graduating students. Go to "Bulk Sales" in the menu to create a bundle of items.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
