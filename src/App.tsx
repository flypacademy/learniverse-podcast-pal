
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from "@/lib/supabase";
import { Session } from '@supabase/supabase-js';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/contexts/ThemeContext';

// Import page components
import Index from './pages/Index';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import PodcastPlayer from './pages/PodcastPlayer';
import PodcastSample from './pages/PodcastSample';
import Tasks from './pages/Tasks';
import Goals from './pages/Goals';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import AdminDashboard from './pages/admin/AdminDashboard';
import CoursesList from './pages/admin/courses/CoursesList';
import CourseForm from './pages/admin/courses/CourseForm';
import PodcastsList from './pages/admin/podcasts/PodcastsList';
import AdminUsers from './pages/admin/users/AdminUsers';
import AdminSettings from './pages/admin/settings/AdminSettings';
import NotFound from './pages/NotFound';
import PodcastForm from './pages/admin/podcasts/PodcastForm';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <ThemeProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
        <Route path="/podcast/:podcastId" element={<PodcastPlayer />} />
        <Route path="/podcast-sample" element={<PodcastSample />} />

        {/* Student routes */}
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/courses" element={<CoursesList />} />
        <Route path="/admin/courses/new" element={<CourseForm />} />
        <Route path="/admin/courses/:id/edit" element={<CourseForm />} />
        <Route path="/admin/courses/:courseId/podcasts" element={<PodcastsList />} />
        <Route path="/admin/courses/:courseId/podcasts/new" element={<PodcastForm />} />
        <Route path="/admin/courses/:courseId/podcasts/:id/edit" element={<PodcastForm />} />
        <Route path="/admin/podcasts/:podcastId/quiz" element={<NotFound />} /> {/* Add proper component later */}
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
