
import React from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Plus } from "lucide-react";
import PageHeader from "./components/PageHeader";
import PodcastTable from "./components/PodcastTable";
import { usePodcasts } from "./hooks/usePodcasts";
import { formatDuration } from "./utils/formatters";

const PodcastsList = () => {
  const { courseId } = useParams();
  const { courseName, podcasts, loading, deletePodcast } = usePodcasts(courseId);
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader courseName={courseName} courseId={courseId || ""} />
        <PodcastTable 
          podcasts={podcasts}
          courseId={courseId || ""}
          formatDuration={formatDuration}
          onDeletePodcast={deletePodcast}
          isLoading={loading}
        />
      </div>
    </AdminLayout>
  );
};

export default PodcastsList;
