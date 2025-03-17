
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn, UserPlus, Mail, Lock, Info, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Onboarding steps content
  const steps = [
    {
      title: "Welcome to Learniverse",
      description: "Your personalized podcast learning companion",
      content: (
        <div className="space-y-4 text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto flex items-center justify-center">
            <Info className="h-12 w-12 text-primary" />
          </div>
          <p className="text-gray-600">
            Discover educational podcasts, track your progress, and achieve your learning goals
          </p>
        </div>
      ),
      action: "Get Started"
    },
    {
      title: "Create an Account",
      description: "Sign up to save your progress",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
      ),
      action: "Sign Up"
    },
    {
      title: "Sign In",
      description: "Welcome back",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
      ),
      action: "Sign In"
    },
    {
      title: "All Set!",
      description: "You're ready to start learning",
      content: (
        <div className="space-y-4 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center">
            <Check className="h-12 w-12 text-green-600" />
          </div>
          <p className="text-gray-600">
            Your account has been created successfully. Enjoy your learning journey!
          </p>
        </div>
      ),
      action: "Start Learning"
    }
  ];

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data) {
        toast({
          title: "Success",
          description: "Your account has been created",
        });
        setStep(3); // Move to success step
      }
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data) {
        toast({
          title: "Success",
          description: "You have been signed in",
        });
        navigate("/"); // Navigate to home
      }
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    if (step === 0) {
      setStep(1); // Go to signup
    } else if (step === 1) {
      handleSignUp();
    } else if (step === 2) {
      handleSignIn();
    } else if (step === 3) {
      navigate("/"); // Go to home page
    }
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-8 flex flex-col">
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-gray-900">
              {currentStep.title}
            </h1>
            <p className="text-gray-500 mt-2">{currentStep.description}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            {currentStep.content}
          </div>

          <Button
            size="lg"
            className="w-full flex items-center justify-center gap-2 mb-4"
            onClick={handleAction}
            disabled={loading}
          >
            {loading ? "Processing..." : currentStep.action}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>

          {step === 1 && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep(2)}
              className="w-full"
            >
              Already have an account? Sign In
            </Button>
          )}

          {step === 2 && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep(1)}
              className="w-full"
            >
              Need an account? Sign Up
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
