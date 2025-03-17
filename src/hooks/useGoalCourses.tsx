
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface GoalCourse {
  id: string;
  name: string;
  exam: string;
  board: string;
}

export interface GoalPodcast {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  duration: number;
  progress: number;
  completed: boolean;
  image: string;
}

export function useGoalCourses() {
  const [courses, setCourses] = useState<GoalCourse[]>([]);
  const [podcasts, setPodcasts] = useState<GoalPodcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCoursesAndPodcasts() {
      try {
        setLoading(true);
        
        // Fetch courses from Supabase
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('id, title, exam, board, subject')
          .order('display_order', { ascending: true });
        
        if (coursesError) {
          throw coursesError;
        }
        
        // Format courses data
        const formattedCourses = coursesData.map(course => ({
          id: course.id,
          name: course.title,
          exam: course.exam || 'GCSE',
          board: course.board || 'AQA'
        }));
        
        // If no courses are found, use fallback data
        if (!formattedCourses.length) {
          const fallbackCourses = [
            { id: "math-gcse", name: "Mathematics", exam: "GCSE", board: "AQA" },
            { id: "english-gcse", name: "English", exam: "GCSE", board: "Edexcel" },
            { id: "science-gcse", name: "Science", exam: "GCSE", board: "OCR" },
            { id: "history-gcse", name: "History", exam: "A-Level", board: "AQA" },
            { id: "french-gcse", name: "French", exam: "IGCSE", board: "CIE" }
          ];
          setCourses(fallbackCourses);
        } else {
          setCourses(formattedCourses);
        }
        
        // Fetch podcasts from Supabase
        const { data: podcastsData, error: podcastsError } = await supabase
          .from('podcasts')
          .select(`
            id, 
            title, 
            duration, 
            image_url,
            course_id,
            courses(title)
          `)
          .order('created_at', { ascending: false });
        
        if (podcastsError) {
          throw podcastsError;
        }
        
        // Format podcasts data with proper type checking
        const formattedPodcasts: GoalPodcast[] = podcastsData.map(podcast => {
          // Get course title with proper type checking
          let courseTitle = "Unknown Course";
          
          if (podcast.courses) {
            // Check if courses is an object with title property
            if (typeof podcast.courses === 'object' && podcast.courses !== null && 'title' in podcast.courses) {
              const title = podcast.courses.title;
              if (typeof title === 'string') {
                courseTitle = title;
              }
            }
          }
          
          return {
            id: podcast.id,
            title: podcast.title,
            courseId: podcast.course_id,
            courseName: courseTitle, // Now explicitly a string
            duration: podcast.duration || 600, // Default 10 minutes if not set
            progress: 0,
            completed: false,
            image: podcast.image_url || "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png"
          };
        });
        
        // If no podcasts are found, use fallback data
        if (!formattedPodcasts.length) {
          const fallbackPodcasts: GoalPodcast[] = [
            {
              id: "podcast-1",
              title: "Algebra Fundamentals",
              courseId: "math-gcse",
              courseName: "Mathematics GCSE",
              duration: 540, // 9 minutes
              progress: 0,
              completed: false,
              image: "/lovable-uploads/429ae110-6f7f-402e-a6a0-7cff7720c1cf.png"
            },
            {
              id: "podcast-2",
              title: "Shakespeare Analysis",
              courseId: "english-gcse",
              courseName: "English GCSE",
              duration: 720, // 12 minutes
              progress: 0,
              completed: false,
              image: "/lovable-uploads/b8505be1-663c-4327-9a5f-8c5bb7419180.png"
            },
            {
              id: "podcast-3",
              title: "Chemical Reactions",
              courseId: "science-gcse",
              courseName: "Science GCSE",
              duration: 600, // 10 minutes
              progress: 0,
              completed: false,
              image: ""
            }
          ];
          setPodcasts(fallbackPodcasts);
        } else {
          setPodcasts(formattedPodcasts);
        }
        
        setLoading(false);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching courses and podcasts:", err);
        setError(err.message);
        setLoading(false);
      }
    }
    
    fetchCoursesAndPodcasts();
  }, []);
  
  return { courses, podcasts, loading, error };
}
