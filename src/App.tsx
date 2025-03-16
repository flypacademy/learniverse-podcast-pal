
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import PodcastPlayer from "./pages/PodcastPlayer";
import PodcastSample from "./pages/PodcastSample";
import CourseDetail from "./pages/CourseDetail";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRegister from "./pages/admin/AdminRegister";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CoursesList from "./pages/admin/courses/CoursesList";
import CourseForm from "./pages/admin/courses/CourseForm";
import PodcastsList from "./pages/admin/podcasts/PodcastsList";
import AdminUsers from "./pages/admin/users/AdminUsers";
import AdminSettings from "./pages/admin/settings/AdminSettings";

import { Toaster } from "@/components/ui/toaster";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/podcast/:podcastId" element={<PodcastPlayer />} />
        <Route path="/podcast-sample/:podcastId" element={<PodcastSample />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/courses" element={<CoursesList />} />
        <Route path="/admin/courses/new" element={<CourseForm />} />
        <Route path="/admin/courses/:id/edit" element={<CourseForm />} />
        <Route path="/admin/courses/:courseId/podcasts" element={<PodcastsList />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
