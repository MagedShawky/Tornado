
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";

interface CancelBookingParams {
  bookingIds: string[];
  tripId: string;
  bookingType: "option" | "confirmed"; 
  tripStartDate: Date;
  onSuccess?: () => void;
}

interface BookingCancellationResult {
  id: string;
  penalty_amount?: number;
  penalty_percentage?: number;
}

export function useCancelBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      bookingIds, 
      tripId, 
      bookingType, 
      tripStartDate,
      onSuccess
    }: CancelBookingParams): Promise<BookingCancellationResult[]> => {
      if (!bookingIds || bookingIds.length === 0) {
        throw new Error("No bookings selected for cancellation");
      }

      // First, get the booking details to calculate penalties if needed
      const { data: bookingsData, error: fetchError } = await supabase
        .from("cabin_bookings")
        .select("id, price, status")
        .in('id', bookingIds);
      
      if (fetchError) {
        console.error("Error fetching bookings:", fetchError);
        throw fetchError;
      }

      if (!bookingsData || bookingsData.length === 0) {
        throw new Error("No valid bookings found for cancellation");
      }

      const results: BookingCancellationResult[] = [];
      const today = new Date();
      
      // Calculate cancellation details for each booking
      for (const booking of bookingsData) {
        let penaltyPercentage = 0;
        let penaltyAmount = 0;

        // Only apply penalties for confirmed bookings
        if (bookingType === "confirmed") {
          const daysUntilTrip = differenceInDays(tripStartDate, today);
          
          if (daysUntilTrip <= 7) {
            penaltyPercentage = 100; // 100% penalty if canceled within 7 days
          } else if (daysUntilTrip <= 14) {
            penaltyPercentage = 50; // 50% penalty if canceled within 14 days
          } else if (daysUntilTrip <= 30) {
            penaltyPercentage = 25; // 25% penalty if canceled within 30 days
          } else {
            penaltyPercentage = 10; // 10% penalty if canceled more than 30 days in advance
          }
          
          penaltyAmount = (booking.price * penaltyPercentage) / 100;
        }

        results.push({
          id: booking.id,
          penalty_amount: penaltyAmount,
          penalty_percentage: penaltyPercentage
        });
      }

      // Update trip's available and booked spots
      const { data: tripData, error: tripFetchError } = await supabase
        .from("trips")
        .select("booked_spots, available_spots, boat:boat_id(capacity)")
        .eq("id", tripId)
        .single();

      if (tripFetchError) {
        console.error("Error fetching trip data:", tripFetchError);
        throw tripFetchError;
      }

      const newBookedSpots = tripData.booked_spots - bookingIds.length;
      const newAvailableSpots = tripData.boat.capacity - newBookedSpots;

      // Update trip with new spots count
      const { error: tripUpdateError } = await supabase
        .from("trips")
        .update({
          booked_spots: newBookedSpots,
          available_spots: newAvailableSpots
        })
        .eq("id", tripId);

      if (tripUpdateError) {
        console.error("Error updating trip spots:", tripUpdateError);
        throw tripUpdateError;
      }

      // For options or confirmed bookings, we remove them from cabin_bookings
      const { error: deleteError } = await supabase
        .from("cabin_bookings")
        .delete()
        .in("id", bookingIds);

      if (deleteError) {
        console.error("Error deleting bookings:", deleteError);
        throw deleteError;
      }

      // Record cancellations and penalties in booking history (optional)
      // You could add another table to track cancellations if needed

      return results;
    },
    onSuccess: (results, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cabin-bookings", variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ["trip", variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["option-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["confirmed-bookings"] });
      
      const bookingType = variables.bookingType === "confirmed" ? "confirmed" : "option";
      const count = variables.bookingIds.length;
      
      if (results.some(r => (r.penalty_percentage || 0) > 0)) {
        toast.success(`Successfully canceled ${count} ${bookingType} booking(s) with applicable penalties.`);
      } else {
        toast.success(`Successfully canceled ${count} ${bookingType} booking(s).`);
      }
      
      if (variables.onSuccess) {
        variables.onSuccess();
      }
    },
    onError: (error) => {
      console.error("Cancellation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to cancel booking. Please try again.");
    }
  });
}
