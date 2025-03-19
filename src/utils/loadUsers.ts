
import { User } from "@/types/user";
import { fetchRealUsers, fetchAllUsers, fetchUserProfiles, fetchUserXp, fetchAuthUsers } from "./userDataUtils";
import { combineUserData, combineProfileData } from "./userDataTransformers";
import { createSampleUser } from "./sampleUserUtils";

/**
 * Main function to load users from different data sources
 */
export async function loadUsers() {
  try {
    console.log("Starting to load users...");
    
    // Try to fetch users directly from auth API (new method)
    let users: User[] | null = await fetchAuthUsers();
    
    // If that failed, try using the admin API
    if (!users || users.length === 0) {
      console.log("Auth API method failed, trying admin API");
      users = await fetchRealUsers();
    }
    
    // If that failed too, try the fallback approach
    if (!users || users.length === 0) {
      console.log("Admin API method failed, trying profile-based approach");
      users = await fetchAllUsers();
    }
    
    // If we have real users from any method, enhance them with profile and XP data
    if (users && users.length > 0) {
      console.log(`Found ${users.length} users from database`);
      
      // Fetch user profiles and XP data to combine with users
      const profilesData = await fetchUserProfiles();
      const userIds = users.map(user => user.id);
      const xpData = await fetchUserXp(userIds);
      
      // Combine all the data
      const combinedUsers = combineUserData(users, profilesData, xpData);
      console.log(`Combined ${combinedUsers.length} users with profiles and XP data`);
      
      return {
        users: combinedUsers,
        error: null
      };
    }
    
    // If we still don't have users, create a sample one as last resort
    console.log("No user data found at all, creating a sample user as last resort...");
    const sampleUser = await createSampleUser();
    return {
      users: [sampleUser],
      error: null
    };
  } catch (err: any) {
    console.error("Error in loadUsers function:", err);
    return {
      users: [],
      error: err.message || "Failed to load users"
    };
  }
}
