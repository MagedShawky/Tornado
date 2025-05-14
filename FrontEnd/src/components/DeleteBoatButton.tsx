
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface DeleteBoatButtonProps {
  boatId: string;
}

export function DeleteBoatButton({ boatId }: DeleteBoatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Get the current date in ISO format
      const today = new Date().toISOString().split('T')[0];
      
      // Check if the boat has any active or future trips
      // A trip is active/future if:
      // - start_date is today or in the future OR
      // - end_date is today or in the future
      const { data: activeTrips } = await supabase
        .from('trips')
        .select('id')
        .eq('boat_id', boatId)
        .or(`start_date.gte.${today},end_date.gte.${today}`)
        .limit(1);

      if (activeTrips && activeTrips.length > 0) {
        toast.error("Cannot delete boat because it has active or upcoming trips. Please delete or wait for these trips to end first.");
        setIsOpen(false);
        setIsDeleting(false);
        return;
      }

      // Delete any past trips associated with the boat
      const { error: tripDeleteError } = await supabase
        .from('trips')
        .delete()
        .eq('boat_id', boatId);
        
      if (tripDeleteError) {
        console.error('Error deleting associated trips:', tripDeleteError);
        toast.error("Failed to delete associated trips");
        setIsOpen(false);
        setIsDeleting(false);
        return;
      }
      
      // Delete all cabins associated with the boat
      // This must be done before deleting the boat due to the foreign key constraint
      const { error: cabinDeleteError } = await supabase
        .from('cabins')
        .delete()
        .eq('boat_id', boatId);
      
      if (cabinDeleteError) {
        console.error('Error deleting associated cabins:', cabinDeleteError);
        toast.error("Failed to delete associated cabins");
        setIsOpen(false);
        setIsDeleting(false);
        return;
      }
      
      // Now delete the boat itself
      const { error } = await supabase
        .from('boats')
        .delete()
        .eq('id', boatId);

      if (error) throw error;

      toast.success("Boat and all associated data deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["boats"] });
    } catch (error: any) {
      console.error('Error deleting boat:', error);
      toast.error(error.message || "Failed to delete boat");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the boat and all associated cabins and trip records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
