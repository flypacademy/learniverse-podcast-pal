import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import CourseCard from "@/components/CourseCard";

interface Course {
  id: string;
  title: string;
  subject: string;
  totalPodcasts: number;
  completedPodcasts: number;
  image: string;
  achievements?: { type: "streak" | "popular" | "recommended" | "complete"; value?: number }[];
}

const Index = () => {
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Mock data for development
    const mockCourses: Course[] = [
      {
        id: "mock-1",
        title: "GCSE Mathematics",
        subject: "math",
        totalPodcasts: 12,
        completedPodcasts: 4,
        image: "/lovable-uploads/0770156f-b934-4cce-b8f4-a67af547cc38.png",
        achievements: [
          { type: "streak", value: 5 },
          { type: "popular" }
        ],
      },
      {
        id: "mock-2",
        title: "GCSE English Language",
        subject: "english",
        totalPodcasts: 10,
        completedPodcasts: 2,
        image: "",
        achievements: [
          { type: "recommended" }
        ],
      },
    ];

    setRecentCourses(mockCourses);
    setLoading(false);
  }, []);

  console.log("Recent courses:", recentCourses);

  return (
    <Layout>
      <div className="space-y-6 pb-20 animate-slide-up">
        <div className="pt-2">
          <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-500">
            Continue your GCSE studies with podcast lessons
          </p>
        </div>

        {/* Recent Courses */}
        <div>
          <h2 className="font-bold text-xl mb-4">Continue Learning</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : recentCourses.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {recentCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  subject={course.subject}
                  totalPodcasts={course.totalPodcasts}
                  completedPodcasts={course.completedPodcasts}
                  image={course.image}
                  achievements={course.achievements}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                No recent courses. Start learning today!
              </p>
            </div>
          )}
        </div>

        {/* Rest of the content */}
        <div className="mt-8">
          <h2 className="font-bold text-xl mb-4">Today's Goals</h2>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-gray-600">
              You haven't set any goals for today. Visit the Goals page to set some.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
