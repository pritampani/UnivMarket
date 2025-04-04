import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/context/onboarding-context";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  GraduationCap,
  ShoppingBag,
  Tag,
  MessageCircle,
  Users,
  LayoutGrid,
  MousePointer,
  ArrowRight,
  Search,
  Filter,
  ArrowDown,
  Upload,
  PlusCircle,
  UserCircle,
  Settings,
  LogIn,
  CheckCircle,
  AlertCircle,
  Share2,
  Zap
} from "lucide-react";

// Welcome Step Component
const WelcomeStep: React.FC = () => {
  return (
    <div className="flex flex-col h-full justify-center items-center text-center space-y-4">
      <h3 className="text-2xl font-bold">Welcome to UniMarket!</h3>
      <p className="text-gray-600 mb-4">
        Your campus marketplace for buying and selling among university students.
      </p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        <div className="flex flex-col items-center p-2 border rounded-lg">
          <ShoppingBag className="h-8 w-8 text-primary mb-2" />
          <span className="text-sm font-medium">Buy Products</span>
        </div>
        <div className="flex flex-col items-center p-2 border rounded-lg">
          <Tag className="h-8 w-8 text-primary mb-2" />
          <span className="text-sm font-medium">Sell Items</span>
        </div>
        <div className="flex flex-col items-center p-2 border rounded-lg">
          <MessageCircle className="h-8 w-8 text-primary mb-2" />
          <span className="text-sm font-medium">Message Sellers</span>
        </div>
        <div className="flex flex-col items-center p-2 border rounded-lg">
          <Users className="h-8 w-8 text-primary mb-2" />
          <span className="text-sm font-medium">Connect with Peers</span>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>Let's take a quick tour to get you started!</p>
      </div>
    </div>
  );
};

// Browse Step Component
const BrowseStep: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xl font-bold mb-2">Browsing Products</h3>
      <p className="text-gray-600 mb-4">
        Explore products from university students across various categories.
      </p>
      
      <div className="relative border rounded-lg p-4 bg-gray-50 flex-1 overflow-hidden">
        {/* Product grid illustration */}
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((item) => (
            <div 
              key={item} 
              className="bg-white border rounded-md shadow-sm p-2 flex flex-col"
            >
              <div className="bg-gray-200 w-full h-20 rounded-sm mb-2"></div>
              <div className="h-3 bg-gray-300 rounded-full w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-300 rounded-full w-1/2"></div>
            </div>
          ))}
        </div>
        
        {/* Interactive elements */}
        <div className="absolute right-8 top-12 flex items-center animate-pulse">
          <MousePointer className="h-4 w-4 text-primary" />
          <ArrowRight className="h-4 w-4 text-primary" />
        </div>

        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-primary/20">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">View by category or see what's trending</span>
        </div>
      </div>
      
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <div className="bg-primary/10 p-1 rounded-full">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-gray-600">Browse products on the home page or by categories</p>
        </div>
        <div className="flex items-start gap-2">
          <div className="bg-primary/10 p-1 rounded-full">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-gray-600">Click on any product to see details and contact the seller</p>
        </div>
      </div>
    </div>
  );
};

// Search Step Component
const SearchStep: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xl font-bold mb-2">Finding What You Need</h3>
      <p className="text-gray-600 mb-4">
        Use our powerful search and filters to find exactly what you're looking for.
      </p>
      
      <div className="relative border rounded-lg p-4 bg-gray-50 flex-1 flex flex-col gap-3 overflow-hidden">
        {/* Search bar illustration */}
        <div className="relative">
          <div className="flex items-center border rounded-md bg-white p-2">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <div className="h-3 bg-gray-300 rounded-full w-3/4"></div>
          </div>
          <div className="absolute -right-2 top-2 animate-bounce">
            <ArrowDown className="h-4 w-4 text-primary" />
          </div>
        </div>
        
        {/* Filter section illustration */}
        <div className="border rounded-md bg-white p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-primary mr-2" />
              <div className="h-3 bg-gray-300 rounded-full w-16"></div>
            </div>
            <div className="h-3 bg-gray-300 rounded-full w-12"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="border rounded-sm p-1.5 flex items-center">
              <div className="h-3 bg-gray-200 rounded-full w-full"></div>
            </div>
            <div className="border rounded-sm p-1.5 flex items-center">
              <div className="h-3 bg-gray-200 rounded-full w-full"></div>
            </div>
            <div className="border rounded-sm p-1.5 flex items-center">
              <div className="h-3 bg-gray-200 rounded-full w-full"></div>
            </div>
            <div className="border rounded-sm p-1.5 flex items-center">
              <div className="h-3 bg-gray-200 rounded-full w-full"></div>
            </div>
          </div>
        </div>
        
        {/* Results illustration */}
        <div className="border rounded-md bg-white p-2">
          <div className="flex justify-between items-center mb-2">
            <div className="h-3 bg-gray-300 rounded-full w-24"></div>
            <div className="h-3 bg-gray-300 rounded-full w-16"></div>
          </div>
          <div className="flex gap-2">
            <div className="bg-gray-200 rounded-sm h-12 w-12"></div>
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-gray-200 rounded-full w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <div className="bg-primary/10 p-1 rounded-full">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-gray-600">Search by keywords, categories, or prices</p>
        </div>
        <div className="flex items-start gap-2">
          <div className="bg-primary/10 p-1 rounded-full">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-gray-600">Use filters to narrow down results by condition, university, and more</p>
        </div>
      </div>
    </div>
  );
};

