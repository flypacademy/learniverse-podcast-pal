
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
        console.log("Checking if user is already logged in as admin");
        const isAdmin = await isUserAdmin();
        console.log("Is admin check result:", isAdmin);
        
        if (isAdmin) {
          console.log("User is admin, redirecting to admin dashboard");
          navigate("/admin");
        }
      } catch (err) {
        console.error("Error during admin check:", err);
      }
    };
    
    checkLoggedIn();
  }, [navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log("Attempting to sign in with email:", email);
      
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        throw signInError;
      }
      
      console.log("Sign in successful, session:", data.session?.user.id);
      
      // Check if user is an admin
      if (data.session) {
        console.log("Checking if user has admin role");
        
        // First check if the user exists in user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', data.session.user.id);
        
        if (roleError) {
          console.error("Role check error:", roleError);
          throw new Error("Error checking admin status: " + roleError.message);
        }
        
        console.log("Role data:", roleData);
        
        if (!roleData || roleData.length === 0) {
          throw new Error("You do not have an admin account. Please contact the administrator.");
        }
        
        const isAdmin = roleData.some(role => role.role === 'admin');
        
        if (!isAdmin) {
          throw new Error("You do not have admin privileges");
        }
        
        // Success
        toast({
          title: "Login successful",
          description: "Welcome to the admin panel",
        });
        
        navigate("/admin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Login error:", err);
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
