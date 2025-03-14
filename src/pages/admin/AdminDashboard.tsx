
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, FileAudio, HelpCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    courses: 0,
    podcasts: 0,
    quizQuestions: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      try {
        // Fetch counts from different tables
        const [courseCount, podcastCount, quizCount, userCount] = await Promise.all([
          supabase.from('courses').select('id', { count: 'exact', head: true }),
          supabase.from('podcasts').select('id', { count: 'exact', head: true }),
          supabase.from('quiz_questions').select('id', { count: 'exact', head: true }),
          supabase.from('user_roles').select('id', { count: 'exact', head: true }),
        ]);
        
        setStats({
          courses: courseCount.count || 0,
          podcasts: podcastCount.count || 0,
          quizQuestions: quizCount.count || 0,
          users: userCount.count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Courses"
            value={stats.courses.toString()}
            icon={<BookOpen className="h-6 w-6" />}
            loading={loading}
          />
          <StatCard
            title="Podcasts"
            value={stats.podcasts.toString()}
            icon={<FileAudio className="h-6 w-6" />}
            loading={loading}
          />
          <StatCard
            title="Quiz Questions"
            value={stats.quizQuestions.toString()}
            icon={<HelpCircle className="h-6 w-6" />}
            loading={loading}
          />
          <StatCard
            title="Users"
            value={stats.users.toString()}
            icon={<Users className="h-6 w-6" />}
            loading={loading}
          />
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <QuickActionCard 
              title="Add Course"
              description="Create a new course with podcasts"
              link="/admin/courses/new"
            />
            <QuickActionCard 
              title="Manage Users"
              description="View and manage user accounts"
              link="/admin/users"
            />
            <QuickActionCard 
              title="View Student Progress"
              description="Check how students are performing"
              link="/admin/progress"
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  loading: boolean;
}

const StatCard = ({ title, value, icon, loading }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-7 w-16 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface QuickActionCardProps {
  title: string;
  description: string;
  link: string;
}

const QuickActionCard = ({ title, description, link }: QuickActionCardProps) => {
  return (
    <Card className="transition-all hover:shadow-md cursor-pointer">
      <a href={link}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">{description}</p>
        </CardContent>
      </a>
    </Card>
  );
};

export default AdminDashboard;
