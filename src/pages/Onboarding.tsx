import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import OnboardingContainer from "@/components/onboarding/OnboardingContainer";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import SignUpStep from "@/components/onboarding/SignUpStep";
import SignInStep from "@/components/onboarding/SignInStep";
import SuccessStep from "@/components/onboarding/SuccessStep";
import { handleSignUp, handleSignIn } from "@/utils/auth";
import { supabase } from "@/lib/supabase";

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        // User is already logged in, redirect to home
        navigate("/", { replace: true });
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Add auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && step !== 3) {
        // If user signed in but not on success step (e.g. from another tab/device)
        navigate("/", { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, step]);

  // Onboarding steps configuration
  const steps = [
    {
      title: "Learniverse",
      description: "Your personal learning companion",
      component: <WelcomeStep onContinueWithEmail={() => setStep(1)} />,
      showHeader: false
    },
    {
      title: "Sign Up",
      description: "Create a new account",
      component: (
        <SignUpStep 
          email={email}
          password={password}
          name={name}
          loading={loading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onNameChange={setName}
          onSignUp={onSignUpClick}
          onGoToSignIn={() => setStep(2)}
        />
      ),
      showHeader: true
    },
    {
      title: "Sign In",
      description: "Welcome back",
      component: (
        <SignInStep 
          email={email}
          password={password}
          loading={loading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSignIn={onSignInClick}
          onGoToSignUp={() => setStep(1)}
        />
      ),
      showHeader: true
    },
    {
      title: "Welcome to Learniverse",
      description: "Let's start your learning journey",
      component: <SuccessStep onComplete={() => navigate("/", { replace: true })} />,
      showHeader: true
    }
  ];

  async function onSignUpClick() {
    setLoading(true);
    const result = await handleSignUp(email, password, name, toast);
    setLoading(false);
    if (result.success) {
      setStep(3); // Move to success step
    }
  }

  async function onSignInClick() {
    setLoading(true);
    const result = await handleSignIn(email, password, toast);
    setLoading(false);
    if (result.success) {
      navigate("/", { replace: true }); // Navigate to home
    }
  }

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 w-full px-6 py-12 flex flex-col">
        <OnboardingContainer 
          title={currentStep.title} 
          description={currentStep.description}
          showHeader={currentStep.showHeader}
        >
          {currentStep.component}
        </OnboardingContainer>
        
        {step === 0 && (
          <div className="mt-8 flex justify-center space-x-6">
            <button className="text-muted-foreground text-sm hover:text-foreground transition-colors">
              Privacy policy
            </button>
            <button className="text-muted-foreground text-sm hover:text-foreground transition-colors">
              Terms of service
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
