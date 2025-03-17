
import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

interface OnboardingCheckProps {
  children: React.ReactNode;
}

const OnboardingCheck = ({ children }: OnboardingCheckProps) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [firstLaunch, setFirstLaunch] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      
      // Check if this is first launch
      const isFirstLaunch = localStorage.getItem("appLaunched") === null;
      setFirstLaunch(isFirstLaunch);
      
      // If this isn't first launch, mark as launched
      if (isFirstLaunch) {
        localStorage.setItem("appLaunched", "true");
      }
      
      setLoading(false);
    };

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setSession(session);
        
        // If user just signed in, redirect to home
        if (event === 'SIGNED_IN') {
          navigate("/", { replace: true });
        }
      }
    );

    checkSession();

    // Cleanup subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Show loading while checking session status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111111]">
        <div className="animate-pulse text-white font-display">Loading...</div>
      </div>
    );
  }

  // Redirect to onboarding for first time users or unauthenticated users
  if (firstLaunch || !session) {
    return <Navigate to="/onboarding" replace />;
  }

  // User is authenticated and not first launch, show the app
  return <>{children}</>;
};

export default OnboardingCheck;
