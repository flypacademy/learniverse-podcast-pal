
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, User, Target } from "lucide-react";
import { useAudioStore } from "@/lib/audioContext";
import MiniPlayer from "./podcast/MiniPlayer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { currentPodcastId, podcastMeta, isPlaying, audioElement } = useAudioStore();
  
  // Don't show mini player on the podcast page but ensure it's displayed on other pages
  const isPodcastPage = location.pathname.includes('/podcast/') && 
                       !location.pathname.includes('/podcast-sample');
  const showMiniPlayer = !!currentPodcastId && !!podcastMeta && !isPodcastPage;
  
  // Critical: Ensure audio continues playing during navigation
  useEffect(() => {
    if (showMiniPlayer && isPlaying && audioElement && audioElement.paused) {
      console.log("Layout: Ensuring audio playback continues during navigation");
      // Using a synchronous approach for immediate playback
      try {
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn("Layout: Could not auto-play during navigation:", error);
          });
        }
      } catch (error) {
        console.warn("Layout: Error auto-playing audio during navigation:", error);
      }
    }
  }, [showMiniPlayer, isPlaying, audioElement, location.pathname]);
  
  // Split the children to extract the header and content
  const childrenArray = React.Children.toArray(children);
  const headerElement = childrenArray[0]; // First child is assumed to be the header
  const contentElements = childrenArray.slice(1); // Rest are content
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50 relative">
      {/* Fixed Header Section */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-md mx-auto">
          {headerElement}
        </div>
      </div>
      
      {/* Scrollable Content - add padding to account for fixed header */}
      <main className={`flex-1 mt-24 px-4 max-w-md mx-auto w-full ${showMiniPlayer ? 'pb-36' : 'pb-20'}`}>
        {contentElements}
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
      
      {/* Navigation Bar - Updated with improved fixed positioning */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10" style={{ position: 'fixed' }}>
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
