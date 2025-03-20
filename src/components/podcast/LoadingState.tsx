
import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";

const LoadingState = () => {
  return (
    <Layout>
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-6">
          <Link to="/courses">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        <Card className="p-8 flex flex-col items-center">
          <div className="w-48 h-48 rounded-2xl bg-gray-200 animate-pulse mb-6"></div>
          <div className="w-3/4 h-6 bg-gray-200 animate-pulse mb-3"></div>
          <div className="w-1/2 h-4 bg-gray-200 animate-pulse mb-8"></div>
          <div className="w-full h-4 bg-gray-200 animate-pulse mb-6"></div>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default LoadingState;
