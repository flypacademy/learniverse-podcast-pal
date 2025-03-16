
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table";
import { Trash2, Edit, Plus, ChevronLeft, FileQuestion } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";

interface Podcast {
  id: string;
  title: string;
  duration: number;
  audio_url: string;
  image_url: string | null;
  created_at: string;
  question_count?: number;
}

const PodcastsList = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [courseName, setCourseName] = useState("");
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('title')
          .eq('id', courseId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setCourseName(data.title);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast({
          title: "Error",
          description: "Failed to load course data",
          variant: "destructive"
        });
      }
    };
    
    const fetchPodcasts = async () => {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('podcasts')
          .select('*')
          .eq('course_id', courseId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const podcastsWithQuizCount = await Promise.all(
          (data || []).map(async (podcast) => {
            const { count } = await supabase
              .from('quiz_questions')
              .select('id', { count: 'exact', head: true })
              .eq('podcast_id', podcast.id);
            
            return {
              ...podcast,
              question_count: count || 0
            };
          })
        );
        
        setPodcasts(podcastsWithQuizCount);
      } catch (error) {
        console.error("Error fetching podcasts:", error);
        toast({
          title: "Error",
          description: "Failed to load podcasts",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (courseId) {
      fetchCourse();
      fetchPodcasts();
    }
  }, [courseId]);
  
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const deletePodcast = async (id: string) => {
    try {
      const { error } = await supabase
        .from('podcasts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setPodcasts(podcasts.filter(podcast => podcast.id !== id));
      
      toast({
        title: "Podcast deleted",
        description: "The podcast has been successfully deleted"
      });
    } catch (error) {
      console.error("Error deleting podcast:", error);
      toast({
        title: "Error",
        description: "Failed to delete podcast",
        variant: "destructive"
      });
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-4"
            onClick={() => navigate("/admin/courses")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Button>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{courseName}</h1>
            <p className="text-gray-500 mt-1">Podcasts for this course</p>
          </div>
          <Button asChild>
            <Link to={`/admin/courses/${courseId}/podcasts/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Podcast
            </Link>
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : podcasts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Quiz Questions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {podcasts.map((podcast) => (
                <TableRow key={podcast.id}>
                  <TableCell className="font-medium">{podcast.title}</TableCell>
                  <TableCell>{formatDuration(podcast.duration)}</TableCell>
                  <TableCell>{podcast.question_count}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/podcasts/${podcast.id}/quiz`}>
                          <FileQuestion className="h-4 w-4 mr-1" />
                          Quiz
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/courses/${courseId}/podcasts/${podcast.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the podcast
                              and all associated quiz questions.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deletePodcast(podcast.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No podcasts found for this course</p>
            <Button asChild>
              <Link to={`/admin/courses/${courseId}/podcasts/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Podcast
              </Link>
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PodcastsList;
