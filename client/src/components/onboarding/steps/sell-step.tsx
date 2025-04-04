import React from "react";
import { Upload, Tag, PlusCircle, ArrowRight } from "lucide-react";

const OnboardingSellStep: React.FC = () => {
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

export default OnboardingSellStep;