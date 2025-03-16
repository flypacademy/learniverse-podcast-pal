
import React from "react";
import { Award } from "lucide-react";

interface XPModalProps {
  show: boolean;
  xpAmount?: number;
}

const XPModal = ({ show, xpAmount = 15 }: XPModalProps) => {
  if (!show) return null;
  
  return (
    <div className="fixed bottom-20 left-0 right-0 flex justify-center animate-slide-up">
      <div className="glass-card px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Award className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-gray-900">+{xpAmount} XP Earned!</p>
          <p className="text-xs text-gray-500">Keep listening to earn more</p>
        </div>
      </div>
    </div>
  );
};

export default XPModal;
