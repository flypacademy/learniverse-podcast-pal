
import { User } from "@/types/user";
import { fetchRealUsers, fetchAllUsers, fetchUserProfiles, fetchUserXp } from "./userDataUtils";
import { combineUserData, combineProfileData } from "./userDataTransformers";
import { createSampleUser } from "./sampleUserUtils";

/**
 * Main function to load users from different data sources
 */
export async function loadUsers() {
  try {
    console.log("Starting to load users...");
    
    // Step 1: Try to fetch real users using our primary method
    let users: User[] | null = await fetchRealUsers();
    
    // If primary method fails, try the fallback approach
    if (!users || users.length === 0) {
      console.log("Primary fetch method failed, trying fallback approach");
      users = await fetchAllUsers();
    }
    
    // If we have real users from either method, enhance them with additional data
    if (users && users.length > 0) {
      console.log(`Found ${users.length} users from database`);
      
      // Step 2: Fetch user profiles and XP data to combine with users
      const profilesData = await fetchUserProfiles();
      const userIds = users.map(user => user.id);
      const xpData = await fetchUserXp(userIds);
      
      // Step 3: Combine all the data
      const combinedUsers = combineUserData(users, profilesData, xpData);
      console.log(`Combined ${combinedUsers.length} users with profiles and XP data`);
      
      return {
        users: combinedUsers,
        error: null
      };
    }
    
    // If we don't have users, fall back to profiles
    console.log("No users available from main sources, falling back to profiles");
    const profilesData = await fetchUserProfiles();
    
    if (profilesData && profilesData.length > 0) {
      console.log(`Found ${profilesData.length} user profiles`);
      
      // Extract user IDs and fetch XP data
      const userIds = profilesData.map(profile => profile.id);
      const xpData = await fetchUserXp(userIds);
      
      // Combine the profile data
      const combinedUsers = combineProfileData(profilesData, xpData);
      console.log(`Combined ${combinedUsers.length} users from profiles and XP data`);
      
      return {
        users: combinedUsers,
        error: null
      };
    }
    
    // Last resort: create sample user if no real data is found
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
