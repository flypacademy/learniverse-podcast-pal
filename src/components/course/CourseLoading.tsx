
import React from "react";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CourseLoading = () => {
  return (
    <Layout>
      <div className="space-y-6 pb-4 animate-slide-up">
        <div className="flex items-center space-x-2 pt-4">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="rounded-xl overflow-hidden relative h-48 bg-gray-200 animate-pulse"></div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <Skeleton className="h-2 w-full mt-2" />
        </div>
        <div className="w-full">
          <div className="grid w-full grid-cols-2 mb-4">
            <Skeleton className="h-10 rounded-md" />
            <Skeleton className="h-10 rounded-md" />
          </div>
          <div className="space-y-4 pt-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseLoading;
