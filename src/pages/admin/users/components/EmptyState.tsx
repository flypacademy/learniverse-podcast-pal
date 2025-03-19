
import React from "react";
import { UserPlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  searchTerm: string;
  onRefresh: () => void;
}

const EmptyState = ({ searchTerm, onRefresh }: EmptyStateProps) => {
  return (
    <div className="text-center py-8 space-y-4">
      <div className="flex justify-center">
        <UserPlus className="h-12 w-12 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-lg">
        {searchTerm ? "No users match your search" : "No users found in the database"}
      </p>
      <Button onClick={onRefresh} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
};

export default EmptyState;
