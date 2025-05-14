
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { TripFormData } from "@/hooks/useTripForm";

interface UseTripMutationProps {
  initialData?: any;
  onSuccess?: () => void;
}

export function useTripMutation({ initialData, onSuccess }: UseTripMutationProps = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      formData: TripFormData;
      startDate: Date;
      endDate: Date;
      availableBoats: any[];
    }) => {
      const { formData, startDate, endDate, availableBoats } = data;

      if (!startDate || !endDate) {
        throw new Error("Please select both start and end dates");
      }

      const selectedBoat = availableBoats?.find(boat => boat.id === formData.boat_id);
      if (!selectedBoat) {
        throw new Error("Selected boat not found or not available for the selected dates");
      }

      // When updating, we need to maintain the existing booked_spots
      let booked_spots = 0;
      if (initialData) {
        // Get current trip data to preserve booked_spots
        const { data: currentTrip, error: tripError } = await supabase
          .from("trips")
          .select("booked_spots")
          .eq('id', initialData.id)
          .single();
        
        if (tripError) throw tripError;
        booked_spots = currentTrip?.booked_spots || 0;
      }

      // Make sure available_spots + booked_spots doesn't exceed capacity
      const available_spots = Math.max(0, selectedBoat.capacity - booked_spots);

      const tripData = {
        boat_id: formData.boat_id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        destination: formData.destination,
        price: formData.price,
        location_from: formData.location_from,
        location_to: formData.location_to,
        available_spots,
        discount: formData.discount || 0,
      };

      if (initialData) {
        // Update existing trip
        const { error } = await supabase
          .from("trips")
          .update(tripData)
          .eq('id', initialData.id);
        if (error) throw error;
      } else {
        // Create new trip without changing boat status
        const { error: tripError } = await supabase
          .from("trips")
          .insert([tripData]);
        if (tripError) throw tripError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["all-trips"] });
      queryClient.invalidateQueries({ queryKey: ["available-boats"] });
      queryClient.invalidateQueries({ queryKey: ["boats"] });
      queryClient.invalidateQueries({ queryKey: ["all-boats"] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error("Error saving trip:", error);
      toast.error(`Failed to save trip: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });
}
