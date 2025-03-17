
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Apple, Mail, LogIn, UserPlus, Lock, Check, Globe } from "lucide-react";
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
      title: "Learniverse",
      description: "Your personal learning companion",
      content: (
        <div className="space-y-6 w-full">
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* App logo */}
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Globe className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <div className="space-y-4 w-full">
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full bg-white text-black hover:bg-white/90 font-medium flex items-center justify-center gap-2"
              onClick={() => toast({
                title: "Apple Sign In",
                description: "Apple authentication would be implemented here"
              })}
            >
              <Apple className="h-5 w-5" />
              Continue with Apple
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full bg-white text-black hover:bg-white/90 font-medium flex items-center justify-center gap-2" 
              onClick={() => toast({
                title: "Google Sign In",
                description: "Google authentication would be implemented here"
              })}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              Continue with Google
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full bg-zinc-700/90 text-white hover:bg-zinc-700 font-medium" 
              onClick={() => setStep(1)}
            >
              <Mail className="mr-2 h-5 w-5" />
              Continue with email
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full bg-zinc-700/90 text-white hover:bg-zinc-700 font-medium"
              onClick={() => toast({
                title: "SSO Sign In",
                description: "SSO authentication would be implemented here"
              })}
            >
              Continue with SSO
            </Button>
          </div>
        </div>
      )
    },
    {
      title: "Sign Up",
      description: "Create a new account",
      content: (
        <div className="space-y-4 w-full">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>
          
          <Button 
            size="lg" 
            className="w-full bg-white text-black hover:bg-white/90 mt-4"
            onClick={handleSignUp}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
            {!loading && <UserPlus className="ml-2 h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep(2)}
            className="w-full text-zinc-400 hover:text-white hover:bg-transparent mt-2"
          >
            Already have an account? Sign In
          </Button>
        </div>
      )
    },
    {
      title: "Sign In",
      description: "Welcome back",
      content: (
        <div className="space-y-4 w-full">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-white">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-white">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>
          
          <Button 
            size="lg" 
            className="w-full bg-white text-black hover:bg-white/90 mt-4"
            onClick={handleSignIn}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
            {!loading && <LogIn className="ml-2 h-5 w-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep(1)}
            className="w-full text-zinc-400 hover:text-white hover:bg-transparent mt-2"
          >
            Need an account? Sign Up
          </Button>
        </div>
      )
    },
    {
      title: "Welcome to Learniverse",
      description: "Let's start your learning journey",
      content: (
        <div className="space-y-6 text-center">
          <div className="w-24 h-24 bg-green-500/20 backdrop-blur-md rounded-full mx-auto flex items-center justify-center">
            <Check className="h-12 w-12 text-green-500" />
          </div>
          <p className="text-zinc-300">
            Your account has been created successfully. You're all set to start exploring educational content!
          </p>
          
          <Button 
            size="lg" 
            className="w-full bg-white text-black hover:bg-white/90 mt-4"
            onClick={() => navigate("/")}
          >
            Start Learning
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )
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

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col bg-[url('public/lovable-uploads/3b9235b3-4088-4b61-9dfb-369bd6ff7de8.png')] bg-cover bg-center bg-no-repeat">
      <div className="flex-1 max-w-md mx-auto w-full px-6 py-12 flex flex-col">
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-display font-bold text-white">
              {currentStep.title}
            </h1>
            <p className="text-zinc-400 mt-1">{currentStep.description}</p>
          </div>

          <div className="backdrop-blur-md bg-black/50 rounded-2xl p-6 border border-zinc-800">
            {currentStep.content}
          </div>
          
          {step === 0 && (
            <div className="mt-8 flex justify-center space-x-6">
              <button className="text-zinc-500 text-sm hover:text-white transition-colors">
                Privacy policy
              </button>
              <button className="text-zinc-500 text-sm hover:text-white transition-colors">
                Terms of service
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
