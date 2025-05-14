
import { useState } from "react";
import { toast } from "sonner";
import { BookingTravelInfo, BookingClientDetails, CabinBooking, Cabin } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";

interface TravelInfoProps {
  bedNumber: number;
  name: string;
  surname: string;
  arrivalDate: Date | undefined;
  flightArrivalNumber: string;
  flightArrivalTime: string;
  flightArrivalFrom: string;
  departureDate: Date | undefined;
  flightDepartureNumber: string;
  flightDepartureTime: string;
  flightDepartureTo: string;
  transferAirportToBoat: string;
  transferBoatToHotel: string;
  transferHotelToBoat: string;
  nightHotel: string;
  arrivalHotel: string;
  dayUseHotel: string;
  arrivalNotes: string;
  dayUseHotelDeparture: string;
  nightHotelDeparture: string;
  departureNotes: string;
  transferBoatToAirport: string;
  transferBoatToHotelDeparture: string;
  transferHotelToAirport: string;
  bookingId?: string;
  travelInfoId?: string;
  groupName?: string; // Add groupName to track and maintain consistency
  [key: string]: string | number | Date | undefined;
}

export function useTravelInfo(
  travelInfo: BookingTravelInfo[] = [], 
  tripId?: string,
  cabinBookings: (CabinBooking & { cabin: Cabin })[] = [],
  clientDetails: BookingClientDetails[] = []
) {
  // Transform Supabase data or use cabin booking data
  const initialTravelInfo = cabinBookings.map(booking => {
    // Find existing info for this booking if available
    const existingInfo = travelInfo.find(info => info.booking_id === booking.id);
    
    // Find the client details for this booking to get the correct name and surname
    const clientDetail = clientDetails.find(detail => detail.booking_id === booking.id);
    
    // Use booking's group_name if available
    const groupName = booking.group_name || "default";
    
    return {
      bedNumber: booking.bed_number || 0,
      name: clientDetail?.name || existingInfo?.name || "",
      surname: clientDetail?.surname || existingInfo?.surname || "",
      groupName: groupName, // Include group name from booking
      arrivalDate: existingInfo?.arrival_date ? new Date(existingInfo.arrival_date) : undefined,
      flightArrivalNumber: existingInfo?.arrival_flight_number || "",
      flightArrivalTime: existingInfo?.arrival_time || "",
      flightArrivalFrom: existingInfo?.arrival_airport || "",
      departureDate: existingInfo?.departure_date ? new Date(existingInfo.departure_date) : undefined,
      flightDepartureNumber: existingInfo?.departure_flight_number || "",
      flightDepartureTime: existingInfo?.departure_time || "",
      flightDepartureTo: existingInfo?.departure_airport || "",
      
      transferAirportToBoat: existingInfo?.transfer_airport_to_boat || "--",
      transferBoatToHotel: existingInfo?.transfer_boat_to_hotel || "--",
      transferHotelToBoat: existingInfo?.transfer_hotel_to_boat || "--",
      nightHotel: existingInfo?.night_hotel || "------",
      arrivalHotel: existingInfo?.arrival_hotel || "------",
      dayUseHotel: existingInfo?.day_use_hotel || "------",
      arrivalNotes: existingInfo?.arrival_notes || "",
      
      dayUseHotelDeparture: existingInfo?.day_use_hotel_departure || "------",
      nightHotelDeparture: existingInfo?.night_hotel_departure || "------",
      departureNotes: existingInfo?.departure_notes || "",
      transferBoatToAirport: existingInfo?.transfer_boat_to_airport || "--",
      transferBoatToHotelDeparture: existingInfo?.transfer_boat_to_hotel_departure || "--",
      transferHotelToAirport: existingInfo?.transfer_hotel_to_airport || "--",
      bookingId: booking.id,
      travelInfoId: existingInfo?.id || ""
    };
  });

  const [travelInfoState, setTravelInfoState] = useState<TravelInfoProps[]>(initialTravelInfo);
  const [isLoading, setIsLoading] = useState(false);

  const handleTravelInfoChange = (index: number, field: keyof TravelInfoProps, value: string | Date | boolean) => {
    const updatedTravelInfo = [...travelInfoState];
    const info = { ...updatedTravelInfo[index] };
    
    // Do not allow name and surname changes from this page - they can only be changed in client details
    if (field === 'name' || field === 'surname') {
      console.log("Name and surname should only be changed from the Client Details tab.");
      toast.info("Name and surname can only be changed from the Client Details tab.");
      return;
    }
    
    switch (field) {
      case 'arrivalDate':
      case 'departureDate':
        info[field] = value as Date;
        break;
      default:
        info[field] = value as string;
    }
    
    updatedTravelInfo[index] = info;
    setTravelInfoState(updatedTravelInfo);
  };

  const handleSave = async () => {
    if (!tripId) {
      toast.error("Trip ID is missing");
      return false;
    }

    setIsLoading(true);
    
    try {
      // Process travel info for each passenger
      const savePromises = travelInfoState.map(async (info) => {
        // Find matching booking by bed number
        const booking = cabinBookings.find(b => b.bed_number === info.bedNumber);
        if (!booking) return null;
        
        // Update booking group_name if needed for consistency
        if (info.groupName) {
          try {
            const { error: bookingUpdateError } = await supabase
              .from("cabin_bookings")
              .update({ group_name: info.groupName })
              .eq("id", booking.id);
              
            if (bookingUpdateError) {
              console.error("Error updating booking group_name:", bookingUpdateError);
            }
          } catch (error) {
            console.error("Error updating cabin booking:", error);
          }
        }
        
        // Prepare data for update or insert
        const travelData = {
          arrival_date: info.arrivalDate ? info.arrivalDate.toISOString() : null,
          arrival_flight_number: info.flightArrivalNumber,
          arrival_time: info.flightArrivalTime,
          arrival_airport: info.flightArrivalFrom,
          departure_date: info.departureDate ? info.departureDate.toISOString() : null,
          departure_flight_number: info.flightDepartureNumber,
          departure_time: info.flightDepartureTime,
          departure_airport: info.flightDepartureTo,
          transfer_airport_to_boat: info.transferAirportToBoat,
          transfer_boat_to_hotel: info.transferBoatToHotel,
          transfer_hotel_to_boat: info.transferHotelToBoat,
          night_hotel: info.nightHotel,
          arrival_hotel: info.arrivalHotel,
          day_use_hotel: info.dayUseHotel,
          arrival_notes: info.arrivalNotes,
          day_use_hotel_departure: info.dayUseHotelDeparture,
          night_hotel_departure: info.nightHotelDeparture,
          departure_notes: info.departureNotes,
          transfer_boat_to_airport: info.transferBoatToAirport,
          transfer_boat_to_hotel_departure: info.transferBoatToHotelDeparture, 
          transfer_hotel_to_airport: info.transferHotelToAirport,
          name: info.name, // Keep the name field but don't update it
          surname: info.surname, // Keep the surname field but don't update it
          bed_number: info.bedNumber,
          updated_at: new Date().toISOString()
        };
        
        // Check if this travel info already exists using id if available
        if (info.travelInfoId) {
          // Update existing record
          const { error } = await supabase
            .from("booking_travel_info")
            .update(travelData)
            .eq("id", info.travelInfoId);
          
          if (error) throw error;
          return info;
        } else {
          // Check if a record already exists for this booking
          const { data: existingInfo, error: checkError } = await supabase
            .from("booking_travel_info")
            .select("id")
            .eq("booking_id", booking.id)
            .maybeSingle();
            
          if (checkError) throw checkError;
          
          if (existingInfo) {
            // Update existing record
            const { error } = await supabase
              .from("booking_travel_info")
              .update(travelData)
              .eq("id", existingInfo.id);
            
            if (error) throw error;
          } else {
            // Insert new record
            const { error } = await supabase
              .from("booking_travel_info")
              .insert({
                booking_id: booking.id,
                trip_id: tripId,
                ...travelData
              });
            
            if (error) throw error;
          }
        }
        
        return info;
      });
      
      await Promise.all(savePromises);
      toast.success("Travel information saved successfully");
      return true;
    } catch (error) {
      console.error("Error saving travel info:", error);
      toast.error("Failed to save travel information");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    travelInfoState,
    handleTravelInfoChange,
    handleSave,
    isLoading
  };
}

export type { TravelInfoProps };
