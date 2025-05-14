
import { useQuery } from "@tanstack/react-query";
import { Trip } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";

export function useTrip(tripId: string | undefined) {
  return useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      console.log("Fetching trip data for ID:", tripId);
      
      if (!tripId) {
        throw new Error("No trip ID provided");
      }
      
      const { data, error } = await supabase
        .from("trips")
        .select(`
          *,
          boat:boats(*)
        `)
        .eq("id", tripId)
        .single();

      if (error) {
        console.error("Error fetching trip:", error);
        throw error;
      }
      
      console.log("Trip data received:", data);
      return data as Trip & { boat: any };
    },
    enabled: !!tripId,
  });
}
