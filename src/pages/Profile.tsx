
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import ProfileContent from "@/components/profile/ProfileContent";
import { useUserXP } from "@/hooks/useUserXP";
import { useXP } from "@/hooks/useXP";

const Profile = () => {
  const { data: legacyUserData, loading: legacyLoading } = useUserXP();
  const { totalXP, isLoading: xpLoading, refreshXPData } = useXP();
  const [finalLoading, setFinalLoading] = useState(true);
  
  // Refresh XP data when component mounts
  useEffect(() => {
    refreshXPData();
    
    // Add timeout to prevent indefinite loading
    const loadingTimeout = setTimeout(() => {
      setFinalLoading(false);
    }, 3000);
    
    return () => clearTimeout(loadingTimeout);
  }, [refreshXPData]);
  
  // Update loading state based on both loading states
  useEffect(() => {
    if (!legacyLoading && !xpLoading) {
      setFinalLoading(false);
    }
  }, [legacyLoading, xpLoading]);
  
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
