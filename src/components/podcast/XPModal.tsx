
import React from "react";
import { AlertTriangle, Award, Check, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface XPModalProps {
  isOpen: boolean;
  onClose: () => void;
  xpEarned: number;
}

const XPModal = ({ isOpen, onClose, xpEarned }: XPModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-center text-center">
            <Award className="h-8 w-8 text-yellow-400 mr-2" />
            <span>Quiz Completed!</span>
          </DialogTitle>
          <DialogDescription className="text-center text-gray-300">
            Great job on completing the quiz.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-full p-5 mb-4">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          
          <h3 className="text-xl font-bold text-center mb-2">
            You earned {xpEarned} XP
          </h3>
          
          <p className="text-center text-gray-300 text-sm">
            Keep going to earn more XP and unlock achievements!
          </p>
        </div>
        
        <DialogFooter>
          <Button className="w-full" onClick={onClose}>
            Continue Learning
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default XPModal;
