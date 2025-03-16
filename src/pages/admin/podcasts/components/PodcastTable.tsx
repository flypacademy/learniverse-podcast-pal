
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table";
import { Trash2, Edit, FileQuestion, FolderSymlink } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Podcast {
  id: string;
  title: string;
  duration: number;
  audio_url: string;
  image_url: string | null;
  created_at: string;
  question_count?: number;
  course_header_id?: string | null;
}

interface Header {
  id: string;
  header_text: string;
}

interface PodcastTableProps {
  podcasts: Podcast[];
  courseId: string;
  formatDuration: (seconds: number) => string;
  onDeletePodcast: (id: string) => Promise<void>;
  onAssignPodcast?: (podcastId: string, headerId: string) => Promise<void>;
  isLoading: boolean;
}

const PodcastTable = ({ 
  podcasts, 
  courseId, 
  formatDuration, 
  onDeletePodcast,
  onAssignPodcast,
  isLoading
}: PodcastTableProps) => {
  const [headers, setHeaders] = useState<Header[]>([]);
  const [loadingHeaders, setLoadingHeaders] = useState<boolean>(false);
  const [selectedPodcast, setSelectedPodcast] = useState<string | null>(null);
  const [selectedHeader, setSelectedHeader] = useState<string>("");
  const { toast } = useToast();
  
  const fetchHeaders = async () => {
    if (!courseId) return;
    
    setLoadingHeaders(true);
    try {
      const { data, error } = await supabase
        .from('course_headers')
        .select('id, header_text')
        .eq('course_id', courseId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      setHeaders(data || []);
    } catch (error) {
      console.error("Error fetching headers:", error);
      toast({
        title: "Error",
        description: "Failed to load headers",
        variant: "destructive"
      });
    } finally {
      setLoadingHeaders(false);
    }
  };
  
  const handleOpenAssignDialog = (podcastId: string) => {
    setSelectedPodcast(podcastId);
    setSelectedHeader("");
    fetchHeaders();
  };
  
  const handleAssignHeader = async () => {
    if (!selectedPodcast || !selectedHeader || !onAssignPodcast) return;
    
    try {
      await onAssignPodcast(selectedPodcast, selectedHeader);
      setSelectedPodcast(null);
    } catch (error) {
      console.error("Error assigning header:", error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (podcasts.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No podcasts in this section</p>
      </div>
    );
  }
  
  return (
    <>
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
                  
                  {onAssignPodcast && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenAssignDialog(podcast.id)}
                        >
                          <FolderSymlink className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Assign to Header</DialogTitle>
                          <DialogDescription>
                            Select a header to assign this podcast to.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="py-4">
                          {loadingHeaders ? (
                            <div className="flex justify-center">
                              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                            </div>
                          ) : headers.length === 0 ? (
                            <p className="text-sm text-gray-500">No headers available. Please create a header first.</p>
                          ) : (
                            <Select value={selectedHeader} onValueChange={setSelectedHeader}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a header" />
                              </SelectTrigger>
                              <SelectContent>
                                {headers.map((header) => (
                                  <SelectItem key={header.id} value={header.id}>
                                    {header.header_text}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        
                        <DialogFooter>
                          <Button
                            onClick={handleAssignHeader}
                            disabled={!selectedHeader || loadingHeaders}
                          >
                            Assign
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  
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
                          onClick={() => onDeletePodcast(podcast.id)}
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
    </>
  );
};

export default PodcastTable;
