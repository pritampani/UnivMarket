import React from "react";
import { Search, Filter, ArrowDown, ArrowRight } from "lucide-react";

const OnboardingSearchStep: React.FC = () => {
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

export default OnboardingSearchStep;