// Sell Step Component
const SellStep: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xl font-bold mb-2">Selling Your Items</h3>
      <p className="text-gray-600 mb-4">
        List your items for sale in just a few simple steps.
      </p>
      
      <div className="relative border rounded-lg p-4 bg-gray-50 flex-1 flex flex-col">
        {/* Form illustration */}
        <div className="space-y-3">
          <div className="border rounded-md bg-white p-3 flex flex-col gap-2">
            <div className="flex items-center">
              <Tag className="h-4 w-4 text-primary mr-2" />
              <div className="h-3 bg-gray-300 rounded-full w-24"></div>
            </div>
            <div className="h-8 w-full bg-gray-100 rounded-md"></div>
          </div>
          
          <div className="border rounded-md bg-white p-3 flex flex-col gap-2">
            <div className="flex items-center">
              <PlusCircle className="h-4 w-4 text-primary mr-2" />
              <div className="h-3 bg-gray-300 rounded-full w-32"></div>
            </div>
            <div className="h-8 w-full bg-gray-100 rounded-md"></div>
          </div>
          
          <div className="border rounded-md bg-white p-3 flex flex-col gap-2">
            <div className="flex items-center">
              <Upload className="h-4 w-4 text-primary mr-2" />
              <div className="h-3 bg-gray-300 rounded-full w-28"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-16 w-16 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                <PlusCircle className="h-6 w-6 text-gray-400" />
              </div>
              <div className="h-16 w-16 bg-gray-200 rounded-md"></div>
              <div className="h-16 w-16 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>
        
        {/* Submit button illustration */}
        <div className="mt-auto">
          <div className="h-9 w-full bg-primary rounded-md flex items-center justify-center">
            <div className="h-2 bg-white rounded-full w-24"></div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <div className="bg-primary/10 p-1 rounded-full">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-gray-600">Fill in details about your item (name, price, condition, etc.)</p>
        </div>
        <div className="flex items-start gap-2">
          <div className="bg-primary/10 p-1 rounded-full">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-gray-600">Upload up to 5 photos to showcase your product</p>
        </div>
        <div className="flex items-start gap-2">
          <div className="bg-primary/10 p-1 rounded-full">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-gray-600">Submit and start receiving inquiries from buyers</p>
        </div>
      </div>
    </div>
  );
};

