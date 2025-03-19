
import { supabase } from "@/lib/supabase";
import { User } from "@/types/user";
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a sample user profile for demonstration
 */
export const createSampleUser = async (): Promise<User> => {
  try {
    console.log("No user profiles found, trying to create a sample user...");
    
    // Generate a proper UUID 
    const sampleUserId = uuidv4();
    
    // Check if we have admin permissions by checking the user role
    const { data: roleData } = await supabase.rpc('is_admin');
    const hasAdminAccess = !!roleData;
    
    console.log("Has admin access:", hasAdminAccess);
    
    if (!hasAdminAccess) {
      console.log("No admin access, returning mock sample user");
      // If we don't have admin access, return a mock sample user
      return {
        id: sampleUserId,
        email: 'sample@example.com (mock)',
        created_at: new Date().toISOString(),
        last_sign_in_at: null,
        display_name: 'Sample User (mock)',
        total_xp: 150
      };
    }
    
    // Create a sample user profile
    const { data: sampleProfile, error: sampleProfileError } = await supabase
      .from('user_profiles')
      .insert([
        { 
          id: sampleUserId,
          display_name: 'Sample User',
          created_at: new Date().toISOString()
        }
      ])
      .select();
      
    if (sampleProfileError) {
      console.error("Error creating sample user:", sampleProfileError);
      throw sampleProfileError;
    }
    
    console.log("Sample user created successfully:", sampleProfile);
    
    // Create sample XP record
    const { error: sampleXpError } = await supabase
      .from('user_experience')
      .insert([
        {
          user_id: sampleUserId,
          total_xp: 150,
          weekly_xp: 50
        }
      ]);
      
    if (sampleXpError) {
      console.error("Error creating sample XP record:", sampleXpError);
    }
    
    return {
      id: sampleUserId,
      email: 'sample@example.com',
      created_at: new Date().toISOString(),
      last_sign_in_at: null,
      display_name: 'Sample User',
      total_xp: 150
    };
  } catch (err) {
    console.error("Error in createSampleUser:", err);
    // Return a mock sample user as fallback
    return {
      id: uuidv4(),
      email: 'sample@example.com (fallback)',
      created_at: new Date().toISOString(),
      last_sign_in_at: null,
      display_name: 'Sample User (fallback)',
      total_xp: 150
    };
  }
};
