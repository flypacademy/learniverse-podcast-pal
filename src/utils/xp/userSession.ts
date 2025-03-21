
import { supabase } from "@/lib/supabase";

/**
 * Gets the current user session and ID
 */
export const getUserSession = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log("No active session, can't fetch XP");
      return null;
    }
    
    return session.user.id;
  } catch (err) {
    console.error("Error getting user session:", err);
    return null;
  }
};
