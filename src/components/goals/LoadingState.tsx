
import React from "react";
import Layout from "@/components/Layout";

const LoadingState: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-slide-up p-4">
        <h1 className="font-display font-bold text-2xl text-gray-900">
          Podcast Goals
        </h1>
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3">Loading...</span>
        </div>
      </div>
    </Layout>
  );
};

export default LoadingState;
