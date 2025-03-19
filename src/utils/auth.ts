
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const handleSignUp = async (
  email: string, 
  password: string, 
  name: string,
  toast: ReturnType<typeof useToast>
) => {
  if (!email || !password || !name) {
    toast.toast({
      title: "Missing fields",
      description: "Please fill in all fields",
      variant: "destructive"
    });
    return { success: false, error: "Missing fields" };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        },
        emailRedirectTo: window.location.origin,
      }
    });

    if (error) {
      throw error;
    }

    if (data) {
      toast.toast({
        title: "Success",
        description: "Your account has been created",
      });
      return { success: true, data };
    }
    
    return { success: false, error: "Unknown error" };
  } catch (error: any) {
    toast.toast({
      title: "Error creating account",
      description: error.message || "Something went wrong",
      variant: "destructive"
    });
    return { success: false, error: error.message || "Something went wrong" };
  }
};

export const handleSignIn = async (
  email: string, 
  password: string,
  toast: ReturnType<typeof useToast>
) => {
  if (!email || !password) {
    toast.toast({
      title: "Missing fields",
      description: "Please fill in all fields",
      variant: "destructive"
    });
    return { success: false, error: "Missing fields" };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    if (data) {
      toast.toast({
        title: "Success",
        description: "You have been signed in",
      });
      return { success: true, data };
    }
    
    return { success: false, error: "Unknown error" };
  } catch (error: any) {
    toast.toast({
      title: "Error signing in",
      description: error.message || "Invalid credentials",
      variant: "destructive"
    });
    return { success: false, error: error.message || "Something went wrong" };
  }
};
