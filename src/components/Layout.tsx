
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, User, CheckSquare } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Add top safe area padding for iOS status bar */}
      <div className="h-8 bg-background" /> {/* Safe area for status bar */}
      
      <main className="flex-1 pb-24 pt-4 px-4 max-w-md mx-auto w-full">
        {children}
      </main>
      
      <nav className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white border border-gray-100 shadow-lg rounded-full z-10 max-w-xs w-[90%]">
        <div className="flex justify-around items-center py-2 px-3">
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
            to="/tasks" 
            icon={<CheckSquare className="h-5 w-5" />} 
            label="Tasks"
            isActive={location.pathname === "/tasks"}
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
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center p-1.5 transition-all duration-200 ease-in-out ${
        isActive 
          ? "text-primary" 
          : "text-gray-500 hover:text-gray-700"
      }`}
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
