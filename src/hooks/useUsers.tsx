
import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { loadUsers } from "@/utils/loadUsers";

export { User };

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        
        const result = await loadUsers();
        
        if (result.error) {
          setError(result.error);
        } else {
          setUsers(result.users);
          setError(null);
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Error in useUsers hook:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []);
  
  return { users, loading, error };
}
