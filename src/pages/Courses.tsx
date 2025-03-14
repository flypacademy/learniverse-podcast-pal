
import React, { useState, useEffect } from "react";
import { Search, Filter, BookOpen, Plus, Check } from "lucide-react";
import Layout from "@/components/Layout";
import CourseCard from "@/components/CourseCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

// Mock data
const allCourses = [
  {
    id: "math-gcse",
    title: "Mathematics GCSE",
    subject: "math" as const,
    totalPodcasts: 12,
    completedPodcasts: 5,
    description: "Master key mathematical concepts for your GCSE exams",
    image: "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png",
    enrolled: true
  },
  {
    id: "english-gcse",
    title: "English GCSE",
    subject: "english" as const,
    totalPodcasts: 10,
    completedPodcasts: 2,
    description: "Improve your English language and literature skills",
    image: "/lovable-uploads/b8505be1-663c-4327-9a5f-8c5bb7419180.png",
    enrolled: true
  },
  {
    id: "science-gcse",
    title: "Science GCSE",
    subject: "science" as const,
    totalPodcasts: 15,
    completedPodcasts: 0,
    description: "Biology, Chemistry and Physics combined for GCSE",
    image: "/lovable-uploads/6a12720b-97cc-4a73-9c51-608fd283049d.png",
    enrolled: false
  },
  {
    id: "history-gcse",
    title: "History GCSE",
    subject: "history" as const,
    totalPodcasts: 8,
    completedPodcasts: 0,
    description: "Explore key historical events and their impact",
    image: "",
    enrolled: false
  },
  {
    id: "languages-gcse",
    title: "Foreign Languages",
    subject: "languages" as const,
    totalPodcasts: 12,
    completedPodcasts: 0,
    description: "French, Spanish and German language podcasts",
    image: "",
    enrolled: false
  }
];

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
  const [myCourses, setMyCourses] = useState<typeof allCourses>([]);
  const [availableCourses, setAvailableCourses] = useState<typeof allCourses>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    // Filter courses based on enrolled status
    setMyCourses(allCourses.filter(course => course.enrolled));
    setAvailableCourses(allCourses.filter(course => !course.enrolled));
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
  };
  
  const filterCourses = (courses: typeof allCourses) => {
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
        
        {/* Courses Tabs */}
        <Tabs defaultValue="my-courses" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="my-courses">My Courses</TabsTrigger>
            <TabsTrigger value="find-courses">Find Courses</TabsTrigger>
          </TabsList>
          
          {/* My Courses Tab - Updated to use carousel */}
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
          
          {/* Find Courses Tab - Updated to use carousel */}
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
      </div>
    </Layout>
  );
};

export default Courses;
