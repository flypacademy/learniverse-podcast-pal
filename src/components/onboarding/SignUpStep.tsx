
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";

interface SignUpStepProps {
  email: string;
  password: string;
  name: string;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onNameChange: (name: string) => void;
  onSignUp: () => void;
  onGoToSignIn: () => void;
}

const SignUpStep = ({ 
  email, 
  password, 
  name, 
  loading, 
  onEmailChange, 
  onPasswordChange, 
  onNameChange, 
  onSignUp, 
  onGoToSignIn 
}: SignUpStepProps) => {
  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="bg-background/50 border-border"
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
          onChange={(e) => onEmailChange(e.target.value)}
          className="bg-background/50 border-border"
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
          onChange={(e) => onPasswordChange(e.target.value)}
          className="bg-background/50 border-border"
          required
        />
      </div>
      
      <Button 
        size="lg" 
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
        onClick={onSignUp}
        disabled={loading}
      >
        {loading ? "Creating Account..." : "Create Account"}
        {!loading && <UserPlus className="ml-2 h-5 w-5" />}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onGoToSignIn}
        className="w-full text-muted-foreground hover:text-foreground hover:bg-transparent mt-2"
      >
        Already have an account? Sign In
      </Button>
    </div>
  );
};

export default SignUpStep;
