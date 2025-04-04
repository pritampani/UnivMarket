import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";

// Define the possible onboarding steps
type OnboardingStep = 
  | "welcome" 
  | "browse" 
  | "search" 
  | "sell" 
  | "account" 
  | "complete";

// The order of steps in the onboarding flow
const STEP_ORDER: OnboardingStep[] = [
  "welcome",
  "browse",
  "search",
  "sell",
  "account",
  "complete"
];

// Define the context type
interface OnboardingContextType {
  isOnboarding: boolean;
  currentStep: OnboardingStep;
  startOnboarding: () => void;
  endOnboarding: () => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  skipOnboarding: () => void;
  isFirstTimeUser: boolean;
}

// Create the context with default values
const OnboardingContext = createContext<OnboardingContextType>({
  isOnboarding: false,
  currentStep: "welcome",
  startOnboarding: () => {},
  endOnboarding: () => {},
  goToNextStep: () => {},
  goToPreviousStep: () => {},
  skipOnboarding: () => {},
  isFirstTimeUser: true
});

// Storage key for onboarding completed flag
const ONBOARDING_COMPLETED_KEY = "unimarket-onboarding-completed";

// Provider component
export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for tracking onboarding status
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(true);

  // Check if user has completed onboarding before
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (onboardingCompleted === "true") {
      setIsFirstTimeUser(false);
    } else {
      // Auto-start onboarding for first-time users after a short delay
      const timer = setTimeout(() => {
        startOnboarding();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Start the onboarding process
  const startOnboarding = () => {
    setCurrentStep("welcome");
    setIsOnboarding(true);
  };

  // End the onboarding process
  const endOnboarding = () => {
    setIsOnboarding(false);
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    setIsFirstTimeUser(false);
  };

  // Skip the entire onboarding flow
  const skipOnboarding = () => {
    endOnboarding();
  };

  // Go to the next step in the flow
  const goToNextStep = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[currentIndex + 1]);
    } else {
      endOnboarding();
    }
  };

  // Go to the previous step in the flow
  const goToPreviousStep = () => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEP_ORDER[currentIndex - 1]);
    }
  };

  // Provide the context value
  const value = {
    isOnboarding,
    currentStep,
    startOnboarding,
    endOnboarding,
    goToNextStep,
    goToPreviousStep,
    skipOnboarding,
    isFirstTimeUser
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Custom hook for using the onboarding context
export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  
  return context;
};

export default OnboardingContext;