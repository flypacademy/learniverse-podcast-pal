
import React from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { Home, BookOpen, Users, Settings, Database, LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase, isUserAdmin } from "@/lib/supabase";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);
  
  React.useEffect(() => {
    const checkAdmin = async () => {
      setLoading(true);
      
      try {
        // Use the improved isUserAdmin function
        const adminStatus = await isUserAdmin();
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, []);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out of the admin panel",
    });
    window.location.href = '/admin/login';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
        </div>
        
        <nav className="p-4 space-y-1">
          <AdminNavItem 
            to="/admin" 
            icon={<Home className="h-5 w-5" />} 
            label="Dashboard" 
            active={location.pathname === "/admin"}
          />
          <AdminNavItem 
            to="/admin/courses" 
            icon={<BookOpen className="h-5 w-5" />} 
            label="Courses" 
            active={location.pathname.startsWith("/admin/courses")}
          />
          <AdminNavItem 
            to="/admin/users" 
            icon={<Users className="h-5 w-5" />} 
            label="Users" 
            active={location.pathname.startsWith("/admin/users")}
          />
          <AdminNavItem 
            to="/admin/settings" 
            icon={<Settings className="h-5 w-5" />} 
            label="Settings" 
            active={location.pathname.startsWith("/admin/settings")}
          />
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

interface AdminNavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const AdminNavItem = ({ to, icon, label, active }: AdminNavItemProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 rounded-md ${
        active 
          ? "bg-primary/10 text-primary" 
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export default AdminLayout;
