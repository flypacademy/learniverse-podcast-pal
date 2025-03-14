
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table";
import { Search, Mail, Calendar, UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase, createAdminRole } from "@/lib/supabase";

interface User {
  id: string;
  email: string;
  created_at: string;
  is_admin?: boolean;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  
  const fetchUsers = async () => {
    setLoading(true);
    
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        throw new Error("User not logged in");
      }
      
      // Get all users from auth.users - this is a workaround since we can't directly query auth.users
      // We'll collect users we know about from the user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (roleError) {
        throw roleError;
      }
      
      // Create a map for role data
      const userRoles = new Map();
      roleData?.forEach(role => {
        userRoles.set(role.user_id, role.role);
      });
      
      // Get current user to have at least one user to display
      const { data: currentUserData } = await supabase.auth.getUser();
      
      // Create users array with at least the current user
      const usersList: User[] = [{
        id: currentUser.id,
        email: currentUser.email || "No email",
        created_at: currentUser.created_at || new Date().toISOString(),
        is_admin: userRoles.get(currentUser.id) === 'admin'
      }];
      
      // If we have role data for other users, add them too
      roleData?.forEach(role => {
        if (role.user_id !== currentUser.id) {
          // Check if this user is already in our list
          if (!usersList.some(u => u.id === role.user_id)) {
            usersList.push({
              id: role.user_id,
              email: `User ${role.user_id.substring(0, 8)}...`,
              created_at: new Date().toISOString(),
              is_admin: role.role === 'admin'
            });
          }
        }
      });
      
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users. Note: viewing users requires admin access.",
        variant: "destructive"
      });
      
      // Fallback to just showing the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
          
        setUsers([{
          id: user.id,
          email: user.email || "No email",
          created_at: user.created_at || new Date().toISOString(),
          is_admin: roleData?.role === 'admin'
        }]);
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleMakeAdmin = async (userId: string) => {
    try {
      const result = await createAdminRole(userId);
      
      if (result) {
        toast({
          title: "Success",
          description: "User has been granted admin privileges",
        });
        
        // Update the user's admin status in our local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, is_admin: true } : user
          )
        );
      } else {
        throw new Error("Failed to grant admin privileges");
      }
    } catch (error) {
      console.error("Error making user admin:", error);
      toast({
        title: "Error",
        description: "Failed to grant admin privileges",
        variant: "destructive"
      });
    }
  };
  
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        </div>
        
        <div className="flex items-center w-full max-w-sm space-x-2 mb-6">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {user.email}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className={`text-xs px-2 py-1 rounded-full w-fit ${
                      user.is_admin 
                        ? "bg-primary/10 text-primary" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {user.is_admin ? "Admin" : "User"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {!user.is_admin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMakeAdmin(user.id)}
                        className="flex items-center gap-1"
                      >
                        <UserPlus className="h-4 w-4" />
                        Make Admin
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No users found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
