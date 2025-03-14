
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

// Admin check - completely rewritten to be more direct and thorough
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
    
    // Direct database query with SQL
    const { data, error } = await supabase.rpc(
      'is_admin',
      { user_id: userId }
    );
    
    if (error) {
      console.error("Error calling is_admin function:", error);
      return false;
    }
    
    console.log("is_admin function returned:", data);
    return !!data;
    
  } catch (err) {
    console.error("Exception in isUserAdmin:", err);
    return false;
  }
};
