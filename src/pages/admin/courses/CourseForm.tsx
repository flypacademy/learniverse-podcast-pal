import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase, uploadFile } from "@/lib/supabase";

interface CourseFormData {
  title: string;
  subject: string;
  description: string;
  image_url: string;
  exam: string;
  board: string;
}

const CourseForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    subject: "math",
    description: "",
    image_url: "",
    exam: "GCSE",
    board: "AQA"
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  
  useEffect(() => {
    if (isEditMode) {
      const fetchCourse = async () => {
        try {
          const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setFormData({
              title: data.title,
              subject: data.subject,
              description: data.description || "",
              image_url: data.image_url || "",
              exam: data.exam || "GCSE",
              board: data.board || "AQA"
            });
            
            if (data.image_url) {
              setImagePreview(data.image_url);
            }
          }
        } catch (error) {
          console.error("Error fetching course:", error);
          toast({
            title: "Error",
            description: "Failed to load course data",
            variant: "destructive"
          });
        } finally {
          setInitialLoading(false);
        }
      };
      
      fetchCourse();
    }
  }, [id, isEditMode, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubjectChange = (value: string) => {
    setFormData({
      ...formData,
      subject: value,
    });
  };

  const handleExamChange = (value: string) => {
    setFormData({
      ...formData,
      exam: value,
    });
  };

  const handleBoardChange = (value: string) => {
    setFormData({
      ...formData,
      board: value,
    });
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let imageUrl = formData.image_url;
      
      // Upload image if a new one is selected
      if (selectedImage) {
        try {
          console.log("Uploading image to course-content bucket");
          const path = `courses/${Date.now()}_${selectedImage.name}`;
          imageUrl = await uploadFile('course-content', path, selectedImage);
          console.log("Image uploaded successfully:", imageUrl);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast({
            title: "Warning",
            description: "Image upload failed, but course will be created",
            variant: "default"
          });
        }
      }
      
      const courseData = {
        title: formData.title,
        subject: formData.subject,
        description: formData.description,
        image_url: imageUrl || null,
        exam: formData.exam,
        board: formData.board
      };
      
      console.log("Submitting course data:", courseData);
      
      if (isEditMode) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', id);
        
        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }
        
        toast({
          title: "Course updated",
          description: "The course has been updated successfully",
        });
      } else {
        // Create new course
        const { data, error } = await supabase
          .from('courses')
          .insert([courseData])
          .select();
        
        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }
        
        console.log("Course created successfully:", data);
        
        toast({
          title: "Course created",
          description: "The new course has been created successfully",
        });
      }
      
      // Redirect back to courses list
      navigate("/admin/courses");
    } catch (error: any) {
      console.error("Error saving course:", error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} course`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-4"
            onClick={() => navigate("/admin/courses")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? "Edit Course" : "Create Course"}
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Mathematics GCSE"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select 
                  value={formData.subject} 
                  onValueChange={handleSubjectChange}
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="languages">Languages</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="exam">Exam</Label>
                <Select 
                  value={formData.exam} 
                  onValueChange={handleExamChange}
                >
                  <SelectTrigger id="exam">
                    <SelectValue placeholder="Select an exam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="GCSE">GCSE</SelectItem>
                      <SelectItem value="IGCSE">IGCSE</SelectItem>
                      <SelectItem value="A-Level">A-Level</SelectItem>
                      <SelectItem value="IB">IB</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="board">Exam Board</Label>
                <Select 
                  value={formData.board} 
                  onValueChange={handleBoardChange}
                >
                  <SelectTrigger id="board">
                    <SelectValue placeholder="Select an exam board" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="AQA">AQA</SelectItem>
                      <SelectItem value="OCR">OCR</SelectItem>
                      <SelectItem value="CIE">CIE</SelectItem>
                      <SelectItem value="Edexcel">Edexcel</SelectItem>
                      <SelectItem value="CCEA">CCEA</SelectItem>
                      <SelectItem value="WJEC">WJEC</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide a description of this course..."
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Course Image</Label>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Course preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm text-center p-4">
                          No image selected
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
                        {selectedImage ? selectedImage.name : "Click to upload image"}
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
              onClick={() => navigate("/admin/courses")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Update Course" : "Create Course"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CourseForm;
