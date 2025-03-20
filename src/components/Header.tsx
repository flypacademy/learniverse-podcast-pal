
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b p-4">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Link to="/" className="font-semibold text-lg">
            AudioLearn
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
