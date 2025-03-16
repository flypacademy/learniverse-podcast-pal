
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bofabebqofwfevliiuvf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZmFiZWJxb2Z3ZmV2bGlpdXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MjI4NjcsImV4cCI6MjA1NzQ5ODg2N30.3Op3A2CeHzxcU0JvXQgQXyfFeNg2rqacZCp9Lij7EPI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enhanced file upload helper with better error handling and retry logic
export const uploadFile = async (bucket: string, path: string, file: File) => {
  console.log(`Starting upload to bucket: ${bucket}, path: ${path}, file size: ${file.size} bytes`);
  
  // Check if the bucket exists first
  const { data: buckets, error: bucketsError } = await supabase.storage
    .listBuckets();
    
  if (bucketsError) {
    console.error("Error checking buckets:", bucketsError);
    throw bucketsError;
  }
  
  const bucketExists = buckets.some(b => b.name === bucket);
  if (!bucketExists) {
    console.error(`Bucket "${bucket}" does not exist`);
    throw new Error(`Bucket "${bucket}" does not exist. Please create it first.`);
  }
  
  // Attempt upload with retry logic
  let attempts = 0;
  const maxAttempts = 3;
  let lastError = null;
  
  while (attempts < maxAttempts) {
    attempts++;
    console.log(`Upload attempt ${attempts}/${maxAttempts}`);
    
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error(`Upload attempt ${attempts} failed:`, error);
        lastError = error;
        
        // Wait a bit before retrying (exponential backoff)
        if (attempts < maxAttempts) {
          const delay = Math.pow(2, attempts) * 500;
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        } else {
          throw error;
        }
      }
      
      console.log("Upload successful:", data);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
      
      console.log("Generated public URL:", urlData.publicUrl);
      return urlData.publicUrl;
    } catch (err) {
      console.error(`Unexpected error in attempt ${attempts}:`, err);
      lastError = err;
      
      if (attempts < maxAttempts) {
        const delay = Math.pow(2, attempts) * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error("All upload attempts failed");
  throw lastError || new Error("Failed to upload file after multiple attempts");
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
