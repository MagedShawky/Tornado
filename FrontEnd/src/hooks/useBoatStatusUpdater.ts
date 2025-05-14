
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * This hook no longer automatically updates boat status based on trips.
 * It's been kept for compatibility but no longer performs automatic updates.
 * Boat status is now managed manually by boat owners.
 */
export function useBoatStatusUpdater() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // This function now only logs for audit purposes
    const auditBoatStatuses = async () => {
      try {
        console.log("Boat status updater is now passive - status updates are handled manually by boat owners");
      } catch (error) {
        console.error("Error in boat status audit:", error);
      }
    };

    // Run audit once on mount
    auditBoatStatuses();
    
    // No interval needed since we're not making changes
    
    return () => {
      // No cleanup needed
    };
  }, [queryClient]);
}
