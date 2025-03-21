
import React, { useEffect } from "react";
import Layout from "@/components/Layout";
import ProfileContent from "@/components/profile/ProfileContent";
import { useUserXP } from "@/hooks/useUserXP";
import { useXP } from "@/hooks/useXP";

const Profile = () => {
  const { data: legacyUserData, loading: legacyLoading } = useUserXP();
  const { totalXP, isLoading: xpLoading, refreshXPData } = useXP();
  
  // Refresh XP data when component mounts
  useEffect(() => {
    refreshXPData();
  }, [refreshXPData]);
  
  const loading = legacyLoading || xpLoading;
  
  // Merge data from both hooks, prioritizing the new XP system
  const userData = {
    userName: legacyUserData?.userName || "Student",
    totalXP: totalXP ?? legacyUserData?.totalXP ?? 0,
    weeklyXP: legacyUserData?.weeklyXP ?? 0,
  };
  
  return (
    <Layout>
      <ProfileContent userData={userData} />
    </Layout>
  );
};

export default Profile;
