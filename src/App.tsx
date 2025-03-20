
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from "@/lib/supabase";
import { Session } from '@supabase/supabase-js';
import { Toaster } from "@/components/ui/toaster";
import OnboardingCheck from './components/OnboardingCheck';

// Import page components
import Index from './pages/Index';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import PodcastPlayer from './pages/PodcastPlayer';
import PodcastSample from './pages/PodcastSample';
import Tasks from './pages/Tasks';
import Goals from './pages/Goals';
import Profile from './pages/Profile';
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
import Onboarding from './pages/Onboarding';
import UserStats from './pages/admin/users/UserStats';
import UserListeningStats from './pages/admin/users/UserListeningStats';

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
    <>
      <Routes>
        {/* Onboarding route - accessible without authentication */}
        <Route path="/onboarding" element={<Onboarding />} />
        
        {/* Protected routes - require authentication & onboarding */}
        <Route path="/" element={
          <OnboardingCheck>
            <Index />
          </OnboardingCheck>
        } />
        <Route path="/courses" element={
          <OnboardingCheck>
            <Courses />
          </OnboardingCheck>
        } />
        <Route path="/course/:courseId" element={
          <OnboardingCheck>
            <CourseDetail />
          </OnboardingCheck>
        } />
        <Route path="/podcast/:podcastId" element={
          <OnboardingCheck>
            <PodcastPlayer />
          </OnboardingCheck>
        } />
        <Route path="/podcast-sample" element={
          <OnboardingCheck>
            <PodcastSample />
          </OnboardingCheck>
        } />

        {/* Student routes */}
        <Route path="/tasks" element={
          <OnboardingCheck>
            <Tasks />
          </OnboardingCheck>
        } />
        <Route path="/goals" element={
          <OnboardingCheck>
            <Goals />
          </OnboardingCheck>
        } />
        <Route path="/profile" element={
          <OnboardingCheck>
            <Profile />
          </OnboardingCheck>
        } />

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
        <Route path="/admin/users/stats" element={<UserStats />} />
        <Route path="/admin/users/listening-stats" element={<UserListeningStats />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
