
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase, createAdminRole } from "@/lib/supabase";

const AdminRegister = () => {
  const [email, setEmail] = useState("admin@flyp.academy");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting to register admin with email: ${email}`);
      
      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) {
        console.error("Admin registration error:", signUpError);
        throw signUpError;
      }
      
      if (!data.user) {
        console.error("No user data returned");
        throw new Error("User registration failed");
      }
      
      console.log("User registered successfully, ID:", data.user.id);
      
      // Add admin role using the security-definer function
      console.log("Attempting to assign admin role to user ID:", data.user.id);
      const roleId = await createAdminRole(data.user.id);
      
      if (!roleId) {
        console.error("Error setting admin role - roleId is null");
        toast({
          title: "Partial registration success",
          description: "User created but role assignment failed. Please contact support.",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Admin role assigned successfully with ID:", roleId);
      
      // Success
      toast({
        title: "Admin registered",
        description: "Admin user has been created successfully. You can now log in.",
      });
      
      navigate("/admin/login");
      
    } catch (err: any) {
      let errorMessage = "An error occurred during registration";
      
      // Extract specific error message if available
      if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err);
      }
      
      setError(errorMessage);
      console.error("Registration error details:", err);
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Registration</CardTitle>
          <CardDescription>
            Create a new admin account
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleRegister}>
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
              {loading ? "Creating admin..." : "Create Admin"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminRegister;
