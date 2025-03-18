
import React from "react";
import Layout from "@/components/Layout";
import ProfileContent from "@/components/profile/ProfileContent";
import { useUserXP } from "@/hooks/useUserXP";

const Profile = () => {
  const { data: userData } = useUserXP();
  
  return (
    <Layout>
      <ProfileContent userData={userData} />
    </Layout>
  );
};

export default Profile;
