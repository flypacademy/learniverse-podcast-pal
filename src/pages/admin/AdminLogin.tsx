
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase, isUserAdmin } from "@/lib/supabase";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        console.log("AdminLogin: Checking if user is already logged in");
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          console.log("AdminLogin: No active session");
          return;
        }
        
        console.log("AdminLogin: Session found, checking if admin");
        const admin = await isUserAdmin();
        console.log("AdminLogin: isAdmin result:", admin);
        
        if (admin) {
          console.log("AdminLogin: User is admin, redirecting to dashboard");
          navigate("/admin");
        } else {
          console.log("AdminLogin: User is NOT an admin");
          // Sign out non-admin users
          await supabase.auth.signOut();
          setError("You do not have admin privileges.");
        }
      } catch (err) {
        console.error("AdminLogin: Error during admin check:", err);
      }
    };
    
    checkLoggedIn();
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log(`AdminLogin: Attempting login with email: ${email}`);
      
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        console.error("AdminLogin: Sign in error:", signInError);
        throw signInError;
      }
      
      if (!data.session) {
        console.error("AdminLogin: No session after successful login");
        throw new Error("No session created after login");
      }
      
      console.log("AdminLogin: Login successful, user ID:", data.session.user.id);
      
      // Check if user is an admin using our function
      const isAdmin = await isUserAdmin();
      console.log("AdminLogin: Admin check result:", isAdmin);
      
      if (!isAdmin) {
        console.error("AdminLogin: User is not an admin");
        await supabase.auth.signOut();
        throw new Error("You do not have admin privileges. Please contact the administrator.");
      }
      
      // Success
      toast({
        title: "Login successful",
        description: "Welcome to the admin panel",
      });
      
      navigate("/admin");
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("AdminLogin: Login error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Login to access the admin dashboard
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
