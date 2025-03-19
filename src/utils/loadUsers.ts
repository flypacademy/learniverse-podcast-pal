
import { User } from "@/types/user";
import { fetchRealUsers, fetchUserProfiles, fetchUserXp } from "./userDataUtils";
import { combineUserData, combineProfileData } from "./userDataTransformers";
import { createSampleUser } from "./sampleUserUtils";

/**
 * Main function to load users from different data sources
 */
export async function loadUsers() {
  try {
    // Step 1: Try to fetch real users from auth.users
    const authUsers = await fetchRealUsers();
    
    // If we have real users from auth, use those
    if (authUsers && authUsers.length > 0) {
      console.log("Using real users from auth");
      
      // Step 2: Fetch user profiles and XP data to combine with auth users
      const profilesData = await fetchUserProfiles();
      const userIds = authUsers.map((user: any) => user.id);
      const xpData = await fetchUserXp(userIds);
      
      // Step 3: Combine all the data
      const combinedUsers = combineUserData(authUsers, profilesData, xpData);
      
      return {
        users: combinedUsers,
        error: null
      };
    }
    
    // If we don't have auth users, fall back to profiles
    const profilesData = await fetchUserProfiles();
    
    // If no profiles exist, create a sample user
    if (profilesData.length === 0) {
      const sampleUser = await createSampleUser();
      return {
        users: [sampleUser],
        error: null
      };
    }
    
    // Extract user IDs and fetch XP data
    const userIds = profilesData.map(profile => profile.id);
    const xpData = await fetchUserXp(userIds);
    
    // Combine the profile data
    const combinedUsers = combineProfileData(profilesData, xpData);
    
    return {
      users: combinedUsers,
      error: null
    };
  } catch (err: any) {
    console.error("Error in loadUsers function:", err);
    return {
      users: [],
      error: err.message
    };
  }
}
