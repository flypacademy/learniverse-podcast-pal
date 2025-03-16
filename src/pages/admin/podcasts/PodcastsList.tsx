
import React, { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabase";

interface CourseHeader {
  id: string;
  header_text: string;
  course_id: string;
}

const PodcastsList = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [headers, setHeaders] = useState<CourseHeader[]>([]);
  const { 
    courseName, 
    podcasts, 
    loading, 
    deletePodcast,
    sections,
    addHeader,
    assignPodcastToHeader,
    deleteHeader,
    error
  } = usePodcasts(courseId);
  
  useEffect(() => {
    const fetchHeaders = async () => {
      if (!courseId) return;
      
      try {
        const { data, error } = await supabase
          .from('course_headers')
          .select('*')
          .eq('course_id', courseId);
        
        if (error) throw error;
        setHeaders(data || []);
      } catch (err) {
        console.error("Error fetching headers:", err);
      }
    };
    
    fetchHeaders();
  }, [courseId]);
  
  const handleAddHeader = async (headerText: string) => {
    console.log("PodcastsList - handleAddHeader called with:", headerText);
    if (courseId && headerText) {
      const result = await addHeader(headerText);
      // Refresh headers list
      const { data } = await supabase
        .from('course_headers')
        .select('*')
        .eq('course_id', courseId);
      
      setHeaders(data || []);
      return result;
    }
  };
  
  const handleDeleteHeader = async (headerId: string) => {
    if (courseId) {
      await deleteHeader(headerId);
      // Refresh headers list
      const { data } = await supabase
        .from('course_headers')
        .select('*')
        .eq('course_id', courseId);
      
      setHeaders(data || []);
    }
  };
  
  const handleAssignPodcast = async (podcastId: string, headerId: string) => {
    if (courseId) {
      await assignPodcastToHeader(podcastId, headerId);
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader courseName={courseName} courseId={courseId || ""} />
        
        <div className="flex justify-between items-center">
          <PodcastHeader 
            onAddHeader={handleAddHeader}
            onDeleteHeader={handleDeleteHeader}
            headers={headers}
          />
          
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
                  onAssignPodcast={handleAssignPodcast}
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
