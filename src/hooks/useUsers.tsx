
import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { loadUsers } from "@/utils/loadUsers";

export type { User };

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        console.log("Fetching users in useUsers hook...");
        
        const result = await loadUsers();
        
        if (result.error) {
          setError(result.error);
          console.error("Error from loadUsers:", result.error);
        } else {
          setUsers(result.users);
          console.log(`Successfully loaded ${result.users.length} users`);
          setError(null);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load users");
        console.error("Error in useUsers hook:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []);
  
  return { users, loading, error };
}
