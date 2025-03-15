
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/");
      }
    });

    // Process the OAuth callback
    const handleOAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        navigate("/");
      } catch (error) {
        console.error("Error during OAuth callback:", error);
        navigate("/auth");
      }
    };

    handleOAuthCallback();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-brand-blue to-brand-purple">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <h2 className="text-xl font-semibold text-white">Completing login...</h2>
        <p className="text-white/80">Please wait while we authenticate your account</p>
      </div>
    </div>
  );
};

export default AuthCallback;
