
import React from "react";
import Layout from "@/components/Layout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileContent from "@/components/profile/ProfileContent";

const Profile = () => {
  return (
    <Layout>
      <ProfileHeader 
        title="Profile" 
        subtitle="Track your progress and achievements" 
      />
      <ProfileContent />
    </Layout>
  );
};

export default Profile;
