
import { useState, useEffect, useCallback } from "react";
import { User } from "@/types/user";
import { fetchUsers } from "@/utils/userApiFetcher";
import { toast } from "sonner";
import { supabase, ensureUserProfile } from "@/lib/supabase";

export type { User };

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching users in useUsers hook...");
      
      // Ensure current user has a profile (helps with data consistency)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await ensureUserProfile(session.user.id);
      }
      
      const { data, error } = await fetchUsers();
      
      if (error) {
        setError(error);
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } else if (data) {
        setUsers(data);
        console.log(`Successfully loaded ${data.length} users:`, data);
      }
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred";
      setError(errorMessage);
      console.error("Exception in useUsers hook:", err);
      toast.error("Error loading users");
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);
  
  return { users, loading, error, refreshUsers };
}
