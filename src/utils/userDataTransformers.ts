
import { User } from "@/types/user";

/**
 * Combines user data with profile and XP information
 */
export const combineUserData = (authUsers: any[], profiles: any[], xpData: any[]): User[] => {
  return authUsers.map(user => {
    const profile = profiles.find(p => p.id === user.id);
    const xp = xpData.find(x => x.user_id === user.id);
    
    return {
      id: user.id,
      email: user.email || `user-${user.id.substring(0, 8)}@example.com`,
      created_at: user.created_at || new Date().toISOString(),
      last_sign_in_at: user.last_sign_in_at,
      display_name: profile?.display_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown User',
      total_xp: xp?.total_xp || 0
    };
  });
};

/**
 * Combines profile data with XP information
 * Used as fallback when auth users cannot be fetched
 */
export const combineProfileData = (profiles: any[], xpData: any[]): User[] => {
  return profiles.map(profile => {
    const xp = xpData.find(x => x.user_id === profile.id);
    
    return {
      id: profile.id,
      email: `user-${profile.id.substring(0, 8)}@example.com`, // Placeholder email
      created_at: profile.created_at,
      last_sign_in_at: null, // We don't have this info without admin access
      display_name: profile.display_name,
      total_xp: xp?.total_xp || 0
    };
  });
};
