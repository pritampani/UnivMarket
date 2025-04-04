import React from "react";
import { UserCircle, Settings, LogIn, ArrowRight } from "lucide-react";

const OnboardingAccountStep: React.FC = () => {
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

export default OnboardingAccountStep;