
import React from "react";
import { Button } from "@/components/ui/button";
import { Apple, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WelcomeStepProps {
  onContinueWithEmail: () => void;
}

const WelcomeStep = ({ onContinueWithEmail }: WelcomeStepProps) => {
  const { toast } = useToast();

  return (
    <div className="space-y-8 w-full">
      {/* Gradient image */}
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="w-64 h-64 relative">
          <img 
            src="/lovable-uploads/7751c67e-702f-4612-9002-a1d68ced72c3.png" 
            alt="Gradient circle" 
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Logo */}
        <div className="mt-4">
          <img 
            src="/lovable-uploads/84fb211b-5353-4f32-9e4e-5fdb191bca2e.png"
            alt="Learniverse Logo"
            className="w-12 h-12"
          />
        </div>
        
        {/* Tagline */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold">Bite-sized lessons.</h2>
          <p className="text-lg">Study anytime, anywhere.</p>
        </div>
      </div>
      
      <div className="space-y-3 w-full">
        <Button 
          size="lg" 
          variant="outline" 
          className="w-full bg-background border-border hover:bg-accent/10 hover:text-accent font-medium flex items-center justify-center gap-2"
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
          className="w-full bg-background border-border hover:bg-accent/10 hover:text-accent font-medium flex items-center justify-center gap-2" 
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
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium" 
          onClick={onContinueWithEmail}
        >
          <Mail className="mr-2 h-5 w-5" />
          Continue with email
        </Button>
        
        <Button 
          size="lg" 
          variant="secondary"
          className="w-full hover:bg-secondary/80 font-medium"
          onClick={() => toast({
            title: "SSO Sign In",
            description: "SSO authentication would be implemented here"
          })}
        >
          Continue with SSO
        </Button>
      </div>
    </div>
  );
};

export default WelcomeStep;
