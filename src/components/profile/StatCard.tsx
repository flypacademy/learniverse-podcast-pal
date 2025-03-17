
import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard = ({ label, value, icon }: StatCardProps) => {
  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex items-center gap-3 mb-1.5">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="font-display font-semibold text-xl">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
