
import React, { useState } from "react";
import { Search, Filter, BookOpen } from "lucide-react";
import Layout from "@/components/Layout";
import CourseCard from "@/components/CourseCard";

// Mock data
const allCourses = [
  {
    id: "math-gcse",
    title: "Mathematics GCSE",
    subject: "math" as const,
    totalPodcasts: 12,
    completedPodcasts: 5,
    description: "Master key mathematical concepts for your GCSE exams",
    image: "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png"
  },
  {
    id: "english-gcse",
    title: "English GCSE",
    subject: "english" as const,
    totalPodcasts: 10,
    completedPodcasts: 2,
    description: "Improve your English language and literature skills",
    image: "/lovable-uploads/b8505be1-663c-4327-9a5f-8c5bb7419180.png"
  },
  {
    id: "science-gcse",
    title: "Science GCSE",
    subject: "science" as const,
    totalPodcasts: 15,
    completedPodcasts: 0,
    description: "Biology, Chemistry and Physics combined for GCSE",
    image: ""
  },
  {
    id: "history-gcse",
    title: "History GCSE",
    subject: "history" as const,
    totalPodcasts: 8,
    completedPodcasts: 0,
    description: "Explore key historical events and their impact",
    image: ""
  },
  {
    id: "languages-gcse",
    title: "Foreign Languages",
    subject: "languages" as const,
    totalPodcasts: 12,
    completedPodcasts: 0,
    description: "French, Spanish and German language podcasts",
    image: ""
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
  
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || course.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });
  
  return (
    <Layout>
      <div className="space-y-6 animate-slide-up">
        <div className="pt-4">
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
        
        {/* Course List */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
            </p>
            <button className="flex items-center text-sm text-gray-700">
              <Filter className="h-4 w-4 mr-1" />
              Sort
            </button>
          </div>
          
          {filteredCourses.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="font-medium text-gray-700">No courses found</h3>
              <p className="text-gray-500 text-sm mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCourses.map((course) => (
                <CourseCard 
                  key={course.id}
                  {...course}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Courses;
