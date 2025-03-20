
import React from "react";
import Layout from "@/components/Layout";
import ProfileContent from "@/components/profile/ProfileContent";
import { useUserXP } from "@/hooks/useUserXP";
import { useXP } from "@/hooks/useXP";

const Profile = () => {
  const { data: legacyUserData } = useUserXP();
  const { totalXP } = useXP();
  
  // Merge data from both hooks
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
