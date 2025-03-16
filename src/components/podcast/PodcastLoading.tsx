
import React from "react";

const PodcastLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Loading podcast...</p>
    </div>
  );
};

export default PodcastLoading;
