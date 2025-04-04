import React from "react";
import { Check, ShoppingBag, Tag, MessageCircle, Users } from "lucide-react";

const OnboardingWelcomeStep: React.FC = () => {
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

export default OnboardingWelcomeStep;