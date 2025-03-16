
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table";
import { Trash2, Edit, FileQuestion, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Podcast {
  id: string;
  title: string;
  duration: number;
  audio_url: string;
  image_url: string | null;
  created_at: string;
  question_count?: number;
}

interface PodcastTableProps {
  podcasts: Podcast[];
  courseId: string;
  formatDuration: (seconds: number) => string;
  onDeletePodcast: (id: string) => Promise<void>;
  isLoading: boolean;
}

const PodcastTable = ({ 
  podcasts, 
  courseId, 
  formatDuration, 
  onDeletePodcast,
  isLoading
}: PodcastTableProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (podcasts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No podcasts found for this course</p>
        <Button asChild>
          <Link to={`/admin/courses/${courseId}/podcasts/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Podcast
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
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
  );
};

export default PodcastTable;
