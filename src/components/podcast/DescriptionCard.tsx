
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
          <Link to={`/quiz/${podcastId}`}>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Take Quiz
            </Button>
          </Link>
        </div>
      )}
    </>
  );
};

export default DescriptionCard;
