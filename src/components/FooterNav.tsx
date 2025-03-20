
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Book, Home, Target, User } from "lucide-react";

const FooterNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 z-20">
      <div className="container flex items-center justify-around">
        <NavItem
          to="/"
          icon={<Home />}
          label="Home"
          active={isActive("/")}
        />
        <NavItem
          to="/courses"
          icon={<Book />}
          label="Courses"
          active={isActive("/courses")}
        />
        <NavItem
          to="/goals"
          icon={<Target />}
          label="Goals"
          active={isActive("/goals")}
        />
        <NavItem
          to="/profile"
          icon={<User />}
          label="Profile"
          active={isActive("/profile")}
        />
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavItem = ({ to, icon, label, active }: NavItemProps) => {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg ${
        active
          ? "text-primary font-medium"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      <div className="w-6 h-6">
        {icon}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
};

export default FooterNav;
