
import { supabase } from "@/lib/supabase";
import { User } from "@/types/user";

/**
 * Fetches user profiles from the database
 * This is our fallback when we can't access auth.users directly
 */
export async function fetchProfiles(): Promise<Partial<User>[]> {
  try {
    console.log("Fetching user profiles...");
    
    // Try to get user data from auth.users via RPC if available
    try {
      const { data: authUsers, error: authError } = await supabase
        .rpc('get_user_emails');
      
      // If we have auth user data via RPC, use it
      if (!authError && authUsers && Array.isArray(authUsers) && authUsers.length > 0) {
        console.log(`Found ${authUsers.length} users from get_user_emails RPC`);
        // Explicitly type the email map with correct structure
        const emailMap = new Map<string, string>();
        
        // Safely add items to the map with proper typing
        for (const u of authUsers) {
          if (u && typeof u === 'object' && 'id' in u && 'email' in u) {
            const id = u.id as string;
            const email = u.email as string;
            if (id && typeof email === 'string') {
              emailMap.set(id, email);
            }
          }
        }
        
        // Get profile data to merge with auth data
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('*');
        
        // Merge data from both sources with proper typing
        return (profiles || []).map(profile => {
          const email = profile.id ? emailMap.get(profile.id) || "" : "";
          return {
            id: profile.id,
            email: email,
            created_at: profile.created_at,
            display_name: profile.display_name || (typeof email === 'string' && email ? email.split('@')[0] : `User ${profile.id?.substring(0, 6)}`),
            total_xp: 0
          };
        });
      }
    } catch (err) {
      console.log("RPC get_user_emails not available or failed:", err);
    }
    
    // First try to get profiles with authentication metadata
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*');
    
    // If profiles table exists and has data, use it
    if (!profileError && profileData && profileData.length > 0) {
      console.log(`Found ${profileData.length} profiles from profiles table`);
      return profileData.map(profile => ({
        id: profile.id,
        email: typeof profile.email === 'string' ? profile.email : "",
        created_at: profile.created_at,
        display_name: profile.full_name || profile.display_name || `User ${profile.id?.substring(0, 6)}`,
        total_xp: 0
      }));
    }
    
    // If profiles doesn't exist or is empty, try user_profiles
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (error) {
      console.error("Error fetching user_profiles:", error);
      return [];
    }
    
    // Try to fetch emails via direct RPC function with proper typing
    const emailMap = new Map<string, string>();
    
    try {
      if (data && data.length > 0) {
        const userIds = data.map(profile => profile.id).filter(Boolean);
        
        const { data: emailsData, error: emailsError } = await supabase
          .rpc('get_user_emails_for_ids', {
            user_ids: userIds
          });
        
        // Only add to map if we have valid email data
        if (!emailsError && emailsData && Array.isArray(emailsData)) {
          for (const item of emailsData) {
            if (item && typeof item === 'object' && 'id' in item && 'email' in item) {
              const id = item.id as string;
              const email = item.email as string;
              if (id && typeof email === 'string') {
                emailMap.set(id, email);
              }
            }
          }
        }
      }
    } catch (err) {
      console.log("RPC get_user_emails_for_ids not available or failed:", err);
    }
    
    console.log(`Found ${data?.length || 0} profiles from user_profiles table`);
    return data?.map(profile => {
      const email = profile.id ? emailMap.get(profile.id) || "" : "";
      const displayName = profile.display_name || 
        (typeof email === 'string' && email ? email.split('@')[0] : `User ${profile.id?.substring(0, 6)}`);
      
      return {
        id: profile.id || "",
        email: email,
        display_name: displayName,
        created_at: profile.created_at || new Date().toISOString(),
      };
    }) || [];
  } catch (err) {
    console.error("Exception in fetchProfiles:", err);
    return [];
  }
}
