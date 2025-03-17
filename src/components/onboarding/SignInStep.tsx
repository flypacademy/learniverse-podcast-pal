
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";

interface SignInStepProps {
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSignIn: () => void;
  onGoToSignUp: () => void;
}

const SignInStep = ({ 
  email, 
  password, 
  loading, 
  onEmailChange, 
  onPasswordChange, 
  onSignIn, 
  onGoToSignUp 
}: SignInStepProps) => {
  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="bg-background/50 border-border"
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
          onChange={(e) => onPasswordChange(e.target.value)}
          className="bg-background/50 border-border"
          required
        />
      </div>
      
      <Button 
        size="lg" 
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
        onClick={onSignIn}
        disabled={loading}
      >
        {loading ? "Signing In..." : "Sign In"}
        {!loading && <LogIn className="ml-2 h-5 w-5" />}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onGoToSignUp}
        className="w-full text-muted-foreground hover:text-foreground hover:bg-transparent mt-2"
      >
        Need an account? Sign Up
      </Button>
    </div>
  );
};

export default SignInStep;
