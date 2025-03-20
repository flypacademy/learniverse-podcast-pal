
import { ReactNode } from "react";
import { Award, Star, Trophy, Zap, Sparkles } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { useToast } from "@/components/ui/use-toast";

type IconName = "award" | "star" | "trophy" | "zap" | "sparkles";

interface IconToastProps {
  title: string;
  description?: string;
  icon?: IconName;
  duration?: number;
}

const iconMap = {
  award: Award,
  star: Star,
  trophy: Trophy,
  zap: Zap,
  sparkles: Sparkles,
};

export const useIconToast = () => {
  const { toast: shadowToast } = useToast();
  
  const toast = ({ title, description, icon = "award", duration = 4000 }: IconToastProps) => {
    const IconComponent = icon ? iconMap[icon] : null;
    
    // Use sonner toast if available (modern, more compact UI)
    if (typeof sonnerToast === 'function') {
      return sonnerToast(title, {
        description,
        duration,
        icon: IconComponent ? <IconComponent className="h-5 w-5 text-primary" /> : undefined,
      });
    }
    
    // Fallback to shadcn toast
    return shadowToast({
      title,
      description,
      duration,
    });
  };
  
  return { toast };
};
