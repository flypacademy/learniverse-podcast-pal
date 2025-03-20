
import React from "react";
import { Card } from "@/components/ui/card";
import PodcastDescription from "./PodcastDescription";

interface DescriptionCardProps {
  description: string;
  isQuizAvailable: boolean;
  podcastId: string;
}

const DescriptionCard = ({ description, isQuizAvailable, podcastId }: DescriptionCardProps) => {
  return (
    <>
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md rounded-3xl p-5 border-none">
        <PodcastDescription description={description} />
      </Card>
      
      {/* Quiz button if available */}
      {isQuizAvailable && (
        <div className="mt-4 text-center">
          <a href={`/quiz/${podcastId}`} className="inline-block">
            <button className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
              Take Quiz
            </button>
          </a>
        </div>
      )}
    </>
  );
};

export default DescriptionCard;
