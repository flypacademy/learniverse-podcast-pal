
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PodcastHeaderProps {
  onAddHeader: (headerText: string) => Promise<void>;
}

const PodcastHeader: React.FC<PodcastHeaderProps> = ({ onAddHeader }) => {
  const [isAddingHeader, setIsAddingHeader] = useState(false);
  const [headerText, setHeaderText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleAddHeader = async () => {
    if (!headerText.trim()) {
      toast({
        title: "Error",
        description: "Header text cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onAddHeader(headerText);
      setHeaderText("");
      setIsAddingHeader(false);
    } catch (error: any) {
      console.error("Error adding header:", error);
      // Error handling is done in the usePodcasts hook
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddHeader();
    } else if (e.key === 'Escape') {
      setIsAddingHeader(false);
      setHeaderText("");
    }
  };
  
  if (isAddingHeader) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Enter header text"
          value={headerText}
          onChange={(e) => setHeaderText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-w-xs"
          autoFocus
        />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAddHeader}
          disabled={isSubmitting || !headerText.trim()}
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            setIsAddingHeader(false);
            setHeaderText("");
          }}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => setIsAddingHeader(true)}
      className="mb-4"
    >
      <Plus className="h-4 w-4 mr-1" />
      Add Header
    </Button>
  );
};

export default PodcastHeader;
