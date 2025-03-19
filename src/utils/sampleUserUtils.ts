
import { User } from "@/types/user";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a sample user when no real users can be fetched
 */
export async function createSampleUser(): Promise<User> {
  console.log("No user profiles found, trying to create a sample user...");
  
  try {
    // Check if we have admin access to create a real user
    const { data: hasAdminAccess } = await supabase.rpc('is_admin');
    
    console.log("Has admin access:", hasAdminAccess);
    
    if (hasAdminAccess) {
      // Generate a new user id
      const userId = uuidv4();
      
      // If we have admin access, we could insert a new profile
      // But for safety, we'll still return a mock user
      return {
        id: userId,
        email: "sample@example.com",
        created_at: new Date().toISOString(),
        last_sign_in_at: null,
        display_name: "Sample User",
        total_xp: 150
      };
    }
    
    // No admin access, return mock sample user
    console.log("No admin access, returning mock sample user");
    return {
      id: uuidv4(),
      email: "sample@example.com (mock)",
      created_at: new Date().toISOString(),
      last_sign_in_at: null,
      display_name: "Sample User (mock)",
      total_xp: 150
    };
    
  } catch (error) {
    console.error("Error creating sample user:", error);
    
    // Return a mock user as fallback
    return {
      id: uuidv4(),
      email: "sample@example.com (mock)",
      created_at: new Date().toISOString(),
      last_sign_in_at: null,
      display_name: "Sample User (mock)",
      total_xp: 150
    };
  }
}
