
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import ProfileContent from "@/components/profile/ProfileContent";
import { useUserXP } from "@/hooks/useUserXP";
import { useXP } from "@/hooks/useXP";

const Profile = () => {
  const { data: legacyUserData, loading: legacyLoading } = useUserXP();
  const { totalXP, isLoading: xpLoading, refreshXPData } = useXP();
  const [finalLoading, setFinalLoading] = useState(true);
  
  // Fetch XP data when component mounts, but don't cause re-renders
  useEffect(() => {
    refreshXPData();
    
    // Add timeout to prevent indefinite loading and flickering
    const loadingTimeout = setTimeout(() => {
      setFinalLoading(false);
    }, 1500); // Slightly longer timeout to ensure data is loaded
    
    return () => clearTimeout(loadingTimeout);
  }, []);
  
  // Update loading state based on both loading states, but don't toggle back to loading
  // once we've shown data to prevent flickering
  useEffect(() => {
    if (!legacyLoading && !xpLoading && finalLoading) {
      setFinalLoading(false);
    }
  }, [legacyLoading, xpLoading, finalLoading]);
  
  // Merge data from both hooks, prioritizing the new XP system
  const userData = {
    userName: legacyUserData?.userName || "Student",
    totalXP: totalXP ?? legacyUserData?.totalXP ?? 0,
    weeklyXP: legacyUserData?.weeklyXP ?? 0,
  };
  
  return (
    <Layout>
      <ProfileContent 
        userData={userData} 
        isLoading={finalLoading}
      />
    </Layout>
  );
};

export default Profile;