// Account Step Component
const AccountStep: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-xl font-bold mb-2">Your Account</h3>
      <p className="text-gray-600 mb-4">
        Sign in to access all features and manage your listings.
      </p>
      
      <div className="relative border rounded-lg p-4 bg-gray-50 flex-1 overflow-hidden">
        {/* Profile illustration */}
        <div className="border rounded-md bg-white p-4 flex flex-col items-center">
          <div className="bg-primary/10 rounded-full p-3 mb-2">
            <UserCircle className="h-12 w-12 text-primary" />
          </div>
          
          <div className="h-3 bg-gray-300 rounded-full w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded-full w-40 mb-4"></div>
          
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="border rounded-md p-2 flex items-center justify-center">
              <LogIn className="h-4 w-4 text-primary mr-2" />
              <div className="h-3 bg-gray-300 rounded-full w-12"></div>
            </div>
            <div className="border rounded-md p-2 flex items-center justify-center">
              <Settings className="h-4 w-4 text-primary mr-2" />
              <div className="h-3 bg-gray-300 rounded-full w-16"></div>
            </div>
          </div>
        </div>
        
        {/* Account benefits */}
        <div className="mt-4 border rounded-md bg-white p-3">
          <div className="h-3 bg-gray-400 rounded-full w-24 mb-3"></div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="h-4 w-4 bg-primary/20 rounded-full mr-2 flex-shrink-0"></div>
              <div className="h-2 bg-gray-300 rounded-full w-full"></div>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 bg-primary/20 rounded-full mr-2 flex-shrink-0"></div>
              <div className="h-2 bg-gray-300 rounded-full w-full"></div>
            </div>
            <div className="flex items-center">
              <div className="h-4 w-4 bg-primary/20 rounded-full mr-2 flex-shrink-0"></div>
              <div className="h-2 bg-gray-300 rounded-full w-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <div className="bg-primary/10 p-1 rounded-full">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-gray-600">Create an account or sign in with Google for easy access</p>
        </div>
        <div className="flex items-start gap-2">
          <div className="bg-primary/10 p-1 rounded-full">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-gray-600">Track your listings, purchases, and messages in one place</p>
        </div>
        <div className="flex items-start gap-2">
          <div className="bg-primary/10 p-1 rounded-full">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-gray-600">Customize your profile and manage account settings</p>
        </div>
      </div>
    </div>
  );
};

// Complete Step Component
const CompleteStep: React.FC = () => {
  return (
    <div className="flex flex-col h-full justify-center items-center text-center">
      <div className="mb-4">
        <CheckCircle className="h-16 w-16 text-primary mx-auto" />
      </div>
      
      <h3 className="text-2xl font-bold mb-2">You're Ready to Go!</h3>
      <p className="text-gray-600 mb-6">
        You've completed the tour and are now ready to start using UniMarket.
      </p>
      
      <div className="w-full max-w-sm space-y-3">
        <div className="flex items-center gap-3 text-left p-2 border rounded-lg">
          <div className="bg-primary/10 p-2 rounded-full">
            <ShoppingBag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">Start Exploring</h4>
            <p className="text-sm text-gray-500">Browse available items from other students</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-left p-2 border rounded-lg">
          <div className="bg-primary/10 p-2 rounded-full">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">List Your First Item</h4>
            <p className="text-sm text-gray-500">Sell something you no longer need</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-left p-2 border rounded-lg">
          <div className="bg-primary/10 p-2 rounded-full">
            <Share2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">Share with Friends</h4>
            <p className="text-sm text-gray-500">Invite others to join the marketplace</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex items-center gap-2 bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <p>You can always revisit this tour from the help section.</p>
      </div>
    </div>
  );
};

// Main Onboarding Modal
const OnboardingModal: React.FC = () => {
  const { 
    isOnboarding, 
    currentStep, 
    endOnboarding,
    goToNextStep,
    goToPreviousStep,
    skipOnboarding
  } = useOnboarding();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeStep />;
      case "browse":
        return <BrowseStep />;
      case "search":
        return <SearchStep />;
      case "sell":
        return <SellStep />;
      case "account":
        return <AccountStep />;
      case "complete":
        return <CompleteStep />;
      default:
        return <WelcomeStep />;
    }
  };

  const isFirstStep = currentStep === "welcome";
  const isLastStep = currentStep === "complete";

  return (
    <Dialog open={isOnboarding} onOpenChange={isOpen => !isOpen && endOnboarding()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <div className="flex items-center justify-between bg-primary p-4 text-primary-foreground">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            <span className="font-semibold">UniMarket Tour</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={skipOnboarding}
              className="text-primary-foreground hover:bg-primary/90"
            >
              Skip
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={endOnboarding}
              className="text-primary-foreground hover:bg-primary/90"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
        
        <div className="px-6 py-4 min-h-[300px] flex flex-col">
          {renderCurrentStep()}
        </div>
        
        <div className="flex items-center justify-between p-4 border-t">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={isFirstStep}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex-1 flex justify-center">
            <div className="flex space-x-1">
              {["welcome", "browse", "search", "sell", "account", "complete"].map((step) => (
                <div 
                  key={step}
                  className={`h-1.5 rounded-full w-6 ${
                    currentStep === step ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
          
          <Button
            onClick={goToNextStep}
          >
            {isLastStep ? (
              <>
                Get Started
                <Check className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;