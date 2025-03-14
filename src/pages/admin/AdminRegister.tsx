
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const AdminRegister = () => {
  const [email, setEmail] = useState("admin@flyp.academy");
  const [password, setPassword] = useState("hello");
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
      
      // Add admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: data.user.id,
          role: 'admin'
        });
      
      if (roleError) {
        console.error("Error setting admin role:", roleError);
        throw roleError;
      }
      
      console.log("Admin role assigned successfully");
      
      // Success
      toast({
        title: "Admin registered",
        description: "Admin user has been created successfully",
      });
      
      navigate("/admin/login");
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during registration");
      console.error("Registration error:", err);
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
