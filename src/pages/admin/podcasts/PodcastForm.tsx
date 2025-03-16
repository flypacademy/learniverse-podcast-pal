
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Upload, Loader2, FileAudio, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase, uploadFile } from "@/lib/supabase";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const PodcastForm = () => {
  const { courseId, id: podcastId } = useParams();
  const isEditMode = !!podcastId;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [courseName, setCourseName] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });
  
  // Fetch course name
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
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
    
    fetchCourse();
  }, [courseId, toast]);
  
  // Fetch podcast data if in edit mode
  useEffect(() => {
    if (isEditMode && podcastId) {
      const fetchPodcast = async () => {
        try {
          const { data, error } = await supabase
            .from('podcasts')
            .select('*')
            .eq('id', podcastId)
            .single();
          
          if (error) throw error;
          
          if (data) {
            form.reset({
              title: data.title,
              description: data.description || "",
            });
            
            setAudioName(data.audio_url.split('/').pop());
            setAudioDuration(data.duration);
            
            if (data.image_url) {
              setImagePreview(data.image_url);
            }
          }
        } catch (error) {
          console.error("Error fetching podcast:", error);
          toast({
            title: "Error",
            description: "Failed to load podcast data",
            variant: "destructive"
          });
        } finally {
          setInitialLoading(false);
        }
      };
      
      fetchPodcast();
    } else {
      setInitialLoading(false);
    }
  }, [isEditMode, podcastId, form, toast]);
  
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      setAudioName(file.name);
      
      // Get audio duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      
      audio.onloadedmetadata = () => {
        setAudioDuration(Math.round(audio.duration));
      };
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit = async (formData: FormData) => {
    if (!courseId) {
      toast({
        title: "Error",
        description: "Course ID is missing",
        variant: "destructive"
      });
      return;
    }
    
    if (!isEditMode && !audioFile) {
      toast({
        title: "Error",
        description: "Please upload an audio file",
        variant: "destructive"
      });
      return;
    }
    
    if (!audioDuration && !isEditMode) {
      toast({
        title: "Error",
        description: "Unable to determine audio duration",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      let audioUrl = isEditMode ? (await getPodcastAudioUrl()) : "";
      let imageUrl = isEditMode ? (await getPodcastImageUrl()) : null;
      
      // Upload audio file if a new one is selected
      if (audioFile) {
        try {
          const path = `podcasts/${Date.now()}_${audioFile.name}`;
          audioUrl = await uploadFile('podcast-content', path, audioFile);
        } catch (uploadError) {
          console.error("Error uploading audio:", uploadError);
          toast({
            title: "Error",
            description: "Failed to upload audio file",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      }
      
      // Upload image if a new one is selected
      if (imageFile) {
        try {
          const path = `podcasts/${Date.now()}_${imageFile.name}`;
          imageUrl = await uploadFile('podcast-content', path, imageFile);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          // Continue with podcast creation even if image upload fails
          toast({
            title: "Warning",
            description: "Image upload failed, but podcast will be created",
            variant: "default"
          });
        }
      }
      
      const podcastData = {
        title: formData.title,
        description: formData.description,
        audio_url: audioUrl,
        image_url: imageUrl,
        duration: audioDuration,
        course_id: courseId
      };
      
      if (isEditMode) {
        // Update existing podcast
        const { error } = await supabase
          .from('podcasts')
          .update(podcastData)
          .eq('id', podcastId);
        
        if (error) throw error;
        
        toast({
          title: "Podcast updated",
          description: "The podcast has been updated successfully",
        });
      } else {
        // Create new podcast
        const { error } = await supabase
          .from('podcasts')
          .insert([podcastData]);
        
        if (error) throw error;
        
        toast({
          title: "Podcast created",
          description: "The new podcast has been created successfully",
        });
      }
      
      // Redirect back to podcasts list
      navigate(`/admin/courses/${courseId}/podcasts`);
    } catch (error: any) {
      console.error("Error saving podcast:", error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} podcast`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getPodcastAudioUrl = async (): Promise<string> => {
    if (!podcastId) return "";
    
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('audio_url')
        .eq('id', podcastId)
        .single();
      
      if (error) throw error;
      
      return data?.audio_url || "";
    } catch (error) {
      console.error("Error getting audio URL:", error);
      return "";
    }
  };
  
  const getPodcastImageUrl = async (): Promise<string | null> => {
    if (!podcastId) return null;
    
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('image_url')
        .eq('id', podcastId)
        .single();
      
      if (error) throw error;
      
      return data?.image_url || null;
    } catch (error) {
      console.error("Error getting image URL:", error);
      return null;
    }
  };
  
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  if (initialLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-4"
            onClick={() => navigate(`/admin/courses/${courseId}/podcasts`)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Podcasts
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? "Edit Podcast" : "Add New Podcast"}
            </h1>
            <p className="text-gray-500 mt-1">
              {courseName && `Course: ${courseName}`}
            </p>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Podcast Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter podcast title..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a description of this podcast..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <Label>Audio File {isEditMode && !audioFile && audioName ? "(Current: " + audioName + ")" : ""}</Label>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileAudio className="h-6 w-6 text-primary mr-2" />
                          <div>
                            <p className="text-sm font-medium">
                              {audioFile ? audioFile.name : (audioName || "No file selected")}
                            </p>
                            {audioDuration > 0 && (
                              <p className="text-xs text-gray-500">
                                Duration: {formatDuration(audioDuration)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="flex flex-col justify-center">
                    <Label 
                      htmlFor="audio-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md border-gray-300 cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          Click to upload audio file
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          MP3, WAV or M4A files
                        </p>
                      </div>
                      <input 
                        id="audio-upload" 
                        type="file" 
                        accept="audio/*"
                        className="hidden" 
                        onChange={handleAudioChange}
                      />
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Podcast Image (optional)</Label>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Podcast preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <ImageIcon className="h-8 w-8 mb-2" />
                            <span className="text-sm">No image selected</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="flex flex-col justify-center">
                    <Label 
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md border-gray-300 cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          Click to upload image
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG or WebP files
                        </p>
                      </div>
                      <input 
                        id="image-upload" 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={handleImageChange}
                      />
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/admin/courses/${courseId}/podcasts`)}
                disabled={loading}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Update Podcast" : "Create Podcast"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
};

export default PodcastForm;
