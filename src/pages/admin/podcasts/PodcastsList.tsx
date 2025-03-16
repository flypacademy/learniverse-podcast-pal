
import React from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Plus } from "lucide-react";
import PageHeader from "./components/PageHeader";
import PodcastTable from "./components/PodcastTable";
import PodcastHeader from "./components/PodcastHeader";
import { usePodcasts } from "./hooks/usePodcasts";
import { formatDuration } from "./utils/formatters";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const PodcastsList = () => {
  const { courseId } = useParams();
  const { 
    courseName, 
    podcasts, 
    loading, 
    deletePodcast,
    sections,
    addHeader,
    error
  } = usePodcasts(courseId);
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader courseName={courseName} courseId={courseId || ""} />
        
        <div className="flex justify-between items-center">
          <PodcastHeader onAddHeader={(headerText) => addHeader(headerText)} />
          
          <Button asChild>
            <Link to={`/admin/courses/${courseId}/podcasts/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Podcast
            </Link>
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? null : sections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No podcasts found for this course</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="space-y-4">
                {section.header && (
                  <div className="font-semibold text-lg">{section.header}</div>
                )}
                <PodcastTable 
                  podcasts={section.podcasts}
                  courseId={courseId || ""}
                  formatDuration={formatDuration}
                  onDeletePodcast={deletePodcast}
                  isLoading={false}
                />
                {index < sections.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PodcastsList;
