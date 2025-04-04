import React from "react";
import { CheckCircle, ShoppingBag, AlertCircle, Share2, Zap } from "lucide-react";

const OnboardingCompleteStep: React.FC = () => {
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

export default OnboardingCompleteStep;