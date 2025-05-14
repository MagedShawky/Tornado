
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

interface RentalActionsProps {
  isLoading: boolean;
  onAddRental: () => void;
  onSave: () => Promise<any>;
}

export function RentalActions({ 
  isLoading, 
  onAddRental, 
  onSave 
}: RentalActionsProps) {
  return (
    <div className="flex justify-between mt-4">
      <Button 
        variant="outline" 
        onClick={onAddRental}
        className="flex items-center gap-1"
      >
        <Plus className="h-4 w-4" /> Add Rental
      </Button>
      
      <Button 
        className="bg-red-500 hover:bg-red-600 px-16"
        onClick={onSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            SAVING...
          </>
        ) : (
          'SAVE'
        )}
      </Button>
    </div>
  );
}
