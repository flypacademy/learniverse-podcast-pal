
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

// Admin check
export const isUserAdmin = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log("No session found when checking admin status");
      return false;
    }
    
    console.log("Checking admin status for user ID:", session.user.id);
    
    // First check if this user exists in the user_roles table at all
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
    
    console.log("User roles data:", data);
    
    // Check if any of the returned roles is 'admin'
    return data && data.length > 0 && data.some(role => role.role === 'admin');
  } catch (err) {
    console.error("Exception in isUserAdmin:", err);
    return false;
  }
};
