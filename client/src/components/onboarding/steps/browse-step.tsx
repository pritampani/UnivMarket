import React from "react";
import { LayoutGrid, MousePointer, ArrowRight } from "lucide-react";

const OnboardingBrowseStep: React.FC = () => {
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

export default OnboardingBrowseStep;