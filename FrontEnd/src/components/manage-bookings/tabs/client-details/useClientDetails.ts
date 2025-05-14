
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookingClientDetails, BookingClientInfo, CabinBooking, Cabin } from "@/types/database";

export interface PassengerDetails {
  id?: string;
  bedNumber: number;
  cabin: string;
  singleUse: boolean;
  groupName: string;
  name: string;
  surname: string;
  category: string;
  gender: string;
  nationality: string;
  bookingId?: string;
  price?: number; // Original price
}

export function useClientDetails(
  trip: { id: string },
  cabinBookings: (CabinBooking & { cabin: Cabin })[] = [],
  clientDetails: BookingClientDetails[] = [],
  clientInfo: BookingClientInfo[] = []
) {
  const [passengers, setPassengers] = useState<PassengerDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize passenger details with data from both clientDetails and clientInfo
  useEffect(() => {
    const initialPassengers = cabinBookings.map((booking) => {
      const existingDetail = clientDetails.find(detail => detail.booking_id === booking.id);
      // Also look up client info data to use name and surname if available
      const existingInfo = clientInfo.find(info => info.booking_id === booking.id);
      
      // Use the actual group_name from booking if available, otherwise fallbacks
      const groupName = booking.group_name || 
                         existingDetail?.group_name || 
                         existingInfo?.group_name || 
                         "default";
      
      return {
        id: existingDetail?.id,
        bedNumber: booking.bed_number,
        cabin: booking.cabin?.cabin_number || "",
        singleUse: existingDetail?.single_use || false,
        groupName: groupName,
        // Prioritize clientDetails for name/surname, but use clientInfo if available
        name: existingDetail?.name || existingInfo?.name || "",
        surname: existingDetail?.surname || existingInfo?.surname || "",
        category: existingDetail?.category || 
                (booking.cabin?.cabin_type === "suite_double" ? "Suite double-bed" : "twin beds"),
        gender: existingDetail?.gender || booking.passenger_gender || "--",
        nationality: existingDetail?.nationality || "",
        bookingId: booking.id, // Store the booking ID for reference
        price: booking.price, // Store the original price for reference
      };
    });

    setPassengers(initialPassengers);
  }, [cabinBookings, clientDetails, clientInfo]);

  const handlePassengerChange = (index: number, field: keyof PassengerDetails, value: any) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = { ...updatedPassengers[index], [field]: value };
    
    // If the field being changed is 'singleUse', we need to handle the price adjustment
    if (field === 'singleUse') {
      const currentPassenger = updatedPassengers[index];
      
      // Adjust the price when single use is toggled
      if (value === true) {
        // Find the cabin booking to adjust the price
        const cabinBooking = cabinBookings.find(b => b.id === currentPassenger.bookingId);
        if (cabinBooking) {
          // Find another bedNumber from same cabin to disable its' fields
          const cabinMates = updatedPassengers.filter(p => 
            p.cabin === currentPassenger.cabin && p.bedNumber !== currentPassenger.bedNumber
          );
          
          if (cabinMates.length > 0) {
            console.log(`Updating price for single use. Original price: ${cabinBooking.price}`);
            
            // Update cabin booking price in database (60% more)
            const newPrice = Math.round(cabinBooking.price * 1.6);
            
            supabase
              .from("cabin_bookings")
              .update({ price: newPrice })
              .eq("id", currentPassenger.bookingId)
              .then(({ error }) => {
                if (error) {
                  console.error("Error updating price for single use:", error);
                  toast.error("Failed to update price for single use");
                } else {
                  toast.success(`Price updated for single use: ${newPrice}€`);
                }
              });
          }
        }
      } else if (value === false) {
        // Revert price to original if single use is disabled
        const cabinBooking = cabinBookings.find(b => b.id === currentPassenger.bookingId);
        if (cabinBooking && cabinBooking.price !== currentPassenger.price) {
          // Revert to original price
          supabase
            .from("cabin_bookings")
            .update({ price: currentPassenger.price })
            .eq("id", currentPassenger.bookingId)
            .then(({ error }) => {
              if (error) {
                console.error("Error reverting price:", error);
                toast.error("Failed to revert price");
              } else {
                toast.success(`Price reverted to original: ${currentPassenger.price}€`);
              }
            });
        }
      }
    }
    
    setPassengers(updatedPassengers);
  };

  const handleSave = async (onSaved?: () => void) => {
    setIsLoading(true);
    let hasError = false;
    let toastShown = false;
    
    try {
      const savePromises = [...passengers].sort((a, b) => a.bedNumber - b.bedNumber).map(async (passenger) => {
        const booking = cabinBookings.find(b => b.id === passenger.bookingId);
        if (!booking) {
          console.error(`No booking found for bookingId: ${passenger.bookingId}`);
          return;
        }
        
        // If this bed is disabled due to another bed in cabin being marked as single use, skip it
        const otherBedsInCabin = passengers.filter(p => 
          p.cabin === passenger.cabin && p.bedNumber !== passenger.bedNumber
        );
        const isDisabled = otherBedsInCabin.some(p => p.singleUse);
        if (isDisabled) {
          console.log(`Skipping bed ${passenger.bedNumber} in cabin ${passenger.cabin} as it's disabled due to single use`);
          return;
        }
        
        // First, update the cabin_bookings table to ensure group_name consistency
        try {
          const { error: bookingUpdateError } = await supabase
            .from("cabin_bookings")
            .update({ group_name: passenger.groupName })
            .eq("id", booking.id);
            
          if (bookingUpdateError) {
            console.error("Error updating booking group_name:", bookingUpdateError);
            hasError = true;
          }
        } catch (error) {
          console.error("Error updating cabin booking:", error);
          hasError = true;
        }
        
        // Sync with client_info - Changed this to always update, even if no info exists
        try {
          // First check if client info exists
          const { data: existingInfo, error: checkInfoError } = await supabase
            .from("booking_client_info")
            .select("id")
            .eq("booking_id", booking.id)
            .maybeSingle();
            
          if (checkInfoError && checkInfoError.code !== 'PGRST116') {
            console.log("Error checking client info existence:", checkInfoError);
          }
          
          if (existingInfo?.id) {
            // Update existing client info record with name, surname and group name
            const { error: clientInfoError } = await supabase
              .from("booking_client_info")
              .update({ 
                name: passenger.name, 
                surname: passenger.surname,
                group_name: passenger.groupName
              })
              .eq("id", existingInfo.id);
              
            if (clientInfoError) {
              console.log("Error updating client info:", clientInfoError);
            }
          } else {
            // Don't create a new client info record here, just log that it doesn't exist
            console.log(`No client info record exists for booking ${booking.id}`);
          }
          
          // Also update travel info
          const { data: existingTravel, error: checkTravelError } = await supabase
            .from("booking_travel_info")
            .select("id")
            .eq("booking_id", booking.id)
            .maybeSingle();
            
          if (existingTravel?.id) {
            const { error: travelInfoError } = await supabase
              .from("booking_travel_info")
              .update({ 
                name: passenger.name, 
                surname: passenger.surname
              })
              .eq("id", existingTravel.id);
              
            if (travelInfoError) {
              console.log("Error updating travel info:", travelInfoError);
            }
          }
        } catch (error) {
          console.log("Error syncing names:", error);
        }
        
        if (passenger.id) {
          const { error } = await supabase
            .from("booking_client_details")
            .update({
              name: passenger.name,
              surname: passenger.surname,
              single_use: passenger.singleUse,
              group_name: passenger.groupName,
              category: passenger.category,
              gender: passenger.gender,
              nationality: passenger.nationality,
              updated_at: new Date().toISOString()
            })
            .eq("id", passenger.id);
            
          if (error) {
            hasError = true;
            throw error;
          }
        } else {
          const { data: existingDetails, error: checkError } = await supabase
            .from("booking_client_details")
            .select("id")
            .eq("booking_id", booking.id)
            .maybeSingle();
            
          if (checkError) {
            hasError = true;
            throw checkError;
          }
          
          if (existingDetails) {
            const { error } = await supabase
              .from("booking_client_details")
              .update({
                name: passenger.name,
                surname: passenger.surname,
                single_use: passenger.singleUse,
                group_name: passenger.groupName,
                category: passenger.category,
                gender: passenger.gender,
                nationality: passenger.nationality,
                updated_at: new Date().toISOString()
              })
              .eq("id", existingDetails.id);
              
            if (error) {
              hasError = true;
              throw error;
            }
          } else {
            const { error } = await supabase
              .from("booking_client_details")
              .insert({
                trip_id: trip.id,
                booking_id: booking.id,
                bed_number: passenger.bedNumber,
                cabin_number: passenger.cabin,
                name: passenger.name,
                surname: passenger.surname,
                single_use: passenger.singleUse,
                group_name: passenger.groupName,
                category: passenger.category,
                gender: passenger.gender,
                nationality: passenger.nationality
              });
              
            if (error) {
              hasError = true;
              throw error;
            }
          }
        }
      });
      
      await Promise.all(savePromises);
      
      // Only show toast if no errors occurred and no toast has been shown yet
      if (!hasError && !toastShown) {
        toast.success("Client details saved successfully");
        toastShown = true;
      }
      
      // Call onSaved callback if provided
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error saving passenger details:", error);
      if (!toastShown) {
        toast.error("Failed to save passenger details");
        toastShown = true;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    passengers,
    isLoading,
    handlePassengerChange,
    handleSave,
  };
}
