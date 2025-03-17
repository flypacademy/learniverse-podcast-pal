
import React, { useState } from "react";
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
        <Label htmlFor="name" className="text-white">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
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
          onChange={(e) => onEmailChange(e.target.value)}
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
          onChange={(e) => onPasswordChange(e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-white"
          required
        />
      </div>
      
      <Button 
        size="lg" 
        className="w-full bg-white text-black hover:bg-white/90 mt-4"
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
        className="w-full text-zinc-400 hover:text-white hover:bg-transparent mt-2"
      >
        Already have an account? Sign In
      </Button>
    </div>
  );
};

export default SignUpStep;
