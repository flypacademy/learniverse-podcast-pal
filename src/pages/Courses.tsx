
import React, { useState, useEffect } from "react";
import { Search, BookOpen, Plus } from "lucide-react";
import Layout from "@/components/Layout";
import CourseCard from "@/components/CourseCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { supabase } from "@/lib/supabase";

interface Course {
  id: string;
  title: string;
  subject: string;
  totalPodcasts: number;
  completedPodcasts: number;
  description: string;
  image: string;
  enrolled: boolean;
}

const subjects = [
  { id: "all", label: "All" },
  { id: "math", label: "Maths" },
  { id: "english", label: "English" },
  { id: "science", label: "Science" },
  { id: "history", label: "History" },
  { id: "languages", label: "Languages" }
];

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchCourses = async () => {
    setLoading(true);
    try {
      console.log("Fetching courses from Supabase...");
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch all courses from Supabase
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select('*');
      
      if (error) {
        console.error("Error fetching courses:", error);
        throw error;
      }
      
      console.log("Courses fetched:", coursesData);
      
      if (!coursesData || coursesData.length === 0) {
        // If no courses in database, use the mock data
        setMyCourses([]);
        setAvailableCourses([]);
        setLoading(false);
        return;
      }
      
      // Transform data to match our Course interface
      const transformedCourses: Course[] = await Promise.all(coursesData.map(async (course) => {
        // Get podcast count
        const { count: podcastCount, error: countError } = await supabase
          .from('podcasts')
          .select('id', { count: 'exact', head: true })
          .eq('course_id', course.id);
          
        if (countError) {
          console.error("Error counting podcasts:", countError);
        }
        
        // For now, just mark first two courses as enrolled
        // In a real app, you'd check if the user is enrolled in the course
        const enrolled = coursesData.indexOf(course) < 2;
        
        return {
          id: course.id,
          title: course.title,
          subject: course.subject || "math", // Default to math if subject not specified
          totalPodcasts: podcastCount || 0,
          completedPodcasts: 0, // Would be fetched from user progress in a real app
          description: course.description || "",
          image: course.image_url || "",
          enrolled: enrolled
        };
      }));
      
      // Filter courses based on enrolled status
      setMyCourses(transformedCourses.filter(course => course.enrolled));
      setAvailableCourses(transformedCourses.filter(course => !course.enrolled));
      
    } catch (error) {
      console.error("Error in fetchCourses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive"
      });
      
      // Fallback to empty lists
      setMyCourses([]);
      setAvailableCourses([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnrollCourse = (courseId: string) => {
    // Find the course to enroll
    const courseToEnroll = availableCourses.find(course => course.id === courseId);
    if (!courseToEnroll) return;

    // Update available courses (remove the enrolled one)
    setAvailableCourses(prev => prev.filter(c => c.id !== courseId));
    
    // Add to my courses with enrolled status
    const enrolledCourse = { ...courseToEnroll, enrolled: true };
    setMyCourses(prev => [...prev, enrolledCourse]);

    // Show success toast
    toast({
      title: "Course Added",
      description: `${courseToEnroll.title} has been added to your courses.`,
    });
    
    // In a real app, you'd update user enrollment in the database here
  };
  
  const filterCourses = (courses: Course[]) => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === "all" || course.subject === selectedSubject;
      
      return matchesSearch && matchesSubject;
    });
  };

  const filteredMyCourses = filterCourses(myCourses);
  const filteredAvailableCourses = filterCourses(availableCourses);
  
  return (
    <Layout>
      <div className="space-y-5 animate-slide-up">
        <div className="pt-1">
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">
            Courses
          </h1>
          <p className="text-gray-500">Explore our collection of GCSE courses</p>
        </div>
        
        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
                  ${selectedSubject === subject.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                {subject.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          // Courses Tabs
          <Tabs defaultValue="my-courses" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="my-courses">My Courses</TabsTrigger>
              <TabsTrigger value="find-courses">Find Courses</TabsTrigger>
            </TabsList>
            
            {/* My Courses Tab */}
            <TabsContent value="my-courses" className="space-y-4">
              {filteredMyCourses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <h3 className="font-medium text-gray-700">No enrolled courses</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Switch to "Find Courses" to add some
                  </p>
                </div>
              ) : (
                <Carousel className="w-full">
                  <CarouselContent>
                    {filteredMyCourses.map((course) => (
                      <CarouselItem key={course.id} className="basis-full">
                        <CourseCard 
                          {...course}
                          size="large"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="flex justify-center mt-3">
                    <div className="flex gap-1.5">
                      {filteredMyCourses.map((_, index) => (
                        <div 
                          key={index} 
                          className={`h-1.5 rounded-full ${index === 0 ? 'w-4 bg-primary' : 'w-1.5 bg-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </Carousel>
              )}
            </TabsContent>
            
            {/* Find Courses Tab */}
            <TabsContent value="find-courses" className="space-y-4">
              {filteredAvailableCourses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <h3 className="font-medium text-gray-700">No courses found</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <Carousel className="w-full">
                  <CarouselContent>
                    {filteredAvailableCourses.map((course) => (
                      <CarouselItem key={course.id} className="basis-full relative">
                        <CourseCard {...course} size="large" />
                        <button 
                          onClick={() => handleEnrollCourse(course.id)}
                          className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-md"
                        >
                          <Plus className="h-5 w-5 text-primary" />
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <div className="flex justify-center mt-3">
                    <div className="flex gap-1.5">
                      {filteredAvailableCourses.map((_, index) => (
                        <div 
                          key={index} 
                          className={`h-1.5 rounded-full ${index === 0 ? 'w-4 bg-primary' : 'w-1.5 bg-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </Carousel>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default Courses;
