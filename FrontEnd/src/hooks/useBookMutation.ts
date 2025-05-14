
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Trip } from "@/types/database";

interface BookMutationParams {
  tripId: string;
  selectedBeds?: {
    cabinId: string;
    bedNumber: number;
    price: number;
  }[];
  bedsToBook?: {
    cabinId: string;
    bedNumber: number;
    price: number;
    passengerGender: string;
    groupName: string;
  }[];
  passengerGender?: string;
  tripData?: Trip & { boat?: { capacity: number } };
  bookingType: "option" | "confirm" | "waitlist";
  bookingIds?: string[];
  cancelDate?: Date;
  groupName?: string;
  onSuccess?: () => void;
}

export function useBookMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tripId,
      selectedBeds = [],
      bedsToBook = [],
      passengerGender,
      tripData,
      bookingType = "confirm",
      bookingIds = [],
      cancelDate,
      groupName = "default"
    }: BookMutationParams) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      // Case 1: Converting existing options to confirmed bookings
      if (bookingIds.length > 0) {
        console.log('Converting option bookings to confirmed:', bookingIds);
        
        const { data: bookingData, error: fetchError } = await supabase
          .from("cabin_bookings")
          .select()
          .in('id', bookingIds)
          .eq('status', 'option');
          
        if (fetchError) {
          console.error('Error fetching bookings to convert:', fetchError);
          throw fetchError;
        }
        
        if (!bookingData || bookingData.length === 0) {
          throw new Error("No valid option bookings found to convert");
        }
        
        console.log('Bookings to convert:', bookingData);
        
        // Update the bookings status to confirmed
        const { error: updateError } = await supabase
          .from("cabin_bookings")
          .update({ 
            status: 'confirmed',
            // Reset cancel_date when confirming
            cancel_date: null 
          })
          .in('id', bookingIds);
          
        if (updateError) {
          console.error('Error converting bookings:', updateError);
          throw updateError;
        }
        
        return bookingData;
      }
      
      // Case 2: Creating new bookings with per-person gender
      if (bedsToBook.length > 0) {
        const totalCapacity = tripData?.boat?.capacity || 0;
        const currentBooked = tripData?.booked_spots || 0;
        const availableSpots = tripData?.available_spots || 0;
        const selectedCount = bedsToBook.length;
        
        // For waitlist bookings, we don't need to check available spots
        // as these are specifically for when the trip is full
        if (bookingType !== "waitlist") {
          if (selectedCount > availableSpots) {
            throw new Error(`Cannot book ${selectedCount} spots. Only ${availableSpots} spots available.`);
          }
        }

        // Create array of booking records
        const bookingRecords = bedsToBook.map(bed => ({
          trip_id: tripId,
          cabin_id: bed.cabinId,
          bed_number: bed.bedNumber,
          price: bed.price,
          passenger_gender: bed.passengerGender,
          group_name: bed.groupName,
          status: bookingType,
          booked_at: new Date().toISOString().split('T')[0],
          cancel_date: (bookingType === "option" || bookingType === "waitlist") && cancelDate ? cancelDate.toISOString().split('T')[0] : null,
          user_id: user.id
        }));

        console.log('Creating bookings with group names:', bookingRecords);

        // Insert bookings
        const { data: bookingData, error: bookingError } = await supabase
          .from("cabin_bookings")
          .insert(bookingRecords)
          .select();

        if (bookingError) {
          console.error('Booking error:', bookingError);
          throw bookingError;
        }

        console.log('Bookings created:', bookingData);

        // Update trip booked spots and available spots
        // Only update these counts for confirmed and option bookings, not waitlist
        if (bookingType !== "waitlist") {
          const newBookedSpots = currentBooked + selectedCount;
          const newAvailableSpots = totalCapacity - newBookedSpots;

          const { error: tripUpdateError } = await supabase
            .from("trips")
            .update({ 
              booked_spots: newBookedSpots,
              available_spots: newAvailableSpots
            })
            .eq("id", tripId);

          if (tripUpdateError) {
            console.error('Trip update error:', tripUpdateError);
            
            // Rollback bookings if trip update fails
            const { error: rollbackError } = await supabase
              .from("cabin_bookings")
              .delete()
              .in('id', bookingData.map(booking => booking.id));
              
            if (rollbackError) {
              console.error("Rollback error:", rollbackError);
            }
            
            throw tripUpdateError;
          }
        }
        
        return bookingData;
      }
      
      // Case 3: Legacy format (for backward compatibility)
      if (selectedBeds.length > 0 && passengerGender) {
        // Get the total capacity and current bookings
        const totalCapacity = tripData?.boat?.capacity || 0;
        const currentBooked = tripData?.booked_spots || 0;
        const availableSpots = tripData?.available_spots || 0;
        const selectedCount = selectedBeds.length;

        // Check if there is enough capacity (skip for waitlist)
        if (bookingType !== "waitlist" && selectedCount > availableSpots) {
          throw new Error(`Cannot book ${selectedCount} spots. Only ${availableSpots} spots available.`);
        }

        // Create array of booking records
        const bookingRecords = selectedBeds.map(bed => ({
          trip_id: tripId,
          cabin_id: bed.cabinId,
          bed_number: bed.bedNumber,
          price: bed.price,
          passenger_gender: passengerGender,
          group_name: groupName || "default",
          status: bookingType,
          booked_at: new Date().toISOString().split('T')[0],
          cancel_date: (bookingType === "option" || bookingType === "waitlist") && cancelDate ? cancelDate.toISOString().split('T')[0] : null,
          user_id: user.id
        }));

        console.log('Creating bookings (legacy format) with group name:', groupName, bookingRecords);

        // Insert bookings
        const { data: bookingData, error: bookingError } = await supabase
          .from("cabin_bookings")
          .insert(bookingRecords)
          .select();

        if (bookingError) {
          console.error('Booking error:', bookingError);
          throw bookingError;
        }

        console.log('Bookings created:', bookingData);

        // Only update counts for non-waitlist bookings
        if (bookingType !== "waitlist") {
          // Update trip booked spots and available spots
          const newBookedSpots = currentBooked + selectedCount;
          const newAvailableSpots = totalCapacity - newBookedSpots;

          const { error: tripUpdateError } = await supabase
            .from("trips")
            .update({ 
              booked_spots: newBookedSpots,
              available_spots: newAvailableSpots
            })
            .eq("id", tripId);

          if (tripUpdateError) {
            console.error('Trip update error:', tripUpdateError);
            
            // Rollback bookings if trip update fails
            const { error: rollbackError } = await supabase
              .from("cabin_bookings")
              .delete()
              .in('id', bookingData.map(booking => booking.id));
              
            if (rollbackError) {
              console.error("Rollback error:", rollbackError);
            }
            
            throw tripUpdateError;
          }
        }
        
        return bookingData;
      }
      
      throw new Error("Missing required booking information");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cabin-bookings", variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ["trip", variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["option-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["confirmed-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["waitlist-bookings"] });
      
      if (variables.bookingIds && variables.bookingIds.length > 0) {
        toast.success("Success", { 
          description: `Successfully converted ${variables.bookingIds.length} option booking(s) to confirmed!`
        });
      } else {
        const count = variables.bedsToBook?.length || variables.selectedBeds?.length || 0;
        const bookingTypeText = variables.bookingType === "waitlist" ? "waitlisted" : 
                               variables.bookingType === "confirm" ? "confirmed" : "optioned";
        toast.success("Success", {
          description: `Successfully ${bookingTypeText} ${count} beds!`
        });
      }
      
      if (variables.onSuccess) {
        variables.onSuccess();
      }
    },
    onError: (error) => {
      console.error("Booking error:", error);
      toast.error("Booking error", {
        description: error instanceof Error ? error.message : "Failed to complete booking. Please try again."
      });
    }
  });
}
