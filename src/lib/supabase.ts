
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bofabebqofwfevliiuvf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZmFiZWJxb2Z3ZmV2bGlpdXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MjI4NjcsImV4cCI6MjA1NzQ5ODg2N30.3Op3A2CeHzxcU0JvXQgQXyfFeNg2rqacZCp9Lij7EPI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper for file upload and URL generation
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) {
    throw error;
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return urlData.publicUrl;
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
    
    // Explicitly make the admin check more direct and verbose with logging
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')  // Select all columns for debugging
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error fetching user roles:", error);
      return false;
    }
    
    console.log("User roles data:", data);
    
    // Check if any of the returned rows have role = 'admin'
    const isAdmin = data && data.length > 0 && data.some(row => row.role === 'admin');
    console.log("Is admin result:", isAdmin);
    
    return isAdmin;
    
  } catch (err) {
    console.error("Exception in isUserAdmin:", err);
    return false;
  }
};
