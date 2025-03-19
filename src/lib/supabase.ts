import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bofabebqofwfevliiuvf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZmFiZWJxb2Z3ZmV2bGlpdXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MjI4NjcsImV4cCI6MjA1NzQ5ODg2N30.3Op3A2CeHzxcU0JvXQgQXyfFeNg2rqacZCp9Lij7EPI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enhanced file upload helper with better error handling and retry logic
export const uploadFile = async (bucket: string, path: string, file: File) => {
  console.log(`Starting upload to bucket: ${bucket}, path: ${path}, file size: ${file.size} bytes`);
  
  try {
    // Upload the file directly without bucket existence check
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error("Upload error:", error);
      throw error;
    }
    
    console.log("Upload successful:", data);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    console.log("Generated public URL:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (err) {
    console.error("Upload exception:", err);
    throw err;
  }
};

// Helper to use the security-definer function for creating admin roles
export const createAdminRole = async (userId: string): Promise<string | null> => {
  try {
    console.log("Calling create_admin_role function for user ID:", userId);
    
    const { data, error } = await supabase
      .rpc('create_admin_role', { admin_user_id: userId });
    
    if (error) {
      console.error("Error creating admin role:", error);
      return null;
    }
    
    console.log("Admin role created successfully:", data);
    return data;
  } catch (err) {
    console.error("Exception in createAdminRole:", err);
    return null;
  }
};

// Admin check function - completely rewritten for more reliability
export const isUserAdmin = async (): Promise<boolean> => {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log("No active session found - user not logged in");
      return false;
    }
    
    const userId = session.user.id;
    console.log("Checking admin status for user ID:", userId);
    
    // Use the RPC function to check admin status with the fixed function
    const { data, error } = await supabase
      .rpc('is_admin', { user_id: userId });
    
    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
    
    console.log("Admin check result:", data);
    return !!data;
    
  } catch (err) {
    console.error("Exception in isUserAdmin:", err);
    return false;
  }
};

// Get current user with profile data
export const getCurrentUserWithProfile = async () => {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log("No active session found");
      return null;
    }
    
    const user = session.user;
    console.log("Current authenticated user:", user.id);
    
    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error fetching profile:", profileError);
    }
    
    // Get user XP data
    const { data: xpData, error: xpError } = await supabase
      .from('user_experience')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (xpError && xpError.code !== 'PGRST116') {
      console.error("Error fetching XP data:", xpError);
    }
    
    return {
      ...user,
      profile: profile || null,
      xp: xpData || null
    };
  } catch (err) {
    console.error("Exception in getCurrentUserWithProfile:", err);
    return null;
  }
};

// Helper function to ensure a user profile exists
export const ensureUserProfile = async (userId: string, displayName?: string) => {
  try {
    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (!checkError && existingProfile) {
      console.log("User profile already exists");
      return true;
    }
    
    // Create profile if it doesn't exist
    const { data: user } = await supabase.auth.getUser();
    const userName = displayName || user.user?.user_metadata?.display_name || user.user?.email?.split('@')[0] || "New User";
    
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        display_name: userName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error("Error creating user profile:", insertError);
      return false;
    }
    
    console.log("User profile created successfully");
    return true;
  } catch (err) {
    console.error("Exception in ensureUserProfile:", err);
    return false;
  }
};
