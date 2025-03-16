
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
    const trimmedHeaderText = headerText.trim();
    
    if (!trimmedHeaderText) {
      toast({
        title: "Error",
        description: "Header text cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log("Submitting header text:", trimmedHeaderText);
      await onAddHeader(trimmedHeaderText);
      setHeaderText("");
      setIsAddingHeader(false);
      
      // Success toast handled in the hook
    } catch (error: any) {
      console.error("Error in handleAddHeader:", error);
      // Error toast handled in the hook
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddHeader();
    } else if (e.key === 'Escape') {
      setIsAddingHeader(false);
      setHeaderText("");
    }
  };
  
  const cancelAddHeader = () => {
    setIsAddingHeader(false);
    setHeaderText("");
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
          disabled={isSubmitting}
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
          onClick={cancelAddHeader}
          disabled={isSubmitting}
          type="button"
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
