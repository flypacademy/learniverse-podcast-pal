
import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Home,
  BookOpen,
  Target,
  User,
  Search,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useMedia } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const { pathname } = useLocation();
  const isMobile = useMedia("(max-width: 768px)");
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  const routes = [
    {
      icon: <Home className="h-6 w-6" />,
      label: "Home",
      href: "/",
      active: pathname === "/",
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      label: "Courses",
      href: "/courses",
      active: pathname === "/courses",
    },
    {
      icon: <Target className="h-6 w-6" />,
      label: "Goals",
      href: "/goals",
      active: pathname === "/goals",
    },
    {
      icon: <User className="h-6 w-6" />,
      label: "Profile",
      href: "/profile",
      active: pathname === "/profile",
    },
  ];

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="flex min-h-[100svh] flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-sidebar-background px-4">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold text-primary">FlypCast</span>
        </Link>

        <div className="flex items-center gap-2">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground hidden md:block">
                    {user.email}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="hidden md:flex"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button size="sm" asChild>
                  <Link to="/auth">Sign in</Link>
                </Button>
              )}
            </>
          )}
          
          <button className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100">
            <Search className="h-5 w-5 text-gray-500" />
          </button>

          {isMobile && (
            <button
              className="md:hidden ml-2 flex h-9 w-9 items-center justify-center rounded-md bg-gray-100"
              onClick={toggleMenu}
            >
              {menuOpen ? (
                <X className="h-5 w-5 text-gray-500" />
              ) : (
                <Menu className="h-5 w-5 text-gray-500" />
              )}
            </button>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobile && menuOpen && (
        <div className="fixed inset-0 z-20 bg-white pt-16">
          <div className="flex flex-col p-4 space-y-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                to={route.href}
                className={`flex items-center p-3 rounded-md ${
                  route.active
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {route.icon}
                <span className="ml-3">{route.label}</span>
              </Link>
            ))}
            {user && (
              <button
                onClick={() => {
                  signOut();
                  setMenuOpen(false);
                }}
                className="flex items-center p-3 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-6 w-6" />
                <span className="ml-3">Logout</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-4xl px-4 py-2">{children}</div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-white">
          <div className="flex items-center justify-around">
            {routes.map((route) => (
              <Link
                key={route.href}
                to={route.href}
                className={`flex flex-1 flex-col items-center py-3 ${
                  route.active ? "text-primary" : "text-gray-500"
                }`}
              >
                {route.icon}
                <span className="mt-1 text-xs font-medium">{route.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
