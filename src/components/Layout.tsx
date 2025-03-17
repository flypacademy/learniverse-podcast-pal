
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, User, Target } from "lucide-react";
import { useAudioStore } from "@/lib/audioContext";
import MiniPlayer from "./podcast/MiniPlayer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { currentPodcastId, podcastMeta } = useAudioStore();
  
  // Don't show mini player on the podcast page but ensure it's displayed on other pages
  const isPodcastPage = location.pathname.includes('/podcast/') && 
                       !location.pathname.includes('/podcast-sample');
  const showMiniPlayer = !!currentPodcastId && !!podcastMeta && !isPodcastPage;
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      <main className={`flex-1 pt-6 px-4 max-w-md mx-auto w-full ${showMiniPlayer ? 'pb-36' : 'pb-20'}`}>
        {children}
      </main>
      
      {/* Mini Player */}
      {showMiniPlayer && podcastMeta && (
        <div className="fixed bottom-20 left-0 right-0 z-20">
          <div className="max-w-md mx-auto px-4">
            <MiniPlayer 
              podcastId={podcastMeta.id}
              title={podcastMeta.title}
              courseName={podcastMeta.courseName}
              thumbnailUrl={podcastMeta.image}
            />
          </div>
        </div>
      )}
      
      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="flex justify-around items-center py-2 px-3 max-w-md mx-auto">
          <NavItem 
            to="/" 
            icon={<Home className="h-5 w-5" />} 
            label="Home"
            isActive={location.pathname === "/"}
          />
          <NavItem 
            to="/courses" 
            icon={<BookOpen className="h-5 w-5" />} 
            label="Courses"
            isActive={location.pathname === "/courses" || location.pathname.startsWith("/course/")}
          />
          <NavItem 
            to="/goals" 
            icon={<Target className="h-5 w-5" />} 
            label="Goals"
            isActive={location.pathname === "/goals"}
          />
          <NavItem 
            to="/profile" 
            icon={<User className="h-5 w-5" />} 
            label="Profile"
            isActive={location.pathname === "/profile"}
          />
        </div>
      </nav>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => {
  const handleClick = () => {
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center p-1.5 transition-all duration-200 ease-in-out ${
        isActive 
          ? "text-primary" 
          : "text-gray-500 hover:text-gray-700"
      }`}
      onClick={handleClick}
    >
      <div 
        className={`p-1 rounded-full ${
          isActive ? "bg-primary/10" : ""
        }`}
      >
        {icon}
      </div>
      <span className="text-xs mt-0.5">{label}</span>
    </Link>
  );
};

export default Layout;
