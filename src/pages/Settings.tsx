
import React from "react";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { Switch } from "@/components/ui/switch";
import Layout from "@/components/Layout";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Layout>
      <div className="space-y-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">
            Settings
          </h1>
          <div className="w-8" />
        </div>

        <div className="glass-card p-5 rounded-xl">
          <h2 className="font-display font-semibold text-xl mb-4 text-gray-900 dark:text-white">
            Appearance
          </h2>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  Dark Mode
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Switch between light and dark themes
                </p>
              </div>
            </div>
            <Switch 
              checked={isDark}
              onCheckedChange={toggleTheme}
            />
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <h2 className="font-display font-semibold text-xl mb-4 text-gray-900 dark:text-white">
            Account
          </h2>
          
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between py-3 px-1 border-b border-gray-200 dark:border-gray-700">
              <p className="font-medium text-gray-800 dark:text-gray-200">
                Personal Information
              </p>
              <ArrowLeft className="h-4 w-4 rotate-180 text-gray-500 dark:text-gray-400" />
            </button>
            
            <button className="w-full flex items-center justify-between py-3 px-1 border-b border-gray-200 dark:border-gray-700">
              <p className="font-medium text-gray-800 dark:text-gray-200">
                Notifications
              </p>
              <ArrowLeft className="h-4 w-4 rotate-180 text-gray-500 dark:text-gray-400" />
            </button>
            
            <button className="w-full flex items-center justify-between py-3 px-1">
              <p className="font-medium text-destructive">
                Sign Out
              </p>
              <ArrowLeft className="h-4 w-4 rotate-180 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl">
          <h2 className="font-display font-semibold text-xl mb-4 text-gray-900 dark:text-white">
            About
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2">
              <p className="text-gray-500 dark:text-gray-400">Version</p>
              <p className="font-medium text-gray-800 dark:text-gray-200">1.0.0</p>
            </div>
            
            <div className="flex justify-between py-2">
              <p className="text-gray-500 dark:text-gray-400">Terms of Service</p>
              <ArrowLeft className="h-4 w-4 rotate-180 text-gray-500 dark:text-gray-400" />
            </div>
            
            <div className="flex justify-between py-2">
              <p className="text-gray-500 dark:text-gray-400">Privacy Policy</p>
              <ArrowLeft className="h-4 w-4 rotate-180 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
