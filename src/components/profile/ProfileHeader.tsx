
import React, { useState } from "react";
import { Settings } from "lucide-react";
import SettingsModal from "./SettingsModal";

interface ProfileHeaderProps {
  title: string;
  subtitle: string;
}

const ProfileHeader = ({ title, subtitle }: ProfileHeaderProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  return (
    <div className="pt-4 flex justify-between items-start">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">
          {title}
        </h1>
        <p className="text-gray-500">{subtitle}</p>
      </div>
      <button 
        className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center"
        onClick={() => setIsSettingsOpen(true)}
      >
        <Settings className="h-5 w-5 text-gray-700" />
      </button>

      <SettingsModal 
        open={isSettingsOpen} 
        onOpenChange={setIsSettingsOpen} 
      />
    </div>
  );
};

export default ProfileHeader;
