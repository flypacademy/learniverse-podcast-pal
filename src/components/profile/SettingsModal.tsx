
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Bell,
  Moon,
  Globe,
  Volume2,
  Shield,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const { toast } = useToast();
  // Initialize state for the switches
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Settings</DialogTitle>
          <DialogDescription className="text-gray-500">
            Customize your app experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-gray-500">Stay up to date</p>
              </div>
            </div>
            <Switch 
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Moon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-gray-500">Easy on the eyes</p>
              </div>
            </div>
            <Switch 
              checked={darkModeEnabled}
              onCheckedChange={setDarkModeEnabled}
            />
          </div>

          {/* Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Language</p>
                <p className="text-sm text-gray-500">English (US)</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          {/* Audio Quality */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Volume2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Audio Quality</p>
                <p className="text-sm text-gray-500">Standard</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          {/* Privacy */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Privacy & Security</p>
                <p className="text-sm text-gray-500">Manage your data</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 mt-4 border border-gray-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Log out</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
