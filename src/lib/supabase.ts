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

// Admin check function
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
    
    // Simpler, more direct approach
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();
    
    if (error) {
      console.error("Error checking admin role:", error);
      return false;
    }
    
    const isAdmin = !!data && data.role === 'admin';
    console.log("Admin check result:", isAdmin, data);
    return isAdmin;
    
  } catch (err) {
    console.error("Exception in isUserAdmin:", err);
    return false;
  }
};
