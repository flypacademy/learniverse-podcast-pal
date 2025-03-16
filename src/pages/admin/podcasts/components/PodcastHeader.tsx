
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Save, X, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PodcastHeaderProps {
  onAddHeader: (headerText: string) => Promise<void>;
  onDeleteHeader?: (headerId: string) => Promise<void>;
  headers?: { id: string; header_text: string }[];
}

const PodcastHeader: React.FC<PodcastHeaderProps> = ({ 
  onAddHeader, 
  onDeleteHeader,
  headers = []
}) => {
  const [isAddingHeader, setIsAddingHeader] = useState(false);
  const [headerText, setHeaderText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [headerToDelete, setHeaderToDelete] = useState<string | null>(null);
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
  
  const handleDeleteHeader = async () => {
    if (!headerToDelete || !onDeleteHeader) return;
    
    setIsSubmitting(true);
    try {
      await onDeleteHeader(headerToDelete);
      setHeaderToDelete(null);
      setIsOpen(false);
    } catch (error) {
      console.error("Error deleting header:", error);
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
    <div className="flex items-center gap-2 mb-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsAddingHeader(true)}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Header
      </Button>
      
      {headers.length > 0 && onDeleteHeader && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Header
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Header</DialogTitle>
              <DialogDescription>
                Select a header to delete. This will remove the header, but not the podcasts associated with it.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {headers.map(header => (
                  <div 
                    key={header.id} 
                    className={`p-2 rounded cursor-pointer hover:bg-gray-100 flex justify-between ${
                      headerToDelete === header.id ? 'bg-gray-100 border border-gray-300' : ''
                    }`}
                    onClick={() => setHeaderToDelete(header.id)}
                  >
                    <span>{header.header_text}</span>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => {
                  setHeaderToDelete(null);
                  setIsOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteHeader}
                disabled={!headerToDelete || isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete Header'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PodcastHeader;
